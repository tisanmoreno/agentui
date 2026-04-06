import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties
} from "react"

import {
  copyCompactAnnotations,
  copyDetailedAnnotations,
  hasExportableAnnotations,
  type CopyAnnotationsResult,
  type ExportFormat
} from "~src/export/serializers"
import { AnnotationPanel } from "~src/features/annotations/components/AnnotationPanel"
import { MarkerLayer } from "~src/features/annotations/components/MarkerLayer"
import { useMarkerPositions } from "~src/features/annotations/hooks/useMarkerPositions"
import type { Annotation, RectSnapshot } from "~src/features/annotations/types"
import { useAnnotationsState } from "~src/features/annotations/useAnnotationsState"
import { useTargetSelection } from "~src/features/selection/useTargetSelection"
import type { TargetCandidate } from "~src/features/selection/targetSnapshot"
import {
  AGENTUI_IGNORE_TARGET_ATTRIBUTE,
  AGENTUI_Z_INDEX,
  TOOLBAR_OFFSET
} from "~src/shared/constants"
import { isTypingInEditableTarget } from "~src/shared/keyboard"
import {
  GET_OVERLAY_VISIBILITY_MESSAGE,
  SET_OVERLAY_VISIBILITY_MESSAGE,
  type GetOverlayVisibilityMessage,
  type GetOverlayVisibilityResponse,
  type SetOverlayVisibilityMessage
} from "~src/shared/messages"
import { AnnotationPopover } from "~src/ui/overlay/AnnotationPopover"
import { HoverOutline } from "~src/ui/overlay/HoverOutline"
import {
  ToastRegion,
  type ToastItem,
  type ToastTone
} from "~src/ui/overlay/ToastRegion"
import { FeedbackToolbar } from "~src/ui/toolbar/FeedbackToolbar"

const TOAST_DURATION_MS = 1800
const MAX_VISIBLE_TOASTS = 3
const PANEL_GAP = 12
const DEFAULT_PANEL_TOP_OFFSET = TOOLBAR_OFFSET + 68
const REVEAL_HIGHLIGHT_DURATION_MS = 1600
const REVEAL_SCROLL_OFFSET = 96

const overlayStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  pointerEvents: "none",
  zIndex: AGENTUI_Z_INDEX
}

const toolbarPositionStyle: CSSProperties = {
  position: "fixed",
  top: TOOLBAR_OFFSET,
  right: TOOLBAR_OFFSET,
  pointerEvents: "auto"
}

type PopoverState =
  | { open: false }
  | { open: true; mode: "create"; target: TargetCandidate }
  | {
      open: true
      mode: "edit"
      annotation: Annotation
      anchorRect: RectSnapshot
    }

const closedPopoverState: PopoverState = { open: false }

const createToastId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }

  return `toast-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export const OverlayShell = () => {
  const [feedbackModeEnabled, setFeedbackModeEnabled] = useState(false)
  const [markersVisible, setMarkersVisible] = useState(true)
  const [overlayVisible, setOverlayVisible] = useState(true)
  const [overlayVisibilityReady, setOverlayVisibilityReady] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)
  const [annotationPanelTopOffset, setAnnotationPanelTopOffset] = useState(
    DEFAULT_PANEL_TOP_OFFSET
  )
  const [popoverState, setPopoverState] = useState<PopoverState>(closedPopoverState)
  const [revealedAnnotationId, setRevealedAnnotationId] = useState<string | null>(null)
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const toastTimersRef = useRef<Map<string, number>>(new Map())
  const revealTimerRef = useRef<number | null>(null)
  const toolbarRef = useRef<HTMLDivElement | null>(null)
  const {
    annotations,
    activeAnnotationId,
    addAnnotation,
    clearActiveAnnotation,
    clearAnnotations,
    deleteAnnotation,
    reorderAnnotations,
    setActiveAnnotationId,
    updateAnnotation
  } = useAnnotationsState()
  const resolvedAnnotations = useMarkerPositions(annotations)

  const resolvedAnnotationsById = useMemo(
    () =>
      new Map(
        resolvedAnnotations.map((resolvedAnnotation) => [
          resolvedAnnotation.annotation.id,
          resolvedAnnotation
        ])
      ),
    [resolvedAnnotations]
  )

  const dismissToast = useCallback((toastId: string) => {
    const timeoutId = toastTimersRef.current.get(toastId)

    if (typeof timeoutId === "number") {
      window.clearTimeout(timeoutId)
      toastTimersRef.current.delete(toastId)
    }

    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== toastId)
    )
  }, [])

  const showToast = useCallback(
    (tone: ToastTone, message: string) => {
      const toastId = createToastId()

      setToasts((currentToasts) => {
        const nextToasts = [...currentToasts, { id: toastId, tone, message }]
        const overflowCount = Math.max(0, nextToasts.length - MAX_VISIBLE_TOASTS)

        if (overflowCount > 0) {
          nextToasts.slice(0, overflowCount).forEach((toast) => {
            const overflowTimeoutId = toastTimersRef.current.get(toast.id)

            if (typeof overflowTimeoutId === "number") {
              window.clearTimeout(overflowTimeoutId)
              toastTimersRef.current.delete(toast.id)
            }
          })
        }

        return nextToasts.slice(-MAX_VISIBLE_TOASTS)
      })

      const timeoutId = window.setTimeout(() => {
        dismissToast(toastId)
      }, TOAST_DURATION_MS)

      toastTimersRef.current.set(toastId, timeoutId)
    },
    [dismissToast]
  )

  useEffect(() => {
    return () => {
      toastTimersRef.current.forEach((timeoutId) => {
        window.clearTimeout(timeoutId)
      })
      toastTimersRef.current.clear()

      if (typeof revealTimerRef.current === "number") {
        window.clearTimeout(revealTimerRef.current)
        revealTimerRef.current = null
      }
    }
  }, [])

  const handleSelectTarget = useCallback((candidate: TargetCandidate) => {
    setPopoverState({
      open: true,
      mode: "create",
      target: candidate
    })
  }, [])

  const { hoveredTarget, clearHoveredTarget } = useTargetSelection({
    enabled: overlayVisibilityReady && overlayVisible && feedbackModeEnabled,
    paused: !overlayVisibilityReady || !overlayVisible || popoverState.open,
    onSelectTarget: handleSelectTarget
  })

  const activeAnnotation = useMemo(() => {
    if (!popoverState.open || popoverState.mode !== "edit") {
      return null
    }

    return popoverState.annotation
  }, [popoverState])

  const anchorRect = useMemo(() => {
    if (!popoverState.open) {
      return null
    }

    if (popoverState.mode === "create") {
      return popoverState.target.snapshot.rect
    }

    return popoverState.anchorRect
  }, [popoverState])

  const targetLabel = useMemo(() => {
    if (!popoverState.open) {
      return null
    }

    if (popoverState.mode === "create") {
      return popoverState.target.snapshot.label
    }

    return (
      resolvedAnnotationsById.get(popoverState.annotation.id)?.displayLabel ??
      popoverState.annotation.target.label
    )
  }, [popoverState, resolvedAnnotationsById])

  const handleClosePopover = useCallback(() => {
    setPopoverState(closedPopoverState)
    clearActiveAnnotation()
  }, [clearActiveAnnotation])

  const exitFeedbackMode = useCallback(() => {
    setFeedbackModeEnabled(false)
    setPopoverState(closedPopoverState)
    clearActiveAnnotation()
    clearHoveredTarget()
  }, [clearActiveAnnotation, clearHoveredTarget])

  const handleToggleFeedbackMode = useCallback(() => {
    if (feedbackModeEnabled) {
      exitFeedbackMode()
      return
    }

    setFeedbackModeEnabled(true)
  }, [exitFeedbackMode, feedbackModeEnabled])

  const applyOverlayVisibility = useCallback(
    (visible: boolean) => {
      setOverlayVisible(visible)

      if (visible) {
        return
      }

      setPanelOpen(false)
      setRevealedAnnotationId(null)
      exitFeedbackMode()
    },
    [exitFeedbackMode]
  )

  useEffect(() => {
    const handleRuntimeMessage = (message: unknown) => {
      if (
        !message ||
        typeof message !== "object" ||
        (message as { type?: string }).type !== SET_OVERLAY_VISIBILITY_MESSAGE
      ) {
        return
      }

      const { visible } = message as SetOverlayVisibilityMessage

      if (typeof visible !== "boolean") {
        return
      }

      applyOverlayVisibility(visible)
    }

    chrome.runtime.onMessage.addListener(handleRuntimeMessage)

    return () => {
      chrome.runtime.onMessage.removeListener(handleRuntimeMessage)
    }
  }, [applyOverlayVisibility])

  useEffect(() => {
    let cancelled = false

    const message: GetOverlayVisibilityMessage = {
      type: GET_OVERLAY_VISIBILITY_MESSAGE
    }

    chrome.runtime.sendMessage(message, (response?: GetOverlayVisibilityResponse) => {
      if (cancelled) {
        return
      }

      if (chrome.runtime.lastError) {
        setOverlayVisibilityReady(true)
        return
      }

      applyOverlayVisibility(response?.visible ?? true)
      setOverlayVisibilityReady(true)
    })

    return () => {
      cancelled = true
    }
  }, [applyOverlayVisibility])

  const canCopyAnnotations = useMemo(
    () => hasExportableAnnotations(annotations),
    [annotations]
  )

  const getCopySuccessMessage = useCallback(
    ({ format, annotationCount }: Pick<CopyAnnotationsResult, "format" | "annotationCount">) => {
      const noun = annotationCount === 1 ? "annotation" : "annotations"

      return `Copied ${format} feedback (${annotationCount} ${noun})`
    },
    []
  )

  const handleCopyAnnotations = useCallback(
    async (format: ExportFormat) => {
      try {
        const copyResult =
          format === "detailed"
            ? await copyDetailedAnnotations(annotations, {
                pageTitle: document.title,
                pageUrl: window.location.href
              })
            : await copyCompactAnnotations(annotations, {
                pageTitle: document.title,
                pageUrl: window.location.href
              })

        if (!copyResult) {
          showToast("info", "No annotations to copy")
          return
        }

        showToast("success", getCopySuccessMessage(copyResult))
      } catch {
        showToast("error", "Copy failed — try again")
      }
    },
    [annotations, getCopySuccessMessage, showToast]
  )

  const handleEditAnnotation = useCallback(
    (annotation: Annotation, anchorRect?: RectSnapshot | null) => {
      setActiveAnnotationId(annotation.id)
      setPopoverState({
        open: true,
        mode: "edit",
        annotation,
        anchorRect: anchorRect ?? annotation.target.rect
      })
    },
    [setActiveAnnotationId]
  )

  const handleEditAnnotationById = useCallback(
    (annotationId: string) => {
      const resolvedAnnotation = resolvedAnnotationsById.get(annotationId)

      if (!resolvedAnnotation) {
        return
      }

      handleEditAnnotation(resolvedAnnotation.annotation, resolvedAnnotation.rect)
    },
    [handleEditAnnotation, resolvedAnnotationsById]
  )

  const handleSavePopover = useCallback(
    (input: { tag: Annotation["tag"]; feedback: string }) => {
      if (!popoverState.open) {
        return
      }

      void (async () => {
        try {
          if (popoverState.mode === "create") {
            await addAnnotation({
              target: popoverState.target.snapshot,
              tag: input.tag,
              feedback: input.feedback
            })
          } else {
            await updateAnnotation(popoverState.annotation.id, {
              tag: input.tag,
              feedback: input.feedback
            })
          }

          setPopoverState(closedPopoverState)
        } catch (error) {
          console.error("Failed to save annotation", error)
        }
      })()
    },
    [addAnnotation, popoverState, updateAnnotation]
  )

  const handleRevealAnnotationById = useCallback(
    (annotationId: string) => {
      const resolvedAnnotation = resolvedAnnotationsById.get(annotationId)

      if (!resolvedAnnotation?.element) {
        return
      }

      const rect = resolvedAnnotation.element.getBoundingClientRect()
      const nextTop = Math.max(0, window.scrollY + rect.top - REVEAL_SCROLL_OFFSET)

      window.scrollTo({
        top: nextTop,
        behavior: "smooth"
      })

      setRevealedAnnotationId(annotationId)

      if (typeof revealTimerRef.current === "number") {
        window.clearTimeout(revealTimerRef.current)
      }

      revealTimerRef.current = window.setTimeout(() => {
        setRevealedAnnotationId((currentAnnotationId) =>
          currentAnnotationId === annotationId ? null : currentAnnotationId
        )
        revealTimerRef.current = null
      }, REVEAL_HIGHLIGHT_DURATION_MS)
    },
    [resolvedAnnotationsById]
  )

  useEffect(() => {
    if (!overlayVisibilityReady || !overlayVisible) {
      return
    }

    const toolbarElement = toolbarRef.current

    if (!toolbarElement) {
      return
    }

    const updateAnnotationPanelTopOffset = () => {
      const toolbarRect = toolbarElement.getBoundingClientRect()

      setAnnotationPanelTopOffset(Math.round(toolbarRect.bottom + PANEL_GAP))
    }

    updateAnnotationPanelTopOffset()

    const resizeObserver = new ResizeObserver(() => {
      updateAnnotationPanelTopOffset()
    })

    resizeObserver.observe(toolbarElement)
    window.addEventListener("resize", updateAnnotationPanelTopOffset)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener("resize", updateAnnotationPanelTopOffset)
    }
  }, [overlayVisibilityReady, overlayVisible])

  useEffect(() => {
    if (!overlayVisibilityReady || !overlayVisible) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.isComposing) {
        return
      }

      if (event.key === "Escape") {
        if (popoverState.open) {
          event.preventDefault()
          event.stopPropagation()
          handleClosePopover()
          return
        }

        if (!feedbackModeEnabled) {
          return
        }

        event.preventDefault()
        event.stopPropagation()
        exitFeedbackMode()
        return
      }

      if (isTypingInEditableTarget(event.target)) {
        return
      }

      if (event.repeat || !event.altKey || !event.shiftKey) {
        return
      }

      const normalizedKey = event.key.toLowerCase()

      if (normalizedKey === "a") {
        event.preventDefault()
        event.stopPropagation()
        handleToggleFeedbackMode()
        return
      }

      if (normalizedKey === "c") {
        event.preventDefault()
        event.stopPropagation()
        void handleCopyAnnotations("compact")
      }
    }

    document.addEventListener("keydown", handleKeyDown, true)

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true)
    }
  }, [
    exitFeedbackMode,
    feedbackModeEnabled,
    handleClosePopover,
    handleCopyAnnotations,
    handleToggleFeedbackMode,
    overlayVisibilityReady,
    overlayVisible,
    popoverState.open
  ])

  const revealedAnnotationRect =
    revealedAnnotationId !== null
      ? resolvedAnnotationsById.get(revealedAnnotationId)?.rect ?? null
      : null

  if (!overlayVisibilityReady || !overlayVisible) {
    return null
  }

  return (
    <div
      style={overlayStyle}
      {...{
        [AGENTUI_IGNORE_TARGET_ATTRIBUTE]: "true"
      }}>
      <HoverOutline
        rect={
          feedbackModeEnabled && !popoverState.open
            ? hoveredTarget?.snapshot.rect ?? null
            : null
        }
      />
      <HoverOutline rect={revealedAnnotationRect} variant="reveal" />
      {markersVisible ? (
        <MarkerLayer
          activeAnnotationId={activeAnnotationId}
          annotations={resolvedAnnotations}
          onEditAnnotation={handleEditAnnotation}
        />
      ) : null}
      <div ref={toolbarRef} style={toolbarPositionStyle}>
        <FeedbackToolbar
          annotationCount={annotations.length}
          canCopyAnnotations={canCopyAnnotations}
          feedbackModeEnabled={feedbackModeEnabled}
          onCopyCompact={() => void handleCopyAnnotations("compact")}
          onCopyDetailed={() => void handleCopyAnnotations("detailed")}
          onToggleFeedbackMode={handleToggleFeedbackMode}
          onTogglePanel={() => setPanelOpen((currentValue) => !currentValue)}
          panelOpen={panelOpen}
        />
      </div>
      <AnnotationPanel
        activeAnnotationId={activeAnnotationId}
        annotations={resolvedAnnotations}
        markersVisible={markersVisible}
        onClearAnnotations={() => void clearAnnotations()}
        onClose={() => setPanelOpen(false)}
        onDeleteAnnotation={(annotationId) => void deleteAnnotation(annotationId)}
        onEditAnnotation={handleEditAnnotationById}
        onMoveAnnotation={(fromIndex, toIndex) => void reorderAnnotations(fromIndex, toIndex)}
        onRevealAnnotation={handleRevealAnnotationById}
        onToggleMarkers={() => setMarkersVisible((currentValue) => !currentValue)}
        open={panelOpen}
        topOffset={annotationPanelTopOffset}
      />
      <AnnotationPopover
        anchorRect={anchorRect}
        initialValue={
          activeAnnotation
            ? {
                tag: activeAnnotation.tag,
                feedback: activeAnnotation.feedback
              }
            : undefined
        }
        mode={popoverState.open && popoverState.mode === "edit" ? "edit" : "create"}
        onCancel={handleClosePopover}
        onSave={handleSavePopover}
        open={popoverState.open}
        targetLabel={targetLabel}
      />
      <ToastRegion toasts={toasts} />
    </div>
  )
}

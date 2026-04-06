import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react"

import {
  AGENTUI_IGNORE_TARGET_ATTRIBUTE,
  AGENTUI_Z_INDEX,
  TOOLBAR_OFFSET
} from "~src/shared/constants"

import { AnnotationPanel } from "~src/features/annotations/components/AnnotationPanel"
import { MarkerLayer } from "~src/features/annotations/components/MarkerLayer"
import { useMarkerPositions } from "~src/features/annotations/hooks/useMarkerPositions"
import type { Annotation, RectSnapshot } from "~src/features/annotations/types"
import { useAnnotationsState } from "~src/features/annotations/useAnnotationsState"
import { useTargetSelection } from "~src/features/selection/useTargetSelection"
import type { TargetCandidate } from "~src/features/selection/targetSnapshot"
import { AnnotationPopover } from "~src/ui/overlay/AnnotationPopover"
import { HoverOutline } from "~src/ui/overlay/HoverOutline"
import { FeedbackToolbar } from "~src/ui/toolbar/FeedbackToolbar"

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

export const OverlayShell = () => {
  const [feedbackModeEnabled, setFeedbackModeEnabled] = useState(false)
  const [markersVisible, setMarkersVisible] = useState(true)
  const [panelOpen, setPanelOpen] = useState(false)
  const [popoverState, setPopoverState] = useState<PopoverState>(closedPopoverState)
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

  const handleSelectTarget = useCallback((candidate: TargetCandidate) => {
    setPopoverState({
      open: true,
      mode: "create",
      target: candidate
    })
  }, [])

  const { hoveredTarget, clearHoveredTarget } = useTargetSelection({
    enabled: feedbackModeEnabled,
    paused: popoverState.open,
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

    return popoverState.annotation.target.label
  }, [popoverState])

  const handleClosePopover = useCallback(() => {
    setPopoverState(closedPopoverState)
    clearActiveAnnotation()
  }, [clearActiveAnnotation])

  const handleToggleFeedbackMode = useCallback(() => {
    if (feedbackModeEnabled) {
      setFeedbackModeEnabled(false)
      setPopoverState(closedPopoverState)
      clearActiveAnnotation()
      clearHoveredTarget()
      return
    }

    setFeedbackModeEnabled(true)
  }, [clearActiveAnnotation, clearHoveredTarget, feedbackModeEnabled])

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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return
      }

      if (popoverState.open) {
        event.preventDefault()
        event.stopPropagation()
        setPopoverState(closedPopoverState)
        return
      }

      if (!feedbackModeEnabled) {
        return
      }

      event.preventDefault()
      event.stopPropagation()
      setFeedbackModeEnabled(false)
      clearHoveredTarget()
      clearActiveAnnotation()
    }

    document.addEventListener("keydown", handleKeyDown, true)

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true)
    }
  }, [clearActiveAnnotation, clearHoveredTarget, feedbackModeEnabled, popoverState])

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
      {markersVisible ? (
        <MarkerLayer
          activeAnnotationId={activeAnnotationId}
          annotations={resolvedAnnotations}
          onEditAnnotation={handleEditAnnotation}
        />
      ) : null}
      <div style={toolbarPositionStyle}>
        <FeedbackToolbar
          annotationCount={annotations.length}
          feedbackModeEnabled={feedbackModeEnabled}
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
        onToggleMarkers={() => setMarkersVisible((currentValue) => !currentValue)}
        open={panelOpen}
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
    </div>
  )
}

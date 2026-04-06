import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react"

import { AGENTUI_IGNORE_TARGET_ATTRIBUTE, TOOLBAR_OFFSET } from "~src/shared/constants"

import type { Annotation } from "~src/features/annotations/types"
import { useAnnotationsState } from "~src/features/annotations/useAnnotationsState"
import { useTargetSelection } from "~src/features/selection/useTargetSelection"
import type { TargetCandidate } from "~src/features/selection/targetSnapshot"
import { AnnotationPopover } from "~src/ui/overlay/AnnotationPopover"
import { HoverOutline } from "~src/ui/overlay/HoverOutline"
import { FeedbackToolbar } from "~src/ui/toolbar/FeedbackToolbar"

const overlayStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  pointerEvents: "none"
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
  | { open: true; mode: "edit"; annotation: Annotation }

const closedPopoverState: PopoverState = { open: false }

export const OverlayShell = () => {
  const [feedbackModeEnabled, setFeedbackModeEnabled] = useState(false)
  const [popoverState, setPopoverState] = useState<PopoverState>(closedPopoverState)
  const {
    annotations,
    addAnnotation,
    clearActiveAnnotation,
    updateAnnotation
  } = useAnnotationsState()

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

    return popoverState.annotation.target.rect
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
      <div style={toolbarPositionStyle}>
        <FeedbackToolbar
          annotationCount={annotations.length}
          feedbackModeEnabled={feedbackModeEnabled}
          onToggleFeedbackMode={handleToggleFeedbackMode}
        />
      </div>
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

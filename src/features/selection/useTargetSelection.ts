import { useCallback, useEffect, useRef, useState } from "react"

import { areRectsNearlyEqual, rectContainsPoint } from "~src/shared/dom"

import { pickTarget } from "~src/features/selection/pickTarget"
import {
  getEventTargetElement,
  isAgentUIElement
} from "~src/features/selection/selectionGuards"
import type { TargetCandidate } from "~src/features/selection/targetSnapshot"

interface UseTargetSelectionOptions {
  enabled: boolean
  paused?: boolean
  onSelectTarget: (candidate: TargetCandidate) => void
}

const getCurrentSelectionText = () => {
  const selectedText = window.getSelection()?.toString().trim() ?? ""

  return selectedText || null
}

const getStableCandidate = (
  previousCandidate: TargetCandidate | null,
  nextCandidate: TargetCandidate | null,
  x: number,
  y: number
) => {
  if (!previousCandidate || !nextCandidate) {
    return nextCandidate
  }

  if (previousCandidate.element === nextCandidate.element) {
    return previousCandidate
  }

  if (
    previousCandidate.element.contains(nextCandidate.element) &&
    areRectsNearlyEqual(previousCandidate.snapshot.rect, nextCandidate.snapshot.rect)
  ) {
    return previousCandidate
  }

  if (
    rectContainsPoint(previousCandidate.snapshot.rect, x, y, 2) &&
    areRectsNearlyEqual(previousCandidate.snapshot.rect, nextCandidate.snapshot.rect, 10)
  ) {
    return previousCandidate
  }

  return nextCandidate
}

export const useTargetSelection = ({
  enabled,
  paused = false,
  onSelectTarget
}: UseTargetSelectionOptions) => {
  const [hoveredTarget, setHoveredTarget] = useState<TargetCandidate | null>(null)
  const hoveredTargetRef = useRef<TargetCandidate | null>(null)
  const selectedTextRef = useRef<string | null>(null)

  useEffect(() => {
    hoveredTargetRef.current = hoveredTarget
  }, [hoveredTarget])

  const clearHoveredTarget = useCallback(() => {
    hoveredTargetRef.current = null
    selectedTextRef.current = null
    setHoveredTarget(null)
  }, [])

  useEffect(() => {
    if (!enabled) {
      clearHoveredTarget()
      return undefined
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (paused) {
        return
      }

      const nextCandidate = pickTarget(event.target)
      const stableCandidate = getStableCandidate(
        hoveredTargetRef.current,
        nextCandidate,
        event.clientX,
        event.clientY
      )

      hoveredTargetRef.current = stableCandidate
      setHoveredTarget(stableCandidate)
    }

    const handlePointerLeave = (event: PointerEvent) => {
      if (paused) {
        return
      }

      if (!(event.relatedTarget instanceof Node)) {
        clearHoveredTarget()
      }
    }

    const handlePointerDownCapture = (event: PointerEvent) => {
      if (!enabled || paused) {
        return
      }

      const targetElement = getEventTargetElement(event.target)

      if (isAgentUIElement(targetElement)) {
        selectedTextRef.current = null
        return
      }

      selectedTextRef.current = getCurrentSelectionText()
    }

    const handleClickCapture = (event: MouseEvent) => {
      if (!enabled) {
        return
      }

      const targetElement = getEventTargetElement(event.target)

      if (isAgentUIElement(targetElement)) {
        return
      }

      if (paused) {
        event.preventDefault()
        event.stopPropagation()
        event.stopImmediatePropagation()
        return
      }

      const candidate = pickTarget(event.target, {
        includeMetadata: true,
        selectedText: selectedTextRef.current ?? getCurrentSelectionText()
      })

      selectedTextRef.current = null

      if (!candidate) {
        return
      }

      event.preventDefault()
      event.stopPropagation()
      event.stopImmediatePropagation()

      hoveredTargetRef.current = candidate
      setHoveredTarget(candidate)
      onSelectTarget(candidate)
    }

    document.addEventListener("pointermove", handlePointerMove, true)
    document.addEventListener("pointerleave", handlePointerLeave, true)
    document.addEventListener("pointerdown", handlePointerDownCapture, true)
    document.addEventListener("click", handleClickCapture, true)

    return () => {
      document.removeEventListener("pointermove", handlePointerMove, true)
      document.removeEventListener("pointerleave", handlePointerLeave, true)
      document.removeEventListener("pointerdown", handlePointerDownCapture, true)
      document.removeEventListener("click", handleClickCapture, true)
    }
  }, [clearHoveredTarget, enabled, onSelectTarget, paused])

  return {
    hoveredTarget,
    clearHoveredTarget
  }
}

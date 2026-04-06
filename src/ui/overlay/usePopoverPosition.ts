import { useEffect, useLayoutEffect, useState } from "react"

import { clamp } from "~src/shared/dom"
import { POPOVER_GAP, VIEWPORT_PADDING } from "~src/shared/constants"

import type { RectSnapshot } from "~src/features/annotations/types"

interface UsePopoverPositionOptions {
  anchorRect: RectSnapshot | null
  open: boolean
  popoverElement: HTMLDivElement | null
}

const DEFAULT_POPOVER_WIDTH = 340
const DEFAULT_POPOVER_HEIGHT = 300

const getPosition = (
  anchorRect: RectSnapshot,
  popoverElement: HTMLDivElement | null
) => {
  const popoverWidth = popoverElement?.offsetWidth ?? DEFAULT_POPOVER_WIDTH
  const popoverHeight = popoverElement?.offsetHeight ?? DEFAULT_POPOVER_HEIGHT

  const preferredLeft = anchorRect.left + Math.min(anchorRect.width, 24)
  const fallbackLeft = anchorRect.left + anchorRect.width - popoverWidth
  const preferredTop = anchorRect.top + anchorRect.height + POPOVER_GAP
  const fallbackTop = anchorRect.top - popoverHeight - POPOVER_GAP

  const left = clamp(
    preferredLeft + popoverWidth <= window.innerWidth - VIEWPORT_PADDING
      ? preferredLeft
      : fallbackLeft,
    VIEWPORT_PADDING,
    Math.max(VIEWPORT_PADDING, window.innerWidth - popoverWidth - VIEWPORT_PADDING)
  )

  const top = clamp(
    preferredTop + popoverHeight <= window.innerHeight - VIEWPORT_PADDING
      ? preferredTop
      : fallbackTop,
    VIEWPORT_PADDING,
    Math.max(VIEWPORT_PADDING, window.innerHeight - popoverHeight - VIEWPORT_PADDING)
  )

  return {
    top,
    left
  }
}

export const usePopoverPosition = ({
  anchorRect,
  open,
  popoverElement
}: UsePopoverPositionOptions) => {
  const [position, setPosition] = useState({ top: VIEWPORT_PADDING, left: VIEWPORT_PADDING })

  useLayoutEffect(() => {
    if (!open || !anchorRect) {
      return
    }

    setPosition(getPosition(anchorRect, popoverElement))
  }, [anchorRect, open, popoverElement])

  useEffect(() => {
    if (!open || !anchorRect) {
      return
    }

    const updatePosition = () => {
      setPosition(getPosition(anchorRect, popoverElement))
    }

    window.addEventListener("resize", updatePosition)
    window.addEventListener("scroll", updatePosition, true)

    return () => {
      window.removeEventListener("resize", updatePosition)
      window.removeEventListener("scroll", updatePosition, true)
    }
  }, [anchorRect, open, popoverElement])

  return position
}

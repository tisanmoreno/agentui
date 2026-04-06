import { VIEWPORT_PADDING } from "~src/shared/constants"

import type { RectSnapshot } from "~src/features/annotations/types"

export const rectContainsPoint = (
  rect: RectSnapshot,
  x: number,
  y: number,
  padding = 0
) => {
  return (
    x >= rect.left - padding &&
    x <= rect.left + rect.width + padding &&
    y >= rect.top - padding &&
    y <= rect.top + rect.height + padding
  )
}

export const areRectsNearlyEqual = (
  first: RectSnapshot,
  second: RectSnapshot,
  tolerance = 6
) => {
  return (
    Math.abs(first.top - second.top) <= tolerance &&
    Math.abs(first.left - second.left) <= tolerance &&
    Math.abs(first.width - second.width) <= tolerance &&
    Math.abs(first.height - second.height) <= tolerance
  )
}

export const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max)
}

export const clampRectToViewport = (rect: RectSnapshot) => ({
  top: clamp(
    rect.top,
    VIEWPORT_PADDING,
    Math.max(VIEWPORT_PADDING, window.innerHeight - rect.height - VIEWPORT_PADDING)
  ),
  left: clamp(
    rect.left,
    VIEWPORT_PADDING,
    Math.max(VIEWPORT_PADDING, window.innerWidth - rect.width - VIEWPORT_PADDING)
  ),
  width: rect.width,
  height: rect.height
})

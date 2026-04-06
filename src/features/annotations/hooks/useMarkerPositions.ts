import { useEffect, useState } from "react"

import { VIEWPORT_PADDING } from "~src/shared/constants"
import { clamp } from "~src/shared/dom"

import { buildRectSnapshot } from "~src/features/annotations/target-snapshot"
import type { Annotation, RectSnapshot } from "~src/features/annotations/types"

const MARKER_SIZE = 28
const MARKER_GAP = 8

export interface MarkerPosition {
  top: number
  left: number
}

export interface ResolvedAnnotation {
  annotation: Annotation
  index: number
  element: Element | null
  rect: RectSnapshot | null
  markerPosition: MarkerPosition | null
  unresolved: boolean
}

const resolveAnnotationElement = (annotation: Annotation) => {
  const selector = annotation.target.selector

  if (!selector) {
    return null
  }

  try {
    const resolvedElement = document.querySelector(selector)

    return resolvedElement instanceof Element ? resolvedElement : null
  } catch {
    return null
  }
}

const getMarkerPosition = (rect: RectSnapshot): MarkerPosition => {
  const preferredTop = rect.top - MARKER_GAP
  const preferredRight = rect.left + rect.width + MARKER_GAP
  const fallbackLeft = rect.left - MARKER_SIZE - MARKER_GAP

  const top = clamp(
    preferredTop,
    VIEWPORT_PADDING,
    Math.max(VIEWPORT_PADDING, window.innerHeight - MARKER_SIZE - VIEWPORT_PADDING)
  )

  const left = clamp(
    preferredRight + MARKER_SIZE <= window.innerWidth - VIEWPORT_PADDING
      ? preferredRight
      : fallbackLeft,
    VIEWPORT_PADDING,
    Math.max(VIEWPORT_PADDING, window.innerWidth - MARKER_SIZE - VIEWPORT_PADDING)
  )

  return {
    top,
    left
  }
}

const buildResolvedAnnotations = (
  annotations: Annotation[]
): ResolvedAnnotation[] => {
  return annotations.map((annotation, index) => {
    const element = resolveAnnotationElement(annotation)
    const rect = element ? buildRectSnapshot(element) : null

    return {
      annotation,
      index,
      element,
      rect,
      markerPosition: rect ? getMarkerPosition(rect) : null,
      unresolved: !element
    }
  })
}

export const useMarkerPositions = (annotations: Annotation[]) => {
  const [resolvedAnnotations, setResolvedAnnotations] = useState<ResolvedAnnotation[]>([])

  useEffect(() => {
    let frameId = 0

    const updateResolvedAnnotations = () => {
      setResolvedAnnotations(buildResolvedAnnotations(annotations))
    }

    const scheduleUpdate = () => {
      if (frameId) {
        return
      }

      frameId = window.requestAnimationFrame(() => {
        frameId = 0
        updateResolvedAnnotations()
      })
    }

    updateResolvedAnnotations()

    window.addEventListener("resize", scheduleUpdate)
    window.addEventListener("scroll", scheduleUpdate, true)

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId)
      }

      window.removeEventListener("resize", scheduleUpdate)
      window.removeEventListener("scroll", scheduleUpdate, true)
    }
  }, [annotations])

  return resolvedAnnotations
}

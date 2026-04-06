import { useCallback, useEffect, useState } from "react"

import {
  createAnnotation,
  updateAnnotation as createUpdatedAnnotation
} from "~src/features/annotations/annotationFactories"
import {
  clearPageAnnotations,
  deletePageAnnotation,
  listPageAnnotations,
  reorderPageAnnotations,
  savePageAnnotation
} from "~src/features/annotations/storage"
import type { Annotation, AnnotationInput } from "~src/features/annotations/types"

interface UseAnnotationsStateOptions {
  pageUrl?: string | URL
}

const getDefaultPageUrl = () => {
  if (typeof location !== "undefined" && location.href) {
    return location.href
  }

  return undefined
}

const canUseAnnotationStorage = () =>
  typeof chrome !== "undefined" && Boolean(chrome.storage?.local)

const moveAnnotation = (
  annotations: Annotation[],
  fromIndex: number,
  toIndex: number
): Annotation[] => {
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= annotations.length ||
    toIndex >= annotations.length
  ) {
    return annotations
  }

  const nextAnnotations = [...annotations]
  const [movedAnnotation] = nextAnnotations.splice(fromIndex, 1)

  if (!movedAnnotation) {
    return annotations
  }

  nextAnnotations.splice(toIndex, 0, movedAnnotation)

  return nextAnnotations
}

export const useAnnotationsState = (
  options: UseAnnotationsStateOptions = {}
) => {
  const pageUrl = options.pageUrl ?? getDefaultPageUrl()
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [activeAnnotationId, setActiveAnnotationId] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)

  const syncActiveAnnotationId = useCallback((nextAnnotations: Annotation[]) => {
    setActiveAnnotationId((currentActiveAnnotationId) =>
      currentActiveAnnotationId &&
      nextAnnotations.some((annotation) => annotation.id === currentActiveAnnotationId)
        ? currentActiveAnnotationId
        : null
    )
  }, [])

  const reloadAnnotations = useCallback(async () => {
    if (!canUseAnnotationStorage()) {
      setHydrated(true)
      return annotations
    }

    try {
      const nextAnnotations = await listPageAnnotations(pageUrl)

      setAnnotations(nextAnnotations)
      syncActiveAnnotationId(nextAnnotations)

      return nextAnnotations
    } catch (error) {
      console.warn("Failed to load page annotations", error)
      setAnnotations([])
      setActiveAnnotationId(null)
      return []
    } finally {
      setHydrated(true)
    }
  }, [annotations, pageUrl, syncActiveAnnotationId])

  useEffect(() => {
    let cancelled = false

    setHydrated(false)

    if (!canUseAnnotationStorage()) {
      setHydrated(true)
      return
    }

    void listPageAnnotations(pageUrl)
      .then((nextAnnotations) => {
        if (cancelled) {
          return
        }

        setAnnotations(nextAnnotations)
        syncActiveAnnotationId(nextAnnotations)
      })
      .catch((error) => {
        if (cancelled) {
          return
        }

        console.warn("Failed to load page annotations", error)
        setAnnotations([])
        setActiveAnnotationId(null)
      })
      .finally(() => {
        if (!cancelled) {
          setHydrated(true)
        }
      })

    return () => {
      cancelled = true
    }
  }, [pageUrl, syncActiveAnnotationId])

  const addAnnotation = useCallback(
    async (input: AnnotationInput) => {
      if (!canUseAnnotationStorage()) {
        const nextAnnotation = createAnnotation(input)

        setAnnotations((currentAnnotations) => [...currentAnnotations, nextAnnotation])
        setActiveAnnotationId(nextAnnotation.id)

        return nextAnnotation
      }

      try {
        const nextAnnotations = await savePageAnnotation(
          {
            target: input.target,
            tag: input.tag,
            feedback: input.feedback
          },
          pageUrl
        )

        setAnnotations(nextAnnotations)

        const createdAnnotation = nextAnnotations.at(-1) ?? null

        setActiveAnnotationId(createdAnnotation?.id ?? null)

        return createdAnnotation
      } catch (error) {
        console.warn("Failed to save annotation", error)
        return null
      }
    },
    [pageUrl]
  )

  const updateAnnotation = useCallback(
    async (
      annotationId: string,
      input: Pick<AnnotationInput, "tag" | "feedback">
    ) => {
      const existingAnnotation = annotations.find(
        (annotation) => annotation.id === annotationId
      )

      if (!existingAnnotation) {
        return null
      }

      if (!canUseAnnotationStorage()) {
        const nextAnnotation = createUpdatedAnnotation(existingAnnotation, input)

        setAnnotations((currentAnnotations) =>
          currentAnnotations.map((annotation) =>
            annotation.id === annotationId ? nextAnnotation : annotation
          )
        )
        setActiveAnnotationId(annotationId)

        return nextAnnotation
      }

      try {
        const nextAnnotations = await savePageAnnotation(
          {
            id: annotationId,
            target: existingAnnotation.target,
            tag: input.tag,
            feedback: input.feedback
          },
          pageUrl
        )

        setAnnotations(nextAnnotations)
        setActiveAnnotationId(annotationId)

        return (
          nextAnnotations.find((annotation) => annotation.id === annotationId) ?? null
        )
      } catch (error) {
        console.warn(`Failed to update annotation ${annotationId}`, error)
        return null
      }
    },
    [annotations, pageUrl]
  )

  const removeAnnotation = useCallback(
    async (annotationId: string) => {
      if (!canUseAnnotationStorage()) {
        const nextAnnotations = annotations.filter(
          (annotation) => annotation.id !== annotationId
        )

        setAnnotations(nextAnnotations)
        setActiveAnnotationId((currentActiveAnnotationId) =>
          currentActiveAnnotationId === annotationId ? null : currentActiveAnnotationId
        )

        return nextAnnotations
      }

      try {
        const nextAnnotations = await deletePageAnnotation(annotationId, pageUrl)

        setAnnotations(nextAnnotations)
        setActiveAnnotationId((currentActiveAnnotationId) =>
          currentActiveAnnotationId === annotationId ? null : currentActiveAnnotationId
        )

        return nextAnnotations
      } catch (error) {
        console.warn(`Failed to delete annotation ${annotationId}`, error)
        return annotations
      }
    },
    [annotations, pageUrl]
  )

  const reorderAnnotations = useCallback(
    async (fromIndex: number, toIndex: number) => {
      const nextAnnotationOrder = moveAnnotation(annotations, fromIndex, toIndex)

      if (nextAnnotationOrder === annotations) {
        return annotations
      }

      if (!canUseAnnotationStorage()) {
        setAnnotations(nextAnnotationOrder)
        return nextAnnotationOrder
      }

      try {
        const nextAnnotations = await reorderPageAnnotations(
          nextAnnotationOrder.map((annotation) => annotation.id),
          pageUrl
        )

        setAnnotations(nextAnnotations)

        return nextAnnotations
      } catch (error) {
        console.warn(
          `Failed to reorder annotations from index ${fromIndex} to ${toIndex}`,
          error
        )
        return annotations
      }
    },
    [annotations, pageUrl]
  )

  const clearAnnotations = useCallback(async () => {
    if (!canUseAnnotationStorage()) {
      setAnnotations([])
      setActiveAnnotationId(null)
      return
    }

    try {
      await clearPageAnnotations(pageUrl)
      setAnnotations([])
      setActiveAnnotationId(null)
    } catch (error) {
      console.warn("Failed to clear annotations", error)
    }
  }, [pageUrl])

  const clearActiveAnnotation = useCallback(() => {
    setActiveAnnotationId(null)
  }, [])

  return {
    annotations,
    activeAnnotationId,
    hydrated,
    addAnnotation,
    updateAnnotation,
    deleteAnnotation: removeAnnotation,
    reorderAnnotations,
    clearAnnotations,
    reloadAnnotations,
    setActiveAnnotationId,
    clearActiveAnnotation
  }
}

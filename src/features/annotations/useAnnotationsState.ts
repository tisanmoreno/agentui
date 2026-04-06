import { useCallback, useEffect, useState } from "react"

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

export const useAnnotationsState = (
  options: UseAnnotationsStateOptions = {}
) => {
  const pageUrl = options.pageUrl ?? getDefaultPageUrl()
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [activeAnnotationId, setActiveAnnotationId] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)

  const reloadAnnotations = useCallback(async () => {
    const nextAnnotations = await listPageAnnotations(pageUrl)

    setAnnotations(nextAnnotations)
    setActiveAnnotationId((currentActiveAnnotationId) =>
      currentActiveAnnotationId &&
      nextAnnotations.some((annotation) => annotation.id === currentActiveAnnotationId)
        ? currentActiveAnnotationId
        : null
    )

    return nextAnnotations
  }, [pageUrl])

  useEffect(() => {
    let cancelled = false

    setHydrated(false)

    void listPageAnnotations(pageUrl)
      .then((nextAnnotations) => {
        if (cancelled) {
          return
        }

        setAnnotations(nextAnnotations)
        setActiveAnnotationId((currentActiveAnnotationId) =>
          currentActiveAnnotationId &&
          nextAnnotations.some((annotation) => annotation.id === currentActiveAnnotationId)
            ? currentActiveAnnotationId
            : null
        )
      })
      .catch(() => {
        if (cancelled) {
          return
        }

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
  }, [pageUrl])

  const addAnnotation = useCallback(
    async (input: AnnotationInput) => {
      const nextAnnotations = await savePageAnnotation(
        {
          target: input.target,
          tag: input.tag,
          feedback: input.feedback
        },
        pageUrl
      )

      setAnnotations(nextAnnotations)

      const createdAnnotation =
        nextAnnotations[nextAnnotations.length - 1] ?? null

      setActiveAnnotationId(createdAnnotation?.id ?? null)

      return createdAnnotation
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
    },
    [annotations, pageUrl]
  )

  const removeAnnotation = useCallback(
    async (annotationId: string) => {
      const nextAnnotations = await deletePageAnnotation(annotationId, pageUrl)

      setAnnotations(nextAnnotations)
      setActiveAnnotationId((currentActiveAnnotationId) =>
        currentActiveAnnotationId === annotationId ? null : currentActiveAnnotationId
      )

      return nextAnnotations
    },
    [pageUrl]
  )

  const clearAnnotations = useCallback(async () => {
    await clearPageAnnotations(pageUrl)
    setAnnotations([])
    setActiveAnnotationId(null)
  }, [pageUrl])

  const reorderAnnotations = useCallback(
    async (idsInOrder: string[]) => {
      const nextAnnotations = await reorderPageAnnotations(idsInOrder, pageUrl)

      setAnnotations(nextAnnotations)

      return nextAnnotations
    },
    [pageUrl]
  )

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
    clearAnnotations,
    reorderAnnotations,
    reloadAnnotations,
    setActiveAnnotationId,
    clearActiveAnnotation
  }
}

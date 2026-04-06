import { useMemo, useState } from "react"

import {
  createAnnotation,
  updateAnnotation as createUpdatedAnnotation
} from "~src/features/annotations/annotationFactories"
import type { Annotation, AnnotationInput } from "~src/features/annotations/types"

export const useAnnotationsState = () => {
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [activeAnnotationId, setActiveAnnotationId] = useState<string | null>(null)

  const actions = useMemo(
    () => ({
      addAnnotation(input: AnnotationInput) {
        const nextAnnotation = createAnnotation(input)

        setAnnotations((currentAnnotations) => [
          ...currentAnnotations,
          nextAnnotation
        ])
        setActiveAnnotationId(nextAnnotation.id)
      },
      updateAnnotation(
        annotationId: string,
        input: Pick<AnnotationInput, "tag" | "feedback">
      ) {
        setAnnotations((currentAnnotations) =>
          currentAnnotations.map((annotation) => {
            if (annotation.id !== annotationId) {
              return annotation
            }

            return createUpdatedAnnotation(annotation, input)
          })
        )
        setActiveAnnotationId(annotationId)
      },
      setActiveAnnotationId,
      clearActiveAnnotation() {
        setActiveAnnotationId(null)
      }
    }),
    []
  )

  return {
    annotations,
    activeAnnotationId,
    ...actions
  }
}

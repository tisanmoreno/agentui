import type { Annotation } from "~src/features/annotations/types"

export interface AnnotationState {
  annotations: Annotation[]
  activeAnnotationId: string | null
}

export const createInitialAnnotationState = (): AnnotationState => ({
  annotations: [],
  activeAnnotationId: null
})

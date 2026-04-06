import type { AnnotationRecord } from "~src/features/annotations/types"

export interface AnnotationState {
  annotations: AnnotationRecord[]
  activeAnnotationId: string | null
}

export const createInitialAnnotationState = (): AnnotationState => ({
  annotations: [],
  activeAnnotationId: null
})

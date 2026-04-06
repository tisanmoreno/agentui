import type { AnnotationRecord } from "~src/features/annotations/types"

export interface SerializedAnnotationsPayload {
  version: 1
  annotations: AnnotationRecord[]
}

export const serializeAnnotations = (annotations: AnnotationRecord[]) => {
  const payload: SerializedAnnotationsPayload = {
    version: 1,
    annotations
  }

  return JSON.stringify(payload, null, 2)
}

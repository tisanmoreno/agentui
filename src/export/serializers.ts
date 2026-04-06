import type { Annotation } from "~src/features/annotations/types"

export interface SerializedAnnotationsPayload {
  version: 1
  annotations: Annotation[]
}

export const serializeAnnotations = (annotations: Annotation[]) => {
  const payload: SerializedAnnotationsPayload = {
    version: 1,
    annotations
  }

  return JSON.stringify(payload, null, 2)
}

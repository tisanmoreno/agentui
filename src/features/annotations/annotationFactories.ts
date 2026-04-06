import type { Annotation, AnnotationInput } from "~src/features/annotations/types"

const createTimestamp = () => new Date().toISOString()

const createAnnotationId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }

  return `annotation-${Date.now()}`
}

export const createAnnotation = (input: AnnotationInput): Annotation => {
  const timestamp = createTimestamp()

  return {
    id: createAnnotationId(),
    target: input.target,
    tag: input.tag,
    feedback: input.feedback,
    createdAt: timestamp,
    updatedAt: timestamp
  }
}

export const updateAnnotation = (
  annotation: Annotation,
  input: Pick<AnnotationInput, "tag" | "feedback">
): Annotation => ({
  ...annotation,
  tag: input.tag,
  feedback: input.feedback,
  updatedAt: createTimestamp()
})

export const ANNOTATION_TAGS = [
  "spacing",
  "size",
  "width",
  "alignment",
  "typography",
  "consistency",
  "responsive",
  "other"
] as const

export type AnnotationTag = (typeof ANNOTATION_TAGS)[number]

export interface RectSnapshot {
  top: number
  left: number
  width: number
  height: number
}

export interface TargetSnapshot {
  rect: RectSnapshot
  selector: string | null
  label: string | null
  contextText: string | null
}

export interface Annotation {
  id: string
  target: TargetSnapshot
  tag: AnnotationTag | null
  feedback: string
  createdAt: string
  updatedAt: string
}

export interface AnnotationInput {
  target: TargetSnapshot
  tag: AnnotationTag | null
  feedback: string
}

export interface PageAnnotationsStore {
  version: 1
  pageKey: string
  pageUrl: string
  annotations: Annotation[]
  updatedAt: string
}

export type AnnotationRecord = Annotation
export type AnnotationTarget = TargetSnapshot

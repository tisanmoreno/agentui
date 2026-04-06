export interface AnnotationTarget {
  selector: string
  pageUrl: string
}

export interface AnnotationRecord {
  id: string
  note: string
  createdAt: string
  updatedAt: string
  target: AnnotationTarget
}

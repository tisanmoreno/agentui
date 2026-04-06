export type ExportFormat = "compact" | "detailed"

export interface ExportAnnotationTargetInput {
  selector?: string | null
  label?: string | null
  contextText?: string | null
  pageUrl?: string | null
}

export interface ExportAnnotationInput {
  id: string
  note?: string | null
  feedback?: string | null
  tag?: string | null
  createdAt?: string | null
  updatedAt?: string | null
  target?: ExportAnnotationTargetInput | null
}

export interface ExportMetadataInput {
  pageTitle?: string | null
  pageUrl?: string | null
}

export interface NormalizedExportItem {
  id: string
  number: number
  tag: string | null
  label: string | null
  selector: string | null
  contextText: string | null
  feedback: string
}

export interface NormalizedExportPayload {
  version: 1
  title: string
  pageTitle: string | null
  pageUrl: string | null
  items: NormalizedExportItem[]
}

export interface SerializeAnnotationsOptions extends ExportMetadataInput {
  format?: ExportFormat
}

export interface CopyAnnotationsOptions extends SerializeAnnotationsOptions {}

export interface CopyAnnotationsResult {
  format: ExportFormat
  annotationCount: number
  text: string
}

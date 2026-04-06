import type {
  ExportAnnotationInput,
  ExportMetadataInput,
  NormalizedExportItem,
  NormalizedExportPayload
} from "~src/export/types"
import {
  EXPORT_TITLE,
  assignDeterministicOrder,
  getAnnotationFeedback,
  normalizeExportText,
  normalizePageUrl
} from "~src/export/utils"

const normalizeExportItem = (
  annotation: ExportAnnotationInput,
  number: number
): NormalizedExportItem | null => {
  const feedback = getAnnotationFeedback(annotation)

  if (!feedback) {
    return null
  }

  return {
    id: annotation.id,
    number,
    tag: normalizeExportText(annotation.tag),
    label: normalizeExportText(annotation.target?.label),
    selector: normalizeExportText(annotation.target?.selector),
    contextText: normalizeExportText(annotation.target?.contextText),
    feedback
  }
}

const resolvePageUrl = (
  annotations: readonly ExportAnnotationInput[],
  metadata: ExportMetadataInput
) => {
  return normalizePageUrl(
    metadata.pageUrl ?? annotations.find((annotation) => annotation.target?.pageUrl)?.target?.pageUrl
  )
}

export const buildNormalizedExport = (
  annotations: readonly ExportAnnotationInput[],
  metadata: ExportMetadataInput = {}
): NormalizedExportPayload => {
  const items = assignDeterministicOrder(annotations)
    .map(({ item, order }) => normalizeExportItem(item, order))
    .filter((item): item is NormalizedExportItem => item !== null)
    .map((item, index) => ({
      ...item,
      number: index + 1
    }))

  return {
    version: 1,
    title: EXPORT_TITLE,
    pageTitle: normalizeExportText(metadata.pageTitle),
    pageUrl: resolvePageUrl(annotations, metadata),
    items
  }
}

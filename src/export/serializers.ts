import { copyTextToClipboard } from "~src/export/clipboard"
import { formatCompactExport } from "~src/export/formatCompact"
import { formatDetailedExport } from "~src/export/formatDetailed"
import { buildNormalizedExport } from "~src/export/normalize"
import type {
  CopyAnnotationsOptions,
  CopyAnnotationsResult,
  ExportAnnotationInput,
  ExportFormat,
  SerializeAnnotationsOptions
} from "~src/export/types"
import { hasNormalizedExportItems } from "~src/export/utils"

const formatNormalizedExport = (
  format: ExportFormat,
  annotations: readonly ExportAnnotationInput[],
  options: SerializeAnnotationsOptions = {}
) => {
  const normalizedExport = buildNormalizedExport(annotations, options)
  const text =
    format === "detailed"
      ? formatDetailedExport(normalizedExport)
      : formatCompactExport(normalizedExport)

  return {
    normalizedExport,
    text
  }
}

export const serializeAnnotations = (
  annotations: readonly ExportAnnotationInput[],
  options: SerializeAnnotationsOptions = {}
) => {
  const format = options.format ?? "compact"

  return formatNormalizedExport(format, annotations, options).text
}

export const serializeCompactAnnotations = (
  annotations: readonly ExportAnnotationInput[],
  options: Omit<SerializeAnnotationsOptions, "format"> = {}
) => {
  return formatNormalizedExport("compact", annotations, options).text
}

export const serializeDetailedAnnotations = (
  annotations: readonly ExportAnnotationInput[],
  options: Omit<SerializeAnnotationsOptions, "format"> = {}
) => {
  return formatNormalizedExport("detailed", annotations, options).text
}

export const copyAnnotations = async (
  annotations: readonly ExportAnnotationInput[],
  options: CopyAnnotationsOptions = {}
): Promise<CopyAnnotationsResult | null> => {
  const format = options.format ?? "compact"
  const { normalizedExport, text } = formatNormalizedExport(format, annotations, options)

  if (!hasNormalizedExportItems(normalizedExport)) {
    return null
  }

  await copyTextToClipboard(text)

  return {
    format,
    annotationCount: normalizedExport.items.length,
    text
  }
}

export const copyCompactAnnotations = (
  annotations: readonly ExportAnnotationInput[],
  options: Omit<CopyAnnotationsOptions, "format"> = {}
) => {
  return copyAnnotations(annotations, {
    ...options,
    format: "compact"
  })
}

export const copyDetailedAnnotations = (
  annotations: readonly ExportAnnotationInput[],
  options: Omit<CopyAnnotationsOptions, "format"> = {}
) => {
  return copyAnnotations(annotations, {
    ...options,
    format: "detailed"
  })
}

export { buildNormalizedExport } from "~src/export/normalize"
export { formatCompactExport } from "~src/export/formatCompact"
export { formatDetailedExport } from "~src/export/formatDetailed"
export { copyTextToClipboard } from "~src/export/clipboard"
export {
  EXPORT_TITLE,
  assignDeterministicOrder,
  getAnnotationFeedback,
  hasExportableAnnotations,
  hasNormalizedExportItems,
  normalizeExportText,
  normalizePageUrl
} from "~src/export/utils"
export type {
  CopyAnnotationsOptions,
  CopyAnnotationsResult,
  ExportAnnotationInput,
  ExportAnnotationTargetInput,
  ExportFormat,
  ExportMetadataInput,
  NormalizedExportItem,
  NormalizedExportPayload,
  SerializeAnnotationsOptions
} from "~src/export/types"

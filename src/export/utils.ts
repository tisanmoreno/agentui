import type {
  ExportAnnotationInput,
  NormalizedExportItem,
  NormalizedExportPayload
} from "~src/export/types"

export const EXPORT_TITLE = "Frontend feedback"
export const FALLBACK_TARGET_LABEL = "Untitled target"
export const FALLBACK_SELECTOR_LABEL = "Unavailable"

export interface OrderedValue<T> {
  item: T
  order: number
}

export const assignDeterministicOrder = <T>(items: readonly T[]): OrderedValue<T>[] => {
  return items.map((item, index) => ({
    item,
    order: index + 1
  }))
}

export const normalizeExportText = (value?: string | null) => {
  if (typeof value !== "string") {
    return null
  }

  const normalized = value
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((part) => part.trim())
    .filter(Boolean)
    .join(" ")

  return normalized.length > 0 ? normalized : null
}

export const normalizePageUrl = (value?: string | null) => {
  const normalized = normalizeExportText(value)

  if (!normalized) {
    return null
  }

  try {
    const url = typeof window !== "undefined"
      ? new URL(normalized, window.location.href)
      : new URL(normalized)

    return `${url.origin}${url.pathname}`
  } catch {
    const [withoutHash] = normalized.split("#", 1)
    const [withoutQuery] = withoutHash.split("?", 1)

    return withoutQuery || null
  }
}

export const getAnnotationFeedback = (annotation: ExportAnnotationInput) => {
  return normalizeExportText(annotation.feedback ?? annotation.note)
}

export const hasExportableAnnotations = (
  annotations: readonly ExportAnnotationInput[]
) => {
  return annotations.some((annotation) => Boolean(getAnnotationFeedback(annotation)))
}

export const hasNormalizedExportItems = (
  payload: Pick<NormalizedExportPayload, "items">
) => {
  return payload.items.length > 0
}

export const getExportItemHeading = (
  item: Pick<NormalizedExportItem, "tag" | "label" | "selector">,
  fallbackLabel = FALLBACK_TARGET_LABEL
) => {
  const label = item.label ?? item.selector ?? fallbackLabel
  const tagPrefix = item.tag ? `[${item.tag}] ` : ""

  return `${tagPrefix}${label}`
}

export const getDetailedTargetLabel = (
  item: Pick<NormalizedExportItem, "label" | "selector">
) => {
  return item.label ?? item.selector ?? FALLBACK_TARGET_LABEL
}

export const quoteExportContext = (contextText: string) => {
  return JSON.stringify(contextText)
}

export const buildExportHeaderLines = (
  payload: Pick<NormalizedExportPayload, "title" | "pageTitle" | "pageUrl">
) => {
  const lines = [payload.title]

  if (payload.pageTitle || payload.pageUrl) {
    lines.push("")
  }

  if (payload.pageTitle) {
    lines.push(`Title: ${payload.pageTitle}`)
  }

  if (payload.pageUrl) {
    lines.push(`Page: ${payload.pageUrl}`)
  }

  return lines
}

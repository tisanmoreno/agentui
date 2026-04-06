import type { NormalizedExportPayload } from "~src/export/types"
import {
  FALLBACK_SELECTOR_LABEL,
  buildExportHeaderLines,
  getDetailedTargetLabel,
  getExportItemHeading,
  hasNormalizedExportItems,
  quoteExportContext
} from "~src/export/utils"

export const formatDetailedExport = (payload: NormalizedExportPayload) => {
  if (!hasNormalizedExportItems(payload)) {
    return ""
  }

  const lines = buildExportHeaderLines(payload)

  payload.items.forEach((item) => {
    lines.push("")
    lines.push(`${item.number}. ${getExportItemHeading(item)}`)
    lines.push(`   Target: ${getDetailedTargetLabel(item)}`)
    lines.push(`   Selector: ${item.selector ?? FALLBACK_SELECTOR_LABEL}`)

    if (item.contextText) {
      lines.push(`   Context: ${quoteExportContext(item.contextText)}`)
    }

    lines.push(`   Feedback: ${item.feedback}`)
  })

  return lines.join("\n")
}

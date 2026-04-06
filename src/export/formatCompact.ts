import type { NormalizedExportPayload } from "~src/export/types"
import {
  buildExportHeaderLines,
  getExportItemHeading,
  hasNormalizedExportItems,
  quoteExportContext
} from "~src/export/utils"

export const formatCompactExport = (payload: NormalizedExportPayload) => {
  if (!hasNormalizedExportItems(payload)) {
    return ""
  }

  const lines = buildExportHeaderLines(payload)

  payload.items.forEach((item) => {
    lines.push("")
    lines.push(`${item.number}. ${getExportItemHeading(item)}`)

    if (item.contextText) {
      lines.push(`   Context: ${quoteExportContext(item.contextText)}`)
    }

    lines.push(`   Feedback: ${item.feedback}`)
  })

  return lines.join("\n")
}

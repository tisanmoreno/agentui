import type {
  RectSnapshot,
  TargetSnapshot
} from "~src/features/annotations/types"
import {
  extractElementContext,
  extractElementLabel,
  type ContextResult,
  type LabelResult,
  type MetadataOptions
} from "~src/utils/target-metadata"
import { buildSelectorResult, type SelectorResult } from "~src/utils/selectors"

export interface TargetSnapshotBuildResult {
  target: TargetSnapshot
  selector: SelectorResult
  label: LabelResult
  context: ContextResult
}

export const buildRectSnapshot = (element: Element): RectSnapshot => {
  const rect = element.getBoundingClientRect()

  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height
  }
}

export const buildTargetSnapshot = (
  element: Element,
  options: MetadataOptions = {}
): TargetSnapshotBuildResult => {
  const selector = buildSelectorResult(element)
  const label = extractElementLabel(element, options)
  const context = extractElementContext(element, options)

  return {
    selector,
    label,
    context,
    target: {
      rect: buildRectSnapshot(element),
      selector: selector.selector,
      label: label.label,
      contextText: context.text
    }
  }
}

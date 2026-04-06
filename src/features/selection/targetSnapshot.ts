import {
  buildTargetSnapshot as buildAnnotationTargetSnapshot
} from "~src/features/annotations/target-snapshot"
import type { TargetSnapshot } from "~src/features/annotations/types"
import type { MetadataOptions } from "~src/utils/target-metadata"

export interface TargetSnapshotOptions extends MetadataOptions {
  includeMetadata?: boolean
}

export interface TargetCandidate {
  element: Element
  snapshot: TargetSnapshot
}

export const buildTargetSnapshot = (
  element: Element,
  options: TargetSnapshotOptions = {}
): TargetSnapshot => {
  if (!options.includeMetadata) {
    const rect = element.getBoundingClientRect()

    return {
      rect: {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height
      },
      selector: null,
      label: null,
      contextText: null
    }
  }

  return buildAnnotationTargetSnapshot(element, options).target
}

export const createTargetCandidate = (
  element: Element,
  options: TargetSnapshotOptions = {}
): TargetCandidate => ({
  element,
  snapshot: buildTargetSnapshot(element, options)
})

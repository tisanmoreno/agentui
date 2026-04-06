import type { TargetSnapshot } from "~src/features/annotations/types"

export interface TargetCandidate {
  element: Element
  snapshot: TargetSnapshot
}

export const buildTargetSnapshot = (element: Element): TargetSnapshot => {
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

export const createTargetCandidate = (element: Element): TargetCandidate => ({
  element,
  snapshot: buildTargetSnapshot(element)
})

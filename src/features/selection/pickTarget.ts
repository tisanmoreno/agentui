import { MIN_VISIBLE_TARGET_SIZE } from "~src/shared/constants"

import {
  getEventTargetElement,
  hasPointerEvents,
  isSelectableElement
} from "~src/features/selection/selectionGuards"
import {
  createTargetCandidate,
  type TargetCandidate,
  type TargetSnapshotOptions
} from "~src/features/selection/targetSnapshot"

const MAX_ANCESTOR_DEPTH = 6
const PROMOTION_DEPTH = 3

const INTERACTIVE_SELECTOR = [
  "button",
  "a[href]",
  "input",
  "textarea",
  "select",
  "option",
  "label"
].join(", ")

const ROLE_SELECTOR = [
  '[role="button"]',
  '[role="link"]',
  '[role="tab"]',
  '[role="checkbox"]',
  '[contenteditable="true"]'
].join(", ")

const GROUP_SELECTOR = ['fieldset', 'form', '[role="group"]'].join(", ")
const SEMANTIC_CONTAINER_SELECTOR = [
  "section",
  "article",
  "aside",
  "nav",
  "header",
  "footer",
  "main",
  "li"
].join(", ")

const INLINE_TAG_NAMES = new Set(["span", "strong", "em", "small", "b", "i"])
const ICON_TAG_NAMES = new Set(["svg", "path", "use"])

const getDepthBetween = (child: Element, ancestor: Element) => {
  let current: Element | null = child
  let depth = 0

  while (current && current !== ancestor && depth <= MAX_ANCESTOR_DEPTH) {
    current = current.parentElement
    depth += 1
  }

  return current === ancestor ? depth : Number.POSITIVE_INFINITY
}

const getPromotedElement = (element: Element) => {
  const interactiveAncestor = element.closest(INTERACTIVE_SELECTOR)

  if (
    interactiveAncestor &&
    getDepthBetween(element, interactiveAncestor) <= PROMOTION_DEPTH
  ) {
    const tagName = element.tagName.toLowerCase()

    if (INLINE_TAG_NAMES.has(tagName) || ICON_TAG_NAMES.has(tagName)) {
      return interactiveAncestor
    }
  }

  const labelAncestor = element.closest("label")

  if (labelAncestor && getDepthBetween(element, labelAncestor) <= PROMOTION_DEPTH) {
    const elementRect = element.getBoundingClientRect()
    const labelRect = labelAncestor.getBoundingClientRect()

    if (
      labelRect.width >= elementRect.width * 1.5 ||
      labelRect.height >= elementRect.height * 1.5
    ) {
      return labelAncestor
    }
  }

  const groupAncestor = element.closest(GROUP_SELECTOR)

  if (groupAncestor && getDepthBetween(element, groupAncestor) <= PROMOTION_DEPTH) {
    const elementRect = element.getBoundingClientRect()
    const groupRect = groupAncestor.getBoundingClientRect()

    if (
      elementRect.width < MIN_VISIBLE_TARGET_SIZE ||
      elementRect.height < MIN_VISIBLE_TARGET_SIZE ||
      groupRect.width >= elementRect.width * 2
    ) {
      return groupAncestor
    }
  }

  return element
}

const getCandidateElements = (startElement: Element) => {
  const candidates: Element[] = []
  let current: Element | null = startElement
  let depth = 0

  while (current && depth <= MAX_ANCESTOR_DEPTH) {
    if (isSelectableElement(current) && hasPointerEvents(current)) {
      candidates.push(current)
    }

    current = current.parentElement
    depth += 1
  }

  return candidates
}

const getCandidateScore = (candidate: Element, rawTarget: Element, depth: number) => {
  const tagName = candidate.tagName.toLowerCase()
  const rect = candidate.getBoundingClientRect()
  const rawRect = rawTarget.getBoundingClientRect()
  let score = 0

  if (candidate.matches(INTERACTIVE_SELECTOR)) {
    score += 5
  }

  if (candidate.matches(ROLE_SELECTOR)) {
    score += 4
  }

  if (candidate.matches(GROUP_SELECTOR)) {
    score += 3
  }

  if (candidate.matches(SEMANTIC_CONTAINER_SELECTOR)) {
    score += 2
  }

  if (
    candidate.id ||
    candidate.getAttribute("data-testid") ||
    candidate.getAttribute("data-test") ||
    candidate.getAttribute("data-cy") ||
    candidate.getAttribute("aria-label") ||
    candidate.getAttribute("name")
  ) {
    score += 2
  }

  if (rect.width >= 24 && rect.height >= 24) {
    score += 1
  }

  if (INLINE_TAG_NAMES.has(tagName)) {
    score -= 3
  }

  if (ICON_TAG_NAMES.has(tagName)) {
    score -= 2
  }

  if (rect.width < MIN_VISIBLE_TARGET_SIZE || rect.height < MIN_VISIBLE_TARGET_SIZE) {
    score -= 3
  }

  if (rect.width > window.innerWidth * 0.8 && rect.height > window.innerHeight * 0.6) {
    score -= 4
  }

  const rawArea = Math.max(rawRect.width * rawRect.height, 1)
  const candidateArea = rect.width * rect.height
  const hasSemanticGain =
    candidate.matches(INTERACTIVE_SELECTOR) ||
    candidate.matches(ROLE_SELECTOR) ||
    candidate.matches(GROUP_SELECTOR) ||
    candidate.matches(SEMANTIC_CONTAINER_SELECTOR) ||
    Boolean(candidate.getAttribute("data-testid"))

  if (candidateArea > rawArea * 6 && !hasSemanticGain) {
    score -= 2
  }

  score -= depth * 0.25

  return score
}

export const pickTarget = (
  target: EventTarget | null,
  metadataOptions: TargetSnapshotOptions = {}
): TargetCandidate | null => {
  const rawElement = getEventTargetElement(target)

  if (!rawElement) {
    return null
  }

  const startElement = getPromotedElement(rawElement)
  const candidates = getCandidateElements(startElement)

  if (candidates.length === 0) {
    return null
  }

  const bestCandidate = candidates.reduce<{ element: Element; score: number; depth: number }>(
    (best, candidate, depth) => {
      const score = getCandidateScore(candidate, rawElement, depth)

      if (score > best.score || (score === best.score && depth < best.depth)) {
        return {
          element: candidate,
          score,
          depth
        }
      }

      return best
    },
    {
      element: candidates[0],
      score: Number.NEGATIVE_INFINITY,
      depth: Number.POSITIVE_INFINITY
    }
  )

  return createTargetCandidate(bestCandidate.element, metadataOptions)
}

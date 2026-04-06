export type SelectorStrategy =
  | "id"
  | "data-testid"
  | "data-test"
  | "data-cy"
  | "aria-label"
  | "name"
  | "semantic"
  | "fallback"

export type SelectorConfidence = "high" | "medium" | "low"

export interface SelectorResult {
  selector: string | null
  alternates: string[]
  strategy: SelectorStrategy | null
  confidence: SelectorConfidence
}

const MAX_SELECTOR_DEPTH = 3
const MAX_SEMANTIC_CLASSES = 2
const AGENTUI_ROOT_SELECTOR = '#agentui-overlay-root, [data-agentui-owned="true"]'
const PREFERRED_ATTRIBUTE_NAMES = ["data-testid", "data-test", "data-cy"] as const
const UTILITY_CLASS_PATTERN =
  /^(?:dark:|light:|sm:|md:|lg:|xl:|2xl:)?(?:m|mx|my|mt|mr|mb|ml|p|px|py|pt|pr|pb|pl|w|h|min-w|max-w|min-h|max-h|text|bg|border|rounded|shadow|flex|grid|items|justify|gap|space|font|leading|tracking|z|top|right|bottom|left|inset|col|row|object|overflow|ring|stroke|fill|translate|scale|rotate|skew|origin)-/

const SEMANTIC_TAGS = new Set([
  "main",
  "nav",
  "section",
  "article",
  "aside",
  "header",
  "footer",
  "form",
  "fieldset",
  "dialog"
])

const STABLE_ATTRIBUTE_NAMES = ["type", "name", "role"] as const

const normalizeWhitespace = (value: string) => value.trim().replace(/\s+/g, " ")

const dedupeStrings = (values: Array<string | null | undefined>) => {
  const seen = new Set<string>()
  const result: string[] = []

  for (const value of values) {
    if (!value || seen.has(value)) {
      continue
    }

    seen.add(value)
    result.push(value)
  }

  return result
}

const isGeneratedToken = (value: string) => {
  const token = value.trim()

  if (!token || token.length > 32) {
    return true
  }

  if (/^[0-9a-f]{8,}$/i.test(token) || /^[0-9]{6,}$/.test(token)) {
    return true
  }

  if (
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(token)
  ) {
    return true
  }

  if (/(?:css|jsx|sc)-[a-z0-9]{6,}/i.test(token)) {
    return true
  }

  if (/[a-z][a-z0-9_-]*[0-9]{4,}$/i.test(token)) {
    return true
  }

  return false
}

const isStableToken = (value: string) => !isGeneratedToken(value)

const escapeValue = (value: string) => CSS.escape(value)

const isAgentUIElement = (element: Element | null) => {
  if (!element) {
    return false
  }

  if (element.id.startsWith("agentui-")) {
    return true
  }

  return element.matches(AGENTUI_ROOT_SELECTOR) || element.closest(AGENTUI_ROOT_SELECTOR) !== null
}

const isUniqueSelector = (selector: string, element: Element) => {
  if (!selector) {
    return false
  }

  try {
    const matches = Array.from(element.ownerDocument.querySelectorAll(selector)).filter(
      (candidate) => !isAgentUIElement(candidate)
    )

    return matches.length === 1 && matches[0] === element
  } catch {
    return false
  }
}

const getTagName = (element: Element) => element.tagName.toLowerCase()

const getElementIndex = (element: Element) => {
  const siblings = Array.from(element.parentElement?.children ?? []).filter(
    (candidate) => candidate.tagName === element.tagName
  )

  return siblings.indexOf(element) + 1
}

const getStableClasses = (element: Element) => {
  return Array.from(element.classList)
    .map((className) => className.trim())
    .filter(
      (className) =>
        Boolean(className) && isStableToken(className) && !UTILITY_CLASS_PATTERN.test(className)
    )
    .slice(0, MAX_SEMANTIC_CLASSES)
}

const getPreferredAttributeSelector = (
  element: Element,
  attributeName: (typeof PREFERRED_ATTRIBUTE_NAMES)[number]
) => {
  const value = normalizeWhitespace(element.getAttribute(attributeName) ?? "")

  if (!value || !isStableToken(value)) {
    return null
  }

  return `[${attributeName}="${escapeValue(value)}"]`
}

const getIdSelector = (element: Element) => {
  const id = normalizeWhitespace(element.id)

  if (!id || !isStableToken(id)) {
    return null
  }

  return `#${escapeValue(id)}`
}

const getAriaLabelSelector = (element: Element) => {
  const ariaLabel = normalizeWhitespace(element.getAttribute("aria-label") ?? "")

  if (!ariaLabel || !isStableToken(ariaLabel)) {
    return null
  }

  return `${getTagName(element)}[aria-label="${escapeValue(ariaLabel)}"]`
}

const getNameSelector = (element: Element) => {
  const name = normalizeWhitespace(element.getAttribute("name") ?? "")

  if (!name || !isStableToken(name)) {
    return null
  }

  return `${getTagName(element)}[name="${escapeValue(name)}"]`
}

const getStableAttributeHint = (element: Element) => {
  for (const attributeName of STABLE_ATTRIBUTE_NAMES) {
    const value = normalizeWhitespace(element.getAttribute(attributeName) ?? "")

    if (!value || !isStableToken(value)) {
      continue
    }

    return `[${attributeName}="${escapeValue(value)}"]`
  }

  return null
}

const getSemanticSegment = (element: Element) => {
  const tagName = getTagName(element)
  const stableClasses = getStableClasses(element)
  const classSuffix = stableClasses.map((className) => `.${escapeValue(className)}`).join("")

  return `${tagName}${classSuffix}`
}

const getBestAnchorSelector = (element: Element) => {
  const idSelector = getIdSelector(element)

  if (idSelector) {
    return idSelector
  }

  for (const attributeName of PREFERRED_ATTRIBUTE_NAMES) {
    const attributeSelector = getPreferredAttributeSelector(element, attributeName)

    if (attributeSelector) {
      return attributeSelector
    }
  }

  const tagName = getTagName(element)

  if (SEMANTIC_TAGS.has(tagName)) {
    const semanticSegment = getSemanticSegment(element)

    if (semanticSegment !== tagName) {
      return semanticSegment
    }
  }

  return null
}

const buildSemanticCandidates = (element: Element) => {
  const candidates: string[] = []
  const tagName = getTagName(element)
  const baseSegment = getSemanticSegment(element)
  const stableAttributeHint = getStableAttributeHint(element)

  candidates.push(baseSegment)

  if (stableAttributeHint) {
    candidates.push(`${baseSegment}${stableAttributeHint}`)
  }

  let ancestor = element.parentElement
  let depth = 1

  while (ancestor && depth <= MAX_SELECTOR_DEPTH) {
    if (isAgentUIElement(ancestor)) {
      break
    }

    const anchorSelector = getBestAnchorSelector(ancestor)

    if (anchorSelector) {
      candidates.push(`${anchorSelector} ${baseSegment}`)

      if (stableAttributeHint) {
        candidates.push(`${anchorSelector} ${baseSegment}${stableAttributeHint}`)
      }
    }

    ancestor = ancestor.parentElement
    depth += 1
  }

  return dedupeStrings(candidates)
}

const buildFallbackCandidates = (element: Element) => {
  const candidates: string[] = []
  const baseSegment = getSemanticSegment(element)
  const nthSegment = `${baseSegment}:nth-of-type(${getElementIndex(element)})`

  candidates.push(nthSegment)

  let ancestor = element.parentElement
  let depth = 1

  while (ancestor && depth <= MAX_SELECTOR_DEPTH) {
    if (isAgentUIElement(ancestor)) {
      break
    }

    const anchorSelector = getBestAnchorSelector(ancestor) ?? getSemanticSegment(ancestor)

    candidates.push(`${anchorSelector} > ${nthSegment}`)
    ancestor = ancestor.parentElement
    depth += 1
  }

  return dedupeStrings(candidates)
}

export const buildSelectorResult = (element: Element): SelectorResult => {
  if (isAgentUIElement(element)) {
    return {
      selector: null,
      alternates: [],
      strategy: null,
      confidence: "low"
    }
  }

  const resolvedCandidates: Array<
    Pick<SelectorResult, "selector" | "strategy" | "confidence"> & { selector: string }
  > = []

  const addCandidate = (
    selector: string | null,
    strategy: SelectorStrategy,
    confidence: SelectorConfidence
  ) => {
    if (!selector || !isUniqueSelector(selector, element)) {
      return
    }

    resolvedCandidates.push({ selector, strategy, confidence })
  }

  addCandidate(getIdSelector(element), "id", "high")

  for (const attributeName of PREFERRED_ATTRIBUTE_NAMES) {
    addCandidate(getPreferredAttributeSelector(element, attributeName), attributeName, "high")
  }

  addCandidate(getAriaLabelSelector(element), "aria-label", "medium")
  addCandidate(getNameSelector(element), "name", "medium")

  for (const selector of buildSemanticCandidates(element)) {
    addCandidate(selector, "semantic", "medium")
  }

  for (const selector of buildFallbackCandidates(element)) {
    addCandidate(selector, "fallback", "low")
  }

  const [primaryCandidate, ...alternateCandidates] = dedupeStrings(
    resolvedCandidates.map((candidate) => candidate.selector)
  ).map((selector) => resolvedCandidates.find((candidate) => candidate.selector === selector)!)

  if (!primaryCandidate) {
    return {
      selector: null,
      alternates: [],
      strategy: null,
      confidence: "low"
    }
  }

  return {
    selector: primaryCandidate.selector,
    alternates: alternateCandidates.map((candidate) => candidate.selector),
    strategy: primaryCandidate.strategy,
    confidence: primaryCandidate.confidence
  }
}

export const buildElementSelector = (element: Element) => buildSelectorResult(element).selector

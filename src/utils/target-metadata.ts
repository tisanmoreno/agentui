export type LabelSource =
  | "selection"
  | "aria-label"
  | "aria-labelledby"
  | "label"
  | "alt"
  | "title"
  | "placeholder"
  | "element-text"
  | "semantic"

export type ContextSource =
  | "selection"
  | "element-text"
  | "associated-label"
  | "nearby-text"
  | "attribute"

export interface MetadataOptions {
  selectedText?: string | null
}

export interface LabelResult {
  label: string | null
  source: LabelSource | null
}

export interface ContextResult {
  text: string | null
  source: ContextSource | null
}

const MAX_LABEL_LENGTH = 80
const MAX_CONTEXT_LENGTH = 180
const NEARBY_TEXT_MAX_LENGTH = 320
const CARD_LIKE_CLASS_PATTERN = /(?:card|panel|modal|dialog|sheet|tile|item|row|section)/i

const normalizeWhitespace = (value: string) => value.trim().replace(/\s+/g, " ")

const truncate = (value: string, maxLength: number) => {
  if (value.length <= maxLength) {
    return value
  }

  return `${value.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`
}

const getMeaningfulText = (value: string | null | undefined, maxLength: number) => {
  if (!value) {
    return null
  }

  const normalizedValue = normalizeWhitespace(value)

  if (!normalizedValue) {
    return null
  }

  return truncate(normalizedValue, maxLength)
}

const isHTMLElement = (element: Element | null): element is HTMLElement =>
  typeof HTMLElement !== "undefined" && element instanceof HTMLElement

const isElementVisible = (element: Element | null) => {
  if (!element || !isHTMLElement(element)) {
    return false
  }

  if (element.hidden || element.getAttribute("aria-hidden") === "true") {
    return false
  }

  const view = element.ownerDocument.defaultView

  if (!view) {
    return true
  }

  const style = view.getComputedStyle(element)

  return style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0"
}

const getVisibleText = (element: Element | null, maxLength: number) => {
  if (!element || !isElementVisible(element)) {
    return null
  }

  const rawText = isHTMLElement(element) ? element.innerText || element.textContent || "" : ""

  return getMeaningfulText(rawText, maxLength)
}

const getAttributeText = (
  element: Element,
  attributeName: string,
  maxLength: number
): string | null => getMeaningfulText(element.getAttribute(attributeName), maxLength)

const getTextForIdReferences = (element: Element, attributeName: string, maxLength: number) => {
  const ids = normalizeWhitespace(element.getAttribute(attributeName) ?? "")

  if (!ids) {
    return null
  }

  const referencedText = ids
    .split(/\s+/)
    .map((id) => {
      const referencedElement = element.ownerDocument.getElementById(id)

      return getVisibleText(referencedElement, maxLength)
    })
    .filter((value): value is string => Boolean(value))
    .join(" ")

  return getMeaningfulText(referencedText, maxLength)
}

const getAssociatedLabelText = (element: Element, maxLength: number) => {
  if (!(element instanceof HTMLElement)) {
    return null
  }

  if (
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement ||
    element instanceof HTMLSelectElement ||
    element instanceof HTMLOutputElement ||
    element instanceof HTMLProgressElement ||
    element instanceof HTMLMeterElement
  ) {
    const labelText = Array.from(element.labels ?? [])
      .map((label) => getVisibleText(label, maxLength))
      .filter((value): value is string => Boolean(value))
      .join(" ")

    if (labelText) {
      return getMeaningfulText(labelText, maxLength)
    }
  }

  if (element.id) {
    const label = element.ownerDocument.querySelector(`label[for="${CSS.escape(element.id)}"]`)

    if (label) {
      return getVisibleText(label, maxLength)
    }
  }

  const wrappingLabel = element.closest("label")

  return getVisibleText(wrappingLabel, maxLength)
}

const getPlaceholderText = (element: Element, maxLength: number) => {
  if (!(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement)) {
    return null
  }

  return getMeaningfulText(element.placeholder, maxLength)
}

const getRoleLabel = (element: Element) => {
  const tagName = element.tagName.toLowerCase()
  const explicitRole = normalizeWhitespace(element.getAttribute("role") ?? "")

  if (tagName === "button" || explicitRole === "button") {
    return "button"
  }

  if (tagName === "a" && element.hasAttribute("href")) {
    return "link"
  }

  if (tagName === "input" || tagName === "textarea" || tagName === "select") {
    return tagName
  }

  return explicitRole || tagName
}

const isGeneratedToken = (value: string) => {
  const token = value.trim()

  if (!token || token.length > 32) {
    return true
  }

  if (/^[0-9a-f]{8,}$/i.test(token) || /^[0-9]{6,}$/.test(token)) {
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

const getStableSemanticIdentity = (element: Element) => {
  const tagName = element.tagName.toLowerCase()
  const id = normalizeWhitespace(element.id)

  if (id && !isGeneratedToken(id)) {
    return `${tagName}#${id}`
  }

  const className = Array.from(element.classList)
    .map((token) => token.trim())
    .find((token) => token && !isGeneratedToken(token))

  if (className) {
    return `${tagName}.${className}`
  }

  for (const attributeName of ["name", "type", "data-testid", "aria-label"] as const) {
    const attributeValue = normalizeWhitespace(element.getAttribute(attributeName) ?? "")

    if (attributeValue && !isGeneratedToken(attributeValue)) {
      return `${tagName}[${attributeName}=${attributeValue}]`
    }
  }

  return tagName
}

const getNearbyText = (element: Element, labelHint: string | null) => {
  const nearbySelectors = [
    "label",
    "fieldset",
    "form",
    "section",
    "article",
    "li",
    "figure",
    "table",
    "[role='dialog']",
    "[role='group']"
  ].join(",")

  let ancestor = element.parentElement
  let depth = 0

  while (ancestor && depth < 5) {
    const tagName = ancestor.tagName.toLowerCase()
    const isCardLike = Array.from(ancestor.classList).some((token) => CARD_LIKE_CLASS_PATTERN.test(token))

    if (ancestor.matches(nearbySelectors) || isCardLike) {
      if (tagName === "nav" || tagName === "header" || tagName === "footer") {
        ancestor = ancestor.parentElement
        depth += 1
        continue
      }

      const heading = ancestor.querySelector(
        "h1, h2, h3, h4, h5, h6, legend, caption, summary, [role='heading']"
      )
      const headingText = getVisibleText(heading, MAX_CONTEXT_LENGTH)

      if (headingText && headingText !== labelHint) {
        return headingText
      }

      const text = getVisibleText(ancestor, NEARBY_TEXT_MAX_LENGTH)

      if (text && text !== labelHint && text.length <= NEARBY_TEXT_MAX_LENGTH) {
        return truncate(text, MAX_CONTEXT_LENGTH)
      }
    }

    ancestor = ancestor.parentElement
    depth += 1
  }

  return null
}

export const extractElementLabel = (
  element: Element,
  options: MetadataOptions = {}
): LabelResult => {
  const roleLabel = getRoleLabel(element)
  const labelCandidates: Array<[string | null, LabelSource]> = [
    [getMeaningfulText(options.selectedText, MAX_LABEL_LENGTH), "selection"],
    [getAttributeText(element, "aria-label", MAX_LABEL_LENGTH), "aria-label"],
    [getTextForIdReferences(element, "aria-labelledby", MAX_LABEL_LENGTH), "aria-labelledby"],
    [getAssociatedLabelText(element, MAX_LABEL_LENGTH), "label"],
    [getAttributeText(element, "alt", MAX_LABEL_LENGTH), "alt"],
    [getAttributeText(element, "title", MAX_LABEL_LENGTH), "title"],
    [getPlaceholderText(element, MAX_LABEL_LENGTH), "placeholder"],
    [getVisibleText(element, MAX_LABEL_LENGTH), "element-text"]
  ]

  for (const [candidate, source] of labelCandidates) {
    if (!candidate) {
      continue
    }

    return {
      label: `${roleLabel} "${truncate(candidate, MAX_LABEL_LENGTH - roleLabel.length - 3)}"`,
      source
    }
  }

  return {
    label: truncate(getStableSemanticIdentity(element), MAX_LABEL_LENGTH),
    source: "semantic"
  }
}

export const extractElementContext = (
  element: Element,
  options: MetadataOptions = {}
): ContextResult => {
  const selectionText = getMeaningfulText(options.selectedText, MAX_CONTEXT_LENGTH)

  if (selectionText) {
    return {
      text: selectionText,
      source: "selection"
    }
  }

  const directText = getVisibleText(element, MAX_CONTEXT_LENGTH)

  if (directText) {
    return {
      text: directText,
      source: "element-text"
    }
  }

  const associatedLabelText =
    getAssociatedLabelText(element, MAX_CONTEXT_LENGTH) ||
    getTextForIdReferences(element, "aria-labelledby", MAX_CONTEXT_LENGTH)

  if (associatedLabelText) {
    return {
      text: associatedLabelText,
      source: "associated-label"
    }
  }

  for (const attributeName of ["aria-label", "placeholder", "alt", "title"] as const) {
    const attributeText = getAttributeText(element, attributeName, MAX_CONTEXT_LENGTH)

    if (attributeText) {
      return {
        text: attributeText,
        source: "attribute"
      }
    }
  }

  const labelHint = extractElementLabel(element, options).label
  const nearbyText = getNearbyText(element, labelHint)

  if (nearbyText) {
    return {
      text: nearbyText,
      source: "nearby-text"
    }
  }

  return {
    text: null,
    source: null
  }
}

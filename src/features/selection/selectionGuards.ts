import {
  AGENTUI_IGNORE_TARGET_ATTRIBUTE,
  AGENTUI_ROOT_ATTRIBUTE,
  MIN_TARGET_SIZE
} from "~src/shared/constants"

const HIDDEN_VISIBILITY_VALUES = new Set(["hidden", "collapse"])

export const getEventTargetElement = (target: EventTarget | null) => {
  if (target instanceof Element) {
    return target
  }

  if (target instanceof Text) {
    return target.parentElement
  }

  return null
}

export const isAgentUIElement = (element: Element | null) => {
  if (!element) {
    return false
  }

  return Boolean(
    element.closest(`[${AGENTUI_ROOT_ATTRIBUTE}], [${AGENTUI_IGNORE_TARGET_ATTRIBUTE}]`)
  )
}

export const isVisibleElement = (element: Element) => {
  const style = window.getComputedStyle(element)

  if (
    style.display === "none" ||
    HIDDEN_VISIBILITY_VALUES.has(style.visibility) ||
    element.getAttribute("aria-hidden") === "true"
  ) {
    return false
  }

  const rect = element.getBoundingClientRect()

  return rect.width >= MIN_TARGET_SIZE && rect.height >= MIN_TARGET_SIZE
}

export const isSelectableElement = (element: Element) => {
  if (!element.isConnected || isAgentUIElement(element)) {
    return false
  }

  const tagName = element.tagName.toLowerCase()

  if (tagName === "html" || tagName === "body") {
    return false
  }

  return isVisibleElement(element)
}

export const hasPointerEvents = (element: Element) => {
  return window.getComputedStyle(element).pointerEvents !== "none"
}

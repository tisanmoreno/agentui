const getKeyboardTargetElement = (target: EventTarget | null) => {
  if (target instanceof Element) {
    return target
  }

  if (target instanceof Text) {
    return target.parentElement
  }

  return null
}

export const isTypingInEditableTarget = (target: EventTarget | null) => {
  const element = getKeyboardTargetElement(target)

  if (!element) {
    return false
  }

  if (
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement ||
    element instanceof HTMLSelectElement
  ) {
    return true
  }

  if (element instanceof HTMLElement && element.isContentEditable) {
    return true
  }

  return Boolean(element.closest('[contenteditable]:not([contenteditable="false"])'))
}

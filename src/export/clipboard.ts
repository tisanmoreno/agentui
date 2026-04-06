const createClipboardTextarea = (text: string) => {
  const textarea = document.createElement("textarea")
  textarea.value = text
  textarea.setAttribute("readonly", "true")
  textarea.setAttribute("aria-hidden", "true")
  textarea.style.position = "fixed"
  textarea.style.top = "0"
  textarea.style.left = "0"
  textarea.style.opacity = "0"
  textarea.style.pointerEvents = "none"

  return textarea
}

const copyWithExecCommand = (text: string) => {
  if (typeof document === "undefined") {
    throw new Error("Clipboard copy is not available in this environment")
  }

  const textarea = createClipboardTextarea(text)
  const activeElement = document.activeElement as HTMLElement | null
  const selection = document.getSelection()
  const selectedRange = selection?.rangeCount ? selection.getRangeAt(0).cloneRange() : null

  ;(document.body ?? document.documentElement).append(textarea)
  textarea.focus()
  textarea.select()

  const wasCopied = document.execCommand("copy")

  textarea.remove()

  if (selection) {
    selection.removeAllRanges()

    if (selectedRange) {
      selection.addRange(selectedRange)
    }
  }

  activeElement?.focus()

  if (!wasCopied) {
    throw new Error("Clipboard copy failed")
  }
}

export const copyTextToClipboard = async (text: string) => {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return
    } catch {
      // Fall back to execCommand-based copying below.
    }
  }

  copyWithExecCommand(text)
}

const getElementIndex = (element: Element) => {
  const siblings = Array.from(element.parentElement?.children ?? []).filter(
    (candidate) => candidate.tagName === element.tagName
  )

  return siblings.indexOf(element) + 1
}

export const buildElementSelector = (element: Element) => {
  if (element.id) {
    return `#${CSS.escape(element.id)}`
  }

  const path: string[] = []
  let current: Element | null = element

  while (current && path.length < 4) {
    const segment = current.tagName.toLowerCase()
    const index = getElementIndex(current)

    path.unshift(`${segment}:nth-of-type(${index})`)
    current = current.parentElement
  }

  return path.join(" > ")
}

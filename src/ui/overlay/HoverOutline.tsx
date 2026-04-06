import type { CSSProperties } from "react"

import type { RectSnapshot } from "~src/features/annotations/types"

const baseStyle: CSSProperties = {
  position: "fixed",
  borderRadius: "10px",
  border: "2px solid rgba(37, 99, 235, 0.95)",
  background: "rgba(59, 130, 246, 0.08)",
  boxShadow: "0 0 0 1px rgba(191, 219, 254, 0.55), 0 0 0 8px rgba(59, 130, 246, 0.12)",
  pointerEvents: "none",
  transition: "transform 80ms ease, width 80ms ease, height 80ms ease"
}

interface HoverOutlineProps {
  rect: RectSnapshot | null
}

export const HoverOutline = ({ rect }: HoverOutlineProps) => {
  if (!rect) {
    return null
  }

  return (
    <div
      aria-hidden
      style={{
        ...baseStyle,
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height
      }}
    />
  )
}

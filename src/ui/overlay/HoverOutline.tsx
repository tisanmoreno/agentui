import type { CSSProperties } from "react"

import type { RectSnapshot } from "~src/features/annotations/types"

const hoverStyle: CSSProperties = {
  position: "fixed",
  borderRadius: "10px",
  border: "2px solid rgba(37, 99, 235, 0.95)",
  background: "rgba(59, 130, 246, 0.08)",
  boxShadow: "0 0 0 1px rgba(191, 219, 254, 0.55), 0 0 0 8px rgba(59, 130, 246, 0.12)",
  pointerEvents: "none",
  transition: "transform 80ms ease, width 80ms ease, height 80ms ease"
}

const revealStyle: CSSProperties = {
  ...hoverStyle,
  border: "3px solid rgba(96, 165, 250, 0.98)",
  background: "rgba(59, 130, 246, 0.14)",
  boxShadow: "0 0 0 1px rgba(191, 219, 254, 0.78), 0 0 0 12px rgba(59, 130, 246, 0.18)"
}

interface HoverOutlineProps {
  rect: RectSnapshot | null
  variant?: "hover" | "reveal"
}

export const HoverOutline = ({ rect, variant = "hover" }: HoverOutlineProps) => {
  if (!rect) {
    return null
  }

  return (
    <div
      aria-hidden
      style={{
        ...(variant === "reveal" ? revealStyle : hoverStyle),
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height
      }}
    />
  )
}

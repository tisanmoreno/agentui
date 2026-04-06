import type { CSSProperties } from "react"

import { ToolbarPlaceholder } from "~src/ui/toolbar/ToolbarPlaceholder"

const wrapperStyle: CSSProperties = {
  position: "fixed",
  top: "16px",
  right: "16px",
  zIndex: 2147483647,
  pointerEvents: "none"
}

export const OverlayShell = () => {
  return (
    <div style={wrapperStyle}>
      <ToolbarPlaceholder />
    </div>
  )
}

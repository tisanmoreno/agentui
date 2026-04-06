import type { CSSProperties } from "react"

import type { MarkerPosition } from "~src/features/annotations/hooks/useMarkerPositions"

const markerStyle: CSSProperties = {
  position: "fixed",
  width: "28px",
  height: "28px",
  borderRadius: "999px",
  border: "1px solid rgba(147, 197, 253, 0.72)",
  background: "rgba(37, 99, 235, 0.96)",
  boxShadow: "0 10px 20px rgba(15, 23, 42, 0.28)",
  color: "#eff6ff",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "12px",
  fontWeight: 800,
  cursor: "pointer",
  pointerEvents: "auto"
}

const activeMarkerStyle: CSSProperties = {
  ...markerStyle,
  background: "#1d4ed8",
  boxShadow: "0 0 0 3px rgba(96, 165, 250, 0.28), 0 10px 20px rgba(15, 23, 42, 0.28)"
}

export interface MarkerProps {
  active?: boolean
  label: string
  number: number
  position: MarkerPosition
  onClick: () => void
}

export const Marker = ({
  active = false,
  label,
  number,
  position,
  onClick
}: MarkerProps) => {
  return (
    <button
      aria-label={`Edit annotation ${number}: ${label}`}
      onClick={(event) => {
        event.stopPropagation()
        onClick()
      }}
      style={{
        ...(active ? activeMarkerStyle : markerStyle),
        top: position.top,
        left: position.left
      }}
      title={label}
      type="button">
      {number}
    </button>
  )
}

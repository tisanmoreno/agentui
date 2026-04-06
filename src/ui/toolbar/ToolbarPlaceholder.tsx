import type { CSSProperties } from "react"

const toolbarStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "10px 12px",
  borderRadius: "999px",
  border: "1px solid rgba(255, 255, 255, 0.12)",
  background: "rgba(17, 24, 39, 0.92)",
  boxShadow: "0 12px 32px rgba(15, 23, 42, 0.35)",
  color: "#f8fafc",
  fontFamily:
    'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  pointerEvents: "auto"
}

const badgeStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "4px 8px",
  borderRadius: "999px",
  background: "rgba(59, 130, 246, 0.16)",
  color: "#bfdbfe",
  fontSize: "12px",
  fontWeight: 600,
  letterSpacing: "0.02em"
}

const labelStyle: CSSProperties = {
  fontSize: "13px",
  fontWeight: 600,
  whiteSpace: "nowrap"
}

const buttonStyle: CSSProperties = {
  border: "none",
  borderRadius: "999px",
  padding: "6px 10px",
  background: "rgba(255, 255, 255, 0.08)",
  color: "rgba(248, 250, 252, 0.72)",
  fontSize: "12px",
  fontWeight: 600,
  cursor: "not-allowed"
}

export const ToolbarPlaceholder = () => {
  return (
    <div aria-label="AgentUI toolbar placeholder" style={toolbarStyle}>
      <span style={badgeStyle}>AgentUI</span>
      <span style={labelStyle}>Toolbar foundation loaded</span>
      <button disabled style={buttonStyle} type="button">
        Annotate
      </button>
      <button disabled style={buttonStyle} type="button">
        Export
      </button>
    </div>
  )
}

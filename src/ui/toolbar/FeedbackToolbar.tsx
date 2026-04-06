import type { CSSProperties } from "react"

const toolbarStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  flexWrap: "wrap",
  maxWidth: "min(calc(100vw - 32px), 720px)",
  padding: "10px 12px",
  borderRadius: "20px",
  border: "1px solid rgba(148, 163, 184, 0.24)",
  background: "rgba(15, 23, 42, 0.94)",
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
  background: "rgba(59, 130, 246, 0.18)",
  color: "#bfdbfe",
  fontSize: "12px",
  fontWeight: 700,
  letterSpacing: "0.02em"
}

const metaStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "2px",
  minWidth: "0",
  flex: "1 1 auto"
}

const titleStyle: CSSProperties = {
  fontSize: "13px",
  fontWeight: 700,
  whiteSpace: "nowrap"
}

const statusStyle: CSSProperties = {
  fontSize: "12px",
  color: "rgba(226, 232, 240, 0.72)",
  whiteSpace: "nowrap"
}

const actionsStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  flexWrap: "wrap",
  justifyContent: "flex-end"
}

const baseButtonStyle: CSSProperties = {
  border: "1px solid transparent",
  borderRadius: "999px",
  padding: "7px 12px",
  fontSize: "12px",
  fontWeight: 700,
  cursor: "pointer",
  transition: "background-color 120ms ease, color 120ms ease, border-color 120ms ease"
}

const primaryButtonStyle: CSSProperties = {
  ...baseButtonStyle,
  background: "#2563eb",
  borderColor: "rgba(96, 165, 250, 0.7)",
  color: "#eff6ff"
}

const neutralButtonStyle: CSSProperties = {
  ...baseButtonStyle,
  background: "rgba(255, 255, 255, 0.08)",
  borderColor: "rgba(148, 163, 184, 0.24)",
  color: "#f8fafc"
}

const secondaryButtonStyle: CSSProperties = {
  ...baseButtonStyle,
  background: "rgba(255, 255, 255, 0.06)",
  borderColor: "rgba(148, 163, 184, 0.24)",
  color: "#e2e8f0"
}

const activeSecondaryButtonStyle: CSSProperties = {
  ...secondaryButtonStyle,
  borderColor: "rgba(96, 165, 250, 0.7)",
  background: "rgba(37, 99, 235, 0.18)",
  color: "#dbeafe"
}

const disabledButtonStyle: CSSProperties = {
  ...secondaryButtonStyle,
  color: "rgba(248, 250, 252, 0.56)",
  cursor: "not-allowed"
}

interface FeedbackToolbarProps {
  annotationCount: number
  canCopyAnnotations: boolean
  feedbackModeEnabled: boolean
  panelOpen: boolean
  onCopyCompact: () => void
  onCopyDetailed: () => void
  onToggleFeedbackMode: () => void
  onTogglePanel: () => void
}

export const FeedbackToolbar = ({
  annotationCount,
  canCopyAnnotations,
  feedbackModeEnabled,
  panelOpen,
  onCopyCompact,
  onCopyDetailed,
  onToggleFeedbackMode,
  onTogglePanel
}: FeedbackToolbarProps) => {
  const countLabel = annotationCount === 1 ? "1 note" : `${annotationCount} notes`
  const copyButtonStyle = canCopyAnnotations ? primaryButtonStyle : disabledButtonStyle
  const detailedButtonStyle = canCopyAnnotations ? secondaryButtonStyle : disabledButtonStyle

  return (
    <div aria-label="AgentUI toolbar" style={toolbarStyle}>
      <span style={badgeStyle}>AgentUI</span>
      <div style={metaStyle}>
        <span style={titleStyle}>Feedback capture</span>
        <span style={statusStyle}>
          {feedbackModeEnabled ? "Feedback mode on" : "Feedback mode off"} · {countLabel}
        </span>
      </div>
      <div style={actionsStyle}>
        <button
          aria-pressed={feedbackModeEnabled}
          onClick={onToggleFeedbackMode}
          style={feedbackModeEnabled ? primaryButtonStyle : neutralButtonStyle}
          title="Toggle feedback mode (Alt+Shift+A)"
          type="button">
          {feedbackModeEnabled ? "Stop annotating" : "Start annotating"}
        </button>
        <button
          aria-expanded={panelOpen}
          onClick={onTogglePanel}
          style={panelOpen ? activeSecondaryButtonStyle : secondaryButtonStyle}
          type="button">
          {panelOpen ? "Hide annotations" : "Show annotations"}
        </button>
        <button
          aria-disabled={!canCopyAnnotations}
          disabled={!canCopyAnnotations}
          onClick={onCopyCompact}
          style={copyButtonStyle}
          title="Copy compact feedback (Alt+Shift+C)"
          type="button">
          Copy compact
        </button>
        <button
          aria-disabled={!canCopyAnnotations}
          disabled={!canCopyAnnotations}
          onClick={onCopyDetailed}
          style={detailedButtonStyle}
          title="Copy detailed feedback"
          type="button">
          Copy detailed
        </button>
      </div>
    </div>
  )
}

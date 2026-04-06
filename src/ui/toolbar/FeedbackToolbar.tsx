import type { CSSProperties } from "react"

const toolbarStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: "12px",
  width: "fit-content",
  maxWidth: "calc(100vw - 32px)",
  padding: "12px 14px",
  borderRadius: "22px",
  border: "1px solid rgba(148, 163, 184, 0.24)",
  background: "rgba(15, 23, 42, 0.95)",
  boxShadow: "0 16px 36px rgba(15, 23, 42, 0.34)",
  color: "#f8fafc",
  fontFamily:
    'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  pointerEvents: "auto"
}

const headerRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  flexWrap: "wrap",
  minWidth: 0
}

const badgeStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "4px 10px",
  borderRadius: "999px",
  background: "rgba(59, 130, 246, 0.16)",
  color: "#bfdbfe",
  fontSize: "12px",
  fontWeight: 800,
  letterSpacing: "0.02em"
}

const metaStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "3px",
  minWidth: 0
}

const titleStyle: CSSProperties = {
  fontSize: "13px",
  fontWeight: 800,
  lineHeight: 1.3
}

const statusStyle: CSSProperties = {
  fontSize: "12px",
  color: "rgba(226, 232, 240, 0.72)",
  lineHeight: 1.35
}

const actionsRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  flexWrap: "wrap"
}

const actionGroupStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  flexWrap: "wrap",
  padding: "4px",
  borderRadius: "16px",
  border: "1px solid rgba(148, 163, 184, 0.14)",
  background: "rgba(255, 255, 255, 0.04)"
}

const baseButtonStyle: CSSProperties = {
  border: "1px solid transparent",
  borderRadius: "999px",
  padding: "8px 14px",
  fontSize: "12px",
  fontWeight: 700,
  cursor: "pointer",
  transition:
    "background-color 120ms ease, color 120ms ease, border-color 120ms ease, box-shadow 120ms ease"
}

const primaryButtonStyle: CSSProperties = {
  ...baseButtonStyle,
  background: "#2563eb",
  borderColor: "rgba(96, 165, 250, 0.72)",
  boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.04) inset",
  color: "#eff6ff"
}

const activePrimaryButtonStyle: CSSProperties = {
  ...primaryButtonStyle,
  background: "#1d4ed8"
}

const secondaryButtonStyle: CSSProperties = {
  ...baseButtonStyle,
  background: "rgba(255, 255, 255, 0.08)",
  borderColor: "rgba(148, 163, 184, 0.22)",
  color: "#f8fafc"
}

const activeSecondaryButtonStyle: CSSProperties = {
  ...secondaryButtonStyle,
  borderColor: "rgba(96, 165, 250, 0.72)",
  background: "rgba(37, 99, 235, 0.18)",
  color: "#dbeafe"
}

const utilityButtonStyle: CSSProperties = {
  ...baseButtonStyle,
  padding: "7px 12px",
  background: "rgba(255, 255, 255, 0.02)",
  borderColor: "rgba(148, 163, 184, 0.18)",
  color: "#dbeafe"
}

const successButtonStyle: CSSProperties = {
  ...baseButtonStyle,
  padding: "7px 12px",
  background: "rgba(22, 163, 74, 0.18)",
  borderColor: "rgba(74, 222, 128, 0.46)",
  boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.04) inset",
  color: "#dcfce7"
}

const disabledUtilityButtonStyle: CSSProperties = {
  ...utilityButtonStyle,
  color: "rgba(248, 250, 252, 0.52)",
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
  const compactButtonStyle = canCopyAnnotations ? utilityButtonStyle : disabledUtilityButtonStyle
  const detailedButtonStyle = canCopyAnnotations ? successButtonStyle : disabledUtilityButtonStyle

  return (
    <div aria-label="AgentUI toolbar" style={toolbarStyle}>
      <div style={headerRowStyle}>
        <span style={badgeStyle}>AgentUI</span>
        <div style={metaStyle}>
          <span style={titleStyle}>Feedback capture</span>
          <span style={statusStyle}>
            {feedbackModeEnabled ? "Feedback mode on" : "Feedback mode off"} · {countLabel}
          </span>
        </div>
      </div>

      <div style={actionsRowStyle}>
        <div style={actionGroupStyle}>
          <button
            aria-pressed={feedbackModeEnabled}
            onClick={onToggleFeedbackMode}
            style={feedbackModeEnabled ? activePrimaryButtonStyle : primaryButtonStyle}
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
        </div>

        <div style={actionGroupStyle}>
          <button
            aria-disabled={!canCopyAnnotations}
            disabled={!canCopyAnnotations}
            onClick={onCopyCompact}
            style={compactButtonStyle}
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
    </div>
  )
}

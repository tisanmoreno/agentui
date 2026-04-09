import type { CSSProperties, PointerEventHandler } from "react"

const toolbarStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
  gap: "10px",
  width: "fit-content",
  maxWidth: "calc(100vw - 24px)",
  padding: "10px 12px",
  borderRadius: "18px",
  border: "1px solid rgba(148, 163, 184, 0.24)",
  background: "rgba(15, 23, 42, 0.95)",
  boxShadow: "0 16px 36px rgba(15, 23, 42, 0.34)",
  color: "#f8fafc",
  fontFamily:
    'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  pointerEvents: "auto"
}

const minimizedToolbarStyle: CSSProperties = {
  ...toolbarStyle,
  flexDirection: "row",
  alignItems: "center",
  gap: "8px",
  padding: "8px 10px"
}

const headerRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "10px",
  minWidth: 0
}

const dragHandleStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  minWidth: 0,
  cursor: "grab",
  userSelect: "none",
  touchAction: "none"
}

const draggingHandleStyle: CSSProperties = {
  ...dragHandleStyle,
  cursor: "grabbing"
}

const handleGlyphStyle: CSSProperties = {
  fontSize: "13px",
  letterSpacing: "-0.18em",
  color: "rgba(226, 232, 240, 0.52)",
  lineHeight: 1
}

const badgeStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "3px 9px",
  borderRadius: "999px",
  background: "rgba(59, 130, 246, 0.16)",
  color: "#bfdbfe",
  fontSize: "11px",
  fontWeight: 800,
  letterSpacing: "0.02em",
  whiteSpace: "nowrap"
}

const metaStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "2px",
  minWidth: 0
}

const titleStyle: CSSProperties = {
  fontSize: "12px",
  fontWeight: 800,
  lineHeight: 1.25
}

const statusStyle: CSSProperties = {
  fontSize: "11px",
  color: "rgba(226, 232, 240, 0.72)",
  lineHeight: 1.35
}

const headerActionsStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  flexShrink: 0
}

const actionsRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  flexWrap: "wrap"
}

const actionGroupStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  flexWrap: "wrap",
  padding: "3px",
  borderRadius: "14px",
  border: "1px solid rgba(148, 163, 184, 0.14)",
  background: "rgba(255, 255, 255, 0.04)"
}

const baseButtonStyle: CSSProperties = {
  border: "1px solid transparent",
  borderRadius: "999px",
  padding: "7px 12px",
  fontSize: "11px",
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
  padding: "6px 10px",
  background: "rgba(255, 255, 255, 0.02)",
  borderColor: "rgba(148, 163, 184, 0.18)",
  color: "#dbeafe"
}

const successButtonStyle: CSSProperties = {
  ...baseButtonStyle,
  padding: "6px 10px",
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

const iconButtonStyle: CSSProperties = {
  ...baseButtonStyle,
  width: "30px",
  height: "30px",
  padding: 0,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(255, 255, 255, 0.04)",
  borderColor: "rgba(148, 163, 184, 0.18)",
  color: "rgba(226, 232, 240, 0.88)"
}

const minimizedSummaryStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  minWidth: 0
}

const modePillStyle = (active: boolean): CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  padding: "3px 8px",
  borderRadius: "999px",
  fontSize: "11px",
  fontWeight: 700,
  background: active ? "rgba(37, 99, 235, 0.18)" : "rgba(255, 255, 255, 0.06)",
  color: active ? "#dbeafe" : "rgba(226, 232, 240, 0.82)",
  whiteSpace: "nowrap"
})

interface FeedbackToolbarProps {
  annotationCount: number
  canCopyAnnotations: boolean
  dragging: boolean
  feedbackModeEnabled: boolean
  minimized: boolean
  panelOpen: boolean
  onCopyCompact: () => void
  onCopyDetailed: () => void
  onStartDrag: PointerEventHandler<HTMLDivElement>
  onToggleFeedbackMode: () => void
  onToggleMinimized: () => void
  onTogglePanel: () => void
}

export const FeedbackToolbar = ({
  annotationCount,
  canCopyAnnotations,
  dragging,
  feedbackModeEnabled,
  minimized,
  panelOpen,
  onCopyCompact,
  onCopyDetailed,
  onStartDrag,
  onToggleFeedbackMode,
  onToggleMinimized,
  onTogglePanel
}: FeedbackToolbarProps) => {
  const countLabel = annotationCount === 1 ? "1 note" : `${annotationCount} notes`
  const compactButtonStyle = canCopyAnnotations ? utilityButtonStyle : disabledUtilityButtonStyle
  const detailedButtonStyle = canCopyAnnotations ? successButtonStyle : disabledUtilityButtonStyle
  const resolvedDragHandleStyle = dragging ? draggingHandleStyle : dragHandleStyle

  if (minimized) {
    return (
      <div aria-label="AgentUI toolbar" style={minimizedToolbarStyle}>
        <div onPointerDown={onStartDrag} style={resolvedDragHandleStyle}>
          <span aria-hidden style={handleGlyphStyle}>
            ⋮⋮
          </span>
          <div style={minimizedSummaryStyle}>
            <span style={badgeStyle}>AgentUI</span>
            <span style={modePillStyle(feedbackModeEnabled)}>
              {feedbackModeEnabled ? "Mode on" : "Mode off"}
            </span>
            <span style={statusStyle}>{countLabel}</span>
          </div>
        </div>
        <button
          aria-label="Expand toolbar"
          onClick={onToggleMinimized}
          style={iconButtonStyle}
          title="Expand toolbar"
          type="button">
          +
        </button>
      </div>
    )
  }

  return (
    <div aria-label="AgentUI toolbar" style={toolbarStyle}>
      <div style={headerRowStyle}>
        <div onPointerDown={onStartDrag} style={resolvedDragHandleStyle}>
          <span aria-hidden style={handleGlyphStyle}>
            ⋮⋮
          </span>
          <span style={badgeStyle}>AgentUI</span>
          <div style={metaStyle}>
            <span style={titleStyle}>Feedback capture</span>
            <span style={statusStyle}>
              {feedbackModeEnabled ? "Feedback mode on" : "Feedback mode off"} · {countLabel}
            </span>
          </div>
        </div>

        <div style={headerActionsStyle}>
          <button
            aria-label="Minimize toolbar"
            onClick={onToggleMinimized}
            style={iconButtonStyle}
            title="Minimize toolbar"
            type="button">
            −
          </button>
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
            {feedbackModeEnabled ? "Stop" : "Start"}
          </button>
          <button
            aria-expanded={panelOpen}
            onClick={onTogglePanel}
            style={panelOpen ? activeSecondaryButtonStyle : secondaryButtonStyle}
            type="button">
            {panelOpen ? "Hide notes" : "Show notes"}
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
            Compact
          </button>
          <button
            aria-disabled={!canCopyAnnotations}
            disabled={!canCopyAnnotations}
            onClick={onCopyDetailed}
            style={detailedButtonStyle}
            title="Copy detailed feedback"
            type="button">
            Detailed
          </button>
        </div>
      </div>
    </div>
  )
}

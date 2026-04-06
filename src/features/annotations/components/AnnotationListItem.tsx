import type { CSSProperties } from "react"

import type { ResolvedAnnotation } from "~src/features/annotations/hooks/useMarkerPositions"

const itemStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  padding: "14px",
  borderRadius: "16px",
  border: "1px solid rgba(148, 163, 184, 0.16)",
  background: "rgba(15, 23, 42, 0.72)"
}

const activeItemStyle: CSSProperties = {
  ...itemStyle,
  borderColor: "rgba(96, 165, 250, 0.7)",
  boxShadow: "0 0 0 1px rgba(59, 130, 246, 0.18) inset"
}

const headerRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: "12px"
}

const orderBadgeStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: "28px",
  height: "28px",
  padding: "0 8px",
  borderRadius: "999px",
  background: "rgba(37, 99, 235, 0.18)",
  color: "#bfdbfe",
  fontSize: "12px",
  fontWeight: 800,
  flexShrink: 0
}

const summaryStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  minWidth: 0,
  flex: 1
}

const metaRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  flexWrap: "wrap"
}

const pillStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "4px 8px",
  borderRadius: "999px",
  background: "rgba(59, 130, 246, 0.16)",
  color: "#dbeafe",
  fontSize: "11px",
  fontWeight: 700,
  textTransform: "capitalize"
}

const unresolvedBadgeStyle: CSSProperties = {
  ...pillStyle,
  background: "rgba(248, 113, 113, 0.14)",
  color: "#fecaca"
}

const labelStyle: CSSProperties = {
  fontSize: "13px",
  fontWeight: 700,
  color: "#f8fafc",
  overflowWrap: "anywhere"
}

const selectorStyle: CSSProperties = {
  fontSize: "11px",
  color: "rgba(191, 219, 254, 0.8)",
  overflowWrap: "anywhere"
}

const feedbackStyle: CSSProperties = {
  margin: 0,
  fontSize: "12px",
  lineHeight: 1.5,
  color: "rgba(226, 232, 240, 0.88)",
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden"
}

const footerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "12px"
}

const statusStyle: CSSProperties = {
  fontSize: "11px",
  color: "rgba(226, 232, 240, 0.6)"
}

const actionsStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  flexWrap: "wrap",
  justifyContent: "flex-end"
}

const buttonStyle: CSSProperties = {
  borderRadius: "999px",
  border: "1px solid rgba(148, 163, 184, 0.18)",
  background: "rgba(255, 255, 255, 0.06)",
  color: "#e2e8f0",
  padding: "6px 10px",
  fontSize: "11px",
  fontWeight: 700,
  cursor: "pointer"
}

const destructiveButtonStyle: CSSProperties = {
  ...buttonStyle,
  color: "#fecaca",
  borderColor: "rgba(248, 113, 113, 0.24)",
  background: "rgba(127, 29, 29, 0.16)"
}

const disabledButtonStyle: CSSProperties = {
  ...buttonStyle,
  opacity: 0.45,
  cursor: "not-allowed"
}

interface AnnotationListItemProps {
  active: boolean
  annotationCount: number
  resolvedAnnotation: ResolvedAnnotation
  onDelete: () => void
  onEdit: () => void
  onMoveDown: () => void
  onMoveUp: () => void
  onReveal: () => void
}

export const AnnotationListItem = ({
  active,
  annotationCount,
  resolvedAnnotation,
  onDelete,
  onEdit,
  onMoveDown,
  onMoveUp,
  onReveal
}: AnnotationListItemProps) => {
  const { annotation, index, unresolved } = resolvedAnnotation
  const targetLabel =
    annotation.target.label ?? annotation.target.selector ?? "Saved target"

  return (
    <li style={active ? activeItemStyle : itemStyle}>
      <div style={headerRowStyle}>
        <span style={orderBadgeStyle}>{index + 1}</span>
        <div style={summaryStyle}>
          <div style={metaRowStyle}>
            {annotation.tag ? <span style={pillStyle}>{annotation.tag}</span> : null}
            {unresolved ? <span style={unresolvedBadgeStyle}>Unresolved</span> : null}
          </div>
          <div style={labelStyle}>{targetLabel}</div>
          {annotation.target.selector ? (
            <div style={selectorStyle}>{annotation.target.selector}</div>
          ) : null}
          <p style={feedbackStyle}>{annotation.feedback}</p>
        </div>
      </div>
      <div style={footerStyle}>
        <span style={statusStyle}>
          {unresolved ? "Target unavailable on this page" : "Target available on page"}
        </span>
        <div style={actionsStyle}>
          <button
            disabled={unresolved}
            onClick={onReveal}
            style={unresolved ? disabledButtonStyle : buttonStyle}
            type="button">
            Reveal
          </button>
          <button onClick={onMoveUp} style={index === 0 ? disabledButtonStyle : buttonStyle} type="button" disabled={index === 0}>
            Up
          </button>
          <button
            disabled={index === annotationCount - 1}
            onClick={onMoveDown}
            style={index === annotationCount - 1 ? disabledButtonStyle : buttonStyle}
            type="button">
            Down
          </button>
          <button onClick={onEdit} style={buttonStyle} type="button">
            Edit
          </button>
          <button onClick={onDelete} style={destructiveButtonStyle} type="button">
            Delete
          </button>
        </div>
      </div>
    </li>
  )
}

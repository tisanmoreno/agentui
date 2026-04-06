import type { CSSProperties, ReactNode } from "react"

import type { ResolvedAnnotation } from "~src/features/annotations/hooks/useMarkerPositions"

const itemStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  padding: "15px",
  borderRadius: "18px",
  border: "1px solid rgba(148, 163, 184, 0.16)",
  background: "rgba(15, 23, 42, 0.76)"
}

const activeItemStyle: CSSProperties = {
  ...itemStyle,
  borderColor: "rgba(96, 165, 250, 0.72)",
  boxShadow: "0 0 0 1px rgba(59, 130, 246, 0.18) inset"
}

const metaRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  flexWrap: "wrap"
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

const pillStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "4px 9px",
  borderRadius: "999px",
  background: "rgba(59, 130, 246, 0.16)",
  color: "#dbeafe",
  fontSize: "11px",
  fontWeight: 700,
  textTransform: "capitalize"
}

const statusBadgeStyle: CSSProperties = {
  ...pillStyle,
  background: "rgba(148, 163, 184, 0.14)",
  color: "rgba(226, 232, 240, 0.82)"
}

const unresolvedBadgeStyle: CSSProperties = {
  ...pillStyle,
  background: "rgba(248, 113, 113, 0.14)",
  color: "#fecaca"
}

const titleStyle: CSSProperties = {
  fontSize: "14px",
  fontWeight: 800,
  lineHeight: 1.4,
  color: "#f8fafc",
  overflowWrap: "anywhere",
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden"
}

const selectorBlockStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "4px",
  padding: "9px 10px",
  borderRadius: "12px",
  border: "1px solid rgba(148, 163, 184, 0.12)",
  background: "rgba(255, 255, 255, 0.03)"
}

const selectorLabelStyle: CSSProperties = {
  fontSize: "10px",
  fontWeight: 700,
  letterSpacing: "0.03em",
  textTransform: "uppercase",
  color: "rgba(148, 163, 184, 0.74)"
}

const selectorStyle: CSSProperties = {
  fontSize: "11px",
  lineHeight: 1.5,
  color: "rgba(191, 219, 254, 0.72)",
  fontFamily:
    'ui-monospace, SFMono-Regular, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  whiteSpace: "normal",
  overflowWrap: "anywhere"
}

const feedbackStyle: CSSProperties = {
  margin: 0,
  fontSize: "12px",
  lineHeight: 1.6,
  color: "rgba(226, 232, 240, 0.9)",
  display: "-webkit-box",
  WebkitLineClamp: 3,
  WebkitBoxOrient: "vertical",
  overflow: "hidden"
}

const footerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "10px"
}

const actionsStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px"
}

const moveGroupStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  padding: "3px",
  borderRadius: "999px",
  border: "1px solid rgba(148, 163, 184, 0.16)",
  background: "rgba(255, 255, 255, 0.03)"
}

const baseIconButtonStyle: CSSProperties = {
  width: "34px",
  height: "34px",
  borderRadius: "999px",
  border: "1px solid rgba(148, 163, 184, 0.18)",
  background: "rgba(255, 255, 255, 0.04)",
  color: "#e2e8f0",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 0,
  cursor: "pointer"
}

const primaryIconButtonStyle: CSSProperties = {
  ...baseIconButtonStyle,
  borderColor: "rgba(96, 165, 250, 0.56)",
  background: "rgba(37, 99, 235, 0.16)",
  color: "#dbeafe"
}

const destructiveIconButtonStyle: CSSProperties = {
  ...baseIconButtonStyle,
  borderColor: "rgba(248, 113, 113, 0.24)",
  background: "rgba(127, 29, 29, 0.16)",
  color: "#fecaca"
}

const disabledButtonStyle: CSSProperties = {
  ...baseIconButtonStyle,
  opacity: 0.45,
  cursor: "not-allowed"
}

type AnnotationActionIconName = "eye" | "edit" | "trash" | "up" | "down"

const iconStyle: CSSProperties = {
  width: "15px",
  height: "15px",
  display: "block"
}

const AnnotationActionIcon = ({ name }: { name: AnnotationActionIconName }) => {
  const commonProps = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.8,
    viewBox: "0 0 24 24"
  }

  switch (name) {
    case "eye":
      return (
        <svg aria-hidden style={iconStyle} {...commonProps}>
          <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )
    case "edit":
      return (
        <svg aria-hidden style={iconStyle} {...commonProps}>
          <path d="M4 20h4l10-10-4-4L4 16v4Z" />
          <path d="m12 6 4 4" />
        </svg>
      )
    case "trash":
      return (
        <svg aria-hidden style={iconStyle} {...commonProps}>
          <path d="M4 7h16" />
          <path d="M10 3h4" />
          <path d="M6 7l1 13h10l1-13" />
          <path d="M10 11v5" />
          <path d="M14 11v5" />
        </svg>
      )
    case "up":
      return (
        <svg aria-hidden style={iconStyle} {...commonProps}>
          <path d="m6 15 6-6 6 6" />
        </svg>
      )
    case "down":
      return (
        <svg aria-hidden style={iconStyle} {...commonProps}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      )
  }
}

interface IconButtonProps {
  ariaLabel: string
  children: ReactNode
  disabled?: boolean
  onClick: () => void
  style: CSSProperties
  title: string
}

const IconButton = ({
  ariaLabel,
  children,
  disabled = false,
  onClick,
  style,
  title
}: IconButtonProps) => {
  return (
    <button
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      style={disabled ? disabledButtonStyle : style}
      title={title}
      type="button">
      {children}
    </button>
  )
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
  const { annotation, displayLabel, index, unresolved } = resolvedAnnotation
  const targetLabel = displayLabel?.trim() || annotation.target.selector || "Saved target"
  const selector =
    annotation.target.selector && annotation.target.selector !== targetLabel
      ? annotation.target.selector
      : null

  return (
    <li style={active ? activeItemStyle : itemStyle}>
      <div style={metaRowStyle}>
        <span style={orderBadgeStyle}>{index + 1}</span>
        {annotation.tag ? <span style={pillStyle}>{annotation.tag}</span> : null}
        <span style={unresolved ? unresolvedBadgeStyle : statusBadgeStyle}>
          {unresolved ? "Missing" : "On page"}
        </span>
      </div>

      <div style={titleStyle}>{targetLabel}</div>

      {selector ? (
        <div style={selectorBlockStyle}>
          <span style={selectorLabelStyle}>Target</span>
          <div style={selectorStyle}>{selector}</div>
        </div>
      ) : null}

      <p style={feedbackStyle}>{annotation.feedback}</p>

      <div style={footerStyle}>
        <div style={actionsStyle}>
          <IconButton
            ariaLabel={`Show annotation ${index + 1} on page`}
            disabled={unresolved}
            onClick={onReveal}
            style={baseIconButtonStyle}
            title="Show on page">
            <AnnotationActionIcon name="eye" />
          </IconButton>
          <IconButton
            ariaLabel={`Edit annotation ${index + 1}`}
            onClick={onEdit}
            style={primaryIconButtonStyle}
            title="Edit annotation">
            <AnnotationActionIcon name="edit" />
          </IconButton>
          <IconButton
            ariaLabel={`Delete annotation ${index + 1}`}
            onClick={onDelete}
            style={destructiveIconButtonStyle}
            title="Delete annotation">
            <AnnotationActionIcon name="trash" />
          </IconButton>
        </div>

        <div style={moveGroupStyle}>
          <IconButton
            ariaLabel={`Move annotation ${index + 1} up`}
            disabled={index === 0}
            onClick={onMoveUp}
            style={baseIconButtonStyle}
            title="Move up">
            <AnnotationActionIcon name="up" />
          </IconButton>
          <IconButton
            ariaLabel={`Move annotation ${index + 1} down`}
            disabled={index === annotationCount - 1}
            onClick={onMoveDown}
            style={baseIconButtonStyle}
            title="Move down">
            <AnnotationActionIcon name="down" />
          </IconButton>
        </div>
      </div>
    </li>
  )
}

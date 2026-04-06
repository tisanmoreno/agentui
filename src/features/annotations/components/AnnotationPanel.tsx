import { useEffect, useMemo, useState, type CSSProperties } from "react"

import { TOOLBAR_OFFSET } from "~src/shared/constants"

import { AnnotationListItem } from "~src/features/annotations/components/AnnotationListItem"
import type { ResolvedAnnotation } from "~src/features/annotations/hooks/useMarkerPositions"

const panelStyle: CSSProperties = {
  position: "fixed",
  right: TOOLBAR_OFFSET,
  width: "min(380px, calc(100vw - 32px))",
  display: "flex",
  flexDirection: "column",
  gap: "14px",
  padding: "16px",
  borderRadius: "22px",
  border: "1px solid rgba(148, 163, 184, 0.18)",
  background: "rgba(15, 23, 42, 0.96)",
  boxShadow: "0 20px 48px rgba(15, 23, 42, 0.38)",
  color: "#f8fafc",
  fontFamily:
    'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  pointerEvents: "auto",
  overflow: "hidden"
}

const headerStyle: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: "12px"
}

const titleWrapStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "4px"
}

const titleStyle: CSSProperties = {
  fontSize: "15px",
  fontWeight: 800
}

const subtitleStyle: CSSProperties = {
  fontSize: "12px",
  lineHeight: 1.45,
  color: "rgba(226, 232, 240, 0.7)"
}

const controlsRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "10px",
  flexWrap: "wrap"
}

const controlsLeftStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  flexWrap: "wrap"
}

const baseButtonStyle: CSSProperties = {
  borderRadius: "999px",
  border: "1px solid rgba(148, 163, 184, 0.18)",
  background: "rgba(255, 255, 255, 0.06)",
  color: "#e2e8f0",
  padding: "8px 12px",
  fontSize: "12px",
  fontWeight: 700,
  cursor: "pointer"
}

const subtleButtonStyle: CSSProperties = {
  ...baseButtonStyle,
  background: "rgba(255, 255, 255, 0.03)"
}

const iconButtonStyle: CSSProperties = {
  width: "34px",
  height: "34px",
  borderRadius: "999px",
  border: "1px solid rgba(148, 163, 184, 0.18)",
  background: "rgba(255, 255, 255, 0.03)",
  color: "#e2e8f0",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 0,
  cursor: "pointer"
}

const tertiaryButtonStyle: CSSProperties = {
  ...baseButtonStyle,
  padding: "6px 10px",
  fontSize: "11px",
  fontWeight: 600,
  borderColor: "rgba(148, 163, 184, 0.1)",
  background: "rgba(255, 255, 255, 0.015)",
  color: "rgba(226, 232, 240, 0.78)"
}

const activeButtonStyle: CSSProperties = {
  ...tertiaryButtonStyle,
  borderColor: "rgba(96, 165, 250, 0.2)",
  background: "rgba(37, 99, 235, 0.05)",
  color: "rgba(191, 219, 254, 0.92)"
}

const tertiaryDestructiveButtonStyle: CSSProperties = {
  ...tertiaryButtonStyle,
  color: "rgba(254, 202, 202, 0.72)",
  borderColor: "rgba(248, 113, 113, 0.1)",
  background: "rgba(127, 29, 29, 0.03)"
}

const destructiveButtonStyle: CSSProperties = {
  ...baseButtonStyle,
  color: "#fecaca",
  borderColor: "rgba(248, 113, 113, 0.22)",
  background: "rgba(127, 29, 29, 0.16)"
}

const listStyle: CSSProperties = {
  listStyle: "none",
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  margin: 0,
  padding: 0,
  overflowY: "auto"
}

const emptyStateStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  padding: "20px",
  borderRadius: "18px",
  border: "1px dashed rgba(148, 163, 184, 0.2)",
  background: "rgba(15, 23, 42, 0.55)"
}

const emptyTitleStyle: CSSProperties = {
  fontSize: "13px",
  fontWeight: 700,
  color: "#f8fafc"
}

const emptyBodyStyle: CSSProperties = {
  fontSize: "12px",
  lineHeight: 1.55,
  color: "rgba(226, 232, 240, 0.72)"
}

const clearConfirmStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "10px",
  padding: "12px",
  borderRadius: "16px",
  background: "rgba(127, 29, 29, 0.18)",
  border: "1px solid rgba(248, 113, 113, 0.22)"
}

const clearConfirmTextStyle: CSSProperties = {
  fontSize: "12px",
  lineHeight: 1.45,
  color: "#fecaca"
}

const clearConfirmActionsStyle: CSSProperties = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap",
  justifyContent: "flex-end"
}

const closeIconStyle: CSSProperties = {
  width: "16px",
  height: "16px",
  display: "block"
}

const CloseIcon = () => (
  <svg
    aria-hidden
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    style={closeIconStyle}
    viewBox="0 0 24 24">
    <path d="M6 6l12 12" />
    <path d="M18 6 6 18" />
  </svg>
)

interface AnnotationPanelProps {
  activeAnnotationId: string | null
  annotations: ResolvedAnnotation[]
  markersVisible: boolean
  open: boolean
  topOffset: number
  onClearAnnotations: () => void
  onClose: () => void
  onDeleteAnnotation: (annotationId: string) => void
  onEditAnnotation: (annotationId: string) => void
  onMoveAnnotation: (fromIndex: number, toIndex: number) => void
  onRevealAnnotation: (annotationId: string) => void
  onToggleMarkers: () => void
}

export const AnnotationPanel = ({
  activeAnnotationId,
  annotations,
  markersVisible,
  open,
  topOffset,
  onClearAnnotations,
  onClose,
  onDeleteAnnotation,
  onEditAnnotation,
  onMoveAnnotation,
  onRevealAnnotation,
  onToggleMarkers
}: AnnotationPanelProps) => {
  const [confirmingClearAll, setConfirmingClearAll] = useState(false)
  const annotationCount = annotations.length

  useEffect(() => {
    if (!open) {
      setConfirmingClearAll(false)
    }
  }, [open])

  const hasAnnotations = annotationCount > 0
  const resolvedPanelStyle = useMemo<CSSProperties>(
    () => ({
      ...panelStyle,
      top: topOffset,
      maxHeight: `calc(100vh - ${Math.round(topOffset + TOOLBAR_OFFSET)}px)`
    }),
    [topOffset]
  )

  const subtitle = useMemo(() => {
    if (!hasAnnotations) {
      return "Saved annotations will appear here."
    }

    return annotationCount === 1
      ? "1 annotation on this page"
      : `${annotationCount} annotations on this page`
  }, [annotationCount, hasAnnotations])

  if (!open) {
    return null
  }

  return (
    <aside aria-label="Saved annotations" style={resolvedPanelStyle}>
      <div style={headerStyle}>
        <div style={titleWrapStyle}>
          <span style={titleStyle}>Annotations</span>
          <span style={subtitleStyle}>{subtitle}</span>
        </div>
        <button aria-label="Close annotations" onClick={onClose} style={iconButtonStyle} type="button">
          <CloseIcon />
        </button>
      </div>

      <div style={controlsRowStyle}>
        <div style={controlsLeftStyle}>
          <button
            onClick={onToggleMarkers}
            style={markersVisible ? activeButtonStyle : tertiaryButtonStyle}
            type="button">
            {markersVisible ? "Hide markers" : "Show markers"}
          </button>
        </div>
        {hasAnnotations && !confirmingClearAll ? (
          <button
            onClick={() => setConfirmingClearAll(true)}
            style={tertiaryDestructiveButtonStyle}
            type="button">
            Clear all
          </button>
        ) : null}
      </div>

      {hasAnnotations && confirmingClearAll ? (
        <div style={clearConfirmStyle}>
          <span style={clearConfirmTextStyle}>Clear all annotations on this page?</span>
          <div style={clearConfirmActionsStyle}>
            <button onClick={() => setConfirmingClearAll(false)} style={subtleButtonStyle} type="button">
              Cancel
            </button>
            <button
              onClick={() => {
                setConfirmingClearAll(false)
                onClearAnnotations()
              }}
              style={destructiveButtonStyle}
              type="button">
              Clear all
            </button>
          </div>
        </div>
      ) : null}

      {hasAnnotations ? (
        <ol style={listStyle}>
          {annotations.map((resolvedAnnotation) => (
            <AnnotationListItem
              active={resolvedAnnotation.annotation.id === activeAnnotationId}
              annotationCount={annotationCount}
              key={resolvedAnnotation.annotation.id}
              onDelete={() => onDeleteAnnotation(resolvedAnnotation.annotation.id)}
              onEdit={() => onEditAnnotation(resolvedAnnotation.annotation.id)}
              onMoveDown={() =>
                onMoveAnnotation(resolvedAnnotation.index, resolvedAnnotation.index + 1)
              }
              onMoveUp={() =>
                onMoveAnnotation(resolvedAnnotation.index, resolvedAnnotation.index - 1)
              }
              onReveal={() => onRevealAnnotation(resolvedAnnotation.annotation.id)}
              resolvedAnnotation={resolvedAnnotation}
            />
          ))}
        </ol>
      ) : (
        <div style={emptyStateStyle}>
          <span style={emptyTitleStyle}>No saved annotations yet</span>
          <span style={emptyBodyStyle}>
            Start annotating the page to capture feedback. Notes will appear here in order,
            and their marker numbers will stay in sync with the list.
          </span>
        </div>
      )}
    </aside>
  )
}

import { useEffect, useMemo, useState, type CSSProperties } from "react"

import { TOOLBAR_OFFSET } from "~src/shared/constants"

import { AnnotationListItem } from "~src/features/annotations/components/AnnotationListItem"
import type { ResolvedAnnotation } from "~src/features/annotations/hooks/useMarkerPositions"

const panelStyle: CSSProperties = {
  position: "fixed",
  top: TOOLBAR_OFFSET + 68,
  right: TOOLBAR_OFFSET,
  width: "min(360px, calc(100vw - 32px))",
  maxHeight: "calc(100vh - 96px)",
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  padding: "16px",
  borderRadius: "20px",
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
  color: "rgba(226, 232, 240, 0.68)"
}

const headerActionsStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  flexWrap: "wrap",
  justifyContent: "flex-end"
}

const buttonStyle: CSSProperties = {
  borderRadius: "999px",
  border: "1px solid rgba(148, 163, 184, 0.18)",
  background: "rgba(255, 255, 255, 0.06)",
  color: "#e2e8f0",
  padding: "8px 12px",
  fontSize: "12px",
  fontWeight: 700,
  cursor: "pointer"
}

const activeButtonStyle: CSSProperties = {
  ...buttonStyle,
  borderColor: "rgba(96, 165, 250, 0.7)",
  background: "rgba(37, 99, 235, 0.18)",
  color: "#dbeafe"
}

const destructiveButtonStyle: CSSProperties = {
  ...buttonStyle,
  color: "#fecaca",
  borderColor: "rgba(248, 113, 113, 0.22)",
  background: "rgba(127, 29, 29, 0.16)"
}

const listStyle: CSSProperties = {
  listStyle: "none",
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  margin: 0,
  padding: 0,
  overflowY: "auto"
}

const emptyStateStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "6px",
  padding: "20px",
  borderRadius: "16px",
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
  lineHeight: 1.5,
  color: "rgba(226, 232, 240, 0.72)"
}

const clearConfirmStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "8px",
  padding: "10px 12px",
  borderRadius: "14px",
  background: "rgba(127, 29, 29, 0.18)",
  border: "1px solid rgba(248, 113, 113, 0.22)"
}

const clearConfirmTextStyle: CSSProperties = {
  fontSize: "12px",
  color: "#fecaca"
}

const clearConfirmActionsStyle: CSSProperties = {
  display: "flex",
  gap: "8px"
}

const SCROLL_OFFSET = 96

interface AnnotationPanelProps {
  activeAnnotationId: string | null
  annotations: ResolvedAnnotation[]
  markersVisible: boolean
  open: boolean
  onClearAnnotations: () => void
  onClose: () => void
  onDeleteAnnotation: (annotationId: string) => void
  onEditAnnotation: (annotationId: string) => void
  onMoveAnnotation: (fromIndex: number, toIndex: number) => void
  onToggleMarkers: () => void
}

export const AnnotationPanel = ({
  activeAnnotationId,
  annotations,
  markersVisible,
  open,
  onClearAnnotations,
  onClose,
  onDeleteAnnotation,
  onEditAnnotation,
  onMoveAnnotation,
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
    <aside aria-label="Saved annotations" style={panelStyle}>
      <div style={headerStyle}>
        <div style={titleWrapStyle}>
          <span style={titleStyle}>Annotations</span>
          <span style={subtitleStyle}>{subtitle}</span>
        </div>
        <div style={headerActionsStyle}>
          <button
            onClick={onToggleMarkers}
            style={markersVisible ? activeButtonStyle : buttonStyle}
            type="button">
            {markersVisible ? "Hide markers" : "Show markers"}
          </button>
          <button onClick={onClose} style={buttonStyle} type="button">
            Close
          </button>
        </div>
      </div>

      {hasAnnotations ? (
        confirmingClearAll ? (
          <div style={clearConfirmStyle}>
            <span style={clearConfirmTextStyle}>Clear all annotations on this page?</span>
            <div style={clearConfirmActionsStyle}>
              <button onClick={() => setConfirmingClearAll(false)} style={buttonStyle} type="button">
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
        ) : (
          <div style={headerActionsStyle}>
            <button
              onClick={() => setConfirmingClearAll(true)}
              style={destructiveButtonStyle}
              type="button">
              Clear all
            </button>
          </div>
        )
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
              onReveal={() => {
                if (!resolvedAnnotation.element) {
                  return
                }

                const rect = resolvedAnnotation.element.getBoundingClientRect()
                const nextTop = Math.max(0, window.scrollY + rect.top - SCROLL_OFFSET)

                window.scrollTo({
                  top: nextTop,
                  behavior: "smooth"
                })
              }}
              resolvedAnnotation={resolvedAnnotation}
            />
          ))}
        </ol>
      ) : (
        <div style={emptyStateStyle}>
          <span style={emptyTitleStyle}>No saved annotations yet</span>
          <span style={emptyBodyStyle}>
            Start annotating the page to save feedback. Saved items will stay ordered here,
            and their marker numbers will follow the same order.
          </span>
        </div>
      )}
    </aside>
  )
}

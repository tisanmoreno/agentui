import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties
} from "react"

import { ANNOTATION_TAGS } from "~src/features/annotations/types"
import { usePopoverPosition } from "~src/ui/overlay/usePopoverPosition"

import type {
  AnnotationTag,
  RectSnapshot
} from "~src/features/annotations/types"

const popoverStyle: CSSProperties = {
  position: "fixed",
  width: "min(340px, calc(100vw - 24px))",
  padding: "16px",
  borderRadius: "16px",
  border: "1px solid rgba(148, 163, 184, 0.24)",
  background: "rgba(15, 23, 42, 0.98)",
  boxShadow: "0 20px 48px rgba(15, 23, 42, 0.4)",
  color: "#f8fafc",
  fontFamily:
    'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  pointerEvents: "auto"
}

const headerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "4px",
  marginBottom: "12px"
}

const titleStyle: CSSProperties = {
  fontSize: "15px",
  fontWeight: 700
}

const subtitleStyle: CSSProperties = {
  fontSize: "12px",
  color: "rgba(226, 232, 240, 0.68)"
}

const fieldStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "6px",
  marginBottom: "12px"
}

const labelStyle: CSSProperties = {
  fontSize: "12px",
  fontWeight: 700,
  color: "#cbd5e1"
}

const selectStyle: CSSProperties = {
  borderRadius: "10px",
  border: "1px solid rgba(148, 163, 184, 0.24)",
  background: "rgba(30, 41, 59, 0.96)",
  color: "#f8fafc",
  padding: "10px 12px",
  fontSize: "13px"
}

const textareaStyle: CSSProperties = {
  minHeight: "108px",
  resize: "vertical",
  borderRadius: "12px",
  border: "1px solid rgba(148, 163, 184, 0.24)",
  background: "rgba(30, 41, 59, 0.96)",
  color: "#f8fafc",
  padding: "12px",
  fontSize: "13px",
  lineHeight: 1.5
}

const footerStyle: CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "8px"
}

const secondaryButtonStyle: CSSProperties = {
  borderRadius: "999px",
  border: "1px solid rgba(148, 163, 184, 0.24)",
  background: "rgba(255, 255, 255, 0.06)",
  color: "#e2e8f0",
  padding: "8px 12px",
  fontSize: "12px",
  fontWeight: 700,
  cursor: "pointer"
}

const primaryButtonStyle: CSSProperties = {
  borderRadius: "999px",
  border: "1px solid rgba(96, 165, 250, 0.72)",
  background: "#2563eb",
  color: "#eff6ff",
  padding: "8px 12px",
  fontSize: "12px",
  fontWeight: 700,
  cursor: "pointer"
}

const disabledPrimaryButtonStyle: CSSProperties = {
  ...primaryButtonStyle,
  background: "rgba(37, 99, 235, 0.35)",
  borderColor: "rgba(96, 165, 250, 0.25)",
  color: "rgba(239, 246, 255, 0.7)",
  cursor: "not-allowed"
}

interface AnnotationPopoverProps {
  open: boolean
  mode: "create" | "edit"
  anchorRect: RectSnapshot | null
  targetLabel?: string | null
  initialValue?: {
    tag: AnnotationTag | null
    feedback: string
  }
  onSave: (input: { tag: AnnotationTag | null; feedback: string }) => void
  onCancel: () => void
}

export const AnnotationPopover = ({
  open,
  mode,
  anchorRect,
  targetLabel = null,
  initialValue,
  onSave,
  onCancel
}: AnnotationPopoverProps) => {
  const [tag, setTag] = useState<AnnotationTag | null>(initialValue?.tag ?? null)
  const [feedback, setFeedback] = useState(initialValue?.feedback ?? "")
  const [popoverElement, setPopoverElement] = useState<HTMLDivElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const titleId = useId()
  const feedbackFieldId = useId()
  const position = usePopoverPosition({ anchorRect, open, popoverElement })

  useEffect(() => {
    if (!open) {
      return
    }

    setTag(initialValue?.tag ?? null)
    setFeedback(initialValue?.feedback ?? "")
  }, [initialValue?.feedback, initialValue?.tag, open])

  useEffect(() => {
    if (!open) {
      return
    }

    textareaRef.current?.focus()
  }, [open])

  const isSaveDisabled = useMemo(() => feedback.trim().length === 0, [feedback])

  if (!open || !anchorRect) {
    return null
  }

  const handleSubmit = () => {
    const trimmedFeedback = feedback.trim()

    if (!trimmedFeedback) {
      textareaRef.current?.focus()
      return
    }

    onSave({
      tag,
      feedback: trimmedFeedback
    })
  }

  return (
    <div
      aria-labelledby={titleId}
      onClick={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
      ref={setPopoverElement}
      role="dialog"
      style={{
        ...popoverStyle,
        top: position.top,
        left: position.left
      }}>
      <div style={headerStyle}>
        <span id={titleId} style={titleStyle}>
          {mode === "edit" ? "Edit feedback" : "Add feedback"}
        </span>
        <span style={subtitleStyle}>{targetLabel ?? "Selected element"}</span>
      </div>
      <label style={fieldStyle}>
        <span style={labelStyle}>Tag (optional)</span>
        <select
          onChange={(event) => {
            const value = event.target.value as AnnotationTag | ""
            setTag(value || null)
          }}
          style={selectStyle}
          value={tag ?? ""}>
          <option value="">No tag</option>
          {ANNOTATION_TAGS.map((annotationTag) => (
            <option key={annotationTag} value={annotationTag}>
              {annotationTag}
            </option>
          ))}
        </select>
      </label>
      <label style={fieldStyle}>
        <span id={feedbackFieldId} style={labelStyle}>
          Feedback
        </span>
        <textarea
          onChange={(event) => setFeedback(event.target.value)}
          placeholder="Describe the UI issue or improvement"
          ref={textareaRef}
          rows={5}
          style={textareaStyle}
          value={feedback}
        />
      </label>
      <div style={footerStyle}>
        <button onClick={onCancel} style={secondaryButtonStyle} type="button">
          Cancel
        </button>
        <button
          disabled={isSaveDisabled}
          onClick={handleSubmit}
          style={isSaveDisabled ? disabledPrimaryButtonStyle : primaryButtonStyle}
          type="button">
          Save
        </button>
      </div>
    </div>
  )
}

import type { CSSProperties } from "react"

export type ToastTone = "success" | "error" | "info"

export interface ToastItem {
  id: string
  message: string
  tone: ToastTone
}

const viewportStyle: CSSProperties = {
  position: "fixed",
  right: "16px",
  bottom: "16px",
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  gap: "8px",
  pointerEvents: "none"
}

const baseToastStyle: CSSProperties = {
  minWidth: "220px",
  maxWidth: "min(360px, calc(100vw - 32px))",
  padding: "10px 12px",
  borderRadius: "14px",
  border: "1px solid rgba(148, 163, 184, 0.24)",
  boxShadow: "0 16px 40px rgba(15, 23, 42, 0.28)",
  color: "#f8fafc",
  background: "rgba(15, 23, 42, 0.96)",
  fontFamily:
    'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  fontSize: "12px",
  fontWeight: 600,
  lineHeight: 1.4
}

const toastStyleByTone: Record<ToastTone, CSSProperties> = {
  success: {
    borderColor: "rgba(74, 222, 128, 0.4)",
    background: "rgba(20, 83, 45, 0.96)",
    color: "#dcfce7"
  },
  error: {
    borderColor: "rgba(248, 113, 113, 0.38)",
    background: "rgba(127, 29, 29, 0.96)",
    color: "#fee2e2"
  },
  info: {
    borderColor: "rgba(96, 165, 250, 0.35)",
    background: "rgba(30, 41, 59, 0.96)",
    color: "#e2e8f0"
  }
}

interface ToastRegionProps {
  toasts: ToastItem[]
}

export const ToastRegion = ({ toasts }: ToastRegionProps) => {
  if (toasts.length === 0) {
    return null
  }

  return (
    <div aria-atomic="true" aria-live="polite" style={viewportStyle}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          style={{
            ...baseToastStyle,
            ...toastStyleByTone[toast.tone]
          }}>
          {toast.message}
        </div>
      ))}
    </div>
  )
}

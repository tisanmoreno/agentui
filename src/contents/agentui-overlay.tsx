import type { PlasmoCSConfig } from "plasmo"

import { OverlayShell } from "~src/ui/overlay/OverlayShell"

const ROOT_CONTAINER_ID = "agentui-overlay-root"

export const config: PlasmoCSConfig = {
  matches: ["http://*/*", "https://*/*"],
  run_at: "document_idle"
}

export const getRootContainer = () => {
  const existingRoot = document.getElementById(ROOT_CONTAINER_ID)

  if (existingRoot) {
    return existingRoot
  }

  const rootContainer = document.createElement("div")
  rootContainer.id = ROOT_CONTAINER_ID
  document.documentElement.append(rootContainer)

  return rootContainer
}

const AgentUIOverlay = () => <OverlayShell />

export default AgentUIOverlay

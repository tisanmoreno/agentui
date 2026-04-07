import { DEFAULT_OVERLAY_VISIBLE } from "~src/shared/constants"
import {
  GET_OVERLAY_VISIBILITY_MESSAGE,
  SET_OVERLAY_VISIBILITY_MESSAGE,
  type GetOverlayVisibilityResponse,
  type SetOverlayVisibilityMessage
} from "~src/shared/messages"

const OVERLAY_VISIBILITY_BY_TAB_KEY = "agentui:overlay-visibility-by-tab"
const ACTION_ICON_SIZES = [16, 32, 48, 128] as const
const ACTIVE_OUTER_ICON_COLOR = "#316ae8"
const ACTIVE_INNER_ICON_COLOR = "#b5cdf4"
const INACTIVE_OUTER_ICON_COLOR = "#8f96a3"
const INACTIVE_INNER_ICON_COLOR = "#d6d9df"

type OverlayVisibilityByTab = Record<string, boolean>

const overlayVisibilityStorage = chrome.storage.session ?? chrome.storage.local

const isSupportedPageUrl = (url?: string) =>
  typeof url === "string" && (url.startsWith("http://") || url.startsWith("https://"))

const createActionIconImageData = (size: number, visible: boolean) => {
  const canvas = new OffscreenCanvas(size, size)
  const context = canvas.getContext("2d")

  if (!context) {
    throw new Error("AgentUI: failed to create action icon canvas context")
  }

  const outerInset = Math.round(size * 0.125)
  const outerSize = size - outerInset * 2
  const innerInset = Math.round(size * 0.3125)
  const innerSize = size - innerInset * 2

  context.clearRect(0, 0, size, size)
  context.fillStyle = visible ? ACTIVE_OUTER_ICON_COLOR : INACTIVE_OUTER_ICON_COLOR
  context.fillRect(outerInset, outerInset, outerSize, outerSize)
  context.fillStyle = visible ? ACTIVE_INNER_ICON_COLOR : INACTIVE_INNER_ICON_COLOR
  context.fillRect(innerInset, innerInset, innerSize, innerSize)

  return context.getImageData(0, 0, size, size)
}

const createActionIconSet = (visible: boolean) =>
  Object.fromEntries(
    ACTION_ICON_SIZES.map((size) => [size, createActionIconImageData(size, visible)])
  ) as Record<number, ImageData>

const activeActionIconSet = createActionIconSet(true)
const inactiveActionIconSet = createActionIconSet(false)

const setActionIconForTab = async (tabId: number, visible: boolean) => {
  await chrome.action.setIcon({
    tabId,
    imageData: visible ? activeActionIconSet : inactiveActionIconSet
  })
}

const getOverlayVisibilityByTab = async (): Promise<OverlayVisibilityByTab> => {
  const result = await overlayVisibilityStorage.get(OVERLAY_VISIBILITY_BY_TAB_KEY)

  return (
    (result[OVERLAY_VISIBILITY_BY_TAB_KEY] as OverlayVisibilityByTab | undefined) ?? {}
  )
}

const getOverlayVisibilityForTab = async (tabId: number) => {
  const visibilityByTab = await getOverlayVisibilityByTab()

  return visibilityByTab[String(tabId)] ?? DEFAULT_OVERLAY_VISIBLE
}

const setOverlayVisibilityForTab = async (tabId: number, visible: boolean) => {
  const visibilityByTab = await getOverlayVisibilityByTab()

  visibilityByTab[String(tabId)] = visible

  await overlayVisibilityStorage.set({
    [OVERLAY_VISIBILITY_BY_TAB_KEY]: visibilityByTab
  })
}

const removeOverlayVisibilityForTab = async (tabId: number) => {
  const visibilityByTab = await getOverlayVisibilityByTab()
  const tabKey = String(tabId)

  if (!(tabKey in visibilityByTab)) {
    return
  }

  delete visibilityByTab[tabKey]

  await overlayVisibilityStorage.set({
    [OVERLAY_VISIBILITY_BY_TAB_KEY]: visibilityByTab
  })
}

const syncActionIconForTab = async (tabId: number, url?: string) => {
  if (!isSupportedPageUrl(url)) {
    await setActionIconForTab(tabId, false)
    return
  }

  const visible = await getOverlayVisibilityForTab(tabId)
  await setActionIconForTab(tabId, visible)
}

chrome.action.onClicked.addListener((tab) => {
  if (typeof tab.id !== "number") {
    return
  }

  void (async () => {
    try {
      if (!isSupportedPageUrl(tab.url)) {
        await setActionIconForTab(tab.id, false)
        return
      }

      const nextVisible = !(await getOverlayVisibilityForTab(tab.id))

      await setOverlayVisibilityForTab(tab.id, nextVisible)
      await setActionIconForTab(tab.id, nextVisible)

      const message: SetOverlayVisibilityMessage = {
        type: SET_OVERLAY_VISIBILITY_MESSAGE,
        visible: nextVisible
      }

      chrome.tabs.sendMessage(tab.id, message, () => {
        const runtimeError = chrome.runtime.lastError

        if (runtimeError) {
          console.debug(
            `AgentUI: overlay visibility update deferred for tab ${tab.id}: ${runtimeError.message}`
          )
        }
      })
    } catch (error) {
      console.error("AgentUI: failed to toggle overlay visibility", error)
    }
  })()
})

chrome.runtime.onMessage.addListener((message: unknown, sender, sendResponse) => {
  if (
    !message ||
    typeof message !== "object" ||
    (message as { type?: string }).type !== GET_OVERLAY_VISIBILITY_MESSAGE
  ) {
    return
  }

  void (async () => {
    try {
      const visible =
        typeof sender.tab?.id === "number"
          ? await getOverlayVisibilityForTab(sender.tab.id)
          : DEFAULT_OVERLAY_VISIBLE

      if (typeof sender.tab?.id === "number") {
        await setActionIconForTab(sender.tab.id, visible)
      }

      const response: GetOverlayVisibilityResponse = { visible }
      sendResponse(response)
    } catch (error) {
      console.error("AgentUI: failed to resolve overlay visibility", error)
      sendResponse({ visible: DEFAULT_OVERLAY_VISIBLE } satisfies GetOverlayVisibilityResponse)
    }
  })()

  return true
})

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!changeInfo.url && changeInfo.status !== "loading") {
    return
  }

  void syncActionIconForTab(tabId, changeInfo.url ?? tab.url)
})

chrome.tabs.onRemoved.addListener((tabId) => {
  void removeOverlayVisibilityForTab(tabId)
})

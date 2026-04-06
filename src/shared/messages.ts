export const GET_OVERLAY_VISIBILITY_MESSAGE = "agentui:get-overlay-visibility"
export const SET_OVERLAY_VISIBILITY_MESSAGE = "agentui:set-overlay-visibility"

export interface GetOverlayVisibilityMessage {
  type: typeof GET_OVERLAY_VISIBILITY_MESSAGE
}

export interface SetOverlayVisibilityMessage {
  type: typeof SET_OVERLAY_VISIBILITY_MESSAGE
  visible: boolean
}

export interface GetOverlayVisibilityResponse {
  visible: boolean
}

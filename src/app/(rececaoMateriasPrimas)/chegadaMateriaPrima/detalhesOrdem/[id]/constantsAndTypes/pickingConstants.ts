export const WEBSOCKET_URL = "ws://localhost:8080/pickagem";

export const PICKING_STATES = {
  SUCCESS: 'success',
  ALERT: 'alert',
  ERROR: 'error'
} as const;

export type PickingStateType = typeof PICKING_STATES[keyof typeof PICKING_STATES];

export const SAP_CONFIG = {
  BASE_TYPE: 22,
  DATE_FORMAT: "yyyyMMdd"
} as const;

export const PICKING_STATUS_CONFIG = {
  success: {
    icon: "BadgeCheck",
    color: "#2EA64C",
    message: "Pickagem Realizada!"
  },
  alert: {
    icon: "BadgeAlert",
    color: "#FFCC2D",
    message: "Este item já foi pickado!"
  },
  error: {
    icon: "BadgeX",
    color: "#DE2C37",
    message: "Este item não existe nesta ordem!"
  }
} as const;
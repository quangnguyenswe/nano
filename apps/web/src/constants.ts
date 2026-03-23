
export const STORAGE_KEYS = {
  LOCAL_STORAGE_CHATS: "nano_local_storage_chat",
  IDB_MESSAGES: "nano_idb_messages",
} as const;

export const UI_THEME_KEY = "nano_ui_theme";

export const PANEL_WIDTH = {
  DEFAULT: 320,
  MIN: 290,
  /** Maximum is 30% of viewport, enforced dynamically */
  MAX_PERCENTAGE: 0.3,
} as const
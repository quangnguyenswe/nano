
export const STORAGE_KEYS = {
  LOCAL_STORAGE_CHATS: "nano_local_storage_chat",
  IDB_MESSAGES: "nano_idb_messages",

  VERSION_DATA_STATE: "version-dataState",
  VERSION_FILES: "version-files",
} as const;

export const SAVE_TO_LOCAL_STORAGE_TIMEOUT = 300;

export const UI_THEME_KEY = "nano_ui_theme";

export const PANEL_WIDTH = {
  DEFAULT: 320,
  MIN: 290,
  /** Maximum is 30% of viewport, enforced dynamically */
  MAX_PERCENTAGE: 0.3,
} as const

export const IMAGE_MIME_TYPES = {
  svg: "image/svg+xml",
  png: "image/png",
  jpg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  bmp: "image/bmp",
  ico: "image/x-icon",
  avif: "image/avif",
  jfif: "image/jfif",
} as const;

export const STRING_MIME_TYPES = {
  text: "text/plain",
  html: "text/html",
  json: "application/json",
  // excalidraw data
  excalidraw: "application/vnd.excalidraw+json",
  excalidrawClipboard: "application/vnd.excalidraw.clipboard+json",
  // LEGACY: fully-qualified library JSON data
  excalidrawlib: "application/vnd.excalidrawlib+json",
  // list of excalidraw library item ids
  excalidrawlibIds: "application/vnd.excalidrawlib.ids+json",
} as const;

export const MIME_TYPES = {
  ...STRING_MIME_TYPES,
  // image-encoded excalidraw data
  "excalidraw.svg": "image/svg+xml",
  "excalidraw.png": "image/png",
  // binary
  binary: "application/octet-stream",
  // image
  ...IMAGE_MIME_TYPES,
} as const;

export const ALLOWED_PASTE_MIME_TYPES = [
  MIME_TYPES.text,
  MIME_TYPES.html,
  ...Object.values(IMAGE_MIME_TYPES),
] as const;

export const EXPORT_IMAGE_TYPES = {
  png: "png",
  svg: "svg",
  clipboard: "clipboard",
} as const;
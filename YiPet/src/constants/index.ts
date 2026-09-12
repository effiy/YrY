// App-level constants

/** YiAi backend base URL */
export const YIAI_BASE_URL: string = "http://localhost:10086";

/** YiVad admin dashboard URL (for cross-project bridge) */
export const YIVAD_URL: string = "http://localhost:8848";

/** Default model for chat */
export const DEFAULT_MODEL: string = "qwen3.5";

/** Project names (for cross-project tagging) */
export const PROJECTS: string[] = ["yiai", "yipet", "yivad", "yiknowledge"];

/** Display labels for project values */
export const PROJECT_LABELS: Record<string, string> = {
  yiai: "YiAi",
  yipet: "YiPet",
  yivad: "YiVad",
  yiknowledge: "YiKnowledge"
};

/** Default pet size in pixels */
export const DEFAULT_PET_SIZE: number = 120;

/** Default chat window dimensions */
export const DEFAULT_CHAT_WIDTH: number = 700;
export const DEFAULT_CHAT_HEIGHT: number = 720;

/** Storage keys */
export const STORAGE_KEYS = {
  GLOBAL_STATE: "pet_global_state",
  CHAT_WINDOW_STATE: "pet_chat_window_state",
  SETTINGS: "pet_settings",
  DEV_MODE: "pet_dev_mode",
  PROMPT_HISTORY: "promptHistory",
  SIDEBAR_WIDTH: "sidebarWidth"
} as const;

/** Knowledge base */
export const KNOWLEDGE_BASE_PATH = "~/YiKnowledge";
/**
 * YiPet default configuration and endpoint templates.
 * Pure data — no logic, no env detection.
 */

export interface PetSizeLimits { min: number; max: number }
export interface ChatSizeLimits { minWidth: number; maxWidth: number; minHeight: number; maxHeight: number }

export interface PetDefaults {
  pet: {
    defaultSize: number;
    defaultPosition: { x: number; y: string };
    defaultColorIndex: number;
    defaultVisible: boolean;
    colors: string[];
    sizeLimits: PetSizeLimits;
  };
  chatWindow: {
    defaultSize: { width: number; height: number };
    defaultPosition: { x: string; y: string };
    sizeLimits: ChatSizeLimits;
    input: { maxLength: number; placeholder: string };
    message: { maxLength: number; thinkingDelay: { min: number; max: number } };
  };
  animation: {
    pet: { floatDuration: number; blinkDuration: number; wagDuration: number };
    chatWindow: { transitionDuration: number; scaleEffect: number };
  };
  storage: {
    keys: { globalState: string; chatWindowState: string };
    syncInterval: number;
  };
  ui: {
    zIndex: { pet: number; chatWindow: number; resizeHandle: number; inputContainer: number; modal: number };
    borderRadius: { pet: string; chatWindow: string; input: string; button: string };
  };
  api: {
    streamPromptUrl: string;
    promptUrl: string;
    yiaiBaseUrl: string;
    faqApiUrl: string;
    syncSessionsToBackend: boolean;
  };
  chatModels: { default: string; models: unknown[] };
  env: {
    mode: 'production';
    flags: { debug: boolean; mockApi: boolean; telemetry: boolean };
    endpoints: Record<string, Record<string, string>>;
  };
  constants: {
    TIMING: Record<string, number>;
    RETRY: { MAX_RETRIES: number; INITIAL_DELAY: number };
    STORAGE: { MAX_REQUESTS: number; MAX_SESSION_SIZE: number; SYNC_INTERVAL: number };
    URLS: {
      CHROME_PROTOCOL: string;
      CHROME_EXTENSION_PROTOCOL: string;
      MOZ_EXTENSION_PROTOCOL: string;
      ABOUT_PROTOCOL: string;
      isSystemPage(url: string | null | undefined): boolean;
    };
    UI: Record<string, string | number>;
    ANIMATION: Record<string, string[]>;
    DEFAULTS: { PET_ROLE: string; VERSION: string };
    ERROR_MESSAGES: Record<string, string>;
    SUCCESS_MESSAGES: Record<string, string>;
    API: Record<string, number>;
    storageKeys: Record<string, string>;
    ids: Record<string, string>;
  };
}

export const PET_DEFAULTS: PetDefaults = {
  pet: {
    defaultSize: 260,
    defaultPosition: { x: 20, y: '20%' },
    defaultColorIndex: 0,
    defaultVisible: false,
    colors: [
      'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
      'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #6366f1 100%)',
      'linear-gradient(135deg, #22c55e 0%, #10b981 50%, #059669 100%)',
      'linear-gradient(135deg, #f59e0b 0%, #ec4899 50%, #a855f7 100%)',
    ],
    sizeLimits: { min: 80, max: 400 },
  },

  chatWindow: {
    defaultSize: { width: 700, height: 720 },
    defaultPosition: { x: 'center', y: '12%' },
    sizeLimits: { minWidth: 300, maxWidth: 10000, minHeight: 450, maxHeight: 10000 },
    input: { maxLength: 0, placeholder: 'Type a message...' },
    message: { maxLength: 0, thinkingDelay: { min: 1000, max: 2000 } },
  },

  animation: {
    pet: { floatDuration: 3000, blinkDuration: 4000, wagDuration: 2000 },
    chatWindow: { transitionDuration: 300, scaleEffect: 1.02 },
  },

  storage: {
    keys: { globalState: 'pet_global_state', chatWindowState: 'pet_chat_window_state' },
    syncInterval: 3000,
  },

  ui: {
    zIndex: { pet: 2147483647, chatWindow: 2147483648, resizeHandle: 20, inputContainer: 10, modal: 2147483649 },
    borderRadius: { pet: '50%', chatWindow: '16px', input: '25px', button: '25px' },
  },

  api: {
    streamPromptUrl: 'http://localhost:10086/prompt',
    promptUrl: 'http://localhost:10086/prompt/',
    yiaiBaseUrl: 'http://localhost:10086',
    faqApiUrl: 'http://localhost:10086',
    syncSessionsToBackend: true,
  },

  chatModels: { default: '', models: [] },

  env: {
    mode: 'production',
    flags: { debug: false, mockApi: false, telemetry: false },
    endpoints: {
      production: {
        streamPromptUrl: 'http://localhost:10086/prompt',
        promptUrl: 'http://localhost:10086/prompt/',
        yiaiBaseUrl: 'http://localhost:10086',
        faqApiUrl: 'http://localhost:10086',
      },
      staging: {
        streamPromptUrl: 'http://localhost:10086/prompt',
        promptUrl: 'http://localhost:10086/prompt/',
        yiaiBaseUrl: 'http://localhost:10086',
        faqApiUrl: 'http://localhost:10086',
      },
      development: {
        streamPromptUrl: 'http://localhost:10086/prompt',
        promptUrl: 'http://localhost:10086/prompt/',
        yiaiBaseUrl: 'http://localhost:10086',
        faqApiUrl: 'http://localhost:10086',
      },
    },
  },

  constants: {
    TIMING: {
      RETRY_DELAY: 500, STATUS_SYNC_INTERVAL: 5000, NOTIFICATION_DURATION: 3000,
      CONTENT_SCRIPT_WAIT: 1000, REQUEST_RETRY_DELAY: 500, QUOTA_CLEANUP_TIMEOUT: 60000,
      INJECT_PET_DELAY: 1000, REQUEST_DEDUP_WINDOW: 5000, REQUEST_CLEANUP_INTERVAL: 30000,
      REQUEST_CLEANUP_TIMEOUT: 60000, STORAGE_CLEANUP_INTERVAL: 86400000,
      STORAGE_CLEANUP_AGE: 604800000, SESSION_UPDATE_DEBOUNCE: 300,
      SESSION_SAVE_THROTTLE: 1000, SESSION_LIST_RELOAD_INTERVAL: 10000,
      STATE_SAVE_THROTTLE: 2000, AUTO_SCROLL_THRESHOLD_PX: 140,
      CHAT_BUBBLE_UPDATE_INTERVAL: 1500,
    },
    RETRY: { MAX_RETRIES: 3, INITIAL_DELAY: 500 },
    STORAGE: { MAX_REQUESTS: 1000, MAX_SESSION_SIZE: 50000, SYNC_INTERVAL: 60000 },
    URLS: {
      CHROME_PROTOCOL: 'chrome://',
      CHROME_EXTENSION_PROTOCOL: 'chrome-extension://',
      MOZ_EXTENSION_PROTOCOL: 'moz-extension://',
      ABOUT_PROTOCOL: 'about:',
      isSystemPage(url: string | null | undefined): boolean {
        if (!url || typeof url !== 'string') return false;
        return url.startsWith(this.CHROME_PROTOCOL)
          || url.startsWith(this.CHROME_EXTENSION_PROTOCOL)
          || url.startsWith(this.MOZ_EXTENSION_PROTOCOL)
          || url.startsWith(this.ABOUT_PROTOCOL);
      },
    },
    UI: {
      NOTIFICATION_TOP: 10,
      STATUS_DOT_ACTIVE: '#22c55e', STATUS_DOT_INACTIVE: '#f59e0b',
      NOTIFICATION_SUCCESS: '#22c55e', NOTIFICATION_ERROR: '#ef4444',
      NOTIFICATION_INFO: '#3b82f6',
      SIDEBAR_DEFAULT_WIDTH: 320, SIDEBAR_MIN_WIDTH: 320, SIDEBAR_MAX_WIDTH: 800,
      CHAT_WINDOW_DEFAULT_WIDTH: 850, CHAT_WINDOW_DEFAULT_HEIGHT: 720,
      TAG_FILTER_VISIBLE_COUNT: 8,
    },
    ANIMATION: {
      THINKING_ANIMATIONS: [
        'petThinking 0.8s ease-in-out infinite',
        'petThinkingBounce 1.2s ease-in-out infinite',
        'petThinkingPulse 1s ease-in-out infinite',
      ],
      THINKING_BUBBLE_TEXTS: [
        '🤔 Let me think...', '💭 Thinking...', '✨ Inspiration strikes...',
        '🌟 Organizing thoughts...', '🎯 Deep analysis...', '🔍 Searching for answers...',
        '💡 Idea incoming...', '🌊 Brainstorming...', '📝 Choosing words...',
        '🎨 Crafting reply...', '⚡ Almost there...', '🌈 Nearly ready...',
        '🚀 Coming right up...',
      ],
    },
    DEFAULTS: { PET_ROLE: 'Teacher', VERSION: '1.1.2' },
    ERROR_MESSAGES: {
      TAB_NOT_FOUND: 'Cannot get current tab', INIT_FAILED: 'Initialization failed',
      OPERATION_FAILED: 'Operation failed', CONTEXT_INVALIDATED: 'Extension context invalidated',
      QUOTA_EXCEEDED: 'Storage quota exceeded', RETRYING: 'Retrying...',
      RETRY_SUCCESS: 'Retry succeeded', RETRY_FAILED: 'Still failed after multiple attempts',
    },
    SUCCESS_MESSAGES: {
      SHOWN: 'Shown', HIDDEN: 'Hidden', COLOR_CHANGED: 'Color changed',
      COLOR_SET: 'Color theme set', SIZE_UPDATED: 'Size updated',
      POSITION_RESET: 'Position reset', CENTERED: 'Centered', ROLE_CHANGED: 'Role changed',
    },
    API: { MAX_WEWORK_CONTENT_LENGTH: 4096, MAX_WEWORK_CONTENT_TRUNCATE_MARGIN: 100 },
    storageKeys: {
      devMode: 'pet_dev_mode', globalState: 'pet_global_state',
      chatWindowState: 'pet_chat_window_state', settings: 'pet_settings',
    },
    ids: { assistantElement: 'chat_assistant_element' },
  },
};

export const PET_ENDPOINTS = {
  BASE_ENDPOINTS:     { API_BASE: '/api', V1_BASE: '/api/v1', V2_BASE: '/api/v2' },
  AUTH_ENDPOINTS:     { LOGIN: '/auth/login', LOGOUT: '/auth/logout', REFRESH: '/auth/refresh', PROFILE: '/auth/profile', VALIDATE: '/auth/validate' },
  SESSION_ENDPOINTS:  { LIST: '/sessions', CREATE: '/sessions', UPDATE: '/sessions/:id', DELETE: '/sessions/:id', BATCH_DELETE: '/sessions/batch', SEARCH: '/sessions/search', FAVORITES: '/sessions/favorites', EXPORT: '/sessions/export', IMPORT: '/sessions/import' },
  FAQ_ENDPOINTS:      { LIST: '/faqs', CREATE: '/faqs', UPDATE: '/faqs/:id', DELETE: '/faqs/:id', BATCH_UPDATE: '/faqs/batch', REORDER: '/faqs/reorder' },
  CONFIG_ENDPOINTS:   { GET: '/config', UPDATE: '/config', RESET: '/config/reset' },
  DATABASE_ENDPOINTS: { QUERY: '/database/query', CREATE: '/database/create', UPDATE: '/database/update', DELETE: '/database/delete', BATCH: '/database/batch' },
} as const;

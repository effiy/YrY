/**
 * Shared service references — injected once by the chat entry point,
 * consumed by all chat sub-stores.
 */
import type {
  ApiClient,
} from '@/api/client';
import type {
  ChatService, KnowledgeService, RagService, SearchService, SessionService, TranslationService, WeWorkService, DashboardService,
} from '@/api/services';

let _client: ApiClient | null = null;
let _chat: ChatService;
let _sessions: SessionService;
let _wework: WeWorkService;
let _search: SearchService;
let _rag: RagService;
let _knowledge: KnowledgeService;
let _translation: TranslationService;
let _dashboard: DashboardService;

export type NotifyType = 'info' | 'success' | 'error' | 'warning';

let _notifyHandler: ((message: string, type: NotifyType) => void) | null = null;

export function notify(message: string, type: NotifyType = 'info') {
  if (_notifyHandler) _notifyHandler(message, type);
}

export function setNotifyHandler(handler: (message: string, type: NotifyType) => void) {
  _notifyHandler = handler;
}

export function injectServices(services: {
  client: ApiClient;
  chat: ChatService; sessions: SessionService;
  wework: WeWorkService; search: SearchService;
  rag: RagService; knowledge: KnowledgeService;
  translation: TranslationService; dashboard: DashboardService;
}) {
  _client = services.client;
  _chat = services.chat;
  _sessions = services.sessions;
  _wework = services.wework;
  _search = services.search;
  _rag = services.rag;
  _knowledge = services.knowledge;
  _translation = services.translation;
  _dashboard = services.dashboard;
}

export function getClient(): ApiClient | null { return _client; }
export function getChat(): ChatService { return _chat; }
export function getSessions(): SessionService { return _sessions; }
export function getWework(): WeWorkService { return _wework; }
export function getSearch(): SearchService { return _search; }
export function getRag(): RagService { return _rag; }
export function getKnowledge(): KnowledgeService { return _knowledge; }
export function getTranslation(): TranslationService { return _translation; }
export function getDashboard(): DashboardService { return _dashboard; }
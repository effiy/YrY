/**
 * Service Worker Lifecycle State Machine — YP-09-12.
 *
 * Models the Chrome MV3 SW lifecycle as an explicit state machine with
 * checkpoint persistence, idempotent initialization, and graceful
 * version migration support.
 *
 * States: uninitialized → installing → waiting → activating → active → terminated
 */
import { logger } from '@/utils/log';

export type SwState =
  | 'uninitialized'
  | 'installing'
  | 'waiting'
  | 'activating'
  | 'active'
  | 'terminated';

interface SwCheckpoint {
  state: SwState;
  timestamp: number;
  version: string;
  activeConnections: number;
  queuedMessages: number;
}

const CHECKPOINT_KEY = 'yipet:sw-checkpoint';
const CHECKPOINT_INTERVAL_MS = 30_000;
const SW_VERSION = '1.2.0';

class SwLifecycleStateMachine {
  private _state: SwState = 'uninitialized';
  private _initialized = false;
  private _checkpointTimer: ReturnType<typeof setInterval> | null = null;
  private _activeConnections = 0;
  private _queuedMessages = 0;
  private _eventListeners = new Set<string>();

  get state(): SwState {
    return this._state;
  }

  get isActive(): boolean {
    return this._state === 'active';
  }

  /** Idempotent initialization — only registers listeners on first call. */
  async init(): Promise<void> {
    if (this._initialized) return;

    // Restore checkpoint if available
    await this._restoreCheckpoint();

    // Register lifecycle handlers (idempotent via Set tracking)
    this._registerHandler('install', () => this._onInstall());
    this._registerHandler('activate', () => this._onActivate());

    this._startCheckpointing();
    this._initialized = true;
    logger?.info?.(`[SwStateMachine] Initialized — version ${SW_VERSION}, state: ${this._state}`);
  }

  /** Call when SW is about to be terminated — flush checkpoint. */
  async terminate(): Promise<void> {
    this._stopCheckpointing();
    await this._saveCheckpoint();
    this._state = 'terminated';
  }

  /** Track an active connection (tab opened). */
  addConnection(): void {
    this._activeConnections++;
  }

  /** Untrack a connection (tab closed). */
  removeConnection(): void {
    this._activeConnections = Math.max(0, this._activeConnections - 1);
  }

  /** Track a queued message for the message relay. */
  setQueuedMessages(count: number): void {
    this._queuedMessages = count;
  }

  private _registerHandler(event: string, handler: () => void): void {
    if (this._eventListeners.has(event)) return;
    this._eventListeners.add(event);
    try {
      self.addEventListener(event, handler);
    } catch {
      // self.addEventListener not available outside SW context
    }
  }

  private _onInstall(): void {
    this._state = 'installing';
    logger?.info?.('[SwStateMachine] install event');
    // skipWaiting for immediate activation
    try {
      (self as any).skipWaiting?.();
    } catch {
      // skipWaiting only available in SW context
    }
  }

  private _onActivate(): void {
    this._state = 'activating';
    logger?.info?.('[SwStateMachine] activate event');
    // Claim all clients so the new SW controls all tabs immediately
    try {
      (self as any).clients?.claim?.();
    } catch {
      // clients.claim only available in SW context
    }
    this._state = 'active';
  }

  private _startCheckpointing(): void {
    this._checkpointTimer = setInterval(() => {
      this._saveCheckpoint();
    }, CHECKPOINT_INTERVAL_MS);
  }

  private _stopCheckpointing(): void {
    if (this._checkpointTimer !== null) {
      clearInterval(this._checkpointTimer);
      this._checkpointTimer = null;
    }
  }

  private async _saveCheckpoint(): Promise<void> {
    const checkpoint: SwCheckpoint = {
      state: this._state,
      timestamp: Date.now(),
      version: SW_VERSION,
      activeConnections: this._activeConnections,
      queuedMessages: this._queuedMessages,
    };
    try {
      await chrome.storage.local.set({ [CHECKPOINT_KEY]: checkpoint });
    } catch {
      // chrome.storage may not be available in all contexts
    }
  }

  private async _restoreCheckpoint(): Promise<void> {
    try {
      const result = await chrome.storage.local.get(CHECKPOINT_KEY);
      const checkpoint = result[CHECKPOINT_KEY] as SwCheckpoint | undefined;
      if (checkpoint && checkpoint.version === SW_VERSION) {
        this._state = checkpoint.state;
        this._activeConnections = checkpoint.activeConnections;
        this._queuedMessages = checkpoint.queuedMessages;
      }
    } catch {
      // chrome.storage may not be available
    }
  }
}

export const swStateMachine = new SwLifecycleStateMachine();
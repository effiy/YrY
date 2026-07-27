/**
 * Connection manager with exponential backoff retry.
 * Pings the content script and restores state on success.
 */

export interface ConnectDeps {
  sendMessage(msg: unknown): Promise<unknown>;
  loadState(): Promise<Record<string, unknown> | null>;
  onConnected(state: Record<string, unknown> | null): void;
  onFailed(): void;
}

export function connect(
  deps: ConnectDeps,
  maxRetries = 3,
  baseMs = 500,
): void {
  let retries = 0;

  function tryConnect(): void {
    Promise.resolve(deps.sendMessage({ action: 'ping' })).then((response) => {
      if (response) {
        deps.loadState().then(deps.onConnected);
      } else if (retries < maxRetries) {
        retries++;
        setTimeout(tryConnect, baseMs * retries);
      } else {
        deps.onFailed();
      }
    });
  }

  tryConnect();
}

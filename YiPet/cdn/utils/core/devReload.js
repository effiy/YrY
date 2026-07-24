/**
 * 开发模式热刷新：连接 dev-server 的 SSE，收到变更通知后刷新页面
 */
(function initDevReload() {
  if (typeof window === 'undefined' || typeof EventSource === 'undefined') return;
  if (window.__YIWEB_DEV_RELOAD__) return;
  window.__YIWEB_DEV_RELOAD__ = true;

  const SSE_PATH = '/__dev__/events';
  let source = null;
  let retryTimer = null;

  function connect() {
    if (source) {
      source.close();
      source = null;
    }

    source = new EventSource(SSE_PATH);

    source.addEventListener('reload', () => {
      window.location.reload();
    });

    source.onerror = () => {
      const closed = source.readyState === EventSource.CLOSED;
      source.close();
      source = null;
      // Server explicitly rejected (e.g. 404 on /__dev__/events) — not a dev server, stop retrying.
      if (closed) return;
      if (!retryTimer) {
        retryTimer = setTimeout(() => {
          retryTimer = null;
          connect();
        }, 2000);
      }
    };
  }

  connect();
})();

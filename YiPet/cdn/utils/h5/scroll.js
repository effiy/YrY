/**
 * Generic scroll utilities
 */

/**
 * Scroll to an item by key inside a scrollable container.
 * Falls back to virtual-list estimation if the item is not yet rendered.
 *
 * @param {HTMLElement} container
 * @param {string|number} key
 * @param {object|null} virtualList
 * @param {object} [options]
 * @param {string} [options.behavior='smooth']
 * @param {string} [options.block='center']
 * @param {number} [options.offset=60]
 * @param {number} [options.maxRetries=10]
 * @param {number} [options.defaultItemHeight=92]
 */
export const scrollToItem = (container, key, virtualList, options = {}) => {
  if (!container || !key) return;

  const {
    behavior = 'smooth',
    block = 'center',
    offset = 60,
    maxRetries = 10,
    defaultItemHeight = 92,
  } = options;

  const keyStr = String(key);
  const item =
    container.querySelector(`[data-key="${keyStr}"]`) ||
    container.querySelector(`[data-news-key="${keyStr}"]`);

  if (item) {
    item.scrollIntoView({ behavior, block });
    return;
  }

  const v = virtualList;
  if (v && v.enabled && Array.isArray(v.items)) {
    const index = v.items.findIndex((it) => {
      const itemKey = it.key || it.newsKey;
      return String(itemKey) === keyStr;
    });

    if (index >= 0) {
      const itemHeight = Math.max(40, Number(v.itemHeight) || defaultItemHeight);
      container.scrollTop = Math.max(0, index * itemHeight - offset);
      v.requestUpdate({ force: true });

      let retries = 0;
      const check = () => {
        const el =
          container.querySelector(`[data-key="${keyStr}"]`) ||
          container.querySelector(`[data-news-key="${keyStr}"]`);
        if (el) {
          el.scrollIntoView({ behavior, block });
        } else if (retries < maxRetries) {
          retries++;
          setTimeout(check, 50);
        }
      };
      setTimeout(check, 100);
    }
  }
};

/**
 * Check whether a scrollable container is near its bottom.
 *
 * @param {HTMLElement} container
 * @param {number} [threshold=50]
 * @returns {boolean}
 */
export const isNearBottom = (container, threshold = 50) => {
  if (!container) return true;
  const { scrollTop, scrollHeight, clientHeight } = container;
  return scrollHeight - scrollTop - clientHeight <= threshold;
};

/**
 * Execute a DOM-mutating function while preserving the user's scroll position.
 *
 * @param {HTMLElement} container
 * @param {Function} mutateFn
 * @returns {any} the return value of mutateFn
 */
export const preserveScrollPosition = (container, mutateFn) => {
  if (!container) return mutateFn();

  const scrollTop = container.scrollTop;
  const scrollHeight = container.scrollHeight;

  const result = mutateFn();

  const restore = () => {
    const newScrollHeight = container.scrollHeight;
    const scrollDiff = newScrollHeight - scrollHeight;
    container.scrollTop = scrollTop + scrollDiff;
  };

  if (result && typeof result.then === 'function') {
    return result.then(
      (value) => {
        requestAnimationFrame(restore);
        return value;
      },
      (reason) => {
        requestAnimationFrame(restore);
        throw reason;
      }
    );
  }

  requestAnimationFrame(restore);
  return result;
};

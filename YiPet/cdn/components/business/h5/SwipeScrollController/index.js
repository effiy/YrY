/**
 * SwipeScrollController
 *
 * Encapsulates touch tracking, scroll-velocity measurement,
 * and swipe-to-reset behavior for a scrollable list.
 *
 * Usage:
 *   const swipe = new SwipeScrollController(container, {
 *     itemSelector: '.item',
 *     wrapperSelector: '.swipe-item-wrapper',
 *     deleteButtonWidth: 160,
 *     resetScope: 'document', // or 'container'
 *   });
 *   swipe.mount();
 *   // later...
 *   swipe.destroy();
 */

export class SwipeScrollController {
  constructor(container, options = {}) {
    this.container = container;
    this.itemSelector = options.itemSelector || '.item';
    this.wrapperSelector = options.wrapperSelector || '.swipe-item-wrapper';
    this.deleteButtonWidth = options.deleteButtonWidth || 160;
    this.resetScope = options.resetScope || 'document';

    this._swipeState = {
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      isSwiping: false,
      currentWrapper: null,
    };

    this._scrollRAF = null;
    this._isScrolling = false;
    this._scrollTimeout = null;
    this._lastScrollTop = 0;
    this._lastScrollTime = 0;
    this._scrollVelocity = 0;

    this._boundHandleTouchStart = this._handleTouchStart.bind(this);
    this._boundHandleTouchMove = this._handleTouchMove.bind(this);
    this._boundHandleTouchEnd = this._handleTouchEnd.bind(this);
    this._boundHandleDocumentTouchStart = this._handleDocumentTouchStart.bind(this);
    this._boundHandleScroll = this._handleScroll.bind(this);
  }

  // ---------- private helpers ----------

  _getWrappers() {
    if (this.resetScope === 'container') {
      return Array.from(this.container.querySelectorAll(this.wrapperSelector));
    }
    return Array.from(document.querySelectorAll(this.wrapperSelector));
  }

  _getScopedWrappers() {
    // For "other swiped items" we always scope to the container
    // to avoid interfering with sibling SwipeScrollController instances
    return Array.from(this.container.querySelectorAll(this.wrapperSelector));
  }

  _resetAllSwipes() {
    this._getWrappers().forEach((wrapper) => {
      wrapper.classList.remove('is-swiped');
      wrapper.classList.remove('is-scrolling');
      const item = wrapper.querySelector(this.itemSelector);
      if (item) {
        item.style.transform = '';
      }
    });
  }

  _resetAllSwipesImmediate() {
    this._getWrappers().forEach((wrapper) => {
      wrapper.classList.remove('is-swiped');
      wrapper.classList.add('is-scrolling');
      const item = wrapper.querySelector(this.itemSelector);
      if (item) {
        item.style.transition = 'none';
        item.style.transform = '';
        requestAnimationFrame(() => {
          item.style.transition = '';
        });
      }
    });

    if (this._swipeState.currentWrapper) {
      const item = this._swipeState.currentWrapper.querySelector(this.itemSelector);
      if (item) {
        item.style.transition = 'none';
        item.style.transform = '';
        requestAnimationFrame(() => {
          item.style.transition = '';
        });
      }
      this._swipeState.currentWrapper = null;
      this._swipeState.isSwiping = false;
    }
  }

  _clearScrollingMark() {
    this._getWrappers().forEach((wrapper) => {
      wrapper.classList.remove('is-scrolling');
    });
  }

  _cancelSwipe(wrapper) {
    const item = wrapper.querySelector(this.itemSelector);
    if (item) {
      item.style.transition = 'none';
      item.style.transform = '';
      requestAnimationFrame(() => {
        item.style.transition = '';
      });
    }
    this._swipeState.currentWrapper = null;
    this._swipeState.isSwiping = false;
  }

  // ---------- event handlers ----------

  _handleTouchStart(e) {
    if (this._isScrolling) return;

    const target = e.target;
    if (target.closest('.swipe-item__delete') || target.closest('.swipe-item__favorite')) {
      return;
    }

    const wrapper = target.closest(this.wrapperSelector);
    if (!wrapper) return;

    const touch = e.touches[0];
    if (!touch) return;

    this._swipeState.startX = touch.clientX;
    this._swipeState.startY = touch.clientY;
    this._swipeState.currentX = touch.clientX;
    this._swipeState.currentY = touch.clientY;
    this._swipeState.isSwiping = false;
    this._swipeState.currentWrapper = wrapper;
  }

  _handleTouchMove(e) {
    if (this._isScrolling) {
      if (this._swipeState.currentWrapper) {
        this._swipeState.currentWrapper = null;
        this._swipeState.isSwiping = false;
      }
      return;
    }

    if (!this._swipeState.currentWrapper) return;

    const touch = e.touches[0];
    if (!touch) return;

    this._swipeState.currentX = touch.clientX;
    this._swipeState.currentY = touch.clientY;

    const deltaX = this._swipeState.currentX - this._swipeState.startX;
    const deltaY = this._swipeState.currentY - this._swipeState.startY;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    if (absDeltaX < 5 && absDeltaY < 5) return;

    if (!this._swipeState.isSwiping) {
      if (absDeltaY > absDeltaX && absDeltaY > 15) {
        this._cancelSwipe(this._swipeState.currentWrapper);
        return;
      }

      if (absDeltaX > absDeltaY * 1.5 && absDeltaX > 15 && absDeltaY < 30) {
        this._swipeState.isSwiping = true;
        this._swipeState.currentWrapper.classList.remove('is-scrolling');

        const otherSwiped = this._getScopedWrappers().filter(
          (w) => w.classList.contains('is-swiped') && !w.classList.contains('is-scrolling')
        );
        otherSwiped.forEach((wrapper) => {
          if (wrapper !== this._swipeState.currentWrapper) {
            wrapper.classList.remove('is-swiped');
            wrapper.classList.remove('is-scrolling');
            const item = wrapper.querySelector(this.itemSelector);
            if (item) {
              item.style.transition = 'none';
              item.style.transform = '';
              requestAnimationFrame(() => {
                item.style.transition = '';
              });
            }
          }
        });
      }
    }

    if (this._swipeState.isSwiping && absDeltaY > absDeltaX && absDeltaY > 20) {
      this._cancelSwipe(this._swipeState.currentWrapper);
      return;
    }

    if (this._swipeState.isSwiping) {
      e.preventDefault();
      const item = this._swipeState.currentWrapper.querySelector(this.itemSelector);
      if (!item) return;
      const translateX = Math.max(-this.deleteButtonWidth, Math.min(0, deltaX));
      item.style.transform = `translate3d(${translateX}px, 0, 0)`;
    }
  }

  _handleTouchEnd(e) {
    if (this._isScrolling) {
      if (this._swipeState.currentWrapper) {
        this._cancelSwipe(this._swipeState.currentWrapper);
      }
      return;
    }

    if (!this._swipeState.currentWrapper || !this._swipeState.isSwiping) {
      this._swipeState.currentWrapper = null;
      this._swipeState.isSwiping = false;
      return;
    }

    const deltaX = this._swipeState.currentX - this._swipeState.startX;
    const item = this._swipeState.currentWrapper.querySelector(this.itemSelector);

    if (!item) {
      this._swipeState.currentWrapper = null;
      this._swipeState.isSwiping = false;
      return;
    }

    if (deltaX < -this.deleteButtonWidth / 2) {
      this._swipeState.currentWrapper.classList.remove('is-scrolling');
      this._swipeState.currentWrapper.classList.add('is-swiped');
      item.style.transform = `translate3d(-${this.deleteButtonWidth}px, 0, 0)`;
    } else {
      this._swipeState.currentWrapper.classList.remove('is-swiped');
      this._swipeState.currentWrapper.classList.remove('is-scrolling');
      item.style.transform = '';
    }

    this._swipeState.currentWrapper = null;
    this._swipeState.isSwiping = false;
  }

  _handleDocumentTouchStart(e) {
    const wrapper = e.target.closest(this.wrapperSelector);
    // If the touch is outside ANY wrapper managed by this controller,
    // reset all. We check against the full scope.
    if (!wrapper) {
      this._resetAllSwipes();
    }
  }

  _handleScroll() {
    const now = performance.now();
    const currentScrollTop = this.container.scrollTop;
    const scrollDelta = Math.abs(currentScrollTop - this._lastScrollTop);
    const timeDelta = now - this._lastScrollTime;

    if (timeDelta > 0) {
      this._scrollVelocity = scrollDelta / timeDelta;
    }

    const isActuallyScrolling = scrollDelta > 1;
    this._lastScrollTop = currentScrollTop;
    this._lastScrollTime = now;

    if (isActuallyScrolling) {
      if (!this._isScrolling) {
        this._isScrolling = true;
        this._resetAllSwipesImmediate();
      }

      if (!this._scrollRAF) {
        this._scrollRAF = requestAnimationFrame(() => {
          this._scrollRAF = null;
          this._resetAllSwipesImmediate();
        });
      }
    }

    if (this._scrollTimeout) {
      clearTimeout(this._scrollTimeout);
    }
    this._scrollTimeout = setTimeout(() => {
      this._isScrolling = false;
      this._scrollVelocity = 0;
      this._scrollTimeout = null;
      this._clearScrollingMark();
    }, 100);
  }

  // ---------- public API ----------

  mount() {
    if (!this.container) return;
    this.container.addEventListener('touchstart', this._boundHandleTouchStart, { passive: true });
    this.container.addEventListener('touchmove', this._boundHandleTouchMove, { passive: false });
    this.container.addEventListener('touchend', this._boundHandleTouchEnd, { passive: true });
    this.container.addEventListener('scroll', this._boundHandleScroll, { passive: true });
    document.addEventListener('touchstart', this._boundHandleDocumentTouchStart, { passive: true });
  }

  destroy() {
    if (!this.container) return;
    this.container.removeEventListener('touchstart', this._boundHandleTouchStart);
    this.container.removeEventListener('touchmove', this._boundHandleTouchMove);
    this.container.removeEventListener('touchend', this._boundHandleTouchEnd);
    this.container.removeEventListener('scroll', this._boundHandleScroll);
    document.removeEventListener('touchstart', this._boundHandleDocumentTouchStart);

    if (this._scrollRAF) {
      cancelAnimationFrame(this._scrollRAF);
      this._scrollRAF = null;
    }
    if (this._scrollTimeout) {
      clearTimeout(this._scrollTimeout);
      this._scrollTimeout = null;
    }

    this._swipeState.currentWrapper = null;
    this._swipeState.isSwiping = false;
    this._isScrolling = false;
  }
}

/**
 * 虚拟列表组件
 * 仅渲染视口内的列表项，提升长列表性能
 * 支持动态高度测量与自动修正
 */
export class VirtualList {
  /**
   * @param {Object} options
   * @param {HTMLElement} options.container - 滚动容器
   * @param {Function} options.renderItem - 渲染单个项的回调函数
   * @param {number} [options.itemHeight=80] - 预估行高
   * @param {number} [options.overscan=10] - 缓冲区大小
   * @param {Array} [options.items=[]] - 初始数据
   */
  constructor(options = {}) {
    this.container = options.container;
    this.renderItem = options.renderItem;
    this.itemHeight = options.itemHeight || 80;
    this.overscan = options.overscan || 10;
    this.items = options.items || [];
    
    this.state = {
      start: -1,
      end: -1,
      force: false,
      lastScrollTop: 0,
      measureHeightCounter: 0,
      raf: 0
    };

    this.enabled = false;
    this.dom = null;
    
    // Bind methods
    this.handleScroll = this.handleScroll.bind(this);
    this.update = this.update.bind(this);
  }

  /**
   * 挂载虚拟列表
   */
  mount() {
    if (!this.container) return;
    this.enabled = true;
    this.ensureDOM();
    this.bindEvents();
    this.requestUpdate({ force: true });
  }

  /**
   * 卸载虚拟列表
   */
  unmount() {
    this.enabled = false;
    this.unbindEvents();
    if (this.state.raf) {
      cancelAnimationFrame(this.state.raf);
      this.state.raf = 0;
    }
    if (this.container) {
        this.container.removeAttribute("data-vlist");
    }
  }
  
  /**
   * 设置数据并刷新
   * @param {Array} items 
   */
  setItems(items) {
      this.items = items;
      this.requestUpdate({ force: true });
  }

  ensureDOM() {
    if (!this.container) return;
    if (this.container.dataset.vlist !== "1") {
      this.container.dataset.vlist = "1";
      this.container.innerHTML = `
        <div class="vlist__spacer vlist__spacer--top"></div>
        <div class="vlist__items"></div>
        <div class="vlist__spacer vlist__spacer--bottom"></div>
      `;
    }
    this.dom = {
      top: this.container.querySelector(".vlist__spacer--top"),
      mid: this.container.querySelector(".vlist__items"),
      bottom: this.container.querySelector(".vlist__spacer--bottom"),
    };
  }

  bindEvents() {
    if (!this.container) return;
    this.container.addEventListener("scroll", this.handleScroll, { passive: true });
    window.addEventListener("scroll", this.handleScroll, { passive: true });
    window.addEventListener("resize", this.handleScroll, { passive: true });
  }

  unbindEvents() {
    if (!this.container) return;
    this.container.removeEventListener("scroll", this.handleScroll);
    window.removeEventListener("scroll", this.handleScroll);
    window.removeEventListener("resize", this.handleScroll);
  }

  handleScroll() {
      if (!this.enabled) return;
      if (!this.state.raf) {
          this.state.raf = requestAnimationFrame(() => {
              this.state.raf = 0;
              this.update();
          });
      }
  }

  requestUpdate({ force = false } = {}) {
      if (force) this.state.force = true;
      if (!this.state.raf) {
          this.state.raf = requestAnimationFrame(() => {
              this.state.raf = 0;
              this.update();
          });
      }
  }

  update() {
    if (!this.enabled || !this.container || typeof this.renderItem !== "function") return;
    
    const items = this.items;
    if (!this.dom) this.ensureDOM();
    const { top, mid, bottom } = this.dom;
    
    if (items.length === 0) {
      if (top) top.style.height = "0px";
      if (bottom) bottom.style.height = "0px";
      if (mid) mid.innerHTML = "";
      this.state.start = 0;
      this.state.end = 0;
      this.state.force = false;
      return;
    }

    // 动态修正 itemHeight
    const itemHeight = Math.max(40, Number(this.itemHeight) || 80);
    
    let listTop = 0;
    let viewportTop = 0;
    let viewportBottom = window.innerHeight;
    
    const isContainerScrolling = this.container.scrollHeight > this.container.clientHeight;
    
    if (isContainerScrolling) {
      viewportTop = this.container.scrollTop;
      viewportBottom = viewportTop + this.container.clientHeight;
      listTop = 0;
    } else {
      const containerRect = this.container.getBoundingClientRect();
      listTop = containerRect.top + window.scrollY;
      viewportTop = window.scrollY;
      viewportBottom = viewportTop + window.innerHeight;
    }

    let overscan = this.overscan;
    const scrollDelta = Math.abs((this.state.lastScrollTop || 0) - viewportTop);
    
    // 快速滚动时增加缓冲区
    if (scrollDelta > itemHeight * 2) {
      overscan = Math.min(overscan * 2, 20);
    }
    this.state.lastScrollTop = viewportTop;

    let start = Math.floor((viewportTop - listTop) / itemHeight) - overscan;
    let end = Math.ceil((viewportBottom - listTop) / itemHeight) + overscan;
    
    if (!Number.isFinite(start)) start = 0;
    if (!Number.isFinite(end)) end = items.length;
    start = Math.max(0, Math.min(items.length, start));
    end = Math.max(start, Math.min(items.length, end));

    if (!this.state.force && start === this.state.start && end === this.state.end) return;
    
    this.state.force = false;
    this.state.start = start;
    this.state.end = end;

    const topHeight = start * itemHeight;
    const bottomHeight = (items.length - end) * itemHeight;

    if (top) top.style.height = `${topHeight}px`;
    if (bottom) bottom.style.height = `${bottomHeight}px`;

    const slice = items.slice(start, end);
    if (slice.length === 0) {
      if (mid) mid.innerHTML = "";
      return;
    }

    const fragment = document.createDocumentFragment();
    const tempDiv = document.createElement('div');
    
    const htmlParts = slice.map(item => this.renderItem(item));
    tempDiv.innerHTML = htmlParts.join("");
    
    while (tempDiv.firstChild) {
      fragment.appendChild(tempDiv.firstChild);
    }
    
    if (mid) {
        if (mid.replaceChildren) {
            mid.replaceChildren(fragment);
        } else {
            mid.innerHTML = "";
            mid.appendChild(fragment);
        }
    }
    
    // 动态高度测量与修正
    if (this.state.measureHeightCounter === undefined) this.state.measureHeightCounter = 0;
    this.state.measureHeightCounter++;
    
    // 降低采样频率，避免频繁重排
    if (this.state.measureHeightCounter % 5 === 0) {
        requestAnimationFrame(() => {
            const firstChild = mid && mid.firstElementChild;
            if (firstChild) {
                const h = firstChild.offsetHeight;
                // 只有当高度差异显著且合理时才更新
                if (h && h > 40 && h < 600 && Math.abs(h - this.itemHeight) > 5) {
                    this.itemHeight = h;
                }
            }
        });
    }
  }
}

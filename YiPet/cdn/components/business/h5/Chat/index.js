import { escapeHtml } from "../../../../../../YiH5/utils/index.js";
import { normalizeRole, normalizeText } from "../../../../../../YiH5/utils/msg.js";
import { renderMarkdown, renderMermaidIn } from "../../../../../../YiH5/utils/markdown.js";

/**
 * 聊天组件：负责消息渲染与消息内操作的事件委托
 */
export class Chat {
  /**
   * @param {HTMLElement} container - 聊天内容容器
   * @param {Object} [callbacks] - 回调函数
   * @param {Function} [callbacks.onMoveUp]
   * @param {Function} [callbacks.onMoveDown]
   * @param {Function} [callbacks.onDelete]
   * @param {Function} [callbacks.onSendPrompt]
   */
  constructor(container, callbacks = {}) {
    this.container = container;
    this.callbacks = {
      onMoveUp: null,
      onMoveDown: null,
      onDelete: null,
      onSendPrompt: null,
      onRegenerate: null,
      onSendToRobot: null,
      getRobots: null,
      ...callbacks,
    };
    
    this._scrollTimeout = null;
    this._scrollRAF = null;
    this._lastScrollHeight = 0;
    this.container.classList.add("pet-chat-messages");

    // 绑定事件处理器
    this._handleClick = this._handleClick.bind(this);
    this._bindEvents();
  }

  /**
   * 渲染会话
   * @param {Object} session - 会话对象 { messages: [] ... }
   */
  render(session) {
    if (!session) {
      this._renderEmpty();
      return;
    }
    
    const msgs = this._getMessages(session);
    
    if (msgs.length === 0) {
      this.container.innerHTML = '';
    } else {
      let html = '';
      
      html += msgs.map((m, idx) => this._renderMessage(m, idx, msgs.length)).join("");
      this.container.innerHTML = html;
    }
    
    // 滚动到底并延迟渲染 Mermaid
    this.scrollToBottom();
    setTimeout(() => {
      renderMermaidIn(this.container);
      this.scrollToBottom();
    }, 0);
  }

  /**
   * 向列表追加一条消息
   * @param {Object} message - 消息对象
   * @param {number} idx - 消息索引
   * @param {number} totalCount - 总消息数
   */
  append(message, idx, totalCount) {
    // 1. 移除空状态
    const emptyState = this.container.querySelector('.empty');
    if (emptyState) {
      emptyState.remove();
    }

    // 2. 更新上一条消息的"下移"按钮状态
    if (idx > 0) {
      const prevMsg = this.container.querySelector(`.pet-chat-message[data-message-index="${idx - 1}"]`);
      if (prevMsg) {
         const moveDownBtn = prevMsg.querySelector('[data-action="move-down"]');
         if (moveDownBtn) moveDownBtn.disabled = false;
      }
    }

    // 3. 渲染并追加新消息
    const html = this._renderMessage(message, idx, totalCount);
    this.container.insertAdjacentHTML('beforeend', html);

    // 4. 滚动到底部
    this.scrollToBottom(true);
    
    // 5. 渲染 Mermaid
    setTimeout(() => {
      renderMermaidIn(this.container);
      this.scrollToBottom();
    }, 0);
  }

  /**
   * 滚动到底部（含性能优化）
   * @param {boolean} [smooth=false] - 是否平滑滚动
   * @param {boolean} [force=false] - 是否强制滚动
   */
  scrollToBottom(smooth = false, force = false) {
    if (!this.container) return;
    
    if (!force && !this._isNearBottom(100)) {
      return;
    }
    
    if (this._scrollTimeout) {
      clearTimeout(this._scrollTimeout);
      this._scrollTimeout = null;
    }
    if (this._scrollRAF) {
      cancelAnimationFrame(this._scrollRAF);
      this._scrollRAF = null;
    }
    
    const doScroll = () => {
      if (!this.container) return;
      const targetScrollTop = this.container.scrollHeight;
      if (targetScrollTop === this._lastScrollHeight && this.container.scrollTop === this._lastScrollHeight) {
        return;
      }
      this._lastScrollHeight = targetScrollTop;
      this.container.scrollTop = targetScrollTop;
    };

    if (smooth) {
      const currentScrollTop = this.container.scrollTop;
      const targetScrollTop = this.container.scrollHeight;
      if (Math.abs(currentScrollTop - targetScrollTop) < 10) {
        return;
      }
      const originalBehavior = this.container.style.scrollBehavior;
      this.container.style.scrollBehavior = 'smooth';
      this.container.scrollTop = targetScrollTop;
      setTimeout(() => {
        if (this.container) {
          this.container.style.scrollBehavior = originalBehavior || '';
        }
      }, 500);
    } else {
      this._scrollRAF = requestAnimationFrame(() => {
        doScroll();
        this._scrollRAF = requestAnimationFrame(() => {
          doScroll();
          this._scrollRAF = null;
        });
      });
    }
  }

  _bindEvents() {
    this.container.addEventListener('click', this._handleClick);
  }

  async _handleClick(e) {
    const target = e.target;
    
    // 上移
    const moveUpBtn = target.closest('[data-action="move-up"]');
    if (moveUpBtn && !moveUpBtn.disabled) {
      e.stopPropagation();
      const idx = this._getMessageIndex(moveUpBtn);
      if (idx !== -1 && this.callbacks.onMoveUp) {
        this.callbacks.onMoveUp(idx);
      }
      return;
    }
    
    // 下移
    const moveDownBtn = target.closest('[data-action="move-down"]');
    if (moveDownBtn && !moveDownBtn.disabled) {
      e.stopPropagation();
      const idx = this._getMessageIndex(moveDownBtn);
      if (idx !== -1 && this.callbacks.onMoveDown) {
        this.callbacks.onMoveDown(idx);
      }
      return;
    }
    
    // 发送到 AI
    const sendPromptBtn = target.closest('[data-action="send-prompt"]');
    if (sendPromptBtn) {
      e.stopPropagation();
      const idx = this._getMessageIndex(sendPromptBtn);
      if (idx !== -1 && this.callbacks.onSendPrompt) {
        this.callbacks.onSendPrompt(idx, sendPromptBtn);
      }
      return;
    }

    const regenerateBtn = target.closest('[data-action="regenerate"]');
    if (regenerateBtn) {
      e.stopPropagation();
      const idx = this._getMessageIndex(regenerateBtn);
      if (idx !== -1 && this.callbacks.onRegenerate) {
        this.callbacks.onRegenerate(idx, regenerateBtn);
      }
      return;
    }

    const robotBtn = target.closest('[data-action="send-robot"]');
    if (robotBtn) {
      e.stopPropagation();
      const idx = this._getMessageIndex(robotBtn);
      const robotId = robotBtn.getAttribute('data-robot-id') || '';
      if (idx !== -1 && this.callbacks.onSendToRobot) {
        this.callbacks.onSendToRobot(robotId, idx, robotBtn);
      }
      return;
    }
    
    // 删除
    const deleteBtn = target.closest('[data-action="delete"]');
    if (deleteBtn) {
      e.stopPropagation();
      e.preventDefault();
      if (deleteBtn.disabled || deleteBtn.dataset.deleting === 'true') {
        return;
      }
      const idx = this._getMessageIndex(deleteBtn);
      if (idx !== -1 && this.callbacks.onDelete) {
        this.callbacks.onDelete(idx, deleteBtn);
      }
      return;
    }
  }

  _getMessageIndex(el) {
    const msgDiv = el.closest('.pet-chat-message');
    if (!msgDiv) return -1;
    return parseInt(msgDiv.getAttribute('data-message-index') || '-1');
  }

  _isNearBottom(threshold = 50) {
    if (!this.container) return true;
    const { scrollTop, scrollHeight, clientHeight } = this.container;
    return scrollHeight - scrollTop - clientHeight <= threshold;
  }

  _getMessages(session) {
    return Array.isArray(session.messages) ? session.messages.filter(m => m != null) : [];
  }

  _createPetMessageHtml(content, isWelcome = false) {
    const attrs = isWelcome ? 'data-welcome-message="true"' : '';
    return `
      <div class="pet-chat-message is-pet" ${attrs}>
        <div class="pet-chat-bubble">
          <div class="pet-chat-content md-preview-body">${content}</div>
        </div>
      </div>
    `;
  }

  _renderMessage(m, idx, totalCount) {
    if (m == null) return '';
    if (typeof m !== 'object') {
      m = { content: String(m) };
    }
    
    const role = normalizeRole(m);
    const text = normalizeText(m);
    const isMe = role === "user";
    const cls = isMe ? "pet-chat-message is-user" : "pet-chat-message is-pet";
    const imageDataUrls = Array.isArray(m.imageDataUrls)
      ? m.imageDataUrls.filter(Boolean).map((x) => String(x))
      : [];
    const fallbackImage = String(m.imageDataUrl || m.image || "").trim();
    if (fallbackImage && imageDataUrls.length === 0) imageDataUrls.push(fallbackImage);

    const imagesHtml =
      imageDataUrls.length > 0
        ? `<div class="pet-chat-images">${imageDataUrls
            .map((src) => `<img class="pet-chat-image" src="${escapeHtml(src)}" alt="图片消息" />`)
            .join("")}</div>`
        : "";

    let contentHtml = "";
    if (text) {
      contentHtml = `<div class="pet-chat-content md-preview-body">${renderMarkdown(text)}</div>`;
    } else if (m.streaming) {
      contentHtml = `<div class="pet-chat-typing" aria-label="生成中">...</div>`;
    }

    const timeStr = this._formatTime(m.ts || m.timestamp || Date.now());

    const robots = typeof this.callbacks.getRobots === "function" ? this.callbacks.getRobots() : [];
    const robotBtns =
      !isMe &&
      Array.isArray(robots) &&
      robots.length > 0 &&
      text &&
      String(text).trim()
        ? robots
            .map((r, ri) => {
              const id = String(r?.id || `robot_${ri}`);
              const name = String(r?.name || "机器人");
              return `<button type="button" class="pet-chat-meta-btn" data-action="send-robot" data-robot-id="${escapeHtml(
                id
              )}" title="发送到：${escapeHtml(name)}">${escapeHtml(name)}</button>`;
            })
            .join("")
        : "";

    const canRegenerate = !isMe && typeof this.callbacks.onRegenerate === "function";
    const canMoveUp = typeof this.callbacks.onMoveUp === "function";
    const canMoveDown = typeof this.callbacks.onMoveDown === "function";
    const canDelete = typeof this.callbacks.onDelete === "function";

    const actionsHtml = `
      <div class="pet-chat-meta">
        <div class="pet-chat-meta-actions">
          ${robotBtns}
          ${
            canMoveUp
              ? `<button type="button" class="pet-chat-meta-btn" data-action="move-up" title="上移" ${
                  idx === 0 ? "disabled" : ""
                }>⬆️</button>`
              : ""
          }
          ${
            canMoveDown
              ? `<button type="button" class="pet-chat-meta-btn" data-action="move-down" title="下移" ${
                  idx === totalCount - 1 ? "disabled" : ""
                }>⬇️</button>`
              : ""
          }
          ${
            canRegenerate
              ? `<button type="button" class="pet-chat-meta-btn" data-action="regenerate" title="重新生成回复">🔄</button>`
              : ""
          }
          ${canDelete ? `<button type="button" class="pet-chat-meta-btn" data-action="delete" title="删除">🗑️</button>` : ""}
        </div>
        <time class="pet-chat-time" datetime="${escapeHtml(String(m.ts || m.timestamp || ''))}">${escapeHtml(
      timeStr
    )}</time>
      </div>
    `;

    const isAborted = !!m.aborted;
    const isError = !!m.error;
    const isStreaming = !!m.streaming;
    const extraCls = `${isAborted ? " is-aborted" : ""}${isError ? " is-error" : ""}${
      isStreaming ? " is-streaming" : ""
    }`;

    return `
      <div class="${cls}${extraCls}" data-message-index="${idx}">
        <div class="pet-chat-bubble">
          ${imagesHtml}
          ${contentHtml}
          ${actionsHtml}
        </div>
      </div>
    `;
  }

  _renderEmpty() {
    this.container.innerHTML = `<div class="empty empty--transparent">
      <div class="empty__icon">💬</div>
      <div class="empty__title">找不到该会话</div>
      <div class="empty__desc">请返回会话列表重试</div>
    </div>`;
  }

  _formatTime(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (msgDate.getTime() === today.getTime()) {
      return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    } else if (msgDate.getTime() === yesterday.getTime()) {
      return '昨天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    } else {
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const time = date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
      return `${month}月${day}日 ${time}`;
    }
  }

  _createWelcomeMessageHtml(session) {
    return '';
  }
}

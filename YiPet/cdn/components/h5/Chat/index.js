/**
 * YrY · H5 Chat — message rendering with action delegation
 *
 * All HTML rendering is driven by index.html.
 * Template IDs: see Chat/index.html header for full inventory.
 */

import { loadTemplate } from "../../../../utils/h5/template.js";
import { escapeHtml } from "../../../../utils/h5/index.js";
import { normalizeRole, normalizeText } from "../../../../utils/h5/msg.js";
import { renderMarkdown, renderMermaidIn } from "../../../../utils/h5/markdown.js";

/* ── Template loading (sync, at module init) ─────────────────────────────── */
const tpl = loadTemplate("Chat", new URL("./index.html", import.meta.url).href);

export class Chat {
  /** @type {import("../../../../utils/h5/template.js").TemplateHandle} */
  static tpl = tpl;

  constructor(container, callbacks = {}) {
    this.container = container;
    this.callbacks = {
      onMoveUp: null, onMoveDown: null, onDelete: null,
      onSendPrompt: null, onRegenerate: null, onSendToRobot: null,
      getRobots: null, ...callbacks,
    };
    this._scrollTimeout = null;
    this._scrollRAF = null;
    this._lastScrollHeight = 0;
    this.container.classList.add("pet-chat-messages");
    this._handleClick = this._handleClick.bind(this);
    this._bindEvents();
  }

  /* ── Public API ───────────────────────────────────────────────────────── */;

  render(session) {
    if (!session) { this._renderEmpty(); return; }
    const msgs = this._getMessages(session);
    this.container.innerHTML = msgs.length
      ? msgs.map((m, idx) => this._renderMessage(m, idx, msgs.length)).join("")
      : "";
    this.scrollToBottom();
    setTimeout(() => { renderMermaidIn(this.container); this.scrollToBottom(); }, 0);
  }

  append(message, idx, totalCount) {
    const emptyState = this.container.querySelector('.empty');
    if (emptyState) emptyState.remove();
    if (idx > 0) {
      const prev = this.container.querySelector(`.pet-chat-message[data-message-index="${idx - 1}"]`);
      if (prev) {
        const btn = prev.querySelector('[data-action="move-down"]');
        if (btn) btn.disabled = false;
      }
    }
    this.container.insertAdjacentHTML('beforeend', this._renderMessage(message, idx, totalCount));
    this.scrollToBottom(true);
    setTimeout(() => { renderMermaidIn(this.container); this.scrollToBottom(); }, 0);
  }

  scrollToBottom(smooth = false, force = false) {
    if (!this.container) return;
    if (!force && !this._isNearBottom(100)) return;
    if (this._scrollTimeout) { clearTimeout(this._scrollTimeout); this._scrollTimeout = null; }
    if (this._scrollRAF) { cancelAnimationFrame(this._scrollRAF); this._scrollRAF = null; }
    const doScroll = () => {
      if (!this.container) return;
      const t = this.container.scrollHeight;
      if (t === this._lastScrollHeight && this.container.scrollTop === this._lastScrollHeight) return;
      this._lastScrollHeight = t;
      this.container.scrollTop = t;
    };
    if (smooth) {
      const cur = this.container.scrollTop;
      const tgt = this.container.scrollHeight;
      if (Math.abs(cur - tgt) < 10) return;
      const orig = this.container.style.scrollBehavior;
      this.container.style.scrollBehavior = 'smooth';
      this.container.scrollTop = tgt;
      setTimeout(() => { if (this.container) this.container.style.scrollBehavior = orig || ''; }, 500);
    } else {
      this._scrollRAF = requestAnimationFrame(() => {
        doScroll();
        this._scrollRAF = requestAnimationFrame(() => { doScroll(); this._scrollRAF = null; });
      });
    }
  }

  /** Create a pet welcome message (used by app bootstrap). */
  _createWelcomeMessageHtml(content, isWelcome) {
    if (!content) return '';
    return tpl.render('tpl-chat-message-pet', {
      content,
      welcome: isWelcome ? 'data-welcome-message="true"' : ''
    });
  }

  /* ── Event Handling ──────────────────────────────────────────────────── */

  _bindEvents() { this.container.addEventListener('click', this._handleClick); }

  async _handleClick(e) {
    const actions = ['move-up', 'move-down', 'send-prompt', 'regenerate', 'send-robot', 'delete'];
    for (const act of actions) {
      const btn = e.target.closest(`[data-action="${act}"]`);
      if (!btn || btn.disabled) continue;
      e.stopPropagation();
      const idx = this._getMessageIndex(btn);
      if (idx === -1) return;
      switch (act) {
        case 'move-up':    this.callbacks.onMoveUp?.(idx); return;
        case 'move-down':  this.callbacks.onMoveDown?.(idx); return;
        case 'send-prompt': this.callbacks.onSendPrompt?.(idx, btn); return;
        case 'regenerate': this.callbacks.onRegenerate?.(idx, btn); return;
        case 'send-robot': {
          const rid = btn.getAttribute('data-robot-id') || '';
          this.callbacks.onSendToRobot?.(rid, idx, btn);
          return;
        }
        case 'delete': {
          e.preventDefault();
          if (btn.dataset.deleting !== 'true') this.callbacks.onDelete?.(idx, btn);
          return;
        }
      }
      return;
    }
  }

  _getMessageIndex(el) {
    const msg = el.closest('.pet-chat-message');
    return msg ? parseInt(msg.getAttribute('data-message-index') || '-1') : -1;
  }

  /* ── Rendering (all HTML from index.html) ──────────────────────────── */

  _isNearBottom(th = 50) {
    if (!this.container) return true;
    const { scrollTop, scrollHeight, clientHeight } = this.container;
    return scrollHeight - scrollTop - clientHeight <= th;
  }

  _getMessages(session) {
    return Array.isArray(session.messages) ? session.messages.filter(m => m != null) : [];
  }

  _renderMessage(m, idx, totalCount) {
    if (m == null) return '';
    if (typeof m !== 'object') m = { content: String(m) };

    const isMe = normalizeRole(m) === 'user';
    const text = normalizeText(m);

    // Images
    const imageUrls = Array.isArray(m.imageDataUrls)
      ? m.imageDataUrls.filter(Boolean).map(String)
      : [];
    const fallback = String(m.imageDataUrl || m.image || '').trim();
    if (fallback && imageUrls.length === 0) imageUrls.push(fallback);
    const imagesHtml = imageUrls.length
      ? tpl.render('tpl-chat-images', { items: imageUrls.map(src => tpl.render('tpl-chat-image-item', { src: escapeHtml(src) })).join('') })
      : '';

    // Content
    let contentHtml = '';
    if (text) {
      contentHtml = tpl.render('tpl-chat-content-md', { html: renderMarkdown(text) });
    } else if (m.streaming) {
      contentHtml = tpl.render('tpl-chat-content-typing', {});
    }

    // Action buttons
    const robots = typeof this.callbacks.getRobots === 'function' ? this.callbacks.getRobots() : [];
    const robotBtnsHtml = !isMe && robots.length && text?.trim()
      ? robots.map((r, ri) =>
          tpl.render('tpl-chat-robot-btn', {
            id: escapeHtml(r?.id || `robot_${ri}`),
            name: escapeHtml(r?.name || '机器人')
          })).join('')
      : '';

    const mkBtn = (tplId, showBtn, isDisabled) => {
      if (!showBtn) return '';
      return tpl.render(tplId, { disabled: isDisabled ? ' disabled' : '' });
    };
    const upBtn   = mkBtn('tpl-chat-btn-move-up',   typeof this.callbacks.onMoveUp === 'function', idx === 0);
    const downBtn = mkBtn('tpl-chat-btn-move-down', typeof this.callbacks.onMoveDown === 'function', idx === totalCount - 1);
    const regenBtn = mkBtn('tpl-chat-btn-regen',    !isMe && typeof this.callbacks.onRegenerate === 'function', false);
    const delBtn   = mkBtn('tpl-chat-btn-delete',   typeof this.callbacks.onDelete === 'function', false);

    const actionsHtml = tpl.render('tpl-chat-actions', { robotBtns: robotBtnsHtml, upBtn, downBtn, regenBtn, delBtn })
      + tpl.render('tpl-chat-time', {
          ts: escapeHtml(String(m.ts || m.timestamp || '')),
          text: escapeHtml(this._formatTime(m.ts || m.timestamp || Date.now()))
        });

    const extraCls = [
      m.aborted ? 'is-aborted' : '',
      m.error ? 'is-error' : '',
      m.streaming ? 'is-streaming' : ''
    ].filter(Boolean).join(' ');

    return tpl.render('tpl-chat-message', {
      role: isMe ? 'is-user' : 'is-pet',
      extra: extraCls ? ' ' + extraCls : '',
      index: idx,
      images: imagesHtml,
      content: contentHtml,
      actions: actionsHtml
    });
  }

  _renderEmpty() { this.container.innerHTML = tpl.render('tpl-chat-empty', {}); }

  _formatTime(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    if (msgDate.getTime() === today.getTime())
      return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    if (msgDate.getTime() === yesterday.getTime())
      return '昨天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    return `${date.getMonth() + 1}月${date.getDate()}日 ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;
  }
}

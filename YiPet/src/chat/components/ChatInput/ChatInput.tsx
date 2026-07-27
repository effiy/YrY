/**
 * YiPet Chat — ChatInput Component
 * Includes toolbar, draft images, and textarea with send/stop controls.
 *
 * Toolbar icons are inline SVGs for consistent cross-platform rendering
 * and proper theming via currentColor. Follows shadcn/ui patterns:
 * focus-visible rings, aria-pressed for toggles, prefers-reduced-motion.
 */

import './ChatInput.css';
import type { ChatController } from '@/chat/controller';

/* ── Inline SVG Icons ────────────────────────────────────────────────── */

/** Minimal SVG icons — 24x24 viewBox, stroke-based, via currentColor */
const Icons = {
  /** Document with lines — page context */
  PageContext: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),

  /** Pencil — edit session */
  Edit: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),

  /** Tag — tag manager */
  Tag: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  ),

  /** Lightbulb — FAQ / help */
  Help: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
    </svg>
  ),

  /** Bot / robot — settings */
  Bot: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      <circle cx="9" cy="16" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="16" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),

  /** Image — upload */
  Image: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  ),

  /** Stop / square */
  Stop: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">
      <rect x="6" y="6" width="12" height="12" rx="1" />
    </svg>
  ),

  /** Circle dot — idle status */
  Circle: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
    </svg>
  ),
};

/* ── Toolbar Separator ───────────────────────────────────────────────── */

const ToolbarSeparator = () => (
  <span className="yipet-toolbar-separator" aria-hidden="true" />
);

/* ── Component ───────────────────────────────────────────────────────── */

export interface ChatInputProps {
  controller: ChatController;
}

export function ChatInput(props: ChatInputProps) {
  const ctrl = props.controller;
  const s = ctrl.state;
  const disabled = !s.currentSessionId;
  const isProcessing = s.isProcessing;
  const placeholder = '输入消息... (Shift+Enter 换行，Enter 发送)';
  const draftImages = s.draftImages || [];
  const contextEnabled = s.contextEnabled;
  const maxDraftImages = 4;

  // Local refs — function components in React 15 re-execute on every render,
  // so these act as per-render mutable state.
  let textareaEl: HTMLTextAreaElement | null = null;
  let imageInputEl: HTMLInputElement | null = null;
  let isComposing = false;
  let compositionEndTime = 0;

  const getText = () => (textareaEl ? textareaEl.value.trim() : '');
  const hasContent = () => !!textareaEl?.value.trim() || draftImages.length > 0;

  const autoResize = () => {
    if (!textareaEl) return;
    textareaEl.style.height = 'auto';
    textareaEl.style.height = Math.max(60, textareaEl.scrollHeight || 60) + 'px';
  };

  const onInput = () => {
    autoResize();
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (!textareaEl) return;
    const key = e.key;

    if (key === 'Escape') {
      e.preventDefault();
      textareaEl.value = '';
      textareaEl.style.height = '60px';
      textareaEl.blur();
      return;
    }

    if (key !== 'Enter') return;
    if (
      (e as unknown as Record<string, unknown>).isComposing ||
      (e as unknown as Record<string, unknown>).keyCode === 229 ||
      isComposing
    )
      return;
    if (compositionEndTime > 0 && Date.now() - compositionEndTime < 100) return;
    if (e.shiftKey) return;

    e.preventDefault();
    const text = getText();
    const imgs = draftImages.length > 0 ? draftImages : undefined;
    if ((!text && !imgs) || isProcessing) return;
    ctrl.sendMessage(text, imgs);
    if (textareaEl) {
      textareaEl.value = '';
      textareaEl.style.height = '60px';
    }
  };

  const onCompositionStart = () => { isComposing = true; compositionEndTime = 0; };
  const onCompositionUpdate = () => { isComposing = true; compositionEndTime = 0; };
  const onCompositionEnd = () => { isComposing = false; compositionEndTime = Date.now(); };

  const onPaste = (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    const imageItems: DataTransferItem[] = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) imageItems.push(items[i]);
    }
    if (imageItems.length === 0) {
      setTimeout(() => autoResize(), 0);
      return;
    }
    e.preventDefault();

    const remaining = maxDraftImages - draftImages.length;
    const toRead = imageItems.slice(0, remaining);
    let loaded = 0;
    const sources: string[] = [];
    toRead.forEach((item) => {
      const file = item.getAsFile();
      if (!file) { loaded++; return; }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const src = ev.target?.result as string;
        if (src) sources.push(src);
        loaded++;
        if (loaded === toRead.length) ctrl.addDraftImages(sources);
      };
      reader.onerror = () => { loaded++; if (loaded === toRead.length) ctrl.addDraftImages(sources); };
      reader.readAsDataURL(file);
    });
  };

  const handleSend = () => {
    const t = getText();
    const imgs = draftImages.length > 0 ? draftImages : undefined;
    if (!t && !imgs) return;
    ctrl.sendMessage(t, imgs);
    if (textareaEl) {
      textareaEl.value = '';
      textareaEl.style.height = '60px';
    }
  };

  const onImageClick = () => {
    if (imageInputEl) imageInputEl.click();
  };

  const onImageInputChange = (e: { target: { value: string; files?: FileList | null } }) => {
    const target = e.target as HTMLInputElement;
    const files = Array.from(target.files || []);
    if (files.length === 0) return;
    const imageFiles = files.filter((f) => f.type.startsWith('image/'));
    const remaining = maxDraftImages - draftImages.length;
    if (remaining <= 0) return;
    const toProcess = imageFiles.slice(0, remaining);
    let loaded = 0;
    const sources: string[] = [];
    toProcess.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const src = ev.target?.result as string;
        if (src) sources.push(src);
        loaded++;
        if (loaded === toProcess.length) ctrl.addDraftImages(sources);
      };
      reader.onerror = () => { loaded++; if (loaded === toProcess.length) ctrl.addDraftImages(sources); };
      reader.readAsDataURL(file);
    });
    target.value = '';
  };

  /* ── Render ────────────────────────────────────────────────────────── */

  return (
    <div className="yipet-chat-input-container">
      {/* Toolbar */}
      <div className="yipet-chat-toolbar" role="toolbar" aria-label="会话工具栏">
        <div className="yipet-chat-toolbar-left">
          {/* Session actions */}
          <button type="button" className="yipet-toolbar-btn" title="编辑页面上下文" aria-label="页面上下文" onClick={() => ctrl.openContextEditor()}>
            <Icons.PageContext />
          </button>
          <button type="button" className="yipet-toolbar-btn" title="编辑会话标题" aria-label="编辑会话" id="edit-session-btn" disabled={!s.currentSessionId} onClick={() => ctrl.editSessionInfo()}>
            <Icons.Edit />
          </button>

          <ToolbarSeparator />

          {/* Content organization */}
          <button type="button" className="yipet-toolbar-btn" title="会话标签" aria-label="标签管理" onClick={() => ctrl.openTagManager()}>
            <Icons.Tag />
          </button>
          <button type="button" className="yipet-toolbar-btn" title="常见问题" aria-label="常见问题" onClick={() => ctrl.openFaqManager()}>
            <Icons.Help />
          </button>

          <ToolbarSeparator />

          {/* Configuration & media */}
          <button type="button" className="yipet-toolbar-btn" title="机器人设置" aria-label="机器人设置" onClick={() => ctrl.openWeChatSettings()}>
            <Icons.Bot />
          </button>
          <button type="button" className="yipet-toolbar-btn yipet-toolbar-btn--image" title="上传图片 (支持粘贴)" aria-label="上传图片" onClick={onImageClick}>
            <Icons.Image />
          </button>
          <input
            ref={(el: HTMLInputElement | null) => { imageInputEl = el; }}
            type="file" accept="image/*" multiple
            style={{ display: 'none' }}
            id="yipet-chat-image-input"
            onChange={onImageInputChange}
          />
        </div>

        <div className="yipet-chat-toolbar-right">
          {/* Context toggle switch */}
          <div
            className={'yipet-context-switch' + (contextEnabled ? ' active' : '')}
            title={contextEnabled ? '页面上下文已开启：AI 会参考当前页面内容' : '页面上下文已关闭'}
            role="switch"
            aria-checked={contextEnabled ? 'true' : 'false'}
            aria-label="页面上下文开关"
            tabIndex={0}
            onClick={() => ctrl.toggleContext()}
            onKeyDown={(e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ctrl.toggleContext(); } }}
          >
            <span className="yipet-context-switch-label">上下文</span>
            <div className="yipet-context-switch-track">
              <div className="yipet-context-switch-thumb" />
            </div>
            <input type="checkbox" checked={contextEnabled} style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }} readOnly tabIndex={-1} />
          </div>

          {/* Request status button */}
          <button
            type="button"
            id="request-status-btn"
            className={'yipet-status-btn' + (isProcessing ? ' active' : '')}
            aria-label={isProcessing ? '终止请求' : '请求空闲'}
            title={isProcessing ? '点击终止请求' : '空闲'}
            disabled={!isProcessing}
            aria-pressed={isProcessing ? 'true' : 'false'}
            onClick={() => ctrl.abortRequest()}
          >
            {isProcessing ? <Icons.Stop /> : <Icons.Circle />}
          </button>
        </div>
      </div>

      {/* Draft Images */}
      {draftImages.length > 0 ? (
        <div className="yipet-draft-images" aria-label="待发送图片">
          {draftImages.map((src, idx) => (
            <div key={`draft-${idx}`} className="yipet-draft-image">
              <img
                src={src}
                alt={`待发送图片 ${idx + 1}`}
                className="yipet-draft-image-preview"
              />
              <button
                type="button"
                className="yipet-draft-image-remove"
                aria-label={`移除第 ${idx + 1} 张图片`}
                title="移除"
                onClick={() => ctrl.removeDraftImage(idx)}
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            className="yipet-draft-images-clear"
            aria-label={`清空所有 ${draftImages.length} 张图片`}
            title="清空所有图片"
            onClick={() => ctrl.clearDraftImages()}
          >
            清空 ({draftImages.length})
          </button>
        </div>
      ) : null}

      {/* Input row */}
      <div className="yipet-chat-input-row">
        <textarea
          id="yipet-chat-input"
          className="yipet-chat-textarea"
          placeholder={placeholder}
          disabled={disabled}
          style={{ height: '60px' }}
          rows={1}
          aria-label="会话输入框"
          ref={(el: HTMLTextAreaElement | null) => { textareaEl = el; }}
          onInput={onInput}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          onCompositionStart={onCompositionStart}
          onCompositionUpdate={onCompositionUpdate}
          onCompositionEnd={onCompositionEnd}
        />
        {!isProcessing ? (
          <button
            type="button"
            className={'yipet-send-btn' + (hasContent() ? ' has-content' : '')}
            disabled={disabled || !hasContent()}
            onClick={handleSend}
            title="发送 (Enter)"
            aria-label="发送消息"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        ) : (
          <button
            type="button"
            className="yipet-stop-btn"
            onClick={() => ctrl.abortRequest()}
            title="停止生成"
            aria-label="停止生成"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <rect x="6" y="6" width="12" height="12" rx="1" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

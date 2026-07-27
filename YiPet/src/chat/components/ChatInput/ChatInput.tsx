/**
 * YiPet Chat — ChatInput Component
 * Includes toolbar, draft images, and textarea with send/stop controls.
 */

import './ChatInput.css';
import type { ChatController } from '@/chat/controller';

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

  return (
    <div className="yipet-chat-input-container">
      {/* Toolbar */}
      <div className="yipet-chat-toolbar">
        <div className="yipet-chat-toolbar-left">
          <button type="button" className="yipet-toolbar-btn" title="编辑页面上下文" aria-label="页面上下文" onClick={() => ctrl.openContextEditor()}>📝</button>
          <button type="button" className="yipet-toolbar-btn" title="编辑会话标题" aria-label="编辑会话" id="edit-session-btn" disabled={!s.currentSessionId} onClick={() => ctrl.editSessionInfo()}>✏️</button>
          <button type="button" className="yipet-toolbar-btn" title="会话标签" aria-label="标签管理" onClick={() => ctrl.openTagManager()}>🏷️</button>
          <button type="button" className="yipet-toolbar-btn" title="常见问题" aria-label="常见问题" onClick={() => ctrl.openFaqManager()}>💡</button>
          <button type="button" className="yipet-toolbar-btn" title="机器人设置" aria-label="机器人设置" onClick={() => ctrl.openWeChatSettings()}>🤖</button>
          <button type="button" className="yipet-toolbar-btn yipet-toolbar-btn--image" title="上传图片 (支持粘贴)" aria-label="上传图片" onClick={onImageClick}>🖼️</button>
          <input
            ref={(el: HTMLInputElement | null) => { imageInputEl = el; }}
            type="file" accept="image/*" multiple
            style={{ display: 'none' }}
            id="yipet-chat-image-input"
            onChange={onImageInputChange}
          />
        </div>

        <div className="yipet-chat-toolbar-right">
          {/* Context switch */}
          <div
            className={'yipet-context-switch' + (contextEnabled ? ' active' : '')}
            title={contextEnabled ? '页面上下文已开启：AI 会参考当前页面内容' : '页面上下文已关闭'}
            role="switch"
            aria-checked={contextEnabled ? 'true' : 'false'}
            tabIndex={0}
            onClick={() => ctrl.toggleContext()}
            onKeyDown={(e: { key: string }) => { if (e.key === 'Enter' || e.key === ' ') ctrl.toggleContext(); }}
          >
            <span className="yipet-context-switch-label">上下文</span>
            <div className="yipet-context-switch-track">
              <div className="yipet-context-switch-thumb" />
            </div>
            <input type="checkbox" checked={contextEnabled} style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }} readOnly />
          </div>

          {/* Request status button */}
          <button
            type="button"
            id="request-status-btn"
            className={'yipet-status-btn' + (isProcessing ? ' active' : '')}
            aria-label="请求状态"
            title={isProcessing ? '点击终止请求' : '空闲'}
            disabled={!isProcessing}
            onClick={() => ctrl.abortRequest()}
          >
            {isProcessing ? '⏸️' : '⏹️'}
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

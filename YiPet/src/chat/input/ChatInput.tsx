/**
 * YiPet Chat — ChatInput Component
 */

export interface ChatInputProps {
  disabled: boolean;
  isProcessing: boolean;
  placeholder?: string;
  onSend: (text: string) => void;
  onAbort: () => void;
}

export function ChatInput(props: ChatInputProps) {
  const placeholder = props.placeholder || '输入消息... (Shift+Enter 换行，Enter 发送)';

  // Local refs — function components in React 15 re-execute on every render,
  // so these act as per-render mutable state.
  let textareaEl: HTMLTextAreaElement | null = null;
  let isComposing = false;
  let compositionEndTime = 0;

  const getText = () => (textareaEl ? textareaEl.value.trim() : '');
  const hasContent = () => !!(textareaEl && textareaEl.value.trim());

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
    if ((e as unknown as Record<string, unknown>).isComposing || (e as unknown as Record<string, unknown>).keyCode === 229 || isComposing) return;
    if (compositionEndTime > 0 && Date.now() - compositionEndTime < 100) return;
    if (e.shiftKey) return;

    e.preventDefault();
    const text = getText();
    if (!text || props.isProcessing) return;
    props.onSend(text);
    textareaEl.value = '';
    textareaEl.style.height = '60px';
  };

  const onCompositionStart = () => { isComposing = true; compositionEndTime = 0; };
  const onCompositionUpdate = () => { isComposing = true; compositionEndTime = 0; };
  const onCompositionEnd = () => { isComposing = false; compositionEndTime = Date.now(); };

  const onPaste = () => {
    setTimeout(() => { autoResize(); }, 0);
  };

  const handleSend = () => {
    const t = getText();
    if (t) {
      props.onSend(t);
      if (textareaEl) { textareaEl.value = ''; textareaEl.style.height = '60px'; }
    }
  };

  return (
    <div className="yipet-chat-input-container">
      <div className="yipet-chat-input-row">
        <textarea
          id="yipet-chat-input"
          className="yipet-chat-textarea"
          placeholder={placeholder}
          disabled={props.disabled}
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
        {!props.isProcessing
          ? (
            <button
              className={'yipet-send-btn' + (hasContent() ? ' has-content' : '')}
              disabled={props.disabled || !hasContent()}
              onClick={handleSend}
              title="发送 (Enter)"
              aria-label="发送消息"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
            )
          : (
            <button
              className="yipet-stop-btn"
              onClick={props.onAbort}
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

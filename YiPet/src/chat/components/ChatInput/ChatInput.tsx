/**
 * YiPet Chat — ChatInput (rewritten)
 * Composition: ChatToolbar + DraftImageList + QuickButtons + TextArea + char count.
 */

import { FileSearchOutlined, PartitionOutlined } from '@ant-design/icons';
import { Input, Typography } from 'antd';
import type { KeyboardEvent } from 'react';
import { useMemo, useRef, useState } from 'react';
import type { ChatController } from '@/chat/controller';
import { ChatToolbar } from '../ChatToolbar/ChatToolbar';
import { DraftImageList } from '../DraftImageList/DraftImageList';
import { FileMentionDropdown } from '../FileMentionDropdown/FileMentionDropdown';
import { QuickButtons } from '../QuickButtons/QuickButtons';

const { TextArea } = Input;

const MAX_DRAFT_IMAGES = 4;

type SpeechRecognitionCtor = new () => {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((e: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  if (typeof w.SpeechRecognition === 'function') return w.SpeechRecognition;
  if (typeof w.webkitSpeechRecognition === 'function') return w.webkitSpeechRecognition;
  return null;
}

export interface ChatInputProps {
  controller: ChatController;
}

export function ChatInput(props: ChatInputProps) {
  const ctrl = props.controller;
  const s = ctrl.state;
  const disabled = !s.currentSessionId;
  const placeholder = 'Type a message... (Shift+Enter for newline, Enter to send)';
  const draftImages = s.draftImages || [];
  const voiceSupported = !!getSpeechRecognitionCtor();

  const taRef = useRef<HTMLTextAreaElement>(null);
  const [inputValue, setInputValue] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [compositionEndTime, setCompositionEndTime] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<InstanceType<SpeechRecognitionCtor> | null>(null);
  const voiceBaseTextRef = useRef('');
  const lastTemplateRef = useRef('');
  const historyIdxRef = useRef(-1);
  const preHistoryInputRef = useRef('');

  // ── @-mention file detection ──
  // Visible when the user has typed `@` at start-of-word, with no spaces
  // between the `@` and the cursor. `query` is whatever follows `@`.
  const { mentionVisible, mentionQuery, mentionAtIdx } = useMemo(() => {
    const text = inputValue;
    const ta = taRef.current;
    const caret = ta?.selectionStart ?? text.length;
    const lastAt = text.lastIndexOf('@', Math.min(caret, text.length));
    if (lastAt < 0) return { mentionVisible: false, mentionQuery: '', mentionAtIdx: -1 };
    // @ must be at start or preceded by whitespace
    if (lastAt > 0 && !/\s/.test(text[lastAt - 1])) {
      return { mentionVisible: false, mentionQuery: '', mentionAtIdx: -1 };
    }
    const after = text.slice(lastAt + 1, caret);
    // No spaces allowed inside the @query (one word)
    if (after.includes(' ')) {
      return { mentionVisible: false, mentionQuery: '', mentionAtIdx: -1 };
    }
    return { mentionVisible: true, mentionQuery: after, mentionAtIdx: lastAt };
  }, [inputValue]);

  const onMentionSelect = (path: string) => {
    if (mentionAtIdx < 0) return;
    const before = inputValue.slice(0, mentionAtIdx);
    const after = inputValue.slice(mentionAtIdx + 1 + mentionQuery.length);
    const next = (before + after).trim();
    setInputValue(next);
    ctrl.setRagScopeFromNode(path, true);
    if (!ctrl.state.knowledgeGrounded) ctrl.toggleKnowledgeGrounded();
  };

  // Sync template pushed from QuickButtons → input
  if (s.inputTemplate && s.inputTemplate !== lastTemplateRef.current) {
    lastTemplateRef.current = s.inputTemplate;
    setInputValue(s.inputTemplate);
  }

  const hasContent = !!inputValue.trim() || draftImages.length > 0;

  const send = () => {
    const text = inputValue.trim();
    const imgs = draftImages.length > 0 ? draftImages : undefined;
    if (!text && !imgs) return;
    ctrl.sendMessage(text, imgs);
    setInputValue('');
    lastTemplateRef.current = '';
    historyIdxRef.current = -1;
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Mention dropdown is open — let it own navigation keys.
    if (mentionVisible) {
      if (e.key === 'Escape') {
        e.preventDefault();
        // Strip the @query so the dropdown stays closed next time.
        if (mentionAtIdx >= 0) {
          const before = inputValue.slice(0, mentionAtIdx);
          const after = inputValue.slice(mentionAtIdx + 1 + mentionQuery.length);
          setInputValue((before + after).trim());
        }
        return;
      }
      if (e.key === 'Enter' && !e.shiftKey) {
        // If matches exist, pick the first one instead of sending.
        const matches = ctrl.knowledgeFileMatches(mentionQuery, 1);
        if (matches.length > 0) {
          e.preventDefault();
          onMentionSelect(matches[0].path);
          return;
        }
        // No matches → fall through to send
      }
      // When mention is open, swallow ArrowUp/Down so they don't trigger
      // prompt history recall. (A future iteration could walk the dropdown.)
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        return;
      }
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      setInputValue('');
      historyIdxRef.current = -1;
      return;
    }
    if (e.key === 'Enter') {
      if (e.nativeEvent.isComposing || isComposing) return;
      if (compositionEndTime > 0 && Date.now() - compositionEndTime < 100) return;
      if (e.shiftKey) return;
      e.preventDefault();
      if (s.isProcessing) return;
      send();
      return;
    }
    // Prompt history navigation (Pi-inspired shell recall).
    // ArrowUp at caret 0 / empty input → recall older prompt.
    // ArrowDown at caret end while navigating → recall newer (or clear).
    if (!e.metaKey && !e.ctrlKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      const ta = taRef.current;
      const caret = ta?.selectionStart ?? inputValue.length;
      const atStart = caret === 0;
      const atEnd = caret === inputValue.length;
      if (e.key === 'ArrowUp' && (atStart || !inputValue)) {
        if (historyIdxRef.current === -1) preHistoryInputRef.current = inputValue;
        const rec = ctrl.recallPromptHistory(-1, historyIdxRef.current);
        if (rec) {
          e.preventDefault();
          historyIdxRef.current = rec.idx;
          setInputValue(rec.text);
        }
        return;
      }
      if (e.key === 'ArrowDown' && atEnd && historyIdxRef.current !== -1) {
        const rec = ctrl.recallPromptHistory(1, historyIdxRef.current);
        e.preventDefault();
        if (rec && rec.idx === -1) {
          historyIdxRef.current = -1;
          setInputValue(preHistoryInputRef.current);
        } else if (rec) {
          historyIdxRef.current = rec.idx;
          setInputValue(rec.text);
        }
        return;
      }
    }
  };

  const onPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    const imageItems: DataTransferItem[] = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) imageItems.push(items[i]);
    }
    if (imageItems.length === 0) return;
    e.preventDefault();
    const remaining = MAX_DRAFT_IMAGES - draftImages.length;
    const toRead = imageItems.slice(0, remaining);
    let loaded = 0;
    const sources: string[] = new Array(toRead.length);
    toRead.forEach((item, i) => {
      const file = item.getAsFile();
      if (!file) {
        loaded++;
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const src = ev.target?.result as string;
        if (src) sources[i] = src;
        loaded++;
        if (loaded === toRead.length) ctrl.addDraftImages(sources.filter(Boolean));
      };
      reader.onerror = () => {
        loaded++;
        if (loaded === toRead.length) ctrl.addDraftImages(sources.filter(Boolean));
      };
      reader.readAsDataURL(file);
    });
  };

  const onVoiceClick = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      recognitionRef.current = null;
      setIsRecording(false);
      return;
    }
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      ctrl.notifyVoiceUnsupported();
      return;
    }
    const ta = taRef.current;
    if (!ta) return;
    const rec = new Ctor();
    rec.lang = 'en-US';
    rec.interimResults = true;
    rec.continuous = true;
    voiceBaseTextRef.current = inputValue;
    rec.onresult = (e) => {
      let interim = '';
      let finalText = '';
      const r = e?.results;
      if (!r) return;
      for (let i = 0; i < r.length; i++) {
        const res = r[i];
        if (!res) continue;
        const txt = String(res[0]?.transcript || '');
        if (i < r.length - 1) finalText += txt;
        else interim += txt;
      }
      const next = voiceBaseTextRef.current + finalText + interim;
      setInputValue(next);
    };
    rec.onerror = (e) => {
      const code = e?.error || '';
      if (code === 'not-allowed' || code === 'service-not-allowed') {
        ctrl.notifyVoicePermissionDenied();
      }
      recognitionRef.current = null;
      setIsRecording(false);
    };
    rec.onend = () => {
      if (recognitionRef.current === rec) {
        recognitionRef.current = null;
        setIsRecording(false);
      }
    };
    try {
      rec.start();
      recognitionRef.current = rec;
      setIsRecording(true);
    } catch (err) {
      ctrl.notifyVoiceStartFailed((err as Error)?.message || 'Unknown error');
    }
  };

  const onClearInputClick = () => {
    setInputValue('');
    lastTemplateRef.current = '';
    if (draftImages.length > 0) ctrl.clearDraftImages();
  };

  return (
    <div className="yipet-chat-input-container">
      <ChatToolbar
        controller={ctrl}
        voiceSupported={voiceSupported}
        isRecording={isRecording}
        onVoiceClick={onVoiceClick}
        hasContent={hasContent}
        onClearInput={onClearInputClick}
      />

      {draftImages.length > 0 && (
        <DraftImageList
          images={draftImages}
          onRemove={(idx) => ctrl.removeDraftImage(idx)}
          onClear={() => ctrl.clearDraftImages()}
        />
      )}

      <QuickButtons controller={ctrl} />

      <div className="yipet-chat-input-row" style={{ position: 'relative' }}>
        <FileMentionDropdown
          controller={ctrl}
          query={mentionQuery}
          visible={mentionVisible}
          onClose={() => {
            // Strip the @ to dismiss the dropdown.
            if (mentionAtIdx >= 0) {
              const before = inputValue.slice(0, mentionAtIdx);
              const after = inputValue.slice(mentionAtIdx + 1 + mentionQuery.length);
              setInputValue((before + after).trim());
            }
          }}
          onSelect={onMentionSelect}
        />
        <TextArea
          ref={taRef as never}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          onCompositionStart={() => {
            setIsComposing(true);
            setCompositionEndTime(0);
          }}
          onCompositionUpdate={() => {
            setIsComposing(true);
            setCompositionEndTime(0);
          }}
          onCompositionEnd={() => {
            setIsComposing(false);
            setCompositionEndTime(Date.now());
          }}
          placeholder={placeholder}
          disabled={disabled}
          autoSize={{ minRows: 3, maxRows: 3 }}
          style={{ flex: 1, minHeight: 0 }}
          aria-label="Conversation input"
        />
        <div className="yipet-chat-input-meta">
          {s.knowledgeGrounded && (
            <>
              <button
                type="button"
                className="yipet-chat-preview-btn"
                onClick={() => ctrl.previewRagSources(inputValue)}
                disabled={
                  s.isProcessing ||
                  s.ragPreviewLoading ||
                  s.ragDecomposeLoading ||
                  !inputValue.trim()
                }
                title="Preview RAG sources (no LLM call)"
                aria-label="Preview RAG sources"
              >
                <FileSearchOutlined /> Preview sources
              </button>
              <button
                type="button"
                className="yipet-chat-preview-btn"
                onClick={() => ctrl.decomposeRagQuestion(inputValue)}
                disabled={
                  s.isProcessing ||
                  s.ragPreviewLoading ||
                  s.ragDecomposeLoading ||
                  !inputValue.trim()
                }
                title="Decompose into sub-questions (synchronous, may take a while)"
                aria-label="Decompose into sub-questions"
              >
                <PartitionOutlined /> Decompose
              </button>
            </>
          )}
          <Typography.Text type="secondary" style={{ fontSize: 11 }}>
            {inputValue.length} chars
          </Typography.Text>
        </div>
      </div>
    </div>
  );
}

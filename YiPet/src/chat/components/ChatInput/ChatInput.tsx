/**
 * YiPet Chat — ChatInput (rewritten)
 * Composition: ChatToolbar + DraftImageList + QuickButtons + TextArea + char count.
 */
import { Input, Typography } from 'antd';
import type { KeyboardEvent } from 'react';
import { useRef, useState } from 'react';
import type { ChatController } from '@/chat/controller';
import { ChatToolbar } from '../ChatToolbar/ChatToolbar';
import { DraftImageList } from '../DraftImageList/DraftImageList';
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
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setInputValue('');
      return;
    }
    if (e.key !== 'Enter') return;
    if (e.nativeEvent.isComposing || isComposing) return;
    if (compositionEndTime > 0 && Date.now() - compositionEndTime < 100) return;
    if (e.shiftKey) return;
    e.preventDefault();
    if (s.isProcessing) return;
    send();
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

      <div className="yipet-chat-input-row">
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
          <Typography.Text type="secondary" style={{ fontSize: 11 }}>
            {inputValue.length} chars
          </Typography.Text>
        </div>
      </div>
    </div>
  );
}

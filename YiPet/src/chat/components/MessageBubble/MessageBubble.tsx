/**
 * YiPet Chat — MessageBubble (rewritten)
 * Mirrors YiVad aiChat MessageBubble: typing indicator, error/aborted tags,
 * multi-image, copy feedback, like/dislike, retry label.
 */

import {
  BranchesOutlined,
  CopyOutlined,
  DeleteOutlined,
  DislikeFilled,
  DislikeOutlined,
  EditOutlined,
  ExportOutlined,
  FileSearchOutlined,
  LikeFilled,
  LikeOutlined,
  ReloadOutlined,
  SaveOutlined,
  SendOutlined,
} from '@ant-design/icons';
import { Button, Modal, Tooltip, Typography } from 'antd';
import { useEffect, useRef, useState } from 'react';
import type { ChatController } from '@/chat/controller';
import type { Message } from '@/chat/types';
import { addCodeCopyButtons, formatTime, renderMarkdown, runMermaid } from '@/chat/utils';
import './MessageBubble.css';

export interface MessageBubbleProps {
  controller: ChatController;
  message: Message;
  index: number;
  totalMessages: number;
}

export function MessageBubble(props: MessageBubbleProps) {
  const { controller: ctrl, message: msg, index } = props;
  const s = ctrl.state;
  const isUser = msg.type === 'user';
  const hasContent = !!(msg.content || '').trim();
  const images = msg.imageDataUrls ?? (msg.imageDataUrl ? [msg.imageDataUrl] : []);
  const empty = !hasContent && images.length === 0;
  const streaming = !!msg.streaming;
  const copyState = s.copyFeedback[String(msg.timestamp)] || '';
  const rating = s.feedback[msg.timestamp] || null;
  const showRetryLabel = !!(msg.error || msg.aborted);
  // Sources are tied to the latest grounded turn — render only under the
  // last pet message when ragSources is non-empty.
  const isLastPet =
    !isUser && index === props.totalMessages - 1 && s.ragSources.length > 0 && s.knowledgeGrounded;

  // local edit modal state
  const [editOpen, setEditOpen] = useState(false);
  const [editValue, setEditValue] = useState('');

  const markdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (editOpen) setEditValue(msg.content || '');
  }, [editOpen, msg.content]);

  // Post-process rendered markdown once streaming settles: add per-code-block
  // copy buttons and render any mermaid diagrams. Skipped mid-stream so the
  // DOM isn't decorated on every token delta.
  useEffect(() => {
    if (streaming) return;
    const el = markdownRef.current;
    if (!el) return;
    addCodeCopyButtons(el);
    void runMermaid(el);
  }, [msg.content, streaming]);

  const onEditSave = () => {
    ctrl.editMessage(index, editValue);
    setEditOpen(false);
  };

  const onDeleteConfirm = () => {
    Modal.confirm({
      title: 'Delete message',
      content: 'Delete this message?',
      okText: 'Delete',
      cancelText: 'Cancel',
      okButtonProps: { danger: true },
      onOk: () => ctrl.deleteMessage(index),
    });
  };

  return (
    <div
      className={`mb-bubble ${isUser ? 'mb-bubble--user' : 'mb-bubble--pet'} ${
        msg.error ? 'mb-bubble--error' : ''
      } ${msg.aborted ? 'mb-bubble--aborted' : ''}`}
      data-chat-idx={String(index)}
    >
      <div className="mb-content">
        {images.length > 0 && (
          <div className="mb-images">
            {images.map((src, i) => (
              <img
                key={`img-${i}-${src.slice(0, 12)}`}
                src={src}
                alt={`Image ${i + 1}`}
                className="mb-image"
              />
            ))}
          </div>
        )}
        {empty && !streaming ? (
          <div className="mb-empty" />
        ) : streaming && !hasContent ? (
          <div className="mb-typing" aria-label="Generating">
            <span className="mb-dot" />
            <span className="mb-dot" />
            <span className="mb-dot" />
          </div>
        ) : (
          <div className="mb-markdown-wrap">
            <div
              ref={markdownRef}
              className="mb-markdown markdown-content"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content || '') }}
            />
            {streaming && <span className="mb-caret" aria-hidden="true" />}
          </div>
        )}
        {msg.error && <div className="mb-tag mb-tag--error">Generation failed</div>}
        {msg.aborted && !msg.error && <div className="mb-tag mb-tag--aborted">Stopped</div>}
        {isLastPet && (
          <div className="mb-sources" role="list" aria-label="RAG sources">
            <div className="mb-sources__title">
              <FileSearchOutlined /> Sources
            </div>
            <ul className="mb-sources__list">
              {s.ragSources.map((src, i) => (
                <li key={`src-${i}-${src.path}`} className="mb-sources__item">
                  <span className="mb-sources__path" title={src.path}>
                    {src.path}
                  </span>
                  {typeof src.score === 'number' && (
                    <span className="mb-sources__score">{src.score.toFixed(3)}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="mb-meta">
        <div className="mb-actions">
          {!isUser ? (
            <>
              <Tooltip title="Copy">
                <Button
                  type="text"
                  size="small"
                  icon={<CopyOutlined />}
                  onClick={() => ctrl.copyMessage(msg.content || '', msg.timestamp)}
                >
                  {copyState === 'copied' ? 'copied' : ''}
                </Button>
              </Tooltip>
              <Tooltip title={showRetryLabel ? 'Retry' : 'Regenerate'}>
                <Button
                  type="text"
                  size="small"
                  icon={<ReloadOutlined />}
                  disabled={s.isProcessing}
                  onClick={() => ctrl.regenerateMessage(index)}
                >
                  {showRetryLabel ? 'Retry' : 'Regenerate'}
                </Button>
              </Tooltip>
              <Tooltip title="Delete">
                <Button
                  type="text"
                  size="small"
                  icon={<DeleteOutlined />}
                  disabled={s.isProcessing}
                  onClick={onDeleteConfirm}
                />
              </Tooltip>
              <Tooltip title="Like">
                <Button
                  type="text"
                  size="small"
                  icon={rating === 'like' ? <LikeFilled /> : <LikeOutlined />}
                  className={rating === 'like' ? 'mb-action--active' : ''}
                  onClick={() => ctrl.submitFeedback(msg.timestamp, 'like')}
                />
              </Tooltip>
              <Tooltip title="Dislike">
                <Button
                  type="text"
                  size="small"
                  danger={rating === 'dislike'}
                  icon={rating === 'dislike' ? <DislikeFilled /> : <DislikeOutlined />}
                  onClick={() => ctrl.submitFeedback(msg.timestamp, 'dislike')}
                />
              </Tooltip>
              <Tooltip title="Save to YiKnowledge">
                <Button
                  type="text"
                  size="small"
                  icon={<SaveOutlined />}
                  disabled={s.isProcessing || !hasContent}
                  onClick={() => ctrl.openSaveToKnowledge(msg.timestamp)}
                  aria-label="Save to YiKnowledge"
                />
              </Tooltip>
              <Tooltip title="Open in YiVad aiChat">
                <Button
                  type="text"
                  size="small"
                  icon={<ExportOutlined />}
                  disabled={s.isProcessing || !hasContent}
                  onClick={() => ctrl.openMessageInYiVad(msg.timestamp)}
                  aria-label="Open in YiVad aiChat"
                />
              </Tooltip>
              <Tooltip title="Branch from here — new session with messages up to this point">
                <Button
                  type="text"
                  size="small"
                  icon={<BranchesOutlined />}
                  disabled={s.isProcessing}
                  onClick={() => ctrl.branchFromMessage(msg.timestamp)}
                  aria-label="Branch from here"
                />
              </Tooltip>
            </>
          ) : (
            <>
              <Tooltip title="Edit">
                <Button
                  type="text"
                  size="small"
                  icon={<EditOutlined />}
                  disabled={s.isProcessing}
                  onClick={() => setEditOpen(true)}
                />
              </Tooltip>
              <Tooltip title="Branch from here — new session with messages up to this point">
                <Button
                  type="text"
                  size="small"
                  icon={<BranchesOutlined />}
                  disabled={s.isProcessing}
                  onClick={() => ctrl.branchFromMessage(msg.timestamp)}
                  aria-label="Branch from here"
                />
              </Tooltip>
              <Tooltip title="Resend">
                <Button
                  type="text"
                  size="small"
                  icon={<SendOutlined />}
                  disabled={s.isProcessing}
                  onClick={() => ctrl.resendMessage(index)}
                />
              </Tooltip>
              <Tooltip title="Delete">
                <Button
                  type="text"
                  size="small"
                  icon={<DeleteOutlined />}
                  disabled={s.isProcessing}
                  onClick={onDeleteConfirm}
                />
              </Tooltip>
            </>
          )}
        </div>
        <time className="mb-time" dateTime={new Date(msg.timestamp).toISOString()}>
          {formatTime(msg.timestamp)}
        </time>
        <Tooltip
          title={`${isUser ? 'Input' : 'Output'} · ~${Math.ceil(
            (msg.content || '').length / 4,
          )} tok · ${(msg.content || '').length} chars (coarse chars/4 estimate)`}
          placement="left"
        >
          <span className={`mb-token-chip mb-token-chip--${isUser ? 'in' : 'out'}`}>
            ~{Math.ceil((msg.content || '').length / 4)}t
          </span>
        </Tooltip>
      </div>

      <Modal
        title="Edit message"
        open={editOpen}
        onOk={onEditSave}
        onCancel={() => setEditOpen(false)}
        okText="Save"
        cancelText="Cancel"
        zIndex={2147483647}
      >
        <Typography.Paragraph>
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            rows={5}
            style={{ width: '100%', resize: 'vertical' }}
            aria-label="Edit message content"
          />
        </Typography.Paragraph>
      </Modal>
    </div>
  );
}

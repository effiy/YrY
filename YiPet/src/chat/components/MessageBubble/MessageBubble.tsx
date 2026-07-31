/**
 * YiPet Chat — MessageBubble (rewritten)
 * Mirrors YiVad aiChat MessageBubble: typing indicator, error/aborted tags,
 * multi-image, copy feedback, like/dislike, retry label.
 */

import {
  CopyOutlined,
  DeleteOutlined,
  DislikeFilled,
  DislikeOutlined,
  EditOutlined,
  LikeFilled,
  LikeOutlined,
  ReloadOutlined,
  SendOutlined,
} from '@ant-design/icons';
import { Button, Modal, Tooltip, Typography } from 'antd';
import { useEffect, useState } from 'react';
import type { ChatController } from '@/chat/controller';
import type { Message } from '@/chat/types';
import { formatTime, renderMarkdown } from '@/chat/utils';
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

  // local edit modal state
  const [editOpen, setEditOpen] = useState(false);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    if (editOpen) setEditValue(msg.content || '');
  }, [editOpen, msg.content]);

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
        ) : streaming ? (
          <div className="mb-typing" aria-label="Generating">
            <span className="mb-dot" />
            <span className="mb-dot" />
            <span className="mb-dot" />
          </div>
        ) : (
          <div
            className="mb-markdown markdown-content"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content || '') }}
          />
        )}
        {msg.error && <div className="mb-tag mb-tag--error">Generation failed</div>}
        {msg.aborted && !msg.error && <div className="mb-tag mb-tag--aborted">Stopped</div>}
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

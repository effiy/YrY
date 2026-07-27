/**
 * YiPet Chat — MessageBubble Component
 */

import type { Message } from '@/chat/types';
import { formatTime, renderMarkdown } from '@/chat/utils';

export interface MessageBubbleProps {
  key?: string | number;
  message: Message;
  index: number;
  totalMessages: number;
  isProcessing: boolean;
  onCopy: (text: string) => void;
  onEdit: (index: number) => void;
  onResend: (index: number) => void;
  onDelete: (index: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onRegenerate: (index: number) => void;
}

export function MessageBubble(props: MessageBubbleProps) {
  const msg = props.message;
  const isUser = msg.type === 'user';
  const classes = ['yipet-chat-message', 'pet-chat-message', isUser ? 'is-user' : 'is-pet'];
  if (msg.streaming) classes.push('is-streaming');
  if (msg.error) classes.push('is-error');

  const contentHtml = renderMarkdown(msg.content || '');
  const hasContent = !!(msg.content || '').trim();
  const canMoveUp = props.index > 0;
  const canMoveDown = props.index < props.totalMessages - 1;
  const canRegenerate = !isUser && hasContent && !msg.streaming;
  const canEdit = isUser && hasContent && !props.isProcessing;

  return (
    <div
      className={classes.join(' ')}
      data-chat-type={msg.type}
      data-chat-idx={String(props.index)}
    >
      <div className="pet-chat-bubble" data-message-type={isUser ? 'user-bubble' : 'pet-bubble'}>
        {/* Image */}
        {msg.imageDataUrl ? (
          <img src={msg.imageDataUrl} className="pet-chat-image" alt="图片消息" />
        ) : null}

        {/* Content */}
        {hasContent ? (
          <div
            className="pet-chat-content markdown-content"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        ) : msg.streaming ? (
          <div className="pet-chat-typing" aria-label="生成中">...</div>
        ) : null}

        {/* Meta: action buttons + time */}
        <div className="pet-chat-meta">
          <div className="pet-chat-meta-actions">
            {/* Copy */}
            {hasContent ? (
              <button
                type="button"
                className="pet-chat-meta-btn"
                title="复制"
                aria-label="复制消息"
                onClick={() => props.onCopy(msg.content)}
              >
                📋
              </button>
            ) : null}

            {/* Edit (user messages only) */}
            {canEdit ? (
              <button
                type="button"
                className="pet-chat-meta-btn"
                title="编辑"
                aria-label="编辑消息"
                onClick={() => props.onEdit(props.index)}
              >
                ✏️
              </button>
            ) : null}

            {/* Resend (user messages only) */}
            {isUser && hasContent ? (
              <button
                type="button"
                className="pet-chat-meta-btn"
                title="重新发送"
                aria-label="重新发送"
                disabled={props.isProcessing}
                onClick={() => props.onResend(props.index)}
              >
                📨
              </button>
            ) : null}

            {/* Move Up */}
            {canMoveUp ? (
              <button
                type="button"
                className="pet-chat-meta-btn"
                title="上移"
                aria-label="上移消息"
                onClick={() => props.onMoveUp(props.index)}
              >
                ⬆️
              </button>
            ) : null}

            {/* Move Down */}
            {canMoveDown ? (
              <button
                type="button"
                className="pet-chat-meta-btn"
                title="下移"
                aria-label="下移消息"
                onClick={() => props.onMoveDown(props.index)}
              >
                ⬇️
              </button>
            ) : null}

            {/* Regenerate (pet messages only) */}
            {canRegenerate ? (
              <button
                type="button"
                className="pet-chat-meta-btn"
                title="重新生成"
                aria-label="重新生成回复"
                disabled={props.isProcessing}
                onClick={() => props.onRegenerate(props.index)}
              >
                🔄
              </button>
            ) : null}

            {/* Delete */}
            <button
              type="button"
              className="pet-chat-meta-btn pet-chat-meta-btn--danger"
              title="删除"
              aria-label="删除消息"
              disabled={props.isProcessing}
              onClick={() => props.onDelete(props.index)}
            >
              🗑️
            </button>
          </div>
          <time
            className="pet-chat-time"
            dateTime={msg.timestamp ? new Date(msg.timestamp).toISOString() : ''}
          >
            {formatTime(msg.timestamp)}
          </time>
        </div>
      </div>
    </div>
  );
}

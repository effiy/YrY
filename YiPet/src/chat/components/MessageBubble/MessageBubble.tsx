/**
 * YiPet Chat — MessageBubble Component
 */

import type { Message } from '../types';
import { renderMarkdown, formatTime } from '../utils';

export interface MessageBubbleProps {
  key?: string | number;
  message: Message;
  index: number;
  onCopy: (text: string) => void;
}

export function MessageBubble(props: MessageBubbleProps) {
  const msg = props.message;
  const isUser = msg.type === 'user';
  const classes = ['yipet-chat-message', 'pet-chat-message', isUser ? 'is-user' : 'is-pet'];
  if (msg.streaming) classes.push('is-streaming');
  if (msg.error) classes.push('is-error');

  const contentHtml = renderMarkdown(msg.content || '');

  return (
    <div className={classes.join(' ')} data-chat-type={msg.type} data-chat-idx={String(props.index)}>
      <div className="pet-chat-bubble" data-message-type={isUser ? 'user-bubble' : 'pet-bubble'}>
        <div
          className="pet-chat-content markdown-content"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
        <div className="pet-chat-meta">
          <div className="pet-chat-meta-actions">
            {(msg.content || '').trim()
              ? (
                <button
                  type="button"
                  className="pet-chat-meta-btn copy-btn"
                  title="复制"
                  aria-label="复制消息"
                  onClick={() => props.onCopy(msg.content)}
                >📋</button>
                )
              : null}
          </div>
          <time className="pet-chat-time" dateTime={msg.timestamp ? new Date(msg.timestamp).toISOString() : ''}>
            {formatTime(msg.timestamp)}
          </time>
        </div>
      </div>
    </div>
  );
}

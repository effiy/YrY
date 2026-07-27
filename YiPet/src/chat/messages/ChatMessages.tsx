/**
 * YiPet Chat — ChatMessages Component
 *
 * Renders loading / error / empty states, the welcome card, and the message list.
 */

import type { Message } from '../types';
import type { PageInfo } from './WelcomeCard';
import { WelcomeCard } from './WelcomeCard';
import { MessageBubble } from './MessageBubble';

export interface ChatMessagesProps {
  messages: Message[];
  viewState: string;
  pageInfo: PageInfo;
  currentSessionMessageCount: number;
  onCopy: (text: string) => void;
}

export function ChatMessages(props: ChatMessagesProps) {
  // Loading state
  if (props.viewState === 'loading') {
    return (
      <div className="yipet-chat-loading" role="status" aria-live="polite">
        <div className="yipet-spinner" aria-hidden="true" />
        <div className="yipet-loading-text">正在加载会话...</div>
      </div>
    );
  }

  // Error state
  if (props.viewState === 'error') {
    return (
      <div className="yipet-chat-error" role="alert">
        <div className="yipet-error-icon" aria-hidden="true">⚠️</div>
        <div className="yipet-error-text">发生错误</div>
      </div>
    );
  }

  // Empty state
  if (props.viewState === 'empty') {
    return (
      <div className="yipet-chat-empty">
        <div className="yipet-empty-card">
          <div className="yipet-empty-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
          </div>
          <div className="yipet-empty-title">未选择会话</div>
          <div className="yipet-empty-subtitle">从左侧会话列表选择一个会话开始聊天</div>
        </div>
      </div>
    );
  }

  // Messages view
  return (
    <div className="yipet-chat-messages-inner">
      <div className="yipet-chat-message pet-chat-message is-pet" data-welcome-message="true">
        <div className="pet-chat-bubble pet-chat-bubble--welcome" data-message-type="pet-bubble">
          <div className="pet-chat-content markdown-content">
            <WelcomeCard
              pageInfo={props.pageInfo}
              messageCount={props.currentSessionMessageCount}
            />
          </div>
        </div>
      </div>
      {props.messages.map((msg, idx) => (
        <MessageBubble
          key={idx}
          message={msg}
          index={idx}
          onCopy={props.onCopy}
        />
      ))}
    </div>
  );
}

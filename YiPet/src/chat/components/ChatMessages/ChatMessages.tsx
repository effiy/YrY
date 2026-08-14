/**
 * YiPet Chat — ChatMessages Component
 *
 * Renders loading / error / empty states, the welcome card, and the message list.
 */
import { Alert, Empty, Spin, Typography } from 'antd';
import type { ChatController } from '@/chat/controller';
import type { Message, PageInfo } from '@/chat/types';
import { MessageBubble, WelcomeCard } from '../';

export interface ChatMessagesProps {
  controller: ChatController;
  messages: Message[];
  viewState: string;
  pageInfo: PageInfo;
  currentSessionMessageCount: number;
}

export function ChatMessages(props: ChatMessagesProps) {
  const ctrl = props.controller;

  if (props.viewState === 'loading') {
    return (
      <div style={{ textAlign: 'center', padding: 24 }}>
        <Spin />
        <div>
          <Typography.Text type="secondary">Loading conversation...</Typography.Text>
        </div>
      </div>
    );
  }

  if (props.viewState === 'error') {
    return (
      <Alert
        type="error"
        message="Error occurred"
        description="Please retry shortly"
        style={{ margin: 16 }}
      />
    );
  }

  if (props.viewState === 'empty') {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="No conversation selected — pick one from the sidebar to start chatting"
        style={{ padding: 32 }}
      />
    );
  }

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
          key={`${msg.timestamp}-${idx}`}
          controller={ctrl}
          message={msg}
          index={idx}
          totalMessages={props.messages.length}
        />
      ))}
    </div>
  );
}

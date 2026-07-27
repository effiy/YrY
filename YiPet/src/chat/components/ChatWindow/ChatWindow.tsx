/**
 * YiPet Chat — ChatWindow Root Component
 */

import type { ChatController } from '@/chat/controller';
import type { PageInfo } from '@/chat/types';
import { ChatHeader, ChatInput, ChatMessages, ChatSidebar } from '../';

export interface ChatWindowRenderProps {
  controller: ChatController;
}

export function ChatWindowRender(props: ChatWindowRenderProps) {
  const ctrl = props.controller;
  const s = ctrl.state;

  if (!s.visible) return null;

  // Compute welcome card data
  const currentSession = s.sessions.find((ses) => ses.id === s.currentSessionId);
  const pageInfo: PageInfo = s.pageInfo || {
    title: document.title || '当前页面',
    url: window.location.href,
    iconUrl: '',
  };
  const messageCount = currentSession?.messageCount || 0;

  return (
    <div
      id="yipet-chat-window"
      className={
        (s.ws.isFullscreen ? 'fullscreen' : '') +
        (s.isDragging ? ' dragging' : '') +
        (s.isResizing ? ' resizing' : '')
      }
      style={
        s.ws.isFullscreen
          ? {}
          : {
              width: s.ws.width + 'px',
              height: s.ws.height + 'px',
              left: s.ws.x + 'px',
              top: s.ws.y + 'px',
              bottom: 'auto',
              right: 'auto',
            }
      }
    >
      <ChatHeader
        title={s.title}
        onClose={ctrl.close}
        onToggleSidebar={ctrl.toggleSidebar}
        onToggleFullscreen={ctrl.toggleFullscreen}
        onMouseDown={ctrl.onHeaderMouseDown}
      />
      <div className="yipet-chat-content-container">
        <ChatSidebar controller={ctrl} />
        <div className="yipet-chat-main-content">
          <div
            id="yipet-chat-messages"
            className="yipet-chat-messages"
            role="log"
            aria-live="polite"
          >
            <ChatMessages
              controller={ctrl}
              messages={s.messages}
              viewState={s.viewState}
              pageInfo={pageInfo}
              currentSessionMessageCount={messageCount}
            />
          </div>
          <ChatInput controller={ctrl} />
        </div>
      </div>

      {/* Notification toast */}
      {s.notification ? (
        <div className={'yipet-notification yipet-notification--' + s.notification.type}>
          {s.notification.message}
        </div>
      ) : null}
      {/* Resize handles */}
      {!s.ws.isFullscreen ? (
        <div
          className="yipet-resize-handle yipet-resize-se"
          role="separator"
          aria-label="resize corner"
          tabIndex={-1}
          onMouseDown={(e: MouseEvent) => {
            ctrl.onResizeMouseDown('se', e);
          }}
        />
      ) : null}
      {!s.ws.isFullscreen ? (
        <div
          className="yipet-resize-handle yipet-resize-sw"
          role="separator"
          aria-label="resize corner"
          tabIndex={-1}
          onMouseDown={(e: MouseEvent) => {
            ctrl.onResizeMouseDown('sw', e);
          }}
        />
      ) : null}
    </div>
  );
}

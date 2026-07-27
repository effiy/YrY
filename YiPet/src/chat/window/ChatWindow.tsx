/**
 * YiPet Chat — ChatWindow Root Component
 */

import type { ChatController } from '../controller';
import type { PageInfo } from '../messages/WelcomeCard';
import { ChatHeader } from '../header/ChatHeader';
import { ChatSidebar } from '../sidebar/ChatSidebar';
import { ChatMessages } from '../messages/ChatMessages';
import { ChatInput } from '../input/ChatInput';

export interface ChatWindowRenderProps {
  controller: ChatController;
}

export function ChatWindowRender(props: ChatWindowRenderProps) {
  const ctrl = props.controller;
  const s = ctrl.state;

  if (!s.visible) return null;

  // Compute welcome card data
  const currentSession = s.sessions.find((ses) => ses.id === s.currentSessionId);
  const pageInfo: PageInfo = s.pageInfo || { title: document.title || '当前页面', url: window.location.href, iconUrl: '' };
  const messageCount = currentSession?.messageCount || 0;

  return (
    <div
      id="yipet-chat-window"
      className={
        (s.ws.isFullscreen ? 'fullscreen' : '') +
        (s.isDragging ? ' dragging' : '') +
        (s.isResizing ? ' resizing' : '')
      }
      style={s.ws.isFullscreen ? {} : {
        width: s.ws.width + 'px',
        height: s.ws.height + 'px',
        left: s.ws.x + 'px',
        top: s.ws.y + 'px',
        bottom: 'auto',
        right: 'auto',
      }}
    >
      <ChatHeader
        title={s.title}
        onClose={ctrl.close}
        onToggleSidebar={ctrl.toggleSidebar}
        onToggleFullscreen={ctrl.toggleFullscreen}
        onMouseDown={ctrl.onHeaderMouseDown}
      />
      <div className="yipet-chat-content-container">
        <ChatSidebar
          sessions={ctrl.filteredSessions}
          currentSessionId={s.currentSessionId}
          searchQuery={s.searchQuery}
          loading={s.sessionLoading}
          collapsed={s.sidebarCollapsed}
          onSelectSession={(id: string) => { ctrl.selectSession(id); }}
          onDeleteSession={(id: string) => { ctrl.deleteSession(id); }}
          onCreateSession={() => { ctrl.createSession(); }}
          onSearchInput={ctrl.onSearchInput}
          onClearSearch={ctrl.clearSearch}
        />
        <div className="yipet-chat-main-content">
          <div id="yipet-chat-messages" className="yipet-chat-messages" role="log" aria-live="polite">
            <ChatMessages
              messages={s.messages}
              viewState={s.viewState}
              pageInfo={pageInfo}
              currentSessionMessageCount={messageCount}
              onCopy={ctrl.copyMessage}
            />
          </div>
          <ChatInput
            disabled={!s.currentSessionId}
            isProcessing={s.isProcessing}
            onSend={ctrl.sendMessage}
            onAbort={ctrl.abortRequest}
          />
        </div>
      </div>
      {/* Resize handles */}
      {!s.ws.isFullscreen ? (
        <div
          className="yipet-resize-handle yipet-resize-se"
          onMouseDown={(e: MouseEvent) => { ctrl.onResizeMouseDown('se', e); }}
        />
      ) : null}
      {!s.ws.isFullscreen ? (
        <div
          className="yipet-resize-handle yipet-resize-sw"
          onMouseDown={(e: MouseEvent) => { ctrl.onResizeMouseDown('sw', e); }}
        />
      ) : null}
    </div>
  );
}

/**
 * YiPet Chat — ChatWindow Root Component
 *
 * Subscribes to the ChatController external store via useSyncExternalStore.
 * Wraps content in antd ConfigProvider + App so message API works and theme
 * follows the active color palette.
 */

import { FileTextOutlined } from '@ant-design/icons';
import { App as AntApp, ConfigProvider, Layout } from 'antd';
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import type { ChatController } from '@/chat/controller';
import type { PageInfo } from '@/chat/types';
import { getAntdTheme } from '@/shared/theme';
import { BugReportDialog } from '../BugReportDialog/BugReportDialog';
import { ChatHeader } from '../ChatHeader/ChatHeader';
import { ChatInput } from '../ChatInput/ChatInput';
import { ChatMessages } from '../ChatMessages/ChatMessages';
import { ChatSidebar } from '../ChatSidebar/ChatSidebar';
import { ContextScopeBar } from '../ContextScopeBar/ContextScopeBar';
import { FaqDialog } from '../FaqDialog/FaqDialog';
import { KnowledgePreviewDialog } from '../KnowledgePreviewDialog/KnowledgePreviewDialog';
import { PageContextEditor } from '../PageContextEditor/PageContextEditor';
import { RagDecomposeDialog } from '../RagDecomposeDialog/RagDecomposeDialog';
import { RagSourcesPreviewDialog } from '../RagSourcesPreviewDialog/RagSourcesPreviewDialog';
import { SaveToKnowledgeDialog } from '../SaveToKnowledgeDialog/SaveToKnowledgeDialog';
import { SessionEditDialog } from '../SessionEditDialog/SessionEditDialog';
import { SessionStatusBar } from '../SessionStatusBar/SessionStatusBar';
import { SessionSummaryDialog } from '../SessionSummaryDialog/SessionSummaryDialog';
import { TagManagerDialog } from '../TagManagerDialog/TagManagerDialog';
import { WeChatSettingsModal } from '../WeChatSettingsModal/WeChatSettingsModal';

const { Sider, Content } = Layout;

export interface ChatWindowProps {
  controller: ChatController;
}

export function ChatWindow(props: ChatWindowProps) {
  const ctrl = props.controller;
  const state = useSyncExternalStore(ctrl.subscribe, ctrl.getSnapshot);
  const { message } = AntApp.useApp();

  // Wire controller._notify to antd message API
  useEffect(() => {
    ctrl.setNotifyHandler((msg, type) => {
      message[type](msg);
    });
  }, [ctrl, message]);

  // Auto-scroll on message updates and during streaming (scrollTick throttled in controller)
  useEffect(() => {
    if (state.visible && state.messages.length > 0) {
      const id = setTimeout(() => ctrl.scrollToBottom(), 50);
      return () => clearTimeout(id);
    }
  }, [state.visible, state.messages.length, state.scrollTick, ctrl]);

  const theme = useMemo(() => getAntdTheme(state.colorIndex), [state.colorIndex]);

  // Drag-and-drop knowledge file → session creation
  const dragOverCounter = useRef(0);
  const [isDragOver, setIsDragOver] = useState(false);

  const onDragOver = (e: React.DragEvent) => {
    if (!e.dataTransfer.types.includes('application/x-yipet-knowledge-file')) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'link';
  };

  const onDragEnter = (e: React.DragEvent) => {
    if (!e.dataTransfer.types.includes('application/x-yipet-knowledge-file')) return;
    e.preventDefault();
    dragOverCounter.current += 1;
    setIsDragOver(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragOverCounter.current -= 1;
    if (dragOverCounter.current <= 0) {
      dragOverCounter.current = 0;
      setIsDragOver(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragOverCounter.current = 0;
    setIsDragOver(false);
    const path = e.dataTransfer.getData('application/x-yipet-knowledge-file');
    if (path) ctrl.createSessionFromKnowledgeFile(path);
  };

  if (!state.visible) return null;

  const currentSession = state.sessions.find((s) => s.id === state.currentSessionId);
  const pageInfo: PageInfo = state.pageInfo || {
    title: document.title || 'Current page',
    url: window.location.href,
    iconUrl: '',
  };
  const messageCount = currentSession?.messageCount || 0;

  const fullscreen = state.ws.isFullscreen;
  const windowStyle = fullscreen
    ? {}
    : {
        width: `${state.ws.width}px`,
        height: `${state.ws.height}px`,
        left: `${state.ws.x}px`,
        top: `${state.ws.y}px`,
      };

  return (
    <ConfigProvider theme={theme}>
      <AntApp>
        <div
          id="yipet-chat-window"
          className={
            (fullscreen ? 'fullscreen' : '') +
            (state.isDragging ? ' dragging' : '') +
            (state.isResizing ? ' resizing' : '')
          }
          style={windowStyle}
        >
          <ChatHeader
            title={state.title}
            onClose={ctrl.close}
            onToggleSidebar={ctrl.toggleSidebar}
            onToggleFullscreen={ctrl.toggleFullscreen}
            onMouseDown={(e) => ctrl.onHeaderMouseDown(e.nativeEvent)}
          />
          <Layout className="yipet-chat-body">
            {!state.sidebarCollapsed && (
              <>
                <Sider width={state.sidebarWidth} className="yipet-sidebar-sider" theme="dark">
                  <ChatSidebar controller={ctrl} />
                </Sider>
                <div
                  className="yipet-sidebar-resizer"
                  role="separator"
                  aria-orientation="vertical"
                  aria-label="Resize sidebar"
                  onMouseDown={(e) => ctrl.onSidebarResizeMouseDown(e.nativeEvent)}
                  title="Drag to resize sidebar width"
                />
              </>
            )}
            <Layout
              className="yipet-chat-main"
              onDragEnter={onDragEnter}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
            >
              {isDragOver && (
                <div className="yipet-chat-drop-overlay">
                  <div className="yipet-chat-drop-overlay-inner">
                    <FileTextOutlined />
                    <div>Drop knowledge file to start a session</div>
                  </div>
                </div>
              )}
              <ContextScopeBar controller={ctrl} />
              <div
                id="yipet-chat-messages"
                className="yipet-chat-messages"
                role="log"
                aria-live="polite"
              >
                <ChatMessages
                  controller={ctrl}
                  messages={state.messages}
                  viewState={state.viewState}
                  pageInfo={pageInfo}
                  currentSessionMessageCount={messageCount}
                />
              </div>
              <SessionStatusBar controller={ctrl} />
              <Content className="yipet-chat-input-wrap">
                <ChatInput controller={ctrl} />
              </Content>
            </Layout>
          </Layout>

          <WeChatSettingsModal controller={ctrl} />
          <SessionEditDialog controller={ctrl} />
          <PageContextEditor controller={ctrl} />
          <TagManagerDialog controller={ctrl} />
          <FaqDialog controller={ctrl} />
          <KnowledgePreviewDialog controller={ctrl} />
          <SaveToKnowledgeDialog controller={ctrl} />
          <RagSourcesPreviewDialog controller={ctrl} />
          <RagDecomposeDialog controller={ctrl} />
          <BugReportDialog controller={ctrl} />
          <SessionSummaryDialog controller={ctrl} />

          {!fullscreen && (
            <div
              className="yipet-resize-handle yipet-resize-n"
              aria-hidden="true"
              onMouseDown={(e) => ctrl.onResizeMouseDown('n', e as unknown as MouseEvent)}
            />
          )}
          {!fullscreen && (
            <div
              className="yipet-resize-handle yipet-resize-se"
              aria-hidden="true"
              onMouseDown={(e) => ctrl.onResizeMouseDown('se', e as unknown as MouseEvent)}
            />
          )}
          {!fullscreen && (
            <div
              className="yipet-resize-handle yipet-resize-sw"
              aria-hidden="true"
              onMouseDown={(e) => ctrl.onResizeMouseDown('sw', e as unknown as MouseEvent)}
            />
          )}
        </div>
      </AntApp>
    </ConfigProvider>
  );
}

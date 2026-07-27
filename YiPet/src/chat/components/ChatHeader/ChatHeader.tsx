/**
 * YiPet Chat — ChatHeader Component
 */

import './ChatHeader.css';

export interface ChatHeaderProps {
  title: string;
  onClose: () => void;
  onToggleSidebar: () => void;
  onToggleFullscreen: () => void;
  onMouseDown: (e: MouseEvent) => void;
}

export function ChatHeader(props: ChatHeaderProps) {
  return (
    <div
      className="yipet-chat-header"
      role="banner"
      onMouseDown={props.onMouseDown}
      onDblClick={props.onToggleFullscreen}
      title="拖拽移动 | 双击全屏"
    >
      <div className="yipet-chat-header-left">
        <button
          type="button"
          className="yipet-chat-header-btn yipet-sidebar-toggle-btn"
          onClick={props.onToggleSidebar}
          title="切换侧边栏"
          aria-label="切换侧边栏"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" fill="currentColor" />
          </svg>
        </button>
        <span className="yipet-chat-header-icon">💕</span>
        <span className="yipet-chat-header-title">{props.title}</span>
      </div>
      <div className="yipet-chat-header-buttons">
        <button
          type="button"
          className="yipet-chat-header-btn yipet-fullscreen-btn"
          onClick={props.onToggleFullscreen}
          title="全屏"
          aria-label="全屏"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"
              fill="currentColor"
            />
          </svg>
        </button>
        <button
          type="button"
          className="yipet-chat-header-btn yipet-close-btn"
          onClick={props.onClose}
          title="关闭"
          aria-label="关闭聊天窗口"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

/**
 * YiPet Chat — ChatHeader Component (antd Button + Typography)
 */

import { CloseOutlined, FullscreenOutlined, MenuFoldOutlined } from '@ant-design/icons';
import { Button, Typography } from 'antd';
import type * as React from 'react';
import type { CSSProperties } from 'react';

export interface ChatHeaderProps {
  title: string;
  onClose: () => void;
  onToggleSidebar: () => void;
  onToggleFullscreen: () => void;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const headerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '8px 12px',
  cursor: 'move',
  userSelect: 'none',
};

const leftStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  flex: 1,
  minWidth: 0,
};

const buttonsStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 4,
};

export function ChatHeader(props: ChatHeaderProps) {
  return (
    <div
      className="yipet-chat-header"
      role="banner"
      style={headerStyle}
      onMouseDown={props.onMouseDown}
      onDoubleClick={props.onToggleFullscreen}
      title="Drag to move | Double-click for fullscreen"
    >
      <div style={leftStyle}>
        <Button
          type="text"
          size="small"
          icon={<MenuFoldOutlined />}
          onClick={props.onToggleSidebar}
          title="Toggle sidebar"
          aria-label="Toggle sidebar"
        />
        <span aria-hidden="true">💕</span>
        <Typography.Text strong ellipsis style={{ flex: 1, minWidth: 0 }}>
          {props.title}
        </Typography.Text>
      </div>
      <div style={buttonsStyle}>
        <Button
          type="text"
          size="small"
          icon={<FullscreenOutlined />}
          onClick={props.onToggleFullscreen}
          title="Fullscreen"
          aria-label="Fullscreen"
        />
        <Button
          type="text"
          size="small"
          danger
          icon={<CloseOutlined />}
          onClick={props.onClose}
          title="Close"
          aria-label="Close chat window"
        />
      </div>
    </div>
  );
}

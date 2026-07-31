/**
 * YiPet Chat — ChatSidebar Component (antd Layout.Sider + Tree + Empty + Button)
 */

import { DeleteOutlined } from '@ant-design/icons';
import { Button, Empty, Spin, Tree, Typography } from 'antd';
import type { TreeDataNode } from 'antd';
import type { CSSProperties, Key } from 'react';
import type { ChatController } from '@/chat/controller';
import type { SessionItem } from '@/chat/types';
import { SearchBar } from '../SearchBar/SearchBar';
import { SessionListItem } from '../SessionListItem/SessionListItem';

export interface ChatSidebarProps {
  controller: ChatController;
}

const siderStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  overflow: 'hidden',
};

const listStyle: CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  padding: 0,
};

const batchBarStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: 8,
  borderTop: '1px solid rgba(var(--primary-rgb, 102, 126, 234), 0.2)',
  background: 'var(--bg-secondary, rgba(30, 41, 59, 0.9))',
};

const resizerStyle: CSSProperties = {
  position: 'absolute',
  right: 0,
  top: 0,
  width: 4,
  height: '100%',
  cursor: 'col-resize',
  background: 'transparent',
  zIndex: 10,
};

const folderStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 500,
  padding: '4px 0',
};

export function ChatSidebar(props: ChatSidebarProps) {
  const ctrl = props.controller;
  const s = ctrl.state;

  const treeData = ctrl.conversationTreeData();
  const expandedKeys = ctrl.expandedFolderKeys();

  const onSelect = (keys: Key[]) => {
    if (keys.length === 0) return;
    const key = String(keys[0]);
    const session = ctrl.treeSessionByKey(key);
    if (!session) return;
    if (s.batchMode) ctrl.toggleSessionSelection(session.id);
    else ctrl.selectSession(session.id);
  };

  const renderTitle = (node: TreeDataNode) => {
    const session: SessionItem | undefined = ctrl.treeSessionByKey(String(node.key));
    if (!session) {
      return <span style={folderStyle}>{String(node.title ?? '')}</span>;
    }
    return (
      <SessionListItem
        session={session}
        isActive={session.id === s.currentSessionId}
        batchMode={s.batchMode}
        isSelected={s.selectedSessionIds.includes(session.id)}
        onSelect={(id) => {
          if (s.batchMode) ctrl.toggleSessionSelection(id);
          else ctrl.selectSession(id);
        }}
        onDelete={(id) => {
          if (s.batchMode) ctrl.toggleSessionSelection(id);
          else if (confirm('Delete this conversation?')) ctrl.deleteSession(id);
        }}
        onToggleFavorite={(id) => ctrl.toggleFavorite(id)}
        onRename={(id, currentTitle) => {
          const next = prompt('Rename conversation', currentTitle);
          if (next !== null) ctrl.renameSession(id, next);
        }}
      />
    );
  };

  return (
    <div className="yipet-sidebar" style={siderStyle}>
      <SearchBar controller={ctrl} />
      <div className="yipet-sidebar-list" style={listStyle}>
        {s.sessionLoading ? (
          <div style={{ textAlign: 'center', padding: 16 }}>
            <Spin size="small" />
          </div>
        ) : treeData.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={s.searchQuery ? 'No matching conversations' : 'No conversations'}
            style={{ padding: 16 }}
          />
        ) : (
          <Tree
            treeData={treeData}
            defaultExpandedKeys={expandedKeys}
            onSelect={onSelect}
            titleRender={renderTitle}
            blockNode
            showLine={false}
            expandAction="click"
          />
        )}
      </div>

      {s.batchMode && (
        <div style={batchBarStyle}>
          <Typography.Text>{s.selectedSessionIds.length} selected</Typography.Text>
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            disabled={s.selectedSessionIds.length === 0}
            onClick={() => ctrl.bulkDeleteSessions()}
          >
            Delete selected
          </Button>
          <Button size="small" onClick={() => ctrl.exitBatchMode()}>
            Cancel
          </Button>
        </div>
      )}

      <div
        className="yipet-sidebar-resizer"
        style={resizerStyle}
        onMouseDown={(e) => ctrl.onSidebarResizeMouseDown(e as unknown as MouseEvent)}
      />
    </div>
  );
}

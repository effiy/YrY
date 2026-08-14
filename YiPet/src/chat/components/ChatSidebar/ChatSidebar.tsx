/**
 * YiPet Chat — ChatSidebar Component (antd Layout.Sider + Tree + Empty + Button)
 */

import {
  BugOutlined,
  DeleteOutlined,
  FileTextOutlined,
  ProjectOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { TreeDataNode } from 'antd';
import { Button, Empty, List, Select, Spin, Tag, Tree, Typography } from 'antd';
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

  const onKnowledgeSelect = (keys: Key[]) => {
    if (keys.length === 0) return;
    const path = String(keys[0]);
    const node = ctrl.knowledgeNodeByPath(path);
    const isFile = node?.type === 'file';
    ctrl.setRagScopeFromNode(path, isFile);
  };

  const onKnowledgeDoubleClick = (e: MouseEvent, node: TreeDataNode) => {
    // Only leaf nodes (files) trigger a preview — folders just expand.
    if ((node as { isLeaf?: boolean }).isLeaf) {
      ctrl.openKnowledgePreview(String(node.key));
    }
    e.stopPropagation();
  };

  const renderKnowledgeTitle = (node: TreeDataNode) => {
    const isLeaf = (node as { isLeaf?: boolean }).isLeaf;
    return (
      <span
        style={{ display: 'inline-block', width: '100%' }}
        draggable={isLeaf === true}
        onDragStart={(e) => {
          e.dataTransfer.setData('application/x-yipet-knowledge-file', String(node.key));
          e.dataTransfer.effectAllowed = 'link';
        }}
        onDoubleClick={(e) => onKnowledgeDoubleClick(e as unknown as MouseEvent, node)}
        title={
          isLeaf
            ? `${String(node.title ?? '')} — double-click to preview · drag to chat to start a session`
            : String(node.title ?? '')
        }
      >
        {String(node.title ?? '')}
      </span>
    );
  };

  const tabBtnStyle = (active: boolean): CSSProperties => ({
    flex: 1,
    border: 'none',
    background: active ? 'rgba(var(--primary-rgb, 102, 126, 234), 0.25)' : 'transparent',
    color: active ? 'var(--primary-light, #818cf8)' : 'inherit',
    fontWeight: active ? 600 : 400,
  });

  return (
    <div className="yipet-sidebar" style={siderStyle}>
      <div
        style={{
          display: 'flex',
          gap: 0,
          borderBottom: '1px solid rgba(var(--primary-rgb, 102, 126, 234), 0.2)',
        }}
      >
        <Button
          size="small"
          style={tabBtnStyle(s.sidebarView === 'sessions')}
          onClick={() => ctrl.setSidebarView('sessions')}
        >
          Conversations
        </Button>
        <Button
          size="small"
          style={tabBtnStyle(s.sidebarView === 'knowledge')}
          onClick={() => ctrl.setSidebarView('knowledge')}
        >
          Knowledge
        </Button>
        <Button
          size="small"
          style={tabBtnStyle(s.sidebarView === 'stories')}
          onClick={() => ctrl.setSidebarView('stories')}
        >
          Stories
        </Button>
        <Button
          size="small"
          style={tabBtnStyle(s.sidebarView === 'bugs')}
          onClick={() => ctrl.setSidebarView('bugs')}
        >
          Bugs
        </Button>
      </div>

      {s.sidebarView === 'sessions' ? (
        <>
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
        </>
      ) : s.sidebarView === 'knowledge' ? (
        <>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 8px',
              borderBottom: '1px solid rgba(var(--primary-rgb, 102, 126, 234), 0.15)',
              fontSize: 12,
            }}
          >
            <FileTextOutlined />
            <Typography.Text type="secondary" style={{ fontSize: 12, flex: 1 }}>
              {s.ragScope ? `Scope: ${s.ragScope}` : 'Click a node to scope RAG'}
            </Typography.Text>
            {s.ragScope && (
              <Button size="small" type="link" onClick={() => ctrl.clearRagScope()}>
                Clear
              </Button>
            )}
            <Button
              size="small"
              type="text"
              icon={<ReloadOutlined />}
              onClick={() => ctrl.loadKnowledgeTree()}
              aria-label="Reload knowledge tree"
            />
          </div>
          <div
            style={{
              padding: '0 8px 6px',
              borderBottom: '1px solid rgba(var(--primary-rgb, 102, 126, 234), 0.15)',
            }}
          >
            <Select
              size="small"
              value={s.knowledgeCategoryFilter}
              onChange={(v) => ctrl.setKnowledgeCategoryFilter(v)}
              style={{ width: '100%' }}
              loading={s.ragCategoriesLoading}
              placeholder="All categories"
              aria-label="Category filter"
              options={[
                { value: '', label: 'All categories' },
                ...(s.ragCategories?.categories || []).map((c) => ({
                  value: c.name,
                  label: `${c.name} (${c.file_count})`,
                })),
              ]}
            />
          </div>
          <div className="yipet-sidebar-list" style={listStyle}>
            {s.knowledgeLoading ? (
              <div style={{ textAlign: 'center', padding: 16 }}>
                <Spin size="small" />
              </div>
            ) : s.knowledgeError ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={s.knowledgeError}
                style={{ padding: 16 }}
              />
            ) : s.knowledgeTree.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No knowledge files"
                style={{ padding: 16 }}
              />
            ) : (
              <Tree
                treeData={ctrl.knowledgeTreeData()}
                onSelect={onKnowledgeSelect}
                titleRender={renderKnowledgeTitle}
                blockNode
                showLine
                expandAction="click"
                selectedKeys={s.ragScope ? [s.ragScope] : []}
              />
            )}
          </div>
        </>
      ) : s.sidebarView === 'stories' ? (
        <>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 8px',
              borderBottom: '1px solid rgba(var(--primary-rgb, 102, 126, 234), 0.15)',
              fontSize: 12,
            }}
          >
            <ProjectOutlined />
            <Typography.Text type="secondary" style={{ fontSize: 12, flex: 1 }}>
              Project onboarding stories
            </Typography.Text>
            <Button
              size="small"
              type="text"
              icon={<ReloadOutlined />}
              onClick={() => ctrl.loadKnowledgeStories()}
              aria-label="Reload stories"
            />
          </div>
          <div className="yipet-sidebar-list" style={listStyle}>
            {s.knowledgeStoriesLoading ? (
              <div style={{ textAlign: 'center', padding: 16 }}>
                <Spin size="small" />
              </div>
            ) : s.knowledgeStoriesError ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={s.knowledgeStoriesError}
                style={{ padding: 16 }}
              />
            ) : s.knowledgeStories.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No stories found"
                style={{ padding: 16 }}
              />
            ) : (
              <List
                size="small"
                dataSource={s.knowledgeStories}
                renderItem={(story) => (
                  <List.Item
                    style={{ cursor: 'pointer', padding: '6px 8px' }}
                    onClick={() => ctrl.openKnowledgeStory(story.project, story.name)}
                  >
                    <List.Item.Meta
                      avatar={<ProjectOutlined style={{ fontSize: 16, marginTop: 6 }} />}
                      title={
                        <Typography.Text style={{ fontSize: 13 }}>{story.project}</Typography.Text>
                      }
                      description={
                        <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                          {story.name}
                        </Typography.Text>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </div>
        </>
      ) : (
        <>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 8px',
              borderBottom: '1px solid rgba(var(--primary-rgb, 102, 126, 234), 0.15)',
              fontSize: 12,
            }}
          >
            <BugOutlined />
            <Typography.Text type="secondary" style={{ fontSize: 12, flex: 1 }}>
              Recent bugs (all projects)
            </Typography.Text>
            <Button
              size="small"
              type="text"
              icon={<ReloadOutlined />}
              onClick={() => ctrl.loadRecentBugs()}
              aria-label="Reload recent bugs"
            />
          </div>
          <div className="yipet-sidebar-list" style={listStyle}>
            {s.recentBugsLoading ? (
              <div style={{ textAlign: 'center', padding: 16 }}>
                <Spin size="small" />
              </div>
            ) : s.recentBugsError ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={s.recentBugsError}
                style={{ padding: 16 }}
              />
            ) : s.recentBugs.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No bugs logged yet"
                style={{ padding: 16 }}
              />
            ) : (
              <List
                size="small"
                dataSource={s.recentBugs}
                renderItem={(bug) => (
                  <List.Item
                    style={{ cursor: 'pointer', padding: '6px 8px' }}
                    onClick={() => ctrl.openBugInYiVad(bug.key)}
                  >
                    <List.Item.Meta
                      avatar={<BugOutlined style={{ fontSize: 16, marginTop: 6 }} />}
                      title={
                        <span
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            flexWrap: 'wrap',
                          }}
                        >
                          <Typography.Text style={{ fontSize: 13, flex: 1, minWidth: 0 }} ellipsis>
                            {bug.title}
                          </Typography.Text>
                          <Tag color="red" style={{ marginInline: 0, fontSize: 10 }}>
                            {bug.severity}
                          </Tag>
                          <Tag style={{ marginInline: 0, fontSize: 10 }}>{bug.project}</Tag>
                        </span>
                      }
                      description={
                        <span
                          style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 11 }}
                        >
                          <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                            {bug.module || '—'}
                          </Typography.Text>
                          <Button
                            size="small"
                            type="link"
                            style={{ fontSize: 11, padding: 0, height: 'auto' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              ctrl.discussBugInChat(bug);
                            }}
                          >
                            Discuss
                          </Button>
                        </span>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </div>
        </>
      )}

      {s.batchMode && s.sidebarView === 'sessions' && (
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

/**
 * YiPet Chat — ChatSidebar Component
 */

import './ChatSidebar.css';
import type { ChatController } from '@/chat/controller';
import { SearchBar, SessionListItem } from '../';

export interface ChatSidebarProps {
  controller: ChatController;
}

export function ChatSidebar(props: ChatSidebarProps) {
  const ctrl = props.controller;
  const s = ctrl.state;

  if (s.sidebarCollapsed) return null;

  const sessions = ctrl.filteredSessions;

  return (
    <div
      className="yipet-sidebar"
      style={{ width: s.sidebarWidth + 'px' }}
    >
      <SearchBar controller={ctrl} />

      <div className="yipet-sidebar-list">
        {s.sessionLoading ? (
          <div className="yipet-sidebar-loading">加载中...</div>
        ) : sessions.length === 0 ? (
          <div className="yipet-sidebar-empty">
            <div className="yipet-sidebar-empty-icon">💬</div>
            <div className="yipet-sidebar-empty-text">
              {s.searchQuery ? '没有匹配的会话' : '暂无会话'}
            </div>
          </div>
        ) : (
          sessions.map((session) => (
            <SessionListItem
              key={session.id}
              session={session}
              isActive={session.id === s.currentSessionId}
              batchMode={s.batchMode}
              isSelected={s.selectedSessionIds.includes(session.id)}
              onSelect={(id: string) => {
                if (s.batchMode) ctrl.toggleSessionSelection(id);
                else ctrl.selectSession(id);
              }}
              onDelete={(id: string) => {
                if (s.batchMode) ctrl.toggleSessionSelection(id);
                else if (confirm('确定要删除这个会话吗？'))
                  ctrl.deleteSession(id);
              }}
            />
          ))
        )}
      </div>

      {/* Batch mode toolbar */}
      {s.batchMode ? (
        <div className="yipet-batch-toolbar">
          <span className="yipet-batch-count">
            已选 {s.selectedSessionIds.length} 项
          </span>
          <button
            type="button"
            className="yipet-batch-delete-btn"
            disabled={s.selectedSessionIds.length === 0}
            onClick={() => ctrl.bulkDeleteSessions()}
          >
            删除选中
          </button>
          <button
            type="button"
            className="yipet-batch-cancel-btn"
            onClick={() => ctrl.exitBatchMode()}
          >
            取消
          </button>
        </div>
      ) : null}

      {/* Resize handle */}
      <div
        className="yipet-sidebar-resizer"
        onMouseDown={(e: MouseEvent) => ctrl.onSidebarResizeMouseDown(e)}
      />
    </div>
  );
}

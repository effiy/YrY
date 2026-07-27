/**
 * YiPet Chat — ChatSidebar Component
 */

import type { SessionItem } from '../types';
import { SearchBar } from './SearchBar';
import { SessionListItem } from './SessionListItem';

export interface ChatSidebarProps {
  sessions: SessionItem[];
  currentSessionId: string | null;
  searchQuery: string;
  loading: boolean;
  collapsed: boolean;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onCreateSession: () => void;
  onSearchInput: (e: { target: { value: string } }) => void;
  onClearSearch: () => void;
}

export function ChatSidebar(props: ChatSidebarProps) {
  if (props.collapsed) return null;

  return (
    <div className="yipet-sidebar">
      <SearchBar
        searchQuery={props.searchQuery}
        onSearchInput={props.onSearchInput}
        onClearSearch={props.onClearSearch}
        onCreateSession={props.onCreateSession}
      />

      <div className="yipet-sidebar-list">
        {props.loading
          ? <div className="yipet-sidebar-loading">加载中...</div>
          : props.sessions.length === 0
            ? (
              <div className="yipet-sidebar-empty">
                <div className="yipet-sidebar-empty-icon">💬</div>
                <div className="yipet-sidebar-empty-text">暂无会话</div>
              </div>
              )
            : props.sessions.map((session) => (
              <SessionListItem
                key={session.id}
                session={session}
                isActive={session.id === props.currentSessionId}
                onSelect={props.onSelectSession}
                onDelete={props.onDeleteSession}
              />
            ))}
      </div>
    </div>
  );
}

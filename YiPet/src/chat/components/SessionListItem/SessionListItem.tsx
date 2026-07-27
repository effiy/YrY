/**
 * YiPet Chat — SessionListItem Component
 */

import './SessionListItem.css';
import type { SessionItem } from '@/chat/types';
import { formatDate } from '@/chat/utils';

export interface SessionListItemProps {
  key?: string | number;
  session: SessionItem;
  isActive: boolean;
  batchMode?: boolean;
  isSelected?: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export function SessionListItem(props: SessionListItemProps) {
  const { session, isActive, batchMode, isSelected } = props;

  return (
    <div
      key={session.id}
      className={
        'yipet-sidebar-item' +
        (isActive ? ' active' : '') +
        (isSelected ? ' selected' : '')
      }
      data-session-id={session.id}
      role="button"
      tabIndex={0}
      onClick={() => props.onSelect(session.id)}
      onKeyDown={(e: { key: string }) => {
        if (e.key === 'Enter' || e.key === ' ') props.onSelect(session.id);
      }}
    >
      {batchMode ? (
        <div className="yipet-sidebar-item-check">
          <input
            type="checkbox"
            checked={!!isSelected}
            onChange={() => props.onSelect(session.id)}
            onClick={(e: unknown) => { (e as MouseEvent).stopPropagation(); }}
          />
        </div>
      ) : null}
      <div className="yipet-sidebar-item-content">
        <div className="yipet-sidebar-item-title">{session.title || '未命名会话'}</div>
        <div className="yipet-sidebar-item-meta">
          <span className="yipet-sidebar-item-count">{session.messageCount || 0} 条消息</span>
          {session.createdAt ? (
            <span className="yipet-sidebar-item-date">{formatDate(session.createdAt)}</span>
          ) : null}
        </div>
      </div>
      {!batchMode ? (
        <button
          type="button"
          className="yipet-sidebar-item-delete"
          onClick={(e: unknown) => {
            (e as Event).stopPropagation();
            if (confirm('确定要删除这个会话吗？')) props.onDelete(session.id);
          }}
          title="删除会话"
          aria-label="删除会话"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
          </svg>
        </button>
      ) : null}
    </div>
  );
}

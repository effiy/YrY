/**
 * YiPet Chat — SessionListItem Component
 *
 * Renders a single conversation row in the sidebar. In normal mode shows a
 * hover-revealed action row (favorite / rename / delete) plus a persistent
 * favorite star mark when favorited. In batch mode shows a checkbox.
 */

import { DeleteOutlined, EditOutlined, StarFilled, StarOutlined } from '@ant-design/icons';
import { Checkbox, List, Typography } from 'antd';
import type { CSSProperties } from 'react';
import type { SessionItem } from '@/chat/types';
import { formatDate } from '@/chat/utils';

export interface SessionListItemProps {
  session: SessionItem;
  isActive: boolean;
  batchMode?: boolean;
  isSelected?: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  onRename?: (id: string, currentTitle: string) => void;
}

const rowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  cursor: 'pointer',
  padding: '8px 12px',
  width: '100%',
};

const mainStyle: CSSProperties = { flex: 1, minWidth: 0 };

const actionsStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  flexShrink: 0,
};

const actionBtnStyle: CSSProperties = {
  padding: '2px 4px',
  fontSize: 14,
  height: 'auto',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
};

export function SessionListItem(props: SessionListItemProps) {
  const { session, isActive, batchMode, isSelected } = props;
  const fav = !!session.isFavorite;

  const activeStyle: CSSProperties = isActive
    ? {
        background: 'rgba(var(--primary-rgb, 102, 126, 234), 0.14)',
        borderLeft: '3px solid var(--primary, #667eea)',
      }
    : {};

  return (
    <List.Item
      className={isActive ? 'is-active yipet-session-item' : 'yipet-session-item'}
      style={{ ...rowStyle, ...activeStyle }}
      onClick={() => props.onSelect(session.id)}
    >
      {batchMode && (
        <Checkbox
          checked={!!isSelected}
          onChange={() => props.onSelect(session.id)}
          onClick={(e) => e.stopPropagation()}
        />
      )}
      <div style={mainStyle}>
        <Typography.Text ellipsis style={{ width: '100%' }}>
          {session.title || 'Untitled conversation'}
        </Typography.Text>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {session.messageCount || 0} msgs
          </Typography.Text>
          {session.createdAt ? (
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {formatDate(session.createdAt)}
            </Typography.Text>
          ) : null}
        </div>
      </div>
      {!batchMode && fav && (
        <StarFilled
          className="yipet-session-fav-mark"
          style={{ color: 'var(--warning, #faad14)', fontSize: 14, flexShrink: 0 }}
          title="Favorite"
        />
      )}
      {!batchMode && (
        <div
          className="yipet-session-actions"
          style={actionsStyle}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            aria-label="Toggle favorite"
            title={fav ? 'Unfavorite' : 'Favorite'}
            style={{ ...actionBtnStyle, color: fav ? 'var(--warning, #faad14)' : 'inherit' }}
            onClick={() => props.onToggleFavorite?.(session.id)}
          >
            {fav ? <StarFilled /> : <StarOutlined />}
          </button>
          <button
            type="button"
            aria-label="Rename conversation"
            title="Rename"
            style={actionBtnStyle}
            onClick={() => props.onRename?.(session.id, session.title || '')}
          >
            <EditOutlined />
          </button>
          <button
            type="button"
            aria-label="Delete conversation"
            title="Delete"
            style={{ ...actionBtnStyle, color: 'var(--error, #ef4444)' }}
            onClick={() => {
              if (confirm('Delete this conversation?')) props.onDelete(session.id);
            }}
          >
            <DeleteOutlined />
          </button>
        </div>
      )}
    </List.Item>
  );
}

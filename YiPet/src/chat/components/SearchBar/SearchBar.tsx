/**
 * YiPet Chat — SearchBar Component (antd Input.Search + Button)
 */

import { CloseOutlined, PlusOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { Button, Input } from 'antd';
import type { CSSProperties } from 'react';
import type { ChatController } from '@/chat/controller';

export interface SearchBarProps {
  controller: ChatController;
}

const wrapperStyle: CSSProperties = {
  display: 'flex',
  gap: 4,
  padding: 8,
};

export function SearchBar(props: SearchBarProps) {
  const ctrl = props.controller;
  const s = ctrl.state;
  const query = s.searchInputValue;

  return (
    <div className="yipet-sidebar-search" style={wrapperStyle}>
      <Input
        placeholder="Search conversations..."
        value={query}
        onChange={(e) => ctrl.onSearchInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') ctrl.clearSearch();
        }}
        allowClear
        onClear={() => ctrl.clearSearch()}
        aria-label="Search conversations"
      />
      <Button
        type="primary"
        size="small"
        icon={<PlusOutlined />}
        onClick={() => ctrl.createSession()}
        title="New conversation"
        aria-label="New conversation"
      />
      {!s.batchMode && (
        <Button
          size="small"
          icon={<UnorderedListOutlined />}
          onClick={() => ctrl.enterBatchMode()}
          title="Batch manage conversations"
          aria-label="Batch manage"
        />
      )}
      <CloseOutlined style={{ display: 'none' }} />
    </div>
  );
}

/**
 * YiPet Chat — FileMentionDropdown
 * Renders the list of knowledge files matching the @-query typed in the
 * chat input. Click a row → scopes RAG to that file + auto-enables grounding.
 * Mirrors YiVad's `FileMentionDropdown.vue`.
 */
import { Empty, Typography } from 'antd';
import type { FC } from 'react';
import type { KnowledgeTreeNode } from '@/api/types';
import type { ChatController } from '@/chat/controller';
import './FileMentionDropdown.css';

export interface FileMentionDropdownProps {
  controller: ChatController;
  query: string;
  visible: boolean;
  onClose: () => void;
  onSelect: (path: string) => void;
}

export const FileMentionDropdown: FC<FileMentionDropdownProps> = ({
  controller: ctrl,
  query,
  visible,
  onClose,
  onSelect,
}) => {
  if (!visible) return null;
  const matches = ctrl.knowledgeFileMatches(query, 8);

  if (matches.length === 0) {
    return (
      <div className="yipet-mention-dropdown" role="listbox" aria-label="Knowledge file matches">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={query ? `No files match "${query}"` : 'No knowledge files'}
          style={{ padding: 12, margin: 0 }}
        />
      </div>
    );
  }

  return (
    <div className="yipet-mention-dropdown" role="listbox" aria-label="Knowledge file matches">
      <div className="yipet-mention-header">
        <Typography.Text type="secondary" style={{ fontSize: 11 }}>
          Pick a file to scope RAG
        </Typography.Text>
      </div>
      {matches.map((node: KnowledgeTreeNode, idx: number) => (
        <div
          key={node.path}
          className="yipet-mention-item"
          role="option"
          aria-selected={false}
          data-idx={idx}
          onClick={() => {
            onSelect(node.path);
            onClose();
          }}
          title={node.path}
        >
          <Typography.Text className="yipet-mention-path" style={{ fontSize: 12 }}>
            {node.path}
          </Typography.Text>
        </div>
      ))}
    </div>
  );
};

/**
 * YiPet Chat — KnowledgePreviewDialog
 * Reads a knowledge markdown file via KnowledgeService.read and renders
 * the body + a frontmatter meta strip. Mirrors YiVad's KnowledgePreviewDialog.
 */
import { CloseOutlined, FileTextOutlined } from '@ant-design/icons';
import { Button, Modal, Spin, Tag, Typography } from 'antd';
import { type FC, useEffect } from 'react';
import type { ChatController } from '@/chat/controller';
import { renderMarkdown } from '@/chat/utils';
import './KnowledgePreviewDialog.css';

export interface KnowledgePreviewDialogProps {
  controller: ChatController;
}

const FRONTMATTER_PILL_KEYS = ['status', 'lifecycle', 'review_cycle', 'tacit', 'type', 'category'];

export const KnowledgePreviewDialog: FC<KnowledgePreviewDialogProps> = ({ controller: ctrl }) => {
  const s = ctrl.state;
  const data = s.knowledgePreviewData;

  useEffect(() => {
    if (!s.knowledgePreviewVisible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') ctrl.closeKnowledgePreview();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [s.knowledgePreviewVisible, ctrl]);

  const fm = data?.frontmatter || {};
  const pills = FRONTMATTER_PILL_KEYS.filter((k) => fm[k] !== undefined).map((k) => ({
    key: k,
    value: fm[k],
  }));
  const tags = Array.isArray(fm.tags)
    ? (fm.tags as unknown[]).filter((t) => typeof t === 'string')
    : [];
  const related = Array.isArray(fm.related)
    ? (fm.related as unknown[]).filter((t) => typeof t === 'string')
    : [];

  return (
    <Modal
      open={s.knowledgePreviewVisible}
      onCancel={() => ctrl.closeKnowledgePreview()}
      footer={null}
      width={720}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileTextOutlined />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {s.knowledgePreviewPath || 'Knowledge file'}
          </span>
        </div>
      }
      closeIcon={<CloseOutlined />}
      zIndex={2147483647}
      destroyOnClose
    >
      {s.knowledgePreviewLoading ? (
        <div style={{ textAlign: 'center', padding: 32 }}>
          <Spin />
        </div>
      ) : data ? (
        <div className="kp-body">
          {(pills.length > 0 || tags.length > 0) && (
            <div className="kp-meta-strip">
              {pills.map((p) => (
                <Tag key={p.key} color="blue" style={{ marginBottom: 4 }}>
                  {p.key}: {String(p.value)}
                </Tag>
              ))}
              {tags.map((t) => (
                <Tag key={`tag-${t}`} color="purple" style={{ marginBottom: 4 }}>
                  #{String(t)}
                </Tag>
              ))}
            </div>
          )}
          {related.length > 0 && (
            <div className="kp-related">
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                Related:
              </Typography.Text>
              {related.map((r) => (
                <Button
                  key={`rel-${r}`}
                  type="link"
                  size="small"
                  style={{ padding: '0 4px' }}
                  onClick={() => ctrl.openKnowledgePreview(String(r))}
                >
                  {String(r)}
                </Button>
              ))}
            </div>
          )}
          <div
            className="kp-markdown markdown-content"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(data.content || '') }}
          />
        </div>
      ) : (
        <EmptyState controller={ctrl} />
      )}
    </Modal>
  );
};

const EmptyState: FC<{ controller: ChatController }> = () => (
  <div style={{ textAlign: 'center', padding: 32, opacity: 0.6 }}>
    <Typography.Text type="secondary">No content loaded.</Typography.Text>
  </div>
);

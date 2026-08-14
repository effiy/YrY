/**
 * YiPet Chat — RagSourcesPreviewDialog
 * Shows the sources that RAG would retrieve for a given question — a one-shot
 * retrieval (no LLM call). Useful for refining the question before sending.
 */
import { CloseOutlined, FileSearchOutlined } from '@ant-design/icons';
import { Button, Empty, Modal, Spin, Typography } from 'antd';
import type { FC } from 'react';
import type { ChatController } from '@/chat/controller';
import './RagSourcesPreviewDialog.css';

export interface RagSourcesPreviewDialogProps {
  controller: ChatController;
}

export const RagSourcesPreviewDialog: FC<RagSourcesPreviewDialogProps> = ({ controller: ctrl }) => {
  const s = ctrl.state;
  const sources = s.ragPreviewSources;

  return (
    <Modal
      open={s.ragPreviewVisible}
      onCancel={() => ctrl.closeRagPreview()}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileSearchOutlined />
          RAG source preview
        </div>
      }
      closeIcon={<CloseOutlined />}
      zIndex={2147483647}
      destroyOnClose
      footer={[
        <Button key="close" onClick={() => ctrl.closeRagPreview()}>
          Close
        </Button>,
      ]}
    >
      <Typography.Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 12 }}>
        {s.ragScope
          ? `Scope: ${s.ragScope}${s.ragScopeIsFile ? ' (per-file)' : ''}`
          : 'Whole YiKnowledge index'}
        {' — '}
        <Typography.Text style={{ fontSize: 12 }}>{s.ragPreviewQuestion}</Typography.Text>
      </Typography.Paragraph>
      {s.ragPreviewLoading ? (
        <div style={{ textAlign: 'center', padding: 24 }}>
          <Spin />
        </div>
      ) : sources.length === 0 ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No matching sources" />
      ) : (
        <ul className="rsp-list">
          {sources.map((src, i) => (
            <li key={`rsp-${i}-${src.path}`} className="rsp-item">
              <div className="rsp-item__head">
                <span className="rsp-item__path" title={src.path}>
                  {src.path}
                </span>
                {typeof src.score === 'number' && (
                  <span className="rsp-item__score">{src.score.toFixed(3)}</span>
                )}
              </div>
              {src.snippet && <div className="rsp-item__snippet">{src.snippet}</div>}
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
};

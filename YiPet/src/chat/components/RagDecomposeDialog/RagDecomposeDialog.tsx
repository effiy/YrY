/**
 * YiPet Chat — RagDecomposeDialog
 * Shows the sub-question decomposition of the current question —
 * llama_index SubQuestionQueryEngine output: per-sub-q answer + sources,
 * plus a final synthesis. Helps the user see how a complex question is
 * being broken down before they commit to a full RAG chat.
 */
import { CloseOutlined, PartitionOutlined } from '@ant-design/icons';
import { Button, Empty, Modal, Spin, Typography } from 'antd';
import type { FC } from 'react';
import type { ChatController } from '@/chat/controller';
import { renderMarkdown } from '@/chat/utils';
import './RagDecomposeDialog.css';

export interface RagDecomposeDialogProps {
  controller: ChatController;
}

export const RagDecomposeDialog: FC<RagDecomposeDialogProps> = ({ controller: ctrl }) => {
  const s = ctrl.state;
  const data = s.ragDecomposeData;

  return (
    <Modal
      open={s.ragDecomposeVisible}
      onCancel={() => ctrl.closeRagDecompose()}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <PartitionOutlined />
          Sub-question decomposition
        </div>
      }
      closeIcon={<CloseOutlined />}
      zIndex={2147483647}
      destroyOnClose
      width={720}
      footer={[
        <Button key="close" onClick={() => ctrl.closeRagDecompose()}>
          Close
        </Button>,
      ]}
    >
      <Typography.Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 12 }}>
        {s.ragScope
          ? `Scope: ${s.ragScope}${s.ragScopeIsFile ? ' (per-file)' : ''}`
          : 'Whole YiKnowledge index'}
        {s.knowledgeCategoryFilter ? ` — category: ${s.knowledgeCategoryFilter}` : ''}
        {' — '}
        <Typography.Text style={{ fontSize: 12 }}>{s.ragDecomposeQuestion}</Typography.Text>
      </Typography.Paragraph>
      {s.ragDecomposeLoading ? (
        <div style={{ textAlign: 'center', padding: 32 }}>
          <Spin tip="Decomposing (synchronous, may take a while)…">
            <span style={{ opacity: 0 }}>.</span>
          </Spin>
        </div>
      ) : !data ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No decomposition result" />
      ) : (
        <div className="rdd-body">
          {data.sub_questions.length === 0 ? (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No sub-questions returned" />
          ) : (
            <ol className="rdd-list">
              {data.sub_questions.map((sq, i) => (
                <li key={`sq-${i}`} className="rdd-item">
                  <div className="rdd-item__q">
                    <span className="rdd-item__num">{i + 1}.</span>
                    <span className="rdd-item__text">{sq.sub_q}</span>
                  </div>
                  {sq.answer && (
                    <div
                      className="rdd-item__answer markdown-content"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(sq.answer) }}
                    />
                  )}
                  {sq.sources.length > 0 && (
                    <ul className="rdd-item__sources">
                      {sq.sources.map((src, j) => (
                        <li key={`sq-${i}-s-${j}`} className="rdd-item__source" title={src.path}>
                          {src.path}
                          {typeof src.score === 'number' ? ` · ${src.score.toFixed(3)}` : ''}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ol>
          )}
          {data.synthesis && (
            <div className="rdd-synthesis">
              <Typography.Text type="secondary" style={{ fontSize: 12, fontWeight: 600 }}>
                Synthesis
              </Typography.Text>
              <div
                className="rdd-synthesis__body markdown-content"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(data.synthesis) }}
              />
            </div>
          )}
          {data.error && (
            <div className="rdd-error">
              <Typography.Text type="danger" style={{ fontSize: 12 }}>
                Backend error: {data.error}
              </Typography.Text>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

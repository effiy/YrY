/**
 * YiPet Chat — SessionSummaryDialog
 * One-click LLM summary of the current conversation. The summary is
 * surfaced in a modal (not appended to the thread) so the conversation
 * stays clean — the user can copy the summary to paste elsewhere.
 */
import { CloseOutlined, CopyOutlined, FileTextOutlined } from '@ant-design/icons';
import { Alert, Button, Modal, Spin, Typography } from 'antd';
import type { FC } from 'react';
import type { ChatController } from '@/chat/controller';
import { renderMarkdown } from '@/chat/utils';
import './SessionSummaryDialog.css';

export interface SessionSummaryDialogProps {
  controller: ChatController;
}

export const SessionSummaryDialog: FC<SessionSummaryDialogProps> = ({ controller: ctrl }) => {
  const s = ctrl.state;

  return (
    <Modal
      open={s.sessionSummaryVisible}
      onCancel={() => ctrl.closeSessionSummary()}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileTextOutlined />
          Session summary
        </div>
      }
      closeIcon={<CloseOutlined />}
      zIndex={2147483647}
      destroyOnClose
      width={640}
      footer={[
        <Button
          key="copy"
          icon={<CopyOutlined />}
          disabled={!s.sessionSummaryText || s.sessionSummaryLoading}
          onClick={() => ctrl.copySessionSummary()}
        >
          Copy
        </Button>,
        <Button key="close" onClick={() => ctrl.closeSessionSummary()}>
          Close
        </Button>,
      ]}
    >
      {s.sessionSummaryLoading && (
        <div style={{ textAlign: 'center', padding: 24 }}>
          <Spin />
          <Typography.Paragraph type="secondary" style={{ marginTop: 12, fontSize: 12 }}>
            Summarizing {s.messages.length} messages — may take a few seconds.
          </Typography.Paragraph>
        </div>
      )}
      {s.sessionSummaryError && (
        <Alert type="error" message={s.sessionSummaryError} style={{ marginBottom: 12 }} />
      )}
      {!s.sessionSummaryLoading && s.sessionSummaryText && (
        <div
          className="yipet-session-summary-body"
          // eslint-disable-next-line react/no-danger -- renderMarkdown escapes untrusted input
          dangerouslySetInnerHTML={{ __html: renderMarkdown(s.sessionSummaryText) }}
        />
      )}
    </Modal>
  );
};

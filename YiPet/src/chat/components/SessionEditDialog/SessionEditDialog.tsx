import { Form, Input, Modal } from 'antd';
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import type { ChatController } from '../../controller';
import './SessionEditDialog.css';

export interface SessionEditDialogProps {
  controller: ChatController;
}

export const SessionEditDialog: FC<SessionEditDialogProps> = ({ controller }) => {
  const state = controller.state;
  const [title, setTitle] = useState('');
  const [pageTitle, setPageTitle] = useState('');
  const [pageDescription, setPageDescription] = useState('');

  useEffect(() => {
    if (state.sessionEditVisible) {
      const session = state.sessions.find((s) => s.id === state.currentSessionId);
      setTitle(session?.title || '');
      setPageTitle('');
      setPageDescription('');
    }
  }, [state.sessionEditVisible, state.currentSessionId, state.sessions.find]);

  const onSave = () => {
    controller.updateSessionMeta({
      title: title.trim() || undefined,
      pageTitle: pageTitle.trim() || undefined,
      pageDescription: pageDescription.trim() || undefined,
    });
  };

  return (
    <Modal
      title="Edit session info"
      open={state.sessionEditVisible}
      onOk={onSave}
      onCancel={() => controller.closeSessionEdit()}
      okText="Save"
      cancelText="Cancel"
      zIndex={2147483647}
    >
      <Form layout="vertical">
        <Form.Item label="Conversation title">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Conversation title"
          />
        </Form.Item>
        <Form.Item label="Page title">
          <Input
            value={pageTitle}
            onChange={(e) => setPageTitle(e.target.value)}
            placeholder="Page title"
          />
        </Form.Item>
        <Form.Item label="Page description">
          <Input.TextArea
            value={pageDescription}
            onChange={(e) => setPageDescription(e.target.value)}
            rows={3}
            placeholder="Page description"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

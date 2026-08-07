/**
 * YiPet Chat — SaveToKnowledgeDialog
 * Saves the staged pet message to YiKnowledge via KnowledgeService.write.
 */
import { CloseOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Form, Input, Modal, Spin } from 'antd';
import type { FC } from 'react';
import type { ChatController } from '@/chat/controller';
import './SaveToKnowledgeDialog.css';

export interface SaveToKnowledgeDialogProps {
  controller: ChatController;
}

export const SaveToKnowledgeDialog: FC<SaveToKnowledgeDialogProps> = ({ controller: ctrl }) => {
  const s = ctrl.state;
  const m = s.saveToKnowledgeDraftMetadata;

  return (
    <Modal
      open={s.saveToKnowledgeVisible}
      onCancel={() => ctrl.closeSaveToKnowledge()}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SaveOutlined />
          Save to YiKnowledge
        </div>
      }
      closeIcon={<CloseOutlined />}
      zIndex={2147483647}
      destroyOnClose
      footer={[
        <Button key="cancel" onClick={() => ctrl.closeSaveToKnowledge()}>
          Cancel
        </Button>,
        <Button
          key="save"
          type="primary"
          icon={<SaveOutlined />}
          loading={s.saveToKnowledgeLoading}
          onClick={() => ctrl.confirmSaveToKnowledge()}
        >
          Save
        </Button>,
      ]}
    >
      {s.saveToKnowledgeLoading ? (
        <div style={{ textAlign: 'center', padding: 24 }}>
          <Spin />
        </div>
      ) : (
        <Form layout="vertical" component="div">
          <Form.Item label="Target path (relative to YiKnowledge)">
            <Input
              value={s.saveToKnowledgeDraftPath}
              onChange={(e) => ctrl.setSaveToKnowledgeDraft({ path: e.target.value })}
              placeholder="notes/2026-08-05/summary.md"
              aria-label="Target path"
            />
          </Form.Item>
          <Form.Item label="Title">
            <Input
              value={m.title}
              onChange={(e) => ctrl.setSaveToKnowledgeDraft({ title: e.target.value })}
              placeholder="Note title"
              aria-label="Title"
            />
          </Form.Item>
          <Form.Item label="Category">
            <Input
              value={m.category}
              onChange={(e) => ctrl.setSaveToKnowledgeDraft({ category: e.target.value })}
              placeholder="notes / projects / reports / etc."
              aria-label="Category"
            />
          </Form.Item>
          <Form.Item label="Type">
            <Input
              value={m.type}
              onChange={(e) => ctrl.setSaveToKnowledgeDraft({ type: e.target.value })}
              placeholder="note / summary / adr / etc."
              aria-label="Type"
            />
          </Form.Item>
          <Form.Item label="Tags (comma-separated)">
            <Input
              value={m.tags}
              onChange={(e) => ctrl.setSaveToKnowledgeDraft({ tags: e.target.value })}
              placeholder="tag1, tag2"
              aria-label="Tags"
            />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};

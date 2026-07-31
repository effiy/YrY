import { Button, Input, Modal, Tag } from 'antd';
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import type { ChatController } from '../../controller';
import './TagManagerDialog.css';

export interface TagManagerDialogProps {
  controller: ChatController;
}

export const TagManagerDialog: FC<TagManagerDialogProps> = ({ controller }) => {
  const state = controller.state;
  const [input, setInput] = useState('');

  useEffect(() => {
    if (state.tagManagerVisible) setInput('');
  }, [state.tagManagerVisible]);

  const tags = controller.currentSessionTags;

  const onAdd = () => {
    const v = input.trim();
    if (!v) return;
    controller.addTag(v);
    setInput('');
  };

  return (
    <Modal
      title="Tag management"
      open={state.tagManagerVisible}
      onCancel={() => controller.closeTagManager()}
      footer={null}
      zIndex={2147483647}
    >
      <div className="tm-input-row">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onPressEnter={onAdd}
          placeholder="Enter tag name, press Enter to add"
        />
        <Button type="primary" onClick={onAdd}>
          Add
        </Button>
      </div>
      <div className="tm-tags">
        {tags.length === 0 && (
          <span style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>No tags yet</span>
        )}
        {tags.map((t) => (
          <Tag key={t} closable onClose={() => controller.removeTag(t)} color="processing">
            {t}
          </Tag>
        ))}
      </div>
    </Modal>
  );
};

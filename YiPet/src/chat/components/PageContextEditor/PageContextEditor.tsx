import { CopyOutlined, DownloadOutlined } from '@ant-design/icons';
import { Button, Input, Modal, Segmented, Tooltip, Typography } from 'antd';
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import type { ChatController } from '../../controller';
import { renderMarkdown } from '../../utils';
import './PageContextEditor.css';

export interface PageContextEditorProps {
  controller: ChatController;
}

type ViewMode = 'edit' | 'split' | 'preview';

export const PageContextEditor: FC<PageContextEditorProps> = ({ controller }) => {
  const state = controller.state;
  const [value, setValue] = useState('');
  const [mode, setMode] = useState<ViewMode>('split');

  useEffect(() => {
    if (state.contextEditorVisible) {
      setValue(state.contextEditorDraft || '');
    }
  }, [state.contextEditorVisible, state.contextEditorDraft]);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      /* ignore */
    }
  };

  const onDownload = () => {
    const blob = new Blob([value], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'page-context.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Modal
      title="Page context editor"
      open={state.contextEditorVisible}
      onOk={() => controller.saveContextEditorContent(value)}
      onCancel={() => controller.closeContextEditor()}
      okText="Save"
      cancelText="Cancel"
      width={720}
      zIndex={2147483647}
    >
      <div className="pe-toolbar">
        <Segmented
          options={[
            { label: 'Edit', value: 'edit' },
            { label: 'Split', value: 'split' },
            { label: 'Preview', value: 'preview' },
          ]}
          value={mode}
          onChange={(v) => setMode(v as ViewMode)}
        />
        <span className="pe-spacer" />
        <Tooltip title="Copy">
          <Button icon={<CopyOutlined />} onClick={onCopy} />
        </Tooltip>
        <Tooltip title="Download">
          <Button icon={<DownloadOutlined />} onClick={onDownload} />
        </Tooltip>
      </div>
      <div className={`pe-body pe-body--${mode}`}>
        {(mode === 'edit' || mode === 'split') && (
          <Input.TextArea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={18}
            className="pe-textarea"
            placeholder="Enter page context markdown..."
          />
        )}
        {(mode === 'preview' || mode === 'split') && (
          <div
            className="pe-preview markdown-content"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }}
          />
        )}
      </div>
      <Typography.Text type="secondary" style={{ fontSize: 11 }}>
        {value.length} chars
      </Typography.Text>
    </Modal>
  );
};

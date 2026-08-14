import { CopyOutlined, SendOutlined } from '@ant-design/icons';
import { Button, Input, List, Modal, Segmented, Typography } from 'antd';
import type { FC } from 'react';
import type { ChatController } from '../../controller';
import './FaqDialog.css';

interface FaqItem {
  id: string;
  title: string;
  content: string;
}

const DEFAULT_FAQS: FaqItem[] = [
  {
    id: 'faq-roadmap',
    title: 'Tech roadmap review template',
    content:
      "Tech roadmap review: this quarter's investment distribution and milestone alignment across platform, middleware, and business domains",
  },
  {
    id: 'faq-adr',
    title: 'Architecture decision record template',
    content:
      'Architecture decision records: list key changes, risks, and rollback plans from recent ADRs',
  },
  {
    id: 'faq-postmortem',
    title: 'Incident postmortem template',
    content:
      'Incident severity: P0/P1   Impact scope: xxx   Root cause chain: xxx   Action items: xxx',
  },
];

export interface FaqDialogProps {
  controller: ChatController;
}

export const FaqDialog: FC<FaqDialogProps> = ({ controller }) => {
  const state = controller.state;
  const query = state.faqSearch.toLowerCase().trim();
  const items = DEFAULT_FAQS.filter(
    (f) =>
      !query || f.title.toLowerCase().includes(query) || f.content.toLowerCase().includes(query),
  );

  const apply = (item: FaqItem) => {
    if (state.faqApplyMode === 'insert') {
      controller.setInputTemplate(item.content);
    } else {
      controller.sendQuickButton(item.content);
    }
    controller.closeFaq();
  };

  const copy = async (item: FaqItem) => {
    try {
      await navigator.clipboard.writeText(item.content);
    } catch {
      /* ignore */
    }
  };

  return (
    <Modal
      title="FAQ"
      open={state.faqVisible}
      onCancel={() => controller.closeFaq()}
      footer={null}
      width={640}
      zIndex={2147483647}
    >
      <Input
        placeholder="Search FAQ..."
        value={state.faqSearch}
        onChange={(e) => controller.setFaqSearch(e.target.value)}
        allowClear
      />
      <div className="fq-mode-row">
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          Apply mode
        </Typography.Text>
        <Segmented
          size="small"
          value={state.faqApplyMode}
          onChange={(v) => controller.setFaqApplyMode(v as 'append' | 'insert')}
          options={[
            { label: 'Append to input', value: 'append' },
            { label: 'Replace input', value: 'insert' },
          ]}
        />
      </div>
      <List
        size="small"
        dataSource={items}
        locale={{ emptyText: 'No matching FAQ' }}
        renderItem={(item) => (
          <List.Item
            actions={[
              <Button key="copy" size="small" icon={<CopyOutlined />} onClick={() => copy(item)}>
                Copy
              </Button>,
              <Button
                key="apply"
                size="small"
                type="primary"
                icon={<SendOutlined />}
                onClick={() => apply(item)}
              >
                {state.faqApplyMode === 'insert' ? 'Replace' : 'Send now'}
              </Button>,
            ]}
          >
            <List.Item.Meta title={item.title} description={item.content} />
          </List.Item>
        )}
      />
    </Modal>
  );
};

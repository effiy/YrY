/**
 * YiPet Chat — WeCom Bot Settings Modal (antd Modal + Form + Input + Switch)
 */

import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, Input, Modal, Switch, Typography } from 'antd';
import type { ChatController } from '@/chat/controller';

export interface WeChatSettingsModalProps {
  controller: ChatController;
}

export function WeChatSettingsModal(props: WeChatSettingsModalProps) {
  const ctrl = props.controller;
  const s = ctrl.state;
  const draft = s.weChatRobotsDraft || [];

  return (
    <Modal
      title={
        <span>
          🤖 WeCom Bot <Typography.Text type="secondary">(local to this browser)</Typography.Text>
        </span>
      }
      open={s.weChatSettingsVisible}
      onCancel={() => ctrl.closeWeChatSettings()}
      zIndex={2147483647}
      footer={[
        <Button
          key="restore"
          onClick={() => ctrl.restoreWeChatSettingsDefaults()}
          title="Clear all"
        >
          Reset to defaults
        </Button>,
        <Button key="save" type="primary" onClick={() => ctrl.saveWeChatSettings()}>
          Save
        </Button>,
      ]}
      width={520}
    >
      <Button
        type="dashed"
        icon={<PlusOutlined />}
        onClick={() => ctrl.addWeChatRobotDraft()}
        block
        style={{ marginBottom: 12 }}
      >
        Add bot
      </Button>

      {draft.length === 0 && (
        <Typography.Text type="secondary">
          No bots yet — click "Add bot" to add a WeCom bot.
        </Typography.Text>
      )}

      {draft.map((bot, ri) => (
        <div
          key={bot.id || 'wr_' + ri}
          style={{
            border: '1px solid var(--border-secondary, rgba(167, 139, 250, 0.18))',
            padding: 12,
            marginBottom: 8,
            borderRadius: 4,
            background: 'rgba(var(--primary-rgb, 99, 102, 241), 0.05)',
          }}
        >
          <Form layout="vertical" size="small">
            <Form.Item label="Name">
              <Input
                value={bot.name}
                placeholder="Bot name"
                autoComplete="off"
                aria-label="Bot name"
                onChange={(e) => ctrl.updateWeChatRobotDraft(ri, { name: e.target.value })}
              />
            </Form.Item>
            <Form.Item label="Webhook URL">
              <Input
                value={bot.webhook}
                placeholder="https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=..."
                autoComplete="off"
                aria-label="Webhook"
                onChange={(e) => ctrl.updateWeChatRobotDraft(ri, { webhook: e.target.value })}
              />
            </Form.Item>
            <Form.Item label="Enabled">
              <Switch
                checked={!!bot.enabled}
                onChange={(v) => ctrl.updateWeChatRobotDraft(ri, { enabled: v })}
              />
            </Form.Item>
            <Form.Item label="Auto-forward assistant replies">
              <Switch
                checked={!!bot.autoForward}
                onChange={(v) => ctrl.updateWeChatRobotDraft(ri, { autoForward: v })}
              />
            </Form.Item>
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => ctrl.removeWeChatRobotDraft(ri)}
            >
              Delete
            </Button>
          </Form>
        </div>
      ))}
    </Modal>
  );
}

/**
 * YiPet Chat — BugReportDialog
 * Cross-project bug collector — writes metadata to MongoDB `bugs` and the
 * long-form body to YiKnowledge/lessons/failures/bugs/<key>.md.
 */
import { BugOutlined, CloseOutlined } from '@ant-design/icons';
import { Button, Form, Input, Modal, Select, Spin } from 'antd';
import type { FC } from 'react';
import type { ChatController } from '@/chat/controller';
import './BugReportDialog.css';

const SEVERITY_OPTIONS = [
  { value: 'critical', label: 'Critical' },
  { value: 'major', label: 'Major' },
  { value: 'minor', label: 'Minor' },
  { value: 'trivial', label: 'Trivial' },
];
const PRIORITY_OPTIONS = [
  { value: 'p0', label: 'P0' },
  { value: 'p1', label: 'P1' },
  { value: 'p2', label: 'P2' },
  { value: 'p3', label: 'P3' },
];
const STATUS_OPTIONS = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'reopened', label: 'Reopened' },
];
const TYPE_OPTIONS = [
  { value: 'functional', label: 'Functional' },
  { value: 'performance', label: 'Performance' },
  { value: 'ui', label: 'UI' },
  { value: 'security', label: 'Security' },
  { value: 'compatibility', label: 'Compatibility' },
  { value: 'regression', label: 'Regression' },
  { value: 'data', label: 'Data' },
  { value: 'other', label: 'Other' },
];
const FREQUENCY_OPTIONS = [
  { value: 'always', label: 'Always' },
  { value: 'sometimes', label: 'Sometimes' },
  { value: 'rarely', label: 'Rarely' },
  { value: 'once', label: 'Once' },
  { value: 'unable', label: 'Unable to reproduce' },
];
const PROJECT_OPTIONS = [
  { value: 'YiVad', label: 'YiVad' },
  { value: 'YiAi', label: 'YiAi' },
  { value: 'YiKnowledge', label: 'YiKnowledge' },
  { value: 'YiPet', label: 'YiPet' },
  { value: 'unknown', label: 'Unknown' },
];

export interface BugReportDialogProps {
  controller: ChatController;
}

export const BugReportDialog: FC<BugReportDialogProps> = ({ controller: ctrl }) => {
  const s = ctrl.state;
  const d = s.bugReportDraft;

  return (
    <Modal
      open={s.bugReportVisible}
      onCancel={() => ctrl.closeBugReport()}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <BugOutlined />
          Log a bug
        </div>
      }
      closeIcon={<CloseOutlined />}
      zIndex={2147483647}
      destroyOnClose
      width={620}
      footer={[
        <Button key="cancel" onClick={() => ctrl.closeBugReport()}>
          Cancel
        </Button>,
        <Button
          key="save"
          type="primary"
          icon={<BugOutlined />}
          loading={s.bugReportLoading}
          onClick={() => ctrl.confirmBugReport()}
        >
          Log bug
        </Button>,
      ]}
    >
      {s.bugReportLoading ? (
        <div style={{ textAlign: 'center', padding: 24 }}>
          <Spin />
        </div>
      ) : (
        <Form layout="vertical" component="div" className="yipet-bug-form">
          <Form.Item label="Title" required>
            <Input
              value={d.title}
              onChange={(e) => ctrl.setBugReportDraft({ title: e.target.value })}
              placeholder="Short summary"
              aria-label="Title"
            />
          </Form.Item>
          <div className="yipet-bug-row">
            <Form.Item label="Project" required>
              <Select
                value={d.project}
                onChange={(v) => ctrl.setBugReportDraft({ project: v })}
                options={PROJECT_OPTIONS}
                aria-label="Project"
              />
            </Form.Item>
            <Form.Item label="Module">
              <Input
                value={d.module}
                onChange={(e) => ctrl.setBugReportDraft({ module: e.target.value })}
                placeholder="e.g. chat / sidebar / login"
                aria-label="Module"
              />
            </Form.Item>
          </div>
          <div className="yipet-bug-row yipet-bug-row-3">
            <Form.Item label="Severity">
              <Select
                value={d.severity}
                onChange={(v) => ctrl.setBugReportDraft({ severity: v })}
                options={SEVERITY_OPTIONS}
                aria-label="Severity"
              />
            </Form.Item>
            <Form.Item label="Priority">
              <Select
                value={d.priority}
                onChange={(v) => ctrl.setBugReportDraft({ priority: v })}
                options={PRIORITY_OPTIONS}
                aria-label="Priority"
              />
            </Form.Item>
            <Form.Item label="Status">
              <Select
                value={d.status}
                onChange={(v) => ctrl.setBugReportDraft({ status: v })}
                options={STATUS_OPTIONS}
                aria-label="Status"
              />
            </Form.Item>
          </div>
          <div className="yipet-bug-row yipet-bug-row-3">
            <Form.Item label="Type">
              <Select
                value={d.type}
                onChange={(v) => ctrl.setBugReportDraft({ type: v })}
                options={TYPE_OPTIONS}
                aria-label="Type"
              />
            </Form.Item>
            <Form.Item label="Frequency">
              <Select
                value={d.frequency}
                onChange={(v) => ctrl.setBugReportDraft({ frequency: v })}
                options={FREQUENCY_OPTIONS}
                aria-label="Frequency"
              />
            </Form.Item>
            <Form.Item label="Assignee">
              <Input
                value={d.assignee}
                onChange={(e) => ctrl.setBugReportDraft({ assignee: e.target.value })}
                aria-label="Assignee"
              />
            </Form.Item>
          </div>
          <div className="yipet-bug-row yipet-bug-row-3">
            <Form.Item label="Reporter">
              <Input
                value={d.reporter}
                onChange={(e) => ctrl.setBugReportDraft({ reporter: e.target.value })}
                aria-label="Reporter"
              />
            </Form.Item>
            <Form.Item label="Affected version">
              <Input
                value={d.affectedVersion}
                onChange={(e) => ctrl.setBugReportDraft({ affectedVersion: e.target.value })}
                aria-label="Affected version"
              />
            </Form.Item>
            <Form.Item label="Fixed version">
              <Input
                value={d.fixedVersion}
                onChange={(e) => ctrl.setBugReportDraft({ fixedVersion: e.target.value })}
                aria-label="Fixed version"
              />
            </Form.Item>
          </div>
          <Form.Item label="Environment (URL / device / browser)">
            <Input
              value={d.environment}
              onChange={(e) => ctrl.setBugReportDraft({ environment: e.target.value })}
              aria-label="Environment"
            />
          </Form.Item>
          <Form.Item label="Tags (comma-separated)">
            <Input
              value={d.tags}
              onChange={(e) => ctrl.setBugReportDraft({ tags: e.target.value })}
              placeholder="ui, crash, regression"
              aria-label="Tags"
            />
          </Form.Item>
          <Form.Item label="Description">
            <Input.TextArea
              value={d.description}
              onChange={(e) => ctrl.setBugReportDraft({ description: e.target.value })}
              autoSize={{ minRows: 2, maxRows: 6 }}
              aria-label="Description"
            />
          </Form.Item>
          <Form.Item label="Steps to reproduce (one per line)">
            <Input.TextArea
              value={d.stepsToReproduce}
              onChange={(e) => ctrl.setBugReportDraft({ stepsToReproduce: e.target.value })}
              autoSize={{ minRows: 3, maxRows: 10 }}
              aria-label="Steps to reproduce"
            />
          </Form.Item>
          <div className="yipet-bug-row">
            <Form.Item label="Expected result">
              <Input.TextArea
                value={d.expectedResult}
                onChange={(e) => ctrl.setBugReportDraft({ expectedResult: e.target.value })}
                autoSize={{ minRows: 2, maxRows: 4 }}
                aria-label="Expected result"
              />
            </Form.Item>
            <Form.Item label="Actual result">
              <Input.TextArea
                value={d.actualResult}
                onChange={(e) => ctrl.setBugReportDraft({ actualResult: e.target.value })}
                autoSize={{ minRows: 2, maxRows: 4 }}
                aria-label="Actual result"
              />
            </Form.Item>
          </div>
        </Form>
      )}
    </Modal>
  );
};

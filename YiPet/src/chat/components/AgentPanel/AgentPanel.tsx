/**
 * YiPet Chat — AgentPanel
 * Live agent-mode surface (compact). Mounted between the message list and the
 * status bar when agent mode is active. Renders, top → bottom:
 *   - the structured run-note chips (model_switch / agent_end / error),
 *   - the confirmation gate (Approve/Reject a gated tool call),
 *   - the ask_user prompt (question + optional buttons + free-text answer),
 *   - the todo list surfaced by `todo_write` (interactive local checkboxes),
 *   - the tool-call timeline (name + status + expandable copyable result),
 *   - a steer / follow-up input while the agent is running.
 */

import {
  CheckOutlined,
  CloseOutlined,
  CopyOutlined,
  LoadingOutlined,
  SendOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import { Button, Collapse, Input, Tag } from 'antd';
import { useState } from 'react';
import type { ChatController } from '../../controller';
import type { AgentNote, AgentToolCall } from '../../types';
import './AgentPanel.css';

export interface AgentPanelProps {
  controller: ChatController;
}

function ToolStatusIcon({ status }: { status: AgentToolCall['status'] }) {
  if (status === 'running') return <LoadingOutlined spin className="yp-agent-status-running" />;
  if (status === 'error') return <CloseOutlined className="yp-agent-status-error" />;
  return <CheckOutlined className="yp-agent-status-done" />;
}

/** A tool result with a copy button (self-contained copied feedback). */
function CopyableResult({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const onCopy = () => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => {});
  };
  return (
    <div className="yp-agent-tool-result-wrap">
      <pre className="yp-agent-tool-result">{text}</pre>
      <Button
        className="yp-agent-tool-copy"
        type="text"
        size="small"
        icon={<CopyOutlined />}
        onClick={onCopy}
      >
        {copied ? 'Copied' : ''}
      </Button>
    </div>
  );
}

export function AgentPanel({ controller }: AgentPanelProps) {
  const s = controller.state;
  const [answer, setAnswer] = useState('');
  const [steer, setSteer] = useState('');
  // Local-only todo completion overrides (honest UI overlay — `todo_write` is
  // full-replace, so these are never persisted back to the backend).
  const [todoOverrides, setTodoOverrides] = useState<Record<string, boolean>>({});

  if (!s.agentMode) return null;
  const confirm = s.pendingConfirmation;
  const question = s.pendingQuestion;
  const todos = s.agentTodos;
  const tools = s.agentToolCalls;
  const notes = s.agentNotes;
  const steering = s.isProcessing;
  if (
    !confirm &&
    !question &&
    todos.length === 0 &&
    tools.length === 0 &&
    notes.length === 0 &&
    !steering
  ) {
    return null;
  }

  const submitAnswer = () => {
    const text = answer.trim();
    if (!text) return;
    controller.answerPendingQuestion(text);
    setAnswer('');
  };

  const submitSteer = (kind: 'steer' | 'followUp') => {
    const text = steer.trim();
    if (!text) return;
    if (kind === 'steer') controller.steerAgent(text);
    else controller.followUpAgent(text);
    setSteer('');
  };

  const isTodoDone = (id: string, status: string) =>
    todoOverrides[id] !== undefined ? todoOverrides[id] : status === 'completed';

  return (
    <div className="yp-agent-panel" aria-live="polite">
      {notes.length > 0 && (
        <div className="yp-agent-notes">
          {notes.map((n: AgentNote) => (
            <span key={n.id} className={`yp-agent-note is-${n.kind}`}>
              {n.kind === 'model_switch' ? '⚙️ ' : n.kind === 'agent_end' ? '⚠️ ' : '❌ '}
              {n.text}
            </span>
          ))}
        </div>
      )}

      {confirm && (
        <div className="yp-agent-confirm">
          <div className="yp-agent-confirm-title">
            <ToolOutlined /> Tool confirmation
          </div>
          <div className="yp-agent-confirm-body">
            Allow <b>{confirm.toolName}</b> to run?
          </div>
          <code className="yp-agent-confirm-args">{JSON.stringify(confirm.toolArgs ?? {})}</code>
          <div className="yp-agent-confirm-actions">
            <Button
              size="small"
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => controller.approvePendingConfirmation()}
            >
              Approve
            </Button>
            <Button
              size="small"
              danger
              icon={<CloseOutlined />}
              onClick={() => controller.rejectPendingConfirmation()}
            >
              Reject
            </Button>
          </div>
        </div>
      )}

      {question && (
        <div className="yp-agent-ask">
          <div className="yp-agent-ask-title">Question</div>
          <div className="yp-agent-ask-body">{question.question}</div>
          {question.options.length > 0 && (
            <div className="yp-agent-ask-options">
              {question.options.map((opt) => (
                <Button
                  key={opt}
                  size="small"
                  onClick={() => controller.answerPendingQuestion(opt)}
                >
                  {opt}
                </Button>
              ))}
            </div>
          )}
          <div className="yp-agent-ask-input">
            <Input
              size="small"
              placeholder="Type an answer…"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onPressEnter={submitAnswer}
            />
            <Button size="small" type="primary" disabled={!answer.trim()} onClick={submitAnswer}>
              Send
            </Button>
          </div>
        </div>
      )}

      {todos.length > 0 && (
        <div className="yp-agent-todos">
          <div className="yp-agent-todos-title">Task list</div>
          {todos.map((t) => {
            const done = isTodoDone(t.id, t.status);
            return (
              <div key={t.id} className={`yp-agent-todo is-${done ? 'completed' : t.status}`}>
                <label className="yp-agent-todo-check">
                  <input
                    type="checkbox"
                    checked={done}
                    onChange={() =>
                      setTodoOverrides((prev) => ({ ...prev, [t.id]: !done }))
                    }
                  />
                </label>
                <Tag
                  color={
                    t.status === 'completed'
                      ? 'success'
                      : t.status === 'in_progress'
                        ? 'processing'
                        : 'default'
                  }
                >
                  {t.status === 'completed' ? '✓' : t.status === 'in_progress' ? '▶' : '·'}
                </Tag>
                <span className="yp-agent-todo-content">{t.content}</span>
              </div>
            );
          })}
        </div>
      )}

      {tools.length > 0 && (
        <div className="yp-agent-timeline">
          <div className="yp-agent-timeline-title">Tool calls</div>
          <Collapse
            ghost
            size="small"
            items={tools.map((t) => ({
              key: t.id,
              label: (
                <span className="yp-agent-tool-label">
                  <ToolStatusIcon status={t.status} />
                  <span className="yp-agent-tool-name">{t.name}</span>
                  {t.error && <span className="yp-agent-tool-error">{t.error}</span>}
                </span>
              ),
              children: t.content ? (
                <CopyableResult text={t.content} />
              ) : t.error ? (
                <pre className="yp-agent-tool-error-detail">{t.error}</pre>
              ) : (
                <span className="yp-agent-tool-empty">No result</span>
              ),
            }))}
          />
        </div>
      )}

      {steering && (
        <div className="yp-agent-steer">
          <Input
            size="small"
            placeholder="Steer the agent mid-run…"
            value={steer}
            onChange={(e) => setSteer(e.target.value)}
            onPressEnter={() => submitSteer('steer')}
          />
          <Button
            size="small"
            type="primary"
            icon={<SendOutlined />}
            disabled={!steer.trim()}
            onClick={() => submitSteer('steer')}
          >
            Steer
          </Button>
          <Button
            size="small"
            disabled={!steer.trim()}
            onClick={() => submitSteer('followUp')}
          >
            Queue
          </Button>
        </div>
      )}
    </div>
  );
}

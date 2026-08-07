/**
 * YiPet Chat — ChatToolbar
 * Left group: FAQ / Image / Session edit / Page context / Tags / WeCom / Voice
 * Right group: Context pill + Clear (conditional) + RequestStatusButton
 */

import {
  AudioOutlined,
  BookOutlined,
  BugOutlined,
  BulbOutlined,
  CloseCircleOutlined,
  DatabaseOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  FileTextOutlined,
  GlobalOutlined,
  HighlightOutlined,
  HistoryOutlined,
  PictureOutlined,
  ProfileOutlined,
  RobotOutlined,
  TagOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Badge, Button, Dropdown, Popover, Switch, Tooltip, Typography, Upload } from 'antd';
import type { FC } from 'react';
import type { ChatController } from '../../controller';
import { RequestStatusButton } from '../RequestStatusButton/RequestStatusButton';
import './ChatToolbar.css';

export interface ChatToolbarProps {
  controller: ChatController;
  voiceSupported: boolean;
  isRecording: boolean;
  onVoiceClick: () => void;
  hasContent: boolean;
  onClearInput: () => void;
}

function formatLastBuilt(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const diffMs = Date.now() - d.getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${d.toLocaleDateString()}`;
}

const PROJECT_LINKS: { key: string; label: string; url: string }[] = [
  { key: 'yiAi', label: 'YiAi backend (port 10086)', url: 'http://localhost:10086' },
  { key: 'yiVad', label: 'YiVad admin', url: 'http://localhost:8848' },
  { key: 'yiVadAiChat', label: 'YiVad aiChat', url: 'http://localhost:8848/#/aiChat/index' },
  {
    key: 'yiVadBugs',
    label: 'YiVad code-review / bugs',
    url: 'http://localhost:8848/#/code-review/bugs',
  },
  { key: 'yiVadBrd', label: 'YiVad BRD', url: 'http://localhost:8848/#/brd' },
  { key: 'yiVadStory', label: 'YiVad Story Board', url: 'http://localhost:8848/#/story' },
];

export const ChatToolbar: FC<ChatToolbarProps> = ({
  controller,
  voiceSupported,
  isRecording,
  onVoiceClick,
  hasContent,
  onClearInput,
}) => {
  const s = controller.state;
  const maxDraftImages = 4;

  const ragBuilt = !!s.ragStatus?.built;
  const ragNumDocs = typeof s.ragStatus?.num_docs === 'number' ? s.ragStatus.num_docs : undefined;
  const ragLastBuilt = formatLastBuilt(s.ragStatus?.last_built_at as string | undefined);
  const ragStatusText = s.ragStatusLoading
    ? 'RAG status: loading…'
    : ragBuilt
      ? `RAG: built${ragNumDocs != null ? ` (${ragNumDocs} docs${ragLastBuilt ? ', ' + ragLastBuilt : ''})` : ''} — click to rebuild`
      : 'RAG: index not built — click to build';
  const ragBadgeStatus: 'success' | 'warning' | 'processing' = s.ragStatusLoading
    ? 'processing'
    : ragBuilt
      ? 'success'
      : 'warning';

  const promptHistoryList = [...s.promptHistory].reverse();
  const promptHistoryContent = (
    <div style={{ width: 320, maxHeight: 360, overflowY: 'auto' }}>
      {promptHistoryList.length === 0 ? (
        <Typography.Text
          type="secondary"
          style={{ fontSize: 12, display: 'block', padding: 12, textAlign: 'center' }}
        >
          No prompt history yet. Use ArrowUp in the input to recall.
        </Typography.Text>
      ) : (
        promptHistoryList.map((p, i) => {
          const realIdx = s.promptHistory.length - 1 - i;
          return (
            <div
              key={`${realIdx}-${p.slice(0, 24)}`}
              style={{
                padding: '6px 8px',
                borderBottom: '1px solid rgba(127, 127, 127, 0.15)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
              onClick={() => controller.invokePromptHistory(realIdx)}
              title="Click to re-invoke"
            >
              <Typography.Text ellipsis style={{ fontSize: 12, flex: 1, minWidth: 0 }}>
                {p}
              </Typography.Text>
              <Button
                size="small"
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  controller.removePromptHistoryAt(realIdx);
                }}
                aria-label="Remove from history"
                style={{ flexShrink: 0 }}
              />
            </div>
          );
        })
      )}
      {s.promptHistory.length > 0 && (
        <div
          style={{
            padding: 6,
            textAlign: 'right',
            borderTop: '1px solid rgba(127, 127, 127, 0.2)',
          }}
        >
          <Button size="small" type="link" danger onClick={() => controller.clearPromptHistory()}>
            Clear all
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="yipet-chat-toolbar" role="toolbar" aria-label="Conversation toolbar">
      <div className="ct-left">
        <Tooltip title="FAQ">
          <Button
            type="text"
            size="small"
            icon={<BulbOutlined />}
            onClick={() => controller.openFaqManager()}
            aria-label="FAQ"
          />
        </Tooltip>
        <Popover
          open={s.promptHistoryVisible}
          onOpenChange={(v) =>
            v ? controller.openPromptHistory() : controller.closePromptHistory()
          }
          content={promptHistoryContent}
          title="Prompt history"
          trigger="click"
          placement="bottomLeft"
          arrow={false}
        >
          <Tooltip title="Prompt history (ArrowUp to recall in input)">
            <Button
              type="text"
              size="small"
              icon={<HistoryOutlined />}
              aria-label="Prompt history"
            />
          </Tooltip>
        </Popover>
        <Upload
          accept="image/*"
          multiple
          showUploadList={false}
          beforeUpload={(file) => {
            const remaining = maxDraftImages - s.draftImages.length;
            if (remaining <= 0) return false;
            const reader = new FileReader();
            reader.onload = (ev) => {
              const src = ev.target?.result as string;
              if (src) controller.addDraftImages([src]);
            };
            reader.readAsDataURL(file);
            return false;
          }}
        >
          <Button
            type="text"
            size="small"
            icon={<PictureOutlined />}
            title="Upload image (paste supported)"
            aria-label="Upload image"
          />
        </Upload>
        <Tooltip title="Edit session">
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            disabled={!s.currentSessionId}
            onClick={() => controller.editSessionInfo()}
            aria-label="Edit session"
          />
        </Tooltip>
        <Tooltip title="Export session as markdown">
          <Button
            type="text"
            size="small"
            icon={<DownloadOutlined />}
            disabled={s.messages.length === 0}
            onClick={() => controller.exportCurrentSessionMarkdown()}
            aria-label="Export session as markdown"
          />
        </Tooltip>
        <Tooltip title="Summarize session">
          <Button
            type="text"
            size="small"
            icon={<ProfileOutlined />}
            disabled={s.messages.length === 0 || s.isProcessing}
            onClick={() => controller.summarizeCurrentSession()}
            aria-label="Summarize session"
          />
        </Tooltip>
        <Tooltip title="Page context">
          <Button
            type="text"
            size="small"
            icon={<FileTextOutlined />}
            onClick={() => controller.openContextEditor()}
            aria-label="Page context"
          />
        </Tooltip>
        <Tooltip title="Tag management">
          <Button
            type="text"
            size="small"
            icon={<TagOutlined />}
            onClick={() => controller.openTagManager()}
            aria-label="Tag management"
          />
        </Tooltip>
        <Tooltip
          title={s.knowledgeGrounded ? 'Knowledge grounding ON (RAG)' : 'Knowledge grounding OFF'}
        >
          <Button
            type="text"
            size="small"
            icon={<BookOutlined />}
            color={s.knowledgeGrounded ? 'primary' : 'default'}
            variant={s.knowledgeGrounded ? 'solid' : 'text'}
            onClick={() => controller.toggleKnowledgeGrounded()}
            aria-label="Knowledge grounding toggle"
            aria-pressed={s.knowledgeGrounded}
          />
        </Tooltip>
        {s.knowledgeGrounded && (
          <Tooltip title={ragStatusText}>
            <Button
              type="text"
              size="small"
              onClick={() => controller.rebuildRagIndex()}
              disabled={s.ragStatusLoading}
              aria-label="RAG index status — click to rebuild"
            >
              <Badge status={ragBadgeStatus} />
              <DatabaseOutlined style={{ fontSize: 12, marginLeft: 4 }} />
            </Button>
          </Tooltip>
        )}
        <Tooltip title="Bot settings">
          <Button
            type="text"
            size="small"
            icon={<RobotOutlined />}
            onClick={() => controller.openWeChatSettings()}
            aria-label="Bot settings"
          />
        </Tooltip>
        <Tooltip title="Insert selection as prompt">
          <Button
            type="text"
            size="small"
            icon={<HighlightOutlined />}
            onClick={() => controller.insertSelectionAsInput()}
            aria-label="Insert selection as prompt"
          />
        </Tooltip>
        <Dropdown
          trigger={['click']}
          placement="bottomLeft"
          menu={
            {
              items: [
                {
                  key: '__discuss_page',
                  label: 'Discuss this page in YiVad aiChat',
                  onClick: () => controller.discussInYiVadAiChat(),
                },
                { type: 'divider' as const },
                ...PROJECT_LINKS.map((p) => ({
                  key: p.key,
                  label: p.label,
                  onClick: () => window.open(p.url, '_blank', 'noopener,noreferrer'),
                })),
              ],
            } as MenuProps
          }
        >
          <Tooltip title="Cross-project hub — open YiVad / YiAi">
            <Button
              type="text"
              size="small"
              icon={<GlobalOutlined />}
              aria-label="Cross-project navigation menu"
            />
          </Tooltip>
        </Dropdown>
        <Tooltip title="Log a bug (cross-project)">
          <Button
            type="text"
            size="small"
            icon={<BugOutlined />}
            onClick={() => controller.openBugReport()}
            aria-label="Log a bug"
          />
        </Tooltip>
        {voiceSupported && (
          <Tooltip title={isRecording ? 'Stop voice input' : 'Voice input'}>
            <Button
              type="text"
              size="small"
              danger={isRecording}
              icon={<AudioOutlined />}
              onClick={onVoiceClick}
              aria-label="Voice input"
              aria-pressed={isRecording}
            />
          </Tooltip>
        )}
      </div>
      <div className="ct-right">
        <div className="ct-context-pill">
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            Context
          </Typography.Text>
          <Switch
            size="small"
            checked={s.contextEnabled}
            onChange={() => controller.toggleContext()}
            aria-label="Page context toggle"
          />
        </div>
        {hasContent && (
          <Button
            type="text"
            size="small"
            icon={<CloseCircleOutlined />}
            onClick={onClearInput}
            aria-label="Clear input"
          />
        )}
        <RequestStatusButton
          sending={s.isProcessing}
          streamingType={s.streamingType}
          onStop={() => controller.stopSending()}
        />
      </div>
    </div>
  );
};

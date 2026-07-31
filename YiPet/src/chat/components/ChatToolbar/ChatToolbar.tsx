/**
 * YiPet Chat — ChatToolbar
 * Left group: FAQ / Image / Session edit / Page context / Tags / WeCom / Voice
 * Right group: Context pill + Clear (conditional) + RequestStatusButton
 */

import {
  AudioOutlined,
  BulbOutlined,
  CloseCircleOutlined,
  EditOutlined,
  FileTextOutlined,
  PictureOutlined,
  RobotOutlined,
  TagOutlined,
} from '@ant-design/icons';
import { Button, Switch, Tooltip, Typography, Upload } from 'antd';
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
        <Tooltip title="Bot settings">
          <Button
            type="text"
            size="small"
            icon={<RobotOutlined />}
            onClick={() => controller.openWeChatSettings()}
            aria-label="Bot settings"
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

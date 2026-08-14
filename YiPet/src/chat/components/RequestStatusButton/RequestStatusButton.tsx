import { PauseCircleOutlined } from '@ant-design/icons';
import type { FC } from 'react';
import './RequestStatusButton.css';

export interface RequestStatusButtonProps {
  sending: boolean;
  streamingType?: '' | 'send' | 'regenerate' | 'resend';
  disabled?: boolean;
  onStop: () => void;
}

export const RequestStatusButton: FC<RequestStatusButtonProps> = ({
  sending,
  streamingType,
  disabled,
  onStop,
}) => {
  const labelMap: Record<string, string> = {
    send: 'Sending',
    regenerate: 'Regenerating',
    resend: 'Resending',
  };
  const title = sending
    ? `Request status: ${labelMap[streamingType || 'send'] || 'Sending'} (click to stop)`
    : 'Request status: idle';
  const label = sending ? 'Stop' : 'Idle';

  return (
    <button
      type="button"
      className={`rs-btn ${sending ? 'rs-btn--active' : 'rs-btn--idle'}`}
      title={title}
      aria-label={title}
      disabled={!sending && disabled}
      onClick={onStop}
    >
      <PauseCircleOutlined className="rs-icon" />
      <span className="rs-label">{label}</span>
    </button>
  );
};

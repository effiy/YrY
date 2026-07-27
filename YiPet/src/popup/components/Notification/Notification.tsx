import './Notification.css';

export interface NotificationProps {
  visible: boolean;
  message: string;
  type: string;
}

export function Notification(props: NotificationProps) {
  if (!props.visible) return null;
  const cls = 'notification ' + (props.type || 'info');
  return (
    <div className="notification-area">
      <div className={cls}>{props.message}</div>
    </div>
  );
}

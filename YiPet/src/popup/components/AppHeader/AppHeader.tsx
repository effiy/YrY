import { Tag, Typography } from 'antd';
import { t } from '@/shared/i18n/index';

export interface AppHeaderProps {
  model: string | null;
  visible: boolean;
  statusText: string;
}

export function AppHeader(props: AppHeaderProps) {
  return (
    <div className="popup-header">
      <div className="popup-header-brand">
        <Typography.Title level={4} style={{ margin: 0 }}>
          {t('extName')}
        </Typography.Title>
        <Typography.Text type="secondary">
          {t('popupModelPrefix', props.model || '-')}
        </Typography.Text>
      </div>
      <Tag color={props.visible ? 'success' : 'warning'}>{props.statusText}</Tag>
    </div>
  );
}

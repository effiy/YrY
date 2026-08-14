import { Typography } from 'antd';
import type { CSSProperties } from 'react';

export interface AppFooterProps {
  hintText: string;
  version: string;
}

const footerStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '8px 12px',
};

export function AppFooter(props: AppFooterProps) {
  return (
    <div className="popup-footer-row" style={footerStyle}>
      <Typography.Text type="secondary" ellipsis style={{ flex: 1 }}>
        {props.hintText}
      </Typography.Text>
      <Typography.Text code>{props.version}</Typography.Text>
    </div>
  );
}

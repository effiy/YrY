/**
 * YiPet Popup — AppFooter
 * Status hint line + version badge.
 */

import { Typography } from 'antd';
import './AppFooter.css';

export interface AppFooterProps {
  hintText: string;
  version: string;
}

export function AppFooter(props: AppFooterProps) {
  return (
    <div className="popup-footer-row">
      <Typography.Text className="popup-footer-hint" ellipsis>
        {props.hintText}
      </Typography.Text>
      <Typography.Text className="popup-footer-version">{props.version}</Typography.Text>
    </div>
  );
}

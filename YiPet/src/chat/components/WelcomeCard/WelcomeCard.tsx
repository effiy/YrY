/**
 * YiPet Chat — WelcomeCard Component (antd Card + Typography)
 */
import { Card, Typography } from 'antd';
import type { CSSProperties } from 'react';
import type { PageInfo } from '@/chat/types';

export type { PageInfo };

export interface WelcomeCardProps {
  pageInfo: PageInfo;
  messageCount: number;
}

const headerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  marginBottom: 8,
};

export function WelcomeCard(props: WelcomeCardProps) {
  const { title, url, iconUrl } = props.pageInfo;

  return (
    <Card size="small" className="welcome-card">
      <div style={headerStyle}>
        {iconUrl && <img src={iconUrl} alt="" style={{ width: 16, height: 16 }} />}
        <Typography.Text strong ellipsis style={{ flex: 1 }}>
          {title}
        </Typography.Text>
      </div>
      {url && (
        <div>
          <Typography.Text type="secondary">URL:</Typography.Text>{' '}
          <Typography.Link href={url} target="_blank" rel="noopener noreferrer" ellipsis>
            {url}
          </Typography.Link>
        </div>
      )}
      {props.messageCount > 0 && (
        <div style={{ marginTop: 8 }}>
          <Typography.Text type="secondary">Messages {props.messageCount}</Typography.Text>
        </div>
      )}
    </Card>
  );
}

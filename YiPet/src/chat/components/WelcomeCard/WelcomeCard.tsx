/**
 * YiPet Chat — WelcomeCard Component
 *
 * Replaces the HTML-string-based welcome card in ChatController._buildWelcomeHtml().
 */

import type { PageInfo } from '@/chat/types';

export type { PageInfo };

export interface WelcomeCardProps {
  pageInfo: PageInfo;
  messageCount: number;
}

export function WelcomeCard(props: WelcomeCardProps) {
  const { title, url, iconUrl } = props.pageInfo;

  return (
    <div className="welcome-card">
      <div className="welcome-card-header">
        <div className="welcome-card-header-left">
          {iconUrl ? <img className="welcome-card-favicon" src={iconUrl} alt="" /> : null}
          <div className="welcome-card-title" title={title}>
            {title}
          </div>
        </div>
      </div>
      {url ? (
        <div className="welcome-card-row">
          <div className="welcome-card-label">网址</div>
          <div className="welcome-card-value">
            <a href={url} target="_blank" rel="noopener noreferrer" className="welcome-card-url">
              {url}
            </a>
          </div>
        </div>
      ) : null}
      {props.messageCount > 0 ? (
        <div className="welcome-card-footer">
          <div className="welcome-card-meta">
            <span>消息 {props.messageCount}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

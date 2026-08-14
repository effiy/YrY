/**
 * YiPet Popup — AboutCard
 * Collapsible "About" panel (tagline + description + highlights + backend),
 * collapsed by default so the control panel stays compact.
 */

import { Collapse, List, Typography } from 'antd';
import { t } from '@/shared/i18n';
import './AboutCard.css';

interface Feature {
  icon: string;
  textKey: string;
}

const FEATURES: Feature[] = [
  { icon: '🐾', textKey: 'aboutFeaturePet' },
  { icon: '💬', textKey: 'aboutFeatureChat' },
  { icon: '🌐', textKey: 'aboutFeatureI18n' },
  { icon: '🕐', textKey: 'aboutFeatureTimezone' },
  { icon: '📦', textKey: 'aboutFeatureCDN' },
  { icon: '🔌', textKey: 'aboutFeatureApi' },
];

export function AboutCard() {
  return (
    <div className="popup-about">
      <Collapse
        ghost
        items={[
          {
            key: 'about',
            label: <span className="popup-about-label">{t('aboutTitle')}</span>,
            children: (
              <div className="popup-about-body">
                <Typography.Paragraph className="popup-about-tagline">
                  {t('aboutTagline')}
                </Typography.Paragraph>
                <Typography.Paragraph type="secondary">
                  {t('aboutDescription')}
                </Typography.Paragraph>

                <Typography.Title level={5} className="popup-about-section-title">
                  {t('aboutFeaturesTitle')}
                </Typography.Title>
                <List
                  size="small"
                  dataSource={FEATURES}
                  renderItem={(f) => (
                    <List.Item>
                      <span className="popup-about-feature-icon">{f.icon}</span>
                      <span>{t(f.textKey as never)}</span>
                    </List.Item>
                  )}
                />

                <Typography.Title level={5} className="popup-about-section-title">
                  {t('aboutBackendTitle')}
                </Typography.Title>
                <Typography.Paragraph type="secondary">
                  {t('aboutBackendDesc')}
                </Typography.Paragraph>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}

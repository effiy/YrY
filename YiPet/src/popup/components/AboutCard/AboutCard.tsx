import { Card, List, Tag, Typography } from 'antd';
import { t } from '@/shared/i18n/index';

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

interface Dep {
  name: string;
  ver: string;
  src?: string;
}

const PROD_DEPS: Dep[] = [
  { name: 'react', ver: '18.3.1', src: 'bundled' },
  { name: 'react-dom', ver: '18.3.1', src: 'bundled' },
  { name: 'antd', ver: '5.21', src: 'bundled' },
  { name: '@ant-design/icons', ver: '5.5', src: 'bundled' },
];

const DEV_DEPS: Dep[] = [
  { name: 'typescript', ver: '^5.5' },
  { name: '@rsbuild/core', ver: '^1.7' },
  { name: '@rsbuild/plugin-react', ver: '^1.4' },
  { name: 'vitest', ver: '^2.0' },
  { name: '@types/chrome', ver: '^0.0.270' },
  { name: '@vitejs/plugin-react', ver: '^6.0' },
  { name: 'jsdom', ver: '^29.1' },
];

export function AboutCard() {
  return (
    <Card title={t('aboutTitle')} size="small" className="popup-about">
      <Typography.Paragraph type="secondary">{t('aboutTagline')}</Typography.Paragraph>
      <Typography.Paragraph>{t('aboutDescription')}</Typography.Paragraph>

      <Typography.Title level={5}>{t('aboutFeaturesTitle')}</Typography.Title>
      <List
        size="small"
        dataSource={FEATURES}
        renderItem={(f) => (
          <List.Item>
            <span style={{ marginRight: 8 }}>{f.icon}</span>
            <span>{t(f.textKey as never)}</span>
          </List.Item>
        )}
      />

      <Typography.Title level={5}>{t('aboutProdDepsTitle')}</Typography.Title>
      <List
        size="small"
        dataSource={PROD_DEPS}
        renderItem={(d: Dep) => (
          <List.Item>
            <span style={{ flex: 1 }}>{d.name}</span>
            <Tag>{d.ver}</Tag>
            {d.src && <Typography.Text type="secondary">{d.src}</Typography.Text>}
          </List.Item>
        )}
      />

      <Typography.Title level={5}>{t('aboutDevDepsTitle')}</Typography.Title>
      <List
        size="small"
        dataSource={DEV_DEPS}
        renderItem={(d: Dep) => (
          <List.Item>
            <span style={{ flex: 1 }}>{d.name}</span>
            <Tag>{d.ver}</Tag>
          </List.Item>
        )}
      />

      <Typography.Title level={5}>{t('aboutBackendTitle')}</Typography.Title>
      <Typography.Paragraph type="secondary">{t('aboutBackendDesc')}</Typography.Paragraph>
    </Card>
  );
}

import { t } from '../../../shared/i18n';

export function AboutCard() {
  return (
    <section className="card">
      <h2 className="card-title">{t('aboutTitle')}</h2>
      <div className="setting-list">
        {/* Tagline */}
        <p className="about-tagline">{t('aboutTagline')}</p>

        {/* Description */}
        <div className="about-description">
          <p>{t('aboutDescription')}</p>
        </div>

        {/* Feature Highlights */}
        <div className="about-section">
          <h3 className="about-section-title">{t('aboutFeaturesTitle')}</h3>
          <ul className="about-feature-list">
            <li className="about-feature-item">
              <span className="about-feature-icon">🐾</span>
              <span className="about-feature-text">{t('aboutFeaturePet')}</span>
            </li>
            <li className="about-feature-item">
              <span className="about-feature-icon">💬</span>
              <span className="about-feature-text">{t('aboutFeatureChat')}</span>
            </li>
            <li className="about-feature-item">
              <span className="about-feature-icon">🌐</span>
              <span className="about-feature-text">{t('aboutFeatureI18n')}</span>
            </li>
            <li className="about-feature-item">
              <span className="about-feature-icon">🕐</span>
              <span className="about-feature-text">{t('aboutFeatureTimezone')}</span>
            </li>
            <li className="about-feature-item">
              <span className="about-feature-icon">📦</span>
              <span className="about-feature-text">{t('aboutFeatureCDN')}</span>
            </li>
            <li className="about-feature-item">
              <span className="about-feature-icon">🔌</span>
              <span className="about-feature-text">{t('aboutFeatureApi')}</span>
            </li>
          </ul>
        </div>

        {/* Architecture Overview */}
        <div className="about-section">
          <h3 className="about-section-title">{t('aboutArchitectureTitle')}</h3>
          <p className="about-arch-desc">{t('aboutArchitectureDesc')}</p>
          <div className="about-arch-diagram">
            <div className="about-arch-layer">{t('aboutArchLayerPopup')}</div>
            <span className="about-arch-arrow">↔</span>
            <div className="about-arch-layer">{t('aboutArchLayerContent')}</div>
            <span className="about-arch-arrow">↔</span>
            <div className="about-arch-layer">{t('aboutArchLayerBackend')}</div>
          </div>
        </div>

        {/* Backend Connection */}
        <div className="about-section">
          <h3 className="about-section-title">{t('aboutBackendTitle')}</h3>
          <p className="about-backend-desc">{t('aboutBackendDesc')}</p>
        </div>

        {/* Meta */}
        <div className="about-meta">
          <span className="about-version">{t('aboutVersion')}</span>
          <span className="about-tech">{t('aboutTechStack')}</span>
        </div>
      </div>
    </section>
  );
}

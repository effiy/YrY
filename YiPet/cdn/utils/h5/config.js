/**
 * H5 configuration bridge
 *
 * Provides the `config` object originally imported from YiH5/config.js.
 * The h5/ components access config.ui.vlistMinItems and config.ui.newsVlistMinItems.
 * Defaults are provided as fallbacks.
 */

export const config = {
  ui: {
    vlistMinItems: 60,
    newsVlistMinItems: 60
  }
};

// If global PET_CONFIG exists, merge its ui values
if (typeof window !== 'undefined' && window.PET_CONFIG && window.PET_CONFIG.config) {
  const globalConfig = window.PET_CONFIG.config;
  if (globalConfig.ui) {
    Object.assign(config.ui, globalConfig.ui);
  }
}

import './LangSwitch.css';
import { t } from '@/shared/i18n/index';
import type { SupportedLocale } from '@/shared/i18n/locale';

export interface LangSwitchProps {
  value: SupportedLocale;
  disabled: boolean;
  onChange: (locale: SupportedLocale) => void;
}

const LANG_OPTIONS: { value: SupportedLocale; labelKey: string }[] = [
  { value: 'en', labelKey: 'English' },
  { value: 'zh_CN', labelKey: '简体中文' },
];

export function LangSwitch(props: LangSwitchProps) {
  return (
    <div className="setting-row">
      <span className="setting-label-inline">{t('popupLanguageLabel')}</span>
      <div className="lang-switch-group">
        {LANG_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={'lang-btn' + (props.value === opt.value ? ' lang-btn--active' : '')}
            disabled={props.disabled}
            onClick={() => props.onChange(opt.value)}
          >
            {opt.labelKey}
          </button>
        ))}
      </div>
    </div>
  );
}

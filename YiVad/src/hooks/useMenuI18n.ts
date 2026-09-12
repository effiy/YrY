import { useI18n } from "vue-i18n";

export function useMenuI18n() {
  const { t, te } = useI18n();

  const translateTitle = (name: string, fallback: string): string => {
    const key = `menuTitles.${name}`;
    return te(key) ? t(key) : fallback;
  };

  return { translateTitle };
}
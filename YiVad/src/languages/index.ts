import { createI18n } from "vue-i18n";
import { getBrowserLang } from "@/utils";
import { messages } from "./modules";

const isDev = process.env.NODE_ENV !== "production";

const i18n = createI18n({
  legacy: false,
  locale: getBrowserLang(),
  fallbackLocale: "en",
  missingWarn: isDev,
  fallbackWarn: isDev,
  messages
});

export default i18n;

/**
 * YiVad 多语言入口（vue-i18n 11.x，Composition API 模式）。
 *
 * 规范文档：file:///Users/yi/YrY/YiKnowledge/projects/yivad/workflows/开发规范/08-规范-国际化规范.md
 * PRD：file:///Users/yi/YrY/YiKnowledge/projects/yivad/prds/2026-09/85-prd-多语言专项优化与补充.md
 * Dev：file:///Users/yi/YrY/YiKnowledge/projects/yivad/devs/2026-09/85-dev-多语言专项优化与补充.md
 *
 * 「新增一个 locale 键」：
 *   → 编辑对应 src/languages/modules/<name>/{zh.ts,en.ts}，保持两文件结构一致
 *   → 命名规则：<module>.<subModule>.<semantic>
 *
 * 「新增一个 locale 模块」：
 *   → 新建 modules/<name>/{zh.ts,en.ts}，都 `export default { <name>: { ... } }`
 *   → 在 modules/index.ts 顶部 import 两个文件并在 zh {} / en {} 中展开
 *   → 完整步骤见上面规范文档的「新增模块 locale 的步骤」章节
 */
import { createI18n } from "vue-i18n";
import { getBrowserLang } from "@/utils";
import { messages } from "./modules";

export type LocaleCode = "zh" | "en";
export const AVAILABLE_LOCALES: LocaleCode[] = ["zh", "en"];

export function normalizeLocale(input: string): LocaleCode {
  if (!input) return "en";
  const key = String(input).toLowerCase().replace("_", "-");
  if (key.startsWith("zh") || key === "cn") return "zh";
  return "en";
}

export function isLocaleCode(v: unknown): v is LocaleCode {
  return typeof v === "string" && (AVAILABLE_LOCALES as string[]).includes(v);
}

const isDev = process.env.NODE_ENV !== "production";

const i18n = createI18n({
  legacy: false,
  locale: normalizeLocale(getBrowserLang()),
  fallbackLocale: "en",
  missingWarn: isDev,
  fallbackWarn: isDev,
  messages
});

export default i18n;

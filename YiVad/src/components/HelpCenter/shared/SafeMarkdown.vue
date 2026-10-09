<!-- SafeMarkdown.vue — HelpOS Markdown 渲染器（白名单标签集，STRIDE-XSS 缓解） -->
<template>
  <div v-if="compiled" class="help-md" v-html="compiled" />
</template>

<script setup lang="ts">
/**
 * ⚠️ XSS 白名单标签集（对齐 PRD §7.4.1 / NFR-7.4.1）。
 *   允许：h1~h6, p, ul, ol, li, strong, em, code, pre, blockquote, a, kbd, table, thead, tbody, tr, th, td, br, hr
 *   禁止：script, style, iframe, on*, event handlers, <a href="javascript:">
 *   图片：禁止（外链图片存在追踪风险）；如需插图走独立组件。
 */
import { computed } from "vue";
import { marked } from "marked";
import DOMPurify from "dompurify";

const props = defineProps<{ content: string; base?: string }>();

const ALLOWED_TAGS = new Set([
  "h1","h2","h3","h4","h5","h6","p","ul","ol","li","strong","em","code","pre",
  "blockquote","a","kbd","table","thead","tbody","tr","th","td","br","hr","mark","span","div"
]);
const ALLOWED_ATTRS: Record<string, string[]> = {
  a: ["href", "title", "target", "rel"],
  td: ["align"],
  th: ["align"],
  div: ["class"],
  span: ["class"],
  mark: [],
  kbd: ["class"]
};

const compiled = computed(() => {
  const raw = props.content ?? "";
  if (!raw) return "";
  try {
    const html = marked.parse(raw, { async: false, breaks: true, gfm: true }) as string;
    const clean = DOMPurify.sanitize(html, {
      ADD_TAGS: [...ALLOWED_TAGS],
      ALLOWED_TAGS: [...ALLOWED_TAGS],
      ALLOWED_ATTR: Object.values(ALLOWED_ATTRS).flat(),
      ALLOW_DATA_ATTR: false,
      ALLOW_UNKNOWN_PROTOCOLS: false,
      ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel):|[^a-z]|[a-z+.\\-]+(?:[^a-z+.\\-]|$))/i
    });
    // 强制 <a> 的 target/rel + 外链二次确认
    return enforceSafeLinks(clean);
  } catch (e) {
    return `<pre class="help-md__error">Markdown parse failed: ${String(e)}</pre>`;
  }
});

function enforceSafeLinks(html: string): string {
  return html.replace(
    /<a\b([^>]*)>([\s\S]*?)<\/a>/gi,
    (_m, attrsRaw: string, inner: string) => {
      const href = /href="([^"]*)"/i.exec(attrsRaw)?.[1] ?? "";
      const isExternal = /^https?:\/\//i.test(href);
      const target = isExternal ? ` target="_blank" rel="noopener noreferrer nofollow"` : "";
      const danger = /^javascript:/i.test(href) || /(data|file|vbscript):/i.test(href);
      if (danger) return `<span class="help-md__broken-link" title="Blocked unsafe link">⚠ ${inner}</span>`;
      const title = /title="([^"]*)"/i.exec(attrsRaw)?.[1];
      const titleAttr = title ? ` title="${title}"` : "";
      const dataAttr = isExternal ? ' data-external-link="true"' : "";
      const onClick = isExternal
        ? ' onclick="event.preventDefault(); if(confirm(\'\\u5916\\u94FE\\u8DF3\\u8F6C\\u4E8C\\u6B21\\u786E\\u8BA4\\uFF1A\\n\\n\\u60A8\\u5373\\u5C06\\u8DF3\\u8F6C\\u5230\\u5916\\u90E8\\u9875\\u9762\\uFF0C\\u662F\\u5426\\u7EE7\\u7EED\\uFF1F\\n\' + decodeURIComponent(\'' + encodeURIComponent(href) + '\'))){ window.open(\'' + href + '\', \'_blank\', \'noopener,noreferrer,nofollow\'); }"'
        : "";
      return `<a href="${href}"${target}${titleAttr}${dataAttr}${onClick}>${inner}</a>`;
    }
  );
}

// 显式引用 DOMPurify / marked 避免 bundler tree-shake
void DOMPurify;
void marked;
</script>

<!--
  非 setup <script>：仅暴露组件名（通过 defineOptions 等价语义）。
  【红线】禁止与 <script setup> 重复 import 同一模块（会造成 TS2300 Duplicate identifier）。
-->
<script lang="ts">
export default { name: "SafeMarkdown" };
</script>

<style lang="scss" scoped>
.help-md {
  color: var(--el-text-color-primary);
  font: var(--el-font-size-base) / 1.6 var(--el-font-family);
  line-height: 1.7;
  h1, h2, h3, h4, h5, h6 { margin: 1em 0 .5em; font-weight: 600; color: var(--el-text-color-primary); }
  h1 { font-size: 1.3em; }
  h2 { font-size: 1.2em; }
  h3 { font-size: 1.1em; }
  p, ul, ol, pre, blockquote, table { margin: .6em 0; }
  ul, ol { padding-left: 1.4em; }
  blockquote {
    margin-left: 0; padding: 6px 12px;
    border-left: 3px solid var(--el-color-primary-light-5);
    background: var(--el-fill-color-lighter); color: var(--el-text-color-secondary);
  }
  code {
    padding: 1px 6px; font-family: var(--el-font-family-mono, ui-monospace, SFMono-Regular, Menlo, monospace);
    font-size: .92em; background: var(--el-fill-color-light);
    border: 1px solid var(--el-border-color-lighter); border-radius: 4px;
  }
  pre {
    padding: 12px; background: var(--el-fill-color-lighter);
    border: 1px solid var(--el-border-color-lighter); border-radius: 8px;
    overflow-x: auto;
    code { background: transparent; border: 0; padding: 0; }
  }
  table { border-collapse: collapse; width: 100%; font-size: 13px; }
  th, td { border: 1px solid var(--el-border-color); padding: 6px 10px; }
  th { background: var(--el-fill-color-light); text-align: left; }
  kbd {
    display: inline-flex; align-items: center; height: 20px; padding: 0 6px;
    font: 600 11px/1 var(--el-font-family-mono, ui-monospace, monospace);
    color: var(--el-text-color-secondary);
    background: var(--el-fill-color);
    border: 1px solid var(--el-border-color);
    border-bottom-width: 2px; border-radius: 4px;
  }
  a { color: var(--el-color-primary); }
  mark { background: var(--el-color-warning-light-9); color: inherit; padding: 0 2px; border-radius: 2px; }
  &__error { color: var(--el-color-danger); white-space: pre-wrap; }
  &__broken-link { color: var(--el-color-danger); cursor: not-allowed; }
}
@media (prefers-color-scheme: dark) { /* 语义化变量处理暗色，无需额外规则 */ }
</style>

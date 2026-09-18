<template>
  <div class="code-block-pro" :class="`lang-${lang}`">
    <div class="code-toolbar">
      <div class="toolbar-left">
        <span class="code-lang-badge" :data-lang="lang">{{ langLabel }}</span>
        <span v-if="title" class="code-title">{{ title }}</span>
      </div>
      <div class="toolbar-right">
        <el-button text size="small" @click="copy" class="copy-btn">
          <el-icon><CopyDocument /></el-icon>
          <span class="copy-label">{{ copyLabel }}</span>
        </el-button>
      </div>
    </div>
    <div class="code-body">
      <div class="code-gutter" aria-hidden="true">
        <span v-for="n in lineCount" :key="n" class="line-num">{{ n }}</span>
      </div>
      <pre class="code-content"><code v-html="highlighted"></code></pre>
    </div>
  </div>
</template>

<script setup lang="ts" name="CodeBlock">
import { CopyDocument } from "@element-plus/icons-vue";
import { computed, ref } from "vue";

const props = withDefaults(
  defineProps<{
    code: string;
    lang?: string;
    title?: string;
  }>(),
  { lang: "vue", title: "" }
);

const langLabel = computed(() => {
  const map: Record<string, string> = {
    vue: "Vue SFC",
    ts: "TypeScript",
    js: "JavaScript",
    scss: "SCSS",
    bash: "Shell",
    json: "JSON"
  };
  return map[props.lang] || props.lang.toUpperCase();
});

const lineCount = computed(() => props.code.split("\n").length);
const copyLabel = ref("复制");

async function copy() {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(props.code);
    } else {
      const ta = document.createElement("textarea");
      ta.value = props.code;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    copyLabel.value = "已复制";
    setTimeout(() => (copyLabel.value = "复制"), 1500);
  } catch {
    copyLabel.value = "复制失败";
    setTimeout(() => (copyLabel.value = "复制"), 1500);
  }
}

function escape(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const KEYWORDS = [
  "import",
  "from",
  "const",
  "let",
  "var",
  "function",
  "return",
  "if",
  "else",
  "for",
  "while",
  "async",
  "await",
  "export",
  "default",
  "computed",
  "ref",
  "reactive",
  "new",
  "class",
  "interface",
  "type",
  "extends",
  "implements",
  "public",
  "private",
  "protected",
  "static",
  "readonly",
  "enum",
  "namespace",
  "true",
  "false",
  "null",
  "undefined",
  "this",
  "void",
  "as",
  "in",
  "of",
  "typeof",
  "instanceof"
];

function highlight(code: string): string {
  let s = escape(code);
  const placeholders: string[] = [];

  // 1. Extract line comments and block comments first
  s = s.replace(/(\/\/[^\n]*)/g, m => {
    placeholders.push(`<span class="tok-cm">${m}</span>`);
    return `\x00${placeholders.length - 1}\x00`;
  });
  s = s.replace(/(\/\*[\s\S]*?\*\/)/g, m => {
    placeholders.push(`<span class="tok-cm">${m}</span>`);
    return `\x00${placeholders.length - 1}\x00`;
  });

  // 2. Extract strings (double, single, backtick) - note &quot; is escaped "
  s = s.replace(/(&quot;[^&]*?&quot;)/g, m => {
    placeholders.push(`<span class="tok-st">${m}</span>`);
    return `\x00${placeholders.length - 1}\x00`;
  });
  s = s.replace(/('[^']*?')/g, m => {
    placeholders.push(`<span class="tok-st">${m}</span>`);
    return `\x00${placeholders.length - 1}\x00`;
  });

  // 3. Numbers
  s = s.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="tok-nm">$1</span>');

  // 4. Keywords
  const kwRe = new RegExp(`\\b(${KEYWORDS.join("|")})\\b`, "g");
  s = s.replace(kwRe, '<span class="tok-kw">$1</span>');

  // 5. Function call names (identifier followed by `(`)
  s = s.replace(/\b([a-zA-Z_][\w]*)(?=\s*\()/g, (match, p1) => {
    if (KEYWORDS.includes(p1)) return match;
    return `<span class="tok-fn">${p1}</span>`;
  });

  // 6. Vue/HTML tags — opening and closing
  s = s.replace(/(&lt;\/?[\w-]+)/g, '<span class="tok-tg">$1</span>');
  s = s.replace(/([\w-]+)(=)/g, '<span class="tok-at">$1</span>$2');

  // 7. Decorators @Something
  s = s.replace(/(@[\w]+)/g, '<span class="tok-de">$1</span>');

  // Restore placeholders (comments + strings)
  s = s.replace(/\0(\d+)\0/g, (_, i) => placeholders[+i] || "");

  return s;
}

const highlighted = computed(() => highlight(props.code));
</script>

<style scoped lang="scss">
.code-block-pro {
  overflow: hidden;
  font-family: ui-monospace, SFMono-Regular, "JetBrains Mono", Menlo, monospace;
  background: #1e1e2e;
  border: 1px solid #313244;
  border-radius: 10px;
}
.code-toolbar {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px;
  background: #181825;
  border-bottom: 1px solid #313244;
  .toolbar-left {
    display: flex;
    gap: 10px;
    align-items: center;
    min-width: 0;
  }
  .code-lang-badge {
    padding: 2px 8px;
    font-size: 10px;
    font-weight: 600;
    color: #cdd6f4;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    background: #313244;
    border-radius: 4px;
    &[data-lang="vue"] {
      color: #cba6f7;
      background: #4a3a6e;
    }
    &[data-lang="ts"],
    &[data-lang="js"] {
      color: #f9e2af;
      background: #314e52;
    }
    &[data-lang="scss"] {
      color: #f5c2e7;
      background: #4a3a52;
    }
    &[data-lang="bash"] {
      color: #a6e3a1;
      background: #4a4e3a;
    }
    &[data-lang="json"] {
      color: #89dceb;
      background: #3a4e4a;
    }
  }
  .code-title {
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 11px;
    color: #a6adc8;
    white-space: nowrap;
  }
  .copy-btn {
    color: #a6adc8 !important;
    &:hover {
      color: #cdd6f4 !important;
    }
    .copy-label {
      margin-left: 4px;
      font-size: 11px;
    }
  }
}
.code-body {
  display: flex;
  max-height: 480px;
  overflow: auto;
}
.code-gutter {
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  padding: 14px 8px 14px 14px;
  text-align: right;
  user-select: none;
  background: #181825;
  border-right: 1px solid #313244;
  .line-num {
    display: block;
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    line-height: 1.7;
    color: #585b70;
  }
}
.code-content {
  flex: 1;
  padding: 14px 16px;
  margin: 0;
  overflow-x: auto;
  code {
    padding: 0;
    font-family: inherit;
    font-size: 12px;
    line-height: 1.7;
    color: #cdd6f4;
    word-break: normal;
    white-space: pre;
    background: none;
  }
  :deep(.tok-kw) {
    font-weight: 500;
    color: #cba6f7;
  }
  :deep(.tok-st) {
    color: #a6e3a1;
  }
  :deep(.tok-cm) {
    font-style: italic;
    color: #585b70;
  }
  :deep(.tok-nm) {
    color: #fab387;
  }
  :deep(.tok-fn) {
    color: #89b4fa;
  }
  :deep(.tok-tg) {
    color: #f38ba8;
  }
  :deep(.tok-at) {
    color: #f9e2af;
  }
  :deep(.tok-de) {
    color: #f5c2e7;
  }
}
</style>

# YrY CDN · Vue 3 最佳实践

> 13 轮 /loop 重构成果总结 · 55 个 Vue3 组件统一范式 · 408 测试全通过

## 总览

| 维度         | 成果                                                                        |
| ------------ | --------------------------------------------------------------------------- |
| 组件迁移     | 55/56 Vue3 组件统一到 `YrYVueCE.define` loader（yry-docs-binding 保留原样） |
| 安全工具     | `shared/html-sanitize.js` 白名单过滤（v-html 前 opt-in）                    |
| 测试基础设施 | Vitest + happy-dom + @vue/test-utils，408 测试通过                          |
| 组件测试覆盖 | 55/55 Vue3 组件全覆盖（100%）                                               |
| CI 集成      | `npm run ci` 含 lint → validate → manifest → test                           |
| 覆盖率统计   | `npm run test:stats` 生成 Vue3 组件覆盖报告                                 |

## 核心范式

### 1. 组件统一注册（shared/vue-ce-loader.js）

**问题**：55 个 Vue3 组件 index.js 中 ~95% loader 样板重复（Vue3 检测 · currentScript URL 解析 · fetch 模板 · DOMParser 提取 · defineCustomElement 注册 · ready 事件 · 超时处理）。

**解决**：抽取公共逻辑到 `shared/vue-ce-loader.js`，组件 index.js 改为薄 wrapper。

```javascript
// 组件 index.js 范式（55 个组件统一）
(function () {
  'use strict';

  if (!window.YrYVueCE || typeof window.YrYVueCE.define !== 'function') {
    console.warn('[YryXxx] shared/vue-ce-loader.js 未加载,组件已跳过注册');
    return;
  }

  // 模块级 helper(如有)
  function helperFn() {
    /* ... */
  }
  var MODULE_CONST = '...';

  window.YrYVueCE.define({
    componentName: 'YryXxx',
    templateId: 'yry-xxx-tpl',
    buildComponent: function (templateHTML) {
      return {
        name: 'YryXxx',
        props: {
          /* ... */
        },
        computed: {
          /* ... */
        },
        methods: {
          /* ... */
        },
        template: templateHTML
      };
    }
  });
})();
```

**收益**：代码体积平均减半（如 yry-sub-title 96 → 34 行，-65%）。

### 2. HTML 安全（shared/html-sanitize.js）

**问题**：29 处 `v-html` 绑定，props 由项目控制父级传入（信任边界内），但缺少 opt-in sanitize 工具。

**解决**：白名单过滤工具，需要接入不可信内容时主动调用。

```javascript
// 组件 computed 中
computed: {
  sanitizedDesc: function () {
    return YrYHtml.sanitize(this.desc);
  }
}
// 模板
<div v-html="sanitizedDesc"></div>
```

**白名单策略**（非黑名单）：

- **标签**：38 个安全标签（a/b/strong/em/code/pre/ul/ol/li/span/div/h1-h6 等）
- **属性**：9 个安全属性（href/title/class/style 等）
- **URL 协议**：仅允许 http/https/mailto/tel:#/相对路径
- **事件属性**：`on*` 前缀一律移除

**已修复的真实 bug**：2 处 `<template v-html>` 无效模式（template 不渲染真实元素），改为 `<span>`。

### 3. 测试基础设施

**配置**（`vitest.config.mjs`）：

```javascript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    include: ['tests/**/*.test.mjs'],
    setupFiles: ['tests/setup.mjs'],
    coverage: {
      provider: 'v8',
      include: ['shared/**/*.js', 'yry-*/index.js']
    }
  }
});
```

**setup.mjs**（mock 浏览器全局）：

```javascript
globalThis.alert = () => {};
globalThis.confirm = () => true;
globalThis.prompt = () => null;
```

**为什么 happy-dom 而非 jsdom**：性能更好，与 Vue3 Test Utils 兼容性足够。

### 4. 组件测试模式

**辅助函数**（`tests/helpers.mjs`）：

```javascript
export function extractTemplate(componentName, templateId) {
  const html = fs.readFileSync(`${CDN_DIR}/${componentName}/index.html`, 'utf8');
  // 剥离 HTML 注释,避免注释中的 <script type="text/x-template"> 文本被误匹配
  const stripped = html.replace(/<!--[\s\S]*?-->/g, '');
  // 属性需在同一行(用 [^>\n] 避免跨行匹配)
  const re = new RegExp(
    `<script[^>\\n]*type="text/x-template"[^>\\n]*id="${templateId}"[^>\\n]*>([\\s\\S]*?)</script>`
  );
  const m = stripped.match(re);
  if (!m) throw new Error(`template ${templateId} not found`);
  return m[1].trim();
}
```

**测试范式**（从 index.html 提取模板 + 复制 props/computed/methods 构造 component）：

```javascript
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { extractTemplate } from './helpers.mjs';

const TEMPLATE = extractTemplate('yry-story-card', 'yry-story-card-tpl');

const YryStoryCard = defineComponent({
  name: 'YryStoryCard',
  props: {
    /* 复制 index.js 的 props 定义 */
  },
  template: TEMPLATE
});

describe('YryStoryCard — 渲染', () => {
  it('render 必填 name', () => {
    const w = mount(YryStoryCard, { props: { name: '测试故事' } });
    expect(w.html()).toContain('测试故事');
  });
});
```

### 5. 复杂组件分层测试

对于 notify-panel / selfimprove-panel / cron-panel 等复杂组件，采用分层测试：

| 层                 | 测试内容                                             | 价值         |
| ------------------ | ---------------------------------------------------- | ------------ |
| **data 层**        | 初始状态（allItems=[] · loading=false · error=null） | 容易且高价值 |
| **computed 层**    | 纯函数逻辑（如 filteredItems 过滤）                  | 验证业务逻辑 |
| **跳过 render 层** | 模板依赖太多 computed/method                         | 成本远超收益 |

```javascript
// 复杂组件:用 render() 返回 null,只测 data + computed
const YryNotifyPanel = defineComponent({
  data() {
    return { allItems: [], activeFilter: 'all' };
  },
  computed: {
    filteredItems() {
      return this.activeFilter === 'all'
        ? this.allItems
        : this.allItems.filter((it) => it.type === this.activeFilter);
    }
  },
  render() {
    return h('div');
  } // 跳过真实模板
});
```

## 关键经验

### 「研究优先开发」铁律

**不读模板就写测试会出错**。前 13 轮遇到的典型问题：

1. **属性名假设错误**：yry-cross-nav 的 `page.label` 实际是 `page.id`/`page.icon`
2. **渲染方式假设错误**：yry-scene-header 的 meta/desc 是文本插值（`{{ }}`）不是 v-html
3. **methods 遗漏**：yry-trend-card 模板调用 `barHeight(b.value)`，测试需补上
4. **v-if 链依赖**：yry-layer 的 `panelsTitle` 只在 `panels.length > 0` 时才渲染
5. **共享状态污染**：yry-faq-panel 的 faqs 原本是模块级 const，多测试共享状态导致失败 — 改为 factory 函数

### 自动迁移脚本演进

13 轮中脚本经历 6 次升级：

1. 支持 `const`（不只 `var`）声明模块级常量
2. 限制 2-空格缩进，避免误捕嵌套作用域的 const
3. `extractVarDecl` 支持多行声明（`const X =\n   ...`）
4. 扫描范围扩展到 `function fireReady` 之前（覆盖 buildComponent 之后的 helper）
5. `findMatching` 识别 regex literal（`/[&<>"']/g`）
6. name 字段在 buildComponent 内部查找（支持 `name: COMPONENT_NAME` 常量引用）

### 覆盖率工具限制

v8 coverage 无法追踪 `vm.runInContext` 执行的代码。`shared/html-sanitize.js` 和 `shared/vue-ce-loader.js` 的测试通过 vm sandbox 加载，因此 v8 报告显示 0%。实际测试覆盖了所有关键路径。要获得准确覆盖率需将源文件改造为 ESM — 但会破坏 CDN 分发架构，收益不足。

## 文件清单

### 新增文件

| 文件                      | 用途                                 |
| ------------------------- | ------------------------------------ |
| `shared/vue-ce-loader.js` | Vue3 custom-element 统一注册 loader  |
| `shared/html-sanitize.js` | v-html 前白名单过滤                  |
| `vitest.config.mjs`       | Vitest 配置（happy-dom + coverage）  |
| `tests/setup.mjs`         | 全局 mock（alert/confirm/prompt）    |
| `tests/helpers.mjs`       | extractTemplate 辅助                 |
| `tests/*.test.mjs`        | 56 个组件测试文件 + 2 个 shared 测试 |
| `scripts/test-stats.mjs`  | Vue3 组件测试覆盖统计                |

### 新增 npm scripts

```json
{
  "test": "vitest run",
  "test:watch": "vitest",
  "test:ui": "vitest --ui",
  "test:coverage": "vitest run --coverage",
  "test:stats": "node scripts/test-stats.mjs",
  "ci": "npm run lint && npm run validate && npm run build:manifest && npm run validate:manifest && npm run test"
}
```

### 新增 devDependencies

```json
{
  "@vitest/coverage-v8": "^3.2.6",
  "@vue/test-utils": "^2.4.6",
  "happy-dom": "^15.11.7",
  "vitest": "^3.2.4",
  "vue": "^3.5.13"
}
```

## 未完成项

| 项                               | 原因                                                                   | 建议                     |
| -------------------------------- | ---------------------------------------------------------------------- | ------------------------ |
| yry-docs-binding 迁移            | 复杂架构（三元运算符 + 跨多行 const + 模块级控制流），自动脚本处理不当 | 保留原样，特殊架构可接受 |
| 启用 ecc 插件 vue-reviewer agent | 需修改用户级 `~/.claude/settings.json`（影响所有项目）                 | 需用户确认后操作         |
| ESM 改造获得准确覆盖率           | 会破坏 CDN 分发架构（IIFE + window 全局）                              | 收益不足，维持现状       |

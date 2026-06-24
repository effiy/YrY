# YrY CDN · Components Manifest 组件清单

> 125 个 `yry-*` 目录的结构化元数据（111 完整组件 + 14 辅助/不完整目录），由 `scripts/build-manifest.mjs` 自动扫描生成。
> 对应 CLAUDE.md [自托管一致性](../../CLAUDE.md#项目不可妥协底线) 底线：`plugin.json` 版本号必须与实际 skills 内容一致。

## 文件

```
components-manifest/
├── index.html    # 组件清单可视化页面（人类可读）
└── index.json    # 组件元数据（机器可读，单一真相源）
```

## 数据格式

```json
{
  "_meta": {
    "generatedAt": "2026-06-22T06:44:57.978Z",
    "cdnVersion": "1.2.0",
    "generator": "scripts/build-manifest.mjs"
  },
  "stats": {
    "total": 125,
    "vue": 26,
    "vanilla": 83,
    "unknown": 12,
    "complete": 111,
    "incomplete": 14
  },
  "components": [
    {
      "name": "yry-breadcrumb",
      "kind": "vue",
      "status": "complete",
      "tagName": "yry-breadcrumb",
      "readyEvent": "v:ready",
      "templateId": "#yry-breadcrumb-tpl",
      "isCustomElement": true,
      "props": ["items", "ariaLabel"],
      "runtimeDeps": ["vue"],
      "declaredDeps": [],
      "exports": ["YrYBreadcrumb"],
      "cssTokens": ["--yry-accent", "--yry-cyan", "--yry-text"],
      "files": {
        "html": { "exists": true, "size": 2048 },
        "css":  { "exists": true, "size": 1536 },
        "js":   { "exists": true, "size": 4096 }
      }
    }
  ]
}
```

## 分类维度

| 维度 | 取值 | 判定逻辑 |
|------|------|---------|
| `kind` | `vue` · `vanilla` · `unknown` | 扫描 `index.js`：含 `customElements.define` 或 `defineCustomElement` → `vue`；纯 JS → `vanilla`；无 `index.js` → `unknown` |
| `status` | `complete` · `incomplete` | `index.html` + `index.css` + `index.js` 三件齐全 → `complete`；缺一 → `incomplete` |
| `isCustomElement` | `true` · `false` | 是否注册为 Web Component |

## 每个组件的元数据

| 字段 | 类型 | 说明 |
|------|------|------|
| `name` | string | 组件目录名（如 `yry-breadcrumb`） |
| `kind` | enum | `vue` / `vanilla` / `unknown` |
| `status` | enum | `complete` / `incomplete` |
| `tagName` | string | 自定义元素标签名（如 `<yry-breadcrumb>`） |
| `readyEvent` | string\|null | 组件就绪事件（如 `v:ready`） |
| `templateId` | string\|null | 模板元素 ID（如 `#yry-breadcrumb-tpl`） |
| `isCustomElement` | boolean | 是否为 Web Component |
| `props` | string[] | Props 列表 |
| `runtimeDeps` | string[] | 运行时依赖（如 `vue`） |
| `declaredDeps` | string[] | 显式声明的组件间依赖 |
| `exports` | string[] | 全局导出变量（如 `YrYBreadcrumb`） |
| `cssTokens` | string[] | 使用的 CSS 设计令牌 |
| `files` | object | `html`/`css`/`js` 各自的 `exists` 与 `size`（bytes） |

## 生成

```bash
# 通过 npm 脚本
npm run build:manifest

# 或直接执行
node scripts/build-manifest.mjs
```

自动扫描所有 `cdn/yry-*/` 目录，提取元数据并写入 `index.json`。`index.html` 为可视化消费页面。

## 消费方

| 消费方 | 用途 |
|--------|------|
| CDN 首页统计面板 | 显示组件总数 · Vue/Vanilla 分布 · 完成率 |
| 健康检查 `lib/arch-check.mjs` | 组件覆盖率 · D0 完整性诊断 |
| CI/CD 管线 | 组件完整性门禁（`npm run validate:manifest`） |
| `cdn-summary/index.html` | 四维质量评估的数据源 |
| 文档生成 `rui-html` | 组件依赖图渲染 |

## 单一真相源原则

- **manifest 是组件结构的唯一真相源** — 其他文档/页面引用本数据，禁止重复维护
- **禁止手编 `index.json`** — 仅由 `build-manifest.mjs` 生成
- **提交前必跑** — 新增/修改组件后必须 `npm run build:manifest` 再提交

## 组件分类统计

基于 `kind` 字段（依据 `index.js` 是否含 `customElements.define` 判定）：

| 分类 | 数量 | 占比 | 说明 |
|------|:---:|:---:|------|
| Vue 3 CE | 26 | 21.5% | `index.js` 含 `customElements.define` 或 `defineCustomElement` |
| Vanilla JS | 83 | 68.6% | `index.js` 存在但无 CE 注册代码 |
| Unknown | 12 | 9.9% | 无 `index.js`（纯 CSS / 辅助目录） |
| **合计** | **125** | **100%** | 全部 `yry-*` 目录 |

按完成状态：

| 状态 | 数量 | 占比 | 说明 |
|------|:---:|:---:|------|
| Complete | 111 | 88.8% | `index.{html,css,js}` 三件齐全 |
| Incomplete | 14 | 11.6% | 缺失至少一件 |
| **合计** | **125** | **100%** | — |

> 注：manifest 的 `kind` 分类（30 Vue CE）与 [COMPONENTS.md](../COMPONENTS.md) 的功能分类（54 Vue + 39 Vanilla + 15 页面基类 = 108）采用不同标准。COMPONENTS.md 按"组件用途是否依赖 Vue 运行时"分类，manifest 按"`index.js` 是否含 CE 注册代码"分类。manifest 实际扫描 125 个 `yry-*` 目录（111 完整 + 14 辅助/不完整），COMPONENTS.md 当前索引 108 条（部分新增组件待补录），视角不同。

## 组件依赖深度

基于 `declaredDeps` 字段（组件 `index.js` 中显式声明的依赖）：

| 深度 | 组件数 | 说明 |
|:---:|:---:|------|
| L0 无显式声明 | 111 | `declaredDeps` 为空数组（绝大多数组件） |
| L1+ 有显式声明 | 0 | 当前无组件在 manifest 中声明依赖 |

> **注**：manifest 的 `declaredDeps` 仅捕获组件 `index.js` 中通过特定格式（如 `// @deps yry-xxx`）显式声明的依赖。大多数组件的运行时依赖通过 `runtimeDeps` 字段记录（如 `["vue"]`），组件间依赖关系见 [COMPONENTS.md](../COMPONENTS.md) 的"关键 Props · 依赖"列与"组件依赖图深度"段。

## manifest 生成性能

| 规模 | 耗时 | 内存 | 输出 |
|------|:---:|:---:|:---:|
| 50 组件 | ≤ 200ms | ≤ 10MB | ≤ 20KB |
| 125 组件 (当前) | ≤ 500ms | ≤ 20MB | ≤ 50KB |
| 200 组件 (预期) | ≤ 1s | ≤ 40MB | ≤ 100KB |

## manifest 校验规则

| 规则 | 校验方法 | 阻断级别 | 修复 |
|------|------|:---:|------|
| 三件套完整 | `files.{html,css,js}.exists` | P0 | 补齐文件 |
| 标签名唯一 | `tagName` 无重复 | P0 | 重命名 |
| Props 非空 | `props.length > 0` | P1 | 补充 Props |
| 依赖有效 | `declaredDeps` 文件存在 | P1 | 修正依赖 |
| 大小合理 | `files.*.size < 100KB` | P2 | 优化体积 |

## manifest 消费示例

```javascript
// 1. 组件总数
const total = manifest.components.length;

// 2. Vue 组件数
const vueCount = manifest.components.filter(c => c.isCustomElement).length;

// 3. 完整组件数
const complete = manifest.components.filter(c =>
  c.files.html.exists && c.files.css.exists && c.files.js.exists
).length;

// 4. 依赖图构建
const graph = manifest.components.map(c => ({
  node: c.tagName,
  edges: c.declaredDeps
}));

// 5. 待完善清单
const incomplete = manifest.components.filter(c =>
  !c.files.js.exists || !c.files.css.exists
);
```

## manifest 演进历史

| 版本 | 字段变化 | 新增字段 | 兼容性 |
|------|------|------|:---:|
| v1.0 | 初始 schema | name · type · path | — |
| v1.1 | 扩展依赖 | declaredDeps · runtimeDeps | ✅ |
| v1.2 | 增加 Props | props · exports · cssTokens | ✅ |
| v1.3 | 规划中 | health · coverage | 📋 |

## 相关文档

- [scripts/README.md](../scripts/README.md) — `build-manifest.mjs` 工具链说明
- [COMPONENTS.md](../COMPONENTS.md) — 人类可读组件速查索引
- [CONTRIBUTING.md](../CONTRIBUTING.md) — 新增组件规范与校验门禁
- [架构宪法](../../skills/rui/rules/architecture-principles.md) — 内核体积约束与扩展隔离

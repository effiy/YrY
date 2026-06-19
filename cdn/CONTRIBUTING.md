# Contributing to YrY CDN

> 感谢你考虑为 YrY CDN 贡献代码!以下是参与流程与规范。

## 🎯 项目定位

YrY CDN 是一个**零打包**、**纯静态**的前端资源库:

- 所有组件都是**独立目录** `yry-<name>/{index.html, index.js, index.css}`,可单独引用。
- Vue 3 组件通过 `defineCustomElement` 注册为自定义元素,模板运行时 `fetch` 加载。
- CSS 类名严格使用 `.yry-*` / `.yry-mono-*` 命名空间。
- 设计令牌通过 `:root` 上的 CSS 变量传递,所有颜色都带 fallback。

## 🛠 开发环境

```bash
# 推荐 Node ≥ 18 (package.json engines 字段)
node --version  # >= 18

# 首次安装 lint/format/校验工具
npm install

# 整体自检(与 CI 一致)
npm run ci

# 子任务
npm run lint              # ESLint + Stylelint
npm run format            # Prettier --write
npm run format:check      # CI 友好,只检查不写
npm run build:manifest    # 重新生成 components.manifest.json
npm run validate          # 三件校验: manifest / version / components
```

> **不需要 `npm install` 即可消费本包**——所有运行时依赖(`vue`、`html2canvas` 等)由消费页面通过 `<script>` 标签引入。`devDependencies` 仅用于工程化。

## 📦 新增组件

### 目录约定

每个组件**必须**遵循 3 文件拆分:

```
yry-<name>/
├── index.html      # <script type="text/x-template" id="yry-<name>-tpl"> + Demo 预览
├── index.js        # Loader (Vue 3: defineCustomElement + fetch 模板)
└── index.css       # 组件样式 (使用 --yry-color-* 设计令牌,带 fallback)
```

### 命名规范

| 类型 | 命名 | 示例 |
|------|------|------|
| Vue 3 自定义元素组件 | `yry-<kebab-case>` | `yry-breadcrumb` |
| Vanilla JS 工具组件 | `yry-<kebab-case>` | `yry-export-toolbar` |
| CSS 类名前缀 | `.yry-*` (Cat B) / `.yry-mono-*` (Cat A) | `.yry-card` |
| CSS 设计令牌 | `--yry-color-*` / `--yry-elevation-*` | `--yry-color-accent` |

### 加载链 (Vue 组件)

```html
<!-- 1. 共享样式 (基线 + 主题) -->
<link rel="stylesheet" href="../../../../cdn/shared/index.css">
<link rel="stylesheet" href="../../../../cdn/theme/index.css">

<!-- 2. 组件样式 (在主题之后) -->
<link rel="stylesheet" href="../../../../cdn/yry-<name>/index.css">

<!-- 3. Vue 3 -->
<script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>

<!-- 4. 共享 JS -->
<script src="../../../../cdn/shared/index.js"></script>

<!-- 5. 组件 loader (按依赖顺序) -->
<script src="../../../../cdn/yry-<name>/index.js"></script>
```

### loader 模板 (Vue 3)

参考 [yry-breadcrumb/index.js](./yry-breadcrumb/index.js) — 关键点:

- ✅ `if (!window.Vue) { console.warn(...); return; }`
- ✅ 模板 ID 常量 `yry-<name>-tpl`
- ✅ 派发 `yry-<name>-ready` 事件
- ✅ 5 秒超时保护
- ❌ 禁止使用 class/extends(项目铁律)

## 🔧 提交流程

1. **Fork** → 新建分支 `feat/<component-name>`
2. **本地自检**:`npm run ci`(必须全绿)
3. **新增组件后**:运行 `npm run build:manifest` 重新生成 `components.manifest.json`
4. **Commit 规范**(Conventional Commits):

   ```
   feat(yry-card): 新增 card-grid 容器组件
   fix(yry-breadcrumb): 修复 aria-current 缺失
   docs: 补全 README 加载顺序示例
   chore(deps): bump stylelint 16.10
   refactor(shared): 提取 fmtDur 常量到 lib/
   ```

5. **PR 描述**需含:
   - 变更类型 (新增组件 / 修复 / 重构 / 文档)
   - 涉及的场景文档(如「场景-3-组件库与JS工具API」)
   - 加载链是否变化
   - 是否影响 6 个健康维度 (D0-D5)

## 🧪 校验维度

PR 必须通过以下检查:

| 维度 | 含义 | 工具 |
|------|------|------|
| **D0 组件完整性** | `yry-*/` 同时具备 index.{html,css,js} | `npm run validate:components` |
| **D1 核心文件** | shared/index.css/theme.css/fonts.css/shared.js | `npm run validate` |
| **D2 字体资源** | fonts/ 4 个字重 woff2 | `npm run validate` |
| **D3 发布元数据** | package.json + README + .npmignore + releases.json | `npm run validate` |
| **D4 主题覆盖** | theme/index.css + theme-mono/index.css | `npm run validate` |
| **D5 演示覆盖** | 组件含 index.html 演示 | `npm run validate:components` |
| **D6 加载链** | 5 步加载顺序规范 | 文档 + CI review |
| **D7 版本同步** | package.json / index.html / README 一致 | `npm run validate:version` |

## 📚 相关文档

- 场景: [故事任务面板/yry-breadcrumb/](./故事任务面板/yry-breadcrumb/) (5 场景)
- 健康报告: [健康报告/index.html](./健康报告/index.html)
- 组件清单: [components.manifest.json](components\-manifest\/index\.json)(自动生成)
- 架构决策: 见 `docs/`(根目录 CLAUDE.md)

## 📄 许可证

贡献的代码采用 [MIT](./README.md#许可证) 许可证。
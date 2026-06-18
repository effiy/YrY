## 📦 变更类型

请勾选一项:

- [ ] 🆕 新增组件 (`feat(yry-<name>): ...`)
- [ ] 🐛 修复 (`fix: ...`)
- [ ] 📚 文档 (`docs: ...`)
- [ ] ♻️ 重构 (`refactor: ...`)
- [ ] 🔧 工程化 (`chore: ...` · `ci: ...` · `build: ...`)

## 📋 变更摘要

<!-- 简述改了什么、为什么改、解决了什么问题 -->

## 🔗 关联场景文档

<!-- 涉及 故事任务面板/yry-breadcrumb/ 哪个场景? 或 故事任务面板/cdn/ 哪个场景? -->

- [ ] 场景-1 需求与设计
- [ ] 场景-2 模板与样式
- [ ] 场景-3 Loader 实现
- [ ] 场景-4 页面集成
- [ ] 场景-5 测试与发布

## ✅ 健康维度自检

请确认影响范围 (勾选所有适用项):

- [ ] D0 组件完整性 — 新增/删除/重命名 `yry-*/` 目录
- [ ] D1 核心文件 — 修改 `shared.css` / `theme.css` / `fonts.css` / `shared.js`
- [ ] D2 字体资源 — 改动 `fonts/`
- [ ] D3 发布元数据 — 修改 `package.json` / `README.md` / `.npmignore`
- [ ] D4 主题覆盖 — 修改 `theme.css` 或 `theme-mono.css`
- [ ] D5 演示覆盖 — 修改组件的 `index.html`
- [ ] D6 加载链 — 引入新依赖、改变 `<script>` 顺序
- [ ] D7 版本同步 — 修改 `package.json` version

## 🧪 验证清单

- [ ] `npm run lint` 通过(或已知警告)
- [ ] `npm run validate` 通过
- [ ] `npm run build:manifest` 已运行并提交 `components.manifest.json`
- [ ] `npm run sync:version --check` 一致(若修改了 version)
- [ ] 在浏览器打开 `cdn/index.html` 验证首页正常渲染
- [ ] 在浏览器打开相关 `yry-<name>/index.html` 验证演示页

## 📸 截图 (可选)

<!-- 如果是 UI 变更,请附截图 -->

---

> 📖 详见 [CONTRIBUTING.md](./cdn/CONTRIBUTING.md)
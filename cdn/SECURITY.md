# Security Policy

## Supported Versions

YrY CDN 遵循与 npm 发布版本一致的安全更新策略:

| 版本范围 | 支持状态 |
|---------|---------|
| `1.2.x` (最新) | ✅ 积极维护 — 接收安全更新 |
| `1.1.x`        | ⚠️ 仅严重漏洞 — 建议升级 |
| `1.0.x`        | ❌ 已停止维护 — 必须升级 |
| `< 1.0.0`      | ❌ 不支持 |

> **CDN 资源包**:由于本质是静态文件(无服务端),安全风险面较小,主要是 XSS 注入面(CSS 与 HTML 模板)。建议始终使用最新版本。

## 报告漏洞

**请勿在 GitHub Issues 公开报告安全问题。**

通过以下私密渠道之一上报:

1. **GitHub Security Advisories**(推荐):
   https://github.com/effiyichengliang/YrY/security/advisories/new

2. **邮件**:在 GitHub 个人资料(`@effiyichengliang`)查找联系方式

### 上报需包含

- 漏洞描述与影响范围(哪些组件 / 哪些版本受影响)
- 复现步骤(最小化 PoC)
- 潜在影响评估(XSS? CSS 注入? 资源加载劫持?)
- 是否已公开 / 是否被利用

我们承诺:

- **48 小时内**确认收到
- **7 天内**给出初步评估与修复计划
- 修复发布后在 [CHANGELOG.md](./CHANGELOG.md) 与安全公告中致谢(除非你希望匿名)

## 安全最佳实践(消费方)

引用 CDN 时:

```html
<!-- ✅ 推荐: jsDelivr 自动 SRI -->
<script src="https://cdn.jsdelivr.net/npm/yry-cdn@1.2.0/shared\/index\.js"
        integrity="sha384-..."
        crossorigin="anonymous"></script>

<!-- ⚠️ 自托管时: 锁定版本号,禁止 @latest -->
<link rel="stylesheet" href="/cdn/shared/index.css?v=1.2.0">
<script src="/cdn/shared/index.js?v=1.2.0"></script>

<!-- ❌ 避免: 永远不要引用 latest 或未锁版本 -->
<script src="https://cdn.jsdelivr.net/npm/yry-cdn@latest/shared\/index\.js"></script>
```

## 已知风险面

| 类型 | 描述 | 缓解措施 |
|------|------|---------|
| **XSS via `YrY.toast` / `YrY.esc`** | `esc()` 转义不全,无 `<script>` 过滤 | 自行在调用前 escape |
| **HTML 模板 XSS** | Vue `v-html` 可绕过转义 | 组件内禁止使用 `v-html` 渲染外部数据 |
| **CSS 注入** | 通过 `data-*` 属性覆盖设计令牌 | 文档声明只读 `:root` |
| **外部字体劫持** | fonts/index.css 通过 jsDelivr 加载 | 启用 SRI / 自托管 |

详见各组件 README 中的安全章节。
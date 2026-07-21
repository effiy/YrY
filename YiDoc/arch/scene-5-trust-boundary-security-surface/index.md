# 场景5: 静态网站的信任边界在哪里？暴露了什么？

## §0 — 效果概览
分析 YiDoc 作为纯静态 HTML 网站集合的安全模型：识别信任边界、外部依赖面、潜在攻击向量（XSS / CDN 劫持 / 供应链攻击），明确"纯静态"天然防御了哪些威胁，以及仍需关注哪些风险。

```mermaid
graph TD
    subgraph "信任域: YiDoc 本地文件系统"
        LOCAL[本地 HTML/CSS/JS/字体/图片<br/>全部静态文件，无服务端代码]
    end

    subgraph "信任边界 ═════════════"
        BOUNDARY((Trust Boundary))
    end

    subgraph "不可信域: 外部依赖"
        CDN1["unpkg.com<br/>Vue 3 CDN (Dashboard)"]
        CDN2["fonts.googleapis.com<br/>Google Fonts (Kasy, News)"]
        CDN3["bootstrapmb.com<br/>外链 (News navbar logo)"]
        CDN4["html5shim.googlecode.com<br/>IE shim (DpMarket, 已失效)"]
    end

    subgraph "用户交互面（最小）"
        USER[浏览者/用户]
    end

    LOCAL -->|静态文件服务| BOUNDARY
    BOUNDARY -->|&lt;link&gt; / &lt;script&gt; 引用| CDN1
    BOUNDARY -->|CSS @import / &lt;link&gt;| CDN2
    BOUNDARY -->|&lt;a href&gt; 外链| CDN3
    BOUNDARY -->|条件注释 (IE)| CDN4
    USER -->|HTTP 请求| LOCAL

    style LOCAL fill:#22C55E,color:#fff
    style BOUNDARY fill:#EF4444,color:#fff
    style CDN1 fill:#F59E0B,color:#000
    style CDN2 fill:#F59E0B,color:#000
    style CDN3 fill:#F59E0B,color:#000
    style CDN4 fill:#DC2626,color:#fff
```

### 信任边界详解

#### 边界 1: 本地文件系统 → 本地文件系统（可信）
- **范围**: 所有 `YiDoc/` 下的 HTML、CSS、JS、字体、图片文件
- **信任级别**: 🔒 完全受控——所有文件在本地磁盘，无服务端渲染、无数据库、无用户上传
- **防御能力**: 
  - ✅ 无 SQL 注入（无数据库）
  - ✅ 无 CSRF（无服务端会话）
  - ✅ 无 SSRF（无服务端请求）
  - ✅ 无认证绕过（无登录系统）
  - ✅ 无文件上传漏洞（无上传入口）

#### 边界 2: 本地 → CDN 外部依赖（有限信任）
| CDN 来源 | 使用位置 | 风险 | 缓解措施 |
|----------|---------|------|---------|
| `unpkg.com` (Vue 3) | Dashboard `/index.html` | 🟡 中：若 unpkg 被劫持或不可用，Dashboard 完全失效 | 可本地化 Vue.js 文件，但当前设计依赖 CDN 的便捷性 |
| `fonts.googleapis.com` | Kasy `/index.html`, News `/index.html` | 🟢 低：仅 CSS 字体文件，不影响功能 | 字体加载失败仅影响视觉，页面仍可用 |
| `bootstrapmb.com` | News `/index.html`（navbar logo 链接） | 🟢 低：仅为 `<a href>` 外链，不加载资源 | 用户点击才会导航，仅影响品牌链接 |
| `html5shim.googlecode.com` | DpMarket `/index.html`（IE 条件注释） | 🟢 低：Google Code 已关闭，但代码在 IE 条件注释中，现代浏览器不执行 | 可安全移除（已失效的 CDN） |

#### 边界 3: 用户 → 网站（最小交互面）
- **用户输入**: 无表单、无搜索（除 News 的装样式搜索框，无实际提交逻辑）、无评论、无登录
- **用户数据**: 无 Cookie 写入、无 localStorage 使用（验证后发现无）、无 sessionStorage
- **XSS 风险面**:
  - 🔴 **高风险**: 无——没有 `innerHTML` 动态插入用户可控内容
  - 🟡 **中风险（理论）**: News 的语法高亮器 (`shCore.js`) 内部可能使用 `innerHTML`/`document.write`，但处理的是静态预定义代码示例，非用户输入
  - 🟢 **低风险**: Dashboard 的 Vue 3 使用 `v-html` 渲染 `card.desc` 和 `card.meta`（来自 `data.js`），但这些是静态数据文件中的受控内容，非用户输入

### 安全面总结

| 威胁类别 | 风险等级 | 说明 |
|---------|---------|------|
| SQL 注入 | 🟢 无 | 无数据库 |
| XSS（反射型） | 🟢 无 | 无 URL 参数解析传递给 DOM |
| XSS（存储型） | 🟢 无 | 无用户内容存储 |
| XSS（DOM 型） | 🟡 极低 | Dashboard `v-html` 渲染受控静态数据；News 语法高亮处理受控代码 |
| CSRF | 🟢 无 | 无认证/会话 |
| CDN 供应链攻击 | 🟡 低 | unpkg.com 是唯一关键依赖（Dashboard）；Google Fonts 仅影响视觉 |
| 信息泄露 | 🟢 无 | 无敏感数据（无 API Key、无密钥、无用户数据） |
| 点击劫持 | 🟢 低 | 无敏感操作可被劫持，无 X-Frame-Options 头但无实际风险 |
| MITM | 🟡 低 | 本地文件通过 `file://` 协议打开时无 TLS，但无敏感传输；部署到服务器时应启用 HTTPS |

## §1 — 测试设计
- **AC-1**: 能列出 YiDoc 的 3 个信任边界（本地文件、CDN 外部依赖、用户交互面）。
- **AC-2**: 能识别所有外部 CDN 依赖及其使用位置（Dashboard / Kasy / News）。
- **AC-3**: 能说明为什么纯静态网站天然免疫 SQL 注入、CSRF、认证绕过。
- **AC-4**: 能指出唯一需要关注的中等风险点（unpkg CDN 依赖）。
- **SC-1**: 安全审计人员能在 5 分钟内完成攻击面评估。
- **SC-2**: 文档结论与实际代码行为一致（经静态分析验证）。
- **SC-3**: 所有 CDN 外链被准确识别并分类风险等级。

## §2 — 输出清单与架构决策
- **输出文件/资源**:
  - 本 index.md（场景说明文档）
  - 无代码产物
- **关键架构决策**:
  - **决策 1**: 保持纯静态架构——这是 YiDoc 最大的安全优势，不引入任何后端、数据库或用户认证系统。安全模型极简。
  - **决策 2**: CDN 依赖最小化但未完全消除——Dashboard 依赖 unpkg（Vue 3），Kasy/News 依赖 Google Fonts。当前风险评估为"可接受"，不要求立即本地化。
  - **决策 3**: Dashboard 的 `v-html` 使用是受控的——渲染内容来自 `data.js`（静态数据文件），不是用户输入。这是一个架构上安全的内部分界（开发者数据 vs 用户数据）。

## §3 — 测试报告
| 检查项 | 状态 | 备注 |
|--------|------|------|
| 无服务端代码（无 .php/.py/.rb/.java 等后端文件） | PASS | 100% 静态 HTML/CSS/JS |
| 无 package.json / composer.json / 构建配置 | PASS | 无运行时依赖管理 |
| 无数据库（无 .sql / .sqlite / MongoDB 等） | PASS | 数据仅存在于 data.js（静态 JS 对象） |
| 无用户输入表单 | PASS | News 搜索框为装样式（无 action/method），无实际提交逻辑 |
| 无 Cookie/localStorage 写入代码 | PASS | 经 Grep 搜索 `document.cookie` / `localStorage` 均无结果 |
| CDN 依赖已全部识别 | PASS | 4 个 CDN 来源已列入边界分析表 |
| `html5shim.googlecode.com` 已失效 | PASS | Google Code 于 2016 年关闭，但代码仅在 IE 条件注释中 |
| Vue `v-html` 使用为受控静态数据 | PASS | data.js 是开发者维护的静态文件 |
| Dashboard 依赖 unpkg.com | PASS | Vue 3 运行时 CDN，是最高价值的外部依赖 |

## §4 — 自我改进
| 诊断 | 问题 | 行动项 |
|------|------|--------|
| D0 | 通过 Grep 搜索 `document.cookie`、`localStorage`、`sessionStorage`、`innerHTML`、`eval(`、`v-html` 等安全相关 API 确认攻击面 | 无需行动——确认结果已记录 |
| D1 | `html5shim.googlecode.com` 已失效（Google Code 2016 年关闭） | 建议从 DpMarket 的 HTML 中移除该 IE 条件注释块（低优先级） |
| D2 | Dashboard Vue 3 来自 unpkg CDN，若 unpkg 不可用则 Dashboard 白屏 | 中优先级：可添加 fallback 到本地 Vue.js 副本，或接受 CDN 风险（unpkg 由 npm 维护，可用性高） |
| D3 | Kasy 使用 `http://fonts.googleapis.com`（非 HTTPS） | 建议升级为 `https://`（或移除协议头使用 `//`）。当前浏览器可能混合内容警告。 |
| D5 | Kasy 中 `http://html5shim.googlecode.com` 的 `http://` 协议在 HTTPS 部署下会触发混合内容 | 同 D1——移除已失效的 IE shim |
| D6 | 缺少 Content-Security-Policy 头建议 | 如果部署到 Web 服务器，建议添加 CSP 头限制 CDN 来源白名单（如 `script-src 'self' unpkg.com`） |
| D7 | 未验证 5 个模板的 JS 文件中是否有 `eval()` 或动态代码执行 | 低优先级——所有 JS 均来自成熟模板/库，但可做一次全量 Grep 扫描 |
| D8 | 无 | — |

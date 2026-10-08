---

doc_type: test
title: "YP-08-03: 安全合规 — CSP/MV3 合规 + Token 加密 + XSS 防护 + IPC 安全 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202608"
prd_task_id: "YP-08-03"
source_prds: ["03-合规-安全合规"]
source_modules: ["03-prd-task-安全合规"]
source_okr: [yipet-001]

type: test
---

# YP-08-03: 安全合规 — 测试规格

> 来源 PRD：[03-合规-安全合规.md](../../prds/2026-08/03-合规-安全合规.md)
> 开发方案：[03-prd-task-安全合规.md](../../devs/2026-08/03-prd-task-安全合规.md)

---

## 一、测试策略

### 1.1 安全测试四层

| 层次 | 方法 | 工具 | 频率 |
|------|------|------|------|
| 静态分析 | 代码模式扫描（grep/ast-grep） | Shell + ESLint security rules | 每次提交 |
| 单元测试 | 安全函数行为验证 | Vitest + jsdom | 每次提交 |
| 动态验证 | 浏览器加载扩展 → Chrome DevTools 审查 | Chrome + Application/Network 面板 | 每次发布 |
| 渗透测试 | 恶意输入注入、消息伪造 | 手动 + Playwright 脚本 | 每季度 |

### 1.2 安全威胁模型（MV3 扩展）

```
威胁面 1: 恶意网页 → postMessage 伪造 → Content Script 接收
威胁面 2: XSS via Markdown → innerHTML 注入 → 脚本执行
威胁面 3: Token 泄漏 → localStorage 明文 → 其他扩展读取
威胁面 4: CSP 违规 → eval()/远程脚本 → 代码注入
威胁面 5: 权限滥用 → manifest 过度声明 → 隐私暴露
```

---

## 二、单元测试

### U-01: CSP 合规 — 静态检查

```typescript
describe("CSP compliance — static", () => {
  it("U-01-S01: zero eval() calls in source", () => {
    // grep -r 'eval(' src/ --include='*.ts' --include='*.vue'
    // 预期：零匹配（含间接 eval: Function(), setTimeout(string), setInterval(string)）
  });

  it("U-01-S02: zero inline scripts in HTML templates", () => {
    // grep -r '<script>[^s]' src/ --include='*.html'
    // 预期：零匹配 — 所有 <script> 通过 src 属性引用外部文件
  });

  it("U-01-S03: zero remote script sources in manifest", () => {
    // manifest.json content_security_policy.extension_pages 不含 https?:
    const manifest = JSON.parse(readFile("dist/manifest.json"));
    const csp = manifest.content_security_policy?.extension_pages || "";
    expect(csp).not.toMatch(/https?:/);
  });

  it("U-01-S04: manifest permissions are minimal", () => {
    const manifest = JSON.parse(readFile("dist/manifest.json"));
    const permissions = manifest.permissions || [];
    // 仅允许 storage, activeTab, scripting — 无 <all_urls>, tabs, cookies
    const dangerous = ["<all_urls>", "tabs", "cookies", "webRequest", "webRequestBlocking"];
    for (const p of dangerous) {
      expect(permissions).not.toContain(p);
    }
  });

  it("U-01-S05: web_accessible_resources are explicit", () => {
    const manifest = JSON.parse(readFile("dist/manifest.json"));
    const war = manifest.web_accessible_resources || [];
    // 不应包含通配符 *，仅精确路径或受限 glob
    for (const entry of war) {
      const resources = entry.resources || [];
      for (const r of resources) {
        expect(r).not.toBe("*");
      }
    }
  });
});
```

### U-02: Token 安全

```typescript
describe("Token security", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", { _store: {}, getItem(k) { return this._store[k]; }, setItem(k,v) { this._store[k]=v; }, removeItem(k) { delete this._store[k]; }, clear() { this._store={}; } });
  });

  it("U-02-S01: token is NOT stored in localStorage", async () => {
    const apiClient = new ApiClient("http://localhost:10086");
    await apiClient.setToken("jwt_test_token_xyz");
    expect(localStorage.getItem("token")).toBeNull();
  });

  it("U-02-S02: token is stored in chrome.storage.local", async () => {
    const setSpy = vi.fn();
    vi.stubGlobal("chrome", { storage: { local: { set: setSpy, get: vi.fn(), remove: vi.fn() } } });
    const apiClient = new ApiClient("http://localhost:10086");
    await apiClient.setToken("jwt_test_token_xyz");
    expect(setSpy).toHaveBeenCalledWith({ token: "jwt_test_token_xyz" }, expect.any(Function));
  });

  it("U-02-S03: token is sent in X-Token header only", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ code: 0, data: {} }) });
    vi.stubGlobal("fetch", fetchSpy);
    const apiClient = new ApiClient("http://localhost:10086");
    await apiClient.setToken("jwt_abc");
    await apiClient.call("services.test", "ping", {});
    const [, init] = fetchSpy.mock.calls[0];
    expect(init.headers["X-Token"]).toBe("jwt_abc");
    // token 不应出现在 URL 中
    expect(init.headers["Authorization"]).toBeUndefined();
  });

  it("U-02-S04: token is cleared from storage on logout", async () => {
    const removeSpy = vi.fn();
    vi.stubGlobal("chrome", { storage: { local: { remove: removeSpy, get: vi.fn(), set: vi.fn() } } });
    const apiClient = new ApiClient("http://localhost:10086");
    await apiClient.clearToken();
    expect(removeSpy).toHaveBeenCalledWith("token", expect.any(Function));
  });

  it("U-02-S05: 401 response triggers token clear + redirect", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ code: 4001, message: "Auth failed" }) });
    vi.stubGlobal("fetch", fetchSpy);
    // 401 响应 → clearToken + 重定向到登录页
  });
});
```

### U-03: XSS 防护 — Markdown 渲染

```typescript
describe("XSS protection — Markdown rendering", () => {
  it("U-03-S01: <script> tag is stripped", () => {
    const input = '<script>alert("xss")</script>';
    const clean = DOMPurify.sanitize(marked.parse(input));
    expect(clean).not.toContain("<script>");
    expect(clean).not.toContain("alert");
  });

  it("U-03-S02: onerror handler in <img> is stripped", () => {
    const input = '<img src=x onerror="alert(1)">';
    const clean = DOMPurify.sanitize(marked.parse(input));
    expect(clean).not.toContain("onerror");
  });

  it("U-03-S03: javascript: URL in links is stripped", () => {
    const input = '[click me](javascript:alert(1))';
    const clean = DOMPurify.sanitize(marked.parse(input));
    expect(clean).not.toContain("javascript:");
  });

  it("U-03-S04: data: URL with script content is stripped", () => {
    const input = '<iframe src="data:text/html,<script>alert(1)</script>">';
    const clean = DOMPurify.sanitize(marked.parse(input));
    expect(clean).not.toContain("iframe");
    expect(clean).not.toContain("data:");
  });

  it("U-03-S05: legitimate markdown still renders", () => {
    const input = "**bold** `code` [safe link](https://example.com)";
    const clean = DOMPurify.sanitize(marked.parse(input));
    expect(clean).toContain("<strong>bold</strong>");
    expect(clean).toContain("<code>code</code>");
    expect(clean).toContain('href="https://example.com"');
  });

  it("U-03-S06: nested malicious content is stripped", () => {
    const input = '<div><p>safe</p><script>evil</script></div>';
    const clean = DOMPurify.sanitize(marked.parse(input));
    expect(clean).toContain("safe");
    expect(clean).not.toContain("<script>");
  });

  it("U-03-S07: CSS injection via style attribute is stripped", () => {
    const input = '<span style="background:url(javascript:alert(1))">text</span>';
    const clean = DOMPurify.sanitize(marked.parse(input));
    expect(clean).not.toContain("javascript:");
  });
});
```

### U-04: Content Script — innerHTML 防护

```typescript
describe("Content Script — no innerHTML", () => {
  it("U-04-S01: source code does not use innerHTML directly", () => {
    // 静态检查：grep -r '\.innerHTML\s*=' src/content/ --include='*.ts'
    // 预期：零匹配（应使用 textContent 或 Vue 模板绑定）
  });

  it("U-04-S02: Vue template bindings use {{ }} not v-html", () => {
    // grep -r 'v-html' src/content/ --include='*.vue'
    // 预期：零匹配（除非有充分的 DOMPurify 包装）
  });

  it("U-04-S03: dynamic content inserted via textContent", () => {
    const el = document.createElement("div");
    el.textContent = "<script>alert(1)</script>";
    expect(el.innerHTML).toBe("&lt;script&gt;alert(1)&lt;/script&gt;");
  });
});
```

---

## 三、组件测试

### C-01: MessageBubble — Markdown 渲染安全

```typescript
describe("MessageBubble XSS safety", () => {
  it("C-01-S01: AI message with XSS payload renders safely", async () => {
    const store = useChatStore();
    store.activeConversation = {
      messages: [{
        type: "pet",
        message: '<img src=x onerror="alert(1)">',
        timestamp: Date.now(),
      }],
    };
    const wrapper = mount(MessageBubble, {
      props: { message: store.activeConversation!.messages[0] },
    });
    const html = wrapper.html();
    expect(html).not.toContain("onerror");
    expect(html).not.toContain("alert(1)");
  });

  it("C-01-S02: code block with HTML entities renders safely", async () => {
    // ```html <script>alert(1)</script> ```
    // 应渲染为代码高亮，不执行脚本
  });
});
```

---

## 四、集成测试

```typescript
describe("Security integration", () => {
  it("I-01: full CSP compliance build", async () => {
    // npm run build → 检查 dist/ 产物
    // 1. 无 eval() 调用
    // 2. 无内联脚本
    // 3. manifest content_security_policy 不含 unsafe-eval
  });

  it("I-02: token flow — set → request → 401 → clear → redirect", async () => {
    // 1. ApiClient.setToken("valid_jwt")
    // 2. 请求带 X-Token
    // 3. 后端返回 4001
    // 4. ApiClient 清除 token → 重定向
  });

  it("I-03: IPC message with valid secret is processed", async () => {
    // 1. SW 发送 dispatchSecureEvent("test", {data: 1})
    // 2. CS 监听器收到消息并处理
    // 3. 验证 payload 完整
  });

  it("I-04: IPC message without secret is dropped silently", async () => {
    // 1. 页面 postMessage({type: "YIPET", payload: {}, meta: {}})
    // 2. CS 监听器不触发
  });

  it("I-05: IPC message with expired timestamp is dropped", async () => {
    // 1. 构造 meta.timestamp = Date.now() - 10000 (10s ago)
    // 2. 监听器不触发
  });

  it("I-06: Production build has zero console.log with sensitive data", async () => {
    // npm run build:pro → grep 产物
    // console.log 不应包含 token/secret/password
  });
});
```

---

## 五、回归测试（已知安全缺陷固化）

| 编号 | 原始缺陷 | 测试用例 | 验证方法 |
|------|----------|----------|----------|
| REG-SEC-01 | innerHTML 注入风险 (BUG-03) | U-04-S01~03 | 静态 + 运行时 |
| REG-SEC-02 | CSP connect-src 硬编码 localhost (BUG-05) | U-01-S03 | 静态检查 manifest |
| REG-SEC-03 | 跨世界 IPC Token 泄漏 (BUG-04) | U-02-S03, I-04 | 头验证 + IPC 验证 |
| REG-SEC-04 | 使用已废弃 escape/unescape (BUG-09) | — | 静态检查 |

---

## 六、渗透测试检查清单

| # | 攻击向量 | 测试方法 | 预期结果 |
|---|----------|----------|----------|
| 1 | XSS via chat message | 发送包含 `<script>alert(1)</script>` 的消息 | 脚本不执行 |
| 2 | XSS via page title | 打开标题含 `<img onerror>` 的页面 → 宠物渲染标题 | 脚本不执行 |
| 3 | XSS via RAG content | 知识库文件含恶意 markdown → RAG 检索 → 渲染 | DOMPurify 清洗 |
| 4 | XSS via URL | 打开 `https://site.com/<script>` → URL 出现在 UI | 实体编码 |
| 5 | Token theft via postMessage | 恶意页面 `postMessage({type:"getToken"})` | 无响应 |
| 6 | Token theft via DOM access | 恶意页面 `document.querySelector('#yipet-root')` | ShadowDOM 隔离 |
| 7 | IPC spoofing | `window.postMessage({type:"YIPET_CMD", cmd:"exec"})` | secret 验证拦截 |
| 8 | IPC replay | 截获合法消息 → 5s 后重放 | timestamp 验证拦截 |
| 9 | CSP bypass | 尝试在 CS 中 `eval("code")` | CSP 阻断 |
| 10 | Storage pollution | `chrome.storage.local.set({malicious: "data"})` | 仅扩展自身可写 |

---

## 七、需求追溯矩阵

| 安全需求 | 单元 | 组件 | 集成 | 渗透 |
|----------|------|------|------|------|
| SR-01 CSP 合规 | U-01 S01-05 | — | I-01 | #9 |
| SR-02 Token 加密存储 | U-02 S01-05 | — | I-02 | #5 |
| SR-03 XSS 防护 | U-03 S01-07 | C-01 S01-02 | — | #1-4 |
| SR-04 innerHTML 禁用 | U-04 S01-03 | — | — | — |
| SR-05 IPC 消息安全 | — | — | I-03-05 | #7-8 |
| SR-06 最小权限 | U-01 S04-05 | — | — | — |
| SR-07 生产构建零日志 | — | — | I-06 | — |
| SR-08 ShadowDOM 隔离 | — | — | — | #6 |

---

## 八、完成定义

- [ ] 单元测试：U-01(5) + U-02(5) + U-03(7) + U-04(3) = 20 用例全通过
- [ ] 组件测试：C-01(2) 全通过
- [ ] 集成测试：I-01~06 全通过
- [ ] 回归测试：REG-SEC-01~04 全通过
- [ ] 渗透测试：10 项全部验证
- [ ] CSP 零违规（`eval()` 零匹配、内联脚本零匹配、远程脚本零匹配）
- [ ] Manifest 权限最小集验证通过
- [ ] `tsc --noEmit` 零错误
- [ ] `npm run build` 产物 CSP 合规
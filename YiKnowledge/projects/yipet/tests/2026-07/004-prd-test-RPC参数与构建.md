---

doc_type: test
title: "YP-07-04: RPC 参数名契约 + 构建兼容性 — 测试规格"
status: 已完成
priority: 中
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202607"
prd_task_id: "YP-07-04"
source_prds: ["04-缺陷修复-RPC参数与构建"]
source_modules: ["04-prd-task-RPC参数与构建"]
source_okr: [yipet-001]

type: test
---

# YP-07-04: RPC 参数名契约 + 构建兼容性 — 测试规格

> 来源 PRD：[04-缺陷修复-RPC参数与构建.md](../../prds/2026-07/04-缺陷修复-RPC参数与构建.md)
> 开发方案：[04-prd-task-RPC参数与构建.md](../../devs/2026-07/04-prd-task-RPC参数与构建.md)

---

## 一、测试策略

RPC 参数名不匹配是 YrY 单体仓库中最常见的跨项目 bug——前端使用 `query`/`path`/`collection_name` 而后端期望 `filter`/`target_file`/`cname`，导致后端静默忽略参数或返回 422。

测试策略：**静态检查（grep 扫描）为主、运行时验证为辅**。

---

## 二、单元测试

### U-01: RPC 参数名 — 静态契约检查

```typescript
describe("RPC parameter name contract — static", () => {
  it("U-01-S01: zero 'query' in API service calls", () => {
    // grep -r '"query"' src/api/ --include="*.ts"
    // 预期：零匹配
    // 正确用法：{ filter: {...} }
  });

  it("U-01-S02: zero 'path' in file read/write calls", () => {
    // grep -r '"path"' src/api/ --include="*.ts"
    // 预期：零匹配
    // 正确用法：{ target_file: "/path/to/file" }
  });

  it("U-01-S03: zero 'collection_name' in data service calls", () => {
    // grep -r 'collection_name' src/api/ --include="*.ts"
    // 预期：零匹配
    // 正确用法：{ cname: "sessions" }
  });

  it("U-01-S04: filter parameter is used in data_service.query_documents", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ code: 0, data: [] }) });
    vi.stubGlobal("fetch", fetchSpy);
    const client = new ApiClient("http://localhost:10086");
    await client.call("services.database.data_service", "query_documents", {
      cname: "sessions",
      filter: { status: "active" },
    });
    const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
    expect(body.parameters.filter).toEqual({ status: "active" });
    expect(body.parameters.query).toBeUndefined();
  });

  it("U-01-S05: target_file parameter in /read-file", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ code: 0, data: "content" }) });
    vi.stubGlobal("fetch", fetchSpy);
    await fetch("http://localhost:10086/read-file", {
      method: "POST",
      body: JSON.stringify({ target_file: "/YiKnowledge/test.md" }),
    });
    const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
    expect(body.target_file).toBe("/YiKnowledge/test.md");
    expect(body.path).toBeUndefined();
  });
});
```

### U-02: 构建产物验证

```typescript
describe("Build artifact compliance", () => {
  const DIST = "dist/";

  it("U-02-S01: popup.js has no content hash in filename", () => {
    const files = lsFiles(DIST);
    const popupJs = files.filter(f => f.startsWith("popup") && f.endsWith(".js"));
    expect(popupJs).toEqual(["popup.js"]); // 非 popup.a3f2b1.js
  });

  it("U-02-S02: background.js has no content hash in filename", () => {
    const files = lsFiles(DIST);
    const bgJs = files.filter(f => f.startsWith("background") && f.endsWith(".js"));
    expect(bgJs).toEqual(["background.js"]);
  });

  it("U-02-S03: single chunk per entry (no code splitting)", () => {
    const files = lsFiles(DIST);
    const bgChunks = files.filter(f => f.startsWith("background") && /[a-f0-9]{8}/.test(f));
    expect(bgChunks).toHaveLength(0);
  });

  it("U-02-S04: CDN resources are in web_accessible_resources", () => {
    const manifest = JSON.parse(readFile(`${DIST}manifest.json`));
    const war = manifest.web_accessible_resources?.[0]?.resources || [];
    expect(war.some((r: string) => r.includes("cdn"))).toBe(true);
  });

  it("U-02-S05: CDN resource returns 200 via chrome.runtime.getURL", async () => {
    const url = chrome.runtime.getURL("cdn/vue.global.prod.js");
    const response = await fetch(url);
    expect(response.status).toBe(200);
  });
});
```

---

## 三、集成测试

```typescript
describe("RPC + Build integration", () => {
  it("I-01: end-to-end data query with correct parameter names", async () => {
    // 1. YiPet dataService.listSessions({ filter: { status: "active" } })
    // 2. → ApiClient.call("services.database.data_service", "query_documents", { cname, filter })
    // 3. → fetch POST / body: { module_name, method_name, parameters: { cname, filter } }
    // 4. → YiAi returns { code: 0, data: [...] }
    // 5. → sessions correctly filtered
  });

  it("I-02: wrong parameter 'query' causes empty result", async () => {
    // 使用 { query: {...} } 替代 { filter: {...} }
    // → YiAi 后端忽略 query 参数 → 返回全部文档（未过滤）
    // 验证：应触发 console.warn 或类型错误
  });

  it("I-03: wrong parameter 'path' causes 422", async () => {
    // POST /read-file body: { path: "/x.md" }
    // → YiAi 返回 HTTP 422 (target_file is required)
  });

  it("I-04: build + load extension + RPC call", async () => {
    // 1. npm run build
    // 2. Load extension in Chrome
    // 3. Open popup → trigger RPC call
    // 4. Verify response with correct data
  });
});
```

---

## 四、参数名契约速查表

| 上下文 | 正确参数名 | 错误参数名 | 错误后果 |
|--------|-----------|-----------|----------|
| data_service.query_documents | `filter` | `query` | 后端静默忽略，返回未过滤的全部数据 |
| data_service 集合名 | `cname` | `collection_name` | 后端参数校验失败 |
| /read-file, /write-file | `target_file` | `path` | 后端返回 422 Validation Error |
| SSE chat | `parameters` | `params` | HTTP 422 |

---

## 五、完成定义

- [ ] 单元测试：U-01(5) + U-02(5) = 10 用例全通过
- [ ] 集成测试：I-01~04 全通过
- [ ] `grep -r '"query"' src/api/ --include="*.ts"` 零匹配
- [ ] `grep -r '"path"' src/api/ --include="*.ts"` 零匹配（文件读写上下文）
- [ ] `grep -r 'collection_name' src/api/ --include="*.ts"` 零匹配
- [ ] `npm run build` 成功，产物文件名无 hash
- [ ] CDN 资源 `chrome.runtime.getURL` 返回 200
- [ ] `tsc --noEmit` 零错误
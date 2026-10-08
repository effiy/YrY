---

doc_type: test
title: "YP-09-06: 安全合规 — CSP + Privacy + 权限最小化 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
created: 2026-09-23
updated: 2026-09-23
project: YiPet
prd_month: "202609"
prd_task_id: "YP-09-06"
source_prds: ["13-合规-安全配置"]
source_modules: ["06-prd-task-安全合规"]

type: test
---

# YP-09-06: 安全合规 — 测试规格

## 一、静态检查

| 编号 | 检查 | 命令 | 期望 |
|------|------|------|------|
| TC-SEC-S01 | CSP script-src 零 eval | `grep -r 'eval(' src/` | 零匹配 |
| TC-SEC-S02 | CSP object-src 'none' | manifest 含 `"object-src": "none"` | ✓ |
| TC-SEC-S03 | CSP connect-src 仅 localhost | manifest connect-src 不含外部域名 | ✓ |
| TC-SEC-S04 | 权限仅 storage/scripting | `manifest.json` permissions | 仅 2 项 |
| TC-SEC-S05 | host_permissions 仅 localhost | manifest host_permissions | 不含 `<all_urls>` |
| TC-SEC-S06 | Privacy Manifest 存在 | `privacy-manifest.json` | 文件存在且字段完整 |
| TC-SEC-S07 | 生产构建零 console.log 敏感数据 | `grep -r 'console.log.*token' dist/` | 零匹配 |

## 二、单元测试

```typescript
describe("Security", () => {
  it("TC-SEC-U01: Token stored in chrome.storage.local, not localStorage", async () => {
    client.setToken("jwt_test");
    expect(localStorage.getItem("token")).toBeNull();
    expect(chrome.storage.local.set).toHaveBeenCalledWith({ token: "jwt_test" }, expect.any(Function));
  });

  it("TC-SEC-U02: Token sent via X-Token header only", async () => {
    const spy = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ code: 0 }) });
    vi.stubGlobal("fetch", spy);
    client.setToken("jwt_abc");
    await client.call("services.test", "ping", {});
    const [, init] = spy.mock.calls[0];
    expect(init.headers["X-Token"]).toBe("jwt_abc");
    expect(init.headers["Authorization"]).toBeUndefined();
  });

  it("TC-SEC-U03: DOMPurify sanitizes XSS in markdown", () => {
    const input = '<script>alert(1)</script>';
    const clean = DOMPurify.sanitize(marked.parse(input));
    expect(clean).not.toContain("<script>");
  });
});
```

完成定义: TC-SEC-S01~07 + U01~03 全通过
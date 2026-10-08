---

doc_type: test
title: "YP-09-22: Markdown 渲染安全 — XSS 防护 + DOMPurify 管道 — 测试规格"
status: 已完成
priority: P0
owner: 陈铭
created: 2026-09-23
updated: 2026-09-23
project: YiPet
prd_month: "202609"
prd_task_id: "YP-09-22"
source_prds: ["29-架构设计-Markdown渲染安全"]
source_modules: ["29-prd-task-Markdown渲染安全"]

type: test
---

# YP-09-22: Markdown 渲染安全 — 测试规格

## 一、XSS 向量覆盖

```typescript
describe("Markdown XSS protection", () => {
  it("strips <script> tags", () => {
    const clean = DOMPurify.sanitize(marked.parse('<script>alert(1)</script>'));
    expect(clean).not.toContain("<script>");
  });

  it("strips onerror handlers in <img>", () => {
    const clean = DOMPurify.sanitize(marked.parse('<img src=x onerror="alert(1)">'));
    expect(clean).not.toContain("onerror");
  });

  it("strips javascript: URLs in links", () => {
    const clean = DOMPurify.sanitize(marked.parse('[click](javascript:alert(1))'));
    expect(clean).not.toContain("javascript:");
  });

  it("strips <iframe> and <object> tags", () => {
    const clean = DOMPurify.sanitize(marked.parse('<iframe src="evil.html"><object data="x">'));
    expect(clean).not.toContain("iframe");
    expect(clean).not.toContain("object");
  });

  it("strips data: URLs with script content", () => {
    const clean = DOMPurify.sanitize(marked.parse('<img src="data:text/html,<script>alert(1)</script>">'));
    expect(clean).not.toContain("data:");
  });

  it("preserves legitimate markdown formatting", () => {
    const clean = DOMPurify.sanitize(marked.parse("**bold** `code` [link](https://safe.com)"));
    expect(clean).toContain("<strong>bold</strong>");
    expect(clean).toContain("<code>code</code>");
    expect(clean).toContain('href="https://safe.com"');
  });

  it("strips CSS injection via style attribute", () => {
    const clean = DOMPurify.sanitize(marked.parse('<span style="background:url(javascript:alert(1))">x</span>'));
    expect(clean).not.toContain("javascript:");
  });
});
```

## 二、完成定义

- [ ] 7 个 XSS 向量全部覆盖
- [ ] 合法 Markdown 不被破坏
- [ ] `tsc --noEmit` 零错误
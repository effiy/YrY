---

doc_type: test
title: "YP-08-02: 知识库与 RAG 集成 — 知识树浏览 + RAG 检索 + scope 限定 + 子问题分解 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202608"
prd_task_id: "YP-08-02"
source_prds: ["02-功能实现-知识库与RAG集成"]
source_modules: ["02-prd-task-知识库与RAG集成"]
source_okr: [yipet-002]

type: test
---

# YP-08-02: 知识库与 RAG 集成 — 测试规格

> 来源 PRD：[02-功能实现-知识库与RAG集成.md](../../prds/2026-08/02-功能实现-知识库与RAG集成.md)
> 开发方案：[02-prd-task-知识库与RAG集成.md](../../devs/2026-08/02-prd-task-知识库与RAG集成.md)

---

## 一、单元测试

### U-01: KnowledgeService

```typescript
describe("KnowledgeService", () => {
  let service: KnowledgeService;
  let callSpy: Mock;

  beforeEach(() => {
    callSpy = vi.fn().mockResolvedValue({ code: 0, data: {} });
    service = new KnowledgeService({ call: callSpy } as any);
  });

  it("U-01-S01: getTree returns recursive dir structure", async () => {
    callSpy.mockResolvedValue({ code: 0, data: {
      children: [{ name: "engineer", type: "dir", children: [
        { name: "architecture", type: "dir", children: [
          { name: "01-模式.md", type: "file" },
        ]},
      ]}],
    }});
    const tree = await service.getTree();
    expect(tree.children[0].children[0].children[0].name).toBe("01-模式.md");
  });

  it("U-01-S02: getTree filters by role", async () => {
    await service.getTree("engineer");
    expect(callSpy).toHaveBeenCalledWith(
      "services.ai.knowledge_service", "get_tree", { role: "engineer" }
    );
  });

  it("U-01-S03: getFile returns frontmatter + content", async () => {
    callSpy.mockResolvedValue({ code: 0, data: {
      path: "engineer/test.md", frontmatter: { title: "T", tags: ["x"] }, content: "# Hello",
    }});
    const file = await service.getFile("engineer/test.md");
    expect(file!.frontmatter.title).toBe("T");
  });

  it("U-01-S04: getFile nonexistent returns null", async () => {
    callSpy.mockResolvedValue({ code: 1002, data: null });
    const file = await service.getFile("nonexistent.md");
    expect(file).toBeNull();
  });

  it("U-01-S05: writeFile uses target_file not path", async () => {
    await service.writeFile("projects/test.md", "# Content");
    expect(callSpy).toHaveBeenCalledWith(
      "services.ai.knowledge_service", "write_file",
      { target_file: "projects/test.md", content: "# Content" }
    );
  });
});
```

### U-02: RagService

```typescript
describe("RagService", () => {
  let service: RagService;
  let callSpy: Mock;

  beforeEach(() => {
    callSpy = vi.fn().mockResolvedValue({ code: 0, data: {} });
    service = new RagService({ call: callSpy } as any);
  });

  it("U-02-S01: search with file-level scope returns scored results", async () => {
    callSpy.mockResolvedValue({ code: 0, data: {
      results: [{ file: "a.md", score: 0.95, snippet: "...", chunk_index: 0 }],
    }});
    const r = await service.search("query", { type: "file", paths: ["a.md"] });
    expect(r.results[0].score).toBeGreaterThan(0.9);
  });

  it("U-02-S02: search with dir-level scope", async () => {
    await service.search("deploy", { type: "dir", paths: ["sre/"] });
    expect(callSpy).toHaveBeenCalledWith(
      "services.ai.rag_service", "search",
      expect.objectContaining({ scope: { type: "dir", paths: ["sre/"] } })
    );
  });

  it("U-02-S03: search without scope searches entire KB", async () => {
    await service.search("patterns");
    const params = callSpy.mock.calls[0][2];
    expect(params.scope).toBeUndefined();
  });

  it("U-02-S04: previewSources returns file list + chunk estimate", async () => {
    callSpy.mockResolvedValue({ code: 0, data: { files: ["a.md", "b.md"], estimated_chunks: 12 } });
    const p = await service.previewSources({ type: "dir", paths: ["engineer/"] });
    expect(p.estimated_chunks).toBe(12);
  });

  it("U-02-S05: decompose splits complex question", async () => {
    callSpy.mockResolvedValue({ code: 0, data: {
      sub_questions: ["Q1", "Q2", "Q3"], synthesized_answer: "Answer",
    }});
    const r = await service.decompose("How to refactor?");
    expect(r.sub_questions.length).toBeGreaterThanOrEqual(2);
  });

  it("U-02-S06: getStatus returns index status", async () => {
    callSpy.mockResolvedValue({ code: 0, data: { index_status: "built", chunk_count: 12345 } });
    const s = await service.getStatus();
    expect(s.index_status).toBe("built");
  });
});
```

---

## 二、组件测试

### C-01: KnowledgeTree

```typescript
describe("KnowledgeTree", () => {
  beforeEach(() => {
    vi.mocked(knowledgeService.getTree).mockResolvedValue({
      children: [
        { name: "engineer", type: "dir", children: [
          { name: "architecture", type: "dir", children: [
            { name: "01-模式.md", type: "file", path: "engineer/architecture/01-模式.md" },
          ]},
        ]},
        { name: "aier", type: "dir", children: [] },
      ],
    });
  });

  it("C-01-S01: renders 7 role root directories", async () => {
    const wrapper = mount(KnowledgeTree);
    await flushPromises();
    const dirs = wrapper.findAll(".tree-node--dir");
    expect(dirs.length).toBeGreaterThanOrEqual(7);
  });

  it("C-01-S02: click dir toggles expand/collapse", async () => {
    const wrapper = mount(KnowledgeTree);
    await flushPromises();
    const engineerNode = wrapper.find('[data-path="engineer"]');
    await engineerNode.trigger("click");
    expect(wrapper.find('[data-path="engineer/architecture"]').exists()).toBe(true);
  });

  it("C-01-S03: click file shows frontmatter popover", async () => {
    const wrapper = mount(KnowledgeTree);
    await flushPromises();
    // 展开 engineer → architecture → 点击 01-模式.md
    // popover 显示 title, tags, category
  });

  it("C-01-S04: @ button on file row adds to RAG scope", async () => {
    const wrapper = mount(KnowledgeTree);
    await flushPromises();
    // 点击文件行的 @ 按钮 → emit('select-file', path)
  });

  it("C-01-S05: loading state shows skeleton", () => {
    vi.mocked(knowledgeService.getTree).mockReturnValue(new Promise(() => {}));
    const wrapper = mount(KnowledgeTree);
    expect(wrapper.find(".tree-skeleton").exists()).toBe(true);
  });

  it("C-01-S06: error state shows retry button", async () => {
    vi.mocked(knowledgeService.getTree).mockRejectedValue(new Error("Network error"));
    const wrapper = mount(KnowledgeTree);
    await flushPromises();
    expect(wrapper.text()).toContain("Failed to load");
    expect(wrapper.find("button.retry").exists()).toBe(true);
  });
});
```

### C-02: ContextScopeBar

```typescript
describe("ContextScopeBar", () => {
  it("C-02-S01: displays scope chips with file/chunk counts", () => {
    const wrapper = mount(ContextScopeBar, {
      props: {
        ragScope: { type: "dir", paths: ["engineer/architecture/"] },
        sourcePreview: { files: ["a.md", "b.md"], estimated_chunks: 15 },
      },
    });
    expect(wrapper.text()).toContain("engineer/architecture/");
    expect(wrapper.text()).toContain("2 files");
    expect(wrapper.text()).toContain("15 chunks");
  });

  it("C-02-S02: remove scope chip emits remove-scope", async () => {
    const wrapper = mount(ContextScopeBar, { props: { ragScope: { type: "file", paths: ["a.md"] } } });
    await wrapper.find(".scope-chip__remove").trigger("click");
    expect(wrapper.emitted("remove-scope")).toBeTruthy();
  });

  it("C-02-S03: clear all button emits clear-scope", async () => {
    const wrapper = mount(ContextScopeBar, { props: { ragScope: { type: "file", paths: ["a.md"] } } });
    await wrapper.find("button.clear-all").trigger("click");
    expect(wrapper.emitted("clear-scope")).toBeTruthy();
  });
});
```

---

## 三、集成测试

```typescript
describe("RAG integration", () => {
  it("I-01: KnowledgeTree → select file → scope → RAG search → SSE with citations", async () => {
    // 1. 展开树 → 选择文件 → scope 更新
    // 2. 发送消息 "explain this"
    // 3. RagService.search({ type: "file", paths: [...] })
    // 4. SSE 流含 RAG 引用: "According to [engineer/arch.md]..."
  });

  it("I-02: @mention → dropdown → keyboard select → scope chip appears", async () => {
    // 1. ChatInput 输入 "@eng"
    // 2. 下拉显示匹配文件
    // 3. ArrowDown × 2 → Enter
    // 4. ContextScopeBar 显示新 chip
  });

  it("I-03: decompose → parallel sub-question search → synthesized answer", async () => {
    // 1. 发送复杂问题
    // 2. RagService.decompose() → 3 个子问题
    // 3. 3 次 search() 并行
    // 4. 综合回答含 3 组引用
  });

  it("I-04: RAG status badge updates — not_built → building → built", async () => {
    // 1. 初始状态 not_built
    // 2. click rebuildIndex → building
    // 3. 轮询 → built (12345 chunks)
  });
});
```

---

## 四、需求追溯矩阵

| 需求 | U-01 | U-02 | C-01 | C-02 | 集成 |
|------|------|------|------|------|------|
| FR-01 知识树浏览 | S01-02 | — | S01-06 | — | — |
| FR-02 文件预览 | S03-04 | — | S03 | — | — |
| FR-03 RAG 检索 | — | S01-03 | — | — | I-01 |
| FR-04 scope 限定 | — | S01-02,04 | S04 | S01-03 | I-02 |
| FR-05 子问题分解 | — | S05 | — | — | I-03 |
| FR-06 RAG 状态 | — | S06 | — | — | I-04 |
| FR-07 @mention | — | — | — | — | I-02 |

---

## 五、完成定义

- [ ] 单元测试：U-01(5) + U-02(6) = 11 用例全通过
- [ ] 组件测试：C-01(6) + C-02(3) = 9 用例全通过
- [ ] 集成测试：I-01~04 全通过
- [ ] `tsc --noEmit` 零错误
- [ ] `npm test` 全量通过
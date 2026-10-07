---

doc_type: test
title: "YP-08-07: API 服务扩展 — KnowledgeService / RagService / BugService / SessionService / WeWorkService — 测试规格"
status: 已完成
priority: P0
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202608"
prd_task_id: "YP-08-07"
source_prds: ["06-基础设施-API服务扩展"]
source_modules: ["06-prd-task-API服务扩展"]
source_okr: [yipet-002]

type: test
---

# YP-08-07: API 服务扩展 — 测试规格

> 来源 PRD：[06-基础设施-API服务扩展.md](../../prds/2026-08/06-基础设施-API服务扩展.md)
> 开发方案：[06-prd-task-API服务扩展.md](../../devs/2026-08/06-prd-task-API服务扩展.md)

---

## 一、测试策略

八月 API 服务扩展将 YiPet 的 4-Tier API 层从 4 个 Service 扩展至 8 个。新增 Service 覆盖知识库浏览、RAG 检索、Bug 报告提交和通知管理。测试重点：**4-Tier 架构合规（所有调用经 ApiClient）+ RPC 参数名契约 + Service 层错误处理一致性**。

| 层级 | 范围 | 工具 |
|------|------|------|
| L1 单元 | ApiClient RPC 信封、各 Service 方法、参数名契约 | Vitest + mock fetch |
| L2 集成 | Service → ApiClient → mock YiAi 端点 | Vitest + msw |
| L3 静态 | 组件层裸 fetch 扫描、参数名 grep | Shell + tsc |

---

## 二、单元测试

### U-01: ApiClient — 4-Tier 架构合规

```typescript
describe("ApiClient — 4-Tier compliance", () => {
  let fetchSpy: Mock;

  beforeEach(() => {
    fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ code: 0, data: {} }),
    });
    vi.stubGlobal("fetch", fetchSpy);
  });

  it("U-01-S01: RPC envelope has correct shape", async () => {
    const client = new ApiClient("http://localhost:10086");
    await client.call("services.ai.knowledge_service", "get_tree", { role: "engineer" });

    const [url, init] = fetchSpy.mock.calls[0];
    const body = JSON.parse(init.body);
    expect(body).toEqual({
      module_name: "services.ai.knowledge_service",
      method_name: "get_tree",
      parameters: { role: "engineer" },
    });
  });

  it("U-01-S02: all 8 Service classes use ApiClient (not raw fetch)", () => {
    // 静态检查：grep -r "fetch(" src/services/ --include="*.ts" | grep -v "api-client"
    // 预期：零匹配 — 所有 HTTP 请求经 ApiClient
    // 每个 Service class 构造函数接受 ApiClient 实例
  });

  it("U-01-S03: component layer has zero fetch calls", () => {
    // grep -r "fetch(" src/ --include="*.vue"
    // 预期：零匹配 — 组件只调用 Store actions
  });
});
```

### U-02: KnowledgeService

```typescript
describe("KnowledgeService", () => {
  let service: KnowledgeService;
  let callSpy: Mock;

  beforeEach(() => {
    callSpy = vi.fn().mockResolvedValue({ code: 0, data: {} });
    service = new KnowledgeService({ call: callSpy } as any);
  });

  it("U-02-S01: getTree returns directory tree structure", async () => {
    callSpy.mockResolvedValue({
      code: 0,
      data: {
        children: [
          { name: "engineer", type: "dir", children: [
            { name: "architecture", type: "dir", children: [
              { name: "01-模式-微服务架构.md", type: "file" },
            ]},
          ]},
        ],
      },
    });
    const tree = await service.getTree();
    expect(tree.children[0].name).toBe("engineer");
    expect(tree.children[0].children[0].children[0].name).toBe("01-模式-微服务架构.md");
  });

  it("U-02-S02: getTree accepts role filter parameter", async () => {
    await service.getTree("engineer");
    expect(callSpy).toHaveBeenCalledWith(
      "services.ai.knowledge_service", "get_tree",
      { role: "engineer" }
    );
  });

  it("U-02-S03: getFile returns file content with frontmatter", async () => {
    callSpy.mockResolvedValue({
      code: 0,
      data: {
        path: "engineer/architecture/01-模式.md",
        content: "---\ntitle: Test\n---\n\n# Content",
        frontmatter: { title: "Test", tags: ["architecture"] },
      },
    });
    const file = await service.getFile("engineer/architecture/01-模式.md");
    expect(file.frontmatter.title).toBe("Test");
    expect(file.content).toContain("# Content");
  });

  it("U-02-S04: getFile returns null for nonexistent file", async () => {
    callSpy.mockResolvedValue({ code: 1002, message: "File not found", data: null });
    const file = await service.getFile("nonexistent.md");
    expect(file).toBeNull();
  });

  it("U-02-S05: writes knowledge file to YiKnowledge", async () => {
    await service.writeKnowledgeFile("projects/yipet/bugs/test-bug.md", "# Bug Report");
    expect(callSpy).toHaveBeenCalledWith(
      "services.ai.knowledge_service", "write_file",
      { target_file: "projects/yipet/bugs/test-bug.md", content: "# Bug Report" }
    );
  });
});
```

### U-03: RagService

```typescript
describe("RagService", () => {
  let service: RagService;
  let callSpy: Mock;

  beforeEach(() => {
    callSpy = vi.fn().mockResolvedValue({ code: 0, data: {} });
    service = new RagService({ call: callSpy } as any);
  });

  it("U-03-S01: search with file-level scope", async () => {
    callSpy.mockResolvedValue({
      code: 0,
      data: {
        results: [
          { file: "engineer/arch.md", score: 0.92, snippet: "Microservice..." },
        ],
      },
    });
    const results = await service.search("microservice pattern", {
      type: "file",
      paths: ["engineer/architecture/01-模式.md"],
    });
    expect(results.results).toHaveLength(1);
    expect(results.results[0].score).toBeGreaterThan(0.9);
  });

  it("U-03-S02: search with directory-level scope", async () => {
    await service.search("deployment", {
      type: "dir",
      paths: ["sre/releases/"],
    });
    expect(callSpy).toHaveBeenCalledWith(
      "services.ai.rag_service", "search",
      expect.objectContaining({
        scope: { type: "dir", paths: ["sre/releases/"] },
      })
    );
  });

  it("U-03-S03: search without scope searches entire knowledge base", async () => {
    await service.search("architecture patterns");
    const params = callSpy.mock.calls[0][2];
    expect(params.scope).toBeUndefined();
  });

  it("U-03-S04: decompose splits complex question", async () => {
    callSpy.mockResolvedValue({
      code: 0,
      data: {
        sub_questions: [
          "What is the current architecture?",
          "What are the pain points?",
          "What are the alternatives?",
        ],
        synthesized_answer: "...",
      },
    });
    const result = await service.decompose(
      "How should we refactor the architecture?"
    );
    expect(result.sub_questions.length).toBeGreaterThanOrEqual(2);
    expect(result.synthesized_answer).toBeTruthy();
  });

  it("U-03-S05: previewSources returns file list without LLM call", async () => {
    callSpy.mockResolvedValue({
      code: 0,
      data: { files: ["a.md", "b.md"], estimated_chunks: 15 },
    });
    const preview = await service.previewSources({
      type: "dir", paths: ["engineer/"],
    });
    expect(preview.files).toHaveLength(2);
    expect(preview.estimated_chunks).toBe(15);
  });

  it("U-03-S06: rebuildIndex triggers index rebuild", async () => {
    await service.rebuildIndex();
    expect(callSpy).toHaveBeenCalledWith(
      "services.ai.rag_service", "rebuild_index", {}
    );
  });
});
```

### U-04: BugService

```typescript
describe("BugService", () => {
  let service: BugService;
  let callSpy: Mock;

  beforeEach(() => {
    callSpy = vi.fn().mockResolvedValue({ code: 0, data: {} });
    service = new BugService({ call: callSpy } as any);
  });

  it("U-04-S01: submit creates bug document in MongoDB", async () => {
    callSpy.mockResolvedValue({ code: 0, data: { key: "bug_abc123" } });
    const result = await service.submit({
      title: "SSE disconnection",
      url: "http://localhost:8848/#/bug/detail/1",
      project: "YiVad",
      severity: "P1",
      description: "SSE disconnects on network switch",
    });
    expect(result.key).toBe("bug_abc123");
  });

  it("U-04-S02: submit validates required fields", async () => {
    await expect(service.submit({
      title: "",
      url: "",
      project: "",
      severity: "P1" as any,
      description: "",
    })).rejects.toThrow("title is required");
  });

  it("U-04-S03: list returns bugs with optional filter", async () => {
    callSpy.mockResolvedValue({
      code: 0,
      data: {
        documents: [
          { key: "1", title: "Bug A", status: "open" },
          { key: "2", title: "Bug B", status: "resolved" },
        ],
      },
    });
    const bugs = await service.list({ filter: { status: "open" } });
    expect(bugs.documents).toHaveLength(2);
    expect(callSpy).toHaveBeenCalledWith(
      "services.database.data_service", "query_documents",
      expect.objectContaining({
        cname: "bugs",
        filter: { status: "open" },
      })
    );
  });
});
```

### U-05: SessionService 扩展

```typescript
describe("SessionService — branch", () => {
  it("U-05-S01: branchFromMessage uses correct RPC parameter names", async () => {
    const callSpy = vi.fn().mockResolvedValue({ code: 0, data: {} });
    const service = new SessionService({ call: callSpy } as any);

    await service.branchFromMessage("session_key_1", 3);

    // 验证使用 filter 而非 query
    expect(callSpy).toHaveBeenCalledWith(
      "services.ai.session_service", "branch",
      expect.objectContaining({
        session_key: "session_key_1",
        message_index: 3,
      })
    );
  });
});
```

---

## 三、参数名契约测试

```typescript
describe("RPC parameter name contract — all services", () => {
  it("C-01: zero 'query' parameter usage in service layer", () => {
    // grep -r '"query"' src/services/ src/api/ --include="*.ts"
    // 预期：零匹配
    // 所有数据查询使用 filter
  });

  it("C-02: zero 'path' parameter in file operations", () => {
    // grep -r '"path"' src/services/ --include="*.ts"
    // 预期：零匹配
    // 文件操作使用 target_file
  });

  it("C-03: zero 'collection_name' in data operations", () => {
    // grep -r 'collection_name' src/services/ --include="*.ts"
    // 预期：零匹配
    // 集合名使用 cname
  });

  it("C-04: ApiClient.call type-checked at compile time", () => {
    // ApiClient.call(moduleName, methodName, parameters)
    // moduleName 和 methodName 应为字符串字面量联合类型
    // parameters 应与 methodName 对应的参数类型匹配
  });
});
```

---

## 四、集成测试

```typescript
describe("API service integration", () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it("I-01: KnowledgeService → YiAi → knowledge tree", async () => {
    server.use(
      http.post("http://localhost:10086/", async ({ request }) => {
        const body = await request.json() as any;
        if (body.method_name === "get_tree") {
          return HttpResponse.json({
            code: 0,
            data: { children: [{ name: "engineer", type: "dir", children: [] }] },
          });
        }
        return HttpResponse.json({ code: 9999, message: "unknown method" });
      })
    );
    const tree = await knowledgeService.getTree();
    expect(tree.children[0].name).toBe("engineer");
  });

  it("I-02: RagService.search → YiAi → search results with inline citations", async () => {
    server.use(
      http.post("http://localhost:10086/", async ({ request }) => {
        const body = await request.json() as any;
        if (body.method_name === "search") {
          return HttpResponse.json({
            code: 0,
            data: {
              results: [
                { file: "engineer/arch.md", score: 0.95, snippet: "Microservices..." },
              ],
            },
          });
        }
      })
    );
    const results = await ragService.search("microservices");
    expect(results.results[0].file).toBe("engineer/arch.md");
  });

  it("I-03: BugService.submit → dataService → MongoDB + YiKnowledge dual write", async () => {
    // submit 内部调用 dataService.createDocument("bugs", ...)
    // 然后调用 knowledgeService.writeKnowledgeFile(...)
    // 验证两个调用都带正确参数
  });

  it("I-04: Service error propagation — 5001 DB error → typed error", async () => {
    server.use(
      http.post("http://localhost:10086/", async () =>
        HttpResponse.json({ code: 5001, message: "Database connection failed", data: null })
      )
    );
    await expect(knowledgeService.getTree()).rejects.toThrow("Database connection failed");
  });

  it("I-05: Service error propagation — 2001 AI unavailable", async () => {
    server.use(
      http.post("http://localhost:10086/", async () =>
        HttpResponse.json({ code: 2001, message: "AI service unavailable", data: null })
      )
    );
    await expect(ragService.search("test")).rejects.toThrow("AI service unavailable");
  });
});
```

---

## 五、Service 清单

| Service | RPC Module | 方法 | 用途 |
|---------|-----------|------|------|
| KnowledgeService | `services.ai.knowledge_service` | get_tree, get_file, write_file | 知识树浏览、文件读写 |
| RagService | `services.ai.rag_service` | search, decompose, preview_sources, rebuild_index | RAG 检索 |
| BugService | `services.database.data_service` | createDocument, query_documents | Bug CRUD + 双写到 YiKnowledge |
| SessionService (扩展) | `services.ai.session_service` | branch, export | 会话分支、导出 |
| NotificationService | `services.notification.notification_service` | list, mark_read | 通知管理 |

---

## 六、需求追溯矩阵

| 需求 | U-01 | U-02 | U-03 | U-04 | U-05 | 集成 | 契约 |
|------|------|------|------|------|------|------|------|
| FR-01 知识库浏览 | ✓ | S01-05 | — | — | — | I-01 | C-02 |
| FR-02 RAG 检索 | ✓ | — | S01-06 | — | — | I-02 | — |
| FR-03 Bug 报告双写 | ✓ | — | — | S01-03 | — | I-03 | C-01 |
| FR-04 会话分支 | ✓ | — | — | — | S01 | — | — |
| FR-05 4-Tier 架构合规 | S01-03 | — | — | — | — | — | C-01-04 |
| NFR-01 错误处理一致性 | — | S04 | S06 | S02 | — | I-04-05 | — |
| NFR-02 RPC 参数名契约 | — | — | — | S03 | S01 | — | C-01-04 |

---

## 七、完成定义

- [ ] 单元测试：U-01(3) + U-02(5) + U-03(6) + U-04(3) + U-05(1) = 18 用例全通过
- [ ] 参数名契约：C-01~04 静态检查通过
- [ ] 集成测试：I-01~05 全通过
- [ ] `grep -r '"query"' src/services/` 零匹配
- [ ] `grep -r '"path"' src/services/` 零匹配（文件读写上下文）
- [ ] `grep -r 'fetch(' src/ --include="*.vue"` 零匹配（组件层）
- [ ] 所有 Service 构造函数接受 ApiClient 实例（依赖注入）
- [ ] `tsc --noEmit` 零错误
- [ ] `npm test` 全量通过
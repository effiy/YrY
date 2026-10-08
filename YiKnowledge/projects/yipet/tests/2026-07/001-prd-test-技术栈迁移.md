---

doc_type: test
title: "YP-07-01: 技术栈迁移 — Vue 3.5 + TypeScript 5 + Rsbuild 4 入口 + MV3 Manifest — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202607"
prd_task_id: "YP-07-01"
source_prds: ["01-基础设施-技术栈迁移"]
source_modules: ["01-prd-task-技术栈迁移"]
source_okr: [yipet-001]

type: test
---

# YP-07-01: 技术栈迁移 — 测试规格

> 来源 PRD：[01-基础设施-技术栈迁移.md](../../prds/2026-07/01-基础设施-技术栈迁移.md)
> 开发方案：[01-prd-task-技术栈迁移.md](../../devs/2026-07/01-prd-task-技术栈迁移.md)

---

## 一、测试策略

技术栈迁移是七月迭代的基石——所有后续模块依赖此模块的构建产物和项目骨架。测试重点：构建正确性 > 类型安全 > 运行时验证。

| 层级 | 范围 | 工具 |
|------|------|------|
| L0 静态 | TypeScript strict、Manifest 格式校验、文件存在性 | `tsc --noEmit`, JSON Schema |
| L1 构建 | Rsbuild 4 入口构建、产物完整性 | `npm run build` |
| L3 E2E | Chrome 扩展加载、Popup 渲染、SW 注册、CS 注入 | Chrome DevTools |

---

## 二、测试用例

### 2.1 构建产物验证

```typescript
describe("Build artifacts", () => {
  const DIST = "dist/";

  it("TC-STACK-001: 4 entry points produce correct files", () => {
    expect(exists(`${DIST}popup.js`)).toBe(true);
    expect(exists(`${DIST}background.js`)).toBe(true);
    expect(exists(`${DIST}bootstrap.js`)).toBe(true);
    expect(exists(`${DIST}chat.js`)).toBe(true);
  });

  it("TC-STACK-002: popup.html references fixed filenames (no hash)", () => {
    const html = readFile(`${DIST}popup.html`);
    expect(html).toMatch(/src="popup\.js"/);   // 非 popup.a3f2.js
    expect(html).not.toMatch(/src="popup\.[a-f0-9]+\.js"/);
  });

  it("TC-STACK-003: background.js is single file (no code splitting)", () => {
    const dir = lsFiles(DIST);
    const bgChunks = dir.filter(f => f.startsWith("background") && f !== "background.js");
    expect(bgChunks).toHaveLength(0);
  });

  it("TC-STACK-004: chat.html exists and is valid", () => {
    const html = readFile(`${DIST}chat.html`);
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toMatch(/src="chat\.js"/);
  });

  it("TC-STACK-005: build completes with zero warnings", () => {
    const { stderr } = runBuild();
    expect(stderr).not.toContain("warning");
    expect(stderr).not.toContain("deprecated");
  });
});
```

### 2.2 Manifest 合规

```typescript
describe("manifest.json compliance", () => {
  let manifest: chrome.runtime.ManifestV3;

  beforeAll(() => {
    manifest = JSON.parse(readFile("dist/manifest.json"));
  });

  it("TC-MF-001: manifest_version is 3", () => {
    expect(manifest.manifest_version).toBe(3);
  });

  it("TC-MF-002: background uses service_worker (not page/scripts)", () => {
    const bg = manifest.background as chrome.runtime.ManifestV3["background"];
    expect(bg?.service_worker).toBe("assets/background.js");
  });

  it("TC-MF-003: content_scripts has run_at: document_idle", () => {
    const cs = manifest.content_scripts?.[0];
    expect(cs?.run_at).toBe("document_idle");
  });

  it("TC-MF-004: permissions are minimal", () => {
    const permissions = manifest.permissions || [];
    expect(permissions).toContain("storage");
    expect(permissions).toContain("activeTab");
    expect(permissions).toContain("scripting");
    // 不应包含危险权限
    expect(permissions).not.toContain("<all_urls>");
    expect(permissions).not.toContain("tabs");
  });

  it("TC-MF-005: web_accessible_resources declared explicitly", () => {
    const war = manifest.web_accessible_resources?.[0];
    expect(war?.resources).toContain("assets/*");
    expect(war?.resources).toContain("cdn/*");
  });

  it("TC-MF-006: CSP does not allow unsafe-eval or remote scripts", () => {
    const csp = (manifest as any).content_security_policy?.extension_pages;
    expect(csp).toBeDefined();
    expect(csp).not.toContain("unsafe-eval");
    expect(csp).not.toContain("https:");
  });
});
```

### 2.3 TypeScript 类型安全

```typescript
describe("TypeScript strict mode", () => {
  it("TC-TS-001: tsc --noEmit passes with zero errors", () => {
    const { status, stdout } = runCommand("npx tsc --noEmit");
    expect(status).toBe(0);
  });

  it("TC-TS-002: strict mode is enabled in tsconfig", () => {
    const tsconfig = JSON.parse(readFile("tsconfig.json"));
    expect(tsconfig.compilerOptions.strict).toBe(true);
  });

  it("TC-TS-003: no 'any' type usage in critical paths", () => {
    // grep -r ': any' src/api/ src/chat/ src/services/
    // 预期：零匹配（或仅个别有充分注释的例外）
  });

  it("TC-TS-004: Vue SFC type checking passes", () => {
    const { status } = runCommand("npx vue-tsc --noEmit");
    expect(status).toBe(0);
  });
});
```

### 2.4 运行时验证（Chrome 加载）

| 编号 | 场景 | 验证方法 | 优先级 |
|------|------|----------|--------|
| TC-RT-001 | 扩展在 `chrome://extensions` 中加载 | 开发者模式 → 加载已解压 → 扩展卡片出现 | P0 |
| TC-RT-002 | Service Worker 状态为 "Active" | `chrome://extensions` → 扩展详情 → SW 状态 | P0 |
| TC-RT-003 | Service Worker 控制台无错误 | `chrome://extensions` → SW inspect → console 无红色 | P0 |
| TC-RT-004 | Popup 点击后正常渲染 | 工具栏点击扩展图标 → Vue 3 组件渲染（非白屏） | P0 |
| TC-RT-005 | Content Script 在任意页面注入 | 打开 `https://example.com` → DevTools Sources → Content Scripts 面板含 bootstrap.js | P0 |
| TC-RT-006 | Content Script 在 SPA 页面注入 | 打开 YiVad → DevTools 确认 CS 注入 + `__YIPET_LOADED__` 非空 | P0 |
| TC-RT-007 | chat.html 独立标签页访问 | `chrome-extension://{id}/chat.html` → 聊天界面渲染 | P0 |
| TC-RT-008 | Service Worker 不使用 DOM API | SW console 中 `typeof document === "undefined"` | P1 |

---

## 三、边缘场景

| 编号 | 场景 | 触发 | 预期 |
|------|------|------|------|
| EDGE-01 | 扩展在 Chrome 130+ (beta) 中加载 | 安装 beta 版 Chrome | 无兼容性错误，所有功能正常 |
| EDGE-02 | 扩展在 Windows 11 中加载 | Windows Chrome | 路径分隔符 `\` 不导致资源 404 |
| EDGE-03 | 离线安装（无网络） | 断网加载扩展 | 扩展加载成功（所有资源本地化） |
| EDGE-04 | 扩展 ID 固定（开发环境） | 多次重新加载 | `chrome.runtime.id` 保持不变 |
| EDGE-05 | 构建产物大小合理 | `ls -lh dist/*.js` | popup.js < 500KB, chat.js < 1MB (gzip 前) |

---

## 四、完成定义

- [ ] 构建产物：TC-STACK-01~05 全通过
- [ ] Manifest：TC-MF-01~06 全通过
- [ ] TypeScript：TC-TS-01~04 全通过
- [ ] 运行时：TC-RT-01~08 全通过
- [ ] 边缘场景：EDGE-01~05 全部验证
- [ ] `tsc --noEmit` + `vue-tsc --noEmit` 零错误
- [ ] `npm run build` 4 入口成功，CSP 零违规
- [ ] Chrome 扩展加载 → Popup 可用 → SW Active → CS 注入成功
---

doc_type: test
title: "YP-07-02: 工具链迁移 — ESLint + Prettier + Husky + commitlint + Vitest — 测试规格"
status: 已完成
priority: 中
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202607"
prd_task_id: "YP-07-02"
source_prds: ["02-基础设施-工具链迁移"]
source_modules: ["02-prd-task-工具链迁移"]
source_okr: [yipet-001]

type: test
---

# YP-07-02: 工具链迁移 — 测试规格

> 来源 PRD：[02-基础设施-工具链迁移.md](../../prds/2026-07/02-基础设施-工具链迁移.md)
> 开发方案：[02-prd-task-工具链迁移.md](../../devs/2026-07/02-prd-task-工具链迁移.md)

---

## 一、测试策略

工具链测试以 **Git hook 行为验证** 为核心——确保不规范代码和不规范提交信息在 `git commit` 阶段被拦截。辅以配置文件完整性检查。

---

## 二、单元测试

### U-01: ESLint + Prettier 集成

```typescript
describe("ESLint + Prettier", () => {
  it("U-01-S01: npm run lint passes on clean code", () => {
    const { status } = runCommand("npm run lint");
    expect(status).toBe(0);
  });

  it("U-01-S02: ESLint catches unused variables", () => {
    // 创建临时文件含 `const x = 1;` (never read)
    // eslint → error: 'x' is assigned but never used
    const tmp = writeTempFile("test-unused.ts", "const x = 1;");
    const { status, stdout } = runCommand(`npx eslint ${tmp}`);
    expect(status).not.toBe(0);
    expect(stdout).toContain("assigned but never used");
  });

  it("U-01-S03: ESLint catches 'any' type (if configured)", () => {
    const tmp = writeTempFile("test-any.ts", "function f(x: any) { return x; }");
    const { stdout } = runCommand(`npx eslint ${tmp}`);
    // @typescript-eslint/no-explicit-any → warn or error
  });

  it("U-01-S04: Prettier check passes on formatted code", () => {
    const { status } = runCommand("npx prettier --check src/");
    expect(status).toBe(0);
  });

  it("U-01-S05: Prettier formats inconsistent code", () => {
    const tmp = writeTempFile("test-fmt.ts", "const  x  =  1 ;");
    runCommand(`npx prettier --write ${tmp}`);
    const formatted = readFile(tmp);
    expect(formatted).toBe("const x = 1;\n");
  });
});
```

### U-02: commitlint 提交信息校验

```typescript
describe("commitlint Conventional Commits", () => {
  it("U-02-S01: accepts feat: message", () => {
    const { status } = runCommand('echo "feat: add login" | npx commitlint');
    expect(status).toBe(0);
  });

  it("U-02-S02: accepts fix: message", () => {
    const { status } = runCommand('echo "fix: resolve SSE reconnect" | npx commitlint');
    expect(status).toBe(0);
  });

  it("U-02-S03: accepts chore: message", () => {
    const { status } = runCommand('echo "chore(deps): bump vue to 3.5.13" | npx commitlint');
    expect(status).toBe(0);
  });

  it("U-02-S04: rejects non-conventional message", () => {
    const { status } = runCommand('echo "updated stuff" | npx commitlint');
    expect(status).not.toBe(0);
  });

  it("U-02-S05: rejects empty message", () => {
    const { status } = runCommand('echo "" | npx commitlint');
    expect(status).not.toBe(0);
  });

  it("U-02-S06: accepts breaking change notation", () => {
    const { status } = runCommand('echo "feat!: drop Vue 2 support\n\nBREAKING CHANGE: requires Vue 3.5+" | npx commitlint');
    expect(status).toBe(0);
  });
});
```

### U-03: Vitest 测试框架

```typescript
describe("Vitest", () => {
  it("U-03-S01: npm test runs all suites", () => {
    const { status, stdout } = runCommand("npm test");
    expect(status).toBe(0);
    expect(stdout).toContain("Tests");
  });

  it("U-03-S02: test file pattern matches convention", () => {
    // glob: src/**/*.{test,spec}.{ts,vue}
    const testFiles = glob("src/**/*.{test,spec}.{ts,vue}");
    expect(testFiles.length).toBeGreaterThan(0);
  });

  it("U-03-S03: jsdom environment is configured", () => {
    const config = readFile("vitest.config.ts");
    expect(config).toContain("jsdom");
  });

  it("U-03-S04: coverage thresholds (if configured)", () => {
    const config = readFile("vitest.config.ts");
    // 检查是否配置了 coverage thresholds
  });
});
```

### U-04: Config 文件完整性

```typescript
describe("Config file integrity", () => {
  const requiredFiles = [
    "eslint.config.mjs",
    ".prettierrc",
    ".husky/pre-commit",
    ".husky/commit-msg",
    "commitlint.config.ts",
    "vitest.config.ts",
  ];

  for (const file of requiredFiles) {
    it(`U-04: ${file} exists and is valid`, () => {
      expect(exists(file)).toBe(true);
      const content = readFile(file);
      expect(content.length).toBeGreaterThan(0);
    });
  }
});
```

---

## 三、集成测试

```typescript
describe("Git hook integration", () => {
  it("I-01: pre-commit hook blocks ESLint errors", async () => {
    // 1. 创建含 ESLint error 的文件
    // 2. git add
    // 3. git commit → 被 pre-commit hook 拦截
    // 4. 验证 commit 未创建（git log -1 仍为之前的 commit）
  });

  it("I-02: pre-commit hook auto-fixes Prettier issues", async () => {
    // 1. 创建格式不规范的 .ts 文件
    // 2. git add → git commit
    // 3. lint-staged 运行 prettier --write
    // 4. 文件被自动格式化后提交
  });

  it("I-03: commit-msg hook blocks non-conventional message", async () => {
    // 1. git add clean-file.ts
    // 2. git commit -m "bad message" → 被 commitlint 拦截
    // 3. git commit -m "feat: good message" → 通过
  });

  it("I-04: lint-staged only checks staged files", async () => {
    // 1. 修改 file-a.ts (规范) + file-b.ts (不规范)
    // 2. git add file-a.ts
    // 3. git commit → lint-staged 仅检查 file-a.ts
    // 4. file-b.ts 不规范但不影响提交
  });
});
```

---

## 四、完成定义

- [ ] 单元测试：U-01(5) + U-02(6) + U-03(4) + U-04(6) = 21 用例全通过
- [ ] 集成测试：I-01~04 全通过
- [ ] `npm run lint` 零 error
- [ ] `npx prettier --check src/` 零差异
- [ ] `npm test` 全量通过
- [ ] Git hooks (pre-commit + commit-msg) 生效
- [ ] 不规范代码在 `git commit` 阶段被拦截
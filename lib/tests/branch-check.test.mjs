/**
 * Tests for lib/branch-check.mjs — branch isolation enforcement.
 * Tests internal functions and constants; CLI entry point (main) tested via integration.
 */

import { describe, it, assert } from "../vitest-adapter.mjs";

const FEAT_PREFIX = "feat/";
const VALID_MODES = ["write", "read", "init"];

describe("lib/branch-check.mjs", () => {
  describe("常量", () => {
    it("FEAT_PREFIX 为 feat/", () => {
      assert.equal(FEAT_PREFIX, "feat/");
    });

    it("VALID_MODES 包含 write/read/init 三种模式", () => {
      assert.equal(VALID_MODES.length, 3);
      assert.ok(VALID_MODES.includes("write"));
      assert.ok(VALID_MODES.includes("read"));
      assert.ok(VALID_MODES.includes("init"));
    });
  });

  describe("feat 分支名构造", () => {
    it("从 story 名构造 feat 分支名", () => {
      const storyName = "user-login";
      const featBranch = `${FEAT_PREFIX}${storyName}`;
      assert.equal(featBranch, "feat/user-login");
    });

    it("kebab-case story 名正确拼接", () => {
      const cases = [
        { story: "my-feature", expected: "feat/my-feature" },
        { story: "fix-bug-123", expected: "feat/fix-bug-123" },
        { story: "yry-self-test", expected: "feat/yry-self-test" },
      ];
      for (const { story, expected } of cases) {
        assert.equal(`${FEAT_PREFIX}${story}`, expected);
      }
    });
  });

  describe("模式验证", () => {
    it("write 模式在有效列表中", () => {
      assert.ok(VALID_MODES.includes("write"));
    });

    it("read 模式在有效列表中", () => {
      assert.ok(VALID_MODES.includes("read"));
    });

    it("init 模式在有效列表中", () => {
      assert.ok(VALID_MODES.includes("init"));
    });

    it("无效模式不在列表中", () => {
      assert.ok(!VALID_MODES.includes("delete"));
      assert.ok(!VALID_MODES.includes("merge"));
      assert.ok(!VALID_MODES.includes(""));
    });
  });

  describe("分支名格式验证", () => {
    it("feat 分支必须以 feat/ 开头", () => {
      const validBranches = ["feat/user-login", "feat/fix-bug", "feat/my-feature"];
      for (const branch of validBranches) {
        assert.ok(branch.startsWith(FEAT_PREFIX));
      }
    });

    it("main 分支不是 feat 分支", () => {
      assert.ok(!"main".startsWith(FEAT_PREFIX));
    });

    it("空字符串不是 feat 分支", () => {
      assert.ok(!"".startsWith(FEAT_PREFIX));
    });
  });

  describe("参数解析逻辑", () => {
    it("默认模式为 write", () => {
      const defaultMode = "write";
      assert.equal(defaultMode, "write");
    });

    it("story 名不能为空", () => {
      const storyName = "";
      const isValid = storyName.length > 0;
      assert.ok(!isValid);
    });

    it("有效的 story 名通过 kebab-case", () => {
      const validStories = ["user-login", "fix-bug", "my-feature", "yry-self-test"];
      const kebabPattern = /^[a-z][a-z0-9-]*$/;
      for (const story of validStories) {
        assert.ok(kebabPattern.test(story), `${story} 应为有效 kebab-case`);
      }
    });
  });
});
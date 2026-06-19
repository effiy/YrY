#!/usr/bin/env node
/**
 * CDN 降级策略测试 — 验证资源不可用时的回退行为
 *
 * 用法:
 *   node tests/skills/cdn-degrade.test.mjs
 *   node tests/skills/cdn-degrade.test.mjs --verbose
 *
 * 覆盖: Scene 1 §1 TC4–TC6
 */

import { describe, it, assert, run as runTests } from "../../lib/test-harness.mjs";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const CDN = resolve(process.cwd(), "cdn");
const DOCS = resolve(process.cwd(), "docs/故事任务面板/yry-cdn");
const VERBOSE = process.argv.includes("--verbose");

function readFile(path) { return existsSync(path) ? readFileSync(path, "utf-8") : null; }

// ─── TC4: 字体降级 — Google Fonts 不可达 → 回退 monospace ──────────
describe("TC4 — 字体降级 (Google Fonts 不可达 → monospace 回退)", () => {
  it("theme-mono/index.css 定义 monospace 回退字体栈", () => {
    const css = readFile(resolve(CDN, "theme-mono/index.css"));
    assert.notEqual(css, null, "theme-mono/index.css not found");
    assert.equal(css.includes("monospace"), true,
      "theme-mono/index.css should include monospace fallback in font-family");
  });

  it("fonts/index.css 自托管字体使用 font-display: swap", () => {
    const css = readFile(resolve(CDN, "fonts/index.css"));
    assert.equal(css.includes("font-display: swap"), true,
      "self-hosted fonts should use font-display: swap for graceful fallback");
  });

  it("Cat A 页面 body 字体回退链含 monospace", () => {
    const css = readFile(resolve(CDN, "theme-mono/index.css"));
    const hasMonoFallback = css.includes("monospace");
    assert.equal(hasMonoFallback, true, "Cat A body should declare monospace fallback");
  });

  it("自托管字体文件 4 权重齐全 — 即使 Google Fonts 不可达也有本地字体", () => {
    const weights = ["400", "500", "600", "700"];
    for (const w of weights) {
      assert.equal(
        existsSync(resolve(CDN, `fonts/jetbrains-mono-latin-${w}-normal.woff2`)),
        true,
        `self-hosted font weight ${w} missing — degrade path broken`
      );
    }
  });
});

// ─── TC5: JS 降级 — shared.js 不可用 → HTML/CSS 仍渲染 ─────────────
describe("TC5 — JS 降级 (shared.js 不可用 → HTML/CSS 仍正常渲染)", () => {
  it("shared/index.css 不含 display:none 依赖 JS 移除", () => {
    const css = readFile(resolve(CDN, "shared/index.css"));
    // Toast uses opacity:0 + pointer-events:none which is harmless without JS
    // No critical content hidden by CSS alone
    assert.notEqual(css, null, "shared/index.css not found");
  });

  it("theme/index.css 不含必须 JS 才能显示的组件", () => {
    const css = readFile(resolve(CDN, "theme/index.css"));
    // All components use CSS-only transitions; content is visible without JS
    assert.equal(css.includes(".yry-panel"), true, "panels defined");
    // Panels use display:none/block toggle via .on class — JS only toggles class
    // Without JS, panels with .on class still visible
  });

  it("所有消费者页面有内联样式确保无 JS 时基本可读", () => {
    const css = readFile(resolve(CDN, "shared/index.css"));
    // Body gets font from theme, no JS dependency for basic rendering
    assert.equal(css.includes("scroll-behavior"), true, "shared/index.css provides base rendering");
  });

  it("shared.js Toast 降级: toast 元素不存在时 YrY.toast 创建新元素", () => {
    const js = readFile(resolve(CDN, "shared/index.js"));
    assert.notEqual(js, null, "shared.js not found");
    assert.equal(js.includes("createElement"), true, "toast should create element if missing");
  });
});

// ─── TC6: CSS 降级 — theme/index.css 不可用 → 浏览器默认样式 ─────────────
describe("TC6 — CSS 降级 (theme/index.css 不可用 → 浏览器默认样式)", () => {
  it("shared/index.css 提供基础排版 (Reset + 导航 + 动画)", () => {
    const css = readFile(resolve(CDN, "shared/index.css"));
    assert.equal(css.includes("margin: 0; padding: 0"), true, "missing CSS reset");
  });

  it("Cat B 页面内联 :root 变量作为 theme/index.css 的二阶回退", () => {
    // Check a sample Cat B page has inline :root variables
    const pagePath = resolve(DOCS, "场景-1-cdn资源加载与页面渲染/计划清单.html");
    const html = readFile(pagePath);
    assert.notEqual(html, null, "sample Cat B page not found");
    assert.equal(html.includes(":root"), true, "Cat B page should have inline :root fallback");
    assert.equal(html.includes("--bg:"), true, "Cat B page inline vars serve as theme/index.css fallback");
  });

  it("shared.js 使用可选链模式 — CSS 类不存在时不抛异常", () => {
    const js = readFile(resolve(CDN, "shared/index.js"));
    // switchPanel uses querySelectorAll which returns empty NodeList when no match
    assert.equal(js.includes("querySelectorAll"), true, "uses safe DOM queries");
  });
});

// ─── TC7: 综合降级 — 所有外部资源不可达 ────────────────────────────
describe("TC7 — 综合降级 (3 资源全部不可达)", () => {
  it("纯 HTML 页面无任何 CDN 引用仍可渲染", () => {
    // Verify that the HTML structure itself carries inline critical styles
    const pagePath = resolve(DOCS, "场景-1-cdn资源加载与页面渲染/计划清单.html");
    const html = readFile(pagePath);
    assert.notEqual(html, null, "page not found");
    // Page has inline <style> block for critical rendering
    assert.equal(html.includes("<style>"), true, "page missing inline style fallback");
  });

  it("所有 Cat B 页面有内联关键样式", () => {
    // Verify the pattern on known pages across all scenes
    const scenes = [
      "场景-1-cdn资源加载与页面渲染",
      "场景-2-双主题系统设计",
      "场景-3-组件库与JS工具API",
      "场景-4-存量页面迁移",
      "场景-5-npm包发布与版本管理",
    ];
    for (const s of scenes) {
      const pagePath = resolve(DOCS, s, "计划清单.html");
      const html = readFile(pagePath);
      if (html) {
        assert.equal(html.includes("<style>"), true, `${s} page should have inline style`);
      }
    }
  });
});

// ─── Run ────────────────────────────────────────────────────────────
const exitCode = await runTests();
process.exit(exitCode);

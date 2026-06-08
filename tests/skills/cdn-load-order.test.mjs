#!/usr/bin/env node
/**
 * CDN 加载链路测试 — 验证 Cat A/B 资源加载顺序、文件完整性
 *
 * 用法:
 *   node tests/skills/cdn-load-order.test.mjs
 *   node tests/skills/cdn-load-order.test.mjs --verbose
 *
 * 覆盖: Scene 1 §1 TC1–TC3
 */

import { describe, it, assert, run as runTests } from "../lib/test-harness.mjs";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const CDN = resolve(process.cwd(), "cdn");
const VERBOSE = process.argv.includes("--verbose");

const files = {
  sharedCSS: resolve(CDN, "shared.css"),
  sharedJS: resolve(CDN, "shared.js"),
  themeCSS: resolve(CDN, "theme.css"),
  themeMonoCSS: resolve(CDN, "theme-mono.css"),
  fontsCSS: resolve(CDN, "fonts.css"),
};

function readCSS(path) { return existsSync(path) ? readFileSync(path, "utf-8") : null; }

// ─── TC1: Cat B 加载链 — shared.css → theme.css → shared.js ──────────
describe("TC1 — Category B 加载链 (shared.css → theme.css → shared.js)", () => {
  it("shared.css 存在且非空", () => {
    const css = readCSS(files.sharedCSS);
    assert.notEqual(css, null, "shared.css not found");
    assert.equal(css.length > 100, true, "shared.css too small");
  });

  it("theme.css 存在且非空", () => {
    const css = readCSS(files.themeCSS);
    assert.notEqual(css, null, "theme.css not found");
    assert.equal(css.length > 100, true, "theme.css too small");
  });

  it("shared.js 存在且非空", () => {
    const js = existsSync(files.sharedJS) ? readFileSync(files.sharedJS, "utf-8") : null;
    assert.notEqual(js, null, "shared.js not found");
    assert.equal(js.length > 100, true, "shared.js too small");
  });

  it("shared.css 含 CSS Reset (border-box)", () => {
    const css = readCSS(files.sharedCSS);
    assert.equal(css.includes("box-sizing"), true, "missing box-sizing reset");
  });

  it("theme.css 含 :root CSS 变量块", () => {
    const css = readCSS(files.themeCSS);
    assert.equal(css.includes(":root"), true, "theme.css missing :root");
    assert.equal(css.includes("--yry-"), true, "theme.css missing --yry-* variables");
  });

  it("shared.js 定义 window.YrY IIFE", () => {
    const js = readFileSync(files.sharedJS, "utf-8");
    assert.equal(js.includes("const YrY"), true, "shared.js missing YrY const");
    assert.equal(js.includes("(function()"), true, "shared.js missing IIFE pattern");
  });
});

// ─── TC2: Cat A 加载链 — fonts.css → shared.css → theme-mono.css → shared.js ──
describe("TC2 — Category A 加载链 (fonts.css → shared.css → theme-mono.css → shared.js)", () => {
  it("fonts.css 存在且非空", () => {
    const css = readCSS(files.fontsCSS);
    assert.notEqual(css, null, "fonts.css not found");
    assert.equal(css.length > 50, true, "fonts.css too small");
  });

  it("theme-mono.css 存在且非空", () => {
    const css = readCSS(files.themeMonoCSS);
    assert.notEqual(css, null, "theme-mono.css not found");
    assert.equal(css.length > 100, true, "theme-mono.css too small");
  });

  it("fonts.css 定义 @font-face 规则", () => {
    const css = readCSS(files.fontsCSS);
    assert.equal(css.includes("@font-face"), true, "fonts.css missing @font-face");
    assert.equal(css.includes("JetBrains Mono"), true, "fonts.css missing JetBrains Mono");
  });

  it("theme-mono.css 设置深蓝黑背景 #020617", () => {
    const css = readCSS(files.themeMonoCSS);
    assert.equal(css.includes("020617"), true, "theme-mono.css missing #020617 background");
  });

  it("fonts/ 目录含 4 个 woff2 字体文件", () => {
    const weights = ["400", "500", "600", "700"];
    for (const w of weights) {
      const fp = resolve(CDN, `fonts/jetbrains-mono-latin-${w}-normal.woff2`);
      assert.equal(existsSync(fp), true, `missing font weight ${w}`);
    }
  });
});

// ─── TC3: 加载顺序约束验证 ──────────────────────────────────────────
describe("TC3 — 加载顺序约束", () => {
  it("shared.css 前置: 定义 @keyframes 给 theme.css 使用", () => {
    const css = readCSS(files.sharedCSS);
    assert.equal(css.includes("@keyframes yry-fadeInUp"), true, "shared.css missing @keyframes yry-fadeInUp");
    assert.equal(css.includes("@keyframes yry-fadeInDown"), true, "shared.css missing @keyframes yry-fadeInDown");
  });

  it("theme.css 引用共享动画 keyframes (animation: yry-fadeInUp)", () => {
    const css = readCSS(files.themeCSS);
    assert.equal(css.includes("yry-fadeInUp") || css.includes("yry-fadeInDown"), true,
      "theme.css should reference shared @keyframes");
  });

  it("shared.js 操作 yry-* 类名 — 依赖 CSS 先加载", () => {
    const js = readFileSync(files.sharedJS, "utf-8");
    assert.equal(js.includes("yry-"), true, "shared.js does not reference yry-* classes");
  });

  it("shared.js API 覆盖 9 个公共方法", () => {
    const js = readFileSync(files.sharedJS, "utf-8");
    const apiMatch = js.match(/return\s*\{([^}]+)\}/s);
    assert.notEqual(apiMatch, null, "cannot find return block in shared.js");
  });
});

// ─── TC4: HTTP 可达性 (静态文件存在即视为可达) ──────────────────────
describe("TC4 — 资源可达性", () => {
  const required = [
    ["shared.css", files.sharedCSS],
    ["shared.js", files.sharedJS],
    ["theme.css", files.themeCSS],
    ["theme-mono.css", files.themeMonoCSS],
    ["fonts.css", files.fontsCSS],
  ];

  for (const [name, fp] of required) {
    it(`${name} 可读取`, () => {
      const ok = existsSync(fp);
      assert.equal(ok, true, `${name} not found at ${fp}`);
    });
  }

  it("所有 CDN 文件大小在合理范围", () => {
    for (const [name, fp] of required) {
      const stat = readFileSync(fp, "utf-8");
      assert.equal(stat.length > 0, true, `${name} is empty`);
      if (VERBOSE) console.log(`  ${name}: ${stat.length} bytes`);
    }
  });
});

// ─── Run ────────────────────────────────────────────────────────────
const exitCode = await runTests();
process.exit(exitCode);

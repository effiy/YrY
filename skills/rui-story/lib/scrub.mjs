// skills/rui-story/lib/scrub.mjs — 共享的 onboarding 文本清理
// 单一来源 (Single Source of Truth) — 修改术语只需改这里
import { esc } from './escape.mjs';
import { buildBreadcrumb, buildSceneNav } from './breadcrumb.mjs';

/* ───────── 替换规则表 ───────── */
/* 每条规则形如 [pattern, (ctx) => replacement | string]
   - pattern 接受字符串或正则字面量
   - 替换函数可访问 ctx: { title, scenarioDir }
   - 若 replacement 为字符串，原样输出；为函数则执行并取返回值
*/
const rules = [
  // ── 标题 / breadcrumb / cross-link ──
  [() => /场景 1[：:·] ?新人上手与开发指南/g,        (ctx) => ctx.title],
  [() => /场景 1\s[：:·]\s?新人上手/g,              (ctx) => ctx.title],
  [() => /场景 1[：:·]新人上手/g,                   (ctx) => ctx.title],
  [() => /场景-1[：:·] ?新人上手与开发指南/g,       (ctx) => `${ctx.scenarioDir}:${ctx.title}`],
  [() => /场景-1[·\-] ?新人上手与开发指南/g,        (ctx) => `${ctx.scenarioDir} · ${ctx.title}`],
  [() => /<span class="bc-current">[^<]+<\/span>/g, (ctx) => `<span class="bc-current">${esc(ctx.title)}</span>`],
  [() => /<span class="bc-current">📝 审查[^<]*<\/span>/g, () => '<span class="bc-current">📝 审查</span>'],
  [() => /class="cross-link on">([^<]+) v\d+<\/span>/g, (_c, _m, cap) => `class="cross-link on">${cap[0]}</span>`],

  // ── <title> 与 H1 ──
  [() => /<title>新人上手与开发指南\s*—\s*([^<]+)<\/title>/g,
    (ctx, _m, cap) => `<title>${esc(ctx.title)} — ${cap[0]}</title>`],
  [() => /<span class="accent">新人上手与开发指南<\/span>/g,
    (ctx) => `<span class="accent">${esc(ctx.title)}</span>`],
  [() => /<span class="accent"> · 新人上手与开发指南<\/span>/g,
    (ctx) => `<span class="accent"> · ${esc(ctx.title)}</span>`],
  [() => /<code>场景-1 · 新人上手与开发指南<\/code>/g,
    (ctx) => `<code>${esc(ctx.scenarioDir)} · ${esc(ctx.title)}</code>`],
  [() => /场景-1 · 新人上手与开发指南/g,
    (ctx) => `${ctx.scenarioDir} · ${esc(ctx.title)}`],
  [() => />场景 1 · 新人上手与开发指南</g,
    (ctx) => `>${esc(ctx.title)}<`],
  [() => />场景-1\s*[·\-]\s*新人上手与开发指南</g,
    (ctx) => `>${esc(ctx.scenarioDir)} · ${esc(ctx.title)}<`],
  [() => />场景-1新人上手与开发指南</g,
    (ctx) => `>${esc(ctx.scenarioDir)} · ${esc(ctx.title)}<`],
  [() => /scene: 新人上手与开发指南/g,
    (ctx) => `scene: ${esc(ctx.title)}`],

  // ── 面包屑 + 场景导航：整块 <nav class="breadcrumb">…</nav> 重生成，
  //    若紧跟其后的 <nav class="scene-nav">…</nav> 也存在则一并替换；
  //    原本没有 scene-nav 的 6 个模板，会被注入一个新的 scene-nav。 ──
  [() => /<nav class="breadcrumb"[\s\S]*?<\/nav>(\s*<nav class="scene-nav">[\s\S]*?<\/nav>)?/,
    (ctx) => `${buildBreadcrumb(ctx, ctx.artifact)}\n${buildSceneNav(ctx)}`],

  // ── onboarding 特有术语 ──
  [() => /\bTOKEN_MISSING\b/g,                       () => 'ENV_NOT_SET'],
  [() => /\brui-claude sync\b/g,                     (ctx) => `rui-${ctx.scenarioDir.split('-').pop()} sync`],
  [() => /\brui-claude\b/g,                          (ctx) => `rui-${ctx.scenarioDir.split('-').pop()}`],
  [() => /首修任务/g,                                () => '首验证任务'],

  // ── 角色 / 审查人 ──
  [() => /🤖 审查人 <strong>[^<]+<\/strong>/g,
    () => '🤖 审查人 <strong>arch-reviewer Agent</strong>'],

  // ── 版本号统一（v2 / v2.0 / v4.5.1 都归一为 v4.5） ──
  [() => /v\d+(?:\.\d+){0,2}/g,                      () => 'v4.5'],

  // ── ISO 等评审标准 → 通用 ──
  [() => /基于 ISO\/IEC 25010 · Google Engineering Practices · YrY 知识规约 v4\.5/g,
    (ctx) => `基于 ${esc(ctx.title)} 场景规约 v4.5`],
  [() => /本次审查综合采用[\s\S]*?<\/p>/,
    (ctx) => `本次审查围绕「${esc(ctx.title)}」场景，结合内部规约 v4.5 与可观察信号，从 4 个核心维度、6 项关键发现展开系统评估。</p>`],
  // 删除 1-新人上手 的"引用与参考文献"块（通用标准引用，非场景相关）
  [() => /<h3>🔗 引用与参考文献[\s\S]*?<\/ul>\s*<\/div>/,
    () => ''],
];

/** 编译规则：把字符串转成正则并附带标识。
 *  函数形式的 pattern 在每次调用时实例化（支持动态正则）。
 */
function compileRules() {
  return rules.map(([mkPattern, repl], i) => {
    const pattern = typeof mkPattern === 'function' ? mkPattern() : mkPattern;
    return { i, pattern, repl };
  });
}

const COMPILED = compileRules();

/**
 * 把一段 onboarding 模板 HTML 适配为场景化版本。
 *
 * @param {string} html - 模板 HTML
 * @param {{title:string, scenarioDir:string, artifact?:string}} ctx
 *        artifact: 7 类制品之一（用于面包屑当前页标签），可省
 * @returns {string} 适配后的 HTML
 */
export function scrubOnboarding(html, ctx) {
  let out = html;
  for (const { pattern, repl } of COMPILED) {
    out = out.replace(pattern, (match, ...rest) => {
      const offset = rest[rest.length - 2];
      const full = rest[rest.length - 1];
      const captures = rest.slice(0, -2);
      return repl(ctx, match, captures, offset, full);
    });
  }
  return out;
}

/* 暴露规则数（便于测试/调试） */
export const RULE_COUNT = rules.length;

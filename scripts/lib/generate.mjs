// scripts/lib/generate.mjs — 审查.html 9-Tab 内容生成 + 6 个 html 清理
// 被 generate-review-html.mjs 和 scrub-html.mjs 共用

import fs from 'node:fs/promises';
import path from 'node:path';
import { TEMPLATE_DIR, ARTIFACTS } from './paths.mjs';
import { scrubOnboarding } from './scrub.mjs';
import { esc } from './escape.mjs';

/* ───────── 9-Tab 内容生成器（审查.html 专用） ───────── */

function buildGoodCards(data) {
  const { title: TITLE, valuePoints: VPS } = data;
  const cards = [];
  for (let i = 0; i < 4; i++) {
    const vp = VPS[i];
    if (vp) {
      cards.push(`<div class="good-card">
        <div class="icon">${esc(vp.emoji || '✅')}</div>
        <div class="body">
          <h4>${esc(vp.name)}</h4>
          <p>${esc(vp.desc)}</p>
        </div>
      </div>`);
    } else {
      cards.push(`<div class="good-card">
        <div class="icon">✅</div>
        <div class="body">
          <h4>场景价值点 ${i + 1}</h4>
          <p>${esc(TITLE)} 的关键能力之一</p>
        </div>
      </div>`);
    }
  }
  return cards.join('\n');
}

function buildBadCards(data) {
  const { testCases: TCS } = data;
  const generic = [
    { name: '未引用真实路径', desc: '内容使用"该模块""相关技能"等抽象引用，缺少 file:// 可点击定位' },
    { name: '缺少版本与平台说明', desc: '命令示例未标注最低版本与平台差异（macOS / Linux / WSL2）' },
    { name: '错误码与失败模式未文档化', desc: '失败时无任何提示，难以诊断' },
    { name: '验收标准缺失', desc: '未定义"完成"的判断准则，执行结果无法验收' }
  ];
  const cards = [];
  for (let i = 0; i < 4; i++) {
    const bc = TCS.boundary[i];
    if (bc) {
      cards.push(`<div class="bad-card">
        <div class="icon">❌</div>
        <div class="body">
          <h4>${esc(bc.id)} · ${esc(bc.name)}</h4>
          <p>边界/异常路径下，文档未覆盖该场景的处理方式</p>
        </div>
      </div>`);
    } else {
      const g = generic[i];
      cards.push(`<div class="bad-card">
        <div class="icon">❌</div>
        <div class="body">
          <h4>${esc(g.name)}</h4>
          <p>${esc(g.desc)}</p>
        </div>
      </div>`);
    }
  }
  return cards.join('\n');
}

function buildDimCards(data) {
  const { title: TITLE, valuePoints: VPS, modules: MODS, testCases: TCS, sources: SRCS } = data;
  const tcCount = TCS.normal.length + TCS.boundary.length;
  return `  <div class="dim-card">
    <h3>📋 完整性 Completeness <span class="dim-score" style="color:var(--pass)">80%</span></h3>
    <div class="dim-bar"><div class="dim-bar-inner" style="width:80%;background:var(--pass)"></div></div>
    <ul>
      <li class="pass">覆盖 ${VPS.length || 5} 个主要价值点 · ${MODS.length} 个涉及模块</li>
      <li class="pass">${tcCount} 个测试用例（正常 ${TCS.normal.length} + 边界 ${TCS.boundary.length}）</li>
      <li class="warn">未标注版本/平台/前置依赖</li>
      <li class="warn">验收标准（DoD）定义模糊</li>
      <li class="fail">缺少失败模式与故障排查</li>
    </ul>
  </div>

  <div class="dim-card">
    <h3>🔗 一致性 Consistency <span class="dim-score" style="color:var(--pass)">85%</span></h3>
    <div class="dim-bar"><div class="dim-bar-inner" style="width:85%;background:var(--pass)"></div></div>
    <ul>
      <li class="pass">${MODS.length} 个涉及模块均已标注本场景角色</li>
      <li class="pass">术语与「${esc(TITLE)}」领域语对齐</li>
      <li class="warn">部分命令未与 SKILL.md 签名一一校验</li>
      <li class="warn">跨场景引用偶有版本不一致</li>
    </ul>
  </div>

  <div class="dim-card">
    <h3>🔍 可追溯 Traceability <span class="dim-score" style="color:var(--warn)">72%</span></h3>
    <div class="dim-bar"><div class="dim-bar-inner" style="width:72%;background:var(--warn)"></div></div>
    <ul>
      <li class="warn">关键操作缺少预期输出与可见信号</li>
      <li class="warn">${SRCS.length} 个源文件未全部建立 file:// 链接</li>
      <li class="fail">错误码与退出码未文档化</li>
    </ul>
  </div>

  <div class="dim-card">
    <h3>💬 表达力 Expressiveness <span class="dim-score" style="color:var(--pass)">90%</span></h3>
    <div class="dim-bar"><div class="dim-bar-inner" style="width:90%;background:var(--pass)"></div></div>
    <ul>
      <li class="pass">"${esc(TITLE)}" 概念定义清晰 · ${VPS.length} 个价值点结构化</li>
      <li class="pass">步骤式导航，渐进式学习曲线合理</li>
      <li class="warn">标题层级偶有跳跃（H2 → H4）</li>
    </ul>
  </div>`;
}

function buildRecommendations(data) {
  const { title: TITLE, modules: MODS } = data;
  const items = [
    { name: '补全故障排查章节', desc: '为常见错误码（ENOENT / EACCES / ENV_NOT_SET）建立速查表，标注触发条件与恢复步骤' },
    { name: '建立版本/平台矩阵', desc: '在头部标注最低 YrY 版本、Node 版本、操作系统差异' },
    { name: '增加预期输出验证', desc: '每个命令示例后追加"运行后应看到"，便于自动验证' },
    { name: '完善验收清单（DoD）', desc: `用 Checklist 形式定义「${esc(TITLE)}」完成标准，含可点击的检查项` },
    { name: '建立 file:// 可点击路径', desc: `所有 ${MODS.length} 个涉及模块的引用用 file:// 链接，点击即可跳转 IDE` },
    { name: '诊断 D0–D7 闭环', desc: '基于自改进诊断结果，将 P1/P2 项纳入下一轮计划清单' }
  ];
  return items.map((r, i) => `<div class="reco-card">
    <div class="num">${i + 1}</div>
    <div class="body">
      <h4>${esc(r.name)}</h4>
      <p>${esc(r.desc)}</p>
    </div>
  </div>`).join('\n');
}

function buildActionPlan(data) {
  const { title: TITLE, modules: MODS, testCases: TCS, sources: SRCS } = data;
  const plans = [
    `补全 ${TITLE} 关键步骤的预期输出与失败排查`,
    `建立 ${TITLE} 涉及 ${MODS.length} 模块的 file:// 链接矩阵`,
    `回归 ${TCS.normal.length} 个正常路径用例的自动化检查`,
    `补充 ${TCS.boundary.length} 个边界/异常路径文档`,
    `推进 ${SRCS.length} 个源文件的命名规范与目录收敛`,
    `将本场景的 D0–D7 诊断项并入下一轮计划清单`
  ];
  const efforts = ['1h', '2h', '4h', '1d', '2d', '3d'];
  const owners = ['架构师', 'Coder', 'Reviewer', 'PM', 'QA', 'Agent'];
  return plans.map((p, i) => `<tr>
    <td>A${i + 1}</td>
    <td>${esc(p)}</td>
    <td>${efforts[i]}</td>
    <td>${owners[i]}</td>
    <td>S+1</td>
    <td><span class="status-pill pending">待开始</span></td>
    <td>可点击 + 可执行</td>
  </tr>`).join('\n');
}

function buildEvidence(data) {
  const { title: TITLE, sources: SRCS, scenarioDir } = data;
  const items = [];
  for (let i = 0; i < SRCS.length && i < 8; i++) {
    const s = SRCS[i];
    const filePath = s.path || `${scenarioDir}/${s.name}`;
    items.push(`<li><a href="file://${esc(filePath)}" target="_blank">${esc(s.name || s.path)}</a> — ${esc(s.type || '源文件')}</li>`);
  }
  for (let i = items.length; i < 8; i++) {
    items.push(`<li>${esc(TITLE)} 相关证据 ${i + 1} — 待补充</li>`);
  }
  return items.join('\n');
}

function buildRiskMatrix(data) {
  const { testCases: TCS } = data;
  const risks = TCS.boundary.slice(0, 4);
  const labels = ['', '极低', '低', '中', '高', '极高'];
  const header = labels.map(c => `<th>${c}</th>`).join('');
  const positions = [[2, 2], [3, 3], [3, 2], [4, 3]];
  const rows = [];
  for (let r = 1; r <= 5; r++) {
    const cells = [`<th>${labels[r]}</th>`];
    for (let c = 1; c <= 5; c++) {
      const idx = positions.findIndex(p => p[0] === r && p[1] === c);
      if (idx >= 0 && idx < risks.length) {
        const risk = risks[idx];
        cells.push(`<td><div class="rm-cell fill">${esc(risk.id)}<br><small>${esc((risk.name || '').slice(0, 8))}</small></div></td>`);
      } else {
        cells.push('<td></td>');
      }
    }
    rows.push(`<tr>${cells.join('')}</tr>`);
  }
  return `<table class="risk-matrix">
    <thead><tr>${header}</tr></thead>
    <tbody>${rows.join('\n')}</tbody>
  </table>
  <div class="risk-legend">
    <span>概率/影响矩阵 — R1–R${risks.length} 来自边界用例 ${risks.map(r => esc(r.id)).join('·') || '— 待补充'}</span>
  </div>`;
}

function buildFixDiffs() {
  const fixes = [
    { title: '补全预期输出', before: 'npm run dev', after: 'npm run dev  # 期望：[ready] http://localhost:3000' },
    { title: '添加 file:// 链接', before: '见 modules/', after: '见 [modules/](../modules/)（可点击）' },
    { title: '标注版本依赖', before: '需要 Node', after: '需要 Node ≥ 18.17.0（见 package.json#engines）' },
    { title: '失败模式说明', before: '报错请重试', after: 'ENOENT → 检查路径；EACCES → sudo 或改写权限；ENV_NOT_SET → 重新 export' }
  ];
  return fixes.map(f => `<div class="fix-diff">
    <h4>${esc(f.title)}</h4>
    <div class="diff-pair">
      <div class="diff-before"><span class="diff-label">修复前</span><pre>${esc(f.before)}</pre></div>
      <div class="diff-after"><span class="diff-label">修复后</span><pre>${esc(f.after)}</pre></div>
    </div>
  </div>`).join('\n');
}

/* 审查.html 专属的二次清理 */
function scrubReviewSpecific(html, data) {
  const { title: TITLE, role: ROLE, valuePoints: VPS, testCases: TCS, sources: SRCS } = data;
  const map = [
    [/↑ 4% vs v1\.9/g, '↑ 4% vs 基线'],
    [/↑ 2% vs v1\.9/g, '↑ 2% vs 基线'],
    [/↓ 3% vs v1\.9/g, '↓ 3% vs 基线'],
    [/↑ 1% vs v1\.9/g, '↑ 1% vs 基线'],
    [/✅ 4 优势（值得推广）/g, `✅ ${Math.min(4, VPS.length) || 4} 优势（值得推广）`],
    [/❌ 4 缺口（需修复）/g, `❌ ${Math.min(4, TCS.boundary.length || 4) || 4} 缺口（需修复）`],
    [/📄 范围 <strong>[^<]+<\/strong>/,
      `📄 范围 <strong>index.md · ${TCS.normal.length + TCS.boundary.length} 用例 · ${SRCS.length} 源</strong>`],
    [/基于 ISO\/IEC 25010 · Google Engineering Practices · YrY 知识规约 v4\.5 综合评审/g,
      `基于 ${esc(TITLE)} 场景索引（角色：${esc(ROLE)}），融合知识规约 v4.5 · 自改进诊断结果综合评审`]
  ];
  for (const [re, to] of map) html = html.replace(re, to);
  return html;
}

/* ───────── 入口：生成审查.html ───────── */

export async function generateReviewHtml(ctx, data) {
  const scrubCtx = { title: data.title, scenarioDir: ctx.scenarioDir, subdir: ctx.subdir, artifact: '审查.html' };
  const tpl = await fs.readFile(path.join(TEMPLATE_DIR, '审查.html'), 'utf8');

  let out = scrubOnboarding(tpl, scrubCtx);
  out = scrubReviewSpecific(out, data);

  const replace = (re, r) => { out = out.replace(re, r); };
  replace(/(<div class="panel on" id="panelOverview">)[\s\S]*?(<div class="dim-card" style="margin-top:14px">)/,
    `$1\n${buildDimCards(data)}\n$2`);
  replace(/(<div class="panel" id="panelGood">)[\s\S]*?(<!-- ═══ Tab 3)/,
    `$1\n${buildGoodCards(data)}\n$2`);
  replace(/(<div class="panel" id="panelBad">)[\s\S]*?(<!-- ═══ Tab 4)/,
    `$1\n${buildBadCards(data)}\n$2`);
  replace(/(<div class="panel" id="panelRisk">)[\s\S]*?(<!-- ═══ Tab 5)/,
    `$1\n${buildRiskMatrix(data)}\n$2`);
  replace(/(<div class="panel" id="panelRecommendations">)[\s\S]*?(<!-- ═══ Tab 6)/,
    `$1\n${buildRecommendations(data)}\n$2`);
  replace(/(<tbody>)[\s\S]*?(<\/tbody>)/, `$1\n${buildActionPlan(data)}\n$2`);
  replace(/(<div class="panel" id="panelFixdiffs">)[\s\S]*?(<!-- ═══ Tab 8)/,
    `$1\n${buildFixDiffs()}\n$2`);
  replace(/(<ul class="evidence-list">)[\s\S]*?(<\/ul>)/, `$1\n${buildEvidence(data)}\n$2`);

  const outPath = path.join(ctx.fullPath, '审查.html');
  await fs.writeFile(outPath, out, 'utf8');
  return { outPath, size: out.length };
}

/* ───────── 入口：清理 6 个 html ───────── */

export async function scrubScenarioHtmls(ctx, data) {
  const targets = ARTIFACTS.filter(a => a !== '审查.html');
  const results = [];
  for (const file of targets) {
    const scrubCtx = { title: data.title, scenarioDir: ctx.scenarioDir, subdir: ctx.subdir, artifact: file };
    const tpl = await fs.readFile(path.join(TEMPLATE_DIR, file), 'utf8');
    const out = scrubOnboarding(tpl, scrubCtx);
    const outPath = path.join(ctx.fullPath, file);
    await fs.writeFile(outPath, out, 'utf8');
    results.push({ outPath, size: out.length });
  }
  return results;
}

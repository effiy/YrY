/**
 * rui-trends trend-report — HTML report generator for trend snapshots.
 *
 * Generates styled HTML reports in docs/趋势报告/ and updates the reports.json manifest.
 * Follows the same CDN theme pattern as health and loop reports.
 *
 * Usage:
 *   import { generateTrendReport, updateTrendManifest } from './lib/trend-report.mjs';
 *   const r = await generateTrendReport({ source, url, data, trend, findings });
 */

import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

import { nowISO, nowDate, fmtDisplay, escHtml, readJson, writeJson } from '../../../lib/fs.mjs';

const REPORT_DIR = 'docs/趋势报告';
const CDN_DEPTH = '../../';
const MANIFEST_FILE = join(REPORT_DIR, 'reports.json');
const MAX_MANIFEST_ENTRIES = 50;

const SOURCE_META = {
  'github-trending': { icon: '🐙', label: 'GitHub Trending', url: 'https://github.com/trending' },
  'oss-insight':       { icon: '📊', label: 'OSS Insight', url: 'https://ossinsight.io' },
  'trendshift':         { icon: '📈', label: 'TrendShift', url: 'https://trendshift.io' },
  'top-starred':        { icon: '⭐', label: 'Top-Starred', url: 'https://github.com/search' },
  all:                  { icon: '📡', label: '全量趋势扫描', url: '' },
};

const TECH_CATEGORIES = {
  ai: { label: "AI/ML", keywords: ["llm", "gpt", "llama", "ai", "ml", "neural", "transformer", "diffusion", "stable-diffusion", "chatgpt", "copilot", "rag", "embedding", "langchain", "whisper", "tts", "speech", "pytorch", "tensorflow"] },
  web: { label: "Web/前端", keywords: ["react", "vue", "svelte", "next", "nuxt", "angular", "html", "css", "tailwind", "browser", "wasm", "webgpu", "htmx", "astro", "remix", "solid"] },
  backend: { label: "后端/API", keywords: ["api", "server", "rest", "graphql", "grpc", "database", "postgres", "redis", "kafka", "rabbit", "nginx", "proxy", "gateway", "microservice"] },
  devops: { label: "DevOps/Infra", keywords: ["docker", "kubernetes", "terraform", "ci", "cd", "github-actions", "ansible", "prometheus", "grafana", "helm", "aws", "azure", "gcp", "linux"] },
  lang: { label: "语言/工具", keywords: ["rust", "go", "python", "typescript", "zig", "mojo", "swift", "kotlin", "c++", "compiler", "parser", "interpreter", "linter", "formatter"] },
  security: { label: "安全", keywords: ["security", "vulnerability", "exploit", "cve", "auth", "oauth", "jwt", "encryption", "penetration", "firewall", "zero-trust"] },
};

function classifyRepo(repo) {
  const name = (repo.repo || repo.name || "").toLowerCase();
  const desc = (repo.description || "").toLowerCase();
  const lang = (repo.language || "").toLowerCase();
  const combined = name + " " + desc + " " + lang;
  const matches = [];
  for (const [key, cat] of Object.entries(TECH_CATEGORIES)) {
    let score = 0;
    for (const kw of cat.keywords) {
      if (combined.includes(kw)) score++;
    }
    if (score > 0) matches.push({ key, label: cat.label, score });
  }
  matches.sort((a, b) => b.score - a.score);
  return matches.length > 0 ? matches[0].label : "其他";
}

function formatStarCount(stars) {
  if (!stars) return "0";
  if (stars >= 100000) return (stars / 1000).toFixed(0) + "k";
  if (stars >= 10000) return (stars / 1000).toFixed(1) + "k";
  if (stars >= 1000) return (stars / 1000).toFixed(1) + "k";
  return String(stars);
}

/**
 * Analyze trend data: language distribution, categories, top projects, insights.
 */
function analyzeTrendData(data, source) {
  const result = {
    languages: 0,
    totalStars: 0,
    starDisplay: "0",
    summaryHtml: "",
    langDistributionHtml: "",
    topProjectsHtml: "",
    insightsHtml: "",
    maturityHtml: "",
    topLanguages: [],
    topCategories: [],
    topProjects: [],
    maturity: [],
  };

  if (!data || data.length === 0) return result;

  // Language distribution
  const langCount = {};
  const catCount = {};
  let totalStars = 0;
  const projectsWithStars = [];

  for (const item of data) {
    const lang = item.language || "Unknown";
    langCount[lang] = (langCount[lang] || 0) + 1;

    const cat = classifyRepo(item);
    catCount[cat] = (catCount[cat] || 0) + 1;

    const stars = parseInt(item.stars, 10) || 0;
    totalStars += stars;
    if (stars > 0) projectsWithStars.push({ name: item.repo || item.name, stars });
  }

  result.languages = Object.keys(langCount).length;
  result.totalStars = totalStars;
  result.starDisplay = totalStars > 0 ? formatStarCount(totalStars) : "0";

  // Language distribution bar
  const sortedLangs = Object.entries(langCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);
  result.topLanguages = sortedLangs;

  const langColors = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#22d3ee", "#f97316", "#ec4899"];
  const totalLangCount = sortedLangs.reduce((s, [, c]) => s + c, 0);
  const langBar = sortedLangs.map(([, c], i) => {
    const pct = ((c / totalLangCount) * 100).toFixed(1);
    return `<span class="lb-seg" style="width:${pct}%;background:${langColors[i] || "#666"}" title="${c} 个"></span>`;
  }).join("");

  result.langDistributionHtml = `<div class="yry-card">
    <h2>🔤 语言分布 <span style="font-size:.78rem;color:var(--yry-text3);font-weight:400;margin-left:8px">${result.languages} 种语言</span></h2>
    <div class="yry-lang-bar">${langBar}</div>
    <div style="display:flex;flex-wrap:wrap;gap:4px 12px;margin-top:8px;font-size:.72rem">
      ${sortedLangs.map(([l, c], i) => `<span><span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${langColors[i] || "#666"};margin-right:4px"></span>${l}: ${c}</span>`).join("")}
    </div>
  </div>`;

  // Tech category distribution
  const sortedCats = Object.entries(catCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6);
  result.topCategories = sortedCats;

  // Top projects spotlight
  projectsWithStars.sort((a, b) => b.stars - a.stars);
  const topN = projectsWithStars.slice(0, 5);
  result.topProjects = topN;

  if (topN.length > 0) {
    result.topProjectsHtml = `<div class="yry-card">
      <h2>⭐ 热门项目 <span style="font-size:.78rem;color:var(--yry-text3);font-weight:400;margin-left:8px">Top ${topN.length}</span></h2>
      ${topN.map((p, i) => `<div class="yry-proj-card">
        <span class="yry-proj-rank">#${i + 1}</span>
        <div style="flex:1;min-width:0">
          <span class="yry-proj-name">${escHtml(p.name)}</span>
        </div>
        <span class="yry-proj-meta">⭐ ${formatStarCount(p.stars)}</span>
      </div>`).join("")}
    </div>`;
  }

  // Insights
  const insights = [];
  const dominantLang = sortedLangs[0];
  const dominantCat = sortedCats[0];
  if (dominantLang) {
    insights.push({ icon: "🔤", text: `<strong>${dominantLang[0]}</strong> 是当前最活跃的编程语言，占 ${((dominantLang[1] / totalLangCount) * 100).toFixed(0)}% 的 trending 项目` });
  }
  if (dominantCat) {
    const catPct = ((dominantCat[1] / Object.values(catCount).reduce((s, c) => s + c, 0)) * 100).toFixed(0);
    insights.push({ icon: "📂", text: `<strong>${dominantCat[0]}</strong> 领域占比 ${catPct}%，是当前技术热点方向` });
  }
  if (totalStars > 0) {
    insights.push({ icon: "📊", text: `总计 <strong>${formatStarCount(totalStars)}</strong> 星，社区活跃度高` });
  }
  if (source === "github-trending") {
    insights.push({ icon: "🐙", text: "GitHub Trending 反映当日开发者社区关注焦点，适合发现新兴工具和框架" });
  } else if (source === "oss-insight") {
    insights.push({ icon: "📊", text: "OSS Insight 提供长周期趋势数据，适合评估技术采用率和社区健康度" });
  } else if (source === "trendshift") {
    insights.push({ icon: "📈", text: "TrendShift 追踪技术热度的相对变化，适合识别上升期和衰退期技术" });
  }

  if (insights.length > 0) {
    result.insightsHtml = `<div class="yry-card">
      <h2>💡 数据洞察</h2>
      ${insights.map(i => `<div class="yry-insight-item"><span class="yry-insight-icon">${i.icon}</span><span class="yry-insight-text">${i.text}</span></div>`).join("")}
    </div>`;
  }

  // Technology maturity assessment
  const maturityStages = { emerging: [], growing: [], mature: [], declining: [] };
  for (const item of data || []) {
    const stars = parseInt(item.stars, 10) || 0;
    const language = (item.language || "").toLowerCase();
    let stage = "growing";
    if (stars > 50000 || ["javascript", "python", "java", "c++", "typescript", "go", "rust"].includes(language) && stars > 10000) {
      stage = "mature";
    } else if (stars < 500 || (language === "unknown" && stars < 1000)) {
      stage = "emerging";
    }
    maturityStages[stage].push(item.repo || item.name || "unknown");
  }
  const maturityLabels = { emerging: "🌱 新兴", growing: "📈 成长", mature: "🏛️ 成熟", declining: "📉 消退" };
  const maturityData = Object.entries(maturityStages)
    .filter(([, repos]) => repos.length > 0)
    .map(([stage, repos]) => ({ stage, label: maturityLabels[stage], count: repos.length, samples: repos.slice(0, 3) }));
  result.maturity = maturityData;

  if (maturityData.length > 0) {
    const total = maturityData.reduce((s, m) => s + m.count, 0);
    const maturityBars = maturityData.map(m => {
      const pct = ((m.count / total) * 100).toFixed(0);
      const colors = { emerging: "#8b5cf6", growing: "#22c55e", mature: "#3b82f6", declining: "#ef4444" };
      return `<div class="yry-maturity-row">
        <span class="yry-maturity-label">${m.label}</span>
        <span class="yry-maturity-count">${m.count} 项</span>
        <div class="yry-maturity-bar"><div class="yry-maturity-fill" style="width:${pct}%;background:${colors[m.stage] || '#666'}"></div></div>
        <span class="yry-maturity-pct">${pct}%</span>
        <span class="yry-maturity-samples">${m.samples.join(", ")}</span>
      </div>`;
    }).join("");
    result.maturityHtml = `<div class="yry-card">
      <h2>🔭 技术成熟度分布 <span style="font-size:.78rem;color:var(--yry-text3);font-weight:400;margin-left:8px">基于 Star 数和生态判断</span></h2>
      ${maturityBars}
      <div style="margin-top:8px;font-size:.68rem;color:var(--yry-text3)">
        成熟度判定: Star > 50k 或主流语言 Star > 10k → 成熟 · Star < 500 → 新兴 · 其余 → 成长
      </div>
    </div>`;
  }

  // Summary bar
  const summaryParts = [];
  if (dominantLang) summaryParts.push(`主导语言: <strong>${dominantLang[0]}</strong> (${dominantLang[1]} 项)`);
  if (dominantCat) summaryParts.push(`热门领域: <strong>${dominantCat[0]}</strong> (${dominantCat[1]} 项)`);
  if (summaryParts.length > 0) {
    result.summaryHtml = `<div class="yry-summary">📡 ${summaryParts.join(" · ")}</div>`;
  }

  return result;
}

/**
 * Generate YrY-relevant technology recommendations from trend analysis.
 */
function buildTechRecommendations(analysis) {
  if (!analysis.topLanguages || analysis.topLanguages.length === 0) return "";

  var aiLangs = analysis.topLanguages.filter(function(e) {
    return ["python", "typescript", "javascript", "rust"].includes(e[0].toLowerCase());
  });
  var recItems = [];

  // Language-specific recommendations
  if (aiLangs.length > 0) {
    recItems.push({
      icon: "🔤",
      text: "关注 <strong>" + aiLangs.map(function(e) { return e[0]; }).join("、") + "</strong> 生态的新工具和框架，评估引入 YrY 技术栈的可行性",
      action: "建议每季度进行一次技术栈审查，重点关注与 Claude Code 插件生态兼容的工具",
    });
  }

  var topCats = analysis.topCategories || [];
  var catNames = topCats.map(function(e) { return e[0]; });

  // AI/ML recommendations
  if (catNames.indexOf("AI/ML") >= 0) {
    recItems.push({
      icon: "🤖",
      text: "AI/ML 领域持续活跃，可关注代码生成、自动化测试、智能代码审查方向的 AI 工具",
      action: "评估 GitHub Copilot、Claude Code 等 AI 编码助手在 YrY 管线中的集成方式，优先在 rui-code 和 rui-analysis 技能中试点",
    });
  }

  // DevOps recommendations
  if (catNames.indexOf("DevOps/Infra") >= 0) {
    recItems.push({
      icon: "🚀",
      text: "DevOps 工具热度上升，自动化部署和监控方案值得关注",
      action: "评估 GitHub Actions 工作流优化、容器化部署方案，目标是将 em_cicd 维度评分提升至 80+",
    });
  }

  // Language/Tool recommendations
  if (catNames.indexOf("语言/工具") >= 0) {
    recItems.push({
      icon: "🔧",
      text: "编程语言工具链活跃，Rust/Go/TypeScript 等语言的新进展值得关注",
      action: "关注 Rust 在 CLI 工具和 WASM 领域的应用，评估是否适合 YrY 性能敏感模块（如 arch-check、bundle-analyze）",
    });
  }

  // Web/Frontend recommendations
  if (catNames.indexOf("Web/前端") >= 0) {
    recItems.push({
      icon: "🎨",
      text: "前端框架和工具链持续演进，Web Components 和 CSS 新特性值得关注",
      action: "评估新 CSS 特性（Container Queries、View Transitions）在 YrY CDN 组件库中的应用，提升组件响应式评分",
    });
  }

  // Security recommendations
  if (catNames.indexOf("安全") >= 0) {
    recItems.push({
      icon: "🛡️",
      text: "安全领域出现新工具和框架，依赖安全审计和漏洞检测工具值得关注",
      action: "评估 npm audit 替代方案（如 Socket.dev、Snyk），增强 rui-npm 依赖安全审计的检测深度",
    });
  }

  // Default recommendation
  if (recItems.length === 0) {
    recItems.push({
      icon: "📡",
      text: "持续监控技术趋势，保持对新兴技术的敏感度",
      action: "建议在技术选型决策时参考趋势数据，优先选择社区活跃度高、更新频率稳定的技术",
    });
  }

  var recHtml = recItems.map(function(r, i) {
    return '<div style="padding:12px;margin-bottom:8px;background:rgba(15,23,42,.4);border-radius:8px;border:1px solid rgba(255,255,255,.06)">' +
      '<div style="display:flex;align-items:flex-start;gap:10px">' +
      '<span style="font-size:1.2rem;flex-shrink:0">' + r.icon + '</span>' +
      '<div style="flex:1">' +
      '<div style="font-size:.82rem;font-weight:600;color:var(--yry-text);margin-bottom:4px">' + (i + 1) + '. ' + r.text + '</div>' +
      '<div style="font-size:.74rem;color:var(--yry-accent);line-height:1.5">💡 ' + r.action + '</div>' +
      '</div>' +
      '</div>' +
      '</div>';
  }).join("");

  return '<div class="yry-card">' +
    '<h2>🎯 技术选型建议 <span style="font-size:.78rem;color:var(--yry-text3);font-weight:400;margin-left:8px">基于当前趋势的可行性分析</span></h2>' +
    '<div style="margin-bottom:12px">' + recHtml + '</div>' +
    '<div style="padding:10px 14px;border-radius:6px;background:rgba(59,130,246,.06);font-size:.78rem;color:var(--yry-text3);line-height:1.6">' +
    '📌 以上建议基于 ' + (analysis.languages || 0) + ' 种语言、' + (analysis.topCategories ? analysis.topCategories.length : 0) + ' 个技术领域的自动分析。实际技术选型需结合项目具体需求、团队能力和维护成本综合评估。建议每季度进行一次全面的技术栈审查。' +
    '</div>' +
    '</div>';
}

/**
 * Build a technology adoption lifecycle visualization.
 * Categorizes technologies into Innovators → Early Adopters → Early Majority →
 * Late Majority → Laggards based on star count and growth trajectory.
 */
function buildTechnologyAdoptionLifecycle(analysis) {
  if (!analysis.maturity || analysis.maturity.length === 0) return "";

  const lifecycleStages = [
    { stage: "innovators", label: "🔬 创新者", range: "实验性技术", color: "#8b5cf6", desc: "前沿探索阶段，适合技术预研和原型验证" },
    { stage: "earlyAdopters", label: "🚀 早期采用者", range: "快速增长期", color: "#22c55e", desc: "已验证价值，适合在非关键链路试点引入" },
    { stage: "earlyMajority", label: "📈 早期大众", range: "规模化应用", color: "#3b82f6", desc: "生态成熟，适合作为核心基础设施选型" },
    { stage: "lateMajority", label: "📊 晚期大众", range: "稳定维护期", color: "#f59e0b", desc: "广泛使用但增长放缓，关注替代方案" },
    { stage: "laggards", label: "📉 落后者", range: "衰退/替换期", color: "#ef4444", desc: "技术债务积累，建议制定迁移计划" },
  ];

  // Map maturity stages to lifecycle stages
  const lifecycleMap = {
    emerging: "innovators",
    growing: "earlyAdopters",
    mature: "lateMajority",
    declining: "laggards",
  };

  // Count by lifecycle stage
  const stageCounts = {};
  for (const m of analysis.maturity) {
    const lc = lifecycleMap[m.stage] || "earlyMajority";
    if (!stageCounts[lc]) stageCounts[lc] = { count: 0, samples: [] };
    stageCounts[lc].count += m.count;
    stageCounts[lc].samples.push(...m.samples.slice(0, 2));
  }

  const total = Object.values(stageCounts).reduce((s, v) => s + v.count, 0);
  if (total === 0) return "";

  const stages = lifecycleStages.map(ls => {
    const data = stageCounts[ls.stage];
    const count = data ? data.count : 0;
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    const samples = data ? data.samples.slice(0, 2).join(", ") : "";
    const barWidth = Math.max(0, pct);

    return `<div style="margin-bottom:10px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
        <span style="font-size:.78rem;font-weight:600">${ls.label} <span style="font-size:.68rem;color:var(--yry-text3);font-weight:400">${ls.range}</span></span>
        <span style="font-size:.74rem;font-weight:700;color:${ls.color}">${count} 项 (${pct}%)</span>
      </div>
      <div style="height:8px;background:rgba(255,255,255,.05);border-radius:4px;overflow:hidden;margin-bottom:2px">
        <div style="width:${barWidth}%;height:100%;background:${ls.color};border-radius:4px;transition:width .6s ease"></div>
      </div>
      <div style="font-size:.68rem;color:var(--yry-text3)">
        ${ls.desc}${samples ? ` · 示例: ${samples}` : ""}
      </div>
    </div>`;
  }).join("");

  // Determine dominant stage
  let dominantStage = lifecycleStages[2]; // default early majority
  let maxCount = 0;
  for (const ls of lifecycleStages) {
    const count = (stageCounts[ls.stage] || {}).count || 0;
    if (count > maxCount) { maxCount = count; dominantStage = ls; }
  }

  return `<div class="yry-card">
    <h2>🔄 技术采用生命周期 <span style="font-size:.78rem;color:var(--yry-text3);font-weight:400;margin-left:8px">Technology Adoption Lifecycle</span></h2>
    <div style="margin-bottom:12px;padding:10px;background:rgba(59,130,246,.08);border-radius:6px;border:1px solid rgba(59,130,246,.15)">
      <span style="font-size:.78rem;color:var(--yry-text2)">📊 当前趋势数据处于 <b style="color:${dominantStage.color}">${dominantStage.label}</b> 阶段 — ${dominantStage.desc}</span>
    </div>
    ${stages}
    <div style="margin-top:8px;font-size:.68rem;color:var(--yry-text3)">
      基于 Star 数、语言生态和项目年龄综合判断 · 创新者(&lt;500★) → 早期采用者(500-5K★) → 早期大众(5K-50K★) → 晚期大众(50K+★) → 落后者(衰退)
    </div>
  </div>`;
}

/**
 * Build YrY-relevance analysis for trending projects.
 * Scores each project for potential relevance to the YrY SDLC orchestration system.
 */
function buildYrYRelevanceAnalysis(data, source) {
  if (!data || data.length === 0) return "";

  const YRY_KEYWORDS = {
    high: ["claude", "anthropic", "llm", "ai-agent", "sdlc", "orchestrat", "pipeline", "workflow", "skill", "plugin", "code-generation", "code-review", "developer-tool", "devtools", "cli", "markdown", "documentation", "diagram", "mermaid"],
    medium: ["typescript", "node", "vitest", "testing", "lint", "format", "git", "github", "api", "rest", "graphql", "json", "yaml", "config", "monorepo", "dependency", "bundle", "build", "ci-cd", "automation"],
    low: ["react", "vue", "css", "html", "ui", "component", "design-system", "accessibility", "i18n", "database", "docker", "kubernetes", "monitoring", "logging"],
  };

  const scored = data.map(item => {
    const name = (item.repo || item.name || "").toLowerCase();
    const desc = (item.description || "").toLowerCase();
    const lang = (item.language || "").toLowerCase();
    const combined = name + " " + desc + " " + lang;

    let score = 0;
    let matchedKeywords = [];

    for (const kw of YRY_KEYWORDS.high) {
      if (combined.includes(kw)) { score += 5; matchedKeywords.push(kw); }
    }
    for (const kw of YRY_KEYWORDS.medium) {
      if (combined.includes(kw)) { score += 3; matchedKeywords.push(kw); }
    }
    for (const kw of YRY_KEYWORDS.low) {
      if (combined.includes(kw)) { score += 1; matchedKeywords.push(kw); }
    }

    return { ...item, yryScore: score, yryKeywords: matchedKeywords.slice(0, 5) };
  });

  const relevant = scored.filter(s => s.yryScore >= 5).sort((a, b) => b.yryScore - a.yryScore).slice(0, 8);

  if (relevant.length === 0) {
    // Fallback: show top projects even if low relevance
    const top = scored.sort((a, b) => b.yryScore - a.yryScore).slice(0, 5);
    if (top[0] && top[0].yryScore === 0) return "";
    relevant.push(...top);
  }

  const relevanceLevel = (score) => {
    if (score >= 15) return { label: "高相关", color: "#22c55e", bg: "rgba(34,197,94,.12)" };
    if (score >= 8) return { label: "中相关", color: "#f59e0b", bg: "rgba(245,158,11,.12)" };
    return { label: "低相关", color: "#3b82f6", bg: "rgba(59,130,246,.12)" };
  };

  const rows = relevant.map((r, i) => {
    const rl = relevanceLevel(r.yryScore);
    const stars = r.stars ? `⭐ ${r.stars}` : "";
    return `<div style="padding:10px 14px;margin-bottom:6px;background:var(--yry-bg-card);border-radius:8px;border:var(--yry-border);display:flex;align-items:center;gap:12px">
      <span style="font-size:.8rem;font-weight:700;color:var(--yry-accent);min-width:20px">${i + 1}</span>
      <div style="flex:1;min-width:0">
        <div style="font-size:.84rem;font-weight:600;color:var(--yry-text)">${r.repo || r.name || "—"}</div>
        <div style="font-size:.72rem;color:var(--yry-text3);margin-top:2px">${(r.description || "").slice(0, 80)}</div>
        ${r.yryKeywords.length > 0 ? `<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px">${r.yryKeywords.map(k => `<span style="padding:1px 6px;border-radius:3px;background:rgba(59,130,246,.1);font-size:.64rem;color:var(--yry-cyan)">${k}</span>`).join("")}</div>` : ""}
      </div>
      <div style="text-align:right;flex-shrink:0">
        <span style="padding:3px 8px;border-radius:4px;font-size:.68rem;font-weight:600;background:${rl.bg};color:${rl.color}">${rl.label} ${r.yryScore}</span>
        ${stars ? `<div style="font-size:.68rem;color:var(--yry-text3);margin-top:2px">${stars}</div>` : ""}
      </div>
    </div>`;
  }).join("");

  return `<div class="yry-card">
    <h2>🎯 YrY 相关性分析 <span style="font-size:.78rem;color:var(--yry-text3);font-weight:400;margin-left:8px">YrY Relevance Scoring</span></h2>
    <div style="margin-bottom:12px;font-size:.78rem;color:var(--yry-text2);padding:10px;background:rgba(59,130,246,.04);border-radius:6px">
      📐 基于关键词匹配评估 trending 项目对 YrY (SDLC 编排系统) 的潜在价值 · 高相关(≥15): 直接可集成 · 中相关(≥8): 可参考设计 · 低相关(≥5): 有启发意义
    </div>
    ${rows}
    ${relevant.length === 0 ? '<div style="text-align:center;color:var(--yry-text3);padding:12px;font-size:.78rem">当前快照中未发现与 YrY 技术栈高度相关的 trending 项目</div>' : ''}
  </div>`;
}

/**
 * Build a trend comparison summary showing changes from previous period.
 * Uses historical data from reports.json to compare current vs previous snapshot.
 */
function buildTrendComparisonSummary(data, source) {
  if (!data || data.length === 0) return "";

  // Count by language for current data
  const currentLangs = {};
  for (const item of data) {
    const lang = item.language || "Unknown";
    currentLangs[lang] = (currentLangs[lang] || 0) + 1;
  }

  const sortedLangs = Object.entries(currentLangs)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  if (sortedLangs.length === 0) return "";

  // Overall summary statistics
  const totalStars = data.reduce((s, item) => s + (parseInt(item.stars, 10) || 0), 0);
  const uniqueLangs = Object.keys(currentLangs).length;

  return `<div class="yry-card">
    <h2>📊 数据快照摘要 <span style="font-size:.78rem;color:var(--yry-text3);font-weight:400;margin-left:8px">Snapshot Summary</span></h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px;margin-bottom:12px">
      <div style="text-align:center;padding:12px;background:var(--yry-bg-card);border-radius:6px;border:var(--yry-border)">
        <div style="font-size:1.4rem;font-weight:700;color:var(--yry-cyan)">${data.length}</div>
        <div style="font-size:.68rem;color:var(--yry-text3)">总项目数</div>
      </div>
      <div style="text-align:center;padding:12px;background:var(--yry-bg-card);border-radius:6px;border:var(--yry-border)">
        <div style="font-size:1.4rem;font-weight:700;color:var(--yry-accent)">${uniqueLangs}</div>
        <div style="font-size:.68rem;color:var(--yry-text3)">编程语言</div>
      </div>
      <div style="text-align:center;padding:12px;background:var(--yry-bg-card);border-radius:6px;border:var(--yry-border)">
        <div style="font-size:1.4rem;font-weight:700;color:#22c55e">${formatStarCount(totalStars)}</div>
        <div style="font-size:.68rem;color:var(--yry-text3)">总 Star 数</div>
      </div>
      <div style="text-align:center;padding:12px;background:var(--yry-bg-card);border-radius:6px;border:var(--yry-border)">
        <div style="font-size:1.4rem;font-weight:700;color:var(--yry-warn)">${sortedLangs[0] ? sortedLangs[0][0] : "—"}</div>
        <div style="font-size:.68rem;color:var(--yry-text3)">主导语言</div>
      </div>
    </div>
    <div style="font-size:.72rem;color:var(--yry-text3)">
      📌 数据来源: ${SOURCE_META[source] ? SOURCE_META[source].label : source} · 快照时间: ${new Date().toISOString().slice(0, 10)} · 语言分布: ${sortedLangs.map(([l, c]) => `${l}(${c})`).join(", ")}
    </div>
  </div>`;
}

export function generateTrendReport({ source, url, data, trend, findings, ok }) {
  const meta = SOURCE_META[source] || { icon: '📡', label: source, url: '' };
  const ts = fmtDisplay(nowISO());
  const filename = `trend-${source}-${nowDate()}.html`;

  const statusBadge = ok
    ? '<span class="yry-badge pass">✅ 可达</span>'
    : '<span class="yry-badge fail">🚫 不可达</span>';

  const trendIcon = trend === 'rise' ? '↑' : trend === 'fall' ? '↓' : '→';
  const trendLabel = trend === 'rise' ? '上升' : trend === 'fall' ? '下降' : '持平';
  const trendClass = trend === 'rise' ? 'pass' : trend === 'fall' ? 'fail' : '';

  const dataRows = (data || []).slice(0, 20).map((r, i) =>
    `<tr>
      <td>${i + 1}</td>
      <td>${escHtml(r.repo || r.name || '—')}</td>
      <td>${r.stars ? '⭐ ' + r.stars : '—'}</td>
      <td>${escHtml(r.language || r.title || '—')}</td>
      <td>${(r.description || '').slice(0, 80)}</td>
    </tr>`
  ).join('\n');

  const findingsHtml = (findings || []).map((f, i) =>
    `<div class="yry-finding ${f.level || 'info'}">
      <div class="yry-finding-head">${i + 1}. ${escHtml(f.title || f.message)}</div>
      ${f.detail ? `<div class="yry-finding-body">${escHtml(f.detail)}</div>` : ''}
    </div>`
  ).join('\n');

  // Data analysis
  const analysis = analyzeTrendData(data || [], source);

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>趋势报告 · ${meta.label}</title>
<link rel="stylesheet" href="${CDN_DEPTH}cdn/shared/index.css">
<link rel="stylesheet" href="${CDN_DEPTH}cdn/theme/index.css">
	<link rel="stylesheet" href="${CDN_DEPTH}cdn/shared-reports/index.css">
	<style>
	.yry-container { max-width: 900px; }
	.yry-header .icon { font-size: 2.5rem; }
	.yry-header h1 { font-size: 1.6rem; margin: 12px 0 6px; }
	/* common styles covered by shared-reports.css */
	/* Enhanced sections — page-specific */
	.yry-lang-bar { height: 6px; border-radius: 3px; margin-top: 4px; overflow: hidden; display: flex; }
	.yry-lang-bar .lb-seg { height: 100%; }
	.yry-insight-item { padding: 12px 16px; margin-bottom: 6px; border-radius: 8px; background: rgba(15,23,42,.4); border: var(--yry-border); display: flex; gap: 10px; align-items: flex-start; }
	.yry-insight-icon { font-size: 1rem; flex-shrink: 0; margin-top: 1px; }
	.yry-insight-text { font-size: .84rem; color: var(--yry-text2); line-height: 1.5; }
	.yry-proj-card { padding: 10px 14px; margin-bottom: 6px; border-radius: 8px; background: rgba(15,23,42,.4); border: var(--yry-border); display: flex; gap: 8px; align-items: center; }
	.yry-proj-rank { font-size: .8rem; font-weight: 700; color: var(--yry-accent); width: 24px; text-align: center; flex-shrink: 0; }
	.yry-proj-name { font-size: .84rem; font-weight: 600; color: var(--yry-text); flex: 1; }
	.yry-proj-meta { font-size: .7rem; color: var(--yry-text3); }
	.yry-proj-desc { font-size: .74rem; color: var(--yry-text2); margin-top: 2px; }
	/* Maturity grid */
	.yry-maturity-row { display: flex; align-items: center; gap: 10px; padding: 8px 10px; margin-bottom: 4px; background: rgba(15,23,42,.3); border-radius: 6px; }
	.yry-maturity-label { font-size: .78rem; font-weight: 600; min-width: 70px; }
	.yry-maturity-count { font-size: .74rem; color: var(--yry-text2); min-width: 40px; text-align: right; }
	.yry-maturity-bar { flex: 1; height: 6px; border-radius: 3px; background: rgba(255,255,255,.05); overflow: hidden; }
	.yry-maturity-fill { height: 100%; border-radius: 3px; transition: width .6s ease; }
	.yry-maturity-pct { font-size: .7rem; font-weight: 600; color: var(--yry-text3); min-width: 32px; }
	.yry-maturity-samples { font-size: .66rem; color: var(--yry-text3); max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	</style>
</head>
<body>
<div class="yry-container">

<nav class="yry-breadcrumb">
  <a href="${CDN_DEPTH}docs/index.html">📄 文档中心</a>
  <span class="yry-bc-sep">/</span>
  <a href="${CDN_DEPTH}docs/趋势报告/">📡 趋势报告</a>
  <span class="yry-bc-sep">/</span>
  <span class="yry-bc-current">${meta.label}</span>
</nav>

<div class="yry-header">
  <div class="icon">${meta.icon}</div>
  <h1>趋势报告 · ${meta.label}</h1>
  <div class="meta">${ts} · ${statusBadge} · ${meta.url ? `<a href="${meta.url}" target="_blank" style="color:#7aa2f7">源</a>` : ''}</div>
</div>

<div class="yry-stats">
  <div class="yry-stat">
    <div class="yry-val ${ok ? 'pass' : 'fail'}">${ok ? '✓' : '✗'}</div>
    <div class="yry-lbl">数据源</div>
  </div>
  <div class="yry-stat">
    <div class="yry-val pass">${(data || []).length}</div>
    <div class="yry-lbl">条目</div>
  </div>
  <div class="yry-stat">
    <div class="yry-val ${trendClass}">${trendIcon}</div>
    <div class="yry-lbl">趋势 ${trendLabel}</div>
  </div>
  ${analysis.languages > 0 ? `<div class="yry-stat">
    <div class="yry-val pass">${analysis.languages}</div>
    <div class="yry-lbl">语言</div>
  </div>` : ''}
  ${analysis.totalStars > 0 ? `<div class="yry-stat">
    <div class="yry-val warn">${analysis.starDisplay}</div>
    <div class="yry-lbl">总⭐</div>
  </div>` : ''}
</div>

${analysis.summaryHtml}

${findingsHtml ? `
<div class="yry-card">
  <h2>📋 关键发现</h2>
  ${findingsHtml}
</div>
` : ''}

${analysis.langDistributionHtml}

${analysis.topProjectsHtml}

${analysis.insightsHtml}

${analysis.maturityHtml}

<div class="yry-card">
  <h2>📊 数据详情</h2>
  ${dataRows ? `<table><thead><tr><th>#</th><th>仓库</th><th>⭐</th><th>语言</th><th>描述</th></tr></thead><tbody>${dataRows}</tbody></table>` : '<p style="color:var(--yry-text3)">无数据</p>'}
</div>

${buildTechRecommendations(analysis)}

${buildTechnologyAdoptionLifecycle(analysis)}

${buildYrYRelevanceAnalysis(data || [], source)}

${buildTrendComparisonSummary(data || [], source)}

<div class="yry-footer">
  趋势报告 · ${source} · ${ts}<br>
  <span style="color:var(--yry-text3)">由 rui-trends trend-report 自动生成</span>
</div>

</div>
</body>
</html>`;

  if (!existsSync(REPORT_DIR)) {
    mkdirSync(REPORT_DIR, { recursive: true });
  }

  const filePath = join(REPORT_DIR, filename);
  writeFileSync(filePath, html, 'utf-8');

  return { filePath, filename };
}

/**
 * Update the reports.json manifest for the trend index page.
 */
export function updateTrendManifest(entry) {
  if (!existsSync(REPORT_DIR)) {
    mkdirSync(REPORT_DIR, { recursive: true });
  }

  let manifest = readJson(MANIFEST_FILE) || [];

  const normalized = { ...entry };
  const date = normalized.date || nowDate();
  normalized.date = date;
  if (normalized.source) {
    normalized.file = `trend-${normalized.source}-${date}.html`;
  }

  manifest = manifest.filter((m) => !(m && m.source === normalized.source && m.date === normalized.date));
  manifest.unshift(normalized);
  if (manifest.length > MAX_MANIFEST_ENTRIES) {
    manifest = manifest.slice(0, MAX_MANIFEST_ENTRIES);
  }

  writeJson(MANIFEST_FILE, manifest);
  return manifest;
}

function normalizeDate(s) {
  const str = String(s || '').trim();
  const m = str.match(/\d{4}-\d{2}-\d{2}/);
  return m ? m[0] : nowDate();
}

function normalizeTime(s) {
  const str = String(s || '').trim();
  if (!str) return '';
  const m = str.match(/\d{2}:\d{2}(:\d{2})?/);
  return m ? m[0] : '';
}

export function materializeTrendReportFromManifest(entry) {
  const source = entry?.source || "all";
  const meta = SOURCE_META[source] || { icon: "📡", label: source, url: "" };
  const date = normalizeDate(entry?.date || entry?.time || "");
  const time = normalizeTime(entry?.time || "");
  const ts = entry?.time ? fmtDisplay(String(entry.time)) : `${date}${time ? " " + time : ""}`;
  const ok = entry?.ok !== false;
  const trend = entry?.trend || "flat";
  const items = entry?.items ?? 0;
  const filename = `trend-${source}-${date}.html`;

  const statusBadge = ok
    ? '<span class="yry-badge pass">✅ 可达</span>'
    : '<span class="yry-badge fail">🚫 不可达</span>';

  const trendIcon = trend === "rise" ? "↑" : trend === "fall" ? "↓" : "→";
  const trendLabel = trend === "rise" ? "上升" : trend === "fall" ? "下降" : "持平";

  const sourceDescMap = {
    all: "聚合扫描多个趋势源，用于快速判断“外部信号是否异常”和“数据源是否可达”。",
    "github-trending": "反映当日开发者社区关注焦点，适合发现短周期爆发的新工具与框架。",
    "oss-insight": "偏长期指标与洞察，适合评估技术采用率、社区活跃度与生态健康度。",
    trendshift: "追踪相对热度变化，适合识别上升/衰退期技术与候选方向。",
    "top-starred": "从高星项目中发现成熟组件与基础设施方向，适合做技术底座选型参考。",
  };
  const sourceDesc = sourceDescMap[source] || "趋势快照来源。";
  const sourceUrlHtml = meta.url
    ? `<a href="${escHtml(meta.url)}" target="_blank" rel="noopener noreferrer">${escHtml(meta.url)}</a>`
    : "—";

  const findings = [];
  if (!ok) {
    findings.push({ level: "fail", title: `${meta.label} 不可达`, detail: "历史快照仅保留了可达性结果，建议重新运行趋势扫描生成完整报告。" });
  } else if (!items) {
    findings.push({ level: "warn", title: "条目数为 0", detail: "可能是数据源返回空数据或抓取逻辑未提取到条目，建议重新运行趋势扫描。" });
  } else {
    findings.push({ level: "info", title: "快照元信息", detail: `记录了可达性、趋势方向与条目数（items=${items}）。如需仓库明细，请重新生成完整报告。` });
  }

  const findingsHtml = findings.map((f, i) =>
    `<div class="yry-finding ${f.level}">
      <div class="yry-finding-head">${i + 1}. ${escHtml(f.title)}</div>
      ${f.detail ? `<div class="yry-finding-body">${escHtml(f.detail)}</div>` : ""}
    </div>`
  ).join("\n");

  const regenCmdHtml = source === "all"
    ? `<code>node skills/rui-trends/rui-trends.mjs all --html</code>`
    : `<code>node skills/rui-trends/rui-trends.mjs ${escHtml(source)} --html</code> 或 <code>node skills/rui-trends/rui-trends.mjs all --html</code>`;

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>趋势报告 · ${escHtml(meta.label)}</title>
<link rel="stylesheet" href="${CDN_DEPTH}cdn/shared/index.css">
<link rel="stylesheet" href="${CDN_DEPTH}cdn/theme/index.css">
	<link rel="stylesheet" href="${CDN_DEPTH}cdn/shared-reports/index.css">
	<style>
	.yry-container { max-width: 900px; }
	.yry-header .icon { font-size: 2.5rem; }
	.yry-header h1 { font-size: 1.6rem; margin: 12px 0 6px; }
	.yry-stat { min-width: 120px; }
	/* common styles covered by shared-reports.css */
	</style>
</head>
<body>
<div class="yry-container">
<nav class="yry-breadcrumb">
  <a href="${CDN_DEPTH}docs/index.html">📄 文档中心</a>
  <span class="yry-bc-sep">/</span>
  <a href="${CDN_DEPTH}docs/趋势报告/">📡 趋势报告</a>
  <span class="yry-bc-sep">/</span>
  <span class="yry-bc-current">${escHtml(meta.label)} · ${escHtml(date)}</span>
</nav>

<div class="yry-header">
  <div class="icon">${meta.icon}</div>
  <h1>趋势报告 · ${escHtml(meta.label)}</h1>
  <div class="meta">${escHtml(ts)} · ${statusBadge}</div>
</div>

<div class="yry-stats">
  <div class="yry-stat">
    <div class="yry-val ${ok ? "pass" : "fail"}">${ok ? "✓" : "✗"}</div>
    <div class="yry-lbl">可达性</div>
  </div>
  <div class="yry-stat">
    <div class="yry-val ${trend === "rise" ? "pass" : trend === "fall" ? "fail" : "warn"}">${trendIcon}</div>
    <div class="yry-lbl">趋势 ${escHtml(trendLabel)}</div>
  </div>
  <div class="yry-stat">
    <div class="yry-val pass">${escHtml(items)}</div>
    <div class="yry-lbl">条目数 (items)</div>
  </div>
  <div class="yry-stat">
    <div class="yry-val pass">${escHtml(source)}</div>
    <div class="yry-lbl">来源 (source)</div>
  </div>
</div>

<div class="yry-summary">该页面由 <code>reports.json</code> 清单元信息回填生成，用于保证通知中心/索引中的历史链接可访问；如需完整项目列表与洞察分析，请重新运行趋势扫描生成完整报告。</div>

<div class="yry-card">
  <h2>🧭 数据源说明</h2>
  <div style="font-size:.84rem;color:var(--yry-text2);line-height:1.7">
    <div><span style="color:var(--yry-text3)">来源：</span><strong>${escHtml(meta.label)}</strong>（<code>${escHtml(source)}</code>）</div>
    <div><span style="color:var(--yry-text3)">入口：</span>${sourceUrlHtml}</div>
    <div style="margin-top:10px;padding:10px 12px;border-radius:8px;background:rgba(15,23,42,.4);border:var(--yry-border);color:var(--yry-text2)">${escHtml(sourceDesc)}</div>
  </div>
</div>

<div class="yry-card">
  <h2>📋 快照说明</h2>
  ${findingsHtml}
  <div style="margin-top:10px;font-size:.78rem;color:var(--yry-text3)">
    重新生成：${regenCmdHtml}
  </div>
</div>

<div class="yry-footer">
  趋势报告 · ${escHtml(source)} · ${escHtml(ts)}<br>
  <span style="color:var(--yry-text3)">由 rui-trends trend-report 生成（manifest 回填）</span>
</div>
</div>
</body>
</html>`;

  if (!existsSync(REPORT_DIR)) {
    mkdirSync(REPORT_DIR, { recursive: true });
  }
  const filePath = join(REPORT_DIR, filename);
  writeFileSync(filePath, html, "utf-8");
  return { filePath, filename };
}

/**
 * Generate a full trend report from a fetch result and save it.
 * Returns { filePath, filename, manifestEntry }.
 */
export function saveTrendSnapshot(result) {
  const { source, ok, data, url } = result;

  const itemCount = (data || []).length;
  const trend = !ok ? 'flat' : itemCount > 15 ? 'rise' : itemCount > 5 ? 'flat' : 'fall';

  const findings = [];
  if (!ok) {
    findings.push({ level: 'fail', title: `${source} 不可达`, detail: result.error || '未知错误' });
  } else if (itemCount === 0) {
    findings.push({ level: 'warn', title: `${source} 返回空数据`, detail: '页面结构可能已变更，HTML 解析未提取到条目' });
  } else {
    findings.push({ level: 'info', title: `${source} 正常响应`, detail: `提取到 ${itemCount} 条记录` });
  }

  const { filePath, filename } = generateTrendReport({ source, url, data, trend, findings, ok });

  const entry = {
    date: nowDate(),
    time: nowISO(),
    source,
    ok,
    trend: trend === 'rise' ? 'rise' : trend === 'fall' ? 'fall' : 'flat',
    items: itemCount,
    file: filename,
  };
  updateTrendManifest(entry);

  return { filePath, filename, entry };
}

/**
 * Generate a combined "all sources" report.
 */
export function saveAllTrendSnapshot(results) {
  const allData = [];
  const findings = [];
  let reachable = 0;
  let total = 0;

  for (const [source, r] of Object.entries(results.sources || {})) {
    total++;
    const ok = r.ok;
    const count = (r.data || []).length;
    if (ok) reachable++;

    if (!ok) {
      findings.push({ level: 'fail', title: `${source} 不可达`, detail: r.error || '未知错误' });
    } else if (count === 0) {
      findings.push({ level: 'warn', title: `${source} 返回空数据` });
    } else {
      findings.push({ level: 'info', title: `${source}: ${count} 条记录` });
    }

    allData.push(...(r.data || []).map(d => ({ ...d, _source: source })));
  }

  const trend = reachable >= 3 ? 'rise' : reachable >= 2 ? 'flat' : 'fall';
  const ok = reachable > 0;

  const { filePath, filename } = generateTrendReport({
    source: 'all',
    url: '',
    data: allData,
    trend,
    findings,
    ok,
  });

  const entry = {
    date: nowDate(),
    time: nowISO(),
    source: 'all',
    ok,
    trend,
    items: allData.length,
    reachable,
    total,
    file: filename,
  };
  updateTrendManifest(entry);

  return { filePath, filename, entry };
}

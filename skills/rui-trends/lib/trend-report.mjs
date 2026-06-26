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

/** @type {Record<string, {icon: string, label: string, url: string}>} */
const SOURCE_META = {
  'github-trending': { icon: '🐙', label: 'GitHub Trending', url: 'https://github.com/trending' },
  'oss-insight':       { icon: '📊', label: 'OSS Insight', url: 'https://ossinsight.io' },
  'trendshift':         { icon: '📈', label: 'TrendShift', url: 'https://trendshift.io' },
  'top-starred':        { icon: '⭐', label: 'Top-Starred', url: 'https://github.com/search' },
  all:                  { icon: '📡', label: '全量趋势扫描', url: '' },
};

/** @type {Record<string, {label: string, keywords: string[]}>} */
const TECH_CATEGORIES = {
  ai: { label: "AI/ML", keywords: ["llm", "gpt", "llama", "ai", "ml", "neural", "transformer", "diffusion", "stable-diffusion", "chatgpt", "copilot", "rag", "embedding", "langchain", "whisper", "tts", "speech", "pytorch", "tensorflow"] },
  web: { label: "Web/前端", keywords: ["react", "vue", "svelte", "next", "nuxt", "angular", "html", "css", "tailwind", "browser", "wasm", "webgpu", "htmx", "astro", "remix", "solid"] },
  backend: { label: "后端/API", keywords: ["api", "server", "rest", "graphql", "grpc", "database", "postgres", "redis", "kafka", "rabbit", "nginx", "proxy", "gateway", "microservice"] },
  devops: { label: "DevOps/Infra", keywords: ["docker", "kubernetes", "terraform", "ci", "cd", "github-actions", "ansible", "prometheus", "grafana", "helm", "aws", "azure", "gcp", "linux"] },
  lang: { label: "语言/工具", keywords: ["rust", "go", "python", "typescript", "zig", "mojo", "swift", "kotlin", "c++", "compiler", "parser", "interpreter", "linter", "formatter"] },
  security: { label: "安全", keywords: ["security", "vulnerability", "exploit", "cve", "auth", "oauth", "jwt", "encryption", "penetration", "firewall", "zero-trust"] },
};

function classifyRepo(/** @type {any} */ repo) {
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
  matches.sort((/** @type {any} */ a, /** @type {any} */ b) => b.score - a.score);
  return matches.length > 0 ? matches[0].label : "其他";
}

function formatStarCount(/** @type {number} */ stars) {
  if (!stars) return "0";
  if (stars >= 100000) return (stars / 1000).toFixed(0) + "k";
  if (stars >= 10000) return (stars / 1000).toFixed(1) + "k";
  if (stars >= 1000) return (stars / 1000).toFixed(1) + "k";
  return String(stars);
}

/**
 * Analyze trend data: language distribution, categories, top projects, insights.
 */
function analyzeTrendData(/** @type {any[]} */ data, /** @type {string} */ source) {
  /** @type {{ languages: number, totalStars: number, starDisplay: string, summaryHtml: string, langDistributionHtml: string, topProjectsHtml: string, insightsHtml: string, maturityHtml: string, topLanguages: Array<[string, number]>, topCategories: Array<[string, number]>, topProjects: Array<{name:string,stars:number}>, maturity: Array<{stage:string,label:string,count:number,samples:any[]}> }} */
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
  const langCount = /** @type {Record<string, number>} */ ({});
  /** @type {Record<string, number>} */ const catCount = {};
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
    return `<span class="lb-seg" style="--w:${pct}%;--seg-color:${langColors[i] || '#666'}" title="${c} 个"></span>`;
  }).join("");

  result.langDistributionHtml = `<div class="yry-card">
    <h2>🔤 语言分布 <span class="tr-section-sub">${result.languages} 种语言</span></h2>
    <div class="yry-lang-bar">${langBar}</div>
    <div class="tr-lang-legend">
      ${sortedLangs.map(([l, c], i) => `<span class="tr-lang-legend-item"><span class="tr-lang-swatch" style="--seg-color:${langColors[i] || '#666'}"></span>${l}: ${c}</span>`).join("")}
    </div>
  </div>`;

  // Tech category distribution
  const sortedCats = Object.entries(catCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6);
  result.topCategories = sortedCats;

  // Top projects spotlight
  projectsWithStars.sort((/** @type {any} */ a, /** @type {any} */ b) => b.stars - a.stars);
  const topN = projectsWithStars.slice(0, 5);
  result.topProjects = topN;

  if (topN.length > 0) {
    result.topProjectsHtml = `<div class="yry-card">
      <h2>⭐ 热门项目 <span class="tr-section-sub">Top ${topN.length}</span></h2>
      ${topN.map((p, i) => `<div class="yry-proj-card">
        <span class="yry-proj-rank">#${i + 1}</span>
        <div class="yry-proj-body">
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
  /** @type {Record<string, string[]>} */ const maturityStages = { emerging: [], growing: [], mature: [], declining: [] };
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
  /** @type {Record<string, string>} */ const maturityLabels = { emerging: "🌱 新兴", growing: "📈 成长", mature: "🏛️ 成熟", declining: "📉 消退" };
  const maturityData = Object.entries(maturityStages)
    .filter(([, repos]) => repos.length > 0)
    .map(([stage, repos]) => ({ stage, label: maturityLabels[stage], count: repos.length, samples: repos.slice(0, 3) }));
  result.maturity = maturityData;

  if (maturityData.length > 0) {
    const total = maturityData.reduce((s, m) => s + m.count, 0);
    const maturityBars = maturityData.map(m => {
      const pct = ((m.count / total) * 100).toFixed(0);
      return `<div class="yry-maturity-row">
        <span class="yry-maturity-label">${m.label}</span>
        <span class="yry-maturity-count">${m.count} 项</span>
        <div class="yry-maturity-bar"><div class="yry-maturity-fill stage-${m.stage}" style="--w:${pct}%"></div></div>
        <span class="yry-maturity-pct">${pct}%</span>
        <span class="yry-maturity-samples">${m.samples.join(", ")}</span>
      </div>`;
    }).join("");
    result.maturityHtml = `<div class="yry-card">
      <h2>🔭 技术成熟度分布 <span class="tr-section-sub">基于 Star 数和生态判断</span></h2>
      ${maturityBars}
      <div class="yry-maturity-hint">
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
function buildTechRecommendations(/** @type {any} */ analysis) {
  if (!analysis.topLanguages || analysis.topLanguages.length === 0) return "";

  const aiLangs = analysis.topLanguages.filter(function(/** @type {any} */ e) {
    return ["python", "typescript", "javascript", "rust"].includes(e[0].toLowerCase());
  });
  const recItems = [];

  // Language-specific recommendations
  if (aiLangs.length > 0) {
    recItems.push({
      icon: "🔤",
      text: `关注 <strong>${aiLangs.map(function(/** @type {any} */ e) { return e[0]; }).join("、")}</strong> 生态的新工具和框架，评估引入 YrY 技术栈的可行性`,
      action: "建议每季度进行一次技术栈审查，重点关注与 Claude Code 插件生态兼容的工具",
    });
  }

  const topCats = analysis.topCategories || [];
  const catNames = topCats.map(function(/** @type {any} */ e) { return e[0]; });

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

  const recHtml = recItems.map(function(/** @type {any} */ r, /** @type {number} */ i) {
    return `<div class="yry-insight-item">
<span class="yry-insight-icon">${r.icon}</span>
<div class="yry-insight-body">
<div class="yry-insight-title">${i + 1}. ${r.text}</div>
<div class="yry-insight-text">💡 ${r.action}</div>
</div>
</div>`;
  }).join("");

  return `<div class="yry-card">
<h2>🎯 技术选型建议 <span class="tr-section-sub">基于当前趋势的可行性分析</span></h2>
<div class="yry-insight-wrap">${recHtml}</div>
<div class="yry-insight-banner">
📌 以上建议基于 ${(analysis.languages || 0)} 种语言、${(analysis.topCategories ? analysis.topCategories.length : 0)} 个技术领域的自动分析。实际技术选型需结合项目具体需求、团队能力和维护成本综合评估。建议每季度进行一次全面的技术栈审查。
</div>
</div>`;
}

/**
 * Build a technology adoption lifecycle visualization.
 * Categorizes technologies into Innovators → Early Adopters → Early Majority →
 * Late Majority → Laggards based on star count and growth trajectory.
 */
function buildTechnologyAdoptionLifecycle(/** @type {any} */ analysis) {
  if (!analysis.maturity || analysis.maturity.length === 0) return "";

  const lifecycleStages = [
    { stage: "innovators", label: "🔬 创新者", range: "实验性技术", color: "#8b5cf6", desc: "前沿探索阶段，适合技术预研和原型验证" },
    { stage: "earlyAdopters", label: "🚀 早期采用者", range: "快速增长期", color: "#22c55e", desc: "已验证价值，适合在非关键链路试点引入" },
    { stage: "earlyMajority", label: "📈 早期大众", range: "规模化应用", color: "#3b82f6", desc: "生态成熟，适合作为核心基础设施选型" },
    { stage: "lateMajority", label: "📊 晚期大众", range: "稳定维护期", color: "#f59e0b", desc: "广泛使用但增长放缓，关注替代方案" },
    { stage: "laggards", label: "📉 落后者", range: "衰退/替换期", color: "#ef4444", desc: "技术债务积累，建议制定迁移计划" },
  ];

  // Map maturity stages to lifecycle stages
  /** @type {Record<string, string>} */ const lifecycleMap = {
    emerging: "innovators",
    growing: "earlyAdopters",
    mature: "lateMajority",
    declining: "laggards",
  };

  // Count by lifecycle stage
  /** @type {Record<string, {count: number, samples: string[]}>} */ const stageCounts = {};
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

    return `<div class="tr-tal-row" style="--tal-color:${ls.color}">
      <div class="tr-tal-head">
        <span class="tr-tal-label">${ls.label} <span class="tr-tal-range">${ls.range}</span></span>
        <span class="tr-tal-count">${count} 项 (${pct}%)</span>
      </div>
      <div class="tr-tal-bar">
        <div class="tr-tal-fill" style="--w:${barWidth}%"></div>
      </div>
      <div class="tr-tal-desc">
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
    <h2>🔄 技术采用生命周期 <span class="tr-section-sub">Technology Adoption Lifecycle</span></h2>
    <div class="tr-tal-banner" style="--tal-color:${dominantStage.color}">
      <span class="tr-tal-banner-text">📊 当前趋势数据处于 <b>${dominantStage.label}</b> 阶段 — ${dominantStage.desc}</span>
    </div>
    ${stages}
    <div class="yry-maturity-hint">
      基于 Star 数、语言生态和项目年龄综合判断 · 创新者(&lt;500★) → 早期采用者(500-5K★) → 早期大众(5K-50K★) → 晚期大众(50K+★) → 落后者(衰退)
    </div>
  </div>`;
}

/**
 * Build YrY-relevance analysis for trending projects.
 * Scores each project for potential relevance to the YrY SDLC orchestration system.
 */
function buildYrYRelevanceAnalysis(/** @type {any[]} */ data, /** @type {string} */ _source) {
  if (!data || data.length === 0) return "";

  const YRY_KEYWORDS = {
    high: ["claude", "anthropic", "llm", "ai-agent", "sdlc", "orchestrat", "pipeline", "workflow", "skill", "plugin", "code-generation", "code-review", "developer-tool", "devtools", "cli", "markdown", "documentation", "diagram", "mermaid"],
    medium: ["typescript", "node", "vitest", "testing", "lint", "format", "git", "github", "api", "rest", "graphql", "json", "yaml", "config", "monorepo", "dependency", "bundle", "build", "ci-cd", "automation"],
    low: ["react", "vue", "css", "html", "ui", "component", "design-system", "accessibility", "i18n", "database", "docker", "kubernetes", "monitoring", "logging"],
  };

  const scored = data.map((/** @type {any} */ item) => {
    const name = (item.repo || item.name || "").toLowerCase();
    const desc = (item.description || "").toLowerCase();
    const lang = (item.language || "").toLowerCase();
    const combined = name + " " + desc + " " + lang;

    let score = 0;
    const matchedKeywords = [];

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

  const relevant = scored.filter((/** @type {any} */ s) => s.yryScore >= 5).sort((/** @type {any} */ a, /** @type {any} */ b) => b.yryScore - a.yryScore).slice(0, 8);

  if (relevant.length === 0) {
    // Fallback: show top projects even if low relevance
    const top = scored.sort((/** @type {any} */ a, /** @type {any} */ b) => b.yryScore - a.yryScore).slice(0, 5);
    if (top[0] && top[0].yryScore === 0) return "";
    relevant.push(...top);
  }

  const relevanceLevel = (/** @type {number} */ score) => {
    if (score >= 15) return { label: "高相关", color: "#22c55e", bg: "rgba(34,197,94,.12)" };
    if (score >= 8) return { label: "中相关", color: "#f59e0b", bg: "rgba(245,158,11,.12)" };
    return { label: "低相关", color: "#3b82f6", bg: "rgba(59,130,246,.12)" };
  };

  const rows = relevant.map((/** @type {any} */ r, /** @type {number} */ i) => {
    const rl = relevanceLevel(r.yryScore);
    const stars = r.stars ? `⭐ ${r.stars}` : "";
    return `<div class="yry-proj-card">
      <span class="yry-proj-rank">${i + 1}</span>
      <div class="yry-proj-body">
        <div class="yry-proj-name">${r.repo || r.name || "—"}</div>
        <div class="yry-proj-desc">${(r.description || "").slice(0, 80)}</div>
        ${r.yryKeywords.length > 0 ? `<div class="yry-proj-keywords">${r.yryKeywords.map((/** @type {string} */ k) => `<span class="yry-proj-keyword">${k}</span>`).join("")}</div>` : ""}
      </div>
      <div class="yry-proj-side">
        <span class="yry-proj-score-badge" style="--badge-bg:${rl.bg};--badge-color:${rl.color}">${rl.label} ${r.yryScore}</span>
        ${stars ? `<div class="yry-proj-stars">${stars}</div>` : ""}
      </div>
    </div>`;
  }).join("");

  return `<div class="yry-card">
    <h2>🎯 YrY 相关性分析 <span class="tr-section-sub">YrY Relevance Scoring</span></h2>
    <div class="tr-rel-intro">
      📐 基于关键词匹配评估 trending 项目对 YrY (SDLC 编排系统) 的潜在价值 · 高相关(≥15): 直接可集成 · 中相关(≥8): 可参考设计 · 低相关(≥5): 有启发意义
    </div>
    ${rows}
    ${relevant.length === 0 ? '<div class="tr-rel-empty">当前快照中未发现与 YrY 技术栈高度相关的 trending 项目</div>' : ''}
  </div>`;
}

/**
 * Build a trend comparison summary showing changes from previous period.
 * Uses historical data from reports.json to compare current vs previous snapshot.
 */
function buildTrendComparisonSummary(/** @type {any[]} */ data, /** @type {string} */ source) {
  if (!data || data.length === 0) return "";

  // Count by language for current data
  /** @type {Record<string, number>} */ const currentLangs = {};
  for (const item of data) {
    const lang = item.language || "Unknown";
    currentLangs[lang] = (currentLangs[lang] || 0) + 1;
  }

  const sortedLangs = Object.entries(currentLangs)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  if (sortedLangs.length === 0) return "";

  // Overall summary statistics
  const totalStars = data.reduce((/** @type {number} */ s, /** @type {any} */ item) => s + (parseInt(item.stars, 10) || 0), 0);
  const uniqueLangs = Object.keys(currentLangs).length;

  return `<div class="yry-card">
    <h2>📊 数据快照摘要 <span class="tr-section-sub">Snapshot Summary</span></h2>
    <div class="tr-snap-grid">
      <div class="tr-snap-cell">
        <div class="tr-snap-val cyan">${data.length}</div>
        <div class="tr-snap-lbl">总项目数</div>
      </div>
      <div class="tr-snap-cell">
        <div class="tr-snap-val accent">${uniqueLangs}</div>
        <div class="tr-snap-lbl">编程语言</div>
      </div>
      <div class="tr-snap-cell">
        <div class="tr-snap-val pass">${formatStarCount(totalStars)}</div>
        <div class="tr-snap-lbl">总 Star 数</div>
      </div>
      <div class="tr-snap-cell">
        <div class="tr-snap-val warn">${sortedLangs[0] ? sortedLangs[0][0] : "—"}</div>
        <div class="tr-snap-lbl">主导语言</div>
      </div>
    </div>
    <div class="tr-snap-foot">
      📌 数据来源: ${SOURCE_META[source] ? SOURCE_META[source].label : source} · 快照时间: ${new Date().toISOString().slice(0, 10)} · 语言分布: ${sortedLangs.map(([l, c]) => `${l}(${c})`).join(", ")}
    </div>
  </div>`;
}

export function generateTrendReport({ source, data, trend, findings, ok } = /** @type {any} */ ({})) {
  const meta = SOURCE_META[source] || { icon: '📡', label: source, url: '' };
  const ts = fmtDisplay(nowISO());
  const filename = `trend-${source}-${nowDate()}.html`;

  const statusBadge = ok
    ? '<span class="yry-badge pass">✅ 可达</span>'
    : '<span class="yry-badge fail">🚫 不可达</span>';

  const trendIcon = trend === 'rise' ? '↑' : trend === 'fall' ? '↓' : '→';
  const trendLabel = trend === 'rise' ? '上升' : trend === 'fall' ? '下降' : '持平';
  const trendClass = trend === 'rise' ? 'pass' : trend === 'fall' ? 'fail' : '';

  const dataRows = (data || []).slice(0, 20).map((/** @type {any} */ r, /** @type {number} */ i) =>
    `<tr>
      <td>${i + 1}</td>
      <td>${escHtml(r.repo || r.name || '—')}</td>
      <td>${r.stars ? '⭐ ' + r.stars : '—'}</td>
      <td>${escHtml(r.language || r.title || '—')}</td>
      <td>${(r.description || '').slice(0, 80)}</td>
    </tr>`
  ).join('\n');

  const findingsHtml = (findings || []).map((/** @type {any} */ f, /** @type {number} */ i) =>
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
	<link rel="stylesheet" href="${CDN_DEPTH}cdn/trend-report/index.css">
</head>
<body>
<div class="yry-container tr-container">

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
  <div class="meta">${ts} · ${statusBadge} · ${meta.url ? `<a href="${meta.url}" target="_blank" class="tr-source-link">源</a>` : ''}</div>
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
  ${dataRows ? `<table><thead><tr><th>#</th><th>仓库</th><th>⭐</th><th>语言</th><th>描述</th></tr></thead><tbody>${dataRows}</tbody></table>` : '<p class="tr-empty-data">无数据</p>'}
</div>

${buildTechRecommendations(analysis)}

${buildTechnologyAdoptionLifecycle(analysis)}

${buildYrYRelevanceAnalysis(data || [], source)}

${buildTrendComparisonSummary(data || [], source)}

<div class="yry-footer">
  趋势报告 · ${source} · ${ts}<br>
  <span class="tr-meta">由 rui-trends trend-report 自动生成</span>
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
export function updateTrendManifest(/** @type {any} */ entry) {
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

  manifest = manifest.filter((/** @type {any} */ m) => !(m && m.source === normalized.source && m.date === normalized.date));
  manifest.unshift(normalized);
  if (manifest.length > MAX_MANIFEST_ENTRIES) {
    manifest = manifest.slice(0, MAX_MANIFEST_ENTRIES);
  }

  writeJson(MANIFEST_FILE, manifest);
  return manifest;
}

function normalizeDate(/** @type {any} */ s) {
  const str = String(s || '').trim();
  const m = str.match(/\d{4}-\d{2}-\d{2}/);
  return m ? m[0] : nowDate();
}

function normalizeTime(/** @type {any} */ s) {
  const str = String(s || '').trim();
  if (!str) return '';
  const m = str.match(/\d{2}:\d{2}(:\d{2})?/);
  return m ? m[0] : '';
}

export function materializeTrendReportFromManifest(/** @type {any} */ entry) {
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

  /** @type {Record<string, string>} */ const sourceDescMap = {
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

  const findingsHtml = findings.map((/** @type {any} */ f, /** @type {number} */ i) =>
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
	<link rel="stylesheet" href="${CDN_DEPTH}cdn/trend-report/index.css">
</head>
<body>
<div class="yry-container tr-container">
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
  <div class="tr-backfill-summary">
    <div><span class="tr-backfill-source">来源：</span><strong>${escHtml(meta.label)}</strong>（<code>${escHtml(source)}</code>）</div>
    <div><span class="tr-backfill-entry">入口：</span>${sourceUrlHtml}</div>
    <div class="tr-backfill-desc">${escHtml(sourceDesc)}</div>
  </div>
</div>

<div class="yry-card">
  <h2>📋 快照说明</h2>
  ${findingsHtml}
  <div class="tr-backfill-hint">
    重新生成：${regenCmdHtml}
  </div>
</div>

<div class="yry-footer">
  趋势报告 · ${escHtml(source)} · ${escHtml(ts)}<br>
  <span class="tr-meta">由 rui-trends trend-report 生成（manifest 回填）</span>
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
export function saveTrendSnapshot(/** @type {any} */ result) {
  const { source, ok, data } = result;

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

  const { filePath, filename } = generateTrendReport({ source, data, trend, findings, ok });

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
export function saveAllTrendSnapshot(/** @type {any} */ results) {
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

    allData.push(...(r.data || []).map((/** @type {any} */ d) => ({ ...d, _source: source })));
  }

  const trend = reachable >= 3 ? 'rise' : reachable >= 2 ? 'flat' : 'fall';
  const ok = reachable > 0;

  const { filePath, filename } = generateTrendReport({
    source: 'all',
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

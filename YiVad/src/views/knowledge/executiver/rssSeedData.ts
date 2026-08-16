// ═══════════════════════════════════════════════════════════
// RSS 示例种子源 — 单一事实来源（首次空库时落盘）
//
// 与 okrFlowData.ts 的 EXAMPLE_TASKS 对齐：给 RSS Manager 的
// Feed Sources 表提供可用的初始订阅源。分类沿用 rssManager.vue
// 的 categoryGroups（即 YiKnowledge 目录结构）。
//
// 落盘规则：仅在 `seeds` 集合为空且未标记已初始化时写入一次
// （见 rssManager.vue 的 loadSeeds / SEEDS_SEEDED_KEY），用户删空后
// 刷新不应再自动补回。
// ═══════════════════════════════════════════════════════════

export interface ExampleRssSeed {
  /** 稳定 key，避免重复落盘（幂等）。 */
  key: string;
  url: string;
  name: string;
  /** 覆盖分类，如 "executiver/industry"；留空走自动分类。 */
  category: string;
  enabled: boolean;
}

export const EXAMPLE_SEEDS: ExampleRssSeed[] = [
  {
    key: "seed_example_the-verge",
    url: "https://www.theverge.com/rss/index.xml",
    name: "The Verge",
    category: "executiver/industry",
    enabled: true
  },
  {
    key: "seed_example_ars-technica",
    url: "https://feeds.arstechnica.com/arstechnica/index",
    name: "Ars Technica",
    category: "executiver/industry",
    enabled: true
  },
  {
    key: "seed_example_mit-tr",
    url: "https://www.technologyreview.com/feed/",
    name: "MIT Technology Review",
    category: "aier/methodology",
    enabled: true
  },
  {
    key: "seed_example_hn",
    url: "https://hnrss.org/frontpage",
    name: "Hacker News",
    category: "engineer/learn/lessons",
    enabled: true
  },
  {
    key: "seed_example_simonwillison",
    url: "https://simonwillison.net/atom/everything/",
    name: "Simon Willison",
    category: "aier/methodology",
    enabled: true
  },
  {
    key: "seed_example_github-blog",
    url: "https://github.blog/feed/",
    name: "GitHub Blog",
    category: "srer/release",
    enabled: true
  },
  // ── 国内中文源 ──
  {
    key: "seed_example_infoq-cn",
    url: "https://www.infoq.cn/feed",
    name: "InfoQ 中文",
    category: "aier/methodology",
    enabled: true
  },
  {
    key: "seed_example_sspai",
    url: "https://sspai.com/feed",
    name: "少数派 sspai",
    category: "executiver/reading-list",
    enabled: true
  },
  {
    key: "seed_example_ifanr",
    url: "https://www.ifanr.com/feed",
    name: "爱范儿 ifanr",
    category: "executiver/industry",
    enabled: true
  },
  {
    key: "seed_example_meituan-tech",
    url: "https://tech.meituan.com/feed/",
    name: "美团技术团队",
    category: "engineer/learn/lessons",
    enabled: true
  },
  {
    key: "seed_example_solidot",
    url: "https://www.solidot.org/index.rss",
    name: "Solidot 奇客",
    category: "engineer/learn/lessons",
    enabled: true
  },
  {
    key: "seed_example_ruanyifeng",
    url: "http://www.ruanyifeng.com/blog/atom.xml",
    name: "阮一峰的网络日志",
    category: "engineer/learn/lessons",
    enabled: true
  }
];

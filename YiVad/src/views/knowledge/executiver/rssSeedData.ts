// ═══════════════════════════════════════════════════════════
// RSS 示例种子源 — 单一事实来源（首次空库时落盘）
//
// 与 okrFlowData.ts 的 EXAMPLE_TASKS 对齐：给 RSS Manager 的
// Feed Sources 表提供可用的初始订阅源。分类沿用 rssManager.vue
// 的 categoryGroups（所有 RSS 文件统一存储在 YiKnowledge/rss/）。
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
  // ── executiver/industry ──
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
    key: "seed_example_ifanr",
    url: "https://www.ifanr.com/feed",
    name: "爱范儿 ifanr",
    category: "executiver/industry",
    enabled: true
  },
  {
    key: "seed_example_36kr",
    url: "https://www.36kr.com/feed",
    name: "36氪",
    category: "executiver/industry",
    enabled: true
  },
  {
    key: "seed_example_tmtpost",
    url: "https://www.tmtpost.com/rss.xml",
    name: "钛媒体",
    category: "executiver/industry",
    enabled: true
  },
  // ── executiver/strategy ──
  {
    key: "seed_example_hbr",
    url: "https://hbr.org/rss-feeds",
    name: "Harvard Business Review",
    category: "executiver/strategy",
    enabled: true
  },
  {
    key: "seed_example_mckinsey",
    url: "https://www.mckinsey.com/feeds/global",
    name: "McKinsey Insights",
    category: "executiver/strategy",
    enabled: true
  },
  {
    key: "seed_example_strategy-business",
    url: "https://www.strategy-business.com/feed",
    name: "Strategy+Business",
    category: "executiver/strategy",
    enabled: true
  },
  // ── executiver/roadmap ──
  {
    key: "seed_example_a16z",
    url: "https://a16z.com/feed/",
    name: "a16z",
    category: "executiver/roadmap",
    enabled: true
  },
  {
    key: "seed_example_strictvc",
    url: "https://www.strictlyvc.com/feed/",
    name: "StrictlyVC",
    category: "executiver/roadmap",
    enabled: true
  },
  // ── executiver/reading-list ──
  {
    key: "seed_example_sspai",
    url: "https://sspai.com/feed",
    name: "少数派 sspai",
    category: "executiver/reading-list",
    enabled: true
  },
  {
    key: "seed_example_nytimes-tech",
    url: "https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml",
    name: "NYT Technology",
    category: "executiver/reading-list",
    enabled: true
  },
  // ── aier/methodology ──
  {
    key: "seed_example_mit-tr",
    url: "https://www.technologyreview.com/feed/",
    name: "MIT Technology Review",
    category: "aier/methodology",
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
    key: "seed_example_infoq-cn",
    url: "https://www.infoq.cn/feed",
    name: "InfoQ 中文",
    category: "aier/methodology",
    enabled: true
  },
  {
    key: "seed_example_qbitai",
    url: "https://www.qbitai.com/feed",
    name: "量子位",
    category: "aier/methodology",
    enabled: true
  },
  {
    key: "seed_example_leiphone",
    url: "https://www.leiphone.com/feed",
    name: "雷锋网",
    category: "aier/methodology",
    enabled: true
  },
  {
    key: "seed_example_anthropic",
    url: "https://www.anthropic.com/blog/feed",
    name: "Anthropic Blog",
    category: "aier/methodology",
    enabled: true
  },
  // ── aier/foundations ──
  {
    key: "seed_example_openai",
    url: "https://openai.com/blog/rss.xml",
    name: "OpenAI Blog",
    category: "aier/foundations",
    enabled: true
  },
  {
    key: "seed_example_deepmind",
    url: "https://deepmind.google/blog/rss/",
    name: "Google DeepMind",
    category: "aier/foundations",
    enabled: true
  },
  {
    key: "seed_example_arxiv-csai",
    url: "https://rss.arxiv.org/rss/cs.AI",
    name: "arXiv cs.AI",
    category: "aier/foundations",
    enabled: true
  },
  // ── engineer/ship ──
  {
    key: "seed_example_netflix-tech",
    url: "https://netflixtechblog.com/feed",
    name: "Netflix TechBlog",
    category: "engineer/ship",
    enabled: true
  },
  {
    key: "seed_example_uber-eng",
    url: "https://www.uber.com/blog/engineering/rss/",
    name: "Uber Engineering",
    category: "engineer/ship",
    enabled: true
  },
  {
    key: "seed_example_stripe-blog",
    url: "https://stripe.com/blog/feed.rss",
    name: "Stripe Blog",
    category: "engineer/ship",
    enabled: true
  },
  // ── engineer/learn/lessons ──
  {
    key: "seed_example_hn",
    url: "https://hnrss.org/frontpage",
    name: "Hacker News",
    category: "engineer/learn/lessons",
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
  },
  {
    key: "seed_example_cnblogs",
    url: "https://feed.cnblogs.com/blog/sitehome/rss",
    name: "博客园",
    category: "engineer/learn/lessons",
    enabled: true
  },
  {
    key: "seed_example_juejin",
    url: "https://juejin.cn/rss",
    name: "掘金",
    category: "engineer/learn/lessons",
    enabled: true
  },
  // ── engineer/learn/lessons/wins ──
  {
    key: "seed_example_engblog",
    url: "https://engineering.fb.com/feed/",
    name: "Meta Engineering",
    category: "engineer/learn/lessons/wins",
    enabled: true
  },
  {
    key: "seed_example_spotify-eng",
    url: "https://engineering.atspotify.com/feed/",
    name: "Spotify Engineering",
    category: "engineer/learn/lessons/wins",
    enabled: true
  },
  // ── engineer/learn/lessons/failures ──
  {
    key: "seed_example_danluu",
    url: "https://danluu.com/atom.xml",
    name: "Dan Luu",
    category: "engineer/learn/lessons/failures",
    enabled: true
  },
  {
    key: "seed_example_incidents",
    url: "https://www.thevoid.community/feed",
    name: "The Void Community",
    category: "engineer/learn/lessons/failures",
    enabled: true
  },
  // ── srer/release ──
  {
    key: "seed_example_github-blog",
    url: "https://github.blog/feed/",
    name: "GitHub Blog",
    category: "srer/release",
    enabled: true
  },
  {
    key: "seed_example_cloudflare",
    url: "https://blog.cloudflare.com/rss/",
    name: "Cloudflare Blog",
    category: "srer/release",
    enabled: true
  },
  {
    key: "seed_example_nginx",
    url: "https://www.nginx.com/feed/",
    name: "NGINX Blog",
    category: "srer/release",
    enabled: true
  },
  // ── producter/frameworks ──
  {
    key: "seed_example_svpg",
    url: "https://www.svpg.com/feed/",
    name: "SVPG",
    category: "producter/frameworks",
    enabled: true
  },
  {
    key: "seed_example_intercom",
    url: "https://www.intercom.com/blog/feed",
    name: "Intercom Blog",
    category: "producter/frameworks",
    enabled: true
  },
  {
    key: "seed_example_lenny",
    url: "https://www.lennysnewsletter.com/feed",
    name: "Lenny's Newsletter",
    category: "producter/frameworks",
    enabled: true
  },
  // ── curator/templates ──
  {
    key: "seed_example_aeon",
    url: "https://aeon.co/feed.rss",
    name: "Aeon",
    category: "curator/templates",
    enabled: true
  },
  {
    key: "seed_example_brainpickings",
    url: "https://www.themarginalian.org/feed/",
    name: "The Marginalian",
    category: "curator/templates",
    enabled: true
  },
  {
    key: "seed_example_farnam",
    url: "https://fs.blog/feed/",
    name: "Farnam Street",
    category: "curator/templates",
    enabled: true
  },
  // ── leader/leadership ──
  {
    key: "seed_example_rand",
    url: "https://randsinrepose.com/feed/",
    name: "Rands in Repose",
    category: "leader/leadership",
    enabled: true
  },
  {
    key: "seed_example_irrational",
    url: "https://lethain.com/feeds.xml",
    name: "Irrational Exuberance (Will Larson)",
    category: "leader/leadership",
    enabled: true
  },
  {
    key: "seed_example_charity",
    url: "https://charity.wtf/feed/",
    name: "Charity Majors",
    category: "leader/leadership",
    enabled: true
  },
  // ── leader/architecture ──
  {
    key: "seed_example_martinfowler",
    url: "https://martinfowler.com/feed.atom",
    name: "Martin Fowler",
    category: "leader/architecture",
    enabled: true
  },
  {
    key: "seed_example_infoq-arch",
    url: "https://www.infoq.com/feed/architecture-design/",
    name: "InfoQ Architecture",
    category: "leader/architecture",
    enabled: true
  },
  {
    key: "seed_example_highscalability",
    url: "https://highscalability.com/feed/",
    name: "High Scalability",
    category: "leader/architecture",
    enabled: true
  }
];
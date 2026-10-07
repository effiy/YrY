// ── Dashboard health ──

export interface DashboardServerStatus {
  running: boolean;
  version: string;
  uptime_seconds: number;
}

export interface DashboardMongoStatus {
  connected: boolean;
  database: string;
}

export interface DashboardSchedulerStatus {
  enabled: boolean;
  type: string;
  interval: number | null;
  cron: Record<string, any> | null;
}

export interface DashboardWatcherStatus {
  running: boolean;
}

export interface DashboardOllamaStatus {
  connected: boolean;
  model_count: number;
  url: string;
}

export interface DashboardObserverStatus {
  throttle_enabled: boolean;
  sampler_enabled: boolean;
  sandbox_enabled: boolean;
  guard_enabled: boolean;
}

export interface DashboardCollectionCounts {
  menus: number;
  users: number;
  roles: number;
  departments: number;
  sessions: number;
  knowledge_files: number;
  rss_sources: number;
}

export interface DashboardHealthData {
  server: DashboardServerStatus;
  mongodb: DashboardMongoStatus;
  scheduler: DashboardSchedulerStatus;
  knowledge_watcher: DashboardWatcherStatus;
  ollama: DashboardOllamaStatus;
  observer: DashboardObserverStatus;
  collections: DashboardCollectionCounts;
}

// ── Dashboard RSS stats ──

export interface RssSourceStats {
  name: string;
  count: number;
}

export interface RssCategoryStats {
  name: string;
  count: number;
}

export interface RssTimelineItem {
  month: string;
  count: number;
}

export interface RssRecentArticle {
  title: string;
  source_name: string;
  author: string;
  published: string;
  category_path: string;
  link: string;
}

export interface RssStatsData {
  total: number;
  sources: RssSourceStats[];
  categories: RssCategoryStats[];
  timeline: RssTimelineItem[];
  recent: RssRecentArticle[];
  /** Count of metadata-only records whose body file is missing on disk. */
  body_missing: number;
}

// ── Dashboard knowledge stats ──

export interface KnowledgeCategoryStats {
  name: string;
  count: number;
}

export interface KnowledgeStatusStats {
  name: string;
  count: number;
}

export interface KnowledgeLifecycleStats {
  name: string;
  count: number;
}

export interface KnowledgeTypeStats {
  name: string;
  count: number;
}

export interface KnowledgeReviewCycleStats {
  name: string;
  count: number;
}

export interface KnowledgeHealthSummary {
  tacit_count: number;
  stale_count: number;
  no_review_cycle_count: number;
  review_coverage_pct: number;
  eligible_count: number;
  unmaintained_count: number;
  orphan_count: number;
}

export interface KnowledgeFileSummary {
  path: string;
  title: string;
  category: string;
  module: string;
  sub_module: string;
  size: number;
  status: string;
  lifecycle: string;
  type: string;
  review_cycle: string;
  updated: string;
  created: string;
  tacit: boolean;
  roles: string[];
  tags: string[];
  benefit: string;
  related_count: number;
  related: string[];
  snippet: string;
}

export interface KnowledgeRecentFile {
  title: string;
  path: string;
  category: string;
  module: string;
  status: string;
  lifecycle: string;
  review_cycle: string;
  updated: string;
}

export interface KnowledgeModuleStats {
  category: string;
  name: string;
  count: number;
  statuses: KnowledgeStatusStats[];
  types: KnowledgeTypeStats[];
  lifecycles: KnowledgeLifecycleStats[];
  roles: KnowledgeRoleStats[];
  stale_count: number;
  tacit_count: number;
  review_coverage_pct: number;
  sub_modules: KnowledgeSubModuleStats[];
}

export interface KnowledgeSubModuleStats {
  name: string;
  count: number;
  statuses: KnowledgeStatusStats[];
  types: KnowledgeTypeStats[];
  lifecycles: KnowledgeLifecycleStats[];
  stale_count: number;
  tacit_count: number;
  review_coverage_pct: number;
}

export interface KnowledgeRoleStats {
  name: string;
  count: number;
}

export interface KnowledgeTagStats {
  name: string;
  count: number;
}

export interface KnowledgeDataQuality {
  total: number; // number of markdown files (only .md files can have frontmatter)
  no_status: number;
  no_type: number;
  no_lifecycle: number;
  no_review_cycle: number;
  no_roles: number;
  no_tags: number;
  no_benefit: number;
  no_title: number;
  complete: number;
  unknown_status: number;
  unknown_type: number;
  unknown_lifecycle: number;
}

export interface KnowledgeSizeDist {
  label: string;
  count: number;
}

export interface KnowledgeAgeDist {
  label: string;
  count: number;
}

export interface KnowledgeStatsData {
  total: number;
  categories: KnowledgeCategoryStats[];
  statuses: KnowledgeStatusStats[];
  lifecycles: KnowledgeLifecycleStats[];
  types: KnowledgeTypeStats[];
  review_cycles: KnowledgeReviewCycleStats[];
  roles: KnowledgeRoleStats[];
  tags: KnowledgeTagStats[];
  health: KnowledgeHealthSummary;
  data_quality: KnowledgeDataQuality;
  files: KnowledgeFileSummary[];
  recent: KnowledgeRecentFile[];
  modules: KnowledgeModuleStats[];
  size_distribution: KnowledgeSizeDist[];
  age_distribution: KnowledgeAgeDist[];
  last_scan_time: string;
}

// ── Dashboard RSS source health ──

export interface RssSourceInfo {
  name: string;
  url: string;
  enabled: boolean;
  article_count: number;
  last_fetch: string;
}

export interface RssSourceHealthData {
  total_sources: number;
  enabled_count: number;
  disabled_count: number;
  total_articles: number;
  sources: RssSourceInfo[];
}

// ── Dashboard organization ──

export interface OrgDepartmentInfo {
  name: string;
  id: string;
  user_count: number;
}

export interface OrgRoleInfo {
  name: string;
  id: string;
  parent: string;
}

export interface OrgUserStats {
  total: number;
  active: number;
  inactive: number;
  by_department: OrgDepartmentInfo[];
  by_gender: Record<string, number>;
}

export interface OrgStatsData {
  users: OrgUserStats;
  roles: OrgRoleInfo[];
  departments: OrgDepartmentInfo[];
}

// ── Dashboard AI chat stats ──

export interface AiModelUsage {
  model: string;
  count: number;
}

export interface AiDailyStats {
  date: string;
  sessions: number;
  messages: number;
}

export interface AiRecentSession {
  title: string;
  key: string;
  message_count: number;
  updated: string;
}

export interface AiStatsData {
  total_sessions: number;
  total_messages: number;
  avg_messages_per_session: number;
  active_sessions_today: number;
  messages_today: number;
  model_usage: AiModelUsage[];
  daily: AiDailyStats[];
  recent: AiRecentSession[];
}

// ── Dashboard service performance stats ──

export interface ServiceCallStats {
  service: string;
  method: string;
  calls: number;
  success: number;
  failed: number;
  avg_duration_ms: number;
  max_duration_ms: number;
  min_duration_ms: number;
}

export interface RecentServiceCall {
  service: string;
  method: string;
  status: string;
  duration_ms: number;
  input_summary: string;
  timestamp: string;
}

export interface ServiceStatsData {
  total_calls: number;
  success_rate: number;
  avg_duration_ms: number;
  total_success: number;
  total_failed: number;
  by_service: ServiceCallStats[];
  recent: RecentServiceCall[];
}

// ── Dashboard RAG stats ──

export interface RagConfigInfo {
  embed_model: string;
  llm_model: string;
  chunk_size: number;
  chunk_overlap: number;
  top_k: number;
  hybrid_retrieval: boolean;
  rerank_enabled: boolean;
  inline_citations: boolean;
  auto_rebuild: boolean;
  knowledge_base_dir: string;
}

export interface RagQueryHistory {
  id: string;
  question: string;
  scope: string;
  result_count: number;
  top_score: number;
  latency_ms: number;
  timestamp: string;
}

export interface RagStatsData {
  built: boolean;
  num_docs: number;
  last_built_at: string;
  persist_dir: string;
  persist_dir_size: number;
  config: RagConfigInfo;
  recent_queries: RagQueryHistory[];
}

// ── Dashboard performance ──

export interface DiskUsage {
  path: string;
  total_gb: number;
  used_gb: number;
  free_gb: number;
  percent: number;
}

export interface MemoryInfo {
  total_gb: number;
  used_gb: number;
  free_gb: number;
  percent: number;
}

export interface ProcessInfo {
  pid: number;
  memory_mb: number;
  cpu_percent: number;
  threads: number;
}

export interface PerformanceData {
  disk: DiskUsage;
  memory: MemoryInfo;
  process: ProcessInfo;
}
import { ref, computed, watch, type Ref } from "vue";
import { queryDocuments } from "@/api/modules/dataService";
import { PROJECT_LABELS } from "@/config";

export type RelatedDomain = "brd" | "tl" | "bug" | "cr" | "story";

export interface RelatedEntry {
  key: string;
  title: string;
  topic?: string;
  domain?: RelatedDomain;
  meta?: Record<string, any>;
  project?: string;
  severity?: string;
  status?: string;
  module?: string;
  priority?: string;
  type?: string;
  assignee?: string;
  updatedAt: number;
}

export interface TopicConfig {
  domain: RelatedDomain;
  topic: string;
  label: string;
  cname: string;
  route: string;
  topLevelProject?: boolean;
}

export const RELATED_TOPICS: TopicConfig[] = [
  { domain: "brd", topic: "brd-engineer", label: "Engineer", cname: "brd_brd-engineer", route: "brdEngineerDetail" },
  { domain: "brd", topic: "brd-tech-lead", label: "Tech Lead", cname: "brd_brd-tech-lead", route: "brdTechLeadDetail" },
  { domain: "brd", topic: "brd-product-manager", label: "Product Manager", cname: "brd_brd-product-manager", route: "brdProductManagerDetail" },
  { domain: "brd", topic: "brd-ai-engineer", label: "AI Engineer", cname: "brd_brd-ai-engineer", route: "brdAiEngineerDetail" },
  { domain: "brd", topic: "brd-new-hire", label: "New Hire", cname: "brd_brd-new-hire", route: "brdNewHireDetail" },
  { domain: "brd", topic: "brd-knowledge-curator", label: "Knowledge Curator", cname: "brd_brd-knowledge-curator", route: "brdKnowledgeCuratorDetail" },
  { domain: "brd", topic: "brd-executive", label: "Executive", cname: "brd_brd-executive", route: "brdExecutiveDetail" },
  { domain: "brd", topic: "brd-oncall-sre", label: "Oncall SRE", cname: "brd_brd-oncall-sre", route: "brdOncallSreDetail" },
  { domain: "tl", topic: "adr-review", label: "ADR", cname: "tech_adr-review", route: "tlrAdrReviewDetail" },
  { domain: "tl", topic: "capacity-cost", label: "Capacity & Cost", cname: "tech_capacity-cost", route: "tlrCapacityCostDetail" },
  { domain: "tl", topic: "capacity-plan", label: "Capacity Plan", cname: "tech_capacity-plan", route: "tlrCapacityPlanDetail" },
  { domain: "tl", topic: "dependency-adoption", label: "Dep Adoption", cname: "tech_dependency-adoption", route: "tlrDependencyAdoptionDetail" },
  { domain: "tl", topic: "dependency-audit", label: "Dep Audit", cname: "tech_dependency-audit", route: "tlrDependencyAuditDetail" },
  { domain: "tl", topic: "dora-metrics", label: "DORA Metrics", cname: "tech_dora-metrics", route: "tlrDoraMetricsDetail" },
  { domain: "tl", topic: "knowledge-evolution", label: "Knowledge Evolution", cname: "tech_knowledge-evolution", route: "tlrKnowledgeEvolutionDetail" },
  { domain: "tl", topic: "maturity-model", label: "Maturity Model", cname: "tech_maturity-model", route: "tlrMaturityModelDetail" },
  { domain: "tl", topic: "mentorship-growth", label: "Mentorship & Growth", cname: "tech_mentorship-growth", route: "tlrMentorshipGrowthDetail" },
  { domain: "tl", topic: "oncall-handover", label: "Oncall Handover", cname: "tech_oncall-handover", route: "tlrOncallHandoverDetail" },
  { domain: "tl", topic: "org-diagnose", label: "Org Diagnose", cname: "tech_org-diagnose", route: "tlrOrgDiagnoseDetail" },
  { domain: "tl", topic: "postmortem", label: "Postmortem", cname: "tech_postmortem", route: "tlrPostmortemDetail" },
  { domain: "tl", topic: "project-bootstrap", label: "Project Bootstrap", cname: "tech_project-bootstrap", route: "tlrProjectBootstrapDetail" },
  { domain: "tl", topic: "project-handoffs", label: "Project Handoff", cname: "tech_project-handoffs", route: "tlrProjectHandoffsDetail" },
  { domain: "tl", topic: "risk-register", label: "Risk", cname: "tech_risk-register", route: "tlrRiskRegisterDetail" },
  { domain: "tl", topic: "roadmap-review", label: "Roadmap", cname: "tech_roadmap-review", route: "tlrRoadmapReviewDetail" },
  { domain: "tl", topic: "tech-debt", label: "Tech Debt", cname: "tech_tech-debt", route: "tlrTechDebtDetail" },
  { domain: "tl", topic: "tech-selection", label: "Tech Selection", cname: "tech_tech-selection", route: "tlrTechSelectionDetail" },
  { domain: "bug", topic: "bugs", label: "Bugs", cname: "bugs", route: "__bug_detail__", topLevelProject: true },
  { domain: "story", topic: "stories", label: "Stories", cname: "stories", route: "__story_detail__", topLevelProject: true },
  { domain: "cr", topic: "summary", label: "Summary", cname: "cr_summary", route: "crSummaryDetail" },
  { domain: "cr", topic: "explain", label: "Explain", cname: "cr_explain", route: "crExplainDetail" },
  { domain: "cr", topic: "security", label: "Security", cname: "cr_security", route: "crSecurityDetail" },
  { domain: "cr", topic: "dependency-risk", label: "Dep Risk", cname: "cr_dependency-risk", route: "crDependencyRiskDetail" },
  { domain: "cr", topic: "access-review", label: "Access Review", cname: "cr_access-review", route: "crAccessReviewDetail" },
  { domain: "cr", topic: "refactor", label: "Refactor", cname: "cr_refactor", route: "crRefactorDetail" },
  { domain: "cr", topic: "perf", label: "Perf", cname: "cr_perf", route: "crPerfDetail" },
  { domain: "cr", topic: "tests", label: "Tests", cname: "cr_tests", route: "crTestsDetail" },
  { domain: "cr", topic: "style", label: "Style", cname: "cr_style", route: "crStyleDetail" },
  { domain: "cr", topic: "api-contract", label: "API Contract", cname: "cr_api-contract", route: "crApiContractDetail" },
  { domain: "cr", topic: "observability-gap", label: "Observability", cname: "cr_observability-gap", route: "crObservabilityGapDetail" },
  { domain: "cr", topic: "concurrency", label: "Concurrency", cname: "cr_concurrency", route: "crConcurrencyDetail" },
  { domain: "cr", topic: "error-handling", label: "Error Handling", cname: "cr_error-handling", route: "crErrorHandlingDetail" },
  { domain: "cr", topic: "dead-code", label: "Dead Code", cname: "cr_dead-code", route: "crDeadCodeDetail" },
  { domain: "cr", topic: "backward-compat", label: "Backward Compat", cname: "cr_backward-compat", route: "crBackwardCompatDetail" },
  { domain: "cr", topic: "i18n-a11y", label: "i18n & A11y", cname: "cr_i18n-a11y", route: "crI18nA11yDetail" }
];

export const RELATED_DOMAIN_ORDER: RelatedDomain[] = ["brd", "tl", "cr", "bug", "story"];

// Module-level cache keyed by project — dedupes parallel consumers (panel + detail page AI Chat).
const cache = new Map<string, Promise<(RelatedEntry & { topic: string; domain: RelatedDomain })[]>>();
let cacheTicker = 0;
const CACHE_TTL_MS = 60_000;
const cacheTimestamps = new Map<string, number>();

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function fetchAllForProject(project: string): Promise<(RelatedEntry & { topic: string; domain: RelatedDomain })[]> {
  // Normalize to lowercase for cross-domain matching (BRD meta-schemas use lowercase enum values)
  const p = project.toLowerCase() || project;
  const now = Date.now();
  const ts = cacheTimestamps.get(p);
  const existing = cache.get(p);
  if (existing && ts && now - ts < CACHE_TTL_MS) return existing;
  const promise = Promise.all(
    RELATED_TOPICS.map(t =>
      queryDocuments<RelatedEntry & { name?: string }>({
        cname: t.cname,
        filter: t.topLevelProject
          ? { project: { $regex: `^${escapeRegex(p)}$`, $options: "i" } }
          : { "meta.project": { $regex: `^${escapeRegex(p)}$`, $options: "i" } },
        pageSize: 50,
        fields: ["key", "title", "name", "topic", "meta", "project", "severity", "status", "module", "priority", "type", "assignee", "updatedAt"],
        orderBy: "updatedAt",
        orderType: "desc"
      })
        .then(res => (res.data?.list ?? []).map(e => ({
          ...e,
          title: e.title ?? e.name ?? e.key,
          topic: t.topic,
          domain: t.domain
        }) as RelatedEntry & { topic: string; domain: RelatedDomain }))
        .catch(() => [] as (RelatedEntry & { topic: string; domain: RelatedDomain })[])
    )
  ).then(rows => rows.flat());
  cache.set(p, promise);
  cacheTimestamps.set(p, now);
  // Bump ticker so a stale read after TTL invalidation is detectable.
  cacheTicker++;
  return promise;
}

export interface UseRelatedByProjectOptions {
  currentKey?: string;
  currentTopic?: string;
}

export interface UseRelatedByProject {
  loading: Ref<boolean>;
  error: Ref<string | null>;
  allEntries: Ref<(RelatedEntry & { topic: string; domain: RelatedDomain })[]>;
  filtered: Ref<(RelatedEntry & { topic: string; domain: RelatedDomain })[]>;
  totalCount: Ref<number>;
  perDomainCount: Ref<Record<RelatedDomain, number>>;
  grouped: Ref<{ domain: RelatedDomain; groups: { config: TopicConfig; list: (RelatedEntry & { topic: string; domain: RelatedDomain })[] }[] }[]>;
  refresh: () => void;
}

export function useRelatedByProject(project: () => string | undefined, opts: UseRelatedByProjectOptions = {}): UseRelatedByProject {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const allEntries = ref<(RelatedEntry & { topic: string; domain: RelatedDomain })[]>([]);

  const filtered = computed(() =>
    allEntries.value.filter(e => {
      if (opts.currentKey && e.key === opts.currentKey) return false;
      if (opts.currentTopic && e.topic === opts.currentTopic) return false;
      return true;
    })
  );

  const totalCount = computed(() => filtered.value.length);

  const perDomainCount = computed(() => {
    const out: Record<RelatedDomain, number> = { brd: 0, tl: 0, cr: 0, bug: 0, story: 0 };
    for (const e of filtered.value) {
      if (e.domain in out) out[e.domain]++;
    }
    return out;
  });

  const grouped = computed(() => {
    return RELATED_DOMAIN_ORDER
      .map(d => {
        const topicsForDomain = RELATED_TOPICS.filter(t => t.domain === d);
        const groups = topicsForDomain
          .map(t => {
            const list = filtered.value.filter(e => e.topic === t.topic);
            return { config: t, list };
          })
          .filter(g => g.list.length > 0);
        return { domain: d, groups };
      })
      .filter(d => d.groups.length > 0);
  });

  async function load() {
    const p = project();
    if (!p) {
      allEntries.value = [];
      return;
    }
    loading.value = true;
    error.value = null;
    try {
      allEntries.value = await fetchAllForProject(p);
    } catch (e: any) {
      error.value = e?.message || "Failed to load related entries";
    } finally {
      loading.value = false;
    }
  }

  function refresh() {
    const raw = project();
    if (!raw) return;
    const p = raw.toLowerCase() || raw;
    cache.delete(p);
    cacheTimestamps.delete(p);
    load();
  }

  watch(() => project(), load, { immediate: true });

  return { loading, error, allEntries, filtered, totalCount, perDomainCount, grouped, refresh };
}

// One-shot helper for callers that just want the raw list (e.g. AI Chat enrichment).
export async function fetchRelatedByProject(project: string): Promise<(RelatedEntry & { topic: string; domain: RelatedDomain })[]> {
  return fetchAllForProject(project);
}

// Build a markdown "## Related Entries (by project)" section for AI Chat payloads.
// Returns "" when there are no siblings (caller should skip appending in that case).
export async function buildRelatedEntriesSection(
  project: string,
  hostKey?: string,
  hostTopic?: string
): Promise<string> {
  if (!project) return "";
  const p = project.toLowerCase() || project;
  const displayName = PROJECT_LABELS[p] ?? project;
  let related: (RelatedEntry & { topic: string; domain: RelatedDomain })[];
  try {
    related = await fetchAllForProject(project);
  } catch {
    return "";
  }
  const others = related.filter(e => !(hostKey && e.key === hostKey && hostTopic && e.topic === hostTopic));
  if (!others.length) return "";
  const domainsPresent = RELATED_DOMAIN_ORDER.filter(d => others.some(e => e.domain === d));
  const lines: string[] = [
    "",
    "## Related Entries (by project)",
    "",
    `_Sharing project \`${displayName}\` — ${others.length} sibling${others.length === 1 ? "" : "s"} across ${domainsPresent.length} domain(s)._`,
    ""
  ];
  for (const d of RELATED_DOMAIN_ORDER) {
    const inDomain = others.filter(e => e.domain === d);
    if (!inDomain.length) continue;
    lines.push(`**${d.toUpperCase()}** (${inDomain.length}):`, "");
    for (const e of inDomain.slice(0, 10)) {
      const cfg = RELATED_TOPICS.find(t => t.domain === e.domain && t.topic === e.topic);
      const stat = e.domain === "bug" || e.domain === "story" ? e.status : e.meta?.status;
      const bits = [stat ? `[${stat}]` : "", e.title].filter(Boolean).join(" ");
      lines.push(`- ${cfg?.label ?? e.topic}: ${bits} (\`${e.key}\`)`);
    }
    if (inDomain.length > 10) lines.push(`- _…${inDomain.length - 10} more_`);
    lines.push("");
  }
  return lines.join("\n");
}

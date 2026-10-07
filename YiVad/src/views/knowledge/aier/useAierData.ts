import { ref, computed, onUnmounted } from "vue";
import { scanKnowledge } from "@/api/modules/knowledgeService";
import type { KnowledgeFileEntry } from "@/api/interface/yiAi";

export interface SubdirDef {
  id: string;
  icon: string;
  label: string;
  color: string;
  desc: string;
}

export interface AierStats {
  total: number;
  stable: number;
  draft: number;
  evolving: number;
  deprecated: number;
  archived: number;
  reviewOk: number;
  reviewStale: number;
  lastUpdated: string;
}

export interface LearningStep {
  step: number;
  phase: string;
  phaseColor: string;
  title: string;
  file: string;
}

export interface QuickRef {
  want: string;
  file: string;
  icon: string;
}

const SUBDIRS: SubdirDef[] = [
  {
    id: "foundations",
    icon: "🧠",
    label: "Foundations",
    color: "#1677ff",
    desc: "LLM architecture primitives — Transformer, Attention, KV-Cache, MoE, quantization, alignment, RAG patterns, AI safety."
  },
  {
    id: "methods",
    icon: "📐",
    label: "Methods",
    color: "#10b981",
    desc: "Agent architecture patterns, prompt engineering, LLM/Agent evaluation, harness plugin architecture, 7 prompt templates."
  },
  {
    id: "platform",
    icon: "🖥️",
    label: "Platform",
    color: "#7c3aed",
    desc: "LLM comparison, embedding model selection, vector database trade-offs for RAG infrastructure."
  },
  {
    id: "machine-learning",
    icon: "🔬",
    label: "ML",
    color: "#f59e0b",
    desc: "Traditional ML — classification, clustering, regression, anomaly detection as lightweight LLM alternatives."
  },
  {
    id: "okr",
    icon: "🎯",
    label: "OKR",
    color: "#ef4444",
    desc: "AI team quarterly OKRs — goal tracking, key results, and evidence for AI engineering initiatives."
  }
];

const LEARNING_PATH: LearningStep[] = [
  { step: 1, phase: "Beginner", phaseColor: "#10b981", title: "LLM Fundamentals — Tokens, context windows, Transformer core concepts", file: "foundations/01-基础-LLM基础.md" },
  { step: 2, phase: "Beginner", phaseColor: "#10b981", title: "Prompt Engineering — Master prompt design basics", file: "methods/05-方法-提示词工程.md" },
  { step: 3, phase: "Beginner", phaseColor: "#10b981", title: "Agent Architecture Patterns — YiAi Agent loop architecture", file: "methods/01-方法-Agent架构模式.md" },
  { step: 4, phase: "Intermediate", phaseColor: "#1677ff", title: "RAG Design Patterns — Hybrid retrieval, chunking, augmentation", file: "foundations/02-基础-RAG设计模式.md" },
  { step: 5, phase: "Intermediate", phaseColor: "#1677ff", title: "LLM Model Comparison — Model selection decision framework", file: "platform/02-平台-LLM对比.md" },
  { step: 6, phase: "Intermediate", phaseColor: "#1677ff", title: "LLM Evaluation — Build quality assessment for AI outputs", file: "methods/04-方法-LLM评估.md" },
  { step: 7, phase: "Intermediate", phaseColor: "#1677ff", title: "Agent Evaluation — Task completion rate, tool accuracy", file: "methods/02-方法-Agent评估.md" },
  { step: 8, phase: "Advanced", phaseColor: "#7c3aed", title: "AI Safety & Guardrails — Injection attacks, jailbreak, defense", file: "foundations/03-基础-AI安全与防护.md" },
  { step: 9, phase: "Advanced", phaseColor: "#7c3aed", title: "Agent Harness Plugin Architecture — Tool extension mechanism", file: "methods/03-方法-Agent-Harness插件架构.md" },
  { step: 10, phase: "Advanced", phaseColor: "#7c3aed", title: "Embedding Model Selection — RAG retrieval quality foundation", file: "platform/01-平台-Embedding模型选型.md" },
  { step: 11, phase: "Advanced", phaseColor: "#7c3aed", title: "Vector Database Selection — Storage and retrieval architecture", file: "platform/03-平台-向量数据库选型.md" },
  { step: 12, phase: "Advanced", phaseColor: "#7c3aed", title: "Traditional ML Patterns — Lightweight alternatives to LLMs", file: "machine-learning/01-机器学习-传统机器学习模式.md" }
];

const QUICK_REFS: QuickRef[] = [
  { want: "Understand LLM core concepts", file: "foundations/01-基础-LLM基础.md", icon: "🧠" },
  { want: "Design or optimize RAG", file: "foundations/02-基础-RAG设计模式.md", icon: "🔍" },
  { want: "Design Agent architecture", file: "methods/01-方法-Agent架构模式.md", icon: "🤖" },
  { want: "Evaluate Agent/LLM quality", file: "methods/04-方法-LLM评估.md", icon: "📊" },
  { want: "Write better prompts", file: "methods/05-方法-提示词工程.md", icon: "✍️" },
  { want: "Compare LLM models", file: "platform/02-平台-LLM对比.md", icon: "⚖️" },
  { want: "Choose embedding model", file: "platform/01-平台-Embedding模型选型.md", icon: "📐" },
  { want: "Learn AI security", file: "foundations/03-基础-AI安全与防护.md", icon: "🛡️" },
  { want: "Choose vector database", file: "platform/03-平台-向量数据库选型.md", icon: "🗄️" },
  { want: "Learn traditional ML", file: "machine-learning/01-机器学习-传统机器学习模式.md", icon: "🔬" }
];

export function useAierData() {
  const files = ref<KnowledgeFileEntry[]>([]);
  const loading = ref(false);
  const error = ref("");
  const lastUpdated = ref<Date | null>(null);
  let refreshTimer: ReturnType<typeof setInterval> | null = null;

  const filesByDir = computed<Record<string, KnowledgeFileEntry[]>>(() => {
    const map: Record<string, KnowledgeFileEntry[]> = {};
    for (const dir of SUBDIRS) map[dir.id] = [];
    for (const f of files.value) {
      const dirName = f.path.replace(/^aier\//, "").split("/")[0];
      if (map[dirName]) map[dirName].push(f);
    }
    for (const dir of SUBDIRS) {
      map[dir.id].sort((a, b) => a.name.localeCompare(b.name));
    }
    return map;
  });

  const stats = computed<AierStats>(() => {
    const all = files.value;
    const total = all.length;
    const byStatus = (s: string) => all.filter(f => f.meta?.status === s).length;
    const now = Date.now();
    const REVIEW_CYCLES: Record<string, number> = { weekly: 7, monthly: 30, quarterly: 90, yearly: 365, annual: 365 };
    let reviewOk = 0;
    let reviewStale = 0;
    for (const f of all) {
      const cycle = f.meta?.review_cycle;
      const updated = f.updatedAt;
      if (cycle && updated) {
        const days = (now - updated * 1000) / (86400 * 1000);
        const threshold = REVIEW_CYCLES[cycle] || 90;
        if (days <= threshold) reviewOk++;
        else reviewStale++;
      }
    }
    return {
      total,
      stable: byStatus("stable"),
      draft: byStatus("draft"),
      evolving: byStatus("evolving"),
      deprecated: byStatus("deprecated"),
      archived: byStatus("archived"),
      reviewOk,
      reviewStale,
      lastUpdated: lastUpdated.value ? lastUpdated.value.toLocaleTimeString() : "--"
    };
  });

  function resolveFilePath(fileRef: string): KnowledgeFileEntry | undefined {
    const fullPath = `aier/${fileRef}`;
    return files.value.find(f => f.path === fullPath);
  }

  async function refresh() {
    error.value = "";
    try {
      const res = await scanKnowledge("aier");
      files.value = (res.categories?.flatMap(c => c.files) ?? []).filter(f => f.meta?.type !== "rss");
      lastUpdated.value = new Date();
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : "Failed to load knowledge data";
      if (files.value.length === 0) files.value = [];
    }
  }

  async function load() {
    loading.value = true;
    await refresh();
    loading.value = false;
    refreshTimer = setInterval(refresh, 60_000);
  }

  onUnmounted(() => {
    if (refreshTimer) clearInterval(refreshTimer);
  });

  return {
    files,
    filesByDir,
    stats,
    loading,
    error,
    lastUpdated,
    subdirs: SUBDIRS,
    learningPath: LEARNING_PATH,
    quickRefs: QUICK_REFS,
    resolveFilePath,
    load,
    refresh
  };
}
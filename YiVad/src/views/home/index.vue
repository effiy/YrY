<template>
  <div class="daily-workstation">
    <!-- ═══ Header: Date Picker ═══ -->
    <div class="dw__header">
      <div class="dw__header-left">
        <h1 class="dw__title">Daily Workstation</h1>
        <el-date-picker
          v-model="selectedDate"
          type="date"
          placeholder="Pick a date"
          format="YYYY/MM/DD"
          value-format="YYYY-MM-DD"
          :clearable="false"
          @change="onDateChange"
        />
        <el-tag size="default" :type="isToday ? 'primary' : 'info'">
          {{ isToday ? 'Today' : selectedDate }}
        </el-tag>
        <span class="dw__weekday">{{ weekdayLabel }}</span>
      </div>
      <div class="dw__header-right">
        <el-button size="small" @click="router.push('/executiver/okr')">OKR →</el-button>
        <el-button size="small" type="primary" @click="router.push('/aiChat')">YiKnowledge</el-button>
      </div>
    </div>

    <!-- ═══ Two-Column Layout ═══ -->
    <div class="dw__main">
      <!-- Left: Daily Tasks + Standup -->
      <div class="dw__left">

        <!-- ═══ My Daily Tasks ═══ -->
        <section class="dw__section">
          <div class="dw__section-head">
            <h2 class="dw__section-title">My Daily Tasks</h2>
            <el-tag size="small" :type="taskStats.done === taskStats.total && taskStats.total > 0 ? 'success' : 'warning'">
              {{ taskStats.done }}/{{ taskStats.total }} done
            </el-tag>
          </div>

          <!-- Add task input -->
          <div class="dw__task-add">
            <el-input
              v-model="newTaskText"
              placeholder="Add a task for today..."
              size="default"
              clearable
              @keyup.enter="addTask"
            >
              <template #append>
                <el-button :icon="Plus" @click="addTask" :disabled="!newTaskText.trim()" />
              </template>
            </el-input>
          </div>

          <!-- Task list -->
          <div v-if="dailyTasks.length" class="dw__task-list">
            <div
              v-for="task in dailyTasks"
              :key="task.id"
              class="dw__task-item"
              :class="{ 'dw__task-item--done': task.done }"
            >
              <el-checkbox v-model="task.done" @change="saveTasks" />
              <span class="dw__task-text" :class="{ 'dw__task-text--done': task.done }">{{ task.text }}</span>
              <el-button text size="small" type="danger" :icon="Delete" class="dw__task-delete" @click="removeTask(task.id)" />
            </div>
          </div>
          <div v-else class="dw__task-empty">
            <span class="dw__task-empty-icon">📝</span>
            <span>No tasks yet. Add your first task above.</span>
          </div>
        </section>

        <!-- ═══ Today's Focus ═══ -->
        <section class="dw__section">
          <div class="dw__section-head">
            <h2 class="dw__section-title">Today's Focus</h2>
          </div>
          <div class="dw__focus">
            <div class="dw__focus-icon">🔦</div>
            <div class="dw__focus-body">
              <span class="dw__focus-label">What's the one thing that must move forward today?</span>
              <span class="dw__focus-text">{{ dailyReport.focus }}</span>
            </div>
          </div>
        </section>

        <!-- ═══ Overnight Incidents ═══ -->
        <section v-if="dailyReport.overnightIncidents.length" class="dw__section">
          <div class="dw__section-head">
            <h2 class="dw__section-title">Overnight / Urgent</h2>
          </div>
          <div class="dw__incidents">
            <div v-for="inc in dailyReport.overnightIncidents" :key="inc.id" class="dw__incident-item">
              <el-tag :type="inc.severityType" size="small">{{ inc.severity }}</el-tag>
              <span class="dw__incident-text">{{ inc.text }}</span>
              <span class="dw__incident-owner">{{ inc.owner }}</span>
            </div>
          </div>
        </section>

        <!-- ═══ Role Standup ═══ -->
        <section class="dw__section">
          <div class="dw__section-head">
            <h2 class="dw__section-title">Team Standup</h2>
            <span class="dw__section-date">{{ selectedDate }}</span>
          </div>
          <div class="dw__standup-grid">
            <div
              v-for="role in dailyReport.roles"
              :key="role.id"
              class="dw__standup-card"
              :class="{ 'dw__standup-card--blocker': role.blocker }"
              @click="router.push(`/executiver/okr/${role.id}`)"
            >
              <div class="dw__standup-head">
                <span class="dw__standup-icon">{{ role.icon }}</span>
                <span class="dw__standup-role">{{ role.name }}</span>
                <el-tag :type="role.moodType" size="small" effect="plain">{{ role.mood }}</el-tag>
              </div>
              <ol class="dw__standup-list">
                <li v-for="(t, i) in role.today" :key="i">{{ t }}</li>
              </ol>
              <div v-if="role.blocker" class="dw__standup-blocker">
                <span>🚧 {{ role.blocker }}</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- Right: Checklist + Quick Links -->
      <div class="dw__right">
        <!-- ═══ Daily Cleanup ═══ -->
        <div class="dw__section-head">
          <h2 class="dw__section-title">Daily Cleanup</h2>
          <el-tag size="small" :type="checklistSummary.completed === checklistSummary.total ? 'success' : 'warning'">
            {{ checklistSummary.completed }}/{{ checklistSummary.total }}
          </el-tag>
        </div>

        <div v-for="group in checklistGroups" :key="group.key" class="dw__checklist-col">
          <div class="dw__checklist-header">
            <span class="dw__checklist-header-icon">{{ group.icon }}</span>
            <span>{{ group.label }}</span>
          </div>
          <div class="dw__checklist-items">
            <div
              v-for="item in group.items"
              :key="item.id"
              class="dw__checklist-item"
              :class="{ 'dw__checklist-item--done': item.done }"
            >
              <el-checkbox v-model="item.done" />
              <div class="dw__checklist-item-body">
                <span class="dw__checklist-item-text">{{ item.text }}</span>
                <span v-if="item.owner" class="dw__checklist-item-owner">{{ item.owner }}</span>
                <span v-if="item.value" class="dw__checklist-item-value">{{ item.value }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Sign-off -->
        <div class="dw__checklist-signoff">
          <div class="dw__checklist-signoff-item" v-for="sig in dailyChecklist.signoffs" :key="sig.role">
            <el-tag :type="sig.signed ? 'success' : 'info'" size="small" effect="dark">{{ sig.role }}</el-tag>
            <span class="dw__checklist-signoff-status">{{ sig.signed ? '✓' : '○' }}</span>
            <span v-if="sig.time" class="dw__checklist-signoff-time">{{ sig.time }}</span>
          </div>
        </div>

        <!-- Quick Links -->
        <div class="dw__quick-links">
          <h3 class="dw__quick-links-title">Quick Links</h3>
          <el-button size="small" @click="router.push('/executiver/okr')">OKR Dashboard</el-button>
          <el-button size="small" @click="router.push('/executiver/rss')">RSS Manager</el-button>
          <el-button size="small" @click="router.push('/pipeline')">Pipeline</el-button>
          <el-button size="small" @click="router.push('/skills')">Skills</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="home">
import { computed, reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { Plus, Delete } from "@element-plus/icons-vue";

const router = useRouter();

// ═══════════════════════════════════════════════
// Date
// ═══════════════════════════════════════════════
const today = "2026-08-14";
const selectedDate = ref(today);

const isToday = computed(() => selectedDate.value === today);

const weekdayLabel = computed(() => {
  const map: Record<string, string> = {
    "2026-08-10": "Monday", "2026-08-11": "Tuesday", "2026-08-12": "Wednesday",
    "2026-08-13": "Thursday", "2026-08-14": "Thursday", "2026-08-15": "Friday",
    "2026-08-16": "Saturday", "2026-08-17": "Sunday"
  };
  return map[selectedDate.value] || "";
});

// ═══════════════════════════════════════════════
// My Daily Tasks (localStorage persisted)
// ═══════════════════════════════════════════════
interface DailyTask {
  id: number;
  text: string;
  done: boolean;
}

const STORAGE_KEY = "dw_tasks";
const dailyTasks = ref<DailyTask[]>([]);
const newTaskText = ref("");
let nextId = 1;

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const all: Record<string, DailyTask[]> = raw ? JSON.parse(raw) : {};
    dailyTasks.value = all[selectedDate.value] || [];
    nextId = dailyTasks.value.reduce((max, t) => Math.max(max, t.id), 0) + 1;
  } catch {
    dailyTasks.value = [];
  }
}

function saveTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const all: Record<string, DailyTask[]> = raw ? JSON.parse(raw) : {};
    all[selectedDate.value] = dailyTasks.value;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch { /* localStorage full or unavailable */ }
}

function addTask() {
  const text = newTaskText.value.trim();
  if (!text) return;
  dailyTasks.value.push({ id: nextId++, text, done: false });
  newTaskText.value = "";
  saveTasks();
}

function removeTask(id: number) {
  dailyTasks.value = dailyTasks.value.filter((t) => t.id !== id);
  saveTasks();
}

function onDateChange() {
  loadTasks();
}

const taskStats = computed(() => {
  const total = dailyTasks.value.length;
  const done = dailyTasks.value.filter((t) => t.done).length;
  return { total, done };
});

loadTasks();

// ═══════════════════════════════════════════════
// Daily Report
// ═══════════════════════════════════════════════
const dailyReport = {
  focus: "Daily Cleanup + Morning Report module launch · YiVad OKR page final optimization · Leader test coverage sprint kickoff",
  overnightIncidents: [
    { id: "inc-1", severity: "P1", severityType: "danger" as const, text: "YiAi LLM streaming endpoint P99 latency spike to 8.2s at 02:14–02:38", owner: "SRE Lead" },
    { id: "inc-2", severity: "P2", severityType: "warning" as const, text: "YiPet content script injection failed on 2 internal platforms after platform update", owner: "PM YiPet" }
  ],
  roles: [
    {
      id: "executiver", name: "Executive", icon: "🏢", mood: "Focused", moodType: "primary" as const,
      today: ["Finalize Q3 all-hands presentation", "Approve Q4 budget allocation v2", "1:1 with Tech Lead — test coverage acceleration"],
      blocker: ""
    },
    {
      id: "producter", name: "Product", icon: "📋", mood: "Productive", moodType: "success" as const,
      today: ["Cross-project integration: shared UI component spec draft", "YiPet extension rating collection — user survey design", "YiVad admin maturity: role views milestone check"],
      blocker: "YiPet extension rating — no feedback channel yet"
    },
    {
      id: "leader", name: "Leader", icon: "🧭", mood: "Urgent", moodType: "danger" as const,
      today: ["Test coverage acceleration sprint: reassign 2 engineers to Vitest migration", "LLM cost optimization: target model selection for non-critical tasks", "ADR-017: OpenAPI schema generation architecture review"],
      blocker: "Test coverage: YiVad 25%, YiPet 10% — need sprint dedication"
    },
    {
      id: "engineer", name: "Engineer", icon: "⚡", mood: "Steady", moodType: "success" as const,
      today: ["vue-tsc error resolution: target 5 errors fixed today", "Developer onboarding guide: add Rsbuild section", "PR review: YiPet multi-entry build optimization"],
      blocker: ""
    },
    {
      id: "srer", name: "SRE", icon: "🔧", mood: "Alert", moodType: "warning" as const,
      today: ["Postmortem: P1 latency spike — draft within 24h", "Alert coverage: add remaining 5 endpoint monitors", "Error budget dashboard: trend visualization deploy"],
      blocker: "Alert coverage gap — 5 endpoints still unmonitored"
    },
    {
      id: "aier", name: "AI Engineer", icon: "🤖", mood: "Building", moodType: "primary" as const,
      today: ["A/B test framework: deploy v1 to staging environment", "RAG relevance benchmark: add 20 new test queries", "Cost-per-quality-point metric: define calculation formula"],
      blocker: "A/B test framework — staging environment access pending"
    },
    {
      id: "curator", name: "Curator", icon: "📦", mood: "Organized", moodType: "success" as const,
      today: ["Quarterly archive audit: Q2 deprecated files migration", "Governance dashboard: automate weekly update script", "Engage role owners: 8 stalled files need readiness review"],
      blocker: ""
    }
  ]
};

// ═══════════════════════════════════════════════
// Daily Cleanup Checklist
// ═══════════════════════════════════════════════
const dailyChecklist = reactive({
  team: [
    { id: "t1", text: "All PRs reviewed and merged or commented", owner: "Engineer Lead", done: true },
    { id: "t2", text: "Daily standup notes posted to team channel", owner: "Each role lead", done: true },
    { id: "t3", text: "Blockers escalated to appropriate owner", owner: "All", done: true },
    { id: "t4", text: "Today's commits pass CI (lint + type-check)", owner: "Engineer Lead", done: false },
    { id: "t5", text: "Meeting notes committed to YiKnowledge", owner: "All", done: false }
  ],
  system: [
    { id: "s1", text: "YiAi API health check (availability + latency)", value: "99.7% · P99 320ms", done: true },
    { id: "s2", text: "Error budget status check", value: "65% remaining", done: true },
    { id: "s3", text: "MongoDB slow query log review", value: "0 slow queries", done: true },
    { id: "s4", text: "LLM API cost within daily budget", value: "$18.40 / $25.00", done: true },
    { id: "s5", text: "Backup verification (last 24h)", done: false }
  ],
  knowledge: [
    { id: "k1", text: "New KB files: frontmatter complete", owner: "Curator", done: true },
    { id: "k2", text: "Inbox triaged: 0 items older than 24h", owner: "Curator", done: true },
    { id: "k3", text: "Any incident today → postmortem draft started", owner: "SRE Lead", done: false },
    { id: "k4", text: "Significant decisions → ADR filed or updated", owner: "Tech Lead", done: false },
    { id: "k5", text: "Code changes with non-obvious logic → KB lesson filed", owner: "Engineer Lead", done: false }
  ],
  signoffs: [
    { role: "SRE", signed: true, time: "18:30" },
    { role: "Engineer", signed: false },
    { role: "AI Engineer", signed: false },
    { role: "Product", signed: false },
    { role: "Leader", signed: false },
    { role: "Curator", signed: true, time: "17:45" },
    { role: "Executive", signed: false }
  ]
});

const checklistGroups = computed(() => [
  { key: "team", icon: "👥", label: "Team Cleanup", items: dailyChecklist.team },
  { key: "system", icon: "🖥️", label: "System Cleanup", items: dailyChecklist.system },
  { key: "knowledge", icon: "📚", label: "Knowledge Cleanup", items: dailyChecklist.knowledge }
]);

const checklistSummary = computed(() => {
  const all = [...dailyChecklist.team, ...dailyChecklist.system, ...dailyChecklist.knowledge];
  return { total: all.length, completed: all.filter((i) => i.done).length };
});
</script>

<style scoped lang="scss">
.daily-workstation {
  display: flex; flex-direction: column; box-sizing: border-box;
  height: calc(100vh - 95px); min-height: 0; padding: 24px; overflow: auto;
  background: var(--el-bg-color-page);
}

// ── Header ─────────────────────────────────────
.dw__header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 20px; flex-wrap: wrap; gap: 12px;
}
.dw__header-left { display: flex; align-items: center; gap: 12px; }
.dw__header-right { display: flex; gap: 8px; }
.dw__title { margin: 0; font-size: 22px; font-weight: 700; white-space: nowrap; }
.dw__weekday { font-size: 13px; color: var(--el-text-color-secondary); font-weight: 600; }

// ── Main Layout ────────────────────────────────
.dw__main {
  display: grid; grid-template-columns: 1fr 380px; gap: 24px; align-items: start;
}
.dw__left { display: flex; flex-direction: column; gap: 20px; min-width: 0; }
.dw__right {
  position: sticky; top: 24px;
  display: flex; flex-direction: column; gap: 12px;
}

// ── Section ────────────────────────────────────
.dw__section-head { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.dw__section-title { margin: 0; font-size: 17px; font-weight: 700; }
.dw__section-date { font-size: 12px; color: var(--el-text-color-placeholder); margin-left: auto; }

// ── My Daily Tasks ─────────────────────────────
.dw__task-add { margin-bottom: 12px; }
.dw__task-list { display: flex; flex-direction: column; gap: 4px; }
.dw__task-item {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 12px; border-radius: 8px;
  background: var(--el-bg-color); border: 1px solid var(--el-border-color-lighter);
  transition: background .15s;
  &:hover { background: var(--el-fill-color-light); }
  &:hover .dw__task-delete { opacity: 1; }
}
.dw__task-item--done { background: var(--el-fill-color-lighter); }
.dw__task-text { flex: 1; font-size: 14px; color: var(--el-text-color-primary); line-height: 1.4; }
.dw__task-text--done { text-decoration: line-through; color: var(--el-text-color-placeholder); }
.dw__task-delete { opacity: 0; transition: opacity .15s; flex-shrink: 0; }
.dw__task-empty {
  display: flex; align-items: center; gap: 10px; padding: 24px 16px;
  color: var(--el-text-color-placeholder); font-size: 13px;
  justify-content: center; background: var(--el-fill-color-lighter);
  border-radius: 8px; border: 1px dashed var(--el-border-color-lighter);
}
.dw__task-empty-icon { font-size: 20px; opacity: .6; }

// ── Today's Focus ──────────────────────────────
.dw__focus {
  display: flex; align-items: flex-start; gap: 14px;
  padding: 16px 20px; background: linear-gradient(135deg, var(--el-color-primary-light-9), var(--el-color-primary-light-8));
  border-radius: 10px; border-left: 4px solid var(--el-color-primary);
}
.dw__focus-icon { font-size: 24px; flex-shrink: 0; margin-top: 2px; }
.dw__focus-body { display: flex; flex-direction: column; gap: 4px; }
.dw__focus-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; color: var(--el-color-primary); }
.dw__focus-text { font-size: 14px; font-weight: 600; color: var(--el-text-color-primary); line-height: 1.5; }

// ── Overnight Incidents ────────────────────────
.dw__incidents {
  padding: 12px 16px; background: var(--el-color-danger-light-9);
  border-radius: 8px; border: 1px solid var(--el-color-danger-light-7);
  display: flex; flex-direction: column; gap: 6px;
}
.dw__incident-item { display: flex; align-items: center; gap: 8px; font-size: 12px; }
.dw__incident-text { flex: 1; color: var(--el-text-color-primary); }
.dw__incident-owner { font-weight: 600; color: var(--el-text-color-secondary); font-size: 11px; white-space: nowrap; }

// ── Team Standup ───────────────────────────────
.dw__standup-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 10px;
}
.dw__standup-card {
  padding: 12px 14px; background: var(--el-bg-color); border-radius: 10px;
  border: 1px solid var(--el-border-color-lighter); border-left: 3px solid var(--el-color-primary);
  box-shadow: 0 1px 3px rgba(0,0,0,.04);
  cursor: pointer; transition: box-shadow .2s, border-color .2s;
  &:hover { border-color: var(--el-color-primary-light-5); box-shadow: 0 2px 8px rgba(0,0,0,.08); }
}
.dw__standup-card--blocker { border-left-color: var(--el-color-danger); }
.dw__standup-head { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.dw__standup-icon { font-size: 18px; }
.dw__standup-role { font-weight: 700; font-size: 13px; flex: 1; }
.dw__standup-list { margin: 0; padding-left: 22px; font-size: 12px; color: var(--el-text-color-regular); line-height: 1.6; display: flex; flex-direction: column; gap: 2px; }
.dw__standup-blocker {
  margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--el-border-color-lighter);
  font-size: 11px; color: var(--el-color-danger); font-weight: 600;
}

// ── Right: Checklist ───────────────────────────
.dw__checklist-col {
  padding: 14px; background: var(--el-bg-color); border-radius: 10px;
  border: 1px solid var(--el-border-color-lighter);
  box-shadow: 0 1px 3px rgba(0,0,0,.04);
}
.dw__checklist-header {
  display: flex; align-items: center; gap: 8px; margin-bottom: 10px;
  font-weight: 700; font-size: 13px; color: var(--el-text-color-primary);
}
.dw__checklist-header-icon { font-size: 16px; }
.dw__checklist-items { display: flex; flex-direction: column; gap: 4px; }
.dw__checklist-item {
  display: flex; align-items: flex-start; gap: 8px; padding: 5px 8px;
  border-radius: 6px; background: var(--el-fill-color-light);
}
.dw__checklist-item--done { opacity: .5; }
.dw__checklist-item-body { display: flex; flex-direction: column; gap: 1px; }
.dw__checklist-item-text { font-size: 12px; color: var(--el-text-color-primary); line-height: 1.4; }
.dw__checklist-item-owner { font-size: 10px; color: var(--el-text-color-secondary); font-weight: 600; }
.dw__checklist-item-value { font-size: 11px; color: var(--el-color-success); font-weight: 600; font-family: monospace; }

.dw__checklist-signoff {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  padding: 10px 14px; background: var(--el-fill-color-light); border-radius: 8px;
}
.dw__checklist-signoff-item { display: flex; align-items: center; gap: 5px; font-size: 11px; }
.dw__checklist-signoff-status { font-weight: 600; color: var(--el-text-color-secondary); }
.dw__checklist-signoff-time { font-size: 10px; color: var(--el-text-color-placeholder); font-family: monospace; }

// ── Quick Links ────────────────────────────────
.dw__quick-links {
  padding: 14px; background: var(--el-bg-color); border-radius: 10px;
  border: 1px solid var(--el-border-color-lighter);
  box-shadow: 0 1px 3px rgba(0,0,0,.04);
  display: flex; flex-wrap: wrap; gap: 6px;
}
.dw__quick-links-title { margin: 0 0 4px; font-size: 13px; font-weight: 700; width: 100%; }

// ── Responsive ─────────────────────────────────
@media (width <= 1200px) {
  .dw__main { grid-template-columns: 1fr; }
  .dw__right { position: static; }
}
@media (width <= 768px) {
  .dw__standup-grid { grid-template-columns: 1fr; }
  .dw__header { flex-direction: column; align-items: flex-start; }
}
</style>
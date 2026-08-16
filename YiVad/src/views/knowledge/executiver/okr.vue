<template>
  <div class="okr">
    <ExecutiverQuickNav active="okr" />
    <div class="okr__head">
      <RoleNav v-model="selectedRoles" multiple all />
      <div class="okr__filters">
        <el-select v-model="monthFilter" size="small" clearable placeholder="All months" style="width: 140px">
          <el-option v-for="m in MONTHS" :key="m.value" :label="m.label" :value="m.value" />
        </el-select>
      </div>
      <div class="okr__view-toggle">
        <el-radio-group v-model="viewMode" size="small">
          <el-radio-button value="card">Card</el-radio-button>
          <el-radio-button value="list">List</el-radio-button>
          <el-radio-button value="table">Table</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <template v-if="viewMode === 'card'">
      <div class="okr__grid">
        <el-card v-for="item in sortedActionItems" :key="item.id" class="okr__card" shadow="hover">
          <div class="okr__card-actions">
            <el-tooltip content="删除" placement="top">
              <el-button text type="danger" size="small" :icon="Delete" @click.stop="handleDelete(item)" />
            </el-tooltip>
          </div>
          <div class="okr__card-top">
            <el-tag :type="item.priorityType" size="small">{{ item.priority }}</el-tag>
            <el-tag :type="item.statusType" size="small">{{ item.status }}</el-tag>
          </div>
          <p class="okr__card-action okr__action-text--link" @click="openFile(item)">
            {{ item.action }}
          </p>
          <div class="okr__card-role" @click.stop="goRole(item.linkRole)">
            <span class="okr__role-cell-icon">{{ item.roleIcon }}</span>
            <span class="okr__role-cell-name">{{ item.roleName }}</span>
            <el-tag :type="item.roleStatusType" size="small">{{ item.roleStatus }}</el-tag>
          </div>
          <el-progress :percentage="item.progress" :status="item.progress >= 100 ? 'success' : undefined" :stroke-width="6" />
          <span v-if="item.subtaskCount" class="okr__subtask-count">{{ item.subtaskCount }} subtasks</span>
        </el-card>
      </div>
      <div v-if="!sortedActionItems.length" class="okr__empty">{{ emptyText }}</div>
    </template>

    <template v-else-if="viewMode === 'list'">
      <div class="okr__list">
        <div v-for="item in sortedActionItems" :key="item.id" class="okr__list-row">
          <el-tag :type="item.priorityType" size="small" class="okr__list-priority">{{ item.priority }}</el-tag>
          <span class="okr__list-action okr__action-text--link" @click="openFile(item)">{{ item.action }}</span>
          <span class="okr__list-role" @click.stop="goRole(item.linkRole)">
            <span class="okr__role-cell-icon">{{ item.roleIcon }}</span>
            <span class="okr__role-cell-name">{{ item.roleName }}</span>
          </span>
          <el-tag :type="item.statusType" size="small" class="okr__list-status">{{ item.status }}</el-tag>
          <el-progress
            class="okr__list-progress"
            :percentage="item.progress"
            :status="item.progress >= 100 ? 'success' : undefined"
            :stroke-width="6"
          />
          <span v-if="item.subtaskCount" class="okr__subtask-count">{{ item.subtaskCount }} subtasks</span>
          <div class="okr__list-actions">
            <el-tooltip content="删除" placement="top">
              <el-button text type="danger" size="small" :icon="Delete" @click="handleDelete(item)" />
            </el-tooltip>
          </div>
        </div>
      </div>
      <div v-if="!sortedActionItems.length" class="okr__empty">{{ emptyText }}</div>
    </template>

    <template v-else>
      <el-table
        :data="sortedActionItems"
        stripe
        border
        style="width: 100%"
        row-key="id"
        :default-sort="{ prop: 'priorityOrder', order: 'ascending' }"
        :empty-text="emptyText"
      >
        <el-table-column prop="priorityOrder" label="Priority" width="100" sortable align="center">
          <template #default="{ row }">
            <PriorityTag :priority="row.priority" />
          </template>
        </el-table-column>
        <el-table-column prop="action" label="Action" min-width="360" sortable>
          <template #default="{ row }">
            <span class="okr__action-text okr__action-text--link" @click="openFile(row as ActionItem)">{{ row.action }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="roleName" label="Role" width="180" sortable>
          <template #default="{ row }">
            <RoleLink :role="row.linkRole" :role-name="row.roleName" :role-icon="row.roleIcon" />
          </template>
        </el-table-column>
        <el-table-column label="Goal" width="280">
          <template #default="{ row }">
            <GoalCell v-if="row.linkGoal" :role="row.goalRole || row.linkRole" :goal-id="row.linkGoal" />
          </template>
        </el-table-column>
        <el-table-column prop="owner" label="Owner" width="140" sortable>
          <template #default="{ row }">
            <span>{{ row.owner || "—" }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="Status" width="120" sortable>
          <template #default="{ row }">
            <el-tag :type="row.statusType" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Skill" width="130">
          <template #default="{ row }">
            <SkillTag v-if="row.skill" :skill="row.skill" />
          </template>
        </el-table-column>
        <el-table-column label="Agent" width="150">
          <template #default="{ row }">
            <AgentTag v-if="row.agent" :agent="row.agent" />
          </template>
        </el-table-column>
        <el-table-column label="MCP" width="90">
          <template #default="{ row }">
            <McpTag v-if="row.mcp" :mcp="row.mcp" />
          </template>
        </el-table-column>
        <el-table-column prop="deadline" label="Deadline" width="160" sortable>
          <template #default="{ row }">
            <span class="okr__deadline" :class="{ 'okr__deadline-overdue': row.isOverdue }">
              <span>{{ row.deadline || "—" }}</span>
              <em v-if="row.deadline" class="okr__deadline-hint">{{ deadlineHint(row as ActionItem) }}</em>
            </span>
          </template>
        </el-table-column>
        <el-table-column label="Progress" width="170">
          <template #default="{ row }">
            <div class="okr__progress-cell">
              <el-progress :percentage="row.progress" :status="row.progress >= 100 ? 'success' : undefined" :stroke-width="6" />
              <span class="okr__progress-num">{{ row.progress }}%</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="subtaskCount" label="Subtasks" width="150" sortable align="center">
          <template #default="{ row }">
            <el-popover
              v-if="row.subtasks.length"
              placement="left"
              :width="380"
              trigger="click"
              :show-arrow="false"
              popper-class="okr__subtask-pop"
            >
              <template #reference>
                <span class="okr__subtask-count okr__subtask-count--link">
                  <b>{{ row.subtaskCount }}</b>
                  <span>subtasks</span>
                </span>
              </template>
              <div class="okr__subtask-head">
                <span class="okr__subtask-head__icon">🧩</span>
                可执行任务分解 · {{ row.subtaskCount }} 项
              </div>
              <div class="okr__subtask-list">
                <div v-for="(s, i) in row.subtasks as ExampleSubtask[]" :key="s.id || i" class="okr__subtask-item">
                  <div class="okr__subtask-item__title">
                    <span class="okr__subtask-item__idx">{{ i + 1 }}</span>
                    <span class="okr__subtask-item__name">{{ s.title }}</span>
                  </div>
                  <div class="okr__subtask-item__meta"><span class="okr__subtask-item__label">做法</span>{{ s.detail }}</div>
                  <div class="okr__subtask-item__meta okr__subtask-item__meta--acceptance">
                    <span class="okr__subtask-item__label">完成标准</span>{{ s.acceptance }}
                  </div>
                </div>
              </div>
            </el-popover>
            <span v-else class="okr__subtask-count">—</span>
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="80" fixed="right" align="center">
          <template #default="{ row }">
            <el-tooltip content="Delete" placement="top">
              <el-button text type="danger" size="small" :icon="Delete" @click="handleDelete(row as ActionItem)" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </template>

    <KnowledgePreviewDialog ref="previewDlg" />
  </div>
</template>

<script setup lang="ts" name="okrIndex">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessageBox, ElMessage } from "element-plus";
import { Delete, House, Connection, Aim, Odometer } from "@element-plus/icons-vue";
import dayjs from "dayjs";
import { scanKnowledge, deleteKnowledgeFile, writeKnowledgeFile } from "@/api/modules/knowledgeService";
import { loadBool, saveBool } from "@/utils/storage";
import type { KnowledgeFileEntry } from "@/api/interface/yiweb";
import KnowledgePreviewDialog from "@/views/aiChat/components/KnowledgePreviewDialog.vue";
import { EXAMPLE_TASKS, type ExampleTask, type ExampleSubtask } from "@/views/knowledge/executiver/okrFlowData";
import { rolesData, roleWeeklyDataMap, goalRoleMap } from "@/views/knowledge/executiver/okrData";
import RoleNav from "@/views/knowledge/components/RoleNav.vue";
import ExecutiverQuickNav from "@/views/knowledge/components/ExecutiverQuickNav.vue";
import PriorityTag from "@/components/OkrRecommend/fields/PriorityTag.vue";
import RoleLink from "@/components/OkrRecommend/fields/RoleLink.vue";
import GoalCell from "@/components/OkrRecommend/fields/GoalCell.vue";
import SkillTag from "@/components/OkrRecommend/fields/SkillTag.vue";
import AgentTag from "@/components/OkrRecommend/fields/AgentTag.vue";
import McpTag from "@/components/OkrRecommend/fields/McpTag.vue";

const router = useRouter();

const previewDlg = ref<InstanceType<typeof KnowledgePreviewDialog> | null>(null);

interface ActionItem {
  id: string;
  action: string;
  roleName: string;
  roleIcon: string;
  roleStatus: string;
  roleStatusType: "success" | "warning" | "danger" | "info" | "primary";
  linkRole?: string;
  linkGoal?: string;
  /** 目标所属角色（跨角色任务时与 linkRole 不同，用于深链回目标所属角色页）。 */
  goalRole?: string;
  skill?: string;
  agent?: string;
  mcp?: string;
  owner: string;
  deadline: string;
  status: string;
  statusType: "success" | "warning" | "danger" | "info" | "primary";
  priority: string;
  priorityType: "danger" | "warning" | "primary" | "info" | "success";
  priorityOrder: number;
  progress: number;
  isOverdue: boolean;
  filePath?: string;
  subtaskCount: number;
  /** 可执行子任务分解（做法 + 完成标准），供 Subtasks 列展开展示。 */
  subtasks: ExampleSubtask[];
}

/** 角色元信息 + 周报状态，统一从 okrData.ts 读取（单一事实来源，避免与各 role OKR 页漂移）。 */
function roleInfo(roleId?: string) {
  const meta = rolesData[roleId || ""];
  const weekly = roleWeeklyDataMap[roleId || ""];
  if (!meta) return { roleName: "—", roleIcon: "", roleStatus: "", roleStatusType: "info" as const };
  return {
    roleName: meta.name,
    roleIcon: meta.icon,
    roleStatus: weekly?.status ?? "",
    roleStatusType: weekly?.statusType ?? ("info" as const)
  };
}

const actionItems = ref<ActionItem[]>([]);

/** 示例数据只落盘一次；用户删空后刷新不应再自动补回。 */
const SEEDED_KEY = "yivad.okr.actionItemsSeeded.v2";

/** 优先级排序权重（P0 最前）。 */
const PRIORITY_ORDER: Record<string, number> = { P0: 0, P1: 1, P2: 2, P3: 3 };

/** 示例任务按 id 索引 — 历史种子文件的 subtasks 只落在正文、不在 meta，回退到此还原。 */
const EXAMPLE_TASK_BY_ID = new Map(EXAMPLE_TASKS.map(t => [t.id, t]));

function deadlineTs(deadline: string): number {
  const t = dayjs(deadline);
  return t.isValid() ? t.valueOf() : Number.MAX_SAFE_INTEGER;
}

/** 月份筛选：值取 1–12（dayjs `month()` 为 0–11，故 +1），字符串便于 el-select 清空回退。 */
const MONTHS: { value: string; label: string }[] = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" }
];

/** 默认显示当前月份（`dayjs().month()` 0–11，+1 对齐 MONTHS 的 1–12 值）。 */
const monthFilter = ref(String(dayjs().month() + 1));

/** 角色筛选：选中角色 id 集合（空 = 全部），联动 action items 列表。 */
const selectedRoles = ref<string[]>([]);

const filteredActionItems = computed(() => {
  let list = actionItems.value;
  if (selectedRoles.value.length) list = list.filter(a => !!a.linkRole && selectedRoles.value.includes(a.linkRole));
  if (!monthFilter.value) return list;
  const target = Number(monthFilter.value);
  return list.filter(a => {
    const d = dayjs(a.deadline);
    return d.isValid() && d.month() + 1 === target;
  });
});

const sortedActionItems = computed(() =>
  [...filteredActionItems.value].sort(
    (a, b) => a.priorityOrder - b.priorityOrder || deadlineTs(a.deadline) - deadlineTs(b.deadline)
  )
);

const emptyText = computed(() => (monthFilter.value ? "No action items in this month." : "No action items."));

function statusTypeOf(status: string): ActionItem["statusType"] {
  if (status === "Done") return "success";
  if (status === "At Risk") return "danger";
  if (status === "In Progress") return "warning";
  return "info";
}

/** 从 frontmatter 解析 subtasks（数组 → ExampleSubtask[]）；非法/空值返回 undefined 交由调用方回退。 */
function parseSubtasks(raw: unknown): ExampleSubtask[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const out: ExampleSubtask[] = [];
  for (const s of raw) {
    if (!s || typeof s !== "object") continue;
    const o = s as Record<string, unknown>;
    const title = typeof o.title === "string" ? o.title : "";
    if (!title) continue;
    out.push({
      id: typeof o.id === "string" ? o.id : "",
      title,
      detail: typeof o.detail === "string" ? o.detail : "",
      acceptance: typeof o.acceptance === "string" ? o.acceptance : ""
    });
  }
  return out.length ? out : undefined;
}

function actionItemFromFile(f: KnowledgeFileEntry): ActionItem {
  const m = f.meta ?? {};
  const title = typeof m.title === "string" ? m.title : f.name.replace(/\.md$/, "");
  const linkRole = typeof m.role === "string" ? m.role : undefined;
  const deadline = typeof m.deadline === "string" ? m.deadline : "";
  const status = typeof m.status === "string" ? m.status : "Planned";
  const priority = typeof m.priority === "string" ? m.priority : "P2";
  const progress = Number(m.progress ?? 0) || 0;
  const goal = typeof m.goal === "string" && m.goal ? m.goal : undefined;
  const skill = typeof m.skill === "string" ? m.skill : undefined;
  const agent = typeof m.agent === "string" ? m.agent : undefined;
  const mcp = typeof m.mcp === "string" ? m.mcp : undefined;
  const isOverdue = m.overdue === true || (dayjs(deadline).isValid() && dayjs(deadline).isBefore(dayjs().startOf("day")));
  const id = typeof m.id === "string" ? m.id : f.name.replace(/\.md$/, "");
  const subtasks = parseSubtasks(m.subtasks) ?? EXAMPLE_TASK_BY_ID.get(id)?.subtasks ?? [];
  return {
    id,
    action: title,
    ...roleInfo(linkRole),
    linkRole,
    linkGoal: goal,
    goalRole: goal ? goalRoleMap[goal] : undefined,
    skill,
    agent,
    mcp,
    owner: typeof m.owner === "string" ? m.owner : "",
    deadline,
    status,
    statusType: statusTypeOf(status),
    priority,
    priorityType: priorityTypeOf(priority),
    priorityOrder: PRIORITY_ORDER[priority] ?? 99,
    progress,
    isOverdue,
    filePath: f.path,
    subtaskCount: subtasks.length || Number(m.subtaskCount ?? 0) || 0,
    subtasks
  };
}

/** 示例任务 → 前端 ActionItem（带 filePath，点击用文件预览弹框查看正文）。 */
function actionItemFromExample(t: ExampleTask, filePath: string): ActionItem {
  return {
    id: t.id,
    action: t.title,
    ...roleInfo(t.role),
    linkRole: t.role,
    linkGoal: t.goalId,
    goalRole: t.goalId ? goalRoleMap[t.goalId] : undefined,
    skill: t.skill,
    agent: t.agent,
    mcp: t.mcp,
    owner: t.owner,
    deadline: t.deadline,
    status: t.status,
    statusType: statusTypeOf(t.status),
    priority: t.priority,
    priorityType: priorityTypeOf(t.priority),
    priorityOrder: PRIORITY_ORDER[t.priority] ?? 99,
    progress: t.progress,
    isOverdue: dayjs(t.deadline).isValid() && dayjs(t.deadline).isBefore(dayjs().startOf("day")),
    filePath,
    subtaskCount: t.subtasks.length,
    subtasks: t.subtasks
  };
}

/** 示例任务的 YAML frontmatter（元数据 → 后端接口，随文件落盘）。 */
function actionItemMeta(t: ExampleTask): Record<string, unknown> {
  return {
    type: "okr-action",
    id: t.id,
    title: t.title,
    role: t.role,
    listType: t.listType,
    goal: t.goalId,
    owner: t.owner,
    deadline: t.deadline,
    status: t.status,
    priority: t.priority,
    progress: t.progress,
    reason: t.description,
    skill: t.skill,
    agent: t.agent,
    mcp: t.mcp,
    subtaskCount: t.subtasks.length,
    subtasks: t.subtasks
  };
}

/** 示例任务的 markdown 正文（文件内容 → 知识库）。 */
function renderActionBody(t: ExampleTask): string {
  const lines: string[] = [`# ${t.title}`, "", t.description];
  if (t.subtasks?.length) {
    lines.push("", `## 可执行任务分解（${t.subtasks.length} 项）`);
    t.subtasks.forEach((s, i) => {
      lines.push("", `### ${i + 1}. ${s.title}`, "", `- 做法：${s.detail}`, `- 完成标准：${s.acceptance}`);
    });
  }
  lines.push(
    "",
    "| Field | Value |",
    "|---|---|",
    `| Role | ${t.roleIcon} ${t.roleName} |`,
    `| Goal | ${t.goalId} |`,
    `| Owner | ${t.owner} |`,
    `| Deadline | ${t.deadline} |`,
    `| Priority | ${t.priority} |`,
    `| Status | ${t.status} |`,
    `| Progress | ${t.progress}% |`,
    `| Skill | ${t.skill} |`,
    `| Agent | ${t.agent} |`,
    `| MCP | ${t.mcp || "—"} |`
  );
  return lines.join("\n");
}

/** 任务标题 → 文件名可读 slug（保留中文/英文/数字，其余分隔符归一为 `-`）。 */
function slugifyTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)
    .replace(/-+$/g, "");
}

/** `YYYY-MM` → 归档季度目录名 `YYYY-Qn`（未设截止日期返回 `undated`）。 */
function quarterDir(monthDir: string): string {
  if (monthDir === "undated") return "undated";
  return `${monthDir.slice(0, 4)}-Q${Math.ceil(Number(monthDir.slice(5, 7)) / 3)}`;
}

/** Action Item 落盘文件名：`okr/<year-quarter>/<year-month>/<priority>-<role>-<slug>.md`。
 *  按截止日期归档到「年-季度 / 年-月」目录（与推荐任务按 dueDate 归档保持一致）；
 *  优先级前缀让 P0 排前、role 便于按角色归组、slug 让文件名自解释。 */
function actionFileName(t: ExampleTask): string {
  const slug = slugifyTitle(t.title);
  const dir = t.deadline ? t.deadline.slice(0, 7) : "undated"; // YYYY-MM
  return `okr/${quarterDir(dir)}/${dir}/${t.priority.toLowerCase()}-${t.role}-${slug}.md`;
}

/** 知识库无 okr-action 文件时，把完整例子数据写入知识库（文件内容 → KB，元数据 → 后端），
 *  随后直接以真实 filePath 展示，点击即可通过文件预览弹框查看正文。 */
async function seedExampleActionItems(): Promise<ActionItem[]> {
  const out: ActionItem[] = [];
  for (const t of EXAMPLE_TASKS) {
    const filePath = actionFileName(t);
    try {
      await writeKnowledgeFile(filePath, renderActionBody(t), actionItemMeta(t));
      out.push(actionItemFromExample(t, filePath));
    } catch {
      // 后端不可用 → 跳过该条，保持空态（不伪造内存数据）
    }
  }
  return out;
}

async function loadActionItems() {
  try {
    const res = await scanKnowledge("okr");
    const files = res.categories?.flatMap(c => c.files) ?? [];
    actionItems.value = files.filter(f => f.meta?.type === "okr-action").map(actionItemFromFile);
  } catch {
    actionItems.value = [];
  }
  if (actionItems.value.length) {
    // 已有数据（历史种子 / 用户自建 / AI 生成）→ 标记已初始化，之后删空不再自动补回。
    saveBool(SEEDED_KEY, true);
  } else if (!loadBool(SEEDED_KEY, false)) {
    // 首次且为空 → 写入示例数据；落盘成功才标记，避免后端暂不可用时永久跳过种子。
    const seeded = await seedExampleActionItems();
    if (seeded.length) {
      actionItems.value = seeded;
      saveBool(SEEDED_KEY, true);
    }
  }
}

function openFile(item: ActionItem) {
  if (item.filePath) previewDlg.value?.open(item.filePath);
}
function goRole(roleId?: string) {
  if (roleId) router.push(`/executiver/okr/${roleId}`);
}
function deadlineHint(item: ActionItem): string {
  if (!item.deadline) return "";
  const d = dayjs(item.deadline);
  if (!d.isValid()) return "";
  const diff = d.diff(dayjs().startOf("day"), "day");
  if (diff < 0) return `${Math.abs(diff)}d overdue`;
  if (diff === 0) return "today";
  if (diff === 1) return "tomorrow";
  return `${diff}d left`;
}
onMounted(loadActionItems);

const viewMode = ref<"card" | "list" | "table">("table");

async function handleDelete(item: ActionItem) {
  try {
    await ElMessageBox.confirm(`Delete "${item.action}"? This action cannot be undone.`, "Confirm Delete", {
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      type: "warning"
    });
  } catch {
    return;
  }
  if (item.filePath) {
    try {
      await deleteKnowledgeFile(item.filePath);
    } catch {
      ElMessage.error("Failed to delete file");
      return;
    }
  }
  actionItems.value = actionItems.value.filter(a => a.id !== item.id);
  ElMessage.success("Action item deleted");
}

function priorityTypeOf(priority: string): ActionItem["priorityType"] {
  if (priority === "P0") return "danger";
  if (priority === "P1") return "warning";
  if (priority === "P2") return "primary";
  return "info";
}
</script>

<style scoped lang="scss">
.okr {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 95px);
  min-height: 0;
  padding: 24px;
  overflow: auto;
  background: var(--el-bg-color-page);
}
.okr__breadcrumb {
  margin-bottom: 4px;
}
.okr__head {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 16px;
}
.okr__nav {
  display: flex;
  gap: 6px;
  align-items: center;
}
.okr__filters {
  display: flex;
  gap: 6px;
  align-items: center;
  margin-left: auto;
}
.okr__view-toggle {
  display: flex;
  gap: 6px;
  align-items: center;
}
.okr__view-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.okr__action-text {
  font-size: 13px;
  line-height: 1.4;
}
.okr__action-text--link {
  color: var(--el-color-primary);
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
}
.okr__role-cell {
  display: flex;
  gap: 6px;
  align-items: center;
  cursor: pointer;
  &:hover {
    opacity: 0.85;
  }
}
.okr__role-cell-icon {
  font-size: 16px;
}
.okr__role-cell-name {
  font-size: 12px;
  font-weight: 600;
}
.okr__deadline {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-variant-numeric: tabular-nums;
}
.okr__deadline-hint {
  font-style: normal;
  font-size: 11px;
  color: var(--el-text-color-secondary);
}
.okr__deadline-overdue {
  font-weight: 700;
  color: var(--el-color-danger);
  .okr__deadline-hint {
    color: var(--el-color-danger);
  }
}
.okr__progress-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  :deep(.el-progress) {
    flex: 1;
    min-width: 0;
  }
}
.okr__progress-num {
  flex-shrink: 0;
  min-width: 34px;
  text-align: right;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  color: var(--el-text-color-secondary);
}
.okr__empty {
  padding: 32px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
  text-align: center;
}

.okr__subtask-count {
  font-size: 11px;
  color: var(--el-text-color-secondary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.okr__subtask-count--link {
  display: inline-flex;
  gap: 3px;
  align-items: center;
  cursor: pointer;
  color: var(--el-color-primary);
  b {
    font-weight: 700;
  }
  &:hover {
    text-decoration: underline;
  }
}

// Card view
.okr__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 12px;
}
.okr__card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.okr__card-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 1;
  display: flex;
  gap: 0;
  pointer-events: none;
  opacity: 0;
  transform: translateY(-2px);
  transition:
    opacity 0.2s,
    transform 0.2s;
}
.okr__card:hover .okr__card-actions {
  pointer-events: auto;
  opacity: 1;
  transform: translateY(0);
}
.okr__card-top {
  display: flex;
  gap: 6px;
  align-items: center;
}
.okr__card-action {
  min-height: 40px;
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
}
.okr__card-role {
  display: flex;
  gap: 6px;
  align-items: center;
  cursor: pointer;
  &:hover {
    opacity: 0.85;
  }
}
.okr__card-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.okr__card-deadline {
  font-variant-numeric: tabular-nums;
}

// List view
.okr__list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.okr__list-row {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 10px 14px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  transition: box-shadow 0.2s;
  &:hover {
    box-shadow: 0 2px 8px rgb(0 0 0 / 6%);
  }
}
.okr__list-priority {
  flex-shrink: 0;
}
.okr__list-action {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  line-height: 1.4;
}
.okr__list-role {
  display: flex;
  flex-shrink: 0;
  gap: 6px;
  align-items: center;
  cursor: pointer;
  &:hover {
    opacity: 0.85;
  }
}
.okr__list-owner {
  flex-shrink: 0;
  width: 110px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.okr__list-deadline {
  flex-shrink: 0;
  width: 90px;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}
.okr__list-status {
  flex-shrink: 0;
}
.okr__list-progress {
  flex-shrink: 0;
  width: 120px;
}
.okr__list-actions {
  display: flex;
  flex-shrink: 0;
  gap: 0;
  pointer-events: none;
  opacity: 0;
  transform: translateX(4px);
  transition:
    opacity 0.2s,
    transform 0.2s;
}
.okr__list-row:hover .okr__list-actions {
  pointer-events: auto;
  opacity: 1;
  transform: translateX(0);
}
</style>

<!-- Subtasks 弹出层内容（el-popover 默认 teleport 到 body，scoped 样式无法命中，需全局样式） -->
<style lang="scss">
.okr__subtask-pop {
  padding: 4px 2px;
}
.okr__subtask-pop .okr__subtask-head {
  display: flex;
  gap: 6px;
  align-items: center;
  margin-bottom: 10px;
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.okr__subtask-pop .okr__subtask-head__icon {
  font-size: 15px;
}
.okr__subtask-pop .okr__subtask-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 360px;
  overflow-y: auto;
}
.okr__subtask-pop .okr__subtask-item {
  padding-left: 10px;
  border-left: 2px solid var(--el-border-color);
}
.okr__subtask-pop .okr__subtask-item__title {
  display: flex;
  gap: 6px;
  align-items: center;
  margin-bottom: 4px;
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.okr__subtask-pop .okr__subtask-item__idx {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  line-height: 18px;
  text-align: center;
  font-size: 11px;
  font-weight: 700;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  border-radius: 50%;
}
.okr__subtask-pop .okr__subtask-item__name {
  line-height: 1.4;
}
.okr__subtask-pop .okr__subtask-item__meta {
  display: flex;
  gap: 6px;
  margin-top: 3px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--el-text-color-regular);
}
.okr__subtask-pop .okr__subtask-item__meta--acceptance {
  color: var(--el-text-color-secondary);
}
.okr__subtask-pop .okr__subtask-item__label {
  flex-shrink: 0;
  font-weight: 600;
  color: var(--el-text-color-secondary);
}
</style>

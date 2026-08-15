<template>
  <div class="okr">
    <div class="okr__head">
      <h1 class="okr__title">Action Items</h1>
      <el-tag size="small" :type="actionSummary.overdue > 0 ? 'danger' : 'success'"
        >{{ actionSummary.open }} open · {{ actionSummary.overdue }} overdue</el-tag
      >
      <div class="okr__nav">
        <el-button size="small" text type="primary" :icon="House" @click="router.push('/home/index')">Home</el-button>
        <el-button size="small" text type="primary" :icon="Connection" @click="router.push('/executiver/rss')">RSS</el-button>
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
        </el-card>
      </div>
      <div v-if="!actionItems.length" class="okr__empty">No action items.</div>
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
          <div class="okr__list-actions">
            <el-tooltip content="删除" placement="top">
              <el-button text type="danger" size="small" :icon="Delete" @click="handleDelete(item)" />
            </el-tooltip>
          </div>
        </div>
      </div>
      <div v-if="!actionItems.length" class="okr__empty">No action items.</div>
    </template>

    <template v-else>
      <el-table
        :data="sortedActionItems"
        stripe
        border
        style="width: 100%"
        row-key="id"
        :default-sort="{ prop: 'priorityOrder', order: 'ascending' }"
        empty-text="No action items."
      >
        <el-table-column prop="priorityOrder" label="Priority" width="120" sortable align="center">
          <template #default="{ row }">
            <el-tag :type="row.priorityType" size="small" effect="dark">{{ row.priority }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="action" label="Action" min-width="320" sortable>
          <template #default="{ row }">
            <span class="okr__action-text okr__action-text--link" @click="openFile(row as ActionItem)">{{ row.action }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="roleName" label="Role" width="200" sortable>
          <template #default="{ row }">
            <div class="okr__role-cell" @click.stop="goRole(row.linkRole)">
              <span class="okr__role-cell-icon">{{ row.roleIcon }}</span>
              <span class="okr__role-cell-name">{{ row.roleName }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="Status" width="120" sortable>
          <template #default="{ row }">
            <el-tag :type="row.statusType" size="small">{{ row.status }}</el-tag>
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
import { Delete, House, Connection } from "@element-plus/icons-vue";
import dayjs from "dayjs";
import { scanKnowledge, deleteKnowledgeFile, writeKnowledgeFile } from "@/api/modules/knowledgeService";
import { loadBool, saveBool } from "@/utils/storage";
import type { KnowledgeFileEntry } from "@/api/interface/yiweb";
import KnowledgePreviewDialog from "@/views/aiChat/components/KnowledgePreviewDialog.vue";
import { EXAMPLE_TASKS, type ExampleTask } from "@/views/knowledge/executiver/okrFlowData";

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
}

const roleStatusMap: Record<string, { name: string; icon: string; status: string; statusType: ActionItem["roleStatusType"] }> = {
  executiver: { name: "Executive", icon: "🏢", status: "On Track", statusType: "success" },
  producter: { name: "Product", icon: "📋", status: "On Track", statusType: "success" },
  leader: { name: "Leader", icon: "🧭", status: "At Risk", statusType: "danger" },
  engineer: { name: "Engineer", icon: "⚡", status: "On Track", statusType: "success" },
  srer: { name: "SRE", icon: "🔧", status: "On Track", statusType: "success" },
  aier: { name: "AI Engineer", icon: "🤖", status: "On Track", statusType: "success" },
  curator: { name: "Curator", icon: "📦", status: "On Track", statusType: "success" }
};

function roleInfo(roleId?: string) {
  const r = roleStatusMap[roleId || ""];
  return r
    ? { roleName: r.name, roleIcon: r.icon, roleStatus: r.status, roleStatusType: r.statusType }
    : { roleName: "—", roleIcon: "", roleStatus: "", roleStatusType: "info" as const };
}

const actionItems = ref<ActionItem[]>([]);

/** 示例数据只落盘一次；用户删空后刷新不应再自动补回。 */
const SEEDED_KEY = "yivad.okr.actionItemsSeeded";

/** 优先级排序权重（P0 最前）。 */
const PRIORITY_ORDER: Record<string, number> = { P0: 0, P1: 1, P2: 2, P3: 3 };

function deadlineTs(deadline: string): number {
  const t = dayjs(deadline);
  return t.isValid() ? t.valueOf() : Number.MAX_SAFE_INTEGER;
}

const sortedActionItems = computed(() =>
  [...actionItems.value].sort(
    (a, b) => a.priorityOrder - b.priorityOrder || deadlineTs(a.deadline) - deadlineTs(b.deadline)
  )
);

function statusTypeOf(status: string): ActionItem["statusType"] {
  if (status === "Done") return "success";
  if (status === "At Risk") return "danger";
  if (status === "In Progress") return "warning";
  return "info";
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
  const isOverdue =
    m.overdue === true ||
    (dayjs(deadline).isValid() && dayjs(deadline).isBefore(dayjs().startOf("day")));
  return {
    id: typeof m.id === "string" ? m.id : f.name.replace(/\.md$/, ""),
    action: title,
    ...roleInfo(linkRole),
    linkRole,
    linkGoal: goal,
    owner: typeof m.owner === "string" ? m.owner : "",
    deadline,
    status,
    statusType: statusTypeOf(status),
    priority,
    priorityType: priorityTypeOf(priority),
    priorityOrder: PRIORITY_ORDER[priority] ?? 99,
    progress,
    isOverdue,
    filePath: f.path
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
    owner: t.owner,
    deadline: t.deadline,
    status: t.status,
    statusType: statusTypeOf(t.status),
    priority: t.priority,
    priorityType: priorityTypeOf(t.priority),
    priorityOrder: PRIORITY_ORDER[t.priority] ?? 99,
    progress: t.progress,
    isOverdue: dayjs(t.deadline).isValid() && dayjs(t.deadline).isBefore(dayjs().startOf("day")),
    filePath
  };
}

/** 示例任务的 YAML frontmatter（元数据 → 后端接口，随文件落盘）。 */
function actionItemMeta(t: ExampleTask): Record<string, unknown> {
  return {
    type: "okr-action",
    id: t.id,
    title: t.title,
    role: t.role,
    goal: t.goalId,
    owner: t.owner,
    deadline: t.deadline,
    status: t.status,
    priority: t.priority,
    progress: t.progress,
    skill: t.skill,
    agent: t.agent,
    mcp: t.mcp
  };
}

/** 示例任务的 markdown 正文（文件内容 → 知识库）。 */
function renderActionBody(t: ExampleTask): string {
  return [
    `# ${t.title}`,
    "",
    t.description,
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
  ].join("\n");
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

/** Action Item 落盘文件名：`okr/action-<priority>-<role>-<slug>.md`。
 *  优先级前缀让 P0 排前、role 便于按角色归组、slug 让文件名自解释。 */
function actionFileName(t: ExampleTask): string {
  const slug = slugifyTitle(t.title);
  return `okr/action-${t.priority.toLowerCase()}-${t.role}-${slug}.md`;
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

const actionSummary = computed(() => {
  const open = actionItems.value.filter(a => a.status !== "Done").length;
  const overdue = actionItems.value.filter(a => a.isOverdue && a.status !== "Done").length;
  return { open, overdue };
});

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
.okr__title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
}
.okr__nav {
  display: flex;
  gap: 6px;
  align-items: center;
}
.okr__view-toggle {
  display: flex;
  gap: 6px;
  align-items: center;
  margin-left: auto;
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

<template>
  <div class="okr">
    <el-breadcrumb separator="/" class="okr__breadcrumb">
      <el-breadcrumb-item :to="{ path: '/executiver' }">Executive</el-breadcrumb-item>
      <el-breadcrumb-item>OKR Dashboard</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="okr__head">
      <h1 class="okr__title">Action Items</h1>
      <el-tag size="small" :type="actionSummary.overdue > 0 ? 'danger' : 'success'"
        >{{ actionSummary.open }} open · {{ actionSummary.overdue }} overdue</el-tag
      >
      <div class="okr__view-toggle">
        <el-radio-group v-model="viewMode" size="small">
          <el-radio-button value="card">Card</el-radio-button>
          <el-radio-button value="list">List</el-radio-button>
          <el-radio-button value="table">Table</el-radio-button>
        </el-radio-group>
      </div>
      <el-button size="small" type="primary" class="okr__ai-btn" @click="router.push('/home/index')">🤖 AI 自主推荐</el-button>
    </div>

    <template v-if="viewMode === 'card'">
      <div class="okr__grid">
        <el-card v-for="item in actionItems" :key="item.id" class="okr__card" shadow="hover">
          <div class="okr__card-actions">
            <el-tooltip content="AI 重新生成" placement="top">
              <el-button
                text
                type="primary"
                size="small"
                :icon="MagicStick"
                :loading="isRegenerating(item.id)"
                @click.stop="regenerateItem(item)"
              />
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button text type="danger" size="small" :icon="Delete" @click.stop="handleDelete(item)" />
            </el-tooltip>
          </div>
          <div class="okr__card-top">
            <el-tag :type="item.priorityType" size="small">{{ item.priority }}</el-tag>
            <el-tag :type="item.statusType" size="small">{{ item.status }}</el-tag>
          </div>
          <p
            class="okr__card-action"
            :class="{ 'okr__action-text--link': item.linkGoal }"
            @click="item.linkGoal && router.push(`/executiver/okr/${item.linkRole}/goal/${item.linkGoal}`)"
          >
            {{ item.action }}
          </p>
          <div class="okr__card-role" @click.stop="item.linkRole && router.push(`/${item.linkRole}`)">
            <span class="okr__role-cell-icon">{{ item.roleIcon }}</span>
            <span class="okr__role-cell-name">{{ item.roleName }}</span>
            <el-tag :type="item.roleStatusType" size="small">{{ item.roleStatus }}</el-tag>
          </div>
          <div class="okr__card-meta">
            <span class="okr__card-owner">{{ item.owner }}</span>
            <span class="okr__card-deadline" :class="{ 'okr__deadline-overdue': item.isOverdue }">{{ item.deadline }}</span>
          </div>
          <el-progress :percentage="item.progress" :status="item.progress >= 100 ? 'success' : undefined" :stroke-width="6" />
        </el-card>
      </div>
      <div v-if="!actionItems.length" class="okr__empty">No action items.</div>
    </template>

    <template v-else-if="viewMode === 'list'">
      <div class="okr__list">
        <div v-for="item in actionItems" :key="item.id" class="okr__list-row">
          <el-tag :type="item.priorityType" size="small" class="okr__list-priority">{{ item.priority }}</el-tag>
          <span
            class="okr__list-action"
            :class="{ 'okr__action-text--link': item.linkGoal }"
            @click="item.linkGoal && router.push(`/executiver/okr/${item.linkRole}/goal/${item.linkGoal}`)"
            >{{ item.action }}</span
          >
          <span class="okr__list-role" @click.stop="item.linkRole && router.push(`/${item.linkRole}`)">
            <span class="okr__role-cell-icon">{{ item.roleIcon }}</span>
            <span class="okr__role-cell-name">{{ item.roleName }}</span>
          </span>
          <span class="okr__list-owner">{{ item.owner }}</span>
          <span class="okr__list-deadline" :class="{ 'okr__deadline-overdue': item.isOverdue }">{{ item.deadline }}</span>
          <el-tag :type="item.statusType" size="small" class="okr__list-status">{{ item.status }}</el-tag>
          <el-progress
            class="okr__list-progress"
            :percentage="item.progress"
            :status="item.progress >= 100 ? 'success' : undefined"
            :stroke-width="6"
          />
          <div class="okr__list-actions">
            <el-tooltip content="AI 重新生成" placement="top">
              <el-button
                text
                type="primary"
                size="small"
                :icon="MagicStick"
                :loading="isRegenerating(item.id)"
                @click="regenerateItem(item)"
              />
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button text type="danger" size="small" :icon="Delete" @click="handleDelete(item)" />
            </el-tooltip>
          </div>
        </div>
      </div>
      <div v-if="!actionItems.length" class="okr__empty">No action items.</div>
    </template>

    <template v-else>
      <el-table :data="actionItems" stripe border style="width: 100%" row-key="id">
        <el-table-column prop="action" label="Action" min-width="360" sortable>
          <template #default="{ row }">
            <div class="okr__action-cell">
              <el-tag :type="row.priorityType" size="small" class="okr__action-priority">{{ row.priority }}</el-tag>
              <span
                class="okr__action-text"
                :class="{ 'okr__action-text--link': row.linkGoal }"
                @click="row.linkGoal && router.push(`/executiver/okr/${row.linkRole}/goal/${row.linkGoal}`)"
                >{{ row.action }}</span
              >
            </div>
          </template>
        </el-table-column>
        <el-table-column label="Role" width="180" sortable prop="roleName">
          <template #default="{ row }">
            <div class="okr__role-cell" @click.stop="row.linkRole && router.push(`/${row.linkRole}`)">
              <span class="okr__role-cell-icon">{{ row.roleIcon }}</span>
              <span class="okr__role-cell-name">{{ row.roleName }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="owner" label="Owner" width="160" sortable />
        <el-table-column prop="deadline" label="Deadline" width="120" sortable>
          <template #default="{ row }">
            <span :class="{ 'okr__deadline-overdue': row.isOverdue }">{{ row.deadline }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="Status" width="100" sortable>
          <template #default="{ row }">
            <el-tag :type="row.statusType" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Progress" width="140">
          <template #default="{ row }">
            <el-progress :percentage="row.progress" :status="row.progress >= 100 ? 'success' : undefined" :stroke-width="6" />
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="150" fixed="right">
          <template #default="{ row }">
            <el-tooltip content="AI 重新生成" placement="top">
              <el-button
                size="small"
                text
                type="primary"
                :icon="MagicStick"
                :loading="isRegenerating(row.id)"
                @click="regenerateItem(row as ActionItem)"
              />
            </el-tooltip>
            <el-button size="small" text type="danger" @click="handleDelete(row as ActionItem)">Del</el-button>
          </template>
        </el-table-column>
      </el-table>
    </template>
  </div>
</template>

<script setup lang="ts" name="okrIndex">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { ElMessageBox, ElMessage } from "element-plus";
import { Delete, MagicStick } from "@element-plus/icons-vue";
import dayjs from "dayjs";
import { chat } from "@/api/modules/chatService";
import type { ChatPayload } from "@/api/interface/yiweb";
import { DEFAULT_MODEL } from "@/views/aiChat/constants";
import { OKR_SYSTEM_PROMPT, parseRecommendation } from "@/components/OkrRecommend/okrRecommend";

const router = useRouter();

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
  progress: number;
  isOverdue: boolean;
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

const actionItems = ref<ActionItem[]>([
  {
    id: "ACT-01",
    action: "Close alert coverage gap: add monitors for all YiAi endpoints missing SLO alerts",
    ...roleInfo("srer"),
    linkRole: "srer",
    owner: "SRE Lead",
    deadline: "2026-08-22",
    status: "In Progress",
    statusType: "warning",
    priority: "P0",
    priorityType: "danger",
    progress: 60,
    isOverdue: false
  },
  {
    id: "ACT-02",
    action: "Resolve YiVad 18 vue-tsc errors: dedicate Friday engineering time",
    ...roleInfo("engineer"),
    linkRole: "engineer",
    linkGoal: "eng-005",
    owner: "Engineering Lead",
    deadline: "2026-08-29",
    status: "In Progress",
    statusType: "warning",
    priority: "P1",
    priorityType: "warning",
    progress: 15,
    isOverdue: false
  },
  {
    id: "ACT-03",
    action: "Implement A/B test framework for prompt changes — deploy to staging",
    ...roleInfo("aier"),
    linkRole: "aier",
    linkGoal: "aier-005",
    owner: "AI Engineer",
    deadline: "2026-08-18",
    status: "In Progress",
    statusType: "warning",
    priority: "P0",
    priorityType: "danger",
    progress: 30,
    isOverdue: false
  },
  {
    id: "ACT-04",
    action: "YiPet: collect first round of extension ratings and user feedback",
    ...roleInfo("producter"),
    linkRole: "producter",
    linkGoal: "prod-003",
    owner: "PM YiPet",
    deadline: "2026-08-15",
    status: "At Risk",
    statusType: "danger",
    priority: "P0",
    priorityType: "danger",
    progress: 20,
    isOverdue: true
  },
  {
    id: "ACT-05",
    action: "LLM cost optimization sprint: target $0.08/task (currently $0.12)",
    ...roleInfo("leader"),
    linkRole: "leader",
    linkGoal: "lead-004",
    owner: "Tech Lead",
    deadline: "2026-09-05",
    status: "Planned",
    statusType: "info",
    priority: "P1",
    priorityType: "warning",
    progress: 0,
    isOverdue: false
  },
  {
    id: "ACT-06",
    action: "Pre-mortem workshop for all Q4 goals — schedule with 7 role leads",
    ...roleInfo("executiver"),
    linkRole: "executiver",
    owner: "Executive",
    deadline: "2026-09-12",
    status: "Planned",
    statusType: "info",
    priority: "P1",
    priorityType: "warning",
    progress: 0,
    isOverdue: false
  },
  {
    id: "ACT-07",
    action: "Set up cross-role pairing rotation: Engineer + AI Engineer weekly",
    ...roleInfo("leader"),
    linkRole: "leader",
    owner: "Tech Lead",
    deadline: "2026-08-22",
    status: "Planned",
    statusType: "info",
    priority: "P2",
    priorityType: "primary",
    progress: 0,
    isOverdue: false
  },
  {
    id: "ACT-08",
    action: "Readiness checklist pass rate: engage role owners for stalled files",
    ...roleInfo("curator"),
    linkRole: "curator",
    linkGoal: "cur-003",
    owner: "Curator",
    deadline: "2026-08-29",
    status: "Planned",
    statusType: "info",
    priority: "P2",
    priorityType: "primary",
    progress: 0,
    isOverdue: false
  },
  {
    id: "ACT-09",
    action: "No-Friday-deploy policy: update CI/CD to block Friday production deploys",
    ...roleInfo("srer"),
    linkRole: "srer",
    linkGoal: "sre-004",
    owner: "SRE Lead",
    deadline: "2026-08-22",
    status: "Planned",
    statusType: "info",
    priority: "P1",
    priorityType: "warning",
    progress: 0,
    isOverdue: false
  },
  {
    id: "ACT-10",
    action: "ADR gate on PRs: add PR template checklist item for architecture changes",
    ...roleInfo("leader"),
    linkRole: "leader",
    linkGoal: "lead-001",
    owner: "Tech Lead",
    deadline: "2026-08-15",
    status: "Done",
    statusType: "success",
    priority: "P1",
    priorityType: "warning",
    progress: 100,
    isOverdue: false
  }
]);

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
  actionItems.value = actionItems.value.filter(a => a.id !== item.id);
  ElMessage.success("Action item deleted");
}

const regenerating = ref(new Set<string>());

function isRegenerating(id: string) {
  return regenerating.value.has(id);
}

function priorityTypeOf(priority: string): ActionItem["priorityType"] {
  if (priority === "P0") return "danger";
  if (priority === "P1") return "warning";
  if (priority === "P2") return "primary";
  return "info";
}

function buildRegeneratePrompt(item: ActionItem): string {
  return `请基于该角色的 OKR 上下文，重新生成下面这条 Action Item（保持角色不变，让任务更具体、可验收、含动作动词）。

原 Action Item：
- 角色：${item.roleName}（${item.linkRole || "executiver"}）
- 任务：${item.action}
- 优先级：${item.priority} · 截止：${item.deadline} · 状态：${item.status}

只输出一个 JSON 数组，数组只含一个元素，字段：title / role / goalId / metricId / effort / dueDate / roi / difficulty / urgency / reason。
role 必须是 "${item.linkRole || "executiver"}"。`;
}

async function regenerateItem(item: ActionItem) {
  if (regenerating.value.has(item.id)) return;
  regenerating.value.add(item.id);
  try {
    const payload: ChatPayload = {
      model: DEFAULT_MODEL,
      system: OKR_SYSTEM_PROMPT,
      messages: [{ type: "user", message: buildRegeneratePrompt(item), timestamp: Date.now() }]
    };
    const text = await chat(payload);
    const [next] = parseRecommendation(text, item.linkRole ?? "executiver");
    if (!next) {
      ElMessage.warning("AI 未返回有效结果");
      return;
    }
    item.action = next.title;
    item.priority = next.priority;
    item.priorityType = priorityTypeOf(next.priority);
    item.deadline = next.dueDate || item.deadline;
    item.isOverdue = dayjs(item.deadline).isValid() && dayjs(item.deadline).isBefore(dayjs().startOf("day"));
    ElMessage.success("已重新生成");
  } catch {
    ElMessage.error("重新生成失败");
  } finally {
    regenerating.value.delete(item.id);
  }
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
.okr__action-cell {
  display: flex;
  gap: 8px;
  align-items: center;
}
.okr__action-priority {
  flex-shrink: 0;
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
.okr__deadline-overdue {
  font-weight: 700;
  color: var(--el-color-danger);
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

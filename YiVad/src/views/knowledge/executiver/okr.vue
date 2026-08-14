<template>
  <div class="okr">
    <el-breadcrumb separator="/" class="okr__breadcrumb">
      <el-breadcrumb-item :to="{ path: '/executiver' }">Executive</el-breadcrumb-item>
      <el-breadcrumb-item>OKR Dashboard</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="okr__head">
      <h1 class="okr__title">Action Items</h1>
      <el-tag size="small" :type="actionSummary.overdue > 0 ? 'danger' : 'success'">{{ actionSummary.open }} open · {{ actionSummary.overdue }} overdue</el-tag>
    </div>

    <el-table :data="actionItems" stripe border style="width: 100%" row-key="id">
      <el-table-column prop="action" label="Action" min-width="360" sortable>
        <template #default="{ row }">
          <div class="okr__action-cell">
            <el-tag :type="row.priorityType" size="small" class="okr__action-priority">{{ row.priority }}</el-tag>
            <span class="okr__action-text" :class="{ 'okr__action-text--link': row.linkGoal }" @click="row.linkGoal && router.push(`/executiver/okr/${row.linkRole}/goal/${row.linkGoal}`)">{{ row.action }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="Role" width="150" sortable prop="roleName">
        <template #default="{ row }">
          <div class="okr__role-cell" @click.stop="row.linkRole && router.push(`/executiver/okr/${row.linkRole}`)">
            <span class="okr__role-cell-icon">{{ row.roleIcon }}</span>
            <span class="okr__role-cell-name">{{ row.roleName }}</span>
            <el-tag :type="row.roleStatusType" size="small">{{ row.roleStatus }}</el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="owner" label="Owner" width="120" sortable />
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
    </el-table>
  </div>
</template>

<script setup lang="ts" name="okrIndex">
import { computed } from "vue";
import { useRouter } from "vue-router";

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
  return r ? { roleName: r.name, roleIcon: r.icon, roleStatus: r.status, roleStatusType: r.statusType } : { roleName: "—", roleIcon: "", roleStatus: "", roleStatusType: "info" as const };
}

const actionItems: ActionItem[] = [
  { id: "ACT-01", action: "Close alert coverage gap: add monitors for all YiAi endpoints missing SLO alerts", ...roleInfo("srer"), linkRole: "srer", owner: "SRE Lead", deadline: "2026-08-22", status: "In Progress", statusType: "warning", priority: "P0", priorityType: "danger", progress: 60, isOverdue: false },
  { id: "ACT-02", action: "Resolve YiVad 18 vue-tsc errors: dedicate Friday engineering time", ...roleInfo("engineer"), linkRole: "engineer", linkGoal: "eng-005", owner: "Engineering Lead", deadline: "2026-08-29", status: "In Progress", statusType: "warning", priority: "P1", priorityType: "warning", progress: 15, isOverdue: false },
  { id: "ACT-03", action: "Implement A/B test framework for prompt changes — deploy to staging", ...roleInfo("aier"), linkRole: "aier", linkGoal: "aier-005", owner: "AI Engineer", deadline: "2026-08-18", status: "In Progress", statusType: "warning", priority: "P0", priorityType: "danger", progress: 30, isOverdue: false },
  { id: "ACT-04", action: "YiPet: collect first round of extension ratings and user feedback", ...roleInfo("producter"), linkRole: "producter", linkGoal: "prod-003", owner: "PM YiPet", deadline: "2026-08-15", status: "At Risk", statusType: "danger", priority: "P0", priorityType: "danger", progress: 20, isOverdue: true },
  { id: "ACT-05", action: "LLM cost optimization sprint: target $0.08/task (currently $0.12)", ...roleInfo("leader"), linkRole: "leader", linkGoal: "lead-004", owner: "Tech Lead", deadline: "2026-09-05", status: "Planned", statusType: "info", priority: "P1", priorityType: "warning", progress: 0, isOverdue: false },
  { id: "ACT-06", action: "Pre-mortem workshop for all Q4 goals — schedule with 7 role leads", ...roleInfo("executiver"), linkRole: "executiver", owner: "Executive", deadline: "2026-09-12", status: "Planned", statusType: "info", priority: "P1", priorityType: "warning", progress: 0, isOverdue: false },
  { id: "ACT-07", action: "Set up cross-role pairing rotation: Engineer + AI Engineer weekly", ...roleInfo("leader"), linkRole: "leader", owner: "Tech Lead", deadline: "2026-08-22", status: "Planned", statusType: "info", priority: "P2", priorityType: "primary", progress: 0, isOverdue: false },
  { id: "ACT-08", action: "Readiness checklist pass rate: engage role owners for stalled files", ...roleInfo("curator"), linkRole: "curator", linkGoal: "cur-003", owner: "Curator", deadline: "2026-08-29", status: "Planned", statusType: "info", priority: "P2", priorityType: "primary", progress: 0, isOverdue: false },
  { id: "ACT-09", action: "No-Friday-deploy policy: update CI/CD to block Friday production deploys", ...roleInfo("srer"), linkRole: "srer", linkGoal: "sre-004", owner: "SRE Lead", deadline: "2026-08-22", status: "Planned", statusType: "info", priority: "P1", priorityType: "warning", progress: 0, isOverdue: false },
  { id: "ACT-10", action: "ADR gate on PRs: add PR template checklist item for architecture changes", ...roleInfo("leader"), linkRole: "leader", linkGoal: "lead-001", owner: "Tech Lead", deadline: "2026-08-15", status: "Done", statusType: "success", priority: "P1", priorityType: "warning", progress: 100, isOverdue: false }
];

const actionSummary = computed(() => {
  const open = actionItems.filter((a) => a.status !== "Done").length;
  const overdue = actionItems.filter((a) => a.isOverdue && a.status !== "Done").length;
  return { open, overdue };
});
</script>

<style scoped lang="scss">
.okr {
  display: flex; flex-direction: column; box-sizing: border-box;
  height: calc(100vh - 95px); min-height: 0; padding: 24px; overflow: auto;
  background: var(--el-bg-color-page);
}
.okr__breadcrumb { margin-bottom: 4px; }

.okr__head {
  display: flex; align-items: center; gap: 10px; margin-bottom: 16px;
}
.okr__title { margin: 0; font-size: 22px; font-weight: 700; }

.okr__action-cell { display: flex; align-items: center; gap: 8px; }
.okr__action-priority { flex-shrink: 0; }
.okr__action-text { font-size: 13px; line-height: 1.4; }
.okr__action-text--link { cursor: pointer; color: var(--el-color-primary); &:hover { text-decoration: underline; } }
.okr__role-cell { display: flex; align-items: center; gap: 6px; cursor: pointer; &:hover { opacity: .85; } }
.okr__role-cell-icon { font-size: 16px; }
.okr__role-cell-name { font-size: 12px; font-weight: 600; }
.okr__deadline-overdue { color: var(--el-color-danger); font-weight: 700; }
</style>
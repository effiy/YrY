<script setup lang="ts" name="BrdOverviewSections">
/**
 * BRD detail sections rendered inside the story detail drawer (Overview tab).
 *
 * Displays all BRD template sections from a StoryDocument:
 * objectives, core users, countries, modules, business rules,
 * constraints, milestones, urgency, acceptance criteria,
 * attachments, and approval records.
 */
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { Link } from "@element-plus/icons-vue";
import { useStoryStore } from "@/stores/modules/story";
import {
  fmtDate,
  frequencyTagType,
  frequencyLabel,
  rulePriorityType,
  rulePriorityLabel,
  milestoneStatusType,
  approvalResultType
} from "@/views/story/constants";
import type { StoryDocument } from "@/api/modules/story";

const { t } = useI18n();
const store = useStoryStore();

const story = computed(() => store.selectedStory);

// ── Helpers ──

function hasConstraints(c: StoryDocument["constraints"]): boolean {
  if (!c) return false;
  return !!(c.compliance?.length || c.technical?.length || c.performance?.length);
}

function hasAcceptanceCriteria(ac: StoryDocument["acceptanceCriteria"]): boolean {
  if (!ac) return false;
  return !!(ac.functional?.length || ac.data?.length || ac.objectiveVerification?.length);
}

const priorityColors: Record<string, string> = { p0: "danger", p1: "warning", p2: "info", p3: "info" };

function approvalRoleLabel(role: string): string {
  const m: Record<string, string> = {
    business_owner: "roleBusinessOwner",
    eu_hub_itbp: "roleEuHubItbp",
    rsc_business: "roleRscBusiness",
    hq_counterpart: "roleHqCounterpart"
  };
  return m[role] ? t(`brd.${m[role]}`) : role;
}

function openAttachment(url: string) {
  window.open(url, "_blank");
}

const milestoneProgress = computed(() => {
  const ms = story.value?.milestones;
  if (!ms?.length) return 0;
  const done = ms.filter(m => m.status === "done").length;
  return Math.round((done / ms.length) * 100);
});

function milestoneStatusLabel(s: string): string {
  const m: Record<string, string> = { pending_review: "Pending", not_started: "NotStarted", in_progress: "InProgress", done: "Done" };
  return m[s] || "NotStarted";
}
</script>

<template>
  <template v-if="story">
    <!-- Business Objectives -->
    <template v-if="story.objectives?.length">
      <h4 class="sd-sec">{{ $t("brd.objectives") }}</h4>
      <el-table :data="story.objectives" border size="small" class="sd-brd-table">
        <el-table-column type="index" label="#" width="40" align="center" />
        <el-table-column :label="$t('brd.objective')" prop="objective" min-width="160" show-overflow-tooltip />
        <el-table-column :label="$t('brd.metric')" prop="metric" min-width="140" show-overflow-tooltip />
        <el-table-column :label="$t('brd.target')" prop="target" min-width="120" show-overflow-tooltip />
      </el-table>
    </template>

    <!-- Core Users -->
    <template v-if="story.coreUsers?.length">
      <h4 class="sd-sec">{{ $t("brd.coreUsers") }}</h4>
      <el-table :data="story.coreUsers" border size="small" class="sd-brd-table">
        <el-table-column :label="$t('brd.userRole')" prop="role" min-width="120" show-overflow-tooltip />
        <el-table-column :label="$t('brd.roleDesc')" prop="description" min-width="160" show-overflow-tooltip />
        <el-table-column :label="$t('brd.frequency')" width="110" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="frequencyTagType(row.frequency)">{{ $t(`brd.freq${frequencyLabel(row.frequency)}`) }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </template>

    <!-- Involved Countries -->
    <template v-if="story.involvedCountries?.length">
      <h4 class="sd-sec">{{ $t("brd.countries") }}</h4>
      <el-table :data="story.involvedCountries" border size="small" class="sd-brd-table">
        <el-table-column :label="$t('brd.country')" prop="country" min-width="120" show-overflow-tooltip />
        <el-table-column :label="$t('brd.brand')" prop="brand" min-width="120" show-overflow-tooltip />
        <el-table-column :label="$t('brd.scope')" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="row.scope === 'all' ? 'info' : 'warning'">{{ $t(`brd.scope${row.scope === 'all' ? 'All' : 'Partial'}`) }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </template>

    <!-- Involved Modules -->
    <template v-if="story.involvedModules?.length">
      <h4 class="sd-sec">{{ $t("brd.modules") }}</h4>
      <el-table :data="story.involvedModules" border size="small" class="sd-brd-table">
        <el-table-column :label="$t('brd.module')" prop="module" min-width="160" show-overflow-tooltip />
        <el-table-column :label="$t('brd.impact')" prop="impact" min-width="200" show-overflow-tooltip />
      </el-table>
    </template>

    <!-- Business Rules -->
    <template v-if="story.businessRules?.length">
      <h4 class="sd-sec">{{ $t("brd.rules") }}</h4>
      <el-table :data="story.businessRules" border size="small" class="sd-brd-table">
        <el-table-column :label="$t('brd.ruleId')" prop="id" width="90" />
        <el-table-column :label="$t('brd.ruleDesc')" prop="description" min-width="200" show-overflow-tooltip />
        <el-table-column :label="$t('brd.rulePriority')" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="rulePriorityType(row.priority)">{{ $t(`brd.pri${rulePriorityLabel(row.priority)}`) }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </template>

    <!-- Constraints -->
    <template v-if="story.constraints && hasConstraints(story.constraints)">
      <h4 class="sd-sec">{{ $t("brd.constraints") }}</h4>
      <div class="sd-constraints">
        <div v-if="story.constraints.compliance?.length" class="sd-constraint-group">
          <span class="sd-constraint-label">{{ $t("brd.compliance") }}</span>
          <div class="sd-tags">
            <el-tag v-for="(c, ci) in story.constraints.compliance" :key="'cc'+ci" size="small" type="danger">{{ c }}</el-tag>
          </div>
        </div>
        <div v-if="story.constraints.technical?.length" class="sd-constraint-group">
          <span class="sd-constraint-label">{{ $t("brd.technical") }}</span>
          <div class="sd-tags">
            <el-tag v-for="(c, ci) in story.constraints.technical" :key="'ct'+ci" size="small" type="warning">{{ c }}</el-tag>
          </div>
        </div>
        <div v-if="story.constraints.performance?.length" class="sd-constraint-group">
          <span class="sd-constraint-label">{{ $t("brd.performance") }}</span>
          <div class="sd-tags">
            <el-tag v-for="(c, ci) in story.constraints.performance" :key="'cp'+ci" size="small" type="info">{{ c }}</el-tag>
          </div>
        </div>
      </div>
    </template>

    <!-- Milestones -->
    <template v-if="story.milestones?.length">
      <h4 class="sd-sec">{{ $t("brd.milestones") }}</h4>
      <el-progress
        v-if="story.milestones.length"
        :percentage="milestoneProgress"
        :stroke-width="8"
        :color="milestoneProgress === 100 ? '#67c23a' : '#409eff'"
        class="sd-milestone-progress"
      />
      <el-table :data="story.milestones" border size="small" class="sd-brd-table">
        <el-table-column :label="$t('brd.milestoneName')" prop="name" min-width="140" show-overflow-tooltip />
        <el-table-column :label="$t('brd.expectedDate')" width="120" align="center">
          <template #default="{ row }">{{ fmtDate(row.expectedDate) || "—" }}</template>
        </el-table-column>
        <el-table-column :label="$t('brd.milestoneStatus')" width="110" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="milestoneStatusType(row.status)">{{ $t(`brd.ms${milestoneStatusLabel(row.status)}`) }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </template>

    <!-- Urgency -->
    <template v-if="story.urgency">
      <h4 class="sd-sec">{{ $t("brd.urgency") }}</h4>
      <el-tag :type="priorityColors[story.urgency] as any" size="small">{{ story.urgency.toUpperCase() }}</el-tag>
    </template>

    <!-- Acceptance Criteria -->
    <template v-if="hasAcceptanceCriteria(story.acceptanceCriteria)">
      <h4 class="sd-sec">{{ $t("brd.acceptance") }}</h4>
      <template v-if="story.acceptanceCriteria?.functional?.length">
        <h5 class="sd-sub-sec">{{ $t("brd.functional") }}</h5>
        <el-table :data="story.acceptanceCriteria.functional" border size="small" class="sd-brd-table">
          <el-table-column :label="$t('brd.acId')" prop="id" width="90" />
          <el-table-column :label="$t('brd.acDesc')" prop="description" min-width="200" show-overflow-tooltip />
          <el-table-column :label="$t('brd.acPri')" width="90" align="center">
            <template #default="{ row }">
              <el-tag size="small" :type="rulePriorityType(row.priority)">{{ $t(`brd.pri${rulePriorityLabel(row.priority)}`) }}</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </template>
      <template v-if="story.acceptanceCriteria?.data?.length">
        <h5 class="sd-sub-sec">{{ $t("brd.data") }}</h5>
        <ul class="sd-data-list">
          <li v-for="(d, di) in story.acceptanceCriteria.data" :key="'ad'+di">{{ d }}</li>
        </ul>
      </template>
      <template v-if="story.acceptanceCriteria?.objectiveVerification?.length">
        <h5 class="sd-sub-sec">{{ $t("brd.objectiveVerification") }}</h5>
        <el-table :data="story.acceptanceCriteria.objectiveVerification" border size="small" class="sd-brd-table">
          <el-table-column :label="$t('brd.verificationObjective')" prop="objective" min-width="140" show-overflow-tooltip />
          <el-table-column :label="$t('brd.verificationMethod')" prop="method" min-width="140" show-overflow-tooltip />
          <el-table-column :label="$t('brd.verificationCriteria')" prop="criteria" min-width="160" show-overflow-tooltip />
        </el-table>
      </template>
    </template>

    <!-- Attachments -->
    <template v-if="story.attachments?.length">
      <h4 class="sd-sec">{{ $t("brd.attachments") }}</h4>
      <div class="sd-files">
        <div v-for="att in story.attachments" :key="att.id" class="sd-file-item" @click="openAttachment(att.url)">
          <el-icon><Link /></el-icon>
          <div class="sd-file-info">
            <span class="sd-file-name">{{ att.label }}</span>
            <span class="sd-file-path">{{ att.url }}</span>
          </div>
        </div>
      </div>
    </template>

    <!-- Approval Records -->
    <template v-if="story.approvalRecords?.length">
      <h4 class="sd-sec">{{ $t("brd.approvals") }}</h4>
      <el-table :data="story.approvalRecords" border size="small" class="sd-brd-table">
        <el-table-column :label="$t('brd.apprRole')" width="140">
          <template #default="{ row }">{{ approvalRoleLabel(row.role) }}</template>
        </el-table-column>
        <el-table-column :label="$t('brd.approver')" prop="approver" width="100" />
        <el-table-column :label="$t('brd.apprDate')" width="120" align="center">
          <template #default="{ row }">{{ fmtDate(row.date) || "—" }}</template>
        </el-table-column>
        <el-table-column :label="$t('brd.apprResult')" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="approvalResultType(row.result)">{{ $t(`brd.result${row.result === 'approved' ? 'Approved' : 'Rejected'}`) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('brd.apprComments')" prop="comments" min-width="140" show-overflow-tooltip />
      </el-table>
    </template>
  </template>
</template>

<style scoped lang="scss">
.sd-sec {
  margin: 18px 0 6px;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.sd-sub-sec {
  margin: 12px 0 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-regular);
}
.sd-brd-table {
  margin-bottom: 4px;
}
.sd-milestone-progress {
  margin-bottom: 10px;
}
.sd-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.sd-constraints {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.sd-constraint-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.sd-constraint-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
}
.sd-data-list {
  margin: 4px 0;
  padding-left: 20px;
  font-size: 13px;
  color: var(--el-text-color-regular);
  line-height: 1.8;
}
.sd-files {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.sd-file-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 6px 10px;
  font-size: 13px;
  color: var(--el-text-color-regular);
  background: var(--el-fill-color-light);
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.15s;
}
.sd-file-item:hover {
  background: var(--el-fill-color);
}
.sd-file-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.sd-file-name {
  font-size: 13px;
  font-weight: 600;
}
.sd-file-path {
  font-family: "SF Mono", "Menlo", monospace;
  font-size: 11px;
  color: var(--el-text-color-secondary);
  word-break: break-all;
}
</style>

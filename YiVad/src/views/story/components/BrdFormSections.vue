<script setup lang="ts" name="BrdFormSections">
/**
 * BRD form sections rendered inside the story create/edit dialog.
 *
 * Provides editable tables for all BRD template sections:
 * objectives, core users, countries, modules, business rules,
 * constraints, milestones, acceptance criteria, attachments,
 * and approval records.
 */
import { useI18n } from "vue-i18n";
import { useStoryStore } from "@/stores/modules/story";
import { PRIORITY_OPTIONS } from "@/views/story/constants";

const { t } = useI18n();
const store = useStoryStore();
</script>

<template>
  <!-- Business Objectives -->
  <el-divider content-position="left">{{ $t("brd.objectives") }}</el-divider>
  <div class="brd-section">
    <el-table :data="store.form.objectives" border size="small">
      <el-table-column :label="$t('brd.objective')" min-width="180">
        <template #default="{ row }"><el-input v-model="row.objective" size="small" placeholder="e.g. Reduce ticket resolution time" /></template>
      </el-table-column>
      <el-table-column :label="$t('brd.metric')" min-width="140">
        <template #default="{ row }"><el-input v-model="row.metric" size="small" placeholder="e.g. Avg ticket resolution time" /></template>
      </el-table-column>
      <el-table-column :label="$t('brd.target')" min-width="120">
        <template #default="{ row }"><el-input v-model="row.target" size="small" placeholder="e.g. < 2 hours" /></template>
      </el-table-column>
      <el-table-column width="50" align="center">
        <template #default="{ $index }"><el-button text type="danger" size="small" @click="store.removeObjective($index)">×</el-button></template>
      </el-table-column>
    </el-table>
    <el-button text type="primary" size="small" style="margin-top: 6px" @click="store.addObjective()">+ {{ $t("brd.addObjective") }}</el-button>
  </div>

  <!-- Core Users -->
  <el-divider content-position="left">{{ $t("brd.coreUsers") }}</el-divider>
  <div class="brd-section">
    <el-table :data="store.form.coreUsers" border size="small">
      <el-table-column :label="$t('brd.userRole')" min-width="140">
        <template #default="{ row }"><el-input v-model="row.role" size="small" placeholder="e.g. Customer Support Agent" /></template>
      </el-table-column>
      <el-table-column :label="$t('brd.roleDesc')" min-width="160">
        <template #default="{ row }"><el-input v-model="row.description" size="small" placeholder="e.g. Handles incoming customer tickets" /></template>
      </el-table-column>
      <el-table-column :label="$t('brd.frequency')" width="130">
        <template #default="{ row }">
          <el-select v-model="row.frequency" size="small" style="width: 100%">
            <el-option :label="$t('brd.freqDaily')" value="daily" />
            <el-option :label="$t('brd.freqWeekly')" value="weekly" />
            <el-option :label="$t('brd.freqMonthly')" value="monthly" />
            <el-option :label="$t('brd.freqOnDemand')" value="on_demand" />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column width="50" align="center">
        <template #default="{ $index }"><el-button text type="danger" size="small" @click="store.removeCoreUser($index)">×</el-button></template>
      </el-table-column>
    </el-table>
    <el-button text type="primary" size="small" style="margin-top: 6px" @click="store.addCoreUser()">+ {{ $t("brd.addUser") }}</el-button>
  </div>

  <!-- Involved Countries -->
  <el-divider content-position="left">{{ $t("brd.countries") }}</el-divider>
  <div class="brd-section">
    <el-table :data="store.form.involvedCountries" border size="small">
      <el-table-column :label="$t('brd.country')" min-width="140">
        <template #default="{ row }"><el-input v-model="row.country" size="small" placeholder="e.g. Germany" /></template>
      </el-table-column>
      <el-table-column :label="$t('brd.brand')" min-width="120">
        <template #default="{ row }"><el-input v-model="row.brand" size="small" placeholder="e.g. Brand A" /></template>
      </el-table-column>
      <el-table-column :label="$t('brd.scope')" width="110">
        <template #default="{ row }">
          <el-select v-model="row.scope" size="small" style="width: 100%">
            <el-option :label="$t('brd.scopeAll')" value="all" />
            <el-option :label="$t('brd.scopePartial')" value="partial" />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column width="50" align="center">
        <template #default="{ $index }"><el-button text type="danger" size="small" @click="store.removeCountry($index)">×</el-button></template>
      </el-table-column>
    </el-table>
    <el-button text type="primary" size="small" style="margin-top: 6px" @click="store.addCountry()">+ {{ $t("brd.addCountry") }}</el-button>
  </div>

  <!-- Involved Modules -->
  <el-divider content-position="left">{{ $t("brd.modules") }}</el-divider>
  <div class="brd-section">
    <el-table :data="store.form.involvedModules" border size="small">
      <el-table-column :label="$t('brd.module')" min-width="160">
        <template #default="{ row }"><el-input v-model="row.module" size="small" placeholder="e.g. YiAi Ticket Service" /></template>
      </el-table-column>
      <el-table-column :label="$t('brd.impact')" min-width="200">
        <template #default="{ row }"><el-input v-model="row.impact" size="small" placeholder="e.g. New API endpoint for ticket routing" /></template>
      </el-table-column>
      <el-table-column width="50" align="center">
        <template #default="{ $index }"><el-button text type="danger" size="small" @click="store.removeModule($index)">×</el-button></template>
      </el-table-column>
    </el-table>
    <el-button text type="primary" size="small" style="margin-top: 6px" @click="store.addModule()">+ {{ $t("brd.addModule") }}</el-button>
  </div>

  <!-- Business Rules -->
  <el-divider content-position="left">{{ $t("brd.rules") }}</el-divider>
  <div class="brd-section">
    <el-table :data="store.form.businessRules" border size="small">
      <el-table-column :label="$t('brd.ruleId')" width="100">
        <template #default="{ row }"><el-input v-model="row.id" size="small" placeholder="BR-001" /></template>
      </el-table-column>
      <el-table-column :label="$t('brd.ruleDesc')" min-width="220">
        <template #default="{ row }"><el-input v-model="row.description" size="small" placeholder="e.g. All tickets must be acknowledged within 15 min" /></template>
      </el-table-column>
      <el-table-column :label="$t('brd.rulePriority')" width="110">
        <template #default="{ row }">
          <el-select v-model="row.priority" size="small" style="width: 100%">
            <el-option :label="$t('brd.priMust')" value="must" />
            <el-option :label="$t('brd.priShould')" value="should" />
            <el-option :label="$t('brd.priCould')" value="could" />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column width="50" align="center">
        <template #default="{ $index }"><el-button text type="danger" size="small" @click="store.removeBusinessRule($index)">×</el-button></template>
      </el-table-column>
    </el-table>
    <el-button text type="primary" size="small" style="margin-top: 6px" @click="store.addBusinessRule()">+ {{ $t("brd.addRule") }}</el-button>
  </div>

  <!-- Constraints -->
  <el-divider content-position="left">{{ $t("brd.constraints") }}</el-divider>
  <div class="brd-section">
    <el-row :gutter="16">
      <el-col :span="8">
        <div class="brd-constraint-item">
          <span class="brd-constraint-label">{{ $t("brd.compliance") }}</span>
          <el-input v-model="store.constraintsText.compliance" type="textarea" :rows="3" :placeholder="$t('brd.constraintsHint')" />
        </div>
      </el-col>
      <el-col :span="8">
        <div class="brd-constraint-item">
          <span class="brd-constraint-label">{{ $t("brd.technical") }}</span>
          <el-input v-model="store.constraintsText.technical" type="textarea" :rows="3" :placeholder="$t('brd.constraintsHint')" />
        </div>
      </el-col>
      <el-col :span="8">
        <div class="brd-constraint-item">
          <span class="brd-constraint-label">{{ $t("brd.performance") }}</span>
          <el-input v-model="store.constraintsText.performance" type="textarea" :rows="3" :placeholder="$t('brd.constraintsHint')" />
        </div>
      </el-col>
    </el-row>
  </div>

  <!-- Milestones -->
  <el-divider content-position="left">{{ $t("brd.milestones") }}</el-divider>
  <div class="brd-section">
    <el-table :data="store.form.milestones" border size="small">
      <el-table-column :label="$t('brd.milestoneName')" min-width="160">
        <template #default="{ row }"><el-input v-model="row.name" size="small" placeholder="e.g. MVP Release" /></template>
      </el-table-column>
      <el-table-column :label="$t('brd.expectedDate')" width="160">
        <template #default="{ row }">
          <el-date-picker v-model="row.expectedDate" type="date" :placeholder="$t('story.start')" size="small" style="width: 100%" value-format="x" />
        </template>
      </el-table-column>
      <el-table-column :label="$t('brd.milestoneStatus')" width="140">
        <template #default="{ row }">
          <el-select v-model="row.status" size="small" style="width: 100%">
            <el-option :label="$t('brd.msPending')" value="pending_review" />
            <el-option :label="$t('brd.msNotStarted')" value="not_started" />
            <el-option :label="$t('brd.msInProgress')" value="in_progress" />
            <el-option :label="$t('brd.msDone')" value="done" />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column width="50" align="center">
        <template #default="{ $index }"><el-button text type="danger" size="small" @click="store.removeMilestone($index)">×</el-button></template>
      </el-table-column>
    </el-table>
    <el-button text type="primary" size="small" style="margin-top: 6px" @click="store.addMilestone()">+ {{ $t("brd.addMilestone") }}</el-button>
  </div>

  <!-- Urgency -->
  <el-divider content-position="left">{{ $t("brd.urgency") }}</el-divider>
  <el-form-item :label="$t('story.priority')">
    <el-select v-model="store.form.urgency" style="width: 200px">
      <el-option v-for="opt in PRIORITY_OPTIONS" :key="opt.value" :label="opt.label" :value="opt.value" />
    </el-select>
  </el-form-item>

  <!-- Acceptance Criteria -->
  <el-divider content-position="left">{{ $t("brd.acceptance") }}</el-divider>

  <h5 style="margin: 0 0 8px; font-size: 13px; font-weight: 600;">{{ $t("brd.functional") }}</h5>
  <div class="brd-section">
    <el-table :data="store.form.acceptanceCriteria.functional" border size="small">
      <el-table-column :label="$t('brd.acId')" width="100">
        <template #default="{ row }"><el-input v-model="row.id" size="small" placeholder="AC-001" /></template>
      </el-table-column>
      <el-table-column :label="$t('brd.acDesc')" min-width="220">
        <template #default="{ row }"><el-input v-model="row.description" size="small" placeholder="e.g. User can create a ticket within 3 clicks" /></template>
      </el-table-column>
      <el-table-column :label="$t('brd.acPri')" width="110">
        <template #default="{ row }">
          <el-select v-model="row.priority" size="small" style="width: 100%">
            <el-option :label="$t('brd.priMust')" value="must" />
            <el-option :label="$t('brd.priShould')" value="should" />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column width="50" align="center">
        <template #default="{ $index }"><el-button text type="danger" size="small" @click="store.removeAcceptance($index)">×</el-button></template>
      </el-table-column>
    </el-table>
    <el-button text type="primary" size="small" style="margin-top: 6px" @click="store.addAcceptance()">+ {{ $t("brd.addAc") }}</el-button>
  </div>

  <h5 style="margin: 12px 0 8px; font-size: 13px; font-weight: 600;">{{ $t("brd.data") }}</h5>
  <el-input v-model="store.acceptanceDataText" type="textarea" :rows="3" :placeholder="$t('brd.constraintsHint')" />

  <h5 style="margin: 12px 0 8px; font-size: 13px; font-weight: 600;">{{ $t("brd.objectiveVerification") }}</h5>
  <div class="brd-section">
    <el-table :data="store.form.acceptanceCriteria.objectiveVerification" border size="small">
      <el-table-column :label="$t('brd.verificationObjective')" min-width="140">
        <template #default="{ row }"><el-input v-model="row.objective" size="small" placeholder="e.g. Reduce ticket resolution time" /></template>
      </el-table-column>
      <el-table-column :label="$t('brd.verificationMethod')" min-width="140">
        <template #default="{ row }"><el-input v-model="row.method" size="small" placeholder="e.g. Compare avg resolution time before/after launch" /></template>
      </el-table-column>
      <el-table-column :label="$t('brd.verificationCriteria')" min-width="140">
        <template #default="{ row }"><el-input v-model="row.criteria" size="small" placeholder="e.g. P95 < 2 hours for 2 weeks" /></template>
      </el-table-column>
      <el-table-column width="50" align="center">
        <template #default="{ $index }"><el-button text type="danger" size="small" @click="store.removeObjectiveVerification($index)">×</el-button></template>
      </el-table-column>
    </el-table>
    <el-button text type="primary" size="small" style="margin-top: 6px" @click="store.addObjectiveVerification()">+ {{ $t("brd.addVerification") }}</el-button>
  </div>

  <!-- Attachments -->
  <el-divider content-position="left">{{ $t("brd.attachments") }}</el-divider>
  <div class="brd-section">
    <el-table :data="store.form.attachments" border size="small">
      <el-table-column :label="$t('brd.attLabel')" min-width="160">
        <template #default="{ row }"><el-input v-model="row.label" size="small" placeholder="e.g. Wireframe v2" /></template>
      </el-table-column>
      <el-table-column :label="$t('brd.attUrl')" min-width="220">
        <template #default="{ row }"><el-input v-model="row.url" size="small" placeholder="https://..." /></template>
      </el-table-column>
      <el-table-column width="50" align="center">
        <template #default="{ $index }"><el-button text type="danger" size="small" @click="store.removeAttachment($index)">×</el-button></template>
      </el-table-column>
    </el-table>
    <el-button text type="primary" size="small" style="margin-top: 6px" @click="store.addAttachment()">+ {{ $t("brd.addAttachment") }}</el-button>
  </div>

  <!-- Approval Records -->
  <el-divider content-position="left">{{ $t("brd.approvals") }}</el-divider>
  <div class="brd-section">
    <el-table :data="store.form.approvalRecords" border size="small">
      <el-table-column :label="$t('brd.apprRole')" width="150">
        <template #default="{ row }">
          <el-select v-model="row.role" size="small" style="width: 100%">
            <el-option :label="$t('brd.roleBusinessOwner')" value="business_owner" />
            <el-option :label="$t('brd.roleEuHubItbp')" value="eu_hub_itbp" />
            <el-option :label="$t('brd.roleRscBusiness')" value="rsc_business" />
            <el-option :label="$t('brd.roleHqCounterpart')" value="hq_counterpart" />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column :label="$t('brd.approver')" width="120">
        <template #default="{ row }"><el-input v-model="row.approver" size="small" placeholder="Name" /></template>
      </el-table-column>
      <el-table-column :label="$t('brd.apprDate')" width="150">
        <template #default="{ row }">
          <el-date-picker v-model="row.date" type="date" :placeholder="$t('story.start')" size="small" style="width: 100%" value-format="x" />
        </template>
      </el-table-column>
      <el-table-column :label="$t('brd.apprResult')" width="110">
        <template #default="{ row }">
          <el-select v-model="row.result" size="small" style="width: 100%">
            <el-option :label="$t('brd.resultApproved')" value="approved" />
            <el-option :label="$t('brd.resultRejected')" value="rejected" />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column :label="$t('brd.apprComments')" min-width="140">
        <template #default="{ row }"><el-input v-model="row.comments" size="small" placeholder="Comments" /></template>
      </el-table-column>
      <el-table-column width="50" align="center">
        <template #default="{ $index }"><el-button text type="danger" size="small" @click="store.removeApproval($index)">×</el-button></template>
      </el-table-column>
    </el-table>
    <el-button text type="primary" size="small" style="margin-top: 6px" @click="store.addApproval()">+ {{ $t("brd.addApproval") }}</el-button>
  </div>
</template>

<style scoped lang="scss">
.brd-section {
  margin-bottom: 16px;
}
.brd-constraint-item {
  margin-bottom: 12px;
  .brd-constraint-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--el-text-color-secondary);
    margin-bottom: 4px;
    display: block;
  }
}
</style>

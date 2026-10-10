<template>
  <DetailSkeleton v-if="store.detailLoading" />
  <div v-else-if="store.selectedBug" class="bug-detail page">

    <!-- ============================================================ -->
    <!--  HEAD — Title + Risk + SLA + 动作栏                            -->
    <!-- ============================================================ -->
    <div class="bug-detail__head">
      <div class="bug-detail__head-left">
        <el-button text :icon="ArrowLeft" @click="goBack">Bugs</el-button>
        <EntityBreadcrumb
          :project-key="store.selectedBug.project_key"
          :current-label="store.selectedBug.title"
          :current-icon="WarningFilled"
          class="bug-detail__breadcrumb"
        />
        <div class="bug-detail__head-main">
          <div class="bug-detail__head-titles">
            <h1 class="bug-detail__title">{{ store.selectedBug.title }}</h1>
            <div class="bug-detail__risk-row">
              <RiskBadge :score="riskScore" />
              <Transition name="fade">
                <SlaBreachTag v-if="isSlaBreached" :hours="ageHours" :severity="store.selectedBug.severity" />
              </Transition>
              <SloLight :status="bugSloStatus" :label="bugSloLabel" />
            </div>
          </div>
          <div class="bug-detail__meta">
            <code class="bug-detail__key">{{ store.selectedBug.key }}</code>
            <el-tag :type="severityTagType(store.selectedBug.severity)" size="small" effect="dark">
              {{ store.selectedBug.severity }}
            </el-tag>
            <el-tag :type="priorityTagType(store.selectedBug.priority)" size="small">
              {{ store.selectedBug.priority }}
            </el-tag>
            <el-tag :type="statusTagType(store.selectedBug.status)" size="small" effect="dark">
              {{ store.selectedBug.status }}
            </el-tag>
            <el-tag type="info" size="small" effect="plain">{{ store.selectedBug.type }}</el-tag>
            <el-tag v-if="frequencyTier" :type="frequencyTagType" size="small" effect="plain" round>
              {{ store.selectedBug.frequency }}
            </el-tag>
            <span class="bug-detail__freshness" :class="{ 'is-stale': now - (store.selectedBug.updatedAt || 0) > 300000 }">
              · {{ formatRelativeTime(store.selectedBug.updatedAt || store.selectedBug.createdAt, now) }}
            </span>
          </div>
        </div>
      </div>
      <div class="bug-detail__head-actions">
        <el-button v-if="store.selectedBug.project_key" :icon="Link" @click="goProject(store.selectedBug.project_key!)">Project</el-button>
        <el-button v-if="store.selectedBug.issue_key" :icon="Link" type="warning" plain @click="goIssue(store.selectedBug.issue_key!)">Issue</el-button>
        <el-button :icon="Edit" @click="store.openEditDialog(store.selectedBug, store.selectedBugContent)">Edit</el-button>
        <el-dropdown trigger="click" @command="(cmd: string) => quickChangeStatus(cmd)">
          <el-button :icon="CircleCheck" type="success" plain>Change Status</el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item v-for="s in quickStatuses(store.selectedBug.status)" :key="s.value" :command="s.value">{{ s.label }}</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-button :icon="Delete" type="danger" plain @click="handleDelete">Delete</el-button>
      </div>
    </div>

    <!-- ============================================================ -->
    <!--  TABS — SRE 视角分栏：Overview · RCA · Rollback · Audit       -->
    <!-- ============================================================ -->
    <el-tabs v-model="activeTab" class="bug-detail__tabs" type="card">

      <!-- ─── Tab 1: Overview ──────────────────────────────────── -->
      <el-tab-pane label="Overview" name="overview">
        <div class="bug-detail__body">

        <!-- SIDEBAR → Props + SRE 指标 -->
        <div class="bug-detail__sidebar">

          <!-- SRE Health Card · 5宫格：Risk/MTTR(Age)/SLA Limit/Status + SLA Countdown -->
          <div class="bug-detail__sre-card">
            <div class="bug-detail__sre-head">
            <el-icon><Monitor /></el-icon>
            <span>SRE · Reliability Card</span>
            </div>
            <div class="bug-detail__sre-grid">
            <div class="bug-detail__sre-item">
              <span class="bug-detail__sre-label">Risk Tier</span>
              <span class="bug-detail__sre-value" :class="`is-${riskTier}`">{{ riskTierLabel }}</span>
            </div>
            <div class="bug-detail__sre-item">
              <span class="bug-detail__sre-label">{{ isResolved ? 'MTTR' : 'Age' }}</span>
              <span class="bug-detail__sre-value" :class="{ 'is-warn': !isResolved && ageDays > 14 }">{{ ageDisplay }}</span>
            </div>
            <div class="bug-detail__sre-item">
              <span class="bug-detail__sre-label">SLA Limit</span>
              <span class="bug-detail__sre-value">{{ slaHours }}h</span>
            </div>
            <div class="bug-detail__sre-item">
              <span class="bug-detail__sre-label">Status</span>
              <SloLight :status="isSlaBreached ? 'fail' : 'ok'" :label="isSlaBreached ? 'BREACH' : 'Within'" />
            </div>
            </div>
            <!-- 第5宫格：SLA 剩余时间倒计时（Reopen 锚点重算） -->
            <SlaCountdown
              :severity="store.selectedBug.severity as any"
              :sla-hours="slaHours"
              :anchor-at="slaAnchorAt"
              :closed-at="isResolved ? (store.selectedBug.resolvedAt || store.selectedBug.closedAt || null) : null"
              :reopened="reopenCount > 0"
              :reopened-ts="latestReopenTs || null"
              :now="now"
            />
            <!-- Reopens 总览：位于 SRE Card 底部一行 -->
            <div class="bug-detail__sre-reopens" v-if="reopenCount > 0 || store.selectedBug.status === 'reopened'">
              <span class="bug-detail__sre-reopens-label">Reopens</span>
              <el-tag
                class="bug-detail__sre-reopens-count"
                effect="light"
                :type="reopenCount >= 3 ? 'danger' : reopenCount >= 2 ? 'warning' : 'primary'"
                round
              >
                ×{{ reopenCount }}
              </el-tag>
              <span class="bug-detail__sre-reopens-note">
                Each reopen re-anchors the SLA window; reopened bugs always fail SLA.
              </span>
            </div>
          </div>

          <div class="bug-detail__props">
          <div class="bug-detail__field">
            <span class="bug-detail__field-label">Project</span>
            <el-button
              v-if="store.selectedBug.project_key"
              link
              type="primary"
              class="bug-detail__field-value"
              @click="goProject(store.selectedBug.project_key!)"
            >
              {{ projectName(store.selectedBug.project_key!) || store.selectedBug.project || store.selectedBug.project_key }}
            </el-button>
            <span v-else class="bug-detail__field-value">{{ store.selectedBug.project || "-" }}</span>
          </div>
          <div class="bug-detail__field" v-if="store.selectedBug.issue_key">
            <span class="bug-detail__field-label">Issue</span>
            <el-button link type="warning" class="bug-detail__field-value" @click="goIssue(store.selectedBug.issue_key!)">
              {{ issueTitle(store.selectedBug.issue_key!) }}
            </el-button>
          </div>
          <div class="bug-detail__field" v-if="linkedModule">
            <span class="bug-detail__field-label">Module</span>
            <el-button link type="primary" class="bug-detail__field-value" @click="goModule(linkedModule.key)">
              <el-icon><Grid /></el-icon> {{ linkedModule.name }}
            </el-button>
          </div>
          <div class="bug-detail__field" v-else>
            <span class="bug-detail__field-label">Module</span>
            <span class="bug-detail__field-value">{{ store.selectedBug.module || "-" }}</span>
          </div>
          <div class="bug-detail__field">
            <span class="bug-detail__field-label">Assignee</span>
            <span class="bug-detail__field-value">
              <el-avatar v-if="store.selectedBug.assignee" :size="20" style="vertical-align:middle;margin-right:6px">
                {{ (store.selectedBug.assignee || "?" ).slice(0,1).toUpperCase() }}
              </el-avatar>
              {{ store.selectedBug.assignee || "<unassigned>" }}
            </span>
          </div>
          <div class="bug-detail__field">
            <span class="bug-detail__field-label">Reporter</span>
            <span class="bug-detail__field-value">{{ store.selectedBug.reporter || "-" }}</span>
          </div>
          <div class="bug-detail__field">
            <span class="bug-detail__field-label">Frequency</span>
            <span class="bug-detail__field-value">{{ store.selectedBug.frequency }}</span>
          </div>
          <div class="bug-detail__field">
            <span class="bug-detail__field-label">Environment</span>
            <span class="bug-detail__field-value">{{ store.selectedBug.environment || "-" }}</span>
          </div>
          <div class="bug-detail__field">
            <span class="bug-detail__field-label">Affected Version</span>
            <span class="bug-detail__field-value">{{ store.selectedBug.affectedVersion || "-" }}</span>
          </div>
          <div class="bug-detail__field">
            <span class="bug-detail__field-label">Fixed Version</span>
            <span class="bug-detail__field-value">{{ store.selectedBug.fixedVersion || "-" }}</span>
          </div>
          <div class="bug-detail__field" v-if="store.selectedBug.iteration">
            <span class="bug-detail__field-label">Iteration</span>
            <span class="bug-detail__field-value">{{ store.selectedBug.iteration }}</span>
          </div>
          <div class="bug-detail__field">
            <span class="bug-detail__field-label">Due Date</span>
            <span class="bug-detail__field-value" :class="{ 'is-overdue': isDueOverdue }">
              {{ dueDateDisplay }}
              <el-tag v-if="isDueOverdue" size="small" type="danger" effect="dark" round style="margin-left:4px">OVERDUE</el-tag>
            </span>
          </div>
          <div class="bug-detail__field">
            <span class="bug-detail__field-label">Created</span>
            <span class="bug-detail__field-value">{{ formatAbsolute(store.selectedBug.createdAt) }}</span>
          </div>
          <div class="bug-detail__field">
            <span class="bug-detail__field-label">Updated</span>
            <span class="bug-detail__field-value">{{ formatAbsolute(store.selectedBug.updatedAt) }}</span>
          </div>
          <div class="bug-detail__field" v-if="store.selectedBug.resolvedAt">
            <span class="bug-detail__field-label">Resolved</span>
            <span class="bug-detail__field-value is-resolved">{{ formatAbsolute(store.selectedBug.resolvedAt) }}</span>
          </div>
          <div class="bug-detail__field" v-if="store.selectedBug.closedAt">
            <span class="bug-detail__field-label">Closed</span>
            <span class="bug-detail__field-value">{{ formatAbsolute(store.selectedBug.closedAt) }}</span>
          </div>
          <div class="bug-detail__field">
            <span class="bug-detail__field-label">{{ isResolved ? 'Resolved In' : 'Age' }}</span>
            <span class="bug-detail__field-value" :class="{ 'is-warn': !isResolved && ageDays > 14 }">{{ ageDisplay }}</span>
          </div>
          <div class="bug-detail__field" v-if="store.selectedBug.tags?.length">
            <span class="bug-detail__field-label">Tags</span>
            <span class="bug-detail__field-value">
              <el-tag v-for="t in store.selectedBug.tags" :key="t" size="small" style="margin-right: 4px; margin-bottom: 4px">
                {{ t }}
              </el-tag>
            </span>
          </div>
        </div>
        </div>

        <!-- MAIN → 描述 / 复现步骤 / 预期 / 实际 / Timeline -->
        <div class="bug-detail__main">
          <div class="bug-detail__section">
            <div class="bug-detail__section-head">
              <h3><el-icon><Document /></el-icon> Description</h3>
            </div>
            <BugContentSection :content="store.selectedBugContent?.description ?? ''" empty-text="No description" />
          </div>

          <div class="bug-detail__section">
            <div class="bug-detail__section-head">
              <h3><el-icon><List /></el-icon> Steps to Reproduce</h3>
            </div>
            <div v-if="store.selectedBugContent?.stepsToReproduce?.length" class="bug-detail__steps">
              <div v-for="(step, i) in store.selectedBugContent.stepsToReproduce" :key="i" class="bug-detail__step">
                <span class="bug-detail__step-n">{{ i + 1 }}</span>
                <span class="bug-detail__step-t">{{ step }}</span>
              </div>
            </div>
            <el-empty v-else description="No steps recorded" :image-size="40" />
          </div>

          <div class="bug-detail__row">
            <div class="bug-detail__section bug-detail__section--half">
              <div class="bug-detail__section-head"><h3><el-icon><CircleCheck /></el-icon> Expected Result</h3></div>
              <BugContentSection :content="store.selectedBugContent?.expectedResult ?? ''" empty-text="Not specified" />
            </div>
            <div class="bug-detail__section bug-detail__section--half">
              <div class="bug-detail__section-head"><h3><el-icon><Warning /></el-icon> Actual Result</h3></div>
              <BugContentSection :content="store.selectedBugContent?.actualResult ?? ''" empty-text="Not specified" />
            </div>
          </div>

          <div v-if="store.selectedBugContent?.causeProblem" class="bug-detail__section">
            <div class="bug-detail__section-head bug-detail__section-head--danger"><h3><el-icon><Search /></el-icon> Root Cause (as documented)</h3></div>
            <BugContentSection :content="store.selectedBugContent.causeProblem" />
          </div>

          <div v-if="store.selectedBugContent?.solution" class="bug-detail__section">
            <div class="bug-detail__section-head bug-detail__section-head--success"><h3><el-icon><MagicStick /></el-icon> Solution Applied</h3></div>
            <BugContentSection :content="store.selectedBugContent.solution" />
          </div>

          <div class="bug-detail__section">
            <div class="bug-detail__section-head"><h3><el-icon><Clock /></el-icon> Lifecycle Timeline</h3></div>
            <el-timeline>
              <el-timeline-item :timestamp="formatAbsolute(store.selectedBug.createdAt)" placement="top" type="primary" :icon="EditPen">
                <strong>Created</strong>
                <p v-if="store.selectedBug.reporter">by {{ store.selectedBug.reporter }}</p>
              </el-timeline-item>
              <el-timeline-item
                v-if="store.selectedBug.resolvedAt"
                :timestamp="formatAbsolute(store.selectedBug.resolvedAt)"
                placement="top"
                type="success"
                :icon="CircleCheckFilled"
              >
                <strong>Resolved</strong>
                <p v-if="store.selectedBug.assignee">by {{ store.selectedBug.assignee }} · MTTR {{ ageDisplay }}</p>
              </el-timeline-item>
              <el-timeline-item
                v-if="store.selectedBug.closedAt"
                :timestamp="formatAbsolute(store.selectedBug.closedAt)"
                placement="top"
                type="info"
                :icon="SwitchButton"
              >
                <strong>Closed</strong>
              </el-timeline-item>
              <el-timeline-item
                v-if="store.selectedBug.updatedAt && store.selectedBug.updatedAt !== store.selectedBug.createdAt"
                :timestamp="formatAbsolute(store.selectedBug.updatedAt)"
                placement="top"
                type="warning"
                :icon="RefreshRight"
              >
                <strong>Last Updated</strong>
              </el-timeline-item>
            </el-timeline>
          </div>
        </div>
      </div>
      </el-tab-pane>

      <!-- ─── Tab 2: RCA · 5-Why 根因分析 ─────────────────────── -->
      <el-tab-pane name="rca">
        <template #label>
          <span><el-icon><Search /></el-icon> RCA · 5-Why</span>
        </template>
        <div class="bug-rca">
          <div class="bug-rca__head">
            <h2>Root Cause Analysis · 5-Why Chain</h2>
            <p>追根溯源：连续追问 5 层「为什么」，定位系统性根因而非症状。</p>
          </div>
          <div class="bug-rca__chain">
            <div v-for="(why, i) in fiveWhys" :key="i" class="bug-why">
              <div class="bug-why__n">Why {{ i + 1 }}</div>
              <div class="bug-why__body">
                <div class="bug-why__q">{{ why.question }}</div>
                <div class="bug-why__a" :class="{ 'is-empty': !why.answer }">
                  {{ why.answer || "< pending investigation>" }}
                </div>
              </div>
              <div v-if="i < fiveWhys.length - 1" class="bug-why__arrow">
                <el-icon><ArrowDown /></el-icon>
              </div>
            </div>
          </div>

          <div class="bug-rca__summary">
            <div class="bug-rca__card bug-rca__card--cause">
              <h3><el-icon><WarningFilled /></el-icon> Root Cause Summary</h3>
              <p>{{ store.selectedBugContent?.causeProblem || "未填写根因。建议在 Edit 中补充 Cause 字段。" }}</p>
            </div>
            <div class="bug-rca__card bug-rca__card--solution">
              <h3><el-icon><CircleCheckFilled /></el-icon> Corrective Action</h3>
              <p>{{ store.selectedBugContent?.solution || "未填写纠正措施。" }}</p>
            </div>
          </div>

          <!-- Preventive -->
          <div class="bug-rca__prevent">
            <h3><el-icon><Key /></el-icon> STRIDE Threat Review · Preventive Checklist</h3>
            <div class="bug-rca__checklist">
              <div v-for="c in strideChecks" :key="c.key" class="bug-check" :class="{ 'is-on': c.applies }">
                <span class="bug-check__dot" />
                <div><strong>{{ c.label }}</strong><p>{{ c.description }}</p></div>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- ─── Tab 3: Rollback Strategy ─────────────────────── -->
      <el-tab-pane name="rollback">
        <template #label>
          <span><el-icon><RefreshLeft /></el-icon> Rollback · L1–L5</span>
        </template>
        <div class="bug-rollback">
          <div class="bug-rollback__head">
            <h2>多级回滚策略 (L1 → L5)</h2>
            <p>工业级故障回滚阶梯：从轻量回退到全链路降级，确保业务 SRE 红线。</p>
          </div>
          <div class="bug-rollback__ladder">
            <div v-for="(lvl, i) in rollbackLadder" :key="lvl.level" class="bug-rb" :class="`bug-rb--${lvl.level}`">
              <div class="bug-rb__level">
                <span class="bug-rb__badge">L{{ lvl.level }}</span>
                <div>
                  <h4>{{ lvl.name }}</h4>
                  <small>{{ lvl.trigger }}</small>
                </div>
              </div>
              <p class="bug-rb__desc">{{ lvl.description }}</p>
              <div class="bug-rb__steps">
                <div v-for="(step, j) in lvl.steps" :key="j"><i>{{ j + 1 }}. {{ step }}</i></div>
              </div>
              <div class="bug-rb__progress" role="progressbar" :aria-valuenow="lvl.completedSteps" :aria-valuemin="0" :aria-valuemax="lvl.totalSteps" :aria-label="`Rollback L${lvl.level} progress: ${lvl.completedSteps}/${lvl.totalSteps}`">
                <el-progress
                  :percentage="Math.round((lvl.completedSteps / Math.max(1, lvl.totalSteps)) * 100)"
                  :stroke-width="10"
                  :color="({danger:'#ef4444', warning:'#f59e0b', primary:'#3b82f6', success:'#22c55e'})[lvl.tagType]"
                  style="width:260px; max-width:100%"
                />
                <div class="bug-rb__progress-meta">
                  <span>{{ lvl.completedSteps }}/{{ lvl.totalSteps }} steps</span>
                  <span class="bug-rb__progress-meta-dot" aria-hidden="true">·</span>
                  <span>{{ lvl.rtoMinutes }}m RTO</span>
                </div>
              </div>
              <div class="bug-rb__meta">
                <el-tag size="small" :type="lvl.tagType" effect="plain">RTO ≤ {{ lvl.rtoMinutes }}m</el-tag>
                <el-tag size="small" type="info" effect="plain">Owner: {{ lvl.owner }}</el-tag>
                <el-tag size="small" :type="riskTierTagType" effect="dark" round>Risk: {{ riskTierLabel }}</el-tag>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- ─── Tab 4: Audit Trail · OKR + Traceability 5宫格 + Audit log ──────── -->
      <el-tab-pane name="audit">
        <template #label>
          <span><el-icon><DocumentCopy /></el-icon> Traceability · OKR + Audit</span>
        </template>
        <div class="bug-audit">
          <!-- Traceability 五宫格：PRD · Issue · Bug · Test · Module (FR-E6) -->
          <div class="bug-audit__trace">
            <div class="bug-audit__trace-head">
              <h3><el-icon><MagicStick /></el-icon> Traceability Chain · PRD → Issue → Bug → Test</h3>
              <p class="bug-audit__trace-sub">保证每一条 defect 都可以追溯到需求、Issue 和对应测试用例（Test 占位，后续后端扩展）。</p>
            </div>
            <div class="bug-audit__trace-grid">
              <div
                v-for="(item, k) in traceability"
                :key="k"
                class="bug-audit__trace-card"
                :class="{ 'is-set': !!item.value, 'is-link': !!item.link }"
              >
                <div class="bug-audit__trace-label">{{ item.label }}</div>
                <div class="bug-audit__trace-value">
                  <el-button
                    v-if="item.link"
                    link
                    type="primary"
                    @click="router.push(item.link)"
                  >
                    <strong>{{ item.value || '—' }}</strong>
                  </el-button>
                  <strong v-else>{{ item.value || '—' }}</strong>
                </div>
                <div class="bug-audit__trace-hint">{{ item.hint }}</div>
              </div>
            </div>
          </div>

          <!-- OKR 关联 -->
          <div class="bug-audit__okr">
            <h3><el-icon><Flag /></el-icon> OKR Impact &amp; Coverage</h3>
            <div class="bug-audit__okr-grid">
              <div class="bug-audit__okr-card">
                <span class="la">Severity × Priority</span>
                <strong class="v">{{ riskScore }} / 16</strong>
                <small>当风险分 ≥ 12 时，该缺陷自动上升为项目 KR 阻塞项。</small>
              </div>
              <div class="bug-audit__okr-card">
                <span class="la">KR Blocker?</span>
                <strong class="v" :class="riskScore >= 12 ? 'bad' : 'ok'">{{ riskScore >= 12 ? 'YES — 需对齐至 KR' : 'NO' }}</strong>
                <small>{{ riskScore >= 12 ? '影响交付质量 KR，需在周会同步进展。' : '不阻塞 KR 交付。' }}</small>
              </div>
              <div class="bug-audit__okr-card">
                <span class="la">Test Traceability</span>
                <strong class="v">{{ hasLinks ? 'YES' : 'NO' }}</strong>
                <small>{{ hasLinks ? '关联 Issue + Project，可追溯。' : '缺少关联 Issue/Project，补齐以满足 PRD→KR→Test 链路。' }}</small>
              </div>
              <div class="bug-audit__okr-card">
                <span class="la">Closure Evidence</span>
                <strong class="v" :class="closureEvidence.ok ? 'good' : 'warn'">{{ closureEvidence.label }}</strong>
                <small>{{ closureEvidence.hint }}</small>
              </div>
            </div>
          </div>

          <!-- Audit trail -->
          <div class="bug-audit__trail">
            <h3><el-icon><Clock /></el-icon> Audit Trail · 变更审计</h3>
            <el-timeline>
              <el-timeline-item
                v-for="(evt, i) in auditEvents"
                :key="i"
                :timestamp="evt.ts"
                :type="evt.type"
                :icon="evt.icon"
                placement="top"
              >
                <strong>{{ evt.title }}</strong>
                <p class="bug-audit__trail-desc">{{ evt.desc }}</p>
                <p v-if="evt.meta?.length" class="bug-audit__trail-meta">
                  <el-tag v-for="m in evt.meta" :key="m" size="small" effect="plain" type="info">{{ m }}</el-tag>
                </p>
              </el-timeline-item>
            </el-timeline>
          </div>
        </div>
      </el-tab-pane>

    </el-tabs>
  </div>

  <div v-else class="bug-detail__not-found">
    <el-result icon="error" title="Bug not found" sub-title="This bug doesn't exist or was deleted.">
      <template #extra>
        <el-button type="primary" @click="goBack">Back to Bugs</el-button>
      </template>
    </el-result>
  </div>
</template>

<script setup lang="ts" name="bugDetail">
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  ArrowLeft, Edit, Delete, Link, WarningFilled, Grid, CircleCheck,
  Monitor, Document, List, Warning, Search, MagicStick, Clock,
  EditPen, CircleCheckFilled, SwitchButton, RefreshRight,
  ArrowDown, Key, RefreshLeft, DocumentCopy, Flag
} from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { EntityBreadcrumb } from "@/components";
import DetailSkeleton from "@/components/Skeleton/SkeletonDetail.vue";
import BugContentSection from "./components/BugContentSection.vue";
import SloLight from "./components/SloLight.vue";
import RiskBadge from "./components/RiskBadge.vue";
import SlaBreachTag from "./components/SlaBreachTag.vue";
import SlaCountdown from "./components/SlaCountdown.vue";
import { useBugStore, BUG_SLA_HOURS } from "@/stores/modules/bug";
import type { BugTimelineEvent } from "@/stores/modules/bug";
import { useProjectStore } from "@/stores/modules/project";
import { useIssueStore } from "@/stores/modules/issue";
import type { BugSeverity, BugPriority, BugStatus, BugType } from "@/api/modules/bug";
import { updateBug } from "@/api/modules/bug";
import { getIssueList } from "@/api/modules/issueService";
import { getModuleList } from "@/api/modules/moduleService";
import type { Issue } from "@/api/modules/issueService";
import type { Module } from "@/api/modules/moduleService";
import { formatAbsolute, formatRelativeTime } from "@/utils/datetime";
import { useTimestamp } from "@vueuse/core";
import { severityTagType, priorityTagType, statusTagType } from "@/hooks/useTagHelpers";
import { linkBug, linkBugList, linkIssue, linkProject, linkModule } from "@/utils/linkFactory";
import { calcBugReopenCount, calcBugWindowAnchor } from "@/utils/reliability/sloMetrics";

const route = useRoute();
const router = useRouter();
const store = useBugStore();
const projectStore = useProjectStore();
const issueStore = useIssueStore();

const key = (route.params.id as string) || (route.params.key as string);

const projects = computed(() => projectStore.projects);
const issues = computed(() => issueStore.issues);

const linkedIssue = ref<Issue | null>(null);
const linkedModule = ref<Module | null>(null);
// Higher tick fidelity on the detail page; 10s for open/in_progress/reopened
// bugs so SLA countdown feels live; drop to 60s when status is done.
const _fastTick = useTimestamp({ interval: 10_000 });
const _slowTick = useTimestamp({ interval: 60_000 });
const DONE_STA = new Set(["resolved", "closed", "rejected", "fixed"]);
const now = computed(() => (
  bug.value && !DONE_STA.has(bug.value.status) ? _fastTick.value : _slowTick.value
));
const bug = computed(() => store.selectedBug);
const activeTab = ref<"overview" | "rca" | "rollback" | "audit">("overview");

// ──────────────────────────────────────────────────────────────────
//  Risk / SLA
// ──────────────────────────────────────────────────────────────────
const SEV_W: Record<BugSeverity, number> = { critical: 4, major: 3, minor: 2, trivial: 1 };
const PRI_W: Record<BugPriority, number> = { p0: 4, p1: 3, p2: 2, p3: 1 };
// Shared const with list page (from bug store) — keeps SLA thresholds
// exactly in sync across both views.
const SLA_HOURS: Record<BugSeverity, number> = BUG_SLA_HOURS;
const RESOLVED = new Set(["resolved", "closed", "fixed"]);

const riskScore = computed(() => {
  if (!bug.value) return 0;
  return (SEV_W[bug.value.severity as BugSeverity] ?? 1) * (PRI_W[bug.value.priority as BugPriority] ?? 1);
});
const riskTier = computed<"critical" | "high" | "medium" | "low">(() => {
  const s = riskScore.value;
  if (s >= 12) return "critical";
  if (s >= 8) return "high";
  if (s >= 4) return "medium";
  return "low";
});
const riskTierLabel = computed(() => riskTier.value.toUpperCase());
const riskTierTagType = computed(() => ({ critical: "danger", high: "warning", medium: "primary", low: "info" } as const)[riskTier.value]);

const isResolved = computed(() => bug.value ? RESOLVED.has(bug.value.status) : false);
const ageMs = computed(() => {
  if (!bug.value || !bug.value.createdAt) return 0;
  const end = isResolved.value ? (bug.value.resolvedAt || bug.value.updatedAt || bug.value.createdAt) : now.value;
  return end - bug.value.createdAt;
});
const ageDays = computed(() => Math.floor(ageMs.value / 86400000));
const ageHours = computed(() => Math.max(0, Math.floor(ageMs.value / 3600000)));
const ageDisplay = computed(() => {
  if (ageDays.value > 0) return `${ageDays.value}d ${ageHours.value % 24}h`;
  if (ageHours.value > 0) return `${ageHours.value}h`;
  return "< 1h";
});
const slaHours = computed(() => bug.value ? SLA_HOURS[bug.value.severity as BugSeverity] ?? 24 : 24);
// Reopen-aware. Uses shared calcBugReopenCount so list/detail agree on the count.
const reopenCount = computed(() => bug.value ? calcBugReopenCount(bug.value) : 0);
// Latest reopen ts (for SLA anchor + SlaCountdown reopened indicator)
const latestReopenTs = computed<number | null>(() => {
  const b = bug.value;
  if (!b) return null;
  const tl = (b as any).timeline as BugTimelineEvent[] | undefined;
  if (tl && tl.length) {
    const rs = tl.filter(e => e.kind === "reopen").map(e => e.ts).sort((a, z) => z - a);
    if (rs[0]) return rs[0];
  }
  if (b.status === "reopened") return b.updatedAt || b.createdAt || null;
  return null;
});
// SLA 窗口锚点：重新打开过 → 以最新一次 reopen ts 为准；否则 createdAt。
const slaAnchorAt = computed<number>(() => {
  const b = bug.value;
  if (!b) return Date.now();
  return Math.max(latestReopenTs.value ?? 0, b.createdAt || Date.now());
});
const isSlaBreached = computed(() => {
  // Reopened bugs always fail SLA (T2-R3 / calcBugSlaOk rule).
  if (reopenCount.value > 0) return true;
  if (isResolved.value) return false;
  const elapsed = (now.value - slaAnchorAt.value) / 3600000;
  return elapsed > slaHours.value;
});

const bugSloStatus = computed<"ok" | "warn" | "fail" | "na">(() => {
  if (isResolved.value) {
    if (ageHours.value <= slaHours.value) return "ok";
    return "warn";
  }
  return isSlaBreached.value ? "fail" : "ok";
});
const bugSloLabel = computed(() => isResolved.value ? `MTTR ${ageHours.value}h` : isSlaBreached.value ? "SLA BREACH" : "On track");

// Due date
const isDueOverdue = computed(() => {
  const d = bug.value?.dueDate;
  return !!d && d < now.value && !isResolved.value;
});
const dueDateDisplay = computed(() => {
  const d = bug.value?.dueDate;
  return d ? formatAbsolute(d) : "—";
});

// Frequency tag helper
const frequencyTier = computed(() => bug.value?.frequency);
const frequencyTagType = computed<"danger" | "warning" | "info" | "success">(() => {
  const map: Record<string, "danger" | "warning" | "info" | "success"> = {
    always: "danger", sometimes: "warning", rarely: "info", once: "info", unable: "success"
  };
  return map[(bug.value?.frequency || "")] || "info";
});

// ──────────────────────────────────────────────────────────────────
//  RCA 5-Why questions — Why 1 绑定 stepsToReproduce + expected/actual
//  (spec AC-T7).
// ──────────────────────────────────────────────────────────────────
const fiveWhys = computed(() => {
  const b = bug.value;
  const title = b?.title || "此缺陷";
  const cause = store.selectedBugContent?.causeProblem?.trim() || "";
  const solution = store.selectedBugContent?.solution?.trim() || "";
  const steps: string[] = (store.selectedBugContent as any)?.stepsToReproduce ?? [];
  const expected = (store.selectedBugContent as any)?.expectedResult || "expected behavior";
  const actual = store.selectedBugContent?.actualResult || "observed behavior";

  // First Why: synthesize from first repro step + expected vs actual (if any)
  let why1 = `为什么会发生「${title}」？`;
  if (Array.isArray(steps) && steps.length > 0) {
    const first = String(steps[0] || "").replace(/\s+/g, " ").trim();
    why1 = `为什么 Step #1 (${first}) 会产生「${actual}」而非「${expected}」？`;
  } else if (actual) {
    why1 = `为什么用户看到「${actual}」而非「${expected}」？`;
  }

  const mid: string[] = [];
  if (Array.isArray(steps)) {
    for (let i = 1; i < steps.length; i++) {
      const s = String(steps[i] || "").replace(/\s+/g, " ").trim();
      if (!s) continue;
      mid.push(`为什么 Step #${i + 1}（${s}）会继续出现上述非预期结果？`);
    }
  }
  const defaults = [
    "为什么测试没有提前捕获？",
    "为什么设计/评审阶段未能发现风险？",
    "为什么流程允许这个缺陷流入生产？",
  ];
  const body: string[] = [why1, ...mid, ...defaults];
  const answers = [
    store.selectedBugContent?.actualResult || "",
    cause ? "已记录根因：" + cause : "",
    "", "",
    solution ? `已纠正：${solution}` : "(请在 Solution 字段补充)",
  ];
  // Pad to exactly 5, truncate if body > 5
  const arr: Array<{ question: string; answer: string }> = [];
  for (let i = 0; i < 5; i++) {
    arr.push({
      question: body[i] || defaults[i] || "为什么会出现上述结果？",
      answer: answers[i] || "",
    });
  }
  return arr;
});

// STRIDE checklist — T7-R2 defaults based on BugType + severity:
//   - BugType=security  → Spoofing + Info Disclosure
//   - Severity=critical → add DoS
//   - BugType=data      → Info Disclosure
//   - Other             → 0
// The `applies` flags here are the DEFAULT checkboxes; the user can
// override/edit in the UI (the component only visualizes them as toggles
// but we expose them for future form sync).
const strideChecks = computed(() => {
  const t = (bug.value?.type || "") as BugType;
  const sev = bug.value?.severity;
  const set = new Set<string>();
  if (t === "security") { set.add("S"); set.add("I"); }
  if (t === "data") { set.add("I"); }
  if (sev === "critical") { set.add("D"); }
  return [
    { key: "S", label: "Spoofing — 伪造身份",    description: "是否涉及身份冒用、伪造请求？",           applies: set.has("S") },
    { key: "T", label: "Tampering — 篡改数据",   description: "数据是否被异常修改？",                     applies: set.has("T") },
    { key: "R", label: "Repudiation — 不可否认",  description: "是否缺少审计/日志缺失？",                   applies: set.has("R") },
    { key: "I", label: "Info Disclosure — 信息泄露", description: "是否泄露敏感信息？",                   applies: set.has("I") },
    { key: "D", label: "DoS — 拒绝服务",         description: "是否导致服务不可用？",                      applies: set.has("D") },
    { key: "E", label: "Elevation — 权限提升",    description: "是否存在越权？",                            applies: set.has("E") },
  ];
});

// ──────────────────────────────────────────────────────────────────
//  L1-L5 Rollback ladder · RTO 分钟数 + 进度条
//   RTO: L1=5 L2=15 L3=60 L4=240 L5=1440
//   completedSteps: timeline 中 kind==='rollback_triggered' 按 level 推断累计 (1 次触发 = 1 step)
// ──────────────────────────────────────────────────────────────────
const RB_RTO_MINUTES = Object.freeze({ 1: 5, 2: 15, 3: 60, 4: 240, 5: 1440 });
const rollbackLadder = computed(() => {
  const type = bug.value?.type || "functional";
  const moduleName = bug.value?.module || "相关模块";
  const proj = bug.value?.project || "该项目";
  const severity = bug.value?.severity || "minor";
  const isCritical = severity === "critical";

  // Raw ladder (5 levels). Will be appended with RTO progress.
  const raw: Array<{
    level: 1 | 2 | 3 | 4 | 5;
    name: string;
    trigger: string;
    description: string;
    steps: string[];
    rto: string;
    rtoMinutes: number;
    owner: string;
    tagType: "success" | "primary" | "warning" | "danger";
    completedSteps: number;
    totalSteps: number;
  }> = [
    {
      level: 1,
      name: "Feature Flag Off",
      trigger: "用户投诉飙升 · 立即",
      description: "若该缺陷位于特性开关后，L1 关闭对应开关，将该功能回退到旧路径，无需重发版。",
      steps: [`定位 ${moduleName} 的 feature flag`, "关闭相关开关", "验证主流程冒烟", "通知相关 stakeholder"],
      rto: "≤ 5 min",
      rtoMinutes: 5,
      owner: "On-Call Dev",
      tagType: "success",
      completedSteps: 0,
      totalSteps: 4,
    },
    {
      level: 2,
      name: "Config Revert · Hot Patch",
      trigger: "MTTR > SLA · 15min 未恢复",
      description: `针对配置类/小逻辑问题，直接通过配置中心回滚参数或下发 hot-patch 脚本。`,
      steps: ["提交 config 回滚 PR", "灰度 1% → 10% → 全量", "核对指标回归", "生成 postmortem 初稿"],
      rto: "≤ 15 min",
      rtoMinutes: 15,
      owner: "SRE + Module Owner",
      tagType: "primary",
      completedSteps: 0,
      totalSteps: 4,
    },
    {
      level: 3,
      name: "Bin Rollback",
      trigger: "L2 失败或数据面污染",
      description: `将 ${proj} 的二进制/前端 bundle 回滚至上一健康版本。启动降级模式。`,
      steps: ["停止写入流量 → 只读模式", "执行 bin rollback 命令", "等待缓存刷新 (TTL 30s)", "只读恢复 → 全读写"],
      rto: "≤ 60 min",
      rtoMinutes: 60,
      owner: "SRE Lead",
      tagType: "warning",
      completedSteps: 0,
      totalSteps: 4,
    },
    {
      level: 4,
      name: "Dep · Data Restore (PITR)",
      trigger: "数据损坏/逻辑错误",
      description: isCritical
        ? "关键数据受损 → PITR 恢复至最近一致性快照，同步回放增量 binlog。"
        : "启用只读降级 + 数据回档，业务只读模式下进行定点恢复。",
      steps: ["Freeze 写入流量", "PITR 恢复快照", "一致性校验 (checksum)", "数据比对 & 重新上线"],
      rto: "≤ 240 min",
      rtoMinutes: 240,
      owner: "DBA + SRE",
      tagType: "warning",
      completedSteps: 0,
      totalSteps: 4,
    },
    {
      level: 5,
      name: "Full DR Failover",
      trigger: "大面积故障 · L1-L4 均失败",
      description: "执行容灾切换：DNS/区域级故障，切 DR 环境，启动 DR 演练剧本 DR 演练手册。",
      steps: ["宣布事故升级 P0 升级 Incident Cmd.", "切流量切换至 DR 站点", "Runbook 执行校验", "Executive comms 发公告"],
      rto: "≤ 1440 min",
      rtoMinutes: 1440,
      owner: "Incident Commander",
      tagType: "danger",
      completedSteps: 0,
      totalSteps: 4,
    },
  ];

  // completedSteps: 统计 timeline 中 rollback_* 事件，并按 level 逐步累加
  const tl: BugTimelineEvent[] = (bug.value as any)?.timeline ?? [];
  const rbKinds = ["rollback_triggered", "rollback_step", "rollback_l1", "rollback_l2", "rollback_l3", "rollback_l4", "rollback_l5"] as const;
  const events = tl.filter(e => rbKinds.includes(e.kind as any));
  // Count total events; spread steps progressively from L1 up. Each completed event
  // moves the completion pointer forward by 1 across all levels combined (4+4+4+4+4=20 steps).
  const per = 4;
  let remaining = events.length;
  for (const lvl of raw) {
    const take = Math.min(per, remaining);
    (lvl.completedSteps as any) = take;
    (lvl.totalSteps as any) = per;
    remaining -= take;
    if (remaining <= 0) break;
  }
  return raw;
});

// ── Traceability 五宫格 (PRD · Issue · Bug · Test · Module)
//    放在 Audit Tab 顶部，保证一条 trace 链路的一眼可见。 ────
const traceability = computed(() => {
  const b = bug.value;
  return {
    prd: { label: "PRD", value: (b as any)?.prd_key || null, hint: "暂无 PRD 字段 · 待后端扩展", link: null },
    issue: {
      label: "Issue",
      value: b?.issue_key || null,
      hint: b?.issue_key ? "点击跳转 Issue 详情" : "尚未关联 Issue · 点击创建",
      link: b?.issue_key ? linkIssue(b.issue_key).link : null,
    },
    bug: { label: "Bug", value: b?.key || null, hint: "当前缺陷", link: b?.key ? linkBug(b.key).link : null },
    test: { label: "Test", value: (b as any)?.test_case_id || null, hint: "Test Case 占位 · 待后端扩展", link: null },
    module: {
      label: "Module",
      value: b?.module || null,
      hint: linkedModule.value ? `Module: ${linkedModule.value.name}` : "尚未关联模块",
      link: linkedModule.value ? linkModule(linkedModule.value.key).link : null,
    },
  } as const;
});

// ──────────────────────────────────────────────────────────────────
//  OKR + Audit · Traceability 5宫格 + timeline 优先渲染 BugTimelineEvent
// ──────────────────────────────────────────────────────────────────
const hasLinks = computed(() => !!(bug.value?.issue_key || bug.value?.project_key));

const closureEvidence = computed(() => {
  const c = store.selectedBugContent;
  const has = !!(c?.causeProblem && c?.solution);
  if (isResolved.value) {
    return has
      ? { ok: true,  label: "RCA + Fix", hint: "根因+方案齐全，可关闭。" }
      : { ok: false, label: "缺 RCA",  hint: "已解决但缺少 Cause / Solution，需要在 Edit 中补充。" };
  }
  return { ok: false, label: "Open", hint: "未解决：解决时请补齐 RCA + Solution。" };
});

// Audit trail: if `timeline` is populated, render that; otherwise fall back
// to heuristic events derived from timestamps / status (AC-T7-5).
const auditEvents = computed(() => {
  const b = bug.value;
  if (!b) return [];
  type Evt = { ts: string; type: any; icon: any; title: string; desc: string; meta?: string[] };
  const tl: BugTimelineEvent[] | undefined = (b as any)?.timeline;
  if (Array.isArray(tl) && tl.length > 0) {
    const kindMeta: Record<string, { type: any; icon: any; title: string; desc?: (e: BugTimelineEvent) => string }> = {
      created: { type: "primary", icon: EditPen, title: "缺陷创建" },
      assigned: { type: "warning", icon: Clock, title: "分配责任人" },
      status_changed: {
        type: "warning", icon: RefreshRight, title: "状态变更",
        desc: (e) => `Status  ${e.from || "—"} → ${e.to || "—"}  · ${e.note || ""}`.trim(),
      },
      reopen: { type: "danger", icon: RefreshRight, title: "缺陷重新打开" },
      comment: { type: "info", icon: Document, title: "评论" },
      rollback_triggered: { type: "danger", icon: RefreshLeft, title: "触发回滚" },
      rollback_step: { type: "warning", icon: RefreshLeft, title: "回滚推进" },
      resolved: { type: "success", icon: CircleCheckFilled, title: "缺陷解决" },
      closed: { type: "info", icon: SwitchButton, title: "缺陷关闭" },
      tag_added: { type: "info", icon: EditPen, title: "添加标签" },
      edited: { type: "warning", icon: Edit, title: "字段更新" },
    };
    return tl.map((e): Evt => {
      const m = kindMeta[e.kind] ?? { type: "info", icon: Clock, title: `Event: ${e.kind}` };
      const desc = (m.desc ? m.desc(e) : undefined) ?? (e.note ? e.note : `by ${e.by || "system"}`);
      const meta: string[] = [];
      if (e.by) meta.push(`by=${e.by}`);
      if (e.from) meta.push(`from=${e.from}`);
      if (e.to) meta.push(`to=${e.to}`);
      return {
        ts: formatAbsolute(e.ts),
        type: m.type,
        icon: m.icon,
        title: m.title,
        desc,
        meta: meta.length ? meta : undefined,
      };
    });
  }

  // Fallback: synthesize events from timestamps (pre-timeline behaviour)
  const events: Evt[] = [];
  events.push({
    ts: formatAbsolute(b.createdAt),
    type: "primary",
    icon: EditPen,
    title: "缺陷创建",
    desc: `${b.reporter || "未知用户"} 报告缺陷：「${b.title}」`,
    meta: [`severity=${b.severity}`, `priority=${b.priority}`, `type=${b.type}`]
  });
  if (b.issue_key) events.push({
    ts: formatAbsolute(b.createdAt + 60_000),
    type: "warning",
    icon: Link,
    title: "关联 Issue",
    desc: `与 Issue ${b.issue_key} 建立可追溯链路。`,
    meta: ["traceability: PRD→Issue→Bug"]
  });
  if (b.status === "in_progress") events.push({
    ts: formatAbsolute(b.updatedAt),
    type: "warning",
    icon: Clock,
    title: "开始处理",
    desc: `${b.assignee || "负责人"} 接手处理。`,
    meta: [`assignee=${b.assignee || "unassigned"}`]
  });
  if (b.resolvedAt) events.push({
    ts: formatAbsolute(b.resolvedAt),
    type: "success",
    icon: CircleCheckFilled,
    title: "缺陷解决",
    desc: `MTTR ${ageDisplay.value} · ${isSlaBreached.value ? "超出 SLA" : "SLA 内完成"}`,
    meta: [`fixedVersion=${b.fixedVersion || "—"}`, isSlaBreached.value ? "SLA: BREACH" : "SLA: OK"]
  });
  if (b.closedAt) events.push({
    ts: formatAbsolute(b.closedAt),
    type: "info",
    icon: SwitchButton,
    title: "缺陷关闭",
    desc: "已通过验证，正式关闭。"
  });
  if (b.status === "reopened") events.push({
    ts: formatAbsolute(b.updatedAt),
    type: "danger",
    icon: RefreshRight,
    title: "缺陷重新打开",
    desc: "修复质量信号：验证失败或回归。请复核 Solution + 补测。",
    meta: ["reopen-rate 指标 +1"]
  });
  if (b.updatedAt && b.updatedAt !== b.createdAt && b.updatedAt !== b.resolvedAt && b.updatedAt !== b.closedAt) {
    events.push({
      ts: formatAbsolute(b.updatedAt),
      type: "info",
      icon: Edit,
      title: "字段更新",
      desc: "元数据字段发生编辑。",
      meta: b.tags?.length ? b.tags.slice(0, 3) : undefined
    });
  }
  return events;
});

// ──────────────────────────────────────────────────────────────────
//  Linked data load
// ──────────────────────────────────────────────────────────────────
async function loadLinkedEntities() {
  const b = bug.value;
  if (!b) return;
  try {
    const [issueRes, moduleRes] = await Promise.all([getIssueList({ pageSize: 500 }), getModuleList({ pageSize: 500 })]);
    const allIssues = (issueRes.data?.list as Issue[]) ?? [];
    const allModules = (moduleRes.data?.list as Module[]) ?? [];
    linkedIssue.value = allIssues.find(i => i.key === b.issue_key) ?? null;
    linkedModule.value = allModules.find(m => m.name === b.module) ?? null;
  } catch { /* noop */ }
}

onMounted(async () => {
  await store.loadDetail(key);
  projectStore.fetchProjects({ pageSize: 100 });
  issueStore.fetchIssues({ pageSize: 500 });
  await loadLinkedEntities();
});

function projectName(key: string): string {
  return projects.value.find(p => p.key === key)?.name ?? "";
}
function goProject(key: string) {
  router.push(linkProject(key).link);
}
function issueTitle(key: string): string {
  const i = issues.value.find(x => x.key === key);
  return i ? i.title : key;
}
function goIssue(key: string) {
  router.push(linkIssue(key).link);
}
function goModule(key: string) {
  router.push(linkModule(key).link);
}
function goBack() {
  if (bug.value?.project_key) router.push(linkProject(bug.value.project_key).link);
  else router.push(linkBugList());
}
function handleDelete() {
  if (bug.value) {
    store.handleDelete(bug.value).then(() => router.push(linkBugList()));
  }
}

// Status transitions
const STATUS_TRANSITIONS: Record<string, Array<{ value: string; label: string }>> = {
  open: [
    { value: "in_progress", label: "Start Progress" },
    { value: "resolved", label: "Resolve" },
    { value: "closed", label: "Close" },
    { value: "rejected", label: "Reject" }
  ],
  in_progress: [
    { value: "resolved", label: "Resolve" },
    { value: "closed", label: "Close" },
    { value: "rejected", label: "Reject" },
    { value: "reopened", label: "Reopen" }
  ],
  resolved: [
    { value: "closed", label: "Close" },
    { value: "reopened", label: "Reopen" }
  ],
  closed: [{ value: "reopened", label: "Reopen" }],
  rejected: [
    { value: "open", label: "Reopen" },
    { value: "in_progress", label: "Start Progress" }
  ],
  reopened: [
    { value: "in_progress", label: "Start Progress" },
    { value: "resolved", label: "Resolve" },
    { value: "closed", label: "Close" }
  ]
};
function quickStatuses(current: string) {
  return STATUS_TRANSITIONS[current] || [];
}
async function quickChangeStatus(newStatus: string) {
  const b = bug.value;
  if (!b) return;
  try {
    await updateBug(b.key, { status: newStatus as BugStatus, updatedAt: Date.now() });
    ElMessage.success(`Bug ${b.key} → ${newStatus}`);
    await store.loadDetail(b.key);
  } catch (e: any) {
    ElMessage.error(e?.message || "Status change failed");
  }
}
</script>

<style scoped lang="scss">
@import "./styles/detail.scss";
</style>

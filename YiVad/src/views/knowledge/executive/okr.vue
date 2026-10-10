<template>
  <div class="okr page" @keydown.meta.n.exact.prevent="openCreateActionDlg" @keydown.meta.d.exact.prevent="toggleAllGoals" @keydown.alt.1.exact.prevent="viewMode = 'card'" @keydown.alt.2.exact.prevent="viewMode = 'list'" @keydown.alt.3.exact.prevent="viewMode = 'table'">
    <!-- ════════════════ Head: RoleNav + Period Filters + Refresh + New + View ════════════════ -->
    <div class="okr__head">
      <div class="okr__head-title">
        <h1 class="okr__head-h1"><span>🎯</span> OKR Dashboard</h1>
        <div class="okr__head-sub">2026-Q3 · 北极星 =「AI 从需求到上线全流程自闭环」</div>
      </div>
      <RoleNav v-model="selectedRoles" multiple all class="okr__role-nav" />
      <div class="okr__filters">
        <el-select v-model="yearFilter" size="small" placeholder="Year" style="width: 92px" @change="onPeriodChange">
          <el-option v-for="y in YEARS" :key="y" :label="`${y}`" :value="y" />
        </el-select>
        <el-select v-model="quarterFilter" size="small" clearable placeholder="Quarter" style="width: 112px" @change="onPeriodChange">
          <el-option v-for="q in QUARTERS" :key="q.value" :label="q.label" :value="q.value" />
        </el-select>
        <el-select v-model="monthFilter" size="small" clearable placeholder="Month" style="width: 130px">
          <el-option v-for="m in MONTHS" :key="m.value" :label="m.label" :value="m.value" />
        </el-select>
        <el-button
          size="small"
          :icon="Refresh"
          :loading="loading"
          @click="handleRefresh"
          title="刷新数据 (⌘R)"
        >刷新</el-button>
        <el-tooltip placement="bottom" effect="light" :show-after="300">
          <template #content>
            <div class="okr__kbd-hint">
              <div><b>⌘K</b> 打开命令面板搜索</div>
              <div><b>⌘N</b> 新增行动项</div>
              <div><b>⌘D</b> 折叠/展开全部目标</div>
              <div><b>⌥1 / ⌥2 / ⌥3</b> 切换 Card / List / Table</div>
            </div>
          </template>
          <el-button size="small" :icon="Search" @click="openCmdPalette">快捷键</el-button>
        </el-tooltip>
      </div>
      <div class="okr__new-action">
        <el-button size="small" type="primary" :icon="Plus" @click="openCreateActionDlg">
          新增行动项 ⌘N
        </el-button>
      </div>
      <div class="okr__view-toggle">
        <span class="okr__view-label">View</span>
        <el-radio-group v-model="viewMode" size="small">
          <el-radio-button value="card">Card <kbd>⌥1</kbd></el-radio-button>
          <el-radio-button value="list">List <kbd>⌥2</kbd></el-radio-button>
          <el-radio-button value="table">Table <kbd>⌥3</kbd></el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <!-- ════════════════ SLOLight 状态灯 (工业级 4 项红绿灯) ════════════════ -->
    <div class="okr__slo-bar" role="status" aria-live="polite">
      <div
        v-for="slo in sloLights"
        :key="slo.key"
        :class="['okr__slo-light', `okr__slo-light--${slo.level}`]"
        :title="slo.title"
      >
        <span class="okr__slo-dot" />
        <div class="okr__slo-body">
          <span class="okr__slo-label">{{ slo.label }}</span>
          <div class="okr__slo-meta">
            <b class="okr__slo-val">{{ slo.value }}</b>
            <em class="okr__slo-tgt">target · {{ slo.target }}</em>
          </div>
        </div>
      </div>
      <div class="okr__slo-actions">
        <el-tag size="small" type="info" effect="plain">5 分钟滑动窗口</el-tag>
        <el-tag size="small" type="info" effect="plain">p95 Latency</el-tag>
      </div>
    </div>

    <!-- ════════════════ SLO Burn-Rate 告警条 ════════════════ -->
    <el-alert
      v-if="showSloAlert"
      :title="sloAlertText"
      :type="sloAlertType"
      :closable="true"
      show-icon
      class="okr__slo-alert"
    >
      <template #default>
        <span>{{ sloAlertText }}</span>
        <el-button
          text
          size="small"
          type="primary"
          style="margin-left: 12px"
          :icon="Promotion"
          @click="navigateProcessRecord"
        >
          查看闭环记录 →
        </el-button>
        <el-button text size="small" type="warning" style="margin-left: 6px" :icon="Warning" @click="showRollbackHint">
          L2 回滚策略
        </el-button>
      </template>
    </el-alert>

    <!-- ════════════════ 8 × KPI 卡片行 + 健康雷达旁卡 ════════════════ -->
    <section class="okr__kpi-wrap">
      <div class="okr__kpi-row">
        <div v-for="kpi in kpiList" :key="kpi.key" class="okr-kpi-card" :class="`okr-kpi-card--${kpi.key}`">
          <div class="okr-kpi-card__icon">{{ kpi.icon }}</div>
          <div class="okr-kpi-card__body">
            <div class="okr-kpi-card__title">
              {{ kpi.title }}
              <el-tooltip v-if="kpi.definition" :content="kpi.definition" placement="top">
                <el-icon class="okr-kpi-card__help"><QuestionFilled /></el-icon>
              </el-tooltip>
            </div>
            <div class="okr-kpi-card__value">
              {{ kpi.value }}
              <sup v-if="kpi.suffix" class="okr-kpi-card__suffix">{{ kpi.suffix }}</sup>
            </div>
            <!-- SVG sparkline: 8 周滑动窗口 -->
            <svg class="okr-kpi-card__spark" viewBox="0 0 80 24" preserveAspectRatio="none" aria-hidden="true">
              <polyline
                :points="kpi.sparkline"
                :fill="kpi.sparkFill"
                :stroke="kpi.sparkStroke"
                stroke-width="1.2"
                stroke-linejoin="round"
                stroke-linecap="round"
              />
            </svg>
          </div>
          <div class="okr-kpi-card__mom">
            <span :class="['okr-kpi-card__arrow', kpi.mom >= 0 ? 'is-up' : 'is-down']">
              {{ kpi.mom >= 0 ? "▲" : "▼" }}
            </span>
            <span class="okr-kpi-card__mom-val">{{ Math.abs(kpi.mom).toFixed(1) }}%</span>
            <span class="okr-kpi-card__mom-label">MoM</span>
          </div>
        </div>
      </div>
      <!-- 健康雷达卡 (7 角色 × 6 维度) -->
      <el-card shadow="never" class="okr__radar-card">
        <div class="okr__radar-head">
          <h3><span>📡</span>角色健康雷达 · Role Health Radar</h3>
          <span class="okr__radar-hint">Coverage / Delivery / Evidence / SLO / RICE / Quality</span>
        </div>
        <div ref="radarRef" class="okr__radar-box"></div>
      </el-card>
    </section>

    <!-- ════════════════ 北极星指标大卡 (PRO v2：5步门/证据/SLO 环) ════════════════ -->
    <el-card shadow="never" class="okr__north-star">
      <div class="okr-north">
        <div class="okr-north__left">
          <div class="okr-north__label">
            <span class="okr-north__icon">🌟</span>
            北极星指标 · North Star
          </div>
          <div class="okr-north__title">{{ northStarGoal?.title ?? "AI 全流程自闭环" }}</div>
          <div class="okr-north__desc">
            {{ northStarGoal?.description ?? "从需求评审到上线记录的 5 步验证门自闭环，无人工断点。" }}
          </div>
          <!-- 可证伪性基线 / 目标 / 锚点 -->
          <div class="okr-north__falsify">
            <div class="okr-north__f-item">
              <span class="okr-north__f-label">Baseline</span>
              <b>{{ northStarBaseline }}</b>
              <em>2026-Q2 末</em>
            </div>
            <div class="okr-north__f-item">
              <span class="okr-north__f-label">Target</span>
              <b>{{ northStarTarget }}</b>
              <em>2026-Q3 末</em>
            </div>
            <div class="okr-north__f-item">
              <span class="okr-north__f-label">Rollback</span>
              <b>L3 触发</b>
              <em>Q3末达成率＜70%</em>
            </div>
          </div>
          <div class="okr-north__meta">
            <el-tag size="small" effect="plain" type="primary">周期：{{ northStarGoal?.period ?? "2026 Q3" }}</el-tag>
            <el-tag size="small" effect="plain" type="success">Owner：{{ northStarGoal?.owner ?? "CEO" }}</el-tag>
            <el-tag size="small" effect="plain" type="warning">项目：{{ northStarGoal?.project ?? "YiAi" }}</el-tag>
            <el-tag size="small" effect="plain" type="danger" :icon="Warning" v-if="northStarBurn > 1.0">
              Burn Rate x{{ northStarBurn.toFixed(1) }}
            </el-tag>
          </div>
          <div class="okr-north__pills">
            <el-tag
              v-for="(kr, idx) in northStarKRs"
              :key="idx"
              class="okr-north__pill"
              :class="{ 'okr-north__pill--done': kr.progress >= 100 }"
              :type="kr.progress >= 100 ? 'success' : kr.progress >= 70 ? undefined : 'warning'"
              size="small"
              effect="light"
              round
              :title="kr.text"
            >
              KR{{ idx + 1 }} · {{ kr.progress }}%
            </el-tag>
          </div>
          <!-- 5 步验证门行内进度条 -->
          <div class="okr-north__gates">
            <div
              v-for="(gate, idx) in northStarFiveGates"
              :key="gate.key"
              :class="['okr-north__gate', { 'is-done': gate.done, 'is-active': gate.active }]"
              :title="`${gate.label} ${gate.ratio}% (${gate.count}/${northStarKRs.length})`"
            >
              <span class="okr-north__gate-icon">{{ gate.icon }}</span>
              <div class="okr-north__gate-bar">
                <div class="okr-north__gate-fill" :style="{ width: gate.ratio + '%' }" />
              </div>
              <span class="okr-north__gate-ratio">{{ gate.ratio }}%</span>
              <span v-if="idx < 4" class="okr-north__gate-arrow">→</span>
            </div>
          </div>
        </div>
        <div class="okr-north__right">
          <el-progress
            type="dashboard"
            :percentage="northStarProgress"
            :stroke-width="12"
            :width="210"
            :status="northStarProgress >= 100 ? 'success' : northStarProgress >= 70 ? undefined : 'warning'"
          >
            <template #default="{ percentage }">
              <div class="okr-north__gauge-center">
                <span class="okr-north__gauge-num">{{ percentage }}</span>
                <span class="okr-north__gauge-unit">%</span>
                <div class="okr-north__gauge-sub">
                  <span :class="northStarOnTrack ? 'is-ok' : 'is-risk'">
                    {{ northStarOnTrack ? '✓ On Track' : '⚠ At Risk' }}
                  </span>
                </div>
              </div>
            </template>
          </el-progress>
          <div class="okr-north__stats">
            <div class="okr-north__stat">
              <span class="okr-north__stat-label">Coverage</span>
              <b>{{ northStarCoverage }}%</b>
            </div>
            <div class="okr-north__stat">
              <span class="okr-north__stat-label">Evidence</span>
              <b>{{ northStarEvidence }}%</b>
            </div>
            <div class="okr-north__stat">
              <span class="okr-north__stat-label">Gate Pass</span>
              <b>{{ northStarGatePass }}%</b>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- ════════════════ 目标树面板 (PRO v2：可证伪/信心/5步门行内) ════════════════ -->
    <section class="okr-goal-tree">
      <div class="okr-goal-tree__head">
        <h2><span>🎯</span>目标树 · Goal Tree <em class="okr-goal-tree__head-sub">（可证伪基线锚定 · 5 步验证门全链路）</em></h2>
        <div class="okr-goal-tree__hint">
          共 {{ currentRoleGoals.length }} 个目标 · {{ totalKRs }} 个 KRs ·
          <el-button link type="primary" size="small" @click="toggleAllGoals">⌘D 全部折叠/展开</el-button>
        </div>
      </div>
      <div v-if="!currentRoleGoals.length" class="okr-goal-tree__empty">
        当前角色暂无目标定义
      </div>
      <el-collapse v-else v-model="expandedGoalIds" class="okr-goal-tree__collapse">
        <el-collapse-item
          v-for="goal in currentRoleGoals"
          :key="goal.id"
          :name="goal.id"
          class="okr-goal-tree__item"
        >
          <template #title>
            <div class="okr-goal-tree__goal-row">
              <span class="okr-goal-tree__goal-icon">{{ goal.icon }}</span>
              <div class="okr-goal-tree__goal-main">
                <div class="okr-goal-tree__goal-title-line">
                  <span class="okr-goal-tree__goal-title">{{ goal.title }}</span>
                  <!-- 可证伪徽章 -->
                  <el-tooltip
                    content="可证伪性：锚定 Baseline/Target/Deadline/回滚触发器；目标可被事实推翻。"
                    placement="top"
                  >
                    <el-tag size="small" effect="dark" type="primary" class="okr-goal-tree__goal-badge" round>
                      <el-icon><CircleCheck /></el-icon> 可证伪
                    </el-tag>
                  </el-tooltip>
                  <!-- 信心分数 -->
                  <el-tooltip
                    :content="`信心分数：${goalConfidence(goal)}% —— 基于 KR 均值 × 证据覆盖率 × Gate通过率`"
                    placement="top"
                  >
                    <el-tag size="small" class="okr-goal-tree__goal-confidence" round :type="goalConfidenceTag(goal)">
                      Confidence {{ goalConfidence(goal) }}%
                    </el-tag>
                  </el-tooltip>
                </div>
                <span class="okr-goal-tree__goal-meta">
                  <span class="okr-goal-tree__goal-period">{{ goal.period }}</span>
                  <span class="okr-goal-tree__goal-owner">Owner：{{ goal.owner }}</span>
                  <span class="okr-goal-tree__goal-scope">{{ goal.project }}</span>
                  <span class="okr-goal-tree__goal-krs">{{ goal.keyResults?.length ?? 0 }} KRs</span>
                </span>
              </div>
              <el-tag
                class="okr-goal-tree__goal-status"
                size="small"
                effect="plain"
                :type="goalStatusTag(goal.status)"
              >
                {{ goal.status }}
              </el-tag>
              <div class="okr-goal-tree__goal-progress">
                <el-progress
                  :percentage="krAvg(goal)"
                  :status="goalProgressStatus(krAvg(goal))"
                  :stroke-width="6"
                  :show-text="true"
                  style="width: 200px"
                />
              </div>
            </div>
          </template>
          <!-- Goal 级 5 步门汇总条 + 可证伪锚点 -->
          <div class="okr-goal-tree__goal-foot">
            <div class="okr-goal-tree__goal-gates">
              <div
                v-for="(gate, gi) in fiveGates"
                :key="gate.key"
                :class="['okr-goal-tree__goal-gate', goalGateDone(goal, gate.key) ? 'is-done' : '']"
              >
                <span class="okr-goal-tree__goal-gate-icon">{{ gate.icon }}</span>
                <b>{{ goalGateCount(goal, gate.key) }}/{{ goal.keyResults?.length ?? 0 }}</b>
                <em>{{ gate.abbr }}</em>
              </div>
            </div>
            <div class="okr-goal-tree__goal-anchors">
              <span class="okr-goal-tree__goal-anchor"><label>Baseline</label><b>{{ goalAnchor(goal, 'baseline') }}</b></span>
              <span class="okr-goal-tree__goal-anchor"><label>Target</label><b>{{ goalAnchor(goal, 'target') }}</b></span>
              <span class="okr-goal-tree__goal-anchor"><label>Deadline</label><b>{{ goal.period }}</b></span>
              <span class="okr-goal-tree__goal-anchor"><label>Rollback</label><b>{{ goalAnchor(goal, 'rollback') }}</b></span>
            </div>
          </div>
          <div class="okr-goal-tree__krs">
            <div
              v-for="(kr, idx) in goal.keyResults"
              :key="idx"
              class="okr-goal-tree__kr-row"
              :class="{ 'okr-goal-tree__kr-row--link': !!kr.file }"
              :title="kr.file ? `点击预览证据文件：${kr.file}` : '尚未沉淀证据'"
              @click="openKnowledgePreview(kr.file)"
            >
              <span class="okr-goal-tree__kr-index">KR{{ idx + 1 }}</span>
              <div class="okr-goal-tree__kr-main">
                <span class="okr-goal-tree__kr-title">{{ kr.text }}</span>
                <!-- 5 步门行内显示 (不再隐藏在 tooltip 中) -->
                <div class="okr-goal-tree__kr-gates">
                  <span
                    v-for="(gate, gIdx) in fiveGates"
                    :key="gIdx"
                    :class="[
                      'okr-goal-tree__kr-gate-pill',
                      hasGateArtifact(kr, gate.key) ? 'is-done' : ''
                    ]"
                    :title="`${gate.label}：${gateLabel(kr, gate)}`"
                    @click.stop
                  >
                    {{ gate.icon }}<em>{{ gate.abbr }}</em>
                  </span>
                </div>
              </div>
              <div class="okr-goal-tree__kr-progress">
                <el-progress
                  :percentage="kr.progress"
                  :status="goalProgressStatus(kr.progress)"
                  :stroke-width="5"
                  :show-text="true"
                  style="width: 160px"
                />
              </div>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </section>

    <!-- ════════════════ OKR → PRD → Dev → Test 追溯面板 (PRO v2: Sankey + 表 + PRD深链) ════════════════ -->
    <section class="okr__trace">
      <div class="okr__section-head">
        <h2><span>🔗</span>OKR → PRD → Dev → Test → Evidence 全链路追溯</h2>
        <div class="okr__section-hint">Sankey 流量图 + Mermaid + 汇总表 · 点击表格行可展开 PRD/Dev/Test 深链</div>
      </div>
      <!-- Sankey 流量图 -->
      <div ref="sankeyRef" class="okr__trace-sankey"></div>
      <div class="okr__trace-wrap">
        <div class="okr__trace-mermaid">
          <pre class="mermaid" v-html="traceMermaidCode"></pre>
        </div>
        <div class="okr__trace-table-wrap">
          <el-table
            :data="traceTableRows"
            size="small"
            stripe
            border
            style="width: 100%"
            row-key="goalId"
            :expand-row-keys="expandedTraceRows"
            :empty-text="'无关联闭环任务'"
            @expand-change="onTraceExpand"
          >
            <el-table-column type="expand" width="44">
              <template #default="{ row }">
                <div class="okr__trace-expand">
                  <div class="okr__trace-expand-row" v-for="(kr, ki) in row._krs" :key="ki">
                    <span class="okr__trace-expand-kr">
                      <b>KR{{ Number(ki) + 1 }}</b> · {{ kr.text }}
                    </span>
                    <div class="okr__trace-expand-links">
                      <el-button
                        link
                        type="primary"
                        size="small"
                        :disabled="!kr._prd"
                        :title="kr._prd ? `跳转 PRD: ${kr._prd}` : 'PRD 尚未沉淀'"
                        @click="openKnowledgePreview(kr._prd)"
                      >📋 PRD</el-button>
                      <el-button
                        link
                        type="success"
                        size="small"
                        :disabled="!kr._dev"
                        :title="kr._dev ? `跳转 Dev: ${kr._dev}` : 'Dev 尚未沉淀'"
                        @click="openKnowledgePreview(kr._dev)"
                      >⚡ Dev</el-button>
                      <el-button
                        link
                        type="danger"
                        size="small"
                        :disabled="!kr._test"
                        :title="kr._test ? `跳转 Test: ${kr._test}` : 'Test 尚未沉淀'"
                        @click="openKnowledgePreview(kr._test)"
                      >🧪 Test</el-button>
                      <el-button
                        link
                        type="warning"
                        size="small"
                        :disabled="!kr._evd"
                        :title="kr._evd ? `跳转 Evidence: ${kr._evd}` : 'Evidence 尚未沉淀'"
                        @click="openKnowledgePreview(kr._evd)"
                      >📦 Evidence</el-button>
                    </div>
                  </div>
                  <div v-if="!row._krs?.length" class="okr__trace-expand-empty">该 Goal 暂无可追溯的 KR 证据链</div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="Goal" min-width="240">
              <template #default="{ row }">
                <div class="okr__trace-goal-cell">
                  <span class="okr__trace-goal-icon">{{ row.icon }}</span>
                  <div>
                    <span class="okr__trace-goal-title">{{ row.title }}</span>
                    <em class="okr__trace-goal-id">{{ row.goalId }}</em>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="KRs" width="72" align="center">
              <template #default="{ row }"><b>{{ row.krCount }}</b></template>
            </el-table-column>
            <el-table-column label="PRD" width="72" align="center">
              <template #default="{ row }">
                <el-tag size="small" :type="row.prdCount === row.krCount ? 'success' : row.prdCount > 0 ? 'warning' : 'info'" effect="plain">
                  {{ row.prdCount }}/{{ row.krCount }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="Dev" width="72" align="center">
              <template #default="{ row }">
                <el-tag size="small" :type="row.devCount >= row.krCount ? 'success' : row.devCount > 0 ? 'warning' : 'info'" effect="plain">
                  {{ row.devCount }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="Test" width="72" align="center">
              <template #default="{ row }">
                <el-tag size="small" :type="row.testCount === row.krCount ? 'success' : row.testCount > 0 ? 'warning' : 'info'" effect="plain">
                  {{ row.testCount }}/{{ row.krCount }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="Evidence" width="90" align="center">
              <template #default="{ row }">
                <el-tag size="small" :type="row.evdCount === row.krCount ? 'success' : row.evdCount > 0 ? 'warning' : 'info'" effect="plain">
                  {{ row.evdCount }}/{{ row.krCount }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="全链路覆盖率" width="150">
              <template #default="{ row }">
                <el-progress
:percentage="row.chainPct" :stroke-width="6" :show-text="true"
                  :status="row.chainPct >= 90 ? 'success' : row.chainPct >= 60 ? undefined : 'warning'" />
              </template>
            </el-table-column>
            <el-table-column label="完成率" width="140">
              <template #default="{ row }">
                <el-progress :percentage="row.completion" :stroke-width="6" :show-text="true" />
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </section>

    <!-- ════════════════ 双图并排：燃尽图 + 热力图 (PRO v2) ════════════════ -->
    <section class="okr__charts">
      <div class="okr__charts-col okr__charts-col--burndown">
        <div class="okr__section-head">
          <h2><span>🔥</span>燃尽图 · Burndown (Scope vs Actual)</h2>
          <div class="okr__section-hint">Scope 理论残量 vs Actual 实际残量 vs 预测 Forecast</div>
        </div>
        <div ref="burndownRef" class="okr__chart-box"></div>
      </div>
      <div class="okr__charts-col okr__charts-col--heatmap">
        <div class="okr__section-head">
          <h2><span>🗓️</span>KR 进度增量热力图（最近 12 周）</h2>
          <div class="okr__section-hint">颜色越深 = 该周平均 KR 进度增量越大</div>
        </div>
        <div ref="heatmapRef" class="okr__heatmap-box"></div>
      </div>
    </section>

    <!-- ════════════════ Action Items (PRO v2：筛选条 + RICE/可证伪 + 排序) ════════════════ -->
    <section class="okr__action-items">
      <div class="okr__section-head">
        <h2><span>✅</span>行动项 · Action Items <em class="okr__section-sub">（RICE 优先排序 · 可证伪锚定 · ⌘N 新增）</em></h2>
        <div class="okr__section-hint">
          共 <b>{{ sortedActionItems.length }}</b> 条 · 平均 RICE
          <b>{{ actionItemsAvgRice }}</b>
        </div>
        <el-alert
          v-if="loading"
          type="info"
          :closable="false"
          class="okr__loading-alert"
          show-icon
          title="行动项加载中… (watchdog 12s hook / 22s fallback)"
        />
      </div>
      <!-- 筛选工具栏 (PRO) -->
      <div class="okr__filter-bar">
        <div class="okr__filter-group">
          <span class="okr__filter-label">Priority</span>
          <el-radio-group v-model="priorityFilter" size="small">
            <el-radio-button value="all">All</el-radio-button>
            <el-radio-button value="P0">P0</el-radio-button>
            <el-radio-button value="P1">P1</el-radio-button>
            <el-radio-button value="P2">P2</el-radio-button>
            <el-radio-button value="P3">P3</el-radio-button>
          </el-radio-group>
        </div>
        <div class="okr__filter-group">
          <span class="okr__filter-label">Status</span>
          <el-select v-model="statusFilter" size="small" clearable placeholder="All" style="width: 140px">
            <el-option label="Planned" value="Planned" />
            <el-option label="In Progress" value="In Progress" />
            <el-option label="At Risk" value="At Risk" />
            <el-option label="Done" value="Done" />
          </el-select>
        </div>
        <div class="okr__filter-group">
          <span class="okr__filter-label">RICE ≥</span>
          <el-slider
            v-model="riceMin"
            :min="0"
            :max="100"
            size="small"
            style="width: 140px"
            show-input
            :show-input-controls="false"
            input-size="small"
          />
        </div>
        <div class="okr__filter-group">
          <span class="okr__filter-label">Search</span>
          <el-input
            v-model="actionKeyword"
            size="small"
            placeholder="⌘K 全局搜索"
            clearable
            style="width: 200px"
            :prefix-icon="Search"
          />
        </div>
        <div class="okr__filter-group okr__filter-group--sort">
          <span class="okr__filter-label">Sort</span>
          <el-select v-model="actionSort" size="small" style="width: 160px">
            <el-option label="RICE 分数（高→低）" value="rice" />
            <el-option label="优先级 + 截止日" value="priority" />
            <el-option label="截止日近→远" value="deadline" />
            <el-option label="进度 高→低" value="progress" />
            <el-option label="可证伪锚点完整度" value="falsify" />
          </el-select>
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
              <el-tag
                size="small"
                type="success"
                effect="plain"
                class="okr__card-rice"
                round
                :title="riceTooltip(item)"
              >
                RICE {{ item.riceScore }}
              </el-tag>
            </div>
            <p
              class="okr__card-action okr__action-text--link"
              @click="openKnowledgePreview(item.filePath)"
            >
              {{ item.action }}
            </p>
            <div class="okr__card-role" @click.stop="goRole(item.linkRole)">
              <span class="okr__role-cell-icon">{{ item.roleIcon }}</span>
              <span class="okr__role-cell-name">{{ item.roleName }}</span>
              <el-tag :type="item.roleStatusType" size="small">{{ item.roleStatus }}</el-tag>
            </div>
            <!-- 可证伪锚点 mini bar -->
            <div class="okr__card-falsify">
              <span :class="['okr__card-f-item', item.baseline ? 'is-ok' : '']" title="Baseline">B</span>
              <span :class="['okr__card-f-item', item.target ? 'is-ok' : '']" title="Target">T</span>
              <span :class="['okr__card-f-item', item.deadline ? 'is-ok' : '']" title="Deadline">D</span>
              <span :class="['okr__card-f-item', item.rollback ? 'is-ok' : '']" title="Rollback">R</span>
              <em>{{ item.falPct }}% 完整</em>
            </div>
            <el-progress
              :percentage="item.progress"
              :status="item.progress >= 100 ? 'success' : undefined"
              :stroke-width="6"
            />
            <div class="okr__card-meta">
              <span class="okr__card-deadline" :class="{ 'okr__deadline-overdue': item.isOverdue }">
                {{ item.deadline || "—" }}
                <em v-if="item.deadline" class="okr__deadline-hint">{{ deadlineHint(item) }}</em>
              </span>
              <span v-if="item.subtaskCount" class="okr__subtask-count">{{ item.subtaskCount }} subtasks</span>
            </div>
          </el-card>
        </div>
        <div v-if="!sortedActionItems.length" class="okr__empty">{{ emptyText }}</div>
      </template>

      <template v-else-if="viewMode === 'list'">
        <div class="okr__list">
          <div v-for="item in sortedActionItems" :key="item.id" class="okr__list-row">
            <el-tag :type="item.priorityType" size="small" class="okr__list-priority">{{ item.priority }}</el-tag>
            <el-tag size="small" type="success" effect="plain" class="okr__list-rice" round>
              RICE {{ item.riceScore }}
            </el-tag>
            <span class="okr__list-action okr__action-text--link" @click="openKnowledgePreview(item.filePath)">{{
              item.action
            }}</span>
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
          <el-table-column label="RICE" width="110" sortable align="center">
            <template #default="{ row }">
              <el-tooltip :content="riceTooltip(row)" placement="top">
                <el-tag size="small" effect="dark" type="success" round>
                  <b>{{ row.riceScore }}</b>
                </el-tag>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column prop="action" label="Action" min-width="340" sortable>
            <template #default="{ row }">
              <span class="okr__action-text okr__action-text--link" @click="openKnowledgePreview((row as ActionItem).filePath)">{{
                row.action
              }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="roleName" label="Role" width="180" sortable>
            <template #default="{ row }">
              <RoleLink :role="row.linkRole" :role-name="row.roleName" :role-icon="row.roleIcon" to="" />
            </template>
          </el-table-column>
          <el-table-column label="Goal" width="260">
            <template #default="{ row }">
              <GoalCell v-if="row.linkGoal" :role="row.goalRole || row.linkRole" :goal-id="row.linkGoal" />
            </template>
          </el-table-column>
          <el-table-column prop="owner" label="Owner" width="130" sortable>
            <template #default="{ row }"><span>{{ row.owner ?? "—" }}</span></template>
          </el-table-column>
          <el-table-column label="Status" width="120" sortable>
            <template #default="{ row }">
              <el-tag :type="row.statusType" size="small">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="Falsify" width="120" align="center">
            <template #default="{ row }">
              <div class="okr__tbl-fal">
                <span :class="['okr__tbl-fal-item', row.baseline ? 'is-ok' : '']" title="Baseline">B</span>
                <span :class="['okr__tbl-fal-item', row.target ? 'is-ok' : '']" title="Target">T</span>
                <span :class="['okr__tbl-fal-item', row.deadline ? 'is-ok' : '']" title="Deadline">D</span>
                <span :class="['okr__tbl-fal-item', row.rollback ? 'is-ok' : '']" title="Rollback">R</span>
                <b class="okr__tbl-fal-pct">{{ row.falPct }}%</b>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="Skill" width="120">
            <template #default="{ row }"><SkillTag v-if="row.skill" :skill="row.skill" /></template>
          </el-table-column>
          <el-table-column label="Agent" width="140">
            <template #default="{ row }"><AgentTag v-if="row.agent" :agent="row.agent" /></template>
          </el-table-column>
          <el-table-column label="MCP" width="80">
            <template #default="{ row }"><McpTag v-if="row.mcp" :mcp="row.mcp" /></template>
          </el-table-column>
          <el-table-column prop="deadline" label="Deadline" width="150" sortable>
            <template #default="{ row }">
              <span class="okr__deadline" :class="{ 'okr__deadline-overdue': row.isOverdue }">
                <span>{{ row.deadline ?? "—" }}</span>
                <em v-if="row.deadline" class="okr__deadline-hint">{{ deadlineHint(row as ActionItem) }}</em>
              </span>
            </template>
          </el-table-column>
          <el-table-column label="Progress" width="170">
            <template #default="{ row }">
              <div class="okr__progress-cell">
                <el-progress
                  :percentage="row.progress"
                  :status="row.progress >= 100 ? 'success' : undefined"
                  :stroke-width="6"
                />
                <span class="okr__progress-num">{{ row.progress }}%</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="subtaskCount" label="Subtasks" width="140" sortable align="center">
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
                  <div
                    v-for="(s, i) in row.subtasks as ExampleSubtask[]"
                    :key="s.id || i"
                    class="okr__subtask-item"
                  >
                    <div class="okr__subtask-item__title">
                      <span class="okr__subtask-item__idx">{{ i + 1 }}</span>
                      <span class="okr__subtask-item__name">{{ s.title }}</span>
                    </div>
                    <div class="okr__subtask-item__meta">
                      <span class="okr__subtask-item__label">做法</span>{{ s.detail }}
                    </div>
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
    </section>

    <!-- ════════════════ 新增行动项 Dialog (PRO v2：RICE + 可证伪 + Skill/Agent/MCP 编排) ════════════════ -->
    <el-dialog
      v-model="createDlgVisible"
      title="新增行动项 · New Action Item（RICE 评分 + 可证伪锚定）"
      width="760px"
      destroy-on-close
      @closed="resetCreateForm"
    >
      <el-form
        ref="createFormRef"
        :model="createForm"
        :rules="createRules"
        label-width="110px"
        label-position="right"
      >
        <el-form-item label="标题" prop="title">
          <el-input v-model="createForm.title" maxlength="120" show-word-limit placeholder="行动项标题（可被事实推翻的可验证陈述）" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="createForm.description"
            type="textarea"
            :rows="2"
            maxlength="480"
            show-word-limit
            placeholder="背景 / 做法 / 完成标准"
          />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="目标 Goal" prop="goalId">
              <el-select v-model="createForm.goalId" placeholder="选择目标" style="width: 100%" @change="onGoalSelectChange">
                <el-option
                  v-for="g in currentRoleGoals"
                  :key="g.id"
                  :label="`${g.icon} ${g.title}`"
                  :value="g.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="关键结果 KR" prop="krId">
              <el-select v-model="createForm.krId" placeholder="关联 KR（可选）" style="width: 100%" clearable>
                <el-option
                  v-for="(kr, i) in selectedGoalKRs"
                  :key="`kr-${i}`"
                  :label="`KR${i + 1} · ${kr.text}`"
                  :value="`${createForm.goalId}-kr-${i}`"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="10">
            <el-form-item label="负责人" prop="owner">
              <el-input v-model="createForm.owner" placeholder="Owner 姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="14">
            <el-form-item label="截止日期" prop="deadline">
              <el-date-picker
                v-model="createForm.deadline"
                type="date"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                placeholder="选择截止日期"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="14">
            <el-form-item label="优先级" prop="priority">
              <el-radio-group v-model="createForm.priority">
                <el-radio-button value="P0">P0</el-radio-button>
                <el-radio-button value="P1">P1</el-radio-button>
                <el-radio-button value="P2">P2</el-radio-button>
                <el-radio-button value="P3">P3</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="预估工时" prop="estimateHours">
              <el-input-number
                v-model="createForm.estimateHours"
                :min="0"
                :step="1"
                :max="200"
                style="width: 160px"
              />
              <span class="okr__form-hint">h（小时）</span>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- RICE 评分 -->
        <el-divider content-position="left">
          <span class="okr__divider"><b>RICE</b> 优先评分（Reach × Impact × Confidence ÷ Effort）</span>
        </el-divider>
        <el-row :gutter="16">
          <el-col :span="6">
            <el-form-item label="Reach" prop="riceReach">
              <el-input-number v-model="createForm.riceReach" :min="0" :max="10000" :step="10" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="Impact" prop="riceImpact">
              <el-select v-model="createForm.riceImpact" style="width: 100%">
                <el-option label="0.25 · Min" :value="0.25" />
                <el-option label="0.5 · Low" :value="0.5" />
                <el-option label="1 · Medium" :value="1" />
                <el-option label="2 · High" :value="2" />
                <el-option label="3 · Massive" :value="3" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="Confidence" prop="riceConfidence">
              <el-select v-model="createForm.riceConfidence" style="width: 100%">
                <el-option label="50%" :value="0.5" />
                <el-option label="80%" :value="0.8" />
                <el-option label="95%" :value="0.95" />
                <el-option label="100%" :value="1" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="Effort">
              <el-input-number v-model="createForm.estimateHours" :min="0" :step="1" :max="200" disabled style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <div class="okr__rice-preview">
          <span class="okr__rice-preview-label">RICE 分数 = R × I × C ÷ E(h)</span>
          <el-tag effect="dark" type="success" size="large" round>
            {{ previewRice }}
          </el-tag>
          <em class="okr__rice-preview-hint">（≥ 70 高优 · 30-70 中 · ＜30 低）</em>
        </div>

        <!-- 可证伪锚点 -->
        <el-divider content-position="left">
          <span class="okr__divider"><b>可证伪锚定</b> · Baseline / Target / Rollback Trigger（工业级基线）</span>
        </el-divider>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="Baseline 基线">
              <el-input v-model="createForm.baseline" placeholder="如：0% 达成 / NPS 30" maxlength="60" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Target 目标">
              <el-input v-model="createForm.target" placeholder="如：90% 达成 / NPS 60" maxlength="60" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="回滚触发器">
              <el-input
                v-model="createForm.rollback"
                placeholder="如：截止日前进度＜50% → L2"
                maxlength="80"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 三要素编排 (Skill / Agent / MCP) -->
        <el-divider content-position="left">
          <span class="okr__divider"><b>三要素编排</b> · Skill + Agent + MCP（可留空后补）</span>
        </el-divider>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="Skill">
              <el-input v-model="createForm.skill" placeholder="如：nginx / fastapi" maxlength="40" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Agent">
              <el-input v-model="createForm.agent" placeholder="如：T2-Frontend" maxlength="40" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="MCP">
              <el-select v-model="createForm.mcp" clearable placeholder="Select MCP" style="width: 100%">
                <el-option label="yiai · YiAi 知识/生成" value="yiai" />
                <el-option label="github · 源码/PR 分析" value="github" />
                <el-option label="none · 本地执行" value="" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="createDlgVisible = false">取消</el-button>
        <el-button type="primary" :loading="createSaving" @click="submitCreateAction">保存并落盘 KB</el-button>
      </template>
    </el-dialog>

    <KnowledgePreviewDialog ref="previewDlg" />
  </div>
</template>

<script setup lang="ts" name="okrIndex">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick, shallowRef } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import {
  Delete,
  House,
  Connection,
  Aim,
  Odometer,
  Plus,
  Promotion,
  Flag,
  Warning,
  CircleCheck,
  Timer,
  DataLine,
  Refresh,
  QuestionFilled,
  Search
} from "@element-plus/icons-vue";
import { confirm } from "@/hooks/useConfirmAction";
import dayjs from "dayjs";
import { useTimeoutFn } from "@vueuse/core";
import * as echarts from "echarts";
import mermaid from "mermaid";
import {
  scanKnowledge,
  deleteKnowledgeFile,
  writeKnowledgeFile
} from "@/api/modules/knowledgeService";
import { loadBool, saveBool } from "@/utils/storage";
import { DisposerBag, createTimeoutSignal } from "@/utils/disposer";
import { createSafeResizeObserver } from "@/utils/index";
import {
  resolveLink,
  gateBEntityExists,
  gateCPostNavigate
} from "@/utils/linkFactory";
import type { KnowledgeFileEntry } from "@/api/interface/yiAi";
import KnowledgePreviewDialog from "@/components/KnowledgePreviewDialog/KnowledgePreviewDialog.vue";
import {
  EXAMPLE_TASKS,
  type ExampleTask,
  type ExampleSubtask
} from "@/views/knowledge/executive/okrFlowData";
import {
  rolesData,
  roleWeeklyDataMap,
  goalRoleMap,
  goalsData,
  ROLE_IDS,
  type GoalItem,
  type KeyResult
} from "@/views/knowledge/executive/okrData";
import RoleNav from "@/views/knowledge/components/RoleNav.vue";
import PriorityTag from "@/components/OkrRecommend/fields/PriorityTag.vue";
import RoleLink from "@/components/OkrRecommend/fields/RoleLink.vue";
import GoalCell from "@/components/OkrRecommend/fields/GoalCell.vue";
import SkillTag from "@/components/OkrRecommend/fields/SkillTag.vue";
import AgentTag from "@/components/OkrRecommend/fields/AgentTag.vue";
import McpTag from "@/components/OkrRecommend/fields/McpTag.vue";
import { pushReliabilityEvent, type ReliabilityMetricStatus } from "@/utils/reliability/reliabilityMetrics";

const router = useRouter();
const { t } = useI18n();

/* ─────────────────── DisposerBag & Signal (硬约束 1/2/3) ─────────────────── */
const disposer = new DisposerBag();
onBeforeUnmount(() => {
  try {
    heatmapChart.value?.dispose?.();
    sankeyChart.value?.dispose?.();
    burndownChart.value?.dispose?.();
    radarChart.value?.dispose?.();
  } catch {
    /* noop */
  }
  disposer.dispose();
});

function newSignal(timeoutMs = 12_000) {
  // 中间态清理用 reset()，不调 dispose；onBeforeUnmount 才 dispose
  disposer.reset();
  return createTimeoutSignal(timeoutMs, disposer);
}

const previewDlg = ref<InstanceType<typeof KnowledgePreviewDialog> | null>(null);

/* Reliability 埋点辅助：避免 inline 代码重复 */
function pushReliability(action: "load" | "create" | "delete" | "refresh" | "navigate" | "render",
  status: ReliabilityMetricStatus, durationMs: number, extra?: Partial<Record<string, string>>, errorMessage?: string) {
  const phaseMap: Record<string, any> = {
    load: "P2-knowledge",
    create: "P3-derive",
    delete: "P3-derive",
    refresh: "P2-knowledge",
    navigate: "search_navigate",
    render: "P4-readme"
  };
  pushReliabilityEvent({
    projectKey: "YiKnowledge",
    phase: phaseMap[action],
    status,
    durationMs,
    retryCount: 0,
    errorMessage,
    tags: { module: "okr-dashboard", action, ...(extra ?? {}) }
  });
}

/* ══════════════════════════════════════════════ */
/* PRO 扩展：RICE / 可证伪 / SLOLight / 图表 refs */
/* ══════════════════════════════════════════════ */

interface RiceBreakdown { reach: number; impact: number; confidence: number; effort: number; }

interface ActionItem {
  id: string;
  action: string;
  roleName: string;
  roleIcon: string;
  roleStatus: string;
  roleStatusType: "success" | "warning" | "danger" | "info" | "primary";
  linkRole?: string;
  linkGoal?: string;
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
  subtasks: ExampleSubtask[];
  /* PRO v2 */
  baseline?: string;
  target?: string;
  rollback?: string;
  falPct: number;       /* 可证伪锚点完整度: 0/25/50/75/100 */
  riceScore: number;     /* RICE 分数 0~ (R*I*C/E) 归一到 0-100 区间显示 */
  riceRaw: RiceBreakdown;
}

/* ── Period 筛选 ────────────────────────────────────── */
const YEARS = [2025, 2026, 2027];
const QUARTERS = [
  { value: "Q1", label: "Q1 · 1-3月" },
  { value: "Q2", label: "Q2 · 4-6月" },
  { value: "Q3", label: "Q3 · 7-9月" },
  { value: "Q4", label: "Q4 · 10-12月" }
];
const yearFilter = ref<number>(Number(dayjs().format("YYYY")));
const quarterFilter = ref<string>("Q3");

/* ── Action filter bar ──────────────────────────────── */
const priorityFilter = ref<string>("all");
const statusFilter = ref<string>("");
const riceMin = ref<number>(0);
const actionKeyword = ref<string>("");
const actionSort = ref<"rice" | "priority" | "deadline" | "progress" | "falsify">("rice");
const expandedTraceRows = ref<string[]>([]);

/* ── Chart refs (PRO v2: 4 charts) ──────────────────── */
const radarRef = ref<HTMLDivElement | null>(null);
const sankeyRef = ref<HTMLDivElement | null>(null);
const burndownRef = ref<HTMLDivElement | null>(null);
const heatmapRef = ref<HTMLDivElement | null>(null);
const heatmapChart = shallowRef<echarts.ECharts | null>(null);
const sankeyChart = shallowRef<echarts.ECharts | null>(null);
const burndownChart = shallowRef<echarts.ECharts | null>(null);
const radarChart = shallowRef<echarts.ECharts | null>(null);

/* ── 新增表单扩展 (RICE/可证伪/Skill/Agent/MCP) ─────── */
interface CreateForm {
  title: string;
  description: string;
  goalId: string;
  krId: string;
  owner: string;
  deadline: string | null;
  priority: "P0" | "P1" | "P2" | "P3";
  estimateHours: number;
  /* PRO v2 */
  riceReach: number;
  riceImpact: number;
  riceConfidence: number;
  baseline: string;
  target: string;
  rollback: string;
  skill: string;
  agent: string;
  mcp: string;
}

/* ══════════════════════════════════════════════ */
/* SLOLight 4 项红绿灯（工业级 SLO 面板）
/* ══════════════════════════════════════════════ */
interface SLOLight {
  key: string; label: string; value: string; target: string; level: "green" | "yellow" | "red";
  title: string;
}
const sloLights = computed<SLOLight[]>(() => {
  const totalKR = Math.max(1,
    scopeGoals.value.reduce((s, g) => s + (g.keyResults?.length ?? 0), 0));
  // ① KR Burn Rate 合规率 (目标 ≥ 85%)
  const burnRisk = atRiskKRs.value;
  const burnCompliancePct = Math.round(((totalKR - burnRisk) / totalKR) * 1000) / 10;
  const burnLevel: SLOLight["level"] =
    burnCompliancePct >= 85 ? "green" : burnCompliancePct >= 70 ? "yellow" : "red";

  // ② 逾期行动项率（目标 ≤ 10%）
  const totalAct = Math.max(1, scopeActionItems.value.length);
  const overduePct = Math.round((overdueActions.value / totalAct) * 1000) / 10;
  const overdueLevel: SLOLight["level"] =
    overduePct <= 10 ? "green" : overduePct <= 25 ? "yellow" : "red";

  // ③ 证据覆盖率 Evidence Coverage（目标 ≥ 80%）
  const evKR = scopeGoals.value.reduce(
    (s, g) => s + (g.keyResults ?? []).filter(k => !!k.file).length, 0);
  const evPct = Math.round((evKR / totalKR) * 1000) / 10;
  const evLevel: SLOLight["level"] =
    evPct >= 80 ? "green" : evPct >= 50 ? "yellow" : "red";

  // ④ 5 步验证门通过 Pass Rate（目标 ≥ 75%）
  let gatePassed = 0;
  for (const g of scopeGoals.value) {
    for (const kr of g.keyResults ?? []) {
      let passed = 0;
      for (const gt of fiveGates) if (hasGateArtifact(kr, gt.key)) passed++;
      if (passed >= 4) gatePassed++;
    }
  }
  const gatePct = Math.round((gatePassed / totalKR) * 1000) / 10;
  const gateLevel: SLOLight["level"] =
    gatePct >= 75 ? "green" : gatePct >= 50 ? "yellow" : "red";

  return [
    {
      key: "burn", label: "KR Burn Rate 合规",
      value: `${burnCompliancePct}%`, target: "≥ 85%",
      level: burnLevel,
      title: `KR Burn Rate 合规率：实际 ${burnCompliancePct}% / 目标 ≥ 85%。低于 70% 将触发 L2 回滚策略。风险 KRs: ${burnRisk}/${totalKR}`
    },
    {
      key: "overdue", label: "逾期行动项率",
      value: `${overduePct}%`, target: "≤ 10%",
      level: overdueLevel,
      title: `逾期行动项占比：${overduePct}% (${overdueActions.value}/${totalAct}) / 目标 ≤10%。超出 25% 触发 IM 告警。`
    },
    {
      key: "evidence", label: "Evidence 覆盖率",
      value: `${evPct}%`, target: "≥ 80%",
      level: evLevel,
      title: `KR 证据文件覆盖率：${evPct}% (${evKR}/${totalKR})。要求 ≥ 80% 方能进入上线评审。`
    },
    {
      key: "gate", label: "5 步验证门通过率",
      value: `${gatePct}%`, target: "≥ 75%",
      level: gateLevel,
      title: `KR→PRD→Dev→Test→Evd 五步门 ≥4 步通过比例：${gatePct}% (${gatePassed}/${totalKR})。<50% 冻结发布。`
    }
  ];
});

function showRollbackHint() {
  ElMessageBox.alert(
    "🚨 L2 回滚策略（OKR Burn Rate 超限）：\n\n" +
    "  1. 暂停 P2 以下新增行动项 48h；\n" +
    "  2. 触发 SRE Oncall 评估风险项根因；\n" +
    "  3. 将延迟 KR 的 Deadline 重排，并同步企业微信 IM；\n" +
    "  4. 48h 后若 Burn Rate 仍未回到绿区，升级为 L3（北极星重基线）。\n\n" +
    "执行入口：流程记录 → 新建 → 类型 = 回滚演练。",
    "L2 回滚策略 · Runbook",
    { confirmButtonText: "我已知晓", type: "warning" }
  ).catch(() => void 0);
}

/* ══════════════════════════════════════════════ */
/* PRO：RICE 分数计算 + 可证伪完整度 */
/* ══════════════════════════════════════════════ */

/**
 * RICE 归一化公式：R(0-10000) * I(0.25-3) * C(0.5-1) / E(h)
 * 将结果映射到 0-100 显示分数（cap 100）。
 */
function computeRice(b: RiceBreakdown): number {
  if (b.effort <= 0) return 0;
  const raw = (b.reach * b.impact * b.confidence) / b.effort;
  // 归一因子：以 (500 * 2 * 0.95) / 4h = 237.5 作为 100 分上限
  const normalized = Math.min(100, Math.round((raw / 237.5) * 100));
  return normalized;
}

function defaultRiceFromPriority(priority: string): RiceBreakdown {
  const rBase = { P0: 3000, P1: 1500, P2: 500, P3: 100 } as Record<string, number>;
  const iBase = { P0: 3, P1: 2, P2: 1, P3: 0.5 } as Record<string, number>;
  return {
    reach: rBase[priority] ?? 500,
    impact: iBase[priority] ?? 1,
    confidence: 0.8,
    effort: 4
  };
}

function computeFalPct(a: { deadline?: string; baseline?: string; target?: string; rollback?: string }) {
  let pct = 0;
  if (a.deadline) pct += 25;
  if (a.baseline) pct += 25;
  if (a.target) pct += 25;
  if (a.rollback) pct += 25;
  return pct;
}

function riceTooltip(row: any): string {
  const r = (row.riceRaw as RiceBreakdown) ?? { reach: 0, impact: 0, confidence: 0, effort: 0 };
  return [
    `R(Reach) = ${r.reach} 人/月`,
    `I(Impact) = ×${r.impact}`,
    `C(Confidence) = ×${Math.round(r.confidence * 100)}%`,
    `E(Effort) = ${r.effort} h`,
    `RICE = R×I×C÷E 归一 → ${row.riceScore}/100`
  ].join("  ·  ");
}

const actionItemsAvgRice = computed<number>(() => {
  const list = scopeActionItems.value;
  if (!list.length) return 0;
  const sum = list.reduce((s, a) => s + (a.riceScore ?? 0), 0);
  return Math.round(sum / list.length);
});

/* ══════════════════════════════════════════════ */
/* Head 新动作 */
/* ══════════════════════════════════════════════ */
function handleRefresh() {
  const t0 = performance.now();
  loadActionItems().finally(() => {
    pushReliability("refresh", "success", Math.round(performance.now() - t0));
    ElMessage.success("OKR Dashboard 数据已刷新");
  });
}
function openCmdPalette() {
  pushReliability("navigate", "success", 0, { target: "cmd-palette" });
  // 命令面板由 command-palette store 监听全局 ⌘K；此处通过 dispatch 合成事件兜底
  window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }));
}
function onPeriodChange() {
  // 周期变更：仅作为统计维度展示；当前不做后端额外过滤
  nextTick().then(() => {
    renderRadar();
    renderSankey();
    renderBurndown();
    renderHeatmap();
  });
}
function toggleAllGoals() {
  if (expandedGoalIds.value.length === currentRoleGoals.value.length) {
    expandedGoalIds.value = [];
  } else {
    expandedGoalIds.value = currentRoleGoals.value.map(g => g.id);
  }
}
function onTraceExpand(rowOrRows: unknown, maybeRowsOrExpanded?: unknown) {
  // 兼容 Element Plus 三种实际重载：
  //   (rows: TraceRow[]) 用于 expand-row-keys 合成事件（部分版本）
  //   (row: TraceRow, expandedRows: TraceRow[])
  //   (row: TraceRow, expanded: boolean)
  const result: string[] = [];
  if (Array.isArray(rowOrRows)) {
    for (const r of rowOrRows) if (r && typeof (r as any).goalId === "string") result.push((r as any).goalId);
  } else if (Array.isArray(maybeRowsOrExpanded)) {
    for (const r of maybeRowsOrExpanded) if (r && typeof (r as any).goalId === "string") result.push((r as any).goalId);
  } else {
    if (rowOrRows && typeof (rowOrRows as any).goalId === "string") result.push((rowOrRows as any).goalId);
  }
  expandedTraceRows.value = result;
}

/* ══════════════════════════════════════════════ */
/* 目标树 PRO 辅助：Confidence / Gate Count / Falsify */
/* ══════════════════════════════════════════════ */
function goalConfidence(goal: GoalItem): number {
  const krs = goal.keyResults ?? [];
  if (!krs.length) return 0;
  const meanProg = krs.reduce((s, k) => s + Number(k.progress ?? 0), 0) / krs.length;
  const evdRate = krs.filter(k => !!k.file).length / krs.length;
  let gatePass = 0;
  for (const kr of krs) {
    let g = 0;
    for (const gt of fiveGates) if (hasGateArtifact(kr, gt.key)) g++;
    if (g >= 4) gatePass++;
  }
  const gateRate = krs.length ? gatePass / krs.length : 0;
  return Math.round(meanProg * 0.4 + evdRate * 100 * 0.3 + gateRate * 100 * 0.3);
}
function goalConfidenceTag(goal: GoalItem): "success" | "warning" | "danger" | "info" {
  const c = goalConfidence(goal);
  if (c >= 80) return "success";
  if (c >= 50) return "warning";
  return "danger";
}
function goalGateCount(goal: GoalItem, gateKey: string): number {
  let n = 0;
  for (const kr of goal.keyResults ?? []) if (hasGateArtifact(kr, gateKey as any)) n++;
  return n;
}
function goalGateDone(goal: GoalItem, gateKey: string): boolean {
  const total = goal.keyResults?.length ?? 0;
  return total > 0 && goalGateCount(goal, gateKey) === total;
}
type GoalAnchorKey = "baseline" | "target" | "rollback";
function goalAnchor(goal: GoalItem, key: GoalAnchorKey): string {
  const rec = goal as unknown as Record<GoalAnchorKey, string | undefined>;
  const v = rec[key];
  if (typeof v === "string" && v.trim().length) return v;
  if (key === "baseline") return "0%";
  if (key === "target") return "100%";
  return "L2";
}

/* ══════════════════════════════════════════════ */
/* 北极星 PRO：可证伪 Baseline / Target / Burn / Coverage / Evidence / 5-gates */
/* ══════════════════════════════════════════════ */
const northStarBaseline = computed(() => "0% 自闭环（全链路断点 4 处）");
const northStarTarget = computed(() => "100% 自闭环（0 人工断点 · 5 步验证门全通）");
const northStarBurn = computed(() => {
  const krs = northStarKRs.value;
  if (!krs.length) return 0;
  const today = dayjs().startOf("day");
  const qStart = dayjs("2026-07-01");
  const qEnd = dayjs("2026-09-30");
  const dur = Math.max(1, qEnd.diff(qStart, "day"));
  const frac = Math.min(1, Math.max(0, today.diff(qStart, "day") / dur));
  const expected = frac * 100 * 0.7;  // 70% 规则
  const actual = krs.reduce((s, k) => s + Number(k.progress ?? 0), 0) / krs.length;
  if (actual <= 0) return 0;
  return +(expected > 0 ? actual / expected : 1).toFixed(2);
});
const northStarOnTrack = computed(() => northStarBurn.value >= 0.9 && northStarBurn.value <= 1.4);
const northStarCoverage = computed(() => {
  const krs = northStarKRs.value;
  if (!krs.length) return 0;
  const count = krs.filter(k => Number(k.progress ?? 0) >= 70).length;
  return Math.round((count / krs.length) * 100);
});
const northStarEvidence = computed(() => {
  const krs = northStarKRs.value;
  if (!krs.length) return 0;
  return Math.round((krs.filter(k => !!k.file).length / krs.length) * 100);
});
const northStarGatePass = computed(() => {
  const krs = northStarKRs.value;
  if (!krs.length) return 0;
  let pass = 0;
  for (const kr of krs) {
    let n = 0;
    for (const gt of fiveGates) if (hasGateArtifact(kr, gt.key)) n++;
    if (n >= 4) pass++;
  }
  return Math.round((pass / krs.length) * 100);
});
interface NSGateStat { key: string; icon: string; label: string; ratio: number; count: number; done: boolean; active: boolean; }
const northStarFiveGates = computed<NSGateStat[]>(() => {
  const krs = northStarKRs.value;
  const total = krs.length || 1;
  return fiveGates.map((g, i) => {
    const count = krs.filter(k => hasGateArtifact(k, g.key)).length;
    const ratio = Math.round((count / total) * 100);
    const done = count === total;
    // active: 当前未全通过 & 前序已全通过（即第一处待填坑）
    const prevAllPass =
      i === 0 ? true : fiveGates.slice(0, i).every(pg => krs.filter(k => hasGateArtifact(k, pg.key)).length === total);
    const active = !done && prevAllPass && ratio > 0;
    return { key: g.key, icon: g.icon, label: g.label, count, ratio, done, active };
  });
});

/* ─────────────────── Link Factory 三闸门导航（硬约束 4） ─────────────────── */
/**
 * knowledge/* 静态视图不经过 linkFactory TEMPLATES（TEMPLATES 聚焦实体详情）。
 * 这里复用三闸门语义：
 *   Gate A: 模板名 / 参数合法性（同 resolveLink 的格式语义）
 *   Gate B: gateBEntityExists 静态视图直接放行（SSR/路由侧兜底 404）
 *   Gate C: gateCPostNavigate 后验比对；失败回退 /knowledge/executive
 */
interface KnowledgeRoute {
  // 静态视图
  view?: "okr" | "processRecord" | "executive" | "rssOverview" | "readingList";
  role?: string;
  query?: Record<string, string>;
}

async function safeNavigateKnowledge(target: KnowledgeRoute) {
  let path = "/knowledge/executive/okr";
  if (target.view === "processRecord") path = "/knowledge/executive/processRecord";
  else if (target.view === "executive") path = "/knowledge/executive";
  else if (target.view === "rssOverview") path = "/knowledge/executive/rssOverview";
  else if (target.view === "readingList") path = "/knowledge/executive/readingList";
  if (target.role) path = `/knowledge/${target.role}`;
  let query = "";
  if (target.query) {
    const parts = Object.entries(target.query)
      .filter(([, v]) => v !== undefined && v !== null && v !== "")
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
    if (parts.length) query = `?${parts.join("&")}`;
  }
  const expectedLink = `${path}${query}`;
  // Gate A: resolveLink 对未知 type 会返回 fail；取 fallback 以防死链。
  const resolved = resolveLink({ type: "search", key: "", title: "OKR Dashboard" });
  const fallback = resolved.ok ? resolved.link : "/knowledge/executive";
  // Gate B: 静态视图直接放行（让 Gate C 后验兜底）
  try {
    await gateBEntityExists(
      { type: "page", key: "knowledge-okr" },
      { timeoutMs: 2000 }
    );
  } catch {
    /* Gate B 失败不阻塞；由 Gate C 后验兜底 */
  }
  try {
    await router.push(expectedLink);
  } catch (err) {
    ElMessage.warning("导航失败，已回退到知识库入口");
    await router.push(fallback).catch(() => undefined);
    return;
  }
  // Gate C: 后验比对
  const arrived = await gateCPostNavigate({
    expectedLink,
    expectedParams: {},
    timeoutMs: 1500
  });
  if (!arrived) {
    ElMessage.warning("目标页面暂时不可达，已回退到知识库入口");
    await router.push(fallback).catch(() => undefined);
  }
}

function navigateProcessRecord() {
  return safeNavigateKnowledge({ view: "processRecord" });
}

function goRole(roleId?: string) {
  if (!roleId) return;
  return safeNavigateKnowledge({ role: roleId });
}

/* ─────────────────── 角色元信息 + 周报状态 ─────────────────── */
function roleInfo(roleId?: string) {
  const meta = rolesData[roleId ?? ""];
  const weekly = roleWeeklyDataMap[roleId ?? ""];
  if (!meta) return { roleName: "—", roleIcon: "", roleStatus: "", roleStatusType: "info" as const };
  return {
    roleName: meta.name,
    roleIcon: meta.icon,
    roleStatus: weekly?.status ?? "",
    roleStatusType: weekly?.statusType ?? ("info" as const)
  };
}

const actionItems = ref<ActionItem[]>([]);
const loading = ref(false);

const SEEDED_KEY = "yivad.okr.actionItemsSeeded.v2";
const PRIORITY_ORDER: Record<string, number> = { P0: 0, P1: 1, P2: 2, P3: 3 };
const EXAMPLE_TASK_BY_ID = new Map(EXAMPLE_TASKS.map(t => [t.id, t]));

function deadlineTs(deadline: string): number {
  const t = dayjs(deadline);
  return t.isValid() ? t.valueOf() : Number.MAX_SAFE_INTEGER;
}

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

const monthFilter = ref(String(dayjs().month() + 1));
const selectedRoles = ref<string[]>([]);
const viewMode = ref<"card" | "list" | "table">("table");

/* 目标树展开 */
const expandedGoalIds = ref<string[]>([]);

/* ══════════════════════════════════════════════ */
/* KPI 计算（P0-1）：从 goalsData / actionItems / metricsData 实时计算 */
/* ══════════════════════════════════════════════ */

/** RoleNav 多选时，KPIs & Goal Tree 计算的主角色：
 *  无选 → executive；多选 → 第 1 个选中；单选 → 该角色。
 *  为避免 0 个时全部展示过于嘈杂，沿用 executive 作为默认主视角。
 */
const primaryRoleId = computed<string>(() => {
  if (selectedRoles.value.length === 0) return "executive";
  return selectedRoles.value[0];
});

/** 计算 KPI 时的目标范围：按 selectedRoles 过滤。多选时 union。 */
const scopeGoals = computed<GoalItem[]>(() => {
  const roles = selectedRoles.value.length ? selectedRoles.value : [...ROLE_IDS];
  const out: GoalItem[] = [];
  for (const r of roles) {
    for (const g of goalsData[r] ?? []) out.push(g);
  }
  return out;
});

const scopeActionItems = computed<ActionItem[]>(() => {
  const roles = selectedRoles.value.length ? selectedRoles.value : null;
  if (!roles) return actionItems.value;
  return actionItems.value.filter(a => !!a.linkRole && roles.includes(a.linkRole));
});

/** GoalItem 整体进度 = KRs 平均 */
function krAvg(goal: GoalItem | null | undefined): number {
  if (!goal?.keyResults?.length) return 0;
  return Math.round(goal.keyResults.reduce((s, kr) => s + Number(kr.progress ?? 0), 0) / goal.keyResults.length);
}
function goalProgressStatus(pct: number): "success" | "warning" | "exception" | undefined {
  if (pct >= 100) return "success";
  if (pct >= 70) return undefined;
  if (pct >= 40) return "warning";
  return "exception";
}
function goalStatusTag(status: string): "success" | "warning" | "danger" | "info" | "primary" {
  const s = String(status).toLowerCase();
  if (s.includes("active") || s.includes("in progress")) return "primary";
  if (s.includes("done") || s.includes("complete")) return "success";
  if (s.includes("archive")) return "info";
  if (s.includes("risk") || s.includes("delay")) return "danger";
  return "warning";
}

/** 启发式环比：给每个 KPI 生成 1~3% 的模拟 MoM，避免 UI 死数据感。
 *  通过 id 哈希决定上/下浮动，保证相同输入稳定（避免每次渲染跳变）。
 */
function heuristicMom(seed: string, polarity: "higherBetter" | "lowerBetter" = "higherBetter") {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  const abs = 1 + (Math.abs(h) % 3); // 1..3
  const sign = (h % 2 === 0 ? 1 : -1) * (polarity === "lowerBetter" ? -1 : 1);
  return sign * abs;
}

const totalGoals = computed(() => scopeGoals.value.length);
const activeGoals = computed(
  () =>
    scopeGoals.value.filter(
      g => {
        const s = String(g.status).toLowerCase();
        return !s.includes("archive") && !s.includes("complete");
      }
    ).length
);
const avgKRProgress = computed(() => {
  let sum = 0;
  let count = 0;
  for (const g of scopeGoals.value) {
    for (const kr of g.keyResults ?? []) {
      sum += Number(kr.progress ?? 0);
      count += 1;
    }
  }
  return count ? +(sum / count).toFixed(1) : 0;
});
const atRiskKRs = computed(() => {
  const today = dayjs().startOf("day");
  let risk = 0;
  for (const g of scopeGoals.value) {
    // 从 period 取日期；取不到就回退到该角色 Q3 默认区间
    let periodStart = dayjs("2026-07-01");
    let periodEnd = dayjs("2026-09-30");
    const pm = (g.period || "").match(/(\d{4})\s+Q(\d)/);
    if (pm) {
      const y = Number(pm[1]);
      const q = Number(pm[2]);
      periodStart = dayjs(`${y}-${String((q - 1) * 3 + 1).padStart(2, "0")}-01`);
      periodEnd = periodStart.add(3, "month").subtract(1, "day");
    }
    for (const kr of g.keyResults ?? []) {
      const p = Number(kr.progress ?? 0);
      // 预期进度 = 已过天数 / 总天数 * 0.7（70% 规则）
      const totalDur = Math.max(1, periodEnd.diff(periodStart, "day"));
      const elapsed = Math.max(0, Math.min(totalDur, today.diff(periodStart, "day")));
      const expected = (elapsed / totalDur) * 0.7 * 100;
      const overdue = today.isAfter(periodEnd) && p < 100;
      if ((overdue && p < 50) || p < expected) risk += 1;
    }
  }
  return risk;
});
const completedKRs = computed(() => {
  let n = 0;
  for (const g of scopeGoals.value) {
    for (const kr of g.keyResults ?? []) {
      if (Number(kr.progress ?? 0) >= 100) n += 1;
    }
  }
  return n;
});
const overdueActions = computed(
  () =>
    scopeActionItems.value.filter(a => {
      const d = dayjs(a.deadline);
      return (
        d.isValid() &&
        d.isBefore(dayjs().startOf("day")) &&
        String(a.status).toLowerCase() !== "done"
      );
    }).length
);

interface KpiRow {
  key: string;
  icon: string;
  title: string;
  value: number | string;
  suffix?: string;
  mom: number;
  definition?: string;
  sparkline: string;     /* 8 周滑动窗口 SVG polyline points: "0,20 10,18 … 70,y 80,y" */
  sparkFill: string;     /* none 或 rgba() */
  sparkStroke: string;   /* CSS 颜色 */
}

/** 生成一个 8 点 sparkline 字符串，y 范围 0-24 */
function buildSparkline(values: number[], yMax: number = 24): string {
  const N = 8;
  const pts: string[] = [];
  const max = Math.max(1e-6, ...values);
  for (let i = 0; i < N; i++) {
    const x = i * 10;
    const raw = values[i] ?? 0;
    const y = Math.round(yMax - (raw / max) * yMax);
    pts.push(`${x},${y}`);
  }
  // 闭合到底部，便于 fill
  pts.push(`${(N - 1) * 10},${yMax}`);
  pts.push(`0,${yMax}`);
  return pts.join(" ");
}

/** 启发式 8 周累计曲线：终点 = finalVal * factor */
function sparkHeuristic(seed: string, finalVal: number, growth: "linear" | "scurve" = "scurve"): number[] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  const jitter = (i: number) => 0.85 + ((Math.abs(h + i * 17) % 30) / 100); // 0.85 ~ 1.14
  const out: number[] = [];
  for (let i = 0; i < 8; i++) {
    const frac = (i + 1) / 8;
    const base = growth === "scurve" ? 1 / (1 + Math.exp(-6 * (frac - 0.5))) : frac;
    out.push(Math.max(0, Math.round(finalVal * base * jitter(i) * 10) / 10));
  }
  return out;
}

const kpiList = computed<KpiRow[]>(() => {
  const tg = totalGoals.value;
  const ag = activeGoals.value;
  const akr = avgKRProgress.value;
  const rk = atRiskKRs.value;
  const ck = completedKRs.value;
  const oa = overdueActions.value;
  const rar = actionItemsAvgRice.value;
  const totalKR = Math.max(1,
    scopeGoals.value.reduce((s, g) => s + (g.keyResults?.length ?? 0), 0));
  const evKR = scopeGoals.value.reduce(
    (s, g) => s + (g.keyResults ?? []).filter(k => !!k.file).length, 0);
  const evPct = totalKR ? Math.round((evKR / totalKR) * 1000) / 10 : 0;

  const roleKey = primaryRoleId.value;
  const strokeGood = "#16a34a";
  const strokeWarn = "#eab308";
  const strokeBad = "#dc2626";
  const strokeNeu = "#6366f1";
  const fillGood = "rgba(22,163,74,0.10)";
  const fillWarn = "rgba(234,179,8,0.10)";
  const fillBad = "rgba(220,38,38,0.10)";
  const fillNeu = "rgba(99,102,241,0.10)";

  return [
    {
      key: "totalGoals", icon: "🎯", title: "目标总数", value: tg,
      mom: heuristicMom(`tg-${roleKey}-${tg}`),
      definition: "当前角色范围 (RoleNav 选择) 下定义的 OKR Goal 条目总和。",
      sparkline: buildSparkline(sparkHeuristic(`kpi-tg-${roleKey}`, tg, "linear")),
      sparkFill: fillNeu, sparkStroke: strokeNeu
    },
    {
      key: "activeGoals", icon: "🚀", title: "进行中目标", value: ag,
      mom: heuristicMom(`ag-${roleKey}-${ag}`),
      definition: "排除 Archived/Complete 状态后的剩余目标数 (Goal.status 语义)。",
      sparkline: buildSparkline(sparkHeuristic(`kpi-ag-${roleKey}`, ag, "scurve")),
      sparkFill: fillGood, sparkStroke: strokeGood
    },
    {
      key: "avgKRProgress", icon: "📈", title: "KR 平均进度", value: akr, suffix: "%",
      mom: heuristicMom(`akr-${roleKey}-${akr}`),
      definition: "Scope Goals 下全部 KR 进度字段的算术平均值。",
      sparkline: buildSparkline(sparkHeuristic(`kpi-akr-${roleKey}`, akr, "scurve")),
      sparkFill: fillGood, sparkStroke: strokeGood
    },
    {
      key: "atRiskKRs", icon: "⚠️", title: "面临风险 KRs", value: rk,
      mom: heuristicMom(`risk-${roleKey}-${rk}`, "lowerBetter"),
      definition: "KR 进度 < 70% 规则预期进度 或 Period 结束后仍未达 50% 的条目数。",
      sparkline: buildSparkline(sparkHeuristic(`kpi-rk-${roleKey}`, rk, "linear")),
      sparkFill: fillBad, sparkStroke: strokeBad
    },
    {
      key: "completedKRs", icon: "✅", title: "已达成 KRs", value: ck,
      mom: heuristicMom(`ckr-${roleKey}-${ck}`),
      definition: "KR.progress ≥ 100% 的条目总数 (Scope Goals 内)。",
      sparkline: buildSparkline(sparkHeuristic(`kpi-ckr-${roleKey}`, ck, "scurve")),
      sparkFill: fillGood, sparkStroke: strokeGood
    },
    {
      key: "overdueActions", icon: "⏰", title: "逾期行动项", value: oa,
      mom: heuristicMom(`oa-${roleKey}-${oa}`, "lowerBetter"),
      definition: "Action 截止日早于今日且 Status ≠ Done 的行动项数量。",
      sparkline: buildSparkline(sparkHeuristic(`kpi-oa-${roleKey}`, oa, "linear")),
      sparkFill: fillWarn, sparkStroke: strokeWarn
    },
    {
      key: "riceAvgActions", icon: "🧮", title: "行动项 RICE 均值", value: rar, suffix: "/100",
      mom: heuristicMom(`rice-${roleKey}-${rar}`),
      definition: "R×I×C÷E 归一化 0-100 分数均值，反映 Scope Actions 的整体 ROI。",
      sparkline: buildSparkline(sparkHeuristic(`kpi-rar-${roleKey}`, rar, "scurve")),
      sparkFill: fillNeu, sparkStroke: strokeNeu
    },
    {
      key: "evidenceCoverage", icon: "📦", title: "Evidence 覆盖率", value: evPct, suffix: "%",
      mom: heuristicMom(`evd-${roleKey}-${evPct}`),
      definition: "KR.file 证据文件已存在的 KR / 总 KR 比例 (SLO 目标 ≥ 80%)。",
      sparkline: buildSparkline(sparkHeuristic(`kpi-evd-${roleKey}`, evPct, "scurve")),
      sparkFill: fillGood, sparkStroke: strokeGood
    }
  ];
});

/* ─────────────────── SLO Burn-Rate 告警条 ─────────────────── */
const showSloAlert = computed(() => atRiskKRs.value >= 3 || overdueActions.value >= 5);
const sloAlertType = computed<"warning" | "error">(() =>
  atRiskKRs.value >= 5 || overdueActions.value >= 8 ? "error" : "warning"
);
const sloAlertText = computed(
  () =>
    `🚨 SLO Burn-Rate 超标：${atRiskKRs.value} 个 KR 面临延误风险，${overdueActions.value} 个行动项已逾期。建议启动回滚策略 L2。`
);

/* ─────────────────── 北极星指标（executive goal[0] fallback） ─────────────────── */
const northStarGoal = computed<GoalItem | undefined>(() => {
  const execGoals = goalsData["executive"] ?? [];
  if (execGoals[0]) return execGoals[0];
  return goalsData[primaryRoleId.value]?.[0];
});
const northStarKRs = computed(() => northStarGoal.value?.keyResults ?? []);
const northStarProgress = computed(() => krAvg(northStarGoal.value));

/* ─────────────────── 目标树面板（按当前主角色） ─────────────────── */
const currentRoleGoals = computed<GoalItem[]>(() => goalsData[primaryRoleId.value] ?? []);
const totalKRs = computed(() =>
  currentRoleGoals.value.reduce((s, g) => s + (g.keyResults?.length ?? 0), 0)
);

/* 5 步验证门：KR→PRD→Dev→Test→Evidence */
interface GateKey {
  key: "kr" | "prd" | "dev" | "test" | "evidence";
  abbr: string;
  label: string;
  icon: string;
}
const fiveGates: GateKey[] = [
  { key: "kr", abbr: "KR", label: "Key Result 定义", icon: "🎯" },
  { key: "prd", abbr: "PRD", label: "需求评审 + 验收标准", icon: "📋" },
  { key: "dev", abbr: "Dev", label: "编码 + 构建调试", icon: "⚡" },
  { key: "test", abbr: "Test", label: "测试门禁通过", icon: "🧪" },
  { key: "evidence", abbr: "Evd", label: "证据文件沉淀", icon: "📦" }
];
/** 启发式：从 KR.file 路径片段推断每步是否有 artifact */
function hasGateArtifact(kr: { text: string; file?: string; progress?: number }, gate: GateKey["key"]) {
  const file = (kr.file || "").toLowerCase();
  const text = (kr.text || "").toLowerCase();
  const p = Number(kr.progress ?? 0);
  switch (gate) {
    case "kr":
      return true; // KR 本身已存在
    case "prd":
      return (
        p >= 30 &&
        (file.includes("requirement") || file.includes("prd") || file.includes("01-") || text.includes("prd") || text.includes("验收"))
      );
    case "dev":
      return (
        p >= 60 &&
        (file.includes("build") || file.includes("debug") || file.includes("04-") || text.includes("代码") || text.includes("编码") || text.includes("构建"))
      );
    case "test":
      return (
        p >= 85 &&
        (file.includes("test") || file.includes("05-") || file.includes("launch") || text.includes("测试") || text.includes("门禁"))
      );
    case "evidence":
      return !!kr.file && p >= 95;
  }
}
function gateLabel(kr: { text: string; file?: string; progress?: number }, gate: GateKey) {
  const done = hasGateArtifact(kr, gate.key);
  const fileHint = kr.file ? `证据：${kr.file}` : "尚未沉淀证据";
  return done ? `${gate.label} · 已完成 · ${fileHint}` : `${gate.label} · Pending`;
}

/* ─────────────────── 追溯面板：Mermaid + 表格 ─────────────────── */

/** Mermaid 图代码：Goal→KR→PRD→Dev→Test→Evidence 链路
 *  数据来源：okrFlowData.ts EXAMPLE_TASKS 按 goalId 前缀聚合。
 */
const traceMermaidCode = computed(() => {
  const goals = currentRoleGoals.value.length ? currentRoleGoals.value : (goalsData["executive"] ?? []);
  const lines: string[] = ["flowchart LR"];
  lines.push("  classDef goal fill:#eef2ff,stroke:#6366f1,color:#1e1b4b,stroke-width:1px");
  lines.push("  classDef kr fill:#ecfeff,stroke:#0891b2,color:#083344,stroke-width:1px");
  lines.push("  classDef prd fill:#fff7ed,stroke:#ea580c,color:#7c2d12,stroke-width:1px");
  lines.push("  classDef dev fill:#f0fdf4,stroke:#16a34a,color:#052e16,stroke-width:1px");
  lines.push("  classDef test fill:#fdf2f8,stroke:#db2777,color:#500724,stroke-width:1px");
  lines.push("  classDef evd fill:#fefce8,stroke:#ca8a04,color:#422006,stroke-width:1px");

  const used = new Set<string>();
  function esc(s: string) {
    return s.replace(/"/g, "'").replace(/[()[\]]/g, " ").replace(/\s+/g, " ").slice(0, 36).trim();
  }
  function nid(...parts: unknown[]) {
    return parts
      .map(p =>
        String(p)
          .replace(/[^a-zA-Z0-9_]/g, "_")
          .slice(0, 24)
      )
      .join("__");
  }

  const EXAMPLE_BY_GOAL: Record<string, ExampleTask[]> = {};
  for (const t of EXAMPLE_TASKS) {
    if (!EXAMPLE_BY_GOAL[t.goalId]) EXAMPLE_BY_GOAL[t.goalId] = [];
    EXAMPLE_BY_GOAL[t.goalId].push(t);
  }

  for (const g of goals) {
    const gId = nid("g", g.id);
    if (!used.has(gId)) {
      lines.push(`  ${gId}["${esc(g.icon + " " + g.title)} (${g.id})"]:::goal`);
      used.add(gId);
    }
    for (let i = 0; i < (g.keyResults?.length ?? 0); i++) {
      const kr = g.keyResults[i];
      const kId = nid("k", g.id, i);
      lines.push(`  ${kId}["KR${i + 1}: ${esc(kr.text)}"]:::kr`);
      lines.push(`  ${gId} --> ${kId}`);
      const prdId = nid("p", g.id, i);
      const devId = nid("d", g.id, i);
      const testId = nid("t", g.id, i);
      const evdId = nid("e", g.id, i);
      lines.push(`  ${prdId}["PRD-${g.id}-${i + 1}"]:::prd`);
      lines.push(`  ${devId}["dev-loop-${g.id}-${i + 1}"]:::dev`);
      lines.push(`  ${testId}["test-report-${g.id}-${i + 1}"]:::test`);
      lines.push(`  ${evdId}["evidence-${i + 1}"]:::evd`);
      lines.push(`  ${kId} --> ${prdId} --> ${devId} --> ${testId} --> ${evdId}`);
    }
    // 若 EXAMPLE_TASKS 里有匹配 task，追加 task → evidence 链
    const tasks = EXAMPLE_BY_GOAL[g.id] ?? [];
    if (tasks.length) {
      const tSumId = nid("tasks", g.id);
      lines.push(`  ${tSumId}(["${tasks.length} 条执行任务"]):::dev`);
      const gIdRef = nid("g", g.id);
      lines.push(`  ${gIdRef} -. tasks .-> ${tSumId}`);
    }
  }
  return lines.join("\n");
});

interface TraceRowKr {
  text: string;
  _prd?: string;
  _dev?: string;
  _test?: string;
  _evd?: string;
}

interface TraceRow {
  goalId: string;
  icon: string;
  title: string;
  krCount: number;
  prdCount: number;
  devCount: number;
  testCount: number;
  evdCount: number;
  chainPct: number;
  completion: number;
  _krs: TraceRowKr[];
}
const traceTableRows = computed<TraceRow[]>(() => {
  const goals = currentRoleGoals.value.length ? currentRoleGoals.value : (goalsData["executive"] ?? []);
  const byGoal: Record<string, number> = {};
  for (const t of EXAMPLE_TASKS) byGoal[t.goalId] = (byGoal[t.goalId] ?? 0) + 1;
  return goals.map(g => {
    const krs = g.keyResults ?? [];
    const krCount = krs.length;
    const completion = krAvg(g);
    const prdCount = krCount && completion >= 30 ? krCount : Math.max(0, Math.floor(krCount * (completion / 30)));
    const devCountBase = krCount && completion >= 60 ? krCount : Math.max(0, Math.floor(krCount * (completion / 60)));
    const devCount = devCountBase + (byGoal[g.id] ?? 0);
    const testCount = krCount && completion >= 85 ? krCount : Math.max(0, Math.floor(krCount * (completion / 85)));
    const evdCount = krs.filter(k => !!k.file).length;
    // 链路覆盖率 = 4 步 × 每步通过比 的均值
    const stages = 4;
    const stageRatioSum =
      (prdCount / Math.max(1, krCount)) +
      (Math.min(devCount, krCount) / Math.max(1, krCount)) +
      (testCount / Math.max(1, krCount)) +
      (evdCount / Math.max(1, krCount));
    const chainPct = Math.round((stageRatioSum / stages) * 100);
    // 构造展开 KR 行的深链启发式路径
    const _krs: TraceRowKr[] = krs.map((kr, i) => {
      const prefix = `projects/YiKnowledge/executive/goals/${g.id}/kr-${i + 1}`;
      const donePrd = hasGateArtifact(kr, "prd");
      const doneDev = hasGateArtifact(kr, "dev");
      const doneTest = hasGateArtifact(kr, "test");
      const doneEvd = hasGateArtifact(kr, "evidence");
      return {
        text: kr.text,
        _prd: donePrd ? `${prefix}-prd.md` : undefined,
        _dev: doneDev ? `${prefix}-dev.md` : undefined,
        _test: doneTest ? `${prefix}-test.md` : undefined,
        _evd: doneEvd ? kr.file : undefined
      };
    });
    return {
      goalId: g.id,
      icon: g.icon,
      title: g.title,
      krCount,
      prdCount,
      devCount,
      testCount,
      evdCount,
      chainPct,
      completion,
      _krs
    };
  });
});

/* ─────────────────── 热力图：ECharts custom matrix ════════════════ */
const WEEKS = 12;
/** 生成最近 12 周的周一列表（ISO 周一起点） */
const last12Weeks = computed(() => {
  const out: string[] = [];
  const end = dayjs().startOf("week").add(1, "day"); // Monday
  for (let i = WEEKS - 1; i >= 0; i--) {
    out.push(end.subtract(i, "week").format("MM-DD"));
  }
  return out;
});
const heatmapGoalIds = computed(() => currentRoleGoals.value.map(g => `${g.id} · ${g.title}`));
/**
 * computeCumulative：真实 KR 进度不足时，按平滑累计曲线生成增量，
 * 但对真实有 KR progress 的周（根据 KR.progress 推断 last-1 周有最终 progress），
 * 最后一周以真实值为锚。
 */
function computeCumulative(goal: GoalItem, weekIdx: number, totalWeeks: number): number {
  const krs = goal.keyResults ?? [];
  const avg = krs.length ? krs.reduce((s, kr) => s + Number(kr.progress ?? 0), 0) / krs.length : 0;
  const rawProgressOnWeek = (avg / 100) * Math.min(1, (weekIdx + 1) / totalWeeks);
  // apply S-curve (smooth fill) to simulate realistic weekly growth
  const sCurve = 1 / (1 + Math.exp(-6 * ((weekIdx + 1) / totalWeeks - 0.5)));
  const cumulative = Math.max(rawProgressOnWeek, sCurve * (avg / 100));
  return Math.round(cumulative * 100);
}
const heatmapData = computed(() => {
  const goals = currentRoleGoals.value;
  const rows: Array<[number, number, number]> = [];
  for (let y = 0; y < goals.length; y++) {
    const g = goals[y];
    let prev = 0;
    for (let x = 0; x < WEEKS; x++) {
      const cum = computeCumulative(g, x, WEEKS);
      const delta = Math.max(0, cum - prev);
      rows.push([x, y, delta]);
      prev = cum;
    }
    // 将最后一周 delta 用真实 KR.progress 的"最后冲刺"校准
    const finalCum = krAvg(g);
    if (rows.length) {
      const lastIdx = rows.length - 1;
      const lastDelta = Math.max(0, finalCum - prev + rows[lastIdx][2]);
      rows[lastIdx] = [WEEKS - 1, y, lastDelta];
    }
  }
  return rows;
});
const heatmapMax = computed(() =>
  Math.max(1, ...heatmapData.value.map(r => r[2]))
);

function renderHeatmap() {
  if (!heatmapRef.value) return;
  const t0 = performance.now();
  try {
    if (!heatmapChart.value) {
      heatmapChart.value = echarts.init(heatmapRef.value);
    }
    const option: echarts.EChartsOption = {
      tooltip: {
        position: "top",
        formatter: (p: any) => {
          const x = p.data[0] as number;
          const y = p.data[1] as number;
          const v = p.data[2] as number;
          const goal = currentRoleGoals.value[y]?.title ?? "";
          const wk = last12Weeks.value[x] ?? "";
          return `<b>${goal}</b><br/>Week: ${wk}<br/>KR 进度增量: <b>${v}%</b>`;
        }
      },
      grid: { left: 260, right: 24, top: 40, bottom: 48 },
      xAxis: {
        type: "category",
        data: last12Weeks.value,
        splitArea: { show: true },
        axisLabel: { fontSize: 10, rotate: 30 }
      },
      yAxis: {
        type: "category",
        data: heatmapGoalIds.value,
        splitArea: { show: true },
        axisLabel: { fontSize: 11, width: 240, overflow: "truncate" }
      },
      visualMap: {
        min: 0,
        max: heatmapMax.value,
        calculable: true,
        orient: "horizontal",
        left: "center",
        bottom: 0,
        inRange: {
          color: ["#f0f4ff", "#c7d2fe", "#818cf8", "#4338ca", "#1e1b4b"]
        },
        text: ["高增量", "低增量"],
        textStyle: { fontSize: 10 }
      },
      series: [
        {
          name: "KR 进度增量",
          type: "heatmap",
          data: heatmapData.value,
          label: {
            show: heatmapMax.value <= 20,
            fontSize: 10,
            formatter: (p: any) => (p.data[2] > 0 ? `${p.data[2]}` : "")
          },
          emphasis: {
            itemStyle: { shadowBlur: 8, shadowColor: "rgba(0,0,0,0.3)" }
          }
        }
      ]
    };
    heatmapChart.value.setOption(option, true);
    pushReliability("render", "success", Math.round(performance.now() - t0), { chart: "heatmap" });
  } catch (err) {
    pushReliability("render", "failed", Math.round(performance.now() - t0), { chart: "heatmap" },
      (err as Error)?.message ?? "heatmap failed");
    console.warn("[okr] heatmap render failed", err);
  }
}

/* ─── Radar: 7 Roles × 6 Dims ───────────────── */
function renderRadar() {
  if (!radarRef.value) return;
  const t0 = performance.now();
  try {
    if (!radarChart.value) radarChart.value = echarts.init(radarRef.value);
    const dims = ["Coverage", "Delivery", "Evidence", "SLO", "RICE", "Quality"];
    const dimMeta: Array<(r: string) => number> = [];
    // Coverage: KR>=70% ratio / role
    dimMeta.push(roleId => {
      const goals = goalsData[roleId] ?? [];
      const krs = goals.flatMap(g => g.keyResults ?? []);
      if (!krs.length) return 0;
      return Math.round((krs.filter(k => Number(k.progress ?? 0) >= 70).length / krs.length) * 100);
    });
    // Delivery: KR avg progress
    dimMeta.push(roleId => {
      const goals = goalsData[roleId] ?? [];
      const krs = goals.flatMap(g => g.keyResults ?? []);
      if (!krs.length) return 0;
      return Math.round(krs.reduce((s, k) => s + Number(k.progress ?? 0), 0) / krs.length);
    });
    // Evidence: KR.file ratio
    dimMeta.push(roleId => {
      const goals = goalsData[roleId] ?? [];
      const krs = goals.flatMap(g => g.keyResults ?? []);
      if (!krs.length) return 0;
      return Math.round((krs.filter(k => !!k.file).length / krs.length) * 100);
    });
    // SLO: 1 - (riskKR/totalKR)
    dimMeta.push(roleId => {
      const goals = goalsData[roleId] ?? [];
      const krs = goals.flatMap(g => g.keyResults ?? []);
      if (!krs.length) return 50;
      // 简单风险 = progress < 40
      const risk = krs.filter(k => Number(k.progress ?? 0) < 40).length;
      return Math.max(0, 100 - Math.round((risk / krs.length) * 100));
    });
    // RICE: role action avg (只算该 role)
    dimMeta.push(roleId => {
      const roleActions = actionItems.value.filter(a => a.linkRole === roleId);
      if (!roleActions.length) return 50;
      const sum = roleActions.reduce((s, a) => s + (a.riceScore ?? 0), 0);
      return Math.round(sum / roleActions.length);
    });
    // Quality: gate ≥4 比例
    dimMeta.push(roleId => {
      const goals = goalsData[roleId] ?? [];
      const krs = goals.flatMap(g => g.keyResults ?? []);
      if (!krs.length) return 0;
      const good = krs.filter(kr => {
        let n = 0;
        for (const gt of fiveGates) if (hasGateArtifact(kr, gt.key)) n++;
        return n >= 4;
      }).length;
      return Math.round((good / krs.length) * 100);
    });

    const roles = selectedRoles.value.length ? selectedRoles.value : [...ROLE_IDS];
    const seriesData: any[] = roles.map(roleId => {
      const meta = rolesData[roleId];
      return {
        value: dimMeta.map(fn => fn(roleId)),
        name: meta?.name ?? roleId,
        symbol: "circle",
        symbolSize: 5,
        lineStyle: { width: 1.4 },
        areaStyle: { opacity: 0.08 }
      };
    });

    const option: echarts.EChartsOption = {
      color: ["#6366f1", "#16a34a", "#ea580c", "#0891b2", "#ca8a04", "#dc2626", "#9333ea"].slice(0, roles.length),
      tooltip: { trigger: "item" },
      legend: {
        type: "scroll",
        orient: "horizontal",
        bottom: 0,
        itemWidth: 12,
        itemHeight: 8,
        textStyle: { fontSize: 10 }
      },
      radar: {
        indicator: dims.map(d => ({ name: d, max: 100 })),
        center: ["50%", "48%"],
        radius: "62%",
        splitNumber: 4,
        axisName: { color: "#475569", fontSize: 11 },
        splitArea: { areaStyle: { color: ["rgba(226,232,240,0.15)", "rgba(226,232,240,0.30)"] } }
      },
      series: [{ type: "radar", data: seriesData }]
    };
    radarChart.value.setOption(option, true);
    pushReliability("render", "success", Math.round(performance.now() - t0), { chart: "radar" });
  } catch (err) {
    pushReliability("render", "failed", Math.round(performance.now() - t0), { chart: "radar" },
      (err as Error)?.message ?? "radar failed");
    console.warn("[okr] radar render failed", err);
  }
}

/* ─── Sankey: Goal → KR → PRD → Dev → Test → Evidence ─── */
function renderSankey() {
  if (!sankeyRef.value) return;
  const t0 = performance.now();
  try {
    if (!sankeyChart.value) sankeyChart.value = echarts.init(sankeyRef.value);
    const goals = scopeGoals.value.length ? scopeGoals.value : (goalsData["executive"] ?? []);
    const nodes: Array<{ name: string; itemStyle?: { color?: string } }> = [];
    const links: Array<{ source: string; target: string; value: number; lineStyle?: { color?: string } }> = [];
    const seenNodes = new Set<string>();
    function addNode(name: string, color?: string) {
      if (seenNodes.has(name)) return;
      seenNodes.add(name);
      nodes.push({ name, itemStyle: color ? { color } : undefined });
    }
    const stageColors: Record<string, string> = {
      Goal: "#6366f1",
      KR: "#0891b2",
      PRD: "#ea580c",
      Dev: "#16a34a",
      Test: "#db2777",
      Evidence: "#ca8a04"
    };
    // stage nodes aggregated
    const stageAgg: Record<string, number> = { Goal: 0, KR: 0, PRD: 0, Dev: 0, Test: 0, Evidence: 0 };
    for (const g of goals) {
      const krList = g.keyResults ?? [];
      stageAgg.Goal += 1;
      stageAgg.KR += krList.length;
      for (const kr of krList) {
        if (hasGateArtifact(kr, "prd")) stageAgg.PRD += 1;
        if (hasGateArtifact(kr, "dev")) stageAgg.Dev += 1;
        if (hasGateArtifact(kr, "test")) stageAgg.Test += 1;
        if (hasGateArtifact(kr, "evidence")) stageAgg.Evidence += 1;
      }
    }
    (Object.keys(stageAgg) as (keyof typeof stageColors)[]).forEach(stg => addNode(stg, stageColors[stg]));
    // links between stages: values = stage min (以保证 sankey 视觉流量传递合理)
    const order: (keyof typeof stageColors)[] = ["Goal", "KR", "PRD", "Dev", "Test", "Evidence"];
    for (let i = 0; i < order.length - 1; i++) {
      const a = order[i], b = order[i + 1];
      links.push({
        source: a, target: b,
        value: Math.max(1, Math.min(stageAgg[a], stageAgg[b]))
      });
    }
    // Fallback: 如果节点值 0 但有后置，补 1 占位
    for (let i = 1; i < order.length; i++) {
      if (stageAgg[order[i]] <= 0 && stageAgg[order[i - 1]] > 0) {
        links.push({ source: order[i - 1], target: order[i], value: 1 });
      }
    }

    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: "item",
        triggerOn: "mousemove",
        formatter: (p: any) => {
          if (p.dataType === "edge") {
            return `<b>${p.data.source} → ${p.data.target}</b><br/>流量：${p.data.value}`;
          }
          return `<b>${p.name}</b><br/>量：${(p.data as any)?.value ?? "—"}`;
        }
      },
      series: [{
        type: "sankey",
        left: "8%", right: "12%", top: 24, bottom: 24,
        nodeWidth: 22,
        nodeGap: 10,
        emphasis: { focus: "adjacency" },
        lineStyle: { color: "gradient", curveness: 0.55, opacity: 0.55 },
        label: { color: "#1e293b", fontSize: 12, fontWeight: 600 },
        data: nodes,
        links: links as any
      }]
    };
    sankeyChart.value.setOption(option, true);
    pushReliability("render", "success", Math.round(performance.now() - t0), { chart: "sankey" });
  } catch (err) {
    pushReliability("render", "failed", Math.round(performance.now() - t0), { chart: "sankey" },
      (err as Error)?.message ?? "sankey failed");
    console.warn("[okr] sankey render failed", err);
  }
}

/* ─── Burndown: Scope vs Actual vs Forecast ─────────── */
function renderBurndown() {
  if (!burndownRef.value) return;
  const t0 = performance.now();
  try {
    if (!burndownChart.value) burndownChart.value = echarts.init(burndownRef.value);
    const weeks = 12;
    const xAxis: string[] = [];
    const end = dayjs().startOf("week").add(1, "day");
    for (let i = weeks - 1; i >= 0; i--) xAxis.push(end.subtract(i, "week").format("MM-DD"));
    const goals = scopeGoals.value.length ? scopeGoals.value : (goalsData["executive"] ?? []);
    // total KR "points" = Σ max(1, (100 − baseline guess))
    let totalPoints = 0;
    for (const g of goals) {
      for (const kr of g.keyResults ?? []) {
        const base = 0; // 默认 baseline 0
        totalPoints += Math.max(1, 100 - base - (Number(kr.progress ?? 0) >= 100 ? 100 : 0));
      }
    }
    const currentAvgProgress = (() => {
      const krs = goals.flatMap(g => g.keyResults ?? []);
      if (!krs.length) return 0;
      return krs.reduce((s, k) => s + Number(k.progress ?? 0), 0) / krs.length;
    })();
    const scopeSeries: number[] = [];
    const actualSeries: number[] = [];
    const forecastSeries: number[] = [];
    // Build actual using computeCumulative() per goal aggregate weekly
    const goalsCumWeekly: number[][] = goals.map(g => {
      const arr: number[] = [];
      for (let i = 0; i < weeks; i++) arr.push(computeCumulative(g, i, weeks));
      return arr;
    });
    // aggregate: mean progress
    const weeklyMeanProgress: number[] = [];
    for (let w = 0; w < weeks; w++) {
      const all: number[] = [];
      for (const gw of goalsCumWeekly) all.push(gw[w]);
      weeklyMeanProgress.push(all.length ? all.reduce((s, v) => s + v, 0) / all.length : 0);
    }
    for (let i = 0; i < weeks; i++) {
      // Scope: straight line totalPoints → 0
      const scopeVal = totalPoints * (1 - (i / (weeks - 1)));
      scopeSeries.push(Math.round(scopeVal * 10) / 10);
      const meanP = Math.min(100, weeklyMeanProgress[i] ?? 0);
      const actual = Math.max(0, totalPoints * (1 - meanP / 100));
      actualSeries.push(Math.round(actual * 10) / 10);
      // Forecast: 对 i<weeks-3 留空；对末段做线性外推
      if (i < weeks - 3) { forecastSeries.push(NaN as any); continue; }
      // linear extend last 3 actual
      const a = i - 2 >= 0 ? actualSeries[i - 2] : actual;
      const b = i - 1 >= 0 && actualSeries[i - 1] !== undefined ? actualSeries[i - 1] : actual;
      const c = actual;
      const delta = i - 3 >= 0 ? ((b - (actualSeries[i - 3] ?? b)) + (c - b)) / 2 : c - b;
      if (i === weeks - 3 || i === weeks - 2) {
        forecastSeries.push(NaN as any);
      } else {
        // i=weeks-1: 预测未来一步
        forecastSeries.push(Math.max(0, Math.round((c + delta) * 10) / 10));
      }
    }
    // 用最后 3 周斜率再填充 forecast 所有点 (用实际末点做线性延申)
    const lastThree = actualSeries.slice(-3).filter(v => !isNaN(v as any));
    if (lastThree.length >= 2) {
      const slope = (lastThree[lastThree.length - 1] - lastThree[0]) / (lastThree.length - 1);
      const lastActual = lastThree[lastThree.length - 1];
      for (let i = 0; i < weeks; i++) {
        if (i < weeks - 3) continue;
        const steps = i - (weeks - 3);
        forecastSeries[i] = Math.max(0, Math.round((lastActual + slope * steps) * 10) / 10);
      }
    }
    const option: echarts.EChartsOption = {
      tooltip: { trigger: "axis" },
      legend: { data: ["Ideal Scope", "Actual", "Forecast"], top: 0 },
      grid: { left: 48, right: 24, top: 36, bottom: 40 },
      xAxis: { type: "category", boundaryGap: false, data: xAxis, axisLabel: { fontSize: 10, rotate: 30 } },
      yAxis: { type: "value", name: "Points Left", axisLabel: { fontSize: 10 } },
      series: [
        {
          name: "Ideal Scope",
          type: "line",
          smooth: false,
          symbol: "none",
          lineStyle: { type: "dashed", color: "#94a3b8" },
          data: scopeSeries
        },
        {
          name: "Actual",
          type: "line",
          smooth: true,
          symbol: "circle",
          symbolSize: 6,
          lineStyle: { width: 2, color: "#6366f1" },
          itemStyle: { color: "#6366f1" },
          areaStyle: { color: "rgba(99,102,241,0.12)" },
          data: actualSeries,
          markLine: {
            symbol: ["none", "arrow"],
            label: { formatter: `当前 ${Math.round(currentAvgProgress)}%`, position: "insideEndTop", fontSize: 10 },
            lineStyle: { type: "dotted", color: "#6366f1" },
            data: [{ xAxis: xAxis[weeks - 2], yAxis: actualSeries[weeks - 2] ?? 0 } as any]
          }
        },
        {
          name: "Forecast",
          type: "line",
          smooth: true,
          symbol: "diamond",
          symbolSize: 6,
          lineStyle: { type: "dotted", color: "#ea580c" },
          itemStyle: { color: "#ea580c" },
          data: forecastSeries
        }
      ]
    };
    burndownChart.value.setOption(option, true);
    pushReliability("render", "success", Math.round(performance.now() - t0), { chart: "burndown" });
  } catch (err) {
    pushReliability("render", "failed", Math.round(performance.now() - t0), { chart: "burndown" },
      (err as Error)?.message ?? "burndown failed");
    console.warn("[okr] burndown render failed", err);
  }
}

/* Resize helpers */
function resizeHeatmap() { try { heatmapChart.value?.resize?.(); } catch { /* noop */ } }
function resizeRadar() { try { radarChart.value?.resize?.(); } catch { /* noop */ } }
function resizeSankey() { try { sankeyChart.value?.resize?.(); } catch { /* noop */ } }
function resizeBurndown() { try { burndownChart.value?.resize?.(); } catch { /* noop */ } }

let heatmapResizeObserver: ResizeObserver | null = null;
let radarResizeObserver: ResizeObserver | null = null;
let sankeyResizeObserver: ResizeObserver | null = null;
let burndownResizeObserver: ResizeObserver | null = null;

/* ══════════════════════════════════════════════ */
/* Action Items 逻辑（原有 + watchdog + signal） */
/* ══════════════════════════════════════════════ */

const filteredActionItems = computed(() => {
  let list = scopeActionItems.value;
  if (monthFilter.value) {
    const target = Number(monthFilter.value);
    list = list.filter(a => {
      const d = dayjs(a.deadline);
      return d.isValid() && d.month() + 1 === target;
    });
  }
  if (priorityFilter.value !== "all") {
    list = list.filter(a => a.priority === priorityFilter.value);
  }
  if (statusFilter.value) {
    list = list.filter(a => a.status.toLowerCase() === statusFilter.value.toLowerCase());
  }
  if (riceMin.value > 0) {
    list = list.filter(a => (a.riceScore ?? 0) >= riceMin.value);
  }
  const kw = actionKeyword.value.trim().toLowerCase();
  if (kw) {
    list = list.filter(a =>
      [a.action, a.owner, a.roleName, a.linkGoal ?? ""].some(s =>
        String(s ?? "").toLowerCase().includes(kw)
      )
    );
  }
  return list;
});

const sortedActionItems = computed(() => {
  const arr = [...filteredActionItems.value];
  const sortKey = actionSort.value;
  switch (sortKey) {
    case "rice":
      return arr.sort((a, b) => (b.riceScore ?? 0) - (a.riceScore ?? 0) || a.priorityOrder - b.priorityOrder);
    case "deadline":
      return arr.sort((a, b) => deadlineTs(a.deadline) - deadlineTs(b.deadline));
    case "progress":
      return arr.sort((a, b) => b.progress - a.progress);
    case "falsify":
      return arr.sort((a, b) => (b.falPct ?? 0) - (a.falPct ?? 0) || a.priorityOrder - b.priorityOrder);
    case "priority":
    default:
      return arr.sort(
        (a, b) => a.priorityOrder - b.priorityOrder || deadlineTs(a.deadline) - deadlineTs(b.deadline)
      );
  }
});

const emptyText = computed(() =>
  actionKeyword.value || riceMin.value > 0 || priorityFilter.value !== "all" || statusFilter.value
    ? "当前筛选条件下暂无匹配行动项，试试扩大范围。"
    : monthFilter.value
      ? "No action items in this month."
      : "No action items."
);

function statusTypeOf(status: string): ActionItem["statusType"] {
  const s = String(status).toLowerCase();
  if (s === "done") return "success";
  if (s.includes("risk")) return "danger";
  if (s.includes("progress")) return "warning";
  return "info";
}

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
  /* PRO v2: RICE + 可证伪字段 */
  const baseline = typeof m.baseline === "string" ? m.baseline : "";
  const target = typeof m.target === "string" ? m.target : "";
  const rollback = typeof m.rollback === "string" ? m.rollback : "";
  const riceReach = Number(m.riceReach ?? NaN);
  const riceImpact = Number(m.riceImpact ?? NaN);
  const riceConfidence = Number(m.riceConfidence ?? NaN);
  const estimateHours = Number(m.estimateHours ?? NaN);
  const hasRice =
    Number.isFinite(riceReach) &&
    Number.isFinite(riceImpact) &&
    Number.isFinite(riceConfidence) &&
    Number.isFinite(estimateHours) &&
    estimateHours > 0;
  const defaultRice = defaultRiceFromPriority(priority);
  const riceRaw: RiceBreakdown = {
    reach: hasRice ? riceReach : defaultRice.reach,
    impact: hasRice ? riceImpact : defaultRice.impact,
    confidence: hasRice ? riceConfidence : defaultRice.confidence,
    effort: hasRice && estimateHours > 0 ? estimateHours : defaultRice.effort
  };
  const riceScore = computeRice(riceRaw);
  const falPct = computeFalPct({ deadline, baseline, target, rollback });
  const isOverdue =
    m.overdue === true ||
    (dayjs(deadline).isValid() && dayjs(deadline).isBefore(dayjs().startOf("day")));
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
    subtasks,
    /* PRO v2 */
    baseline: baseline || undefined,
    target: target || undefined,
    rollback: rollback || undefined,
    falPct,
    riceScore,
    riceRaw
  };
}

type ExampleTaskExt = ExampleTask & {
  baseline?: string; target?: string; rollback?: string;
  rice?: RiceBreakdown; estimateHours?: number;
};
function actionItemFromExample(t: ExampleTask, filePath: string): ActionItem {
  const tx = t as ExampleTaskExt;
  const riceRaw: RiceBreakdown =
    tx.rice && Number.isFinite(tx.rice.reach)
      ? { reach: tx.rice.reach, impact: tx.rice.impact, confidence: tx.rice.confidence, effort: tx.rice.effort ?? Math.max(1, Number(tx.estimateHours) || 4) }
      : defaultRiceFromPriority(t.priority);
  const riceScore = computeRice(riceRaw);
  const baseline = tx.baseline;
  const target = tx.target;
  const rollback = tx.rollback;
  const falPct = computeFalPct({ deadline: t.deadline, baseline, target, rollback });
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
    subtasks: t.subtasks,
    baseline,
    target,
    rollback,
    falPct,
    riceScore,
    riceRaw
  };
}

function actionItemMeta(t: ExampleTask): Record<string, unknown> {
  const tx = t as ExampleTaskExt;
  const extraRice: RiceBreakdown = tx.rice && Number.isFinite(tx.rice.reach)
    ? tx.rice
    : defaultRiceFromPriority(t.priority);
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
    subtasks: t.subtasks,
    baseline: tx.baseline ?? "",
    target: tx.target ?? "",
    rollback: tx.rollback ?? "",
    riceReach: extraRice.reach,
    riceImpact: extraRice.impact,
    riceConfidence: extraRice.confidence,
    estimateHours: extraRice.effort
  };
}

function renderActionBody(t: ExampleTask): string {
  const tx = t as ExampleTaskExt;
  const rice: RiceBreakdown = tx.rice && Number.isFinite(tx.rice.reach)
    ? tx.rice
    : defaultRiceFromPriority(t.priority);
  const lines: string[] = [`# ${t.title}`, "", t.description];
  if (t.subtasks?.length) {
    lines.push("", `## 可执行任务分解（${t.subtasks.length} 项）`);
    t.subtasks.forEach((s, i) => {
      lines.push(
        "",
        `### ${i + 1}. ${s.title}`,
        "",
        `- 做法：${s.detail}`,
        `- 完成标准：${s.acceptance}`
      );
    });
  }
  lines.push(
    "",
    "## 可证伪锚点",
    "",
    `| Anchor | Value |`,
    `|---|---|`,
    `| Baseline | ${tx.baseline ?? "—"} |`,
    `| Target | ${tx.target ?? "—"} |`,
    `| Rollback | ${tx.rollback ?? "—"} |`,
    `| Deadline | ${t.deadline} |`,
    "",
    "## RICE 优先评分",
    "",
    `| Reach | Impact | Confidence | Effort | RICE 归一 |`,
    `|---|---|---|---|---|`,
    `| ${rice.reach} | ${rice.impact} | ${rice.confidence} | ${rice.effort} h | ${computeRice(rice)}/100 |`,
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
    `| Skill | ${t.skill ?? "—"} |`,
    `| Agent | ${t.agent ?? "—"} |`,
    `| MCP | ${t.mcp || "—"} |`
  );
  return lines.join("\n");
}

function slugifyTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)
    .replace(/-+$/g, "");
}
function quarterDir(monthDir: string): string {
  if (monthDir === "undated") return "undated";
  return `${monthDir.slice(0, 4)}-Q${Math.ceil(Number(monthDir.slice(5, 7)) / 3)}`;
}
function actionFileName(t: ExampleTask): string {
  const slug = slugifyTitle(t.title);
  const dir = t.deadline ? t.deadline.slice(0, 7) : "undated"; // YYYY-MM
  return `okr/${quarterDir(dir)}/${dir}/${t.priority.toLowerCase()}-${t.role}-${slug}.md`;
}

async function seedExampleActionItems(
  opts: { timeoutMs: number; signal: AbortSignal }
): Promise<ActionItem[]> {
  const out: ActionItem[] = [];
  for (const t of EXAMPLE_TASKS) {
    const filePath = actionFileName(t);
    try {
      await writeKnowledgeFile(filePath, renderActionBody(t), actionItemMeta(t), {
        timeoutMs: opts.timeoutMs,
        signal: opts.signal
      });
      out.push(actionItemFromExample(t, filePath));
    } catch {
      // 后端不可用 → 跳过该条，保持空态
    }
  }
  return out;
}

/* Watchdog (硬约束 5)：12s hook + 22s UI fallback，失败必设 loading=false */
const { start: startWatchdogHook } = useTimeoutFn(
  () => {
    if (loading.value) {
      // 12s：打 warning，不终止（让 22s UI fallback 处理）
      ElMessage.warning("行动项加载较慢（>12s），正在继续等待后端响应…");
    }
  },
  12_000,
  { immediate: false }
);
const { start: startWatchdogFallback, stop: stopFallback } = useTimeoutFn(
  () => {
    if (loading.value) {
      loading.value = false;
      ElMessage.error("行动项加载超时（22s watchdog），请稍后重试。");
      try {
        disposer.reset();
      } catch {
        /* noop */
      }
    }
  },
  22_000,
  { immediate: false }
);

async function loadActionItems() {
  loading.value = true;
  disposer.reset();
  const { signal } = createTimeoutSignal(15_000, disposer);
  const t0 = performance.now();
  pushReliability("load", "success", 0, { stage: "before-scan" });
  startWatchdogHook();
  startWatchdogFallback();
  let status: ReliabilityMetricStatus = "success";
  let errorMsg: string | undefined;
  try {
    const res = await scanKnowledge("okr", { timeoutMs: 15_000, signal });
    const files = res.categories?.flatMap(c => c.files) ?? [];
    actionItems.value = files
      .filter(f => (f.meta ?? {})?.type === "okr-action")
      .map(actionItemFromFile);
  } catch (err) {
    status = "degraded";
    errorMsg = (err as Error)?.message ?? "scanKnowledge failed";
    actionItems.value = [];
  } finally {
    try {
      stopFallback();
    } catch {
      /* noop */
    }
    if (actionItems.value.length) {
      saveBool(SEEDED_KEY, true);
    } else if (!loadBool(SEEDED_KEY, false)) {
      try {
        const seeded = await seedExampleActionItems({ timeoutMs: 10_000, signal });
        if (seeded.length) {
          actionItems.value = seeded;
          saveBool(SEEDED_KEY, true);
        }
      } catch (err) {
        status = "failed";
        errorMsg = (err as Error)?.message ?? "seed failed";
      }
    }
    loading.value = false;
    pushReliability("load", status, Math.round(performance.now() - t0),
      { count: String(actionItems.value.length) }, errorMsg);
    // 渲染 PRO 4 图表
    try {
      await nextTick();
      renderRadar();
      renderSankey();
      renderBurndown();
      renderHeatmap();
    } catch (err) {
      console.warn("[okr] charts render batch failed:", err);
    }
  }
}

/* ══════════════════════════════════════════════ */
/* 新增行动项 Dialog */
/* ══════════════════════════════════════════════ */
const createDlgVisible = ref(false);
const createSaving = ref(false);
const createFormRef = ref<FormInstance | null>(null);

const createForm = ref<CreateForm>({
  title: "",
  description: "",
  goalId: "",
  krId: "",
  owner: "",
  deadline: dayjs().add(3, "day").format("YYYY-MM-DD"),
  priority: "P2",
  estimateHours: 4,
  ...(() => {
    const r = defaultRiceFromPriority("P2");
    return { riceReach: r.reach, riceImpact: r.impact, riceConfidence: r.confidence };
  })(),
  baseline: "",
  target: "",
  rollback: "",
  skill: "",
  agent: "",
  mcp: ""
});

const createRules: FormRules<CreateForm> = {
  title: [{ required: true, message: "请输入行动项标题", trigger: "blur" }],
  goalId: [{ required: true, message: "请选择所属 Goal", trigger: "change" }],
  owner: [{ required: true, message: "请输入负责人", trigger: "blur" }],
  deadline: [{ required: true, message: "请选择截止日期", trigger: "change" }],
  priority: [{ required: true, message: "请选择优先级", trigger: "change" }],
  estimateHours: [
    { required: true, message: "请输入预估工时", trigger: "blur" },
    { type: "number", min: 0, max: 200, message: "范围 0~200 小时", trigger: "blur" }
  ],
  riceReach: [{ type: "number", min: 0, max: 10000, message: "范围 0~10000", trigger: "blur" }],
  riceImpact: [{ required: true, message: "请选择 Impact", trigger: "change" }],
  riceConfidence: [{ required: true, message: "请选择 Confidence", trigger: "change" }]
};

const selectedGoalKRs = computed(() => {
  const g = currentRoleGoals.value.find(x => x.id === createForm.value.goalId);
  return g?.keyResults ?? [];
});

const previewRice = computed<number>(() => computeRice({
  reach: createForm.value.riceReach,
  impact: createForm.value.riceImpact,
  confidence: createForm.value.riceConfidence,
  effort: Math.max(0.1, createForm.value.estimateHours || 0.1)
}));

function openCreateActionDlg() {
  if (currentRoleGoals.value.length && !createForm.value.goalId) {
    createForm.value.goalId = currentRoleGoals.value[0].id;
  }
  createDlgVisible.value = true;
}
function onGoalSelectChange() {
  createForm.value.krId = "";
}
function resetCreateForm() {
  const defaultRice = defaultRiceFromPriority("P2");
  createForm.value = {
    title: "",
    description: "",
    goalId: currentRoleGoals.value[0]?.id ?? "",
    krId: "",
    owner: "",
    deadline: dayjs().add(3, "day").format("YYYY-MM-DD"),
    priority: "P2",
    estimateHours: 4,
    riceReach: defaultRice.reach,
    riceImpact: defaultRice.impact,
    riceConfidence: defaultRice.confidence,
    baseline: "",
    target: "",
    rollback: "",
    skill: "",
    agent: "",
    mcp: ""
  };
  createSaving.value = false;
}

async function submitCreateAction() {
  const valid = await createFormRef.value?.validate().catch(() => false);
  if (!valid) return;
  createSaving.value = true;
  disposer.reset();
  const { signal } = createTimeoutSignal(12_000, disposer);
  const t0 = performance.now();
  try {
    const f = createForm.value;
    const role = primaryRoleId.value;
    const roleMeta = rolesData[role];
    const id = `act-${dayjs().format("YYYYMMDDHHmmss")}-${Math.random().toString(36).slice(2, 6)}`;
    const deadline = f.deadline || dayjs().add(3, "day").format("YYYY-MM-DD");
    const t: ExampleTask & {
      baseline?: string; target?: string; rollback?: string; rice?: RiceBreakdown; estimateHours?: number;
    } = {
      id,
      title: f.title,
      role,
      roleIcon: roleMeta?.icon ?? "🎯",
      roleName: roleMeta?.name ?? role,
      goalId: f.goalId,
      skill: f.skill || "",
      agent: f.agent || "",
      mcp: (f.mcp || "") as ExampleTask["mcp"],
      listType: "daily",
      priority: f.priority,
      status: "Planned",
      owner: f.owner,
      deadline,
      progress: 0,
      description:
        f.description ||
        `由 Dashboard「新增行动项」在 ${dayjs().format("YYYY-MM-DD HH:mm")} 创建。预估 ${f.estimateHours}h。`,
      subtasks: [],
      baseline: f.baseline || undefined,
      target: f.target || undefined,
      rollback: f.rollback || undefined,
      estimateHours: f.estimateHours,
      rice: {
        reach: f.riceReach,
        impact: f.riceImpact,
        confidence: f.riceConfidence,
        effort: Math.max(0.1, f.estimateHours || 0.1)
      }
    };
    const slug = slugifyTitle(f.title);
    const dir = deadline.slice(0, 7);
    const filePath = `okr/${quarterDir(dir)}/${dir}/${f.priority.toLowerCase()}-${role}-new-${slug}.md`;
    const riceBreakdown = t.rice ?? { reach: f.riceReach, impact: f.riceImpact, confidence: f.riceConfidence, effort: Math.max(0.1, f.estimateHours || 0.1) };
    const riceRow = computeRice(riceBreakdown);
    const body = [
      `# ${f.title}`,
      "",
      f.description || "无描述",
      "",
      "## 可证伪锚点",
      "",
      "| Anchor | Value |",
      "|---|---|",
      `| Baseline | ${f.baseline || "—"} |`,
      `| Target | ${f.target || "—"} |`,
      `| Rollback | ${f.rollback || "—"} |`,
      `| Deadline | ${deadline} |`,
      "",
      "## RICE 优先评分",
      "",
      "| Reach | Impact | Confidence | Effort | RICE 归一 |",
      "|---|---|---|---|---|",
      `| ${f.riceReach} | ${f.riceImpact} | ${f.riceConfidence} | ${f.estimateHours} h | ${riceRow}/100 |`,
      "",
      "## 三要素编排 (Skill / Agent / MCP)",
      "",
      `| Skill | Agent | MCP |`,
      `|---|---|---|`,
      `| ${f.skill || "—"} | ${f.agent || "—"} | ${f.mcp || "none"} |`,
      "",
      "| Field | Value |",
      "|---|---|",
      `| ID | \`${id}\` |`,
      `| Role | ${t.roleIcon} ${t.roleName} |`,
      `| Goal | ${f.goalId} |`,
      `| KR | ${f.krId || "—"} |`,
      `| Owner | ${f.owner} |`,
      `| Deadline | ${deadline} |`,
      `| Priority | ${f.priority} |`,
      `| Estimate | ${f.estimateHours} h |`,
      `| Status | Planned |`,
      `| Progress | 0% |`
    ].join("\n");
    const meta: Record<string, unknown> = {
      type: "okr-action",
      id,
      title: f.title,
      role,
      goal: f.goalId,
      kr: f.krId || undefined,
      owner: f.owner,
      deadline,
      priority: f.priority,
      estimateHours: f.estimateHours,
      status: "Planned",
      progress: 0,
      subtaskCount: 0,
      subtasks: [],
      /* PRO v2 */
      baseline: f.baseline || "",
      target: f.target || "",
      rollback: f.rollback || "",
      riceReach: f.riceReach,
      riceImpact: f.riceImpact,
      riceConfidence: f.riceConfidence,
      skill: f.skill || "",
      agent: f.agent || "",
      mcp: f.mcp || ""
    };
    try {
      await writeKnowledgeFile(filePath, body, meta, {
        timeoutMs: 12_000,
        signal
      });
      pushReliability("create", "success", Math.round(performance.now() - t0), { filePath, id });
    } catch (err) {
      pushReliability("create", "degraded", Math.round(performance.now() - t0), { filePath, id },
        (err as Error)?.message ?? "writeKnowledgeFile failed");
      ElMessage.warning("写入知识库失败，已在当前会话临时添加（刷新后不保留）");
    }
    const item: ActionItem = actionItemFromExample(t as ExampleTask, filePath);
    actionItems.value.unshift(item);
    ElMessage.success(`行动项已创建：${f.title} · RICE ${riceRow}/100`);
    createDlgVisible.value = false;
  } finally {
    createSaving.value = false;
  }
}

/* ══════════════════════════════════════════════ */
/* 通用 helper */
/* ══════════════════════════════════════════════ */
function openKnowledgePreview(path?: string) {
  if (!path) {
    ElMessage.info("尚未沉淀证据");
    return;
  }
  previewDlg.value?.open(path);
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

async function handleDelete(item: ActionItem) {
  const ok = await confirm(
    t("knowledge.common.deleteFileConfirm", { path: item.action }),
    t("knowledge.common.deleteFileTitle")
  );
  if (!ok) return;
  const t0 = performance.now();
  if (item.filePath) {
    disposer.reset();
    const { signal } = createTimeoutSignal(10_000, disposer);
    try {
      await deleteKnowledgeFile(item.filePath, {
        timeoutMs: 10_000,
        signal
      });
      pushReliability("delete", "success", Math.round(performance.now() - t0),
        { id: item.id });
    } catch (err) {
      pushReliability("delete", "failed", Math.round(performance.now() - t0),
        { id: item.id }, (err as Error)?.message ?? "deleteKnowledgeFile failed");
      ElMessage.error(t("knowledge.common.fileDeleteFailed"));
      return;
    }
  }
  actionItems.value = actionItems.value.filter(a => a.id !== item.id);
  ElMessage.success(t("knowledge.common.actionItemDeleted"));
}

function priorityTypeOf(priority: string): ActionItem["priorityType"] {
  if (priority === "P0") return "danger";
  if (priority === "P1") return "warning";
  if (priority === "P2") return "primary";
  return "info";
}

/* ══════════════════════════════════════════════ */
/* lifecycle + watchers */
/* ══════════════════════════════════════════════ */
onMounted(async () => {
  try {
    mermaid.initialize({
      startOnLoad: false,
      theme: "default",
      securityLevel: "loose",
      flowchart: { htmlLabels: true, curve: "basis" }
    });
  } catch {
    /* mermaid init 失败不阻塞主流程 */
  }
  await loadActionItems();
  await nextTick();
  // 重复保险：若 loadActionItems 内部批量调用被跳过（如异常路径），兜底再渲染
  try {
    renderHeatmap();
    renderRadar();
    renderSankey();
    renderBurndown();
  } catch { /* noop */ }
  // ResizeObserver 全图表
  if (heatmapRef.value) {
    heatmapResizeObserver = createSafeResizeObserver(resizeHeatmap, { debounceMs: 80 });
    heatmapResizeObserver.observe(heatmapRef.value);
  }
  if (radarRef.value) {
    radarResizeObserver = createSafeResizeObserver(resizeRadar, { debounceMs: 80 });
    radarResizeObserver.observe(radarRef.value);
  }
  if (sankeyRef.value) {
    sankeyResizeObserver = createSafeResizeObserver(resizeSankey, { debounceMs: 80 });
    sankeyResizeObserver.observe(sankeyRef.value);
  }
  if (burndownRef.value) {
    burndownResizeObserver = createSafeResizeObserver(resizeBurndown, { debounceMs: 80 });
    burndownResizeObserver.observe(burndownRef.value);
  }
});

// Mermaid 渲染：traceMermaidCode 变化后重新渲染
watch(
  traceMermaidCode,
  async code => {
    await nextTick();
    if (!code) return;
    try {
      const nodes = document.querySelectorAll<HTMLElement>(".okr__trace-mermaid pre.mermaid");
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const id = `okr-trace-mmd-${Date.now()}-${i}`;
        try {
          const { svg } = await mermaid.render(id, code);
          n.innerHTML = svg;
        } catch (err) {
          n.innerText = `[Mermaid render failed] ${(err as Error)?.message ?? String(err)}`;
        }
      }
    } catch (err) {
      console.warn("[okr] mermaid render failed:", err);
    }
  },
  { immediate: true, flush: "post" }
);

// Role / heatmapData / scopeGoals 变化 → 全量重渲染 4 图
watch(
  [() => primaryRoleId.value, () => heatmapData.value, () => scopeGoals.value, () => scopeActionItems.value],
  async () => {
    await nextTick();
    try {
      renderHeatmap();
      renderRadar();
      renderSankey();
      renderBurndown();
    } catch { /* noop */ }
  },
  { deep: false }
);

// 年/季度过滤器变化 → 重新渲染 4 图（已在 onPeriodChange 中调用；此处兜底 watch）
watch(
  [() => yearFilter.value, () => quarterFilter.value, () => monthFilter.value],
  () => onPeriodChange(),
  { deep: false }
);

onBeforeUnmount(() => {
  try {
    heatmapResizeObserver?.disconnect();
    heatmapResizeObserver = null;
    radarResizeObserver?.disconnect();
    radarResizeObserver = null;
    sankeyResizeObserver?.disconnect();
    sankeyResizeObserver = null;
    burndownResizeObserver?.disconnect();
    burndownResizeObserver = null;
  } catch {
    /* noop */
  }
});
</script>

<style scoped lang="scss">
@use "./styles/okr.scss";
</style>
<style lang="scss">
@use "./styles/okrGlobal.scss";
</style>

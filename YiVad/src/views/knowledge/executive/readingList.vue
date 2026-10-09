<template>
  <div class="reading-list" tabindex="0" @keydown="onGlobalKeydown">
    <!-- ═══════════════════════════════════════════════
         Sticky Header: Title + Quick Stats + Hotkeys
    ═══════════════════════════════════════════════ -->
    <div class="reading-list__sticky-bar">
      <div class="reading-list__sticky-top">
        <div class="reading-list__sticky-left">
          <span class="reading-list__sticky-icon">{{ stickyIcon }}</span>
          <div class="reading-list__sticky-info">
            <div class="reading-list__sticky-headline">
              <h1 class="reading-list__sticky-name">{{ stickyTitle }}</h1>
              <el-tag effect="plain" type="primary" size="small" round>v3.2 · SSOT</el-tag>
              <el-tag effect="plain" size="small" round>5★ Confidence</el-tag>
            </div>
            <p class="reading-list__sticky-desc">
              Curated books, articles, and papers — plan, track, and distill insights across 8 knowledge dimensions.
              Every entry carries a RICE score, linked OKR, and So-What notes.
            </p>
          </div>
        </div>
        <div class="reading-list__sticky-right">
          <!-- SSOT Source switcher -->
          <div class="reading-list__source-toggle" :title="`数据源: YiKnowledge Files vs YiAi DB (当前: ${kb.sourceMode.value})`">
            <button
              class="reading-list__source-btn"
              :class="{ 'is-active': kb.sourceMode.value === 'kb' }"
              @click="onSourceSwitch('kb')"
            >
              <el-icon><Link /></el-icon>
              <span>YiKnowledge</span>
            </button>
            <button
              class="reading-list__source-btn"
              :class="{ 'is-active': kb.sourceMode.value === 'db' }"
              @click="onSourceSwitch('db')"
            >
              <el-icon><Connection /></el-icon>
              <span>YiAi DB</span>
            </button>
          </div>
          <el-button
            size="small"
            :icon="Upload"
            :loading="kb.seedState.running"
            type="success"
            plain
            @click="onSeedDb"
            title="一键将 YiKnowledge 真实条目批量 upsert 到 YiAi reading_list"
          >
            <template v-if="kb.seedState.running">
              同步中 {{ kb.seedState.done }}/{{ kb.seedState.total }}
            </template>
            <template v-else>
              同步到 YiAi
            </template>
          </el-button>
          <button class="reading-list__hotkey-btn" title="Toggle dashboard (Ctrl/⌘ + D)" @click="dashboardCollapsed = !dashboardCollapsed">
            <span>{{ dashboardCollapsed ? "Expand" : "Collapse" }}</span>
            <kbd>⌘D</kbd>
          </button>
          <el-button size="small" text :icon="Refresh" @click="handleRefresh" title="Refresh (R)">Refresh</el-button>
          <el-button type="primary" :icon="Plus" @click="openDialog()" title="Add new item (N)">Add Item</el-button>
        </div>
      </div>

      <!-- ── KPI Stat Row ── -->
      <div class="reading-list__kpi-row" :class="{ 'is-loading': summaryLoading }">
        <div class="reading-list__kpi reading-list__kpi--total" @click="gotoTab('all')">
          <div class="reading-list__kpi-top">
            <span class="reading-list__kpi-icon">📚</span>
            <span class="reading-list__kpi-label">Total Items</span>
          </div>
          <div class="reading-list__kpi-value">{{ summary.total }}</div>
          <div class="reading-list__kpi-bar">
            <span class="reading-list__kpi-bar-fg reading-list__kpi-bar-fg--done" :style="{ width: summary.total ? `${summary.done / summary.total * 100}%` : '0%' }" />
            <span class="reading-list__kpi-bar-fg reading-list__kpi-bar-fg--reading" :style="{ width: summary.total ? `${summary.reading / summary.total * 100}%` : '0%' }" />
          </div>
        </div>

        <div class="reading-list__kpi reading-list__kpi--reading" @click="gotoTab('reading')">
          <div class="reading-list__kpi-top">
            <span class="reading-list__kpi-icon">📅</span>
            <span class="reading-list__kpi-label">In Progress</span>
          </div>
          <div class="reading-list__kpi-value">
            {{ summary.reading }}
            <span class="reading-list__kpi-sub">· {{ breakdown.avgProgress }}% avg</span>
          </div>
          <el-progress :percentage="breakdown.avgProgress" :stroke-width="5" status="warning" :show-text="false" />
        </div>

        <div class="reading-list__kpi reading-list__kpi--done" @click="gotoTab('done')">
          <div class="reading-list__kpi-top">
            <span class="reading-list__kpi-icon">✅</span>
            <span class="reading-list__kpi-label">Completed</span>
          </div>
          <div class="reading-list__kpi-value">
            {{ summary.done }}
            <span class="reading-list__kpi-sub">· {{ breakdown.completionPct }}%</span>
          </div>
          <el-progress :percentage="breakdown.completionPct" :stroke-width="5" status="success" :show-text="false" />
        </div>

        <div class="reading-list__kpi reading-list__kpi--rice">
          <div class="reading-list__kpi-top">
            <span class="reading-list__kpi-icon">🎯</span>
            <span class="reading-list__kpi-label">Avg RICE</span>
          </div>
          <div class="reading-list__kpi-value">
            {{ breakdown.avgRice }}
            <span class="reading-list__kpi-sub">· Tier {{ riceTier(breakdown.avgRice) }}</span>
          </div>
          <div class="reading-list__rice-distro">
            <span class="reading-list__rice-tier reading-list__rice-tier--t1" :style="{ flex: breakdown.riceBuckets.tier1 }" :title="`Tier 1 (≥80): ${breakdown.riceBuckets.tier1}`" />
            <span class="reading-list__rice-tier reading-list__rice-tier--t2" :style="{ flex: breakdown.riceBuckets.tier2 }" :title="`Tier 2 (60–79): ${breakdown.riceBuckets.tier2}`" />
            <span class="reading-list__rice-tier reading-list__rice-tier--t3" :style="{ flex: breakdown.riceBuckets.tier3 }" :title="`Tier 3 (40–59): ${breakdown.riceBuckets.tier3}`" />
            <span class="reading-list__rice-tier reading-list__rice-tier--t4" :style="{ flex: Math.max(breakdown.riceBuckets.tier4, 1) }" :title="`Tier 4 (<40): ${breakdown.riceBuckets.tier4}`" />
          </div>
        </div>

        <div class="reading-list__kpi reading-list__kpi--ring">
          <div class="reading-list__kpi-top">
            <span class="reading-list__kpi-icon">🧭</span>
            <span class="reading-list__kpi-label">Coverage</span>
          </div>
          <div class="reading-list__ring-wrap">
            <el-progress type="dashboard" :percentage="dimensionCoveragePct" :width="70" :stroke-width="10" status="primary" :show-text="true">
              <span class="reading-list__ring-text">{{ dimensionCoveragePct }}%</span>
            </el-progress>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════
         Collapsible Dashboard: Dimensions · Types · Hot Priority
         + Extended SSOT Dashboards v3.2 (SLO / 红绿灯 / 洞察 / OKR / 蒸馏 / Queue)
    ═══════════════════════════════════════════════ -->
    <transition name="fade-slide">
      <div
        v-show="!dashboardCollapsed"
        class="reading-list__dashboards fade-transform"
      >
        <div class="reading-list__dashboard">
          <!-- Dimensions panel -->
          <div class="reading-list__panel reading-list__panel--dim">
          <div class="reading-list__panel-head">
            <span class="reading-list__panel-icon">🗂</span>
            <h3 class="reading-list__panel-title">Knowledge Dimensions</h3>
            <span class="reading-list__panel-count">{{ activeDimensions }} of 8</span>
          </div>
          <div class="reading-list__dim-grid">
            <button
              v-for="dim in dimensionOptions"
              :key="dim.value"
              class="reading-list__dim-chip"
              :class="{ 'is-active': dimensionFilter === dim.value, 'has-data': breakdown.byDimension[dim.value] > 0 }"
              @click="onDimensionToggle(dim.value)"
            >
              <span class="reading-list__dim-icon">{{ dim.icon }}</span>
              <span class="reading-list__dim-name">{{ dim.label }}</span>
              <span class="reading-list__dim-count">{{ breakdown.byDimension[dim.value] }}</span>
              <span class="reading-list__dim-bar" :style="{ width: dimBarWidth(dim.value) }" />
            </button>
          </div>
        </div>

        <!-- Types + Priority distribution -->
        <div class="reading-list__panel reading-list__panel--dist">
          <div class="reading-list__panel-head">
            <span class="reading-list__panel-icon">📊</span>
            <h3 class="reading-list__panel-title">Distribution</h3>
          </div>

          <div class="reading-list__dist-section">
            <div class="reading-list__dist-label">
              <span>By Type</span>
              <span class="reading-list__dist-total">{{ totalOf(breakdown.byType) }}</span>
            </div>
            <div class="reading-list__dist-bar">
              <span v-for="t in typeOptions" :key="t.value" class="reading-list__dist-seg" :class="`reading-list__dist-seg--${t.value}`" :style="segWidth(breakdown.byType[t.value], totalOf(breakdown.byType))" :title="`${t.label}: ${breakdown.byType[t.value]}`" />
            </div>
            <div class="reading-list__dist-legend">
              <span v-for="t in typeOptions" :key="t.value" class="reading-list__dist-legend-item">
                <span class="reading-list__dist-legend-dot reading-list__dist-legend-dot--article" :class="`reading-list__dist-legend-dot--${t.value}`" />
                {{ t.label }} <em>{{ breakdown.byType[t.value] }}</em>
              </span>
            </div>
          </div>

          <div class="reading-list__dist-section">
            <div class="reading-list__dist-label">
              <span>By Priority</span>
              <span class="reading-list__dist-total">{{ totalOf(breakdown.byPriority) }}</span>
            </div>
            <div class="reading-list__dist-bar">
              <span v-for="p in priorityOptions" :key="p.value" class="reading-list__dist-seg" :class="`reading-list__dist-seg--${p.value}`" :style="segWidth(breakdown.byPriority[p.value], totalOf(breakdown.byPriority))" :title="`${p.label}: ${breakdown.byPriority[p.value]}`" />
            </div>
            <div class="reading-list__dist-legend">
              <span v-for="p in priorityOptions" :key="p.value" class="reading-list__dist-legend-item">
                <span class="reading-list__dist-legend-dot" :class="`reading-list__dist-legend-dot--${p.value}`" />
                {{ p.label }} <em>{{ breakdown.byPriority[p.value] }}</em>
              </span>
            </div>
          </div>

          <div class="reading-list__dist-section reading-list__dist-section--progress">
            <div class="reading-list__dist-label">
              <span>Status Funnel</span>
            </div>
            <div class="reading-list__funnel">
              <div class="reading-list__funnel-step reading-list__funnel-step--todo" :style="{ width: funnelPct(summary.total, summary.total) }">
                <span>To Read</span><b>{{ breakdown.byStatus["to-read"] }}</b>
              </div>
              <div class="reading-list__funnel-step reading-list__funnel-step--reading" :style="{ width: funnelPct(summary.reading, summary.total) }">
                <span>Reading</span><b>{{ summary.reading }}</b>
              </div>
              <div class="reading-list__funnel-step reading-list__funnel-step--done" :style="{ width: funnelPct(summary.done, summary.total) }">
                <span>Done</span><b>{{ summary.done }}</b>
              </div>
            </div>
          </div>
        </div>

        <!-- RICE Scoreboard -->
        <div class="reading-list__panel reading-list__panel--rice">
          <div class="reading-list__panel-head">
            <span class="reading-list__panel-icon">🏆</span>
            <h3 class="reading-list__panel-title">RICE Scoreboard</h3>
            <el-button v-if="riceFilter !== ''" size="small" text @click="riceFilter = ''; onFilterChange()">Clear</el-button>
          </div>
          <div class="reading-list__rice-list">
            <button class="reading-list__rice-tier-btn" :class="{ 'is-active': riceFilter === 'tier1' }" @click="toggleRiceFilter('tier1')">
              <span class="reading-list__rice-tier-label">Tier 1 · ≥80</span>
              <span class="reading-list__rice-tier-count">{{ breakdown.riceBuckets.tier1 }}</span>
            </button>
            <button class="reading-list__rice-tier-btn" :class="{ 'is-active': riceFilter === 'tier2' }" @click="toggleRiceFilter('tier2')">
              <span class="reading-list__rice-tier-label">Tier 2 · 60–79</span>
              <span class="reading-list__rice-tier-count">{{ breakdown.riceBuckets.tier2 }}</span>
            </button>
            <button class="reading-list__rice-tier-btn" :class="{ 'is-active': riceFilter === 'tier3' }" @click="toggleRiceFilter('tier3')">
              <span class="reading-list__rice-tier-label">Tier 3 · 40–59</span>
              <span class="reading-list__rice-tier-count">{{ breakdown.riceBuckets.tier3 }}</span>
            </button>
            <button class="reading-list__rice-tier-btn" :class="{ 'is-active': riceFilter === 'tier4' }" @click="toggleRiceFilter('tier4')">
              <span class="reading-list__rice-tier-label">Tier 4 · &lt;40</span>
              <span class="reading-list__rice-tier-count">{{ breakdown.riceBuckets.tier4 }}</span>
            </button>
          </div>
          <div class="reading-list__rice-foot">
            <span>RICE = Reach × Impact × Confidence ÷ Effort (normalized 0–100). Entries ≥ 60 auto-promote to quarterly pipeline.</span>
          </div>
        </div>
        </div>

        <!-- ═══════════════════════════════════════════════
             Extended SSOT Dashboards (from 001-阅读-阅读清单.md v3.2)
             · SLO 8 KPI cards
             · 红绿灯 4 告警
             · 12 条 5★ 跨书洞察
             · OKR 支撑矩阵 3 Goal × 10 KR
             · 蒸馏 7 状态机 + 21 天西蒙节奏
             · §7 Future Queue ≥20 H/M/L 三级
        ═══════════════════════════════════════════════ -->
        <div class="reading-list__dashboard reading-list__dashboard--extra">
          <!-- ── Panel 4: SLO 8 KPI Tracker (exec-003) ── -->
          <div class="reading-list__panel reading-list__panel--slo">
            <div class="reading-list__panel-head">
              <span class="reading-list__panel-icon">📊</span>
              <h3 class="reading-list__panel-title">exec-003 SLO KPI 追踪</h3>
              <span class="reading-list__panel-count">{{ kb.sloCards.length }} cards · Q3→Q4</span>
            </div>
            <div class="reading-list__slo-grid">
              <div
                v-for="c in kb.sloCards"
                :key="c.id"
                class="reading-list__slo-card"
                :class="`reading-list__slo-card--${c.light}`"
              >
                <div class="reading-list__slo-card-head">
                  <span class="reading-list__slo-card-id">{{ c.id }}</span>
                  <span
                    class="reading-list__slo-card-light"
                    :class="`reading-list__slo-card-light--${c.light}`"
                  >{{ lightEmoji(c.light) }}</span>
                </div>
                <p class="reading-list__slo-card-title">{{ c.title }}</p>
                <p class="reading-list__slo-card-desc">{{ c.description }}</p>
                <div class="reading-list__slo-card-foot">
                  <div>
                    <div class="reading-list__slo-card-meta-label">实际</div>
                    <div class="reading-list__slo-card-val">{{ c.actual }}</div>
                  </div>
                  <div>
                    <div class="reading-list__slo-card-meta-label">目标</div>
                    <div class="reading-list__slo-card-val">{{ c.target }}</div>
                  </div>
                </div>
                <div class="reading-list__slo-card-src">{{ c.sourceSection }}</div>
              </div>
            </div>
          </div>

          <!-- ── Panel 5: 红黄绿 灯告警 ── -->
          <div class="reading-list__panel reading-list__panel--alert">
            <div class="reading-list__panel-head">
              <span class="reading-list__panel-icon">🚦</span>
              <h3 class="reading-list__panel-title">红·黄·绿灯告警（月度评审会 10s 扫）</h3>
              <span class="reading-list__panel-count">{{ kb.alerts.length }} rows</span>
            </div>
            <div class="reading-list__alert-list">
              <div
                v-for="a in kb.alerts"
                :key="a.id"
                class="reading-list__alert"
                :class="`reading-list__alert--${a.light}`"
              >
                <span class="reading-list__alert-light">{{ lightEmoji(a.light) }}</span>
                <div class="reading-list__alert-main">
                  <div class="reading-list__alert-item">{{ a.item }}</div>
                  <div class="reading-list__alert-problem">{{ a.problem }}</div>
                </div>
                <div class="reading-list__alert-meta">
                  <span class="reading-list__alert-due"><b>DDL:</b> {{ a.due }}</span>
                  <span class="reading-list__alert-owner"><b>Owner:</b> {{ a.owner }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- ── Panel 6: 12 条 5★ 跨书洞察 ── -->
          <div class="reading-list__panel reading-list__panel--insight">
            <div class="reading-list__panel-head">
              <span class="reading-list__panel-icon">⭐</span>
              <h3 class="reading-list__panel-title">5★ 跨书高置信洞察矩阵（§8）</h3>
              <span class="reading-list__panel-count">12/12 全 ★★★★★ 100%</span>
            </div>
            <div class="reading-list__insight-grid">
              <div
                v-for="ins in kb.insights"
                :key="ins.id"
                class="reading-list__insight-card"
              >
                <div class="reading-list__insight-head">
                  <span class="reading-list__insight-id">{{ ins.id }}</span>
                  <span class="reading-list__insight-stars">{{ stars(ins.confidence) }}</span>
                </div>
                <p class="reading-list__insight-text">{{ ins.insight }}</p>
                <div class="reading-list__insight-chips">
                  <el-tag
                    v-for="(s, i) in ins.supporting"
                    :key="i"
                    effect="plain"
                    type="primary"
                    size="small"
                    class="reading-list__insight-chip"
                  >{{ s }}</el-tag>
                </div>
                <div class="reading-list__insight-goals">
                  <span class="reading-list__insight-label">支撑决策:</span>
                  <span>{{ ins.goals.join(" · ") }}</span>
                </div>
                <div class="reading-list__insight-anchors">
                  <span class="reading-list__insight-label">落地锚点:</span>
                  <a
                    v-for="(a, i) in ins.anchors"
                    :key="i"
                    class="reading-list__anchor-link"
                    @click.prevent="openKnowledgePreview(a.path)"
                  >{{ a.label }}</a>
                </div>
              </div>
            </div>
          </div>

          <!-- ── Panel 7: 3 Goal × 10 KR OKR 支撑矩阵 ── -->
          <div class="reading-list__panel reading-list__panel--okr reading-list__panel--wide">
            <div class="reading-list__panel-head">
              <span class="reading-list__panel-icon">🎯</span>
              <h3 class="reading-list__panel-title">Goal × KR 阅读支撑矩阵（§5 · 平均 9.2/10）</h3>
              <span class="reading-list__panel-count">3 Goal · 10 KR</span>
            </div>
            <div class="reading-list__okr-goal-list">
              <div
                v-for="group in groupedOkrRows"
                :key="group.goalId"
                class="reading-list__okr-goal"
              >
                <div class="reading-list__okr-goal-head">
                  <span class="reading-list__okr-goal-tag">exec-{{ group.goalId }}</span>
                  <span class="reading-list__okr-goal-title">{{ group.goalTitle }}</span>
                </div>
                <div class="reading-list__okr-row-list">
                  <div
                    v-for="r in group.rows"
                    :key="r.krId"
                    class="reading-list__okr-row"
                  >
                    <div class="reading-list__okr-row-left">
                      <span class="reading-list__okr-kr-id">KR {{ r.krId }}</span>
                      <p class="reading-list__okr-kr-desc">{{ r.krDescription }}</p>
                      <div class="reading-list__okr-supports">
                        <el-tag
                          v-for="(s, i) in r.supports"
                          :key="i"
                          size="small"
                          effect="light"
                          type="info"
                        >📖 {{ s }}</el-tag>
                      </div>
                    </div>
                    <div class="reading-list__okr-row-right">
                      <div class="reading-list__okr-score">
                        <span class="reading-list__okr-score-val">{{ r.coverageScore }}</span>
                        <span class="reading-list__okr-score-max">/ 10</span>
                      </div>
                      <div class="reading-list__okr-bar">
                        <span
                          class="reading-list__okr-bar-fg"
                          :style="{ width: `${Math.min(100, (r.coverageScore / 10) * 100)}%` }"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ── Panel 8: 蒸馏 7 状态机 + 西蒙节奏 ── -->
          <div class="reading-list__panel reading-list__panel--flow">
            <div class="reading-list__panel-head">
              <span class="reading-list__panel-icon">🗓</span>
              <h3 class="reading-list__panel-title">蒸馏 7 状态机 & 西蒙 21 天节奏（§6）</h3>
              <span class="reading-list__panel-count">Queued → Archived · 红线预警</span>
            </div>
            <ol class="reading-list__flow-bar">
              <li
                v-for="(s, i) in kb.distillSteps"
                :key="s.key"
                class="reading-list__flow-step"
                :class="`reading-list__flow-step--${s.key}`"
              >
                <span class="reading-list__flow-step-index">{{ i + 1 }}</span>
                <span class="reading-list__flow-step-label">{{ s.label }}</span>
                <span class="reading-list__flow-step-desc">{{ s.description }}</span>
                <span v-if="s.redlineDays" class="reading-list__flow-step-redline">
                  红线 ≤ {{ s.redlineDays }}d
                </span>
              </li>
            </ol>
          </div>

          <!-- ── Panel 9: §7 Future Queue ≥ 20 (H/M/L) ── -->
          <div class="reading-list__panel reading-list__panel--queue reading-list__panel--wide">
            <div class="reading-list__panel-head">
              <span class="reading-list__panel-icon">⏭</span>
              <h3 class="reading-list__panel-title">2026-Q4 未来候选待读队列（§7 · ≥ 20 条）</h3>
              <span class="reading-list__panel-count">H 8 · M 8 · L 4</span>
            </div>
            <div class="reading-list__queue-groups">
              <div
                v-for="bucket in queueBuckets"
                :key="bucket.key"
                class="reading-list__queue-bucket"
              >
                <div class="reading-list__queue-bucket-head" :class="`reading-list__queue-bucket-head--${bucket.key}`">
                  <span>{{ bucket.label }}</span>
                  <em>{{ bucket.rows.length }} 条</em>
                </div>
                <ul class="reading-list__queue-list">
                  <li v-for="q in bucket.rows" :key="q.rank" class="reading-list__queue-item">
                    <div class="reading-list__queue-item-top">
                      <span class="reading-list__queue-item-rank">{{ q.rank }}</span>
                      <span class="reading-list__queue-item-title">{{ q.title }}</span>
                      <span class="reading-list__queue-item-rice" :class="riceClass(q.rice)">RICE {{ q.rice }}</span>
                    </div>
                    <div class="reading-list__queue-item-meta">
                      <span>✍ {{ q.author }}</span>
                      <span>· {{ dimensionLabel(q.dimension) }}</span>
                      <span>· 🎯 {{ q.eta }}</span>
                    </div>
                    <div class="reading-list__queue-item-cond">
                      <b>进入下月条件:</b> {{ q.condition }}
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- ═══════════════════════════════════════════════
         Body: Sidebar Tabs + Filter + Content
    ═══════════════════════════════════════════════ -->
    <div class="reading-list__body">
      <nav class="reading-list__sidebar">
        <button
          class="reading-list__sidebar-item"
          :class="{ 'is-active': activeTab === 'all' }"
          @click="gotoTab('all')"
        >
          <span class="reading-list__sidebar-icon">📖</span>
          <span class="reading-list__sidebar-label">全部阅读</span>
          <span class="reading-list__sidebar-badge">{{ summary.total }}</span>
        </button>
        <button
          class="reading-list__sidebar-item"
          :class="{ 'is-active': activeTab === 'reading' }"
          @click="gotoTab('reading')"
        >
          <span class="reading-list__sidebar-icon">📅</span>
          <span class="reading-list__sidebar-label">阅读中</span>
          <span class="reading-list__sidebar-badge">{{ summary.reading }}</span>
        </button>
        <button
          class="reading-list__sidebar-item"
          :class="{ 'is-active': activeTab === 'done' }"
          @click="gotoTab('done')"
        >
          <span class="reading-list__sidebar-icon">✅</span>
          <span class="reading-list__sidebar-label">已完成</span>
          <span class="reading-list__sidebar-badge">{{ summary.done }}</span>
        </button>

        <div class="reading-list__sidebar-divider" />

        <button
          class="reading-list__sidebar-item"
          :class="{ 'is-active': !!priorityFilter && priorityFilter === 'high' }"
          @click="quickPriority('high')"
        >
          <span class="reading-list__sidebar-icon">🔥</span>
          <span class="reading-list__sidebar-label">高优先级</span>
          <span class="reading-list__sidebar-badge">{{ breakdown.byPriority.high }}</span>
        </button>
        <button
          class="reading-list__sidebar-item"
          :class="{ 'is-active': riceFilter === 'tier1' }"
          @click="toggleRiceFilter('tier1')"
        >
          <span class="reading-list__sidebar-icon">🏆</span>
          <span class="reading-list__sidebar-label">RICE ≥ 80</span>
          <span class="reading-list__sidebar-badge">{{ breakdown.riceBuckets.tier1 }}</span>
        </button>
      </nav>

      <div class="reading-list__content">
        <div class="reading-list__section">
          <div class="reading-list__section-head">
            <div class="reading-list__section-head-left">
              <h2 class="reading-list__section-title">{{ sectionTitle }}</h2>
              <span class="reading-list__result-count">{{ displayCount }} of {{ sectionTotal }} items</span>
              <el-tag v-if="riceFilter" effect="light" type="warning" size="small" round closable @close="riceFilter = ''; onFilterChange()">
                RICE: {{ riceFilterLabel }}
              </el-tag>
              <el-tag v-if="dimensionFilter" effect="light" type="success" size="small" round closable @close="dimensionFilter = ''; onFilterChange()">
                维度: {{ dimensionLabel(dimensionFilter) }}
              </el-tag>
            </div>
            <span class="reading-list__toolbar-right">
              <el-radio-group v-model="viewMode" size="small" @change="onViewModeChange">
                <el-radio-button value="card">Card</el-radio-button>
                <el-radio-button value="list">List</el-radio-button>
                <el-radio-button value="table">Table</el-radio-button>
              </el-radio-group>
              <el-button size="small" text @click="clearAllFilters">Reset</el-button>
            </span>
          </div>

          <div class="reading-list__section-body">
            <div class="reading-list__toolbar">
              <el-input
                v-model="search"
                placeholder="Search title, author, notes, category… (⌘K)"
                clearable
                :prefix-icon="Search"
                style="width: 280px"
                @keyup.enter="onFilterChange"
                @clear="onFilterChange"
              />
              <el-select v-model="typeFilter" placeholder="All types" clearable style="width: 130px" @change="onFilterChange">
                <el-option v-for="t in typeOptions" :key="t.value" :label="t.label" :value="t.value" />
              </el-select>
              <el-select
                v-if="activeTab === 'all'"
                v-model="statusFilter"
                placeholder="All statuses"
                clearable
                style="width: 140px"
                @change="onFilterChange"
              >
                <el-option v-for="s in statusOptions" :key="s.value" :label="s.label" :value="s.value" />
              </el-select>
              <el-select
                v-model="priorityFilter"
                placeholder="All priorities"
                clearable
                style="width: 150px"
                @change="onFilterChange"
              >
                <el-option v-for="p in priorityOptions" :key="p.value" :label="p.label" :value="p.value" />
              </el-select>
              <el-select
                v-model="dimensionFilter"
                placeholder="All dimensions"
                clearable
                style="width: 160px"
                @change="onFilterChange"
              >
                <el-option v-for="d in dimensionOptions" :key="d.value" :label="`${d.icon} ${d.label}`" :value="d.value" />
              </el-select>
            </div>

            <!-- ═══ Table View ═══ -->
            <ProTable
              v-if="viewMode === 'table'"
              ref="proTable"
              :columns="columns"
              :request-api="getTableList"
              :init-param="initParam"
              :data-callback="dataCallback"
              :tool-button="false"
              row-key="key"
            >
              <template #title="{ row }">
                <div class="reading-list__title">
                  <a
                    v-if="row.link"
                    :href="row.link"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="reading-list__title-link"
                    >{{ row.title }}</a
                  >
                  <span v-else class="reading-list__title-text">{{ row.title }}</span>
                  <div class="reading-list__title-meta">
                    <el-tag v-if="row.dimension" :type="dimTagType(row.dimension)" effect="plain" size="small">{{ dimensionLabel(row.dimension) }}</el-tag>
                    <span v-if="row.category" class="reading-list__title-cat">· {{ row.category }}</span>
                  </div>
                  <div v-if="row.notes" class="reading-list__title-notes">
                    {{ oneLiner(row.notes) }}
                  </div>
                </div>
              </template>

              <template #rice="{ row }">
                <div class="reading-list__rice-cell">
                  <span class="reading-list__rice-score" :class="riceClass(row.rice)">{{ formatRice(row.rice) }}</span>
                  <el-tag v-if="row.rice !== undefined" :type="riceTagType(row.rice)" effect="light" size="small">Tier {{ riceTier(row.rice) }}</el-tag>
                </div>
              </template>

              <template #progress="{ row }">
                <el-progress :percentage="row.progress ?? effectiveProgress(row)" :stroke-width="6" :status="progressStatus(row)" :show-text="true" />
              </template>

              <template #updatedTime="{ row }">
                <span class="reading-list__date">{{ formatRelativeTime(row.updatedTime) }}</span>
              </template>

              <template #operation="{ row }">
                <el-button v-if="row.status !== 'done'" size="small" text type="success" @click="markDone(row)">Done</el-button>
                <el-button size="small" text type="primary" @click="openDialog(row)">Edit</el-button>
                <el-popconfirm title="Remove this reading item?" @confirm="removeItem(row)">
                  <template #reference>
                    <el-button size="small" text type="danger">Del</el-button>
                  </template>
                </el-popconfirm>
              </template>
            </ProTable>

            <!-- ═══ Card View ═══ -->
            <div v-else-if="viewMode === 'card'" v-loading="flatLoading" class="reading-list__grid">
              <div v-if="!flatLoading && !flatData.length" class="reading-list__empty">
                <span class="reading-list__empty-icon">📚</span>
                <p class="reading-list__empty-title">No reading items</p>
                <p class="reading-list__empty-hint">Try adjusting filters or add your first book, article, or paper.</p>
                <el-button type="primary" :icon="Plus" @click="openDialog()">Add Item</el-button>
              </div>
              <el-card v-for="item in flatData" :key="item.key" class="reading-list__card" shadow="hover" :class="`reading-list__card--dim-${item.dimension ?? 'none'}`">
                <div class="reading-list__card-top">
                  <div class="reading-list__card-tags">
                    <el-tag :type="typeTagType(item.type)" size="small">{{ typeLabel(item.type) }}</el-tag>
                    <el-tag :type="statusTagType(item.status)" size="small">{{ statusLabel(item.status) }}</el-tag>
                    <el-tag v-if="item.priority" :type="priorityTagType(item.priority)" size="small">{{ item.priority }}</el-tag>
                    <el-tag v-if="item.dimension" :type="dimTagType(item.dimension)" effect="plain" size="small">{{ dimensionLabel(item.dimension) }}</el-tag>
                  </div>
                  <div v-if="item.rice !== undefined" class="reading-list__card-rice" :class="riceClass(item.rice)">
                    RICE <b>{{ formatRice(item.rice) }}</b>
                  </div>
                </div>

                <p class="reading-list__card-title">
                  <a
                    v-if="item.link"
                    :href="item.link"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="reading-list__card-link"
                    >{{ item.title }}</a
                  >
                  <span v-else>{{ item.title }}</span>
                </p>
                <div class="reading-list__card-sub">
                  <span v-if="item.author" class="reading-list__card-author">✍ {{ item.author }}</span>
                  <span v-if="item.category" class="reading-list__card-cat">🏷 {{ item.category }}</span>
                  <span v-if="item.okrId" class="reading-list__card-okr">🎯 OKR-{{ item.okrId }}</span>
                </div>
                <p v-if="item.notes" class="reading-list__card-notes">{{ oneLiner(item.notes) }}</p>

                <el-progress class="reading-list__card-progress" :percentage="item.progress ?? effectiveProgress(item)" :stroke-width="4" :status="progressStatus(item)" :show-text="true" />

                <div class="reading-list__card-actions">
                  <span class="reading-list__card-date">{{ formatRelativeTime(item.updatedTime) }}</span>
                  <el-button v-if="item.status !== 'done'" size="small" text type="success" @click="markDone(item)"
                    >Done</el-button
                  >
                  <el-button size="small" text type="primary" @click="openDialog(item)">Edit</el-button>
                  <el-popconfirm title="Remove this reading item?" @confirm="removeItem(item)">
                    <template #reference>
                      <el-button size="small" text type="danger">Del</el-button>
                    </template>
                  </el-popconfirm>
                </div>
              </el-card>
            </div>

            <!-- ═══ List View ═══ -->
            <div v-else v-loading="flatLoading" class="reading-list__list">
              <div v-if="!flatLoading && !flatData.length" class="reading-list__empty">
                <span class="reading-list__empty-icon">📚</span>
                <p class="reading-list__empty-title">No reading items</p>
                <p class="reading-list__empty-hint">Try adjusting filters or add your first book, article, or paper.</p>
                <el-button type="primary" :icon="Plus" @click="openDialog()">Add Item</el-button>
              </div>
              <div v-for="item in flatData" :key="item.key" class="reading-list__list-row">
                <span class="reading-list__list-type">{{ typeIcon(item.type) }}</span>
                <div class="reading-list__list-main">
                  <div class="reading-list__list-title-row">
                    <span class="reading-list__list-title">
                      <a
                        v-if="item.link"
                        :href="item.link"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="reading-list__list-link"
                        >{{ item.title }}</a
                      >
                      <span v-else>{{ item.title }}</span>
                      <span v-if="item.author" class="reading-list__list-author"> — {{ item.author }}</span>
                    </span>
                  </div>
                  <div class="reading-list__list-meta">
                    <el-tag v-if="item.dimension" :type="dimTagType(item.dimension)" effect="plain" size="small">{{ dimensionLabel(item.dimension) }}</el-tag>
                    <span v-if="item.category" class="reading-list__list-cat">{{ item.category }}</span>
                    <span v-if="item.okrId" class="reading-list__list-okr">🎯 OKR-{{ item.okrId }}</span>
                    <span v-if="item.rice !== undefined" class="reading-list__list-rice" :class="riceClass(item.rice)">RICE {{ formatRice(item.rice) }}</span>
                  </div>
                </div>
                <el-progress class="reading-list__list-progress" :percentage="item.progress ?? effectiveProgress(item)" :stroke-width="5" :status="progressStatus(item)" :show-text="true" />
                <el-tag :type="statusTagType(item.status)" size="small">{{ statusLabel(item.status) }}</el-tag>
                <el-tag v-if="item.priority" :type="priorityTagType(item.priority)" size="small">{{ item.priority }}</el-tag>
                <span class="reading-list__list-date">{{ formatRelativeTime(item.updatedTime) }}</span>
                <div class="reading-list__list-actions">
                  <el-button v-if="item.status !== 'done'" size="small" text type="success" @click="markDone(item)"
                    >Done</el-button
                  >
                  <el-button size="small" text type="primary" @click="openDialog(item)">Edit</el-button>
                  <el-popconfirm title="Remove this reading item?" @confirm="removeItem(item)">
                    <template #reference>
                      <el-button size="small" text type="danger">Del</el-button>
                    </template>
                  </el-popconfirm>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════
         Add / Edit Dialog
    ═══════════════════════════════════════════════ -->
    <el-dialog
      v-model="dialogVisible"
      :title="editing?.key ? 'Edit Reading Item' : 'Add Reading Item'"
      width="640px"
      destroy-on-close
      class="reading-list__dialog"
    >
      <el-form :model="form" label-width="100px" label-position="right">
        <el-form-item label="Title" required>
          <el-input v-model="form.title" placeholder="e.g. High Output Management" />
        </el-form-item>
        <el-row :gutter="12">
          <el-col :span="8">
            <el-form-item label="Type">
              <el-radio-group v-model="form.type">
                <el-radio-button v-for="t in typeOptions" :key="t.value" :value="t.value">{{ t.labelShort ?? t.label }}</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Status">
              <el-select v-model="form.status" style="width: 100%" @change="onFormStatusChange">
                <el-option v-for="s in statusOptions" :key="s.value" :label="s.label" :value="s.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Priority">
              <el-select v-model="form.priority" clearable placeholder="None" style="width: 100%">
                <el-option v-for="p in priorityOptions" :key="p.value" :label="p.label" :value="p.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="Author">
              <el-input v-model="form.author" placeholder="Optional" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Link">
              <el-input v-model="form.link" placeholder="https://... (optional)" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="Dimension">
              <el-select v-model="form.dimension" clearable placeholder="Select knowledge dimension" style="width: 100%">
                <el-option v-for="d in dimensionOptions" :key="d.value" :label="`${d.icon} ${d.label}`" :value="d.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Category">
              <el-input v-model="form.category" placeholder="e.g. 架构 / 管理 / 认知科学" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="12">
          <el-col :span="8">
            <el-form-item label="RICE Score">
              <el-input-number v-model="form.rice" :min="0" :max="100" :step="5" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Progress %">
              <el-input-number v-model="form.progress" :min="0" :max="100" :step="5" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Linked OKR">
              <el-input v-model="form.okrId" placeholder="e.g. G-001" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="Scheduled">
          <el-date-picker v-model="form.scheduled" type="month" placeholder="Pick target month" value-format="YYYY-MM" style="width: 100%" />
        </el-form-item>

        <el-form-item label="Notes">
          <el-input
            v-model="form.notes"
            type="textarea"
            :rows="4"
            placeholder="So-What test: 1-sentence core insight + concrete action + who/what/by-when…"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="reading-list__dialog-foot">
          <el-tag v-if="form.rice !== undefined && form.rice >= 60" effect="light" type="success">≥ 60 → Promoted to quarterly pipeline</el-tag>
          <span>
            <el-button @click="dialogVisible = false">Cancel</el-button>
            <el-button type="primary" :loading="saving" @click="save">Save</el-button>
          </span>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="readingList">
import { ref, reactive, computed, onMounted, watch, onBeforeUnmount } from "vue";
import { ElMessage } from "element-plus";
import { Search, Plus, Refresh, Upload, Connection, Link } from "@element-plus/icons-vue";
import ProTable from "@/components/ProTable/index.vue";
import { formatRelativeTime as formatRelTime } from "@/utils/datetime";
import type { ColumnProps, ProTableInstance } from "@/components/ProTable/interface";
import {
  getReadingList,
  getReadingListCounts,
  createReadingItem,
  updateReadingItem,
  deleteReadingItem,
  getReadingListBreakdown,
  type ReadingItem,
  type ReadingItemType,
  type ReadingItemStatus,
  type ReadingItemPriority,
  type ReadingDimension,
  type ReadingListBreakdown
} from "@/api/modules/readingListService";
import {
  useReadingListKnowledgeSource,
  type SLOCard,
  type AlertRow,
  type CrossBookInsight,
  type OKRSupportRow,
  type DistillStep,
  type FutureQueueItem,
  type SourceMode
} from "./composables/useReadingListKnowledgeSource";

const proTable = ref<ProTableInstance>();

// ── Knowledge Source (SSOT bridge to YiKnowledge md files) ──
const kb = useReadingListKnowledgeSource();

// ── Sticky bar meta ──
const stickyIcon = "📚";
const stickyTitle = "Reading List";

// ── View mode ──
const viewMode = ref<"card" | "list" | "table">("table");
const dashboardCollapsed = ref(false);

// ── Option maps ──
const typeOptions: Array<{ value: ReadingItemType; label: string; labelShort?: string }> = [
  { value: "article", label: "📄 Article", labelShort: "Article" },
  { value: "book", label: "📘 Book", labelShort: "Book" },
  { value: "paper", label: "📃 Paper", labelShort: "Paper" }
];
const statusOptions: Array<{ value: ReadingItemStatus; label: string }> = [
  { value: "to-read", label: "To read" },
  { value: "reading", label: "Reading" },
  { value: "done", label: "Done" }
];
const priorityOptions: Array<{ value: ReadingItemPriority; label: string }> = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" }
];
const dimensionOptions: Array<{ value: ReadingDimension; label: string; icon: string }> = [
  { value: "strategy", label: "战略 Strategy", icon: "🏛" },
  { value: "management", label: "管理 Management", icon: "🧑‍💼" },
  { value: "engineering", label: "工程 Engineering", icon: "⚙️" },
  { value: "frontend", label: "前端 Frontend", icon: "🎨" },
  { value: "sre", label: "SRE 运维", icon: "🛰" },
  { value: "ai", label: "AI 智能", icon: "🤖" },
  { value: "product", label: "产品 Product", icon: "📋" },
  { value: "cognition", label: "认知 Cognition", icon: "🧠" }
];

function typeLabel(t: ReadingItemType) {
  return typeOptions.find(o => o.value === t)?.label ?? t;
}
function typeIcon(t: ReadingItemType) {
  return t === "book" ? "📘" : t === "paper" ? "📃" : "📄";
}
function statusLabel(s: ReadingItemStatus) {
  return statusOptions.find(o => o.value === s)?.label ?? s;
}
function typeTagType(t: ReadingItemType): "warning" | "primary" | "info" {
  return t === "article" ? "warning" : t === "book" ? "primary" : "info";
}
function statusTagType(s: ReadingItemStatus): "success" | "warning" | "info" {
  return s === "done" ? "success" : s === "reading" ? "warning" : "info";
}
function priorityTagType(p: ReadingItemPriority): "danger" | "warning" | "info" {
  return p === "high" ? "danger" : p === "medium" ? "warning" : "info";
}
function dimensionLabel(d?: ReadingDimension | ""): string {
  if (!d) return "";
  return dimensionOptions.find(o => o.value === d)?.label ?? d;
}
function dimTagType(d?: ReadingDimension): "primary" | "success" | "warning" | "info" | "danger" {
  switch (d) {
    case "strategy": return "danger";
    case "management": return "warning";
    case "engineering": return "primary";
    case "frontend": return "success";
    case "sre": return "info";
    case "ai": return "primary";
    case "product": return "warning";
    case "cognition": return "success";
    default: return "info";
  }
}

// ── RICE helpers ──
function riceTier(score?: number): string {
  if (score === undefined || score === null) return "—";
  if (score >= 80) return "1";
  if (score >= 60) return "2";
  if (score >= 40) return "3";
  return "4";
}
function riceClass(score?: number): string {
  const t = riceTier(score);
  return `reading-list__rice--t${t}`;
}
function riceTagType(score?: number): "danger" | "warning" | "primary" | "info" {
  switch (riceTier(score)) {
    case "1": return "danger";
    case "2": return "warning";
    case "3": return "primary";
    default: return "info";
  }
}
function formatRice(score?: number): string {
  if (score === undefined || score === null) return "—";
  return String(score);
}
function effectiveProgress(row: ReadingItem): number {
  if (typeof row.progress === "number") return Math.min(100, Math.max(0, row.progress));
  if (row.status === "done") return 100;
  if (row.status === "reading") return 50;
  return 0;
}
function progressStatus(row: ReadingItem): "success" | "warning" | "exception" | undefined {
  const p = effectiveProgress(row);
  if (p >= 100) return "success";
  if (p >= 50) return "warning";
  return undefined;
}

// ── Sticky bar summary ──
const _summary = reactive({ total: 0, reading: 0, done: 0 });
const _breakdown = reactive<ReadingListBreakdown>({
  byType: { article: 0, book: 0, paper: 0 },
  byDimension: { strategy: 0, management: 0, engineering: 0, frontend: 0, sre: 0, ai: 0, product: 0, cognition: 0 },
  byPriority: { high: 0, medium: 0, low: 0 },
  byStatus: { "to-read": 0, reading: 0, done: 0 },
  riceBuckets: { tier1: 0, tier2: 0, tier3: 0, tier4: 0 },
  avgRice: 0,
  avgProgress: 0,
  completionPct: 0
});

/** The effective summary used by the UI — follows sourceMode. */
const summary = computed(() => {
  if (kb.sourceMode.value === "kb") return kb.kbSummary.value;
  return _summary;
});
/** The effective breakdown used by the UI — follows sourceMode. */
const EMPTY_BREAKDOWN: ReadingListBreakdown = {
  byType: { article: 0, book: 0, paper: 0 },
  byDimension: { strategy: 0, management: 0, engineering: 0, frontend: 0, sre: 0, ai: 0, product: 0, cognition: 0 },
  byPriority: { high: 0, medium: 0, low: 0 },
  byStatus: { "to-read": 0, reading: 0, done: 0 },
  riceBuckets: { tier1: 0, tier2: 0, tier3: 0, tier4: 0 },
  avgRice: 0,
  avgProgress: 0,
  completionPct: 0
};
const breakdown = computed<ReadingListBreakdown>(() => {
  try {
    if (kb.sourceMode.value === "kb") {
      const bd = kb.kbBreakdown;
      if (bd && bd.byDimension) return bd;
    }
    if (_breakdown && _breakdown.byDimension) return _breakdown;
  } catch { /* ignore */ }
  return EMPTY_BREAKDOWN;
});
const summaryLoading = ref(false);

async function loadSummary() {
  // KB 模式下不需要拉 YiAi DB，跳过远端请求。
  if (kb.sourceMode.value === "kb") {
    summaryLoading.value = false;
    return;
  }
  summaryLoading.value = true;
  try {
    const [counts, bd] = await Promise.all([
      getReadingListCounts(""),
      getReadingListBreakdown("")
    ]);
    _summary.total = counts.total;
    _summary.reading = counts.reading;
    _summary.done = counts.done;
    Object.assign(_breakdown, bd);
    _breakdown.byStatus["to-read"] = Math.max(0, counts.total - counts.reading - counts.done);
  } catch {
    _summary.total = 0;
    _summary.reading = 0;
    _summary.done = 0;
  } finally {
    summaryLoading.value = false;
  }
}

// ── SSOT & Seed ────────────────────────────────────────────────────
function onSourceSwitch(m: SourceMode) {
  kb.setSourceMode(m);
  refreshCurrentView();
  loadSummary();
  if (m === "kb") kb.loadFromKB();
}
async function onSeedDb() {
  try {
    await kb.seedToYiAiDb();
    if (kb.sourceMode.value === "db") {
      refreshCurrentView();
      loadSummary();
    }
  } catch (e) {
    ElMessage.error(errorMessage(e) || "同步失败");
  }
}

// ── Dashboard computed ──
const activeDimensions = computed(() =>
  dimensionOptions.reduce((acc, d) => {
    const v = breakdown.value?.byDimension?.[d.value] ?? 0;
    return acc + (v > 0 ? 1 : 0);
  }, 0)
);
const dimensionCoveragePct = computed(() => Math.round((activeDimensions.value / dimensionOptions.length) * 100));
function dimBarWidth(d: ReadingDimension): string {
  const bd = breakdown.value?.byDimension;
  if (!bd) return "0%";
  const max = Math.max(...dimensionOptions.map(o => bd[o.value] ?? 0), 1);
  const v = bd[d] ?? 0;
  return `${(v / max) * 100}%`;
}
function totalOf(obj: Record<string, number>): number {
  return Object.values(obj).reduce((acc, v) => acc + v, 0);
}
function segWidth(count: number, total: number) {
  if (!total) return { flex: "0 0 0%" };
  return { flex: `${Math.max(1, count)} 1 0%` };
}
function funnelPct(v: number, total: number) {
  if (!total) return "0%";
  return `${Math.max(18, (v / total) * 100)}%`;
}

const riceFilter = ref<"tier1" | "tier2" | "tier3" | "tier4" | "">("");
const riceFilterLabel = computed(() => {
  switch (riceFilter.value) {
    case "tier1": return "≥ 80";
    case "tier2": return "60 – 79";
    case "tier3": return "40 – 59";
    case "tier4": return "< 40";
    default: return "";
  }
});
function toggleRiceFilter(t: "tier1" | "tier2" | "tier3" | "tier4") {
  riceFilter.value = riceFilter.value === t ? "" : t;
  onFilterChange();
}

// ── ProTable columns ──
const columns: ColumnProps<ReadingItem>[] = [
  { prop: "title", label: "Title", minWidth: 360, showOverflowTooltip: true },
  {
    prop: "type",
    label: "Type",
    width: 100,
    tag: true,
    enum: [
      { value: "article", label: "Article", tagType: "warning" },
      { value: "book", label: "Book", tagType: "primary" },
      { value: "paper", label: "Paper", tagType: "info" }
    ]
  },
  { prop: "author", label: "Author", width: 140, showOverflowTooltip: true },
  {
    prop: "status",
    label: "Status",
    width: 110,
    tag: true,
    enum: [
      { value: "to-read", label: "To read", tagType: "info" },
      { value: "reading", label: "Reading", tagType: "warning" },
      { value: "done", label: "Done", tagType: "success" }
    ]
  },
  {
    prop: "priority",
    label: "Priority",
    width: 100,
    tag: true,
    enum: [
      { value: "high", label: "High", tagType: "danger" },
      { value: "medium", label: "Medium", tagType: "warning" },
      { value: "low", label: "Low", tagType: "info" }
    ]
  },
  { prop: "rice", label: "RICE", width: 140 },
  { prop: "progress", label: "Progress", width: 160 },
  { prop: "updatedTime", label: "Updated", width: 120 },
  { prop: "operation", label: "Actions", width: 170, fixed: "right" }
];

// ── ProTable API binding ──
const initParam = computed(() => ({}));

const dataCallback = (data: any) => ({
  list: data.list ?? [],
  total: data.total ?? 0
});

function riceRange(): { riceMin?: number; riceMax?: number } {
  switch (riceFilter.value) {
    case "tier1": return { riceMin: 80 };
    case "tier2": return { riceMin: 60, riceMax: 79 };
    case "tier3": return { riceMin: 40, riceMax: 59 };
    case "tier4": return { riceMax: 39 };
    default: return {};
  }
}

async function getTableList(params: any) {
  // KB 模式：本地分页
  if (kb.sourceMode.value === "kb") {
    const { riceMin, riceMax } = riceRange();
    const filtered = kb.kbItems.filter(it => {
      if (search.value && !matchSearch(it, search.value)) return false;
      if (typeFilter.value && it.type !== typeFilter.value) return false;
      if (statusFilter.value && it.status !== statusFilter.value) return false;
      if (priorityFilter.value && it.priority !== priorityFilter.value) return false;
      if (dimensionFilter.value && it.dimension !== dimensionFilter.value) return false;
      if (typeof riceMin === "number" && (it.rice === undefined || it.rice < riceMin)) return false;
      if (typeof riceMax === "number" && (it.rice === undefined || it.rice > riceMax)) return false;
      return true;
    });
    filtered.sort((a, b) => String(b.updatedTime ?? "").localeCompare(String(a.updatedTime ?? "")));
    const pageNum: number = params.pageNum ?? 1;
    const pageSize: number = params.pageSize ?? 20;
    const total = filtered.length;
    const list = filtered.slice((pageNum - 1) * pageSize, pageNum * pageSize);
    return { code: 0 as const, message: "ok", data: { list, total, pageNum, pageSize } };
  }
  const { riceMin, riceMax } = riceRange();
  const res = await getReadingList({
    search: search.value || undefined,
    type: (typeFilter.value || undefined) as ReadingItemType | undefined,
    status: (statusFilter.value || undefined) as ReadingItemStatus | undefined,
    priority: (priorityFilter.value || undefined) as ReadingItemPriority | undefined,
    dimension: (dimensionFilter.value || undefined) as ReadingDimension | undefined,
    riceMin,
    riceMax,
    pageNum: params.pageNum,
    pageSize: params.pageSize
  });
  return res;
}

// ── Flat data (card/list views) ──
const flatData = ref<ReadingItem[]>([]);
const flatLoading = ref(false);

async function loadFlatData() {
  // KB 模式：在本地 items 上应用过滤器，无需远端请求
  if (kb.sourceMode.value === "kb") {
    flatLoading.value = true;
    try {
      const { riceMin, riceMax } = riceRange();
      flatData.value = kb.kbItems.filter(it => {
        if (search.value && !matchSearch(it, search.value)) return false;
        if (typeFilter.value && it.type !== typeFilter.value) return false;
        if (statusFilter.value && it.status !== statusFilter.value) return false;
        if (priorityFilter.value && it.priority !== priorityFilter.value) return false;
        if (dimensionFilter.value && it.dimension !== dimensionFilter.value) return false;
        if (typeof riceMin === "number" && (it.rice === undefined || it.rice < riceMin)) return false;
        if (typeof riceMax === "number" && (it.rice === undefined || it.rice > riceMax)) return false;
        return true;
      }).sort((a, b) => String(b.updatedTime ?? "").localeCompare(String(a.updatedTime ?? "")));
    } finally {
      flatLoading.value = false;
    }
    return;
  }
  flatLoading.value = true;
  try {
    const { riceMin, riceMax } = riceRange();
    const res = await getReadingList({
      search: search.value || undefined,
      type: (typeFilter.value || undefined) as ReadingItemType | undefined,
      status: (statusFilter.value || undefined) as ReadingItemStatus | undefined,
      priority: (priorityFilter.value || undefined) as ReadingItemPriority | undefined,
      dimension: (dimensionFilter.value || undefined) as ReadingDimension | undefined,
      riceMin,
      riceMax,
      pageNum: 1,
      pageSize: 500,
      orderBy: "updatedTime",
      orderType: "desc"
    });
    flatData.value = (res.data as any)?.list ?? [];
  } catch {
    flatData.value = [];
  } finally {
    flatLoading.value = false;
  }
}

function matchSearch(it: ReadingItem, q: string): boolean {
  const needle = q.toLowerCase();
  return (
    it.title.toLowerCase().includes(needle) ||
    (it.author ?? "").toLowerCase().includes(needle) ||
    (it.notes ?? "").toLowerCase().includes(needle) ||
    (it.category ?? "").toLowerCase().includes(needle)
  );
}

// ── Filter state ──
const activeTab = ref<"all" | "reading" | "done">("all");
const search = ref("");
const typeFilter = ref<ReadingItemType | "">("");
const statusFilter = ref<ReadingItemStatus | "">("");
const priorityFilter = ref<ReadingItemPriority | "">("");
const dimensionFilter = ref<ReadingDimension | "">("");

const sectionTitle = computed(() => {
  switch (activeTab.value) {
    case "reading": return "📅 阅读中 In Progress";
    case "done": return "✅ 已完成 Completed";
    default: return "📖 阅读列表 All Reading";
  }
});
const sectionTotal = computed(() => {
  switch (activeTab.value) {
    case "reading": return summary.reading;
    case "done": return summary.done;
    default: return summary.total;
  }
});
const displayCount = computed(() => {
  if (viewMode.value === "table") return proTable.value?.pageable?.total ?? 0;
  return flatData.value.length;
});

function gotoTab(tab: "all" | "reading" | "done") {
  activeTab.value = tab;
  onTabChange(tab);
}
function onDimensionToggle(value: ReadingDimension) {
  dimensionFilter.value = dimensionFilter.value === value ? "" : value;
  onFilterChange();
}
function quickPriority(p: ReadingItemPriority) {
  priorityFilter.value = priorityFilter.value === p ? "" : p;
  if (activeTab.value !== "all") {
    activeTab.value = "all";
    statusFilter.value = "";
  }
  onFilterChange();
}
function clearAllFilters() {
  search.value = "";
  typeFilter.value = "";
  statusFilter.value = activeTab.value === "reading" ? "reading" : activeTab.value === "done" ? "done" : "";
  priorityFilter.value = "";
  dimensionFilter.value = "";
  riceFilter.value = "";
  refreshCurrentView();
}
function onTabChange(tab: string) {
  search.value = "";
  typeFilter.value = "";
  priorityFilter.value = "";
  dimensionFilter.value = "";
  riceFilter.value = "";
  if (tab === "reading") {
    statusFilter.value = "reading";
  } else if (tab === "done") {
    statusFilter.value = "done";
  } else {
    statusFilter.value = "";
  }
  refreshCurrentView();
}

let filterTimer: ReturnType<typeof setTimeout> | null = null;
function onFilterChange() {
  if (filterTimer) clearTimeout(filterTimer);
  filterTimer = setTimeout(() => refreshCurrentView(), 250);
}

function refreshCurrentView() {
  if (viewMode.value === "table") {
    proTable.value?.getTableList();
  } else {
    loadFlatData();
  }
}
function onViewModeChange() {
  refreshCurrentView();
}

function handleRefresh() {
  refreshCurrentView();
  loadSummary();
}

// ── Dialog ──
const dialogVisible = ref(false);
const editing = ref<ReadingItem | null>(null);
const saving = ref(false);
const form = reactive<{
  title: string;
  type: ReadingItemType;
  author: string;
  link: string;
  status: ReadingItemStatus;
  priority: ReadingItemPriority | "";
  notes: string;
  dimension: ReadingDimension | "";
  category: string;
  rice: number | undefined;
  progress: number | undefined;
  okrId: string;
  scheduled: string | undefined;
}>({
  title: "",
  type: "article",
  author: "",
  link: "",
  status: "to-read",
  priority: "",
  notes: "",
  dimension: "",
  category: "",
  rice: undefined,
  progress: undefined,
  okrId: "",
  scheduled: undefined
});

function openDialog(row?: ReadingItem) {
  editing.value = row || null;
  if (row) {
    form.title = row.title || "";
    form.type = row.type || "article";
    form.author = row.author || "";
    form.link = row.link || "";
    form.status = row.status || "to-read";
    form.priority = row.priority || "";
    form.notes = row.notes || "";
    form.dimension = row.dimension || "";
    form.category = row.category || "";
    form.rice = row.rice;
    form.progress = row.progress;
    form.okrId = row.okrId || "";
    form.scheduled = row.scheduled;
  } else {
    form.title = "";
    form.type = "article";
    form.author = "";
    form.link = "";
    form.status = "to-read";
    form.priority = "";
    form.notes = "";
    form.dimension = "";
    form.category = "";
    form.rice = undefined;
    form.progress = 0;
    form.okrId = "";
    form.scheduled = undefined;
  }
  dialogVisible.value = true;
}

function onFormStatusChange(s: ReadingItemStatus) {
  if (s === "done" && (form.progress ?? 0) < 100) form.progress = 100;
  else if (s === "reading" && (form.progress ?? 0) === 0) form.progress = 25;
}

async function save() {
  if (!form.title.trim()) {
    ElMessage.warning("Title is required");
    return;
  }
  saving.value = true;
  try {
    const payload: Partial<ReadingItem> = {
      title: form.title.trim(),
      type: form.type,
      author: form.author.trim() || undefined,
      link: form.link.trim() || undefined,
      status: form.status,
      priority: form.priority || undefined,
      notes: form.notes.trim() || undefined,
      dimension: form.dimension || undefined,
      category: form.category.trim() || undefined,
      rice: form.rice,
      progress: form.progress,
      okrId: form.okrId.trim() || undefined,
      scheduled: form.scheduled
    };
    if (editing.value?.key) {
      await updateReadingItem(editing.value.key, payload);
      ElMessage.success("Item updated");
    } else {
      await createReadingItem(payload as Omit<ReadingItem, "key" | "createdTime" | "updatedTime">);
      ElMessage.success("Item added");
    }
    dialogVisible.value = false;
    refreshCurrentView();
    loadSummary();
  } catch (e) {
    ElMessage.error(errorMessage(e) || "Failed to save item");
  } finally {
    saving.value = false;
  }
}

async function markDone(row: ReadingItem) {
  if (!row.key) return;
  try {
    await updateReadingItem(row.key, { status: "done", progress: 100 });
    ElMessage.success("Marked as done");
    refreshCurrentView();
    loadSummary();
  } catch (e) {
    ElMessage.error(errorMessage(e) || "Failed to update status");
  }
}

async function removeItem(row: ReadingItem) {
  if (!row.key) return;
  try {
    await deleteReadingItem(row.key);
    ElMessage.success("Item removed");
    refreshCurrentView();
    loadSummary();
  } catch (e) {
    ElMessage.error(errorMessage(e) || "Failed to remove item");
  }
}

// ── Helpers ──
function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

function oneLiner(notes?: string): string {
  if (!notes) return "";
  const first = notes.split("\n").find(l => l.trim()) ?? "";
  return first.trim();
}

const relativeTimeCache = new Map<string, string>();
function formatRelativeTime(raw?: string): string {
  if (!raw) return "-";
  const cached = relativeTimeCache.get(raw);
  if (cached) return cached;
  const result = formatRelTime(raw);
  relativeTimeCache.set(raw, result);
  return result;
}

// ── Keyboard shortcuts ──
function onGlobalKeydown(e: KeyboardEvent) {
  const mod = e.ctrlKey || e.metaKey;
  if (!mod && !e.altKey) return;
  const isMacLike = navigator.platform.toUpperCase().includes("MAC");
  const k = e.key.toLowerCase();

  // ⌘/Ctrl + N → new item
  if (mod && k === "n") {
    e.preventDefault();
    openDialog();
    return;
  }
  // ⌘/Ctrl + R → refresh
  if (!isMacLike && mod && k === "r") return; // let browser reload on win/linux
  // ⌘/Ctrl + D → toggle dashboard
  if (mod && k === "d") {
    e.preventDefault();
    dashboardCollapsed.value = !dashboardCollapsed.value;
    return;
  }
  // ⌘/Ctrl + K → focus search
  if (mod && k === "k") {
    e.preventDefault();
    const el = document.querySelector<HTMLInputElement>(".reading-list__toolbar .el-input__inner");
    if (el) {
      el.focus();
      el.select();
    }
    return;
  }
  // Alt + 1/2/3 → tab switch
  if (e.altKey && (k === "1" || k === "2" || k === "3")) {
    e.preventDefault();
    if (k === "1") gotoTab("all");
    else if (k === "2") gotoTab("reading");
    else gotoTab("done");
  }
}

watch(
  () => viewMode.value,
  mode => {
    if (mode === "table") {
      proTable.value?.getTableList();
    } else {
      loadFlatData();
    }
  }
);

// ── Extended dashboard helpers ──────────────────────────────────

function lightEmoji(light: SLOLight): string {
  return light === "danger" ? "🔴" : light === "warning" ? "🟡" : "🟢";
}
function stars(n: number): string {
  const s = Math.max(1, Math.min(5, Math.round(n)));
  return "★".repeat(s) + "☆".repeat(Math.max(0, 5 - s));
}

/** Group OKR support rows by Goal (001/002/003) for the §5 panel. */
const groupedOkrRows = computed<
  Array<{ goalId: string; goalTitle: string; rows: OKRSupportRow[] }>
>(() => {
  const map = new Map<string, { goalId: string; goalTitle: string; rows: OKRSupportRow[] }>();
  for (const r of kb.okrRows) {
    if (!map.has(r.goalId)) {
      map.set(r.goalId, { goalId: r.goalId, goalTitle: r.goalTitle, rows: [] });
    }
    map.get(r.goalId)!.rows.push(r);
  }
  return Array.from(map.values());
});

/** §7 Future Queue 三级分组（H / M / L）。*/
const queueBuckets = computed<
  Array<{ key: "high" | "medium" | "low"; label: string; rows: FutureQueueItem[] }>
>(() => {
  return [
    { key: "high",   label: "🔥 H 高优先级（RICE ≥ 75）", rows: kb.futureQueue.filter(q => q.bucket === "high") },
    { key: "medium", label: "🟠 M 中优先级（60 ≤ RICE < 75）", rows: kb.futureQueue.filter(q => q.bucket === "medium") },
    { key: "low",    label: "🟢 L 低优先级（RICE ≥ 60，非核心）", rows: kb.futureQueue.filter(q => q.bucket === "low") }
  ];
});

/** Placeholder anchor jump handler — routes to knowledge preview dialog in the YiVad shell. */
function openKnowledgePreview(relPath: string) {
  const base = "/#/knowledge/preview?path=executive/reading-list/";
  const url = (relPath.startsWith("../") || relPath.startsWith("../../"))
    ? base + encodeURIComponent(relPath)
    : "/#/knowledge/preview?path=" + encodeURIComponent(relPath);
  window.open(url, "_blank", "noopener,noreferrer,width=960,height=720");
  ElMessage.info("打开锚点预览：" + relPath);
}

// Periodically refresh relative-time cache labels (every 30s)
let refreshInterval: ReturnType<typeof setInterval> | null = null;
onMounted(async () => {
  if (proTable.value) {
    proTable.value.pageable.pageSize = 20;
  }
  await kb.loadFromKB();
  loadSummary();
  refreshInterval = setInterval(() => {
    relativeTimeCache.clear();
  }, 30_000);
});
onBeforeUnmount(() => {
  if (refreshInterval) clearInterval(refreshInterval);
  if (filterTimer) clearTimeout(filterTimer);
});
</script>

<style scoped lang="scss">
@use "./styles/readingList.scss";
</style>

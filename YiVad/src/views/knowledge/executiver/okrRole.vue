<template>
  <div class="okr-role">
    <el-breadcrumb separator="/" class="okr-role__breadcrumb">
      <el-breadcrumb-item :to="{ path: '/home/index' }">Home</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/executiver/okr' }">OKR Dashboard</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/executiver/rss' }">RSS</el-breadcrumb-item>
      <el-breadcrumb-item>{{ role.name }} OKR</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- ═══ Sticky Header Bar ═══ -->
    <div class="okr-role__sticky-bar">
      <div class="okr-role__sticky-top">
        <div class="okr-role__sticky-left">
          <el-button text class="okr-role__back-btn" @click="$router.push('/executiver/okr')">
            <el-icon><ArrowLeft /></el-icon>
          </el-button>
          <span class="okr-role__sticky-icon">{{ role.icon }}</span>
          <div class="okr-role__sticky-info">
            <h1 class="okr-role__sticky-name">{{ role.name }} OKR</h1>
            <span class="okr-role__sticky-dir">{{ role.dir }}</span>
          </div>
        </div>
        <div class="okr-role__sticky-center">
          <el-radio-group v-model="selectedPeriod" size="small">
            <el-radio-button value="q1">Q1</el-radio-button>
            <el-radio-button value="q2">Q2</el-radio-button>
            <el-radio-button value="q3">Q3</el-radio-button>
            <el-radio-button value="q4">Q4</el-radio-button>
            <el-radio-button value="annual">2026</el-radio-button>
          </el-radio-group>
        </div>
        <div class="okr-role__sticky-right">
          <div class="okr-role__stat-pill">
            <span class="okr-role__stat-pill-value">{{ filteredGoals.length }}</span>
            <span class="okr-role__stat-pill-label">Goals</span>
          </div>
          <div class="okr-role__stat-pill">
            <span class="okr-role__stat-pill-value">{{ periodMetricCount }}</span>
            <span class="okr-role__stat-pill-label">Metrics</span>
          </div>
          <div class="okr-role__stat-pill okr-role__stat-pill--accent">
            <span class="okr-role__stat-pill-value">{{ periodAvgProgress }}%</span>
            <span class="okr-role__stat-pill-label">Progress</span>
          </div>
        </div>
      </div>
      <div class="okr-role__sticky-bottom">
        <p class="okr-role__sticky-desc">{{ role.description }}</p>
        <div class="okr-role__sticky-tags">
          <el-tag v-for="p in role.projects" :key="p" size="small" :type="projectTagType(p)">{{ p }}</el-tag>
          <el-tag v-for="c in role.categories" :key="c" size="small" effect="plain" round>{{ c }}</el-tag>
        </div>
      </div>
    </div>

    <section class="okr-role__section">
      <div class="okr-role__section-head">
        <h2>Goals & Metrics</h2>
        <span class="okr-role__section-count">{{ filteredGoals.length }} goals</span>
      </div>
      <p class="okr-role__section-desc">Goals cascade from org strategy. Each goal links to measurable metrics that track progress toward the objective. Click a goal or metric to drill into details.</p>

      <div v-if="periodMetrics.length" class="okr-role__metrics-grid">
        <div v-for="m in periodMetrics" :key="m.id" :id="`metric-${m.id}`" class="okr-role__metric-card" @click="scrollToMetric(m.id)">
          <div class="okr-role__metric-card-top">
            <span class="okr-role__metric-card-icon">{{ m.icon }}</span>
            <span class="okr-role__metric-card-trend" :class="m.trend === 'up' ? 'okr-role__metric-card-trend--up' : m.trend === 'down' ? 'okr-role__metric-card-trend--down' : ''">
              {{ m.trend === 'up' ? '↑' : m.trend === 'down' ? '↓' : '→' }}
            </span>
          </div>
          <span class="okr-role__metric-card-name">{{ m.name }}</span>
          <div class="okr-role__metric-card-values">
            <span class="okr-role__metric-card-current">{{ m.current }}{{ m.unit }}</span>
            <span class="okr-role__metric-card-target">/ {{ m.target }}{{ m.unit }}</span>
          </div>
          <el-progress :percentage="m.progress" :status="krStatus(m.progress)" :stroke-width="4" />
        </div>
      </div>
      <div v-else-if="filteredGoals.length" class="okr-role__metrics-empty">
        <span class="okr-role__metrics-empty-icon">📊</span>
        <span class="okr-role__metrics-empty-text">No metrics linked to the current goals. Metrics are linked to goals via the goal-metric mapping.</span>
      </div>

      <div class="okr-role__table-toolbar">
        <el-input v-model="searchQuery" placeholder="Search goals by title, description, or ID..." clearable :prefix-icon="Search" size="default" class="okr-role__search" />
        <div class="okr-role__status-chips">
          <el-tag v-for="opt in statusOptions" :key="opt.value" :type="statusFilter === opt.value ? 'primary' : 'info'" :effect="statusFilter === opt.value ? 'dark' : 'plain'" size="default" class="okr-role__status-chip" @click="statusFilter = opt.value">
            {{ opt.label }}
          </el-tag>
        </div>
        <el-button v-if="hasActiveFilters" text size="small" type="warning" :icon="CircleClose" @click="clearFilters" class="okr-role__clear-btn">
          Clear
        </el-button>
      </div>
      <el-table v-if="filteredGoals.length" :data="filteredGoals" stripe border style="width: 100%" row-key="id" :expand-row-keys="expandedGoalIds" @expand-change="onExpandChange" :default-sort="{ prop: 'id', order: 'ascending' }">
        <el-table-column type="expand">
          <template #default="{ row }">
            <div class="okr-role__expand">
              <div v-if="getGoalMetrics(row.id).length" class="okr-role__expand-metrics">
                <h4 class="okr-role__expand-title">Related Metrics ({{ getGoalMetrics(row.id).length }})</h4>
                <el-table :data="getGoalMetrics(row.id)" size="small" border style="width: 100%">
                  <el-table-column prop="id" label="Metric ID" width="130">
                    <template #default="{ row: mr }">
                      <code class="okr-role__table-id">{{ mr.id }}</code>
                    </template>
                  </el-table-column>
                  <el-table-column prop="name" label="Metric" min-width="220">
                    <template #default="{ row: mr }">
                      <div class="okr-role__table-item">
                        <span class="okr-role__table-icon">{{ mr.icon }}</span>
                        <div>
                          <span class="okr-role__table-title okr-role__table-title--link" @click="scrollToMetric(mr.id)">{{ mr.name }}</span>
                          <p class="okr-role__table-desc">{{ mr.description }}</p>
                        </div>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column prop="category" label="Category" width="120">
                    <template #default="{ row: mr }">
                      <el-tag size="small" effect="plain">{{ mr.category }}</el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="framework" label="Framework" width="110" />
                  <el-table-column label="Current" width="110" sortable prop="current">
                    <template #default="{ row: mr }">
                      <span class="okr-role__table-value">{{ mr.current }}{{ mr.unit }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="Target" width="100" sortable prop="target">
                    <template #default="{ row: mr }">
                      <span class="okr-role__table-target">{{ mr.target }}{{ mr.unit }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="Progress" width="150">
                    <template #default="{ row: mr }">
                      <div class="okr-role__table-progress">
                        <el-progress :percentage="mr.progress" :status="krStatus(mr.progress)" :stroke-width="6" />
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column label="Trend" width="80">
                    <template #default="{ row: mr }">
                      <el-tag :type="mr.trend === 'up' ? 'success' : mr.trend === 'down' ? 'danger' : 'info'" size="small">
                        {{ mr.trend === 'up' ? '↑' : mr.trend === 'down' ? '↓' : '→' }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="Actions" width="100" fixed="right">
                    <template #default="{ row: mr }">
                      <el-button size="small" type="primary" link @click="scrollToMetric(mr.id)">Details</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
              <div v-else class="okr-role__expand-empty">
                No related metrics for this goal.
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="id" label="Goal ID" width="120" sortable>
          <template #default="{ row }">
            <code class="okr-role__table-id">{{ row.id }}</code>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="Goal" min-width="240" sortable>
          <template #default="{ row }">
            <div class="okr-role__table-item">
              <span class="okr-role__table-icon">{{ row.icon }}</span>
              <div>
                <span class="okr-role__table-title okr-role__table-title--link" @click="toggleGoalExpand(row as GoalItem)">{{ row.title }}</span>
                <p class="okr-role__table-desc">{{ row.description }}</p>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="Status" width="100" sortable>
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="period" label="Period" width="120" sortable />
        <el-table-column prop="owner" label="Owner" width="140" />
        <el-table-column prop="project" label="Project" width="100">
          <template #default="{ row }">
            <el-tag :type="projectTagType(row.project)" size="small">{{ row.project }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Key Results" min-width="300">
          <template #default="{ row }">
            <div class="okr-role__table-krs">
              <div v-for="(kr, i) in row.keyResults" :key="i" class="okr-role__table-kr">
                <span class="okr-role__table-kr-num">KR{{ Number(i) + 1 }}</span>
                <span class="okr-role__table-kr-text">{{ kr.text }}</span>
                <el-progress :percentage="kr.progress" :status="krStatus(kr.progress)" :stroke-width="4" style="width: 60px; min-width: 60px" />
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="Avg" width="70">
          <template #default="{ row }">
            <el-progress :percentage="krAvg(row as GoalItem)" :status="krStatus(krAvg(row as GoalItem))" :stroke-width="6" :show-text="true" />
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="120" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="toggleGoalExpand(row as GoalItem)">Details</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div v-else class="okr-role__empty">
        <div class="okr-role__empty-icon">🔍</div>
        <h3 class="okr-role__empty-title">No goals match your filters</h3>
        <p class="okr-role__empty-desc">Try adjusting the search query or status filter, or switch to a different period.</p>
        <el-button type="primary" size="small" @click="clearFilters">Clear Filters</el-button>
      </div>
    </section>

    <el-divider />

    <section class="okr-role__section">
      <div class="okr-role__section-head">
        <h2>Daily Standup</h2>
        <span class="okr-role__mood-tag" :class="`okr-role__mood-tag--${dailyData.moodType}`">
          <span class="okr-role__mood-dot"></span>
          {{ dailyData.mood }}
        </span>
        <span class="okr-role__section-date">2026-08-14 · Thursday</span>
        <el-button text size="small" type="primary" class="okr-role__copy-btn" @click="copyDailyStandup">Copy</el-button>
      </div>
      <p class="okr-role__section-desc">Today's priorities and yesterday's results for the {{ role.name }} role.</p>

      <div class="okr-role__daily-grid">
        <div class="okr-role__daily-card okr-role__daily-card--yesterday">
          <div class="okr-role__daily-card-head">
            <span class="okr-role__daily-card-icon">📋</span>
            <span class="okr-role__daily-card-label">Yesterday</span>
          </div>
          <ul class="okr-role__daily-card-list">
            <li v-for="(y, i) in dailyData.yesterday" :key="'y'+i">{{ y }}</li>
          </ul>
        </div>
        <div class="okr-role__daily-card okr-role__daily-card--today">
          <div class="okr-role__daily-card-head">
            <span class="okr-role__daily-card-icon">🎯</span>
            <span class="okr-role__daily-card-label">Today's Top 3</span>
            <span class="okr-role__daily-card-progress">{{ todayDoneCount }}/{{ todayTotal }}</span>
          </div>
          <el-progress :percentage="todayTotal ? Math.round(todayDoneCount / todayTotal * 100) : 0" :stroke-width="3" :show-text="false" class="okr-role__today-progress-bar" />
          <ol class="okr-role__daily-card-list okr-role__daily-card-list--numbered">
            <li v-for="(t, i) in dailyData.today" :key="'t'+i" :class="{ 'okr-role__today-item--done': todayDone.has(i) }" @click="!isEditing('today', i) && toggleTodayItem(i)">
              <template v-if="isEditing('today', i)">
                <el-input v-model="editingText" size="small" class="okr-role__inline-input" @keyup.enter="saveEdit()" @keyup.escape="cancelEdit()" @blur="saveEdit()" :autofocus="true" @click.stop />
              </template>
              <template v-else>
                <span class="okr-role__today-item-text" @dblclick.stop="startEdit('today', i)">{{ t }}</span>
                <span v-if="todayDone.has(i)" class="okr-role__today-item-check">✓</span>
              </template>
            </li>
          </ol>
        </div>
        <div v-if="dailyData.blocker" class="okr-role__daily-card okr-role__daily-card--blocker">
          <div class="okr-role__daily-card-head">
            <span class="okr-role__daily-card-icon">🚧</span>
            <span class="okr-role__daily-card-label">Blocker</span>
          </div>
          <p class="okr-role__daily-card-blocker">{{ dailyData.blocker }}</p>
        </div>
      </div>

      <div class="okr-role__focus-timer">
        <div class="okr-role__focus-timer-ring">
          <svg viewBox="0 0 36 36">
            <path class="okr-role__focus-timer-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            <path class="okr-role__focus-timer-fg" :stroke-dasharray="`${timerProgress}, 100`" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
          </svg>
          <span class="okr-role__focus-timer-text">{{ timerDisplay }}</span>
        </div>
        <div class="okr-role__focus-timer-info">
          <span class="okr-role__focus-timer-label">Focus Timer</span>
          <span class="okr-role__focus-timer-hint">25 min Pomodoro</span>
        </div>
        <div class="okr-role__focus-timer-actions">
          <el-button v-if="!timerRunning" size="small" type="primary" :icon="VideoPlay" @click="startTimer">Start</el-button>
          <el-button v-else size="small" type="warning" :icon="VideoPause" @click="pauseTimer">Pause</el-button>
          <el-button size="small" :icon="RefreshRight" @click="resetTimer" :disabled="timerRemaining === FOCUS_DURATION && !timerRunning">Reset</el-button>
        </div>
      </div>

      <h3 class="okr-role__subsection-title">Daily Checklist</h3>
      <div class="okr-role__checklist-wrap">
        <div class="okr-role__checklist-progress">
          <div class="okr-role__progress-ring" :style="{ '--pct': dailyDonePercent }">
            <svg viewBox="0 0 36 36">
              <path class="okr-role__progress-ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path class="okr-role__progress-ring-fg" :stroke-dasharray="`${dailyDonePercent}, 100`" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <span class="okr-role__progress-ring-text">{{ dailyDonePercent }}%</span>
          </div>
          <span class="okr-role__progress-ring-label">{{ dailyDoneCount }}/{{ dailyChecklist.length }} done</span>
          <el-button text size="small" type="primary" class="okr-role__checklist-complete-all" @click="completeAllChecklist">
            {{ dailyChecklist.every(i => i.done) ? 'Undo All' : 'Complete All' }}
          </el-button>
        </div>
        <div class="okr-role__checklist">
          <div v-for="item in dailyChecklist" :key="item.id" class="okr-role__checklist-item" :class="{ 'okr-role__checklist-item--done': item.done }">
            <el-checkbox v-model="item.done" />
            <div class="okr-role__checklist-item-body">
              <span class="okr-role__checklist-item-text">{{ item.text }}</span>
              <span v-if="item.value" class="okr-role__checklist-item-value">{{ item.value }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <el-divider />

    <section class="okr-role__section">
      <div class="okr-role__section-head">
        <h2>Weekly Report</h2>
        <el-tag size="small" type="info">Week 33 · 2026-08-11 → 2026-08-15</el-tag>
        <el-tag size="small" :type="weeklyData.statusType">{{ weeklyData.status }}</el-tag>
        <el-button text size="small" type="primary" class="okr-role__copy-btn" @click="copyWeeklyReport">Copy Text</el-button>
        <el-button text size="small" type="success" class="okr-role__copy-btn" @click="copyWeeklyReportMarkdown">Copy MD</el-button>
      </div>
      <p class="okr-role__section-desc">Weekly summary of accomplishments, blockers, decisions, and next-week priorities for the {{ role.name }} role.</p>

      <div class="okr-role__weekly-grid">
        <div class="okr-role__weekly-card okr-role__weekly-card--done" :class="{ 'okr-role__weekly-card--collapsed': collapsedWeeklySections.has('done') }">
          <div class="okr-role__weekly-card-head" @click="toggleWeeklySection('done')">
            <span class="okr-role__weekly-card-icon">✅</span>
            <span class="okr-role__weekly-card-label">Accomplishments</span>
            <span class="okr-role__weekly-card-count">{{ weeklyData.done.length }}</span>
            <span class="okr-role__weekly-card-toggle">{{ collapsedWeeklySections.has('done') ? '▸' : '▾' }}</span>
          </div>
          <div class="okr-role__weekly-card-body" :class="{ 'okr-role__weekly-card-body--collapsed': collapsedWeeklySections.has('done') }">
            <ul class="okr-role__weekly-card-list">
              <li v-for="(d, i) in weeklyData.done" :key="'d'+i" class="okr-role__weekly-card-item">
                <template v-if="isEditing('weekly', i, 'done')">
                  <el-input v-model="editingText" size="small" class="okr-role__inline-input" @keyup.enter="saveEdit()" @keyup.escape="cancelEdit()" @blur="saveEdit()" :autofocus="true" @click.stop />
                </template>
                <template v-else>
                  <span @dblclick.stop="startEdit('weekly', i, 'done')">{{ d }}</span>
                  <el-button text size="small" type="primary" class="okr-role__weekly-card-copy" @click.stop="copyWeeklyItem(d)">Copy</el-button>
                </template>
              </li>
            </ul>
          </div>
        </div>
        <div class="okr-role__weekly-card okr-role__weekly-card--blockers" :class="{ 'okr-role__weekly-card--collapsed': collapsedWeeklySections.has('blockers') }">
          <div class="okr-role__weekly-card-head" @click="toggleWeeklySection('blockers')">
            <span class="okr-role__weekly-card-icon">🚧</span>
            <span class="okr-role__weekly-card-label">Blockers</span>
            <span class="okr-role__weekly-card-count">{{ weeklyData.blockers.length }}</span>
            <span class="okr-role__weekly-card-toggle">{{ collapsedWeeklySections.has('blockers') ? '▸' : '▾' }}</span>
          </div>
          <div class="okr-role__weekly-card-body" :class="{ 'okr-role__weekly-card-body--collapsed': collapsedWeeklySections.has('blockers') }">
            <ul v-if="weeklyData.blockers.length" class="okr-role__weekly-card-list">
              <li v-for="(b, i) in weeklyData.blockers" :key="'b'+i" class="okr-role__weekly-card-item">
                <template v-if="isEditing('weekly', i, 'blockers')">
                  <el-input v-model="editingText" size="small" class="okr-role__inline-input" @keyup.enter="saveEdit()" @keyup.escape="cancelEdit()" @blur="saveEdit()" :autofocus="true" @click.stop />
                </template>
                <template v-else>
                  <span @dblclick.stop="startEdit('weekly', i, 'blockers')">{{ b }}</span>
                  <el-button text size="small" type="danger" class="okr-role__weekly-card-copy" @click.stop="copyWeeklyItem(b)">Copy</el-button>
                </template>
              </li>
            </ul>
            <span v-else class="okr-role__weekly-card-none">No blockers this week.</span>
          </div>
        </div>
        <div class="okr-role__weekly-card okr-role__weekly-card--next" :class="{ 'okr-role__weekly-card--collapsed': collapsedWeeklySections.has('next') }">
          <div class="okr-role__weekly-card-head" @click="toggleWeeklySection('next')">
            <span class="okr-role__weekly-card-icon">📅</span>
            <span class="okr-role__weekly-card-label">Next Week</span>
            <span class="okr-role__weekly-card-count">{{ weeklyData.nextWeek.length }}</span>
            <span class="okr-role__weekly-card-toggle">{{ collapsedWeeklySections.has('next') ? '▸' : '▾' }}</span>
          </div>
          <div class="okr-role__weekly-card-body" :class="{ 'okr-role__weekly-card-body--collapsed': collapsedWeeklySections.has('next') }">
            <ul class="okr-role__weekly-card-list">
              <li v-for="(n, i) in weeklyData.nextWeek" :key="'n'+i" class="okr-role__weekly-card-item">
                <template v-if="isEditing('weekly', i, 'next')">
                  <el-input v-model="editingText" size="small" class="okr-role__inline-input" @keyup.enter="saveEdit()" @keyup.escape="cancelEdit()" @blur="saveEdit()" :autofocus="true" @click.stop />
                </template>
                <template v-else>
                  <span @dblclick.stop="startEdit('weekly', i, 'next')">{{ n }}</span>
                  <el-button text size="small" type="primary" class="okr-role__weekly-card-copy" @click.stop="copyWeeklyItem(n)">Copy</el-button>
                </template>
              </li>
            </ul>
          </div>
        </div>
        <div class="okr-role__weekly-card okr-role__weekly-card--decisions" :class="{ 'okr-role__weekly-card--collapsed': collapsedWeeklySections.has('decisions') }">
          <div class="okr-role__weekly-card-head" @click="toggleWeeklySection('decisions')">
            <span class="okr-role__weekly-card-icon">📝</span>
            <span class="okr-role__weekly-card-label">Key Decisions</span>
            <span class="okr-role__weekly-card-count">{{ weeklyData.decisions.length }}</span>
            <span class="okr-role__weekly-card-toggle">{{ collapsedWeeklySections.has('decisions') ? '▸' : '▾' }}</span>
          </div>
          <div class="okr-role__weekly-card-body" :class="{ 'okr-role__weekly-card-body--collapsed': collapsedWeeklySections.has('decisions') }">
            <ul class="okr-role__weekly-card-list">
              <li v-for="(kd, i) in weeklyData.decisions" :key="'kd'+i" class="okr-role__weekly-card-item">
                <template v-if="isEditing('weekly', i, 'decisions')">
                  <el-input v-model="editingText" size="small" class="okr-role__inline-input" @keyup.enter="saveEdit()" @keyup.escape="cancelEdit()" @blur="saveEdit()" :autofocus="true" @click.stop />
                </template>
                <template v-else>
                  <span @dblclick.stop="startEdit('weekly', i, 'decisions')">{{ kd }}</span>
                  <el-button text size="small" type="primary" class="okr-role__weekly-card-copy" @click.stop="copyWeeklyItem(kd)">Copy</el-button>
                </template>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts" name="okrRole">
import { computed, reactive, ref, watch, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import { ArrowLeft, Search, CircleClose, VideoPlay, VideoPause, RefreshRight } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import {
  rolesData, goalsData, metricsData, allMetricsMap, goalMetricMap, getGoalMetrics,
  roleDailyDataMap, roleChecklistMap, roleWeeklyDataMap,
  type GoalItem, type ChecklistItem
} from "./okrData";

const props = defineProps<{ roleId: string }>();
const route = useRoute();

const selectedPeriod = ref("q3");
const searchQuery = ref("");
const statusFilter = ref("all");

const statusOptions = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Planned", value: "planned" },
  { label: "Blocked", value: "blocked" },
  { label: "Done", value: "done" }
];

const hasActiveFilters = computed(() => statusFilter.value !== "all" || searchQuery.value.trim().length > 0);
function clearFilters() {
  searchQuery.value = "";
  statusFilter.value = "all";
}

// ── Goal row expansion (goal detail is inline, not a separate route) ──────────
const expandedGoalIds = ref<string[]>([]);
function toggleGoalExpand(row: GoalItem) {
  const idx = expandedGoalIds.value.indexOf(row.id);
  if (idx >= 0) expandedGoalIds.value.splice(idx, 1);
  else expandedGoalIds.value.push(row.id);
}
function onExpandChange(_row: GoalItem, expandedRows: GoalItem[] | boolean) {
  if (Array.isArray(expandedRows)) expandedGoalIds.value = expandedRows.map(r => r.id);
}

/** 指标详情已完整渲染在页内（顶部指标卡），点击 → 原地滚动 + 高亮，不再跳转不存在的路由。 */
function scrollToMetric(metricId: string) {
  const el = document.getElementById(`metric-${metricId}`);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  el.classList.add("okr-role__metric-card--flash");
  setTimeout(() => el.classList.remove("okr-role__metric-card--flash"), 1600);
}

const role = computed(() => rolesData[props.roleId] || rolesData.executiver);
const allGoals = computed(() => goalsData[props.roleId] || []);

const dailyData = computed(() => roleDailyDataMap[props.roleId] || roleDailyDataMap.executiver);
const weeklyData = computed(() => roleWeeklyDataMap[props.roleId] || roleWeeklyDataMap.executiver);

const dailyChecklist = reactive<ChecklistItem[]>(
  (roleChecklistMap[props.roleId] || roleChecklistMap.executiver).map(item => ({ ...item }))
);

const dailyDoneCount = computed(() => dailyChecklist.filter(i => i.done).length);
const dailyDonePercent = computed(() => {
  if (!dailyChecklist.length) return 0;
  return Math.round((dailyDoneCount.value / dailyChecklist.length) * 100);
});

// ── Daily Standup: today items toggle ──────────
const todayDone = reactive<Set<number>>(new Set());
const todayDoneCount = computed(() => todayDone.size);
const todayTotal = computed(() => dailyData.value.today.length);
function toggleTodayItem(index: number) {
  if (todayDone.has(index)) todayDone.delete(index);
  else todayDone.add(index);
}
async function copyDailyStandup() {
  const d = dailyData.value;
  const r = role.value;
  let text = `Daily Standup — ${r.name} — 2026-08-14\nMood: ${d.mood}\n\n`;
  text += `Yesterday:\n${d.yesterday.map(y => `  • ${y}`).join("\n")}\n\n`;
  text += `Today:\n${d.today.map((t, i) => `  ${i + 1}. ${t}${todayDone.has(i) ? " ✓" : ""}`).join("\n")}`;
  if (d.blocker) text += `\n\nBlocker: ${d.blocker}`;
  await navigator.clipboard.writeText(text);
  ElMessage.success("Daily standup copied");
}

// ── Checklist: complete all ────────────────────
function completeAllChecklist() {
  const allDone = dailyChecklist.every(i => i.done);
  dailyChecklist.forEach(i => { i.done = !allDone; });
}

// ── Weekly Report: collapse + copy ─────────────
const collapsedWeeklySections = reactive<Set<string>>(new Set());
function toggleWeeklySection(key: string) {
  if (collapsedWeeklySections.has(key)) collapsedWeeklySections.delete(key);
  else collapsedWeeklySections.add(key);
}
async function copyWeeklyItem(text: string) {
  await navigator.clipboard.writeText(text);
  ElMessage.success("Copied to clipboard");
}
async function copyWeeklyReport() {
  const w = weeklyData.value;
  const r = role.value;
  let text = `Weekly Report — ${r.name} — Week 33, 2026\nStatus: ${w.status}\n\n`;
  text += `✅ Accomplishments:\n${w.done.map(d => `  • ${d}`).join("\n")}\n\n`;
  text += `🚧 Blockers:\n${w.blockers.length ? w.blockers.map(b => `  • ${b}`).join("\n") : "  • None"}\n\n`;
  text += `📅 Next Week:\n${w.nextWeek.map(n => `  • ${n}`).join("\n")}\n\n`;
  text += `📝 Key Decisions:\n${w.decisions.map(d => `  • ${d}`).join("\n")}`;
  await navigator.clipboard.writeText(text);
  ElMessage.success("Weekly report copied");
}
async function copyWeeklyReportMarkdown() {
  const w = weeklyData.value;
  const r = role.value;
  let md = `# Weekly Report — ${r.name}\n\n`;
  md += `**Week 33, 2026** · Status: **${w.status}**\n\n`;
  md += `## ✅ Accomplishments\n\n${w.done.map(d => `- ${d}`).join("\n")}\n\n`;
  md += `## 🚧 Blockers\n\n${w.blockers.length ? w.blockers.map(b => `- ${b}`).join("\n") : "- None"}\n\n`;
  md += `## 📅 Next Week\n\n${w.nextWeek.map(n => `- ${n}`).join("\n")}\n\n`;
  md += `## 📝 Key Decisions\n\n${w.decisions.map(d => `- ${d}`).join("\n")}\n`;
  await navigator.clipboard.writeText(md);
  ElMessage.success("Markdown report copied");
}

// ── Inline Editing ──────────────────────────────
const editingTarget = ref<{ section: string; card?: string; index: number } | null>(null);
const editingText = ref("");
function startEdit(section: string, index: number, card?: string) {
  editingTarget.value = { section, card, index };
  if (section === "today") {
    editingText.value = dailyData.value.today[index];
  } else if (section === "weekly" && card) {
    const w = weeklyData.value;
    const arr = card === "done" ? w.done : card === "blockers" ? w.blockers : card === "next" ? w.nextWeek : w.decisions;
    editingText.value = arr[index];
  }
}
function saveEdit() {
  if (!editingTarget.value) return;
  const { section, card, index } = editingTarget.value;
  if (section === "today") {
    dailyData.value.today[index] = editingText.value;
  } else if (section === "weekly" && card) {
    const w = weeklyData.value;
    const arr = card === "done" ? w.done : card === "blockers" ? w.blockers : card === "next" ? w.nextWeek : w.decisions;
    arr[index] = editingText.value;
  }
  editingTarget.value = null;
  ElMessage.success("Saved");
}
function cancelEdit() {
  editingTarget.value = null;
}
function isEditing(section: string, index: number, card?: string): boolean {
  const t = editingTarget.value;
  return !!t && t.section === section && t.index === index && t.card === card;
}

// ── Focus Timer ─────────────────────────────────
const FOCUS_DURATION = 25 * 60;
const timerRemaining = ref(FOCUS_DURATION);
const timerRunning = ref(false);
let timerInterval: ReturnType<typeof setInterval> | null = null;
const timerDisplay = computed(() => {
  const m = Math.floor(timerRemaining.value / 60);
  const s = timerRemaining.value % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
});
const timerProgress = computed(() => Math.round((1 - timerRemaining.value / FOCUS_DURATION) * 100));
function startTimer() {
  if (timerRunning.value) return;
  timerRunning.value = true;
  timerInterval = setInterval(() => {
    if (timerRemaining.value > 0) { timerRemaining.value--; }
    else { pauseTimer(); ElMessage.success("Focus session complete! Take a 5-minute break."); }
  }, 1000);
}
function pauseTimer() {
  timerRunning.value = false;
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
}
function resetTimer() {
  pauseTimer();
  timerRemaining.value = FOCUS_DURATION;
}

watch(() => props.roleId, (newRoleId) => {
  const items = roleChecklistMap[newRoleId] || roleChecklistMap.executiver;
  dailyChecklist.length = 0;
  dailyChecklist.push(...items.map(item => ({ ...item })));
  todayDone.clear();
  selectedPeriod.value = "q3";
  searchQuery.value = "";
  statusFilter.value = "all";
  expandedGoalIds.value = [];
  const container = document.querySelector(".okr-role");
  if (container) container.scrollTop = 0;
  applyGoalFromQuery();
});

onMounted(applyGoalFromQuery);

onUnmounted(() => {
  pauseTimer();
});

function goalMatchesPeriod(period: string, selected: string): boolean {
  if (selected === "annual") return true;
  const qMap: Record<string, string[]> = {
    q1: ["Q1", "H1"],
    q2: ["Q2", "H1"],
    q3: ["Q3", "H2"],
    q4: ["Q4", "H2"]
  };
  const patterns = qMap[selected] || [];
  return patterns.some(p => period.includes(p));
}

/** 由目标 period 反推应选中的 period 分组（供 ?goal= 深链自动定位用）。 */
function periodForGoal(period: string): string {
  for (const p of ["q1", "q2", "q3", "q4", "annual"]) {
    if (goalMatchesPeriod(period, p)) return p;
  }
  return "annual";
}

/** 读路由 ?goal= 参数：切换到该目标所在分组并自动展开该行。 */
function applyGoalFromQuery() {
  const goal = route.query.goal;
  if (typeof goal !== "string" || !goal) return;
  const found = allGoals.value.find(g => g.id === goal);
  if (!found) return;
  selectedPeriod.value = periodForGoal(found.period);
  if (!expandedGoalIds.value.includes(goal)) expandedGoalIds.value.push(goal);
}

const filteredGoals = computed(() => {
  let goals = allGoals.value.filter(g => goalMatchesPeriod(g.period, selectedPeriod.value));
  if (statusFilter.value !== "all") {
    goals = goals.filter(g => g.status === statusFilter.value);
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase();
    goals = goals.filter(g =>
      g.title.toLowerCase().includes(q) ||
      g.description.toLowerCase().includes(q) ||
      g.id.toLowerCase().includes(q)
    );
  }
  return goals;
});

const periodMetricCount = computed(() => {
  const metricIds = new Set<string>();
  for (const g of filteredGoals.value) {
    for (const mid of (goalMetricMap[g.id] || [])) {
      metricIds.add(mid);
    }
  }
  return metricIds.size;
});

const periodMetrics = computed(() => {
  const ids = new Set<string>();
  for (const g of filteredGoals.value) {
    for (const mid of (goalMetricMap[g.id] || [])) {
      ids.add(mid);
    }
  }
  return [...ids].map(id => allMetricsMap[id]).filter(Boolean);
});

const periodAvgProgress = computed(() => {
  if (!filteredGoals.value.length) return 0;
  const total = filteredGoals.value.reduce((sum, g) => {
    const krs = g.keyResults;
    if (!krs || !krs.length) return sum;
    return sum + Math.round(krs.reduce((s, kr) => s + Number(kr.progress), 0) / krs.length);
  }, 0);
  return Math.round(total / filteredGoals.value.length);
});

function krAvg(row: GoalItem): number {
  if (!row.keyResults.length) return 0;
  return Math.round(row.keyResults.reduce((s, kr) => s + kr.progress, 0) / row.keyResults.length);
}
function statusTagType(status: string) {
  return status === "active" ? "success" : status === "planned" ? "warning" : status === "blocked" ? "danger" : "info";
}
function projectTagType(project: string) {
  return project === "YiAi" ? "primary" : project === "YiVad" ? "success" : "warning";
}
function krStatus(pct: number): "success" | "warning" | "exception" | undefined {
  if (pct >= 100) return "success";
  if (pct >= 70) return undefined;
  if (pct >= 40) return "warning";
  return "exception";
}
</script>

<style scoped lang="scss">
.okr-role {
  display: flex; flex-direction: column; box-sizing: border-box;
  height: calc(100vh - 95px); min-height: 0; overflow: auto;
  background: var(--el-bg-color-page);
}
.okr-role__breadcrumb {
  position: sticky; top: 0; z-index: 10;
  padding: 14px 24px 10px;
  background: var(--el-bg-color-page);
}

// ── Sticky Header Bar ──────────────────────────
.okr-role__sticky-bar {
  position: sticky; top: 40px; z-index: 9;
  margin: 0 24px; padding: 10px 20px 12px;
  background: var(--el-bg-color); border-radius: 12px;
  border: 1px solid var(--el-border-color-lighter);
  box-shadow: 0 2px 12px rgba(0,0,0,.06);
  backdrop-filter: blur(8px);
}
.okr-role__sticky-top {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
}
.okr-role__sticky-left { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.okr-role__back-btn { padding: 4px 8px; }
.okr-role__sticky-icon { font-size: 24px; }
.okr-role__sticky-info { display: flex; flex-direction: column; gap: 0; }
.okr-role__sticky-name { margin: 0; font-size: 16px; font-weight: 700; line-height: 1.2; }
.okr-role__sticky-dir { font-size: 11px; color: var(--el-text-color-placeholder); font-family: monospace; }
.okr-role__sticky-center { flex-shrink: 0; }
.okr-role__sticky-right { display: flex; gap: 6px; flex-shrink: 0; }

.okr-role__sticky-bottom {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  margin-top: 8px; padding-top: 8px;
  border-top: 1px solid var(--el-border-color-lighter);
}
.okr-role__sticky-desc {
  margin: 0; font-size: 12px; line-height: 1.5; color: var(--el-text-color-secondary);
  flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  max-width: 600px;
}
.okr-role__sticky-tags { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }

.okr-role__stat-pill {
  display: flex; flex-direction: column; align-items: center; gap: 1px;
  padding: 6px 16px; border-radius: 8px; background: var(--el-fill-color-light);
  min-width: 64px;
}
.okr-role__stat-pill--accent { background: var(--el-color-primary-light-9); }
.okr-role__stat-pill-value { font-size: 18px; font-weight: 700; color: var(--el-text-color-primary); line-height: 1.1; }
.okr-role__stat-pill--accent .okr-role__stat-pill-value { color: var(--el-color-primary); }
.okr-role__stat-pill-label { font-size: 10px; color: var(--el-text-color-secondary); font-weight: 600; text-transform: uppercase; letter-spacing: .3px; }

// ── Sections ───────────────────────────────────
.okr-role__section {
  padding: 0 24px; margin-bottom: 8px;
  &:first-of-type { margin-top: 12px; }
  h2 { margin: 0; font-size: 16px; font-weight: 700; }
}
.okr-role__section-head {
  display: flex; align-items: center; gap: 10px; margin-bottom: 6px;
  h2 { margin: 0; }
}
.okr-role__section-count { font-size: 12px; color: var(--el-text-color-secondary); font-weight: 600; }
.okr-role__section-date { font-size: 12px; color: var(--el-text-color-placeholder); margin-left: auto; }
.okr-role__section-desc { margin: 0 0 14px; font-size: 12px; color: var(--el-text-color-secondary); max-width: 800px; line-height: 1.5; }
.okr-role__subsection-title { font-size: 14px; font-weight: 700; margin: 18px 0 12px; }
.okr-role__copy-btn { margin-left: auto; flex-shrink: 0; font-size: 12px; }

// ── Mood tag ───────────────────────────────────
.okr-role__mood-tag {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 600;
}
.okr-role__mood-dot { width: 6px; height: 6px; border-radius: 50%; }
.okr-role__mood-tag--primary { background: var(--el-color-primary-light-9); color: var(--el-color-primary); .okr-role__mood-dot { background: var(--el-color-primary); } }
.okr-role__mood-tag--success { background: var(--el-color-success-light-9); color: var(--el-color-success); .okr-role__mood-dot { background: var(--el-color-success); } }
.okr-role__mood-tag--warning { background: var(--el-color-warning-light-9); color: var(--el-color-warning); .okr-role__mood-dot { background: var(--el-color-warning); } }
.okr-role__mood-tag--danger { background: var(--el-color-danger-light-9); color: var(--el-color-danger); .okr-role__mood-dot { background: var(--el-color-danger); } }
.okr-role__mood-tag--info { background: var(--el-color-info-light-9); color: var(--el-color-info); .okr-role__mood-dot { background: var(--el-color-info); } }

// ── Table Toolbar ──────────────────────────────
.okr-role__table-toolbar {
  display: flex; align-items: center; gap: 12px; margin-bottom: 12px;
}

// ── Metrics Summary Grid ────────────────────────
.okr-role__metrics-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px;
  margin-bottom: 14px;
}
.okr-role__metric-card {
  padding: 12px 14px; border-radius: 10px;
  background: var(--el-bg-color); border: 1px solid var(--el-border-color-lighter);
  cursor: pointer; transition: box-shadow .15s, border-color .15s, transform .15s;
  display: flex; flex-direction: column; gap: 6px;
  &:hover { border-color: var(--el-color-primary-light-5); box-shadow: 0 2px 8px rgba(0,0,0,.06); transform: translateY(-1px); }
}
.okr-role__metric-card--flash {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 3px var(--el-color-primary-light-5);
}
.okr-role__metric-card-top { display: flex; align-items: center; justify-content: space-between; }
.okr-role__metric-card-icon { font-size: 20px; }
.okr-role__metric-card-trend { font-size: 14px; font-weight: 700; color: var(--el-text-color-placeholder); }
.okr-role__metric-card-trend--up { color: var(--el-color-success); }
.okr-role__metric-card-trend--down { color: var(--el-color-danger); }
.okr-role__metric-card-name { font-size: 12px; font-weight: 600; color: var(--el-text-color-regular); line-height: 1.3; }
.okr-role__metric-card-values { display: flex; align-items: baseline; gap: 2px; }
.okr-role__metric-card-current { font-size: 18px; font-weight: 700; color: var(--el-color-primary); }
.okr-role__metric-card-target { font-size: 11px; color: var(--el-text-color-placeholder); }
.okr-role__metrics-empty {
  display: flex; align-items: center; gap: 10px;
  padding: 14px 16px; margin-bottom: 14px;
  background: var(--el-fill-color-light); border-radius: 8px;
  border: 1px dashed var(--el-border-color-lighter);
}
.okr-role__metrics-empty-icon { font-size: 20px; opacity: .6; }
.okr-role__metrics-empty-text { font-size: 12px; color: var(--el-text-color-secondary); line-height: 1.5; }
.okr-role__search { width: 320px; }
.okr-role__status-chips { display: flex; gap: 6px; }
.okr-role__status-chip { cursor: pointer; user-select: none; transition: transform .15s; &:active { transform: scale(.95); } }
.okr-role__clear-btn { flex-shrink: 0; }

// ── Empty State ───────────────────────────────
.okr-role__empty {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 48px 24px; text-align: center;
}
.okr-role__empty-icon { font-size: 40px; opacity: .6; }
.okr-role__empty-title { margin: 0; font-size: 16px; font-weight: 700; color: var(--el-text-color-secondary); }
.okr-role__empty-desc { margin: 0; font-size: 13px; color: var(--el-text-color-placeholder); max-width: 400px; line-height: 1.5; }

// ── Table ──────────────────────────────────────
.okr-role__table-id { font-family: monospace; font-size: 12px; color: var(--el-color-primary); }
.okr-role__table-item { display: flex; align-items: flex-start; gap: 8px; }
.okr-role__table-icon { font-size: 18px; flex-shrink: 0; margin-top: 1px; }
.okr-role__table-title { font-weight: 600; font-size: 13px; display: block; }
.okr-role__table-title--link { cursor: pointer; color: var(--el-color-primary); transition: color .15s; &:hover { color: var(--el-color-primary-light-3); text-decoration: underline; } }
.okr-role__table-desc { margin: 2px 0 0; font-size: 11px; color: var(--el-text-color-secondary); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.okr-role__table-krs { display: flex; flex-direction: column; gap: 5px; padding: 2px 0; }
.okr-role__table-kr { display: flex; align-items: center; gap: 6px; font-size: 11px; }
.okr-role__table-kr-num { font-weight: 700; font-family: monospace; color: var(--el-color-primary); white-space: nowrap; font-size: 10px; min-width: 28px; }
.okr-role__table-kr-text { flex: 1; color: var(--el-text-color-regular); line-height: 1.3; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.okr-role__table-value { font-weight: 700; font-size: 14px; color: var(--el-color-primary); }
.okr-role__table-target { font-weight: 600; font-size: 13px; color: var(--el-color-success); }
.okr-role__table-progress { display: flex; align-items: center; gap: 8px; }

:deep(.el-table__body tr) { transition: background-color .15s ease; }
:deep(.el-table__body tr:hover > td) { background-color: var(--el-color-primary-light-9) !important; }

.okr-role__expand {
  padding: 16px 24px; background: var(--el-fill-color-lighter);
  animation: okr-expand-in .2s ease;
}
@keyframes okr-expand-in { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
.okr-role__expand-title { margin: 0 0 8px; font-size: 13px; color: var(--el-text-color-secondary); }
.okr-role__expand-empty { font-size: 13px; color: var(--el-text-color-placeholder); font-style: italic; padding: 8px 0; }

// ── Daily Standup Cards ────────────────────────
.okr-role__daily-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 4px; }
.okr-role__daily-card {
  padding: 16px; border-radius: 10px; background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  box-shadow: 0 1px 3px rgba(0,0,0,.04);
  transition: box-shadow .2s, border-color .2s;
  &:hover { border-color: var(--el-color-primary-light-5); box-shadow: 0 2px 8px rgba(0,0,0,.06); }
}
.okr-role__daily-card--yesterday { border-left: 3px solid var(--el-color-info); }
.okr-role__daily-card--today { border-left: 3px solid var(--el-color-primary); }
.okr-role__daily-card--blocker {
  grid-column: 1 / -1; border-left: 3px solid var(--el-color-danger);
  background: var(--el-color-danger-light-9);
}
.okr-role__daily-card-head { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.okr-role__daily-card-icon { font-size: 16px; }
.okr-role__daily-card-label { font-weight: 700; font-size: 12px; color: var(--el-text-color-secondary); text-transform: uppercase; letter-spacing: .3px; }
.okr-role__daily-card-progress { margin-left: auto; font-size: 11px; font-weight: 700; color: var(--el-color-primary); font-family: monospace; }
.okr-role__today-progress-bar { margin-bottom: 10px; }
.okr-role__daily-card-list { margin: 0; padding: 0 0 0 16px; display: flex; flex-direction: column; gap: 5px; }
.okr-role__daily-card-list li { font-size: 13px; line-height: 1.5; color: var(--el-text-color-regular); }
.okr-role__daily-card-list--numbered { padding-left: 20px; }
.okr-role__daily-card-list--numbered li {
  cursor: pointer; user-select: none; transition: background .15s, color .15s;
  padding: 3px 6px; margin: 0 -6px; border-radius: 4px;
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
  &:hover { background: var(--el-color-primary-light-9); }
}
.okr-role__today-item--done {
  .okr-role__today-item-text { text-decoration: line-through; color: var(--el-text-color-placeholder); }
}
.okr-role__today-item-text { flex: 1; }
.okr-role__today-item-check { color: var(--el-color-success); font-weight: 700; font-size: 14px; flex-shrink: 0; }
.okr-role__inline-input { flex: 1; }
.okr-role__daily-card-blocker { margin: 0; font-size: 13px; font-weight: 600; color: var(--el-color-danger); line-height: 1.5; }

// ── Focus Timer ─────────────────────────────────
.okr-role__focus-timer {
  display: flex; align-items: center; gap: 14px;
  padding: 12px 16px; margin: 12px 0 4px;
  border-radius: 10px; background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  box-shadow: 0 1px 3px rgba(0,0,0,.04);
}
.okr-role__focus-timer-ring {
  position: relative; width: 48px; height: 48px; flex-shrink: 0;
  svg { width: 100%; height: 100%; transform: rotate(-90deg); }
}
.okr-role__focus-timer-bg { fill: none; stroke: var(--el-fill-color); stroke-width: 3; }
.okr-role__focus-timer-fg {
  fill: none; stroke: var(--el-color-primary); stroke-width: 3;
  stroke-linecap: round; transition: stroke-dasharray .3s ease;
}
.okr-role__focus-timer-text {
  position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700; color: var(--el-color-primary); font-family: monospace;
}
.okr-role__focus-timer-info { display: flex; flex-direction: column; gap: 1px; flex: 1; }
.okr-role__focus-timer-label { font-size: 13px; font-weight: 700; color: var(--el-text-color-primary); }
.okr-role__focus-timer-hint { font-size: 11px; color: var(--el-text-color-placeholder); }
.okr-role__focus-timer-actions { display: flex; gap: 6px; flex-shrink: 0; }

// ── Checklist ──────────────────────────────────
.okr-role__checklist-wrap { display: flex; gap: 24px; align-items: flex-start; }
.okr-role__checklist-progress {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  flex-shrink: 0; padding-top: 4px;
}
.okr-role__progress-ring {
  position: relative; width: 72px; height: 72px;
  svg { width: 100%; height: 100%; transform: rotate(-90deg); }
}
.okr-role__progress-ring-bg {
  fill: none; stroke: var(--el-fill-color); stroke-width: 3;
}
.okr-role__progress-ring-fg {
  fill: none;
  stroke: var(--el-color-primary);
  stroke-width: 3;
  stroke-linecap: round;
  transition: stroke-dasharray .4s ease;
}
.okr-role__progress-ring-text {
  position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
  font-size: 16px; font-weight: 700; color: var(--el-color-primary);
}
.okr-role__progress-ring-label { font-size: 11px; color: var(--el-text-color-secondary); font-weight: 600; white-space: nowrap; }
.okr-role__checklist-complete-all { margin-top: 4px; font-size: 11px; }

.okr-role__checklist { display: flex; flex-direction: column; gap: 6px; flex: 1; }
.okr-role__checklist-item {
  display: flex; align-items: center; gap: 10px; padding: 8px 12px;
  border-radius: 8px; background: var(--el-fill-color-light);
  transition: background .2s, border-color .2s;
  border: 1px solid transparent;
  &:hover { border-color: var(--el-border-color-lighter); }
}
.okr-role__checklist-item--done {
  background: var(--el-color-success-light-9); border-color: var(--el-color-success-light-7);
  .okr-role__checklist-item-text { text-decoration: line-through; color: var(--el-text-color-placeholder); }
}
.okr-role__checklist-item-body { display: flex; align-items: center; gap: 10px; flex: 1; }
.okr-role__checklist-item-text { font-size: 13px; color: var(--el-text-color-regular); flex: 1; }
.okr-role__checklist-item-value {
  font-size: 11px; font-family: monospace; color: var(--el-color-primary);
  background: var(--el-color-primary-light-9); padding: 2px 8px; border-radius: 4px; white-space: nowrap;
}

// ── Weekly Report Cards ────────────────────────
.okr-role__weekly-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.okr-role__weekly-card {
  border-radius: 10px; overflow: hidden;
  background: var(--el-bg-color); border: 1px solid var(--el-border-color-lighter);
  box-shadow: 0 1px 3px rgba(0,0,0,.04);
  transition: box-shadow .2s, border-color .2s;
  &:hover { border-color: var(--el-color-primary-light-5); box-shadow: 0 2px 8px rgba(0,0,0,.06); }
}
.okr-role__weekly-card-head {
  display: flex; align-items: center; gap: 8px; padding: 10px 14px;
  font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: .3px;
  cursor: pointer; user-select: none; transition: opacity .15s;
  &:hover { opacity: .85; }
}
.okr-role__weekly-card--done .okr-role__weekly-card-head { background: var(--el-color-success-light-9); color: var(--el-color-success); }
.okr-role__weekly-card--blockers .okr-role__weekly-card-head { background: var(--el-color-danger-light-9); color: var(--el-color-danger); }
.okr-role__weekly-card--next .okr-role__weekly-card-head { background: var(--el-color-primary-light-9); color: var(--el-color-primary); }
.okr-role__weekly-card--decisions .okr-role__weekly-card-head { background: #f3e8ff; color: #7c3aed; }
.okr-role__weekly-card-icon { font-size: 15px; }
.okr-role__weekly-card-count { font-size: 11px; padding: 0 6px; border-radius: 8px; margin-left: auto; background: rgba(255,255,255,.35); line-height: 1.6; }
.okr-role__weekly-card-toggle { font-size: 12px; opacity: .7; margin-left: 2px; }
.okr-role__weekly-card-list { margin: 0; padding: 10px 14px 12px 30px; display: flex; flex-direction: column; gap: 5px; }
.okr-role__weekly-card-body {
  overflow: hidden; max-height: 600px;
  transition: max-height .3s ease, padding .3s ease;
}
.okr-role__weekly-card-body--collapsed { max-height: 0; padding: 0; }
.okr-role__weekly-card-item {
  display: flex; align-items: flex-start; justify-content: space-between; gap: 8px;
  font-size: 13px; line-height: 1.5; color: var(--el-text-color-regular);
  padding: 2px 0; border-radius: 4px; transition: background .15s;
  &:hover { background: var(--el-fill-color-light); }
  .okr-role__weekly-card-copy { opacity: 0; transition: opacity .15s; flex-shrink: 0; font-size: 11px; }
  &:hover .okr-role__weekly-card-copy { opacity: 1; }
}
.okr-role__weekly-card-none { display: block; padding: 10px 14px 12px; font-size: 12px; color: var(--el-text-color-placeholder); font-style: italic; }
.okr-role__weekly-card--collapsed .okr-role__weekly-card-head { opacity: .7; }

// ── Divider ────────────────────────────────────
.okr-role__section + .el-divider { margin: 0 24px; width: auto; }
</style>
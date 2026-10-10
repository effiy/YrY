<template>
  <div class="reading-list-page">
    <!-- ═══════════════════════════════════════════════
         §1 Header · 标题栏 + 快捷操作 + 快捷键契约
         ⌘N 新建  ⌘D 折叠仪表盘  ⌘K 聚焦搜索  ⌥1/2/3 视图切换
    ═══════════════════════════════════════════════ -->
    <header class="rl-header rl-glass">
      <div class="rl-header__left">
        <h1 class="rl-header__title">
          <span class="rl-header__sticky">{{ stickyIcon }}</span>
          Reading List
          <span class="rl-header__version">v3.2 · SSOT</span>
          <span class="rl-header__badge">5★ Confidence</span>
          <span
            v-if="store.loading"
            class="rl-header__pill is-parsing"
            :title="'数据源加载中… ' + sourceKindLabel"
          >
            ⏳ {{ sourceKindLabel }}
          </span>
          <span
            v-else
            class="rl-header__pill"
            :class="[`is-${store.sourceKind}`]"
            :title="'当前命中数据源：' + sourceKindLabel"
          >
            📡 {{ sourceKindLabel }}
          </span>
        </h1>
        <p class="rl-header__desc">
          Curated books, articles, and papers — plan, track, and distill insights
          across 8 knowledge dimensions. Every entry carries a RICE score, linked
          OKR, and So-What notes.
        </p>
      </div>

      <div class="rl-header__right">
        <el-button-group>
          <el-tooltip
            content="在 YiKnowledge 目录中打开 master 001 文件"
            placement="bottom"
          >
            <el-button
              size="small" :type="isSourceKB() ? 'primary' : 'default'" @click="switchSourceMode('kb')">
              YiKnowledge{{ isSourceKB() ? ' ✓' : '' }}
            </el-button>
          </el-tooltip>
          <el-tooltip content="使用 YiAi /reading-list API 数据源" placement="bottom">
            <el-button
              size="small"
              :type="!isSourceKB() ? 'primary' : 'default'"
              @click="switchSourceMode('db')"
            >
              YiAi DB{{ !isSourceKB() ? ' ✓' : '' }}
            </el-button>
          </el-tooltip>
          <el-tooltip content="将条目同步到 YiAi DB" placement="bottom">
            <el-button size="small" type="success" :loading="syncing" @click="seedIntoDb">
              {{ syncing ? `同步中 ${store.seedState.done}/${store.seedState.total}` : '同步到 YiAi' }}
            </el-button>
          </el-tooltip>
        </el-button-group>

        <el-divider direction="vertical" />

        <el-button
          size="small"
          :type="dashboardCollapsed ? 'primary' : 'default'"
          @click="toggleDashboardCollapse"
        >
          {{ dashboardCollapsed ? "Expand" : "Collapse" }}
          <span class="rl-accel">⌘D</span>
        </el-button>
        <el-button size="small" :icon="Refresh" @click="handleRefresh">
          Refresh
        </el-button>

        <el-dropdown
          trigger="click"
          @command="handleViewModeCmd"
          :close-on-click="true"
        >
          <el-button size="small" :icon="Grid">
            {{ viewModeLabel }}
            <el-icon class="el-icon--right"><arrow-down /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="list">📇 List · ⌥1</el-dropdown-item>
              <el-dropdown-item command="card">🧩 Card · ⌥2</el-dropdown-item>
              <el-dropdown-item command="table">📊 Table · ⌥3</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <el-button
          size="small"
          type="primary"
          :icon="Plus"
          @click="openCreateDialog"
        >
          Add Item
          <span class="rl-accel">⌘N</span>
        </el-button>
      </div>
    </header>

    <!-- ═══════════════════════════════════════════════
         §2 KPI 条 — 6 大指标（Total / In-progress / Done / Avg RICE / Tier / Coverage）
    ═══════════════════════════════════════════════ -->
    <section class="rl-kpi rl-glass" aria-label="KPI overview">
      <div class="rl-kpi__item">
        <div class="rl-kpi__label">📚 Total Items</div>
        <div class="rl-kpi__value">{{ stats.total }}</div>
      </div>
      <div class="rl-kpi__item">
        <div class="rl-kpi__label">📅 In Progress</div>
        <div class="rl-kpi__value">
          {{ stats.inProgressCount }}
          <span class="rl-kpi__sub">
            · {{ stats.averageProgress }}% avg
          </span>
        </div>
      </div>
      <div class="rl-kpi__item">
        <div class="rl-kpi__label">✅ Completed</div>
        <div class="rl-kpi__value">
          {{ stats.completedCount }}
          <span class="rl-kpi__sub">
            ·
            {{
              stats.total
                ? Math.round((stats.completedCount / stats.total) * 100)
                : 0
            }}%
          </span>
        </div>
      </div>
      <div class="rl-kpi__item">
        <div class="rl-kpi__label">🎯 Avg RICE</div>
        <div class="rl-kpi__value">
          <span :class="riceScoreClass(stats.averageRice)">
            {{ stats.averageRice }}
          </span>
          <span class="rl-kpi__sub"> · {{ riceTierLabel(stats.riceTier) }}</span>
        </div>
      </div>
      <div class="rl-kpi__item">
        <div class="rl-kpi__label">🧭 Coverage</div>
        <div class="rl-kpi__value">
          <el-progress
            :percentage="stats.dimensionCoverage"
            :stroke-width="14"
            color="var(--rl-progress-primary)"
            :show-text="false"
          />
          <span class="rl-kpi__sub">{{ stats.dimensionCoverage }}%</span>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════
         §3 Dashboard · 9 大面板（可折叠 ⌘D）
         3.1 Knowledge Dimensions  3.2 Distribution  3.3 RICE Scoreboard
         3.4 SLO KPI 追踪          3.5 红绿灯告警    3.6 5★ 跨书洞察
         3.7 Goal × KR 支撑矩阵    3.8 蒸馏状态机    3.9 Q4 未来待读
    ═══════════════════════════════════════════════ -->
    <transition name="rl-collapse">
      <section
        v-show="!dashboardCollapsed"
        class="rl-dashboard"
        aria-label="Reading list dashboard"
      >
        <!-- 3.1 Knowledge Dimensions -->
        <div class="rl-card rl-glass">
          <header class="rl-card__header">
            <h3>Knowledge Dimensions</h3>
            <span class="rl-card__hint">
              {{ activeDimensionCount }} of {{ meta.dimensions.length }}
            </span>
          </header>
          <div class="rl-dimensions">
            <button
              v-for="d in meta.dimensions"
              :key="d.id"
              type="button"
              class="rl-dim"
              :class="[
                `is-${d.id}`,
                { 'is-active': query.dimension === d.id }
              ]"
              :style="{ '--rl-dim-color': d.color }"
              @click="onToggleDimension(d.id)"
            >
              <span class="rl-dim__icon">{{ d.icon }}</span>
              <span class="rl-dim__label">{{ d.label }} {{ d.en }}</span>
              <span class="rl-dim__count">
                {{ stats.dimensions?.[d.id] ?? 0 }}
              </span>
              <span
                class="rl-dim__bar"
                :style="{ width: dimensionBarWidth(d.id) }"
              />
            </button>
          </div>
        </div>

        <!-- 3.2 Distribution -->
        <div class="rl-card rl-glass">
          <header class="rl-card__header">
            <h3>Distribution</h3>
          </header>
          <div class="rl-distribution">
            <div>
              <div class="rl-distribution__label">
                By Type {{ stats.total }}
              </div>
              <div class="rl-segment">
                <span
                  v-for="t in meta.types"
                  :key="t.id"
                  class="rl-segment__item"
                  :class="[`is-${t.id}`]"
                  :style="
                    segmentStyle(
                      stats.types?.[t.id] ?? 0,
                      sum(
                        meta.types.map((x) => stats.types?.[x.id] ?? 0)
                      )
                    )
                  "
                >
                  {{ t.icon }} {{ metaMap.type[t.id] }}
                  {{ stats.types?.[t.id] ?? 0 }}
                </span>
              </div>
            </div>
            <div>
              <div class="rl-distribution__label">By Priority {{ stats.total }}</div>
              <div class="rl-segment">
                <span
                  v-for="p in meta.priorities"
                  :key="p.id"
                  class="rl-segment__item"
                  :class="[`is-${p.id}`]"
                  :style="
                    segmentStyle(
                      stats.priorities?.[p.id] ?? 0,
                      sum(
                        meta.priorities.map((x) => stats.priorities?.[x.id] ?? 0)
                      )
                    )
                  "
                >
                  {{ p.label }} {{ stats.priorities?.[p.id] ?? 0 }}
                </span>
              </div>
            </div>
            <div>
              <div class="rl-distribution__label">Status Funnel</div>
              <div class="rl-funnel">
                <span
                  v-for="s in meta.statuses"
                  :key="s.id"
                  class="rl-funnel__step"
                  :class="[`is-${s.id}`]"
                  :style="funnelStyle(s.id)"
                >
                  <strong>{{ stats.statusFunnel?.[s.id] ?? 0 }}</strong>
                  <small>{{ s.label }}</small>
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 3.3 RICE Scoreboard -->
        <div class="rl-card rl-glass">
          <header class="rl-card__header">
            <h3>RICE Scoreboard</h3>
          </header>
          <div class="rl-rice">
            <button
              v-for="t in meta.riceTiers"
              :key="t.id"
              type="button"
              class="rl-rice__tier"
              :class="[
                `is-${t.id}`,
                { 'is-active': riceFilterTier === t.id }
              ]"
              @click="toggleRiceFilter(t.id)"
            >
              <span class="rl-rice__label">{{ t.label }}</span>
              <span class="rl-rice__count">
                {{ stats.riceByTier?.[t.id] ?? 0 }}
              </span>
            </button>
          </div>
          <p class="rl-card__note">
            RICE = Reach × Impact × Confidence ÷ Effort (normalized 0–100).
            Entries ≥ 60 auto-promote to quarterly pipeline.
          </p>
        </div>

        <!-- 3.4 SLO KPI 追踪 -->
        <div class="rl-card rl-glass">
          <header class="rl-card__header">
            <h3>exec-003 SLO KPI 追踪</h3>
            <span class="rl-card__hint">{{ sloCards.length }} cards · Q3→Q4</span>
          </header>
          <div class="rl-slo">
            <article
              v-for="s in sloCards"
              :key="s.id"
              class="rl-slo__card"
              :class="[`is-${s.status}`]"
            >
              <header>
                <span class="rl-slo__id">{{ s.id }}</span>
                <span class="rl-slo__dot" :class="[`is-${s.status}`]" />
              </header>
              <h4>{{ s.title }}</h4>
              <p class="rl-slo__sub">{{ s.context }}</p>
              <div class="rl-slo__row">
                <div><small>实际</small> <strong>{{ s.actual }}</strong></div>
                <div><small>目标</small> <strong>{{ s.target }}</strong></div>
              </div>
              <a class="rl-slo__link" @click="openAnchor(s.anchor)">
                {{ s.anchor }}
              </a>
            </article>
          </div>
        </div>

        <!-- 3.5 红绿灯告警 -->
        <div class="rl-card rl-glass">
          <header class="rl-card__header">
            <h3>红·黄·绿灯告警（月度评审会 10s 扫）</h3>
            <span class="rl-card__hint">{{ alerts.length }} rows</span>
          </header>
          <ul class="rl-alerts">
            <li
              v-for="(a, idx) in alerts"
              :key="idx"
              class="rl-alert"
              :class="[`is-${a.level}`]"
            >
              <span class="rl-alert__mark">{{ levelGlyph(a.level) }}</span>
              <div class="rl-alert__body">
                <strong>{{ a.title }}</strong>
                <span class="rl-alert__desc">{{ a.description }}</span>
              </div>
              <span v-if="a.owner" class="rl-alert__owner">Owner: {{ a.owner }}</span>
            </li>
          </ul>
        </div>

        <!-- 3.6 5★ 跨书洞察矩阵 -->
        <div class="rl-card rl-glass">
          <header class="rl-card__header">
            <h3>5★ 跨书高置信洞察矩阵（§8）</h3>
            <span class="rl-card__hint">
              {{ crossBookInsights.length }}/{{ crossBookInsights.length }} 全 ★★★★★
              {{ insightsConfidencePct }}%
            </span>
          </header>
          <div class="rl-insights">
            <article
              v-for="ins in crossBookInsights"
              :key="ins.id"
              class="rl-insight"
            >
              <header>
                <strong>{{ ins.id }}</strong>
                <span
                  v-for="n in ins.stars"
                  :key="n"
                  class="rl-insight__star"
                  >★</span
                >
              </header>
              <p>{{ ins.text }}</p>
              <div class="rl-insight__books">
                {{ ins.books.join("  ·  ") }}
              </div>
              <div class="rl-insight__meta">
                <span>支撑决策: {{ ins.decision }}</span>
                <a class="rl-insight__link" @click="openAnchor(ins.anchor)">
                  落地锚点: {{ ins.anchor }}
                </a>
              </div>
            </article>
          </div>
        </div>

        <!-- 3.7 Goal × KR 阅读支撑矩阵 -->
        <div class="rl-card rl-glass">
          <header class="rl-card__header">
            <h3>Goal × KR 阅读支撑矩阵（§5 · 平均 9.2/10）</h3>
            <span class="rl-card__hint">{{ okrGroupTotalText }}</span>
          </header>
          <div class="rl-okr">
            <section v-for="g in okrGroups" :key="g.id" class="rl-okr__group">
              <header class="rl-okr__goal">{{ g.id }} {{ g.title }}</header>
              <div
                v-for="kr in g.items"
                :key="kr.id"
                class="rl-okr__row"
              >
                <div class="rl-okr__kr">
                  <strong>{{ kr.id }}</strong>
                  <span>{{ kr.title }}</span>
                </div>
                <div class="rl-okr__books">{{ kr.books.join("  ") }}</div>
                <div class="rl-okr__score">{{ kr.score }} / 10</div>
              </div>
            </section>
          </div>
        </div>

        <!-- 3.8 蒸馏状态机 & 西蒙 21 天节奏 -->
        <div class="rl-card rl-glass">
          <header class="rl-card__header">
            <h3>蒸馏 7 状态机 & 西蒙 21 天节奏（§6）</h3>
            <span class="rl-card__hint">Queued → Archived · 红线预警</span>
          </header>
          <ol class="rl-states">
            <li
              v-for="(s, i) in distillSteps"
              :key="s.id"
              class="rl-states__step"
              :class="[
                `is-${s.id}`,
                { 'is-behind': s.slaBreached }
              ]"
            >
              <div class="rl-states__index">{{ i + 1 }}</div>
              <div class="rl-states__name">{{ meta.statuses[i]?.label ?? s.id }}</div>
              <div class="rl-states__rule">{{ s.rule }}</div>
              <div v-if="s.redline" class="rl-states__redline">
                红线 {{ s.redline }}
              </div>
            </li>
          </ol>
        </div>

        <!-- 3.9 Q4 未来候选待读队列 -->
        <div class="rl-card rl-glass">
          <header class="rl-card__header">
            <h3>2026-Q4 未来候选待读队列（§7 · ≥ 20 条）</h3>
            <span class="rl-card__hint">
              H {{ queueStats.high }} · M {{ queueStats.medium }} · L {{ queueStats.low }}
            </span>
          </header>
          <div v-for="(grp, prio) in futureQueueGroups" :key="prio" class="rl-queue">
            <div
              class="rl-queue__title"
              :class="[`is-${prio}`]"
            >
              <el-tooltip
                v-if="queueGroupCriterion(prio)"
                :content="queueGroupCriterion(prio)"
                placement="top"
                :show-after="300"
              >
                <span class="rl-queue__title-text">
                  {{ queueGroupTitle(prio) }}（RICE {{ queueGroupRiceHint(prio) }}）
                  {{ grp.length }} 条 · 前 {{ Math.min(5, grp.length) }} 条展示
                </span>
              </el-tooltip>
              <span v-else class="rl-queue__title-text">
                {{ queueGroupTitle(prio) }}（RICE {{ queueGroupRiceHint(prio) }}）
                {{ grp.length }} 条
              </span>
            </div>
            <ol class="rl-queue__items">
              <li
                v-for="q in grp.slice(0, 5)"
                :key="q.key"
                class="rl-queue__item"
              >
                <span class="rl-queue__key">{{ q.key }}</span>
                <strong>{{ q.title }}</strong>
                <span v-if="q.subtitle" class="rl-queue__subtitle">{{ q.subtitle }}</span>
                <span class="rl-queue__rice">RICE {{ q.rice }}</span>
                <span class="rl-queue__meta">
                  ✍ {{ q.author }} · {{ q.dimensionLabel }} · 🎯 {{ q.window }}
                  · <em>{{ daysUntilScheduled(q.window) }}</em>
                </span>
                <span class="rl-queue__gate">{{ q.gate }}</span>
              </li>
              <li v-if="grp.length > 5" class="rl-queue__item rl-queue__item--more">
                还有 {{ grp.length - 5 }} 条未展示（完整列表见 001.md §7）
              </li>
            </ol>
          </div>
          <!-- 动态条目：基于当前 visibleItems status=queued + scheduledMonth 派生前 5 条真实条目 -->
          <div v-if="queuedLiveItems.length > 0" class="rl-queue rl-queue--live">
            <div class="rl-queue__title is-live">
              <el-tooltip
                content="从当前 SSOT：Reading Items 中实时计算的 queued 状态条目（status=queued + scheduledMonth 有值）"
                placement="top"
                :show-after="300"
              >
                <span class="rl-queue__title-text">📡 实时 Queued 待读（数据源 SSOT） · {{ queuedLiveItems.length }} 条</span>
              </el-tooltip>
            </div>
            <ol class="rl-queue__items">
              <li
                v-for="q in queuedLiveItems.slice(0, 5)"
                :key="q.key"
                class="rl-queue__item"
                @click="openEditDialog(q)"
              >
                <span class="rl-queue__key">{{ q.key }}</span>
                <strong>{{ q.title }}</strong>
                <span v-if="q.subtitle" class="rl-queue__subtitle">{{ q.subtitle }}</span>
                <span class="rl-queue__rice">RICE {{ q.rice?.final ?? 0 }}</span>
                <span class="rl-queue__meta">
                  ✍ {{ q.author ?? "—" }} · {{ metaMap.dimension[q.dimension ?? "management"] ?? metaMap.dimension.management }} ·
                  🎯 {{ q.scheduledMonth ?? "—" }} ·
                  <em>{{ daysUntilMonth(q.scheduledMonth) }}</em>
                </span>
              </li>
            </ol>
          </div>
        </div>
      </section>
    </transition>

    <!-- ═══════════════════════════════════════════════
         §4 过滤条（Role / Schedule + Search）
    ═══════════════════════════════════════════════ -->
    <section class="rl-filters rl-glass">
      <div class="rl-filters__row">
        <el-button
          :type="!query.status || query.status === 'all' ? 'primary' : 'default'"
          @click="onSetStatus('all')"
        >
          📖 全部阅读
          <span class="rl-tag">{{ filteredBy({}).length }}</span>
        </el-button>
        <el-button
          :type="query.status === 'reading' ? 'primary' : 'default'"
          @click="onSetStatus('reading')"
        >
          📅 阅读中
          <span class="rl-tag">{{ stats.inProgressCount }}</span>
        </el-button>
        <el-button
          :type="(query.status as any) === 'done-group' ? 'primary' : 'default'"
          @click="onSetDoneGroup()"
        >
          ✅ 已完成
          <span class="rl-tag">{{ stats.completedCount }}</span>
        </el-button>
        <el-button
          :type="query.priority === 'high' ? 'primary' : 'default'"
          @click="onTogglePriority('high')"
        >
          🔥 高优先级
          <span class="rl-tag">{{ stats.priorities?.high ?? 0 }}</span>
        </el-button>
        <el-button
          :type="riceFilterTier === 'elite' ? 'primary' : 'default'"
          @click="toggleRiceFilter('elite')"
        >
          🏆 RICE ≥ 80
          <span class="rl-tag">{{ stats.riceByTier?.elite ?? 0 }}</span>
        </el-button>
      </div>

      <div class="rl-filters__row">
        <span class="rl-filters__group-title">👥 Role</span>
        <button
          v-for="r in meta.roles"
          :key="r.id"
          type="button"
          class="rl-chip"
          :class="[
            `is-${r.id}`,
            { 'is-active': query.role === r.id }
          ]"
          :style="{ '--rl-chip-color': r.color }"
          @click="onToggleRole(r.id)"
        >
          {{ r.icon }} {{ r.label }}
          <span class="rl-chip__count">
            {{ stats.roles?.[r.id] ?? 0 }}
          </span>
        </button>
      </div>

      <div class="rl-filters__row">
        <span class="rl-filters__group-title">🗓 Schedule</span>
        <button
          v-for="m in scheduledMonthList"
          :key="m"
          type="button"
          class="rl-chip is-month"
          :class="{ 'is-active': query.scheduledMonth === m }"
          @click="onToggleMonth(m)"
        >
          📅 {{ m }}
          <span class="rl-chip__count">
            {{ stats.schedule?.[m] ?? 0 }}
          </span>
        </button>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════
         §5 Views · List / Card / Table（⌥1 / ⌥2 / ⌥3）
    ═══════════════════════════════════════════════ -->
    <section class="rl-view rl-glass">
      <header class="rl-view__header">
        <h2>📖 阅读列表 {{ currentViewLabel }}</h2>
        <div class="rl-view__actions">
          <span class="rl-view__summary">
            {{ visibleItems.length }} of {{ filteredBy({}).length }} items
          </span>
          <el-radio-group
            v-model="viewMode"
            size="small"
            @change="(val: string | number | boolean | undefined) => onViewModeCmd(String(val ?? 'table') as 'list' | 'card' | 'table')"
          >
            <el-radio-button label="list">Card</el-radio-button>
            <el-radio-button label="card">List</el-radio-button>
            <el-radio-button label="table">Table</el-radio-button>
          </el-radio-group>

          <el-input
            ref="searchInputRef"
            v-model="query.keyword"
            placeholder="Search title, author, OKR… ⌥K"
            clearable
            size="small"
            class="rl-view__search"
            :prefix-icon="Search"
          />
        </div>
      </header>

      <!-- 5.1 Card View -->
      <div v-if="viewMode === 'list'" class="rl-cards">
        <article
          v-for="row in visibleItems"
          :key="row.key"
          class="rl-card-item"
          :class="[
            `is-${row.priority ?? 'medium'}-prio`,
            `is-${row.status ?? 'queued'}`,
            { 'is-failed': isRowFailed(row) }
          ]"
        >
          <header class="rl-card-item__header">
            <span class="rl-card-item__key">{{ row.key }}</span>
            <el-tag
              :type="typeTagType(row.type)"
              size="small"
              effect="light"
            >
              {{ typeIcon(row.type) }} {{ metaMap.type[row.type ?? "book"] ?? metaMap.type.book }}
            </el-tag>
            <el-tag
              :type="priorityTagType(row.priority)"
              size="small"
              effect="dark"
            >
              {{ metaMap.priority[row.priority ?? "medium"] ?? metaMap.priority.medium }}
            </el-tag>
            <span
              class="rl-rice-pill"
              :class="riceScoreClass(row.rice?.final ?? 0)"
            >
              RICE {{ row.rice?.final ?? 0 }}
            </span>
          </header>

          <h3 class="rl-card-item__title" @click="openItem(row)">
            {{ row.title }}
            <span v-if="row.subtitle" class="rl-card-item__subtitle">
              — {{ row.subtitle }}
            </span>
            <el-tag
              v-if="hasValidLinkContract(row)"
              class="rl-kb-tag"
              size="small"
              type="success"
              effect="light"
              @click.stop="openReadingLink(row)"
            >
              📖 可预览
            </el-tag>
          </h3>

          <div class="rl-card-item__meta">
            <span>✍ {{ row.author ?? "—" }}</span>
            <span>🧭 {{ metaMap.dimension[row.dimension ?? "management"] ?? metaMap.dimension.management }}</span>
            <span>👔 {{ metaMap.role[row.ownerRole ?? "ceo"] ?? metaMap.role.ceo }}</span>
            <span v-if="row.scheduledMonth">📅 {{ row.scheduledMonth }}</span>
            <span v-if="row.okrId">🎯 {{ row.okrId }}</span>
          </div>

          <footer class="rl-card-item__footer">
            <el-progress
              :percentage="effectiveProgress(row)"
              :stroke-width="8"
              :status="progressStatus(row)"
            />
            <div class="rl-card-item__actions">
              <el-button
                v-if="hasValidLinkContract(row)"
                size="small"
                type="primary"
                @click="openReadingLink(row)"
              >
                📖 预览
              </el-button>
              <el-button
                size="small"
                text
                type="primary"
                @click="openItem(row)"
              >
                Open
              </el-button>
              <el-button size="small" text @click="openEditDialog(row)">
                Edit
              </el-button>
              <el-button
                size="small"
                text
                type="danger"
                @click="handleDelete(row)"
              >
                Delete
              </el-button>
            </div>
          </footer>
        </article>
        <EmptyState v-if="!visibleItems.length" />
      </div>

      <!-- 5.2 List View -->
      <ul v-else-if="viewMode === 'card'" class="rl-list">
        <li
          v-for="row in visibleItems"
          :key="row.key"
          class="rl-list__row"
          :class="{ 'is-failed': isRowFailed(row) }"
        >
          <span class="rl-list__key">{{ row.key }}</span>
          <span class="rl-list__title" @click="openItem(row)">
            {{ row.title }}
            <span v-if="row.subtitle" class="rl-list__subtitle">
              · {{ row.subtitle }}
            </span>
            <el-tag
              v-if="hasValidLinkContract(row)"
              class="rl-kb-tag rl-kb-tag--sm"
              size="small"
              type="success"
              effect="light"
              @click.stop="openReadingLink(row)"
            >
              📖
            </el-tag>
          </span>
          <span class="rl-list__owner">
            {{ metaMap.role[row.ownerRole ?? "ceo"] ?? metaMap.role.ceo }}
          </span>
          <span class="rl-list__dim">
            {{ metaMap.dimension[row.dimension ?? "management"] ?? metaMap.dimension.management }}
          </span>
          <el-tag
            :type="typeTagType(row.type)"
            size="small"
          >
            {{ metaMap.type[row.type ?? "book"] ?? metaMap.type.book }}
          </el-tag>
          <span
            class="rl-rice-pill"
            :class="riceScoreClass(row.rice?.final ?? 0)"
          >
            {{ row.rice?.final ?? 0 }}
          </span>
          <span class="rl-list__schedule">{{ row.scheduledMonth ?? "—" }}</span>
          <el-tag
            :type="statusTagType(row.status)"
            size="small"
            effect="dark"
          >
            {{ metaMap.status[row.status ?? "queued"] ?? metaMap.status.queued }}
          </el-tag>
          <el-progress
            :percentage="effectiveProgress(row)"
            :stroke-width="6"
            :show-text="false"
            class="rl-list__progress"
          />
          <div class="rl-list__actions">
            <el-button
              v-if="hasValidLinkContract(row)"
              size="small"
              type="primary"
              @click="openReadingLink(row)"
            >
              📖 预览
            </el-button>
            <el-button
              size="small"
              text
              type="primary"
              @click="openItem(row)"
            >
              Open
            </el-button>
            <el-button size="small" text @click="openEditDialog(row)">
              Edit
            </el-button>
          </div>
        </li>
        <EmptyState v-if="!visibleItems.length" />
      </ul>

      <!-- 5.3 Table View -->
      <ProTable
        v-else
        ref="proTable"
        :columns="columns"
        :request-api="tableFetch"
        :init-param="tableInitParam"
        :data-callback="tableTransform"
        :page-show="false"
        :search-show="false"
      >
        <template #title="{ row }">
          <div class="rl-table__title-cell" :class="{ 'is-failed': isRowFailed(row) }">
            <a
              class="rl-table__title"
              @click="openItem(row)"
            >
              {{ row.title }}
              <span v-if="row.subtitle" class="rl-table__subtitle">
                · {{ row.subtitle }}
              </span>
            </a>
            <el-tag
              v-if="hasValidLinkContract(row)"
              class="rl-kb-tag rl-kb-tag--sm"
              size="small"
              type="success"
              effect="light"
              @click.stop="openReadingLink(row)"
            >
              📖 笔记
            </el-tag>
          </div>
        </template>
        <template #rice="{ row }">
          <span
            class="rl-rice-pill"
            :class="riceScoreClass(row.rice?.final ?? 0)"
          >
            {{ row.rice?.final ?? "—" }}
          </span>
        </template>
        <template #progress="{ row }">
          <el-progress
            :percentage="effectiveProgress(row)"
            :stroke-width="8"
            :status="progressStatus(row)"
          />
        </template>
        <template #scheduled="{ row }">
          {{ row.scheduledMonth ?? "—" }}
        </template>
        <template #updatedTime="{ row }">
          {{ formatUpdatedAt(row.updatedAt) }}
        </template>
        <template #operation="{ row }">
          <el-button
            v-if="hasValidLinkContract(row)"
            size="small"
            type="success"
            plain
            @click="openReadingLink(row)"
          >
            📖 预览
          </el-button>
          <el-button
            size="small"
            text
            type="primary"
            @click="openItem(row)"
          >
            Open
          </el-button>
          <el-button size="small" text @click="openEditDialog(row)">
            Edit
          </el-button>
          <el-button
            size="small"
            text
            type="danger"
            @click="handleDelete(row)"
          >
            Delete
          </el-button>
        </template>
      </ProTable>
    </section>

    <!-- ═══════════════════════════════════════════════
         §6 Executive Knowledge Browser
            · sidebar · 9 大 knowledge domains + Role
            · table   · 与 ExecutiveDashboard 同款 pro-table
            · 打开走 KnowledgePreviewDialog（LinkFactory 三闸门）
            · 数据 · SSOT: useRoleDashboard('executive')
    ═══════════════════════════════════════════════ -->
    <section class="rl-kb rl-glass" aria-label="Executive knowledge file browser">
      <!-- ════════════════════════════════════════════════
           §6.1 Header + role KPI strip (SSOT: kbStats)
           对齐 ExecutiveDashboard · StandardRoleDashboard 视觉语言
      ════════════════════════════════════════════════ -->
      <header class="rl-kb__header">
        <div class="rl-kb__header-left">
          <h2>🗂 Executive Knowledge Files</h2>
          <div class="rl-kb__header-sub">
            SSOT: <code>executive/*</code> · 7 decision domains · Frontmatter 15-field · LinkFactory 三闸门打开
          </div>
        </div>
        <div class="rl-kb__header-actions">
          <span class="rl-kb__summary">
            {{ kbFlatTotal }} total · {{ kbFilteredTotal }} matched
            <el-tag
              v-if="kbError"
              size="small"
              type="danger"
              effect="light"
              round
              style="margin-left:8px"
            >{{ kbError }}</el-tag>
          </span>
          <el-radio-group v-model="kbViewMode" size="small" @change="kbRefreshFileTable">
            <el-radio-button label="table">Table</el-radio-button>
            <el-radio-button label="list">List</el-radio-button>
          </el-radio-group>
          <el-button size="small" text @click="kbRefreshAll" :loading="kbLoading">Reload</el-button>
          <el-button size="small" text @click="kbResetAll">Reset</el-button>
        </div>
      </header>

      <!-- Stat cards — mirrors StandardRoleDashboard §stats -->
      <section class="rl-kb__stats" aria-label="Knowledge file stats">
        <div class="kb-stat" style="--kb-accent: #1677ff">
          <div class="kb-stat__icon">📄</div>
          <div class="kb-stat__body">
            <div class="kb-stat__value">{{ kbStats?.total ?? 0 }}</div>
            <div class="kb-stat__label">Total Files</div>
            <div class="kb-stat__sub">{{ kbSubdirs.length }} domains</div>
          </div>
        </div>
        <div class="kb-stat" style="--kb-accent: #10b981">
          <div class="kb-stat__icon">✅</div>
          <div class="kb-stat__body">
            <div class="kb-stat__value">{{ (kbStats?.stable ?? 0) + (kbStats?.active ?? 0) }}</div>
            <div class="kb-stat__label">Stable / Active</div>
            <div class="kb-stat__sub">
              {{ kbPct((kbStats?.stable ?? 0) + (kbStats?.active ?? 0), kbStats?.total ?? 0) }}% mature
            </div>
          </div>
        </div>
        <div class="kb-stat" style="--kb-accent: #f59e0b">
          <div class="kb-stat__icon">📝</div>
          <div class="kb-stat__body">
            <div class="kb-stat__value">{{ kbStats?.draft ?? 0 }}</div>
            <div class="kb-stat__label">Drafts</div>
            <div class="kb-stat__sub">{{ kbStats?.evolving ?? 0 }} evolving</div>
          </div>
        </div>
        <div
          class="kb-stat"
          :style="{
            '--kb-accent':
              (kbStats?.reviewCompliance ?? 0) >= 80 ? '#10b981' :
              (kbStats?.reviewCompliance ?? 0) >= 50 ? '#f59e0b' : '#ef4444'
          }"
        >
          <div class="kb-stat__icon">🛡️</div>
          <div class="kb-stat__body">
            <div class="kb-stat__value">{{ kbStats?.reviewCompliance ?? 100 }}%</div>
            <div class="kb-stat__label">Review Compliance</div>
            <el-progress
              :percentage="kbStats?.reviewCompliance ?? 100"
              :stroke-width="5"
              :show-text="false"
              :color="
                (kbStats?.reviewCompliance ?? 0) >= 80 ? '#10b981' :
                (kbStats?.reviewCompliance ?? 0) >= 50 ? '#f59e0b' : '#ef4444'
              "
            />
          </div>
        </div>
        <div class="kb-stat" style="--kb-accent: #ef4444">
          <div class="kb-stat__icon">⛔</div>
          <div class="kb-stat__body">
            <div class="kb-stat__value">{{ (kbStats?.deprecated ?? 0) + (kbStats?.archived ?? 0) }}</div>
            <div class="kb-stat__label">Deprecated / Archived</div>
            <div class="kb-stat__sub">clean up candidates</div>
          </div>
        </div>
        <div class="kb-stat" style="--kb-accent: #7c3aed">
          <div class="kb-stat__icon">🏷️</div>
          <div class="kb-stat__body">
            <div class="kb-stat__value">{{ kbUniqueTags }}</div>
            <div class="kb-stat__label">Unique Tags</div>
            <div class="kb-stat__sub">{{ kbTopTag }} · Top Tag</div>
          </div>
        </div>
      </section>

      <div class="rl-kb__body">
        <!-- Sidebar: domains + role + structural tag breakdown -->
        <nav class="rl-kb__sidebar" aria-label="Knowledge domains navigation">
          <div class="rl-kb__sidebar-group">
            <div class="rl-kb__sidebar-head">
              <span>🧭 Domains</span>
              <el-tag
                v-if="kbActiveDomains.length"
                size="small"
                effect="light"
                type="primary"
                round
                closable
                @close="kbClearDomainFilter"
              >{{ kbActiveDomains.length }}/{{ kbSubdirs.length }}</el-tag>
            </div>
            <div class="rl-kb__sidebar-list">
              <el-tooltip
                v-for="dir in kbSubdirs"
                :key="dir.id"
                :content="dir.desc || dir.label"
                placement="right"
                :show-after="350"
              >
                <button
                  type="button"
                  class="rl-kb__sidebar-item"
                  :class="{
                    'is-active': kbIsDomainActive(dir.id),
                    'has-data': (kbFileCounts[dir.id] ?? 0) > 0
                  }"
                  @click="kbToggleDomain(dir.id)"
                >
                  <span class="rl-kb__sidebar-icon" :style="{ color: dir.color }">{{ dir.icon }}</span>
                  <span class="rl-kb__sidebar-main">
                    <span class="rl-kb__sidebar-label">{{ dir.label }}</span>
                    <span class="rl-kb__sidebar-sub">
                      ✔ {{ kbStableCount(dir.id) }} stable ·
                      <em>{{ kbStructuralTagCount(dir.id) }} struct</em>
                    </span>
                  </span>
                  <span class="rl-kb__sidebar-count">{{ kbFileCounts[dir.id] ?? 0 }}</span>
                </button>
              </el-tooltip>
            </div>
          </div>

          <!-- Structural tags / role-specific corpus highlights -->
          <div class="rl-kb__sidebar-group">
            <div class="rl-kb__sidebar-head">
              <span>🧩 Structural Tags</span>
              <el-tag size="small" effect="plain" type="info" round>{{ kbStructuralTagTotals }} total</el-tag>
            </div>
            <div class="rl-kb__sidebar-list rl-kb__sidebar-list--chips">
              <button
                v-for="t in kbStructuralTags"
                :key="t.tag"
                type="button"
                class="rl-kb__sidebar-item rl-kb__sidebar-item--chip"
                :class="{ 'is-active': kbFilters.structuralTag === t.tag }"
                @click="kbToggleStructuralTag(t.tag)"
              >
                <span class="rl-kb__sidebar-label">{{ t.tag }}</span>
                <span class="rl-kb__sidebar-count">{{ t.count }}</span>
              </button>
            </div>
          </div>

          <div class="rl-kb__sidebar-group">
            <div class="rl-kb__sidebar-head">
              <span>👔 Role</span>
              <el-tag
                v-if="kbFilters.role"
                size="small"
                effect="light"
                type="success"
                round
                closable
                @close="kbFilters.role = ''"
              >{{ kbFilters.role }}</el-tag>
            </div>
            <div class="rl-kb__sidebar-list">
              <button
                v-for="r in meta.roles"
                :key="r.id"
                type="button"
                class="rl-kb__sidebar-item rl-kb__sidebar-item--chip"
                :class="{ 'is-active': kbFilters.role === r.id }"
                :style="{ '--rl-kb-color': r.color }"
                @click="kbFilters.role = kbFilters.role === r.id ? '' : r.id"
              >
                <span class="rl-kb__sidebar-icon">{{ r.icon }}</span>
                <span class="rl-kb__sidebar-label">{{ r.label }}</span>
                <span class="rl-kb__sidebar-count">{{ kbRoleCounts[r.id] ?? 0 }}</span>
              </button>
            </div>
          </div>

          <div class="rl-kb__sidebar-group">
            <div class="rl-kb__sidebar-head">
              <span>🏷 Quick</span>
            </div>
            <div class="rl-kb__sidebar-list rl-kb__sidebar-list--chips">
              <button
                type="button"
                class="rl-kb__sidebar-item rl-kb__sidebar-item--chip"
                :class="{ 'is-active': kbQuick === 'todo' }"
                @click="kbSetQuick('todo')"
              >🎯 Todo</button>
              <button
                type="button"
                class="rl-kb__sidebar-item rl-kb__sidebar-item--chip"
                :class="{ 'is-active': kbQuick === 'wip' }"
                @click="kbSetQuick('wip')"
              >🔧 Work In Progress</button>
              <button
                type="button"
                class="rl-kb__sidebar-item rl-kb__sidebar-item--chip"
                :class="{ 'is-active': kbQuick === 'need-review' }"
                @click="kbSetQuick('need-review')"
              >👓 Need Review</button>
              <button
                type="button"
                class="rl-kb__sidebar-item rl-kb__sidebar-item--chip"
                :class="{ 'is-active': kbQuick === 'stale' }"
                @click="kbSetQuick('stale')"
              >⏰ Review Stale</button>
              <button
                type="button"
                class="rl-kb__sidebar-item rl-kb__sidebar-item--chip"
                :class="{ 'is-active': kbQuick === 'archived' }"
                @click="kbSetQuick('archived')"
              >📦 Archived</button>
            </div>
          </div>
        </nav>

        <!-- Table: file browser -->
        <div class="rl-kb__content">
          <!-- ════════════════════════════════════════════
               Toolbar (v2) — per-column filter inputs
               对齐 RoleTableView header-search pattern
          ════════════════════════════════════════════ -->
          <div class="rl-kb__toolbar">
            <el-input
              v-model="kbFilters.titleKeyword"
              size="small"
              placeholder="🔍 Search Title / File Path / Tags"
              :prefix-icon="Search"
              clearable
              class="rl-kb__search"
            />
            <el-select
              v-model="kbFilters.domainText"
              size="small"
              placeholder="Domain"
              class="rl-kb__filter"
              clearable
              filterable
            >
              <el-option
                v-for="d in kbSubdirs"
                :key="d.id"
                :value="d.label"
                :label="`${d.icon} ${d.label}`"
              />
            </el-select>
            <el-select
              v-model="kbFilters.type"
              size="small"
              placeholder="Type"
              class="rl-kb__filter"
              clearable
              filterable
            >
              <el-option
                v-for="v in kbTypeValues"
                :key="v"
                :value="v"
                :label="v"
              />
            </el-select>
            <el-select
              v-model="kbFilters.status"
              size="small"
              placeholder="Status"
              class="rl-kb__filter"
              clearable
            >
              <el-option
                v-for="v in kbStatusValues"
                :key="v"
                :value="v"
                :label="v"
              />
            </el-select>
            <el-select
              v-model="kbFilters.lifecycle"
              size="small"
              placeholder="Lifecycle"
              class="rl-kb__filter"
              clearable
            >
              <el-option
                v-for="v in kbLifecycleValues"
                :key="v"
                :value="v"
                :label="v"
              />
            </el-select>
            <el-select
              v-model="kbFilters.review"
              size="small"
              placeholder="Review Cycle"
              class="rl-kb__filter"
              clearable
            >
              <el-option
                v-for="v in kbReviewValues"
                :key="v"
                :value="v"
                :label="v"
              />
            </el-select>
            <el-select
              v-model="kbSort"
              size="small"
              placeholder="Sort"
              class="rl-kb__sort"
            >
              <el-option value="default">Default</el-option>
              <el-option value="maturity_desc">Maturity ↓</el-option>
              <el-option value="size_asc">Size ↑</el-option>
              <el-option value="size_desc">Size ↓</el-option>
              <el-option value="updated_desc">Updated ↓</el-option>
              <el-option value="updated_asc">Updated ↑</el-option>
            </el-select>
          </div>

          <!-- Active filter chips bar → ExecutiveDashboard chip-stack pattern -->
          <div v-if="kbAnyFilter" class="rl-kb__chips">
            <span class="rl-kb__chips-label">Active filters：</span>
            <el-tag
              v-for="chip in kbActiveChips"
              :key="chip.key"
              size="small"
              :type="chip.type"
              effect="light"
              closable
              @close="chip.onClose"
            >{{ chip.label }}</el-tag>
            <el-button
              size="small"
              text
              type="primary"
              @click="kbResetAll"
            >Clear All</el-button>
          </div>

          <ProTable
            ref="kbFileTableRef"
            :columns="kbFileColumns"
            :request-api="kbFileTableFetch"
            :init-param="kbFileTableInitParam"
            :data-callback="kbFileTableTransform"
            :tool-button="false"
            :search-show="false"
            :page-show="true"
            :default-page-size="10"
            row-key="path"
          >
            <template #title="{ row }">
              <div class="rl-kb__file-title" @click="kbOpenFile(row)">
                <span class="rl-kb__file-icon">{{ kbFileIcon(row) }}</span>
                <div class="rl-kb__file-title-main">
                  <div class="rl-kb__file-name-row">
                    <span class="rl-kb__file-name">{{ row.title }}</span>
                    <el-tag
                      v-if="row.okrRef"
                      size="small"
                      type="warning"
                      effect="dark"
                      class="rl-kb__file-okr"
                    >🎯 {{ row.okrRef }}</el-tag>
                    <el-tag
                      v-if="row.isStructural"
                      size="small"
                      type="primary"
                      effect="plain"
                      class="rl-kb__file-tag rl-kb__file-tag-structural"
                      round
                    >Structural</el-tag>
                  </div>
                  <span class="rl-kb__file-path">{{ row.path }}</span>
                  <div v-if="row.benefit" class="rl-kb__file-benefit">
                    💡 {{ row.benefit }}
                  </div>
                </div>
              </div>
            </template>

            <template #domain="{ row }">
              <span class="rl-kb__file-domain" :style="{ color: row.domainColor ?? 'inherit' }">
                <span>{{ row.domainIcon }}</span>
                <span>{{ row.domain }}</span>
              </span>
            </template>

            <template #category="{ row }">
              <el-tag
                v-if="row.category"
                size="small"
                type="primary"
                effect="plain"
              >{{ row.category }}</el-tag>
              <span v-else class="rl-muted">—</span>
            </template>

            <template #tags="{ row }">
              <div class="rl-kb__file-tags">
                <el-tag
                  v-for="t in (row.tags ?? []).slice(0, 3)"
                  :key="t"
                  size="small"
                  effect="plain"
                  round
                >{{ t }}</el-tag>
                <el-tag
                  v-if="(row.tags ?? []).length > 3"
                  size="small"
                  type="info"
                  effect="plain"
                  round
                >+{{ (row.tags ?? []).length - 3 }}</el-tag>
                <span v-if="!row.tags?.length" class="rl-muted">—</span>
              </div>
            </template>

            <template #type="{ row }">
              <el-tag
                v-if="row.type"
                :type="kbTagTypeOf(row.type, 'type')"
                size="small"
              >{{ row.type }}</el-tag>
              <span v-else class="rl-muted">—</span>
            </template>

            <template #status="{ row }">
              <el-tag
                v-if="row.status"
                :type="kbTagTypeOf(row.status, 'status')"
                size="small"
              >{{ row.status }}</el-tag>
              <span v-else class="rl-muted">—</span>
            </template>

            <template #lifecycle="{ row }">
              <el-tag
                v-if="row.lifecycle"
                :type="kbTagTypeOf(row.lifecycle, 'lifecycle')"
                size="small"
              >{{ row.lifecycle }}</el-tag>
              <span v-else class="rl-muted">—</span>
            </template>

            <template #review="{ row }">
              <div v-if="row.reviewCycle || row.review" class="rl-kb__review-cell">
                <el-tag
                  :type="kbTagTypeOf(row.reviewCycle || row.review || '', 'review')"
                  size="small"
                >{{ row.reviewCycle || row.review }}</el-tag>
                <span
                  v-if="row.reviewStale"
                  class="rl-kb__review-stale"
                  title="Last updated outside review_cycle threshold"
                >⏰ stale</span>
              </div>
              <span v-else class="rl-muted">—</span>
            </template>

            <template #size="{ row }">
              <span class="rl-kb__file-size">{{ formatKbSize(row.size) }}</span>
            </template>

            <template #updatedAt="{ row }">
              <div class="rl-kb__file-updated-wrap">
                <span class="rl-kb__file-updated">{{ row.updatedAt ?? '—' }}</span>
                <span
                  v-if="row.stalenessDays != null"
                  class="rl-kb__file-staleness"
                  :class="[
                    row.reviewStale ? 'rl-kb__file-staleness--overdue' : '',
                    !row.reviewStale && row.stalenessDays >= 14 ? 'rl-kb__file-staleness--warn' : ''
                  ]"
                >
                  · {{ row.stalenessDays }}d
                </span>
              </div>
            </template>

            <template #operation="{ row }">
              <el-button
                size="small"
                text
                type="primary"
                @click="kbOpenFile(row)"
              >Preview</el-button>
              <el-button
                v-if="row.okAnchor"
                size="small"
                text
                type="success"
                @click="kbOpenAnchor(row.okAnchor)"
              >KR</el-button>
              <el-popconfirm
                :title="`Delete ${row.name || row.path}?`"
                @confirm="kbDeleteFile(row)"
              >
                <template #reference>
                  <el-button size="small" text type="danger">Del</el-button>
                </template>
              </el-popconfirm>
            </template>
          </ProTable>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════
         §7 Edit / Create Dialog
    ═══════════════════════════════════════════════ -->
    <el-dialog
      v-model="dialogVisible"
      :title="form.id ? 'Edit Reading Item' : 'New Reading Item'"
      width="720px"
      class="reading-list__dialog"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-width="120px"
      >
        <el-form-item label="Title" prop="title">
          <el-input v-model="form.title" placeholder="书名 / 论文标题 / 文章标题" />
        </el-form-item>
        <el-form-item label="Subtitle">
          <el-input v-model="form.subtitle" placeholder="英文副标题 / 简称" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="Author" prop="author">
              <el-input v-model="form.author" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Type" prop="type">
              <el-select v-model="form.type" class="is-wide">
                <el-option
                  v-for="t in meta.types"
                  :key="t.id"
                  :value="t.id"
                  :label="`${t.icon} ${t.label}`"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="Dimension" prop="dimension">
              <el-select v-model="form.dimension" class="is-wide">
                <el-option
                  v-for="d in meta.dimensions"
                  :key="d.id"
                  :value="d.id"
                  :label="`${d.icon} ${d.label} ${d.en}`"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Owner Role" prop="ownerRole">
              <el-select v-model="form.ownerRole" class="is-wide">
                <el-option
                  v-for="r in meta.roles"
                  :key="r.id"
                  :value="r.id"
                  :label="`${r.icon} ${r.label}`"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="Priority" prop="priority">
              <el-select v-model="form.priority" class="is-wide">
                <el-option
                  v-for="p in meta.priorities"
                  :key="p.id"
                  :value="p.id"
                  :label="p.label"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Status" prop="status">
              <el-select v-model="form.status" class="is-wide">
                <el-option
                  v-for="s in meta.statuses"
                  :key="s.id"
                  :value="s.id"
                  :label="s.label"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Progress %">
              <el-slider
                v-model="form.progress"
                :min="0"
                :max="100"
                :step="1"
                show-input
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="RICE Final">
              <el-slider
                v-model="form.riceFinal"
                :min="0"
                :max="100"
                :step="1"
                show-input
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Scheduled Month">
              <el-date-picker
                v-model="form.scheduledMonth"
                type="month"
                value-format="YYYY-MM"
                placeholder="Pick a month"
                class="is-wide"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-divider content-position="left">RICE 四元组（任意字段变化 → 自动同步 RICE Final）</el-divider>
        <el-row :gutter="16">
          <el-col :span="6">
            <el-form-item label="Reach" prop="reach">
              <el-input-number
                v-model="form.reach"
                :min="0"
                :max="100"
                :step="1"
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="Impact" prop="impact">
              <el-input-number
                v-model="form.impact"
                :min="0"
                :max="100"
                :step="1"
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="Confidence" prop="confidence">
              <el-input-number
                v-model="form.confidence"
                :min="0"
                :max="100"
                :step="1"
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="Effort" prop="effort">
              <el-input-number
                v-model="form.effort"
                :min="1"
                :max="100"
                :step="1"
                controls-position="right"
                style="width: 100%"
              />
              <div class="rl-form-hint">Effort 越低 → RICE 越高（作为除法分母）</div>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="OKR id">
          <el-input v-model="form.okrId" placeholder="e.g. exec-002-03" />
        </el-form-item>
        <el-form-item label="Note Key (KB)">
          <el-input
            v-model="form.noteKey"
            placeholder="executive/reading-list/010-阅读-读书笔记-卓有成效的管理者"
          />
        </el-form-item>
        <el-form-item label="External URL">
          <el-input v-model="form.externalUrl" placeholder="可选：外部 PDF / URL" />
        </el-form-item>
        <el-form-item label="Tags">
          <el-select
            v-model="form.tags"
            multiple
            filterable
            allow-create
            default-first-option
            class="is-wide"
          />
        </el-form-item>
        <el-form-item label="Summary">
          <el-input
            v-model="form.summary"
            type="textarea"
            :rows="3"
            placeholder="一句话 So-What。"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" :loading="saving" @click="saveForm">
          {{ saving ? "Saving…" : "Save" }}
        </el-button>
      </template>
    </el-dialog>

    <!-- ═══════════════════════════════════════════════
         §7 Knowledge Preview (SSOT — 不再 window.open)
    ═══════════════════════════════════════════════ -->
    <KnowledgePreviewDialog
      ref="kbPreviewRef"
      @closed="kbPreviewPath = ''"
    />

    <!-- ═══════════════════════════════════════════════
         §8 快捷键图例（页脚 sticky，折叠展开）
         ⌘N 新建  ⌘D 折叠仪表盘  ⌥K 聚焦搜索  ⌥1/2/3 视图切换  ⌘K 全局命令面板
    ═══════════════════════════════════════════════ -->
    <div class="rl-shortcut-legend" :class="{ 'is-collapsed': legendCollapsed }">
      <button
        class="rl-shortcut-legend__toggle"
        type="button"
        @click="legendCollapsed = !legendCollapsed"
        :title="legendCollapsed ? '展开快捷键图例' : '折叠快捷键图例'"
      >
        <span v-if="legendCollapsed">⌨ 快捷键</span>
        <span v-else>收起</span>
      </button>
      <div v-show="!legendCollapsed" class="rl-shortcut-legend__chips">
        <span class="rl-shortcut-chip">
          <kbd>⌘</kbd><kbd>N</kbd>
          <small>新建条目</small>
        </span>
        <span class="rl-shortcut-chip">
          <kbd>⌘</kbd><kbd>D</kbd>
          <small>折叠仪表盘</small>
        </span>
        <span class="rl-shortcut-chip">
          <kbd>⌥</kbd><kbd>K</kbd>
          <small>聚焦搜索</small>
        </span>
        <span class="rl-shortcut-chip">
          <kbd>⌥</kbd><kbd>1</kbd>
          <small>卡片视图</small>
        </span>
        <span class="rl-shortcut-chip">
          <kbd>⌥</kbd><kbd>2</kbd>
          <small>列表视图</small>
        </span>
        <span class="rl-shortcut-chip">
          <kbd>⌥</kbd><kbd>3</kbd>
          <small>表格视图</small>
        </span>
        <span class="rl-shortcut-chip rl-shortcut-chip--muted">
          <kbd>⌘</kbd><kbd>K</kbd>
          <small>全局命令面板</small>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="readingList">
import {
  ArrowDown,
  Connection,
  Grid,
  Plus,
  Refresh,
  Search,
  Upload
} from "@element-plus/icons-vue";
import type { FormInstance, FormRules } from "element-plus";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  computed,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  shallowRef,
  unref,
  watch,
  nextTick,
  type ComputedRef
} from "vue";
import { useRouter } from "vue-router";

import ProTable from "@/components/ProTable/index.vue";
import type { ColumnProps, ProTableInstance, RenderScope } from "@/components/ProTable/interface";
import KnowledgePreviewDialog from "@/components/KnowledgePreviewDialog/KnowledgePreviewDialog.vue";
import EmptyState from "@/components/EmptyState/EmptyState.vue";

import {
  READING_META,
  computeRiceFinal,
  riceTierOf,
  type ReadingAggregateStats,
  type ReadingDimension,
  type ReadingItem,
  type ReadingListQuery,
  type ReadingPriority,
  type ReadingRole,
  type ReadingStatus,
  type ReadingType,
  type RICETier
} from "@/api/modules/readingListService";

/** UI 层 rice → 四元组补全（保存 & 渲染 统一）。 */
function makeRice(final: number | undefined | null): { reach: number; impact: number; confidence: number; effort: number; final: number } {
  const f = Math.max(0, Math.min(100, Number.isFinite(final as number) ? (final as number) : 70));
  return { reach: f, impact: f, confidence: Math.min(100, f + 5), effort: Math.max(20, 100 - (f >> 1)), final: f };
}

import {
  useReadingListKnowledgeSource,
  type AlertRow,
  type CrossBookInsight,
  type DistillStep,
  type FutureQueueItem,
  type OKRSupportGroup,
  type SLOCard
} from "./composables/useReadingListKnowledgeSource";

import { useRoleDashboard, type FlatFileRow } from "../composables/useRoleDashboard";
import type { SubdirDef } from "../roleConfig";

/* Link Factory 三闸门契约：禁止组件内拼接 URL；所有点击统一
 * 过 resolveLink → gateB → gateC。CRR ≥ 99%。 */
import {
  gateBEntityExists,
  gateCPostNavigate,
  resolveLink,
  type ResolveLinkInput
} from "@/utils/linkFactory";
import { pushReliabilityEvent } from "@/utils/reliability/reliabilityMetrics";
import { useCommandPalette } from "@/composables/useCommandPalette";

const router = useRouter();
const palette = useCommandPalette();

/* ───────────────────────────────────────────────────────────────
 *  §0 数据层 — 完全委托给 SSOT composable
 * ─────────────────────────────────────────────────────────────── */
const store = useReadingListKnowledgeSource({ timeoutMs: 12_000, allowFallback: true });
const meta = READING_META;

const metaMap = {
  type: Object.fromEntries(meta.types.map((t) => [t.id, `${t.label}`])) as Record<ReadingType, string>,
  priority: Object.fromEntries(meta.priorities.map((p) => [p.id, p.label])) as Record<
    ReadingPriority,
    string
  >,
  status: Object.fromEntries(meta.statuses.map((s) => [s.id, s.label])) as Record<
    ReadingStatus,
    string
  >,
  dimension: Object.fromEntries(meta.dimensions.map((d) => [d.id, `${d.label} ${d.en}`])) as Record<
    ReadingDimension,
    string
  >,
  role: Object.fromEntries(meta.roles.map((r) => [r.id, r.label])) as Record<ReadingRole, string>
};

/* ───────────────────────────────────────────────────────────────
 *  §1 UI state
 * ─────────────────────────────────────────────────────────────── */
const stickyIcon = "📚";
const viewMode = ref<"card" | "list" | "table">("list");
const dashboardCollapsed = ref(false);
const riceFilterTier = ref<RICETier | "">("");
const legendCollapsed = ref(false);

const query = reactive({
  keyword: "",
  status: "all" as ReadingStatus | "all" | "done-group",
  type: "all" as ReadingType | "all",
  priority: "all" as ReadingPriority | "all",
  dimension: "all" as ReadingDimension | "all",
  role: "all" as ReadingRole | "all",
  scheduledMonth: undefined as string | undefined
});

const kbPreviewRef = shallowRef<InstanceType<typeof KnowledgePreviewDialog> | null>(null);
const kbPreviewPath = ref("");
const searchInputRef = ref<any>(null);
const proTable = ref<ProTableInstance>();
const syncing = ref(false);

const dialogVisible = ref(false);
const saving = ref(false);
const formRef = ref<FormInstance>();

interface ReadingFormModel {
  id?: string;
  title: string;
  subtitle: string;
  author: string;
  type: ReadingType;
  dimension: ReadingDimension;
  ownerRole: ReadingRole;
  priority: ReadingPriority;
  status: ReadingStatus;
  progress: number;
  reach: number;
  impact: number;
  confidence: number;
  effort: number;
  riceFinal: number;
  scheduledMonth?: string;
  okrId: string;
  noteKey: string;
  externalUrl: string;
  tags: string[];
  summary: string;
}

const form = reactive<ReadingFormModel>({
  title: "",
  subtitle: "",
  author: "",
  type: "book",
  dimension: "management",
  ownerRole: "ceo",
  priority: "medium",
  status: "queued",
  progress: 0,
  reach: 70,
  impact: 70,
  confidence: 75,
  effort: 65,
  riceFinal: 70,
  scheduledMonth: undefined,
  okrId: "",
  noteKey: "",
  externalUrl: "",
  tags: [],
  summary: ""
});

/** 表单 rice 四元组 → riceFinal。改变任一个都会重新计算 riceFinal，但用户手动动 riceFinal 时会走 makeRice 反推。 */
function recomputeRiceFinalFromFour() {
  const v = computeRiceFinal({
    reach: form.reach,
    impact: form.impact,
    confidence: form.confidence,
    effort: form.effort,
    final: form.riceFinal
  });
  if (Number.isFinite(v)) form.riceFinal = Math.max(0, Math.min(100, Math.round(v)));
}

/** 监听 rice 四元组变化，自动同步 riceFinal（注意：不反向联动 riceFinal，避免死循环）。 */
const RICE_FOUR_KEYS = ["reach", "impact", "confidence", "effort"] as const;
for (const k of RICE_FOUR_KEYS) {
  watch(
    () => form[k],
    () => {
      if (riceEditGuard.value) return;
      try {
        riceEditGuard.value = true;
        recomputeRiceFinalFromFour();
      } finally {
        riceEditGuard.value = false;
      }
    }
  );
}
/** 用户手动拖动 riceFinal → 用 makeRice(final) 反向填充 4 字段。 */
const riceEditGuard = ref(false);
watch(
  () => form.riceFinal,
  (nv) => {
    if (riceEditGuard.value) return;
    try {
      riceEditGuard.value = true;
      const r = makeRice(nv);
      form.reach = r.reach;
      form.impact = r.impact;
      form.confidence = r.confidence;
      form.effort = r.effort;
    } finally {
      riceEditGuard.value = false;
    }
  }
);

const formRules: FormRules = {
  title: [{ required: true, message: "请输入标题", trigger: "blur" }],
  type: [{ required: true, message: "请选择 Type", trigger: "change" }],
  dimension: [{ required: true, message: "请选择维度", trigger: "change" }],
  ownerRole: [{ required: true, message: "请选择 Owner Role", trigger: "change" }],
  priority: [{ required: true, message: "请选择优先级", trigger: "change" }],
  status: [{ required: true, message: "请选择状态", trigger: "change" }]
};

/* ───────────────────────────────────────────────────────────────
 *  §2 派生
 * ───────────────────────────────────────────────────────────────
 *  重要：store 由 composable 返回的 reactive({...}) 构造：
 *   - refs (sourceKind/sourceMode/loading/error) 被 reactive auto-unwrap，
 *   - 内部 computed (items/stats/byRole) 也被 reactive auto-unwrap，
 *  所以组件层禁止写 store.<key>.value；否则会读 undefined 导致 TypeError 白屏。
 */
const stats: ComputedRef<ReadingAggregateStats> = computed(
  () => store.stats as unknown as ReadingAggregateStats
);
const sourceKindLabel = computed(() => {
  const k = store.sourceKind as unknown as string;
  if (k === "backend") return "Live YiAi DB";
  if (k === "cache") return "Local Cache";
  if (k === "kb") return "YiKnowledge 目录";
  return "Built-in Seed";
});
function isSourceKB() {
  return (store.sourceMode as unknown as string) === "kb";
}
async function switchSourceMode(m: "db" | "kb") {
  try {
    await store.setSourceMode(m);
    proTable.value?.getTableList?.();
    ElMessage.success(m === "kb" ? "已切换到 YiKnowledge 文件源" : "已切换到 YiAi DB 源");
  } catch (e) {
    ElMessage.warning(e instanceof Error ? e.message : "数据源切换失败");
  }
}
const activeDimensionCount = computed(
  () => meta.dimensions.reduce((acc, d) => acc + ((stats.value.dimensions?.[d.id] ?? 0) > 0 ? 1 : 0), 0)
);
const viewModeLabel = computed(() => {
  if (viewMode.value === "table") return "Table · ⌥3";
  if (viewMode.value === "card") return "Card · ⌥2";
  return "List · ⌥1";
});
const currentViewLabel = computed(
  () => (viewMode.value === "table" ? "Table View" : viewMode.value === "card" ? "List View" : "Card View")
);

const scheduledMonthList = computed<string[]>(() => {
  const months = new Set<string>();
  for (const m of Object.keys(stats.value.schedule ?? {})) {
    if (/^\d{4}-\d{2}$/.test(m)) months.add(m);
  }
  const fallback = ["2026-07", "2026-08", "2026-09", "2026-10", "2026-11", "2026-12"];
  fallback.forEach((m) => months.add(m));
  return Array.from(months).sort();
});

function filteredBy(override: Partial<ReadingListQuery>): ReadingItem[] {
  const q = { ...query, ...override } as ReadingListQuery;
  if (query.status === "done-group") {
    q.status = "all";
  }
  if (riceFilterTier.value !== "") {
    // 通过外层二次过滤实现
    const tier = riceFilterTier.value;
    return store.filter(q).filter((it) => riceTierOf(it.rice?.final ?? 0) === tier);
  }
  const list = store.filter(q);
  if (query.status === "done-group") {
    return list.filter((it) => it.status === "distilled" || it.status === "reviewed" || it.status === "archived");
  }
  return list;
}

const visibleItems = computed<ReadingItem[]>(() => filteredBy({}));

/* --- 9 大面板内容：静态部分由 v3.2 数据契约 + 动态数据派生 --- */
const sloCards: SLOCard[] = [
  {
    id: "K1",
    status: "warning",
    title: "7 高管 × 3 月 精读完成率 (KR 003-02)",
    context: "原口径 5/5；新 v3.2 口径 7×3=21 计 28.6%",
    actual: "原口径 100% / 新 28.6%",
    target: "100% (原口径)",
    anchor: "001.md §1.1 K1"
  },
  {
    id: "K2",
    status: "success",
    title: "每本精读 行动项数 (KR 003-03 ≥3)",
    context: "Grove5·Forsgren6·Rumelt4·Horowitz4·Skelton3 加权",
    actual: "4.2 / 本",
    target: "≥ 3 / 本",
    anchor: "001.md §1.1 K2"
  },
  {
    id: "K3",
    status: "success",
    title: "每本精读 蒸馏知识叶 (KR 003-04 ≥5)",
    context: "roadmap / strategy / projects / leader / curator 5+",
    actual: "5.4 / 本",
    target: "≥ 5 / 本",
    anchor: "001.md §1.1 K3"
  },
  {
    id: "K4",
    status: "warning",
    title: "阅读→蒸馏 转化率 (KR 003-05 ≥80%)",
    context: "20 Shipped / 25 总行动项（踩线）",
    actual: "80.0%",
    target: "≥ 80%",
    anchor: "001.md §1.1 K4 + §1.3"
  },
  {
    id: "K5",
    status: "success",
    title: "L1 洞察 + L2 框架 占比 (KR 003-01 ≥40%)",
    context: "6 Book 中 1 L1 + 5 L2 = 100%",
    actual: "6/6 = 100%",
    target: "≥ 40%",
    anchor: "001.md §1.1 K5"
  },
  {
    id: "K6",
    status: "success",
    title: "跨书 高置信洞察数 (Q3 新增 ≥8)",
    context: "§8 矩阵 I-01 ~ I-12 全 5 ★",
    actual: "12 条",
    target: "≥ 8",
    anchor: "001.md §1.1 K6 + §8"
  },
  {
    id: "K-06",
    status: "success",
    title: "⭐ 剑指前端 Offer 5 人共读完成率",
    context: "VP Eng/CTO/SRE/QA/Security 5 人 × 4 周节奏",
    actual: "基线建立 (11/30 DDL)",
    target: "≥ 80% (4/5) L2+L3",
    anchor: "001.md §1.5 K-06"
  },
  {
    id: "K-07",
    status: "warning",
    title: "⭐ 前端性能 3 选 2 达标率",
    context: "YiVad LCP≤2s · HMR≤650ms · 前端 Bug-30%",
    actual: "押注项",
    target: "3 中 2 达标（3 项全过=学透）",
    anchor: "001.md §1.5 K-07 + 009 A-07"
  },
  {
    id: "K-08",
    status: "warning",
    title: "⭐⭐ Drucker 5 习惯 3 选 2 落地率",
    context: "整块时间≥25% · 三维度覆盖≥90% · 决策闭环≥85%",
    actual: "管理基石（最高优先 KPI）",
    target: "3 中 2 (3/3=学透；≤1=假学)",
    anchor: "001.md §1.5 K-08 + 010 A-01~A-07"
  }
];

const alerts: AlertRow[] = [
  {
    level: "danger",
    title: "《信通院 AI 合规白皮书》10 月泛读 10/09 仍 Queued（应 Reading）；10-31 DDL 紧张",
    description: "DDL: 2026-10-12 (3 天内切到 Reading)",
    owner: "CPO · Security Lead"
  },
  {
    level: "warning",
    title: "NIST SP 800-160 Vol.2 (Security+SRE)",
    description: "Actionized → Distilled 超 14d 红线，缺 2 条真实知识叶写入。"
  }
];

const crossBookInsights: CrossBookInsight[] = [
  {
    id: "I-01",
    stars: 5,
    text:
      "管理杠杆率 > 个人产出：团队效能来自系统能力 × 下属产出 × 横向影响，而非高层个人加班。",
    books: ["高产出管理", "创业维艰", "优雅的难题", "加速", "西蒙学习法"],
    decision: "exec-002-01 中层杠杆率≥30%",
    anchor: "vp eng roadmap §4 engineer/run/010 排期"
  },
  {
    id: "I-02",
    stars: 5,
    text:
      "好战略 = 诊断 + 取舍 + 连贯行动（≠ 目标/口号）；取舍=Drucker 要事优先 4 原则 + 加一=停一。",
    books: ["好战略坏战略", "创业维艰", "蓝海战略", "持续发现习惯", "卓有成效的管理者"],
    decision: "exec-001-02 战略 3 年定位 · exec-003-01 L1+L2≥40%",
    anchor: "OKR 方法论 §1 年度战略 §2 010 §5.3 3×4 取舍"
  },
  {
    id: "I-03",
    stars: 5,
    text: "组织设计决定系统设计（康威定律）：先改团队边界/交互模式再改架构，反向几乎必败。",
    books: ["团队拓扑", "加速", "技术专家之路", "优雅的难题", "剑指前端 offer"],
    decision: "exec-002-02 流对齐团队",
    anchor: "roadmap/009 组织设计 技术职级通道"
  },
  {
    id: "I-04",
    stars: 5,
    text: "DORA 4 指标是唯一工程效能的客观度量；其他度量都会触发 Goodhart 定律。",
    books: ["加速", "SRE Workbook", "How Google Tests", "NIST SP800-160", "西蒙学习法"],
    decision: "exec-002-03 部署频率 ×2",
    anchor: "YiVad §6 DORA quality DORA 看板"
  },
  {
    id: "I-05",
    stars: 5,
    text: "SLO 必须来自真实用户视角；Burn Rate 4 级错误预算是发布门禁的唯一客观依据。",
    books: ["加速", "SRE Workbook", "NIST SP800-160", "团队拓扑"],
    decision: "exec-002-04 SRE & 安全 · exec-003-05 转化率≥80%",
    anchor: "YiPot §16 SRE 指标 YiPot §16.2 BurnRate"
  },
  {
    id: "I-06",
    stars: 5,
    text: "数据驱动 > 直觉驱动，但度量 ≠ 目标；必须区分度量 KPI 与激励目标。",
    books: ["高产出管理", "创业维艰", "加速", "逃离构建陷阱", "西蒙学习法", "剑指前端 offer"],
    decision: "exec-002-01 管理升级 · exec-003-05 防 KPI 异化",
    anchor: "curator/008 KPI 设计 OKR §3 避免 KPI"
  },
  {
    id: "I-07",
    stars: 5,
    text: "零信任插件 = Ed25519 三级 PKI 签名 + 16 项 CAP 白名单 + FS RBAC 6×4 矩阵，三者缺一不可。",
    books: ["NIST 800-53", "OWASP ASVS 10", "OSSRA 2026", "加速"],
    decision: "exec-002-04 安全体系",
    anchor: "YiPot §17 零信任沙箱 YiPot §17.3 FS RBAC"
  },
  {
    id: "I-08",
    stars: 5,
    text: "产品铁三角 = 价值 × 可行 × 可用，配合 JTBD + 每周≥5 客户访谈，才能逃离构建陷阱。",
    books: ["启示录 2ed", "持续发现习惯", "逃离构建陷阱", "赋能", "卓有成效的管理者"],
    decision: "exec-001-02 产品战略框架 · exec-003-04 蒸馏≥5/本",
    anchor: "PRD 模板 §1 §2 JTBD 框架 010 §1.1 D3 贡献三维度"
  },
  {
    id: "I-09",
    stars: 5,
    text: "GameDay 必须在生产做（渐进式小颗粒）；预发演练收益只有生产的 15%。",
    books: ["SRE Workbook", "NIST SP800-160", "团队拓扑", "卓有成效的管理者"],
    decision: "exec-002-03 MTTR ≤15min · exec-002-04 安全 SRE",
    anchor: "YiPot §16.6 GameDay ADR-017 弹性策略 010 §5.1 决策 5 要素"
  },
  {
    id: "I-10",
    stars: 5,
    text: "CEO 困难决策的心理安全 3 要素：写下来 · 留反事实证据 · 有季度复审节点（错了也 60 分）。",
    books: ["创业维艰", "思考快与慢", "西蒙学习法", "好战略坏战略", "卓有成效的管理者"],
    decision: "exec-001-01 决策流程标准化",
    anchor: "leader decisions README 010 §5.1 7 字段铁三角"
  },
  {
    id: "I-11",
    stars: 5,
    text: "松耦合 + 流对齐团队 = 高交付 + 低认知负荷；紧耦合单体部署频率 ÷2.6 失败率 ×3.1。",
    books: ["团队拓扑", "加速", "优雅的难题", "剑指前端 offer"],
    decision: "exec-002-02 流对齐 · exec-002-03 前端 Lead Time -40%",
    anchor: "YiAi §5 6 层松耦合 YiPot §5 IPC 隔离 YiVad §3.2 Tree Shaking"
  },
  {
    id: "I-12",
    stars: 5,
    text: "技术债 = 金融负债（有复利）：利率 × 本金 × DCF 模型量化；债利率 > 投资回报率必须优先还。",
    books: ["逃离构建陷阱", "优雅的难题", "加速", "思考快与慢", "西蒙学习法"],
    decision: "exec-002-03 技术债 ≤15% · exec-003-05 ROI 决策",
    anchor: "tech-debt 治理框架 curator 知识健康看板"
  }
];
const insightsConfidencePct = computed(() =>
  crossBookInsights.length ? Math.round((crossBookInsights.filter((i) => i.stars >= 5).length / crossBookInsights.length) * 100) : 0
);

const okrGroups: OKRSupportGroup[] = [
  {
    id: "exec-001",
    title: "市场情报 & 战略定位",
    items: [
      {
        id: "KR 001-01",
        title: "持续外部情报收集机制（≥12 信号源）",
        books: ["📖 创业维艰", "📖 Gartner MQ", "📖 a16z AI PMF", "📖 信通院合规白皮书"],
        score: 9
      },
      {
        id: "KR 001-02",
        title: "3 年战略定位 + 差异化（可量化）",
        books: ["📖 好战略坏战略", "📖 蓝海战略", "📖 赋能", "📖 持续发现习惯"],
        score: 9
      }
    ]
  },
  {
    id: "exec-002",
    title: "组织效能 & 技术路线",
    items: [
      {
        id: "KR 002-01",
        title: "中层杠杆率 ≥30%",
        books: ["📖 高产出管理", "📖 优雅的难题", "📖 团队拓扑", "📖 卓有成效的管理者", "📖 西蒙学习法"],
        score: 10
      },
      {
        id: "KR 002-02",
        title: "组织结构：流对齐团队 + 认知负荷 ≤3 域",
        books: ["📖 团队拓扑", "📖 优雅的难题", "📖 Staff Engineer 路径"],
        score: 9
      },
      {
        id: "KR 002-03",
        title: "DORA：部署频率 ×2 · 变更失败率 ≤15%",
        books: ["📖 加速（2 遍）", "📖 SRE Workbook", "📖 How Google Tests", "📖 RAG 缓存 Paper", "📖 剑指前端 offer"],
        score: 10
      },
      {
        id: "KR 002-04",
        title: "安全合规：等保 & ISO27001 差距 ≤20 项",
        books: ["📖 NIST 800-160", "📖 ISO 27701", "📖 ISO 27001:2022", "📖 OSSRA", "📖 Gartner AI Hype"],
        score: 10
      }
    ]
  },
  {
    id: "exec-003",
    title: "经营学习 & 知识蒸馏",
    items: [
      {
        id: "KR 003-01",
        title: "L1+L2 洞察 ≥40% 精读本",
        books: ["📖 思考快与慢", "📖 好战略坏战略", "📖 创业维艰", "📖 卓有成效的管理者", "📖 西蒙学习法"],
        score: 10
      },
      {
        id: "KR 003-02",
        title: "7 高管 每人每月 ≥1 本精读 + 笔记（100%）",
        books: ["📖 §2.5 每月 7 行 × 3 月", "📖 CFO/Head-of-People 11 月起新增", "📖 西蒙 21 天节奏"],
        score: 10
      },
      {
        id: "KR 003-03",
        title: "每本精读 ≥3 条 5 字段可执行行动项",
        books: ["📖 §0.1 9 字段验收", "📖 §0.2.2 模板 §4", "📖 西蒙 A3 可证伪标准"],
        score: 10
      },
      {
        id: "KR 003-04",
        title: "每本蒸馏 ≥5 个真实知识叶锚点",
        books: ["📖 §3 蒸馏锚点列", "📖 西蒙 Connect三步法 (CN1≥5,CN2≥2,CN3≥3)"],
        score: 10
      },
      {
        id: "KR 003-05",
        title: "阅读→行动→蒸馏 转化率 ≥80%",
        books: ["📖 §1.1 K4", "📖 §1.3 行动项执行率", "📖 西蒙 A10 拖延治理 + 双回退"],
        score: 9
      }
    ]
  }
];
const okrGroupTotalText = computed(
  () =>
    `${okrGroups.length} Goal · ${okrGroups.reduce((acc, g) => acc + g.items.length, 0)} KR`
);

const distillSteps: DistillStep[] = meta.statuses.map((s, idx) => {
  const ruleMap: Record<ReadingStatus, string> = {
    queued: "RICE≥60 进入 §7 待读队列",
    reading: "每月 1 日评审会锁定本月 7 本",
    noted: "Frontmatter 15 + 6 节齐全",
    actionized: "≥3 条 5 字段行动项",
    distilled: "每条行动项 → 真实知识叶写入",
    reviewed: "月度评审会展示 Shipped 证据",
    archived: "季度末审计 → §3 已完成表"
  };
  const redlineMap: Partial<Record<ReadingStatus, string>> = {
    reading: "≤ 31d",
    actionized: "≤ 1d",
    distilled: "≤ 14d"
  };
  return {
    id: s.id,
    rule: ruleMap[s.id] ?? s.label,
    redline: redlineMap[s.id],
    slaBreached:
      s.id === "actionized" ||
      s.id === "distilled"
        ? (stats.value.statusFunnel?.[s.id] ?? 0) >
          Math.max(1, (stats.value.statusFunnel?.noted ?? 0) * 0.6)
        : false
  };
});

/* Q4 Future Queue — 按 v3.2 静态契约 (§7) */
const futureQueueItems: FutureQueueItem[] = [
  {
    key: "H-01",
    priority: "high",
    title: "《跨越鸿沟》",
    subtitle: "Crossing the Chasm",
    author: "Geoffrey Moore",
    rice: 78,
    dimensionLabel: "战略 Strategy",
    window: "2027-Q1 1 月",
    gate: "进入下月条件: exec-001-02 KR ≥70% 完成"
  },
  {
    key: "H-02",
    priority: "high",
    title: "《创新者的窘境》",
    subtitle: "The Innovator's Dilemma",
    author: "Clayton Christensen",
    rice: 76,
    dimensionLabel: "战略 Strategy",
    window: "2027-Q1 2 月",
    gate: "进入下月条件: 2026 年度战略 Review 完成"
  },
  {
    key: "H-03",
    priority: "high",
    title: "《启示录 第 2 版》",
    subtitle: "Inspired 2ed",
    author: "Marty Cagan",
    rice: 87,
    dimensionLabel: "产品 Product",
    window: "2027-Q1 1 月",
    gate: "进入下月条件: 持续发现习惯 11 月读完"
  },
  {
    key: "H-04",
    priority: "high",
    title: "《蓝海战略扩展版》",
    subtitle: "Blue Ocean Strategy",
    author: "W. Chan Kim",
    rice: 92,
    dimensionLabel: "战略 Strategy",
    window: "2027-Q1 1 月",
    gate: "进入下月条件: 好战略坏战略 Reviewed"
  },
  {
    key: "H-05",
    priority: "high",
    title: "《产品开发流原则》",
    subtitle: "Product Development Flow",
    author: "Don Reinertsen",
    rice: 81,
    dimensionLabel: "产品 Product",
    window: "2027-Q1 2 月",
    gate: "进入下月条件: 逃离构建陷阱 10 月读完"
  },
  {
    key: "H-06",
    priority: "high",
    title: "《Staff Engineer》Will Larson 版",
    author: "Will Larson",
    rice: 79,
    dimensionLabel: "工程 Engineering",
    window: "2027-Q1 2 月",
    gate: "进入下月条件: Staff Engineer Path 11 月读完"
  },
  {
    key: "H-07",
    priority: "high",
    title: "NIST SP 800-63-3 数字身份认证指南",
    author: "NIST",
    rice: 75,
    dimensionLabel: "SRE 运维",
    window: "2027-Q1 1 月",
    gate: "进入下月条件: ISO 27001 读完"
  },
  {
    key: "H-08",
    priority: "high",
    title: "OWASP Top 10 2026 + ASVS 5.0",
    author: "OWASP",
    rice: 83,
    dimensionLabel: "SRE 运维",
    window: "2027-Q1 2 月",
    gate: "进入下月条件: OSSRA 12 月读完"
  },
  {
    key: "M-09",
    priority: "medium",
    title: "《精益创业》",
    subtitle: "The Lean Startup",
    author: "Eric Ries",
    rice: 68,
    dimensionLabel: "产品 Product",
    window: "2027-Q2",
    gate: "进入下月条件: H-01~H-08 完成 5/8"
  },
  {
    key: "M-10",
    priority: "medium",
    title: "《反脆弱》",
    subtitle: "Antifragile",
    author: "Nassim Taleb",
    rice: 72,
    dimensionLabel: "战略 Strategy",
    window: "2027-Q1 3 月",
    gate: "进入下月条件: 战略 Review 后"
  },
  {
    key: "M-11",
    priority: "medium",
    title: "RustConf 2026 生产 Rust 1000+ 天 Top 10 坑",
    author: "Rust 资深团队",
    rice: 66,
    dimensionLabel: "工程 Engineering",
    window: "2026-10 泛读",
    gate: "进入下月条件: 有空就听（YiPot 相关）"
  },
  {
    key: "M-12",
    priority: "medium",
    title: "Werner Vogels 2026：Async-First 架构 10 戒律",
    author: "AWS CTO",
    rice: 70,
    dimensionLabel: "工程 Engineering",
    window: "2026-11 月",
    gate: "进入下月条件: 工作相关"
  },
  {
    key: "M-13",
    priority: "medium",
    title: "OSDI'26 RAG SLO 保证 3 层组合",
    author: "USENIX",
    rice: 74,
    dimensionLabel: "AI 智能",
    window: "2027-Q1",
    gate: "进入下月条件: YiAi 上线 ≥ 100 DAU"
  },
  {
    key: "M-14",
    priority: "medium",
    title: "McKinsey 2027 AI 时代的组织设计",
    author: "McKinsey",
    rice: 72,
    dimensionLabel: "管理 Management",
    window: "2027-Q1",
    gate: "进入下月条件: 2026 年终总结"
  },
  {
    key: "M-15",
    priority: "medium",
    title: "《代码大全 2》Code Complete 2 Ch 1-5",
    author: "Steve McConnell",
    rice: 69,
    dimensionLabel: "工程 Engineering",
    window: "2027-Q2",
    gate: "进入下月条件: 有空选读"
  },
  {
    key: "M-16",
    priority: "medium",
    title: "《凤凰项目》",
    subtitle: "The Phoenix Project",
    author: "Gene Kim",
    rice: 67,
    dimensionLabel: "SRE 运维",
    window: "2027-Q1 3 月",
    gate: "进入下月条件: SRE Workbook 读完"
  },
  {
    key: "L-17",
    priority: "low",
    title: "《人月神话》",
    subtitle: "The Mythical Man-Month",
    author: "Fred Brooks",
    rice: 65,
    dimensionLabel: "管理 Management",
    window: "2027-Q2+",
    gate: "进入下月条件: 所有 H ≥ 80% 完成"
  },
  {
    key: "L-18",
    priority: "low",
    title: "《格鲁夫给经理人的第一课》Grove 自传版",
    author: "Grove 传记",
    rice: 63,
    dimensionLabel: "管理 Management",
    window: "2027-Q2",
    gate: "进入下月条件: 高产出管理 Reviewed ≥6 月"
  },
  {
    key: "L-19",
    priority: "low",
    title: "YC 创业 101 系列讲座（10 讲）",
    author: "YC Startup Library",
    rice: 61,
    dimensionLabel: "产品 Product",
    window: "碎片时间",
    gate: "进入下月条件: 泛听，不计 OKR"
  },
  {
    key: "L-20",
    priority: "low",
    title: "IETF RFC 9000 QUIC v1",
    author: "IETF",
    rice: 62,
    dimensionLabel: "SRE 运维",
    window: "有空",
    gate: "进入下月条件: YiAi P95 > 2s 瓶颈时"
  }
];
const queueStats = computed(() =>
  futureQueueItems.reduce(
    (acc, q) => {
      acc[q.priority] += 1;
      return acc;
    },
    { high: 0, medium: 0, low: 0 }
  )
);
const futureQueueGroups = computed(() =>
  ["high", "medium", "low"].reduce<Record<string, FutureQueueItem[]>>((acc, p) => {
    acc[p] = futureQueueItems.filter((i) => i.priority === p);
    return acc;
  }, {})
);
function queueGroupTitle(p: string): string {
  return p === "high" ? "🔥 H 高优先级" : p === "medium" ? "🟠 M 中优先级" : "🟢 L 低优先级";
}
function queueGroupRiceHint(p: string): string {
  return p === "high" ? "≥ 75" : p === "medium" ? "60 ≤ RICE < 75" : "≥ 60，非核心";
}
function queueGroupCriterion(p: string): string {
  switch (p) {
    case "high":
      return "准入标准：RICE ≥ 75（相当于综合 Reach × Impact × Confidence / Effort 归一化后 ≥ 75）";
    case "medium":
      return "准入标准：60 ≤ RICE < 75（满足基线，需按季度排期节奏进入 H bucket）";
    case "low":
      return "准入标准：RICE ≥ 60，非核心域 / 碎片时间候选（H bucket ≥ 80% 完成后才准入）";
    default:
      return "";
  }
}
/** 启发式解析 queue item 的 window 字段 → 距离今天的天数文本 */
function daysUntilScheduled(windowRaw: string): string {
  const m = String(windowRaw ?? "").match(/(\d{4})-(\d{1,2})/);
  if (!m) {
    // 形如 "2027-Q1 1 月"
    const qm = String(windowRaw ?? "").match(/(\d{4})-Q([1-4]).*?(\d{1,2})\s*月/);
    if (!qm) return "未定排期";
    const d = new Date(Number(qm[1]), (Number(qm[2]) - 1) * 3 + (Number(qm[3]) - 1), 1);
    const diff = Math.ceil((d.getTime() - Date.now()) / 86400000);
    return diff < 0 ? `已过期 ${-diff}d` : `${diff}d 后`;
  }
  const d = new Date(Number(m[1]), Number(m[2]) - 1, 1);
  const diff = Math.ceil((d.getTime() - Date.now()) / 86400000);
  return diff < 0 ? `已过期 ${-diff}d` : `${diff}d 后`;
}
function daysUntilMonth(monthRaw?: string): string {
  if (!monthRaw) return "未定排期";
  const m = String(monthRaw).match(/^(\d{4})-(\d{2})$/);
  if (!m) return daysUntilScheduled(monthRaw);
  const d = new Date(Number(m[1]), Number(m[2]) - 1, 1);
  const diff = Math.ceil((d.getTime() - Date.now()) / 86400000);
  return diff < 0 ? `已过期 ${-diff}d` : `${diff}d 后`;
}
/** 从 SSOT visibleItems 中提取实时 queued 条目，按 scheduledMonth 升序 + RICE 降序 */
const queuedLiveItems = computed<ReadingItem[]>(() => {
  const rawItems = unref(store.items);
  const arr = (rawItems ?? []).filter(
    (it: ReadingItem) => (it.status ?? "") === "queued" && !!it.scheduledMonth
  );
  return arr
    .slice()
    .sort((a: ReadingItem, b: ReadingItem) => {
      const ma = a.scheduledMonth ?? "";
      const mb = b.scheduledMonth ?? "";
      if (ma !== mb) return ma.localeCompare(mb);
      return (b.rice?.final ?? 0) - (a.rice?.final ?? 0);
    })
    .slice(0, 10);
});

/* ───────────────────────────────────────────────────────────────
 *  §3 ProTable 列定义
 * ─────────────────────────────────────────────────────────────── */
const columns: ColumnProps<ReadingItem>[] = [
  { prop: "title", label: "Title", minWidth: 360, showOverflowTooltip: true },
  {
    prop: "type",
    label: "Type",
    width: 100,
    tag: true,
    enum: meta.types.map((t) => ({
      value: t.id,
      label: t.label,
      tagType: t.id === "article" ? "warning" : t.id === "book" ? "primary" : "info"
    }))
  },
  { prop: "author", label: "Author", width: 140, showOverflowTooltip: true },
  {
    prop: "status",
    label: "Status",
    width: 120,
    tag: true,
    enum: meta.statuses.map((s) => ({
      value: s.id,
      label: s.label,
      tagType: statusTagType(s.id)
    }))
  },
  {
    prop: "priority",
    label: "Priority",
    width: 100,
    tag: true,
    enum: meta.priorities.map((p) => ({
      value: p.id,
      label: p.label,
      tagType: priorityTagType(p.id)
    }))
  },
  {
    prop: "ownerRole",
    label: "Owner",
    width: 150,
    tag: true,
    enum: meta.roles.map((r) => ({ value: r.id, label: r.label, tagType: "info" }))
  },
  { prop: "rice", label: "RICE", width: 140 },
  { prop: "progress", label: "Progress", width: 160 },
  { prop: "scheduled", label: "Scheduled", width: 120 },
  { prop: "updatedTime", label: "Updated", width: 140 },
  { prop: "operation", label: "Actions", width: 200, fixed: "right" }
];

function tableFetch(params: Record<string, any>) {
  // 直接返回本地数据 — SSOT 已经在 store.items 里拉好
  return Promise.resolve({
    result: filteredBy({ ...params }),
    total: filteredBy({ ...params }).length
  });
}
const tableInitParam = computed(() => ({ ...query }));
function tableTransform(res: any) {
  return { list: res.result, total: res.total };
}

/* ───────────────────────────────────────────────────────────────
 *  §4 辅助函数
 * ─────────────────────────────────────────────────────────────── */
function sum(arr: number[]): number {
  return arr.reduce((acc, v) => acc + (Number.isFinite(v) ? v : 0), 0);
}
function dimensionBarWidth(id: ReadingDimension): string {
  const values = meta.dimensions.map((d) => stats.value.dimensions?.[d.id] ?? 0);
  const max = Math.max(1, ...values);
  return `${((stats.value.dimensions?.[id] ?? 0) / max) * 100}%`;
}
function segmentStyle(count: number, total: number) {
  if (!total) return { flex: "0 0 0%", opacity: 0.2 };
  return { flex: `${Math.max(1, count)} 1 0%` };
}
function funnelStyle(id: ReadingStatus) {
  const base = stats.value.total || 1;
  const step = Math.max(18, ((stats.value.statusFunnel?.[id] ?? 0) / base) * 100);
  return { width: `${step}%` };
}
function levelGlyph(lv: AlertRow["level"]): string {
  return lv === "danger" ? "🔴" : lv === "warning" ? "🟡" : "🟢";
}

/* ───────────────────────────────────────────────────────────────
 *  §5 Tag / Pill types（全部走 meta，不再硬编码）
 * ─────────────────────────────────────────────────────────────── */
function typeTagType(t?: ReadingType): "warning" | "primary" | "info" {
  if (t === "article") return "warning";
  if (t === "book") return "primary";
  return "info";
}
function priorityTagType(p?: ReadingPriority): "danger" | "warning" | "info" {
  if (p === "high") return "danger";
  if (p === "medium") return "warning";
  return "info";
}
function statusTagType(s?: ReadingStatus): "success" | "warning" | "info" | "primary" {
  switch (s) {
    case "distilled":
    case "reviewed":
    case "archived":
      return "success";
    case "reading":
    case "actionized":
      return "warning";
    case "noted":
      return "primary";
    default:
      return "info";
  }
}
function riceTierLabel(t: RICETier): string {
  return meta.riceTiers.find((r) => r.id === t)?.label ?? "—";
}
function riceScoreClass(score: number): string {
  const t = riceTierOf(score);
  return `rl-rice--${t}`;
}
function typeIcon(t: ReadingType): string {
  return meta.types.find((x) => x.id === t)?.icon ?? "📄";
}
function effectiveProgress(row: ReadingItem): number {
  if (typeof row.progress === "number" && Number.isFinite(row.progress)) {
    return Math.min(100, Math.max(0, row.progress));
  }
  if (row.status === "archived" || row.status === "reviewed" || row.status === "distilled") return 100;
  if (row.status === "reading" || row.status === "actionized") return 50;
  if (row.status === "noted") return 30;
  return 0;
}
function progressStatus(row: ReadingItem): "success" | "warning" | "exception" | undefined {
  const p = effectiveProgress(row);
  if (p >= 100) return "success";
  if (p >= 50) return "warning";
  if (p < 15 && row.status === "reading") return "exception";
  return undefined;
}
function formatUpdatedAt(ts?: string): string {
  if (!ts) return "—";
  try {
    const d = new Date(ts);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  } catch {
    return "—";
  }
}

/* ───────────────────────────────────────────────────────────────
 *  §6 过滤交互
 * ─────────────────────────────────────────────────────────────── */
function onToggleDimension(id: ReadingDimension) {
  query.dimension = (query.dimension === id ? "all" : id) as ReadingDimension | "all";
  proTable.value?.getTableList?.();
}
function onToggleRole(id: ReadingRole) {
  query.role = (query.role === id ? "all" : id) as ReadingRole | "all";
  proTable.value?.getTableList?.();
}
function onToggleMonth(m: string) {
  query.scheduledMonth = query.scheduledMonth === m ? undefined : m;
  proTable.value?.getTableList?.();
}
function onTogglePriority(p: ReadingPriority) {
  query.priority = (query.priority === p ? "all" : p) as ReadingPriority | "all";
  proTable.value?.getTableList?.();
}
function onSetStatus(s: ReadingStatus | "all") {
  query.status = s;
  proTable.value?.getTableList?.();
}
function onSetDoneGroup() {
  query.status = query.status === "done-group" ? "all" : "done-group";
  proTable.value?.getTableList?.();
}
function toggleRiceFilter(t: RICETier) {
  riceFilterTier.value = riceFilterTier.value === t ? "" : t;
  proTable.value?.getTableList?.();
}
function onViewModeCmd(cmd: "list" | "card" | "table") {
  viewMode.value = cmd;
}
function handleViewModeCmd(cmd: string | number | object) {
  if (cmd === "list" || cmd === "card" || cmd === "table") onViewModeCmd(cmd);
}
function toggleDashboardCollapse() {
  dashboardCollapsed.value = !dashboardCollapsed.value;
}
async function handleRefresh() {
  store.evictCache();
  try {
    await store.reload();
    ElMessage.success("Reading list 已刷新");
  } catch (e) {
    ElMessage.warning("后端不可达，已回退到本地缓存 / 种子");
  }
  proTable.value?.getTableList?.();
}

/* ───────────────────────────────────────────────────────────────
 *  §7 新建 / 编辑 / 删除
 * ─────────────────────────────────────────────────────────────── */
function resetForm() {
  const base = makeRice(70);
  Object.assign(form, {
    id: undefined,
    title: "",
    subtitle: "",
    author: "",
    type: "book",
    dimension: "management",
    ownerRole: "ceo",
    priority: "medium",
    status: "queued",
    progress: 0,
    reach: base.reach,
    impact: base.impact,
    confidence: base.confidence,
    effort: base.effort,
    riceFinal: base.final,
    scheduledMonth: undefined,
    okrId: "",
    noteKey: "",
    externalUrl: "",
    tags: [],
    summary: ""
  });
  formRef.value?.clearValidate();
}
function openCreateDialog() {
  resetForm();
  dialogVisible.value = true;
}
function openEditDialog(row: ReadingItem) {
  resetForm();
  const base =
    row.rice &&
    Number.isFinite(row.rice.reach) &&
    Number.isFinite(row.rice.impact) &&
    Number.isFinite(row.rice.confidence) &&
    Number.isFinite(row.rice.effort)
      ? {
          reach: row.rice.reach,
          impact: row.rice.impact,
          confidence: row.rice.confidence,
          effort: row.rice.effort
        }
      : makeRice(row.rice?.final ?? 70);
  Object.assign(form, {
    id: row._id ?? row.key,
    title: row.title,
    subtitle: row.subtitle ?? "",
    author: row.author ?? "",
    type: row.type ?? "book",
    dimension: row.dimension ?? "management",
    ownerRole: row.ownerRole ?? "ceo",
    priority: row.priority ?? "medium",
    status: row.status ?? "queued",
    progress: row.progress ?? 0,
    reach: base.reach,
    impact: base.impact,
    confidence: base.confidence,
    effort: base.effort,
    riceFinal: row.rice?.final ?? 70,
    scheduledMonth: row.scheduledMonth,
    okrId: row.okrId ?? "",
    noteKey: row.noteKey ?? "",
    externalUrl: row.externalUrl ?? "",
    tags: row.tags ?? [],
    summary: row.summary ?? ""
  });
  dialogVisible.value = true;
}
async function saveForm() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  saving.value = true;
  try {
    const payload = {
      title: form.title,
      subtitle: form.subtitle || undefined,
      author: form.author || undefined,
      type: form.type,
      dimension: form.dimension,
      ownerRole: form.ownerRole,
      priority: form.priority,
      status: form.status,
      progress: form.progress,
      rice: {
        reach: form.reach,
        impact: form.impact,
        confidence: form.confidence,
        effort: form.effort,
        final: form.riceFinal
      },
      scheduledMonth: form.scheduledMonth,
      okrId: form.okrId || undefined,
      noteKey: form.noteKey || undefined,
      externalUrl: form.externalUrl || undefined,
      tags: form.tags.length ? form.tags : undefined,
      summary: form.summary || undefined
    } as const;
    if (form.id) {
      await store.update(form.id, payload);
      ElMessage.success("Reading item 更新成功");
    } else {
      await store.add(payload as any);
      ElMessage.success("Reading item 已创建");
    }
    dialogVisible.value = false;
    proTable.value?.getTableList?.();
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : "保存失败");
  } finally {
    saving.value = false;
  }
}
async function handleDelete(row: ReadingItem) {
  try {
    await ElMessageBox.confirm(`确认删除 "${row.title}"？`, "删除 Reading Item", {
      type: "warning",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel"
    });
    const id = row._id ?? row.key ?? "";
    if (!id) return;
    const ok = await store.remove(id);
    ElMessage[ok ? "success" : "warning"](ok ? "已删除" : "仅本地删除（后端不可达）");
    proTable.value?.getTableList?.();
  } catch {
    /* user canceled */
  }
}

/* ───────────────────────────────────────────────────────────────
 *  §8 锚点与跳转：Link Factory 三闸门（禁止拼接 URL）
 *       + 统一 KB 预览弹框触发（优先 noteKey > link > 标题模糊匹配）
 * ─────────────────────────────────────────────────────────────── */
function normalizeKnowledgePath(raw: string): string {
  if (!raw) return "";
  let rel = String(raw).trim();
  /* 1. 去掉前导 query/hash，兼容传入 "#/knowledge/preview?file=..." */
  const queryMatch = rel.match(/[?&]file=([^&#]+)/);
  if (queryMatch) rel = decodeURIComponent(queryMatch[1]);
  /* 2. 去掉前缀 YiKnowledge/ 和 #/knowledge/preview 等 */
  rel = rel.replace(/^YiKnowledge\//i, "");
  rel = rel.replace(/^#\/knowledge\/(preview)?/i, "");
  rel = rel.replace(/^\//, "");
  /* 3. 外链直接原样返回 */
  if (/^https?:\/\//i.test(rel)) return rel;
  /* 4. 自动补扩展名 */
  if (rel && !/\.(md|ya?ml|json|txt|pdf|csv|png|jpe?g|webp|svg)$/i.test(rel)) rel += ".md";
  return rel;
}

/**
 * 把一条 ReadingItem 解析为一个「可预览」的 KB 相对路径（或外链）。
 * 优先级：
 *   1. externalUrl（http 外链）
 *   2. noteKey（最贴近「KB 笔记」的字段）
 *   3. link（老字段，兼容）
 *   4. 基于标题去 kbFileIndex 做模糊匹配
 * 返回 null 表示「无可预览目标」。
 */
function resolveKbLinkForRow(row: ReadingItem): { kind: "md" | "http"; target: string } | null {
  if (!row) return null;
  if (row.externalUrl && /^https?:\/\//i.test(row.externalUrl)) {
    return { kind: "http", target: row.externalUrl };
  }
  const candidates: string[] = [];
  if ((row as any).link) candidates.push(String((row as any).link));
  if (row.noteKey) candidates.push(row.noteKey);
  for (const c of candidates) {
    const t = normalizeKnowledgePath(c);
    if (!t) continue;
    if (/^https?:\/\//i.test(t)) return { kind: "http", target: t };
    return { kind: "md", target: t };
  }
  /* 最后一级：基于标题/key 去扫描索引做精确匹配 */
  const idx = (store.kbFileIndex?.value ?? {}) as Record<string, string>;
  const keyList = [
    String(row.title || "").trim().toLowerCase(),
    String(row.subtitle || "").trim().toLowerCase(),
    String(row.key || "").trim().toLowerCase()
  ].filter(Boolean);
  for (const k of keyList) {
    if (idx[k]) return { kind: "md", target: normalizeKnowledgePath(idx[k]) };
  }
  /* 模糊命中（包含关键词） */
  for (const k of keyList) {
    if (!k) continue;
    const match = Object.keys(idx).find(
      (name) => name.length >= 3 && (k.includes(name) || name.includes(k))
    );
    if (match) return { kind: "md", target: normalizeKnowledgePath(idx[match]) };
  }
  return null;
}

function hasValidLinkContract(row: ReadingItem): boolean {
  return resolveKbLinkForRow(row) !== null;
}

/** 行级错误红框（三闸门失败时 2s 高亮） */
const failedRowKeys = new Set<string>();
const failedRowSetRef = shallowRef<Set<string>>(failedRowKeys);
function markRowError(row: ReadingItem) {
  const k = row.key ?? row._id ?? String(row.title || "");
  failedRowKeys.add(k);
  failedRowSetRef.value = new Set(failedRowKeys); /* trigger reactivity */
  setTimeout(() => {
    failedRowKeys.delete(k);
    failedRowSetRef.value = new Set(failedRowKeys);
  }, 2000);
}
function isRowFailed(row: ReadingItem): boolean {
  const k = row.key ?? row._id ?? String(row.title || "");
  return failedRowKeys.has(k);
}

async function openKnowledgePreview(relPath: string, opts?: { title?: string }) {
  const target = normalizeKnowledgePath(relPath);
  if (!target) {
    ElMessage.warning("未找到可预览的知识库路径");
    return;
  }
  if (/^https?:\/\//i.test(target)) {
    window.open(target, "_blank", "noopener,noreferrer");
    return;
  }
  /* Gate B（当前 entityType: knowledge-file 在 TEMPLATES 中未登记 → 退化通过；
     真实的存在性由 KnowledgePreviewDialog 内 /knowledge-read 负责提示） */
  const entity: ResolveLinkInput = { type: "page", key: target, title: opts?.title };
  try {
    await gateBEntityExists(entity).catch(() => true);
  } catch {
    /* ignore — 继续预览 */
  }
  kbPreviewPath.value = target;
  /* 等一次 tick：ref 已 ready 即可打开 */
  await nextTick();
  kbPreviewRef.value?.open?.(target);
  /* Reliability 打点（SSOT，不要在组件内再写重复） */
  pushReliabilityEvent({
    projectKey: "executive",
    phase: "P2-knowledge",
    status: "success",
    durationMs: 0,
    retryCount: 0,
    tags: {
      op: "rl_preview_open",
      target,
      title: opts?.title ?? ""
    }
  });
}

async function openReadingLink(row: ReadingItem) {
  const resolved = resolveKbLinkForRow(row);
  if (!resolved) {
    ElMessage.info("该条目暂无可预览内容（缺 noteKey / link）。可 Edit → 填写 Note Key。");
    markRowError(row);
    return;
  }
  if (resolved.kind === "http") {
    window.open(resolved.target, "_blank", "noopener,noreferrer");
    return;
  }
  /* Page 类型：三闸门（SSOT Link Factory） + 强制走弹框 */
  const entity: ResolveLinkInput = {
    type: "page",
    key: resolved.target.replace(/\.md$/i, ""),
    title: row.title,
    extra: { type: "reading" }
  };
  const linkResolved = resolveLink(entity);
  if (!linkResolved.ok) {
    ElMessage.warning(linkResolved.message || "无法解析跳转目标");
    markRowError(row);
    return;
  }
  const exists = await gateBEntityExists(entity).catch(() => true);
  if (!exists) {
    pushReliabilityEvent({
      projectKey: "executive",
      phase: "P2-knowledge",
      status: "degraded",
      durationMs: 0,
      retryCount: 0,
      tags: {
        op: "rl_preview_miss",
        key: entity.key ?? "",
        title: row.title
      }
    });
    /* 不存在仍允许弹框打开：由 /knowledge-read 返回错误占位（SSOT 已有） */
  }
  await openKnowledgePreview(resolved.target, { title: row.title });
  nextTick(() =>
    gateCPostNavigate({
      expectedLink: linkResolved.link,
      expectedParams: linkResolved.params,
      expectedTitleKeyword: row.title || "",
      timeoutMs: 2000
    })
  );
}

function anchorToEntity(anchor: string): ResolveLinkInput | null {
  if (!anchor) return null;
  const a = String(anchor).trim();
  // Case 1: 绝对 KB 路径（包含 "/" 或 ".md"） → 直接作为 MD 文件预览
  if (a.includes("/") || /\.md\s*$/i.test(a)) {
    const cleanPath = a.replace(/^YiKnowledge\//i, "").replace(/^\//, "");
    const mdPath = /\.md\s*$/i.test(cleanPath) ? cleanPath : `${cleanPath.split(" ")[0]}.md`;
    return {
      type: "page",
      key: mdPath.replace(/\.md$/i, ""),
      title: a
    };
  }
  // Case 2: 形如 "001.md §1.1 K4" / "001.md §1.5 K-08" 的主 MD 文档
  const masterMdMatch = a.match(/^(\d{3})\.md\s+(.+)$/);
  if (masterMdMatch) {
    return {
      type: "page",
      key: `executive/reading-list/${masterMdMatch[1]}-阅读-阅读清单`,
      title: a
    };
  }
  // Case 3: 形如 "curator/008 KPI 设计" — 任意相对路径（首个 token 是斜分式路径）
  const pathLike = a.replace(/\s+/g, " ").trim();
  const firstToken = pathLike.split(" ")[0];
  if (/^[\w-]+\/[\w-]+(\/[\w-]+)*$/.test(firstToken)) {
    return { type: "page", key: firstToken, title: a };
  }
  // Case 4: 启发式关键词 → 默认知识库目录映射
  const lower = a.toLowerCase();
  if (lower.includes("okr")) {
    return { type: "page", key: "executive/okr/okr", title: a };
  }
  if (lower.includes("rss") || lower.includes("feed")) {
    return { type: "page", key: "executive/rssManager/rssManager", title: a };
  }
  if (lower.includes("process") || lower.includes("loop") || lower.includes("闭环")) {
    return { type: "page", key: "executive/processRecord/processRecord", title: a };
  }
  if (lower.includes("roadmap") || lower.includes("排期")) {
    return { type: "page", key: "executive/roadmap/roadmap", title: a };
  }
  if (lower.includes("strategy") || lower.includes("战略")) {
    return { type: "page", key: "executive/strategy/strategy", title: a };
  }
  if (lower.includes("curator") || lower.includes("kpi") || lower.includes("看板")) {
    return { type: "page", key: "curator/curator", title: a };
  }
  if (lower.includes("leader") || lower.includes("决策")) {
    return { type: "page", key: "leader/leader", title: a };
  }
  if (lower.includes("yipot") || lower.includes("yi vad") || lower.includes("yivad") || lower.includes("yiai")) {
    // 项目类走 projects 下模糊 key
    if (lower.includes("yiai")) return { type: "page", key: "projects/YiAi/INDEX", title: a };
    if (lower.includes("yipot")) return { type: "page", key: "projects/YiPot/INDEX", title: a };
    return { type: "page", key: "projects/YiVad/INDEX", title: a };
  }
  // Case 5: 形如 "010 §5.3 3×4 取舍" 的读书笔记编号
  const noteMatch = a.match(/^(\d{3})\s*(§|$)/);
  if (noteMatch) {
    return {
      type: "page",
      key: `executive/reading-list/${noteMatch[1]}-阅读-读书笔记`,
      title: a
    };
  }
  return null;
}
async function openAnchor(anchor: string) {
  const entity = anchorToEntity(anchor);
  // 优先弹框打开 MD（如果能通过启发式解析出 KB 相对路径，即使 anchor 本身不含 "/" 也走预览）
  if (entity) {
    const kbKey = entity.key ?? "";
    const hasAnchoredMd =
      /(\.md\s*$|\/|executive\/reading-list\/|executive\/okr|executive\/rss|executive\/process|executive\/roadmap|executive\/strategy|curator\/|leader\/|projects\/)/i.test(
        kbKey
      );
    if (hasAnchoredMd || kbKey) {
      const mdPath = /\.md$/i.test(kbKey) ? kbKey : `${kbKey}.md`;
      const anchorSuffix = String(anchor).match(/\s§[\w.\-() ]+$/)?.[0] ?? "";
      try {
        await openKnowledgePreview(mdPath + anchorSuffix, { title: anchor });
        return;
      } catch {
        /* 预览失败继续走三闸门导航 */
      }
    }
  }
  if (!entity) {
    ElMessage.info(`锚点暂未映射: ${anchor}`);
    return;
  }
  const resolved = resolveLink(entity);
  if (!resolved.ok) {
    ElMessage.warning(resolved.message);
    router.push(resolved.fallback);
    return;
  }
  const exists = await gateBEntityExists(entity).catch(() => false);
  if (!exists) {
    ElMessage.warning("目标页面在知识库中不存在，已跳转搜索页。");
    const fallbackSearch = router.resolve({
      path: "/search",
      query: { q: entity.key ?? anchor }
    }).href;
    router.push(fallbackSearch);
    pushReliabilityEvent({
      projectKey: "executive",
      phase: "P2-knowledge",
      status: "failed",
      durationMs: 0,
      retryCount: 0,
      tags: {
        op: "rl_anchor_miss",
        anchor,
        key: entity.key ?? ""
      }
    });
    return;
  }
  try {
    await router.push(resolved.link);
    nextTick(() =>
      gateCPostNavigate({
        expectedLink: resolved.link,
        expectedParams: resolved.params,
        expectedTitleKeyword: entity.title || "",
        timeoutMs: 2000
      })
    );
  } catch (e) {
    ElMessage.warning(e instanceof Error ? e.message : "导航失败");
    const fallbackSearch = router.resolve({
      path: "/search",
      query: { q: entity.key ?? anchor }
    }).href;
    router.push(fallbackSearch);
  }
}

async function openItem(row: ReadingItem) {
  /* 契约：优先打开 KB 笔记弹框（KnowledgePreviewDialog）；绝不 page-nav 到 MD。 */
  if (hasValidLinkContract(row)) {
    await openReadingLink(row);
    return;
  }
  if (row.externalUrl) {
    window.open(row.externalUrl, "_blank", "noopener,noreferrer");
    return;
  }
  // 否则落到编辑弹窗
  openEditDialog(row);
}

/* Master markdown & YiAi DB 快捷入口（也走三闸门） */
function openMasterMarkdown() {
  return openAnchor("001.md §0");
}
function openYiAiDb() {
  const entity: ResolveLinkInput = { type: "ai-chat", title: "YiAi DB" };
  const res = resolveLink(entity);
  router.push(res.ok ? res.link : res.fallback);
}
async function seedIntoDb() {
  if (syncing.value) return;
  syncing.value = true;
  try {
    /* 委托 SSOT composable；KB 模式下可直接把 YiKnowledge 行 upsert 到 YiAi DB。 */
    const { done, total } = await store.seedToYiAiDb();
    ElMessage.success(`同步完成：${done}/${total}`);
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : "同步失败");
  } finally {
    syncing.value = false;
  }
}

/* ───────────────────────────────────────────────────────────────
 *  §9 快捷键契约：⌘N / ⌘D / ⌥K / ⌥1~3
 *    - 输入控件（INPUT / TEXTAREA / contenteditable）下自动跳过；
 *    - ⌘K 留作全局命令面板（useCommandPalette），页内搜索改用 ⌥K。
 * ─────────────────────────────────────────────────────────────── */
function onKeyDown(e: KeyboardEvent) {
  // 冲突规避：表单类输入控件不触发全局快捷键
  const target = e.target as HTMLElement | null;
  if (target) {
    const tag = target.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable) {
      // 仅允许 ⌘/Ctrl 组合键继续，避免与默认输入行为冲突
      if (!(e.metaKey || e.ctrlKey)) return;
      if (e.key !== "n" && e.key !== "d" && e.key !== "N" && e.key !== "D") return;
    }
  }
  const mod = e.metaKey || e.ctrlKey;
  if (mod && e.key.toLowerCase() === "n") {
    e.preventDefault();
    openCreateDialog();
    return;
  }
  if (mod && e.key.toLowerCase() === "d") {
    e.preventDefault();
    toggleDashboardCollapse();
    return;
  }
  // ⌥K：页内搜索（避免与全局 ⌘K 命令面板冲突）
  if (e.altKey && e.key.toLowerCase() === "k") {
    e.preventDefault();
    if (searchInputRef.value) {
      searchInputRef.value.focus?.();
    }
    return;
  }
  // ⌘K：兜底打开全局命令面板（由 useCommandPalette 单例统一管理）
  if (mod && e.key.toLowerCase() === "k") {
    e.preventDefault();
    palette.open?.();
    return;
  }
  if (e.altKey && e.key === "1") {
    e.preventDefault();
    onViewModeCmd("list");
  } else if (e.altKey && e.key === "2") {
    e.preventDefault();
    onViewModeCmd("card");
  } else if (e.altKey && e.key === "3") {
    e.preventDefault();
    onViewModeCmd("table");
  }
}
onMounted(() => {
  window.addEventListener("keydown", onKeyDown);
  // Kick off the Executive Knowledge File Browser ProTable initial fetch.
  // (ProTable with `page-show: true` sometimes needs an explicit getTableList
  //  when the source `useRoleDashboard` finishes loading inside the same tick.)
  nextTick(() => {
    setTimeout(() => kbFileTableRef.value?.getTableList?.(), 50);
  });
});
onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeyDown);
});

/* 任何过滤状态变动 → 同步刷新 ProTable 的 list（table 视图） */
watch(
  () => [query, riceFilterTier.value, viewMode.value],
  () => {
    if (viewMode.value === "table") {
      nextTick(() => proTable.value?.getTableList?.());
    }
  }
);

/* ═══════════════════════════════════════════════════════════════════
 * §10 Executive Knowledge File Browser
 *        · SSOT: useRoleDashboard('executive')
 *        · UI:  Sidebar · Domains + Role + Quick
 *                Content · Toolbar + ProTable
 *        · 对齐 ExecutiveDashboard 主页的 StandardRoleDashboard
 * ═══════════════════════════════════════════════════════════════════ */
interface KbFileRow {
  path: string;
  name: string;
  title: string;
  domain: string;
  domainId: string;
  domainIcon: string;
  domainColor: string;
  type?: string;
  status?: string;
  lifecycle?: string;
  /** Legacy review column — kept for backward compat with old frontmatter. */
  review?: string;
  /** Canonical review cadence from frontmatter `review_cycle` (weekly/quarterly/…). */
  reviewCycle?: string;
  /** Frontmatter `benefit` — why this doc exists, shown inline. */
  benefit?: string;
  /** Frontmatter `category` (business/risk/operational/…). */
  category?: string;
  /** Frontmatter `tags` array. */
  tags?: string[];
  /** Frontmatter `roles` (owner/consumer roles). */
  roles?: string[];
  /** OKR ref extracted from path/frontmatter (e.g. exec-002-03). */
  okrRef?: string;
  /** Anchor string like `001.md §4.2`, if found in frontmatter or heuristically. */
  okAnchor?: string;
  /** True if file carries role structural tags (product-strategy / resources / …). */
  isStructural?: boolean;
  /** Numeric staleness in days (null if unknown). */
  stalenessDays?: number | null;
  /** True if `updatedAt` is outside the `review_cycle` threshold window. */
  reviewStale?: boolean;
  size: number;
  updatedAt?: string;
  ext: string;
}

type KbQuick =
  | ""
  | "todo"
  | "wip"
  | "need-review"
  | "archived"
  | "stale";

const kbDashboard = useRoleDashboard("executive", { pollIntervalMs: 120_000 });
const kbLoading = computed(() => kbDashboard.loading.value);
const kbError = computed(() => kbDashboard.error.value ?? "");
const kbStats = computed(() => kbDashboard.stats.value);

/* —— Executive role metadata —— */
const kbRoleDef = computed(() => kbDashboard.role.value);
const kbStructuralTagSet = computed<string[]>(() =>
  kbRoleDef.value?.structuralTags ?? []
);

/* —— 子目录导航（保持原顺序，含 reading-list / okr / rss / process / strategy 等） —— */
const kbSubdirs = computed<SubdirDef[]>(() => kbDashboard.subdirs.value ?? []);

/* —— 状态：过滤条件 + 视图 —— */
const kbViewMode = ref<"table" | "list">("table");
const kbQuick = ref<KbQuick>("");
const kbSort = ref<
  | "default"
  | "maturity_desc"
  | "size_asc"
  | "size_desc"
  | "updated_desc"
  | "updated_asc"
>("default");

const kbFilters = reactive({
  titleKeyword: "",
  domainText: "",
  type: "",
  status: "",
  lifecycle: "",
  review: "",
  role: "" as "" | ReadingRole,
  structuralTag: "" as string
});

/* —— Helper：百分比（mirrors StandardRoleDashboard） —— */
function kbPct(part: number, total: number): number {
  return total > 0 ? Math.round((part / total) * 100) : 0;
}

/* —— 选中的 Domains（SSOT；空数组意味着全选） —— */
const kbActiveDomains = ref<string[]>([]);
function kbIsDomainActive(id: string) {
  if (!kbActiveDomains.value.length) return true;
  return kbActiveDomains.value.includes(id);
}
function kbToggleDomain(id: string) {
  const arr = kbActiveDomains.value;
  const idx = arr.indexOf(id);
  if (idx === -1) arr.push(id);
  else arr.splice(idx, 1);
  kbRefreshFileTable();
}
function kbClearDomainFilter() {
  kbActiveDomains.value = [];
  kbRefreshFileTable();
}
function kbSetQuick(q: KbQuick) {
  kbQuick.value = kbQuick.value === q ? "" : q;
  kbRefreshFileTable();
}
function kbToggleStructuralTag(tag: string) {
  kbFilters.structuralTag = kbFilters.structuralTag === tag ? "" : tag;
}
function kbResetAll() {
  kbFilters.titleKeyword = "";
  kbFilters.domainText = "";
  kbFilters.type = "";
  kbFilters.status = "";
  kbFilters.lifecycle = "";
  kbFilters.review = "";
  kbFilters.role = "";
  kbFilters.structuralTag = "";
  kbActiveDomains.value = [];
  kbQuick.value = "";
  kbSort.value = "default";
  kbRefreshFileTable();
}

/* —— Small helpers: per-domain stable / structural counts for sidebar —— */
function kbStableCount(dirId: string): number {
  const list = (kbDashboard.filesByDir.value?.[dirId] ?? []) as any[];
  return list.filter((f) => {
    const s = String(f.meta?.status ?? "").toLowerCase();
    return s === "stable" || s === "active";
  }).length;
}
function kbStructuralTagCount(dirId: string): number {
  const list = (kbDashboard.filesByDir.value?.[dirId] ?? []) as any[];
  const tags = kbStructuralTagSet.value;
  if (!tags.length) return 0;
  return list.filter((f) => {
    const arr: string[] = Array.isArray(f.meta?.tags) ? f.meta.tags : [];
    return arr.some((t) => tags.includes(String(t)));
  }).length;
}

/* —— 按 domain 聚合计数（渲染 sidebar 徽标） —— */
const kbFileCounts = computed<Record<string, number>>(() => {
  const all = kbDashboard.flatFiles.value ?? [];
  const out: Record<string, number> = Object.create(null);
  for (const f of all) {
    const k = (f as any).domainId ?? f.domainId;
    if (!k) continue;
    out[k] = (out[k] ?? 0) + 1;
  }
  return out;
});

/* —— Role counts (heuristic: frontmatter roles + title/path match against reading-list role ids) —— */
const kbRoleCounts = computed<Record<string, number>>(() => {
  const all = kbDashboard.flatFiles.value ?? [];
  const readingRoles = meta.roles ?? [];
  const out: Record<string, number> = Object.create(null);
  for (const rr of readingRoles) out[rr.id] = 0;
  for (const f of all) {
    const raw = f as any;
    const frontRoles: string[] = Array.isArray(raw?.file?.meta?.roles)
      ? (raw.file.meta.roles as string[]).map((s) => String(s).toLowerCase())
      : [];
    const pathTitle = `${String(raw.path ?? "")} ${String(raw.title ?? "")}`.toLowerCase();
    // 1) frontmatter roles → exact-match by id
    for (const rr of readingRoles) {
      if (frontRoles.includes(rr.id)) {
        out[rr.id] = (out[rr.id] ?? 0) + 1;
        continue;
      }
      // 2) fallback: path/title contains role id (e.g. cpo, vp-eng)
      if (rr.id && pathTitle.includes(rr.id.toLowerCase())) {
        out[rr.id] = (out[rr.id] ?? 0) + 1;
      }
    }
  }
  return out;
});

/* —— Structural tags cloud & totals —— */
const kbStructuralTags = computed<Array<{ tag: string; count: number }>>(() => {
  const all = kbDashboard.flatFiles.value ?? [];
  const wanted = kbStructuralTagSet.value;
  const counts: Record<string, number> = Object.create(null);
  for (const t of wanted) counts[t] = 0;
  for (const f of all as any[]) {
    const tags: string[] = Array.isArray(f?.file?.meta?.tags) ? f.file.meta.tags : [];
    for (const t of tags) {
      const key = String(t);
      if (wanted.includes(key)) counts[key] = (counts[key] ?? 0) + 1;
    }
  }
  return wanted
    .map((tag) => ({ tag, count: counts[tag] ?? 0 }))
    .filter((x) => x.count > 0)
    .sort((a, b) => b.count - a.count);
});
const kbStructuralTagTotals = computed<number>(() =>
  kbStructuralTags.value.reduce((s, x) => s + x.count, 0)
);

/* —— Unique tags count & top tag —— */
const kbUniqueTags = computed<number>(() => {
  const set = new Set<string>();
  for (const f of (kbDashboard.flatFiles.value ?? []) as any[]) {
    const tags: string[] = Array.isArray(f?.file?.meta?.tags) ? f.file.meta.tags : [];
    for (const t of tags) set.add(String(t));
  }
  return set.size;
});
const kbTopTag = computed<string>(() => {
  const map = new Map<string, number>();
  for (const f of (kbDashboard.flatFiles.value ?? []) as any[]) {
    const tags: string[] = Array.isArray(f?.file?.meta?.tags) ? f.file.meta.tags : [];
    for (const t of tags) {
      const k = String(t);
      map.set(k, (map.get(k) ?? 0) + 1);
    }
  }
  let best = "";
  let bestCount = -1;
  for (const [k, v] of map.entries()) {
    if (v > bestCount) {
      bestCount = v;
      best = k;
    }
  }
  return best || "—";
});

const kbFlatTotal = computed<number>(() => kbDashboard.flatFiles.value?.length ?? 0);

/* —— Candidate value lists for the toolbar selects (SSOT from data) —— */
function kbCollectUniq(fn: (meta: Record<string, unknown> | undefined, raw: any) => string | undefined): string[] {
  const set = new Set<string>();
  for (const f of (kbDashboard.flatFiles.value ?? []) as any[]) {
    const v = fn(f?.file?.meta, f);
    if (v != null && String(v).trim() !== "") set.add(String(v));
  }
  return Array.from(set).sort();
}
const kbTypeValues = computed<string[]>(() => kbCollectUniq((m) => m?.type as string | undefined));
const kbStatusValues = computed<string[]>(() => kbCollectUniq((m) => m?.status as string | undefined));
const kbLifecycleValues = computed<string[]>(() => kbCollectUniq((m) => m?.lifecycle as string | undefined));
const kbReviewValues = computed<string[]>(() =>
  kbCollectUniq((m) => (m?.review_cycle ?? m?.review) as string | undefined)
);

/* —— OKR ref heuristic: match exec-NNN-NN patterns in title/path/frontmatter —— */
function kbExtractOkrRef(meta: Record<string, unknown> | undefined, raw: any): { ref: string; anchor: string } | null {
  const candidates: string[] = [];
  if (meta?.okr_id) candidates.push(String(meta.okr_id));
  if (meta?.okr) candidates.push(String(meta.okr));
  if (meta?.related && Array.isArray(meta.related)) {
    for (const r of meta.related) candidates.push(String(r));
  }
  if (raw?.path) candidates.push(raw.path);
  if (raw?.title) candidates.push(raw.title);
  if (meta?.title) candidates.push(String(meta.title));
  const re = /(exec[-_ ]\d{2,3}[-_ ]\d{1,3})/i;
  for (const c of candidates) {
    const m = String(c).replace(/\s+/g, "-").match(re);
    if (m) {
      const ref = m[1].replace(/[ _]/g, "-").toLowerCase();
      return { ref, anchor: c };
    }
  }
  return null;
}

const REVIEW_CYCLE_DAYS: Record<string, number> = {
  weekly: 7,
  biweekly: 14,
  monthly: 30,
  quarterly: 90,
  "half-yearly": 182,
  yearly: 365,
  annual: 365
};

/* —— 纯内存过滤 —— */
function kbPredicate(r: FlatFileRow | KbFileRow): boolean {
  const row = r as KbFileRow;
  // 1) domain selection
  if (kbActiveDomains.value.length > 0 && !kbActiveDomains.value.includes(row.domainId)) return false;
  // 1b) domain text filter (label contains)
  if (kbFilters.domainText) {
    if (!String(row.domain ?? "").toLowerCase().includes(kbFilters.domainText.toLowerCase())) return false;
  }
  // 1c) structural tag filter
  if (kbFilters.structuralTag) {
    if (!(row.tags ?? []).includes(kbFilters.structuralTag)) return false;
  }
  // 2) quick filters
  if (kbQuick.value) {
    const s = String(row.status ?? "").toLowerCase();
    const rv = String(row.reviewCycle ?? row.review ?? "").toLowerCase();
    switch (kbQuick.value) {
      case "todo":
        if (!s.includes("todo") && !s.includes("backlog") && !s.includes("queued")) return false;
        break;
      case "wip":
        if (
          !s.includes("wip") &&
          !s.includes("draft") &&
          !s.includes("doing") &&
          !s.includes("work")
        )
          return false;
        break;
      case "need-review":
        if (!rv.includes("review") && !s.includes("review")) return false;
        break;
      case "archived":
        if (!s.includes("archive") && !s.includes("done") && !s.includes("complete")) return false;
        break;
      case "stale":
        if (!row.reviewStale) return false;
        break;
    }
  }
  // 3) keyword (match title / path / tags now)
  if (kbFilters.titleKeyword) {
    const kw = kbFilters.titleKeyword.toLowerCase();
    const tagStr = (row.tags ?? []).join(" ");
    const hay = `${row.title ?? ""} ${row.name ?? ""} ${row.path ?? ""} ${tagStr} ${row.benefit ?? ""}`.toLowerCase();
    if (!hay.includes(kw)) return false;
  }
  // 4) attribute filters — exact option values (selects)
  if (kbFilters.type && String(row.type ?? "") !== kbFilters.type) return false;
  if (kbFilters.status && String(row.status ?? "") !== kbFilters.status) return false;
  if (kbFilters.lifecycle && String(row.lifecycle ?? "") !== kbFilters.lifecycle) return false;
  if (kbFilters.review) {
    const val = String(row.reviewCycle ?? row.review ?? "");
    if (val !== kbFilters.review) return false;
  }
  if (kbFilters.role) {
    const rolePtn = String(kbFilters.role).toLowerCase();
    // Strong match: frontmatter roles
    if ((row.roles ?? []).some((x) => String(x).toLowerCase().includes(rolePtn))) {
      // ok
    } else {
      // Fallback heuristic: title/path contains role id (SSOT compat)
      const hay = `${row.title ?? ""} ${row.path ?? ""}`.toLowerCase();
      if (!hay.includes(rolePtn)) return false;
    }
  }
  return true;
}

const MATURITY_ORDER: Record<string, number> = {
  stable: 0,
  active: 0,
  evolving: 1,
  draft: 2,
  "in-review": 2,
  deprecated: 3,
  archived: 3
};

function kbApplySort(list: KbFileRow[]): KbFileRow[] {
  if (!list.length) return list;
  const copy = list.slice();
  switch (kbSort.value) {
    case "maturity_desc":
      copy.sort((a, b) => {
        const sa = MATURITY_ORDER[String(a.status ?? "").toLowerCase()] ?? 99;
        const sb = MATURITY_ORDER[String(b.status ?? "").toLowerCase()] ?? 99;
        if (sa !== sb) return sa - sb;
        const la = MATURITY_ORDER[String(a.lifecycle ?? "").toLowerCase()] ?? 99;
        const lb = MATURITY_ORDER[String(b.lifecycle ?? "").toLowerCase()] ?? 99;
        if (la !== lb) return la - lb;
        return (b.size ?? 0) - (a.size ?? 0);
      });
      break;
    case "size_asc":
      copy.sort((a, b) => (a.size ?? 0) - (b.size ?? 0));
      break;
    case "size_desc":
      copy.sort((a, b) => (b.size ?? 0) - (a.size ?? 0));
      break;
    case "updated_desc":
      copy.sort(
        (a, b) =>
          new Date(b.updatedAt ?? 0).getTime() - new Date(a.updatedAt ?? 0).getTime()
      );
      break;
    case "updated_asc":
      copy.sort(
        (a, b) =>
          new Date(a.updatedAt ?? 0).getTime() - new Date(b.updatedAt ?? 0).getTime()
      );
      break;
    default:
      // default: stable first, then by size desc (SSOT maturity sort)
      copy.sort((a, b) => {
        const sa = MATURITY_ORDER[String(a.status ?? "").toLowerCase()] ?? 99;
        const sb = MATURITY_ORDER[String(b.status ?? "").toLowerCase()] ?? 99;
        if (sa !== sb) return sa - sb;
        return a.title.localeCompare(b.title);
      });
      break;
  }
  return copy;
}

function kbNormalizeRow(raw: FlatFileRow): KbFileRow {
  const r = raw as any;
  const meta = raw?.file?.meta as Record<string, unknown> | undefined;
  const tags: string[] = Array.isArray(meta?.tags) ? (meta.tags as string[]).map(String) : [];
  const roles: string[] = Array.isArray(meta?.roles) ? (meta.roles as string[]).map(String) : [];
  const reviewCycle = (meta?.review_cycle as string | undefined) ?? undefined;
  const rawUpdated = (meta?.updated as unknown) ?? r.file?.updatedAt ?? r.updatedAt;
  let updatedAtMs: number | null = null;
  if (typeof rawUpdated === "number" && Number.isFinite(rawUpdated) && rawUpdated > 0) {
    updatedAtMs = rawUpdated > 1e12 ? rawUpdated : rawUpdated * 1000;
  } else if (typeof rawUpdated === "string" && rawUpdated.trim()) {
    const t = new Date(rawUpdated).getTime();
    if (Number.isFinite(t)) updatedAtMs = t;
  }
  const updatedAtLabel = updatedAtMs != null
    ? new Date(updatedAtMs).toLocaleString(undefined, { year: "numeric", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })
    : (r.updatedAt as string | undefined) ?? "—";
  let stalenessDays: number | null = null;
  let reviewStale = false;
  if (updatedAtMs != null) {
    const days = Math.floor((Date.now() - updatedAtMs) / 86_400_000);
    stalenessDays = days;
    if (reviewCycle) {
      const threshold = REVIEW_CYCLE_DAYS[String(reviewCycle).toLowerCase()] ?? 90;
      if (days > threshold) reviewStale = true;
    }
  }
  const structural =
    kbStructuralTagSet.value.length > 0 &&
    tags.some((t) => kbStructuralTagSet.value.includes(String(t)));
  const okr = kbExtractOkrRef(meta, r);
  return {
    path: r.path ?? r.relPath ?? "",
    name: r.name ?? "",
    title: (meta?.title as string | undefined) ?? r.title ?? r.name ?? "",
    domain: r.domain ?? "",
    domainId: r.domainId ?? "",
    domainIcon: r.domainIcon ?? "📁",
    domainColor: r.domainColor ?? "",
    type: (meta?.type as string | undefined) ?? undefined,
    status: (meta?.status as string | undefined) ?? undefined,
    lifecycle: (meta?.lifecycle as string | undefined) ?? undefined,
    review: (meta?.review as string | undefined) ?? undefined,
    reviewCycle,
    benefit: (meta?.benefit as string | undefined) ?? undefined,
    category: (meta?.category as string | undefined) ?? undefined,
    tags,
    roles,
    okrRef: okr?.ref,
    okAnchor: okr?.anchor,
    isStructural: structural,
    stalenessDays,
    reviewStale,
    size: Number(r.size ?? r.file?.size ?? 0),
    updatedAt: updatedAtLabel,
    ext: (r.ext ?? (r.name || "").split(".").pop() ?? "") as string
  };
}

const kbFilteredRows = computed<KbFileRow[]>(() => {
  const all = kbDashboard.filteredFiles.value ?? kbDashboard.flatFiles.value ?? [];
  return kbApplySort(
    (all as FlatFileRow[]).map(kbNormalizeRow).filter((row) => kbPredicate(row))
  );
});

const kbFilteredTotal = computed<number>(() => kbFilteredRows.value.length);

/* —— Active filter chips (ExecutiveDashboard chip-stack pattern) —— */
interface KbActiveChip {
  key: string;
  label: string;
  type: "success" | "warning" | "info" | "primary" | "danger";
  onClose: () => void;
}
const kbAnyFilter = computed<boolean>(() => {
  return !!(
    kbFilters.titleKeyword ||
    kbFilters.domainText ||
    kbFilters.type ||
    kbFilters.status ||
    kbFilters.lifecycle ||
    kbFilters.review ||
    kbFilters.role ||
    kbFilters.structuralTag ||
    kbActiveDomains.value.length > 0 ||
    kbQuick.value
  );
});
const kbActiveChips = computed<KbActiveChip[]>(() => {
  const out: KbActiveChip[] = [];
  if (kbFilters.titleKeyword)
    out.push({
      key: "kw",
      label: `🔍 "${kbFilters.titleKeyword}"`,
      type: "primary",
      onClose: () => (kbFilters.titleKeyword = "")
    });
  if (kbFilters.domainText)
    out.push({
      key: "domain",
      label: `🧭 Domain: ${kbFilters.domainText}`,
      type: "info",
      onClose: () => (kbFilters.domainText = "")
    });
  for (const id of kbActiveDomains.value) {
    const sub = kbSubdirs.value.find((s) => s.id === id);
    out.push({
      key: `d-${id}`,
      label: `${sub?.icon ?? ""} ${sub?.label ?? id}`,
      type: "primary",
      onClose: () => kbToggleDomain(id)
    });
  }
  if (kbFilters.structuralTag)
    out.push({
      key: "struct",
      label: `🧩 Struct: ${kbFilters.structuralTag}`,
      type: "success",
      onClose: () => (kbFilters.structuralTag = "")
    });
  if (kbFilters.type)
    out.push({
      key: "type",
      label: `Type: ${kbFilters.type}`,
      type: "warning",
      onClose: () => (kbFilters.type = "")
    });
  if (kbFilters.status)
    out.push({
      key: "status",
      label: `Status: ${kbFilters.status}`,
      type: "warning",
      onClose: () => (kbFilters.status = "")
    });
  if (kbFilters.lifecycle)
    out.push({
      key: "lf",
      label: `Lifecycle: ${kbFilters.lifecycle}`,
      type: "success",
      onClose: () => (kbFilters.lifecycle = "")
    });
  if (kbFilters.review)
    out.push({
      key: "rv",
      label: `Review: ${kbFilters.review}`,
      type: "info",
      onClose: () => (kbFilters.review = "")
    });
  if (kbFilters.role)
    out.push({
      key: "role",
      label: `👔 Role: ${kbFilters.role}`,
      type: "success",
      onClose: () => (kbFilters.role = "")
    });
  if (kbQuick.value)
    out.push({
      key: "q",
      label: `⚡ Quick: ${kbQuick.value}`,
      type: "danger",
      onClose: () => (kbQuick.value = "")
    });
  return out;
});

/* —— ProTable contract（与现有阅读条 ProTable 保持同构） —— */
const kbFileTableRef = ref<ProTableInstance | null>(null);
const kbInitParam = reactive({ pageSize: 10, pageIndex: 1 });
const kbFileTableInitParam = { pageSize: 10 };

type KbFetchParams = { pageSize: number; pageIndex: number };

async function kbFileTableFetch(params: KbFetchParams) {
  try {
    if (!kbDashboard.loading.value && kbFlatTotal.value === 0) {
      await kbDashboard.refresh?.().catch(() => void 0);
    }
    const list = kbFilteredRows.value;
    const size = Number(params.pageSize) || 10;
    const idx = Math.max(1, Number(params.pageIndex) || 1);
    const start = (idx - 1) * size;
    // ProTable useTable contract (useTable.ts L65):
    //   let { data } = await api(params);
    //   data = dataCallback?.(data);
    //   state.tableData = data.list;
    //   state.pageable.total = data.total;
    return {
      data: {
        result: list.slice(start, start + size),
        total: list.length
      }
    };
  } catch {
    return { data: { result: [], total: 0 } };
  }
}

function kbFileTableTransform(payload: any) {
  // Receive payload = { result: pageItems, total: N } from request-api's data envelope
  return {
    list: Array.isArray(payload?.result) ? payload.result : [],
    total: Number(payload?.total ?? 0)
  };
}

/* —— Columns: enriched (mirrors RoleTableView + ExecutiveDashboard stat fields) —— */
const kbFileColumns = [
  { label: "Title / Benefit", prop: "title", width: 380, showOverflowTooltip: true },
  { label: "Domain", prop: "domain", width: 130 },
  { label: "Category", prop: "category", width: 110 },
  { label: "Tags", prop: "tags", width: 200, showOverflowTooltip: true },
  { label: "Type", prop: "type", width: 100 },
  { label: "Status", prop: "status", width: 100 },
  { label: "Lifecycle", prop: "lifecycle", width: 110 },
  { label: "Review", prop: "review", width: 150 },
  { label: "Size", prop: "size", width: 90, sortable: true },
  { label: "Updated", prop: "updatedAt", width: 170, sortable: true },
  { label: "Operation", prop: "operation", width: 180, fixed: "right" }
] as ColumnProps<KbFileRow>[];

/* —— Trigger a refresh —— */
function kbRefreshFileTable() {
  nextTick(() => kbFileTableRef.value?.getTableList?.());
}
async function kbRefreshAll() {
  try {
    await kbDashboard.refresh?.();
  } catch {
    /* SSOT 内部处理 */
  } finally {
    kbRefreshFileTable();
  }
}

/* —— Anchor helper (KR chip in Operation column) ——
 *  Accepts strings like:
 *    - "exec-003-02"                        (pure OKR id → lookup in okr subdir)
 *    - "001.md §跨书洞察矩阵"                 (local note ref → executive/reading-list path)
 *    - "strategy/board-q1-2025.md"           (subdir-relative path)
 *  SSOT: resolves through LinkFactory resolveLink → gateA → gateB → direct kbPreviewRef.open (gateC).
 */
function kbOpenAnchor(anchor: string) {
  if (!anchor) return;
  // 1) Pure OKR id like "exec-003-02": find the matching file in okr subdir by name/path contains
  if (/^exec[-_]\d{2,3}[-_]\d{1,3}$/i.test(anchor)) {
    const files = (kbDashboard.flatFiles.value ?? []) as any[];
    const normalized = anchor.toLowerCase().replace(/[ _]/g, "-");
    const match =
      files.find((f) => String(f.path ?? "").toLowerCase().includes(normalized)) ||
      files.find((f) =>
        String(f?.file?.meta?.okr_id ?? "")
          .toLowerCase()
          .replace(/[ _]/g, "-")
          .includes(normalized)
      );
    if (match) {
      kbOpenFile(kbNormalizeRow(match));
      return;
    }
  }
  // 2) Local note ref with § (e.g. "001.md §跨书洞察矩阵")
  const stripped = String(anchor)
    .replace(/§.*$/, "")
    .trim();
  if (stripped) {
    // Prepend executive role base path prefix if not absolute
    let candidate = stripped;
    if (!candidate.startsWith("executive/")) {
      // If already "reading-list/..." or "okr/..." prepend role prefix
      if (/^(reading-list|okr|rss|strategy|process|notes|tactical|governance)\//i.test(candidate)) {
        candidate = `executive/${candidate}`;
      } else if (!candidate.includes("/")) {
        // Plain filename like 001.md → reading-list subdir
        candidate = `executive/reading-list/${candidate}`;
      }
    }
    const files = (kbDashboard.flatFiles.value ?? []) as any[];
    const target = files.find((f) => {
      const p = String(f.path ?? "").toLowerCase();
      return p === candidate.toLowerCase() || p.endsWith("/" + candidate.toLowerCase());
    });
    if (target) {
      kbOpenFile(kbNormalizeRow(target));
      return;
    }
    // Fallback: try to resolve through the 3-gate chain (LinkFactory.resolveLink → gateBEntityExists)
    const resolved = LinkFactory.resolveLink("knowledge", { path: candidate });
    if (resolved) {
      const ok = gateBEntityExists({
        type: "knowledge",
        key: candidate,
        title: anchor,
        extra: { path: candidate }
      });
      if (ok) {
        kbPreviewRef.value?.open?.(candidate);
        kbPreviewPath.value = candidate;
        return;
      }
    }
  }
  ElMessage.warning(`无法定位锚点引用的知识文件: ${anchor}`);
}

/* —— Tag Type 映射 (v2 — aligned with RoleTableView/StandardRoleDashboard) —— */
function kbTagTypeOf(
  val: string,
  kind: "type" | "status" | "lifecycle" | "review"
): "success" | "warning" | "info" | "danger" | "primary" | undefined {
  const v = String(val ?? "").toLowerCase();
  if (kind === "status") {
    // RoleTableView alignment: stable/active → success, evolving → primary, draft → warning, deprecated/archived → danger
    if (v === "stable" || v === "active") return "success";
    if (v === "evolving") return "primary";
    if (v === "draft") return "warning";
    if (v === "deprecated" || v === "archived") return "danger";
    if (/(done|complete)/.test(v)) return "success";
    if (/(wip|doing|work|progress)/.test(v)) return "warning";
    if (/(todo|backlog|queued)/.test(v)) return "info";
    if (/(block|stuck|stop)/.test(v)) return "danger";
    if (v) return "primary";
    return undefined;
  }
  if (kind === "lifecycle") {
    // RoleTableView: stable→success, active/evolving→primary, draft/in-review→warning, deprecated→danger
    if (v === "stable") return "success";
    if (v === "active" || v === "evolving") return "primary";
    if (v === "draft" || v === "in-review") return "warning";
    if (v === "deprecated") return "danger";
    if (/(ga|live)/.test(v)) return "success";
    if (/(beta|incubat)/.test(v)) return "warning";
    if (/(alpha|proposal|idea)/.test(v)) return "info";
    if (/(obsolete)/.test(v)) return "danger";
    if (v) return "primary";
    return undefined;
  }
  if (kind === "review") {
    // Review-cycle (RoleTableView): monthly→warning, quarterly→primary, half/yearly→info
    if (v === "weekly" || v === "biweekly" || v === "monthly") return "warning";
    if (v === "quarterly") return "primary";
    if (v === "half-yearly" || v === "yearly" || v === "annual") return "info";
    // Review-result
    if (/(approved|pass|lgtm|done)/.test(v)) return "success";
    if (/(review|pending|awaiting)/.test(v)) return "warning";
    if (/(change|reject|blocked)/.test(v)) return "danger";
    if (v) return "info";
    return undefined;
  }
  // type
  if (/(summary|index|playbook|memo|policy|report|plan)/.test(v)) return "primary";
  if (/(template|design|proposal)/.test(v)) return "warning";
  if (/(framework)/.test(v)) return "primary";
  if (/(meeting|note|log)/.test(v)) return "info";
  if (/(spec|contract|sop|standard)/.test(v)) return "success";
  if (v) return undefined;
  return undefined;
}

/* —— File icon (v2 — + structural/OKR/reading-list hints) —— */
function kbFileIcon(row: KbFileRow): string {
  const type = String(row.type ?? "").toLowerCase();
  if (/(okr|goal)/.test(type)) return "🎯";
  if (/(rss|news|feed)/.test(type)) return "📰";
  if (row.okrRef) return "🎯";
  if (/(playbook|sop|policy)/.test(type)) return "📘";
  if (/(report|brief|dossier|qbr|board)/.test(type)) return "📚";
  if (/(roadmap|plan|strategy)/.test(type)) return "🗺";
  if (/(meeting|note|memo|process)/.test(type)) return "🗒";
  const path = String(row.path ?? "").toLowerCase();
  if (path.includes("okr")) return "🎯";
  if (path.includes("reading-list") || path.includes("读书笔记")) return "📘";
  if (path.includes("rss")) return "📰";
  if (path.includes("process")) return "🗒";
  const ext = (row.ext || row.name.split(".").pop() || "").toLowerCase();
  if (["md", "markdown"].includes(ext)) return "📝";
  if (["pdf"].includes(ext)) return "📕";
  if (["doc", "docx"].includes(ext)) return "📄";
  if (["xls", "xlsx", "csv"].includes(ext)) return "📊";
  if (["ppt", "pptx", "key"].includes(ext)) return "🎞";
  if (["png", "jpg", "jpeg", "gif", "svg", "webp"].includes(ext)) return "🖼";
  if (["json", "yaml", "yml", "toml", "ini", "conf"].includes(ext)) return "🧾";
  if (["mp3", "wav", "m4a", "flac"].includes(ext)) return "🎧";
  if (["mp4", "mov", "webm", "mkv"].includes(ext)) return "🎬";
  if (["url", "webloc", "link"].includes(ext)) return "🔗";
  return "📁";
}

function formatKbSize(size?: number) {
  const n = Number(size ?? 0);
  if (n <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"] as const;
  let u = 0;
  let v = n;
  while (v >= 1024 && u < units.length - 1) {
    v /= 1024;
    u += 1;
  }
  return `${v.toFixed(v < 10 && u > 0 ? 1 : 0)} ${units[u]}`;
}

/* —— 事件：打开 / 删除 —— */
async function kbOpenFile(row: KbFileRow) {
  if (!row?.path) return;
  const exists =
    kbDashboard.flatFiles.value?.some((f) => f.path === row.path) ?? true;
  if (!exists) {
    const ok = await gateBEntityExists({
      type: "knowledge",
      title: row.title,
      key: row.path,
      extra: { domainId: row.domainId, path: row.path }
    });
    if (!ok) return;
  }
  kbPreviewRef.value?.open?.(row.path);
  kbPreviewPath.value = row.path;
  nextTick(() =>
    gateCPostNavigate({
      expectedLink: row.path,
      expectedParams: { path: row.path, domainId: row.domainId },
      expectedTitleKeyword: row.title || "",
      timeoutMs: 2000
    })
  );
  pushReliabilityEvent({
    projectKey: "executive",
    phase: "P2-knowledge",
    status: "success",
    durationMs: 0,
    retryCount: 0,
    tags: { path: row.path, domainId: row.domainId ?? "" }
  });
}

async function kbDeleteFile(row: KbFileRow) {
  if (!row?.path) return;
  try {
    await (kbDashboard.removeFile as any)?.(row);
    ElMessage.success(`Deleted: ${row.title || row.path}`);
    kbRefreshFileTable();
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : "Delete failed");
  }
}

/* 过滤状态变更 → 刷新 table */
watch(
  () => [
    kbFilters.titleKeyword,
    kbFilters.domainText,
    kbFilters.type,
    kbFilters.status,
    kbFilters.lifecycle,
    kbFilters.review,
    kbFilters.role,
    kbFilters.structuralTag,
    kbSort.value,
    kbActiveDomains.value.length,
    kbQuick.value,
    kbFlatTotal.value
  ],
  () => kbRefreshFileTable()
);
</script>

<style lang="scss">
/* 本页样式完全由 styles/readingList.scss 接管（保持单入口）。 */
@use "./styles/readingList.scss";
</style>


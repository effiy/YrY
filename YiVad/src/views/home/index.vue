<template>
  <div class="ho-root page">
    <!-- Unified Header: works for loading / error / normal states -->
    <div class="ho-head">
      <div class="ho-head__left">
        <span class="ho-head__icon"><el-icon :size="18"><DataBoard /></el-icon></span>
        <div>
          <h1 class="ho-head__title">{{ t("home.title") }}</h1>
          <p class="ho-head__desc">{{ t("home.heroDesc") }}</p>
        </div>
      </div>
      <div class="ho-head__right">
        <span v-if="!loading && !error && live.data.value" class="ho-head__live">
          <span class="ho-head__dot" />YiAi {{ live.data.value.server_uptime }}h
        </span>
        <template v-if="!loading && !error">
          <span class="ho-head__stat">Chats <b>{{ stats.chatSessionCount }}</b></span>
          <span class="ho-head__stat">Docs <b>{{ stats.knowledgeFileCount }}</b></span>
          <span v-if="daily.yesterdayActivityCount.value" class="ho-head__stat">
            Y-day <b>{{ daily.yesterdayActivityCount.value }}</b>
          </span>
        </template>
        <span class="ho-head__date">{{ todayLabel }}</span>
        <!-- Navigating feedback pill (三闸门契约可视化) -->
        <transition name="ho-fade">
          <span v-if="navigating" class="ho-head__nav" :class="navState">
            <span v-if="navState === 'gate-a'" class="ho-head__nav-dot is-gate-a"></span>
            <span v-else-if="navState === 'gate-b'" class="ho-head__nav-dot is-gate-b"></span>
            <span v-else class="ho-head__nav-dot is-gate-c"></span>
            <span class="ho-head__nav-label">{{ navLabel }}</span>
            <el-icon v-if="navState === 'gate-c'" class="is-loading"><Loading /></el-icon>
          </span>
        </transition>
        <el-tooltip content="刷新全量数据" placement="top" :show-after="400">
          <el-button :icon="Refresh" link size="small" @click="retryAll" />
        </el-tooltip>
      </div>
    </div>

    <HomeSkeleton v-if="loading" />

    <template v-else-if="error">
      <div class="ho__error">
        <el-result icon="error" :title="t('home.error.loadFailed')" :sub-title="error">
          <template #extra>
            <el-button type="primary" @click="retryAll">{{ t("home.error.retry") }}</el-button>
          </template>
        </el-result>
      </div>
    </template>

    <template v-else>
      <!-- KPI Cards (4) - simplified, removed secondary sub-rows -->
      <div class="ho-metrics">
        <!-- Issues -->
        <el-tooltip content="Click to view all issues" placement="top" :show-after="500">
          <div class="ho-metric" @click="router.push('/issue')">
            <div class="ho-metric__row">
              <span class="ho-metric__label">Issues</span>
              <span v-if="deltas.totalIssues !== 0" class="ho-metric__delta" :class="deltas.totalIssues > 0 ? 'is-up' : 'is-down'">
                <el-icon :size="10"><component :is="deltas.totalIssues > 0 ? Top : Bottom" /></el-icon>{{ Math.abs(deltas.totalIssues) }}
              </span>
            </div>
            <span class="ho-metric__value">{{ animTotal }}</span>
            <div class="ho-metric__bars">
              <el-tooltip v-for="s in statusSegments" :key="s.key" :content="`${s.label}: ${s.count}`" :show-after="300">
                <span class="ho-metric__bar" :style="{ flex: s.count || 0.1, background: s.color }" @click.stop="router.push(s.link)" />
              </el-tooltip>
            </div>
            <div class="ho-metric__row ho-metric__row--sub">
              <span class="ho-metric__ctx" @click.stop="router.push('/issue?status=todo,in_progress,in_review')">
                {{ stats.activeIssueCount }} active
              </span>
              <span class="ho-metric__ctx" :style="{ color: rateColor(completionRate) }">
                {{ completionRate }}% resolved
              </span>
              <span v-if="dataQualityWarn" class="ho-metric__ctx is-warn" :title="dataQualityWarn">
                ⚠ data quality
              </span>
            </div>
          </div>
        </el-tooltip>

        <!-- Quality -->
        <el-tooltip content="Click to view all bugs" placement="top" :show-after="500">
          <div class="ho-metric" @click="router.push('/bug?status=open')" :class="{ 'is-danger': stats.criticalBugCount > 0 }">
            <div class="ho-metric__row">
              <span class="ho-metric__label">Quality</span>
              <span v-if="deltas.openBugCount !== 0" class="ho-metric__delta" :class="deltas.openBugCount > 0 ? 'is-up' : 'is-down'">
                <el-icon :size="10"><component :is="deltas.openBugCount > 0 ? Top : Bottom" /></el-icon>{{ Math.abs(deltas.openBugCount) }}
              </span>
            </div>
            <span class="ho-metric__value" :style="{ color: stats.openBugCount > 0 ? 'var(--ho-status-danger)' : 'var(--ho-status-clear)' }">
              {{ animBugs }}
            </span>
            <div v-if="stats.bugSeverityGroups.length" class="ho-metric__bars">
              <el-tooltip v-for="g in stats.bugSeverityGroups.slice(0, 5)" :key="g.value" :content="`${sevLabel(g.value)}: ${g.count}`" :show-after="300">
                <span class="ho-metric__bar" :style="{ flex: g.count || 0.1, background: sevColor(g.value) }" @click.stop="router.push('/bug?severity=' + g.value)" />
              </el-tooltip>
            </div>
            <div class="ho-metric__row ho-metric__row--sub">
              <span class="ho-metric__ctx" :class="{ 'is-danger': stats.criticalBugCount > 0 }" @click.stop="router.push('/bug?severity=critical')">
                Critical {{ stats.criticalBugCount }}
              </span>
              <span class="ho-metric__ctx" @click.stop="router.push('/bug?severity=major')">Major {{ stats.majorBugCount }}</span>
              <span class="ho-metric__ctx" :title="`${stats.todayBugResolvedCount} fixed · ${stats.todayBugOpenCount} new today`">
                {{ bugRatio }}% of issues
              </span>
            </div>
          </div>
        </el-tooltip>

        <!-- Throughput -->
        <el-tooltip content="Weekly delivery throughput" placement="top" :show-after="500">
          <div class="ho-metric" @click="router.push('/issue?quickFilter=done&days=7')">
            <div class="ho-metric__row">
              <span class="ho-metric__label">Throughput</span>
              <span v-if="velocityDelta !== 0" class="ho-metric__delta" :class="velocityDelta > 0 ? 'is-up' : 'is-down'">
                <el-icon :size="10"><component :is="velocityDelta > 0 ? Top : Bottom" /></el-icon>{{ Math.abs(velocityDelta) }}%
              </span>
            </div>
            <span class="ho-metric__value" style="color:var(--ho-status-clear)">{{ stats.doneWeekCount }}</span>
            <div class="ho-metric__bars">
              <span class="ho-metric__bar" :style="{ flex: weekProgress || 1, background: progressColor(weekProgress) }" />
            </div>
            <div class="ho-metric__row ho-metric__row--sub">
              <span class="ho-metric__ctx">{{ velocityPerDay }}/day</span>
              <span class="ho-metric__ctx">vs {{ stats.doneLastWeekCount }} last</span>
              <span class="ho-metric__ctx" :style="{ color: progressColor(weekProgress) }">
                {{ weekProgress }}% of {{ weeklyGoal }}
              </span>
            </div>
          </div>
        </el-tooltip>

        <!-- Attention -->
        <div class="ho-metric ho-metric--attn" :class="{ 'is-warn': healthWarnings > 0 }">
          <div class="ho-metric__row">
            <span class="ho-metric__label">Attention</span>
            <span v-if="healthWarnings > 0" class="ho-metric__delta is-up">{{ healthWarnings }} items</span>
            <span v-else class="ho-metric__delta is-down">Clear</span>
          </div>
          <div class="ho-attn">
            <div class="ho-attn__item" :class="{ 'is-warn': stats.overdueCount > 0 }" @click.stop="router.push('/issue?overdue=true')">
              <span class="ho-attn__n" :style="{ color: stats.overdueCount > 0 ? 'var(--ho-status-warn)' : 'var(--ho-text-secondary)' }">{{ stats.overdueCount || 0 }}</span>
              <span class="ho-attn__l">Overdue</span>
            </div>
            <div class="ho-attn__item" :class="{ 'is-danger': stats.blockedCount > 0 }" @click.stop="router.push('/issue?status=todo,in_progress,in_review&blocked=true')">
              <span class="ho-attn__n" :style="{ color: stats.blockedCount > 0 ? 'var(--ho-status-danger)' : 'var(--ho-text-secondary)' }">{{ stats.blockedCount || 0 }}</span>
              <span class="ho-attn__l">Blocked</span>
            </div>
            <div class="ho-attn__item" :class="{ 'is-warn': stats.unassignedCount > 0 }" @click.stop="router.push('/issue?status=todo,in_progress,in_review&assignee=none')">
              <span class="ho-attn__n" :style="{ color: stats.unassignedCount > 0 ? 'var(--ho-text-secondary)' : 'var(--ho-text-placeholder)' }">{{ stats.unassignedCount || 0 }}</span>
              <span class="ho-attn__l">Unassigned</span>
            </div>
            <div class="ho-attn__item" :class="{ 'is-warn': stats.staleCount > 0 }" @click.stop="router.push('/issue?stale=14')">
              <span class="ho-attn__n" :style="{ color: stats.staleCount > 0 ? 'var(--ho-text-secondary)' : 'var(--ho-text-placeholder)' }">{{ stats.staleCount || 0 }}</span>
              <span class="ho-attn__l">Stale</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Body: Daily Focus + Activity | Sidebar -->
      <div class="ho__body">
        <div class="ho__main">
          <!-- Today's Focus (curator-driven Focus Board + Issue dynamic list) -->
          <section class="ho-card">
            <div class="ho-card__head ho-card__head--focus">
              <span class="ho-card__title">{{ t("home.today.title") }}</span>
              <span class="ho-card__sub">{{ todayLabel }}</span>
              <span v-if="daily.loading.value" class="ho-card__badge"><el-icon class="is-loading"><Loading /></el-icon></span>
            </div>

            <div v-if="focus.loading.value && !focusBoardHasContent" class="ho-card__loading">
              <el-icon class="is-loading"><Loading /></el-icon>
            </div>

            <template v-else-if="focusBoardHasContent">
              <!-- Hero Banner (compact Activity-style) -->
              <div
                v-if="focus.hero.value.hero"
                class="ho-actlist"
                :class="'is-hero-' + (focus.sre.value.level || 'clear')"
                @click="openAnchor(BOARD_ANCHORS.focusMain)"
              >
                <div class="ho-activity__head">
                  <span>FOCUS · {{ focus.hero.value.date || todayLabel }}</span>
                  <span v-if="focus.sre.value.level" class="ho-actlist__tag" :style="{ color: sreMeta(focus.sre.value.level).color, background: sreMeta(focus.sre.value.level).bg }">
                    SRE · {{ sreMeta(focus.sre.value.level).text }}
                  </span>
                  <el-tooltip content="打开今日焦点总控（完整 8 段式看板）" :show-after="400">
                    <el-button link size="small" class="ho-fb-btn-chevron">总控 →</el-button>
                  </el-tooltip>
                </div>
                <div class="ho-actlist__hero-item">
                  <span class="ho-activity__icon"><el-icon><DataBoard /></el-icon></span>
                  <span class="ho-actlist__verb">hero</span>
                  <span class="ho-actlist__hero-title">{{ focus.hero.value.hero }}</span>
                  <span class="ho-activity__spacer" />
                  <span v-if="focus.hero.value.must_do_one" class="ho-actlist__must-pill">MUST {{ truncate(focus.hero.value.must_do_one, 48) }}</span>
                </div>
                <div v-if="focus.hero.value.narrative" class="ho-actlist__narr">
                  {{ focus.hero.value.narrative }}
                </div>
              </div>

              <!-- SRE Status Matrix (full-width) -->
              <div v-if="focus.sre.value.items.length" class="ho-fb-sre">
                <div class="ho-fb-sre__head">
                  <div class="ho-fb-sre__head-left">
                    <span class="ho-fb-sre__label">SRE 运行红黄灯</span>
                    <el-tooltip content="点击标签快速过滤级别（可多选）" :show-after="400">
                      <div class="ho-fb-sre__legend" role="toolbar" aria-label="SRE 级别过滤">
                        <span
                          v-for="(lvl, idx) in sreLevelLegend"
                          :key="lvl.key"
                          class="ho-fb-sre-legend"
                          :class="['is-' + lvl.key, { 'is-active': activeSreFilters.includes(lvl.key), 'is-empty': lvl.count === 0 }]"
                          :title="`${sreLevelLabel(lvl.key)} × ${lvl.count}`"
                          :data-level-filter="lvl.key"
                          @click="toggleSreLevelFilter(lvl.key, idx)"
                        >
                          <span class="ho-fb-sre-legend__dot" :style="{ background: lvl.color }" />
                          <span class="ho-fb-sre-legend__text">{{ sreLevelLabel(lvl.key) }}</span>
                          <span class="ho-fb-sre-legend__count">{{ lvl.count }}</span>
                        </span>
                      </div>
                    </el-tooltip>
                  </div>
                  <span class="ho-fb-sre__count">
                    {{ focus.sre.value.items.length }} 条 · SLO {{ sreSloPct }}%
                  </span>
                  <el-tooltip content="SRE 运行手册：Impact / Root Hypothesis / Mitigation / ETA" :show-after="400">
                    <el-button link size="small" class="ho-fb-btn-chevron" @click="openAnchor(BOARD_ANCHORS.sreDetail)">详情 →</el-button>
                  </el-tooltip>
                </div>

                <!-- Full-width severity heat strip (spans the container edge-to-edge) -->
                <div class="ho-fb-sre__strip" :aria-label="`级别分布：Critical ${sreLevelCounts.critical || 0}, Major ${sreLevelCounts.major || 0}, Warn ${sreLevelCounts.warn || 0}, Clear ${sreLevelCounts.clear || 0}`">
                  <el-tooltip v-for="seg in sreHeatSegments" :key="seg.key" :content="`${sreLevelLabel(seg.key)}: ${seg.count} 条 · ${seg.pct}%`" :show-after="300">
                    <span
                      class="ho-fb-sre-strip__seg"
                      :class="['is-' + seg.key, { 'is-clickable': seg.count > 0 }]"
                      :style="{ flex: seg.count || 0.35, background: seg.color }"
                      @click="seg.count > 0 && toggleSreLevelFilter(seg.key, seg.index)"
                    >
                      <span v-if="seg.count >= 1" class="ho-fb-sre-strip__label">
                        {{ sreLevelLabel(seg.key).slice(0, 1) }} {{ seg.count }}
                      </span>
                    </span>
                  </el-tooltip>
                </div>

                <!-- Items grid: full-width responsive columns, auto-fill width -->
                <div class="ho-fb-sre__grid" :data-filter-mode="activeSreFilters.length ? 'filtered' : 'all'">
                  <el-tooltip
                    v-for="(item, i) in filteredSreItems"
                    :key="(item.id || item.title) + '-' + i"
                    placement="top"
                    :show-after="350"
                  >
                    <template #content>
                      <div class="ho-fb-sre-tip">
                        <div class="ho-fb-sre-tip__title" :style="{ color: sreMeta(item.level).color }">
                          {{ sreMeta(item.level).text }} · {{ item.title }}
                        </div>
                        <div v-if="item.detail" class="ho-fb-sre-tip__body">{{ item.detail }}</div>
                        <div v-if="item.owner" class="ho-fb-sre-tip__foot">Owner: {{ item.owner }}</div>
                        <div v-else class="ho-fb-sre-tip__foot">点击查看完整 SRE 手册</div>
                      </div>
                    </template>
                    <div
                      class="ho-fb-sre-item"
                      :class="['is-' + item.level, { 'is-flash': i === 0 && (item.level === 'critical' || item.level === 'major') }]"
                      :tabindex="0"
                      @click="openSreDetails(item)"
                      @keydown.enter.prevent="openSreDetails(item)"
                      @keydown.space.prevent="openSreDetails(item)"
                    >
                      <div class="ho-fb-sre-item__top">
                        <span class="ho-fb-sre-item__led" :class="{ 'is-pulse': item.level === 'critical' }" :style="{ background: sreMeta(item.level).color }" />
                        <span class="ho-fb-sre-item__tag" :style="{ color: sreMeta(item.level).color, background: sreMeta(item.level).bg }">
                          {{ sreMeta(item.level).label }}
                        </span>
                        <span class="ho-fb-sre-item__title">{{ item.title }}</span>
                        <span class="ho-fb-sre-item__spacer" />
                        <span v-if="item.owner" class="ho-fb-sre-item__owner">
                          <el-icon :size="9"><UserFilled /></el-icon>
                          <span>{{ item.owner }}</span>
                        </span>
                        <span class="ho-fb-sre-item__chev"><el-icon :size="12"><ArrowRight /></el-icon></span>
                      </div>
                      <div v-if="item.detail" class="ho-fb-sre-item__mid">
                        <span class="ho-fb-sre-item__detail">{{ item.detail }}</span>
                      </div>
                      <div class="ho-fb-sre-item__bot">
                        <span class="ho-fb-sre-item__imp" :style="{ background: sreMeta(item.level).bg, color: sreMeta(item.level).color }">
                          Impact · {{ impactLabel(item.level) }}
                        </span>
                        <span class="ho-fb-sre-item__hint">↵ 查看运行手册</span>
                      </div>
                    </div>
                  </el-tooltip>
                </div>

                <div v-if="activeSreFilters.length" class="ho-fb-sre__foot">
                  <span class="ho-fb-sre__foot-tip">
                    当前过滤：{{ activeSreFilters.map(sreLevelLabel).join(' · ') }}（共 {{ filteredSreItems.length }} / {{ focus.sre.value.items.length }} 条）
                  </span>
                  <el-button link size="small" class="ho-fb-sre__foot-clear" @click="clearSreFilters()">× 清除过滤</el-button>
                </div>
              </div>

              <!-- OKR Trackers (Activity list style) -->
              <div v-if="focus.okrs.value.length" class="ho-actlist">
                <div class="ho-activity__head">
                  <span>OKR 锚点追踪</span>
                  <span class="ho-actlist__count">{{ focus.okrs.value.length }} goals</span>
                  <el-tooltip content="OKR 推进追踪卡（推进 / 卡点 / 下一锚点 / 预期产出）" :show-after="400">
                    <el-button link size="small" class="ho-fb-btn-chevron" @click="openAnchor(BOARD_ANCHORS.okrTracker)">追踪卡 →</el-button>
                  </el-tooltip>
                </div>
                <div class="ho-actlist__items">
                  <div
                    v-for="o in focus.okrs.value"
                    :key="o.id"
                    class="ho-activity__item ho-actlist__item ho-actlist__item--okr"
                    @click="openOkrDetails(o)"
                  >
                    <span class="ho-activity__icon is-col-okr"><el-icon><DataBoard /></el-icon></span>
                    <span class="ho-actlist__sev-okr" :style="{ color: okrStatusMeta(o.status).color, background: okrStatusMeta(o.status).bg }">{{ okrStatusMeta(o.status).text }}</span>
                    <span class="ho-actlist__verb">{{ o.id }}</span>
                    <span class="ho-activity__title">{{ o.title }}</span>
                    <span class="ho-activity__spacer" />
                    <span v-if="typeof o.coverage === 'number' && typeof o.total === 'number'" class="ho-actlist__cov">KR {{ o.coverage }}/{{ o.total }}</span>
                    <span v-if="o.owner" class="ho-actlist__owner">{{ o.owner }}</span>
                    <span class="ho-actlist__progbar">
                      <span class="ho-actlist__progfill" :style="{ width: o.progress + '%', background: progressColor(o.progress) }" />
                    </span>
                    <span class="ho-actlist__pct" :style="{ color: progressColor(o.progress) }">{{ o.progress }}%</span>
                  </div>
                </div>
              </div>

              <!-- Role Actions (Activity list style) -->
              <div v-if="focus.actions.value.length" class="ho-actlist">
                <div class="ho-activity__head">
                  <span>角色化今日行动项</span>
                  <span class="ho-actlist__count">
                    {{ focus.actions.value.filter(a => a.status === 'done').length }}/{{ focus.actions.value.length }} done
                  </span>
                  <el-tooltip content="6 大角色 × 5W1H 行动项（What / Why / How / Who / When / Where）" :show-after="400">
                    <el-button link size="small" class="ho-fb-btn-chevron" @click="openAnchor(BOARD_ANCHORS.roleActions)">5W1H →</el-button>
                  </el-tooltip>
                </div>
                <div class="ho-actlist__items">
                  <div
                    v-for="(a, i) in focus.actions.value"
                    :key="(a.role) + a.title + i"
                    class="ho-activity__item ho-actlist__item"
                    @click="openActionDetails(a)"
                  >
                    <span class="ho-activity__icon" :style="{ color: priorityColor(a.priority) }"><el-icon><Top /></el-icon></span>
                    <span class="ho-actlist__role-pill">{{ a.role }}</span>
                    <span class="ho-actlist__pri-pill" :style="{ background: priorityColor(a.priority) }">{{ priorityLabel(a.priority) }}</span>
                    <span class="ho-actlist__verb">{{ actionStatusMeta(a.status).text }}</span>
                    <span class="ho-activity__title">{{ a.title }}</span>
                  </div>
                </div>
              </div>

              <!-- 3-2-1 Daily Digest (Activity list style) -->
              <div v-if="digestHasContent" class="ho-actlist" :class="{ 'is-digest-degraded': !digestCompliant }">
                <div class="ho-activity__head">
                  <span>3-2-1 决策摘要</span>
                  <span v-if="!digestCompliant" class="ho-actlist__degraded">⚠ 已降级</span>
                  <span v-else class="ho-actlist__count">3 sig / 2 dec / 1 red</span>
                  <el-tooltip content="完整 60 秒决策简报（信号×3 / 决策×2 / 红线×1）" :show-after="400">
                    <el-button link size="small" class="ho-fb-btn-chevron" @click="openAnchor(BOARD_ANCHORS.digest)">简报 →</el-button>
                  </el-tooltip>
                </div>
                <div class="ho-actlist__items">
                  <!-- Signals -->
                  <div v-if="focus.digest.value.signals.length" class="ho-actlist__sub">
                    <div class="ho-actlist__sub-label ho-actlist__sub-label--sig">SIGNAL × 3</div>
                    <div
                      v-for="s in focus.digest.value.signals"
                      :key="s.id"
                      class="ho-activity__item ho-actlist__item"
                      @click="openSignalDetails(s)"
                    >
                      <span class="ho-activity__icon is-col-sig"><el-icon><Document /></el-icon></span>
                      <span class="ho-actlist__sig-level" :class="'is-' + digestLevel(s.level)">{{ digestLevel(s.level) }}</span>
                      <span class="ho-actlist__verb">{{ s.id }}</span>
                      <span class="ho-activity__title">{{ s.title }}</span>
                      <span v-if="typeof s.confidence === 'number'" class="ho-actlist__conf">{{ s.confidence }}%</span>
                    </div>
                  </div>

                  <!-- Decisions -->
                  <div v-if="focus.digest.value.decisions.length" class="ho-actlist__sub">
                    <div class="ho-actlist__sub-label ho-actlist__sub-label--dec">DECISION × 2</div>
                    <div
                      v-for="d in focus.digest.value.decisions"
                      :key="d.id"
                      class="ho-activity__item ho-actlist__item"
                      @click="openDecisionDetails(d)"
                    >
                      <span class="ho-activity__icon is-col-dec"><el-icon><DataBoard /></el-icon></span>
                      <span class="ho-actlist__dec-pill">{{ d.recommend || 'PENDING' }}</span>
                      <span class="ho-actlist__verb">{{ d.id }}</span>
                      <span class="ho-activity__title">{{ d.title }}</span>
                      <el-tooltip v-if="d.deadline" :content="d.deadline" placement="top" :show-after="300">
                        <span class="ho-actlist__dead">⏰ {{ d.deadline.split(' ')[0] }}</span>
                      </el-tooltip>
                    </div>
                  </div>

                  <!-- Redlines -->
                  <div v-if="focus.digest.value.redlines.length" class="ho-actlist__sub ho-actlist__sub--red">
                    <div class="ho-actlist__sub-label ho-actlist__sub-label--redline">REDLINE × 1</div>
                    <div
                      v-for="r in focus.digest.value.redlines"
                      :key="r.id"
                      class="ho-activity__item ho-actlist__item"
                      @click="openRedlineDetails(r)"
                    >
                      <span class="ho-activity__icon is-col-red"><el-icon><Warning /></el-icon></span>
                      <span class="ho-actlist__red-pill">{{ r.id }}</span>
                      <span class="ho-activity__title">{{ r.title }}<span v-if="r.detail" class="ho-actlist__subtext"> · {{ r.detail }}</span></span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Issue 动态分隔线：以 KB Bug Feed 4 组内容是否存在为触发 -->
              <div v-if="hasIssueFeed" class="ho-fb-divider"><span>Issue 动态</span>
                <el-tooltip content="跳转所有项目缺陷索引（YiKnowledge · 5 个项目）" :show-after="400">
                  <el-button link size="small" class="ho-fb-btn-chevron" @click="openAnchor(BUG_ANCHORS.yivadIndex)">Bugs →</el-button>
                </el-tooltip>
              </div>
            </template>

            <div v-if="(daily.loading.value || knowledge.loading.value) && !hasIssueFeed" class="ho-card__loading">
              <el-icon class="is-loading"><Loading /></el-icon>
            </div>

            <div v-else-if="!hasIssueFeed" class="ho-card__empty">
              <span class="ho-focus__empty-icon"><el-icon :size="20"><CircleCheck /></el-icon></span>
              <span>{{ t("home.today.allClear") }}</span>
            </div>

            <div v-else class="ho-actlist">
              <!-- Group 1: P0/P1 Critical — severity critical/major (SRE 红黄灯) -->
              <div v-if="kbBugCritical.length" class="ho-actlist__sub ho-issue-group ho-issue-group--critical">
                <div class="ho-activity__head">
                  <span class="ho-issue-group__label ho-issue-group__label--danger">
                    <el-icon :size="10"><Warning /></el-icon> 高危缺陷
                  </span>
                  <span class="ho-actlist__count ho-actlist__count--warn">{{ kbBugCritical.length }}</span>
                  <el-tooltip content="STRIDE 威胁模型对照：影响 CIA 三要素的条目" :show-after="400">
                    <el-button link size="small" class="ho-fb-btn-chevron" @click="openAnchor(BUG_ANCHORS.sreRunbook)">Runbook →</el-button>
                  </el-tooltip>
                </div>
                <div class="ho-actlist__items">
                  <div
                    v-for="bug in kbBugCritical"
                    :key="bug.id"
                    class="ho-activity__item ho-actlist__item ho-actlist__item--issue ho-issue-row"
                    :class="'is-sev-' + bug.severitySre"
                    @click="openKbBugRow(bug)"
                  >
                    <span class="ho-activity__icon" :class="SRE_SEV_ICON_CLS[bug.severitySre]">
                      <el-icon><component :is="bug.severitySre === 'critical' ? Warning : Top" /></el-icon>
                    </span>
                    <span class="ho-issue-sev" :class="'is-' + bug.severitySre">
                      {{ sreMeta(bug.severitySre).label }}
                    </span>
                    <span class="ho-actlist__verb">{{ bug.id }}</span>
                    <span class="ho-issue-cat" :class="bug.categoryColorClass">{{ bug.categoryLabel }}</span>
                    <span class="ho-activity__title">{{ truncate(bug.title, 56) }}</span>
                    <span v-if="bug.assignee" class="ho-actlist__issue-who">{{ bug.assignee }}</span>
                    <span class="ho-issue-status" :style="{ color: bug.statusColor }">{{ bug.statusLabel }}</span>
                    <span class="ho-actlist__issue-time">{{ timeAgo(bug.updatedAt) }}</span>
                  </div>
                </div>
              </div>

              <!-- Group 2: 最近变更（resolved/closed）— 质量治理进展 -->
              <div v-if="kbBugRecent.length" class="ho-actlist__sub ho-issue-group ho-issue-group--recent">
                <div class="ho-activity__head">
                  <span class="ho-issue-group__label ho-issue-group__label--clear">
                    <el-icon :size="10"><CircleCheck /></el-icon> 最近变更
                  </span>
                  <span class="ho-actlist__count">{{ kbBugRecent.length }}</span>
                  <el-tooltip content="2026-09 代码质量专项行动（vue-tsc 清零 / 竞态修复 / 类型安全）" :show-after="400">
                    <el-button link size="small" class="ho-fb-btn-chevron" @click="openAnchor(BUG_ANCHORS.yivadIndex)">YiVad →</el-button>
                  </el-tooltip>
                </div>
                <div class="ho-actlist__items">
                  <div
                    v-for="bug in kbBugRecent"
                    :key="bug.id"
                    class="ho-activity__item ho-actlist__item ho-actlist__item--issue ho-issue-row"
                    @click="openKbBugRow(bug)"
                  >
                    <span class="ho-activity__icon" :class="bug.categoryColorClass">
                      <el-icon><component :is="bug.categoryLabel === '性能' ? Top : Document" /></el-icon>
                    </span>
                    <span class="ho-issue-status-pill is-resolved">{{ bug.statusLabel }}</span>
                    <span class="ho-actlist__verb">{{ bug.id }}</span>
                    <span class="ho-issue-cat" :class="bug.categoryColorClass">{{ bug.categoryLabel }}</span>
                    <span class="ho-activity__title">{{ truncate(bug.title, 56) }}</span>
                    <span v-if="bug.projectKey !== 'yivad'" class="ho-actlist__issue-proj">{{ bug.project }}</span>
                    <span class="ho-actlist__issue-time">{{ timeAgo(bug.updatedAt) }}</span>
                  </div>
                </div>
              </div>

              <!-- Group 3: 跨项目 / 接口类风险（RPC 契约 / 数据一致性） -->
              <div v-if="kbBugCross.length" class="ho-actlist__sub ho-issue-group ho-issue-group--cross">
                <div class="ho-activity__head">
                  <span class="ho-issue-group__label ho-issue-group__label--cross">
                    <el-icon :size="10"><Link /></el-icon> 跨项目 / 接口类
                  </span>
                  <span class="ho-actlist__count">{{ kbBugCross.length }}</span>
                  <el-tooltip content="RPC 契约对齐、跨项目数据一致性、API 参数命名规范" :show-after="400">
                    <el-button link size="small" class="ho-fb-btn-chevron" @click="openAnchor('engineer/build/007-构建-实现跨项目RPC调用.md')">RPC 规范 →</el-button>
                  </el-tooltip>
                </div>
                <div class="ho-actlist__items">
                  <div
                    v-for="bug in kbBugCross"
                    :key="bug.id"
                    class="ho-activity__item ho-actlist__item ho-actlist__item--issue ho-issue-row"
                    @click="openKbBugRow(bug)"
                  >
                    <span class="ho-activity__icon" :class="bug.categoryColorClass">
                      <el-icon><Link /></el-icon>
                    </span>
                    <span class="ho-issue-cat" :class="bug.categoryColorClass">{{ bug.categoryLabel }}</span>
                    <span class="ho-actlist__verb">{{ bug.id }}</span>
                    <span class="ho-actlist__issue-proj">{{ bug.project }}</span>
                    <span class="ho-activity__title">{{ truncate(bug.title, 54) }}</span>
                    <span class="ho-issue-status" :style="{ color: bug.statusColor }">{{ bug.statusLabel }}</span>
                    <span class="ho-actlist__issue-time">{{ timeAgo(bug.updatedAt) }}</span>
                  </div>
                </div>
              </div>

              <!-- Group 4: 代码质量专项（类型安全 / 死代码 / Vue-tsc / 竞态） -->
              <div v-if="kbBugQuality.length" class="ho-actlist__sub ho-issue-group ho-issue-group--quality">
                <div class="ho-activity__head">
                  <span class="ho-issue-group__label ho-issue-group__label--quality">
                    <el-icon :size="10"><DataBoard /></el-icon> 代码质量专项
                  </span>
                  <span class="ho-actlist__count">{{ kbBugQuality.length }}</span>
                  <el-tooltip content="vue-tsc 零错误 / ProTable 竞态修复 / MutationObserver 生命周期 / 任何类型滥用治理" :show-after="400">
                    <el-button link size="small" class="ho-fb-btn-chevron" @click="openAnchor('leader/architecture/001-架构-架构决策设计.md')">ADR →</el-button>
                  </el-tooltip>
                </div>
                <div class="ho-actlist__items">
                  <div
                    v-for="bug in kbBugQuality"
                    :key="bug.id"
                    class="ho-activity__item ho-actlist__item ho-actlist__item--issue ho-issue-row"
                    @click="openKbBugRow(bug)"
                  >
                    <span class="ho-activity__icon" :class="bug.categoryColorClass">
                      <el-icon><component :is="bug.categoryLabel === '性能' ? Top : DataBoard" /></el-icon>
                    </span>
                    <span class="ho-issue-cat" :class="bug.categoryColorClass">{{ bug.categoryLabel }}</span>
                    <span class="ho-actlist__verb">{{ bug.id }}</span>
                    <span class="ho-activity__title">{{ truncate(bug.title, 56) }}</span>
                    <span v-if="bug.assignee" class="ho-actlist__issue-who">{{ bug.assignee }}</span>
                    <span class="ho-issue-status" :style="{ color: bug.statusColor }">{{ bug.statusLabel }}</span>
                    <span class="ho-actlist__issue-time">{{ timeAgo(bug.updatedAt) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Activity -->
          <section class="ho-card">
            <div class="ho-card__head ho-card__head--activity">
              <span class="ho-card__title">{{ t("home.stats.recentActivity") }}</span>
              <el-button link size="small" @click="knowledge.retry()"><el-icon><Refresh /></el-icon></el-button>
            </div>
            <div v-if="knowledge.loading.value" class="ho-card__loading"><el-icon class="is-loading"><Loading /></el-icon></div>
            <div v-else class="ho-activity">
              <div v-if="!activityItems.length" class="ho-card__empty">{{ t("home.activity.empty") }}</div>
              <template v-for="group in activityGroups" :key="group.label">
                <div class="ho-activity__head">{{ group.label }}</div>
                <div v-for="item in group.items.slice(0, 5)" :key="(item.type) + '-' + item.updatedAt + '-' + (item.path || item.title)" class="ho-activity__item" @click="item.type === 'file' ? openAnchor(item.path!) : openAnchor('projects/yivad/bugs/README.md')">
                  <span class="ho-activity__icon">
                    <el-icon v-if="item.type === 'file'"><Document /></el-icon>
                    <el-icon v-else><Warning /></el-icon>
                  </span>
                  <span v-if="item.type === 'bug' && item.severity" class="ho-activity__sev" :class="'is-' + item.severity">{{ item.severity }}</span>
                  <span v-else-if="item.type === 'file'" class="ho-activity__cat" :class="'is-' + (item.category || 'other')">{{ catLabel(item.category) }}</span>
                  <span class="ho-activity__verb">{{ item.type === 'file' ? (item.isNew ? 'created' : 'updated') : 'reported' }}</span>
                  <span class="ho-activity__title">{{ item.title }}</span>
                  <el-tooltip :content="new Date(item.updatedAt).toLocaleString()" placement="top" :show-after="400">
                    <span class="ho-activity__time">{{ timeAgo(item.updatedAt) }}</span>
                  </el-tooltip>
                </div>
              </template>
            </div>
          </section>
        </div>

        <!-- Sidebar -->
        <aside class="ho__side">
          <div v-if="knowledge.available.value" class="ho-sb">
            <div class="ho-sb__head" @click="openAnchor(SB_ANCHORS.health)"><span>Knowledge Health</span><el-icon class="ho-sb__head-link"><Link /></el-icon></div>
            <div class="ho-kh" @click="openAnchor(SB_ANCHORS.health)">
              <span class="ho-kh__pct" :style="{ color: progressColor(knowledge.avgFreshness.value) }">{{ knowledge.avgFreshness.value }}%</span>
              <span class="ho-kh__label">fresh · {{ knowledge.totalFiles.value }} files</span>
            </div>
            <div v-if="knowledge.categoryInfo.value.length" class="ho-kh__cats">
              <div v-for="c in knowledge.categoryInfo.value.slice(0, 6)" :key="c.category" class="ho-kh__cat" @click="openCategory(c.category, c.freshness)">
                <span class="ho-kh__cat-name">{{ c.category }}</span>
                <span class="ho-kh__cat-bar"><span class="ho-kh__cat-fill" :style="{ width: c.freshness + '%', background: progressColor(c.freshness) }" /></span>
                <span class="ho-kh__cat-n">{{ c.count }}</span>
              </div>
            </div>
          </div>

          <div v-if="stats.assigneeGroups.length" class="ho-sb">
            <div class="ho-sb__head" @click="openAnchor(SB_ANCHORS.workload)"><span>{{ t("home.stats.workload") }}</span><el-icon class="ho-sb__head-link"><Link /></el-icon></div>
            <div class="ho-wl">
              <div v-for="g in stats.assigneeGroups.slice(0, 6)" :key="g.value" class="ho-wl__row" @click="openWorkloadAssignee(g.value)">
                <span class="ho-wl__name">{{ g.value || "—" }}</span>
                <span class="ho-wl__bar"><span class="ho-wl__fill" :class="{ 'is-over': g.count > 5 }" :style="{ width: Math.min(100, (g.count / 6) * 100) + '%' }" /></span>
                <span class="ho-wl__n">{{ g.count }}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <KnowledgePreviewDialog ref="previewDlg" />
      <div class="ho__spacer" />
    </template>
  </div>
</template>

<script setup lang="ts" name="home">
import { computed, nextTick, ref, shallowRef, type ComputedRef } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { ElMessage } from "element-plus";
import { DataBoard, Refresh, Loading, Top, Bottom, Document, Warning, CircleCheck, Link, UserFilled, ArrowRight } from "@element-plus/icons-vue";
import HomeSkeleton from "./components/HomeSkeleton.vue";
import KnowledgePreviewDialog from "@/components/KnowledgePreviewDialog/KnowledgePreviewDialog.vue";
import {
  resolveLink,
  gateBEntityExists,
  gateCPostNavigate,
  type ResolveLinkInput,
} from "@/utils/linkFactory";
import { useHomeData } from "@/hooks/useHomeData";
import { useDailyInsight } from "@/hooks/useDailyInsight";
import { useDailyFocusBoard, type OkrTracker, type FocusAction, type SreStatusItem, type DigestSignal, type DigestDecision, type DigestRedline } from "@/hooks/useDailyFocusBoard";
import { useKnowledgeInsight } from "@/hooks/useKnowledgeInsight";
import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";
import { getIssue, type Issue } from "@/api/modules/issueService";
import type { KnowledgeBugEntry } from "@/api/interface/yiAi";
import { useLiveMetrics } from "@/hooks/useLiveMetrics";

const { t } = useI18n();
const router = useRouter();
const { stats, deltas, loading, error, retry } = useHomeData();
const daily = useDailyInsight();
const knowledge = useKnowledgeInsight();
const live = useLiveMetrics();
const focus = useDailyFocusBoard();

const previewDlg = ref<InstanceType<typeof KnowledgePreviewDialog> | null>(null);
function openFilePreview(path: string) { previewDlg.value?.open(path); }

/* ──────────────────────────────────────────────────────────
 *  SSOT: 精确到 YiKnowledge 真实文件的锚点表
 *  每行均经过 Glob + LS 实查，确保 file:// 下文件存在
 * ──────────────────────────────────────────────────────── */
const BOARD_ANCHORS: Readonly<Record<string, string>> = {
  focusMain:   "curator/daily/001-今日焦点-焦点总控.md",
  sreDetail:   "curator/daily/003-今日焦点-SRE详情-2026-10-10.md",
  okrTracker:  "curator/daily/004-今日焦点-OKR追蹤卡-2026-10-10.md",
  roleActions: "curator/daily/005-今日焦点-角色行动项详情-2026-10-10.md",
  digest:      "curator/daily/002-今日焦点-决策简报-2026-10-10.md",
  learnRisk:   "curator/daily/006-今日焦点-学习与风险摘要-2026-10-10.md",
  execOkr001:  "executive/okr/2026-Q3/exec-001-市场情报与竞争洞察/goal.md",
  execOkr002:  "executive/okr/2026-Q3/exec-002-经营战略与组织路线/goal.md",
  execOkr003:  "executive/okr/2026-Q3/exec-003-经营学习与阅读/goal.md",
  leadOkr001:  "leader/okr/2026-Q3/lead-001-technical-review-loop/goal.md",
  leadOkr002:  "leader/okr/2026-Q4/lead-002-testing-safety-net/goal.md",
  sreQuickRef: "sre/QUICKREF.md",
  execFrame:   "executive/strategy/018-战略-高管决策框架.md",
  dataModel:   "leader/architecture/012-架构-数据模型设计原则.md",
  vitest:      "leader/decisions/yivad-003-决策-Vitest引入.md",
  aierIndex:   "aier/INDEX.md",
  governance:  "curator/governance/007-治理-分类处理.md",
  readingList: "executive/reading-list/001-阅读-阅读清单.md",
};
const SB_ANCHORS: Readonly<Record<string, string>> = {
  health:   "curator/governance/001-治理-知识健康看板.md",
  workload: "executive/roadmap/003-路线图-组织OKR追踪.md",
};
/* ──────────────────────────────────────────────────────────
 *  Issue 动态 SSOT 锚点：每一条点击都能落地到 YiKnowledge
 *  projects/{project}/bugs 目录下的真实 Markdown 文件
 * ──────────────────────────────────────────────────────── */
const BUG_ANCHORS: Readonly<Record<string, string>> = {
  yivadIndex: "projects/yivad/bugs/README.md",
  yipotIndex: "projects/yipot/bugs/README.md",
  yipetIndex: "projects/yipet/bugs/README.md",
  yiaiIndex:  "projects/yiai/bugs/README.md",
  yikbIndex:  "projects/yiknowledge/bugs/README.md",
  sreRunbook: "sre/QUICKREF.md",
};
/** 侧栏 Knowledge Category 目录 → 真实存在的 YiKnowledge 分类首页 */
const CATEGORY_INDEX: Readonly<Record<string, string>> = {
  executive: "executive/INDEX.md",
  leader:    "leader/INDEX.md",
  engineer:  "engineer/INDEX.md",
  sre:       "sre/INDEX.md",
  aier:      "aier/INDEX.md",
  product:   "product/INDEX.md",
  curator:   "curator/INDEX.md",
};
function categoryAnchor(category: string): string {
  return CATEGORY_INDEX[category.toLowerCase()] || `${category.toLowerCase()}/INDEX.md`;
}

/* ──────────────────────────────────────────────────────────
 *  三闸门契约导航状态机（Gate A → Gate B → Gate C）
 *  用户可见 → Header Pill 可视化反馈
 * ──────────────────────────────────────────────────────── */
const navigating = ref(false);
type NavState = "gate-a" | "gate-b" | "gate-c";
const navState = shallowRef<NavState>("gate-a");
const navLabel = ref("解析锚点");
function setNav(s: NavState, label: string): void {
  navState.value = s;
  navLabel.value = label;
  navigating.value = true;
}
function clearNav(): void { navigating.value = false; }

/* ──────────────────────────────────────────────────────────
 *  锚点解析器：mirror readingList.vue 的 anchorToEntity 逻辑
 *  保证首页与阅读清单的链接解析规则完全一致
 * ──────────────────────────────────────────────────────── */
function anchorToEntity(anchor: string): ResolveLinkInput | null {
  if (!anchor) return null;
  const a = String(anchor).trim();
  if (/^exec[-_]\d{2,3}[-_]\d{1,3}$/i.test(a)) {
    const normalized = a.toLowerCase().replace(/[ _]/g, "-");
    return { type: "page", key: `executive/okr/${normalized}`, title: a };
  }
  const numMatch = a.match(/\b(\d{3})(?:\.md)?\b/);
  if (numMatch) {
    const num = numMatch[1];
    const fallback = num === "001"
      ? `executive/reading-list/${num}-阅读-阅读清单`
      : `executive/reading-list/${num}-阅读-读书笔记`;
    return { type: "page", key: fallback, title: a };
  }
  if (a.includes("/") || /\.md\s*$/i.test(a)) {
    const clean = a.replace(/§.*$/, "").replace(/^YiKnowledge\//i, "")
      .replace(/^#\/?knowledge\//i, "").replace(/^\//, "").trim();
    let candidate = clean;
    if (!candidate.toLowerCase().startsWith("executive/")) {
      if (/^(reading-list|okr|rss|strategy|process|notes|tactical|governance)\//i.test(candidate)) candidate = `executive/${candidate}`;
      else if (!candidate.includes("/")) candidate = `executive/reading-list/${candidate}`;
    }
    return { type: "page", key: candidate.replace(/\.md$/i, ""), title: a };
  }
  return null;
}

/**
 * 三闸门契约入口：所有 YiKnowledge 锚点跳转统一入口
 *   Gate A: anchorToEntity → resolveLink 路由模板存在性
 *   Gate B: gateBEntityExists HEAD 预检 (1500ms 超时)
 *   Gate C: openKnowledgePreview + 2s 看门狗 post-nav 校验
 */
async function openAnchor(anchor: string): Promise<void> {
  const entity = anchorToEntity(anchor);
  if (!entity) {
    ElMessage.info(`未映射锚点: ${anchor}`);
    return;
  }
  // Gate A
  setNav("gate-a", "Gate A · 路由匹配");
  const resolved = resolveLink(entity);
  const expectedLink = resolved.ok ? resolved.link : "#preview-dialog";
  const expectedParams = resolved.ok && "params" in resolved ? resolved.params : {};

  // KB 文件路径归一（KnowledgePreviewDialog 只认 .md 相对路径）
  const kbKey = entity.key ?? "";
  const mdPath = /\.md$/i.test(kbKey) ? kbKey : `${kbKey}.md`;

  // Gate B
  setNav("gate-b", "Gate B · HEAD 预检");
  const exists = await gateBEntityExists(entity, { timeoutMs: 1500 }).catch(() => true);
  if (!exists) ElMessage.warning(`锚点未命中索引，尝试直接预览: ${kbKey}`);

  // Gate C
  setNav("gate-c", "Gate C · 打开预览");
  try {
    await openFilePreview(mdPath);
  } catch (e) {
    ElMessage.warning(e instanceof Error ? e.message : "预览打开失败");
    clearNav();
    return;
  }
  nextTick(() =>
    gateCPostNavigate({ expectedLink, expectedParams, expectedTitleKeyword: entity.title || "", timeoutMs: 2000 })
      .then(ok => { if (!ok) ElMessage.info("路由落地后验未匹配（可能是 hash 跳转）"); })
      .finally(clearNav)
  );
}

/**
 * 延迟 2.4s 切换锚点（合成弹框 → 真实文件）；如果用户已主动交互关闭则跳过
 */
function openFocusAnchorIfIdle(anchor: string): void {
  try {
    const dlg = previewDlg.value as any;
    if (!dlg) { openAnchor(anchor); return; }
    const visible = dlg.visible ?? dlg.modelValue ?? dlg._visible;
    if (visible === false) { openAnchor(anchor); return; }
    const cur: string | undefined = dlg.currentPath ?? dlg.path ?? dlg._currentPath;
    if (!cur || /^(digest:|sre:|okr:|action:|issue:)/.test(cur)) {
      openAnchor(anchor);
    }
  } catch {
    openAnchor(anchor);
  }
}

/** 侧栏 Category 入口（优先走分类 INDEX.md，找不到则走知识库默认路由） */
function openCategory(category: string, freshness: number): void {
  const idx = categoryAnchor(category);
  const fallback = `#/knowledge/${category.toLowerCase()}`;
  const entity = anchorToEntity(idx);
  if (!entity) {
    ElMessage.info(`无分类索引，跳转知识库: ${category}`);
    router.push(fallback);
    return;
  }
  if (freshness < 50) ElMessage.info(`${category} 新鲜度仅 ${freshness}%，建议进入后点击 🔄 刷新`);
  openAnchor(idx);
}

/** Workload 行点击 → 跳组织 OKR 追踪 或 Issue 列表带 assignee 过滤 */
function openWorkloadAssignee(assignee?: string | null): void {
  if (!assignee) {
    openAnchor(SB_ANCHORS.workload);
    return;
  }
  // assignee 匹配 CEO / Tech Lead 等角色 → 跳对应行动项详情；否则跳 Issue 过滤
  const roleMap: Record<string, string> = {
    "CEO": "Executive",
    "Tech Lead": "Tech Lead",
    "Engineer": "Engineer",
    "SRE": "SRE",
    "Curator": "Curator",
    "AI Eng": "AI Eng",
  };
  const r = roleMap[assignee] || assignee;
  if (Object.values(roleMap).some(v => r.includes(v))) {
    openAnchor(BOARD_ANCHORS.roleActions);
  } else {
    const linkRes = resolveLink({ type: "issue", key: null, title: `@${assignee}` });
    const url = linkRes.ok ? linkRes.link.replace(/issue\/$/, "issue") : "/issue";
    const sep = url.includes("?") ? "&" : "?";
    router.push(`${url}${sep}assignee=${encodeURIComponent(assignee)}`);
  }
}

// ── Color tokens (mapped to CSS vars declared in styles) ──
const PRIORITY_COLORS: Record<string, string> = {
  p0: "var(--ho-pri-p0)", p1: "var(--ho-pri-p1)", p2: "var(--ho-pri-p2)",
  p3: "var(--ho-pri-p3)", p4: "var(--ho-pri-p4)"
};
function priorityColor(p: string): string { return PRIORITY_COLORS[p] || "var(--ho-pri-p4)"; }
function priorityLabel(p: string): string { return (p || "").toUpperCase(); }

const animTotal = useAnimatedNumber(computed(() => stats.totalIssues));
const animBugs = useAnimatedNumber(computed(() => stats.openBugCount));

const STATUS_COLORS: Record<string, string> = {
  todo: "var(--ho-st-todo)", in_progress: "var(--ho-st-wip)", in_review: "var(--ho-st-review)",
  done: "var(--ho-st-done)", backlog: "var(--ho-st-backlog)", cancelled: "var(--ho-st-cancel)"
};
const STATUS_LINKS: Record<string, string> = {
  todo: "/issue?status=todo", in_progress: "/issue?status=in_progress",
  in_review: "/issue?status=in_review", done: "/issue?status=done", backlog: "/issue?status=backlog"
};
const statusSegments = computed(() => [
  { key: "todo", label: "Todo", count: stats.todoCount, color: STATUS_COLORS.todo, link: STATUS_LINKS.todo },
  { key: "in_progress", label: "WIP", count: stats.inProgressCount, color: STATUS_COLORS.in_progress, link: STATUS_LINKS.in_progress },
  { key: "in_review", label: "Review", count: stats.inReviewCount, color: STATUS_COLORS.in_review, link: STATUS_LINKS.in_review },
  { key: "done", label: "Done", count: stats.doneCount, color: STATUS_COLORS.done, link: STATUS_LINKS.done },
  { key: "backlog", label: "Backlog", count: stats.backlogCount, color: STATUS_COLORS.backlog, link: STATUS_LINKS.backlog },
].filter(s => s.count > 0));

const completionRate = computed(() => {
  const base = stats.totalIssues - stats.cancelledCount - stats.backlogCount;
  return base ? Math.round((stats.doneCount / base) * 100) : 0;
});
const bugRatio = computed(() => stats.totalIssues ? Math.round((stats.openBugCount / stats.totalIssues) * 100) : 0);
const velocityDelta = computed(() => {
  if (!stats.doneLastWeekCount) return stats.doneWeekCount > 0 ? 100 : 0;
  return Math.round(((stats.doneWeekCount - stats.doneLastWeekCount) / stats.doneLastWeekCount) * 100);
});
const velocityPerDay = computed(() => (stats.doneWeekCount / 5).toFixed(1));
const healthWarnings = computed(() => (stats.overdueCount || 0) + (stats.blockedCount || 0) + (stats.staleCount || 0) + (stats.unassignedCount || 0));
const dataQualityWarn = computed(() => {
  const items: string[] = [];
  if (stats.noPriorityCount) items.push(`${stats.noPriorityCount} no priority`);
  if (stats.noDueDateCount) items.push(`${stats.noDueDateCount} no due date`);
  if (stats.noTypeCount) items.push(`${stats.noTypeCount} no type`);
  return items.length ? items.join(" · ") : "";
});
const weeklyGoal = 25;
const weekProgress = computed(() => Math.min(100, Math.round((stats.doneWeekCount / weeklyGoal) * 100)));

// ── SRE Matrix helpers ──
const SRE_LEVEL_ORDER = ["critical", "major", "warn", "clear"] as const;
type SreLevelKey = typeof SRE_LEVEL_ORDER[number];
const sreLevelLabels: Record<SreLevelKey | string, string> = {
  critical: "严重",
  major: "重要",
  warn: "警告",
  clear: "正常",
};
function sreLevelLabel(k: string): string {
  return sreLevelLabels[k] ?? "警告";
}
const sreImpactLabels: Record<SreLevelKey | string, string> = {
  critical: "P0 · 全站受影响",
  major: "P1 · 核心链路受损",
  warn: "P2 · 局部劣化",
  clear: "P5 · 正常运行",
};
function impactLabel(level: string): string {
  return sreImpactLabels[level] ?? sreImpactLabels.warn;
}

const activeSreFilters = ref<string[]>([]);
function toggleSreLevelFilter(key: string, _idx?: number): void {
  const arr = activeSreFilters.value.slice();
  const pos = arr.indexOf(key);
  if (pos >= 0) arr.splice(pos, 1);
  else arr.push(key);
  activeSreFilters.value = arr;
}
function clearSreFilters(): void {
  activeSreFilters.value = [];
}
function matchSreFilter(level: string): boolean {
  if (!activeSreFilters.value.length) return true;
  return activeSreFilters.value.includes(level);
}
const sreLevelCounts = computed<Record<string, number>>(() => {
  const out: Record<string, number> = {};
  for (const it of focus.sre.value.items) {
    const k = it.level || "warn";
    out[k] = (out[k] ?? 0) + 1;
  }
  return out;
});
const sreLevelLegend = computed(() =>
  SRE_LEVEL_ORDER.map((k) => ({
    key: k,
    count: sreLevelCounts.value[k] ?? 0,
    color: SRE_LEVEL_META[k]?.color ?? SRE_LEVEL_META.warn.color,
  }))
);
const sreHeatSegments = computed(() => {
  const total = focus.sre.value.items.length || 1;
  return SRE_LEVEL_ORDER.map((k, index) => {
    const count = sreLevelCounts.value[k] ?? 0;
    return {
      key: k,
      index,
      count,
      color: SRE_LEVEL_META[k]?.color ?? SRE_LEVEL_META.warn.color,
      pct: total ? Math.round((count / total) * 100) : 0,
    };
  });
});
const sreSloPct = computed(() => {
  const total = focus.sre.value.items.length;
  if (!total) return 100;
  const penalized =
    (sreLevelCounts.value.critical ?? 0) * 10 +
    (sreLevelCounts.value.major ?? 0) * 4 +
    (sreLevelCounts.value.warn ?? 0) * 1;
  return Math.max(0, Math.round(100 - (penalized / (total * 4)) * 100));
});
const filteredSreItems = computed<SreStatusItem[]>(() =>
  focus.sre.value.items
    .slice()
    .sort((a, b) => {
      const ai = SRE_LEVEL_ORDER.indexOf((a.level as any) ?? "warn");
      const bi = SRE_LEVEL_ORDER.indexOf((b.level as any) ?? "warn");
      return ai - bi;
    })
    .filter((it) => matchSreFilter(it.level))
);

function progressColor(v: number): string {
  if (v >= 80) return "var(--ho-status-clear)";
  if (v >= 50) return "var(--ho-status-warn)";
  return "var(--ho-status-danger)";
}
function rateColor(v: number): string { return progressColor(v); }

const CAT_LABEL: Record<string, string> = { engineer: "Eng", executive: "Exec", leader: "Lead", aier: "AI", product: "Prod", sre: "SRE", curator: "Cur" };
function catLabel(cat?: string): string { return CAT_LABEL[cat || ""] || cat || ""; }

const activityItems = computed(() => knowledge.activityItems.value);
const activityGroups = computed(() => {
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const todayMs = todayStart.getTime();
  const yesterdayMs = todayMs - 86400000;
  const groups: { label: string; items: typeof activityItems.value }[] = [
    { label: t("home.activity.today"), items: [] },
    { label: t("home.activity.yesterday"), items: [] },
    { label: t("home.activity.thisWeek"), items: [] }
  ];
  for (const item of activityItems.value) {
    const ts = new Date(item.updatedAt).getTime();
    if (ts >= todayMs) groups[0].items.push(item);
    else if (ts >= yesterdayMs) groups[1].items.push(item);
    else groups[2].items.push(item);
  }
  return groups.filter(g => g.items.length > 0);
});

const todayLabel = computed(() => {
  const d = new Date();
  return ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getDay()] + " " + (d.getMonth()+1) + "/" + d.getDate();
});
function timeAgo(ts: string | number): string {
  const m = Math.floor((Date.now() - new Date(ts).getTime()) / 60000);
  if (m < 1) return "now"; if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}
function retryAll() { retry(); daily.retry(); knowledge.retry(); focus.retry(); }

const SEV_LABELS: Record<string, string> = { critical: "Critical", urgent: "Urgent", major: "Major", high: "High", medium: "Medium", minor: "Minor", low: "Low", trivial: "Trivial" };
function sevLabel(v: string): string { return SEV_LABELS[v] || v; }
function sevColor(v: string): string {
  const m: Record<string, string> = {
    critical: "var(--ho-status-danger)", urgent: "var(--ho-status-danger)",
    major: "var(--ho-status-major)", high: "var(--ho-status-major)",
    medium: "var(--ho-pri-p2)", minor: "var(--ho-text-secondary)",
    low: "var(--ho-text-secondary)", trivial: "var(--ho-text-placeholder)"
  };
  return m[v] || "var(--ho-text-placeholder)";
}

// ── Focus Board meta tables ──
const SRE_LEVEL_META: Record<string, { color: string; bg: string; label: string; text: string }> = {
  critical: { color: "var(--ho-status-danger)", bg: "var(--ho-bg-danger)", label: "CRITICAL", text: "严重" },
  major:    { color: "var(--ho-status-major)",  bg: "var(--ho-bg-major)",  label: "MAJOR",    text: "重要" },
  warn:     { color: "var(--ho-status-warn)",   bg: "var(--ho-bg-warn)",   label: "WARN",     text: "警告" },
  clear:    { color: "var(--ho-status-clear)",  bg: "var(--ho-bg-clear)",  label: "CLEAR",    text: "正常" }
};
function sreMeta(level: string) {
  return SRE_LEVEL_META[level] || SRE_LEVEL_META.warn;
}
const OKR_STATUS_META: Record<string, { text: string; color: string; bg: string }> = {
  active:    { text: "进行中", color: "var(--ho-okr-active)", bg: "var(--ho-okr-active-bg)" },
  at_risk:   { text: "有风险", color: "var(--ho-status-major)", bg: "var(--ho-bg-major)" },
  off_track: { text: "偏离",   color: "var(--ho-status-danger)", bg: "var(--ho-bg-danger)" },
  done:      { text: "完成",   color: "var(--ho-status-clear)", bg: "var(--ho-bg-clear)" }
};
function okrStatusMeta(s: string) {
  return OKR_STATUS_META[s] || { text: s, color: "var(--ho-text-secondary)", bg: "var(--ho-fill)" };
}
const ACTION_STATUS_META: Record<string, { text: string; color: string; bg: string }> = {
  todo:        { text: "待办",   color: "var(--ho-text-secondary)", bg: "var(--ho-fill)" },
  in_progress: { text: "进行中", color: "var(--ho-okr-active)", bg: "var(--ho-okr-active-bg)" },
  in_review:   { text: "评审中", color: "var(--ho-status-warn)", bg: "var(--ho-bg-warn)" },
  done:        { text: "完成",   color: "var(--ho-status-clear)", bg: "var(--ho-bg-clear)" },
  blocked:     { text: "阻塞",   color: "var(--ho-status-danger)", bg: "var(--ho-bg-danger)" }
};
function actionStatusMeta(s: string) {
  return ACTION_STATUS_META[s] || { text: s, color: "var(--ho-text-secondary)", bg: "var(--ho-fill)" };
}

// ── Detail dialog builders (issue preview + okr/sre/action/signal/decision/redline) ──

function openOkrDetails(o: OkrTracker) {
  const rows: string[] = [];
  if (o.period) rows.push(`| **周期** | ${o.period} |`);
  if (o.owner) rows.push(`| **负责人** | ${o.owner} |`);
  rows.push(`| **进度** | ${o.progress}% |`);
  if (typeof o.coverage === "number" && typeof o.total === "number") {
    rows.push(`| **KR 覆盖** | ${o.coverage} / ${o.total} |`);
  }
  const st = okrStatusMeta(o.status);
  rows.push(`| **状态** | <span style="color:${st.color};font-weight:600">${st.text}</span> |`);
  if (o.today_focus) rows.push(`| **今日推进** | ${o.today_focus} |`);
  if (o.anchor) rows.push(`| **锚点** | ${o.anchor} |`);
  const content = [
    `# ${o.id}: ${o.title}`,
    "",
    "| 字段 | 值 |",
    "|---|---|",
    ...rows,
  ].join("\n");
  previewDlg.value?.openRaw({
    title: `${o.id}: ${o.title}`,
    content,
    path: `okr:${o.id}`,
  });
}

function openSreDetails(s: SreStatusItem) {
  const meta = sreMeta(s.level);
  const rows: string[] = [];
  rows.push(`| **级别** | <span style="color:${meta.color};font-weight:700">${meta.text}</span> |`);
  if (s.owner) rows.push(`| **Owner** | ${s.owner} |`);
  if (s.anchor) rows.push(`| **锚点** | ${s.anchor} |`);
  if (s.detail) rows.push(`| **细节** | ${s.detail} |`);
  const content = [
    `# ${s.id || "SRE"}: ${s.title}`,
    "",
    "| 字段 | 值 |",
    "|---|---|",
    ...rows,
  ].join("\n");
  previewDlg.value?.openRaw({
    title: `${s.id || "SRE"}: ${s.title}`,
    content,
    path: `sre:${s.id || s.title}`,
  });
  if (s.anchor) { const a = s.anchor; setTimeout(() => openFocusAnchorIfIdle(a), 2400); }
}

function openActionDetails(a: FocusAction) {
  const st = actionStatusMeta(a.status);
  const pri = priorityColor(a.priority);
  const rows: string[] = [];
  rows.push(`| **角色** | ${a.role} |`);
  rows.push(`| **优先级** | <span style="background:${pri};color:#fff;padding:1px 6px;border-radius:4px;font-size:10px;font-weight:700">${priorityLabel(a.priority)}</span> |`);
  rows.push(`| **状态** | <span style="color:${st.color};font-weight:600">${st.text}</span> |`);
  if (a.why) rows.push(`| **为什么重要** | ${a.why} |`);
  if (a.anchor) rows.push(`| **锚点** | ${a.anchor} |`);
  const content = [
    `# [${a.role}] ${a.title}`,
    "",
    "| 字段 | 值 |",
    "|---|---|",
    ...rows,
  ].join("\n");
  previewDlg.value?.openRaw({
    title: a.title,
    content,
    path: `action:${a.role}:${a.title}`,
  });
  if (a.anchor) { const anc = a.anchor; setTimeout(() => openFocusAnchorIfIdle(anc), 2400); }
}

const focusBoardHasContent = computed(() =>
  focus.available.value &&
  (!!focus.hero.value.hero ||
    focus.sre.value.items.length > 0 ||
    focus.okrs.value.length > 0 ||
    focus.actions.value.length > 0 ||
    digestHasContent.value)
);

const digestHasContent = computed(() => {
  const d = focus.digest.value;
  return (
    d.signals.length > 0 ||
    d.decisions.length > 0 ||
    d.redlines.length > 0 ||
    !!d.summary_file
  );
});

const digestCompliant = computed(() => {
  const d = focus.digest.value;
  return d.signals.length === 3 && d.decisions.length === 2 && d.redlines.length === 1;
});

function digestLevel(level: string): string {
  return ["critical", "major", "warn", "clear"].includes(level) ? level : "warn";
}

function openSignalDetails(s: DigestSignal) {
  const meta = sreMeta(digestLevel(s.level));
  const rows: string[] = [];
  rows.push(`| **级别** | <span style="color:${meta.color};font-weight:700">${meta.text}</span> |`);
  if (typeof s.confidence === "number") rows.push(`| **置信度** | ${s.confidence}% |`);
  if (s.ref) rows.push(`| **引用锚点** | ${s.ref} |`);
  const summary = focus.digest.value.summary_file;
  if (summary) rows.push(`| **完整简报** | ${summary} |`);
  const content = [
    `# ${s.id} · 信号`,
    "",
    s.title,
    "",
    "| 字段 | 值 |",
    "|---|---|",
    ...rows,
  ].join("\n");
  previewDlg.value?.openRaw({
    title: `${s.id} · 信号`,
    content,
    path: `digest:signal:${s.id}`,
  });
  if (s.ref) { const r = s.ref; setTimeout(() => openFocusAnchorIfIdle(r), 2400); }
}

function openDecisionDetails(d: DigestDecision) {
  const rows: string[] = [];
  if (d.recommend) rows.push(`| **推荐选项** | <span style="color:var(--ho-okr-active);font-weight:700">${d.recommend}</span> |`);
  if (d.deadline) rows.push(`| **拍板截止** | ${d.deadline} |`);
  if (d.ref) rows.push(`| **参考锚点** | ${d.ref} |`);
  const summary = focus.digest.value.summary_file;
  if (summary) rows.push(`| **完整简报** | ${summary} |`);
  const content = [
    `# ${d.id} · 待拍板决策`,
    "",
    d.title,
    "",
    "| 字段 | 值 |",
    "|---|---|",
    ...rows,
  ].join("\n");
  previewDlg.value?.openRaw({
    title: `${d.id} · 待拍板决策`,
    content,
    path: `digest:decision:${d.id}`,
  });
  if (d.ref) { const rf = d.ref; setTimeout(() => openFocusAnchorIfIdle(rf), 2400); }
}

function openRedlineDetails(r: DigestRedline) {
  const rows: string[] = [];
  if (r.detail) rows.push(`| **细则** | ${r.detail} |`);
  if (r.ref) rows.push(`| **引用锚点** | ${r.ref} |`);
  const summary = focus.digest.value.summary_file;
  if (summary) rows.push(`| **完整简报** | ${summary} |`);
  const content = [
    `# ${r.id} · 底线红线`,
    "",
    `> 🚨 **${r.title}**`,
    "",
    "| 字段 | 值 |",
    "|---|---|",
    ...rows,
  ].join("\n");
  previewDlg.value?.openRaw({
    title: `${r.id} · 底线红线`,
    content,
    path: `digest:redline:${r.id}`,
  });
  if (r.ref) { const rr = r.ref; setTimeout(() => openFocusAnchorIfIdle(rr), 2400); }
}

/* ════════════════════════════════════════════════════════════
 *  Issue 动态模块 · SSOT = YiKnowledge projects/* /bugs Markdown 文件
 *  4 语义分组：Critical / Recent / Cross-Project / Code Quality
 *  每行严格遵循 Activity Paradigm：icon / pill / verb / title / meta
 * ════════════════════════════════════════════════════════════ */
interface KbBugFeedItem {
  id: string;
  title: string;
  project: string;
  projectKey: "yivad" | "yipot" | "yipet" | "yiai" | "yiknowledge";
  categoryLabel: string;
  categoryColorClass: string;
  severity: string;
  severitySre: "critical" | "major" | "warn" | "clear";
  status: "open" | "in_progress" | "resolved" | "closed" | "rejected" | "reopened" | "done" | "cancelled";
  statusLabel: string;
  statusColor: string;
  assignee?: string;
  updatedAt: number;
  kbAnchor: string;
  kbReadmeAnchor: string;
}

const PROJECT_KEY_MAP: Record<string, KbBugFeedItem["projectKey"]> = {
  YiVad: "yivad", YiPot: "yipot", YiPet: "yipet", YiAi: "yiai", YiKnowledge: "yiknowledge",
  yivad: "yivad", yipot: "yipot", yipet: "yipet", yiai: "yiai", yiknowledge: "yiknowledge",
};
const PROJECT_README_ANCHOR: Record<KbBugFeedItem["projectKey"], string> = {
  yivad: BUG_ANCHORS.yivadIndex, yipot: BUG_ANCHORS.yipotIndex, yipet: BUG_ANCHORS.yipetIndex,
  yiai: BUG_ANCHORS.yiaiIndex, yiknowledge: BUG_ANCHORS.yikbIndex,
};

interface BugCatMeta { label: string; cls: string; }
function resolveBugCategory(bug: KnowledgeBugEntry): BugCatMeta {
  const t = (bug.type || "").toLowerCase();
  const m = (bug.module || "").toLowerCase();
  if (t === "security" || /安全|隐私|security|privacy/.test(m)) return { label: "安全", cls: "is-col-security" };
  if (t === "data" || /数据|data/.test(m)) return { label: "数据", cls: "is-col-data" };
  if (/跨项目|rpc|contract|feedback|跨/.test(m)) return { label: "跨项目", cls: "is-col-cross" };
  if (t === "compatibility" || t === "ui" || /路由|权限|国际化|interface|compat|i18n|route/.test(m)) return { label: "接口", cls: "is-col-iface" };
  if (t === "performance" || /性能|perf|cpu|clipboard/.test(m)) return { label: "性能", cls: "is-col-perf" };
  if (/代码质量|quality|type|dead|lint|test|typescript|类型|vue-tsc/.test(m)) return { label: "质量", cls: "is-col-quality" };
  return { label: "功能", cls: "is-col-func" };
}

const BUG_SEVERITY_SRE: Record<string, KbBugFeedItem["severitySre"]> = {
  critical: "critical", P0: "critical",
  major: "major", P1: "major", high: "major",
  medium: "warn", P2: "warn", minor: "warn",
  trivial: "clear", P3: "clear", low: "clear", p0: "critical", p1: "major", p2: "warn", p3: "clear", p4: "clear",
};
const BUG_STATUS_LABEL: Record<string, string> = {
  open: "待处理", in_progress: "修复中", resolved: "已修复",
  closed: "已关闭", rejected: "不处理", reopened: "重新开启", done: "已完成", cancelled: "已取消",
  "已修复": "已修复", "已解决": "已解决", todo: "待办", in_review: "评审中",
};
const BUG_STATUS_COLOR: Record<string, string> = {
  open: "var(--ho-status-danger)", in_progress: "var(--ho-status-warn)",
  resolved: "var(--ho-status-clear)", closed: "var(--ho-st-backlog)",
  rejected: "var(--ho-text-placeholder)", reopened: "var(--ho-status-major)",
  done: "var(--ho-status-clear)", cancelled: "var(--ho-st-cancel)",
  "已修复": "var(--ho-status-clear)", "已解决": "var(--ho-status-clear)",
  todo: "var(--ho-st-todo)", in_review: "var(--ho-st-review)",
};

const SRE_SEV_ICON_CLS: Record<KbBugFeedItem["severitySre"], string> = {
  critical: "is-col-warn",
  major: "is-col-major",
  warn: "is-col-wip",
  clear: "is-col-review",
};

function normalizeKbBug(bug: KnowledgeBugEntry, idx: number): KbBugFeedItem {
  const pKey = PROJECT_KEY_MAP[bug.project || bug.project_key || ""] || PROJECT_KEY_MAP[(bug.project_key || bug.project || "").toLowerCase()] || "yivad";
  const cat = resolveBugCategory(bug);
  const sevSre = BUG_SEVERITY_SRE[bug.severity || bug.priority || "medium"] || "warn";
  const statusVal = (bug.status || "open") as KbBugFeedItem["status"];
  const keyMatch = String(bug.key || "").match(/\d+/);
  const seqNo = (keyMatch ? keyMatch[0] : String(idx + 1)).padStart(3, "0");
  return {
    id: `${pKey}-${seqNo}`,
    title: bug.title || bug.key || "(untitled)",
    project: bug.project || pKey.toUpperCase(),
    projectKey: pKey,
    categoryLabel: cat.label,
    categoryColorClass: cat.cls,
    severity: bug.severity || bug.priority || "warn",
    severitySre: sevSre,
    status: statusVal,
    statusLabel: BUG_STATUS_LABEL[statusVal] || String(statusVal),
    statusColor: BUG_STATUS_COLOR[statusVal] || "var(--ho-text-secondary)",
    assignee: bug.assignee,
    updatedAt: (bug as unknown as { updatedAt?: number }).updatedAt ?? Date.now(),
    kbAnchor: bugPathFromBug(bug, pKey, seqNo, cat),
    kbReadmeAnchor: PROJECT_README_ANCHOR[pKey],
  };
}

function bugPathFromBug(bug: KnowledgeBugEntry, pKey: string, seqNo: string, cat: BugCatMeta): string {
  const datePrefix = "2026-09";
  const catDirMap: Record<string, string> = {
    安全: "安全隐私", 数据: "数据", 跨项目: "跨项目",
    接口: "接口", 性能: "性能问题", 质量: "代码质量", 功能: "代码质量",
  };
  const prefixMap: Record<string, string> = {
    安全: "bug-安全隐私", 数据: "数据", 跨项目: "跨项目",
    接口: "接口", 性能: "bug-性能问题", 质量: "质量", 功能: "质量",
  };
  const slug = (bug.title || "").replace(/[^\w\u4e00-\u9fa5-]/g, "").slice(0, 20) || bug.key || "";
  const dir = catDirMap[cat.label] || "代码质量";
  const prefix = prefixMap[cat.label] || "质量";
  if (pKey === "yipot") {
    return `projects/yipot/bugs/${datePrefix}/${seqNo}-${prefix}-${slug}.md`;
  }
  if (pKey === "yipet") {
    return `projects/yipet/bugs/${datePrefix}/${dir}/${seqNo}-${dir}-${slug}.md`;
  }
  return `projects/yivad/bugs/${datePrefix}/${dir}/${seqNo}-${prefix}-${slug}.md`;
}

const kbBugFromKnowledge: ComputedRef<KbBugFeedItem[]> = computed(() => {
  const fromList = knowledge.recentBugs.value.map((b, i) => normalizeKbBug(b, i));
  const fromAct: KbBugFeedItem[] = activityItems.value
    .filter(a => a.type === "bug")
    .map((a, i) => {
      const isHigh = a.severity === "critical" || a.severity === "major";
      return {
        id: `act-${i}-${a.severity || "b"}`,
        title: a.title,
        project: "YiVad",
        projectKey: "yivad" as const,
        categoryLabel: isHigh ? "安全" : "质量",
        categoryColorClass: isHigh ? "is-col-security" : "is-col-quality",
        severity: a.severity || "warn",
        severitySre: BUG_SEVERITY_SRE[a.severity || "medium"] || "warn",
        status: "resolved",
        statusLabel: "已修复",
        statusColor: BUG_STATUS_COLOR.resolved,
        assignee: undefined,
        updatedAt: a.updatedAt,
        kbAnchor: a.path || BUG_ANCHORS.yivadIndex,
        kbReadmeAnchor: BUG_ANCHORS.yivadIndex,
      };
    });
  const seen = new Set<string>();
  return [...fromList, ...fromAct]
    .filter(x => (seen.has(x.title) ? false : (seen.add(x.title), true)))
    .sort((a, b) => b.updatedAt - a.updatedAt);
});

const kbBugFeedAll: ComputedRef<KbBugFeedItem[]> = computed(() => {
  if (kbBugFromKnowledge.value.length) return kbBugFromKnowledge.value;
  const allDaily: Issue[] = [
    ...daily.overdue.value, ...daily.todayDue.value, ...daily.todayInProgress.value, ...daily.pendingReview.value,
  ];
  return allDaily.slice(0, 16).map<KbBugFeedItem>((item, idx) => {
    const pkRaw = (item.project_key || "yivad").toString();
    const pKey = (PROJECT_KEY_MAP[pkRaw] || PROJECT_KEY_MAP[pkRaw.toLowerCase()] || "yivad") as KbBugFeedItem["projectKey"];
    const sevSre: KbBugFeedItem["severitySre"] =
      item.priority === "urgent" ? "critical" :
      item.priority === "high" ? "major" :
      item.priority === "medium" ? "warn" : "clear";
    const isResolved = item.status === "done" || item.status === "cancelled";
    const st = (isResolved ? "resolved" : item.status === "in_review" ? "in_progress" : item.status === "in_progress" ? "in_progress" : "open") as KbBugFeedItem["status"];
    return {
      id: `daily-${idx}-${item.key}`,
      title: item.title,
      project: item.project_key || pKey.toUpperCase(),
      projectKey: pKey,
      categoryLabel: isResolved ? "质量" : "功能",
      categoryColorClass: isResolved ? "is-col-quality" : "is-col-func",
      severity: item.priority || "warn",
      severitySre: sevSre,
      status: st,
      statusLabel: BUG_STATUS_LABEL[st] || st,
      statusColor: BUG_STATUS_COLOR[st] || "var(--ho-text-secondary)",
      assignee: item.assignee,
      updatedAt: new Date(item.updated_at || Date.now()).getTime(),
      kbAnchor: PROJECT_README_ANCHOR[pKey],
      kbReadmeAnchor: PROJECT_README_ANCHOR[pKey],
    };
  });
});

// ── 4 语义分组 ──
const kbBugCritical: ComputedRef<KbBugFeedItem[]> = computed(() =>
  kbBugFeedAll.value
    .filter(b => b.severitySre === "critical" || b.severitySre === "major")
    .sort((a, b) => (b.severitySre === "critical" ? 1 : 0) - (a.severitySre === "critical" ? 1 : 0) || (b.updatedAt - a.updatedAt))
    .slice(0, 3)
);
const kbBugRecent: ComputedRef<KbBugFeedItem[]> = computed(() =>
  kbBugFeedAll.value
    .filter(b => b.status === "resolved" || b.status === "closed" || b.status === "done")
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 5)
);
const kbBugCross: ComputedRef<KbBugFeedItem[]> = computed(() =>
  kbBugFeedAll.value
    .filter(b => b.categoryLabel === "跨项目" || b.categoryLabel === "接口" || b.categoryLabel === "数据")
    .slice(0, 4)
);
const kbBugQuality: ComputedRef<KbBugFeedItem[]> = computed(() =>
  kbBugFeedAll.value
    .filter(b => b.categoryLabel === "质量" || b.categoryLabel === "性能")
    .slice(0, 5)
);

const hasIssueFeed: ComputedRef<boolean> = computed(() =>
  kbBugCritical.value.length > 0 || kbBugRecent.value.length > 0 ||
  kbBugCross.value.length > 0 || kbBugQuality.value.length > 0
);

function openKbBugRow(bug: KbBugFeedItem): void {
  if (!bug.kbAnchor) { previewIssueFallback(bug); return; }
  openAnchor(bug.kbAnchor);
  const readme = bug.kbReadmeAnchor;
  setTimeout(() => openFocusAnchorIfIdle(readme), 2400);
}

function previewIssueFallback(bug: KbBugFeedItem): void {
  const sevMeta = sreMeta(bug.severitySre);
  const content = [
    `# ${bug.id.toUpperCase()}: ${bug.title}`,
    "",
    "| 字段 | 值 |",
    "|---|---|",
    `| **项目** | ${bug.project} |`,
    `| **分类** | <span style="font-weight:700">${bug.categoryLabel}</span> |`,
    `| **严重度** | <span style="color:${sevMeta.color};font-weight:700;background:${sevMeta.bg};padding:1px 7px;border-radius:6px">${sevMeta.text}</span> |`,
    `| **状态** | <span style="color:${bug.statusColor};font-weight:700">${bug.statusLabel}</span> |`,
    bug.assignee ? `| **处理人** | ${bug.assignee} |` : "",
    `| **最后更新** | ${new Date(bug.updatedAt).toLocaleDateString()} |`,
    "",
    "---",
    "",
    `> 自动跳转对应项目缺陷索引：[\`${bug.kbReadmeAnchor}\`](${bug.kbReadmeAnchor}) · 等待 2.4s`,
  ].filter(Boolean).join("\n");
  previewDlg.value?.openRaw({
    title: `${bug.id.toUpperCase()}: ${truncate(bug.title, 44)}`,
    content,
    path: `bug:${bug.id}`,
  });
  setTimeout(() => openFocusAnchorIfIdle(bug.kbReadmeAnchor), 2400);
}

const focusHasItems = computed(() =>
  daily.overdue.value.length > 0 || daily.todayDue.value.length > 0 ||
  daily.todayInProgress.value.length > 0 || daily.pendingReview.value.length > 0
);

const PRIORITY_ORDER: Record<string, number> = { p0: 0, p1: 1, p2: 2, p3: 3, p4: 4, urgent: 0, high: 1, medium: 2, low: 3, none: 4 };
function sortByPriority(items: Issue[]): Issue[] {
  return [...items].sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 99) - (PRIORITY_ORDER[b.priority] ?? 99));
}

function truncate(s: string, n: number): string { return s.length > n ? s.slice(0, n) + "…" : s; }

function daysOverdue(due: string | undefined): number {
  if (!due) return 0;
  const d = new Date(due); d.setHours(0,0,0,0);
  return Math.floor((Date.now() - d.getTime()) / 86400000);
}

async function previewIssue(item: Issue) {
  let issue = item;
  if (!item.description) {
    try {
      const res = await getIssue(item.key);
      issue = (res.data as any)?.list?.[0] || item;
    } catch { /* use item as-is */ }
  }
  const meta: string[] = [];
  if (issue.status) meta.push(`| **Status** | ${issue.status} |`);
  if (issue.priority) meta.push(`| **Priority** | ${issue.priority} |`);
  if (issue.assignee) meta.push(`| **Assignee** | ${issue.assignee} |`);
  if (issue.due_date) meta.push(`| **Due** | ${issue.due_date} |`);
  if (issue.project_key) meta.push(`| **Project** | ${issue.project_key} |`);
  if (issue.story_points) meta.push(`| **Points** | ${issue.story_points} |`);
  const content = [
    `# ${issue.key}: ${issue.title}`,
    '',
    '| | |',
    '|---|----|',
    ...meta,
    '',
    '---',
    '',
    issue.description || '*No description*'
  ].join('\n');
  previewDlg.value?.openRaw({
    title: `${issue.key}: ${issue.title}`,
    content,
    path: `issue:${issue.key}`,
  });
}
</script>

<style scoped lang="scss">
// ═══════════════════════════════════════════════════════════
//  Semantic Design Tokens (no numeric suffixes, BEM-aligned)
// ═══════════════════════════════════════════════════════════
.ho-root {
  /* Status / Severity */
  --ho-status-danger:  #ef4444;
  --ho-status-major:   #ea580c;
  --ho-status-warn:    var(--el-color-warning);
  --ho-status-clear:   #10b981;

  /* Background accents for each status level */
  --ho-bg-danger:      #fef2f2;
  --ho-bg-major:       #fff7ed;
  --ho-bg-warn:        var(--el-color-warning-light-9);
  --ho-bg-clear:       #ecfdf5;

  /* Issue status colors */
  --ho-st-todo:        #909399;
  --ho-st-wip:         #5ab1ef;
  --ho-st-review:      #e6a23c;
  --ho-st-done:        #67c23a;
  --ho-st-backlog:     #9a60b4;
  --ho-st-cancel:      #ee6666;

  /* Priority colors */
  --ho-pri-p0:         #f56c6c;
  --ho-pri-p1:         #e6a23c;
  --ho-pri-p2:         #409eff;
  --ho-pri-p3:         #909399;
  --ho-pri-p4:         #c0c4cc;

  /* OKR accent colors */
  --ho-okr-active:     #2563eb;
  --ho-okr-active-bg:  #eff6ff;

  /* Common surface aliases */
  --ho-fill:           var(--el-fill-color);
  --ho-text-primary:   var(--el-text-color-primary);
  --ho-text-secondary: var(--el-text-color-secondary);
  --ho-text-placeholder: var(--el-text-color-placeholder);
}

.ho-root { box-sizing: border-box; min-height: 100%; padding: 20px 24px 80px; background: var(--el-bg-color-page); }
.ho__error { display: flex; align-items: center; justify-content: center; min-height: 400px; }

// ── Header ──
.ho-head { display: flex; gap: 16px; align-items: center; padding: 14px 20px; margin-bottom: 14px; background: var(--el-bg-color); border: 1px solid var(--el-border-color-lighter); border-radius: 14px; }
.ho-head__left { display: flex; gap: 14px; align-items: center; flex: 1; min-width: 0; }
.ho-head__icon { display: flex; flex-shrink: 0; align-items: center; justify-content: center; width: 40px; height: 40px; color: #fff; background: linear-gradient(135deg, var(--el-color-primary), #6366f1); border-radius: 10px; }
.ho-head__title { margin: 0; font-size: 15px; font-weight: 700; color: var(--ho-text-primary); line-height: 1.3; }
.ho-head__desc { margin: 2px 0 0; font-size: 11px; color: var(--ho-text-secondary); }
.ho-head__right { display: flex; flex-shrink: 0; gap: 10px; align-items: center; }
.ho-head__nav { display: inline-flex; gap: 5px; align-items: center; padding: 3px 8px; background: var(--ho-fill); border: 1px solid var(--el-border-color-lighter); border-radius: 10px; overflow: hidden; }
.ho-head__nav-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0;
  &.is-gate-a { background: #8b5cf6; box-shadow: 0 0 0 3px #ede9fe; animation: ho-dot-blink 0.8s ease-in-out infinite; }
  &.is-gate-b { background: var(--ho-status-warn); box-shadow: 0 0 0 3px #fef3c7; animation: ho-dot-blink 0.8s ease-in-out 0.2s infinite; }
  &.is-gate-c { background: var(--ho-status-clear); box-shadow: 0 0 0 3px var(--ho-bg-clear); animation: ho-dot-blink 0.8s ease-in-out 0.4s infinite; }
}
@keyframes ho-dot-blink { 50% { transform: scale(1.25); } }
.ho-head__nav-label { font-size: 10px; font-weight: 600; color: var(--ho-text-secondary); white-space: nowrap; }
.ho-fade-enter-active, .ho-fade-leave-active { transition: opacity 0.18s ease, transform 0.18s ease; }
.ho-fade-enter-from, .ho-fade-leave-to { opacity: 0; transform: translateY(-2px); }
.ho-head__live { display: inline-flex; gap: 4px; align-items: center; padding: 2px 8px; font-size: 10px; font-weight: 600; color: var(--el-color-primary); background: var(--el-color-primary-light-9); border: 1px solid var(--el-color-primary-light-5); border-radius: 10px; }
.ho-head__dot { width: 5px; height: 5px; border-radius: 50%; background: var(--el-color-primary); }
.ho-head__stat { font-size: 11px; color: var(--ho-text-secondary); white-space: nowrap; b { font-weight: 700; color: var(--ho-text-primary); } }
.ho-head__date { font-size: 11px; font-weight: 600; color: var(--ho-text-placeholder); }

// ── KPI Cards ──
.ho-metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 14px; }

.ho-metric {
  display: flex; flex-direction: column; gap: 2px;
  padding: 14px 16px; background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter); border-radius: 12px;
  cursor: pointer; transition: all 0.15s ease;
  &:hover { border-color: var(--el-color-primary-light-5); box-shadow: 0 2px 8px rgb(0 0 0 / 5%); }
  &.is-warn { border-left: 3px solid var(--ho-status-warn); }
  &.is-danger { border-left: 3px solid var(--ho-status-danger); }
}
.ho-metric__row { display: flex; gap: 6px; align-items: baseline; &--sub { margin-top: auto; } }
.ho-metric__label { flex: 1; font-size: 10px; font-weight: 600; color: var(--ho-text-secondary); text-transform: uppercase; letter-spacing: 0.4px; }
.ho-metric__value { font-size: 28px; font-weight: 700; font-variant-numeric: tabular-nums; line-height: 1.15; color: var(--ho-text-primary); }
.ho-metric__delta { display: inline-flex; gap: 2px; align-items: center; font-size: 10px; font-weight: 600; &.is-up { color: var(--ho-status-danger); } &.is-down { color: var(--ho-status-clear); } }
.ho-metric__ctx { font-size: 10px; color: var(--ho-text-placeholder); cursor: pointer; white-space: nowrap; &:hover { text-decoration: underline; } &.is-warn { color: var(--ho-status-warn); font-weight: 600; } &.is-danger { color: var(--ho-status-danger); font-weight: 600; } &.is-green { color: var(--ho-status-clear); } &.is-red { color: var(--ho-status-danger); } }
.ho-metric__bars { display: flex; gap: 1px; height: 5px; margin-top: 2px; overflow: hidden; border-radius: 3px; background: var(--ho-fill); }
.ho-metric__bar { display: block; height: 100%; min-width: 2px; cursor: pointer; transition: opacity 0.12s; &:hover { opacity: 0.75; } }

// Attention grid
.ho-metric--attn { cursor: default; }
.ho-attn { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; flex: 1; }
.ho-attn__item { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 8px 4px; cursor: pointer; border-radius: 8px; background: var(--el-fill-color-light); transition: all 0.12s; &:hover { background: var(--ho-fill); } &.is-warn { background: var(--ho-bg-warn); } &.is-danger { background: var(--ho-bg-danger); } }
.ho-attn__n { font-size: 22px; font-weight: 700; font-variant-numeric: tabular-nums; line-height: 1.1; color: var(--ho-text-primary); }
.ho-attn__l { font-size: 9px; font-weight: 500; color: var(--ho-text-secondary); text-transform: uppercase; letter-spacing: 0.3px; margin-top: 1px; }

// ── Body grid ──
.ho__body { display: grid; grid-template-columns: 1fr 268px; gap: 14px; align-items: start; }
.ho__main { min-width: 0; display: flex; flex-direction: column; gap: 14px; }

.ho-card { padding: 18px 22px; background: var(--el-bg-color); border: 1px solid var(--el-border-color-lighter); border-radius: 14px; }
.ho-card__head { display: flex; gap: 8px; align-items: baseline; padding-left: 12px; margin-bottom: 10px; border-left: 3px solid var(--el-border-color); }
.ho-card__head--focus { border-left-color: #6366f1; }
.ho-card__head--activity { border-left-color: var(--el-color-primary); }
.ho-card__title { font-size: 13px; font-weight: 600; color: var(--ho-text-primary); }
.ho-card__sub { margin-left: auto; font-size: 10px; color: var(--ho-text-placeholder); }
.ho-card__badge { margin-left: 4px; font-size: 11px; color: var(--ho-text-placeholder); }
.ho-card__loading { display: flex; justify-content: center; padding: 24px 0; color: var(--ho-text-secondary); }
.ho-card__empty { display: flex; align-items: center; justify-content: center; padding: 24px 0; font-size: 12px; color: var(--ho-text-placeholder); }

// ── Today's Focus issue list ──
.ho-focus__empty-icon { color: var(--ho-status-clear); margin-right: 6px; }

// ── Activity + Actlist shared tokens ──
// 最近动态模块 = 首页其它列表模块的参考设计模板
//  结构:  ho-activity__head (分组小标题) + ho-activity__item (icon + status pill + verb + title + time)
//  其它区块 (SRE/OKR/Actions/Digest/IssueGroups) 统一复用该结构：class="ho-activity__item ho-actlist__item"
.ho-activity { display: flex; flex-direction: column; gap: 2px; }
.ho-activity__head {
  display: flex; align-items: baseline;
  padding: 10px 6px 6px;
  font-size: 10px; font-weight: 700; letter-spacing: 0.3px;
  color: var(--ho-text-secondary); text-transform: uppercase;
  border-top: 1px dashed var(--el-border-color-lighter);
  :first-child & { border-top: 0; padding-top: 2px; }
  span:first-child { font-size: 10px; }
}
.ho-activity__item {
  display: flex; align-items: center;
  gap: 8px;
  padding: 5px 6px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.12s ease;
  min-height: 28px;
  &:hover { background: var(--el-fill-color-light); }
  .ho-activity__icon { flex-shrink: 0; color: var(--ho-text-secondary); font-size: 13px; }
}
.ho-activity__spacer { flex: 1; min-width: 0; }
.ho-activity__icon {
  font-size: 13px;
  &.is-col-okr    { color: #6366f1; }
  &.is-col-sig    { color: #8b5cf6; }
  &.is-col-dec    { color: #0ea5e9; }
  &.is-col-red    { color: var(--ho-status-danger); }
  &.is-col-warn   { color: var(--ho-status-major); }
  &.is-col-major  { color: var(--ho-status-warn); }
  &.is-col-wip    { color: var(--ho-st-wip); }
  &.is-col-review { color: #8b5cf6; }
}
.ho-activity__sev {
  flex-shrink: 0;
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 22px; height: 16px; padding: 0 5px;
  border-radius: 4px;
  font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2px;
  &.is-sre-critical, &.is-sre-major { color: #fff; background: var(--ho-status-danger); }
  &.is-sre-warn   { color: #fff; background: var(--ho-status-warn); }
  &.is-sre-clear  { color: #fff; background: var(--ho-status-clear); }
  &.is-critical { color: #fff; background: var(--ho-status-danger); }
  &.is-major    { color: #fff; background: var(--ho-status-major); }
  &.is-warn     { color: #fff; background: var(--ho-status-warn); }
  &.is-clear    { color: #fff; background: var(--ho-status-clear); }
}
.ho-activity__verb {
  flex-shrink: 0;
  font-size: 9px; color: var(--ho-text-placeholder);
  font-family: ui-monospace, monospace; font-weight: 600;
  max-width: 90px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.ho-activity__title {
  flex: 1;
  min-width: 0;
  font-size: 12px; font-weight: 500; color: var(--ho-text-primary); line-height: 1.4;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.ho-activity__time {
  flex-shrink: 0;
  font-size: 10px; color: var(--ho-text-placeholder);
  font-variant-numeric: tabular-nums;
}
.ho-activity__cat {
  flex-shrink: 0;
  display: inline-flex; align-items: center; justify-content: center;
  height: 15px; padding: 0 6px;
  border-radius: 5px;
  font-size: 9px; font-weight: 700; letter-spacing: 0.2px; text-transform: uppercase;
  background: var(--el-fill-color-light); color: var(--ho-text-secondary);
  &.is-executive { background: var(--ho-okr-active-bg); color: var(--ho-okr-active); }
  &.is-leader    { background: #ede9fe; color: #6d28d9; }
  &.is-engineer  { background: #dbeafe; color: #1d4ed8; }
  &.is-sre       { background: var(--ho-bg-warn); color: var(--ho-status-warn); }
  &.is-aier      { background: #dcfce7; color: #15803d; }
  &.is-product   { background: #fee2e2; color: #b91c1c; }
  &.is-curator   { background: #fef3c7; color: #92400e; }
  &.is-other, &.is-other { background: var(--el-fill-color-light); color: var(--ho-text-placeholder); }
}

/* Unified Actlist container (Today's Focus sub-sections + Issue groups) */
.ho-actlist {
  display: flex; flex-direction: column;
  + .ho-actlist { margin-top: 4px; }
  &.is-hero-critical { background: var(--ho-bg-danger); border-left: 3px solid var(--ho-status-danger); border-radius: 8px; margin-bottom: 2px; }
  &.is-hero-major    { background: var(--ho-bg-major);  border-left: 3px solid var(--ho-status-major); border-radius: 8px; margin-bottom: 2px; }
  &.is-hero-warn     { background: var(--ho-bg-warn);   border-left: 3px solid var(--ho-status-warn);  border-radius: 8px; margin-bottom: 2px; }
  &.is-digest-degraded { opacity: 0.92; border-left: 3px solid #94a3b8; border-radius: 6px; }
}
/* Actlist head alignment on .ho-activity__head */
.ho-actlist > .ho-activity__head { display: flex; align-items: center; }
.ho-actlist__count {
  margin-left: auto; padding: 1px 6px; min-width: 16px; text-align: center;
  font-size: 9px; font-weight: 700; color: var(--ho-text-secondary);
  background: var(--ho-fill); border-radius: 8px; letter-spacing: 0;
  &--warn { background: var(--ho-bg-danger); color: var(--ho-status-danger); }
}
.ho-actlist__degraded { margin-left: 4px; font-size: 9px; font-weight: 600; padding: 1px 5px; border-radius: 5px; background: #fef3c7; color: #92400e; }
.ho-actlist__tag {
  font-size: 9px; font-weight: 700; letter-spacing: 0.3px;
  padding: 1px 7px; border-radius: 10px; text-transform: uppercase;
}

/* Actlist items shared padding bump (dense by default) */
.ho-actlist__items { display: flex; flex-direction: column; }
.ho-actlist__item {
  /* inherit from ho-activity__item, no additional defaults — for subclassing */
}
/* hero item: first row of a focus banner */
.ho-actlist__hero-item {
  display: flex; gap: 7px; align-items: center;
  padding: 6px 10px 4px; margin: 0 4px;
  border-radius: 6px; cursor: pointer; transition: all 0.12s;
  &:hover { background: #ffffff70; }
}
.ho-actlist__verb {
  flex-shrink: 0; font-size: 9px; color: var(--ho-text-placeholder);
  font-family: ui-monospace, monospace; font-weight: 600;
}
.ho-actlist__hero-title {
  font-size: 12px; font-weight: 700; color: var(--ho-text-primary);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; line-height: 1.4;
}
.ho-actlist__must-pill {
  flex-shrink: 0; max-width: 48%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  font-size: 9px; font-weight: 700; color: #4338ca; background: #e0e7ff;
  padding: 1px 7px; border-radius: 7px; letter-spacing: 0.2px;
}
.ho-actlist__narr {
  margin: 0 10px 4px; padding: 0 6px 4px;
  font-size: 10px; color: var(--ho-text-secondary); line-height: 1.5;
  border-left: 2px solid #ddd6fe;
}

/* OKR row: progress bar inline */
.ho-actlist__item--okr {
  padding-bottom: 8px;
}
.ho-actlist__sev-okr {
  flex-shrink: 0; font-size: 9px; font-weight: 700; letter-spacing: 0.2px;
  padding: 1px 6px; border-radius: 8px; text-transform: uppercase;
}
.ho-actlist__cov {
  flex-shrink: 0; font-size: 9px; font-weight: 600; color: var(--ho-text-secondary);
  font-variant-numeric: tabular-nums;
}
.ho-actlist__owner {
  flex-shrink: 0; max-width: 54px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  font-size: 9px; color: var(--ho-text-placeholder);
}
.ho-actlist__progbar {
  flex-shrink: 0; display: inline-block;
  width: 48px; height: 4px; overflow: hidden; background: var(--ho-fill); border-radius: 3px;
  vertical-align: middle;
}
.ho-actlist__progfill { display: block; height: 100%; border-radius: 3px; transition: width 0.4s ease; }
.ho-actlist__pct {
  flex-shrink: 0; width: 30px; text-align: right;
  font-size: 10px; font-weight: 700; font-variant-numeric: tabular-nums;
}

/* Actions row: two small pills + status verb */
.ho-actlist__role-pill {
  flex-shrink: 0; font-size: 9px; font-weight: 700;
  padding: 1px 6px; border-radius: 5px; color: #6366f1; background: #f5f3ff;
  max-width: 90px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.ho-actlist__pri-pill {
  flex-shrink: 0; font-size: 8px; font-weight: 700; color: #fff;
  padding: 1px 5px; border-radius: 4px; min-width: 20px; text-align: center;
}

/* Digest sub-blocks */
.ho-actlist__sub { padding: 2px 0; }
.ho-actlist__sub + .ho-actlist__sub { margin-top: 2px; padding-top: 4px; border-top: 1px dashed var(--el-border-color-lighter); }
.ho-actlist__sub--red { background: var(--ho-bg-danger); border-radius: 6px; padding: 3px 4px; margin-top: 4px; }

.ho-actlist__sub-label {
  padding: 6px 8px 3px; font-size: 8px; font-weight: 800; letter-spacing: 0.6px;
  text-transform: uppercase;
  &--sig     { color: #6d28d9; }
  &--dec     { color: #0284c7; }
  &--redline { color: var(--ho-status-danger); }
}
.ho-actlist__sig-level {
  flex-shrink: 0; font-size: 8px; font-weight: 700; padding: 1px 5px; border-radius: 3px; text-transform: uppercase;
  &.is-critical, &.is-major { color: #fff; background: var(--ho-status-danger); }
  &.is-warn  { color: #fff; background: var(--ho-status-warn); }
  &.is-clear { color: #fff; background: var(--ho-status-clear); }
}
.ho-actlist__conf {
  flex-shrink: 0; font-size: 9px; font-weight: 700; font-variant-numeric: tabular-nums;
  padding: 1px 5px; border-radius: 4px; background: #ede9fe; color: #6d28d9;
}
.ho-actlist__dec-pill {
  flex-shrink: 0; font-size: 9px; font-weight: 700;
  padding: 1px 6px; border-radius: 5px; background: #dbeafe; color: #1d4ed8;
}
.ho-actlist__dead {
  flex-shrink: 0; font-size: 9px; font-weight: 600; font-variant-numeric: tabular-nums;
  color: var(--ho-status-major); cursor: default;
}
.ho-actlist__red-pill {
  flex-shrink: 0; font-size: 8px; font-weight: 800; color: #fff; background: var(--ho-status-danger);
  padding: 1px 5px; border-radius: 4px; min-width: 18px; text-align: center;
  font-family: ui-monospace, monospace;
}
.ho-actlist__subtext { font-size: 10px; color: var(--ho-text-secondary); }

/* Issue group rows */
.ho-actlist__item--issue {
  &:hover {
    background: var(--el-fill-color-light);
    .ho-actlist__issue-pri { filter: brightness(1.1); }
  }
}
.ho-actlist__issue-pri {
  flex-shrink: 0; width: 22px; height: 15px;
  display: flex; align-items: center; justify-content: center;
  font-size: 8px; font-weight: 700; color: #fff; border-radius: 4px;
  transition: filter 0.15s;
}
.ho-actlist__issue-proj {
  flex-shrink: 0; font-size: 8px; font-weight: 600;
  padding: 0 5px; height: 15px; line-height: 15px;
  color: var(--el-color-primary); background: var(--el-color-primary-light-9);
  border-radius: 4px; max-width: 52px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.ho-actlist__issue-who {
  flex-shrink: 0; max-width: 54px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  font-size: 10px; color: var(--ho-text-placeholder);
}
.ho-actlist__issue-time {
  flex-shrink: 0; font-size: 10px; font-variant-numeric: tabular-nums; font-weight: 500;
  color: var(--ho-text-placeholder);
  &.is-overdue { color: var(--ho-status-danger); font-weight: 700; }
}

/* Shared chevron button (aligned to .ho-activity__head) */
.ho-fb-btn-chevron { padding: 0 4px; margin-left: 6px; font-size: 10px; font-weight: 600; letter-spacing: 0.2px; color: var(--el-color-primary); }

/* Divider between board sections and issue dynamic list */
.ho-fb-divider {
  display: flex; align-items: center; margin: 10px 2px 8px; color: var(--ho-text-placeholder);
  &::before, &::after { content: ""; flex: 1; height: 1px; background: linear-gradient(90deg, transparent, var(--el-border-color-lighter)); }
  &::after { background: linear-gradient(90deg, var(--el-border-color-lighter), transparent); }
  span { padding: 0 12px; font-size: 9px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: var(--el-color-primary); background: var(--el-color-primary-light-9); border-radius: 10px; }
}

/* ═══════════════════════════════════════════════════════════
 *  SRE Status Matrix (full-width, edge-to-edge)
 * ═══════════════════════════════════════════════════════════ */
.ho-fb-sre {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 18px 14px;
  margin-bottom: 10px;
  background: linear-gradient(180deg, var(--el-bg-color) 0%, var(--el-fill-color-light) 100%);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 14px;
  border-left: 4px solid var(--ho-status-warn);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  position: relative;
  overflow: hidden;
  isolation: isolate;

  &::before {
    content: "";
    position: absolute;
    inset: 0 0 auto 0;
    height: 2px;
    background: linear-gradient(90deg, var(--ho-status-danger), var(--ho-status-major), var(--ho-status-warn), var(--ho-status-clear));
    opacity: 0.55;
    z-index: 0;
  }
  &:hover { box-shadow: 0 4px 14px rgb(0 0 0 / 5%); }
}
.ho-fb-sre__head {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
  padding: 2px 2px 2px;
  position: relative;
  z-index: 1;
}
.ho-fb-sre__head-left {
  display: flex;
  gap: 14px;
  align-items: center;
  flex-wrap: wrap;
  flex: 1 1 auto;
  min-width: 0;
}
.ho-fb-sre__label {
  font-size: 12px;
  font-weight: 800;
  color: var(--ho-text-primary);
  text-transform: uppercase;
  letter-spacing: 0.6px;
  padding-left: 6px;
  border-left: 3px solid var(--ho-status-warn);
}
.ho-fb-sre__count {
  font-size: 10px;
  font-weight: 700;
  color: var(--ho-text-placeholder);
  font-variant-numeric: tabular-nums;
  padding: 2px 8px;
  background: var(--ho-fill);
  border-radius: 10px;
  flex-shrink: 0;
}

/* Legend chips (filters) */
.ho-fb-sre__legend { display: inline-flex; gap: 4px; align-items: center; flex-wrap: wrap; }
.ho-fb-sre-legend {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  padding: 2px 7px;
  border-radius: 8px;
  cursor: pointer;
  background: #fff;
  border: 1px solid var(--el-border-color-lighter);
  transition: all 0.14s ease;
  font-size: 10px;
  font-weight: 600;
  color: var(--ho-text-secondary);
  user-select: none;
  &:hover { transform: translateY(-1px); box-shadow: 0 2px 6px rgb(0 0 0 / 6%); }
  &.is-empty { opacity: 0.45; cursor: not-allowed; filter: grayscale(0.4); &:hover { transform: none; box-shadow: none; } }
  &.is-active { box-shadow: 0 0 0 1px currentColor inset; background: #fafbff; }
  &.is-critical { color: var(--ho-status-danger); &.is-active { background: var(--ho-bg-danger); } }
  &.is-major    { color: var(--ho-status-major);  &.is-active { background: var(--ho-bg-major); } }
  &.is-warn     { color: var(--ho-status-warn);   &.is-active { background: var(--ho-bg-warn); } }
  &.is-clear    { color: var(--ho-status-clear);  &.is-active { background: var(--ho-bg-clear); } }
}
.ho-fb-sre-legend__dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; box-shadow: 0 0 0 2px #fff; }
.ho-fb-sre-legend__text { letter-spacing: 0.2px; }
.ho-fb-sre-legend__count { font-variant-numeric: tabular-nums; opacity: 0.92; }

/* Severity heat strip (full-width, edge-to-edge inside the card) */
.ho-fb-sre__strip {
  display: flex;
  width: calc(100% + 36px);
  margin: 0 -18px 2px;
  height: 22px;
  overflow: hidden;
  background: var(--ho-fill);
  border-top: 1px solid var(--el-border-color-lighter);
  border-bottom: 1px solid var(--el-border-color-lighter);
  position: relative;
  z-index: 1;
}
.ho-fb-sre-strip__seg {
  position: relative;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: flex 0.35s ease, filter 0.15s ease;
  opacity: 0.94;
  &.is-clickable { cursor: pointer; }
  &:hover.is-clickable { filter: brightness(1.08); }
  &::after {
    content: "";
    position: absolute; inset: 0;
    background: linear-gradient(180deg, rgba(255,255,255,0.28) 0%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.08) 100%);
    pointer-events: none;
  }
}
.ho-fb-sre-strip__label {
  position: relative;
  z-index: 1;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.3px;
  white-space: nowrap;
  color: #fff;
  text-shadow: 0 1px 1px rgb(0 0 0 / 25%);
}
.ho-fb-sre-strip__seg.is-clear .ho-fb-sre-strip__label,
.ho-fb-sre-strip__seg.is-warn  .ho-fb-sre-strip__label {
  color: #1f2937;
  text-shadow: 0 1px 0 rgba(255,255,255,0.5);
}

/* Items grid: responsive, fills full container width */
.ho-fb-sre__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 8px;
  width: 100%;
  position: relative;
  z-index: 1;
  padding: 4px 2px 2px;
  &[data-filter-mode="filtered"] .ho-fb-sre-item {
    animation: sre-filter-in 0.24s ease both;
  }
}
@keyframes sre-filter-in {
  from { opacity: 0; transform: translateY(3px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* SRE card item */
.ho-fb-sre-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 10px;
  background: #fff;
  border: 1px solid var(--el-border-color-lighter);
  border-left: 4px solid var(--el-border-color);
  cursor: pointer;
  outline: none;
  transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease, background 0.15s ease;
  min-height: 72px;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 18px rgb(99 102 241 / 9%), 0 2px 6px rgb(0 0 0 / 4%);
    border-color: var(--el-color-primary-light-5);
    background: #fcfcff;
  }
  &:focus-visible {
    box-shadow: 0 0 0 3px #c7d2fe, 0 0 0 1px #6366f1 inset;
  }
  &.is-critical {
    border-left-color: var(--ho-status-danger);
    background: linear-gradient(180deg, #fff 0%, var(--ho-bg-danger) 100%);
    animation: sre-pulse-danger 3.4s ease-in-out infinite;
  }
  &.is-major {
    border-left-color: var(--ho-status-major);
    background: linear-gradient(180deg, #fff 0%, var(--ho-bg-major) 100%);
  }
  &.is-warn {
    border-left-color: var(--ho-status-warn);
    background: linear-gradient(180deg, #fff 0%, var(--ho-bg-warn) 100%);
  }
  &.is-clear {
    border-left-color: var(--ho-status-clear);
    background: linear-gradient(180deg, #fff 0%, var(--ho-bg-clear) 100%);
  }
  &.is-flash { animation-iteration-count: 2; animation-duration: 2.2s; }
}
@keyframes sre-pulse-danger {
  0%, 100% { box-shadow: 0 0 0 0 rgb(239 68 68 / 0%); }
  50%      { box-shadow: 0 0 0 4px rgb(239 68 68 / 10%); }
}

.ho-fb-sre-item__top {
  display: flex;
  gap: 6px;
  align-items: center;
  width: 100%;
  flex-wrap: wrap;
}
.ho-fb-sre-item__led {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 0 0 2px #fff;
  &.is-pulse { animation: sre-led-blink 1.1s ease-in-out infinite; }
}
@keyframes sre-led-blink {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%      { opacity: 0.35; transform: scale(0.78); }
}
.ho-fb-sre-item__tag {
  flex-shrink: 0;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.5px;
  padding: 1px 6px;
  border-radius: 5px;
  text-transform: uppercase;
  border: 1px solid currentColor;
  opacity: 0.85;
}
.ho-fb-sre-item__title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  font-weight: 700;
  color: var(--ho-text-primary);
  line-height: 1.35;
}
.ho-fb-sre-item__spacer { flex: 0 0 4px; }
.ho-fb-sre-item__owner {
  flex-shrink: 0;
  display: inline-flex;
  gap: 3px;
  align-items: center;
  font-size: 10px;
  font-weight: 600;
  color: var(--ho-text-secondary);
  padding: 1px 6px;
  background: rgba(255,255,255,0.8);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 20px;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
}
.ho-fb-sre-item__chev {
  flex-shrink: 0;
  color: var(--ho-text-placeholder);
  transition: transform 0.15s ease, color 0.15s ease;
  display: flex;
}
.ho-fb-sre-item:hover .ho-fb-sre-item__chev {
  transform: translateX(2px);
  color: var(--el-color-primary);
}

.ho-fb-sre-item__mid { padding-left: 14px; }
.ho-fb-sre-item__detail {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: 11px;
  line-height: 1.5;
  color: var(--ho-text-secondary);
}

.ho-fb-sre-item__bot {
  display: flex;
  gap: 8px;
  align-items: center;
  padding-top: 4px;
  border-top: 1px dashed var(--el-border-color-lighter);
  margin-top: 2px;
}
.ho-fb-sre-item__imp {
  flex-shrink: 0;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.35px;
  padding: 1px 8px;
  border-radius: 20px;
  text-transform: uppercase;
  border: 1px solid currentColor;
  opacity: 0.9;
}
.ho-fb-sre-item__hint {
  flex: 1;
  min-width: 0;
  text-align: right;
  font-size: 9px;
  font-weight: 600;
  color: var(--ho-text-placeholder);
  letter-spacing: 0.2px;
  opacity: 0.9;
}

/* Tooltip for SRE cards (global, not scoped, so use element-plus popper class via :deep is impossible; style our own wrapper inside tooltip slot) */
.ho-fb-sre-tip {
  max-width: 280px;
  line-height: 1.55;
  font-size: 11px;
}
.ho-fb-sre-tip__title { font-size: 12px; font-weight: 700; margin-bottom: 4px; }
.ho-fb-sre-tip__body  { color: #e5e7eb; }
.ho-fb-sre-tip__foot  { font-size: 10px; color: #d1d5db; margin-top: 4px; font-style: italic; }

/* Foot bar for active filters */
.ho-fb-sre__foot {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 6px 10px;
  border-radius: 8px;
  background: var(--el-fill-color-light);
  border: 1px dashed var(--el-border-color-lighter);
  font-size: 10px;
  color: var(--ho-text-secondary);
  z-index: 1;
  position: relative;
}
.ho-fb-sre__foot-tip { flex: 1; min-width: 0; font-weight: 600; }
.ho-fb-sre__foot-clear {
  flex-shrink: 0;
  padding: 0 6px;
  font-size: 10px;
  font-weight: 700;
  color: var(--el-color-danger);
  &:hover { text-decoration: underline; }
}

/* SRE Matrix responsive: fill full screen width across breakpoints */
@media (max-width: 1024px) {
  .ho-fb-sre { padding: 12px 16px 14px; }
  .ho-fb-sre__strip { width: calc(100% + 32px); margin: 0 -16px 2px; }
}
@media (max-width: 760px) {
  .ho-fb-sre { padding: 12px 14px 14px; border-radius: 12px; }
  .ho-fb-sre__strip { width: calc(100% + 28px); margin: 0 -14px 2px; }
  .ho-fb-sre__grid { grid-template-columns: 1fr 1fr; }
  .ho-fb-sre-item__owner { max-width: 88px; }
}
@media (max-width: 560px) {
  .ho-fb-sre { padding: 10px 12px 12px; margin-bottom: 10px; }
  .ho-fb-sre__strip { width: calc(100% + 24px); margin: 0 -12px 2px; height: 18px; }
  .ho-fb-sre-strip__label { font-size: 8px; }
  .ho-fb-sre__grid { grid-template-columns: 1fr; gap: 6px; }
  .ho-fb-sre__legend { display: none; }
  .ho-fb-sre__count { order: -1; }
}

/* ═══════════════════════════════════════════════════════════
 *  Issue 动态模块样式（4 语义分组 + Activity Paradigm 扩展）
 *  所有类名语义化：无数字后缀
 * ══════════════════════════════════════════════════════════ */

/* Group container tweaks for new icon category colors (映射到 ho-activity__icon) */
.ho-activity__icon {
  &.is-col-security { color: var(--ho-status-danger); }
  &.is-col-data     { color: var(--ho-status-major); }
  &.is-col-cross    { color: #8b5cf6; }
  &.is-col-iface    { color: var(--ho-st-wip); }
  &.is-col-perf     { color: #0891b2; }
  &.is-col-quality  { color: #059669; }
  &.is-col-func    { color: var(--ho-st-wip); }
}

/* ── Issue row base: shared row variant severity visual emphasis */
.ho-issue-row {
  border-radius: 8px;
  transition: background 0.14s ease, box-shadow 0.14s ease, border-color 0.14s ease;

  &.is-sev-critical {
    background: linear-gradient(90deg, var(--ho-bg-danger) 0%, transparent 100%);
    &:hover { box-shadow: inset 0 0 0 1px var(--ho-status-danger) inset; }
  }
  &.is-sev-major {
    background: linear-gradient(90deg, var(--ho-bg-major) 0%, transparent 100%);
  }
}

/* ── Severity 药丸样式:  */
.ho-issue-sev {
  flex-shrink: 0;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.4px;
  padding: 1px 6px;
  border-radius: 4px;
  min-width: 30px;
  text-align: center;
  color: #fff;
  text-transform: uppercase;
  &.is-critical { background: var(--ho-status-danger); }
  &.is-major    { background: var(--ho-status-major); }
  &.is-warn     { background: var(--ho-status-warn); color: #1f2937; }
  &.is-clear    { background: var(--ho-status-clear); }
}

/* ── Category 类别: semantic colors */
.ho-issue-cat {
  flex-shrink: 0;
  font-size: 8px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 5px;
  background: var(--ho-fill);
  color: var(--ho-text-secondary);
  letter-spacing: 0.1px;

  &.is-col-security { background: #fee2e2; color: #b91c1c; }
  &.is-col-data     { background: #ffedd5; color: #9a3412; }
  &.is-col-cross    { background: #ede9fe; color: #5b21b6; }
  &.is-col-iface    { background: #dbeafe; color: #1d4ed8; }
  &.is-col-perf     { background: #cffafe; color: #155e75; }
  &.is-col-quality  { background: var(--ho-bg-clear); color: #047857; }
  &.is-col-func    { background: var(--el-fill-color-light); color: var(--ho-text-placeholder); }
}

/* ── 单行 Status inline status inline pill wrapper: status-color */
.ho-issue-status {
  flex-shrink: 0;
  font-size: 10px;
  font-weight: 700;
  max-width: 52px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.ho-issue-status-pill {
  flex-shrink: 0;
  font-size: 8px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 4px;
  background: var(--ho-fill);
  color: var(--ho-text-placeholder);
  &.is-resolved { background: var(--ho-bg-clear); color: var(--ho-status-clear); }
  &.is-open     { background: var(--ho-bg-danger); color: var(--ho-status-danger); }
  &.is-progress { background: var(--ho-bg-warn);  color: var(--ho-status-warn); }
}

/* ── 分组 Group header label带图标 label style variants aligned S  */
.ho-issue-group {
  &__label {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.2px;

    &--danger  { color: var(--ho-status-danger); }
    &--clear   { color: var(--ho-status-clear); }
    &--cross   { color: #7c3aed; }
    &--quality { color: #0ea5e9; }
  }
}

/* ── fb-divider 右侧内联按钮对齐 */
.ho-fb-divider {
  align-items: center;
  .ho-fb-btn-chevron { flex-shrink: 0; margin-left: auto; }
}

/* Issue group subtle visual  */
.ho-issue-group {
  &--critical  { border-radius: 8px; padding: 2px 6px 4px; }
  &--recent + &--recent { margin-top: 4px; }
}

/* ═══════════════════════════════════════════════════════════
 *  Sidebar (ho__side) — 专业样式重建
 *  视觉对齐主区 ho-card, 语义化 accent border, BEM 纯净
 * ══════════════════════════════════════════════════════════ */
.ho__side {
  position: sticky;
  top: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  align-self: start;
}

/* ── Sidebar Card 基类 (与 ho-card 同构但更紧凑) ── */
.ho-sb {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 14px;
  padding: 12px 14px 14px;
  overflow: hidden;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  &:hover {
    border-color: var(--el-border-color-light);
    box-shadow: 0 4px 14px rgb(0 0 0 / 5%);
  }
  /* 第一个子块 accent border: 知识健康 */
  &:first-of-type {
    border-top: 3px solid var(--ho-status-clear);
  }
  /* 第二个子块 accent border: workload */
  &:nth-of-type(2) {
    border-top: 3px solid var(--el-color-primary);
  }
}
.ho-sb__head {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 2px 2px 10px;
  margin-bottom: 8px;
  border-bottom: 1px dashed var(--el-border-color-lighter);
  cursor: pointer;
  user-select: none;
  span {
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.4px;
    text-transform: uppercase;
    color: var(--ho-text-primary);
    flex: 1;
    min-width: 0;
  }
  .ho-sb__head-link {
    flex-shrink: 0;
    font-size: 11px;
    color: var(--ho-text-placeholder);
    transition: transform 0.14s ease, color 0.14s ease;
  }
  &:hover .ho-sb__head-link {
    color: var(--el-color-primary);
    transform: translateX(2px);
  }
  &:active { transform: scale(0.99); }
}

/* ── Knowledge Health: Big percentage + label ── */
.ho-kh {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 2px;
  padding: 10px 10px 12px;
  margin-bottom: 8px;
  cursor: pointer;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--ho-bg-clear) 0%, var(--el-bg-color) 100%);
  border: 1px solid #d1fae5;
  transition: all 0.14s ease;
  &:hover {
    border-color: var(--ho-status-clear);
    box-shadow: 0 3px 10px rgb(16 185 129 / 10%);
    transform: translateY(-1px);
  }
}
.ho-kh__pct {
  font-size: 30px;
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: -0.5px;
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum";
}
.ho-kh__label {
  font-size: 10px;
  font-weight: 600;
  color: var(--ho-text-secondary);
  letter-spacing: 0.2px;
  text-transform: lowercase;
  &::first-letter { text-transform: uppercase; }
}

/* ── Category rows （行高 32px 统一范式）── */
.ho-kh__cats {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.ho-kh__cat {
  display: grid;
  grid-template-columns: 62px 1fr 22px;
  align-items: center;
  gap: 8px;
  height: 30px;
  padding: 0 6px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.12s ease;
  &:hover { background: var(--el-fill-color-light); }
}
.ho-kh__cat-name {
  font-size: 10px;
  font-weight: 700;
  color: var(--ho-text-secondary);
  letter-spacing: 0.2px;
  text-transform: lowercase;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  &::first-letter { text-transform: uppercase; }
}
.ho-kh__cat-bar {
  display: block;
  height: 5px;
  background: var(--ho-fill);
  border-radius: 3px;
  overflow: hidden;
  min-width: 0;
}
.ho-kh__cat-fill {
  display: block;
  height: 100%;
  border-radius: 3px;
  transition: width 0.4s ease;
}
.ho-kh__cat-n {
  font-size: 10px;
  font-weight: 700;
  color: var(--ho-text-placeholder);
  text-align: right;
  font-variant-numeric: tabular-nums;
}

/* ── Workload rows （与 kh__cat 完全相同行高范式）── */
.ho-wl {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.ho-wl__row {
  display: grid;
  grid-template-columns: 62px 1fr 22px;
  align-items: center;
  gap: 8px;
  height: 30px;
  padding: 0 6px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.12s ease;
  &:hover { background: var(--el-fill-color-light); }
}
.ho-wl__name {
  font-size: 10px;
  font-weight: 700;
  color: var(--ho-text-secondary);
  letter-spacing: 0.1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ho-wl__bar {
  display: block;
  height: 5px;
  background: var(--ho-fill);
  border-radius: 3px;
  overflow: hidden;
  min-width: 0;
}
.ho-wl__fill {
  display: block;
  height: 100%;
  border-radius: 3px;
  background: var(--el-color-primary);
  transition: width 0.4s ease;
  &.is-over {
    background: var(--ho-status-danger);
    animation: wl-over-pulse 1.6s ease-in-out infinite;
  }
}
@keyframes wl-over-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgb(239 68 68 / 0%); }
  50%      { box-shadow: 0 0 0 2px rgb(239 68 68 / 18%); }
}
.ho-wl__n {
  font-size: 10px;
  font-weight: 700;
  color: var(--ho-text-placeholder);
  text-align: right;
  font-variant-numeric: tabular-nums;
}

/* ── Sidebar 响应式：小屏堆叠 ── */
@media (max-width: 1024px) {
  .ho__body { grid-template-columns: 1fr; }
  .ho__side { position: static; }
}
</style>

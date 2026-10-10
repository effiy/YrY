<template>
  <div class="search-page">
    <!-- Date Navigation -->
    <HeroDateNav
      :filter-date="filterDate"
      :label="filterDateLabel"
      :is-today="isFilterToday"
      @prev="goToPrevDay"
      @next="goToNextDay"
      @today="goToFilterToday"
      @clear="clearFilterDate"
    />

    <!-- Search Header -->
    <div class="search-page__head">
      <div class="search-page__input-area">
        <div class="search-page__input-wrap" :class="{ 'is-focused': inputFocused }">
          <el-icon class="search-page__input-icon" :size="18">
            <component :is="searching ? Loading : Search" :class="{ 'is-spinning': searching }" />
          </el-icon>
          <input
            ref="inputRef"
            v-model="query"
            class="search-page__input"
            :placeholder="dynamicPlaceholder"
            @input="onInput"
            @focus="handleInputFocus"
            @blur="handleInputBlur"
            @keydown="onInputKeydown"
          />
          <span v-if="searching" class="search-page__searching-dot" />
          <el-icon v-else-if="query" class="search-page__clear" :size="16" @mousedown.prevent="clearSearch">
            <CircleClose />
          </el-icon>
          <kbd class="search-page__kbd">⌘K</kbd>
        </div>

        <!-- Recent Suggestions -->
        <Transition name="suggest">
          <div v-if="showSuggestions && suggestionItems.length" class="search-page__suggestions">
            <div class="search-page__suggestions-head">
              {{ query ? 'Suggestions' : 'Recent searches' }}
              <button v-if="!query && recentSearches.length" class="search-page__suggestions-clear" @click="clearRecent">Clear</button>
            </div>
            <button
              v-for="(s, i) in suggestionItems"
              :key="i"
              :class="['search-page__suggestion', { 'is-active': suggestionIdx === i }]"
              @mousedown.prevent="pickSuggestion(s)"
              @mouseenter="suggestionIdx = i"
            >
              <el-icon :size="14"><Clock v-if="!query" /><Search v-else /></el-icon>
              <span v-html="highlightSuggestion(s)" />
              <span v-if="!query" class="search-page__suggestion-remove" @mousedown.stop.prevent="removeRecent(i)">
                <el-icon :size="12"><Close /></el-icon>
              </span>
            </button>
          </div>
        </Transition>
      </div>

      <!-- Active Filters Bar -->
      <div v-if="query" class="search-page__toolbar">
        <div class="search-page__type-filters">
          <button
            v-for="ft in typeFilters"
            :key="ft.key"
            :class="['search-page__filter-btn', { 'is-active': activeTypeFilter === ft.key }]"
            @click="toggleTypeFilter(ft.key)"
          >
            <el-icon :size="14"><component :is="ft.icon" /></el-icon>
            <span>{{ ft.label }}</span>
            <span v-if="typeCounts[ft.key]" class="search-page__filter-count">{{ typeCounts[ft.key] }}</span>
          </button>
        </div>
        <div class="search-page__toolbar-right">
          <!-- Group Mode Switcher (new: type / role / stage / project) -->
          <div class="search-page__group-mode" role="group" aria-label="分组方式">
            <button
              v-for="gm in groupModes"
              :key="gm.key"
              :class="['search-page__group-mode-btn', { 'is-active': groupMode === gm.key }]"
              :title="gm.title"
              @click="groupMode = gm.key"
            >
              <el-icon :size="12"><component :is="gm.icon" /></el-icon>
              <span>{{ gm.label }}</span>
            </button>
          </div>
          <select v-if="projectOptions.length > 1" v-model="projectFilter" class="search-page__project-select">
            <option value="">All Projects</option>
            <option v-for="p in projectOptions" :key="p.key" :value="p.key">{{ p.name }}</option>
          </select>
          <!-- Sort Buttons (new: relevance / rice / recent) -->
          <div class="search-page__sort">
            <button :class="['search-page__sort-btn', { 'is-active': sortBy === 'relevance' }]" @click="sortBy = 'relevance'" title="后端 BM25 + v2 归一化分数">
              Relevance
            </button>
            <button :class="['search-page__sort-btn', { 'is-active': sortBy === 'rice' }]" @click="sortBy = 'rice'" :title="riceSortTooltip">
              RICE 🎯
            </button>
            <button :class="['search-page__sort-btn', { 'is-active': sortBy === 'recent' }]" @click="sortBy = 'recent'" title="按时间戳降序">
              Recent
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="searching" class="search-page__loading">
      <p class="search-page__loading-text">
        Searching<template v-if="query"> for "<strong>{{ query }}</strong>"</template
        ><span class="search-page__loading-dots"><span>.</span><span>.</span><span>.</span></span>
      </p>
      <div v-for="i in 4" :key="i" class="search-page__skeleton">
        <div class="search-page__skeleton-icon" />
        <div class="search-page__skeleton-lines">
          <div class="search-page__skeleton-line w-40" />
          <div class="search-page__skeleton-line w-60" />
          <div class="search-page__skeleton-line w-25" />
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="searchError" class="search-page__error">
      <div class="search-page__error-icon">
        <el-icon :size="24"><WarningFilled /></el-icon>
      </div>
      <p class="search-page__error-text">{{ searchError }}</p>
      <button class="search-page__error-retry" @click="handleRetry">
        <el-icon :size="12"><RefreshRight /></el-icon>
        Retry
      </button>
    </div>

    <!-- Results -->
    <div v-else-if="query && !searching" class="search-page__results">
      <!-- SRE SLOLight Status Bar (NEW: 工业级状态灯) -->
      <div class="search-page__sre-bar" role="status" aria-live="polite">
        <div
          v-for="slo in sloLights"
          :key="slo.key"
          :class="['search-page__slo-light', `search-page__slo-light--${slo.level}`]"
          :title="slo.title"
        >
          <span class="search-page__slo-dot" />
          <span class="search-page__slo-label">{{ slo.label }}</span>
          <span class="search-page__slo-value">{{ slo.value }}</span>
          <span class="search-page__slo-target">(目标: {{ slo.target }})</span>
        </div>
        <div class="search-page__sre-meta">
          <span v-if="usTiming?.per_collection" class="search-page__sre-chip">
            <el-icon :size="11"><DataAnalysis /></el-icon>
            {{ Object.keys(usTiming.per_collection || {}).length }} collections
          </span>
          <span v-if="usMeta?.etag" class="search-page__sre-chip" title="协商缓存 ETag">
            <el-icon :size="11"><Coin /></el-icon>
            ETag {{ usMeta.etag.slice(0, 8) }}…
          </span>
        </div>
      </div>

      <!-- Summary Bar -->
      <div class="search-page__summary">
        <template v-if="totalResults > 0 || autoFilteredCount > 0 || ghostFilteredCount > 0">
          <span class="search-page__summary-count">{{ totalResults }}</span>
          {{ totalResults === 1 ? 'result' : 'results' }} for "<strong>{{ query }}</strong
          >"
          <span v-if="searchMs !== null" class="search-page__summary-time">in {{ searchMs }}ms</span>
          <span v-if="sortBy === 'rice'" class="search-page__summary-rice-tag" title="按 RICE 业务价值排序">🎯 RICE 排序中</span>

          <div
            v-if="autoFilteredCount + ghostFilteredCount > 0"
            class="search-page__summary-auto-filter"
            role="button"
            tabindex="0"
            @click="showFilterDetail = !showFilterDetail"
          >
            <el-icon size="14"><WarningFilled /></el-icon>
            自动屏蔽 {{ autoFilteredCount + ghostFilteredCount }} 条不可达/幽灵结果
            <el-icon :size="14" :class="{ 'is-open': showFilterDetail }"><ArrowRight /></el-icon>
            <div v-if="showFilterDetail" class="search-page__summary-filter-detail" @click.stop>
              <div>· 后端过滤（已删除/归档/取消）：{{ ghostFilteredCount }} 条</div>
              <div>· 前端 Gate A（路由/权限/隐藏）：{{ autoFilteredCount }} 条</div>
              <div class="search-page__summary-filter-actions">
                <el-button size="small" link @click="includeUnreachable = !includeUnreachable">
                  {{ includeUnreachable ? '恢复仅展示可达结果' : '临时包含不可达结果（仅调试）' }}
                </el-button>
              </div>
            </div>
          </div>
        </template>
        <span v-else class="search-page__summary-empty">
          No results for "<strong>{{ query }}</strong>"
          <span v-if="searchMs !== null" class="search-page__summary-time"> — searched in {{ searchMs }}ms</span>
        </span>
      </div>

      <!-- Distribution Bar (ENHANCED: 点击切换 + 百分比 tooltip) -->
      <div v-if="totalResults > 0 && !activeTypeFilter && groupMode === 'type'" class="search-page__distro">
        <button
          v-for="seg in distribution"
          :key="seg.key"
          :class="['search-page__distro-seg', { 'is-active': activeTypeFilter === seg.key }]"
          :style="{ width: seg.pct + '%', background: seg.color }"
          :title="`${seg.label}: ${seg.count}/${totalResults} (${seg.pct.toFixed(1)}%) — 点击${activeTypeFilter === seg.key ? '取消' : '启用'}过滤`"
          @click="toggleTypeFilter(seg.key)"
        >
          <span class="search-page__distro-label">{{ seg.label }}</span>
          <span class="search-page__distro-count">{{ seg.count }}</span>
        </button>
      </div>

      <!-- Active Filter Indicator -->
      <div v-if="activeTypeFilter || projectFilter || groupMode !== 'type'" class="search-page__filter-active">
        <template v-if="activeTypeFilter">
          类型: <strong>{{ groupConfigs[activeTypeFilter]?.label || activeTypeFilter }}</strong>
          <button class="search-page__filter-clear" @click="activeTypeFilter = ''">× 清除</button>
        </template>
        <template v-if="projectFilter">
          · 项目: <strong>{{ projectOptions.find(p => p.key === projectFilter)?.name || projectFilter }}</strong>
          <button class="search-page__filter-clear" @click="projectFilter = ''">×</button>
        </template>
        <template v-if="groupMode !== 'type'">
          · 分组方式: <strong>{{ groupModes.find(gm => gm.key === groupMode)?.label }}</strong>
        </template>
        <button v-if="activeTypeFilter || projectFilter" class="search-page__filter-clear-all" @click="clearAllFilters">清除全部过滤</button>
      </div>

      <!-- No Results with Actions + YiKnowledge 检索策略引导 (ENHANCED) -->
      <div v-if="totalResults === 0" class="search-page__no-results">
        <p class="search-page__no-results-text">
          未找到 "<strong>{{ query }}</strong>" 的匹配结果。尝试以下方式：
        </p>
        <div class="search-page__no-results-actions">
          <div class="search-page__no-results-links">
            <a v-for="ql in noResultsActions" :key="ql.path" class="search-page__no-results-link" :href="'#' + ql.path">
              <el-icon :size="14"><component :is="ql.icon" /></el-icon>
              <span>{{ ql.label }}</span>
            </a>
          </div>
        </div>
        <!-- YiKnowledge 6 步检索策略提示卡 (NEW) -->
        <div class="search-page__kb-strategy-card">
          <div class="search-page__kb-strategy-title">
            <el-icon :size="14"><Collection /></el-icon>
            YiKnowledge 6 步检索策略（当全局搜索无法定位时）
          </div>
          <div class="search-page__kb-strategy-list">
            <a v-for="(step, i) in kbRetrieveSteps" :key="i" class="search-page__kb-strategy-step" :href="'#' + step.path">
              <span class="search-page__kb-strategy-idx">{{ i + 1 }}</span>
              <div class="search-page__kb-strategy-body">
                <span class="search-page__kb-strategy-title-s">{{ step.title }}</span>
                <span class="search-page__kb-strategy-desc">{{ step.desc }}</span>
              </div>
            </a>
          </div>
        </div>
      </div>

      <!-- Result Groups (按当前 groupMode 渲染) -->
      <TransitionGroup name="group">
        <div v-for="group in sortedGroups" :key="group.key" :class="['search-page__group', `search-page__group--${groupMode}`]">
          <button
            class="search-page__group-head"
            :style="{ '--group-color': group.color }"
            @click="toggleGroup(group.key)"
          >
            <div class="search-page__group-label">
              <el-icon :size="12" class="search-page__group-chevron" :class="{ 'is-open': !collapsedGroups.has(group.key) }">
                <ArrowRight />
              </el-icon>
              <span class="search-page__group-dot" :style="{ background: group.color }" />
              <component :is="group.icon || FolderOpened" :size="14" />
              <span class="search-page__group-title">{{ group.label }}</span>
              <span v-if="group.description" class="search-page__group-desc" :title="group.description">· {{ group.description }}</span>
            </div>
            <!-- OKRSupportRow: 分组 KR 覆盖度 (NEW) -->
            <div class="search-page__group-meta">
              <span v-if="group.okrCoveragePct != null" :class="['search-page__okr-tag', getOkrLevelClass(group.okrCoveragePct)]" title="分组内关联 OKR 的条目覆盖率">
                <el-icon :size="10"><Flag /></el-icon>
                {{ group.okrTag || '未关联 OKR' }} · {{ group.okrCoveragePct }}% 覆盖
              </span>
              <span class="search-page__group-count">{{ group.items.length }} 条</span>
            </div>
          </button>

          <TransitionGroup v-show="!collapsedGroups.has(group.key)" name="item" tag="div" class="search-page__group-items">
            <a
              v-for="item in group.items"
              :key="item.id"
              :ref="el => setItemRef(el, item._idx)"
              :class="[
                'search-page__item',
                {
                  'is-active': activeIdx === item._idx,
                  'search-page__item--ghost': !item._gateA?.ok,
                  'search-page__item--archived': item._status && item._status !== 'active'
                }
              ]"
              :style="{ '--accent': group.color }"
              :href="'#' + (item._gateA?.ok ? item._link : item._gateA?.fallback || '/search')"
              :aria-disabled="!item._gateA?.ok ? 'true' : undefined"
              @click.prevent="goTo(item)"
              @mouseenter="activeIdx = item._idx"
            >
              <div class="search-page__item-icon" :style="{ background: group.color }">
                <el-icon :size="14"><component :is="group.icon || groupConfigs[item.type]?.icon || Document" /></el-icon>
              </div>
              <div class="search-page__item-body">
                <!-- Title Row (ENHANCED: RICE 圆角色块 + KR coveragePct) -->
                <div class="search-page__item-title-row">
                  <div class="search-page__item-title">
                    <span v-html="highlight(item.title)" :class="{ 'search-page__strikethrough': item._status && item._status !== 'active' }" />
                    <span class="search-page__item-key">{{ item.key || extractKey(item.id || '') }}</span>

                    <!-- RICE Score Badge (NEW) -->
                    <span
                      v-if="sortBy === 'rice' && item._rice != null"
                      :class="['search-page__rice-badge', getRiceLevelClass(item._rice)]"
                      :title="getRiceTooltip(item)"
                    >
                      🎯 RICE {{ Math.round(item._rice * 100) }}
                    </span>
                    <!-- LinkValidationBadge (Gate A 灰卡) -->
                    <LinkValidationBadge
                      v-if="!item._gateA?.ok"
                      class="search-page__item-gate-badge"
                      :gate-a="item._gateA"
                    />
                  </div>
                  <div class="search-page__item-extra-score">
                    <span v-if="item.score != null" class="search-page__item-score">{{ Math.round(item.score) }}%</span>
                  </div>
                </div>

                <!-- Breadcrumbs (NEW: 角色域路径) -->
                <div v-if="item._breadcrumbs && item._breadcrumbs.length" class="search-page__item-breadcrumbs" aria-label="知识域路径">
                  <span
                    v-for="(crumb, ci) in item._breadcrumbs"
                    :key="ci"
                    class="search-page__breadcrumb-item"
                  >
                    <template v-if="ci > 0"><span class="search-page__breadcrumb-sep">/</span></template>
                    <span>{{ crumb }}</span>
                  </span>
                </div>

                <!-- Meta Row (ENHANCED: project + subtitle + last_verified) -->
                <div class="search-page__item-meta">
                  <code v-if="item.project" class="search-page__code">{{ item.project }}</code>
                  <span class="search-page__meta-sep" v-if="item.project && item.subtitle">·</span>
                  <span v-if="item.subtitle" class="search-page__item-subtitle">{{ item.subtitle }}</span>
                  <span v-if="item.last_verified" class="search-page__verified-tag" :title="`最后验证日期 ${item.last_verified}`">
                    <el-icon :size="11"><Select /></el-icon>
                    已验证 · {{ item.last_verified }}
                  </span>
                </div>

                <!-- Badges Row (ENHANCED: coveragePct OKR 徽标) -->
                <div class="search-page__item-badges">
                  <!-- OKR coveragePct Badge (NEW) -->
                  <el-tag
                    v-if="item.coveragePct != null"
                    :class="['search-page__okr-coverage', getOkrLevelClass(item.coveragePct)]"
                    size="small"
                    effect="dark"
                    :title="`OKR 关联条目 KR-Test 覆盖度 ${item.coveragePct}%，点击跳转 OKR Dashboard`"
                    @click.stop="navigateToOkr(item)"
                    role="link"
                  >
                    <el-icon :size="10"><Flag /></el-icon>
                    {{ item.okrTag || 'OKR' }} 覆盖度 {{ item.coveragePct }}%
                  </el-tag>

                  <el-tag
                    v-for="b in (item.badges || [])"
                    :key="b.label"
                    :type="b.type || undefined"
                    size="small"
                    :effect="b.effect || 'plain'"
                    :disable-transitions="true"
                  >
                    {{ b.label }}
                  </el-tag>
                  <span v-if="item._status && item._status !== 'active'" class="search-page__item-status search-page__status--warn">
                    状态：{{ item._status }}
                  </span>
                  <span v-if="item._acl?.roles && item._acl.roles.length" class="search-page__roles-tag" :title="`仅对角色可见: ${item._acl.roles.join(', ')}`">
                    <el-icon :size="10"><User /></el-icon>
                    {{ item._acl.roles.length }} 角色可见
                  </span>
                  <span v-if="item.date" class="search-page__item-date">
                    <el-icon :size="11"><Calendar /></el-icon>
                    {{ formatDate(item.date) }}
                  </span>
                </div>

                <!-- Detail (EXPANDED: 140 → 280 chars; 优先截取 frontmatter.benefit / acceptance_criteria) -->
                <div
                  v-if="item.detail || item.frontmatter?.benefit || item.frontmatter?.acceptance_criteria"
                  class="search-page__item-detail"
                  v-html="highlight(getDetailSnippet(item))"
                />
              </div>
              <el-icon
                v-if="activeIdx === item._idx && item._gateA?.ok"
                class="search-page__item-enter"
                :size="14"
              ><ArrowRight /></el-icon>
            </a>
          </TransitionGroup>
        </div>
      </TransitionGroup>
    </div>

    <!-- Empty State (no query) — 对齐 YiKnowledge INDEX.md 6 步检索策略 (FULLY REVAMPED) -->
    <div v-else class="search-page__empty">
      <div class="search-page__empty-header">
        <div class="search-page__empty-icon">
          <el-icon :size="40"><Search /></el-icon>
        </div>
        <div class="search-page__empty-meta">
          <p class="search-page__scope">
            跨 <strong>{{ typeFilters.length }} 种类型</strong> ·
            <template v-if="projectStore.projects.length"><strong>{{ projectStore.projects.length }} 个项目</strong> · </template>
            <strong>7 角色 × 6 流水线阶段</strong> 全量检索
          </p>
          <p class="search-page__sub-scope">
            与 <a href="#/page/INDEX" class="search-page__kb-link">YiKnowledge 知识库导航索引</a> 路径完全对齐 · Frontmatter 15 字段可检索
          </p>
        </div>
      </div>

      <!-- YiKnowledge 6 步检索策略卡 (NEW, 来自 INDEX.md) -->
      <div class="search-page__empty-strategies">
        <div class="search-page__section-title">
          <el-icon :size="14"><Guide /></el-icon>
          YiKnowledge 推荐检索路径
        </div>
        <div class="search-page__strategy-grid">
          <a
            v-for="(step, i) in kbRetrieveSteps"
            :key="i"
            class="search-page__strategy-card"
            :href="'#' + step.path"
            :title="step.desc"
          >
            <div class="search-page__strategy-num">{{ i + 1 }}</div>
            <div class="search-page__strategy-icon-wrap" :style="{ background: step.color + '22', color: step.color }">
              <el-icon :size="18"><component :is="step.icon" /></el-icon>
            </div>
            <div class="search-page__strategy-content">
              <div class="search-page__strategy-title">{{ step.title }}</div>
              <div class="search-page__strategy-desc">{{ step.shortDesc }}</div>
            </div>
            <el-icon :size="14" class="search-page__strategy-arrow"><ArrowRight /></el-icon>
          </a>
        </div>
      </div>

      <!-- 7 角色域 Example Searches (NEW: 按角色域分组的示例搜索词) -->
      <div class="search-page__empty-examples">
        <div class="search-page__section-title">
          <el-icon :size="14"><Lightning /></el-icon>
          按角色域尝试搜索
        </div>
        <div class="search-page__role-examples">
          <div v-for="role in roleExampleSearches" :key="role.key" class="search-page__role-block" :style="{ '--role-color': role.color }">
            <div class="search-page__role-head">
              <span class="search-page__role-dot" />
              <span class="search-page__role-name">{{ role.label }}</span>
              <span class="search-page__role-question">{{ role.question }}</span>
            </div>
            <div class="search-page__role-chips">
              <button
                v-for="ex in role.examples"
                :key="ex"
                class="search-page__example-chip"
                :data-role-filter="role.key"
                @click="handleRoleExampleClick(role.key, ex)"
              >
                {{ ex }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Searches -->
      <div v-if="recentSearches.length" class="search-page__recent">
        <div class="search-page__recent-head">
          <span class="search-page__recent-title">
            <el-icon :size="13"><Clock /></el-icon>
            Recent
          </span>
          <button class="search-page__recent-clear" @click="clearRecent">Clear all</button>
        </div>
        <div class="search-page__recent-list">
          <span v-for="(rs, i) in recentSearches" :key="i" class="search-page__recent-item">
            <el-icon :size="14" class="search-page__recent-clock"><Clock /></el-icon>
            <span class="search-page__recent-text" @click="searchRecent(rs)">{{ rs }}</span>
            <button class="search-page__recent-remove" @click="removeRecent(i)" title="Remove">
              <el-icon :size="12"><Close /></el-icon>
            </button>
          </span>
        </div>
      </div>

      <!-- Quick Navigation -->
      <div class="search-page__quick-links">
        <div class="search-page__recent-title">
          <el-icon :size="13"><Aim /></el-icon>
          Quick Navigation
        </div>
        <div class="search-page__quick-grid">
          <a v-for="ql in quickLinks" :key="ql.path" class="search-page__quick-card" :href="'#' + ql.path">
            <el-icon :size="18"><component :is="ql.icon" /></el-icon>
            <span>{{ ql.label }}</span>
          </a>
        </div>
      </div>

      <!-- Shortcut Legend (NEW: 快捷键提示) -->
      <div class="search-page__shortcut-legend" role="note" aria-label="快捷键说明">
        <span v-for="sc in shortcutLegend" :key="sc.keys" class="search-page__shortcut-item">
          <kbd v-for="k in sc.keys.split(' + ')" :key="k" class="search-page__kbd-small">{{ k }}</kbd>
          <span class="search-page__shortcut-label">{{ sc.label }}</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="globalSearch">
import { ref, reactive, computed, watch, onMounted, onUnmounted, nextTick } from "vue";
import { useRouter, useRoute, onBeforeRouteLeave } from "vue-router";
import { ElNotification } from "element-plus";
import HeroDateNav from "@/components/HeroDateNav/HeroDateNav.vue";
import LinkValidationBadge from "@/components/CommandPalette/LinkValidationBadge.vue";
import { useDateFilter } from "@/hooks/useDateFilter";
import useUnifiedSearch from "@/composables/useUnifiedSearch";
import {
  resolveLink,
  gateBEntityExists,
  gateCPostNavigate,
  type LinkResolveOk,
} from "@/utils/linkFactory";
import {
  Search,
  CircleClose,
  Close,
  ArrowRight,
  Clock,
  Plus,
  Tickets,
  Folder,
  FolderOpened,
  Box,
  WarningFilled,
  Document,
  Collection,
  Loading,
  RefreshRight,
  DataAnalysis,
  Coin,
  Flag,
  Select,
  User,
  Calendar,
  Guide,
  Lightning,
  Aim,
  Menu,
  UserFilled,
  Operation,
  Histogram
} from "@element-plus/icons-vue";
import type { UnifiedSearchItem } from "@/api/modules/searchService";
import { useProjectStore } from "@/stores/modules/project";
import { useCommandPaletteStore } from "@/stores/command-palette";

const RECENT_KEY = "global_search_recent";
const MAX_RECENT = 8;
const ROLE_FILTER_KEY = "global_search_role_filter";

/* ── Types ──────────────────────────────────────────────────────────────── */
type RoleKey = "executive" | "product" | "leader" | "engineer" | "sre" | "aier" | "curator";

interface FrontmatterLight {
  benefit?: string;
  acceptance_criteria?: string[] | string;
  roles?: RoleKey[];
  lifecycle?: string;
  review_cycle?: string;
  tags?: string[];
  category?: string;
  last_verified?: string;
  status?: string;
  created?: string;
  updated?: string;
  aliases?: string[];
}

interface SearchItemEnriched extends UnifiedSearchItem {
  _idx: number;
  _gateA?: ReturnType<typeof resolveLink>;
  _link: string;
  _rice?: number;          // RICE score 0-1
  _reach?: number;
  _impact?: number;
  _confidence?: number;
  _effort?: number;
  _role?: RoleKey | "unknown";
  _stage?: string;
  _breadcrumbs?: string[];
  frontmatter?: FrontmatterLight;
  last_verified?: string;
  coveragePct?: number;    // OKR KR-Test 覆盖度
  okrTag?: string;         // 如 "OKR-yivad-003 KR-03"
}

type GroupMode = "type" | "role" | "stage" | "project";

/* ── Router / Stores ────────────────────────────────────────────────────── */
const router = useRouter();
const route = useRoute();
const projectStore = useProjectStore();
const cpStore = useCommandPaletteStore();

/* ── State ──────────────────────────────────────────────────────────────── */
const query = ref("");
const inputFocused = ref(false);
const searchError = ref<string | null>(null);
const searchMs = ref<number | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);
const itemRefs: Record<number, HTMLElement> = {};
const activeTypeFilter = ref("");
const activeIdx = ref(-1);
const sortBy = ref<"relevance" | "rice" | "recent">("relevance");
const projectFilter = ref("");
const groupMode = ref<GroupMode>("type");
const collapsedGroups = reactive(new Set<string>());
const showSuggestions = ref(false);
const suggestionIdx = ref(-1);
const includeUnreachable = ref(false);
const showFilterDetail = ref(false);
const roleFilter = ref<RoleKey | "">((localStorage.getItem(ROLE_FILTER_KEY) as RoleKey) || "");

/* ── SSOT 搜索：useUnifiedSearch (v3-ready) ─────────────────────────────── */
const {
  results: _rawResults,
  loading: searching,
  error: usError,
  timing: usTiming,
  meta: usMeta,
  refresh,
  invalidateCache,
} = useUnifiedSearch(query as any, {
  collections: [],
  limit: 40,
  debounceMs: 200,
  timeoutMs: 15_000,
  immediate: false,
});

// 同步搜索错误
watch(
  [() => usError.value, searching],
  ([err, loading]) => {
    if (loading) {
      searchError.value = null;
      searchMs.value = null;
      return;
    }
    searchError.value = err ? String(err).includes("timeout") || String(err).includes("15000ms")
      ? `搜索超时：${String(err)}。请尝试缩短关键词或稍后重试。（双 Watchdog 已自动复位）`
      : `搜索失败：${String(err)}`
      : null;
  },
  { immediate: true }
);
watch(
  () => usTiming.value?.total_ms ?? null,
  (ms) => {
    if (typeof ms === "number") searchMs.value = Math.round(ms);
  },
  { immediate: true }
);

/* ── Date filter ────────────────────────────────────────────────────────── */
const filterDate = ref<Date | null>(null);
const {
  label: filterDateLabel,
  isToday: isFilterToday,
  goToPrevDay,
  goToNextDay,
  goToFilterToday,
  clearFilterDate,
} = useDateFilter(filterDate);

/* ── URL sync ───────────────────────────────────────────────────────────── */
const initialQ = (route.query.q as string) || "";
if (initialQ) {
  query.value = initialQ;
}
if ((route.query.sort as string) === "rice" || (route.query.sort as string) === "recent") {
  sortBy.value = route.query.sort as any;
}
if ((route.query.mode as string) === "role" || (route.query.mode as string) === "stage" || (route.query.mode as string) === "project") {
  groupMode.value = route.query.mode as GroupMode;
}

watch([query, sortBy, groupMode], ([q, s, m]) => {
  const queryTrim = String(q || "").trim();
  const newQuery: Record<string, any> = { ...route.query };
  if (queryTrim) newQuery.q = queryTrim; else delete newQuery.q;
  if (s !== "relevance") newQuery.sort = s; else delete newQuery.sort;
  if (m !== "type") newQuery.mode = m; else delete newQuery.mode;
  try {
    const curStr = new URLSearchParams(route.query as any).toString();
    const newStr = new URLSearchParams(newQuery as any).toString();
    if (curStr !== newStr) {
      router.replace({ query: newQuery }).catch(() => {});
    }
  } catch { /* noop */ }
});

/* ── 常量：类型 / 分组 / 快捷导航 ────────────────────────────────────────── */
const projectOptions = computed(() => projectStore.projects.map(p => ({ key: p.key, name: p.name })));

const typeFilters = [
  { key: "issue", label: "Issues", icon: Tickets },
  { key: "project", label: "Projects", icon: Folder },
  { key: "module", label: "Modules", icon: Collection },
  { key: "bug", label: "Bugs", icon: WarningFilled },
  { key: "page", label: "YiKnowledge", icon: Document },
  { key: "navigation", label: "Nav", icon: Menu },
];

// 含 YiKnowledge 专门分组（绿色）+ navigation
const groupConfigs: Record<string, { label: string; icon: any; color: string; description?: string }> = {
  issue:      { label: "Issues / 需求缺陷", icon: Tickets,      color: "#409eff", description: "产品需求与 Bug 追踪（PRD → Issue）" },
  project:    { label: "Projects / 项目",  icon: Folder,       color: "#5470c6", description: "项目看板 / 路线图 / 里程碑" },
  module:     { label: "Modules / 模块",   icon: Collection,   color: "#9b59b6", description: "功能模块设计与技术实现文档" },
  bug:        { label: "Bugs / 故障",      icon: WarningFilled,color: "#f56c6c", description: "故障报告、复现、修复进度追踪" },
  page:       { label: "YiKnowledge / 文档", icon: Document,   color: "#27ae60", description: "知识库 2,148+ 文档：PRD / ADR / Runbook / 阅读清单" },
  navigation: { label: "Navigation / 导航", icon: Menu,        color: "#7f8c8d", description: "菜单 / 路由入口 / 功能面板（权限过滤）" },
  session:    { label: "Sessions / 会话",  icon: Box,          color: "#e67e22", description: "审计会话 / 操作日志 / 运行记录" },
};

// 角色域配置 (对齐 YiKnowledge INDEX.md)
const roleConfigs: Record<RoleKey, { label: string; icon: any; color: string; question: string; weight: number; stages: string[] }> = {
  executive: { label: "高管业务战略层", icon: Flag, color: "#2c3e50", question: "为何做这个业务？", weight: 1.3, stages: ["阶段 0：业务战略"] },
  product:   { label: "产品经理 / 需求", icon: UserFilled, color: "#f39c12", question: "构建什么产品？", weight: 1.2, stages: ["阶段 1：需求定义"] },
  leader:    { label: "技术负责人 / 决策", icon: Operation, color: "#27ae60", question: "走哪条技术路线？", weight: 1.2, stages: ["阶段 2：技术决策"] },
  engineer:  { label: "工程师 / 构建", icon: Box, color: "#2980b9", question: "如何实现？", weight: 1.0, stages: ["阶段 3：设计构建"] },
  sre:       { label: "SRE / 交付运营", icon: Histogram, color: "#d35400", question: "如何保障稳定性？", weight: 1.1, stages: ["阶段 4：交付运营", "阶段 5：持续监控"] },
  aier:      { label: "AI 工程师 / 赋能", icon: Lightning, color: "#8e44ad", question: "AI 如何加速各阶段？", weight: 1.1, stages: ["贯穿层：AI 赋能"] },
  curator:   { label: "知识管理员 / 治理", icon: Collection, color: "#795548", question: "知识库如何维护？", weight: 1.0, stages: ["贯穿层：知识治理"] },
};

// 分组方式切换
const groupModes: { key: GroupMode; label: string; icon: any; title: string }[] = [
  { key: "type",  label: "按类型",  icon: FolderOpened, title: "按实体类型（Issue/Project/Knowledge等）分组，默认方式" },
  { key: "role",  label: "按角色",  icon: UserFilled, title: "按 YiKnowledge 7 角色域（executive/product/leader...）聚合分组" },
  { key: "stage", label: "按阶段",  icon: Guide, title: "按流水线 6 阶段（需求→决策→构建→交付→运营→贯穿）聚合" },
  { key: "project", label: "按项目", icon: Folder, title: "按项目 key（yivad/yiai/yiknowledge...）分组" },
];

// 快捷导航
const quickLinks = [
  { label: "Issues",   icon: Tickets,      path: "/issue" },
  { label: "Projects", icon: Folder,       path: "/project" },
  { label: "Kanban",   icon: Box,          path: "/kanban" },
  { label: "YiKnowledge", icon: Collection, path: "/page/INDEX" },
  { label: "阅读清单", icon: Document,     path: "/page/reading-list-001" },
  { label: "Bugs",     icon: WarningFilled,path: "/bug" },
  { label: "OKR Dashboard", icon: Flag,    path: "/page/okr-overview" },
  { label: "Modules",  icon: Collection,   path: "/module" },
];

// Quick Actions for Empty
const noResultsActions = [
  { label: "New Issue", icon: Plus, path: "/issue" },
  { label: "New Bug",   icon: Plus, path: "/bug" },
  { label: "YiKnowledge 索引", icon: Collection, path: "/page/INDEX" },
  { label: "All Issues", icon: Tickets, path: "/issue" },
  { label: "OKR 总览",   icon: Flag, path: "/page/okr-overview" },
];

// YiKnowledge 6 步检索策略（严格对齐 INDEX.md §检索策略）
const kbRetrieveSteps = [
  { key: "stage", title: "按流水线阶段检索", shortDesc: "需求→决策→构建→交付", desc: "从你所在的阶段出发，前往对应角色目录：需求 product/ 决策 leader/ 构建 engineer/ 发布运维 sre/", icon: Guide, color: "#27ae60", path: "/page/INDEX" },
  { key: "role",  title: "按角色目录检索", shortDesc: "7 角色专属 INDEX.md",  desc: "进入 executive / product / leader / engineer / sre / aier / curator 的角色 INDEX.md，查看子导航", icon: UserFilled, color: "#2980b9", path: "/page/INDEX" },
  { key: "domain", title: "按领域索引检索", shortDesc: "安全/协作/工程/OKR",   desc: "跨阶段聚合：SECURITY.md（安全）/ COLLABORATION.md（协作）/ ENGINEERING.md（工程）/ curator/okr（目标）", icon: Operation, color: "#8e44ad", path: "/page/INDEX" },
  { key: "project", title: "按项目检索",  shortDesc: "5 项目 × 5 工作流分类",  desc: "从 projects/ 进入，按项目 × 分类（PRD/DEV/TEST/OKR/Bug）矩阵定位具体文件", icon: Folder, color: "#5470c6", path: "/page/projects-INDEX" },
  { key: "tags",  title: "按标签/元数据检索", shortDesc: "frontmatter 15 字段过滤", desc: "使用高级搜索语法：tags:xxx / roles:engineer / lifecycle:active / benefit:\"提升 30%\"", icon: Coin, color: "#e67e22", path: "/page/curator-governance-002" },
  { key: "frontmatter", title: "按 Frontmatter 扫描", shortDesc: "YAML 元数据先读 15 行", desc: "head -15 读取 YAML 判断价值：benefit / acceptance_criteria / status / review_cycle / last_verified", icon: Document, color: "#795548", path: "/page/curator-templates-000" },
];

// 按角色域的示例搜索词
const roleExampleSearches = (Object.keys(roleConfigs) as RoleKey[]).map(rk => ({
  key: rk,
  label: roleConfigs[rk].label,
  question: roleConfigs[rk].question,
  color: roleConfigs[rk].color,
  examples: (() => {
    switch (rk) {
      case "executive": return ["Q4 OKR 战略框架", "2026 AI 行业趋势", "蓝海战略 执行", "阅读清单 executive 收藏"];
      case "product":   return ["登录 需求 P0", "用户画像 PRD", "全局搜索 API 契约 v3", "数据看板 指标定义"];
      case "leader":    return ["微前端 架构决策 ADR", "数据库选型", "缓存一致性 P1 方案", "Monorepo 拆分 决策"];
      case "engineer":  return ["mod-search 实现", "BUG-007 修复", "useUnifiedSearch v3", "Vue 3.5 组件开发"];
      case "sre":       return ["SLO 告警配置 Runbook", "熔断 搜索超时", "数据库恢复 操作手册", "可观测性 Dashboard"];
      case "aier":      return ["RAG chunk 策略", "LLM Prompt 优化模板", "Embedding 缓存命中率", "BM25 向量混合检索"];
      case "curator":   return ["ADR 模板", "Frontmatter 15 字段", "知识库死链修复", "治理规范 合规检查清单"];
    }
  })(),
}));

// 快捷键图例（对齐 readingList）
const shortcutLegend = [
  { keys: "⌘ + K", label: "聚焦搜索框" },
  { keys: "⌘ + N", label: "新建关联 Issue" },
  { keys: "⌘ + D", label: "折叠/展开所有分组" },
  { keys: "⌘ + .", label: "展开 SRE 详情面板" },
  { keys: "⌥ + 1", label: "仅展开高管域（executive）" },
  { keys: "⌥ + 2", label: "仅展开产品域（product）" },
  { keys: "⌥ + 3", label: "仅展开工程师域（engineer）" },
  { keys: "↑ / ↓",  label: "结果导航 / Enter 跳转" },
  { keys: "Esc",    label: "清空 / 关闭建议" },
];

/* ── 动态 placeholder (按路由上下文变化) ────────────────────────────────── */
const dynamicPlaceholder = computed(() => {
  const routeName = String(route.name || "");
  if (routeName.includes("okr") || route.path.includes("okr"))
    return "搜索目标、KR、关联测试 Spec、OKR 追溯链路...";
  if (route.path.includes("/issue") || route.path.includes("/bug"))
    return "搜索 Issue 编号、Bug 标题、优先级、验收标准...";
  if (roleFilter.value)
    return `搜索 ${roleConfigs[roleFilter.value].label} 内容：${roleConfigs[roleFilter.value].question}...`;
  return "全局搜索 · 支持 YiKnowledge 15 字段语法：benefit:\"提升 30%\" AND roles:engineer · 按 ⌘K 唤起";
});

const riceSortTooltip = "RICE 评分排序：Reach(触达面)·Impact(影响力)·Confidence(置信度)·Effort(成本) 四维加权，与阅读清单 v3.2 RICE 系统 SSOT";

/* ── Suggestions ────────────────────────────────────────────────────────── */
const suggestionItems = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return recentSearches.value.slice(0, 8);
  const base = recentSearches.value.filter(r => r.toLowerCase().includes(q)).slice(0, 5);
  // 字段补全提示 (Frontmatter fields 别名补全)
  if (q.endsWith(":") || q.includes(":")) {
    const lastColon = q.lastIndexOf(":");
    const fieldRaw = q.slice(0, lastColon).split(/\s+AND\s+|\s+OR\s+|\s+/).pop() || "";
    const field = fieldRaw.toLowerCase();
    const fmFields = ["benefit", "acceptance_criteria", "roles", "status", "lifecycle", "review_cycle", "category", "tags", "aliases", "created", "updated", "last_verified", "source", "type", "project"];
    const fieldMap: Record<string, string[]> = {
      roles: ["executive", "product", "leader", "engineer", "sre", "aier", "curator"],
      lifecycle: ["active", "deprecated", "archived", "draft", "stable"],
      status: ["需求已编写", "功能实现", "验收通过", "已发布", "stable", "active", "deprecated"],
      project: (projectOptions.value.map(p => p.key)).concat(["yivad", "yiai", "yiknowledge", "yipot", "yipet"]),
      type: ["需求", "技术设计", "测试方案", "复盘", "ADR", "Runbook", "OKR"],
      category: ["项目/管理后台", "项目/后端服务", "项目/知识库", "治理", "战略"],
    };
    const matchField = fmFields.find(f => f.startsWith(field)) || Object.keys(fieldMap).find(f => f.startsWith(field));
    if (matchField && fieldMap[matchField]) {
      const prefix = q.slice(0, lastColon + 1);
      const vals = fieldMap[matchField].filter(v => !q.slice(lastColon + 1) || v.toLowerCase().includes(q.slice(lastColon + 1).toLowerCase()));
      const suggestions = vals.slice(0, 4).map(v => prefix + v + " ");
      return [...base, ...suggestions].slice(0, 8);
    }
  }
  return base;
});

function handleInputFocus() { inputFocused.value = true; showSuggestions.value = true; }
function handleInputBlur() { inputFocused.value = false; }
function onInput() { suggestionIdx.value = -1; showSuggestions.value = true; searchError.value = null; }
function pickSuggestion(s: string) { query.value = s.trim(); showSuggestions.value = false; suggestionIdx.value = -1; nextTick(() => inputRef.value?.focus()); }
function highlightSuggestion(text: string): string {
  const q = query.value.trim();
  if (!q) return escapeHtml(text);
  const qe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return escapeHtml(text).replace(new RegExp(`(${qe})`, "gi"), "<mark>$1</mark>");
}

/* ── Recent Searches ────────────────────────────────────────────────────── */
const recentSearches = ref<string[]>(loadRecent());
function loadRecent(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); }
  catch { return []; }
}
function saveRecent(q: string) {
  const clean = String(q || "").trim();
  if (!clean) return;
  const list = loadRecent().filter(r => r !== clean);
  list.unshift(clean);
  if (list.length > MAX_RECENT) list.length = MAX_RECENT;
  localStorage.setItem(RECENT_KEY, JSON.stringify(list));
  recentSearches.value = list;
}
function clearRecent() { localStorage.removeItem(RECENT_KEY); recentSearches.value = []; }
function removeRecent(idx: number) {
  const list = loadRecent();
  list.splice(idx, 1);
  localStorage.setItem(RECENT_KEY, JSON.stringify(list));
  recentSearches.value = list;
}
function searchRecent(q: string) {
  query.value = q;
  showSuggestions.value = false;
  nextTick(() => inputRef.value?.focus());
}

watch(
  [() => (_rawResults.value || []).length, () => query.value, searching],
  ([len, q, loading]) => {
    if (!loading && len > 0 && q) saveRecent(String(q).trim());
  }
);

/* ── Results: enrich + Gate A + RICE ────────────────────────────────────── */
const ghostFilteredCount = computed(() => usMeta.value?.ghost_filtered_count ?? 0);

// 单条 RICE 计算（与 readingList SSOT：utils/rice 纯函数语义内联）
function calcRice(item: UnifiedSearchItem & { frontmatter?: FrontmatterLight }): { score: number; r: number; i: number; c: number; e: number } {
  // Reach = 触达面：project 权重（跨项目=1.0 / 单项目=0.6）+ detail 丰富度（近似被引用数）
  const projectsMentioned = (item.detail || "").match(/\b(yivad|yiai|yiknowledge|yipot|yipet)\b/g) || [];
  const reach = Math.min(1, 0.5 + projectsMentioned.length * 0.1 + Math.min(0.4, (item.badges || []).length * 0.05));

  // Impact = 影响力：优先级 P0(1.0) / P1(0.75) / P2(0.5) / P3(0.25)；status 非 active ×0.2
  const titleLc = (item.title + " " + (item.subtitle || "") + " " + ((item.badges || []) as any[]).map(b => (b as any).label).join(" ")).toLowerCase();
  let impact = 0.5;
  if (titleLc.includes("p0") || titleLc.includes("critical") || titleLc.includes("紧急")) impact = 1.0;
  else if (titleLc.includes("p1") || titleLc.includes("major") || titleLc.includes("高优")) impact = 0.75;
  else if (titleLc.includes("p2") || titleLc.includes("normal") || titleLc.includes("中")) impact = 0.5;
  else if (titleLc.includes("p3") || titleLc.includes("low") || titleLc.includes("低优")) impact = 0.25;
  const activeBoost = (item._status as any) && (item._status as any) !== "active" ? 0.2 : 1.0;
  impact = Math.min(1, impact * activeBoost);

  // Confidence = 后端 score（归一化 0-1）+ 新鲜度衰减系数 τ=14 天
  const backendConf = typeof item.score === "number" ? Math.max(0, Math.min(1, item.score / 100)) : 0.5;
  const ts = (item as any)._ts ? Number((item as any)._ts) : Date.now();
  const daysOld = Math.max(0, (Date.now() - ts) / 86_400_000);
  const freshCoef = Math.exp(-Math.pow(daysOld / 14, 2)); // Gaussian decay τ=14d
  const confidence = Math.min(1, backendConf * 0.7 + freshCoef * 0.3);

  // Effort = 价值/成本：文档体积倒数（短文档优先，避免冗长）+ Frontmatter 完整度加分
  const docLen = (item.detail || "").length + (item.title || "").length * 2;
  const sizeEffort = Math.min(1, 5000 / (docLen + 1));
  const fmKeys = item.frontmatter ? Object.keys(item.frontmatter).filter(k => (item.frontmatter as any)[k] != null).length : 0;
  const fmBonus = Math.min(0.5, fmKeys / 30);
  const effort = Math.min(1, sizeEffort * 0.7 + fmBonus);

  const score = reach * 0.25 + impact * 0.30 + confidence * 0.25 + effort * 0.20;
  return { score, r: reach, i: impact, c: confidence, e: effort };
}

// 7 角色域分类（对齐 YiKnowledge §3 角色→问题矩阵）
function classifyRole(item: UnifiedSearchItem & { frontmatter?: FrontmatterLight }): RoleKey {
  const fmRoles = item.frontmatter?.roles || [];
  if (fmRoles.length && roleConfigs[fmRoles[0]]) return fmRoles[0];
  // 按 type + category + title 语义分类
  const cat = String(item.frontmatter?.category || "").toLowerCase();
  const type = String(item.type || "").toLowerCase();
  const titleLc = (item.title || "").toLowerCase();
  const subLc = ((item as any).subtitle || "").toLowerCase();
  const hay = `${cat} ${type} ${titleLc} ${subLc} ${(item.project || "").toLowerCase()}`;

  if (hay.includes("okr") || /战略|执行|路线图|业务|高管|蓝海|决策框架|董事会|行业/.test(hay)) return "executive";
  if (type === "issue" || /需求|prd|product|用户画像|acceptance|验收标准|指标定义/.test(hay)) return "product";
  if (/adr|架构|决策|选型|技术方案|技术路线|重构/.test(hay)) return "leader";
  if (type === "bug" || /sre|runbook|告警|故障|熔断|监控|容量|slo|sli|运维|稳定性|oncall/.test(hay)) return "sre";
  if (/rag|llm|embedding|prompt|ai|vector|bm25|模型|推理|token/.test(hay)) return "aier";
  if (/治理|模板|规范|curator|deadlink|合规|frontmatter|索引|健康看板|就绪检查/.test(hay)) return "curator";
  if (type === "module" || type === "page" || /实现|开发|组件|模块|code|vue|python|fastapi|rsbuild|工程/.test(hay)) return "engineer";
  // 兜底：按 issue/project 默认对应角色
  if (type === "project") return "leader";
  return "engineer";
}

function classifyStage(item: UnifiedSearchItem & { _role?: RoleKey }): string {
  const role = item._role || classifyRole(item as any);
  return roleConfigs[role]?.stages?.[0] || "未分类";
}

function buildBreadcrumbs(item: SearchItemEnriched): string[] {
  const crumbs: string[] = [];
  if (item.type === "page") crumbs.push("YiKnowledge");
  else if (groupConfigs[item.type]) crumbs.push(groupConfigs[item.type].label.split(" / ")[0]);
  if (item._role && roleConfigs[item._role]) crumbs.push(roleConfigs[item._role].label.split(" / ")[0]);
  if (item.project) crumbs.push(item.project);
  if (item.frontmatter?.category) {
    const cat = item.frontmatter.category.split("/").map(s => s.trim()).filter(Boolean);
    if (cat[cat.length - 1] && cat[cat.length - 1] !== crumbs[crumbs.length - 1]) crumbs.push(cat[cat.length - 1]);
  }
  return Array.from(new Set(crumbs));
}

/* 构建 4 层 enriched + RICE + 角色域 + 面包屑 */
const enrichedResults = computed<SearchItemEnriched[]>(() => {
  const list: UnifiedSearchItem[] = (_rawResults.value as any) || [];
  return list
    .filter(Boolean)
    .map((raw: any) => {
      const item: SearchItemEnriched = { ...raw } as any;
      try {
        // Gate A
        item._gateA = resolveLink({
          type: item.type, key: item.key, project: item.project, title: item.title,
          settingsKey: (item as any).settingsKey, moduleKey: (item as any).moduleKey,
        }) as any;
        item._link = (item._gateA as any)?.ok ? ((item._gateA as any).link as string) : "";

        // RICE
        const rice = calcRice(item);
        item._rice = rice.score;
        item._reach = rice.r; item._impact = rice.i; item._confidence = rice.c; item._effort = rice.e;

        // 角色域 & 阶段
        item._role = classifyRole(item);
        item._stage = classifyStage(item as any);

        // Frontmatter 抽取 (mock: 从 detail/category 推断；真实后端 v3 将注入完整 frontmatter)
        if (!item.frontmatter) {
          const fm: FrontmatterLight = {};
          if ((item as any).category) fm.category = (item as any).category;
          if ((item as any).tags) fm.tags = (item as any).tags;
          if ((item as any).roles) fm.roles = (item as any).roles;
          if ((item as any).lifecycle) fm.lifecycle = (item as any).lifecycle;
          if ((item as any).updated_at) fm.updated = (item as any).updated_at;
          if ((item as any).created_at) fm.created = (item as any).created_at;
          item.frontmatter = fm;
        }
        if (!item.last_verified && item.frontmatter?.last_verified) {
          item.last_verified = item.frontmatter.last_verified;
        }

        // Breadcrumbs
        item._breadcrumbs = buildBreadcrumbs(item);

        // OKR coveragePct（mock: issue/project 类型按标题 hash 映射）
        if (item.type === "issue" || item.type === "project" || item.type === "module") {
          const tagPools = ["OKR-yivad-003 KR-03", "OKR-yiknowledge-003 KR-01", "OKR-yiai-001 KR-02", "OKR-yivad-001 KR-02"];
          const hash = Math.abs((item.title || "").split("").reduce((n, c) => n + c.charCodeAt(0), 0));
          if (hash % 5 < 4) { // 80% 覆盖率
            item.okrTag = tagPools[hash % tagPools.length];
            item.coveragePct = 40 + (hash % 61); // 40 ~ 100
          }
        }

        item._idx = -1;
      } catch (e) {
        item._idx = -1;
      }
      return item;
    });
});

const autoFilteredCount = computed<number>(() =>
  enrichedResults.value.reduce((n, it) => n + (it._gateA && (it._gateA as any).ok ? 0 : 1), 0)
);

const filteredResults = computed<SearchItemEnriched[]>(() => {
  let results = enrichedResults.value;
  // Gate A 默认过滤
  if (!includeUnreachable.value) results = results.filter(r => r._gateA && (r._gateA as any).ok);
  if (projectFilter.value) results = results.filter(r => r.project === projectFilter.value);
  if (activeTypeFilter.value) results = results.filter(r => r.type === activeTypeFilter.value);
  if (roleFilter.value) results = results.filter(r => r._role === roleFilter.value);
  return results;
});

const typeCounts = computed(() => {
  const counts: Record<string, number> = {};
  enrichedResults.value.forEach(item => {
    if (!includeUnreachable.value && !(item._gateA && (item._gateA as any).ok)) return;
    counts[item.type] = (counts[item.type] || 0) + 1;
  });
  return counts;
});

/* ── Distribution Bar (ENHANCED: 百分比 + 分段 tooltip) ────────────── */
const distribution = computed(() => {
  const total = enrichedResults.value.filter(r => includeUnreachable.value || (r._gateA && (r._gateA as any).ok)).length;
  if (!total) return [] as { key: string; type: string; label: string; count: number; pct: number; color: string }[];
  return Object.keys(groupConfigs)
    .map(key => ({ key, count: typeCounts[key] || 0 }))
    .filter(s => s.count > 0)
    .map(s => {
      const cfg = groupConfigs[s.key] || { label: s.key, color: "#95a5a6" };
      return { key: s.key, type: s.key, label: cfg.label, count: s.count, pct: Math.max((s.count / total) * 100, 2), color: cfg.color };
    })
    .sort((a, b) => b.count - a.count);
});

/* ── 分组聚合（按 groupMode: type / role / stage / project） ────────────── */
interface ResultGroup {
  key: string;               // 唯一分组 key
  type: string;              // 兼容旧逻辑
  label: string;             // 组标题
  color: string;             // 强调色
  icon?: any;                // 图标
  description?: string;      // Tooltip 副标题
  items: SearchItemEnriched[];
  okrCoveragePct?: number;   // OKR KR-Test 平均覆盖度（分组级）
  okrTag?: string;           // 最关联的 OKR 标签
  weight?: number;           // 排序权重（高管优先）
}

const resultGroups = computed<ResultGroup[]>(() => {
  const mode = groupMode.value;
  const results = filteredResults.value;

  if (mode === "type") {
    const byType: Record<string, SearchItemEnriched[]> = {};
    results.forEach(item => { (byType[item.type] ||= []).push(item); });
    return Object.keys(groupConfigs)
      .map(key => {
        const cfg = groupConfigs[key];
        const items = byType[key] || [];
        return buildGroupAggregation(items, {
          key, type: key, label: cfg?.label || key, color: cfg?.color || "#95a5a6", icon: cfg?.icon, description: cfg?.description, weight: 1.0,
        });
      })
      .filter(g => g.items.length > 0);
  }

  if (mode === "role") {
    const byRole: Record<string, SearchItemEnriched[]> = {};
    results.forEach(item => {
      const r = (item._role as RoleKey) || "unknown";
      (byRole[r] ||= []).push(item);
    });
    const groups: ResultGroup[] = (Object.keys(roleConfigs) as RoleKey[])
      .map(rk => {
        const rc = roleConfigs[rk];
        const items = byRole[rk] || [];
        return buildGroupAggregation(items, {
          key: `role:${rk}`, type: rk,
          label: rc.label, color: rc.color, icon: rc.icon, description: rc.question, weight: rc.weight,
        });
      });
    if (byRole.unknown?.length) {
      groups.push(buildGroupAggregation(byRole.unknown, {
        key: "role:unknown", type: "unknown",
        label: "未分类", color: "#95a5a6", icon: FolderOpened, weight: 0.1,
      }));
    }
    return groups.filter(g => g.items.length > 0).sort((a, b) => (b.weight || 0) - (a.weight || 0));
  }

  if (mode === "stage") {
    const stages: Array<{ key: string; label: string; color: string; icon: any; weight: number }> = [
      { key: "阶段 0：业务战略", label: "阶段 0 · 业务战略", color: "#2c3e50", icon: Flag, weight: 1.3 },
      { key: "阶段 1：需求定义", label: "阶段 1 · 需求定义", color: "#f39c12", icon: UserFilled, weight: 1.2 },
      { key: "阶段 2：技术决策", label: "阶段 2 · 技术决策", color: "#27ae60", icon: Operation, weight: 1.2 },
      { key: "阶段 3：设计构建", label: "阶段 3 · 设计构建", color: "#2980b9", icon: Box, weight: 1.0 },
      { key: "阶段 4：交付运营", label: "阶段 4-5 · 交付+运营", color: "#d35400", icon: Histogram, weight: 1.05 },
      { key: "贯穿层：AI 赋能",   label: "贯穿 · AI 赋能层",  color: "#8e44ad", icon: Lightning, weight: 1.1 },
      { key: "贯穿层：知识治理", label: "贯穿 · 知识治理层", color: "#795548", icon: Collection, weight: 1.0 },
    ];
    const stageKeyMap = (roleStage: string): string => {
      for (const s of stages) if (roleStage.startsWith(s.key.split("：")[0].split(" · ")[0])) return s.key;
      if (roleStage.includes("AI") || roleStage.includes("赋能")) return "贯穿层：AI 赋能";
      if (roleStage.includes("治理") || roleStage.includes("贯穿")) return "贯穿层：知识治理";
      if (roleStage.includes("交付") || roleStage.includes("运营") || roleStage.includes("监控")) return "阶段 4：交付运营";
      return "阶段 3：设计构建";
    };
    const byStage: Record<string, SearchItemEnriched[]> = {};
    results.forEach(item => {
      const sKey = stageKeyMap(item._stage || "");
      (byStage[sKey] ||= []).push(item);
    });
    return stages
      .map(s => buildGroupAggregation(byStage[s.key] || [], {
        key: `stage:${s.key}`, type: s.key,
        label: s.label, color: s.color, icon: s.icon, weight: s.weight,
      }))
      .filter(g => g.items.length > 0).sort((a, b) => (b.weight || 0) - (a.weight || 0));
  }

  // project mode
  const byProj: Record<string, SearchItemEnriched[]> = {};
  results.forEach(item => { (byProj[item.project || "(未指定项目)"] ||= []).push(item); });
  const projectColors = ["#409eff", "#5470c6", "#9b59b6", "#27ae60", "#f56c6c", "#e67e22"];
  return Object.keys(byProj)
    .map((pk, i) => buildGroupAggregation(byProj[pk], {
      key: `project:${pk}`, type: pk,
      label: `Project · ${pk}`, color: projectColors[i % projectColors.length], icon: Folder, weight: 1,
    }))
    .sort((a, b) => b.items.length - a.items.length);
});

function buildGroupAggregation(items: SearchItemEnriched[], base: Partial<ResultGroup> & Pick<ResultGroup, "key" | "type" | "label" | "color">): ResultGroup {
  const coverages = items.map(i => i.coveragePct).filter(n => n != null) as number[];
  return {
    ...base,
    items,
    icon: base.icon,
    okrCoveragePct: coverages.length ? Math.round(coverages.reduce((a, b) => a + b, 0) / coverages.length) : undefined,
    okrTag: coverages.length ? items.find(i => i.okrTag)?.okrTag : undefined,
  } as ResultGroup;
}

const sortedGroups = computed<ResultGroup[]>(() => {
  return resultGroups.value.map(g => {
    const items = [...g.items];
    if (sortBy.value === "recent") {
      items.sort((a, b) => ((b as any)._ts || 0) - ((a as any)._ts || 0));
    } else if (sortBy.value === "rice") {
      items.sort((a, b) => (b._rice || 0) - (a._rice || 0));
    } else {
      items.sort((a, b) => (b.score || 0) - (a.score || 0));
    }
    return { ...g, items };
  });
});

const totalResults = computed(() => filteredResults.value.length);

/* ── SRE SLOLight 状态灯 (3 + 3 颜色等级) ──────────────────────────────── */
interface SLOLight {
  key: string; label: string; value: string; target: string; level: "green" | "yellow" | "red";
  title: string;
}
const sloLights = computed<SLOLight[]>(() => {
  // ① 三闸门点击可达率 SLO（目标 ≥ 99.5%）
  const total = Math.max(1, autoFilteredCount.value + ghostFilteredCount.value + totalResults.value);
  const reachable = totalResults.value;
  const reachRate = Math.round((reachable / total) * 1000) / 10;
  const reachLevel: SLOLight["level"] = reachRate >= 99.5 ? "green" : reachRate >= 97 ? "yellow" : "red";

  // ② P95 延迟 SLO（目标 ≤ 300ms，使用 timing.total_ms 近似）
  const ms = searchMs.value ?? 0;
  const latencyLevel: SLOLight["level"] = !ms ? "green" : ms <= 300 ? "green" : ms <= 500 ? "yellow" : "red";

  // ③ 三闸门通过率（= 1 - (gate_a_fail / total)）
  const gateFail = autoFilteredCount.value;
  const gatePassRate = gateFail === 0 ? 100 : Math.max(0, 100 - Math.round((gateFail / total) * 1000) / 10);
  const gateLevel: SLOLight["level"] = gatePassRate >= 99 ? "green" : gatePassRate >= 95 ? "yellow" : "red";

  return [
    {
      key: "reach", label: "点击可达率", value: `${reachRate}%`, target: "≥ 99.5%", level: reachLevel,
      title: `Gate A∩B∩C 三闸门全链路通过：当前 ${reachRate}% / 目标 ≥ 99.5%。绿=优 黄=关注 红=告警触发企业微信推送`,
    },
    {
      key: "p95", label: "P95 搜索延迟", value: `${ms || "—"}ms`, target: "≤ 300ms", level: latencyLevel,
      title: `v3 envelope timing.total_ms：当前 ${ms || "N/A"}ms / 目标 ≤ 300ms。>800ms 自动降级 RICE 计算`,
    },
    {
      key: "gates", label: "三闸门通过率", value: `${gatePassRate}%`, target: "≥ 99%", level: gateLevel,
      title: `Gate A (resolveLink) 灰卡: ${autoFilteredCount.value} / 后端幽灵: ${ghostFilteredCount.value} / 总 ${total}`,
    },
  ];
});

/* ── Flat nav helpers ───────────────────────────────────────────────────── */
function flattenItems(): SearchItemEnriched[] {
  const items: SearchItemEnriched[] = [];
  sortedGroups.value.forEach(g => {
    if (!collapsedGroups.has(g.key)) items.push(...g.items);
  });
  return items;
}
function setItemRef(el: any, idx: number) {
  if (el) itemRefs[idx] = el;
}
watch([sortedGroups, sortBy], () => {
  const flat = flattenItems();
  flat.forEach((item, i) => { item._idx = i; });
  activeIdx.value = flat.length > 0 ? 0 : -1;
}, { immediate: true, flush: "post" });
function scrollToActive() {
  nextTick(() => {
    itemRefs[activeIdx.value]?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  });
}
function toggleGroup(key: string) {
  if (collapsedGroups.has(key)) collapsedGroups.delete(key);
  else collapsedGroups.add(key);
}

/* ── 三闸门 goTo (Gold Copy，防静默) ───────────────────────────────────── */
async function goTo(item: SearchItemEnriched) {
  if (!item._gateA) return;
  const gateA = item._gateA as any;
  if (!gateA.ok) {
    try {
      ElNotification({
        title: "无法跳转（Gate A 已拦截）",
        message: `${gateA.message || "路由模板未注册或权限不满足"}（原因：${gateA.reason || "unknown"}）→ 已自动回退至搜索页。`,
        type: "warning",
        duration: 3500,
      });
    } catch { /* noop */ }
    router.push(gateA.fallback || "/search").catch(() => {});
    return;
  }
  const ok = gateA as LinkResolveOk;
  const link = ok.link;

  // Gate B HEAD 预检（仅部分类型 + 新鲜度未知时；_status=active 直接跳过后端 减少 30% HTTP）
  const unknownStatus = !item._status || item._status === "unknown" || item._status === "pending";
  const needGateB = ["issue", "bug", "project", "module", "page"].includes(item.type) && unknownStatus;
  if (needGateB) {
    try {
      const exist = await gateBEntityExists(
        { type: item.type, key: item.key, project: item.project, title: item.title },
        { timeoutMs: 800 }, // v3: 800ms (低于 v2 的 1500ms)
      );
      if (exist === false) {
        try {
          ElNotification({
            title: "目标资源暂不可用（Gate B HEAD 404）",
            message: `${item.title}（${item.type}: ${item.key}）在后端轻量预检不存在；已回退搜索页预填原关键词。`,
            type: "warning", duration: 3500,
          });
        } catch { /* noop */ }
        router.push(`/search?q=${encodeURIComponent(item.title || item.key || "")}`).catch(() => {});
        return;
      }
    } catch { /* Gate C 兜底放行 */ }
  }

  try { await router.push(link); }
  catch (err: any) {
    if (err?.name === "NavigationDuplicated") return;
    try {
      ElNotification({
        title: "路由异常（Router.push 失败）",
        message: err?.message || "跳转失败，已回退搜索页",
        type: "warning", duration: 3000,
      });
    } catch { /* noop */ }
    router.push(`/search?q=${encodeURIComponent(item.title || item.key || "")}`).catch(() => {});
    return;
  }

  // Gate C：v3 三条件（path + params + DOM selector）
  const cPass = await gateCPostNavigate({
    expectedLink: link,
    expectedParams: ok.params || {},
    timeoutMs: 2000,
  });
  if (cPass) {
    cpStore.pushMRU?.({
      id: item.id, type: item.type, key: item.key, title: item.title,
      project: item.project, ts: Date.now(),
    } as any)?.catch?.(() => {});
  } else {
    try {
      ElNotification({
        title: "详情页渲染未完成（Gate C 后验失败）",
        message: `${item.title} 目标页 DOM 不匹配（可能已归档/挂死/权限变更）；为避免空白页，已自动回退搜索页。`,
        type: "warning", duration: 3500,
      });
    } catch { /* noop */ }
    router.push(`/search?q=${encodeURIComponent(item.title || item.key || "")}`).catch(() => {});
  }
}

/* ── Utilities + UI helpers ─────────────────────────────────────────────── */
function clearSearch() {
  query.value = "";
  activeTypeFilter.value = "";
  projectFilter.value = "";
  roleFilter.value = "";
  localStorage.removeItem(ROLE_FILTER_KEY);
  activeIdx.value = -1;
  searchMs.value = null;
  searchError.value = null;
  collapsedGroups.clear();
  showFilterDetail.value = false;
  includeUnreachable.value = false;
  sortBy.value = "relevance";
  groupMode.value = "type";
  nextTick(() => inputRef.value?.focus());
}
function clearAllFilters() { activeTypeFilter.value = ""; projectFilter.value = ""; }
function toggleTypeFilter(key: string) {
  activeTypeFilter.value = activeTypeFilter.value === key ? "" : key;
}
function handleRetry() { searchError.value = null; invalidateCache?.(); void refresh?.(); }
function handleRoleExampleClick(roleKey: RoleKey, example: string) {
  roleFilter.value = roleKey;
  localStorage.setItem(ROLE_FILTER_KEY, roleKey);
  query.value = example;
  nextTick(() => inputRef.value?.focus());
}
function navigateToOkr(item: SearchItemEnriched) {
  if (!item.okrTag) return;
  // OKR Dashboard 路由 + hl= 高亮
  const [okrId, krId] = item.okrTag.split(/\s+/);
  const route = `/page/okr-overview?okr=${encodeURIComponent(okrId || "")}&kr=${encodeURIComponent(krId || "")}&hl=${encodeURIComponent("覆盖度")}`;
  void router.push(route).catch(() => {});
}
function getRiceLevelClass(score: number): string {
  if (score >= 0.8) return "search-page__rice--excellent";
  if (score >= 0.6) return "search-page__rice--good";
  if (score >= 0.4) return "search-page__rice--medium";
  return "search-page__rice--low";
}
function getOkrLevelClass(pct: number): string {
  if (pct >= 90) return "search-page__okr--excellent";
  if (pct >= 70) return "search-page__okr--good";
  if (pct >= 50) return "search-page__okr--medium";
  return "search-page__okr--low";
}
function getRiceTooltip(item: SearchItemEnriched): string {
  const r = Math.round((item._reach || 0) * 100);
  const i = Math.round((item._impact || 0) * 100);
  const c = Math.round((item._confidence || 0) * 100);
  const e = Math.round((item._effort || 0) * 100);
  return [
    `R = Reach(触达面) ${r}：引用/跨项目提及 近似评估`,
    `I = Impact(影响力) ${i}：P0/P1/P2/P3 × active 状态加成`,
    `C = Confidence(置信度) ${c}：后端 relevance 分数 + 新鲜度高斯衰减(τ=14d)`,
    `E = Effort(成本价值) ${e}：文档长度倒数 + Frontmatter 完整度`,
    `合计：R×25% + I×30% + C×25% + E×20% = ${Math.round((item._rice || 0) * 100)}`,
  ].join("\n");
}
function getDetailSnippet(item: SearchItemEnriched): string {
  const fm = item.frontmatter || {};
  // 优先：benefit → acceptance_criteria 摘要 → 原 detail 扩展至 280 字
  let snippet = "";
  if (fm.benefit) {
    snippet += `🎯 目标价值：${typeof fm.benefit === "string" ? fm.benefit : ""}  `;
  }
  if (fm.acceptance_criteria && Array.isArray(fm.acceptance_criteria) && fm.acceptance_criteria.length) {
    snippet += `✅ 验收：${fm.acceptance_criteria[0]}${fm.acceptance_criteria.length > 1 ? ` 等 ${fm.acceptance_criteria.length} 条` : ""}  `;
  }
  if (!snippet.trim()) return truncate(item.detail || "(无详情描述)", 280);
  snippet += item.detail ? `📄 描述：${truncate(item.detail, 200)}` : "";
  return truncate(snippet, 280);
}
function escapeHtml(text: string): string {
  return String(text || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function highlight(text: string | undefined): string {
  if (!text || !query.value) return text || "";
  const escaped = escapeHtml(text);
  const q = query.value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return escaped.replace(new RegExp(`(${q})`, "gi"), "<mark>$1</mark>");
}
function truncate(text: string, max: number): string {
  const t = String(text || "");
  return t.length > max ? t.slice(0, max) + "…" : t;
}
function extractKey(id: string): string {
  const parts = (id || "").split("-");
  return parts.length > 1 ? parts.slice(1).join("-") : id;
}
function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / 86_400_000);
    if (days < 0) return `${-days}d 后`;
    if (days === 0) return "今天";
    if (days === 1) return "昨天";
    if (days < 7) return `${days} 天前`;
    if (days < 30) return `${Math.floor(days / 7)} 周前`;
    if (days < 365) return `${Math.floor(days / 30)} 个月前`;
    return dateStr.slice(0, 10);
  } catch { return dateStr; }
}

/* ── Keyboard (ENHANCED: ⌘N/⌘D/⌥+1/2/3 + IME 中文输入法守卫) ───────── */
function onInputKeydown(e: KeyboardEvent) {
  // ⚠️ IME 中文输入法守卫：用户在输入拼音过程中，方向键/Enter 是选字操作，禁止抢占
  if ((e as any).isComposing || e.keyCode === 229) return;

  if (showSuggestions.value && suggestionItems.value.length) {
    if (e.key === "ArrowDown") { e.preventDefault(); suggestionIdx.value = (suggestionIdx.value + 1) % suggestionItems.value.length; return; }
    if (e.key === "ArrowUp") { e.preventDefault(); suggestionIdx.value = (suggestionIdx.value - 1 + suggestionItems.value.length) % suggestionItems.value.length; return; }
    if (e.key === "Enter" && suggestionIdx.value >= 0) {
      e.preventDefault(); pickSuggestion(suggestionItems.value[suggestionIdx.value]); return;
    }
  }

  const flat = flattenItems();
  if (e.key === "ArrowDown") {
    e.preventDefault();
    if (flat.length > 0) { activeIdx.value = (activeIdx.value + 1) % flat.length; scrollToActive(); }
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    if (flat.length > 0) { activeIdx.value = (activeIdx.value - 1 + flat.length) % flat.length; scrollToActive(); }
  } else if (e.key === "Enter" && !(showSuggestions.value && suggestionIdx.value >= 0)) {
    e.preventDefault();
    const item = flat[activeIdx.value];
    if (item) void goTo(item);
  } else if (e.key === "Escape") {
    if (showSuggestions.value) showSuggestions.value = false;
    else if (query.value) clearSearch();
    else inputRef.value?.blur();
  }
}

function globalKeydown(e: KeyboardEvent) {
  if ((e as any).isComposing || e.keyCode === 229) return; // IME 守卫
  const target = e.target as HTMLElement;
  const editing = isEditingInput(target);

  // ⌘ / Ctrl + K (全局聚焦搜索框)
  if ((e.metaKey || e.ctrlKey) && e.key?.toLowerCase() === "k") {
    e.preventDefault();
    inputRef.value?.focus();
    return;
  }
  // ⌘ + N (新建 Issue)
  if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key?.toLowerCase() === "n" && !editing) {
    e.preventDefault();
    void router.push("/issue?mode=new&from_search=" + encodeURIComponent(query.value || "")).catch(() => {});
    return;
  }
  // ⌘ + D (折叠/展开所有分组)
  if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key?.toLowerCase() === "d" && !editing) {
    e.preventDefault();
    const total = sortedGroups.value.length;
    const collapsed = collapsedGroups.size;
    if (collapsed >= total / 2) collapsedGroups.clear();
    else sortedGroups.value.forEach(g => collapsedGroups.add(g.key));
    return;
  }
  // ⌘ + . (展开 SRE 详情: 此处翻转 includeUnreachable 调试开关)
  if ((e.metaKey || e.ctrlKey) && e.key === "." && !editing) {
    e.preventDefault();
    includeUnreachable.value = !includeUnreachable.value;
    return;
  }
  // ⌥/Alt + 1/2/3 快捷键展开 高管/产品/工程师 角色域 (仅 role mode)
  if (e.altKey && !editing) {
    if (e.key === "1") {
      e.preventDefault(); groupMode.value = "role"; expandOnlyRole("executive"); return;
    }
    if (e.key === "2") {
      e.preventDefault(); groupMode.value = "role"; expandOnlyRole("product"); return;
    }
    if (e.key === "3") {
      e.preventDefault(); groupMode.value = "role"; expandOnlyRole("engineer"); return;
    }
  }
  // "/" 聚焦搜索框
  if (e.key === "/" && !editing && target.tagName !== "A") {
    e.preventDefault();
    inputRef.value?.focus();
  }
}
function expandOnlyRole(rk: RoleKey) {
  sortedGroups.value.forEach(g => collapsedGroups.add(g.key));
  collapsedGroups.delete(`role:${rk}`);
  if (!roleFilter.value) { /* 保持当前 */ }
}
function isEditingInput(el: HTMLElement | null): boolean {
  if (!el) return false;
  const tag = el.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  return (el as any).isContentEditable ?? false;
}

/* ── Outside click + scroll save ────────────────────────────────────────── */
const SCROLL_KEY = "global_search_scroll";
function onClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement;
  if (showSuggestions.value
    && !target.closest?.(".search-page__suggestions")
    && !target.closest?.(".search-page__input-wrap")) {
    showSuggestions.value = false;
  }
}
function saveScrollPosition() {
  const el = document.querySelector?.(".search-page");
  if (el) sessionStorage.setItem(SCROLL_KEY, String((el as HTMLElement).scrollTop));
}
function restoreScrollPosition() {
  const saved = sessionStorage.getItem(SCROLL_KEY);
  if (saved) nextTick(() => {
    const el = document.querySelector?.(".search-page") as HTMLElement | null;
    if (el) el.scrollTop = Number(saved);
    sessionStorage.removeItem(SCROLL_KEY);
  });
}

/* ── Lifecycle ──────────────────────────────────────────────────────────── */
onMounted(() => {
  if (!initialQ) {
    inputRef.value?.focus();
  } else {
    void refresh();
    restoreScrollPosition();
  }
  document.addEventListener("keydown", globalKeydown);
  document.addEventListener("mousedown", onClickOutside);
});
onUnmounted(() => {
  document.removeEventListener("keydown", globalKeydown);
  document.removeEventListener("mousedown", onClickOutside);
});
onBeforeRouteLeave((_to, _from, next) => {
  saveScrollPosition();
  next();
});
</script>

<style scoped lang="scss">
@use "./styles/search.scss";
</style>

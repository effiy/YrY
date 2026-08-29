<template>
  <div class="page-list" :class="{ 'page-list--embedded': !!props.projectKey }">
    <!-- Header Card -->
    <div v-if="!props.projectKey" class="page-list__header">
      <div class="page-list__header-icon">
        <el-icon><Document /></el-icon>
      </div>
      <div class="page-list__header-text">
        <h2 class="page-list__header-title">Pages</h2>
        <p class="page-list__header-desc">Wiki-style documentation pages</p>
      </div>
      <div class="page-list__header-pills">
        <div class="page-list__header-pill">
          <span class="page-list__header-pill-val">{{ store.total }}</span>
          <span class="page-list__header-pill-lbl">Total</span>
        </div>
        <div class="page-list__header-pill">
          <span class="page-list__header-pill-val">{{ topLevelCount }}</span>
          <span class="page-list__header-pill-lbl">Top-level</span>
        </div>
        <div class="page-list__header-pill">
          <span class="page-list__header-pill-val">{{ subPageCount }}</span>
          <span class="page-list__header-pill-lbl">Sub-pages</span>
        </div>
        <div class="page-list__header-pill page-list__header-pill--accent">
          <span class="page-list__header-pill-val">{{ contentSize }}</span>
          <span class="page-list__header-pill-lbl">Content</span>
        </div>
      </div>
      <div v-if="!props.filterDate" class="page-list__header-right">
        <HeroDateNav
          :filter-date="filterDate"
          :label="filterDateLabel"
          :is-today="isFilterToday"
          @prev="goToPrevDay"
          @next="goToNextDay"
          @today="goToFilterToday"
          @clear="clearFilterDate"
        />
      </div>
    </div>

    <!-- Charts -->
    <div v-if="!props.projectKey" class="page-list__charts">
      <div class="page-chart">
        <div class="page-chart__title">Content Size</div>
        <div class="page-chart__body">
          <ECharts :option="sizeBarOption" height="200" />
        </div>
      </div>
      <div class="page-chart">
        <div class="page-chart__title">Depth Distribution</div>
        <div class="page-chart__body">
          <ECharts :option="depthDonutOption" height="200" />
        </div>
      </div>
      <div class="page-chart">
        <div class="page-chart__title">Created · 14d</div>
        <div class="page-chart__body">
          <ECharts :option="trendOption" height="200" />
        </div>
      </div>
    </div>

    <!-- Recently Viewed -->
    <div v-if="!props.projectKey && recentlyViewed.length" class="page-list__recent">
      <span class="page-list__recent-label">Recently viewed</span>
      <button v-for="p in recentlyViewed" :key="p.key" type="button" class="page-list__recent-chip" :title="p.title" @click="openPreview(p)">
        <el-icon><Document /></el-icon>
        <span class="page-list__recent-key">{{ p.key }}</span>
        <span class="page-list__recent-name">{{ p.title }}</span>
      </button>
      <button type="button" class="page-list__recent-clear" @click="recentlyViewed = []">✕</button>
    </div>

    <!-- Active Filter Pills -->
    <div v-if="activePills.length" class="page-list__pills">
      <span class="page-list__pills-label">Filters</span>
      <el-tag v-for="p in activePills" :key="p.id" closable size="small" @close="p.clear()">{{ p.label }}</el-tag>
      <el-button size="small" text type="primary" @click="clearAllFilters">Clear all</el-button>
    </div>

    <!-- Body -->
    <div class="page-list__body" :class="{ 'page-list__body--embedded': !!props.projectKey }">
      <div v-if="!props.projectKey" class="page-list__sidebar">
        <div class="page-list__sidebar-view">
          <el-radio-group v-model="viewMode" size="small">
            <el-radio-button value="table"><el-icon><Grid /></el-icon></el-radio-button>
            <el-radio-button value="card"><el-icon><Postcard /></el-icon></el-radio-button>
            <el-radio-button value="list"><el-icon><List /></el-icon></el-radio-button>
          </el-radio-group>
        </div>
        <div class="page-list__sidebar-section">
          <div class="page-list__sidebar-section-header">
            <span class="page-list__sidebar-section-label">Overview</span>
          </div>
          <div class="page-list__sidebar-section-body">
            <div class="page-list__sidebar-card" @click="router.push('/page')">
              <div class="page-list__sidebar-card-icon" style="background:linear-gradient(135deg,#5470c6,#4460b0)"><el-icon><Document /></el-icon></div>
              <div class="page-list__sidebar-card-info">
                <span class="page-list__sidebar-card-value">{{ store.total }}</span>
                <span class="page-list__sidebar-card-label">Total</span>
              </div>
            </div>
            <div class="page-list__sidebar-card" @click="sortBy = sortBy === 'title' ? 'order' : 'title'">
              <div class="page-list__sidebar-card-icon" style="background:linear-gradient(135deg,#91cc75,#7ab85e)"><el-icon><Folder /></el-icon></div>
              <div class="page-list__sidebar-card-info">
                <span class="page-list__sidebar-card-value">{{ topLevelCount }}</span>
                <span class="page-list__sidebar-card-label">Top-level</span>
              </div>
            </div>
            <div class="page-list__sidebar-card">
              <div class="page-list__sidebar-card-icon" style="background:linear-gradient(135deg,#9a60b4,#7a40a0)"><el-icon><Collection /></el-icon></div>
              <div class="page-list__sidebar-card-info">
                <span class="page-list__sidebar-card-value">{{ subPageCount }}</span>
                <span class="page-list__sidebar-card-label">Sub-pages</span>
              </div>
            </div>
          </div>
          <div class="page-list__sidebar-progress">
            <span class="page-list__sidebar-progress-label">Content</span>
            <span class="page-list__sidebar-progress-hint">{{ avgContentSize }} avg</span>
          </div>
        </div>
        <div class="page-list__sidebar-section" style="margin-top:12px">
          <div class="page-list__sidebar-section-header" style="border-left-color: var(--el-color-danger);">
            <span class="page-list__sidebar-section-label">Needs Attention</span>
          </div>
          <div class="page-list__sidebar-section-body">
            <div class="page-list__sidebar-card page-list__sidebar-card--empty" :class="{ 'is-active': contentFilter === 'empty' }" @click="contentFilter = contentFilter === 'empty' ? '' : 'empty'">
              <el-icon class="page-list__sidebar-card-accent-icon"><Document /></el-icon>
              <span class="page-list__sidebar-card-accent-value">{{ attention.empty }}</span>
              <span class="page-list__sidebar-card-accent-label">No Content</span>
            </div>
            <div class="page-list__sidebar-card page-list__sidebar-card--stale" :class="{ 'is-active': contentFilter === 'stale' }" @click="contentFilter = contentFilter === 'stale' ? '' : 'stale'">
              <el-icon class="page-list__sidebar-card-accent-icon"><Clock /></el-icon>
              <span class="page-list__sidebar-card-accent-value">{{ attention.stale }}</span>
              <span class="page-list__sidebar-card-accent-label">Stale &gt;30d</span>
            </div>
          </div>
        </div>
        <div class="page-list__sidebar-section" style="margin-top:12px">
          <div class="page-list__sidebar-section-header" style="border-left-color: var(--el-color-success);">
            <span class="page-list__sidebar-section-label">Data Quality</span>
            <span class="page-list__sidebar-section-hint">{{ store.pages.length }} pages</span>
          </div>
          <div class="page-list__sidebar-section-body">
            <div v-for="c in completeness" :key="c.key" class="page-list__sidebar-quality">
              <div class="page-list__sidebar-quality-head">
                <span class="page-list__sidebar-quality-label">{{ c.label }}</span>
                <span class="page-list__sidebar-quality-pct" :style="{ color: qualityBarColor(c.pct) }">{{ c.pct }}%</span>
              </div>
              <el-progress :percentage="c.pct" :stroke-width="4" :show-text="false" :color="qualityBarColor(c.pct)" />
            </div>
          </div>
        </div>
      </div>

      <!-- Embedded mode sidebar: tag filters + doc stats -->
      <div v-if="props.projectKey" class="page-list__sidebar page-list__sidebar--embedded">
        <div class="page-list__sidebar-view">
          <el-radio-group v-model="viewMode" size="small">
            <el-radio-button value="table"><el-icon><Grid /></el-icon></el-radio-button>
            <el-radio-button value="card"><el-icon><Postcard /></el-icon></el-radio-button>
            <el-radio-button value="list"><el-icon><List /></el-icon></el-radio-button>
          </el-radio-group>
        </div>
        <div class="page-list__sidebar-section">
          <div class="page-list__sidebar-section-header">
            <span class="page-list__sidebar-section-label">Documentation</span>
          </div>
          <div class="page-list__sidebar-section-body">
            <div class="page-list__sidebar-card">
              <div class="page-list__sidebar-card-icon" style="background:linear-gradient(135deg,#5470c6,#4460b0)"><el-icon><Document /></el-icon></div>
              <div class="page-list__sidebar-card-info">
                <span class="page-list__sidebar-card-value">{{ store.total }}</span>
                <span class="page-list__sidebar-card-label">Total docs</span>
              </div>
            </div>
            <div class="page-list__sidebar-card">
              <div class="page-list__sidebar-card-icon" style="background:linear-gradient(135deg,#20c997,#1a8a6e)"><el-icon><Clock /></el-icon></div>
              <div class="page-list__sidebar-card-info">
                <span class="page-list__sidebar-card-value">{{ totalReadingTime }}</span>
                <span class="page-list__sidebar-card-label">Min read</span>
              </div>
            </div>
            <div class="page-list__sidebar-card">
              <div class="page-list__sidebar-card-icon" style="background:linear-gradient(135deg,#e6a23c,#c98e1f)"><el-icon><Collection /></el-icon></div>
              <div class="page-list__sidebar-card-info">
                <span class="page-list__sidebar-card-value">{{ totalChars }}</span>
                <span class="page-list__sidebar-card-label">Total chars</span>
              </div>
            </div>
          </div>
        </div>

        <div class="page-list__sidebar-section" style="margin-top:12px">
          <div class="page-list__sidebar-section-header" style="border-left-color: var(--el-color-warning);">
            <span class="page-list__sidebar-section-label">Categories</span>
            <span v-if="tagFilter" class="page-list__sidebar-section-hint page-list__sidebar-section-hint--clear" @click="tagFilter = ''">Clear</span>
          </div>
          <div class="page-list__sidebar-section-body">
            <div class="page-list__tag-chips">
              <button
                v-for="t in tagStats"
                :key="t.tag"
                type="button"
                class="page-list__tag-chip"
                :class="{ 'is-active': tagFilter === t.tag }"
                :style="tagFilter === t.tag ? { background: t.color, color: '#fff', borderColor: t.color } : { color: t.color, borderColor: t.color }"
                @click="tagFilter = tagFilter === t.tag ? '' : t.tag"
              >
                <span class="page-list__tag-chip-dot" :style="{ background: t.color }" />
                {{ t.label }}
                <span class="page-list__tag-chip-count">{{ t.count }}</span>
              </button>
              <div v-if="!tagStats.length" class="page-list__tag-empty">No categories</div>
            </div>
          </div>
        </div>

        <div class="page-list__sidebar-section" style="margin-top:12px">
          <div class="page-list__sidebar-section-header" style="border-left-color: var(--el-color-danger);">
            <span class="page-list__sidebar-section-label">Content Quality</span>
          </div>
          <div class="page-list__sidebar-section-body">
            <div class="page-list__sidebar-card page-list__sidebar-card--empty" :class="{ 'is-active': contentFilter === 'empty' }" @click="contentFilter = contentFilter === 'empty' ? '' : 'empty'">
              <el-icon class="page-list__sidebar-card-accent-icon"><Document /></el-icon>
              <span class="page-list__sidebar-card-accent-value">{{ attention.empty }}</span>
              <span class="page-list__sidebar-card-accent-label">No Content</span>
            </div>
            <div class="page-list__sidebar-quality">
              <div class="page-list__sidebar-quality-head">
                <span class="page-list__sidebar-quality-label">Has content</span>
                <span class="page-list__sidebar-quality-pct" :style="{ color: qualityBarColor(completeness[0]?.pct || 0) }">{{ completeness[0]?.pct || 0 }}%</span>
              </div>
              <el-progress :percentage="completeness[0]?.pct || 0" :stroke-width="4" :show-text="false" :color="qualityBarColor(completeness[0]?.pct || 0)" />
            </div>
          </div>
        </div>
      </div>

      <div class="page-list__main">
        <div class="page-list__head">
          <div class="page-list__head-left">
            <span class="page-list__head-count">{{ countLabel }}</span>
          </div>
          <div class="page-list__head-actions">
            <template v-if="!props.projectKey">
              <el-input v-model="searchText" class="page-list__search" size="small" clearable placeholder="Search pages…" :prefix-icon="Search" />
              <el-select v-model="sortBy" class="page-list__sort" size="small">
                <el-option label="Order" value="order" />
                <el-option label="Title" value="title" />
                <el-option label="Recently updated" value="updated" />
                <el-option label="Content size" value="size" />
              </el-select>
              <el-select v-model="projectFilter" placeholder="Project" clearable class="page-list__project" size="small" @change="loadData">
                <el-option v-for="p in projects" :key="p.key" :label="p.name" :value="p.key" />
              </el-select>
            </template>
            <template v-if="props.projectKey">
              <el-input v-model="searchText" class="page-list__search" size="small" clearable placeholder="Search docs…" :prefix-icon="Search" />
              <el-select v-model="sortBy" size="small" style="width:130px">
                <el-option label="Order" value="order" />
                <el-option label="Title" value="title" />
                <el-option label="Recently updated" value="updated" />
              </el-select>
              <el-button size="small" :icon="Upload" :loading="seeding" @click="seedDocs">Import docs</el-button>
            </template>
            <el-button type="primary" :icon="Plus" @click="openCreate">New Page</el-button>
          </div>
        </div>

        <div v-loading="store.loading" class="page-list__grid" :class="{ 'page-list__grid--non-card': viewMode !== 'card' }">
          <!-- Table View -->
          <template v-if="viewMode === 'table'">
            <el-table :data="displayedPages" stripe style="width:100%" @row-click="(row: any) => openPreview(row)">
              <el-table-column prop="title" label="Title" min-width="220" sortable>
                <template #default="{ row }: { row: any }">
                  <span class="page-table__name">{{ row.title }}</span>
                </template>
              </el-table-column>
              <el-table-column label="Category" width="110">
                <template #default="{ row }: { row: any }">
                  <span
                    v-if="extractTag(row.content)"
                    class="page-table__tag"
                    :style="{ background: tagColor(extractTag(row.content)), color: '#fff' }"
                  >{{ tagLabel(extractTag(row.content)) }}</span>
                  <span v-else class="page-list__muted">—</span>
                </template>
              </el-table-column>
              <el-table-column label="Content" width="100">
                <template #default="{ row }: { row: any }">
                  <span v-if="row.content" class="page-table__content-info">{{ contentStats(row).chars }}c</span>
                  <span v-else class="page-table__content-info page-table__content-info--empty">Empty</span>
                </template>
              </el-table-column>
              <el-table-column label="Reading" width="100">
                <template #default="{ row }: { row: any }">
                  <span class="page-table__reading">{{ readingTime(row.content) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="Updated" width="140">
                <template #default="{ row }: { row: any }">
                  <span class="page-table__updated">{{ row.updated_at ? formatRelativeTime(row.updated_at) : 'Never' }}</span>
                </template>
              </el-table-column>
              <el-table-column label="Actions" width="190" fixed="right">
                <template #default="{ row }: { row: any }">
                  <el-button link size="small" type="primary" @click.stop="openPreview(row)">Read</el-button>
                  <el-button link size="small" @click.stop="openEdit(row)">Edit</el-button>
                  <el-button link size="small" type="danger" @click.stop="handleDelete(row)">Delete</el-button>
                </template>
              </el-table-column>
            </el-table>
          </template>

          <!-- Card View -->
          <template v-else-if="viewMode === 'card'">
            <el-card
              v-for="page in displayedPages"
              :key="page.key"
              class="page-card"
              shadow="hover"
              @click="openPreview(page)"
            >
              <div class="page-card__status-bar" :style="{ background: props.projectKey ? (tagColor(extractTag(page.content)) || '#409eff') : (page.content ? '#67c23a' : '#c0c4cc') }" />
              <div class="page-card__body">
                <!-- Embedded mode: doc-style card -->
                <template v-if="props.projectKey">
                  <div class="page-card__top">
                    <span class="page-card__name">{{ page.title }}</span>
                    <span
                      v-if="extractTag(page.content)"
                      class="page-card__tag"
                      :style="{ background: tagColor(extractTag(page.content)), color: '#fff' }"
                    >{{ tagLabel(extractTag(page.content)) }}</span>
                  </div>
                  <div class="page-card__doc-meta">
                    <el-icon><Clock /></el-icon>
                    <span>{{ readingTime(page.content) }}</span>
                    <span class="page-card__doc-meta-sep">·</span>
                    <span>{{ contentStats(page).chars }} chars</span>
                  </div>
                  <div v-if="page.content" class="page-card__snippet page-card__snippet--doc">{{ contentSnippet(page) }}</div>
                  <div v-else class="page-card__snippet page-card__snippet--empty">No content yet — click to add documentation</div>
                  <div class="page-card__footer page-card__footer--doc">
                    <span v-if="page.updated_at" class="page-card__footer-date">Updated {{ formatRelativeTime(page.updated_at) }}</span>
                    <span v-else class="page-card__footer-date">Never updated</span>
                    <div class="page-card__actions">
                      <el-button link size="small" type="primary" @click.stop="openPreview(page)">Read</el-button>
                      <el-button link size="small" @click.stop="openEdit(page)">Edit</el-button>
                      <el-button link size="small" type="danger" @click.stop="handleDelete(page)">Delete</el-button>
                    </div>
                  </div>
                </template>

                <!-- Standalone mode: original card -->
                <template v-else>
                  <div class="page-card__top">
                    <span class="page-card__name">{{ page.title }}</span>
                    <el-tag size="small" :type="page.content ? 'success' : 'info'">{{ page.content ? 'Has content' : 'Empty' }}</el-tag>
                  </div>

                  <div class="page-card__head">
                    <code class="page-card__key">{{ page.key }}</code>
                    <span class="page-card__order">#{{ page.order }}</span>
                    <span v-if="page.parent_key" class="page-card__parent-badge">
                      <el-icon><Collection /></el-icon>{{ parentTitle(page.parent_key) }}
                    </span>
                  </div>

                  <button
                    v-if="!props.projectKey && page.project_key"
                    type="button"
                    class="page-card__project"
                    @click.stop="goProject(page.project_key)"
                  >
                    <el-icon><Folder /></el-icon>
                    <span>{{ projectName(page.project_key) }}</span>
                  </button>

                  <div v-if="page.content" class="page-card__snippet">{{ contentSnippet(page) }}</div>

                  <div v-if="childrenOf(page.key).length" class="page-card__sub-list">
                    <div
                      v-for="child in childrenOf(page.key)"
                      :key="child.key"
                      class="page-card__sub-row"
                      @click.stop="openPreview(child)"
                    >
                      <span class="page-card__sub-dot" :style="{ background: child.content ? '#67c23a' : '#c0c4cc' }" />
                      <span class="page-card__sub-key">{{ child.key }}</span>
                      <span class="page-card__sub-title">{{ child.title }}</span>
                      <span class="page-card__sub-size">{{ contentStats(child).chars }}c</span>
                    </div>
                  </div>

                  <div class="page-card__meta">
                    <span class="page-card__time" :class="page.updated_at ? 'page-card__time--ok' : 'page-card__time--upcoming'">
                      {{ page.updated_at ? formatRelativeTime(page.updated_at) : 'Never updated' }}
                    </span>
                    <span class="page-card__stats">{{ contentStats(page).chars }} chars{{ childCount(page.key) ? ` · ${childCount(page.key)} sub` : '' }}</span>
                  </div>

                  <div class="page-card__footer">
                    <div class="page-card__footer-left">
                      <span class="page-card__footer-stat">{{ childCount(page.key) ? `${childCount(page.key)} sub-pages` : `${contentStats(page).chars} chars` }}</span>
                      <span v-if="page.updated_at" class="page-card__footer-date">Updated {{ formatRelativeTime(page.updated_at) }}</span>
                    </div>
                    <div class="page-card__actions">
                      <el-button link size="small" type="primary" @click.stop="openPreview(page)">Open</el-button>
                      <el-button link size="small" @click.stop="openEdit(page)">Edit</el-button>
                      <el-button link size="small" type="danger" @click.stop="handleDelete(page)">Delete</el-button>
                    </div>
                  </div>
                </template>
              </div>
            </el-card>
          </template>

          <!-- List View -->
          <template v-else>
            <div class="page-list-view">
              <div
                v-for="page in displayedPages"
                :key="page.key"
                class="page-list-view__row"
                @click="openPreview(page)"
              >
                <span class="page-list-view__dot" :style="{ background: page.content ? '#67c23a' : '#c0c4cc' }" />
                <span class="page-list-view__title">{{ page.title }}</span>
                <span
                  v-if="extractTag(page.content)"
                  class="page-list-view__tag"
                  :style="{ background: tagColor(extractTag(page.content)), color: '#fff' }"
                >{{ tagLabel(extractTag(page.content)) }}</span>
                <span class="page-list-view__chars">{{ contentStats(page).chars }}c</span>
                <span class="page-list-view__reading">{{ readingTime(page.content) }}</span>
                <span class="page-list-view__updated">{{ page.updated_at ? formatRelativeTime(page.updated_at) : 'Never' }}</span>
              </div>
            </div>
          </template>

          <div v-if="!store.loading && !store.pages.length" class="page-list__empty">
            <el-empty :description="props.projectKey ? 'No documentation yet' : 'No pages yet'">
              <template v-if="props.projectKey">
                <el-button type="primary" @click="seedDocs">Import docs</el-button>
                <el-button @click="openCreate">Create page</el-button>
              </template>
              <el-button v-else type="primary" @click="openCreate">Create your first page</el-button>
            </el-empty>
          </div>
          <div v-else-if="!store.loading && store.pages.length && !displayedPages.length" class="page-list__empty">
            <el-empty description="No matching pages" />
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Dialog -->
    <el-dialog v-model="dialog.visible" :title="dialog.isEdit ? 'Edit Page' : 'New Page'" width="720px" destroy-on-close>
      <el-form ref="formRef" :model="dialog.form" :rules="rules" label-width="80px">
        <el-form-item label="Title" prop="title">
          <el-input v-model="dialog.form.title" placeholder="Page title" maxlength="200" />
        </el-form-item>
        <el-form-item label="Content" prop="content">
          <el-input v-model="dialog.form.content" type="textarea" :rows="12" placeholder="Markdown content" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="Parent">
              <el-select v-model="dialog.form.parent_key" style="width: 100%" clearable placeholder="None (top-level)">
                <el-option v-for="p in store.pages.filter(p => p.key !== dialog.editKey)" :key="p.key" :label="p.title" :value="p.key" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Order">
              <el-input-number v-model="dialog.form.order" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item v-if="!props.projectKey" label="Project">
          <el-input v-model="dialog.form.project_key" placeholder="Project key" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog.visible = false">Cancel</el-button>
        <el-button type="primary" :loading="dialog.submitting" @click="submit">Save</el-button>
      </template>
    </el-dialog>

    <KnowledgePreviewDialog ref="previewDlgRef" />
  </div>
</template>

<script setup lang="ts" name="pageList">
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { Plus, Document, Edit, Delete, Search, Folder, Collection, Upload, Clock, Grid, Postcard, List } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import { usePageStore } from "@/stores/modules/page";
import { getProjectList } from "@/api/modules/projectService";
import type { Project } from "@/api/modules/projectService";
import type { Page } from "@/api/modules/pageService";
import { yivadDocs } from "@/views/project/seed/yivad-docs";
import { yiaiDocs } from "@/views/project/seed/yiai-docs";
import { yipetDocs } from "@/views/project/seed/yipet-docs";
import { yiknowledgeDocs } from "@/views/project/seed/yiknowledge-docs";
import type { SeedPage } from "@/views/project/seed/yivad-docs";
import { formatRelativeTime } from "@/utils/datetime";
import HeroDateNav from "@/components/HeroDateNav/HeroDateNav.vue";
import ECharts from "@/components/ECharts/index.vue";
import type { ECOption } from "@/components/ECharts/config";
import { useDateFilter } from "@/hooks/useDateFilter";
import KnowledgePreviewDialog from "@/components/KnowledgePreviewDialog/KnowledgePreviewDialog.vue";

const props = defineProps<{ projectKey?: string; filterDate?: Date | null }>();
const router = useRouter();
const store = usePageStore();
const formRef = ref<FormInstance>();
const previewDlgRef = ref<InstanceType<typeof KnowledgePreviewDialog> | null>(null);

const projectFilter = ref(props.projectKey || "");
const searchText = ref("");
const contentFilter = ref("");
const tagFilter = ref("");
const sortBy = ref<"order" | "title" | "updated" | "size">("order");
const recentlyViewed = ref<Page[]>([]);
const viewMode = ref<"table" | "card" | "list">("card");
const seeding = ref(false);
const projects = ref<{ key: string; name: string }[]>([]);

const SEED_DOCS: Record<string, SeedPage[]> = {
  yivad: yivadDocs,
  yiai: yiaiDocs,
  yipet: yipetDocs,
  yiknowledge: yiknowledgeDocs
};

const TAG_COLORS: Record<string, string> = {
  "getting-started": "#67c23a",
  "architecture": "#409eff",
  "deployment": "#e6a23c",
  "conventions": "#9b59b6",
  "dependencies": "#f56c6c",
  "core-code": "#20c997"
};

const TAG_LABELS: Record<string, string> = {
  "getting-started": "入门",
  "architecture": "架构",
  "deployment": "部署",
  "conventions": "规范",
  "dependencies": "依赖",
  "core-code": "核心"
};

function extractTag(content: string): string {
  const m = content.match(/<!--\s*tag:\s*(\S+)\s*-->/);
  return m ? m[1] : "";
}

function tagColor(tag: string): string {
  return TAG_COLORS[tag] || "#909399";
}

function tagLabel(tag: string): string {
  return TAG_LABELS[tag] || tag;
}

function readingTime(content: string): string {
  const chars = content?.length || 0;
  const mins = Math.max(1, Math.round(chars / 400));
  return `${mins} min read`;
}

// ── Date filter ──
const _filterDate = ref<Date | null>(null);
const filterDate = computed({
  get: () => (props.filterDate !== undefined ? props.filterDate : _filterDate.value),
  set: (v) => { _filterDate.value = v; }
});
const { label: filterDateLabel, isToday: isFilterToday, filterDateStr, goToPrevDay, goToNextDay, goToFilterToday, clearFilterDate } = useDateFilter(filterDate);

const rules: FormRules = {
  title: [{ required: true, message: "Title is required", trigger: "blur" }]
};

// ── Displayed pages ──
const displayedPages = computed(() => {
  let list = store.pages;
  const q = searchText.value.trim().toLowerCase();
  if (q) list = list.filter(p => p.title.toLowerCase().includes(q) || (p.content || "").toLowerCase().includes(q) || projectName(p.project_key).toLowerCase().includes(q));
  if (contentFilter.value === "empty") list = list.filter(p => !p.content);
  if (contentFilter.value === "stale") {
    const now = Date.now();
    list = list.filter(p => p.updated_at && now - new Date(p.updated_at).getTime() > 30 * 86400000);
  }
  if (tagFilter.value) list = list.filter(p => extractTag(p.content) === tagFilter.value);
  const sorted = [...list];
  switch (sortBy.value) {
    case "title":
      sorted.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case "updated":
      sorted.sort((a, b) => (b.updated_at || "").localeCompare(a.updated_at || ""));
      break;
    case "size":
      sorted.sort((a, b) => (b.content?.length || 0) - (a.content?.length || 0));
      break;
    default:
      sorted.sort((a, b) => a.order - b.order);
      break;
  }
  return sorted;
});

// ── Counts ──
const topLevelCount = computed(() => store.pages.filter(p => !p.parent_key).length);
const subPageCount = computed(() => store.pages.filter(p => p.parent_key).length);
const contentSize = computed(() => {
  const chars = store.pages.reduce((s, p) => s + (p.content?.length || 0), 0);
  return chars >= 1000 ? (chars / 1000).toFixed(1).replace(/\.0$/, "") + "k" : String(chars);
});
const avgContentSize = computed(() => {
  const total = store.pages.length;
  if (!total) return "0";
  const chars = store.pages.reduce((s, p) => s + (p.content?.length || 0), 0);
  const avg = Math.round(chars / total);
  return avg >= 1000 ? (avg / 1000).toFixed(1).replace(/\.0$/, "") + "k" : String(avg);
});
const countLabel = computed(() => {
  const isFiltered = !!searchText.value.trim() || !!contentFilter.value || !!tagFilter.value;
  const unit = props.projectKey ? "docs" : "pages";
  const parts = [isFiltered ? `${displayedPages.value.length} of ${store.total} ${unit}` : `${store.total} ${unit}`];
  if (tagFilter.value) parts.push(`in ${tagLabel(tagFilter.value)}`);
  return parts.join(" ");
});

// ── Tag stats for sidebar ──
const tagStats = computed(() => {
  const map = new Map<string, number>();
  for (const p of store.pages) {
    const tag = extractTag(p.content);
    if (tag) map.set(tag, (map.get(tag) || 0) + 1);
  }
  return Array.from(map.entries())
    .map(([tag, count]) => ({ tag, label: tagLabel(tag), color: tagColor(tag), count }))
    .sort((a, b) => b.count - a.count);
});

const totalReadingTime = computed(() => {
  const chars = store.pages.reduce((s, p) => s + (p.content?.length || 0), 0);
  return Math.max(1, Math.round(chars / 400));
});

const totalChars = computed(() => {
  const chars = store.pages.reduce((s, p) => s + (p.content?.length || 0), 0);
  return chars >= 1000 ? (chars / 1000).toFixed(1).replace(/\.0$/, "") + "k" : String(chars);
});

// ── Child count map ──
const childCountByKey = computed(() => {
  const m = new Map<string, number>();
  for (const p of store.pages) {
    if (p.parent_key) m.set(p.parent_key, (m.get(p.parent_key) || 0) + 1);
  }
  return m;
});
function childCount(key: string): number { return childCountByKey.value.get(key) || 0; }

const childrenByKey = computed(() => {
  const m = new Map<string, Page[]>();
  for (const p of store.pages) {
    if (p.parent_key) {
      const arr = m.get(p.parent_key) || [];
      arr.push(p);
      m.set(p.parent_key, arr);
    }
  }
  return m;
});
function childrenOf(key: string): Page[] {
  return (childrenByKey.value.get(key) || []).sort((a, b) => a.order - b.order).slice(0, 5);
}

function parentTitle(key: string): string {
  return store.pages.find(p => p.key === key)?.title || key;
}

function contentSnippet(page: Page): string {
  return (page.content || "").slice(0, 120).replace(/\n/g, " ");
}

function contentStats(page: Page): { chars: number; lines: number } {
  const c = page.content || "";
  return { chars: c.length, lines: c.split("\n").filter(Boolean).length };
}

function projectName(key: string) { return projects.value.find(p => p.key === key)?.name || key; }

// ── Filter pills ──
const activePills = computed(() => {
  const pills: Array<{ id: string; label: string; clear: () => void }> = [];
  if (searchText.value.trim()) pills.push({ id: "search", label: `Search: ${searchText.value.trim()}`, clear: () => { searchText.value = ""; } });
  if (sortBy.value !== "order") {
    const labels: Record<string, string> = { title: "Title", updated: "Recently updated", size: "Content size" };
    pills.push({ id: "sort", label: `Sort: ${labels[sortBy.value] || sortBy.value}`, clear: () => { sortBy.value = "order"; } });
  }
  if (projectFilter.value && !props.projectKey) pills.push({ id: "project", label: `Project: ${projectName(projectFilter.value)}`, clear: () => { projectFilter.value = ""; loadData(); } });
  if (contentFilter.value === "empty") pills.push({ id: "content", label: "No content", clear: () => { contentFilter.value = ""; } });
  if (contentFilter.value === "stale") pills.push({ id: "content", label: "Stale >30d", clear: () => { contentFilter.value = ""; } });
  if (tagFilter.value) pills.push({ id: "tag", label: `Category: ${tagLabel(tagFilter.value)}`, clear: () => { tagFilter.value = ""; } });
  return pills;
});

function clearAllFilters() {
  searchText.value = "";
  contentFilter.value = "";
  tagFilter.value = "";
  sortBy.value = "order";
  if (!props.projectKey) projectFilter.value = "";
  loadData();
}

// ── Charts ──
const sizeBarOption = computed<ECOption>(() => {
  const buckets: Record<string, number> = { "0": 0, "1-500": 0, "500-2k": 0, "2k-5k": 0, "5k+": 0 };
  for (const p of store.pages) {
    const len = p.content?.length || 0;
    if (len === 0) buckets["0"]++;
    else if (len < 500) buckets["1-500"]++;
    else if (len < 2000) buckets["500-2k"]++;
    else if (len < 5000) buckets["2k-5k"]++;
    else buckets["5k+"]++;
  }
  return {
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    grid: { left: 8, right: 8, top: 8, bottom: 8, containLabel: true },
    xAxis: { type: "category", data: Object.keys(buckets), axisLabel: { fontSize: 9 } },
    yAxis: { type: "value", minInterval: 1, axisLabel: { fontSize: 9 } },
    series: [{ type: "bar", data: Object.values(buckets), itemStyle: { color: "#5470c6", borderRadius: [3, 3, 0, 0] }, barMaxWidth: 26 }]
  };
});

const depthDonutOption = computed<ECOption>(() => {
  const topLevel = store.pages.filter(p => !p.parent_key).length;
  const sub = store.pages.filter(p => p.parent_key).length;
  const data = [
    { name: "Top-level", value: topLevel, itemStyle: { color: "#91cc75" } },
    { name: "Sub-pages", value: sub, itemStyle: { color: "#9a60b4" } }
  ].filter(d => d.value > 0);
  return {
    tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
    legend: { bottom: 0, textStyle: { fontSize: 9 } },
    series: [{ type: "pie", radius: ["42%", "68%"], center: ["50%", "42%"], label: { show: false }, data }]
  };
});

const trendOption = computed<ECOption>(() => {
  const labels: string[] = []; const values: number[] = [];
  const today = new Date();
  const createdByDay: Record<string, number> = {};
  for (const p of store.pages) {
    const day = (p.created_at || "").slice(0, 10);
    if (day) createdByDay[day] = (createdByDay[day] ?? 0) + 1;
  }
  for (let d = 13; d >= 0; d--) {
    const dt = new Date(today.getTime() - d * 86400000);
    const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
    labels.push(`${dt.getMonth() + 1}/${dt.getDate()}`);
    values.push(createdByDay[key] ?? 0);
  }
  return {
    tooltip: { trigger: "axis" },
    grid: { left: 8, right: 8, top: 8, bottom: 8, containLabel: true },
    xAxis: { type: "category", data: labels, axisLabel: { fontSize: 9, interval: 3 } },
    yAxis: { type: "value", minInterval: 1, axisLabel: { fontSize: 9 } },
    series: [{ type: "bar", data: values, itemStyle: { color: "#91cc75", borderRadius: [3, 3, 0, 0] } }]
  };
});

// ── Sidebar: needs attention ──
const attention = computed(() => {
  const now = Date.now();
  const empty = store.pages.filter(p => !p.content).length;
  const stale = store.pages.filter(p => {
    if (!p.updated_at) return false;
    return now - new Date(p.updated_at).getTime() > 30 * 86400000;
  }).length;
  return { empty, stale };
});

// ── Sidebar: data quality ──
const completeness = computed(() => {
  const total = store.pages.length;
  const fields = [
    { key: "content", label: "Has content", filled: store.pages.filter(p => p.content).length },
    { key: "parent", label: "Has parent", filled: store.pages.filter(p => p.parent_key).length },
    { key: "children", label: "Has children", filled: store.pages.filter(p => childCountByKey.value.has(p.key)).length }
  ];
  return fields.map(f => ({ ...f, pct: total ? Math.round((f.filled / total) * 100) : 0 }));
});

function qualityBarColor(pct: number) {
  if (pct >= 80) return "#67c23a";
  if (pct >= 50) return "#e6a23c";
  return "#f56c6c";
}

// ── Recently viewed ──
function trackRecent(page: Page) {
  recentlyViewed.value = [page, ...recentlyViewed.value.filter(r => r.key !== page.key)].slice(0, 8);
}

// ── Dialog ──
const dialog = reactive({
  visible: false,
  isEdit: false,
  submitting: false,
  editKey: "",
  form: {
    title: "",
    content: "",
    project_key: props.projectKey || "",
    parent_key: "",
    order: 0
  }
});

async function loadProjects() {
  try {
    const res = await getProjectList({ pageSize: 500 });
    projects.value = ((res.data?.list as Project[]) ?? []).map(p => ({ key: p.key, name: p.name }));
  } catch { /* names fall back to raw keys */ }
}

async function loadData() {
  const dateFilter = filterDateStr.value ? { updated_at_start: filterDateStr.value, updated_at_end: filterDateStr.value } : {};
  await store.fetchPages({ project_key: projectFilter.value || undefined, pageSize: 500, ...dateFilter });
}

function openCreate() {
  dialog.isEdit = false;
  dialog.editKey = "";
  dialog.form = { title: "", content: "", project_key: projectFilter.value || props.projectKey || "", parent_key: "", order: store.pages.length };
  dialog.visible = true;
}

function openEdit(page: Page) {
  dialog.isEdit = true;
  dialog.editKey = page.key;
  dialog.form = {
    title: page.title,
    content: page.content,
    project_key: page.project_key,
    parent_key: page.parent_key,
    order: page.order
  };
  dialog.visible = true;
}

async function submit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  dialog.submitting = true;
  try {
    if (dialog.isEdit) {
      await store.editPage(dialog.editKey, {
        title: dialog.form.title,
        content: dialog.form.content,
        parent_key: dialog.form.parent_key,
        order: dialog.form.order
      });
      ElMessage.success("Page updated");
    } else {
      const key = `PAGE-${Date.now().toString(36).toUpperCase()}`;
      await store.addPage({
        key,
        project_key: dialog.form.project_key || projectFilter.value || props.projectKey || "default",
        title: dialog.form.title,
        content: dialog.form.content,
        parent_key: dialog.form.parent_key,
        order: dialog.form.order
      });
      ElMessage.success("Page created");
    }
    dialog.visible = false;
    await loadData();
  } finally {
    dialog.submitting = false;
  }
}

async function handleDelete(page: Page) {
  try {
    await ElMessageBox.confirm(`Delete page "${page.title}"?`, "Delete", { type: "error" });
    await store.removePage(page.key, page.project_key);
    ElMessage.success("Page deleted");
    await loadData();
  } catch { /* cancelled */ }
}

function openPreview(page: Page) {
  trackRecent(page);
  previewDlgRef.value?.openRaw({ title: page.title, content: page.content });
}

function goProject(key: string) { if (key) router.push(`/project/${key}`); }

async function seedDocs() {
  seeding.value = true;
  const projectKey = projectFilter.value || props.projectKey;
  if (!projectKey) {
    ElMessage.warning("Please select a project first");
    seeding.value = false;
    return;
  }
  const docs = SEED_DOCS[projectKey] || [];
  if (!docs.length) {
    ElMessage.warning(`No seed docs for project "${projectKey}"`);
    seeding.value = false;
    return;
  }
  try {
    for (const doc of docs) {
      await store.addPage({
        key: `DOC-${projectKey}-${doc.order}-${Date.now().toString(36)}`,
        project_key: projectKey,
        title: doc.title,
        content: `<!-- tag: ${doc.tag} -->\n${doc.content}`,
        parent_key: "",
        order: doc.order
      });
    }
    ElMessage.success(`Imported ${docs.length} docs`);
    await loadData();
  } catch {
    ElMessage.error("Import failed");
  } finally {
    seeding.value = false;
  }
}

onMounted(async () => {
  await loadData();
  if (!props.projectKey) await loadProjects();
});

watch(filterDateStr, () => { loadData(); });
</script>

<style scoped lang="scss">
.page-list {
  padding: 24px;
  background: var(--el-bg-color-page);
  &--embedded {
    padding: 0;
    background: transparent;
  }
}

// ── Header Card ──
.page-list__header {
  display: flex; align-items: center; gap: 16px;
  padding: 16px 20px; margin-bottom: 20px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
}
.page-list__header-icon {
  display: flex; align-items: center; justify-content: center;
  width: 44px; height: 44px; border-radius: 10px;
  font-size: 22px; color: #fff;
  background: linear-gradient(135deg, #5470c6, #4460b0);
  flex-shrink: 0;
}
.page-list__header-text { min-width: 0; flex: 1; }
.page-list__header-title { margin: 0; font-size: 18px; font-weight: 700; line-height: 1.3; }
.page-list__header-desc { margin: 2px 0 0; font-size: 12px; color: var(--el-text-color-secondary); }
.page-list__header-pills { display: flex; gap: 10px; flex-shrink: 0; }
.page-list__header-pill {
  display: flex; flex-direction: column; align-items: center; gap: 1px;
  padding: 6px 16px; border-radius: 8px; background: var(--el-fill-color-light); min-width: 64px;
  &--accent { background: var(--el-color-primary-light-9); }
}
.page-list__header-pill-val { font-size: 18px; font-weight: 700; line-height: 1.1; font-family: DIN, sans-serif; }
.page-list__header-pill--accent .page-list__header-pill-val { color: var(--el-color-primary); }
.page-list__header-pill-lbl { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; color: var(--el-text-color-secondary); }
.page-list__header-right {
  display: flex; align-items: center; gap: 8px; flex-shrink: 0;
  :deep(.ho__hero-date-nav) { margin: 0; }
}

// ── Charts ──
.page-list__charts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 14px;
  margin-bottom: 20px;
}
.page-chart {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  overflow: hidden;
  display: flex; flex-direction: column;
}
.page-chart__title {
  display: flex; gap: 6px; align-items: center;
  padding: 8px 12px; font-size: 11px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.3px;
  color: var(--el-text-color-secondary);
  border-bottom: 1px solid var(--el-border-color-lighter);
  flex-shrink: 0;
}
.page-chart__body { flex: 1; min-height: 0; padding: 8px; }

// ── Recently Viewed ──
.page-list__recent {
  display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
  padding: 8px 12px; margin-bottom: 16px; border-radius: 8px;
  background: var(--el-fill-color-lighter); border: 1px solid var(--el-border-color-lighter);
}
.page-list__recent-label { font-size: 11px; font-weight: 600; color: var(--el-text-color-secondary); margin-right: 2px; }
.page-list__recent-chip {
  display: inline-flex; align-items: center; gap: 5px; padding: 2px 9px;
  font-size: 12px; color: var(--el-text-color-primary);
  background: var(--el-bg-color); border: 1px solid var(--el-border-color-lighter);
  border-radius: 999px; cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
  &:hover { border-color: var(--el-color-primary); box-shadow: 0 1px 6px rgba(0,0,0,0.08); }
}
.page-list__recent-key { font-family: monospace; font-size: 11px; color: var(--el-text-color-secondary); }
.page-list__recent-name { max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.page-list__recent-clear {
  margin-left: auto; border: none; background: transparent;
  color: var(--el-text-color-placeholder); cursor: pointer; font-size: 13px; line-height: 1; padding: 4px;
  &:hover { color: var(--el-color-danger); }
}

// ── Filter Pills ──
.page-list__pills { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
.page-list__pills-label { font-size: 11px; font-weight: 600; color: var(--el-text-color-secondary); }

// ── Body / Main / Sidebar ──
.page-list__body { display: flex; gap: 24px; }
.page-list__body--embedded { gap: 16px; }
.page-list__main { flex: 1; min-width: 0; }
.page-list__sidebar {
  width: 240px; flex-shrink: 0; position: sticky; top: 24px; align-self: flex-start;
  background: linear-gradient(180deg, var(--el-bg-color) 0%, var(--el-fill-color-lighter) 100%);
  border-radius: 12px; padding: 12px;
  border: 1px solid var(--el-border-color-lighter);
}
.page-list__body--embedded .page-list__sidebar { width: 200px; top: 0; }
.page-list__sidebar-view {
  padding: 4px 4px 10px;
  margin-bottom: 10px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  :deep(.el-radio-group) { display: flex; width: 100%; }
  :deep(.el-radio-button) { flex: 1; }
  :deep(.el-radio-button__inner) { width: 100%; text-align: center; padding: 4px 0; font-size: 12px; }
}

// ── Sidebar Section ──
.page-list__sidebar-section {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  overflow: hidden;
}
.page-list__sidebar-section-header {
  display: flex; align-items: center;
  padding: 8px 12px; font-size: 10px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.5px;
  color: var(--el-text-color-secondary);
  border-bottom: 1px solid var(--el-border-color-lighter);
  border-left: 2px solid var(--el-color-primary);
  padding-left: 10px;
}
.page-list__sidebar-section-label { flex: 1; }
.page-list__sidebar-section-hint {
  font-size: 10px; font-weight: 500; color: var(--el-text-color-placeholder);
  text-transform: none; letter-spacing: 0;
}
.page-list__sidebar-section-hint--clear { color: var(--el-color-primary); cursor: pointer; &:hover { text-decoration: underline; } }
.page-list__sidebar-section-body {
  padding: 8px; display: flex; flex-direction: column; gap: 4px;
}

// ── Sidebar Card (stat item) ──
.page-list__sidebar-card {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 10px; border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px; cursor: pointer;
  transition: all 0.15s;
  background: var(--el-bg-color);
  &:hover {
    border-color: var(--el-color-primary-light-5);
    background: var(--el-color-primary-light-9);
  }
  &.is-active {
    border-color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
  }
}
.page-list__sidebar-card-icon {
  display: flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; border-radius: 7px;
  color: #fff; font-size: 13px; flex-shrink: 0;
}
.page-list__sidebar-card-info {
  display: flex; flex-direction: column; gap: 0; min-width: 0;
}
.page-list__sidebar-card-value {
  font-size: 16px; font-weight: 700; line-height: 1.1;
  color: var(--el-text-color-primary); font-family: DIN, sans-serif;
}
.page-list__sidebar-card-label {
  font-size: 10px; color: var(--el-text-color-secondary);
}

// ── Sidebar Card (attention variant) ──
.page-list__sidebar-card-accent-icon {
  font-size: 14px; flex-shrink: 0;
}
.page-list__sidebar-card-accent-value {
  font-size: 16px; font-weight: 700; font-family: DIN, sans-serif; min-width: 20px;
}
.page-list__sidebar-card-accent-label {
  font-size: 11px; color: var(--el-text-color-secondary); flex: 1;
}
.page-list__sidebar-card--empty {
  .page-list__sidebar-card-accent-icon,
  .page-list__sidebar-card-accent-value { color: var(--el-color-warning); }
}
.page-list__sidebar-card--stale {
  .page-list__sidebar-card-accent-icon,
  .page-list__sidebar-card-accent-value { color: var(--el-color-danger); }
}

// ── Sidebar Progress ──
.page-list__sidebar-progress {
  padding: 0 12px 12px;
}
.page-list__sidebar-progress-label {
  display: block; font-size: 10px; font-weight: 600;
  color: var(--el-text-color-secondary); margin-bottom: 4px;
}
.page-list__sidebar-progress-hint {
  font-size: 11px; color: var(--el-text-color-placeholder);
}

// ── Sidebar Quality ──
.page-list__sidebar-quality {
  padding: 4px 0;
  & + & { padding-top: 8px; }
}
.page-list__sidebar-quality-head {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px;
}
.page-list__sidebar-quality-label {
  font-size: 11px; color: var(--el-text-color-secondary);
}
.page-list__sidebar-quality-pct {
  font-size: 11px; font-weight: 600; font-family: DIN, sans-serif;
}

// ── Tag chips ──
.page-list__tag-chips {
  display: flex; flex-wrap: wrap; gap: 6px;
}
.page-list__tag-chip {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 3px 10px; border-radius: 999px;
  font-size: 11px; font-weight: 500;
  background: var(--el-bg-color);
  border: 1px solid;
  cursor: pointer;
  transition: all 0.15s;
  &:hover { opacity: 0.85; }
  &.is-active { font-weight: 600; }
}
.page-list__tag-chip-dot {
  width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0;
}
.page-list__tag-chip-count {
  font-size: 10px; opacity: 0.7; font-family: DIN, sans-serif;
}
.page-list__tag-empty {
  font-size: 12px; color: var(--el-text-color-placeholder);
}

// ── Head ──
.page-list__head { display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; margin-bottom: 16px; }
.page-list__head-left { display: flex; align-items: center; gap: 12px; }
.page-list__head-count { font-size: 13px; font-weight: 600; color: var(--el-text-color-secondary); }
.page-list__head-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.page-list__search { width: 190px; }
.page-list__sort { width: 150px; }
.page-list__project { width: 190px; }

// ── Card Grid ──
.page-list__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
.page-list__grid--non-card { display: block; }
.page-card {
  cursor: pointer; overflow: hidden; border-radius: 12px;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
  :deep(.el-card__body) { padding: 0; }
  &:hover { transform: translateY(-4px); box-shadow: var(--el-box-shadow-light); }
}
.page-card__status-bar { height: 3px; }
.page-card__body { padding: 16px; }

// ── Doc card elements (embedded mode) ──
.page-card__tag {
  font-size: 10px;
  font-weight: 600;
  padding: 1px 8px;
  border-radius: 999px;
  letter-spacing: 0.3px;
  flex-shrink: 0;
}
.page-card__doc-meta {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 10px;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  .el-icon { font-size: 13px; }
}
.page-card__doc-meta-sep {
  color: var(--el-border-color-dark);
}
.page-card__snippet--doc {
  font-size: 13px;
  line-height: 1.6;
  color: var(--el-text-color-regular);
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.page-card__snippet--empty {
  font-size: 13px;
  font-style: italic;
  color: var(--el-text-color-placeholder);
  margin-bottom: 12px;
}
.page-card__footer--doc {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid var(--el-border-color-lighter);
}

// Row 1: Top (name + status tag)
.page-card__top { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 8px; }
.page-card__name { font-size: 16px; font-weight: 600; }

// Row 2: Head (key + order + parent badge)
.page-card__head {
  display: flex; align-items: center; gap: 6px; margin-bottom: 8px;
}
.page-card__key {
  font-size: 10px;
  color: var(--el-text-color-placeholder);
  font-family: "SF Mono", "Fira Code", monospace;
  background: var(--el-fill-color-light);
  padding: 1px 6px;
  border-radius: 3px;
}
.page-card__order {
  font-size: 10px;
  color: var(--el-text-color-placeholder);
  font-family: "SF Mono", "Fira Code", monospace;
}
.page-card__parent-badge {
  display: inline-flex; align-items: center; gap: 3px; margin-left: auto;
  font-size: 10px; color: var(--el-color-primary);
  background: var(--el-color-primary-light-9); padding: 1px 6px; border-radius: 3px;
  .el-icon { font-size: 11px; }
}

// Project chip
.page-card__project {
  display: inline-flex; align-items: center; gap: 5px; padding: 2px 8px;
  border: none; border-radius: 6px; background: var(--el-fill-color-light);
  color: var(--el-text-color-secondary); font-size: 12px; cursor: pointer; margin-bottom: 8px;
  transition: color 0.15s, background 0.15s;
  .el-icon { font-size: 13px; }
  &:hover { color: var(--el-color-primary); background: var(--el-color-primary-light-9); }
}

// Snippet
.page-card__snippet {
  font-size: 13px; color: var(--el-text-color-secondary); margin: 0 0 10px;
  line-height: 1.55; word-break: break-word;
  overflow: hidden; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;
}

// Meta row
.page-card__meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.page-card__time {
  font-size: 12px; font-weight: 500; border-radius: 999px; padding: 1px 8px;
  &--ok { color: var(--el-color-primary); background: var(--el-color-primary-light-9); }
  &--upcoming { color: var(--el-color-info); background: var(--el-color-info-light-9); }
}
.page-card__stats { font-size: 12px; color: var(--el-text-color-placeholder); }

// Footer
.page-card__footer { display: flex; justify-content: space-between; align-items: center; padding-top: 12px; border-top: 1px solid var(--el-border-color-lighter); }
.page-card__footer-left { display: flex; flex-direction: column; gap: 2px; }
.page-card__footer-stat { font-size: 12px; color: var(--el-text-color-placeholder); }
.page-card__footer-date { font-size: 11px; color: var(--el-text-color-placeholder); }
.page-card__actions { display: flex; align-items: center; gap: 2px; }

// Sub-pages list
.page-card__sub-list {
  margin-bottom: 12px;
  padding-top: 8px;
  border-top: 1px solid var(--el-border-color-lighter);
  display: flex; flex-direction: column; gap: 2px;
  max-height: 168px; overflow-y: auto;
}
.page-card__sub-row {
  display: flex; align-items: center; gap: 6px; padding: 3px 6px; margin: 0 -6px;
  border-radius: 5px; font-size: 12px; cursor: pointer;
  transition: background 0.1s;
  &:hover { background: var(--el-fill-color-light); }
}
.page-card__sub-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.page-card__sub-key { font-family: "SF Mono", "Fira Code", monospace; font-size: 10px; color: var(--el-text-color-placeholder); flex-shrink: 0; }
.page-card__sub-title { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.page-card__sub-size { font-size: 10px; color: var(--el-text-color-placeholder); flex-shrink: 0; }
.page-list__empty { grid-column: 1 / -1; padding: 60px 0; }

.page-list__muted { color: var(--el-text-color-placeholder); font-size: 12px; }

// ── Table View ──
.page-table__name {
  font-weight: 500;
  color: var(--el-color-primary);
  cursor: pointer;
}
.page-table__tag {
  font-size: 10px;
  font-weight: 600;
  padding: 1px 8px;
  border-radius: 999px;
  letter-spacing: 0.3px;
}
.page-table__content-info {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  &--empty { color: var(--el-color-warning); font-weight: 500; }
}
.page-table__reading {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.page-table__updated {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

// ── List View ──
.page-list-view {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.page-list-view__row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  cursor: pointer;
  transition: box-shadow 0.2s, transform 0.2s;
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    transform: translateY(-1px);
  }
}
.page-list-view__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}
.page-list-view__title {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.page-list-view__tag {
  font-size: 10px;
  font-weight: 600;
  padding: 1px 8px;
  border-radius: 999px;
  letter-spacing: 0.3px;
  flex-shrink: 0;
}
.page-list-view__chars {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  flex-shrink: 0;
}
.page-list-view__reading {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  flex-shrink: 0;
}
.page-list-view__updated {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  flex-shrink: 0;
}
</style>
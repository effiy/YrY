<template>
  <StandardRoleDashboard role-id="leader" :poll-interval-ms="90000">
    <!-- Tech Lead unique: Architecture Governance ribbon + risk register -->
    <template #prepend>
      <div class="lead-page__ribbon">
        <div class="lead-page__ribbon-title">
          <el-icon :size="18"><Connection /></el-icon>
          <span>Architecture Governance · 架构决策治理</span>
        </div>
        <div class="lead-page__ribbon-stats">
          <el-tag size="small" effect="light" round type="primary">
            ADR Registry · {{ adrCount }} records
          </el-tag>
          <el-tag size="small" effect="light" round type="warning">
            Lock Order · CONFIG → PLUGIN → BACKUP → WINDOW
          </el-tag>
          <el-tag size="small" effect="light" round type="danger">
            Rust unwrap() = 0 tolerated
          </el-tag>
        </div>
      </div>
    </template>

    <!-- Live Risk Register derived from files in decision/ & risk/ folders -->
    <template #after-redlines>
      <section class="lead-page__block">
        <div class="block-head">
          <h2 class="block-head__title">
            <span class="block-head__icon">⚠️</span>Live Risk Register · 风险登记册
          </h2>
          <span class="block-head__count">
            {{ riskItems.length }} open items · auto-derived from meta.status
          </span>
        </div>
        <div v-if="riskItems.length === 0" class="lead-risk__empty">
          <el-empty description="No risks detected — all knowledge items stable." :image-size="80" />
        </div>
        <div v-else class="lead-risk__table">
          <el-table :data="riskItems" size="small" stripe border :header-cell-style="{ background: 'var(--el-fill-color-lighter)' }">
            <el-table-column prop="id" label="ID" width="60" align="center" />
            <el-table-column label="Title" min-width="220">
              <template #default="{ row }">
                <a class="lead-risk__name" @click.stop="openRisk(row)">{{ row.name }}</a>
                <el-tag size="small" style="margin-left:6px" :type="riskSeverityType(row.severity)" effect="plain">
                  {{ row.severity }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="Lifecycle" width="120">
              <template #default="{ row }">
                <el-tag size="small" :type="lifecycleTagType(row.lifecycle)" effect="dark">
                  {{ row.lifecycle || "—" }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="owner" label="Owner" width="100">
              <template #default="{ row }">{{ row.owner || "unassigned" }}</template>
            </el-table-column>
            <el-table-column prop="dueBy" label="Review Due" width="140" align="center" />
            <el-table-column label="Domain" width="110" align="center">
              <template #default="{ row }">
                <span>{{ row.domainIcon }} {{ row.domain }}</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </section>
    </template>
  </StandardRoleDashboard>
</template>

<script setup lang="ts" name="LeaderDashboard">
import { computed, ref } from "vue";
import { Connection } from "@element-plus/icons-vue";
import StandardRoleDashboard from "../components/StandardRoleDashboard.vue";
import KnowledgePreviewDialog from "@/components/KnowledgePreviewDialog/KnowledgePreviewDialog.vue";
import { useRoleDashboard } from "../composables/useRoleDashboard";

const dashRef = ref<InstanceType<typeof StandardRoleDashboard> | null>(null);
const { flatFiles } = useRoleDashboard("leader", { pollIntervalMs: 90_000 });

interface RiskRow {
  id: number;
  name: string;
  lifecycle: string;
  severity: string;
  owner: string;
  dueBy: string;
  domain: string;
  domainIcon: string;
  path: string;
}

/* Count ADRs in the decisions folder (8-field rule) */
const adrCount = computed(
  () => flatFiles.value.filter(r => r.domainId === "decisions" || (r.file.path || "").includes("decisions")).length
);

/* Build risk register = files in risk/ dir + any knowledge file with evolving/deprecated status */
const riskItems = computed<RiskRow[]>(() => {
  const out: RiskRow[] = [];
  let id = 1;
  for (const row of flatFiles.value) {
    const status = row.file.meta?.status || "";
    const lifecycle = row.file.meta?.lifecycle || "";
    const inRiskDir = row.domainId === "risk";
    const problematic =
      inRiskDir || ["evolving", "draft", "deprecated"].includes(status) || lifecycle === "at-risk";
    if (!problematic) continue;

    const severity =
      lifecycle === "critical"
        ? "P0-Critical"
        : status === "deprecated"
        ? "P3-Low"
        : lifecycle === "at-risk" || status === "evolving"
        ? "P2-Medium"
        : "P1-High";

    const meta = row.file.meta || {};
    const dueTs = Number(meta.next_review_at || meta.review_after || 0);
    const dueBy = dueTs ? new Date(dueTs * 1000).toLocaleDateString("zh-CN", { year: "2-digit", month: "2-digit", day: "2-digit" }) : "unscheduled";

    out.push({
      id: id++,
      name: row.title,
      lifecycle: lifecycle || status || "draft",
      severity,
      owner: (meta as any).owner || "",
      dueBy,
      domain: row.domain,
      domainIcon: row.domainIcon,
      path: row.path
    });
  }
  return out.slice(0, 50);
});

function lifecycleTagType(lc: string): "success" | "warning" | "danger" | "info" | undefined {
  const map: Record<string, "success" | "warning" | "danger" | "info" | undefined> = {
    stable: "success",
    active: "success",
    evolving: "info",
    "in-review": "warning",
    draft: "warning",
    "at-risk": "warning",
    deprecated: "danger",
    critical: "danger"
  };
  return map[lc];
}
function riskSeverityType(s: string): "success" | "warning" | "danger" | "info" | undefined {
  if (s.includes("P0") || s.includes("Critical")) return "danger";
  if (s.includes("P1") || s.includes("High")) return "warning";
  if (s.includes("P2") || s.includes("Medium")) return "info";
  return undefined;
}

const previewDlg = ref<InstanceType<typeof KnowledgePreviewDialog> | null>(null);
function openRisk(r: any) {
  const path = (r as RiskRow).path;
  if (previewDlg.value) previewDlg.value.open(path);
  else dashRef.value?.openFile({ path });
}
</script>

<style lang="scss" scoped>
@use "../styles/roleDashboard.scss";

.lead-page__ribbon {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  padding: 12px 18px;
  background: linear-gradient(
    90deg,
    color-mix(in srgb, #7c3aed 10%, transparent),
    color-mix(in srgb, #1677ff 8%, transparent)
  );
  border: 1px solid color-mix(in srgb, #7c3aed 40%, transparent);
  border-radius: 12px;
}
.lead-page__ribbon-title {
  display: flex;
  gap: 8px;
  align-items: center;
  font-weight: 700;
  color: #7c3aed;
  font-size: 13px;
}
.lead-page__ribbon-stats {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.lead-risk__empty {
  padding: 8px 0 4px;
}
.lead-risk__table {
  :deep(.el-table) {
    border-radius: 8px;
  }
}
.lead-risk__name {
  color: var(--el-color-primary);
  cursor: pointer;
  font-weight: 500;
  text-decoration: none;
  &:hover { text-decoration: underline; }
}
</style>

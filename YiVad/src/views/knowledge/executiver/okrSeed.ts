// ═══════════════════════════════════════════════════════════════
// OKR metadata seeder — hydrates the MongoDB `okr_*` collections from the
// frontend static data (okrData.ts / okrFlowData.ts), the single source of
// truth for OKR content.
//
// The OkrRecommend panel reads OKR metadata from MongoDB via okrService
// (`fetchAllOkrMetadata`); those collections are empty until seeded. This
// module maps the static data into the exact shapes okrService expects and
// writes them once (idempotent — skips when `okr_roles` already has rows).
// ═══════════════════════════════════════════════════════════════
import { queryDocuments, createDocument } from "@/api/modules/dataService";
import { OKR_COLLECTIONS } from "@/api/modules/okrService";
import {
  rolesData,
  goalsData,
  metricsData,
  goalMetricMap,
  roleDailyDataMap,
  roleWeeklyDataMap,
  roleChecklistMap
} from "./okrData";
import { FLOW_STAGES, EXAMPLE_TASKS, EXAMPLE_LAUNCHES } from "./okrFlowData";

export interface OkrSeedResult {
  /** true when the collections were empty and this call populated them. */
  seeded: boolean;
  /** number of documents written (0 when already seeded). */
  count: number;
}

/**
 * Seed all `okr_*` collections from static data if they are empty.
 * Idempotent: a follow-up call returns `{ seeded: false, count: 0 }`.
 */
export async function seedOkrMetadataIfEmpty(): Promise<OkrSeedResult> {
  const probe = await queryDocuments({ cname: OKR_COLLECTIONS.roles, pageSize: 1 });
  if (probe.code !== 0) throw new Error(probe.message || "Failed to check OKR metadata");
  if ((probe.data?.total ?? 0) > 0) return { seeded: false, count: 0 };

  let count = 0;
  const insert = async (cname: string, docs: Record<string, any>[]): Promise<void> => {
    for (const doc of docs) {
      await createDocument(cname, doc);
      count += 1;
    }
  };

  // roles — keyed by role id.
  await insert(
    OKR_COLLECTIONS.roles,
    Object.entries(rolesData).map(([roleId, r]) => ({ key: roleId, ...r }))
  );

  // goals — key = goal id, plus role for the role→goals index.
  await insert(
    OKR_COLLECTIONS.goals,
    Object.entries(goalsData).flatMap(([roleId, list]) => list.map(g => ({ key: g.id, role: roleId, ...g })))
  );

  // metrics — key = metric id, plus role.
  await insert(
    OKR_COLLECTIONS.metrics,
    Object.entries(metricsData).flatMap(([roleId, list]) => list.map(m => ({ key: m.id, role: roleId, ...m })))
  );

  // goal ↔ metric links.
  await insert(
    OKR_COLLECTIONS.goalMetrics,
    Object.entries(goalMetricMap).map(([goalId, metricIds]) => ({ key: goalId, goalId, metricIds }))
  );

  // daily / weekly / checklists — keyed by role id.
  await insert(
    OKR_COLLECTIONS.daily,
    Object.entries(roleDailyDataMap).map(([roleId, d]) => ({ key: roleId, role: roleId, ...d }))
  );
  await insert(
    OKR_COLLECTIONS.weekly,
    Object.entries(roleWeeklyDataMap).map(([roleId, w]) => ({ key: roleId, role: roleId, ...w }))
  );
  await insert(
    OKR_COLLECTIONS.checklists,
    Object.entries(roleChecklistMap).map(([roleId, items]) => ({ key: roleId, role: roleId, items }))
  );

  // flow stages — already carry a `key`.
  await insert(OKR_COLLECTIONS.flowStages, FLOW_STAGES.map(s => ({ ...s })));

  // example tasks / launches — key = id.
  await insert(OKR_COLLECTIONS.exampleTasks, EXAMPLE_TASKS.map(t => ({ key: t.id, ...t })));
  await insert(OKR_COLLECTIONS.exampleLaunches, EXAMPLE_LAUNCHES.map(l => ({ key: l.id, ...l })));

  return { seeded: true, count };
}

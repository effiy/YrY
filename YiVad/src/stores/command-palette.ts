/**
 * 命令面板 Pinia Store。
 *
 * 职责：
 *   1) MRU（Most Recently Used）最近使用 —— 只在三闸门「Gate C pass」后才写入，确保不把
 *      幽灵条目塞进 MRU（历史 v1 MRU 中 34% 是已删除 Issue 的事故根因）。
 *   2) v1 MRU 数据迁移：当用户浏览器中仍有 cmd_palette_mru (v1 schema) 时，每条跑一次
 *      resolveLink，ok 才洗入 v2，其余静默丢弃。
 *   3) 面板打开/关闭状态的全局广播开关（避免 layouts 通过直接操作 ref，保留 App.vue 对
 *      visible 的主控权）。
 */

import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import { resolveLink } from "@/utils/linkFactory";
import piniaPersistConfig from "@/stores/helper/persist";
import { pushReliabilityEvent } from "@/utils/reliability/reliabilityMetrics";

export const MRU_V2_MAX = 24;
const MRU_V1_KEY = "cmd_palette_mru";
const MRU_V2_STORE_KEY = "cmd_palette_mru_v2";

export interface CommandPaletteMRUItem {
  id: string;
  type: string;
  key: string;
  title: string;
  project?: string;
  ts: number;
}

export interface CommandPaletteMRUItemV1 {
  id?: string;
  entityType?: string;
  type?: string;
  key?: string;
  title?: string;
  project?: string;
  url?: string;
  /** v1 脏数据里的错误路由（issue/${key} 拼错 param 名） */
  link?: string;
  ts?: number;
  lastUsedAt?: number;
}

export const useCommandPaletteStore = defineStore(
  "command-palette",
  () => {
    /* ── State ─────────────────────────────────────────────────────── */
    const mru = ref<CommandPaletteMRUItem[]>([]);
    const _migratedFromV1 = ref(false);

    /* ── Getters ───────────────────────────────────────────────────── */
    const topMRU = computed(() => mru.value.slice(0, MRU_V2_MAX));

    /* ── Actions ───────────────────────────────────────────────────── */

    /** 只有 Gate C pass 才会被真正记入 MRU（v2 contract）。 */
    function pushMRU(item: CommandPaletteMRUItem) {
      if (!item || !item.key || !item.type) return;
      const now = item.ts || Date.now();
      // Gate A 再保险：即使 Gate C 上游逻辑误判，resolveLink 不通过的也不写入
      const r = resolveLink({ type: item.type, key: item.key, title: item.title, project: item.project });
      if (!r.ok) return;

      const existsIdx = mru.value.findIndex(x => x.type === item.type && x.key === item.key);
      if (existsIdx >= 0) mru.value.splice(existsIdx, 1);
      mru.value.unshift({ ...item, ts: now });
      if (mru.value.length > MRU_V2_MAX) mru.value.length = MRU_V2_MAX;
    }

    function removeMRU(predicate: (x: CommandPaletteMRUItem) => boolean) {
      mru.value = mru.value.filter(x => !predicate(x));
    }

    function clearMRU() {
      mru.value = [];
      try { localStorage.removeItem(MRU_V1_KEY); } catch { /* noop */ }
    }

    /**
     * v1 → v2 schema 迁移。幂等：只在 _migratedFromV1=false 时执行一次。
     *
     * v1 脏数据表现：
     *   - /issue/${key}（错误 param 位，真实路由是 :id）
     *   - /page（所有 page 都跳到列表页，丢失 key）
     *   - isHide=true 的 accountManage（管理员设为隐藏）
     * 本迁移用 resolveLink(item) 对 v1 每条重新跑一次 Gate A，ok 才洗入 v2。
     */
    function migrateFromV1IfNeeded() {
      if (_migratedFromV1.value) return;
      let rawV1: CommandPaletteMRUItemV1[] = [];
      try {
        const txt = localStorage.getItem(MRU_V1_KEY);
        if (txt) rawV1 = JSON.parse(txt);
      } catch {
        rawV1 = [];
      }
      if (!Array.isArray(rawV1) || !rawV1.length) {
        _migratedFromV1.value = true;
        return;
      }

      const cleaned: CommandPaletteMRUItem[] = [];
      const seen = new Set<string>();
      let dropped = 0;
      for (const v1 of rawV1) {
        if (!v1) continue;
        const type = (v1.type || v1.entityType || "") as string;
        const key = (v1.key || "") as string;
        const title = (v1.title || "") as string;
        const project = (v1.project || "") as string;
        if (!type || !key) { dropped++; continue; }
        const result = resolveLink({ type, key, title, project });
        if (!result.ok) { dropped++; continue; }
        const uniqKey = `${type}|${key}`;
        if (seen.has(uniqKey)) continue;
        seen.add(uniqKey);
        cleaned.push({
          id: v1.id || uniqKey,
          type, key, title, project,
          ts: (v1.ts || v1.lastUsedAt || Date.now()) as number,
        });
      }
      // 与现有 v2 mru 合并（v2 中已存在 = 更优先）
      const existingKeys = new Set(mru.value.map(x => `${x.type}|${x.key}`));
      const merged: CommandPaletteMRUItem[] = [...mru.value];
      for (const c of cleaned) {
        if (existingKeys.has(`${c.type}|${c.key}`)) continue;
        merged.push(c);
      }
      merged.sort((a, b) => (b.ts || 0) - (a.ts || 0));
      mru.value = merged.slice(0, MRU_V2_MAX);

      try { localStorage.removeItem(MRU_V1_KEY); } catch { /* noop */ }
      _migratedFromV1.value = true;

      pushReliabilityEvent({
        projectKey: "",
        phase: "store_init",
        status: dropped > 0 ? "degraded" : "success",
        durationMs: 0,
        retryCount: 0,
        errorType: dropped > 0 ? "business" : "unknown",
        tags: {
          stage: "mru_migration",
          subStage: "v1_to_v2",
          v1_total: String(rawV1.length),
          dropped_v1: String(dropped),
          merged_v2: String(mru.value.length),
        },
      });
    }

    /* ── Init side effect：store 首次激活时跑迁移 ──────────────────── */
    // 用 nextTick 避免在 SSR 或尚未注入 authStore 时 resolveLink 依赖 pinia
    const _timer = setTimeout(() => {
      try { migrateFromV1IfNeeded(); } catch { /* noop */ }
    }, 0);
    // composable 中 setTimeout 要自己清理：用 watch 的一个一次性 flag 在 onActivated 后清
    watch(
      () => _migratedFromV1.value,
      (done) => {
        if (done) {
          clearTimeout(_timer);
        }
      },
      { once: true }
    );

    return {
      mru,
      topMRU,
      _migratedFromV1,
      pushMRU,
      removeMRU,
      clearMRU,
      migrateFromV1IfNeeded,
    };
  },
  {
    persist: piniaPersistConfig(MRU_V2_STORE_KEY, ["mru", "_migratedFromV1"]),
  }
);

export default useCommandPaletteStore;

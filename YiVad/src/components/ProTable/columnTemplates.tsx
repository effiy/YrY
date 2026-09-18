/** Pre-built column render templates for ProTable.
 *
 * Usage: add `render: progressBar({ field: 'progress', maxField: 'total' })` to a ColumnProps.
 */
import type { RenderScope } from "@/components/ProTable/interface";

// ── Progress Bar ──

export function progressBar(opts?: { field?: string; maxField?: string; max?: number; color?: string }) {
  return (scope: RenderScope<any>) => {
    const val = Number(scope.row[opts?.field ?? "progress"]) || 0;
    const maxVal = (opts?.max ?? Number(scope.row[opts?.maxField ?? "total"])) || 100;
    const pct = Math.min(100, Math.round((val / maxVal) * 100));
    const color = opts?.color ?? (pct >= 80 ? "#67c23a" : pct >= 50 ? "#e6a23c" : "#f56c6c");
    return (
      <div style="display:flex;align-items:center;gap:8px">
        <div style="flex:1;height:8px;border-radius:4px;background:#ebeef5;overflow:hidden">
          <div style={`width:${pct}%;height:100%;background:${color};border-radius:4px;transition:width 0.3s`} />
        </div>
        <span style="font-size:12px;color:#909399;white-space:nowrap">{pct}%</span>
      </div>
    );
  };
}

// ── Tags ──

export function tagList(opts?: { field?: string; max?: number; colors?: Record<string, string> }) {
  const colors = opts?.colors ?? {};
  const fallbackColors = ["#409eff", "#67c23a", "#e6a23c", "#f56c6c", "#909399", "#b37feb"];
  let idx = 0;
  return (scope: RenderScope<any>) => {
    const tags: string[] = Array.isArray(scope.row[opts?.field ?? "tags"]) ? scope.row[opts?.field ?? "tags"] : [];
    const max = opts?.max ?? 3;
    const visible = tags.slice(0, max);
    const overflow = tags.length - max;
    idx = 0;
    return (
      <div style="display:flex;flex-wrap:wrap;gap:2px">
        {visible.map(t => {
          const color = colors[t] ?? fallbackColors[idx++ % fallbackColors.length];
          return (
            <el-tag size="small" style={`border-color:${color};color:${color}`}>
              {t}
            </el-tag>
          );
        })}
        {overflow > 0 && <el-tag size="small">+{overflow}</el-tag>}
      </div>
    );
  };
}

// ── Action Buttons ──

export interface ActionButton {
  label: string;
  type?: "primary" | "success" | "warning" | "danger" | "info";
  link?: boolean;
  icon?: string;
  visible?: (row: Record<string, any>) => boolean;
  onClick: (row: Record<string, any>) => void;
}

export function actionButtons(buttons: ActionButton[]) {
  return (scope: RenderScope<any>) => {
    const visible = buttons.filter(b => !b.visible || b.visible(scope.row));
    return (
      <div style="display:flex;gap:4px">
        {visible.map((btn, i) => (
          <el-button
            key={i}
            size="small"
            type={btn.type ?? "primary"}
            link={btn.link !== false}
            onClick={() => btn.onClick(scope.row)}
          >
            {btn.label}
          </el-button>
        ))}
      </div>
    );
  };
}

// ── Status Badge ──

export function statusBadge(opts?: {
  field?: string;
  map?: Record<string, { label: string; type: "success" | "warning" | "danger" | "info" | "" }>;
}) {
  const statusMap = opts?.map ?? {};
  return (scope: RenderScope<any>) => {
    const val = String(scope.row[opts?.field ?? "status"] ?? "");
    const cfg = statusMap[val] ?? { label: val, type: "info" as const };
    return <el-tag type={cfg.type || "info"}>{cfg.label}</el-tag>;
  };
}

// ── Date/Time Formatter ──

export function dateFormat(opts?: { field?: string; format?: "date" | "datetime" | "relative" }) {
  const fmt = opts?.format ?? "date";
  return (scope: RenderScope<any>) => {
    const val = scope.row[opts?.field ?? "created_at"];
    if (!val) return <span style="color:#c0c4cc">—</span>;
    const d = new Date(val);
    if (isNaN(d.getTime())) return String(val);
    if (fmt === "relative") {
      const diff = Date.now() - d.getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 1) return "刚刚";
      if (mins < 60) return `${mins} 分钟前`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours} 小时前`;
      const days = Math.floor(hours / 24);
      if (days < 30) return `${days} 天前`;
      return d.toLocaleDateString("zh-CN");
    }
    const iso = d.toISOString();
    return fmt === "datetime" ? iso.slice(0, 19).replace("T", " ") : iso.slice(0, 10);
  };
}

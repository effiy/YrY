import type { Component } from "vue";

/** One KPI tile in the dashboard header strip. */
export interface StatTile {
  key: string;
  value: number;
  /** Rendered straight after the value, e.g. "%". */
  suffix?: string;
  label: string;
  sub?: string;
  /** Tooltip explaining what clicking the tile does. */
  hint?: string;
  icon: Component;
  /** Drives the gradient chip: `pst-tile--<variant>`. */
  variant: string;
  clickable?: boolean;
  active?: boolean;
}

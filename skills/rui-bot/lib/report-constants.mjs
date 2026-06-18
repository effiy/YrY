/**
 * report-constants — Shared constants for health report generation.
 * Extracted from health-report.mjs for module decomposition.
 *
 * All dimension data is imported from the canonical source: lib/constants.mjs.
 */

import {
  HEALTH_DIM_ICONS,
  HEALTH_DIM_LABELS,
  HEALTH_DIM_WEIGHTS,
  GRADE_STYLE,
} from "../../../lib/constants.mjs";

export const REPORT_DIR = "docs/健康报告";
export const CDN_DEPTH = "../../";

// Re-export from canonical source for backward compatibility
export { HEALTH_DIM_ICONS as DIM_ICONS };
export { HEALTH_DIM_LABELS as DIM_LABELS };
export { HEALTH_DIM_WEIGHTS as DIM_WEIGHTS };
export { GRADE_STYLE };

/**
 * report-sections barrel — single import surface for all section builders.
 *
 * Re-exports every `build*` function from its focused sub-module so that
 * existing callers (health-report.mjs, etc.) keep working unchanged:
 *
 *   import { buildScoreTrend } from "./report-sections.mjs";
 *
 * Splitting the previously-monolithic file along responsibility lines
 * (overview / dimensions / structure / visualizations / risks / trend /
 * components) keeps each module focused and easy to navigate. New
 * sub-modules can be added by appending to `export * from`.
 */

export * from "./overview.mjs";
export * from "./dimensions.mjs";
export * from "./structure.mjs";
export * from "./visualizations.mjs";
export * from "./risks.mjs";
export * from "./trend.mjs";
export * from "./components.mjs";
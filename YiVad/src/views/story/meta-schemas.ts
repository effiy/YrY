/**
 * Story Board — declarative column/field definitions for the story list table,
 * detail descriptions, and form sections. Follows the same meta-schema pattern
 * as BRD and code-review.
 */
import type { ColumnProps } from "@/components/ProTable/interface";
import type { StoryDocument } from "@/api/modules/story";

// ── Story list table columns ────────────────────────────────────────────────

export interface StoryColumn {
  prop: string;
  label: string;
  width?: number;
  minWidth?: number;
  align?: string;
  sortable?: boolean | string;
  render?: "status-badge" | "priority-tag" | "date" | "text" | "progress" | "tags" | "actions";
}

export const STORY_LIST_COLUMNS: StoryColumn[] = [
  { prop: "name", label: "Name", minWidth: 180, render: "text" },
  { prop: "project", label: "Project", width: 140, render: "text" },
  { prop: "status", label: "Status", width: 120, align: "center", render: "status-badge" },
  { prop: "priority", label: "Priority", width: 90, align: "center", render: "priority-tag" },
  { prop: "assignee", label: "Assignee", width: 110, render: "text" },
  { prop: "startDate", label: "Start", width: 110, render: "date" },
  { prop: "dueDate", label: "Due", width: 110, render: "date" },
  { prop: "scenarios", label: "Scenarios", width: 100, align: "center", render: "progress" },
  { prop: "tags", label: "Tags", width: 200, render: "tags" },
  { prop: "actions", label: "Actions", width: 180, align: "center", render: "actions" },
];

// ── Story detail field definitions ──────────────────────────────────────────

export interface DetailField {
  key: keyof StoryDocument | string;
  label: string;
  /** "status-badge" | "priority-tag" | "date" | "text" | "tags" */
  render?: string;
  span?: 1 | 2; // for descriptions: 1 = single column, 2 = full width
}

export const STORY_OVERVIEW_FIELDS: DetailField[] = [
  { key: "status", label: "Status", render: "status-badge" },
  { key: "priority", label: "Priority", render: "priority-tag" },
  { key: "project", label: "Project", render: "text" },
  { key: "assignee", label: "Assignee", render: "text" },
  { key: "startDate", label: "Start Date", render: "date" },
  { key: "dueDate", label: "Due Date", render: "date" },
  { key: "completedAt", label: "Completed", render: "date" },
  { key: "updatedAt", label: "Updated", render: "date" },
];

// ── Story form field definitions ────────────────────────────────────────────

export interface FormField {
  key: string;
  label: string;
  type: "input" | "textarea" | "select" | "date" | "tags";
  required?: boolean;
  placeholder?: string;
  rows?: number;
  span?: number; // out of 24 for el-col
  options?: { label: string; value: string }[];
}

export const STORY_FORM_FIELDS: FormField[] = [
  { key: "name", label: "Name", type: "input", required: true, span: 14 },
  { key: "project", label: "Project", type: "select", span: 10 },
  { key: "status", label: "Status", type: "select", span: 12 },
  { key: "priority", label: "Priority", type: "select", span: 12 },
  { key: "description", label: "Description", type: "textarea", rows: 4 },
  { key: "background", label: "Background", type: "textarea", rows: 2 },
  { key: "acceptance", label: "Acceptance Criteria", type: "textarea", rows: 6 },
  { key: "assignee", label: "Assignee", type: "input", span: 12 },
  { key: "startDate", label: "Start Date", type: "date", span: 12 },
  { key: "dueDate", label: "Due Date", type: "date", span: 12 },
  { key: "completedAt", label: "Completed Date", type: "date", span: 12 },
  { key: "tags", label: "Tags", type: "tags" },
];

// ── Scenario form fields ────────────────────────────────────────────────────

export const SCENARIO_FORM_FIELDS: FormField[] = [
  { key: "name", label: "Name", type: "input", required: true },
  { key: "priority", label: "Priority", type: "select", span: 12 },
  { key: "status", label: "Status", type: "select", span: 12 },
  { key: "description", label: "Description", type: "textarea", rows: 2 },
];

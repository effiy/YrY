/** Code Health Analysis — response types from YiAi code_health_service.analyze */

export interface CodeHealthFileInfo {
  path: string;
  total_lines: number;
  code_lines: number;
}

export interface CodeHealthScale {
  total_lines: number;
  file_count: number;
  max_file: { path: string; lines: number };
  avg_lines: number;
  top_files: CodeHealthFileInfo[];
}

export interface CodeHealthDensity {
  comment_lines: number;
  blank_lines: number;
  code_lines: number;
  comment_rate: number;
  blank_rate: number;
}

export interface CodeHealthReuse {
  component_defs: number;
  component_usages: number;
  reuse_rate: number;
  unused_components: { path: string; lines: number }[];
}

export interface CodeHealthDuplication {
  duplicate_blocks: number;
  duplicate_lines: number;
  duplicate_rate: number;
  max_block_size: number;
  top_duplicates: { lines: number; files: string[]; snippet: string }[];
}

export interface CodeHealthAlert {
  level: "warn" | "danger";
  metric: string;
  message: string;
  suggestion: string;
  file: string | null;
}

export interface CodeHealthReport {
  scale: CodeHealthScale;
  density: CodeHealthDensity;
  reuse: CodeHealthReuse;
  duplication: CodeHealthDuplication;
  alerts: CodeHealthAlert[];
  analyzed_at: string;
  project_key: string;
  target_dir: string;
}
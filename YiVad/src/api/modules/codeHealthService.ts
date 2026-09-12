import { callService } from "./dataService";
import type { CodeHealthReport } from "@/api/interface/codeHealth";
import type { YiAiEnvelope } from "@/api/interface/yiAi";

const CODE_HEALTH_SERVICE = "services.code_health_service";

export function analyzeCodeHealth(params: {
  project_key: string;
  target_dir?: string;
  file_extensions?: string[];
  duplicate_min_lines?: number;
  max_file_lines_warn?: number;
  max_file_lines_danger?: number;
}): Promise<YiAiEnvelope<CodeHealthReport>> {
  return callService<CodeHealthReport>(CODE_HEALTH_SERVICE, "analyze", params as Record<string, unknown>);
}
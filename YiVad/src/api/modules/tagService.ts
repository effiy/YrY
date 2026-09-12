/**
 * Tag Management API service.
 */
import { callService } from "./dataService";
import type { Tag, TagUsageStats } from "@/types/tag";

const MODULE = "services.tags.tag_service";

export function listTags(params?: { parent_id?: string; category?: string }) {
  return callService<{ list: Tag[] }>(MODULE, "list_tags", { ...params });
}

export function createTag(data: Partial<Tag>) {
  return callService<Tag>(MODULE, "create_tag", { data });
}

export function updateTag(key: string, data: Partial<Tag>) {
  return callService<Tag>(MODULE, "update_tag", { key, data });
}

export function deleteTag(key: string) {
  return callService<void>(MODULE, "delete_tag", { key });
}

export function mergeTags(source_key: string, target_key: string) {
  return callService<void>(MODULE, "merge_tags", { source_key, target_key });
}

export function cleanupUnusedTags() {
  return callService<{ deleted: number; keys: string[] }>(MODULE, "cleanup_unused", {});
}

export function getTagUsageStats() {
  return callService<TagUsageStats>(MODULE, "tag_usage_stats", {});
}
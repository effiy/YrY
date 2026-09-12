/**
 * Custom Field Definitions API service.
 */
import { callService } from "./dataService";
import type { CustomFieldDef } from "@/types/customField";

const MODULE = "services.custom_fields.custom_field_service";

export function listFieldDefs(entityType?: string) {
  return callService<{ list: CustomFieldDef[] }>(MODULE, "list_field_defs", {
    entityType,
  });
}

export function createFieldDef(data: Partial<CustomFieldDef>) {
  return callService<CustomFieldDef>(MODULE, "create_field_def", { data });
}

export function updateFieldDef(key: string, data: Partial<CustomFieldDef>) {
  return callService<CustomFieldDef>(MODULE, "update_field_def", { key, data });
}

export function deleteFieldDef(key: string) {
  return callService<void>(MODULE, "delete_field_def", { key });
}
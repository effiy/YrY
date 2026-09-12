/**
 * Concurrent batch operation helper for bulk delete/update over RPC.
 * Processes ids in batches of `concurrency` to avoid overwhelming the backend
 * while still being faster than sequential execution.
 */
import http from "@/api/index";

export interface BatchOperationParams {
  collection: string;
  ids: string[];
  operation: "delete" | "update";
  data?: Record<string, any>;
}

export interface BatchOperationResult {
  success: number;
  failed: number;
  errors: Array<{ id: string; error: string }>;
}

const DATA_SERVICE = "services.database.data_service";

export async function executeBatchOperation(
  params: BatchOperationParams,
  concurrency: number = 5
): Promise<BatchOperationResult> {
  const { collection, ids, operation, data } = params;
  const result: BatchOperationResult = { success: 0, failed: 0, errors: [] };

  for (let i = 0; i < ids.length; i += concurrency) {
    const batch = ids.slice(i, i + concurrency);
    const promises = batch.map(async (id) => {
      try {
        if (operation === "delete") {
          await http.post("", {
            module_name: DATA_SERVICE,
            method_name: "delete_document",
            parameters: { cname: collection, key: id },
          }, { cancel: false });
        } else if (operation === "update") {
          await http.post("", {
            module_name: DATA_SERVICE,
            method_name: "update_document",
            parameters: { cname: collection, key: id, data: { ...data, key: id } },
          }, { cancel: false });
        }
        result.success++;
      } catch (error) {
        result.failed++;
        result.errors.push({ id, error: error instanceof Error ? error.message : String(error) });
      }
    });
    await Promise.allSettled(promises);
  }
  return result;
}
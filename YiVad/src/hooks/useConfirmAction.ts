import { ElMessage, ElMessageBox } from "element-plus";
import type { MessageType } from "element-plus";

/**
 * Standardized confirmation dialog + action execution.
 * Eliminates the boilerplate of:
 *   try { await ElMessageBox.confirm(...) } catch { return }
 *   try { await action() } catch { ElMessage.error(...) }
 *
 * Usage:
 *   const confirmed = await confirm("Delete this?", "Warning", "warning");
 *   if (!confirmed) return;  // user cancelled
 *   const ok = await performDelete(key);
 *   if (ok) ElMessage.success("Deleted");
 */
export async function confirm(
  message: string,
  title = "Confirm",
  type: MessageType = "warning"
): Promise<boolean> {
  try {
    await ElMessageBox.confirm(message, title, { type });
    return true;
  } catch {
    return false;
  }
}

/**
 * Run an async action with try/catch + ElMessage.error on failure.
 * Returns true on success, false on error.
 */
export async function tryAction<T>(
  action: () => Promise<T>,
  errorMessage = "Operation failed"
): Promise<T | null> {
  try {
    return await action();
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : errorMessage;
    ElMessage.error(msg);
    return null;
  }
}

/**
 * Confirm + action + success/error message in one call.
 * This is the most common pattern: confirm → execute → notify.
 *
 * @returns true if the action succeeded, false if user cancelled or action failed
 */
export async function confirmAndExecute(
  confirmMessage: string,
  action: () => Promise<unknown>,
  opts?: {
    title?: string;
    type?: MessageType;
    successMessage?: string;
    errorMessage?: string;
  }
): Promise<boolean> {
  const confirmed = await confirm(
    confirmMessage,
    opts?.title ?? "Confirm",
    opts?.type ?? "warning"
  );
  if (!confirmed) return false;

  const result = await tryAction(action, opts?.errorMessage ?? "Operation failed");
  if (result !== null && opts?.successMessage) {
    ElMessage.success(opts.successMessage);
  }
  return result !== null;
}

/**
 * Delete confirmation with consistent wording.
 */
export function deleteConfirm(itemName: string, itemType = "item"): Promise<boolean> {
  return confirm(
    `Are you sure you want to delete ${itemType} "${itemName}"? This action cannot be undone.`,
    "Delete Confirmation",
    "warning"
  );
}

/**
 * Batch delete confirmation with count.
 */
export function batchDeleteConfirm(count: number, itemType = "items"): Promise<boolean> {
  return confirm(
    `Are you sure you want to delete ${count} ${itemType}? This action cannot be undone.`,
    "Batch Delete",
    "warning"
  );
}
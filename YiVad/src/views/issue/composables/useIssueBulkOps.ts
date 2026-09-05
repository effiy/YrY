import { ElMessage, ElMessageBox } from "element-plus";
import type { useIssueStore } from "@/stores/modules/issue";

export function useIssueBulkOps(opts: {
  store: ReturnType<typeof useIssueStore>;
  refreshTable: () => void;
  ISSUE_STATUS_MAP: Record<string, string>;
}) {
  const { store, refreshTable, ISSUE_STATUS_MAP } = opts;

  async function batchDelete(ids: (string | number)[]) {
    ElMessageBox.confirm(`Delete ${ids.length} selected issues?`, "Bulk Delete", {
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      type: "error"
    })
      .then(async () => {
        for (const id of ids) {
          try {
            await store.removeIssue(String(id));
          } catch {
            /* continue */
          }
        }
        ElMessage.success(`${ids.length} issues deleted`);
        refreshTable();
      })
      .catch(() => {});
  }

  async function bulkChangeStatus(
    scope: { selectedListIds?: (string | number)[] },
    status: string
  ) {
    const ids = scope.selectedListIds || [];
    if (!ids.length) return;
    for (const id of ids) {
      try {
        await store.editIssue(String(id), { status: status as any });
      } catch {
        /* continue */
      }
    }
    ElMessage.success(`${ids.length} issues → ${ISSUE_STATUS_MAP[status]}`);
    refreshTable();
  }

  async function openBatchAssign(scope: { selectedListIds?: (string | number)[] }) {
    ElMessageBox.prompt("Enter assignee name", "Batch Assign", {
      confirmButtonText: "Assign",
      inputPlaceholder: "Assignee name"
    })
      .then(async ({ value }) => {
        if (!value) return;
        const ids = scope.selectedListIds || [];
        for (const id of ids) {
          try {
            await store.editIssue(String(id), { assignee: value });
          } catch {
            /* continue */
          }
        }
        ElMessage.success(`${ids.length} issues assigned to "${value}"`);
        refreshTable();
      })
      .catch(() => {});
  }

  return {
    batchDelete,
    bulkChangeStatus,
    openBatchAssign
  };
}

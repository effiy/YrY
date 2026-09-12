import { ElMessage, ElMessageBox } from "element-plus";
import i18n from "@/languages";
import type { useIssueStore } from "@/stores/modules/issue";

const t = (key: string, options?: Record<string, any>) => i18n.global.t(key, options as any);

export function useIssueBulkOps(opts: {
  store: ReturnType<typeof useIssueStore>;
  refreshTable: () => void;
}) {
  const { store, refreshTable } = opts;

  async function batchDelete(ids: (string | number)[]) {
    ElMessageBox.confirm(t("issue.list.bulkDeleteConfirm", { count: ids.length }), t("issue.list.bulkDeleteTitle"), {
      confirmButtonText: t("issue.dialog.delete"),
      cancelButtonText: t("issue.dialog.cancel"),
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
        ElMessage.success(t("issue.list.bulkDeleteSuccess", { count: ids.length }));
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
    ElMessage.success(t("issue.list.bulkStatusChanged", { count: ids.length, status: t(`issue.status.${status}`) }));
    refreshTable();
  }

  async function openBatchAssign(scope: { selectedListIds?: (string | number)[] }) {
    ElMessageBox.prompt(t("issue.list.bulkAssignPrompt"), t("issue.list.bulkAssignTitle"), {
      confirmButtonText: t("issue.list.bulkAssignConfirm"),
      inputPlaceholder: t("issue.dialog.assigneePlaceholder")
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
        ElMessage.success(t("issue.list.bulkAssignSuccess", { count: ids.length, assignee: value }));
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

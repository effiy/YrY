import { ElMessage, ElMessageBox, ElNotification } from "element-plus";

/**
 * Shared message composable — wraps Element Plus message APIs.
 * Mirrors YiVad's useMessage pattern.
 */
export function useMessage() {
  return {
    success(msg: string) {
      ElMessage.success(msg);
    },
    error(msg: string) {
      ElMessage.error(msg);
    },
    warning(msg: string) {
      ElMessage.warning(msg);
    },
    info(msg: string) {
      ElMessage.info(msg);
    },
    notify(title: string, message: string, type: "success" | "error" | "warning" | "info" = "info") {
      ElNotification({ title, message, type });
    },
    confirm(msg: string, title = "Confirm"): Promise<boolean> {
      return ElMessageBox.confirm(msg, title, {
        confirmButtonText: "OK",
        cancelButtonText: "Cancel",
        type: "warning"
      })
        .then(() => true)
        .catch(() => false);
    }
  };
}
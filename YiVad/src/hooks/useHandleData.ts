import { ElMessageBox, ElMessage } from "element-plus";
import i18n from "@/languages";
import { HandleData } from "./interface";

const t = (key: string, options?: Record<string, any>) => i18n.global.t(key, options as any);

/**
 * @description Handle single data entry (confirmation for delete, disable, enable, reset password)
 * @param {Function} api API method for data operation (required)
 * @param {Object} params Operation parameters {id, params} (required)
 * @param {String} message Tip message (required)
 * @param {String} confirmType Icon type (optional, default: warning)
 * @returns {Promise}
 */
export const useHandleData = (
  api: (params: any) => Promise<any>,
  params: any = {},
  message: string,
  confirmType: HandleData.MessageType = "warning"
) => {
  return new Promise((resolve, reject) => {
    ElMessageBox.confirm(`${message}?`, t("common.tips"), {
      confirmButtonText: t("common.confirmButton"),
      cancelButtonText: t("common.cancelButton"),
      type: confirmType,
      draggable: true
    })
      .then(async () => {
        const res = await api(params);
        if (!res) return reject(false);
        ElMessage({
          type: "success",
          message: `${message}${t("common.successSuffix")}`
        });
        resolve(true);
      })
      .catch((err: unknown) => {
        // ElMessageBox rejects with 'cancel'/'close' on user dismissal.
        if (err === "cancel" || err === "close") {
          resolve(false);
          return;
        }
        reject(err);
      });
  });
};

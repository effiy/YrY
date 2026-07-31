import { ElMessageBox, ElMessage } from "element-plus";
import { HandleData } from "./interface";

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
    ElMessageBox.confirm(`${message}?`, "Tips", {
      confirmButtonText: "Confirm",
      cancelButtonText: "Cancel",
      type: confirmType,
      draggable: true
    })
      .then(async () => {
        const res = await api(params);
        if (!res) return reject(false);
        ElMessage({
          type: "success",
          message: `${message} successfully!`
        });
        resolve(true);
      })
      .catch((err: unknown) => {
        // ElMessageBox rejects with 'cancel'/'close' on user dismissal;
        // any other error is an actual API failure that must propagate.
        if (err === "cancel" || err === "close") return;
        reject(err);
      });
  });
};

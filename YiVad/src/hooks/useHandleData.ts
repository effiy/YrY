import { ElMessage } from "element-plus";
import i18n from "@/languages";
import { HandleData } from "./interface";
import { confirm } from "./useConfirmAction";

const t = (key: string, options?: Record<string, any>) => i18n.global.t(key, options as any);

/**
 * @description Handle single data entry (confirmation for delete, disable, enable, reset password)
 */
export const useHandleData = (
  api: (params: any) => Promise<any>,
  params: any = {},
  message: string,
  confirmType: HandleData.MessageType = "warning"
) => {
  return new Promise(async (resolve, reject) => {
    const ok = await confirm(`${message}?`, t("common.tips"), confirmType as any);
    if (!ok) return resolve(false);
    try {
      const res = await api(params);
      if (!res) return reject(false);
      ElMessage({ type: "success", message: `${message}${t("common.successSuffix")}` });
      resolve(true);
    } catch (err: unknown) {
      reject(err);
    }
  });
};

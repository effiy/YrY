import { ElNotification } from "element-plus";

/**
 * @description Receive data stream, generate blob, create link, download file
 * @param {Function} api API method for exporting table (required)
 * @param {String} tempName Exported file name (required)
 * @param {Object} params Export parameters (default: {})
 * @param {Boolean} isNotify Whether to show export notification (default: true)
 * @param {String} fileType Export file format (default: .xlsx)
 * */
export const useDownload = async (
  api: (param: any) => Promise<any>,
  tempName: string,
  params: any = {},
  isNotify: boolean = true,
  fileType: string = ".xlsx"
) => {
  if (isNotify) {
    ElNotification({
      title: "Tips",
      message: "Large data may cause slow download, please be patient!",
      type: "info",
      duration: 3000
    });
  }
  try {
    const res = await api(params);
    const blob = new Blob([res]);
    // Edge compatibility: does not support createObjectURL method
    if ("msSaveOrOpenBlob" in navigator) return window.navigator.msSaveOrOpenBlob(blob, tempName + fileType);
    const blobUrl = window.URL.createObjectURL(blob);
    const exportFile = document.createElement("a");
    exportFile.style.display = "none";
    exportFile.download = `${tempName}${fileType}`;
    exportFile.href = blobUrl;
    document.body.appendChild(exportFile);
    exportFile.click();
    // Remove download link impact on URL
    document.body.removeChild(exportFile);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.log(error);
  }
};

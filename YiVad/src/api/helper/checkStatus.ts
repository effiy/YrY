import { ElMessage } from "element-plus";

/**
 * @description: Validate network request status codes
 * @param {Number} status
 * @return void
 */
export const checkStatus = (status: number) => {
  switch (status) {
    case 400:
      ElMessage.error("Request failed! Please try again later");
      break;
    case 401:
      ElMessage.error("Login expired! Please login again");
      break;
    case 403:
      ElMessage.error("Current account has no permission to access!");
      break;
    case 404:
      ElMessage.error("The resource you are accessing does not exist!");
      break;
    case 405:
      ElMessage.error("Request method error! Please try again later");
      break;
    case 408:
      ElMessage.error("Request timed out! Please try again later");
      break;
    case 500:
      ElMessage.error("Service error!");
      break;
    case 502:
      ElMessage.error("Gateway error!");
      break;
    case 503:
      ElMessage.error("Service unavailable!");
      break;
    case 504:
      ElMessage.error("Gateway timeout!");
      break;
    default:
      ElMessage.error("Request failed!");
  }
};

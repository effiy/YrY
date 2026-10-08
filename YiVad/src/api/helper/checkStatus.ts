import { ElMessage } from "element-plus";

/**
 * @description: Validate network request status codes
 * @param {Number} status
 * @param {String} url
 * @return void
 */
export const checkStatus = (status: number, url?: string) => {
  const suffix = url ? ` (${url})` : "";
  switch (status) {
    case 400:
      ElMessage.error(`Invalid request! Please check the request parameters${suffix}`);
      break;
    case 401:
      ElMessage.error("Login expired! Please login again");
      break;
    case 403:
      ElMessage.error(`Current account has no permission to access${suffix}!`);
      break;
    case 404:
      ElMessage.error(`The resource you are accessing does not exist${suffix}!`);
      break;
    case 405:
      ElMessage.error(`Request method error! Please try again later${suffix}`);
      break;
    case 408:
      ElMessage.error(`Request timed out! Please try again later${suffix}`);
      break;
    case 429:
      ElMessage.error(`Too many requests! Please try again later${suffix}`);
      break;
    case 500:
      ElMessage.error(`Server error${suffix}!`);
      break;
    case 502:
      ElMessage.error(`Gateway error${suffix}!`);
      break;
    case 503:
      ElMessage.error(`Service unavailable${suffix}!`);
      break;
    case 504:
      ElMessage.error(`Gateway timeout${suffix}!`);
      break;
    default:
      ElMessage.error(`Request failed${suffix}!`);
  }
};

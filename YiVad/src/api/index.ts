import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig, AxiosResponse } from "axios";
import { showFullScreenLoading, tryHideFullScreenLoading } from "@/components/Loading/fullScreen";
import { LOGIN_URL } from "@/config";
import { ElMessage } from "element-plus";
import { ResultData } from "@/api/interface";
import { ResultEnum } from "@/enums/httpEnum";
import { checkStatus } from "./helper/checkStatus";
import { AxiosCanceler } from "./helper/axiosCancel";
import { useUserStore } from "@/stores/modules/user";
import router from "@/routers";

export interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  loading?: boolean;
  cancel?: boolean;
}

const config = {
  // Default request address, can be modified in .env.** files
  baseURL: import.meta.env.RSBUILD_ENV_API_URL as string,
  // Set timeout
  timeout: ResultEnum.TIMEOUT as number,
  // Allow credentials on cross-origin requests
  withCredentials: true
};

const axiosCanceler = new AxiosCanceler();

class RequestHttp {
  service: AxiosInstance;
  public constructor(config: AxiosRequestConfig) {
    // instantiation
    this.service = axios.create(config);

    /**
     * @description Request interceptor
     * Client sends request -> [Request interceptor] -> Server
     * Token verification (JWT): Accept the token returned by the server and store it in vuex/pinia/local storage
     */
    this.service.interceptors.request.use(
      (config: CustomAxiosRequestConfig) => {
        const userStore = useUserStore();
        // Duplicate requests do not need to be cancelled, controlled in the api service via the third parameter: { cancel: false }
        config.cancel ??= true;
        config.cancel && axiosCanceler.addPending(config);
        // The current request does not need to show loading, controlled in the api service via the third parameter: { loading: false }
        config.loading ??= true;
        config.loading && showFullScreenLoading();
        if (config.headers && typeof config.headers.set === "function") {
          config.headers.set("Authorization", `Bearer ${userStore.token}`);
        }
        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );

    /**
     * @description Response interceptor
     * Server returns info -> [Unified interceptor processing] -> Client JS receives info
     */
    this.service.interceptors.response.use(
      (response: AxiosResponse & { config: CustomAxiosRequestConfig }) => {
        const { data, config } = response;

        const userStore = useUserStore();
        axiosCanceler.removePending(config);
        config.loading && tryHideFullScreenLoading();
        // Login expired
        if (data.code == ResultEnum.OVERDUE) {
          userStore.setToken("");
          router.replace(LOGIN_URL);
          ElMessage.error(data.message || data.msg);
          return Promise.reject(data);
        }
        // Global error message interception (prevents errors when downloading files returns data streams without code)
        if (data.code && data.code !== ResultEnum.SUCCESS) {
          ElMessage.error(data.message || data.msg);
          return Promise.reject(data);
        }
        // Successful request (no need to handle failure logic on the page unless in special cases)
        return data;
      },
      async (error: AxiosError) => {
        const { response } = error;
        // Mirror the success path: only decrement the loading counter if THIS
        // request actually incremented it (config.loading === true). The
        // previous unconditional call corrupted the counter when a
        // `{ loading: false }` request (e.g. background poll, auto-save,
        // WeCom auto-forward) errored while a `loading:true` request was
        // still in flight — the spinner would disappear prematurely.
        const config = (error.config ?? response?.config) as CustomAxiosRequestConfig | undefined;
        if (config) {
          axiosCanceler.removePending(config);
          if (config.loading) tryHideFullScreenLoading();
        } else {
          tryHideFullScreenLoading();
        }
        // Request timeout && network error judged separately, no response
        if (error.message.indexOf("timeout") !== -1) ElMessage.error("Request timed out! Please try again later");
        if (error.message.indexOf("Network Error") !== -1) ElMessage.error("Network error! Please try again later");
        // Handle differently based on the error status code from the server response
        if (response) checkStatus(response.status);
        // No server result returned (possibly server error or client disconnected), network disconnection handling: can navigate to offline page
        if (!window.navigator.onLine) router.replace("/500");
        return Promise.reject(error);
      }
    );
  }

  /**
   * @description Common request method wrapper
   */
  get<T>(url: string, params?: object, _object = {}): Promise<ResultData<T>> {
    return this.service.get(url, { params, ..._object });
  }
  post<T>(url: string, params?: object | string, _object = {}): Promise<ResultData<T>> {
    return this.service.post(url, params, _object);
  }
  put<T>(url: string, params?: object, _object = {}): Promise<ResultData<T>> {
    return this.service.put(url, params, _object);
  }
  delete<T>(url: string, params?: any, _object = {}): Promise<ResultData<T>> {
    return this.service.delete(url, { params, ..._object });
  }
  download(url: string, params?: object, _object = {}): Promise<BlobPart> {
    return this.service.post(url, params, { ..._object, responseType: "blob" });
  }
}

export default new RequestHttp(config);

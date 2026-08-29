import http from "@/api";
import { Login } from "@/api/interface/index";
import authMenuList from "@/assets/json/authMenuList.json";
import authButtonList from "@/assets/json/authButtonList.json";

/**
 * @name Login module — calls YiAi /auth/* REST endpoints.
 * YiAi exposes a real REST surface for auth (login, logout, token refresh,
 * current user info, menu list, button permissions) — these stay on
 * `http.get/post` rather than the RPC data-service.
 */

// User login
export const loginApi = (params: Login.ReqLoginForm) => {
  return http.post<Login.ResLogin>(`/auth/login`, params, { loading: false });
};

// Get menu list from YiAi (falls back to local JSON on failure)
export const getAuthMenuListApi = async (): Promise<any> => {
  try {
    const res = await http.get<Menu.MenuOptions[]>(`/auth/menu/list`, {}, { loading: false });
    return res;
  } catch {
    // Fallback to local JSON when YiAi is unavailable
    return authMenuList;
  }
};

// Get button permissions from YiAi (falls back to local JSON on failure)
export const getAuthButtonListApi = async (): Promise<any> => {
  try {
    const res = await http.get<Login.ResAuthButtons>(`/auth/buttons`, {}, { loading: false });
    return res;
  } catch {
    // Fallback to local JSON when YiAi is unavailable
    return authButtonList;
  }
};

// User logout
export const logoutApi = () => {
  return http.post(`/auth/logout`);
};

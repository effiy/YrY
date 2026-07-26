import { Login } from "@/api/interface/index";
import { PORT1 } from "@/api/config/servicePort";
import authMenuList from "@/assets/json/authMenuList.json";
import authButtonList from "@/assets/json/authButtonList.json";
import http from "@/api";

/**
 * @name Login module
 */
// User login
export const loginApi = (params: Login.ReqLoginForm) => {
  return http.post<Login.ResLogin>(PORT1 + `/login`, params, { loading: false }); // Normal post json request  ==>  application/json
  // return http.post<Login.ResLogin>(PORT1 + `/login`, params, { loading: false }); // Control the current request to not display loading
  // return http.post<Login.ResLogin>(PORT1 + `/login`, {}, { params }); // Post request with query params  ==>  ?username=admin&password=123456
  // return http.post<Login.ResLogin>(PORT1 + `/login`, qs.stringify(params)); // Post request with form params  ==>  application/x-www-form-urlencoded
  // return http.get<Login.ResLogin>(PORT1 + `/login?${qs.stringify(params, { arrayFormat: "repeat" })}`); // Get request can carry complex params like arrays
};

// Get menu list
export const getAuthMenuListApi = () => {
  return http.get<Menu.MenuOptions[]>(PORT1 + `/menu/list`, {}, { loading: false });
  // If you want the menu to use local data, comment out the line above and import local authMenuList.json data
  return authMenuList;
};

// Get button permissions
export const getAuthButtonListApi = () => {
  return http.get<Login.ResAuthButtons>(PORT1 + `/auth/buttons`, {}, { loading: false });
  // If you want button permissions to use local data, comment out the line above and import local authButtonList.json data
  return authButtonList;
};

// User logout
export const logoutApi = () => {
  return http.post(PORT1 + `/logout`);
};

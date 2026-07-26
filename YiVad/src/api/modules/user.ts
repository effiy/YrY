import { ResPage, User } from "@/api/interface/index";
import { PORT1 } from "@/api/config/servicePort";
import http from "@/api";

/**
 * @name User management module
 */
// Get user list
export const getUserList = (params: User.ReqUserParams) => {
  return http.post<ResPage<User.ResUserList>>(PORT1 + `/user/list`, params);
};

// Get tree user list
export const getUserTreeList = (params: User.ReqUserParams) => {
  return http.post<ResPage<User.ResUserList>>(PORT1 + `/user/tree/list`, params);
};

// Add user
export const addUser = (params: { id: string }) => {
  return http.post(PORT1 + `/user/add`, params);
};

// Batch add users
export const BatchAddUser = (params: FormData) => {
  return http.post(PORT1 + `/user/import`, params);
};

// Edit user
export const editUser = (params: { id: string }) => {
  return http.post(PORT1 + `/user/edit`, params);
};

// Delete user
export const deleteUser = (params: { id: string[] }) => {
  return http.post(PORT1 + `/user/delete`, params);
};

// Toggle user status
export const changeUserStatus = (params: { id: string; status: number }) => {
  return http.post(PORT1 + `/user/change`, params);
};

// Reset user password
export const resetUserPassWord = (params: { id: string }) => {
  return http.post(PORT1 + `/user/rest_password`, params);
};

// Export user data
export const exportUserInfo = (params: User.ReqUserParams) => {
  return http.download(PORT1 + `/user/export`, params);
};

// Get user status dictionary
export const getUserStatus = () => {
  return http.get<User.ResStatus[]>(PORT1 + `/user/status`);
};

// Get user gender dictionary
export const getUserGender = () => {
  return http.get<User.ResGender[]>(PORT1 + `/user/gender`);
};

// Get user department list
export const getUserDepartment = () => {
  return http.get<User.ResDepartment[]>(PORT1 + `/user/department`, {}, { cancel: false });
};

// Get user role dictionary
export const getUserRole = () => {
  return http.get<User.ResRole[]>(PORT1 + `/user/role`);
};

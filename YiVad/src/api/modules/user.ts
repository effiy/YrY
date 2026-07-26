import { ResPage, User } from "@/api/interface/index";
import http from "@/api";

/**
 * @name User management module — calls YiAi /users/* REST routes
 */

// ── User CRUD ──

// Get user list (paginated)
export const getUserList = (params: User.ReqUserParams) => {
  return http.post<ResPage<User.ResUserList>>(`/users/list`, params);
};

// Get tree user list
export const getUserTreeList = (params: User.ReqUserParams) => {
  return http.post<ResPage<User.ResUserList>>(`/users/tree`, params);
};

// Add user
export const addUser = (params: Record<string, any>) => {
  return http.post(`/users`, params);
};

// Batch add users (FormData multipart)
export const BatchAddUser = (params: FormData) => {
  return http.post(`/users/batch`, params);
};

// Edit user
export const editUser = (params: Record<string, any>) => {
  return http.put(`/users/${params.key}`, params);
};

// Delete user
export const deleteUser = (params: { id: string[] }) => {
  return http.delete(`/users/${params.id[0]}`);
};

// Toggle user status
export const changeUserStatus = (params: { id: string; status: number }) => {
  return http.put(`/users/${params.id}`, { status: params.status });
};

// Reset user password
export const resetUserPassWord = (params: { id: string }) => {
  return http.put(`/users/${params.id}`, { password: "" });
};

// Export user data
export const exportUserInfo = (params: User.ReqUserParams) => {
  return http.download(`/users/export`, params);
};

// ── Dictionary queries ──

// Get user status dictionary
export const getUserStatus = () => {
  return http.get<User.ResStatus[]>(`/users/dict/status`);
};

// Get user gender dictionary
export const getUserGender = () => {
  return http.get<User.ResGender[]>(`/users/dict/gender`);
};

// Get user department tree
export const getUserDepartment = () => {
  return http.get<User.ResDepartment[]>(`/users/dict/department`, {}, { cancel: false });
};

// Get user role tree
export const getUserRole = () => {
  return http.get<User.ResRole[]>(`/users/dict/role`);
};

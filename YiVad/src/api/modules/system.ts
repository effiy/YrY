import http from "@/api";

/**
 * @name System management module — calls YiAi /system/* routes
 */

// ── Menus ──
export const getMenuList = () => http.get(`/system/menus`);
export const createMenu = (params: Record<string, any>) => http.post(`/system/menus`, params);
export const updateMenu = (key: string, params: Record<string, any>) => http.put(`/system/menus/${key}`, params);
export const deleteMenu = (key: string) => http.delete(`/system/menus/${key}`);

// ── Departments ──
export const getDepartmentList = () => http.get(`/system/departments`);
export const createDepartment = (params: Record<string, any>) => http.post(`/system/departments`, params);
export const updateDepartment = (key: string, params: Record<string, any>) => http.put(`/system/departments/${key}`, params);
export const deleteDepartment = (key: string) => http.delete(`/system/departments/${key}`);

// ── Roles ──
export const getRoleList = () => http.get(`/system/roles`);
export const createRole = (params: Record<string, any>) => http.post(`/system/roles`, params);
export const updateRole = (key: string, params: Record<string, any>) => http.put(`/system/roles/${key}`, params);
export const deleteRole = (key: string) => http.delete(`/system/roles/${key}`);

// ── Dictionaries ──
export const getDictList = () => http.get(`/system/dicts`);
export const getDictItems = (name: string) => http.get(`/system/dicts/${name}`);
export const createDictItem = (name: string, params: Record<string, any>) => http.post(`/system/dicts/${name}`, params);
export const updateDictItem = (name: string, key: string, params: Record<string, any>) =>
  http.put(`/system/dicts/${name}/${key}`, params);
export const deleteDictItem = (name: string, key: string) => http.delete(`/system/dicts/${name}/${key}`);

// ── Scheduler ──
export const getSchedulerStatus = () => http.get(`/system/scheduler`);

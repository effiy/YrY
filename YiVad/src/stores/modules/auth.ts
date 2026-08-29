import { defineStore } from "pinia";
import { AuthState } from "@/stores/interface";
import { getAuthButtonListApi, getAuthMenuListApi } from "@/api/modules/login";
import { getFlatMenuList, getShowMenuList, getAllBreadcrumbList, sortMenuTree } from "@/utils";

export const useAuthStore = defineStore("yivad-auth", {
  state: (): AuthState => ({
    // Button permission list
    authButtonList: {},
    // Menu permission list
    authMenuList: [],
    // Current page router name, used for button permission filtering
    routeName: ""
  }),
  getters: {
    // Button permission list
    authButtonListGet: state => state.authButtonList,
    // Menu permission list ==> raw menu data without any processing
    authMenuListGet: state => state.authMenuList,
    // Menu permission list ==> filtered for sidebar rendering (isHide == true items excluded), sorted alphabetically
    showMenuListGet: state => sortMenuTree(getShowMenuList(state.authMenuList)),
    // Menu permission list ==> flattened 1D array, primarily used for adding dynamic routes
    flatMenuListGet: state => getFlatMenuList(state.authMenuList),
    // Recursively processed breadcrumb navigation list
    breadcrumbListGet: state => getAllBreadcrumbList(state.authMenuList)
  },
  actions: {
    // Get AuthButtonList
    async getAuthButtonList() {
      const { data } = await getAuthButtonListApi();
      this.authButtonList = data;
    },
    // Get AuthMenuList
    async getAuthMenuList() {
      const { data } = await getAuthMenuListApi();
      this.authMenuList = data;
    },
    // Set RouteName
    async setRouteName(name: string) {
      this.routeName = name;
    }
  }
});

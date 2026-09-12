import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { getAuthButtonListApi, getAuthMenuListApi } from "@/api/modules/login";
import { getFlatMenuList, getShowMenuList, getAllBreadcrumbList, sortMenuTree } from "@/utils";

export const useAuthStore = defineStore("yivad-auth", () => {
  const authButtonList = ref<Record<string, string[]>>({});
  const authMenuList = ref<MenuItem[]>([]);
  const routeName = ref("");

  // Getters
  const authButtonListGet = computed(() => authButtonList.value);
  const authMenuListGet = computed(() => authMenuList.value);
  const showMenuListGet = computed(() => sortMenuTree(getShowMenuList(authMenuList.value)));
  const flatMenuListGet = computed(() => getFlatMenuList(authMenuList.value));
  const breadcrumbListGet = computed(() => getAllBreadcrumbList(authMenuList.value));

  // Actions
  async function getAuthButtonList() {
    const { data } = await getAuthButtonListApi();
    authButtonList.value = data;
  }

  async function getAuthMenuList() {
    const { data } = await getAuthMenuListApi();
    authMenuList.value = data;
  }

  async function setRouteName(name: string) {
    routeName.value = name;
  }

  return { authButtonList, authMenuList, routeName, authButtonListGet, authMenuListGet, showMenuListGet, flatMenuListGet, breadcrumbListGet, getAuthButtonList, getAuthMenuList, setRouteName };
});

import { defineStore } from "pinia";
import { ref } from "vue";
import { getReleaseList, getRelease, createRelease, updateRelease, deleteRelease } from "@/api/modules/releaseService";
import type { Release, ReleaseQueryParams } from "@/api/modules/releaseService";

export const useReleaseStore = defineStore("release", () => {
  const releases = ref<Release[]>([]);
  const currentRelease = ref<Release | null>(null);
  const total = ref(0);
  const loading = ref(false);

  async function fetchReleases(params: ReleaseQueryParams = {}) {
    loading.value = true;
    try {
      const res = await getReleaseList(params);
      releases.value = (res.data?.list as Release[]) ?? [];
      total.value = res.data?.total ?? 0;
    } finally {
      loading.value = false;
    }
  }

  async function fetchRelease(key: string) {
    const res = await getRelease(key);
    const list = (res.data?.list as Release[]) ?? [];
    currentRelease.value = list[0] ?? null;
    return currentRelease.value;
  }

  async function addRelease(data: Omit<Release, "created_at" | "updated_at">) {
    await createRelease(data);
    await fetchReleases({ project_key: data.project_key });
  }

  async function editRelease(key: string, data: Partial<Release>) {
    await updateRelease(key, data);
    if (currentRelease.value?.key === key) {
      currentRelease.value = { ...currentRelease.value, ...data };
    }
    await fetchReleases();
  }

  async function removeRelease(key: string, project_key?: string) {
    await deleteRelease(key);
    if (currentRelease.value?.key === key) {
      currentRelease.value = null;
    }
    if (project_key) {
      await fetchReleases({ project_key });
    }
  }

  return {
    releases,
    currentRelease,
    total,
    loading,
    fetchReleases,
    fetchRelease,
    addRelease,
    editRelease,
    removeRelease
  };
});
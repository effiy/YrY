import { defineStore } from "pinia";
import { ref } from "vue";
import piniaPersistConfig from "@/stores/helper/persist";

export const useUserStore = defineStore(
  "yivad-user",
  () => {
    const token = ref("");
    const userInfo = ref<{ name: string }>({ name: "Admin" });

    function setToken(newToken: string) {
      token.value = newToken;
    }

    function setUserInfo(info: { name: string }) {
      userInfo.value = info;
    }

    return { token, userInfo, setToken, setUserInfo };
  },
  { persist: piniaPersistConfig("yivad-user") }
);

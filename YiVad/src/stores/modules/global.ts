import { defineStore } from "pinia";
import { GlobalState } from "@/stores/interface";
import { DEFAULT_PRIMARY } from "@/config";
import piniaPersistConfig from "@/stores/helper/persist";

export const useGlobalStore = defineStore({
  id: "yivad-global",
  // After modifying default values, clear localStorage data
  state: (): GlobalState => ({
    // Layout mode (vertical | classic | transverse | columns)
    layout: "vertical",
    // Element component size
    assemblySize: "default",
    // Current system language
    language: null,
    // Whether the current page is maximized
    maximize: false,
    // Theme color
    primary: DEFAULT_PRIMARY,
    // Dark mode
    isDark: false,
    // Grey mode
    isGrey: false,
    // Color weakness mode
    isWeak: false,
    // Sidebar inverted
    asideInverted: false,
    // Header inverted
    headerInverted: false,
    // Collapse menu
    isCollapse: false,
    // Menu accordion
    accordion: true,
    // Page watermark
    watermark: false,
    // Breadcrumb navigation
    breadcrumb: true,
    // Breadcrumb icon
    breadcrumbIcon: true,
    // Tabs
    tabs: true,
    // Tab icons
    tabsIcon: true,
    // Footer
    footer: true
  }),
  getters: {},
  actions: {
    // Set GlobalState
    setGlobalState(...args: ObjToKeyValArray<GlobalState>) {
      this.$patch({ [args[0]]: args[1] });
    }
  },
  persist: piniaPersistConfig("yivad-global")
});

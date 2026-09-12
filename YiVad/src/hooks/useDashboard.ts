import { ref, computed, watch } from "vue";
import { useDashboardStore, type WidgetConfig, type WidgetLayout } from "@/stores/dashboard";

function uid(): string {
  return `w-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useDashboard(dashboardId?: string) {
  const store = useDashboardStore();

  const allDashboards = computed(() => store.dashboards);

  const currentDashboard = computed(() => {
    const id = dashboardId ?? store.currentId;
    return id ? store.getDashboard(id) ?? null : null;
  });

  const widgets = computed(() => currentDashboard.value?.widgets ?? []);
  const lastSaved = ref<string>("");

  const isFullscreen = ref(false);
  const isRefreshing = ref(false);
  const showWidgetPicker = ref(false);
  const showWidgetSettings = ref(false);
  const editingWidgetId = ref<string>("");

  const editingWidget = computed(() => {
    if (!editingWidgetId.value || !currentDashboard.value) return null;
    return currentDashboard.value.widgets.find(w => w.id === editingWidgetId.value) ?? null;
  });

  function initDashboard(name = "默认仪表盘") {
    if (store.dashboards.length === 0) {
      store.createDashboard(name);
    }
    if (dashboardId) {
      store.selectDashboard(dashboardId);
    } else if (!store.currentId && store.dashboards.length > 0) {
      store.selectDashboard(store.dashboards[0].id);
    }
  }

  function addWidgetFromPicker(widgetOption: { type: string; name: string; defaultSize: { cols: number; rows: number } }) {
    if (!currentDashboard.value) return;
    const widget: WidgetConfig = {
      id: uid(),
      widgetType: widgetOption.type,
      title: widgetOption.name,
      layout: {
        x: 0,
        y: Math.max(...widgets.value.map(w => w.layout.y + w.layout.rows), 0),
        cols: widgetOption.defaultSize.cols,
        rows: widgetOption.defaultSize.rows,
      },
      dataSource: "static",
      refreshInterval: 0,
      chartType: widgetOption.type,
    };
    store.addWidget(currentDashboard.value.id, widget);
  }

  function removeWidget(widgetId: string) {
    if (!currentDashboard.value) return;
    store.removeWidget(currentDashboard.value.id, widgetId);
  }

  function openWidgetSettings(widgetId: string) {
    editingWidgetId.value = widgetId;
    showWidgetSettings.value = true;
  }

  function saveWidgetSettings(config: WidgetConfig) {
    if (!currentDashboard.value) return;
    store.updateWidget(currentDashboard.value.id, config.id, config);
  }

  function resizeWidget(widgetId: string, layout: WidgetLayout) {
    if (!currentDashboard.value) return;
    store.updateWidgetLayout(currentDashboard.value.id, widgetId, layout);
  }

  function saveLayout() {
    if (!currentDashboard.value) return;
    store.saveLayout(currentDashboard.value.id);
    lastSaved.value = new Date().toLocaleTimeString();
  }

  async function refreshAll() {
    isRefreshing.value = true;
    await new Promise(r => setTimeout(r, 600));
    isRefreshing.value = false;
    lastSaved.value = new Date().toLocaleTimeString();
  }

  function toggleFullscreen() {
    isFullscreen.value = !isFullscreen.value;
  }

  function createNewDashboard(name: string) {
    store.createDashboard(name);
  }

  function switchDashboard(id: string) {
    store.selectDashboard(id);
  }

  return {
    allDashboards,
    currentDashboard,
    widgets,
    lastSaved,
    isFullscreen,
    isRefreshing,
    showWidgetPicker,
    showWidgetSettings,
    editingWidgetId,
    editingWidget,
    initDashboard,
    addWidgetFromPicker,
    removeWidget,
    openWidgetSettings,
    saveWidgetSettings,
    resizeWidget,
    saveLayout,
    refreshAll,
    toggleFullscreen,
    createNewDashboard,
    switchDashboard,
  };
}
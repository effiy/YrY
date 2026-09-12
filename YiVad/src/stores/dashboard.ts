import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";

export interface WidgetLayout {
  x: number;
  y: number;
  cols: number;
  rows: number;
}

export interface WidgetConfig {
  id: string;
  widgetType: string;
  title: string;
  layout: WidgetLayout;
  dataSource: "static" | "rpc";
  refreshInterval: number;
  chartType?: string;
  rpc?: { moduleName: string; methodName: string };
  props?: Record<string, unknown>;
  component?: unknown;
}

export interface DashboardConfig {
  id: string;
  name: string;
  description?: string;
  widgets: WidgetConfig[];
  refreshInterval?: number;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "yivad-dashboards";

function loadDashboards(): DashboardConfig[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveDashboards(dashboards: DashboardConfig[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dashboards));
}

export const useDashboardStore = defineStore("dashboard", () => {
  const dashboards = ref<DashboardConfig[]>(loadDashboards());
  const currentId = ref<string>("");

  const currentDashboard = computed(() =>
    dashboards.value.find(d => d.id === currentId.value) ?? null
  );

  const currentWidgets = computed(() =>
    currentDashboard.value?.widgets ?? []
  );

  watch(dashboards, (val) => saveDashboards(val), { deep: true });

  function generateId(): string {
    return `w-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function createDashboard(name: string, description?: string): DashboardConfig {
    const now = new Date().toISOString();
    const dashboard: DashboardConfig = {
      id: generateId(),
      name,
      description,
      widgets: [],
      refreshInterval: 60,
      createdAt: now,
      updatedAt: now,
    };
    dashboards.value.push(dashboard);
    currentId.value = dashboard.id;
    return dashboard;
  }

  function selectDashboard(id: string) {
    currentId.value = id;
  }

  function deleteDashboard(id: string) {
    dashboards.value = dashboards.value.filter(d => d.id !== id);
    if (currentId.value === id) {
      currentId.value = dashboards.value[0]?.id ?? "";
    }
  }

  function renameDashboard(id: string, name: string) {
    const d = dashboards.value.find(d => d.id === id);
    if (d) {
      d.name = name;
      d.updatedAt = new Date().toISOString();
    }
  }

  function addWidget(dashboardId: string, widget: WidgetConfig) {
    const d = dashboards.value.find(d => d.id === dashboardId);
    if (d) {
      d.widgets.push(widget);
      d.updatedAt = new Date().toISOString();
    }
  }

  function removeWidget(dashboardId: string, widgetId: string) {
    const d = dashboards.value.find(d => d.id === dashboardId);
    if (d) {
      d.widgets = d.widgets.filter(w => w.id !== widgetId);
      d.updatedAt = new Date().toISOString();
    }
  }

  function updateWidget(dashboardId: string, widgetId: string, updates: Partial<WidgetConfig>) {
    const d = dashboards.value.find(d => d.id === dashboardId);
    if (d) {
      const idx = d.widgets.findIndex(w => w.id === widgetId);
      if (idx !== -1) {
        d.widgets[idx] = { ...d.widgets[idx], ...updates };
        d.updatedAt = new Date().toISOString();
      }
    }
  }

  function updateWidgetLayout(dashboardId: string, widgetId: string, layout: WidgetLayout) {
    updateWidget(dashboardId, widgetId, { layout });
  }

  function saveLayout(dashboardId: string) {
    const d = dashboards.value.find(d => d.id === dashboardId);
    if (d) {
      d.updatedAt = new Date().toISOString();
    }
  }

  function getDashboard(id: string): DashboardConfig | undefined {
    return dashboards.value.find(d => d.id === id);
  }

  return {
    dashboards,
    currentId,
    currentDashboard,
    currentWidgets,
    createDashboard,
    selectDashboard,
    deleteDashboard,
    renameDashboard,
    addWidget,
    removeWidget,
    updateWidget,
    updateWidgetLayout,
    saveLayout,
    getDashboard,
  };
});
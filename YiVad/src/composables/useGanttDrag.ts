import { ref, type Ref } from "vue";
import type { GanttTask } from "@/types/gantt";

interface DragState {
  taskId: string | null;
  edge: "left" | "right" | "move" | null;
  startX: number;
  startDate: string;
  startEndDate: string;
}

export function useGanttDrag(
  tasks: Ref<GanttTask[]>,
  dayWidth: Ref<number>,
  onUpdate: (taskId: string, start: string, end: string) => Promise<void>,
) {
  const dragState = ref<DragState>({
    taskId: null,
    edge: null,
    startX: 0,
    startDate: "",
    startEndDate: "",
  });
  const isDragging = ref(false);

  function onDragStart(taskId: string, edge: "left" | "right" | "move", clientX: number) {
    const task = tasks.value.find((t) => t.id === taskId);
    if (!task) return;
    dragState.value = {
      taskId,
      edge,
      startX: clientX,
      startDate: task.start_date,
      startEndDate: task.end_date,
    };
    isDragging.value = true;
  }

  function onDragMove(clientX: number) {
    if (!isDragging.value || !dragState.value.taskId) return;
    const deltaDays = Math.round((clientX - dragState.value.startX) / dayWidth.value);
    const task = tasks.value.find((t) => t.id === dragState.value.taskId);
    if (!task) return;

    const start = new Date(dragState.value.startDate);
    const end = new Date(dragState.value.startEndDate);

    if (dragState.value.edge === "left") {
      start.setDate(start.getDate() + deltaDays);
      if (start < end) task.start_date = start.toISOString().split("T")[0];
    } else if (dragState.value.edge === "right") {
      end.setDate(end.getDate() + deltaDays);
      if (end > start) task.end_date = end.toISOString().split("T")[0];
    } else {
      start.setDate(start.getDate() + deltaDays);
      end.setDate(end.getDate() + deltaDays);
      task.start_date = start.toISOString().split("T")[0];
      task.end_date = end.toISOString().split("T")[0];
    }
  }

  async function onDragEnd() {
    if (dragState.value.taskId) {
      const task = tasks.value.find((t) => t.id === dragState.value.taskId);
      if (task) {
        await onUpdate(task.id, task.start_date, task.end_date);
      }
    }
    isDragging.value = false;
  }

  return { dragState, isDragging, onDragStart, onDragMove, onDragEnd };
}
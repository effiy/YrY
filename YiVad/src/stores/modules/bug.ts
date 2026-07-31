/**
 * Bug management — Pinia store. Metadata lives in MongoDB (bugs collection);
 * long-form content (description / steps / expected / actual) lives in a
 * markdown file under ~/YiKnowledge/lessons/failures/bugs/<key>.md.
 */
import { defineStore } from "pinia";
import { ref, reactive } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  getBugList,
  getBug,
  createBug,
  updateBug,
  deleteBug,
  readBugContent
} from "@/api/modules/bug";
import type {
  BugDocument,
  BugContent,
  BugSeverity,
  BugPriority,
  BugStatus,
  BugType,
  BugFrequency
} from "@/api/modules/bug";

export type { BugDocument, BugContent, BugSeverity, BugPriority, BugStatus, BugType, BugFrequency };

function newKey(): string {
  return `bug_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function emptyForm() {
  return {
    key: "",
    title: "",
    project: "",
    module: "",
    iteration: "",
    defectUrl: "",
    severity: "minor" as BugSeverity,
    priority: "p2" as BugPriority,
    status: "open" as BugStatus,
    type: "functional" as BugType,
    assignee: "",
    reporter: "",
    environment: "",
    affectedVersion: "",
    fixedVersion: "",
    frequency: "sometimes" as BugFrequency,
    tags: [] as string[],
    dueDate: null as Date | null,
    // Content (markdown body)
    description: "",
    stepsToReproduce: "",
    expectedResult: "",
    actualResult: "",
    causeProblem: "",
    solution: ""
  };
}

export const useBugStore = defineStore("yivad-bug", () => {
  const bugs = ref<BugDocument[]>([]);
  const total = ref(0);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const selectedBug = ref<BugDocument | null>(null);
  const selectedBugContent = ref<BugContent | null>(null);
  const detailLoading = ref(false);

  const dialogVisible = ref(false);
  const isEdit = ref(false);
  const saving = ref(false);
  const form = reactive(emptyForm());

  function resetForm() {
    Object.assign(form, emptyForm());
  }

  async function fetchBugs() {
    loading.value = true;
    error.value = null;
    try {
      const res = await getBugList({ pageNum: 1, pageSize: 500 });
      bugs.value = res.data?.list ?? [];
      total.value = res.data?.total ?? 0;
    } catch (e: any) {
      error.value = e?.message || "Failed to load bugs";
    } finally {
      loading.value = false;
    }
  }

  async function loadDetail(key: string) {
    detailLoading.value = true;
    selectedBugContent.value = null;
    try {
      const bug = await getBug(key);
      selectedBug.value = bug;
      if (bug?.contentPath) {
        selectedBugContent.value = await readBugContent(bug.contentPath);
      } else {
        selectedBugContent.value = {
          description: "",
          stepsToReproduce: [],
          expectedResult: "",
          actualResult: "",
          causeProblem: "",
          solution: ""
        };
      }
    } catch (e: any) {
      ElMessage.error(e?.message || "Failed to load bug");
      selectedBug.value = null;
    } finally {
      detailLoading.value = false;
    }
  }

  function openCreateDialog(project = "") {
    isEdit.value = false;
    resetForm();
    form.key = newKey();
    form.project = project;
    dialogVisible.value = true;
  }

  function openEditDialog(bug: BugDocument, content?: BugContent | null) {
    isEdit.value = true;
    Object.assign(form, {
      key: bug.key,
      title: bug.title ?? "",
      project: bug.project ?? "",
      module: bug.module ?? "",
      iteration: bug.iteration ?? "",
      defectUrl: bug.defectUrl ?? "",
      severity: bug.severity ?? "minor",
      priority: bug.priority ?? "p2",
      status: bug.status ?? "open",
      type: bug.type ?? "functional",
      assignee: bug.assignee ?? "",
      reporter: bug.reporter ?? "",
      environment: bug.environment ?? "",
      affectedVersion: bug.affectedVersion ?? "",
      fixedVersion: bug.fixedVersion ?? "",
      frequency: bug.frequency ?? "sometimes",
      tags: [...(bug.tags ?? [])],
      dueDate: bug.dueDate ? new Date(bug.dueDate) : null,
      description: content?.description ?? "",
      stepsToReproduce: (content?.stepsToReproduce ?? []).join("\n"),
      expectedResult: content?.expectedResult ?? "",
      actualResult: content?.actualResult ?? "",
      causeProblem: content?.causeProblem ?? "",
      solution: content?.solution ?? ""
    });
    dialogVisible.value = true;
  }

  async function handleSave() {
    if (!form.title.trim()) {
      ElMessage.warning("Title is required");
      return;
    }
    saving.value = true;
    try {
      const content: BugContent = {
        description: form.description,
        stepsToReproduce: form.stepsToReproduce
          .split("\n")
          .map(l => l.trim())
          .filter(Boolean),
        expectedResult: form.expectedResult,
        actualResult: form.actualResult,
        causeProblem: form.causeProblem,
        solution: form.solution
      };
      const meta = {
        title: form.title,
        project: form.project,
        module: form.module,
        iteration: form.iteration,
        defectUrl: form.defectUrl,
        severity: form.severity,
        priority: form.priority,
        status: form.status,
        type: form.type,
        frequency: form.frequency,
        assignee: form.assignee,
        reporter: form.reporter,
        environment: form.environment,
        affectedVersion: form.affectedVersion,
        fixedVersion: form.fixedVersion,
        tags: form.tags,
        dueDate: form.dueDate ? form.dueDate.getTime() : null
      };
      if (isEdit.value) {
        await updateBug(form.key, meta, content);
        ElMessage.success("Bug updated");
      } else {
        await createBug({ key: form.key, ...meta } as any, content);
        ElMessage.success("Bug created");
      }
      dialogVisible.value = false;
    } catch (e: any) {
      ElMessage.error(e?.message || "Save failed");
    } finally {
      saving.value = false;
    }
  }

  async function handleDelete(bug: BugDocument) {
    try {
      await ElMessageBox.confirm(`Delete bug "${bug.title}"?`, "Confirm", { type: "warning" });
      await deleteBug(bug.key);
      ElMessage.success("Deleted");
      if (selectedBug.value?.key === bug.key) {
        selectedBug.value = null;
        selectedBugContent.value = null;
      }
    } catch (e: any) {
      if (e === "cancel" || e === "close") return;
      ElMessage.error(e?.message || "Delete failed");
    }
  }

  return {
    bugs,
    total,
    loading,
    error,
    selectedBug,
    selectedBugContent,
    detailLoading,
    dialogVisible,
    isEdit,
    saving,
    form,
    fetchBugs,
    loadDetail,
    openCreateDialog,
    openEditDialog,
    handleSave,
    handleDelete,
    resetForm
  };
});

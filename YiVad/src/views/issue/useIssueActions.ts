import { reactive, ref, type Ref } from "vue";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";
import { Delete as DeleteIcon, View as ViewIcon, Edit as EditIcon, Close } from "@element-plus/icons-vue";
import type { FormInstance } from "element-plus";
import { confirm } from "@/hooks/useConfirmAction";
import type { Issue, IssueStatus, IssuePriority, IssueType, IssueSource, ReviewStatus } from "@/api/modules/issueService";
import { ISSUE_STATUS_MAP, typeLabel, getIssueFilePath } from "@/api/modules/issueService";
import { formatDate, formatRelativeTime } from "@/utils/datetime";
import { readKnowledgeFile, writeKnowledgeFile, deleteKnowledgeFile } from "@/api/modules/knowledgeService";
import type { LinkedDocInfo } from "@/views/project/composables/useRequirements";
import type { useIssueStore } from "@/stores/modules/issue";
import type { IssueListContext } from "./useIssueList";

const PRD_STATUS_OPTIONS = ["\u5df2\u5b8c\u6210", "\u8fdb\u884c\u4e2d", "\u672a\u5f00\u59cb", "\u90e8\u5206\u5b8c\u6210", "\u5df2\u53d6\u6d88", "\u5f85\u8bc4\u5ba1", "\u5f85\u6392\u671f"];
const PRD_PRIORITY_OPTIONS = ["P0", "P1", "P2", "P3"];

export function useIssueActions(
  props: { projectKey?: string; filterIssueType?: string },
  list: IssueListContext,
  deps: {
    store: ReturnType<typeof useIssueStore>;
    formRef: Ref<FormInstance | undefined>;
    previewDlgRef: Ref<any>;
    refreshTable: () => void;
    trackRecent: (issue: Issue) => void;
    allIssues: Ref<Issue[]>;
  }
) {
  const { t } = useI18n();

  // ── PRD edit dialog ──
  const prdDialog = reactive({
    visible: false,
    loading: false,
    submitting: false,
    filePath: "",
    form: { title: "", status: "\u8fdb\u884c\u4e2d", priority: "P1", owner: "", estimateFrontend: 0 },
    devLinks: [] as LinkedDocInfo[],
    testLinks: [] as LinkedDocInfo[]
  });

  async function openPrdEdit(row: Issue) {
    const filePath = (row as any).kb_file_path;
    if (!filePath) return;
    prdDialog.filePath = filePath;
    prdDialog.loading = true;
    prdDialog.form = { title: "", status: "\u8fdb\u884c\u4e2d", priority: "P1", owner: "", estimateFrontend: 0 };
    prdDialog.devLinks = [];
    prdDialog.testLinks = [];
    try {
      const res = await readKnowledgeFile(filePath);
      const meta = res.meta || {};
      prdDialog.form.title = (meta.title as string) || row.title || "";
      prdDialog.form.status = (meta.status as string) || "\u8fdb\u884c\u4e2d";
      prdDialog.form.priority = (meta.priority as string) || "P1";
      prdDialog.form.owner = (meta.owner as string) || "";
      prdDialog.form.estimateFrontend = (meta.estimate_frontend as number) || 0;
      const links = list.prdLinks(row);
      prdDialog.devLinks = [...links.dev];
      prdDialog.testLinks = [...links.tests];
    } catch {
      prdDialog.form.title = row.title || "";
      ElMessage.warning("\u65e0\u6cd5\u8bfb\u53d6 PRD \u6587\u4ef6\uff0c\u90e8\u5206\u4fe1\u606f\u53ef\u80fd\u4e0d\u5b8c\u6574");
    } finally {
      prdDialog.loading = false;
    }
    prdDialog.visible = true;
  }

  async function removePrdLink(link: LinkedDocInfo, type: "dev" | "test") {
    const label = type === "dev" ? "\u5f00\u53d1\u4efb\u52a1" : "\u6d4b\u8bd5\u7528\u4f8b";
    const ok = await confirm(
      `\u786e\u5b9a\u8981\u53d6\u6d88\u5173\u8054${label}\u300c${link.title}\u300d\u5417\uff1f\u6b64\u64cd\u4f5c\u4f1a\u4fee\u6539\u5bf9\u5e94\u6587\u6863\u7684 frontmatter\u3002`,
      "\u53d6\u6d88\u5173\u8054"
    );
    if (!ok) return;
    try {
      const res = await readKnowledgeFile(link.path);
      const meta = { ...res.meta };
      if (type === "dev") {
        delete meta.source_prd;
      } else {
        const prds = (Array.isArray(meta.source_prds) ? meta.source_prds : []) as string[];
        const prdBasename = prdDialog.filePath.split("/").pop() || "";
        meta.source_prds = prds.filter((p: string) => p !== prdBasename && p !== prdDialog.filePath);
      }
      await writeKnowledgeFile(link.path, res.content, meta);
      if (type === "dev") {
        prdDialog.devLinks = prdDialog.devLinks.filter(l => l.path !== link.path);
      } else {
        prdDialog.testLinks = prdDialog.testLinks.filter(l => l.path !== link.path);
      }
      if (props.projectKey) await deps.refreshTable();
      deps.refreshTable();
    } catch (e) {
      ElMessage.error(e instanceof Error ? e.message : "\u79fb\u9664\u5173\u8054\u5931\u8d25");
    }
  }

  async function submitPrdEdit() {
    prdDialog.submitting = true;
    try {
      const res = await readKnowledgeFile(prdDialog.filePath);
      const updatedMeta = {
        ...res.meta,
        status: prdDialog.form.status,
        priority: prdDialog.form.priority,
        owner: prdDialog.form.owner,
        estimate_frontend: prdDialog.form.estimateFrontend
      };
      await writeKnowledgeFile(prdDialog.filePath, res.content, updatedMeta);
      prdDialog.visible = false;
      if (props.projectKey) await deps.refreshTable();
      ElMessage.success("PRD \u66f4\u65b0\u6210\u529f");
      deps.refreshTable();
    } catch (e) {
      ElMessage.error(e instanceof Error ? e.message : "\u4fdd\u5b58\u5931\u8d25");
    } finally {
      prdDialog.submitting = false;
    }
  }

  // ── Delete ──
  const deletingId = ref("");

  async function handleDelete(row: Issue) {
    const isPrd = props.filterIssueType === "requirement";
    const filePath = isPrd ? row.kb_file_path || getIssueFilePath(row) : row.kb_file_path || "";

    const confirmMessage = isPrd
      ? t("issue.dialog.deletePrdConfirm", { title: row.title, path: filePath })
      : filePath
        ? t("issue.dialog.deleteWithFileConfirm", { title: row.title, path: filePath })
        : t("issue.dialog.deleteConfirm", { title: row.title });

    const ok = await confirm(
      confirmMessage,
      isPrd ? t("issue.dialog.deletePrdTitle") : t("issue.dialog.deleteTitle"),
      "error"
    );
    if (!ok) return;

    deletingId.value = list.rowId(row);
    try {
      if (isPrd) {
        const res = await deleteKnowledgeFile(filePath);
        if (!res.deleted) throw new Error(t("issue.error.deleteFailed"));
        if (props.projectKey) await deps.refreshTable();
        ElMessage.success(t("issue.dialog.deleteSuccess"));
      } else {
        await deps.store.removeIssue(row.key, props.projectKey);
        ElMessage.success(t("issue.dialog.deleteSuccess"));
        if (filePath) {
          try {
            await deleteKnowledgeFile(filePath);
          } catch {
            ElMessage.warning(t("issue.error.fileCleanupFailed", { path: filePath }));
          }
        }
      }
    } catch (e) {
      ElMessage.error(e instanceof Error ? e.message : t("issue.error.deleteFailed"));
    } finally {
      deletingId.value = "";
    }
    deps.refreshTable();
  }

  // ── Preview / detail ──
  async function openPreview(issue: Issue) {
    list.store.issues; // trigger reactivity
    const filePath = getIssueFilePath(issue);
    const rows: Array<[string, string]> = [
      ["Key", issue.key],
      ["Type", typeLabel(issue.issue_type)],
      ["Status", list.statusLabel(issue.status)],
      ["Priority", list.priorityLabel(issue.priority)],
      ["Assignee", issue.assignee || "\u2014"],
      ["Start Date", issue.start_date || "\u2014"],
      ["Due Date", issue.due_date || "\u2014"],
      ["Source", issue.source ? list.sourceLabel(issue.source as IssueSource) : "\u2014"],
      ["Review", issue.review_status ? list.reviewLabel(issue.review_status as ReviewStatus) : "\u2014"],
      ["Estimate", issue.estimate_points != null ? issue.estimate_points + " pts" : "\u2014"]
    ];
    if (issue.labels?.length) rows.push(["Labels", issue.labels.join(", ")]);
    const header =
      `# ${issue.title}\n\n| Field | Value |\n|-------|-------|\n` + rows.map(([k, v]) => `| ${k} | ${v} |`).join("\n");
    const defaultContent = header + (issue.description ? `\n\n${issue.description}` : "");
    let content = defaultContent;
    try {
      const res = await readKnowledgeFile(filePath);
      if (res.content) content = res.content;
    } catch {
      try {
        await writeKnowledgeFile(filePath, defaultContent);
      } catch {
        /* best effort */
      }
      if (!(issue as any).kb_file_path) {
        try {
          await deps.store.editIssue(issue.key, { kb_file_path: filePath } as any);
          (issue as any).kb_file_path = filePath;
        } catch {
          /* best effort */
        }
      }
    }

    // Track recently viewed
    const allIssues = list.store.issues;
    // find issue in allIssues to track

    deps.previewDlgRef.value?.openFile({
      path: filePath,
      title: issue.title,
      content,
      onSave: async (newContent: string) => {
        await writeKnowledgeFile(filePath, newContent);
      }
    });
  }

  function goDetail(key: string) {
    const issue = list.store.issues.find((i: Issue) => i.key === key);
    if (issue) openPreview(issue);
  }

  async function copyKey(key: string) {
    try {
      await navigator.clipboard.writeText(key);
      ElMessage.success(t("issue.message.copied", { key }));
    } catch {
      ElMessage.warning(t("issue.message.clipboardUnavailable"));
    }
  }

  // ── Edit (delegates to useIssueDialog) ──
  function openEdit(row: Issue) {
    // This is handled by useIssueDialog's openEdit, passed through from parent
    // Just a placeholder; the parent overrides this via the existing `openEdit` from useIssueDialog
  }

  return {
    // PRD dialog
    prdDialog,
    PRD_STATUS_OPTIONS,
    PRD_PRIORITY_OPTIONS,
    openPrdEdit,
    removePrdLink,
    submitPrdEdit,
    // delete
    deletingId,
    handleDelete,
    // preview & copy
    openPreview,
    goDetail,
    copyKey,
    // icons
    ViewIcon,
    EditIcon,
    DeleteIcon,
    Close,
    // helpers re-export
    formatDate,
    formatRelativeTime
  };
}

export type IssueActionsContext = ReturnType<typeof useIssueActions>;
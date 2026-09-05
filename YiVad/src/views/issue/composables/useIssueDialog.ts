import { reactive, type Ref } from "vue";
import { ElMessage } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import type { useIssueStore } from "@/stores/modules/issue";
import type { Issue, IssueStatus, IssuePriority, IssueType } from "@/api/modules/issueService";

export interface IssueForm {
  title: string;
  description: string;
  status: IssueStatus;
  priority: IssuePriority;
  issue_type: IssueType;
  assignee: string;
  start_date: string;
  due_date: string;
  project_key: string;
  source: string;
  review_status: string;
  acceptance_criteria: string;
}

export function useIssueDialog(
  props: { projectKey?: string },
  opts: {
    store: ReturnType<typeof useIssueStore>;
    formRef: Ref<FormInstance | undefined>;
    allIssues: Ref<Issue[]>;
    mapReqStatusReverse: (s: string) => string;
    mapReqPriorityReverse: (p: string) => string;
    updateReqItem: (path: string, patch: any) => void;
    readKnowledgeFile: typeof import("@/api/modules/knowledgeService").readKnowledgeFile;
    writeKnowledgeFile: typeof import("@/api/modules/knowledgeService").writeKnowledgeFile;
    refreshTable: () => void;
  }
) {
  function emptyForm(projectKey?: string): IssueForm {
    return {
      title: "",
      description: "",
      status: "todo",
      priority: "medium",
      issue_type: "task",
      assignee: "",
      start_date: "",
      due_date: "",
      project_key: projectKey || "",
      source: "",
      review_status: "",
      acceptance_criteria: ""
    };
  }

  const dialog = reactive({
    visible: false,
    isEdit: false,
    submitting: false,
    editKey: "",
    form: emptyForm(props.projectKey)
  });

  const rules: FormRules = {
    title: [{ required: true, message: "Title is required", trigger: "blur" }],
    issue_type: [{ required: true, message: "Type is required", trigger: "change" }],
    priority: [{ required: true, message: "Priority is required", trigger: "change" }],
    status: [{ required: true, message: "Status is required", trigger: "change" }]
  };

  function openCreate(): void {
    dialog.isEdit = false;
    dialog.editKey = "";
    dialog.form = emptyForm(props.projectKey);
    dialog.visible = true;
  }

  function openEdit(issue: Issue): void {
    dialog.isEdit = true;
    dialog.editKey = issue.key;
    dialog.form = {
      title: issue.title,
      description: issue.description || "",
      status: issue.status,
      priority: issue.priority,
      issue_type: issue.issue_type,
      assignee: issue.assignee || "",
      start_date: issue.start_date || "",
      due_date: issue.due_date || "",
      project_key: issue.project_key,
      source: issue.source || "",
      review_status: issue.review_status || "",
      acceptance_criteria: issue.acceptance_criteria || ""
    };
    dialog.visible = true;
  }

  async function syncKnowledgeFileIfNeeded(): Promise<void> {
    const editedIssue = opts.allIssues.value.find(i => i.key === dialog.editKey) as any;
    if (!editedIssue?.kb_file_path) return;
    const statusCn = opts.mapReqStatusReverse(dialog.form.status);
    const priorityCn = opts.mapReqPriorityReverse(dialog.form.priority);
    opts.updateReqItem(editedIssue.kb_file_path, {
      status: statusCn,
      priority: priorityCn,
      assignee: dialog.form.assignee || ""
    });
    opts.readKnowledgeFile(editedIssue.kb_file_path).then(res => {
      const updatedMeta = { ...res.meta };
      updatedMeta.status = statusCn;
      updatedMeta.priority = priorityCn;
      if (dialog.form.assignee !== undefined) updatedMeta.owner = dialog.form.assignee;
      return opts.writeKnowledgeFile(editedIssue.kb_file_path!, res.content, updatedMeta);
    }).catch(e => {
      console.error("Failed to sync knowledge file:", e);
    });
  }

  async function submit(): Promise<void> {
    try {
      await opts.formRef.value?.validate();
    } catch {
      return;
    }
    dialog.submitting = true;
    try {
      if (dialog.isEdit) {
        await opts.store.editIssue(dialog.editKey, {
          title: dialog.form.title,
          description: dialog.form.description,
          status: dialog.form.status,
          priority: dialog.form.priority,
          issue_type: dialog.form.issue_type,
          assignee: dialog.form.assignee,
          start_date: dialog.form.start_date,
          due_date: dialog.form.due_date,
          source: (dialog.form.source || undefined) as any,
          review_status: (dialog.form.review_status || undefined) as any,
          acceptance_criteria: dialog.form.acceptance_criteria || undefined
        });
        ElMessage.success("Issue updated");
        await syncKnowledgeFileIfNeeded();
      } else {
        const key = `ISS-${Date.now().toString(36).toUpperCase()}`;
        await opts.store.addIssue({
          key,
          project_key: dialog.form.project_key || props.projectKey || "",
          sequence_id: Date.now(),
          title: dialog.form.title,
          description: dialog.form.description,
          status: dialog.form.status,
          priority: dialog.form.priority,
          issue_type: dialog.form.issue_type,
          assignee: dialog.form.assignee,
          labels: [],
          start_date: dialog.form.start_date,
          due_date: dialog.form.due_date,
          source: (dialog.form.source || undefined) as any,
          review_status: (dialog.form.review_status || undefined) as any,
          acceptance_criteria: dialog.form.acceptance_criteria || undefined
        });
        ElMessage.success("Issue created");
      }
      dialog.visible = false;
      opts.refreshTable();
    } catch (e) {
      ElMessage.error((e as Error).message || "Failed to save issue");
    } finally {
      dialog.submitting = false;
    }
  }

  return {
    dialog,
    rules,
    emptyForm,
    openCreate,
    openEdit,
    syncKnowledgeFileIfNeeded,
    submit
  };
}

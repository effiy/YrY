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
    kbFilePath: "",
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
    dialog.kbFilePath = "";
    dialog.form = emptyForm(props.projectKey);
    dialog.visible = true;
  }

  function openEdit(issue: Issue): void {
    dialog.isEdit = true;
    dialog.editKey = issue.key;
    dialog.kbFilePath = (issue as any).kb_file_path || "";
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
    const filePath = dialog.kbFilePath || (opts.allIssues.value.find(i => i.key === dialog.editKey) as any)?.kb_file_path;
    if (!filePath) return;
    const statusCn = opts.mapReqStatusReverse(dialog.form.status);
    const priorityCn = opts.mapReqPriorityReverse(dialog.form.priority);
    opts.updateReqItem(filePath, {
      status: statusCn,
      priority: priorityCn,
      assignee: dialog.form.assignee || ""
    });
    opts.readKnowledgeFile(filePath).then(res => {
      const updatedMeta = { ...res.meta };
      updatedMeta.status = statusCn;
      updatedMeta.priority = priorityCn;
      if (dialog.form.assignee !== undefined) updatedMeta.owner = dialog.form.assignee;
      return opts.writeKnowledgeFile(filePath, res.content, updatedMeta);
    }).catch(e => {
      console.error("Failed to sync knowledge file:", e);
    });
  }

  async function submit(): Promise<void> {
    // Validate form before submission
    const formValid = await opts.formRef.value?.validate().catch(() => false);
    if (!formValid) return;

    dialog.submitting = true;
    try {
      // Build common issue payload
      const commonPayload = {
        title: dialog.form.title,
        description: dialog.form.description,
        status: dialog.form.status,
        priority: dialog.form.priority,
        issue_type: dialog.form.issue_type,
        assignee: dialog.form.assignee,
        start_date: dialog.form.start_date,
        due_date: dialog.form.due_date,
        source: dialog.form.source || undefined,
        review_status: dialog.form.review_status || undefined,
        acceptance_criteria: dialog.form.acceptance_criteria || undefined
      };

      if (dialog.isEdit) {
        if (dialog.kbFilePath) {
          // Requirement issue: data lives in YiKnowledge markdown file, not the database
          await syncKnowledgeFileIfNeeded();
        } else {
          await opts.store.editIssue(dialog.editKey, {
            ...commonPayload,
            source: (commonPayload.source as Issue['source']) || undefined,
            review_status: (commonPayload.review_status as Issue['review_status']) || undefined,
            acceptance_criteria: (commonPayload.acceptance_criteria as Issue['acceptance_criteria']) || undefined
          });
          await syncKnowledgeFileIfNeeded();
        }
        ElMessage.success("Issue updated successfully");
      } else {
        const newIssueKey = `ISS-${Date.now().toString(36).toUpperCase()}`;
        const projectKey = dialog.form.project_key || props.projectKey || "";
        
        await opts.store.addIssue({
          key: newIssueKey,
          project_key: projectKey,
          sequence_id: Date.now(),
          ...commonPayload,
          labels: [],
          source: (dialog.form.source as Issue['source']) || undefined,
          review_status: (dialog.form.review_status as Issue['review_status']) || undefined,
          acceptance_criteria: (dialog.form.acceptance_criteria as Issue['acceptance_criteria']) || undefined
        });
        ElMessage.success("Issue created successfully");
      }

      dialog.visible = false;
      opts.refreshTable();
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Failed to save issue";
      ElMessage.error(errorMessage);
      console.error("Issue submission error:", e);
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

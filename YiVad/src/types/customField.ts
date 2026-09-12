/** Custom field types */

export type FieldType = "text" | "number" | "date" | "select" | "multi_select" | "user" | "url" | "checkbox";

export interface CustomFieldDef {
  key: string;
  name: string;
  entity_type: string;
  field_type: FieldType;
  label: string;
  description: string;
  required: boolean;
  default_value?: any;
  validation: Record<string, any>;
  order: number;
  group: string;
  visible_to: string[];
  created_at: string;
  updated_at: string;
}

export interface CustomFieldValue {
  def_key: string;
  value: any;
}

export const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  text: "文本",
  number: "数字",
  date: "日期",
  select: "下拉选择",
  multi_select: "多选",
  user: "用户选择",
  url: "链接",
  checkbox: "复选框",
};
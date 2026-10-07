export const DEFAULT_MODEL = "qwen3.5:4b";

export interface QuickButton {
  label: string;
  content: string;
  value: string;
  template?: boolean;
}

export const QUICK_BUTTONS: QuickButton[] = [
  {
    label: "Code review",
    content: "Please review this code for bugs, security issues, and style problems:",
    value: "code_review"
  },
  {
    label: "Explain concept",
    content: "Explain the following concept in simple terms:",
    value: "explain"
  },
  {
    label: "Write documentation",
    content: "Write clear documentation for the following:",
    value: "write_docs"
  },
  {
    label: "Debug issue",
    content: "Help me debug this issue. Here's what happened:",
    value: "debug"
  }
];

export const QUICK_BUTTONS_NEW: QuickButton[] = [];

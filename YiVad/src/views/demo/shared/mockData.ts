import type { ExportColumn } from "@/utils/export/types";

const FIRST_NAMES = ["张", "李", "王", "赵", "陈", "刘", "黄", "周", "吴", "郑"];
const LAST_NAMES = ["伟", "芳", "娜", "敏", "静", "强", "磊", "洋", "勇", "军"];
const STATUSES = ["draft", "pending", "active", "completed", "archived"];
const PRIORITIES = ["critical", "high", "medium", "low"];
const DEPARTMENTS = ["Engineering", "Product", "Design", "Marketing", "Sales", "Support"];

export interface MockRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  status: string;
  priority: string;
  amount: number;
  progress: number;
  score: string;
  createdAt: string;
  tags: string[];
  parentId: string | null;
  latitude: number;
  longitude: number;
  [key: string]: any;
}

export function generateMockData(rows: number): MockRow[] {
  return Array.from({ length: rows }, (_, i) => ({
    id: `row-${i + 1}`,
    name: `${FIRST_NAMES[i % 10]}${LAST_NAMES[i % 10]}`,
    email: `user${i + 1}@example.com`,
    phone: `138${String(i + 1).padStart(8, "0")}`,
    department: DEPARTMENTS[i % 6],
    role: ["Manager", "Engineer", "Designer", "Analyst"][i % 4],
    status: STATUSES[i % 5],
    priority: PRIORITIES[i % 4],
    amount: Math.round((Math.random() * 10000 + 100) * 100) / 100,
    progress: Math.round(Math.random() * 100),
    score: (Math.random() * 5 + 1).toFixed(1),
    createdAt: new Date(2026, 0, 1 + (i % 365)).toISOString().slice(0, 10),
    tags: [STATUSES[i % 5], PRIORITIES[i % 4]],
    parentId: i > 0 && i % 5 === 0 ? `row-${Math.floor(i / 5)}` : null,
    latitude: 30.5 + Math.random() * 10,
    longitude: 120.1 + Math.random() * 10,
  }));
}

export const DEMO_COLUMNS: ExportColumn[] = [
  { key: "id", label: "ID" },
  { key: "name", label: "姓名" },
  { key: "email", label: "邮箱" },
  { key: "department", label: "部门" },
  { key: "role", label: "角色" },
  { key: "status", label: "状态" },
  { key: "priority", label: "优先级" },
  { key: "amount", label: "金额" },
  { key: "progress", label: "进度" },
  { key: "score", label: "评分" },
  { key: "createdAt", label: "创建日期" },
];

export const DEMO_DATA_SMALL = generateMockData(100);
export const DEMO_DATA_MEDIUM = generateMockData(1000);
export const DEMO_DATA_LARGE = generateMockData(10000);
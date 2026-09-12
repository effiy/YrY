export interface CommandContext {
  timestamp: number;
  source: "user" | "system" | "collaboration";
  description: string;
  category: "form" | "table" | "file" | "settings" | "other";
  icon?: string;
}

export interface ChangeData {
  type: "create" | "update" | "delete" | "batch";
  entityType: string;
  entityId?: string;
  before: unknown;
  after: unknown;
  version?: number;
}

export interface ICommand {
  id: string;
  context: CommandContext;
  changeData: ChangeData;
  execute(): Promise<void>;
  undo(): Promise<void>;
  redo(): Promise<void>;
  canMergeWith(other: ICommand): boolean;
  mergeWith(other: ICommand): void;
}

export type UndoRedoScope = "form" | "page" | "global";

export interface CommandManagerConfig {
  maxDepth: number;
  scope: UndoRedoScope;
  scopeId?: string;
  enablePersistence: boolean;
  transactionWindow: number;
}

export interface HistoryEntry {
  commandId: string;
  description: string;
  category: string;
  icon?: string;
  timestamp: number;
  undone: boolean;
  isTransaction: boolean;
  transactionSize?: number;
}
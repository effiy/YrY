import type { ICommand, CommandManagerConfig, HistoryEntry } from "./types";
import { TransactionManager } from "./TransactionManager";
import { SerializationHelper } from "./SerializationHelper";

const DEFAULT_CONFIG: CommandManagerConfig = {
  maxDepth: 50,
  scope: "page",
  enablePersistence: true,
  transactionWindow: 500,
};

export class CommandManager {
  private undoStack: ICommand[] = [];
  private redoStack: ICommand[] = [];
  private config: CommandManagerConfig;
  private transactionManager: TransactionManager;
  private serializationHelper: SerializationHelper;
  private listeners: Set<(entry: HistoryEntry) => void> = new Set();

  constructor(config: Partial<CommandManagerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.transactionManager = new TransactionManager(this.config.transactionWindow);
    this.serializationHelper = new SerializationHelper(this.getStorageKey());
    this.restoreFromStorage();
  }

  async execute(command: ICommand): Promise<void> {
    if (this.transactionManager.isInTransaction()) {
      this.transactionManager.addCommand(command);
      return;
    }

    await command.execute();

    if (this.undoStack.length > 0) {
      const lastCommand = this.undoStack[this.undoStack.length - 1];
      if (lastCommand.canMergeWith(command)) {
        lastCommand.mergeWith(command);
        this.notifyListeners(command);
        this.persist();
        return;
      }
    }

    this.undoStack.push(command);

    while (this.undoStack.length > this.config.maxDepth) {
      this.undoStack.shift();
    }

    this.redoStack = [];

    this.notifyListeners(command);
    this.persist();
  }

  async undo(): Promise<boolean> {
    if (this.undoStack.length === 0) return false;

    const command = this.undoStack.pop()!;
    await command.undo();
    this.redoStack.push(command);

    this.notifyListeners(command);
    this.persist();
    return true;
  }

  async redo(): Promise<boolean> {
    if (this.redoStack.length === 0) return false;

    const command = this.redoStack.pop()!;
    await command.redo();
    this.undoStack.push(command);

    this.notifyListeners(command);
    this.persist();
    return true;
  }

  beginTransaction(description: string): void {
    this.transactionManager.beginTransaction(description);
  }

  async commitTransaction(): Promise<void> {
    const batchCommand = this.transactionManager.commitTransaction();
    if (batchCommand) {
      this.undoStack.push(batchCommand);
      this.redoStack = [];
      this.notifyListeners(batchCommand);
      this.persist();
    }
  }

  rollbackTransaction(): void {
    this.transactionManager.rollbackTransaction();
  }

  getHistory(): HistoryEntry[] {
    return this.undoStack.map((cmd) => ({
      commandId: cmd.id,
      description: cmd.context.description,
      category: cmd.context.category,
      icon: cmd.context.icon,
      timestamp: cmd.context.timestamp,
      undone: false,
      isTransaction: cmd.changeData.type === "batch",
      transactionSize: cmd.changeData.type === "batch" ? 1 : undefined,
    }));
  }

  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
    this.persist();
  }

  private getStorageKey(): string {
    return `yivad_undo_${this.config.scope}_${this.config.scopeId || "default"}`;
  }

  private persist(): void {
    if (!this.config.enablePersistence) return;
    this.serializationHelper.serialize(this.undoStack, this.redoStack);
  }

  private restoreFromStorage(): void {
    if (!this.config.enablePersistence) return;
    const { undoStack, redoStack } = this.serializationHelper.deserialize();
    if (undoStack) this.undoStack = undoStack;
    if (redoStack) this.redoStack = redoStack;
  }

  onHistoryChange(listener: (entry: HistoryEntry) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(command: ICommand): void {
    const entry: HistoryEntry = {
      commandId: command.id,
      description: command.context.description,
      category: command.context.category,
      icon: command.context.icon,
      timestamp: command.context.timestamp,
      undone: false,
      isTransaction: command.changeData.type === "batch",
    };
    this.listeners.forEach((fn) => fn(entry));
  }

  destroy(): void {
    this.listeners.clear();
    this.clear();
  }
}
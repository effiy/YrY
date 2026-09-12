import type { ICommand, CommandContext, ChangeData } from "./types";

export class TransactionManager {
  private inTransaction = false;
  private transactionCommands: ICommand[] = [];
  private transactionDescription = "";
  private transactionWindow: number;

  constructor(transactionWindow: number) {
    this.transactionWindow = transactionWindow;
  }

  isInTransaction(): boolean {
    return this.inTransaction;
  }

  beginTransaction(description: string): void {
    this.inTransaction = true;
    this.transactionDescription = description;
    this.transactionCommands = [];
  }

  addCommand(command: ICommand): void {
    if (!this.inTransaction) return;
    this.transactionCommands.push(command);
  }

  commitTransaction(): ICommand | null {
    this.inTransaction = false;
    if (this.transactionCommands.length === 0) return null;

    const firstCmd = this.transactionCommands[0];
    const context: CommandContext = {
      timestamp: Date.now(),
      source: "user",
      description: this.transactionDescription,
      category: firstCmd.context.category,
    };
    const changeData: ChangeData = {
      type: "batch",
      entityType: firstCmd.changeData.entityType,
      before: firstCmd.changeData.before,
      after: this.transactionCommands[this.transactionCommands.length - 1].changeData.after,
    };

    const commands = [...this.transactionCommands];
    this.transactionCommands = [];
    return {
      id: `txn_${Date.now()}`,
      context,
      changeData,
      execute: async () => {
        for (const cmd of commands) await cmd.execute();
      },
      undo: async () => {
        for (const cmd of [...commands].reverse()) await cmd.undo();
      },
      redo: async () => {
        for (const cmd of commands) await cmd.redo();
      },
      canMergeWith: () => false,
      mergeWith: () => {},
    } as ICommand;
  }

  rollbackTransaction(): void {
    this.inTransaction = false;
    this.transactionCommands = [];
  }
}
import type { ICommand, CommandContext, ChangeData } from "./types";

let commandIdCounter = 0;

export abstract class Command implements ICommand {
  public readonly id: string;
  public readonly context: CommandContext;
  public readonly changeData: ChangeData;

  constructor(context: CommandContext, changeData: ChangeData) {
    this.id = `cmd_${Date.now()}_${++commandIdCounter}`;
    this.context = context;
    this.changeData = changeData;
  }

  abstract execute(): Promise<void>;
  abstract undo(): Promise<void>;

  async redo(): Promise<void> {
    await this.execute();
  }

  canMergeWith(other: ICommand): boolean {
    return (
      this.changeData.type === other.changeData.type &&
      this.changeData.entityType === other.changeData.entityType &&
      this.changeData.entityId === other.changeData.entityId &&
      this.context.category === other.context.category &&
      Math.abs(this.context.timestamp - other.context.timestamp) < 500
    );
  }

  mergeWith(other: ICommand): void {
    this.changeData.after = other.changeData.after;
    this.context.timestamp = other.context.timestamp;
  }
}

export class CreateCommand extends Command {
  constructor(
    context: CommandContext,
    changeData: ChangeData,
    private apiCreate: (data: unknown) => Promise<{ id: string }>,
    private apiDelete: (id: string) => Promise<void>
  ) {
    super(context, { ...changeData, type: "create" });
  }

  async execute(): Promise<void> {
    const result = await this.apiCreate(this.changeData.after);
    this.changeData.entityId = result.id;
  }

  async undo(): Promise<void> {
    if (this.changeData.entityId) {
      await this.apiDelete(this.changeData.entityId);
    }
  }
}

export class UpdateCommand extends Command {
  constructor(
    context: CommandContext,
    changeData: ChangeData,
    private apiUpdate: (id: string, data: unknown) => Promise<void>
  ) {
    super(context, { ...changeData, type: "update" });
  }

  async execute(): Promise<void> {
    if (this.changeData.entityId) {
      await this.apiUpdate(this.changeData.entityId, this.changeData.after);
    }
  }

  async undo(): Promise<void> {
    if (this.changeData.entityId) {
      await this.apiUpdate(this.changeData.entityId, this.changeData.before);
    }
  }
}

export class DeleteCommand extends Command {
  constructor(
    context: CommandContext,
    changeData: ChangeData,
    private apiDelete: (id: string) => Promise<void>,
    private apiCreate: (data: unknown) => Promise<{ id: string }>
  ) {
    super(context, { ...changeData, type: "delete" });
  }

  async execute(): Promise<void> {
    if (this.changeData.entityId) {
      await this.apiDelete(this.changeData.entityId);
    }
  }

  async undo(): Promise<void> {
    await this.apiCreate(this.changeData.before);
  }
}

export class BatchCommand extends Command {
  private commands: Command[];

  constructor(context: CommandContext, changeData: ChangeData, commands: Command[]) {
    super(context, { ...changeData, type: "batch" });
    this.commands = commands;
  }

  async execute(): Promise<void> {
    for (const cmd of this.commands) {
      await cmd.execute();
    }
  }

  async undo(): Promise<void> {
    for (const cmd of [...this.commands].reverse()) {
      await cmd.undo();
    }
  }

  async redo(): Promise<void> {
    for (const cmd of this.commands) {
      await cmd.redo();
    }
  }
}
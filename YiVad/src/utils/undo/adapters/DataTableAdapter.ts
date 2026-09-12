import type { ICommand, CommandContext, ChangeData } from "@/utils/undo/types";
import { CreateCommand, UpdateCommand, DeleteCommand } from "@/utils/undo/Command";

/**
 * DataTableAdapter — wraps ProTable CRUD operations into Command instances.
 */
export function createTableCreateCommand(
  entityType: string,
  data: unknown,
  apiCreate: (data: unknown) => Promise<{ id: string }>,
  apiDelete: (id: string) => Promise<void>
): ICommand {
  const context: CommandContext = {
    timestamp: Date.now(),
    source: "user",
    description: `创建 ${entityType}`,
    category: "table",
  };
  const changeData: ChangeData = { type: "create", entityType, before: null, after: data };
  return new CreateCommand(context, changeData, apiCreate, apiDelete);
}

export function createTableUpdateCommand(
  entityType: string,
  entityId: string,
  oldData: unknown,
  newData: unknown,
  apiUpdate: (id: string, data: unknown) => Promise<void>
): ICommand {
  const context: CommandContext = {
    timestamp: Date.now(),
    source: "user",
    description: `编辑 ${entityType}`,
    category: "table",
  };
  const changeData: ChangeData = { type: "update", entityType, entityId, before: oldData, after: newData };
  return new UpdateCommand(context, changeData, apiUpdate);
}

export function createTableDeleteCommand(
  entityType: string,
  entityId: string,
  data: unknown,
  apiDelete: (id: string) => Promise<void>,
  apiCreate: (data: unknown) => Promise<{ id: string }>
): ICommand {
  const context: CommandContext = {
    timestamp: Date.now(),
    source: "user",
    description: `删除 ${entityType}`,
    category: "table",
  };
  const changeData: ChangeData = { type: "delete", entityType, entityId, before: data, after: null };
  return new DeleteCommand(context, changeData, apiDelete, apiCreate);
}
import { UpdateCommand } from "@/utils/undo/Command";
import type { ICommand, CommandContext, ChangeData } from "@/utils/undo/types";

export function createFormUpdateCommand(
  fieldName: string,
  entityId: string,
  entityType: string,
  oldValue: unknown,
  newValue: unknown,
  apiUpdate: (id: string, data: unknown) => Promise<void>
): ICommand {
  const context: CommandContext = {
    timestamp: Date.now(),
    source: "user",
    description: `编辑 ${fieldName}`,
    category: "form",
  };
  const changeData: ChangeData = {
    type: "update",
    entityType,
    entityId,
    before: { [fieldName]: oldValue },
    after: { [fieldName]: newValue },
  };
  return new UpdateCommand(context, changeData, apiUpdate);
}
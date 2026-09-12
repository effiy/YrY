import { UpdateCommand } from "@/utils/undo/Command";
import type { ICommand, CommandContext, ChangeData } from "@/utils/undo/types";

export function createSettingsUpdateCommand(
  settingName: string,
  entityId: string,
  oldValue: unknown,
  newValue: unknown,
  apiUpdate: (id: string, data: unknown) => Promise<void>
): ICommand {
  const context: CommandContext = {
    timestamp: Date.now(),
    source: "user",
    description: `修改设置 ${settingName}`,
    category: "settings",
  };
  const changeData: ChangeData = {
    type: "update",
    entityType: "project_settings",
    entityId,
    before: { [settingName]: oldValue },
    after: { [settingName]: newValue },
  };
  return new UpdateCommand(context, changeData, apiUpdate);
}
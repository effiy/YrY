import type { ICommand } from "./types";

export class SerializationHelper {
  constructor(private storageKey: string) {}

  serialize(undoStack: ICommand[], redoStack: ICommand[]): void {
    try {
      const data = {
        undoStack: undoStack.map((c) => ({
          id: c.id,
          context: c.context,
          changeData: c.changeData,
        })),
        redoStack: redoStack.map((c) => ({
          id: c.id,
          context: c.context,
          changeData: c.changeData,
        })),
      };
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch {
      // localStorage full or unavailable — silently ignore
    }
  }

  deserialize(): { undoStack: ICommand[]; redoStack: ICommand[] } {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return { undoStack: [], redoStack: [] };
      return JSON.parse(raw);
    } catch {
      return { undoStack: [], redoStack: [] };
    }
  }
}
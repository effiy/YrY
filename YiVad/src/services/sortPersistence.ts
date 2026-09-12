import { updateDocument } from "@/api/modules/dataService";

export async function persistSortOrder(
  collection: string,
  items: { key: string; sort_order: number }[]
): Promise<void> {
  await Promise.all(
    items.map((item, index) =>
      updateDocument(collection, item.key, { sort_order: index } as any).catch(() => {})
    )
  );
}
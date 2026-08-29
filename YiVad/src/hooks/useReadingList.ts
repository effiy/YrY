/**
 * YiVad — Reading list composable.
 * Extracted from KnowledgePreviewDialog.vue: check/add current file to reading list.
 */
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { createReadingItem, getReadingList } from '@/api/modules/readingListService';

export function useReadingList() {
  const adding = ref(false);
  const itemExists = ref(false);

  async function checkExists(currentPath: string) {
    if (!currentPath) return;
    try {
      const res = await getReadingList({ pageSize: 1 });
      const list = (res.data as any)?.list ?? [];
      itemExists.value = list.some((item: any) => item.link === currentPath);
    } catch { itemExists.value = false; }
  }

  async function add(currentPath: string, title: string) {
    if (!currentPath || adding.value) return;
    adding.value = true;
    try {
      await createReadingItem({
        title,
        type: 'article',
        link: currentPath,
        status: 'to-read',
      });
      itemExists.value = true;
      ElMessage.success('Added to reading list');
    } catch (e: any) {
      ElMessage.error(e?.message || 'Failed to add to reading list');
    } finally {
      adding.value = false;
    }
  }

  return { adding, itemExists, checkExists, add };
}
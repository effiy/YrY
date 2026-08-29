/**
 * YiVad — Knowledge file drag-and-drop composable.
 * Extracted from AiChatBox.vue: drag-over state, file collection, drop handler.
 */
import { ref } from 'vue';
import { readKnowledgeFile } from '@/api/modules/knowledgeService';

interface DragNode {
  type: string;
  name: string;
  path: string;
  content?: string;
  tags?: string[];
  children?: DragNode[];
}

interface DragFile {
  path: string;
  content: string;
  title: string;
  tags: string[];
}

export function useKnowledgeDragDrop(onFileDrop: (file: DragFile) => Promise<void>) {
  const isDragOver = ref(false);
  let dragOverCounter = 0;

  const MIME = 'application/x-knowledge-file';

  function onDragOver(e: DragEvent) {
    if (!e.dataTransfer?.types.includes(MIME)) return;
    e.preventDefault();
    e.dataTransfer!.dropEffect = 'link';
  }

  function onDragEnter(e: DragEvent) {
    if (!e.dataTransfer?.types.includes(MIME)) return;
    e.preventDefault();
    dragOverCounter++;
    isDragOver.value = true;
  }

  function onDragLeave(_e: DragEvent) {
    dragOverCounter--;
    if (dragOverCounter <= 0) {
      dragOverCounter = 0;
      isDragOver.value = false;
    }
  }

  function collectDragFiles(nodes: DragNode[]): DragFile[] {
    const out: DragFile[] = [];
    for (const n of nodes) {
      if (n.type === 'file') {
        out.push({ path: n.path, content: n.content || '', title: n.name, tags: n.tags || [] });
      }
      if (n.children?.length) {
        out.push(...collectDragFiles(n.children));
      }
    }
    return out;
  }

  async function onDrop(e: DragEvent) {
    isDragOver.value = false;
    dragOverCounter = 0;
    const raw = e.dataTransfer?.getData(MIME);
    if (!raw) return;
    e.preventDefault();
    try {
      const parsed = JSON.parse(raw);
      const nodes = Array.isArray(parsed) ? parsed : [parsed];
      const files = collectDragFiles(nodes);

      const needsContent = files.filter((f) => !f.content && f.path);
      if (needsContent.length) {
        const results = await Promise.allSettled(
          needsContent.map((f) => readKnowledgeFile(f.path).catch(() => null)),
        );
        results.forEach((r, i) => {
          if (r.status === 'fulfilled' && r.value) {
            needsContent[i].content = r.value.content || '';
          }
        });
      }

      for (const f of files) {
        if (!f.path) continue;
        await onFileDrop(f);
      }
    } catch {
      /* ignore parse errors */
    }
  }

  return { isDragOver, onDragOver, onDragEnter, onDragLeave, onDrop };
}
/**
 * Tests for ContextFilesPanel/contextTreeUtils.ts
 * Focused on ctx: tag parsing and pageContent tree construction,
 * which are the consumers of the new ctx: tags in session creation.
 */
import { describe, it, expect } from 'vitest';
import {
  extractCtxPaths,
  parseToTree,
  sortTree,
  flattenForDisplay,
  countFiles,
} from '../../src/chat/components/ContextFilesPanel/contextTreeUtils';

describe('contextTreeUtils', () => {
  // ── extractCtxPaths ────────────────────────────────────────────────

  describe('extractCtxPaths()', () => {
    it('extracts a single ctx: tag', () => {
      expect(extractCtxPaths(['ctx:path/to/file.md'])).toEqual(['path/to/file.md']);
    });

    it('extracts ctx: tags among other tags', () => {
      expect(
        extractCtxPaths(['source:YiKnowledge', 'ctx:path/to/file.md', 'from:some/url']),
      ).toEqual(['path/to/file.md']);
    });

    it('returns empty array when no ctx: tags', () => {
      expect(extractCtxPaths(['source:YiKnowledge', 'from:some/url'])).toEqual([]);
    });

    it('returns empty array for empty input', () => {
      expect(extractCtxPaths([])).toEqual([]);
    });

    it('extracts multiple ctx: tags', () => {
      expect(extractCtxPaths(['ctx:a.md', 'ctx:b.md'])).toEqual(['a.md', 'b.md']);
    });
  });

  // ── parseToTree ─────────────────────────────────────────────────────

  describe('parseToTree()', () => {
    it('parses ctx: tag with matching pageContent section', () => {
      const raw = '## file.md\n\nfile content here';
      const tags = ['ctx:file.md'];
      const tree = parseToTree(raw, tags);
      expect(tree).toHaveLength(1);
      expect(tree[0].type).toBe('file');
      expect(tree[0].path).toBe('file.md');
      expect(tree[0].name).toBe('file.md');
      expect(tree[0].content).toBe('file content here');
    });

    it('parses ctx: tag without matching pageContent (content is empty)', () => {
      const raw = 'some random content';
      const tags = ['ctx:a.md'];
      const tree = parseToTree(raw, tags);
      expect(tree).toHaveLength(1);
      expect(tree[0].path).toBe('a.md');
      expect(tree[0].content).toBe('');
    });

    it('falls back to pageContent when no ctx: tags', () => {
      const raw = '## a.md\n\ncontent a\n\n---\n\n## b.md\n\ncontent b';
      const tags: string[] = [];
      const tree = parseToTree(raw, tags);
      expect(tree).toHaveLength(2);
      expect(tree.map((n) => n.path)).toEqual(['a.md', 'b.md']);
    });

    it('returns empty array for no ctx and no pageContent', () => {
      expect(parseToTree('', [])).toEqual([]);
    });

    it('builds folder structure from multi-segment paths', () => {
      const tags = ['ctx:lessons/failures/bugs/KEY.md'];
      const raw = '## lessons/failures/bugs/KEY.md\n\nbug content';
      const tree = parseToTree(raw, tags);
      expect(tree).toHaveLength(1);
      const folder = tree[0];
      expect(folder.type).toBe('folder');
      expect(folder.name).toBe('lessons');
      const file = folder.children?.[0]?.children?.[0]?.children?.[0];
      expect(file?.type).toBe('file');
      expect(file?.path).toBe('lessons/failures/bugs/KEY.md');
    });

    it('handles story path format', () => {
      const tags = ['ctx:YiVad/story-name/story.md'];
      const raw = '## YiVad/story-name/story.md\n\nstory content';
      const tree = parseToTree(raw, tags);
      expect(tree).toHaveLength(1);
      const projectFolder = tree[0];
      expect(projectFolder.type).toBe('folder');
      expect(projectFolder.name).toBe('YiVad');
      expect(projectFolder.children).toHaveLength(1);
      expect(projectFolder.children?.[0].name).toBe('story-name');
    });

    it('groups files under the same folder', () => {
      const tags = ['ctx:a/x.md', 'ctx:a/y.md'];
      const raw = '## a/x.md\n\nx\n\n---\n\n## a/y.md\n\ny';
      const tree = parseToTree(raw, tags);
      expect(tree).toHaveLength(1);
      expect(tree[0].type).toBe('folder');
      expect(tree[0].name).toBe('a');
      expect(tree[0].children).toHaveLength(2);
      expect(tree[0].children?.map((c) => c.name)).toEqual(['x.md', 'y.md']);
    });
  });

  // ── sortTree ────────────────────────────────────────────────────────

  describe('sortTree()', () => {
    it('sorts folders before files', () => {
      const nodes: any[] = [
        { type: 'file', name: 'a.md', path: 'a.md', key: 'a.md' },
        { type: 'folder', name: 'z', path: 'z', key: 'folder:z', children: [] },
      ];
      sortTree(nodes);
      expect(nodes[0].type).toBe('folder');
      expect(nodes[1].type).toBe('file');
    });
  });

  // ── flattenForDisplay ───────────────────────────────────────────────

  describe('flattenForDisplay()', () => {
    it('flattens nested tree with depth', () => {
      const tree: any[] = [
        {
          type: 'folder', name: 'dir', path: 'dir', key: 'folder:dir',
          children: [{ type: 'file', name: 'f.md', path: 'dir/f.md', key: 'dir/f.md' }],
        },
      ];
      const items = flattenForDisplay(tree);
      expect(items).toHaveLength(2);
      expect(items[0].depth).toBe(0);
      expect(items[1].depth).toBe(1);
      expect(items[0].node.name).toBe('dir');
      expect(items[1].node.name).toBe('f.md');
    });
  });

  // ── countFiles ──────────────────────────────────────────────────────

  describe('countFiles()', () => {
    it('counts files only (not folders)', () => {
      const tree: any[] = [
        {
          type: 'folder', name: 'dir', path: 'dir', key: 'folder:dir',
          children: [
            { type: 'file', name: 'a.md', path: 'dir/a.md', key: 'dir/a.md' },
            { type: 'file', name: 'b.md', path: 'dir/b.md', key: 'dir/b.md' },
          ],
        },
      ];
      expect(countFiles(tree)).toBe(2);
    });
  });
});
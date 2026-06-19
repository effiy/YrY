/**
 * Tests for lib/test-helpers.mjs — verifies file system helpers, content
 * checks, and listing functions work correctly.
 */

import { describe, it, assert, run } from '../test-harness.mjs';

import {
  PROJECT_ROOT,
  DIRS,
  fileExists,
  readFile,
  isDir,
  hasSection,
  hasMermaidDiagram,
  hasTable,
  countMarkdownLinks,
  escapeRegex,
  parseFrontmatter,
  listSkills,
} from '../test-helpers.mjs';

describe('lib/test-helpers.mjs', () => {
  describe('PROJECT_ROOT', () => {
    it('指向包含 lib/ 的目录', () => {
      assert.ok(PROJECT_ROOT.endsWith('YrY') || PROJECT_ROOT.includes('YrY'),
        'must point to project root containing lib/');
      assert.ok(fileExists('lib/test-harness.mjs'), 'lib/ must be reachable from PROJECT_ROOT');
    });
  });

  describe('DIRS 预设', () => {
    it('包含 skills/docs/claude 路径', () => {
      assert.ok(DIRS.skills.endsWith('skills'));
      assert.ok(DIRS.docs.endsWith('docs'));
      assert.ok(DIRS.claude.endsWith('.claude'));
    });
  });

  describe('fileExists()', () => {
    it('存在文件返回 true', () => {
      assert.ok(fileExists('package.json'), 'package.json must exist');
      assert.ok(fileExists('lib/test-harness.mjs'));
    });

    it('不存在文件返回 false', () => {
      assert.equal(fileExists('lib/nonexistent-file-xyz.mjs'), false);
    });
  });

  describe('readFile()', () => {
    it('读取 package.json 内容', () => {
      const content = readFile('package.json');
      assert.ok(content.includes('"name"'), 'package.json should have name field');
    });
  });

  describe('isDir()', () => {
    it('lib/ 是目录', () => assert.ok(isDir('lib')));
    it('package.json 不是目录', () => assert.equal(isDir('package.json'), false));
  });

  describe('hasSection()', () => {
    it('检测 H2 标题', () => {
      const md = '# Title\n\n## Section\n\nbody';
      assert.ok(hasSection(md, 'Section'));
    });

    it('检测 H3 标题', () => {
      const md = '## A\n\n### B\n\nbody';
      assert.ok(hasSection(md, 'B'));
    });

    it('缺少标题返回 false', () => {
      const md = '# Title\n\nbody without section';
      assert.equal(hasSection(md, 'Section'), false);
    });
  });

  describe('hasMermaidDiagram()', () => {
    it('检测 mermaid 代码块', () => {
      const md = '```mermaid\ngraph TD\nA-->B\n```';
      assert.ok(hasMermaidDiagram(md));
    });

    it('无 mermaid 返回 false', () => {
      assert.equal(hasMermaidDiagram('plain text'), false);
    });
  });

  describe('hasTable()', () => {
    it('检测 markdown 表格行', () => {
      const md = '| col1 | col2 |\n|------|------|\n| a | b |';
      assert.ok(hasTable(md));
    });
  });

  describe('countMarkdownLinks()', () => {
    it('统计链接数量', () => {
      const md = '[a](b) [c](d) [e](f)';
      assert.equal(countMarkdownLinks(md), 3);
    });

    it('无链接返回 0', () => {
      assert.equal(countMarkdownLinks('plain text'), 0);
    });
  });

  describe('escapeRegex()', () => {
    it('转义正则元字符', () => {
      assert.equal(escapeRegex('a.b*c'), 'a\\.b\\*c');
      assert.equal(escapeRegex('(x)'), '\\(x\\)');
      assert.equal(escapeRegex('1+1=2'), '1\\+1=2');
    });

    it('普通字符不变', () => {
      assert.equal(escapeRegex('abc'), 'abc');
    });
  });

  describe('parseFrontmatter()', () => {
    it('解析 YAML frontmatter', () => {
      const md = '---\nname: foo\nversion: "1.0"\n---\nbody';
      const fm = parseFrontmatter(md);
      assert.equal(fm.name, 'foo');
      assert.equal(fm.version, '1.0');
    });

    it('无 frontmatter 返回 null', () => {
      assert.equal(parseFrontmatter('plain text'), null);
    });
  });

  describe('listSkills()', () => {
    it('返回非空技能数组', () => {
      const skills = listSkills();
      assert.ok(Array.isArray(skills));
      assert.ok(skills.length > 0, 'should find at least one skill');
      assert.ok(skills.includes('rui'), 'must include core rui skill');
    });
  });
});

run();

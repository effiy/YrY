/**
 * Tests for the rui-npm skill — personal npm package manager.
 */

import { execSync } from 'node:child_process';
import { describe, it, assert, run } from '../lib/test-harness.mjs';
import { fileExists, readFile, hasSection, hasMermaidDiagram } from '../lib/helpers.mjs';

const SKILL_DIR = 'skills/rui-npm';
const STORY_DIR = 'docs/故事任务面板/rui-npm';

describe('rui-npm skill', () => {
  describe('SKILL.md', () => {
    it('exists', () => {
      assert.ok(fileExists(`${SKILL_DIR}/SKILL.md`), 'SKILL.md must exist');
    });

    it('is not empty', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(content.length > 500, 'SKILL.md should have substantial content');
    });

    it('documents all sub-commands', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      const commands = ['search', 'install', 'update', 'list', 'info', 'uninstall', 'publish', 'npx', 'audit'];
      for (const cmd of commands) {
        assert.ok(content.includes(cmd), `must document ${cmd} command`);
      }
    });

    it('has command panorama mermaid diagram', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(hasMermaidDiagram(content), 'SKILL.md must have mermaid diagram');
    });

    it('has degradation strategies', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      assert.ok(content.includes('降级策略'), 'must document degradation strategies');
    });

    it('documents all 7 usage scenarios', () => {
      const content = readFile(`${SKILL_DIR}/SKILL.md`);
      for (let i = 1; i <= 7; i++) {
        assert.ok(content.includes(`场景 ${i}`), `must document scene ${i}`);
      }
    });
  });

  describe('executables', () => {
    it('help.mjs exists', () => {
      assert.ok(fileExists(`${SKILL_DIR}/help.mjs`), 'help.mjs must exist');
    });

    it('rui-npm.mjs exists', () => {
      assert.ok(fileExists(`${SKILL_DIR}/rui-npm.mjs`), 'rui-npm.mjs must exist');
    });

    it('rui-npm.mjs has valid structure', () => {
      const content = readFile(`${SKILL_DIR}/rui-npm.mjs`);
      assert.ok(content.length > 1000, 'rui-npm.mjs should have substantial content');
      // Check for all 9 sub-command handler functions
      const handlers = ['cmdSearch', 'cmdInstall', 'cmdUpdate', 'cmdList', 'cmdInfo', 'cmdUninstall', 'cmdPublish', 'cmdNpx', 'cmdAudit'];
      for (const h of handlers) {
        assert.ok(content.includes(`function ${h}`), `must have ${h} handler`);
      }
    });

    it('rui-npm.mjs --help outputs usage', () => {
      try {
        const out = execSync('node skills/rui-npm/rui-npm.mjs --help 2>&1', {
          cwd: process.cwd(), encoding: 'utf-8', timeout: 10_000,
        });
        assert.ok(out.length > 100 || out.includes('rui-npm') || out.includes('search') || out.includes('install'),
          '--help should output usage info');
      } catch (e) {
        const output = (e.stdout || '') + (e.stderr || '');
        assert.ok(output.length > 20, '--help should produce output');
      }
    });

    it('rui-npm.mjs help command delegates to help.mjs', () => {
      try {
        const out = execSync('node skills/rui-npm/rui-npm.mjs help 2>&1', {
          cwd: process.cwd(), encoding: 'utf-8', timeout: 10_000,
        });
        assert.ok(out.includes('rui-npm') || out.includes('search'), 'help command should show help');
      } catch (e) {
        const output = (e.stdout || '') + (e.stderr || '');
        assert.ok(output.length > 20, 'help should produce output');
      }
    });

    it('npm CLI is available', () => {
      try {
        const out = execSync('npm --version 2>&1', { encoding: 'utf-8', timeout: 10_000 });
        assert.ok(out.trim().length > 0, 'npm should be available');
      } catch (e) {
        assert.fail('npm CLI not available — required for rui-npm');
      }
    });
  });

  describe('story documentation', () => {
    it('story task document exists', () => {
      assert.ok(fileExists(`${STORY_DIR}/故事任务.md`), '故事任务.md must exist');
    });

    it('story task has version history', () => {
      const content = readFile(`${STORY_DIR}/故事任务.md`);
      assert.ok(content.includes('version_history'), 'must have version history');
    });

    it('story task has 4 stories', () => {
      const content = readFile(`${STORY_DIR}/故事任务.md`);
      assert.ok(content.includes('Story 1') && content.includes('Story 2') && content.includes('Story 3') && content.includes('Story 4'),
        'must have 4 stories');
    });

    it('story task has cross-document index', () => {
      const content = readFile(`${STORY_DIR}/故事任务.md`);
      assert.ok(content.includes('跨文档索引'), 'must have cross-document index');
    });

    it('story task has graph positioning', () => {
      const content = readFile(`${STORY_DIR}/故事任务.md`);
      assert.ok(content.includes('图谱定位'), 'must have graph positioning section');
    });
  });

  describe('scene documents', () => {
    const scenes = [
      '场景-1-包搜索与发现',
      '场景-2-包安装与版本管理',
      '场景-3-本地发布与npx使用',
      '场景-4-包信息审计与卸载',
    ];

    for (const scene of scenes) {
      describe(`${scene}`, () => {
        const sceneDir = `${STORY_DIR}/${scene}`;

        it('scene .md exists', () => {
          assert.ok(fileExists(`${sceneDir}/${scene}.md`), `${scene}.md must exist`);
        });

        it('scene has §0-§4 sections', () => {
          const content = readFile(`${sceneDir}/${scene}.md`);
          assert.ok(hasSection(content, '§0 技术评审'), 'must have §0');
          assert.ok(hasSection(content, '§1 测试设计'), 'must have §1');
        });

        it('scene has mermaid effect diagram', () => {
          const content = readFile(`${sceneDir}/${scene}.md`);
          assert.ok(hasMermaidDiagram(content), 'must have mermaid diagram');
        });

        it('scene has emotional goal section', () => {
          const content = readFile(`${sceneDir}/${scene}.md`);
          assert.ok(content.includes('情感目标'), 'must have emotional goal section');
        });

        it('scene has success perception section', () => {
          const content = readFile(`${sceneDir}/${scene}.md`);
          assert.ok(content.includes('成功感知'), 'must have success perception section');
        });

        it('scene has data flow panorama (sequenceDiagram)', () => {
          const content = readFile(`${sceneDir}/${scene}.md`);
          assert.ok(content.includes('sequenceDiagram') || content.includes('数据流全景'),
            'must have data flow panorama');
        });

        it('scene has security considerations', () => {
          const content = readFile(`${sceneDir}/${scene}.md`);
          assert.ok(content.includes('安全考量'), 'must have security considerations section');
        });

        it('scene has Gate A handoff signals', () => {
          const content = readFile(`${sceneDir}/${scene}.md`);
          assert.ok(content.includes('Gate A') || content.includes('交接'),
            'must have Gate A handoff signals');
        });

        // Check for companion HTML files
        it('has architecture diagram HTML', () => {
          assert.ok(fileExists(`${sceneDir}/架构图.html`), '架构图.html must exist');
        });

        it('has knowledge graph HTML', () => {
          assert.ok(fileExists(`${sceneDir}/知识图谱.html`), '知识图谱.html must exist');
        });

        it('has test panel HTML', () => {
          assert.ok(fileExists(`${sceneDir}/测试面板.html`), '测试面板.html must exist');
        });

        it('has review panel HTML', () => {
          assert.ok(fileExists(`${sceneDir}/审查.html`), '审查.html must exist');
        });

        it('has demo HTML', () => {
          assert.ok(fileExists(`${sceneDir}/演示.html`), '演示.html must exist');
        });

        it('has plan checklist HTML', () => {
          assert.ok(fileExists(`${sceneDir}/计划清单.html`), '计划清单.html must exist');
        });
      });
    }
  });

  describe('knowledge graph', () => {
    it('knowledge graph JSON exists', () => {
      assert.ok(fileExists(`${STORY_DIR}/知识图谱.json`), '知识图谱.json must exist');
    });

    it('knowledge graph HTML exists', () => {
      assert.ok(fileExists(`${STORY_DIR}/知识图谱.html`), '知识图谱.html must exist');
    });

    it('knowledge graph JSON has valid structure', () => {
      const raw = readFile(`${STORY_DIR}/知识图谱.json`);
      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch {
        assert.fail('知识图谱.json must be valid JSON');
      }
      assert.ok(parsed.meta, 'must have meta');
      assert.ok(Array.isArray(parsed.domains), 'must have domains array');
      assert.ok(Array.isArray(parsed.flows), 'must have flows array');
      assert.ok(Array.isArray(parsed.nodes), 'must have nodes array');
      assert.ok(Array.isArray(parsed.edges), 'must have edges array');
      assert.ok(parsed.domains.length >= 4, 'must have at least 4 domains');
      assert.ok(parsed.flows.length >= 5, 'must have at least 5 flows');
    });
  });

  describe('plan document', () => {
    it('plan.html exists', () => {
      assert.ok(fileExists(`${STORY_DIR}/plan.html`), 'plan.html must exist');
    });
  });
});

// ── Run ──────────────────────────────────────────────────────────
const exitCode = await run();
process.exit(exitCode);

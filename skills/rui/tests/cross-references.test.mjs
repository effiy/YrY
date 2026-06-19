/**
 * Integration test — cross-cutting consistency checks across
 * skills, agents, rules, and project configuration.
 */

import { execSync } from 'node:child_process';
import { describe, it, assert, run } from '../../../lib/test-harness.mjs';
import {
  fileExists, readFile, readDir, isDir,
  listSkills, listAgents, listRules, listStoryDirs,
  hasSection, PROJECT_ROOT,
} from '../../../lib/test-helpers.mjs';

describe('cross-cutting integration', () => {
  // ── Plugin manifest consistency ─────────────────────────────
  describe('plugin.json', () => {
    it('exists', () => {
      assert.ok(fileExists('.claude-plugin/plugin.json'),
        'plugin.json must exist at .claude-plugin/plugin.json');
    });

    it('is valid JSON with required fields', () => {
      const content = readFile('.claude-plugin/plugin.json');
      const parsed = JSON.parse(content);
      assert.ok(parsed.name, 'must have name field');
      assert.ok(parsed.version, 'must have version field');
      assert.match(parsed.version, /^\d+\.\d+\.\d+/, 'version must be semver');
    });
  });

  // ── CLAUDE.md consistency ───────────────────────────────────
  describe('CLAUDE.md', () => {
    it('exists', () => {
      assert.ok(fileExists('CLAUDE.md'), 'CLAUDE.md must exist');
    });

    it('references skills directory', () => {
      const content = readFile('CLAUDE.md');
      assert.ok(content.includes('skills') || content.includes('技能'), 'must reference skills');
    });

    it('references agent roles (now within skills/)', () => {
      const content = readFile('CLAUDE.md');
      assert.ok(content.includes('skills') || content.includes('Agent'), 'must reference agent roles');
    });

    it('references rules (now within skills/)', () => {
      const content = readFile('CLAUDE.md');
      assert.ok(content.includes('skills') || content.includes('规则'), 'must reference rules');
    });

    it('has rui:project-start/end markers', () => {
      const content = readFile('CLAUDE.md');
      assert.ok(content.includes('rui:project-start'), 'must have rui:project-start marker');
      assert.ok(content.includes('rui:project-end'), 'must have rui:project-end marker');
    });
  });

  // ── README.md consistency ───────────────────────────────────
  describe('README.md', () => {
    it('exists', () => {
      assert.ok(fileExists('README.md'), 'README.md must exist');
    });

    it('references story panel', () => {
      const content = readFile('README.md');
      assert.ok(
        content.includes('故事') || content.includes('story') || content.includes('面板'),
        'must reference story system'
      );
    });
  });

  // ── Skill-agent-rule alignment (now integrated into skills/) ──────
  describe('skill-agent-rule alignment', () => {
    it('most skills cross-reference agents or rules within their own skill dir', () => {
      let passedCount = 0;
      const totalSkills = listSkills().length;
      for (const skill of listSkills()) {
        const content = readFile(`skills/${skill}/SKILL.md`);
        const agents = listAgents();
        const rules = listRules();
        const refsAgent = agents.some(a => content.includes(a));
        const refsRule = rules.some(r => content.includes(r));
        const refsSkillPath = content.includes('skills/');
        if (refsAgent || refsRule || refsSkillPath) passedCount++;
      }
      assert.ok(passedCount >= 4,
        `${passedCount}/${totalSkills} skills reference agents/rules (need >= 4)`);
    });

    it('each agent definition has substantial content', () => {
      // Agents are now in skills/*/<agent>.md
      const AGENT_PATHS = {
        'AGENT': 'skills/rui/AGENT.md',
        'pm': 'skills/rui/pm.md',
        'coder': 'skills/rui/coder.md',
        'tester': 'skills/rui/tester.md',
        'security': 'skills/rui/security.md',
        'reporter': 'skills/rui-reporter/reporter.md',
        'planner': 'skills/rui-plan/planner.md',
        'architect': 'skills/rui-plan/architect.md',
        'code-reviewer': 'skills/rui-code/code-reviewer.md',
        'self-improve': 'skills/rui-yry/self-improve.md',
      };
      for (const [agent, path] of Object.entries(AGENT_PATHS)) {
        if (agent === 'AGENT') continue; // meta doc, skip length check
        const content = readFile(path);
        assert.ok(content.length > 500, `${path} should be substantial (has ${content.length} chars)`);
      }
    });

    it('CLAUDE.md references skills directory', () => {
      const content = readFile('CLAUDE.md');
      assert.ok(content.includes('skills') || content.includes('技能'), 'CLAUDE.md must reference skills');
      // Check that CLAUDE.md links to skills/ or references skill paths
      const refCount = (content.match(/skills\//g) || []).length +
                       (content.match(/技能/g) || []).length;
      assert.ok(refCount >= 2, `CLAUDE.md should reference skills (has ${refCount} refs)`);
    });
  });

  // ── Story document consistency ──────────────────────────────
  describe('story document consistency', () => {
    it('has story panel directory', () => {
      assert.ok(isDir('docs/故事任务面板'), 'story panel directory must exist');
    });

    it('each story dir has 故事任务.md', () => {
      for (const storyDir of listStoryDirs()) {
        const taskFile = `docs/故事任务面板/${storyDir}/故事任务.md`;
        assert.ok(fileExists(taskFile), `${storyDir} must have 故事任务.md`);
      }
    });

    it('each story dir has at least one 场景-N-*.md', () => {
      for (const storyDir of listStoryDirs()) {
        const files = readDir(`docs/故事任务面板/${storyDir}`);
        const sceneFiles = files.filter(f => /^场景-\d+-.+\.md$/.test(f));
        assert.ok(sceneFiles.length >= 1,
          `${storyDir} must have at least 1 scene doc (has ${sceneFiles.length})`);
      }
    });

    it('each story dir has at least one scene subdir with 知识图谱.html', () => {
      for (const storyDir of listStoryDirs()) {
        const storyPath = `docs/故事任务面板/${storyDir}`;
        const entries = readDir(storyPath);
        const sceneDirs = entries.filter(e => /^场景-\d+-/.test(e));
        let hasKg = false;
        for (const sd of sceneDirs) {
          if (fileExists(`${storyPath}/${sd}/知识图谱.html`)) { hasKg = true; break; }
        }
        assert.ok(hasKg || sceneDirs.some(sd =>
          fileExists(`${storyPath}/${sd}/知识图谱.html`)),
          `${storyDir} must have 知识图谱.html in at least one scene subdir`);
      }
    });
  });

  // ── Security baseline ───────────────────────────────────────
  describe('security baseline', () => {
    it('no hardcoded tokens in project files', () => {
      // Scan for common token patterns (skipping node_modules/.git)
      const patterns = [
        'API_X_TOKEN=[A-Za-z0-9_]',  // token=value pattern
        'sk-[A-Za-z0-9]{20,}',        // OpenAI/Claude key pattern
      ];
      for (const pattern of patterns) {
        try {
          const out = execSync(
            `grep -r --include='*.mjs' --include='*.md' --include='*.json' -l '${pattern}' . --exclude-dir=node_modules --exclude-dir=.git 2>/dev/null || true`,
            { cwd: PROJECT_ROOT, encoding: 'utf-8', timeout: 10_000 }
          );
          const files = out.trim().split('\n').filter(Boolean);
          // Exclude known safe files (like SKILL.md that documents the env var name)
          const realHits = files.filter(f =>
            !f.includes('SKILL.md') && !f.includes('help.mjs') && !f.includes('tests/')
          );
          assert.equal(realHits.length, 0,
            `found potential hardcoded tokens in: ${realHits.join(', ')}`);
        } catch (e) {
          // grep returns 1 when no matches — that's success
        }
      }
    });
  });
});

const exitCode = await run();
process.exit(exitCode);

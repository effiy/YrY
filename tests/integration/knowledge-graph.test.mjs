/**
 * Integration test — validates knowledge graph JSON structure
 * across all story directories.
 */

import { describe, it, assert, run } from '../lib/test-harness.mjs';
import { fileExists, readFile, listStoryDirs } from '../lib/helpers.mjs';

describe('knowledge graph integrity', () => {
  const VALID_NODE_TYPES = ['domain', 'flow', 'step'];
  const VALID_EDGE_TYPES = ['contains_flow', 'flow_step', 'cross_domain'];
  const MIN_REQUIREMENTS = {
    domain: 1,
    flow: 1,
    step: 3,
  };

  for (const storyDir of listStoryDirs()) {
    describe(`${storyDir} knowledge graph`, () => {
      let kg;

      // Load and parse
      try {
        const content = readFile(`docs/故事任务面板/${storyDir}/知识图谱.json`);
        kg = JSON.parse(content);
      } catch (e) {
        it('知识图谱.json is valid JSON', () => {
          assert.fail(`failed to parse: ${e.message}`);
        });
        return; // Skip remaining tests for this story
      }

      it('has version field', () => {
        assert.ok(kg.version, 'must have version field');
        assert.match(kg.version, /^\d+\.\d+\.\d+/, 'version must be semver');
      });

      // ── Structure detection: yry-arch uses a different schema ──
      const hasNodesField = !!kg.nodes;
      const hasGraphField = !!kg.graph;
      const hasScenesField = !!kg.scenes;
      const hasDomainsField = !!kg.domains;

      it('has story/context metadata', () => {
        // Either meta.story (self-test schema) or story.name (arch schema)
        const hasStoryMeta = !!(kg.meta && kg.meta.story) || !!(kg.story && kg.story.name);
        assert.ok(hasStoryMeta, 'must have story name in meta or story section');
      });

      it('has structural data (nodes/graph/scenes/domains)', () => {
        const hasStructure = hasNodesField || hasGraphField || hasScenesField || hasDomainsField;
        assert.ok(hasStructure, 'must have structural data (nodes/graph/scenes/domains)');
      });

      // Detailed checks only for the nodes-based schema
      if (hasNodesField) {
        it('has nodes section with domain/flow/step arrays', () => {
          for (const type of VALID_NODE_TYPES) {
            assert.ok(Array.isArray(kg.nodes[type]),
              `nodes.${type} must be an array`);
          }
        });

        it(`meets minimum node requirements (domain>=${MIN_REQUIREMENTS.domain}, flow>=${MIN_REQUIREMENTS.flow}, step>=${MIN_REQUIREMENTS.step})`, () => {
          const domainCount = (kg.nodes.domain || []).length;
          const flowCount = (kg.nodes.flow || []).length;
          const stepCount = (kg.nodes.step || []).length;
          assert.ok(domainCount >= MIN_REQUIREMENTS.domain,
            `domain nodes: ${domainCount} < ${MIN_REQUIREMENTS.domain}`);
          assert.ok(flowCount >= MIN_REQUIREMENTS.flow,
            `flow nodes: ${flowCount} < ${MIN_REQUIREMENTS.flow}`);
          assert.ok(stepCount >= MIN_REQUIREMENTS.step,
            `step nodes: ${stepCount} < ${MIN_REQUIREMENTS.step}`);
        });

        it('has edges array', () => {
          assert.ok(Array.isArray(kg.edges), 'must have edges array');
        });

        it('has layers array', () => {
          assert.ok(Array.isArray(kg.layers), 'must have layers array');
        });
      }

      it('has matching knowledge graph HTML visualization', () => {
        assert.ok(
          fileExists(`docs/故事任务面板/${storyDir}/知识图谱.html`),
          'must have 知识图谱.html visualization'
        );
        const htmlContent = readFile(`docs/故事任务面板/${storyDir}/知识图谱.html`);
        assert.ok(htmlContent.length > 500, '知识图谱.html should be a substantial HTML file');
        assert.ok(htmlContent.includes('<svg') || htmlContent.includes('mermaid') || htmlContent.includes('d3'),
          '知识图谱.html should contain visualization (svg/mermaid/d3)');
      });
    });
  }
});

const exitCode = await run();
process.exit(exitCode);

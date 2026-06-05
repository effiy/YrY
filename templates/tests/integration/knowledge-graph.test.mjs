/**
 * Integration test — validates knowledge graph structure.
 */
import { describe, it, assert } from '../lib/test-harness.mjs';
import { fileExists, readFile } from '../lib/helpers.mjs';

describe('knowledge-graph', () => {
  it('story panels contain HTML files per scenario', () => {
    const stories = readDir('docs/故事任务面板').filter(f => !f.startsWith('.'));
    for (const story of stories) {
      const scenarios = readDir(`docs/故事任务面板/${story}`).filter(f => f.startsWith('场景-'));
      for (const sc of scenarios) {
        const required = ['计划清单.html','架构图.html','知识图谱.html','测试面板.html','交互示例.html','index.html'];
        for (const f of required) {
          assert.ok(fileExists(`docs/故事任务面板/${story}/${sc}/${f}`), `${story}/${sc}/${f} must exist`);
        }
      }
    }
  });
  {{EXTRA_KG_TESTS}}
});

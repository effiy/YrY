/**
 * YryRiskMatrix — 风险矩阵组件测试
 * 重点验证:5x5 矩阵默认 colLabels/rowLabels + parsedCells computed
 */

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { extractTemplate } from './helpers.mjs';

const TEMPLATE = extractTemplate('yry-risk-matrix', 'yry-risk-matrix-tpl');

const YryRiskMatrix = defineComponent({
  name: 'YryRiskMatrix',
  props: {
    cells: { type: String, default: '[]' },
    colLabels: {
      type: String,
      default: '["极低 (1)","低 (2)","中 (3)","高 (4)","极高 (5)"]'
    },
    rowLabels: {
      type: String,
      default: '["极高 (5)","高 (4)","中 (3)","低 (2)","极低 (1)"]'
    },
    severityAxis: { type: String, default: '↑ 严重度' },
    likelihoodAxis: { type: String, default: '可能性 →' }
  },
  computed: {
    parsedCells() {
      try {
        return JSON.parse(this.cells);
      } catch (e) {
        return [];
      }
    },
    parsedColLabels() {
      try {
        return JSON.parse(this.colLabels);
      } catch (e) {
        return [];
      }
    },
    parsedRowLabels() {
      try {
        return JSON.parse(this.rowLabels);
      } catch (e) {
        return [];
      }
    }
  },
  methods: {
    cellObj(r, c) {
      const cells = this.parsedCells;
      return cells[r] && cells[r][c] ? cells[r][c] : {};
    },
    cellCls(r, c) {
      const cell = this.cellObj(r, c);
      if (cell.level) return 'r-' + cell.level;
      return 'l' + r;
    }
  },
  template: TEMPLATE
});

describe('YryRiskMatrix — 默认 props', () => {
  it('默认 colLabels 5 项', () => {
    const w = mount(YryRiskMatrix, { props: {} });
    expect(w.vm.parsedColLabels).toHaveLength(5);
    expect(w.vm.parsedColLabels[0]).toContain('极低');
  });

  it('默认 rowLabels 5 项', () => {
    const w = mount(YryRiskMatrix, { props: {} });
    expect(w.vm.parsedRowLabels).toHaveLength(5);
    expect(w.vm.parsedRowLabels[0]).toContain('极高');
  });

  it('默认 severityAxis="↑ 严重度"', () => {
    const w = mount(YryRiskMatrix, { props: {} });
    expect(w.vm.severityAxis).toBe('↑ 严重度');
  });

  it('默认 likelihoodAxis="可能性 →"', () => {
    const w = mount(YryRiskMatrix, { props: {} });
    expect(w.vm.likelihoodAxis).toBe('可能性 →');
  });
});

describe('YryRiskMatrix — computed.parsedCells', () => {
  it('合法 JSON 解析', () => {
    const cells = JSON.stringify([
      { row: 0, col: 0, count: 1 },
      { row: 4, col: 4, count: 5 }
    ]);
    const w = mount(YryRiskMatrix, { props: { cells } });
    expect(w.vm.parsedCells).toHaveLength(2);
  });

  it('非法 JSON 返回空数组', () => {
    const w = mount(YryRiskMatrix, { props: { cells: 'x' } });
    expect(w.vm.parsedCells).toEqual([]);
  });

  it('空字符串返回空数组', () => {
    const w = mount(YryRiskMatrix, { props: { cells: '' } });
    expect(w.vm.parsedCells).toEqual([]);
  });
});

describe('YryRiskMatrix — 轴标签渲染', () => {
  it('render severity axis', () => {
    const w = mount(YryRiskMatrix, { props: {} });
    expect(w.html()).toContain('严重度');
  });

  it('render likelihood axis', () => {
    const w = mount(YryRiskMatrix, { props: {} });
    expect(w.html()).toContain('可能性');
  });
});

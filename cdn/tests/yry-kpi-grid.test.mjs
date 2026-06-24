/**
 * YryKpiGrid — KPI 网格组件测试
 */

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { extractTemplate } from './helpers.mjs';

const TEMPLATE = extractTemplate('yry-kpi-grid', 'yry-kpi-grid-tpl');

const YryKpiGrid = defineComponent({
  name: 'YryKpiGrid',
  props: {
    kpis: { type: String, default: '[]' },
    cols: { type: [String, Number], default: 6 }
  },
  computed: {
    parsedKpis() {
      try {
        return JSON.parse(this.kpis);
      } catch (e) {
        return [];
      }
    }
  },
  template: TEMPLATE
});

describe('YryKpiGrid — props', () => {
  it('默认 cols=6', () => {
    const w = mount(YryKpiGrid, { props: {} });
    expect(w.vm.cols).toBe(6);
  });

  it('cols 可设为字符串', () => {
    const w = mount(YryKpiGrid, { props: { cols: '4' } });
    expect(w.vm.cols).toBe('4');
  });

  it('cols 可设为数字', () => {
    const w = mount(YryKpiGrid, { props: { cols: 3 } });
    expect(w.vm.cols).toBe(3);
  });
});

describe('YryKpiGrid — computed.parsedKpis', () => {
  it('合法 JSON 解析', () => {
    const kpis = JSON.stringify([
      { label: 'A', num: '1' },
      { label: 'B', num: '2' }
    ]);
    const w = mount(YryKpiGrid, { props: { kpis } });
    expect(w.vm.parsedKpis).toHaveLength(2);
  });

  it('非法 JSON 返回空数组', () => {
    const w = mount(YryKpiGrid, { props: { kpis: 'x' } });
    expect(w.vm.parsedKpis).toEqual([]);
  });

  it('空字符串返回空数组', () => {
    const w = mount(YryKpiGrid, { props: { kpis: '' } });
    expect(w.vm.parsedKpis).toEqual([]);
  });

  it('render KPI 值', () => {
    const kpis = JSON.stringify([{ label: '活跃', num: '42' }]);
    const w = mount(YryKpiGrid, { props: { kpis } });
    expect(w.html()).toContain('活跃');
    expect(w.html()).toContain('42');
  });
});

/**
 * YryStatsGrid — 统计网格组件测试
 */

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { extractTemplate } from './helpers.mjs';

const TEMPLATE = extractTemplate('yry-stats-grid', 'yry-stats-grid-tpl');

const YryStatsGrid = defineComponent({
  name: 'YryStatsGrid',
  props: {
    items: { type: Array, required: true }
  },
  template: TEMPLATE
});

describe('YryStatsGrid — 渲染', () => {
  it('空 items 渲染空', () => {
    const w = mount(YryStatsGrid, { props: { items: [] } });
    expect(w.html()).toBeDefined();
  });

  it('render 单项', () => {
    const w = mount(YryStatsGrid, {
      props: { items: [{ label: '通过', value: 42 }] }
    });
    expect(w.html()).toContain('通过');
    expect(w.html()).toContain('42');
  });

  it('render 多项', () => {
    const w = mount(YryStatsGrid, {
      props: {
        items: [
          { label: '通过', value: 42 },
          { label: '失败', value: 3 },
          { label: '跳过', value: 1 }
        ]
      }
    });
    expect(w.html()).toContain('通过');
    expect(w.html()).toContain('失败');
    expect(w.html()).toContain('跳过');
  });

  it('render value + label + sub', () => {
    const w = mount(YryStatsGrid, {
      props: {
        items: [{ value: '95%', label: '成功率', sub: '过去 7 天' }]
      }
    });
    expect(w.html()).toContain('95%');
    expect(w.html()).toContain('成功率');
    expect(w.html()).toContain('过去 7 天');
  });
});

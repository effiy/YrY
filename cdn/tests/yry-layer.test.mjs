/**
 * YryLayer — 层级组件测试
 */

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { extractTemplate } from './helpers.mjs';

const TEMPLATE = extractTemplate('yry-layer', 'yry-layer-tpl');

const YryLayer = defineComponent({
  name: 'YryLayer',
  props: {
    layerId: { type: String, default: '' },
    num: { type: String, required: true },
    titleIcon: { type: String, default: '' },
    titlePrefix: { type: String, default: '' },
    titleAccent: { type: String, default: '' },
    titleSuffix: { type: String, default: '' },
    stats: { type: Array, default: () => [] },
    panels: { type: Array, default: () => [] },
    panelsTitle: { type: String, default: '' },
    panelsContainerTitle: { type: String, default: '' },
    style: { type: [String, Object], default: '' },
    numStyle: { type: [String, Object], default: '' }
  },
  template: TEMPLATE
});

describe('YryLayer — 渲染', () => {
  it('render 必填 num', () => {
    const w = mount(YryLayer, { props: { num: '1' } });
    expect(w.html()).toContain('1');
  });

  it('render num + titlePrefix + titleIcon', () => {
    const w = mount(YryLayer, {
      props: { num: '2', titlePrefix: '依赖', titleIcon: '🔗' }
    });
    expect(w.html()).toContain('2');
    expect(w.html()).toContain('依赖');
    expect(w.html()).toContain('🔗');
  });

  it('render titleAccent + titleSuffix', () => {
    const w = mount(YryLayer, {
      props: { num: '1', titleAccent: '✨', titleSuffix: '(9)' }
    });
    expect(w.html()).toContain('✨');
    expect(w.html()).toContain('(9)');
  });

  it('render stats 数组', () => {
    const w = mount(YryLayer, {
      props: {
        num: '1',
        stats: [
          { label: '总数', value: 10 },
          { label: '完成', value: 5 }
        ]
      }
    });
    expect(w.html()).toContain('总数');
    expect(w.html()).toContain('完成');
  });

  it('render panels 数组', () => {
    const w = mount(YryLayer, {
      props: {
        num: '1',
        panels: [{ id: 'p1', title: '面板 1' }]
      }
    });
    expect(w.html()).toContain('面板 1');
  });

  it('render panelsTitle(需 panels 非空才显示)', () => {
    const w = mount(YryLayer, {
      props: {
        num: '1',
        panelsTitle: '面板组标题',
        panels: [{ id: 'p1', title: '面板 1' }]
      }
    });
    expect(w.html()).toContain('面板组标题');
  });

  it('默认 stats/panels 为空数组', () => {
    const w = mount(YryLayer, { props: { num: '1' } });
    expect(w.vm.stats).toEqual([]);
    expect(w.vm.panels).toEqual([]);
  });
});

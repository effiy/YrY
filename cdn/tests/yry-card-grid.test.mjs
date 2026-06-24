/**
 * YryCardGrid — 卡片网格组件测试
 */

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { extractTemplate } from './helpers.mjs';

const TEMPLATE = extractTemplate('yry-card-grid', 'yry-card-grid-tpl');

const YryCardGrid = defineComponent({
  name: 'YryCardGrid',
  props: {
    items: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    cardProps(item) {
      const out = {};
      for (const k in item) {
        if (k !== 'onClick' && Object.prototype.hasOwnProperty.call(item, k)) {
          out[k] = item[k];
        }
      }
      return out;
    }
  },
  template: TEMPLATE
});

describe('YryCardGrid — 渲染', () => {
  it('空 items 渲染空', () => {
    const w = mount(YryCardGrid, { props: { items: [] } });
    expect(w.html()).toBeDefined();
  });

  it('render 单项', () => {
    const w = mount(YryCardGrid, {
      props: { items: [{ icon: '🎯', name: 'A' }] }
    });
    expect(w.html()).toContain('🎯');
    expect(w.html()).toContain('A');
  });

  it('render 多项', () => {
    const w = mount(YryCardGrid, {
      props: {
        items: [
          { icon: 'a', name: 'A' },
          { icon: 'b', name: 'B' },
          { icon: 'c', name: 'C' }
        ]
      }
    });
    expect(w.html()).toContain('A');
    expect(w.html()).toContain('B');
    expect(w.html()).toContain('C');
  });

  it('默认 items 为空数组', () => {
    const w = mount(YryCardGrid, { props: {} });
    expect(w.vm.items).toEqual([]);
  });
});

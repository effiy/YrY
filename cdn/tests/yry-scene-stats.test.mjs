/**
 * YrySceneStats — 场景统计组件测试
 */

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { extractTemplate } from './helpers.mjs';

const TEMPLATE = extractTemplate('yry-scene-stats', 'yry-scene-stats-tpl');

const YrySceneStats = defineComponent({
  name: 'YrySceneStats',
  props: {
    items: { type: String, default: '[]' }
  },
  computed: {
    parsedItems() {
      try {
        return JSON.parse(this.items);
      } catch (e) {
        return [];
      }
    }
  },
  template: TEMPLATE
});

describe('YrySceneStats — computed.parsedItems', () => {
  it('合法 JSON 解析', () => {
    const items = JSON.stringify([
      { label: 'A', value: 1 },
      { label: 'B', value: 2 }
    ]);
    const w = mount(YrySceneStats, { props: { items } });
    expect(w.vm.parsedItems).toHaveLength(2);
  });

  it('非法 JSON 返回空数组', () => {
    const w = mount(YrySceneStats, { props: { items: 'x' } });
    expect(w.vm.parsedItems).toEqual([]);
  });

  it('空字符串返回空数组', () => {
    const w = mount(YrySceneStats, { props: { items: '' } });
    expect(w.vm.parsedItems).toEqual([]);
  });

  it('默认值 "[]" 返回空数组', () => {
    const w = mount(YrySceneStats, { props: {} });
    expect(w.vm.parsedItems).toEqual([]);
  });

  it('render items 值', () => {
    const items = JSON.stringify([{ label: '通过', value: 42 }]);
    const w = mount(YrySceneStats, { props: { items } });
    expect(w.html()).toContain('通过');
    expect(w.html()).toContain('42');
  });
});

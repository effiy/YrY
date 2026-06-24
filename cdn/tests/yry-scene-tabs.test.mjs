/**
 * YrySceneTabs — 场景标签页组件测试
 * 重点验证:data activeIdx + computed parsedTabs
 */

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { extractTemplate } from './helpers.mjs';

const TEMPLATE = extractTemplate('yry-scene-tabs', 'yry-scene-tabs-tpl');

const YrySceneTabs = defineComponent({
  name: 'YrySceneTabs',
  props: {
    tabs: { type: String, default: '[]' }
  },
  data() {
    return { activeIdx: 0 };
  },
  computed: {
    parsedTabs() {
      try {
        return JSON.parse(this.tabs);
      } catch (e) {
        return [];
      }
    }
  },
  template: TEMPLATE
});

describe('YrySceneTabs — data', () => {
  it('初始 activeIdx=0', () => {
    const w = mount(YrySceneTabs, { props: {} });
    expect(w.vm.activeIdx).toBe(0);
  });
});

describe('YrySceneTabs — computed.parsedTabs', () => {
  it('合法 JSON 解析', () => {
    const tabs = JSON.stringify([{ label: 'A' }, { label: 'B' }]);
    const w = mount(YrySceneTabs, { props: { tabs } });
    expect(w.vm.parsedTabs).toHaveLength(2);
  });

  it('非法 JSON 返回空数组', () => {
    const w = mount(YrySceneTabs, { props: { tabs: 'x' } });
    expect(w.vm.parsedTabs).toEqual([]);
  });

  it('空字符串返回空数组', () => {
    const w = mount(YrySceneTabs, { props: { tabs: '' } });
    expect(w.vm.parsedTabs).toEqual([]);
  });

  it('render tabs label', () => {
    const tabs = JSON.stringify([{ label: '概览' }, { label: '详情' }]);
    const w = mount(YrySceneTabs, { props: { tabs } });
    expect(w.html()).toContain('概览');
    expect(w.html()).toContain('详情');
  });
});

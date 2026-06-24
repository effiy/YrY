/**
 * YryCmdHead — 命令面板头部组件测试
 * 重点验证:computed parsedStats 的 JSON.parse 容错
 */

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { extractTemplate } from './helpers.mjs';

const TEMPLATE = extractTemplate('yry-cmd-head', 'yry-cmd-head-tpl');

const YryCmdHead = defineComponent({
  name: 'YryCmdHead',
  props: {
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    stats: { type: String, default: '[]' }
  },
  computed: {
    parsedStats() {
      try {
        return JSON.parse(this.stats);
      } catch (e) {
        return [];
      }
    }
  },
  template: TEMPLATE
});

describe('YryCmdHead — 渲染', () => {
  it('render title', () => {
    const w = mount(YryCmdHead, { props: { title: '⚡ 命令面板' } });
    expect(w.html()).toContain('⚡ 命令面板');
  });

  it('subtitle 通过 v-html 渲染', () => {
    const w = mount(YryCmdHead, {
      props: { title: 't', subtitle: '<b>描述</b>' }
    });
    expect(w.html()).toContain('<b>描述</b>');
  });
});

describe('YryCmdHead — computed.parsedStats', () => {
  it('合法 JSON 返回解析数组', () => {
    const w = mount(YryCmdHead, {
      props: { stats: '[{"html":"<b>x</b>"},{"html":"y"}]' }
    });
    expect(w.vm.parsedStats).toEqual([{ html: '<b>x</b>' }, { html: 'y' }]);
  });

  it('非法 JSON 返回空数组(容错)', () => {
    const w = mount(YryCmdHead, { props: { stats: 'not json' } });
    expect(w.vm.parsedStats).toEqual([]);
  });

  it('空字符串返回空数组', () => {
    const w = mount(YryCmdHead, { props: { stats: '' } });
    expect(w.vm.parsedStats).toEqual([]);
  });

  it('默认值 "[]" 返回空数组', () => {
    const w = mount(YryCmdHead, { props: {} });
    expect(w.vm.parsedStats).toEqual([]);
  });

  it('parsedStats 为数组类型', () => {
    const w = mount(YryCmdHead, { props: { stats: '[1,2,3]' } });
    expect(Array.isArray(w.vm.parsedStats)).toBe(true);
    expect(w.vm.parsedStats).toHaveLength(3);
  });
});

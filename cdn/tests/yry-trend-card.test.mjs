/**
 * YryTrendCard — 趋势卡片组件测试
 * 重点验证:computed parsedBars JSON 解析
 */

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { extractTemplate } from './helpers.mjs';

const TEMPLATE = extractTemplate('yry-trend-card', 'yry-trend-card-tpl');

const YryTrendCard = defineComponent({
  name: 'YryTrendCard',
  props: {
    title: { type: String, default: '' },
    axis: { type: String, default: '' },
    bars: { type: String, default: '[]' }
  },
  computed: {
    parsedBars() {
      try {
        return JSON.parse(this.bars);
      } catch (e) {
        return [];
      }
    }
  },
  methods: {
    barHeight(v) {
      return Math.max(2, Math.min(100, v || 0));
    }
  },
  template: TEMPLATE
});

describe('YryTrendCard — 渲染', () => {
  it('render title + axis', () => {
    const w = mount(YryTrendCard, {
      props: { title: '七日趋势', axis: '06-16 至 06-22' }
    });
    expect(w.html()).toContain('七日趋势');
    expect(w.html()).toContain('06-16 至 06-22');
  });
});

describe('YryTrendCard — computed.parsedBars', () => {
  it('合法 JSON 数组解析', () => {
    const bars = JSON.stringify([
      { label: '06-16', value: 42 },
      { label: '06-17', value: 55 },
      { label: '06-18', value: 38 }
    ]);
    const w = mount(YryTrendCard, { props: { bars } });
    expect(w.vm.parsedBars).toHaveLength(3);
    expect(w.vm.parsedBars[0]).toEqual({ label: '06-16', value: 42 });
  });

  it('非法 JSON 返回空数组', () => {
    const w = mount(YryTrendCard, { props: { bars: 'invalid' } });
    expect(w.vm.parsedBars).toEqual([]);
  });

  it('空字符串返回空数组', () => {
    const w = mount(YryTrendCard, { props: { bars: '' } });
    expect(w.vm.parsedBars).toEqual([]);
  });

  it('默认值 "[]" 返回空数组', () => {
    const w = mount(YryTrendCard, { props: {} });
    expect(w.vm.parsedBars).toEqual([]);
  });

  it('render bars 值', () => {
    const bars = JSON.stringify([
      { label: 'A', value: 10 },
      { label: 'B', value: 20 }
    ]);
    const w = mount(YryTrendCard, { props: { bars } });
    expect(w.html()).toContain('A');
    expect(w.html()).toContain('B');
  });
});

/**
 * YryCatOverview — 分类概览组件测试
 * 重点验证:parsedSegments/parsedStats computed
 */

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { extractTemplate } from './helpers.mjs';

const TEMPLATE = extractTemplate('yry-cat-overview', 'yry-cat-overview-tpl');

const YryCatOverview = defineComponent({
  name: 'YryCatOverview',
  props: {
    title: { type: String, default: '' },
    segments: { type: String, default: '[]' },
    stats: { type: String, default: '[]' }
  },
  computed: {
    parsedSegments() {
      try {
        return JSON.parse(this.segments);
      } catch (e) {
        return [];
      }
    },
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

describe('YryCatOverview — 渲染', () => {
  it('render title', () => {
    const w = mount(YryCatOverview, { props: { title: '分类总览' } });
    expect(w.html()).toContain('分类总览');
  });
});

describe('YryCatOverview — computed', () => {
  it('parsedSegments 解析数组', () => {
    const segs = JSON.stringify([
      { label: 'A', value: 10 },
      { label: 'B', value: 20 }
    ]);
    const w = mount(YryCatOverview, { props: { segments: segs } });
    expect(w.vm.parsedSegments).toHaveLength(2);
  });

  it('parsedStats 解析统计', () => {
    const stats = JSON.stringify([{ label: '总数', value: 100 }]);
    const w = mount(YryCatOverview, { props: { stats } });
    expect(w.vm.parsedStats[0]).toEqual({ label: '总数', value: 100 });
  });

  it('非法 JSON 返回空数组', () => {
    const w = mount(YryCatOverview, {
      props: { segments: 'x', stats: 'y' }
    });
    expect(w.vm.parsedSegments).toEqual([]);
    expect(w.vm.parsedStats).toEqual([]);
  });

  it('空字符串返回空数组', () => {
    const w = mount(YryCatOverview, {
      props: { segments: '', stats: '' }
    });
    expect(w.vm.parsedSegments).toEqual([]);
    expect(w.vm.parsedStats).toEqual([]);
  });
});

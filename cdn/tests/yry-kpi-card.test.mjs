/**
 * YryKpiCard — KPI 卡片组件测试
 */

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { extractTemplate } from './helpers.mjs';

const TEMPLATE = extractTemplate('yry-kpi-card', 'yry-kpi-card-tpl');

const YryKpiCard = defineComponent({
  name: 'YryKpiCard',
  props: {
    label: { type: String, default: '' },
    num: { type: String, default: '' },
    trend: { type: String, default: '' },
    trendDir: { type: String, default: 'flat' },
    numColor: { type: String, default: '' }
  },
  template: TEMPLATE
});

describe('YryKpiCard — 渲染', () => {
  it('render label + num', () => {
    const w = mount(YryKpiCard, {
      props: { label: '活跃任务', num: '42' }
    });
    expect(w.html()).toContain('活跃任务');
    expect(w.html()).toContain('42');
  });

  it('render trend', () => {
    const w = mount(YryKpiCard, {
      props: { label: 'x', num: '1', trend: '+15%' }
    });
    expect(w.html()).toContain('+15%');
  });

  it('默认 trendDir=flat', () => {
    const w = mount(YryKpiCard, { props: {} });
    expect(w.vm.trendDir).toBe('flat');
  });

  it('trendDir=up 渲染上升样式', () => {
    const w = mount(YryKpiCard, {
      props: { trendDir: 'up', trend: '+10%' }
    });
    expect(w.html()).toContain('up');
  });

  it('trendDir=down 渲染下降样式', () => {
    const w = mount(YryKpiCard, {
      props: { trendDir: 'down', trend: '-5%' }
    });
    expect(w.html()).toContain('down');
  });

  it('numColor 自定义颜色', () => {
    const w = mount(YryKpiCard, {
      props: { num: '99', numColor: '#22c55e' }
    });
    expect(w.html()).toContain('#22c55e');
  });
});

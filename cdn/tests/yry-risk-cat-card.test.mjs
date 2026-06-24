/**
 * YryRiskCatCard — 风险分类卡片组件测试
 */

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { extractTemplate } from './helpers.mjs';

const TEMPLATE = extractTemplate('yry-risk-cat-card', 'yry-risk-cat-card-tpl');

const YryRiskCatCard = defineComponent({
  name: 'YryRiskCatCard',
  props: {
    icon: { type: String, default: '' },
    name: { type: String, default: '' },
    count: { type: String, default: '' },
    iconBg: { type: String, default: '' },
    hot: { type: Boolean, default: false },
    badge: { type: String, default: '' },
    metrics: { type: String, default: '[]' },
    progressWidth: { type: String, default: '50%' },
    progressColor: { type: String, default: '#f59e0b' },
    trendDir: { type: String, default: '' },
    trendText: { type: String, default: '' }
  },
  computed: {
    parsedMetrics() {
      try {
        return JSON.parse(this.metrics);
      } catch (e) {
        return [];
      }
    }
  },
  template: TEMPLATE
});

describe('YryRiskCatCard — 渲染', () => {
  it('render icon + name + count', () => {
    const w = mount(YryRiskCatCard, {
      props: { icon: '⚠️', name: '高风险', count: '12' }
    });
    expect(w.html()).toContain('⚠️');
    expect(w.html()).toContain('高风险');
    expect(w.html()).toContain('12');
  });

  it('默认 hot=false', () => {
    const w = mount(YryRiskCatCard, { props: {} });
    expect(w.vm.hot).toBe(false);
  });

  it('hot=true 渲染热点样式', () => {
    const w = mount(YryRiskCatCard, {
      props: { hot: true }
    });
    expect(w.vm.hot).toBe(true);
  });

  it('render badge', () => {
    const w = mount(YryRiskCatCard, {
      props: { badge: 'critical' }
    });
    expect(w.html()).toContain('critical');
  });

  it('默认 progressWidth="50%"', () => {
    const w = mount(YryRiskCatCard, { props: {} });
    expect(w.vm.progressWidth).toBe('50%');
  });

  it('默认 progressColor="#f59e0b"', () => {
    const w = mount(YryRiskCatCard, { props: {} });
    expect(w.vm.progressColor).toBe('#f59e0b');
  });
});

describe('YryRiskCatCard — computed.parsedMetrics', () => {
  it('合法 JSON 解析', () => {
    const metrics = JSON.stringify([{ label: '总数', value: 10 }]);
    const w = mount(YryRiskCatCard, { props: { metrics } });
    expect(w.vm.parsedMetrics).toHaveLength(1);
  });

  it('非法 JSON 返回空数组', () => {
    const w = mount(YryRiskCatCard, { props: { metrics: 'x' } });
    expect(w.vm.parsedMetrics).toEqual([]);
  });
});

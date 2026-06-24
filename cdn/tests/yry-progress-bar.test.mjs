/**
 * YryProgressBar — 进度条组件测试
 * 重点验证:computed pct 计算
 */

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { extractTemplate } from './helpers.mjs';

const TEMPLATE = extractTemplate('yry-progress-bar', 'yry-progress-bar-tpl');

const YryProgressBar = defineComponent({
  name: 'YryProgressBar',
  props: {
    done: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    label: { type: String, default: '进度' }
  },
  computed: {
    pct() {
      const total = this.total || 0;
      return total > 0 ? Math.round((this.done / total) * 100) : 0;
    }
  },
  template: TEMPLATE
});

describe('YryProgressBar — 渲染', () => {
  it('render label', () => {
    const w = mount(YryProgressBar, { props: { label: '完成度' } });
    expect(w.html()).toContain('完成度');
  });

  it('默认 label 为 "进度"', () => {
    const w = mount(YryProgressBar, { props: {} });
    expect(w.vm.label).toBe('进度');
  });
});

describe('YryProgressBar — computed.pct', () => {
  it('done=0/total=0 → 0%', () => {
    const w = mount(YryProgressBar, { props: { done: 0, total: 0 } });
    expect(w.vm.pct).toBe(0);
  });

  it('done=5/total=10 → 50%', () => {
    const w = mount(YryProgressBar, { props: { done: 5, total: 10 } });
    expect(w.vm.pct).toBe(50);
  });

  it('done=10/total=10 → 100%', () => {
    const w = mount(YryProgressBar, { props: { done: 10, total: 10 } });
    expect(w.vm.pct).toBe(100);
  });

  it('done=3/total=7 → 43%(四舍五入)', () => {
    const w = mount(YryProgressBar, { props: { done: 3, total: 7 } });
    expect(w.vm.pct).toBe(43);
  });

  it('done=1/total=3 → 33%(四舍五入)', () => {
    const w = mount(YryProgressBar, { props: { done: 1, total: 3 } });
    expect(w.vm.pct).toBe(33);
  });

  it('total=0 时 pct=0(防除零)', () => {
    const w = mount(YryProgressBar, { props: { done: 5, total: 0 } });
    expect(w.vm.pct).toBe(0);
  });

  it('done > total 时 pct 可超 100', () => {
    const w = mount(YryProgressBar, { props: { done: 15, total: 10 } });
    expect(w.vm.pct).toBe(150);
  });
});

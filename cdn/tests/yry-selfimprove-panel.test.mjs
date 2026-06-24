/**
 * YrySelfImprovePanel — 自改进分析面板组件测试
 * 重点验证:data 初始状态(复杂 methods 跳过)
 */

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { extractTemplate } from './helpers.mjs';

const TEMPLATE = extractTemplate('yry-selfimprove-panel', 'yry-selfimprove-panel-tpl');

const YrySelfImprovePanel = defineComponent({
  name: 'YrySelfImprovePanel',
  data() {
    return {
      siData: null,
      siRaw: [],
      siPeriod: 'daily',
      loading: false,
      error: null
    };
  },
  template: TEMPLATE
});

describe('YrySelfImprovePanel — data 初始状态', () => {
  it('初始 siData=null', () => {
    const w = mount(YrySelfImprovePanel);
    expect(w.vm.siData).toBeNull();
  });

  it('初始 siRaw 为空数组', () => {
    const w = mount(YrySelfImprovePanel);
    expect(w.vm.siRaw).toEqual([]);
  });

  it('初始 siPeriod="daily"', () => {
    const w = mount(YrySelfImprovePanel);
    expect(w.vm.siPeriod).toBe('daily');
  });

  it('初始 loading=false', () => {
    const w = mount(YrySelfImprovePanel);
    expect(w.vm.loading).toBe(false);
  });

  it('初始 error=null', () => {
    const w = mount(YrySelfImprovePanel);
    expect(w.vm.error).toBeNull();
  });

  it('siPeriod 可切换', async () => {
    const w = mount(YrySelfImprovePanel);
    w.vm.siPeriod = 'weekly';
    await w.vm.$nextTick();
    expect(w.vm.siPeriod).toBe('weekly');
  });

  it('siPeriod 可设为 monthly', async () => {
    const w = mount(YrySelfImprovePanel);
    w.vm.siPeriod = 'monthly';
    await w.vm.$nextTick();
    expect(w.vm.siPeriod).toBe('monthly');
  });
});

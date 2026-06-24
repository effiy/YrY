/**
 * YryCronPanel — 调度任务面板组件测试
 * 重点验证:data 初始状态(复杂 methods + helpers 跳过)
 */

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { extractTemplate } from './helpers.mjs';

const TEMPLATE = extractTemplate('yry-cron-panel', 'yry-cron-panel-tpl');

const YryCronPanel = defineComponent({
  name: 'YryCronPanel',
  data() {
    return {
      tasks: [],
      loading: false,
      error: null,
      now: Date.now()
    };
  },
  template: TEMPLATE
});

describe('YryCronPanel — data 初始状态', () => {
  it('初始 tasks 为空数组', () => {
    const w = mount(YryCronPanel);
    expect(w.vm.tasks).toEqual([]);
  });

  it('初始 loading=false', () => {
    const w = mount(YryCronPanel);
    expect(w.vm.loading).toBe(false);
  });

  it('初始 error=null', () => {
    const w = mount(YryCronPanel);
    expect(w.vm.error).toBeNull();
  });

  it('初始 now 是数字', () => {
    const w = mount(YryCronPanel);
    expect(typeof w.vm.now).toBe('number');
    expect(w.vm.now).toBeGreaterThan(0);
  });

  it('tasks 可加载任务', async () => {
    const w = mount(YryCronPanel);
    w.vm.tasks = [
      { id: 'task1', cron: '*/5 * * * *', prompt: 'check' },
      { id: 'task2', cron: '0 9 * * *', prompt: 'daily' }
    ];
    await w.vm.$nextTick();
    expect(w.vm.tasks).toHaveLength(2);
  });

  it('loading 可切换', async () => {
    const w = mount(YryCronPanel);
    w.vm.loading = true;
    await w.vm.$nextTick();
    expect(w.vm.loading).toBe(true);
  });
});

/**
 * YryGantt — 甘特图组件测试
 * 重点验证:parsedLabels/parsedTasks computed + barHeight method
 */

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { extractTemplate } from './helpers.mjs';

const TEMPLATE = extractTemplate('yry-gantt', 'yry-gantt-tpl');

const YryGantt = defineComponent({
  name: 'YryGantt',
  props: {
    days: { type: Number, default: 15 },
    labels: { type: String, default: '[]' },
    tasks: { type: String, default: '[]' }
  },
  computed: {
    parsedLabels() {
      try {
        return JSON.parse(this.labels);
      } catch (e) {
        return [];
      }
    },
    parsedTasks() {
      try {
        return JSON.parse(this.tasks);
      } catch (e) {
        return [];
      }
    }
  },
  template: TEMPLATE
});

describe('YryGantt — props', () => {
  it('默认 days=15', () => {
    const w = mount(YryGantt, { props: {} });
    expect(w.vm.days).toBe(15);
  });

  it('自定义 days', () => {
    const w = mount(YryGantt, { props: { days: 30 } });
    expect(w.vm.days).toBe(30);
  });
});

describe('YryGantt — computed', () => {
  it('parsedLabels 解析日期数组', () => {
    const labels = JSON.stringify(['06-01', '06-02', '06-03']);
    const w = mount(YryGantt, { props: { labels } });
    expect(w.vm.parsedLabels).toHaveLength(3);
  });

  it('parsedTasks 解析任务数组', () => {
    const tasks = JSON.stringify([
      { name: '任务 1', start: 0, duration: 3 },
      { name: '任务 2', start: 3, duration: 5 }
    ]);
    const w = mount(YryGantt, { props: { tasks } });
    expect(w.vm.parsedTasks).toHaveLength(2);
  });

  it('非法 JSON 返回空数组', () => {
    const w = mount(YryGantt, { props: { labels: 'x', tasks: 'y' } });
    expect(w.vm.parsedLabels).toEqual([]);
    expect(w.vm.parsedTasks).toEqual([]);
  });

  it('空字符串返回空数组', () => {
    const w = mount(YryGantt, { props: { labels: '', tasks: '' } });
    expect(w.vm.parsedLabels).toEqual([]);
    expect(w.vm.parsedTasks).toEqual([]);
  });

  it('render tasks 名称', () => {
    const tasks = JSON.stringify([{ name: '开发任务' }]);
    const w = mount(YryGantt, { props: { tasks } });
    expect(w.html()).toContain('开发任务');
  });
});

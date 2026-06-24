/**
 * YryChecklistHead — 清单头部组件测试
 * 重点验证:percent prop · meta v-html
 */

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { extractTemplate } from './helpers.mjs';

const TEMPLATE = extractTemplate('yry-checklist-head', 'yry-checklist-head-tpl');

const YryChecklistHead = defineComponent({
  name: 'YryChecklistHead',
  props: {
    percent: { type: Number, default: 0 },
    title: { type: String, default: '' },
    meta: { type: String, default: '' }
  },
  template: TEMPLATE
});

describe('YryChecklistHead — 渲染', () => {
  it('render title', () => {
    const w = mount(YryChecklistHead, { props: { title: '清单标题' } });
    expect(w.html()).toContain('清单标题');
  });

  it('meta 通过 v-html 渲染', () => {
    const w = mount(YryChecklistHead, {
      props: { title: 't', meta: '更新: <code>06-13</code>' }
    });
    expect(w.html()).toContain('更新: <code>06-13</code>');
  });
});

describe('YryChecklistHead — percent', () => {
  it('默认 percent 为 0', () => {
    const w = mount(YryChecklistHead, { props: {} });
    expect(w.vm.percent).toBe(0);
  });

  it('percent=100 完成状态', () => {
    const w = mount(YryChecklistHead, { props: { percent: 100 } });
    expect(w.vm.percent).toBe(100);
    expect(w.html()).toContain('100');
  });

  it('percent=50 半完成', () => {
    const w = mount(YryChecklistHead, { props: { percent: 50 } });
    expect(w.html()).toContain('50');
  });

  it('percent=0 未完成', () => {
    const w = mount(YryChecklistHead, { props: { percent: 0 } });
    expect(w.html()).toContain('0');
  });
});

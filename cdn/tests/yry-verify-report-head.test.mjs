/**
 * YryVerifyReportHead — 验证报告头部组件测试
 * 重点验证:computed parsedItems JSON 解析
 */

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { extractTemplate } from './helpers.mjs';

const TEMPLATE = extractTemplate('yry-verify-report-head', 'yry-verify-report-head-tpl');

const YryVerifyReportHead = defineComponent({
  name: 'YryVerifyReportHead',
  props: {
    title: { type: String, default: '' },
    items: { type: String, default: '[]' }
  },
  computed: {
    parsedItems() {
      try {
        return JSON.parse(this.items);
      } catch (e) {
        return [];
      }
    }
  },
  template: TEMPLATE
});

describe('YryVerifyReportHead — 渲染', () => {
  it('render title', () => {
    const w = mount(YryVerifyReportHead, {
      props: { title: '验证报告 — 故事一' }
    });
    expect(w.html()).toContain('验证报告 — 故事一');
  });
});

describe('YryVerifyReportHead — computed.parsedItems', () => {
  it('合法 JSON 数组解析', () => {
    const items = JSON.stringify([
      { label: '通过', value: '42' },
      { label: '失败', value: '3' }
    ]);
    const w = mount(YryVerifyReportHead, { props: { items } });
    expect(w.vm.parsedItems).toHaveLength(2);
    expect(w.vm.parsedItems[0]).toEqual({ label: '通过', value: '42' });
  });

  it('非法 JSON 返回空数组', () => {
    const w = mount(YryVerifyReportHead, { props: { items: 'not json' } });
    expect(w.vm.parsedItems).toEqual([]);
  });

  it('空字符串返回空数组', () => {
    const w = mount(YryVerifyReportHead, { props: { items: '' } });
    expect(w.vm.parsedItems).toEqual([]);
  });

  it('默认值 "[]" 返回空数组', () => {
    const w = mount(YryVerifyReportHead, { props: {} });
    expect(w.vm.parsedItems).toEqual([]);
  });

  it('it.value 通过 v-html 渲染', () => {
    const items = JSON.stringify([{ label: '覆盖率', value: '<b>85%</b>' }]);
    const w = mount(YryVerifyReportHead, { props: { items } });
    expect(w.html()).toContain('<b>85%</b>');
  });
});

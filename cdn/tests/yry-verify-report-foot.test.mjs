/**
 * YryVerifyReportFoot — 验证报告页脚组件测试
 * 重点验证:parsedSections/parsedSigs computed
 */

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { extractTemplate } from './helpers.mjs';

const TEMPLATE = extractTemplate('yry-verify-report-foot', 'yry-verify-report-foot-tpl');

const YryVerifyReportFoot = defineComponent({
  name: 'YryVerifyReportFoot',
  props: {
    summary: { type: String, default: '' },
    sections: { type: String, default: '[]' },
    signatures: { type: String, default: '[]' }
  },
  computed: {
    parsedSections() {
      try {
        return JSON.parse(this.sections);
      } catch (e) {
        return [];
      }
    },
    parsedSigs() {
      try {
        return JSON.parse(this.signatures);
      } catch (e) {
        return [];
      }
    }
  },
  template: TEMPLATE
});

describe('YryVerifyReportFoot — 渲染', () => {
  it('summary 通过 v-html 渲染', () => {
    const w = mount(YryVerifyReportFoot, {
      props: { summary: '<strong>报告汇总</strong>' }
    });
    expect(w.html()).toContain('<strong>报告汇总</strong>');
  });
});

describe('YryVerifyReportFoot — computed.parsedSections', () => {
  it('合法 JSON 数组解析', () => {
    const sections = JSON.stringify([
      { key: 'passed', value: '42' },
      { key: 'failed', value: '3' }
    ]);
    const w = mount(YryVerifyReportFoot, { props: { sections } });
    expect(w.vm.parsedSections).toHaveLength(2);
  });

  it('type=list 渲染 items', () => {
    const sections = JSON.stringify([
      {
        type: 'list',
        key: 'criteria',
        items: ['条件 A', '条件 B']
      }
    ]);
    const w = mount(YryVerifyReportFoot, { props: { sections } });
    expect(w.html()).toContain('条件 A');
    expect(w.html()).toContain('条件 B');
  });

  it('非法 JSON 返回空数组', () => {
    const w = mount(YryVerifyReportFoot, { props: { sections: 'x' } });
    expect(w.vm.parsedSections).toEqual([]);
  });
});

describe('YryVerifyReportFoot — computed.parsedSigs', () => {
  it('合法签名数组解析', () => {
    const sigs = JSON.stringify([
      { name: '张三', role: 'PM', date: '06-22' },
      { name: '李四', role: 'DEV', date: '06-22' }
    ]);
    const w = mount(YryVerifyReportFoot, { props: { signatures: sigs } });
    expect(w.vm.parsedSigs).toHaveLength(2);
    expect(w.vm.parsedSigs[0]).toEqual({ name: '张三', role: 'PM', date: '06-22' });
  });

  it('非法 JSON 返回空数组', () => {
    const w = mount(YryVerifyReportFoot, { props: { signatures: 'x' } });
    expect(w.vm.parsedSigs).toEqual([]);
  });

  it('空字符串返回空数组', () => {
    const w = mount(YryVerifyReportFoot, { props: { signatures: '' } });
    expect(w.vm.parsedSigs).toEqual([]);
  });
});

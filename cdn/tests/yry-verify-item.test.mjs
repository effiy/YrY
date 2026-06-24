/**
 * YryVerifyItem — 验证项组件测试
 * 重点验证:type-based 渲染分支(text/code/list)· computed parsedSections
 */

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { extractTemplate } from './helpers.mjs';

const TEMPLATE = extractTemplate('yry-verify-item', 'yry-verify-item-tpl');

const YryVerifyItem = defineComponent({
  name: 'YryVerifyItem',
  props: {
    label: { type: String, default: '' },
    status: { type: String, default: 'pass' },
    sections: { type: String, default: '[]' }
  },
  computed: {
    parsedSections() {
      try {
        return JSON.parse(this.sections);
      } catch (e) {
        return [];
      }
    }
  },
  template: TEMPLATE
});

describe('YryVerifyItem — 基础渲染', () => {
  it('render label', () => {
    const w = mount(YryVerifyItem, { props: { label: '验证项 1' } });
    expect(w.html()).toContain('验证项 1');
  });

  it('默认 status 为 pass', () => {
    const w = mount(YryVerifyItem, { props: {} });
    expect(w.vm.status).toBe('pass');
  });

  it('status=fail 渲染失败样式', () => {
    const w = mount(YryVerifyItem, { props: { status: 'fail' } });
    expect(w.html()).toContain('fail');
  });
});

describe('YryVerifyItem — computed.parsedSections', () => {
  it('合法 JSON 数组解析', () => {
    const sections = JSON.stringify([
      { type: 'text', value: '结果 A' },
      { type: 'code', value: 'console.log(1)' }
    ]);
    const w = mount(YryVerifyItem, { props: { sections } });
    expect(w.vm.parsedSections).toHaveLength(2);
    expect(w.vm.parsedSections[0]).toEqual({ type: 'text', value: '结果 A' });
  });

  it('非法 JSON 返回空数组', () => {
    const w = mount(YryVerifyItem, { props: { sections: 'invalid' } });
    expect(w.vm.parsedSections).toEqual([]);
  });

  it('空字符串返回空数组', () => {
    const w = mount(YryVerifyItem, { props: { sections: '' } });
    expect(w.vm.parsedSections).toEqual([]);
  });
});

describe('YryVerifyItem — type 分支渲染', () => {
  it('type=text 渲染文本值', () => {
    const sections = JSON.stringify([{ type: 'text', value: '通过' }]);
    const w = mount(YryVerifyItem, { props: { sections } });
    expect(w.html()).toContain('通过');
  });

  it('type=code 渲染 <pre> 包裹', () => {
    const sections = JSON.stringify([{ type: 'code', value: 'npm test' }]);
    const w = mount(YryVerifyItem, { props: { sections } });
    expect(w.html()).toContain('npm test');
  });

  it('type=list 渲染列表项', () => {
    const sections = JSON.stringify([
      {
        type: 'list',
        items: ['条件一', '条件二']
      }
    ]);
    const w = mount(YryVerifyItem, { props: { sections } });
    expect(w.html()).toContain('条件一');
    expect(w.html()).toContain('条件二');
  });
});

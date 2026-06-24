/**
 * YryQuickstart — 快速开始组件测试
 * 重点验证:tip v-html + cmd 文本
 */

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { extractTemplate } from './helpers.mjs';

const TEMPLATE = extractTemplate('yry-quickstart', 'yry-quickstart-tpl');

const YryQuickstart = defineComponent({
  name: 'YryQuickstart',
  props: {
    tip: { type: String, default: '' },
    cmd: { type: String, default: '' }
  },
  template: TEMPLATE
});

describe('YryQuickstart — 渲染', () => {
  it('render cmd', () => {
    const w = mount(YryQuickstart, {
      props: { cmd: 'npm install yry-cdn' }
    });
    expect(w.html()).toContain('npm install yry-cdn');
  });

  it('tip 通过 v-html 渲染', () => {
    const w = mount(YryQuickstart, {
      props: { tip: '<strong>提示:</strong>需要 Node 18+' }
    });
    expect(w.html()).toContain('<strong>提示:</strong>需要 Node 18+');
  });

  it('默认 tip/cmd 为空字符串', () => {
    const w = mount(YryQuickstart, { props: {} });
    expect(w.vm.tip).toBe('');
    expect(w.vm.cmd).toBe('');
  });

  it('同时 render tip + cmd', () => {
    const w = mount(YryQuickstart, {
      props: { tip: '<em>提示</em>', cmd: 'npm test' }
    });
    expect(w.html()).toContain('<em>提示</em>');
    expect(w.html()).toContain('npm test');
  });
});

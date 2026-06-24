/**
 * YryOpBtn — 操作按钮组件测试
 */

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { extractTemplate } from './helpers.mjs';

const TEMPLATE = extractTemplate('yry-op-btn', 'yry-op-btn-tpl');

const YryOpBtn = defineComponent({
  name: 'YryOpBtn',
  props: {
    label: { type: String, default: '' },
    icon: { type: String, default: '' },
    href: { type: String, default: '' },
    target: { type: String, default: '' },
    tone: { type: String, default: '' }
  },
  template: TEMPLATE
});

describe('YryOpBtn — 渲染', () => {
  it('render label', () => {
    const w = mount(YryOpBtn, { props: { label: '执行' } });
    expect(w.html()).toContain('执行');
  });

  it('render icon + label', () => {
    const w = mount(YryOpBtn, { props: { icon: '▶', label: '运行' } });
    expect(w.html()).toContain('▶');
    expect(w.html()).toContain('运行');
  });

  it('href 渲染为 <a>', () => {
    const w = mount(YryOpBtn, {
      props: { label: 'x', href: '/action' }
    });
    expect(w.html()).toContain('href="/action"');
  });

  it('target=_blank 渲染', () => {
    const w = mount(YryOpBtn, {
      props: { label: 'x', href: '/x', target: '_blank' }
    });
    expect(w.html()).toContain('_blank');
  });

  it('tone 应用样式', () => {
    const w = mount(YryOpBtn, {
      props: { label: 'x', tone: 'primary' }
    });
    expect(w.html()).toContain('primary');
  });

  it('默认 props 都为空字符串', () => {
    const w = mount(YryOpBtn, { props: {} });
    expect(w.vm.label).toBe('');
    expect(w.vm.icon).toBe('');
    expect(w.vm.href).toBe('');
    expect(w.vm.target).toBe('');
    expect(w.vm.tone).toBe('');
  });
});

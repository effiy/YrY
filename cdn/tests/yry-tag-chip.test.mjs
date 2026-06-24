/**
 * YryTagChip — 标签芯片组件测试
 * 重点验证:modifier 变体 · href 渲染分支
 */

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { extractTemplate } from './helpers.mjs';

const TEMPLATE = extractTemplate('yry-tag-chip', 'yry-tag-chip-tpl');

const YryTagChip = defineComponent({
  name: 'YryTagChip',
  props: {
    text: { type: String, required: true },
    modifier: { type: String, default: 'info' },
    href: { type: String, default: '' }
  },
  template: TEMPLATE
});

describe('YryTagChip — 渲染', () => {
  it('render 必填 text', () => {
    const w = mount(YryTagChip, { props: { text: '核心' } });
    expect(w.html()).toContain('核心');
  });

  it('默认 modifier 为 info', () => {
    const w = mount(YryTagChip, { props: { text: 'x' } });
    expect(w.vm.modifier).toBe('info');
  });

  it('提供 modifier 时应用到 class', () => {
    const w = mount(YryTagChip, { props: { text: 'x', modifier: 'accent' } });
    expect(w.html()).toContain('accent');
  });

  it('href 提供时渲染为 <a>', () => {
    const w = mount(YryTagChip, {
      props: { text: '链接', href: 'https://example.com' }
    });
    expect(w.html()).toContain('href="https://example.com"');
    expect(w.html()).toContain('链接');
  });

  it('href 为空时渲染为 <span> (非 <a>)', () => {
    const w = mount(YryTagChip, { props: { text: '纯文本' } });
    expect(w.html()).toContain('纯文本');
    expect(w.html()).not.toContain('href=');
  });

  it('支持各种 modifier 变体', () => {
    const variants = ['accent', 'info', 'cyan', 'green', 'purple', 'red', 'warn', 'blue'];
    for (const v of variants) {
      const w = mount(YryTagChip, { props: { text: 'x', modifier: v } });
      expect(w.html()).toContain(v);
    }
  });
});

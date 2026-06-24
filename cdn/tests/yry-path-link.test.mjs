/**
 * YryPathLink — 路径链接组件测试
 */

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { extractTemplate } from './helpers.mjs';

const TEMPLATE = extractTemplate('yry-path-link', 'yry-path-link-tpl');

const YryPathLink = defineComponent({
  name: 'YryPathLink',
  props: {
    display: { type: String, default: '' },
    full: { type: String, default: '' },
    href: { type: String, default: '' },
    target: { type: String, default: '' }
  },
  template: TEMPLATE
});

describe('YryPathLink — 渲染', () => {
  it('render display', () => {
    const w = mount(YryPathLink, { props: { display: 'src/index.js' } });
    expect(w.html()).toContain('src/index.js');
  });

  it('href 渲染为 <a>', () => {
    const w = mount(YryPathLink, {
      props: { display: 'x', href: '/path/to/file' }
    });
    expect(w.html()).toContain('href="/path/to/file"');
  });

  it('target=_blank 渲染', () => {
    const w = mount(YryPathLink, {
      props: { display: 'x', href: '/x', target: '_blank' }
    });
    expect(w.html()).toContain('_blank');
  });

  it('full 显示完整路径(可能作为 title)', () => {
    const w = mount(YryPathLink, {
      props: { display: 'index.js', full: '/full/path/to/index.js' }
    });
    expect(w.html()).toContain('index.js');
    // full 可能作为 title 属性
    expect(w.html()).toContain('/full/path/to/index.js');
  });

  it('默认 props 都为空字符串', () => {
    const w = mount(YryPathLink, { props: {} });
    expect(w.vm.display).toBe('');
    expect(w.vm.full).toBe('');
    expect(w.vm.href).toBe('');
    expect(w.vm.target).toBe('');
  });
});

/**
 * YrySceneNav — 场景导航组件测试
 */

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { extractTemplate } from './helpers.mjs';

const TEMPLATE = extractTemplate('yry-scene-nav', 'yry-scene-nav-tpl');

const YrySceneNav = defineComponent({
  name: 'YrySceneNav',
  props: {
    items: { type: Array, required: true },
    separator: { type: String, default: '·' }
  },
  template: TEMPLATE
});

describe('YrySceneNav — 渲染', () => {
  it('空 items 渲染空', () => {
    const w = mount(YrySceneNav, { props: { items: [] } });
    expect(w.html()).toBeDefined();
  });

  it('render 单项', () => {
    const w = mount(YrySceneNav, {
      props: { items: [{ label: '首页', href: '/' }] }
    });
    expect(w.html()).toContain('首页');
  });

  it('render 多项', () => {
    const w = mount(YrySceneNav, {
      props: {
        items: [
          { label: 'A', href: '/a' },
          { label: 'B', href: '/b' },
          { label: 'C', href: '/c' }
        ]
      }
    });
    expect(w.html()).toContain('A');
    expect(w.html()).toContain('B');
    expect(w.html()).toContain('C');
  });

  it('默认 separator="·"', () => {
    const w = mount(YrySceneNav, { props: { items: [] } });
    expect(w.vm.separator).toBe('·');
  });

  it('自定义 separator', () => {
    const w = mount(YrySceneNav, {
      props: { items: [], separator: '|' }
    });
    expect(w.vm.separator).toBe('|');
  });
});

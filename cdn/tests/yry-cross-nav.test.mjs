/**
 * YryCrossNav — 横向导航组件测试
 */

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { extractTemplate } from './helpers.mjs';

const TEMPLATE = extractTemplate('yry-cross-nav', 'yry-cross-nav-tpl');

const YryCrossNav = defineComponent({
  name: 'YryCrossNav',
  props: {
    basePath: { type: String, default: './' },
    pages: { type: Array, default: () => [] },
    active: { type: String, default: '' }
  },
  template: TEMPLATE
});

describe('YryCrossNav — 渲染', () => {
  it('空 pages 渲染空', () => {
    const w = mount(YryCrossNav, { props: { pages: [] } });
    expect(w.html()).toBeDefined();
  });

  it('render 单页', () => {
    const w = mount(YryCrossNav, {
      props: { pages: [{ id: '首页', href: 'index.html', icon: '🏠' }] }
    });
    expect(w.html()).toContain('首页');
  });

  it('render 多页', () => {
    const w = mount(YryCrossNav, {
      props: {
        pages: [
          { id: '首页', href: 'index.html' },
          { id: '故事', href: 'story.html' },
          { id: '场景', href: 'scene.html' }
        ]
      }
    });
    expect(w.html()).toContain('首页');
    expect(w.html()).toContain('故事');
    expect(w.html()).toContain('场景');
  });

  it('basePath 默认 "./"', () => {
    const w = mount(YryCrossNav, { props: {} });
    expect(w.vm.basePath).toBe('./');
  });

  it('active 标识当前页(渲染 span.on 而非 a)', () => {
    const w = mount(YryCrossNav, {
      props: {
        pages: [{ id: '首页', href: 'index.html' }],
        active: '首页'
      }
    });
    expect(w.vm.active).toBe('首页');
    expect(w.html()).toContain('on');
  });
});

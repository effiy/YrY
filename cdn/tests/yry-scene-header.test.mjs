/**
 * YrySceneHeader — 场景头部组件测试
 */

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { extractTemplate } from './helpers.mjs';

const TEMPLATE = extractTemplate('yry-scene-header', 'yry-scene-header-tpl');

const YrySceneHeader = defineComponent({
  name: 'YrySceneHeader',
  props: {
    icon: { type: String, default: '' },
    titlePrefix: { type: String, default: '' },
    accent: { type: String, default: '' },
    meta: { type: String, default: '' },
    desc: { type: String, default: '' }
  },
  template: TEMPLATE
});

describe('YrySceneHeader — 渲染', () => {
  it('render icon + titlePrefix', () => {
    const w = mount(YrySceneHeader, {
      props: { icon: '🎬', titlePrefix: '场景 1' }
    });
    expect(w.html()).toContain('🎬');
    expect(w.html()).toContain('场景 1');
  });

  it('accent 渲染强调样式', () => {
    const w = mount(YrySceneHeader, {
      props: { accent: 'highlight' }
    });
    expect(w.html()).toContain('highlight');
  });

  it('meta 通过文本插值渲染', () => {
    const w = mount(YrySceneHeader, {
      props: { meta: '更新于 06-22' }
    });
    expect(w.html()).toContain('更新于 06-22');
  });

  it('desc 通过文本插值渲染', () => {
    const w = mount(YrySceneHeader, {
      props: { desc: '场景描述文本' }
    });
    expect(w.html()).toContain('场景描述文本');
  });

  it('所有 prop 默认空字符串', () => {
    const w = mount(YrySceneHeader, { props: {} });
    expect(w.vm.icon).toBe('');
    expect(w.vm.titlePrefix).toBe('');
    expect(w.vm.accent).toBe('');
    expect(w.vm.meta).toBe('');
    expect(w.vm.desc).toBe('');
  });
});

/**
 * YryLayerRules — Layer Rules 组件测试(无 props, template-only)
 */

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { extractTemplate } from './helpers.mjs';

const TEMPLATE = extractTemplate('yry-layer-rules', 'yry-layer-rules-tpl');

const YryLayerRules = defineComponent({
  name: 'YryLayerRules',
  template: TEMPLATE
});

describe('YryLayerRules — 渲染', () => {
  it('组件能挂载', () => {
    const w = mount(YryLayerRules);
    expect(w.html()).toBeDefined();
  });

  it('无 props 也能渲染', () => {
    const w = mount(YryLayerRules);
    expect(w.html().length).toBeGreaterThan(0);
  });
});

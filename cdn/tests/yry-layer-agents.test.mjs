/**
 * YryLayerAgents — Layer Agents 组件测试(无 props, template-only)
 */

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { extractTemplate } from './helpers.mjs';

const TEMPLATE = extractTemplate('yry-layer-agents', 'yry-layer-agents-tpl');

const YryLayerAgents = defineComponent({
  name: 'YryLayerAgents',
  template: TEMPLATE
});

describe('YryLayerAgents — 渲染', () => {
  it('组件能挂载', () => {
    const w = mount(YryLayerAgents);
    expect(w.html()).toBeDefined();
  });

  it('无 props 也能渲染', () => {
    const w = mount(YryLayerAgents);
    expect(w.html().length).toBeGreaterThan(0);
  });
});

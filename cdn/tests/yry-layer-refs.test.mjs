/**
 * YryLayerRefs — Layer 6 参考入口组件测试
 */

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { extractTemplate } from './helpers.mjs';

const TEMPLATE = extractTemplate('yry-layer-refs', 'yry-layer-refs-tpl');

const YryLayerRefs = defineComponent({
  name: 'YryLayerRefs',
  template: TEMPLATE
});

describe('YryLayerRefs — 渲染', () => {
  it('组件能挂载', () => {
    const w = mount(YryLayerRefs);
    expect(w.html()).toBeDefined();
  });
});

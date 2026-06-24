/**
 * YryFlowLoop — 流程闭环组件测试
 */

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { extractTemplate } from './helpers.mjs';

const TEMPLATE = extractTemplate('yry-flow-loop', 'yry-flow-loop-tpl');

const YryFlowLoop = defineComponent({
  name: 'YryFlowLoop',
  props: {
    stages: { type: Array, required: true },
    loopArrow: { type: Boolean, default: true },
    loopIcon: { type: String, default: '↻' },
    arrowIcon: { type: String, default: '→' }
  },
  template: TEMPLATE
});

describe('YryFlowLoop — 渲染', () => {
  it('render 必填 stages', () => {
    const w = mount(YryFlowLoop, {
      props: { stages: [{ icon: '👀', name: '观察', variant: 'observe' }] }
    });
    expect(w.html()).toContain('观察');
    expect(w.html()).toContain('👀');
  });

  it('render 多阶段', () => {
    const w = mount(YryFlowLoop, {
      props: {
        stages: [
          { icon: 'a', name: '观察', variant: 'observe' },
          { icon: 'b', name: '诊断', variant: 'diagnose' },
          { icon: 'c', name: '改进', variant: 'improve' },
          { icon: 'd', name: '评估', variant: 'evaluate' }
        ]
      }
    });
    expect(w.html()).toContain('观察');
    expect(w.html()).toContain('诊断');
    expect(w.html()).toContain('改进');
    expect(w.html()).toContain('评估');
  });

  it('默认 loopArrow=true', () => {
    const w = mount(YryFlowLoop, { props: { stages: [] } });
    expect(w.vm.loopArrow).toBe(true);
  });

  it('默认 loopIcon="↻"', () => {
    const w = mount(YryFlowLoop, { props: { stages: [] } });
    expect(w.vm.loopIcon).toBe('↻');
  });

  it('默认 arrowIcon="→"', () => {
    const w = mount(YryFlowLoop, { props: { stages: [] } });
    expect(w.vm.arrowIcon).toBe('→');
  });

  it('自定义 loopIcon 和 arrowIcon', () => {
    const w = mount(YryFlowLoop, {
      props: { stages: [], loopIcon: '🔄', arrowIcon: '➜' }
    });
    expect(w.vm.loopIcon).toBe('🔄');
    expect(w.vm.arrowIcon).toBe('➜');
  });
});

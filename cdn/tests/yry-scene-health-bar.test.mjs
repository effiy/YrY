/**
 * YrySceneHealthBar — 场景健康条组件测试
 */

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { extractTemplate } from './helpers.mjs';

const TEMPLATE = extractTemplate('yry-scene-health-bar', 'yry-scene-health-bar-tpl');

const YrySceneHealthBar = defineComponent({
  name: 'YrySceneHealthBar',
  props: {
    segments: { type: String, default: '[]' }
  },
  computed: {
    parsedSegments() {
      try {
        return JSON.parse(this.segments);
      } catch (e) {
        return [];
      }
    }
  },
  template: TEMPLATE
});

describe('YrySceneHealthBar — computed.parsedSegments', () => {
  it('合法 JSON 数组解析', () => {
    const segs = JSON.stringify([
      { label: 'A', value: 30, color: 'green' },
      { label: 'B', value: 70, color: 'red' }
    ]);
    const w = mount(YrySceneHealthBar, { props: { segments: segs } });
    expect(w.vm.parsedSegments).toHaveLength(2);
  });

  it('非法 JSON 返回空数组', () => {
    const w = mount(YrySceneHealthBar, { props: { segments: 'x' } });
    expect(w.vm.parsedSegments).toEqual([]);
  });

  it('空字符串返回空数组', () => {
    const w = mount(YrySceneHealthBar, { props: { segments: '' } });
    expect(w.vm.parsedSegments).toEqual([]);
  });

  it('默认值 "[]" 返回空数组', () => {
    const w = mount(YrySceneHealthBar, { props: {} });
    expect(w.vm.parsedSegments).toEqual([]);
  });

  it('render segments(使用 cls + pct)', () => {
    const segs = JSON.stringify([{ cls: 'pass', pct: 50 }]);
    const w = mount(YrySceneHealthBar, { props: { segments: segs } });
    expect(w.html()).toContain('pass');
    expect(w.html()).toContain('width: 50%');
  });
});

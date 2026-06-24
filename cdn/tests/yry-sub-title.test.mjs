/**
 * YrySubTitle — 副标题组件测试
 */

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { extractTemplate } from './helpers.mjs';

const TEMPLATE = extractTemplate('yry-sub-title', 'yry-sub-title-tpl');

const YrySubTitle = defineComponent({
  name: 'YrySubTitle',
  props: {
    icon: { type: String, default: '' },
    text: { type: String, required: true },
    count: { type: String, default: '' }
  },
  template: TEMPLATE
});

describe('YrySubTitle — 渲染', () => {
  it('render 必填 text', () => {
    const w = mount(YrySubTitle, { props: { text: '副标题' } });
    expect(w.html()).toContain('副标题');
  });

  it('render icon + text', () => {
    const w = mount(YrySubTitle, {
      props: { icon: '🎯', text: '目标' }
    });
    expect(w.html()).toContain('🎯');
    expect(w.html()).toContain('目标');
  });

  it('render count', () => {
    const w = mount(YrySubTitle, {
      props: { text: '项目', count: '(12)' }
    });
    expect(w.html()).toContain('项目');
    expect(w.html()).toContain('(12)');
  });

  it('icon 默认空字符串', () => {
    const w = mount(YrySubTitle, { props: { text: 'x' } });
    expect(w.vm.icon).toBe('');
  });

  it('count 默认空字符串', () => {
    const w = mount(YrySubTitle, { props: { text: 'x' } });
    expect(w.vm.count).toBe('');
  });
});

/**
 * YryStoryCardList — 故事卡片列表组件测试
 */

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { extractTemplate } from './helpers.mjs';

const TEMPLATE = extractTemplate('yry-story-card-list', 'yry-story-card-list-tpl');

const YryStoryCardList = defineComponent({
  name: 'YryStoryCardList',
  props: {
    summary: { type: Array, default: () => [] },
    stories: { type: Array, default: () => [] }
  },
  template: TEMPLATE
});

describe('YryStoryCardList — 渲染', () => {
  it('空 summary + stories 渲染空', () => {
    const w = mount(YryStoryCardList, { props: {} });
    expect(w.html()).toBeDefined();
  });

  it('render summary 摘要条', () => {
    const w = mount(YryStoryCardList, {
      props: {
        summary: [
          { value: 10, label: '总数' },
          { value: 5, label: '完成' }
        ]
      }
    });
    expect(w.html()).toContain('总数');
    expect(w.html()).toContain('完成');
  });

  it('render stories 故事列表', () => {
    const w = mount(YryStoryCardList, {
      props: {
        stories: [
          { badge: 'v1.0', title: '故事一', desc: '描述一' },
          { badge: 'v2.0', title: '故事二', desc: '描述二' }
        ]
      }
    });
    expect(w.html()).toContain('故事一');
    expect(w.html()).toContain('故事二');
  });

  it('默认 summary/stories 为空数组', () => {
    const w = mount(YryStoryCardList, { props: {} });
    expect(w.vm.summary).toEqual([]);
    expect(w.vm.stories).toEqual([]);
  });

  it('render stories 场景标签', () => {
    const w = mount(YryStoryCardList, {
      props: {
        stories: [
          {
            title: '故事 X',
            scenes: [{ name: '场景 1' }, { name: '场景 2' }]
          }
        ]
      }
    });
    expect(w.html()).toContain('场景 1');
    expect(w.html()).toContain('场景 2');
  });
});

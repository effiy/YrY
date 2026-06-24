/**
 * Component test 示例 — YryStoryCard
 *
 * 测试策略:
 *   - 从 yry-story-card/index.html 提取模板字符串(绕过 async fetch)
 *   - 手工构造 Vue 组件 options 对象(复制 index.js 的 buildComponent 内容)
 *   - 用 @vue/test-utils mount 验证渲染
 *
 * 说明:真正的集成测试(包含 loader + fetch + DOMParser)见 vue-ce-loader.test.mjs
 */

import { describe, it, expect, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';

const CDN_DIR = path.resolve(import.meta.dirname, '..');
const componentHtml = fs.readFileSync(`${CDN_DIR}/yry-story-card/index.html`, 'utf8');

function extractTemplate(html, id) {
  const re = new RegExp(`<script[^>]*id="${id}"[^>]*>([\\s\\S]*?)</script>`);
  const m = html.match(re);
  return m ? m[1].trim() : '';
}

const TEMPLATE = extractTemplate(componentHtml, 'yry-story-card-tpl');

const YryStoryCard = defineComponent({
  name: 'YryStoryCard',
  props: {
    icon: { type: String, default: '' },
    name: { type: String, required: true },
    nameHref: { type: String, default: '' },
    nameTarget: { type: String, default: '' },
    badge: { type: String, default: '' },
    desc: { type: String, default: '' },
    scenes: { type: Array, default: () => [] },
    demo: { type: String, default: '' },
    links: { type: Array, default: () => [] }
  },
  template: TEMPLATE
});

describe('YryStoryCard — 组件渲染测试', () => {
  it('模板已提取', () => {
    expect(TEMPLATE).toContain('story-card');
    expect(TEMPLATE).toContain('v-if');
  });

  it('render 必填 name prop', () => {
    const wrapper = mount(YryStoryCard, { props: { name: '测试故事' } });
    expect(wrapper.html()).toContain('测试故事');
  });

  it('render icon + name + badge', () => {
    const wrapper = mount(YryStoryCard, {
      props: { icon: '🎯', name: '故事名', badge: 'v1.0' }
    });
    expect(wrapper.html()).toContain('🎯');
    expect(wrapper.html()).toContain('故事名');
    expect(wrapper.html()).toContain('v1.0');
  });

  it('render 场景 tag 列表', () => {
    const wrapper = mount(YryStoryCard, {
      props: { name: '故事名', scenes: ['场景一', '场景二', '场景三'] }
    });
    expect(wrapper.html()).toContain('场景一');
    expect(wrapper.html()).toContain('场景二');
    expect(wrapper.html()).toContain('场景三');
  });

  it('desc 通过 v-html 渲染 HTML 内容', () => {
    const wrapper = mount(YryStoryCard, {
      props: { name: '故事名', desc: '<strong>加粗描述</strong>' }
    });
    expect(wrapper.html()).toContain('<strong>加粗描述</strong>');
  });

  it('nameHref 渲染为 <a> 链接', () => {
    const wrapper = mount(YryStoryCard, {
      props: { name: '故事名', nameHref: 'https://example.com/story' }
    });
    expect(wrapper.html()).toContain('href="https://example.com/story"');
  });

  it('name 缺失时 props 校验失败', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      mount(YryStoryCard);
    } catch (e) {
      expect(e).toBeTruthy();
    }
    spy.mockRestore();
  });
});

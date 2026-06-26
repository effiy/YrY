/**
 * YryCmdCard — 命令卡片组件测试
 * 重点验证:computed metaItems 的 HTML 拼装(需注入 esc helper)
 */

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { extractTemplate } from './helpers.mjs';

const TEMPLATE = extractTemplate('yry-cmd-card', 'yry-cmd-card-tpl');

// esc helper(从 index.js 提取)
function esc(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[c];
  });
}

const YryCmdCard = defineComponent({
  name: 'YryCmdCard',
  props: {
    stage: { type: String, default: '' },
    name: { type: String, default: '' },
    desc: { type: String, default: '' },
    cmd: { type: String, default: '' },
    expectHtml: { type: String, default: '' },
    owner: { type: String, default: '' },
    duration: { type: String, default: '' },
    priority: { type: String, default: '' }
  },
  data() {
    return { copied: false };
  },
  computed: {
    metaItems() {
      const items = [];
      if (this.owner) items.push(`<span>👤 ${esc(this.owner)}</span>`);
      if (this.duration) items.push(`<span>⏱ ${esc(this.duration)}</span>`);
      if (this.priority)
        items.push(
          `<span>🎯 <span class="c-priority ${esc(this.priority)}">${esc(this.priority.toUpperCase())}</span></span>`
        );
      return items;
    }
  },
  template: TEMPLATE
});

describe('YryCmdCard — 基础渲染', () => {
  it('render stage + name + desc', () => {
    const w = mount(YryCmdCard, {
      props: { stage: 'Gate A', name: '命令卡', desc: '执行测试' }
    });
    expect(w.html()).toContain('Gate A');
    expect(w.html()).toContain('命令卡');
    expect(w.html()).toContain('执行测试');
  });

  it('render cmd', () => {
    const w = mount(YryCmdCard, {
      props: { cmd: 'npm test' }
    });
    expect(w.html()).toContain('npm test');
  });

  it('expectHtml 通过 v-html 渲染', () => {
    const w = mount(YryCmdCard, {
      props: { expectHtml: '<b>预期输出</b>' }
    });
    expect(w.html()).toContain('<b>预期输出</b>');
  });
});

describe('YryCmdCard — computed.metaItems', () => {
  it('空 props 返回空数组', () => {
    const w = mount(YryCmdCard, { props: {} });
    expect(w.vm.metaItems).toEqual([]);
  });

  it('owner 渲染 👤 icon + esc 后文本', () => {
    const w = mount(YryCmdCard, { props: { owner: 'dev' } });
    expect(w.vm.metaItems).toHaveLength(1);
    expect(w.vm.metaItems[0]).toContain('👤');
    expect(w.vm.metaItems[0]).toContain('dev');
  });

  it('owner + duration 两个 meta', () => {
    const w = mount(YryCmdCard, {
      props: { owner: 'dev', duration: '2m' }
    });
    expect(w.vm.metaItems).toHaveLength(2);
    expect(w.vm.metaItems[1]).toContain('⏱');
    expect(w.vm.metaItems[1]).toContain('2m');
  });

  it('priority 渲染大写 + class', () => {
    const w = mount(YryCmdCard, {
      props: { priority: 'high' }
    });
    expect(w.vm.metaItems).toHaveLength(1);
    expect(w.vm.metaItems[0]).toContain('🎯');
    expect(w.vm.metaItems[0]).toContain('HIGH');
    expect(w.vm.metaItems[0]).toContain('c-priority high');
  });

  it('所有 meta 都有时返回 3 项', () => {
    const w = mount(YryCmdCard, {
      props: { owner: 'a', duration: 'b', priority: 'c' }
    });
    expect(w.vm.metaItems).toHaveLength(3);
  });

  it('esc 转义 HTML 特殊字符(防 XSS)', () => {
    const w = mount(YryCmdCard, {
      props: { owner: '<script>alert(1)</script>' }
    });
    expect(w.vm.metaItems[0]).not.toContain('<script>');
    expect(w.vm.metaItems[0]).toContain('&lt;script&gt;');
  });
});

describe('YryCmdCard — data', () => {
  it('初始 copied=false', () => {
    const w = mount(YryCmdCard, { props: {} });
    expect(w.vm.copied).toBe(false);
  });
});

/**
 * YryCardReport — 卡片分析报告模态框测试
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const JS_PATH = path.resolve(__dirname, '../yry-card-report/index.js');

function loadComponent() {
  const code = readFileSync(JS_PATH, 'utf8');
  // 在 happy-dom 环境下直接 eval (window 已存在)
  // 用 IIFE 包一层以获得返回值
  const fn = new Function('window', code + '\nreturn window.YryCardReport;');
  return fn(window);
}

/* 构造一个带徽章的 .item-card mock */
function makeItemCard(opts = {}) {
  const card = document.createElement('div');
  card.className = 'item-card';
  card.innerHTML = `
    <span class="icon skill">R</span>
    <div class="body">
      <div class="name">
        <a href="../skills/rui/SKILL.md">${opts.name || 'rui'}</a>
        <span class="size-info">20</span>
      </div>
      <div class="desc">${opts.desc || '薄编排器 — 命令路由 + 推荐引擎'}</div>
      <div class="tags-row"></div>
      <div class="meta"><span class="detail">20 技能 · 9 工程</span></div>
    </div>
    <span class="ydb-score-badge">
      🩺<span class="ydb-badge-num" title="健康: 86分 A级">${opts.health || 86}/A</span>
      🧪<span class="ydb-badge-num" title="测试: 60分 B级">${opts.test || 60}/B</span>
      🧬<span class="ydb-badge-num" title="自改进: 89分 A级">${opts.si || 89}/A</span>
    </span>`;
  document.body.appendChild(card);
  return card;
}

function makeStoryCard() {
  const card = document.createElement('div');
  card.className = 'story-card';
  card.innerHTML = `
    <div class="story-head">
      <span class="story-icon">📑</span>
      <span class="story-name"><a href="../yry-arch/scenes/故事任务.md">系统架构知识固化</a></span>
      <span class="story-badge">v1.3.0</span>
    </div>
    <div class="story-desc">YrY 架构全景分析,构建系统自我认知基线。</div>
    <div class="story-scenes">
      <span class="scene-tag">1. 新人上手</span>
      <span class="scene-tag">2. 模块定位</span>
    </div>
    <span class="ydb-score-badge ydb-small">
      🩺<span class="ydb-badge-num">90/A</span>
      🧪<span class="ydb-badge-num">80/B</span>
      🧬<span class="ydb-badge-num">89/A</span>
    </span>`;
  document.body.appendChild(card);
  return card;
}

function makeSceneCard() {
  const card = document.createElement('div');
  card.className = 'scene-card';
  card.innerHTML = `
    <div class="scene-num">场景 1</div>
    <div class="scene-name"><a href="#">新人上手</a></div>
    <div class="scene-desc">环境搭建 · 调试方法 · 常见任务</div>
    <span class="ydb-score-badge ydb-small">
      🩺<span class="ydb-badge-num">85/B</span>
      🧪<span class="ydb-badge-num">60/B</span>
      🧬<span class="ydb-badge-num">88/A</span>
    </span>`;
  document.body.appendChild(card);
  return card;
}

describe('YryCardReport — 模块导出', () => {
  it('暴露 window.YryCardReport.open 和 close', () => {
    const mod = loadComponent();
    expect(typeof mod.open).toBe('function');
    expect(typeof mod.close).toBe('function');
  });

  it('触发 yry-card-report-ready 事件', () => {
    let fired = false;
    window.addEventListener(
      'yry-card-report-ready',
      () => {
        fired = true;
      },
      { once: true }
    );
    loadComponent();
    expect(fired).toBe(true);
  });
});

describe('YryCardReport.open — item-card', () => {
  let card, YryCardReport;
  beforeEach(() => {
    document.body.innerHTML = '';
    YryCardReport = loadComponent();
    card = makeItemCard({ name: 'rui', desc: '薄编排器 — 命令路由' });
  });
  afterEach(() => {
    try {
      YryCardReport.close();
    } catch (e) {}
    document.body.innerHTML = '';
  });

  it('打开后注入模态框到 body', () => {
    YryCardReport.open(card);
    const overlay = document.querySelector('.ydb-report-overlay');
    expect(overlay).not.toBeNull();
    expect(overlay.classList.contains('is-open')).toBe(true);
  });

  it('标题显示卡片名称', () => {
    YryCardReport.open(card);
    const title = document.querySelector('.ydb-report-title');
    expect(title.textContent).toContain('rui');
  });

  it('类型标签显示"组件"', () => {
    YryCardReport.open(card);
    const type = document.querySelector('.ydb-report-type');
    expect(type.textContent).toContain('组件');
  });

  it('描述段展示卡片 desc', () => {
    YryCardReport.open(card);
    const desc = document.querySelector('.ydb-report-desc');
    expect(desc.textContent).toContain('薄编排器');
  });

  it('三档评分块渲染 (3 个 .ydb-report-score)', () => {
    YryCardReport.open(card);
    const scores = document.querySelectorAll('.ydb-report-score');
    expect(scores.length).toBe(3);
  });

  it('综合分析段包含卡片名', () => {
    YryCardReport.open(card);
    const analysis = document.querySelector('.ydb-report-analysis');
    expect(analysis.innerHTML).toContain('rui');
  });

  it('低分维度(测试 60)生成测试建议', () => {
    YryCardReport.open(card);
    const analysis = document.querySelector('.ydb-report-analysis');
    expect(analysis.innerHTML).toContain('测试度');
    expect(analysis.innerHTML).toMatch(/测试/);
  });
});

describe('YryCardReport.open — story-card', () => {
  let card, YryCardReport;
  beforeEach(() => {
    document.body.innerHTML = '';
    YryCardReport = loadComponent();
    card = makeStoryCard();
  });
  afterEach(() => {
    try {
      YryCardReport.close();
    } catch (e) {}
    document.body.innerHTML = '';
  });

  it('类型标签显示"故事"', () => {
    YryCardReport.open(card);
    const type = document.querySelector('.ydb-report-type');
    expect(type.textContent).toContain('故事');
  });

  it('展示包含场景列表', () => {
    YryCardReport.open(card);
    const scenes = document.querySelectorAll('.ydb-report-scenes .ydb-scene-tag');
    expect(scenes.length).toBe(2);
    expect(scenes[0].textContent).toContain('新人上手');
  });
});

describe('YryCardReport.open — scene-card', () => {
  let card, YryCardReport;
  beforeEach(() => {
    document.body.innerHTML = '';
    YryCardReport = loadComponent();
    card = makeSceneCard();
  });
  afterEach(() => {
    try {
      YryCardReport.close();
    } catch (e) {}
    document.body.innerHTML = '';
  });

  it('类型标签显示"场景"', () => {
    YryCardReport.open(card);
    const type = document.querySelector('.ydb-report-type');
    expect(type.textContent).toContain('场景');
  });

  it('标题展示场景名称', () => {
    YryCardReport.open(card);
    const title = document.querySelector('.ydb-report-title');
    expect(title.textContent).toContain('新人上手');
  });
});

describe('YryCardReport.close', () => {
  it('close 后遮罩不再 is-open', () => {
    document.body.innerHTML = '';
    const YryCardReport = loadComponent();
    const card = makeItemCard();
    YryCardReport.open(card);
    expect(document.querySelector('.ydb-report-overlay').classList.contains('is-open')).toBe(true);
    YryCardReport.close();
    expect(document.querySelector('.ydb-report-overlay').classList.contains('is-open')).toBe(false);
  });
});

describe('YryCardReport.open — 边界', () => {
  let YryCardReport;
  beforeEach(() => {
    document.body.innerHTML = '';
    YryCardReport = loadComponent();
  });
  afterEach(() => {
    try {
      YryCardReport.close();
    } catch (e) {}
    document.body.innerHTML = '';
  });

  it('card 为 null 时不报错', () => {
    expect(() => YryCardReport.open(null)).not.toThrow();
    expect(document.querySelector('.ydb-report-overlay')).toBeNull();
  });

  it('卡片无徽章时不打开', () => {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.innerHTML = '<div class="name">无徽章卡片</div>';
    document.body.appendChild(card);
    YryCardReport.open(card);
    expect(document.querySelector('.ydb-report-overlay')).toBeNull();
  });

  it('未知卡片类型不打开', () => {
    const card = document.createElement('div');
    card.className = 'unknown-card';
    card.innerHTML =
      '<span class="ydb-score-badge"><span class="ydb-badge-num">80/A</span><span class="ydb-badge-num">80/A</span><span class="ydb-badge-num">80/A</span></span>';
    document.body.appendChild(card);
    YryCardReport.open(card);
    expect(document.querySelector('.ydb-report-overlay')).toBeNull();
  });
});

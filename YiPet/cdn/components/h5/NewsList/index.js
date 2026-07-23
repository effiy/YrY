/**
 * YrY · H5 NewsList — renders news articles and news-derived sessions
 *
 * All HTML rendering is driven by index.html.
 * Template IDs: see NewsList/index.html header for full inventory.
 */

import { loadTemplate } from "../../../../utils/h5/template.js";
import { escapeHtml, dateUtil } from "../../../../utils/h5/index.js";
import { config } from "../../../../utils/h5/config.js";
import { BaseList } from "../BaseList/index.js";

/* ── Template loading (sync, at module init) ─────────────────────────────── */
const tpl = loadTemplate("NewsList", new URL("./index.html", import.meta.url).href);

export class NewsList extends BaseList {
  /** @type {typeof tpl} */
  static tpl = tpl;

  constructor({ container, emptyState }) {
    super({
      container, emptyState,
      itemHeight: 96,
      minItemsForVirtual: Number(config.ui.newsVlistMinItems) || 60,
    });
  }

  /** @override */
  _handleLoading() {
    this.virtualList.unmount();
    if (this.emptyState) this.emptyState.hidden = true;
    this.container.innerHTML = Array.from({ length: 7 }, () => tpl.render('tpl-news-skeleton')).join("");
  }

  /** @override */
  _updateEmptyState(isEmpty, error) {
    if (!this.emptyState) return;
    this.emptyState.hidden = !isEmpty;
    if (isEmpty) {
      const title = this.emptyState.querySelector(".empty__title");
      const desc = this.emptyState.querySelector(".empty__desc");
      const retry = this.emptyState.querySelector('[data-action="retryNews"]');
      if (title) title.textContent = error ? "加载失败" : "暂无匹配新闻";
      if (desc) desc.textContent = error ? error : "试试清空搜索或调整筛选条件";
      if (retry) retry.hidden = !error;
    }
  }

  /** @override */
  _renderItem(item) {
    return item.fromNews ? this._renderSessionItem(item) : this._renderNewsItem(item);
  }

  /* ── Session Item ────────────────────────────────────────────────────── */

  _renderSessionItem(item) {
    const tags = Array.isArray(item.tags) ? item.tags : (item.tags ? [item.tags] : []);
    const normTags = tags.map(t => String(t || '').trim()).filter(Boolean);
    const tagBadges = normTags.slice(0, 4)
      .map((t, i) => `<span class="badge is-sessionTag-${i % 4}">${escapeHtml(t)}</span>`)
      .join("");

    const ts = item.lastAccessTime || item.lastActiveAt || item.updatedAt;
    let d = "—";
    if (ts) { const dt = new Date(ts); if (!isNaN(dt.getTime())) d = dateUtil.formatYMD(dt); }

    const title = `<span class="newsItem__sessionIcon" title="来自新闻">📰</span>${
      item.isFavorite ? '<span class="newsItem__favIcon">❤️</span>' : ''
    }${escapeHtml((item.pageTitle?.trim() || item.title || '未命名会话'))}`;

    const favBtn = this._favBtn('tpl-session-fav-btn', item);

    return tpl.render('tpl-news-session-item', {
      key: escapeHtml(item.key || ''),
      newsKey: escapeHtml(item.newsKey || ''),
      mutedCls: item.muted ? ' is-muted' : '',
      title,
      desc: escapeHtml(item.pageDescription?.trim() || item.preview || '—'),
      tagBadges,
      date: escapeHtml(d),
      favBtn
    });
  }

  /* ── News Item ───────────────────────────────────────────────────────── */

  _renderNewsItem(item) {
    const filteredTags = (item.tags || []).filter(t => t !== '网文');
    const tagItems = filteredTags.slice(0, 4)
      .map(t => tpl.render('tpl-news-tag', { text: escapeHtml(t) }))
      .join('');
    const tagsHtml = tagItems ? tpl.render('tpl-news-tags', { items: tagItems }) : '';

    let d = '—';
    if (item.createdTime || item.published) {
      const dt = new Date(item.createdTime || item.published);
      if (!isNaN(dt.getTime())) d = dateUtil.formatYMD(dt);
    }

    let host = '';
    if (item.link) { try { host = new URL(String(item.link)).hostname.replace(/^www\./, ''); } catch {} }
    const sourceText = String(item.sourceName || item.source_name || '').trim() || host || '—';
    const sourceHtml = sourceText !== '—' ? tpl.render('tpl-news-source', { text: escapeHtml(sourceText) }) : '';
    const hostHtml = host && sourceText !== host
      ? tpl.render('tpl-news-host', { text: escapeHtml(host) })
      : '';

    const dot = item.isRead ? '' : tpl.render('tpl-news-dot', {});
    const title = (item.isFavorite ? '❤️ ' : '') + escapeHtml(item.title);
    const favBtn = this._favBtn('tpl-news-fav-btn', item);

    const content = tpl.render('tpl-news-content', {
      dot, title, source: sourceHtml, host: hostHtml, date: escapeHtml(d), tags: tagsHtml
    });

    const tplId = item.link ? 'tpl-news-item' : 'tpl-news-item-nolink';
    return tpl.render(tplId, {
      key: escapeHtml(item.key || ''),
      readCls: item.isRead ? ' is-read' : '',
      link: item.link ? escapeHtml(item.link) : '',
      content,
      favBtn
    });
  }

  /* ── Helpers ─────────────────────────────────────────────────────────── */

  _favBtn(tplId, item) {
    return tpl.render(tplId, {
      key: escapeHtml(item.key || ''),
      favCls: item.isFavorite ? ' is-favorited' : '',
      icon: item.isFavorite ? '❤️ 已收藏' : '🤍 收藏',
      label: item.isFavorite ? '取消收藏' : '收藏'
    });
  }
}

/**
 * YrY · H5 SessionList — renders session items with swipe actions
 *
 * All HTML rendering is driven by index.html.
 * Template ID: tpl-session-item
 */

import { loadTemplate } from "../../../../utils/h5/template.js";
import { escapeHtml, dateUtil } from "../../../../utils/h5/index.js";
import { config } from "../../../../utils/h5/config.js";
import { BaseList } from "../BaseList/index.js";

/* ── Template loading (sync, at module init) ─────────────────────────────── */
const tpl = loadTemplate("SessionList", new URL("./index.html", import.meta.url).href);

export class SessionList extends BaseList {
  /** @type {typeof tpl} */
  static tpl = tpl;

  constructor({ container, emptyState }) {
    super({
      container, emptyState,
      itemHeight: 84,
      minItemsForVirtual: Number(config.ui.vlistMinItems) || 60,
    });
  }

  /** @override */
  _updateEmptyState(isEmpty, error) {
    if (!this.emptyState) return;
    this.emptyState.hidden = !isEmpty;
    if (isEmpty) {
      const title = this.emptyState.querySelector(".empty__title");
      const desc = this.emptyState.querySelector(".empty__desc");
      if (title) title.textContent = error ? "加载失败" : "暂无匹配会话";
      if (desc) desc.textContent = error ? error : "试试清空搜索或调整筛选条件（也可清空日期过滤）";
    }
  }

  /** @override */
  _renderItem(s) {
    const msgBadge = s.messageCount > 0
      ? `<span class="badge">消息 ${escapeHtml(String(s.messageCount))}</span>`
      : '<span class="badge">暂无消息</span>';

    const otherBadges = s.muted ? '<span class="badge">免打扰</span>' : '';
    const mutedCls = s.muted ? " is-muted" : "";

    const title = (s.isFavorite ? '<span class="newsItem__favIcon">❤️</span>' : '')
      + escapeHtml(s.pageTitle?.trim() || s.title || '未命名会话');

    const desc = escapeHtml(s.pageDescription?.trim() || s.preview || '—');

    const tags = Array.isArray(s.tags) ? s.tags : (s.tags ? [s.tags] : []);
    const normTags = tags.map(t => String(t || '').trim()).filter(t => t && t !== '网文');
    const tagBadges = normTags.slice(0, 4)
      .map((t, i) => `<span class="badge is-sessionTag-${i % 4}">${escapeHtml(t)}</span>`)
      .join('');

    const ts = s.lastAccessTime || s.lastActiveAt;
    let d = '—';
    if (ts) { const dt = new Date(ts); if (!isNaN(dt.getTime())) d = dateUtil.formatYMD(dt); }

    return tpl.render('tpl-session-item', {
      key: s.key || '',
      mutedCls,
      title,
      messageBadge: msgBadge,
      desc,
      tagBadges,
      date: escapeHtml(d),
      otherBadges,
      favCls: s.isFavorite ? ' is-favorited' : '',
      favoriteIcon: s.isFavorite ? '❤️ 已收藏' : '🤍 收藏',
      favoriteLabel: s.isFavorite ? '取消收藏' : '收藏'
    });
  }
}

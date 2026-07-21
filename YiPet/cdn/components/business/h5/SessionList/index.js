/**
 * 会话列表组件
 * 负责渲染会话项，支持虚拟滚动
 */

import { escapeHtml, dateUtil } from "../../../../../../YiH5/utils/index.js";
import { config } from "../../../../../../YiH5/config.js?v=2";
import { BaseList } from "../BaseList/index.js";

export class SessionList extends BaseList {
  /**
   * @param {Object} options
   * @param {HTMLElement} options.container
   * @param {HTMLElement} options.emptyState
   */
  constructor({ container, emptyState }) {
    super({
      container,
      emptyState,
      itemHeight: 84, // Initial estimate, consistent with contain-intrinsic-size
      minItemsForVirtual: Number(config.ui.vlistMinItems) || 60,
    });
  }

  /**
   * @override
   * @protected
   */
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

  /**
   * @override
   * @protected
   */
  _renderItem(s) {
    // Message badge (first row)
    const messageBadge = s.messageCount > 0
      ? `<span class="badge">消息 ${escapeHtml(String(s.messageCount))}</span>`
      : `<span class="badge">暂无消息</span>`;
    
    // Other badges (mute, etc., second row)
    const otherBadges = [
      s.muted ? `<span class="badge">免打扰</span>` : "",
    ].join("");

    const mutedCls = s.muted ? " is-muted" : "";
    // Prioritize pageTitle, then title
    const displayTitle = (s.pageTitle && s.pageTitle.trim()) || s.title || "未命名会话";
    // Add heart icon for favorite sessions
    const favoriteIcon = (s.isFavorite) ? '<span class="newsItem__favIcon">❤️</span>' : '';
    const displayTitleWithFavorite = favoriteIcon + escapeHtml(displayTitle);
    // Prioritize pageDescription, then preview
    const displayDesc = (s.pageDescription && s.pageDescription.trim()) || s.preview || "—";
    
    // Session tags
    const rawTags = Array.isArray(s.tags) ? s.tags : (s.tags ? [s.tags] : []);
    const normTags = rawTags.map((t) => String(t || "").trim()).filter(t => t && t !== "网文");
    const displayTags = normTags;
    
    const tagBadges = displayTags
      .slice(0, 4)
      .map((t, idx) => {
        const colorCls = `is-sessionTag-${idx % 4}`;
        return `<span class="badge ${colorCls}">${escapeHtml(t)}</span>`;
      })
      .join("");
    
    // Format date: yyyy-MM-dd
    const ts = s.lastAccessTime || s.lastActiveAt;
    let displayDate = "—";
    if (ts) {
      const d = new Date(ts);
      if (!isNaN(d.getTime())) {
        displayDate = dateUtil.formatYMD(d);
      }
    }

    return `
      <div class="swipe-item-wrapper">
        <article class="item${mutedCls}" data-key="${s.key || ''}">
          <div class="item__mid">
            <div class="item__row1">
              <div class="item__title"><span>${displayTitleWithFavorite}</span></div>
              <div class="item__meta">
                ${messageBadge}
              </div>
            </div>
            <div class="item__row2">
              <div class="item__preview">${escapeHtml(displayDesc)}</div>
            </div>
            <div class="item__row2" style="margin-top:6px">
              <div class="item__tags">${tagBadges}</div>
              <div class="item__meta">
                <span class="time">${escapeHtml(displayDate)}</span>
                ${otherBadges}
              </div>
            </div>
          </div>
          <div class="item__right">
          </div>
        </article>
        <div class="swipe-item__actions">
          <button class="swipe-item__favorite${s.isFavorite ? ' is-favorited' : ''}" data-action="toggleFavorite" data-key="${s.key || ''}" aria-label="${s.isFavorite ? '取消收藏' : '收藏'}">
            ${s.isFavorite ? '❤️ 已收藏' : '🤍 收藏'}
          </button>
          <button class="swipe-item__delete" data-action="swipeDelete" data-key="${s.key || ''}" aria-label="删除会话">
            删除
          </button>
        </div>
      </div>
    `;
  }
}

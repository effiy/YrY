/**
 * 新闻列表组件
 * 负责渲染新闻与来源于新闻的会话项
 */

import { escapeHtml, dateUtil } from "../../../../../../YiH5/utils/index.js";
import { config } from "../../../../../../YiH5/config.js?v=2";
import { BaseList } from "../BaseList/index.js";

export class NewsList extends BaseList {
  /**
   * @param {Object} options
   * @param {HTMLElement} options.container
   * @param {HTMLElement} options.emptyState
   */
  constructor({ container, emptyState }) {
    super({
      container,
      emptyState,
      itemHeight: 96,
      minItemsForVirtual: Number(config.ui.newsVlistMinItems) || 60,
    });
  }

  /**
   * @override
   * @protected
   */
  _handleLoading() {
    this.virtualList.unmount();
    if (this.emptyState) this.emptyState.hidden = true;

    const count = 7;
    const blocks = Array.from({ length: count }).map(() => {
      return `
        <article class="newsItem newsItem--skeleton" aria-hidden="true">
          <div class="newsItem__link">
            <div class="newsItem__main">
              <div class="newsItem__header">
                 <span class="skeletonDot"></span>
                 <span class="skeletonBar is-w-70"></span>
              </div>
              <div class="newsItem__sub newsItem__sub--skeleton">
                <span class="skeletonBar is-w-30"></span>
                <span class="skeletonBar is-w-22 skeletonBar--end"></span>
              </div>
              <div class="newsItem__tags newsItem__tags--skeleton">
                <span class="skeletonBar is-w-18"></span>
                <span class="skeletonBar is-w-18"></span>
                <span class="skeletonBar is-w-18"></span>
              </div>
            </div>
          </div>
        </article>
      `;
    });
    this.container.innerHTML = blocks.join("");
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
      const retryBtn = this.emptyState.querySelector('[data-action="retryNews"]');
      if (title) title.textContent = error ? "加载失败" : "暂无匹配新闻";
      if (desc) desc.textContent = error ? error : "试试清空搜索或调整筛选条件";
      if (retryBtn) retryBtn.hidden = !error;
    }
  }

  /**
   * @override
   * @protected
   */
  _renderItem(item) {
    // Session item (converted from news)
    if (item.fromNews) {
      return this._renderSessionItem(item);
    }
    // Regular news item
    return this._renderNewsItem(item);
  }

  _renderSessionItem(item) {
    const mutedCls = item.muted ? " is-muted" : "";
    const displayTitle = (item.pageTitle && item.pageTitle.trim()) || item.title || "未命名会话";
    const displayDesc = (item.pageDescription && item.pageDescription.trim()) || item.preview || "—";
    const isFavorite = item.isFavorite === true;
    
    const rawTags = Array.isArray(item.tags) ? item.tags : (item.tags ? [item.tags] : []);
    const normTags = rawTags.map((t) => String(t || "").trim()).filter(Boolean);
    const displayTags = normTags;
    
    const tagBadges = displayTags
      .slice(0, 4)
      .map((t, idx) => {
        const colorCls = `is-sessionTag-${idx % 4}`;
        return `<span class="badge ${colorCls}">${escapeHtml(t)}</span>`;
      })
      .join("");

    // Date formatting
    const ts = item.lastAccessTime || item.lastActiveAt || item.updatedAt;
    let displayDate = "—";
    if (ts) {
      const d = new Date(ts);
      if (!isNaN(d.getTime())) {
        displayDate = dateUtil.formatYMD(d);
      }
    }

    // Session icon
    const sessionIcon = '<span class="newsItem__sessionIcon" title="来自新闻">📰</span>';
    const favoriteIcon = isFavorite ? '<span class="newsItem__favIcon">❤️</span>' : '';
    const displayTitleWithIcon = sessionIcon + favoriteIcon + escapeHtml(displayTitle);

    return `
      <div class="swipe-item-wrapper">
        <article class="newsItem newsItem--session${mutedCls}" data-key="${escapeHtml(item.key || "")}" data-news-key="${escapeHtml(item.newsKey || "")}">
          <div class="newsItem__link">
            <div class="item__mid">
              <div class="item__row1">
                <div class="item__title"><span>${displayTitleWithIcon}</span></div>
                <div class="item__meta">
                </div>
              </div>
              <div class="item__row2">
                <div class="item__preview">${escapeHtml(displayDesc)}</div>
              </div>
              <div class="item__row2" style="margin-top:6px">
                <div class="item__tags">${tagBadges}</div>
                <div class="item__meta">
                  <span class="time">${escapeHtml(displayDate)}</span>
                </div>
              </div>
            </div>
          </div>
        </article>
        <div class="swipe-item__actions">
          <button class="swipe-item__favorite${isFavorite ? ' is-favorited' : ''}" data-action="toggleFavorite" data-key="${escapeHtml(item.key || "")}" aria-label="${isFavorite ? '取消收藏' : '收藏'}">
            ${isFavorite ? '❤️ 已收藏' : '🤍 收藏'}
          </button>
        </div>
      </div>
    `;
  }

  _renderNewsItem(item) {
    const filteredTags = (item.tags || []).filter((t) => t !== "网文");
    const tagBadges = filteredTags
      .slice(0, 4)
      .map((t) => `<span class="newsItem__tag">${escapeHtml(t)}</span>`)
      .join("");

    // Date formatting
    let displayDate = "—";
    if (item.createdTime || item.published) {
      const ts = item.createdTime || item.published;
      const d = new Date(ts);
      if (!isNaN(d.getTime())) {
        displayDate = dateUtil.formatYMD(d);
      }
    }

    const isRead = item.isRead === true;
    const isFavorite = item.isFavorite === true;
    let host = "";
    if (item.link) {
      try {
        host = new URL(String(item.link)).hostname.replace(/^www\./, "");
      } catch {
        host = "";
      }
    }
    const sourceText = String(item.sourceName || item.source_name || "").trim() || host || "—";
    const sourceHtml = `
      <span class="newsItem__source">${escapeHtml(sourceText)}</span>
      ${host && sourceText !== host ? `<span class="newsItem__host">${escapeHtml(host)}</span>` : ""}
    `;

    // 构建链接
    // 如果没有 link，则不渲染 a 标签，而是普通 div
    const titlePrefix = isFavorite ? "❤️ " : "";
    const content = `
      <div class="newsItem__main">
        <div class="newsItem__header">
          ${isRead ? "" : '<span class="newsItem__dot" aria-hidden="true"></span>'}
          <h3 class="newsItem__title">${titlePrefix}${escapeHtml(item.title)}</h3>
        </div>

        <div class="newsItem__sub">
          <div class="newsItem__meta">
            ${sourceHtml}
          </div>
          <span class="newsItem__time">${escapeHtml(displayDate)}</span>
        </div>

        ${tagBadges ? `<div class="newsItem__tags">${tagBadges}</div>` : ""}
      </div>
    `;

    if (item.link) {
      return `
        <div class="swipe-item-wrapper">
          <article class="newsItem${isRead ? " is-read" : ""}" data-key="${escapeHtml(item.key || "")}">
            <a class="newsItem__link" href="${escapeHtml(item.link)}" target="_blank" rel="noopener noreferrer">
              ${content}
            </a>
          </article>
          <div class="swipe-item__actions">
            <button class="swipe-item__favorite${isFavorite ? ' is-favorited' : ''}" data-action="toggleNewsFavorite" data-key="${escapeHtml(item.key || "")}" aria-label="${isFavorite ? '取消收藏' : '收藏'}">
              ${isFavorite ? '❤️ 已收藏' : '🤍 收藏'}
            </button>
          </div>
        </div>
      `;
    }

    return `
      <div class="swipe-item-wrapper">
        <article class="newsItem${isRead ? " is-read" : ""}" data-key="${escapeHtml(item.key || "")}">
          <div class="newsItem__link">
            ${content}
          </div>
        </article>
        <div class="swipe-item__actions">
          <button class="swipe-item__favorite${isFavorite ? ' is-favorited' : ''}" data-action="toggleNewsFavorite" data-key="${escapeHtml(item.key || "")}" aria-label="${isFavorite ? '取消收藏' : '收藏'}">
            ${isFavorite ? '❤️ 已收藏' : '🤍 收藏'}
          </button>
        </div>
      </div>
    `;
  }
}

// 导入工具函数和模块
// 应用主入口：路由与视图渲染、事件与状态管理
import { escapeHtml, logger, dateUtil, cssEscape, fmt, isValidYMD } from "../../../YiPet/cdn/utils/h5/index.js";
import { renderMarkdown, renderMermaidIn } from "../../../YiPet/cdn/utils/h5/markdown.js";
import { normalizeRole as normalizeMsgRole, normalizeText as normalizeMsgText } from "../../../YiPet/cdn/utils/h5/msg.js";
import { scrollToItem, isNearBottom, preserveScrollPosition } from "../../../YiPet/cdn/utils/h5/scroll.js";
import { setupVisualViewportBottomInset } from "../../../YiPet/cdn/utils/h5/viewport.js";
import { SwipeScrollController } from "../../YiPet/cdn/components/business/h5/SwipeScrollController.js";
import { config } from "../../config.js?v=2";
import { SessionList, NewsList, Chat, Preview, Search } from "../../YiPet/cdn/components/business/h5/index.js";
import {
  fetchSessions as fetchSessionsApi,
  fetchNews as fetchNewsApi,
  fetchFaqs as fetchFaqsApi,
  callPrompt as callPromptApi,
  streamPrompt as streamPromptApi,
  saveSession as saveSessionApi,
  deleteSession as deleteSessionApi,
  fetchSessionDetail as fetchSessionDetailApi,
  fetchSessionPageContent as fetchSessionPageContentApi,
  handleApiError,
} from "../../services/index.js";
import {
  state,
  getState,
  setState,
  STORAGE_KEYS,
  DEFAULT_PINNED_TAGS,
  getAuthHeaders,
  loadAuthFromStorage,
  saveAuthToken,
  loadChatFoldState,
  saveChatFoldState,
  loadReadNews,
  saveReadNews,
  markNewsAsRead,
  loadFavoriteNews,
  saveFavoriteNews,
  loadTagOrder,
  getStoredAppVersion,
  setStoredAppVersion,
} from "./state.js";
import { parseRoute, navigateToList, navigateToChat } from "./router.js";
import { createPageContext } from "./page-context.js";
import { createChat } from "./chat.js";

(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  let chat;

  // 获取页面图标URL
  const getPageIconUrl = () => {
    let iconUrl = '';
    const linkTags = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]');
    if (linkTags.length > 0) {
      iconUrl = linkTags[0].href;
      if (!iconUrl.startsWith('http')) {
        iconUrl = new URL(iconUrl, window.location.origin).href;
      }
    }
    if (!iconUrl) {
      iconUrl = '/favicon.ico';
      if (!iconUrl.startsWith('http')) {
        iconUrl = new URL(iconUrl, window.location.origin).href;
      }
    }
    return iconUrl;
  };

  // 创建欢迎消息HTML
  const createWelcomeMessageHtml = (session) => {
    const pageUrl = session.url || window.location.href;
    const pageDescription = (session.pageDescription && session.pageDescription.trim()) || '';

    let welcomeHtml = `
      <div class="welcomeMessage">
        <div class="welcomeSection">
          <div class="welcomeLabel">🔗 网址</div>
          <a href="${escapeHtml(pageUrl)}" target="_blank"
             class="welcomeLink"
             title="${escapeHtml(pageUrl)}">
             ${escapeHtml(pageUrl)}
          </a>
        </div>
    `;

    if (pageDescription && pageDescription.trim().length > 0) {
      welcomeHtml += `
        <div class="welcomeSection">
          <div class="welcomeLabel">📝 页面描述</div>
          <div class="welcomeDesc">${renderMarkdown(pageDescription)}</div>
        </div>
      `;
    }

    welcomeHtml += `</div>`;

    return welcomeHtml;
  };


  const BOTTOM_TAB_KEY = STORAGE_KEYS.BOTTOM_TAB;
  // 新闻 API 基础 URL（查询参数在构建请求时动态添加）
  const NEWS_API_BASE = "https://api.effiy.cn/mongodb/";

  const openAuth = () => {
    const curToken = String(state.auth.token || "").trim();
    const token = window.prompt("请输入 X-Token（用于访问 api.effiy.cn）", curToken);
    if (token == null) return;
    saveAuthToken(token);
    // 配置完立即尝试刷新
    if (state.bottomTab === "news") fetchNews({ force: true });
    if (state.view === "chat") fetchFaqs({ force: true });
  };

  const clearCacheAndRefresh = () => {
    if (!confirm("确定要清空缓存并刷新页面？Token 将被保留。")) return;
    const preserveKey = STORAGE_KEYS.API_TOKEN;
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key !== preserveKey) keysToRemove.push(key);
    }
    keysToRemove.forEach(k => {
      try { localStorage.removeItem(k); } catch { /* ignore */ }
    });
    location.reload();
  };

  const fetchVersionManifest = async () => {
    // 返回空版本信息
    const stored = getStoredAppVersion() || "";
    return { current: stored, generatedAt: "", releases: [] };
  };

  const fetchSessions = async ({ force = false } = {}) => {
    if (state.sessionsLoading) return state.sessions;
    const now = Date.now();
    const isFresh = state.sessionsLoadedAt && now - state.sessionsLoadedAt < 60 * 1000;
    if (!force && isFresh && state.sessions.length > 0) return state.sessions;
    state.sessionsLoading = true;
    try {
      const sessions = await fetchSessionsApi(state.auth.token);
      
      state.lastError = "";
      // 映射为页面使用的统一结构（兼容你提供的接口字段）
      const mappedSessions = sessions.map((s) => {
        const tags = Array.isArray(s.tags) ? s.tags : (s.tags ? [s.tags] : []);
        const key = String(
          s.key || s.id || s._id || s.url || `s_${Date.now()}_${Math.random()}`,
        );
        const id = key;
        const title = (s.title ?? s.pageTitle ?? "").trim() || "未命名会话";
        const preview = (s.pageDescription ?? s.preview ?? s.summary ?? "").trim();
        const updatedAt = Number(s.updatedAt ?? s.updated_at ?? Date.now());
        const createdAt = Number(s.createdAt ?? s.created_at ?? updatedAt);
        const lastAccessTime = Number(s.lastAccessTime ?? s.last_access_time ?? updatedAt);
        const lastActiveAt = Number(s.lastActiveAt ?? s.last_active_at ?? lastAccessTime ?? updatedAt);
        const messageCount =
          Number(s.message_count ?? s.messageCount ?? (Array.isArray(s.messages) ? s.messages.length : 0)) || 0;
        const messages = Array.isArray(s.messages) ? s.messages : [];

        return {
          id,
          key,
          title,
          preview,
          tags,
          url: s.url || "",
          pageTitle: s.pageTitle || "",
          pageDescription: s.pageDescription || "",
          // 如果后端返回了页面上下文字段，保留到会话对象上，供"页面上下文"使用
          pageContent: s.pageContent || s.content || "",
          messageCount,
          messages,
          createdAt,
          updatedAt,
          lastAccessTime,
          // 下面这些是本地 UI 状态（接口没有也没关系）
          muted: s.muted !== undefined ? !!s.muted : false,
          lastActiveAt,
          // 收藏状态：从后端返回的 isFavorite 字段
          isFavorite: s.isFavorite !== undefined ? !!s.isFavorite : false,
        };
      });
      
      const existingByKey = new Map();
      (state.sessions || []).forEach((s) => {
        if (!s) return;
        if (s.key != null) existingByKey.set(String(s.key), s);
      });

      // 去重：根据会话Key去重，保留最新的会话（updatedAt最大的）
      const sessionMap = new Map();
      mappedSessions.forEach((incoming) => {
        const existing = existingByKey.get(String(incoming.key));

        const merged = existing || incoming;
        if (existing) {
          existing.key = incoming.key;
          existing.title = incoming.title;
          existing.preview = incoming.preview;
          existing.tags = incoming.tags;
          existing.url = incoming.url;
          existing.pageTitle = incoming.pageTitle;
          existing.pageDescription = incoming.pageDescription;
          existing.pageContent = incoming.pageContent;
          existing.createdAt = incoming.createdAt;
          existing.updatedAt = incoming.updatedAt;
          existing.lastAccessTime = incoming.lastAccessTime;
          existing.lastActiveAt = incoming.lastActiveAt;
          existing.muted = incoming.muted;
          existing.isFavorite = incoming.isFavorite;

          const hasIncomingMessages =
            Array.isArray(incoming.messages) && incoming.messages.length > 0;
          const hasExistingMessages =
            Array.isArray(existing.messages) && existing.messages.length > 0;

          if (hasIncomingMessages) {
            existing.messages = incoming.messages;
            existing.messageCount = incoming.messages.length;
          } else if (hasExistingMessages) {
            existing.messageCount = existing.messages.length;
          } else {
            existing.messages = [];
            existing.messageCount = incoming.messageCount || 0;
          }
        }

        const current = sessionMap.get(merged.key);
        if (!current || merged.updatedAt > current.updatedAt) {
          sessionMap.set(merged.key, merged);
        }
      });
      
      // 默认展示所有会话，不进行预设筛选
      state.sessions = Array.from(sessionMap.values());
      state.sessionsLoadedAt = Date.now();
    } catch (error) {
      logger.error("fetchSessions failed", error);
      // 如果API请求失败，使用空数组，避免应用崩溃
      state.sessions = [];
      // 页面内提示（避免 alert 打断体验）
      const isFile = location.protocol === "file:";
      state.lastError = isFile
        ? "获取会话列表失败：当前以 file:// 打开页面，跨域请求可能被浏览器拦截。建议用本地静态服务器打开再试。"
        : "获取会话列表失败：请稍后重试。";
    } finally {
      state.sessionsLoading = false;
    }
    return state.sessions;
  };

  const dom = {
    app: $("#app"),
    topbarLeft: $(".topbar__left"),
    topbarRight: $(".topbar__right"),
    dateNav: $(".topbar__dateNav"),
    datePicker: $("#datePicker"),
    prevDay: $("#prevDay"),
    nextDay: $("#nextDay"),
    chatTopTitle: $("#chatTopTitle"),
    chatTitle: $("#chatTitle"),
    q: $("#q"),
    clearQ: $("#clearQ"),
    chips: $("#chips"),
    list: $("#list"),
    empty: $("#empty"),
    sessionTags: $("#sessionTags"),
    pageSessions: $("#pageSessions"),
    pageChat: $("#pageChat"),
    chatMessages: $("#chatMessages"),
    chatComposer: $("#chatComposer"),
    chatInput: $("#chatInput"),
    faqBtn: $("#faqBtn"),
    openUrlBtn: $("#openUrlBtn"),
    changelogBtn: $("#changelogBtn"),
    faqSheetMask: $("#faqSheetMask"),
    faqSheet: $("#faqSheet"),
    faqList: $("#faqList"),
    faqEmpty: $("#faqEmpty"),
    changelogSheetMask: $("#changelogSheetMask"),
    changelogSheet: $("#changelogSheet"),
    changelogMeta: $("#changelogMeta"),
    changelogList: $("#changelogList"),
    changelogEmpty: $("#changelogEmpty"),
    sortBtn: $("#sortBtn"),
    newsSortBtn: $("#newsSortBtn"),
    contextSheetMask: $("#contextSheetMask"),
    contextSheet: $("#contextSheet"),
    contextContent: $("#contextContent"),
    pageDescSheetMask: $("#pageDescSheetMask"),
    pageDescSheet: $("#pageDescSheet"),
    pageDescContent: $("#pageDescContent"),
    pageNews: $("#pageNews"),
    newsSearchCard: $("#newsSearchCard"),
    newsTags: $("#newsTags"),
    newsQ: $("#newsQ"),
    clearNewsQ: $("#clearNewsQ"),
    newsChips: $("#newsChips"),
    newsList: $("#newsList"),
    newsEmpty: $("#newsEmpty"),
    bottomNav: $("#bottomNav"),
  };

  // 统一的可见性同步：确保「会话视图只显示会话」「新闻视图只显示新闻」
  const syncBottomNavActive = () => {
    if (!dom.bottomNav) return;
    $$(".bottomNav__item", dom.bottomNav).forEach((b) => {
      const tab = b.dataset.tab || "sessions";
      const isActive = tab === state.bottomTab;
      b.classList.toggle("is-active", isActive);
      if (isActive) b.setAttribute("aria-current", "page");
      else b.removeAttribute("aria-current");
    });
  };

  const syncVisibility = () => {
    const isSessions = state.bottomTab === "sessions";
    const isNews = state.bottomTab === "news";
    const isChat = isSessions && state.view === "chat";
    const isNewsChat = isNews && state.view === "newsChat";

    // 页面显示：三者互斥
    if (dom.pageNews) dom.pageNews.hidden = isSessions || isNewsChat;
    if (dom.pageSessions) dom.pageSessions.hidden = !isSessions || isChat;
    if (dom.pageChat) dom.pageChat.hidden = (!isSessions || !isChat) && (!isNews || !isNewsChat);

    // 样式与返回按钮：在"会话-聊天页"或"新闻-聊天页"生效
    if (isChat || isNewsChat) {
      dom.app.classList.add("is-chat");
      mountChatBackBtn();
    } else {
      dom.app.classList.remove("is-chat");
      unmountChatBackBtn();
    }
    
    // 删除会话按钮：只在会话聊天页显示
    if (isChat) {
      mountChatDeleteBtn();
    } else {
      unmountChatDeleteBtn();
    }
  };

  // ---------- News ----------
  const extractNewsList = (result) => {
    // YiPet: 数据在 result.data.list，同时返回 totalPages
    if (result && result.data && Array.isArray(result.data.list)) {
      return {
        list: result.data.list,
        totalPages: result.data.totalPages || 1
      };
    }
    // 兼容：直接数组
    if (Array.isArray(result)) {
      return { list: result, totalPages: 1 };
    }
    // 兼容：result.data 是数组
    if (result && Array.isArray(result.data)) {
      return { list: result.data, totalPages: 1 };
    }
    // 兼容：其它字段里有 list/items
    if (result && Array.isArray(result.list)) {
      return { list: result.list, totalPages: 1 };
    }
    if (result && Array.isArray(result.items)) {
      return { list: result.items, totalPages: 1 };
    }
    // 兜底：找第一个数组字段
    if (result && typeof result === 'object') {
      for (const k in result) {
        if (Array.isArray(result[k]) && result[k].length > 0) {
          return { list: result[k], totalPages: 1 };
        }
      }
    }
    return { list: [], totalPages: 1 };
  };

  const normalizeNewsItem = (n) => {
    const title = String(n?.title ?? "").trim() || "未命名新闻";
    const link = String(n?.link ?? "").trim();
    const description = String(n?.description ?? "").trim();
    const sourceName = String(n?.source_name ?? n?.sourceName ?? "").trim();
    const createdTime = String(n?.createdTime ?? "").trim();
    const published = String(n?.published ?? "").trim();
    const tags = Array.isArray(n?.tags) ? n.tags.map((t) => String(t || "").trim()).filter(Boolean) : [];
    const key = String(n?.key ?? n?._id ?? n?.id ?? link ?? title);
    const sessionKey = n?.sessionKey || null;
    // 检查是否已读
    const readNews = loadReadNews();
    const isRead = readNews.has(key);
    // 检查是否收藏
    const favoriteNews = loadFavoriteNews();
    const isFavorite = favoriteNews.has(key);
    return { key, title, link, description, sourceName, createdTime, published, tags, sessionKey, isRead, isFavorite };
  };

  // 统一渲染新闻条目（便于虚拟列表复用）
  // 支持渲染新闻项或会话项（当 fromNews 为 true 时）




  const sessionList = new SessionList({
    container: dom.list,
    emptyState: dom.empty
  });

  const newsList = new NewsList({
    container: dom.newsList,
    emptyState: dom.newsEmpty
  });







  const getNewsIsoDateBySelectedDate = () => {
    // 确保日期格式为 YYYY-MM-DD（与 YiPet 保持一致）
    let ymd = state.selectedDate || dateUtil.todayYMD();
    // 如果日期格式是 YYYY/MM/DD，转换为 YYYY-MM-DD
    if (ymd.includes('/')) {
      ymd = ymd.replace(/\//g, '-');
    }
    return `${ymd},${ymd}`;
  };

  const fetchNews = async ({ force = false } = {}) => {
    const now = Date.now();
    const isoDate = getNewsIsoDateBySelectedDate();

    const isSameDate = state.news.isoDate === isoDate;
    const isFresh = state.news.loadedAt && now - state.news.loadedAt < 60 * 1000; // 1 分钟内不重复刷
    if (!force && isSameDate && isFresh && Array.isArray(state.news.items) && state.news.items.length > 0) {
      return state.news.items;
    }

    if (state.news.loading) {
      try {
        state.news.abortController?.abort(new Error("replaced"));
      } catch {
        // ignore
      }
    }

    const controller = new AbortController();
    state.news.abortController = controller;
    state.news.requestId = (Number(state.news.requestId) || 0) + 1;
    const requestId = state.news.requestId;

    state.news.loading = true;
    state.news.error = "";
    renderNews();

    try {
      const pageSize = Number(config.news.pageSize) || 500;
      const maxPages = Number(config.news.maxPages) || 10;
      const result = await fetchNewsApi(isoDate, state.auth.token, {
        pageSize,
        maxPages,
        timeoutMs: 12000,
        signal: controller.signal,
      });
      
      const newsList = result.data.list || [];

      // 如果仍然没有找到数据，输出警告
      if (newsList.length === 0) {
        logger.warn("extract news list failed");
      }

      const items = Array.isArray(newsList) ? newsList.map(normalizeNewsItem) : [];
      
      // 加载会话列表，检查哪些新闻已经转换为会话
      await fetchSessions({ force: false });
      
      // 为每个新闻检查是否已有对应的会话
      items.forEach(newsItem => {
        if (newsItem.link) {
          // 使用新闻的 link 通过URL查找对应的会话
          const existingSession = findSessionByUrl(newsItem.link);
          if (existingSession) {
            newsItem.sessionKey = String(existingSession.key);
          }
        }
      });
      
      if (requestId === state.news.requestId) {
        state.news.items = items;
        state.news.isoDate = isoDate;
        state.news.loadedAt = Date.now();
        state.news.error = "";
      }
      return items;
    } catch (e) {
      logger.warn("fetchNews failed", e);
      if (String(e?.name || "") === "AbortError") {
        const reason = controller && controller.signal ? controller.signal.reason : null;
        if (String(reason?.message || reason || "") === "replaced") {
          return state.news.items;
        }
        if (requestId === state.news.requestId) {
          state.news.error = "获取新闻失败：请求超时或已取消，请重试。";
        }
        return state.news.items;
      }

      if (requestId === state.news.requestId) {
        state.news.error = handleApiError(e);
        const hasItems = Array.isArray(state.news.items) && state.news.items.length > 0;
        if (!hasItems) state.news.items = [];
      }
      return state.news.items;
    } finally {
      if (requestId === state.news.requestId) {
        state.news.loading = false;
        state.news.abortController = null;
      }
      renderNews();
    }
  };

  // 获取新闻的所有标签（用于筛选）
  const getNewsTags = () => {
    const allTags = new Set();
    state.news.items.forEach((n) => {
      const tags = Array.isArray(n.tags) ? n.tags : [];
      const first = String(tags[0] || "").trim();
      if (first) allTags.add(first);
    });
    return Array.from(allTags).sort();
  };

  // 计算新闻标签数量（按 tags[0] 计数；过滤时仍按全数组匹配）
  const getNewsTagCount = (tag) => {
    return state.news.items.filter((n) => {
      const first = String((Array.isArray(n.tags) ? n.tags : [])[0] || "").trim();
      return first === tag;
    }).length;
  };

  // 计算新闻筛选标签（chips）
  const computeNewsChips = () => {
    const c = [];
    const f = state.news.filter;
    if (state.news.q.trim()) c.push({ key: "q", label: `搜索：${state.news.q.trim()}` });
    // 显示选中的标签
    f.selectedTags.forEach((tag) => {
      const count = getNewsTagCount(tag);
      c.push({ key: `tag_${tag}`, label: tag, tagValue: tag, count });
    });
    return c;
  };

  // 新闻搜索和筛选
  const filterAndSortNews = () => {
    const q = state.news.q.trim().toLowerCase();
    const f = state.news.filter;
    let arr = state.news.items.slice();

    // 分离已读和未读新闻
    const unreadNews = [];
    const readNewsWithSessions = [];
    const readNewsNoSessions = [];
    const addedSessionIds = new Set(); // 用于去重，避免同一会话重复显示

    arr.forEach((n) => {
      // 先检查新闻是否有对应的会话（无论是否已读）
      let session = null;
      let sessionKeyToCheck = null;
      if (n.sessionKey) {
        session = findSessionByKey(n.sessionKey);
        if (session) {
          sessionKeyToCheck = n.sessionKey;
        }
      }
      if (!session && n.link) {
        session = findSessionByUrl(n.link);
        if (session) {
          sessionKeyToCheck = String(session.key);
        }
      }

      if (n.sessionKey && !session) {
        delete n.sessionKey;
        n.isRead = false;
      }

      if (session && sessionKeyToCheck && !addedSessionIds.has(String(sessionKeyToCheck))) {
        // 标记会话来自新闻，用于显示图标
        readNewsWithSessions.push({ ...session, fromNews: true, newsKey: n.key });
        addedSessionIds.add(String(sessionKeyToCheck));
      } else {
        // 如果没有会话，根据已读状态决定是否显示新闻
        const isRead = n.isRead === true;
        if (!isRead) {
          // 未读且没有会话的新闻正常显示
          unreadNews.push(n);
        } else {
          readNewsNoSessions.push(n);
        }
      }
    });

    // 合并未读新闻和已读新闻对应的会话
    arr = [...unreadNews, ...readNewsWithSessions, ...readNewsNoSessions];

    if (q) {
      arr = arr.filter((item) => {
        // 如果是会话（fromNews），搜索会话的标题和描述
        if (item.fromNews) {
          const hay = `${item.title || ""} ${item.pageTitle || ""} ${item.preview || ""} ${item.pageDescription || ""} ${(item.tags || []).join(" ")}`.toLowerCase();
          return hay.includes(q);
        } else {
          // 如果是新闻，搜索新闻的标题、描述等
          const hay = `${item.title} ${item.description || ""} ${item.link || ""} ${(item.tags || []).join(" ")}`.toLowerCase();
          return hay.includes(q);
        }
      });
    }

    // 标签筛选：如果选中了标签，必须包含至少一个选中的标签
    if (f.selectedTags.length > 0) {
      arr = arr.filter((item) => {
        const itemTags = Array.isArray(item.tags) ? item.tags.map((t) => String(t).trim()) : [];
        return f.selectedTags.some((selectedTag) => itemTags.includes(selectedTag));
      });
    }

    // 排序：根据 sortBy 模式选择排序方式
    arr.sort((a, b) => {
      // 收藏始终在最前
      const aFav = a && a.isFavorite === true;
      const bFav = b && b.isFavorite === true;
      if (aFav !== bFav) return aFav ? -1 : 1;

      if (state.news.filter.sortBy === 'title') {
        // 标题排序：收藏置顶 → 标题 A→Z
        const titleA = ((a && a.title) || '').toLowerCase();
        const titleB = ((b && b.title) || '').toLowerCase();
        const cmp = titleA.localeCompare(titleB);
        if (cmp !== 0) return cmp;
        return String(a && a.key || '').localeCompare(String(b && b.key || ''));
      }

      // 时间排序（默认）：收藏 → 未读 → 已生成会话 → 已读，再按时间倒序
      const rank = (x) => {
        if (x && x.isFavorite === true) return 0;
        if (x && x.fromNews) return 2;
        if (x && x.isRead === true) return 3;
        return 1;
      };
      const ra = rank(a);
      const rb = rank(b);
      if (ra !== rb) return ra - rb;

      let timeA, timeB;
      if (a.fromNews) {
        // 会话使用 lastAccessTime 或 updatedAt
        timeA = new Date(a.lastAccessTime || a.updatedAt || a.createdAt || 0).getTime();
      } else {
        // 新闻使用 createdTime 或 published
        timeA = new Date(a.createdTime || a.published || 0).getTime();
      }
      if (b.fromNews) {
        timeB = new Date(b.lastAccessTime || b.updatedAt || b.createdAt || 0).getTime();
      } else {
        timeB = new Date(b.createdTime || b.published || 0).getTime();
      }
      return timeB - timeA;
    });
    return arr;
  };

  // 渲染新闻筛选标签（chips）
  const renderNewsChips = () => {
    if (!dom.newsChips) return;
    const chips = computeNewsChips();
    dom.newsChips.innerHTML = chips
      .map(
        (c) => `
          <span class="chip" data-chip="${c.key}">
            <span>${escapeHtml(c.label)}${c.count !== undefined ? ` <span class="chip__count">(${c.count})</span>` : ''}</span>
            <button class="chip__x" type="button" aria-label="移除" data-action="removeNewsChip" data-key="${c.key}" ${c.tagValue ? `data-tag-value="${escapeHtml(c.tagValue)}"` : ''}>×</button>
          </span>
        `,
      )
      .join("");
  };


  const renderNews = () => {
    if (!dom.newsList || !dom.newsEmpty) return;

    // 保存需要滚动到的新闻key（在重新渲染前）
    const scrollToNewsKey = state.scrollToNewsKey;

    let filteredItems = [];
    if (!state.news.loading) {
      filteredItems = filterAndSortNews();
    }

    renderInlineTags({
      container: dom.newsTags,
      tags: getNewsTags(),
      selectedSet: new Set(state.news.filter.selectedTags),
      getCount: getNewsTagCount,
      actionName: "inlineToggleNewsTag"
    });
    renderNewsChips();

    // 更新排序按钮状态
    if (dom.newsSortBtn) {
      const isTitleSort = state.news.filter.sortBy === 'title';
      dom.newsSortBtn.classList.toggle('is-active', isTitleSort);
      const icon = dom.newsSortBtn.querySelector('use');
      if (icon) icon.setAttribute('href', isTitleSort ? '#icon-sort-alpha' : '#icon-sort-time');
    }

    newsList.update(filteredItems, state.news.loading, state.news.error);

    // 如果需要滚动到指定新闻
    if (scrollToNewsKey) {
        state.scrollToNewsKey = null;
        setTimeout(() => {
            scrollToItem(dom.newsList, scrollToNewsKey, newsList.virtualList, { defaultItemHeight: 92 });
        }, 150);
    }
  };

  const setBottomTab = async (tab, { persist = true } = {}) => {
    const next = tab === "news" ? "news" : "sessions";
    state.bottomTab = next;
    // 切到新闻时不应残留会话聊天态
    if (next === "news") {
      state.view = "list";
      state.activeSessionKey = "";
    }
    // 切到会话时不应残留新闻聊天态
    if (next === "sessions") {
      state.view = "list";
      state.activeNewsKey = "";
    }

    syncBottomNavActive();
    syncVisibility();

    if (persist) {
      try {
        localStorage.setItem(BOTTOM_TAB_KEY, next);
      } catch {
        // ignore
      }
    }

    if (next === "news") {
      renderNews();
      await fetchNews({ force: false });
    } else {
      // 回到会话页，按当前路由渲染
      applyRoute();
    }
  };

  // ---------- FAQ ----------
  const extractFaqList = (result) => {
    // YiPet: 数据在 result.data.list
    if (result && result.data && Array.isArray(result.data.list)) return result.data.list;
    // 兼容：直接数组
    if (Array.isArray(result)) return result;
    // 兼容：result.data 是数组
    if (result && Array.isArray(result.data)) return result.data;
    // 兼容：其它字段里有 list/items
    if (result && Array.isArray(result.list)) return result.list;
    if (result && Array.isArray(result.items)) return result.items;
    return [];
  };

  const normalizeFaqs = (list) => {
    if (!Array.isArray(list)) return [];
    const faqs = list
      .map((x) => {
        const text = String(x?.text ?? "").trim();
        if (!text) return null;
        const order = Number.isFinite(Number(x?.order)) ? Number(x.order) : 999999;
        const id = String(x?._id ?? x?.id ?? text);
        return { id, text, order };
      })
      .filter(Boolean);

    faqs.sort((a, b) => a.order - b.order);
    return faqs;
  };

  const fetchFaqs = async ({ force = false } = {}) => {
    if (state.faq.loading) return state.faq.items;
    const now = Date.now();
    const isFresh = state.faq.loadedAt && now - state.faq.loadedAt < 5 * 60 * 1000;
    if (!force && isFresh && state.faq.items.length > 0) return state.faq.items;

    state.faq.loading = true;
    state.faq.error = "";
    renderFaqSheet();
    try {
      const result = await fetchFaqsApi(state.auth.token);
      const list = extractFaqList(result);
      state.faq.items = normalizeFaqs(list);
      state.faq.loadedAt = Date.now();
      state.faq.error = "";
      return state.faq.items;
    } catch (e) {
      logger.warn("fetchFaqs failed", e);
      if (String(e?.message || "").includes("HTTP 401")) {
        state.faq.error = "需要配置 API 鉴权（至少需要 X-Token）。请点右上角🔒设置。";
        state.faq.items = [];
        return [];
      }
      const isFile = location.protocol === "file:";
      state.faq.error = isFile
        ? "获取常见问题失败：当前以 file:// 打开页面，跨域请求可能被浏览器拦截。建议用本地静态服务器打开再试。"
        : "获取常见问题失败：请稍后重试。";
      state.faq.items = [];
      return [];
    } finally {
      state.faq.loading = false;
      renderFaqSheet();
    }
  };

  const renderFaqSheet = () => {
    if (!dom.faqList || !dom.faqEmpty) return;
    if (state.faq.loading) {
      dom.faqEmpty.hidden = false;
      dom.faqEmpty.textContent = "加载中…";
      dom.faqList.innerHTML = "";
      return;
    }
    if (state.faq.error) {
      dom.faqEmpty.hidden = false;
      dom.faqEmpty.textContent = state.faq.error;
      dom.faqList.innerHTML = "";
      return;
    }
    const items = Array.isArray(state.faq.items) ? state.faq.items : [];
    dom.faqEmpty.hidden = items.length !== 0;
    dom.faqEmpty.textContent = "暂无常见问题";
    dom.faqList.innerHTML = items
      .map(
        (faq) => `
          <button
            type="button"
            class="faqItem"
            data-action="insertFaq"
            data-faq-text="${escapeHtml(faq.text)}"
            title="点击插入"
          >${escapeHtml(faq.text)}</button>
        `,
      )
      .join("");
  };


  // 统一的 Prompt 调用封装（参考 YiPet）
  // 默认大模型：切换为 deepseek-r1:32b
  const DEFAULT_MODEL = "deepseek-r1:32b";

  const callPromptOnce = async (systemPrompt, userPrompt) => {
    return await callPromptApi(
      systemPrompt,
      userPrompt,
      DEFAULT_MODEL,
      state?.activeSessionKey,
      state.auth.token
    );
  };

  const openFaq = async () => {
    if (!dom.faqSheet || !dom.faqSheetMask) return;
    dom.faqSheetMask.hidden = false;
    dom.faqSheet.classList.add("is-open");
    dom.faqSheet.setAttribute("aria-hidden", "false");
    renderFaqSheet();
    await fetchFaqs();
  };

  // ---------- Changelog / Version history ----------
  const renderChangelogSheet = () => {
    if (!dom.changelogList || !dom.changelogMeta || !dom.changelogEmpty) return;
    const loading = !!state.changelog.loading;
    const err = String(state.changelog.error || "").trim();
    const m = state.changelog.manifest;
    const current = String(m?.current || getStoredAppVersion() || "").trim();
    const generatedAt = String(m?.generatedAt || "").trim();

    dom.changelogMeta.innerHTML = `
      <div class="changelogMeta__row">
        <span class="changelogMeta__k">当前版本</span>
        <span class="changelogMeta__v">${current ? escapeHtml(current) : "—"}</span>
      </div>
      ${generatedAt ? `<div class="changelogMeta__row"><span class="changelogMeta__k">构建时间</span><span class="changelogMeta__v">${escapeHtml(generatedAt)}</span></div>` : ""}
      <div class="changelogMeta__row">
        <span class="changelogMeta__k">${loading ? "状态" : err ? "状态" : "操作"}</span>
        <span class="changelogMeta__v">
          ${
            loading
              ? "加载中…"
              : err
                ? `<span class="changelog-error">${escapeHtml(err)}</span>`
                : `<button type="button" class="topbar__link changelog-refresh-btn" data-action="refreshChangelog">刷新</button>`
          }
        </span>
      </div>
    `;

    const releases = Array.isArray(m?.releases) ? m.releases : [];
    if (!releases.length) {
      dom.changelogList.innerHTML = "";
      dom.changelogEmpty.hidden = false;
      return;
    }
    dom.changelogEmpty.hidden = true;

    dom.changelogList.innerHTML = releases
      .map((r) => {
        const ver = escapeHtml(String(r.version || "").trim());
        const date = escapeHtml(String(r.date || "").trim());
        const title = String(r.title || "").trim();
        const changes = Array.isArray(r.changes) ? r.changes : [];
        const notes = String(r.notes || "").trim();
        const changesHtml = changes.length
          ? `<ul class="release__changes">
              ${changes
                .map((c) => {
                  const t = escapeHtml(String(c.type || "变更"));
                  const txt = escapeHtml(String(c.text || ""));
                  if (!txt) return "";
                  return `<li class="release__change"><span class="release__tag">${t}</span><span class="release__text">${txt}</span></li>`;
                })
                .join("")}
            </ul>`
          : "";
        const notesHtml = notes ? `<div class="release__notes chatBubble--md">${renderMarkdown(notes)}</div>` : "";

        return `
          <article class="release">
            <div class="release__head">
              <div class="release__ver">v${ver}</div>
              <div class="release__date">${date || ""}</div>
            </div>
            ${title ? `<div class="release__title">${escapeHtml(title)}</div>` : ""}
            ${changesHtml}
            ${notesHtml}
          </article>
        `;
      })
      .join("");

    // 支持 notes 中的 Mermaid
    renderMermaidIn(dom.changelogList);
  };

  const refreshChangelog = async ({ force = false } = {}) => {
    if (state.changelog.loading) return;
    if (!force && state.changelog.manifest && Date.now() - (state.changelog.loadedAt || 0) < 30 * 1000) {
      renderChangelogSheet();
      return;
    }
    state.changelog.loading = true;
    state.changelog.error = "";
    renderChangelogSheet();
    try {
      const m = await fetchVersionManifest();
      state.changelog.manifest = m;
      state.changelog.loadedAt = Date.now();
    } catch (e) {
      state.changelog.error = "加载失败，请稍后重试。";
      logger.warn("changelog load failed", e);
    } finally {
      state.changelog.loading = false;
      renderChangelogSheet();
    }
  };

  const openChangelog = async () => {
    if (!dom.changelogSheet || !dom.changelogSheetMask) return;
    dom.changelogSheetMask.hidden = false;
    dom.changelogSheet.classList.add("is-open");
    dom.changelogSheet.setAttribute("aria-hidden", "false");
    renderChangelogSheet();
    await refreshChangelog({ force: true });
  };

  const closeChangelog = () => {
    if (!dom.changelogSheet || !dom.changelogSheetMask) return;
    dom.changelogSheet.classList.remove("is-open");
    dom.changelogSheet.setAttribute("aria-hidden", "true");
    window.setTimeout(() => {
      if (!dom.changelogSheet.classList.contains("is-open")) dom.changelogSheetMask.hidden = true;
    }, 220);
  };

  const openUrl = () => {
    // 优先检查新闻聊天页面
    if (state.view === "newsChat" && state.activeNewsKey) {
      const n = findNewsByKey(state.activeNewsKey);
      if (!n) {
        window.alert("找不到当前新闻，请返回列表后重试。");
        return;
      }
      const url = String(n.link || "").trim();
      if (!url || (!url.startsWith("http://") && !url.startsWith("https://"))) {
        window.alert("当前新闻没有有效的URL。");
        return;
      }
      // 在新标签页中打开URL
      try {
        window.open(url, "_blank", "noopener,noreferrer");
      } catch (e) {
        logger.warn("open url failed", e);
        window.alert("无法打开URL，请检查URL格式是否正确。");
      }
      return;
    }
    
    // 检查会话聊天页面
    const s = findSessionByKey(state.activeSessionKey);
    if (!s) {
      window.alert("找不到当前会话，请返回列表后重试。");
      return;
    }
    const url = String(s.url || "").trim();
    if (!url || (!url.startsWith("http://") && !url.startsWith("https://"))) {
      window.alert("当前会话没有有效的URL。");
      return;
    }
    // 在新标签页中打开URL
    try {
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e) {
      logger.warn("open url failed", e);
      window.alert("无法打开URL，请检查URL格式是否正确。");
    }
  };

  const closeFaq = () => {
    if (!dom.faqSheet || !dom.faqSheetMask) return;
    dom.faqSheet.classList.remove("is-open");
    dom.faqSheet.setAttribute("aria-hidden", "true");
    window.setTimeout(() => {
      if (!dom.faqSheet.classList.contains("is-open")) dom.faqSheetMask.hidden = true;
    }, 220);
  };

  // 将 FAQ 文本追加到当前会话消息中，并调用 session/save 接口
  const appendFaqToSessionAndSave = async (text) => {
    const toInsert = String(text ?? "").trim();
    if (!toInsert) return;

    const sessionKey = state.activeSessionKey;
    if (!sessionKey) {
      window.alert("请先在会话列表中选择一个会话，再使用常见问题。");
      return;
    }

    const s = findSessionByKey(sessionKey);
    if (!s) {
      window.alert("找不到当前会话，请返回列表后重试。");
      return;
    }

    if (!Array.isArray(s.messages)) s.messages = [];

    const now = Date.now();
    // 追加用户消息
    s.messages.push({ role: "user", content: toInsert, ts: now });
    s.messageCount = s.messages.length;
    s.lastActiveAt = now;
    s.lastAccessTime = now;
    s.updatedAt = now;
    s.preview = toInsert;

    // 先本地更新 UI
    chat.renderChat();
    // 关闭 FAQ 弹层
    closeFaq();

    // 构造与 YiPet 后端兼容的会话保存数据，并调用 https://api.effiy.cn/session/save
    try {
      const messagesForBackend = (s.messages || []).map((m) => {
        const role = normalizeRole(m); // 'user' | 'assistant'
        return {
          type: role === "user" ? "user" : "pet",
          content: normalizeText(m),
          timestamp: m.ts || m.timestamp || Date.now(),
          imageDataUrl: m.imageDataUrl || m.image || undefined,
        };
      });

      const payload = {
        key: String(s.key || sessionKey || ""),
        url: s.url || "",
        pageTitle: (s.pageTitle && String(s.pageTitle).trim()) || s.title || "",
        pageDescription: (s.pageDescription && String(s.pageDescription).trim()) || s.preview || "",
        pageContent: s.pageContent || "",
        tags: Array.isArray(s.tags) ? s.tags : [],
        isFavorite: s.isFavorite !== undefined ? s.isFavorite : false,
        createdAt: s.createdAt || now,
        updatedAt: s.updatedAt || now,
        lastAccessTime: s.lastAccessTime || now,
        messages: messagesForBackend,
      };

      const data = await saveSessionApi(payload, state.auth.token);
      logger.info("faq appended and saved", data);
    } catch (e) {
      logger.warn("session/save failed", e);
    }
  };

  // 返回按钮：只在聊天页挂载（首页不渲染也不提供功能）
  let chatBackBtnEl = null;
  
  const ensureChatBackBtn = () => {
    if (chatBackBtnEl) return chatBackBtnEl;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "iconbtn topbar__backBtn";
    btn.setAttribute("aria-label", "返回");
    btn.title = "返回";
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" aria-hidden="true"><use href="#icon-back"/></svg>
    `;
    
    // 点击返回功能
    const handleClick = async (e) => {
      // 触觉反馈（如果支持）
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
      
      // 保存当前会话ID或新闻key，用于返回列表时滚动到对应位置
      if (state.view === "chat" && state.activeSessionKey) {
        state.scrollToSessionKey = state.activeSessionKey;
      } else if (state.view === "newsChat" && state.activeNewsKey) {
        state.scrollToNewsKey = state.activeNewsKey;
      }
      
      // 根据进入聊天页面的来源标签页，切换回对应的标签页
      if (state.chatSourceTab && state.chatSourceTab !== state.bottomTab) {
        await setBottomTab(state.chatSourceTab, { persist: false });
      }
      
      // 返回到列表（避免退回到站点外部历史记录）
      navigateToList();
    };
    
    // 绑定事件
    btn.addEventListener("click", handleClick);
    
    chatBackBtnEl = btn;
    return chatBackBtnEl;
  };

  const mountChatBackBtn = () => {
    if (!dom.topbarLeft) return;
    const btn = ensureChatBackBtn();
    if (!btn.isConnected) dom.topbarLeft.prepend(btn);
  };

  const unmountChatBackBtn = () => {
    if (chatBackBtnEl?.isConnected) chatBackBtnEl.remove();
  };

  // 删除会话按钮：只在会话聊天页挂载
  let chatDeleteBtnEl = null;
  const ensureChatDeleteBtn = () => {
    if (chatDeleteBtnEl) return chatDeleteBtnEl;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "iconbtn";
    btn.setAttribute("aria-label", "删除会话");
    btn.title = "删除会话";
    btn.setAttribute("data-action", "deleteSession");
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" aria-hidden="true"><use href="#icon-trash"/></svg>
    `;
    chatDeleteBtnEl = btn;
    return chatDeleteBtnEl;
  };

  const mountChatDeleteBtn = () => {
    if (!dom.topbarRight) return;
    // 只在会话聊天页面显示，不在新闻聊天页面显示
    if (state.view === "chat" && state.bottomTab === "sessions") {
      const btn = ensureChatDeleteBtn();
      if (!btn.isConnected) {
        // 插入到顶部栏右侧
        dom.topbarRight.appendChild(btn);
      }
    }
  };

  const unmountChatDeleteBtn = () => {
    if (chatDeleteBtnEl?.isConnected) chatDeleteBtnEl.remove();
  };

  const findSessionByKey = (key) => state.sessions.find((s) => String(s.key) === String(key));
  
  // 通过URL查找会话（用于新闻关联）
  const findSessionByUrl = (url) => {
    if (!url) return null;
    const urlStr = String(url).trim();
    // 先通过id查找（可能id就是url）
    let session = findSessionByKey(urlStr);
    if (session) return session;
    // 再通过url字段查找
    session = state.sessions.find((s) => String(s.url || "").trim() === urlStr);
    return session || null;
  };

  const findNewsByKey = (key) => state.news.items.find((n) => String(n.key) === String(key));

  const normalizeRole = (m) => (normalizeMsgRole(m) === "user" ? "user" : "assistant");
  const normalizeText = (m) => String(normalizeMsgText(m) ?? "").trim();

  // 滚动聊天消息到底部（高性能优化版）

  // 显示提示消息
  const showToast = (message, type = 'info') => {
    const toast = document.createElement('div');
    toast.className = 'yi-toast';
    toast.innerHTML = `<div class="yi-toast__inner">${message}</div>`;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 2000);
  };

  const setView = (view) => {
    state.view = view;
    syncVisibility();
  };

  /**
   * 生成会话ID（基于URL的MD5哈希，参考 YiPet）
   * @param {string} url - 页面URL
   * @returns {Promise<string>} 会话ID（32位MD5十六进制字符串）
   */
  const generateSessionId = async (url) => {
    // 确保md5函数可用
    const md5Func = typeof md5 !== 'undefined' ? md5 : 
                   (typeof window !== 'undefined' && window.md5) ? window.md5 : null;
    
    if (!md5Func) {
      logger.warn('MD5函数未找到，使用降级方案');
      // 降级方案：如果MD5不可用，使用简单的哈希生成32位十六进制字符串
      if (!url) {
        const input = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        let hash = 0;
        for (let i = 0; i < input.length; i++) {
          const char = input.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash;
        }
        const hex = Math.abs(hash).toString(16).padStart(32, '0');
        return hex.substring(0, 32);
      }
      let hash = 0;
      for (let i = 0; i < url.length; i++) {
        const char = url.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      const hex = Math.abs(hash).toString(16).padStart(32, '0');
      return hex.substring(0, 32);
    }
    
    if (!url) {
      // 如果没有URL，生成基于时间戳和随机数的唯一字符串，然后计算MD5
      const input = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      return md5Func(input);
    }
    
    // 使用MD5对URL进行哈希
    return md5Func(url);
  };

  /**
   * 初始化或恢复会话（基于新闻链接，参考 YiPet 的 initSession）
   * 自动处理会话的查找、创建和激活
   * @param {string} newsKey - 新闻key
   * @returns {Promise<string|null>} 会话ID，如果失败返回null
   */
  const initNewsSession = async (newsKey) => {
    // 查找新闻
    const news = findNewsByKey(newsKey);
    if (!news) {
      logger.warn("news not found", { key: newsKey });
      return null;
    }

    // 获取新闻链接
    const newsLink = String(news.link || "").trim();
    if (!newsLink) {
      logger.warn("news has no link, cannot create session");
      return null;
    }

    // 生成基于URL的会话ID（使用MD5哈希）
    const sessionId = await generateSessionId(newsLink);

    // 先通过URL查找会话（兼容旧数据）
    let existingSession = findSessionByUrl(newsLink);
    
    // 如果通过URL没找到，再通过sessionId查找
    if (!existingSession) {
      existingSession = findSessionByKey(sessionId);
    }
    
    // 如果本地没有找到，尝试从后端获取（确保会话列表已加载）
    if (!existingSession) {
      await fetchSessions({ force: false });
      // 再次尝试查找
      existingSession = findSessionByUrl(newsLink);
      if (!existingSession) {
        existingSession = findSessionByKey(sessionId);
      }
    }

    // 如果会话已存在，恢复并更新
    if (existingSession) {
      const actualSessionKey = String(existingSession.key);
      
      // 更新新闻的 sessionKey 字段
      news.sessionKey = actualSessionKey;
      const newsInState = state.news.items.find(n => String(n.key) === String(newsKey));
      if (newsInState) {
        newsInState.sessionKey = actualSessionKey;
      }

      // 更新会话的访问时间
      existingSession.lastAccessTime = Date.now();
      existingSession.lastActiveAt = Date.now();
      
      logger.info('找到基于URL的已有会话，已自动恢复:', actualSessionKey);
      return actualSessionKey;
    }

    // 如果会话不存在，创建新会话
    const newsDescription = String(news.description || "").trim();
    const newsTitle = String(news.title || "").trim();
    const now = Date.now();

    // 生成UUID格式的key（用于后端存储）
    const generateUUID = () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    };

    const sessionKey = generateUUID();
    const sessionTags = ['news']; // 新闻会话的默认标签
    
    const newSession = {
      key: sessionKey,
      url: newsLink,
      title: newsTitle || "新闻",
      pageTitle: newsTitle || "新闻",
      pageDescription: newsDescription,
      pageContent: newsDescription,
      messages: [],
      tags: sessionTags,
      createdAt: now,
      updatedAt: now,
      lastAccessTime: now,
      lastActiveAt: now,
      messageCount: 0,
      preview: newsDescription,
    };

    // 保存到本地状态
    state.sessions.push(newSession);
    
    // 更新新闻的 sessionKey 字段
    news.sessionKey = newSession.key;
    const newsInState = state.news.items.find(n => String(n.key) === String(newsKey));
    if (newsInState) {
      newsInState.sessionKey = newSession.key;
    }

    logger.info('使用URL作为会话ID，已自动创建新会话（仅本地）:', newSession.key, 'URL:', newsLink);
    return newSession.key;
  };

  const navigateToNewsChat = async (key) => {
    // 记录进入聊天页面的来源标签页（从新闻视图进入）
    state.chatSourceTab = "news";
    
    // 标记新闻为已读
    markNewsAsRead(key);
    const news = findNewsByKey(key);
    if (news) {
      news.isRead = true;
      const newsInState = state.news.items.find(n => String(n.key) === String(key));
      if (newsInState) {
        newsInState.isRead = true;
      }
    }

    // 如果新闻已经有 sessionKey 字段，说明已经转换为会话，直接进入会话聊天页面
    if (news && news.sessionKey) {
      navigateToChat(news.sessionKey);
      return;
    }

    // 初始化或恢复会话（自动创建或查找）
    const sessionKey = await initNewsSession(key);
    
    if (sessionKey) {
      // 自动激活并进入会话
      navigateToChat(sessionKey);
    } else {
      // 如果创建失败，仍然进入新闻聊天页面
      location.hash = `#/news-chat?key=${encodeURIComponent(String(key))}`;
    }
  };

  // 获取会话详情
  const fetchSessionDetail = async (sessionKey) => {
    if (!sessionKey) return null;
    
    try {
      const normalizeSessionMessages = (raw) => {
        if (!Array.isArray(raw)) return [];
        const out = [];
        for (const msg of raw) {
          if (msg == null) continue;
          if (typeof msg !== "object") {
            const content = String(msg || "").trim();
            if (!content) continue;
            const next = { role: "assistant", content, ts: Date.now() };
            const prev = out[out.length - 1];
            if (prev && prev.role === next.role && String(prev.content || "").trim() === content) continue;
            out.push(next);
            continue;
          }
          const rawRole = String(msg.role ?? msg.from ?? msg.sender ?? msg.type ?? msg.author ?? "assistant").toLowerCase();
          const role = rawRole === "user" || rawRole === "me" ? "user" : "assistant";
          const content = String(msg.content ?? msg.text ?? msg.message ?? "").trim();
          const ts = Number(msg.timestamp ?? msg.ts ?? msg.time ?? msg.createdAt ?? msg.created_at ?? Date.now()) || Date.now();
          const imageDataUrl = msg.imageDataUrl || msg.image || undefined;
          const imageDataUrls = Array.isArray(msg.imageDataUrls) ? msg.imageDataUrls.filter(Boolean).map((x) => String(x)) : [];
          if (!content && !imageDataUrl && imageDataUrls.length === 0) continue;
          const next = { role, content, ts, imageDataUrl };
          if (imageDataUrls.length > 0) next.imageDataUrls = imageDataUrls;
          const prev = out[out.length - 1];
          if (prev && prev.role === next.role && String(prev.content || "").trim() === content && !prev.imageDataUrl && !next.imageDataUrl) {
            continue;
          }
          out.push(next);
        }
        return out;
      };
      
      // 尝试使用 sessionKey 作为 ID 请求详情
      // 注意：如果 sessionKey 是 URL（如新闻转换的会话），这里可能会失败，但在 fetchSessionDetail 被调用时，通常已经是保存过的会话
      const sessionData = await fetchSessionDetailApi(sessionKey, state.auth.token);
      if (!sessionData || typeof sessionData !== 'object') {
        logger.warn("session detail format invalid", sessionData);
        return null;
      }
      
      const actualSessionKey = String(sessionData.key || sessionKey);
      let s = findSessionByKey(actualSessionKey);
      
      // 如果使用实际Key找不到，尝试用传入的 sessionKey 查找（兼容Key不一致的情况）
      if (!s && actualSessionKey !== String(sessionKey)) {
        s = findSessionByKey(sessionKey);
      }
      
      // 如果本地找不到会话，将获取到的会话添加到本地状态中
      if (!s) {
        const tags = Array.isArray(sessionData.tags) ? sessionData.tags : (sessionData.tags ? [sessionData.tags] : []);
        const title = (sessionData.title ?? sessionData.pageTitle ?? "").trim() || "未命名会话";
        const preview = (sessionData.pageDescription ?? sessionData.preview ?? sessionData.summary ?? "").trim();
        const updatedAt = Number(sessionData.updatedAt ?? sessionData.updated_at ?? Date.now());
        const createdAt = Number(sessionData.createdAt ?? sessionData.created_at ?? updatedAt);
        const lastAccessTime = Number(sessionData.lastAccessTime ?? sessionData.last_access_time ?? updatedAt);
        const lastActiveAt = Number(sessionData.lastActiveAt ?? sessionData.last_active_at ?? lastAccessTime ?? updatedAt);
        
        const messages = normalizeSessionMessages(sessionData.messages);
        
        const messageCount = messages.length;
        
        // 创建新的会话对象并添加到本地状态
        s = {
          key: actualSessionKey,
          title,
          preview,
          tags,
          url: sessionData.url || "",
          pageTitle: sessionData.pageTitle || "",
          pageDescription: sessionData.pageDescription || "",
          pageContent: sessionData.pageContent || sessionData.content || "",
          messageCount,
          messages,
          createdAt,
          updatedAt,
          lastAccessTime,
          muted: sessionData.muted !== undefined ? !!sessionData.muted : false,
          lastActiveAt,
        };
        
        // 添加前再次检查，避免重复
        const existing = findSessionByKey(actualSessionKey);
        if (!existing) {
          state.sessions.push(s);
        } else {
          // 如果已存在，使用已存在的会话对象
          s = existing;
        }
      } else {
        // 如果返回了 messages 字段，更新到会话中
        if (Array.isArray(sessionData.messages)) {
          s.messages = normalizeSessionMessages(sessionData.messages);
          s.messageCount = s.messages.length;
        }
        
        // 更新其他会话信息（无论是否有 messages）
        if (sessionData.title) s.title = sessionData.title;
        if (sessionData.pageTitle) s.pageTitle = sessionData.pageTitle;
        if (sessionData.pageDescription) s.pageDescription = sessionData.pageDescription;
        if (sessionData.preview) s.preview = sessionData.preview;
        // 如果接口返回了页面上下文，更新到会话上（即使为空字符串也要更新，避免显示旧数据）
        if (sessionData.pageContent !== undefined) s.pageContent = sessionData.pageContent || "";
      }
      
      return sessionData;
    } catch (error) {
      logger.error("fetch session detail failed", error);
      return null;
    }
  };

  const applyRoute = async () => {
    const r = parseRoute();
    
    // 处理会话聊天路由
    if (r.name === "chat" && r.key) {
      // 记录进入聊天页面的来源标签页（如果还没有记录）
      if (state.chatSourceTab === null) {
        state.chatSourceTab = state.bottomTab;
      }
      // 如果当前不在会话标签页，先切换到会话标签页
      if (state.bottomTab !== "sessions") {
        await setBottomTab("sessions", { persist: false });
      }
      state.activeSessionKey = r.key;
      state.activeNewsKey = "";
      setView("chat");
      await fetchSessionDetail(r.key);
      chat.renderChat();
      return;
    }
    
    // 处理新闻聊天路由
    if (r.name === "newsChat" && r.key) {
      // 只有在新闻视图时才处理新闻聊天路由
      if (state.bottomTab !== "news") {
        return;
      }
      // 记录进入聊天页面的来源标签页
      state.chatSourceTab = state.bottomTab;
      state.activeNewsKey = r.key;
      state.activeSessionKey = "";
      setView("newsChat");
      // 渲染新闻聊天页面
      chat.renderNewsChat();
      return;
    }
    
    // 默认返回列表视图
    state.activeSessionKey = "";
    state.activeNewsKey = "";
    state.chatSourceTab = null; // 清除来源记录
    setView("list");
    if (state.bottomTab === "sessions") {
      renderList();
    } else {
      renderNews();
    }
  };

  // 从所有会话中提取唯一标签列表
  const getAllTags = () => {
    const tagSet = new Set();
    state.sessions.forEach((s) => {
      const tags = Array.isArray(s.tags) ? s.tags : [];
      const first = String(tags[0] || "").trim();
      if (first && first !== "网文") {
        tagSet.add(first);
      }
    });
    return Array.from(tagSet).sort();
  };

  // 按"保存的顺序 + 默认优先标签 + 其余字母序"得到用于展示的标签顺序
  const getOrderedTags = () => {
    const all = getAllTags();
    if (all.length === 0) return [];

    const saved = loadTagOrder();
    if (!saved || saved.length === 0) {
      const pinned = DEFAULT_PINNED_TAGS.filter((t) => all.includes(t));
      const rest = all.filter((t) => !pinned.includes(t));
      return [...pinned, ...rest];
    }

    const used = new Set();
    const ordered = [];

    for (const t of saved) {
      if (!t) continue;
      if (!all.includes(t)) continue;
      if (used.has(t)) continue;
      used.add(t);
      ordered.push(t);
    }

    // 新出现的默认优先标签：不打乱用户已有顺序，只在末尾优先追加
    for (const t of DEFAULT_PINNED_TAGS) {
      if (!all.includes(t)) continue;
      if (used.has(t)) continue;
      used.add(t);
      ordered.push(t);
    }

    // 其余新增标签（字母序）
    for (const t of all) {
      if (used.has(t)) continue;
      used.add(t);
      ordered.push(t);
    }

    return ordered;
  };

  // 计算每个标签对应的会话数量（按 tags[0] 计数；过滤时仍按全数组匹配）
  const getTagCount = (tag) => {
    return state.sessions.filter((s) => {
      const first = String((Array.isArray(s.tags) ? s.tags : [])[0] || "").trim();
      return first === tag;
    }).length;
  };

  const computeChips = () => {
    const c = [];
    const f = state.filter;
    if (state.q.trim()) c.push({ key: "q", label: `搜索：${state.q.trim()}` });
    // 日期标签已移除，日期筛选功能保留
    // 显示选中的标签
    f.selectedTags.forEach((tag) => {
      const count = getTagCount(tag);
      c.push({ key: `tag_${tag}`, label: tag, tagValue: tag, count });
    });
    return c;
  };

  const filterAndSort = () => {
    const q = state.q.trim().toLowerCase();
    const f = state.filter;
    let arr = state.sessions.slice();

    // 搜索过滤
    if (q) {
      arr = arr.filter((s) => {
        const hay = `${s.title} ${s.pageTitle || ""} ${s.preview || ""} ${s.url || ""} ${s.tags.join(" ")}`.toLowerCase();
        return hay.includes(q);
      });
    }

    // 标签过滤
    if (f.selectedTags.length > 0) {
      arr = arr.filter((s) => {
        const sessionTags = Array.isArray(s.tags) ? s.tags.map((t) => String(t).trim()) : [];
        return f.selectedTags.some((selectedTag) => sessionTags.includes(selectedTag));
      });
    }

    // 日期过滤：只有在没有选中标签时才生效
    if (f.selectedTags.length === 0 && state.selectedDate) {
      const selectedDate = dateUtil.parseYMD(state.selectedDate);
      if (selectedDate) {
        const selectedYear = selectedDate.getFullYear();
        const selectedMonth = selectedDate.getMonth();
        const selectedDay = selectedDate.getDate();

        arr = arr.filter((s) => {
          const sessionDate = new Date(s.lastActiveAt);
          return (
            sessionDate.getFullYear() === selectedYear &&
            sessionDate.getMonth() === selectedMonth &&
            sessionDate.getDate() === selectedDay
          );
        });
      }
    }

    // 排序：根据 sortBy 模式选择排序方式
    arr.sort((a, b) => {
      const aFav = a.isFavorite || false;
      const bFav = b.isFavorite || false;

      if (aFav !== bFav) {
        return aFav ? -1 : 1;
      }

      if (state.filter.sortBy === 'title') {
        // 标题排序：收藏置顶 → 标题 A→Z
        const titleA = (a.title || '').toLowerCase();
        const titleB = (b.title || '').toLowerCase();
        const cmp = titleA.localeCompare(titleB);
        if (cmp !== 0) return cmp;
        return String(a.key).localeCompare(String(b.key));
      }

      // 时间排序（默认）：收藏置顶 → 时间倒序
      const aTime = a.updatedAt || a.lastAccessTime || a.lastActiveAt || a.createdAt || 0;
      const bTime = b.updatedAt || b.lastAccessTime || b.lastActiveAt || b.createdAt || 0;
      if (aTime !== bTime) {
        return bTime - aTime;
      }

      return String(a.key).localeCompare(String(b.key));
    });

    return arr;
  };

  const renderChips = () => {
    const chips = computeChips();
    dom.chips.innerHTML = chips
      .map(
        (c) => `
          <span class="chip" data-chip="${c.key}">
            <span>${escapeHtml(c.label)}${c.count !== undefined ? ` <span class="chip__count">(${c.count})</span>` : ''}</span>
            <button class="chip__x" type="button" aria-label="移除" data-action="removeChip" data-key="${c.key}" ${c.tagValue ? `data-tag-value="${escapeHtml(c.tagValue)}"` : ''}>×</button>
          </span>
        `,
      )
      .join("");
    
  };
  
  // 渲染内联标签行
  const renderInlineTags = ({ container, tags, selectedSet, getCount, actionName }) => {
    if (!container) return;
    if (!tags || !tags.length) {
      container.innerHTML = "";
      return;
    }
    container.innerHTML = tags
      .map((tag) => {
        const count = getCount(tag);
        const sel = selectedSet.has(tag) ? " is-selected" : "";
        return `<button class="tagPill${sel}" data-action="${actionName}" data-tag="${escapeHtml(tag)}"><span>${escapeHtml(tag)}</span><span class="tagPill__count">${count}</span></button>`;
      })
      .join("");
  };

  // 内联标签切换（会话）
  const inlineToggleTag = (tag) => {
    if (!tag) return;
    const idx = state.filter.selectedTags.indexOf(tag);
    if (idx > -1) state.filter.selectedTags.splice(idx, 1);
    else state.filter.selectedTags.push(tag);
    renderList();
  };

  // 内联标签切换（新闻）
  const inlineToggleNewsTag = (tag) => {
    if (!tag) return;
    const idx = state.news.filter.selectedTags.indexOf(tag);
    if (idx > -1) state.news.filter.selectedTags.splice(idx, 1);
    else state.news.filter.selectedTags.push(tag);
    renderNews();
  };

  // 滚动位置记忆：保存和恢复滚动位置
  const SCROLL_POSITION_KEY = "yiH5_sessions_scroll_position";
  const saveScrollPosition = () => {
    if (!dom.list) return;
    const scrollTop = dom.list.scrollTop || window.scrollY || 0;
    if (scrollTop > 0) {
      try {
        sessionStorage.setItem(SCROLL_POSITION_KEY, String(scrollTop));
      } catch (e) {
        // 忽略存储错误（如隐私模式）
      }
    }
  };
  
  const restoreScrollPosition = () => {
    if (!dom.list) return;
    try {
      const saved = sessionStorage.getItem(SCROLL_POSITION_KEY);
      if (saved) {
        const scrollTop = parseFloat(saved);
        if (scrollTop > 0 && Number.isFinite(scrollTop)) {
          // 延迟恢复，确保 DOM 已渲染
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              if (dom.list) {
                dom.list.scrollTop = scrollTop;
                // 恢复后清除，避免下次误用
                sessionStorage.removeItem(SCROLL_POSITION_KEY);
              }
            });
          });
        }
      }
    } catch (e) {
      // 忽略存储错误
    }
  };

  const renderList = () => {
    const scrollToSessionKey = state.scrollToSessionKey;
    
    // 保存当前滚动位置（在重新渲染前）
    const shouldRestoreScroll = state.view === "list" && dom.list.scrollTop > 0 && !scrollToSessionKey;
    if (shouldRestoreScroll) {
      saveScrollPosition();
    }
    
    const arr = filterAndSort();
    renderInlineTags({
      container: dom.sessionTags,
      tags: getOrderedTags(),
      selectedSet: new Set(state.filter.selectedTags),
      getCount: getTagCount,
      actionName: "inlineToggleTag"
    });
    renderChips();

    // 更新排序按钮状态
    if (dom.sortBtn) {
      const isTitleSort = state.filter.sortBy === 'title';
      dom.sortBtn.classList.toggle('is-active', isTitleSort);
      const icon = dom.sortBtn.querySelector('use');
      if (icon) icon.setAttribute('href', isTitleSort ? '#icon-sort-alpha' : '#icon-sort-time');
    }

    sessionList.update(arr, state.sessionsLoading, state.lastError);
    
    // 如果需要滚动到指定会话
    if (scrollToSessionKey) {
      // 清除标记，避免重复滚动
      state.scrollToSessionKey = null;
      // 等待DOM更新完成
      setTimeout(() => {
        scrollToItem(dom.list, scrollToSessionKey, sessionList.virtualList, { defaultItemHeight: 120 });
      }, 150);
    } else if (shouldRestoreScroll) {
      // 恢复滚动位置
      restoreScrollPosition();
    }
  };

  // renderItem has been moved to SessionList component

  const toggleSort = () => {
    state.filter.sortBy = state.filter.sortBy === 'time' ? 'title' : 'time';
    renderList();
  };

  const toggleNewsSort = () => {
    state.news.filter.sortBy = state.news.filter.sortBy === 'time' ? 'title' : 'time';
    renderNews();
  };

  const toggleFavorite = async (key) => {
    if (!key) {
      showToast('会话Key不能为空');
      return;
    }

    try {
      // 找到会话
      let session = state.sessions.find((s) => String(s.key) === String(key));
      if (!session) {
        showToast('会话不存在');
        return;
      }

      // 如果当前正在查看这个会话，确保使用最新的消息数据
      // 因为用户可能在聊天页面发送了新消息，但还没有保存到后端
      if (state.activeSessionKey === String(key) && state.view === 'chat') {
        const currentSession = findSessionByKey(state.activeSessionKey);
        if (currentSession && currentSession === session) {
          // 是同一个对象引用，消息应该已经是最新的
          // 但为了确保，我们使用当前会话对象
          session = currentSession;
        }
      }

      // 切换收藏状态
      const newFavoriteState = !(session.isFavorite || false);
      session.isFavorite = newFavoriteState;
      session.updatedAt = Date.now();

      // 构建消息数据，确保使用最新的消息
      const messagesForBackend = (session.messages || []).map((m) => {
        const role = normalizeRole(m);
        return {
          type: role === "user" ? "user" : "pet",
          content: normalizeText(m),
          timestamp: m.ts || m.timestamp || Date.now(),
          imageDataUrl: m.imageDataUrl || m.image || undefined,
        };
      });

      // 调用后端 API 更新会话
      await saveSessionApi({
          key: session.key,
          url: session.url || "",
          title: session.title || "",
          pageTitle: (session.pageTitle && String(session.pageTitle).trim()) || session.title || "",
          pageDescription: (session.pageDescription && String(session.pageDescription).trim()) || session.preview || "",
          pageContent: session.pageContent || "",
          messages: messagesForBackend,
          tags: Array.isArray(session.tags) ? session.tags : [],
          isFavorite: newFavoriteState,
          createdAt: session.createdAt || Date.now(),
          updatedAt: session.updatedAt || Date.now(),
          lastAccessTime: session.lastAccessTime || session.lastActiveAt || Date.now()
      }, state.auth.token);

      // 重新渲染列表
      renderList();
      
      // 如果当前正在查看这个会话，也重新渲染聊天页面
      if (state.activeSessionKey === String(key) && state.view === 'chat') {
        chat.renderChat();
      }
      
      // 显示成功消息
      showToast(newFavoriteState ? '已收藏' : '已取消收藏');
    } catch (error) {
      logger.error("toggle favorite failed", error);
      showToast('切换收藏状态失败：' + (error.message || '未知错误'));
      // 恢复状态
      const session = state.sessions.find((s) => String(s.key) === String(key));
      if (session) {
        session.isFavorite = !(session.isFavorite || false);
      }
    }
  };

  const toggleNewsFavorite = (key) => {
    if (!key) {
      showToast('新闻Key不能为空');
      return;
    }

    try {
      // 找到新闻
      const newsItem = state.news.items.find((n) => String(n.key) === String(key));
      if (!newsItem) {
        showToast('新闻不存在');
        return;
      }

      // 切换收藏状态
      const favoriteNews = loadFavoriteNews();
      const isFavorite = favoriteNews.has(String(key));
      
      if (isFavorite) {
        favoriteNews.delete(String(key));
        showToast('已取消收藏');
      } else {
        favoriteNews.add(String(key));
        showToast('已收藏');
      }
      
      saveFavoriteNews(favoriteNews);
      
      // 更新新闻项的收藏状态
      newsItem.isFavorite = !isFavorite;
      
      // 重新渲染新闻列表
      renderNews();
    } catch (error) {
      logger.error("toggle news favorite failed", error);
      showToast('切换收藏状态失败：' + (error.message || '未知错误'));
    }
  };

  // 创建空白新会话（从会话视图创建）
  const createBlankSession = async () => {
    try {
      // 生成一个唯一的会话ID（不基于URL，使用时间戳和随机数）
      const uniqueId = `blank_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const sessionKey = uniqueId;
      
      // 检查会话ID是否已存在，如果存在则重新生成
      let finalSessionId = sessionKey;
      let attempts = 0;
      while (state.sessions.find(s => String(s.key) === String(finalSessionId)) && attempts < 10) {
        const newUniqueId = `blank_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        finalSessionId = newUniqueId;
        attempts++;
      }
      
      // 生成唯一的空白会话URL（确保不会重复）
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 11);
      const uniqueUrl = `blank-session://${timestamp}-${randomStr}`;
      
      // 确保URL唯一：检查是否已存在相同URL的会话
      let finalUrl = uniqueUrl;
      let urlAttempts = 0;
      while (state.sessions.some(s => s && s.url === finalUrl) && urlAttempts < 10) {
        const newTimestamp = Date.now();
        const newRandomStr = Math.random().toString(36).substring(2, 11);
        finalUrl = `blank-session://${newTimestamp}-${newRandomStr}`;
        urlAttempts++;
      }
      
      // 获取当前筛选的会话列表
      const filteredSessions = filterAndSort();
      
      // 构建结构化的会话列表内容
      let structuredSessionList = '';
      if (filteredSessions && filteredSessions.length > 0) {
        structuredSessionList = '\n\n## 当前筛选的会话列表\n\n';
        
        filteredSessions.forEach((session, index) => {
          const title = session.pageTitle || session.title || '未命名会话';
          const url = session.url || '';
          const description = session.pageDescription || session.preview || '';
          
          structuredSessionList += `### ${index + 1}. ${title}\n\n`;
          
          if (url) {
            structuredSessionList += `**链接**: ${url}\n\n`;
          }
          
          if (description) {
            structuredSessionList += `**描述**: ${description}\n\n`;
          }
          
          // 如果有标签，也添加进去
          if (session.tags && Array.isArray(session.tags) && session.tags.length > 0) {
            structuredSessionList += `**标签**: ${session.tags.join(', ')}\n\n`;
          }
          
          structuredSessionList += '---\n\n';
        });
      }
      
      // 格式化日期为 yyyy-MM-dd hh:mm:ss 格式
      const formatDateForTitle = (timestamp) => {
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      };
      
      const now = Date.now();
      const blankSession = {
        key: finalSessionId,
        url: finalUrl,
        pageTitle: `会话_${formatDateForTitle(now)}`,
        pageDescription: '',
        pageContent: structuredSessionList || '',
        messages: [],
        createdAt: now,
        updatedAt: now,
        lastAccessTime: now,
        lastActiveAt: now,
        tags: [],
        title: `会话_${formatDateForTitle(now)}`,
        preview: '',
        messageCount: 0,
        muted: false,
      };
      
      // 保存新会话到本地状态
      state.sessions.push(blankSession);
      
      // 自动保存新会话到后端
      try {
        const messagesForBackend = [];
        const payload = {
          key: String(blankSession.key),
          url: blankSession.url || "",
          pageTitle: blankSession.pageTitle || "",
          pageDescription: blankSession.pageDescription || "",
          pageContent: blankSession.pageContent || "",
          tags: [],
          createdAt: blankSession.createdAt || now,
          updatedAt: blankSession.updatedAt || now,
          lastAccessTime: blankSession.lastAccessTime || now,
          messages: messagesForBackend,
        };
        
        await saveSessionApi(payload, state.auth.token);
        logger.info("new session saved to backend", { id: finalSessionId });
      } catch (error) {
        logger.error("auto save new session failed", error);
      }
      
      // 打开新创建的会话
      navigateToChat(finalSessionId);
      
      // 显示成功通知
      const notificationMsg = filteredSessions.length > 0 
        ? `已创建新会话（已包含 ${filteredSessions.length} 个筛选会话的信息）`
        : '已创建新会话';
      showToast(notificationMsg, 'success');
      
      return finalSessionId;
    } catch (error) {
      logger.error("create new session failed", error);
      showToast('创建新会话失败：' + (error.message || '未知错误'));
      throw error;
    }
  };
  
  // 创建包含新闻列表的新会话（从新闻视图创建）
  const createNewsSession = async () => {
    try {
      // 生成一个唯一的会话ID（不基于URL，使用时间戳和随机数）
      const uniqueId = `news_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const sessionKey = uniqueId;
      
      // 检查会话ID是否已存在，如果存在则重新生成
      let finalSessionId = sessionKey;
      let attempts = 0;
      while (state.sessions.find(s => String(s.key) === String(finalSessionId)) && attempts < 10) {
        const newUniqueId = `news_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        finalSessionId = newUniqueId;
        attempts++;
      }
      
      // 生成唯一的新闻会话URL（确保不会重复）
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 11);
      const uniqueUrl = `news-session://${timestamp}-${randomStr}`;
      
      // 确保URL唯一：检查是否已存在相同URL的会话
      let finalUrl = uniqueUrl;
      let urlAttempts = 0;
      while (state.sessions.some(s => s && s.url === finalUrl) && urlAttempts < 10) {
        const newTimestamp = Date.now();
        const newRandomStr = Math.random().toString(36).substring(2, 11);
        finalUrl = `news-session://${newTimestamp}-${newRandomStr}`;
        urlAttempts++;
      }
      
      // 获取当前筛选的新闻列表
      const filteredNews = filterAndSortNews();
      
      // 构建结构化的新闻列表内容，并收集所有新闻的标签
      let structuredNewsList = '';
      const allNewsTags = new Set(); // 用于收集所有新闻的标签（去重）
      
      if (filteredNews && filteredNews.length > 0) {
        // 过滤出真正的新闻项（排除会话项）
        const newsItems = filteredNews.filter(item => item.fromNews !== true);
        
        if (newsItems.length > 0) {
          structuredNewsList = '\n\n## 当前筛选的新闻列表\n\n';
          
          newsItems.forEach((newsItem, index) => {
            const title = newsItem.title || '未命名新闻';
            const link = newsItem.link || '';
            const description = newsItem.description || '';
            
            structuredNewsList += `### ${index + 1}. ${title}\n\n`;
            
            if (link) {
              structuredNewsList += `**链接**: ${link}\n\n`;
            }
            
            if (description) {
              structuredNewsList += `**描述**: ${description}\n\n`;
            }
            
            // 如果有标签，也添加进去，并收集标签
            if (newsItem.tags && Array.isArray(newsItem.tags) && newsItem.tags.length > 0) {
              structuredNewsList += `**标签**: ${newsItem.tags.join(', ')}\n\n`;
              // 收集所有新闻的标签
              newsItem.tags.forEach(tag => {
                if (tag && String(tag).trim()) {
                  allNewsTags.add(String(tag).trim());
                }
              });
            }
            
            structuredNewsList += '---\n\n';
          });
        }
      }
      
      const sessionTags = [];
      
      // 格式化日期为 yyyy-MM-dd hh:mm:ss 格式
      const formatDateForTitle = (timestamp) => {
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      };
      
      const now = Date.now();
      const newsSession = {
        key: finalSessionId,
        url: finalUrl,
        pageTitle: `新闻_${formatDateForTitle(now)}`,
        pageDescription: '',
        pageContent: structuredNewsList || '',
        messages: [],
        createdAt: now,
        updatedAt: now,
        lastAccessTime: now,
        lastActiveAt: now,
        tags: sessionTags,
        title: `新闻_${formatDateForTitle(now)}`,
        preview: '',
        messageCount: 0,
        muted: false,
      };
      
      // 保存新会话到本地状态
      state.sessions.push(newsSession);
      
      // 自动保存新会话到后端
      try {
        const messagesForBackend = [];
        const payload = {
          key: String(newsSession.key),
          url: newsSession.url || "",
          pageTitle: newsSession.pageTitle || "",
          pageDescription: newsSession.pageDescription || "",
          pageContent: newsSession.pageContent || "",
          tags: sessionTags,
          createdAt: newsSession.createdAt || now,
          updatedAt: newsSession.updatedAt || now,
          lastAccessTime: newsSession.lastAccessTime || now,
          messages: messagesForBackend,
        };
        
        await saveSessionApi(payload, state.auth.token);
        logger.info("news session saved to backend", { id: finalSessionId });
      } catch (error) {
        logger.error("auto save news session failed", error);
      }
      
      // 切换到会话标签页并打开新创建的会话
      await setBottomTab("sessions", { persist: false });
      navigateToChat(finalSessionId);
      
      // 显示成功通知
      const newsItems = filteredNews ? filteredNews.filter(item => item.fromNews !== true) : [];
      const notificationMsg = newsItems.length > 0 
        ? `已创建新会话（已包含 ${newsItems.length} 条新闻的信息）`
        : '已创建新会话';
      showToast(notificationMsg, 'success');
      
      return finalSessionId;
    } catch (error) {
      logger.error("create news session failed", error);
      showToast('创建新闻会话失败：' + (error.message || '未知错误'));
      throw error;
    }
  };

  const deleteOne = async (key) => {
    if (!key) {
      showToast('会话Key不能为空');
      return;
    }

    // 确认删除
    if (!confirm('确定要删除这个会话吗？删除后无法恢复。')) {
      return;
    }

    try {
      // 调用后端 API 删除会话
      const result = await deleteSessionApi(key, state.auth.token);
      const message = result.message || '会话删除成功';

      // 在删除会话之前，先获取会话的 URL，用于更新对应新闻的状态
      const deletedSession = state.sessions.find((s) => String(s.key) === String(key));
      const sessionUrl = deletedSession?.url;

      // 从本地状态中删除会话
      state.sessions = state.sessions.filter((x) => String(x.key) !== String(key));

      // 如果会话有 URL，清除对应新闻的 sessionKey 和 isRead 状态
      if (sessionUrl) {
        state.news.items.forEach((newsItem) => {
          if (newsItem.link === sessionUrl) {
            // 清除 sessionKey 和 isRead 状态
            delete newsItem.sessionKey;
            newsItem.isRead = false;
          }
        });
      }

      // 如果当前正在查看被删除的会话，则返回到列表页面
      if (state.activeSessionKey === key) {
        navigateToList();
      }

      // 重新渲染列表
      renderList();
      
      // 如果当前在新闻页面，重新渲染新闻列表
      if (state.bottomTab === "news") {
        renderNews();
      }

      // 显示成功消息
      showToast(message);

      // 将删除成功的消息存储到 localStorage，以便刷新页面后也能显示
      try {
        localStorage.setItem(STORAGE_KEYS.DELETE_SUCCESS, JSON.stringify({
          message: message,
          timestamp: Date.now()
        }));
      } catch (e) {
        // ignore localStorage errors
      }
    } catch (error) {
      logger.error("delete session failed", error);
      showToast('删除会话失败：' + (error.message || '未知错误'));
    }
  };

  const kv = (k, v) => `<div class="kv"><div class="kv__k">${escapeHtml(k)}</div><div class="kv__v">${escapeHtml(v)}</div></div>`;

  const removeChip = (key, tagValue) => {
    if (key === "q") state.q = "";
    if (key === "date") {
      // 统一走 setSelectedDate，确保会话/新闻联动一致
      setSelectedDate("", { syncPicker: true, render: false });
    }
    if (key.startsWith("tag_")) {
      // 从selectedTags中移除对应的标签
      if (tagValue) {
        state.filter.selectedTags = state.filter.selectedTags.filter((t) => t !== tagValue);
      } else {
        // 如果没有传入tagValue，尝试从key中提取
        const extractedTag = key.replace("tag_", "");
        state.filter.selectedTags = state.filter.selectedTags.filter((t) => t !== extractedTag);
      }
    }
    dom.q.value = state.q;
    if (state.bottomTab === "news") renderNews();
    else renderList();
  };

  const removeNewsChip = (key, tagValue) => {
    if (key === "q") state.news.q = "";
    if (key.startsWith("tag_")) {
      // 从selectedTags中移除对应的标签
      if (tagValue) {
        state.news.filter.selectedTags = state.news.filter.selectedTags.filter((t) => t !== tagValue);
      } else {
        // 如果没有传入tagValue，尝试从key中提取
        const extractedTag = key.replace("tag_", "");
        state.news.filter.selectedTags = state.news.filter.selectedTags.filter((t) => t !== extractedTag);
      }
    }
    if (dom.newsQ) dom.newsQ.value = state.news.q;
    renderNews();
  };

  // ---------- Date picker presentation ----------
  const DATE_EMPTY_LABEL = "全部日期";

  // 原生 input[type="date"] 在为空时很多浏览器会强制显示 yyyy/mm/dd 之类的系统占位。
  // 这里用"空值时切为 text + placeholder"的方式，实现"全部日期"的展示。
  const syncDatePickerUI = () => {
    if (!dom.datePicker) return;
    const hasDate = !!state.selectedDate;
    if (hasDate) {
      if (dom.datePicker.type !== "date") dom.datePicker.type = "date";
      dom.datePicker.placeholder = "";
      dom.datePicker.value = state.selectedDate;
    } else {
      if (dom.datePicker.type !== "text") dom.datePicker.type = "text";
      dom.datePicker.value = "";
      dom.datePicker.placeholder = DATE_EMPTY_LABEL;
      // 避免某些输入法弹键盘（点击会触发打开日期选择器）
      dom.datePicker.setAttribute("inputmode", "none");
    }
  };

  const setSelectedDate = (ymd, { syncPicker = true, render = true } = {}) => {
    state.selectedDate = isValidYMD(ymd) ? ymd : "";
    if (syncPicker) syncDatePickerUI();
    if (!render) return;

    // 按当前底部 tab 做一致的联动：
    // - 会话：本地按日期过滤并重绘
    // - 新闻：按日期请求接口并重绘（日期变化应立即生效）
    if (state.bottomTab === "news") {
      renderNews();
      fetchNews({ force: true });
    } else {
      renderList();
    }
  };


  // ---------- Refresh helpers ----------
  const refreshSessions = async () => {
    // 刷新会话列表接口数据
    state.lastError = "";
    renderList();
    await fetchSessions({ force: true });
    // 按当前视图刷新 UI
    if (state.view === "chat") return chat.renderChat();
    return renderList();
  };

  const refreshNews = async () => {
    return fetchNews({ force: true });
  };

  const refreshFaq = async () => {
    return fetchFaqs({ force: true });
  };

  // ---------- Manual refresh（替代下拉刷新） ----------
  let manualRefreshing = false;
  const manualRefresh = async () => {
    if (manualRefreshing) return;
    manualRefreshing = true;
    try {
      // 更新日志弹层打开时：刷新更新日志
      if (dom.changelogSheet?.classList.contains("is-open")) {
        await refreshChangelog({ force: true });
        return;
      }
      // 优先：FAQ 弹层打开时刷新 FAQ
      if (dom.faqSheet?.classList.contains("is-open")) {
        await refreshFaq();
        return;
      }
      // 其次：当前底部 tab
      if (state.bottomTab === "news") {
        await refreshNews();
        return;
      }
      await refreshSessions();
    } finally {
      manualRefreshing = false;
    }
  };

  const onAction = async (el, action, ev) => {
    if (!action) return;
    if (action === "noop") return;
    if (action === "inlineToggleTag") {
      const tag = el.dataset.tag;
      if (tag) return inlineToggleTag(tag);
    }
    if (action === "inlineToggleNewsTag") {
      const tag = el.dataset.tag;
      if (tag) return inlineToggleNewsTag(tag);
    }
    if (action === "openFaq") return openFaq();
    if (action === "openChangelog") return openChangelog();
    if (action === "openUrl") return openUrl();
    if (action === "openContext") return pageContext.openContext();
    if (action === "openPageDescription") return pageContext.openPageDescription();
    if (action === "openAuth") return openAuth();
    if (action === "clearCacheAndRefresh") return clearCacheAndRefresh();
    if (action === "closeFaq") return closeFaq();
    if (action === "closeChangelog") return closeChangelog();
    if (action === "closeContext") return pageContext.closeContext();
    if (action === "closePageDescription") return pageContext.closePageDescription();
    if (action === "toggleSort") return toggleSort();
    if (action === "toggleNewsSort") return toggleNewsSort();
    if (action === "manualRefresh") return manualRefresh();
    if (action === "refreshFaq") return refreshFaq();
    if (action === "refreshChangelog") return refreshChangelog({ force: true });
    if (action === "refreshSessions") return refreshSessions();
    if (action === "insertFaq") {
      const t = el.dataset.faqText;
      return appendFaqToSessionAndSave(t);
    }
    if (action === "optimizePageContext") return pageContext.optimizePageContext();
    if (action === "translatePageContextZh") return pageContext.translatePageContext("zh");
    if (action === "translatePageContextEn") return pageContext.translatePageContext("en");
    if (action === "savePageContext") return pageContext.savePageContext();
    if (action === "toggleContextMode") return pageContext.toggleContextMode();
    if (action === "generatePageDescription") return pageContext.generatePageDescription();
    if (action === "translatePageDescriptionZh") return pageContext.translatePageDescription("zh");
    if (action === "translatePageDescriptionEn") return pageContext.translatePageDescription("en");
    if (action === "savePageDescription") return pageContext.savePageDescription();
    if (action === "togglePageDescMode") return pageContext.togglePageDescMode();
    if (action === "switchBottomTab") {
      const tab = el.dataset.tab || "sessions";
      return setBottomTab(tab);
    }
    if (action === "refreshNews") {
      return refreshNews();
    }
    if (action === "retryNews") {
      return refreshNews();
    }
    // 新建会话功能已移除
    // if (action === "createNewSession") {
    //   return createBlankSession();
    // }
    // if (action === "createNewsSession") {
    //   return createNewsSession();
    // }
    if (action === "removeChip") {
      const chipKey = el.dataset.key;
      const tagValue = el.dataset.tagValue;
      return removeChip(chipKey, tagValue);
    }
    if (action === "removeNewsChip") {
      const chipKey = el.dataset.key;
      const tagValue = el.dataset.tagValue;
      return removeNewsChip(chipKey, tagValue);
    }
    if (action === "deleteSession") {
      // 删除当前会话
      if (state.activeSessionKey) {
        return deleteOne(state.activeSessionKey);
      } else {
        showToast('找不到当前会话');
        return;
      }
    }

    if (action === "toggleFavorite") {
      // 切换收藏状态
      ev?.preventDefault?.();
      ev?.stopPropagation?.();
      const sessionKey = el.dataset.key;
      if (sessionKey) {
        // 收起滑动状态
        const wrapper = el.closest('.swipe-item-wrapper');
        if (wrapper) {
          wrapper.classList.remove('is-swiped');
          const item = wrapper.querySelector('.item');
          if (item) {
            item.style.transform = '';
          }
        }
        return toggleFavorite(sessionKey);
      }
    }

    if (action === "toggleNewsFavorite") {
      // 切换新闻收藏状态
      ev?.preventDefault?.();
      ev?.stopPropagation?.();
      const newsKey = el.dataset.key;
      if (newsKey) {
        // 收起滑动状态
        const wrapper = el.closest('.swipe-item-wrapper');
        if (wrapper) {
          wrapper.classList.remove('is-swiped');
          const item = wrapper.querySelector('.newsItem');
          if (item) {
            item.style.transform = '';
          }
        }
        return toggleNewsFavorite(newsKey);
      }
    }

    if (action === "swipeDelete") {
      // 左滑删除会话
      ev?.preventDefault?.();
      ev?.stopPropagation?.();
      const sessionKey = el.dataset.key;
      if (sessionKey) {
        // 收起滑动状态
        const wrapper = el.closest('.swipe-item-wrapper');
        if (wrapper) {
          wrapper.classList.remove('is-swiped');
          const item = wrapper.querySelector('.item');
          if (item) {
            item.style.transform = '';
          }
        }
        return deleteOne(sessionKey);
      }
    }


    if (action === "clearChatMessages") {
      if (state.view === "chat") {
        const s = findSessionByKey(state.activeSessionKey);
        if (!s) {
          showToast("找不到当前会话");
          return;
        }
        if (!confirm("确定要清空该会话的聊天内容吗？")) return;
        s.messages = [];
        s.messageCount = 0;
        s.preview = "";
        s.updatedAt = Date.now();
        s.lastAccessTime = Date.now();
        s.lastActiveAt = Date.now();
        try {
          await chat.persistSessionMessages(s);
        } catch (error) {
          logger.error("clear chat messages failed", error);
        }
        chat.renderChat();
        chat.scrollChatToBottom(false, true);
        return;
      }
      if (state.view === "newsChat" && state.activeNewsKey) {
        if (!confirm("确定要清空该新闻的聊天内容吗？")) return;
        state.news.chatMessages[state.activeNewsKey] = [];
        chat.renderNewsChat();
        chat.scrollChatToBottom(false, true);
        return;
      }
      showToast("当前不在聊天页面");
      return;
    }

  };

  const wire = () => {
    // date picker
    const ensureDateType = () => {
      if (dom.datePicker.type !== "date") dom.datePicker.type = "date";
      // type 切换可能重置 value，这里按状态再同步一次
      dom.datePicker.value = state.selectedDate || "";
    };

    const openNativeDatePicker = ({ fromInputClick = false } = {}) => {
      const wasNotDate = dom.datePicker.type !== "date";
      ensureDateType();
      // showPicker: Chrome/Edge 等支持；iOS/部分 WebView 可能没有
      if (typeof dom.datePicker.showPicker === "function") {
        dom.datePicker.showPicker();
        return;
      }
      dom.datePicker.focus();
      // 对于不支持 showPicker 的浏览器，尝试触发点击
      // 注意：如果本来就是 input 自己的 click 事件里触发，再 click() 可能递归
      if (!fromInputClick) {
        dom.datePicker.click();
        return;
      }
      // 但如果是从 text 切换为 date 后的"首次点击"，默认行为未必会打开日期面板；
      // 这里延迟触发一次 click，让浏览器按 date 类型走默认打开逻辑，同时避免递归。
      if (wasNotDate) {
        setTimeout(() => {
          try {
            dom.datePicker.click();
          } catch {
            // ignore
          }
        }, 0);
      }
    };

    // 点到"日期区域"也能弹出（避免小屏被遮挡/点不到 input）
    dom.dateNav?.addEventListener("click", (e) => {
      if (e.target === dom.datePicker) return;
      e.preventDefault();
      e.stopPropagation();
      openNativeDatePicker();
    });
    dom.datePicker.addEventListener("click", (e) => {
      e.stopPropagation();
      openNativeDatePicker({ fromInputClick: true });
    });

    // 同时监听 change 和 input 事件，确保兼容性
    const handleDateChange = () => {
      const value = String(dom.datePicker.value || "").trim();
      // 允许清空日期（value 为空字符串时也更新状态）
      // 具体刷新逻辑交给 setSelectedDate 统一处理，避免入口分散导致交互不一致
      setSelectedDate(isValidYMD(value) ? value : "");
    };
    dom.datePicker.addEventListener("change", handleDateChange);
    dom.datePicker.addEventListener("input", handleDateChange);
    // 某些移动浏览器可能需要 blur 事件
    dom.datePicker.addEventListener("blur", handleDateChange);
    
    dom.prevDay?.addEventListener("click", () => {
      const next = dateUtil.addDaysYMD(state.selectedDate || dateUtil.todayYMD(), -1);
      setSelectedDate(next);
    });
    dom.nextDay?.addEventListener("click", () => {
      const next = dateUtil.addDaysYMD(state.selectedDate || dateUtil.todayYMD(), 1);
      setSelectedDate(next);
    });

    Search.init({
      onSessionsQueryChange: (value) => {
        state.q = value;
        renderList();
      },
      onSessionsClear: () => {
        state.q = "";
        renderList();
      },
      onNewsQueryChange: (value) => {
        state.news.q = value;
        renderNews();
      },
      onNewsClear: () => {
        state.news.q = "";
        renderNews();
      },
    });

    // tabs
    $$(".seg__btn").forEach((b) => {
      b.addEventListener("click", () => {
        $$(".seg__btn").forEach((x) => {
          x.classList.remove("is-active");
          x.setAttribute("aria-selected", "false");
          x.setAttribute("tabindex", "-1");
        });
        b.classList.add("is-active");
        b.setAttribute("aria-selected", "true");
        b.setAttribute("tabindex", "0");
        state.tab = b.dataset.tab || "all";
        renderList();
      });
    });

    // global action delegation
    document.addEventListener("click", (ev) => {
      const el = ev.target.closest("[data-action]");
      if (!el) return;
      const action = el.dataset.action;
      // 防止一些按钮触发 item 的 :active 手感问题
      onAction(el, action, ev);
    });

    // 图片预览（点击放大 / 长按保存）
    Preview.init();

    // 会话列表滑动控制
    const sessionSwipe = new SwipeScrollController(dom.list, {
      itemSelector: '.item',
      wrapperSelector: '.swipe-item-wrapper',
      deleteButtonWidth: 160,
      resetScope: 'document',
    });
    sessionSwipe.mount();

    // 点击会话进入聊天（需要排除删除按钮和收藏按钮）
    dom.list?.addEventListener("click", (ev) => {
      // 如果点击的是删除按钮或收藏按钮，不处理
      if (ev.target.closest('.swipe-item__delete') || ev.target.closest('.swipe-item__favorite')) {
        return;
      }
      
      const item = ev.target.closest(".item");
      if (!item) return;
      const key = item.dataset.key;
      if (!key) return;
      
      // 如果当前项是滑动状态，先收起再进入聊天
      const wrapper = item.closest('.swipe-item-wrapper');
      if (wrapper && wrapper.classList.contains('is-swiped')) {
        wrapper.classList.remove('is-swiped');
        item.style.transform = '';
        return;
      }
      
      navigateToChat(key);
    });

    // 新闻列表滑动控制
    const newsSwipe = new SwipeScrollController(dom.newsList, {
      itemSelector: '.newsItem',
      wrapperSelector: '.swipe-item-wrapper',
      deleteButtonWidth: 80,
      resetScope: 'container',
    });
    newsSwipe.mount();

    // 新闻点击事件：标记为已读
    dom.newsList?.addEventListener("click", (ev) => {
      // 如果点击的是收藏按钮，不处理
      if (ev.target.closest('.swipe-item__favorite')) {
        return;
      }
      
      // 查找被点击的新闻项（排除会话项）
      const newsItem = ev.target.closest(".newsItem");
      if (!newsItem || newsItem.classList.contains("newsItem--session")) return;
      
      // 如果当前项是滑动状态，先收起
      const wrapper = newsItem.closest('.swipe-item-wrapper');
      if (wrapper && wrapper.classList.contains('is-swiped')) {
        wrapper.classList.remove('is-swiped');
        newsItem.style.transform = '';
        return;
      }
      
      const newsKey = newsItem.dataset.key;
      if (!newsKey) return;
      
      // 检查是否已经标记为已读，避免重复处理
      const item = state.news.items.find(n => String(n.key) === String(newsKey));
      if (item && item.isRead) return; // 已经标记为已读，无需重复处理
      
      // 标记为已读
      markNewsAsRead(newsKey);
      
      // 更新state中的新闻项
      if (item) {
        item.isRead = true;
      }
      
      // 更新UI：添加已读类，移除未读点
      newsItem.classList.add("is-read");
      const dot = newsItem.querySelector(".newsItem__dot");
      if (dot) dot.remove();
    });

    const isAbortError = (e) => {
      try {
        if (!e) return false;
        if (e.name === "AbortError") return true;
        const msg = typeof e.message === "string" ? e.message : "";
        return msg.toLowerCase().includes("aborted");
      } catch {
        return false;
      }
    };

    const truncateText = (v, maxLen) => {
      const s = String(v ?? "");
      const limit = Math.max(0, Number(maxLen) || 0);
      if (!limit || s.length <= limit) return s;
      return `${s.slice(0, limit)}\n\n...(内容已截断)`;
    };

    const buildChatHistoryText = (messages, endIndexExclusive) => {
      const list = Array.isArray(messages) ? messages : [];
      const end = Number(endIndexExclusive);
      const upto = Number.isFinite(end) ? Math.max(0, Math.min(list.length, end)) : list.length;
      return list
        .slice(0, upto)
        .filter((m) => m && String(normalizeText(m) || "").trim())
        .slice(-30)
        .map((m) => {
          const role = normalizeRole(m) === "user" ? "用户" : "助手";
          return `${role}：${String(normalizeText(m) || "").trim()}`;
        })
        .join("\n\n");
    };

    const buildSessionChatUserPrompt = ({ text, session, historyText }) => {
      const parts = [];
      const ctx = String(session?.pageContent || "").trim();
      const hist = String(historyText || "").trim();
      if (ctx) parts.push(`## 页面上下文\n\n${truncateText(ctx, 12000)}`);
      if (hist) parts.push(`## 会话历史\n\n${truncateText(hist, 12000)}`);
      parts.push(`## 当前消息\n\n${truncateText(String(text || "").trim() || "请继续。", 8000)}`);
      return parts.join("\n\n");
    };

    const buildNewsChatUserPrompt = ({ text, news, historyText }) => {
      const parts = [];
      const title = String(news?.title || "").trim();
      const desc = String(news?.description || "").trim();
      if (title) parts.push(`## 新闻标题\n\n${truncateText(title, 2000)}`);
      if (desc) parts.push(`## 新闻描述\n\n${truncateText(desc, 12000)}`);
      const hist = String(historyText || "").trim();
      if (hist) parts.push(`## 会话历史\n\n${truncateText(hist, 12000)}`);
      parts.push(`## 当前消息\n\n${truncateText(String(text || "").trim() || "请继续。", 8000)}`);
      return parts.join("\n\n");
    };

    const getChatSendBtn = () => dom.chatComposer?.querySelector(".chatComposer__btn--send");

    const autosizeChatInput = () => {
      const el = dom.chatInput;
      if (!el) return;
      const maxHeight = 180;
      const minHeight = 60;
      el.style.height = "auto";
      const next = Math.max(minHeight, Math.min(el.scrollHeight, maxHeight));
      el.style.height = `${next}px`;
      el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
    };

    const updateComposerSendState = () => {
      const sendBtn = getChatSendBtn();
      if (!sendBtn) return;
      if (state.chatUi.sending) {
        sendBtn.disabled = false;
        sendBtn.classList.add("is-sending");
        return;
      }
      sendBtn.classList.remove("is-sending");
      const text = String(dom.chatInput?.value ?? "").trim();
      sendBtn.disabled = !text;
    };

    const setComposerSending = (sending, controller) => {
      state.chatUi.sending = !!sending;
      state.chatUi.abortController = controller || null;
      const sendBtn = dom.chatComposer?.querySelector(".chatComposer__btn--send");
      if (sendBtn) {
        if (!sendBtn.dataset.originalText) sendBtn.dataset.originalText = sendBtn.textContent || "发送";
        sendBtn.textContent = sending ? "停止" : sendBtn.dataset.originalText;
        sendBtn.classList.toggle('is-sending', sending);
      }
      if (dom.chatInput) dom.chatInput.disabled = !!sending;
      updateComposerSendState();
    };

    const applyStreamingDomUpdate = (msgIndex, content, { streaming, aborted, error } = {}) => {
      const container = dom.chatMessages;
      if (!container) return;
      const msgDiv = container.querySelector(`.pet-chat-message[data-message-index="${msgIndex}"]`);
      if (!msgDiv) return;

      if (typeof streaming === "boolean") msgDiv.classList.toggle("is-streaming", streaming);
      if (typeof aborted === "boolean") msgDiv.classList.toggle("is-aborted", aborted);
      if (typeof error === "boolean") msgDiv.classList.toggle("is-error", error);

      const bubble = msgDiv.querySelector(".pet-chat-bubble");
      if (!bubble) return;

      const hasText = !!String(content || "").trim();
      const typing = bubble.querySelector(".pet-chat-typing");
      let contentEl = bubble.querySelector(".pet-chat-content");

      if (!hasText) {
        if (streaming) {
          if (!typing && contentEl) {
            contentEl.outerHTML = `<div class="pet-chat-typing" aria-label="生成中">...</div>`;
          } else if (!typing && !contentEl) {
            bubble.insertAdjacentHTML("afterbegin", `<div class="pet-chat-typing" aria-label="生成中">...</div>`);
          }
        }
        return;
      }

      const html = renderMarkdown(String(content || ""));
      if (contentEl) {
        contentEl.innerHTML = html;
      } else if (typing) {
        typing.outerHTML = `<div class="pet-chat-content md-preview-body">${html}</div>`;
      } else {
        bubble.insertAdjacentHTML("afterbegin", `<div class="pet-chat-content md-preview-body">${html}</div>`);
      }

      // 当流式完成时（streaming 为 false），自动渲染 Mermaid
      if (streaming === false) {
        // 使用 setTimeout 确保 DOM 更新完成后再渲染
        setTimeout(() => {
          renderMermaidIn(container);
        }, 0);
      }
    };

    // 发送消息
    dom.chatComposer?.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      if (state.chatUi.sending) {
        try {
          state.chatUi.abortController?.abort();
        } catch {
          // ignore
        }
        return;
      }

      const text = String(dom.chatInput?.value ?? "").trim();
      if (!text) return;

      const sendSession = async (s) => {
        if (!s) return;
        if (!Array.isArray(s.messages)) s.messages = [];

        const prevMessages = s.messages.slice();
        const now = Date.now();
        const userMessage = { role: "user", content: text, ts: now };
        const aiMessage = { role: "assistant", content: "", ts: now + 1, streaming: true };

        s.messages.push(userMessage, aiMessage);
        s.messageCount = s.messages.length;
        s.lastActiveAt = now;
        s.lastAccessTime = now;
        s.updatedAt = now;
        s.preview = text;

        dom.chatInput.value = "";
        autosizeChatInput();
        updateComposerSendState();
        chat.initChatComponent();
        chat.appendMessage(userMessage, s.messages.length - 2, s.messages.length);
        chat.appendMessage(aiMessage, s.messages.length - 1, s.messages.length);
        chat.scrollChatToBottom(false, true);

        // 在发送消息前，尝试获取页面上下文内容
        if (!s.pageContent || String(s.pageContent).trim() === "") {
          try {
            const pageContent = await fetchSessionPageContentApi(s, state.auth.token);
            if (pageContent && String(pageContent).trim()) {
              s.pageContent = String(pageContent).trim();
            }
          } catch (e) {
            logger.warn("read-file failed", e);
            // 即使获取失败也继续发送消息
          }
        }

        const systemPrompt = "你是一个专业、简洁且可靠的 AI 助手。";
        const historyText = buildChatHistoryText(prevMessages, prevMessages.length);
        const userPrompt = buildSessionChatUserPrompt({ text, session: s, historyText });

        const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
        setComposerSending(true, controller);
        state.chatUi.streamingTarget = { view: "chat", key: String(s.key || state.activeSessionKey || ""), index: s.messages.length - 1 };

        let raf = 0;
        let lastFull = "";
        const msgIndex = s.messages.length - 1;
        const onChunk = (_chunk, full) => {
          lastFull = String(full || "");
          if (raf) return;
          raf = requestAnimationFrame(() => {
            raf = 0;
            aiMessage.content = lastFull;
            applyStreamingDomUpdate(msgIndex, aiMessage.content, { streaming: true, aborted: false, error: false });
            if (chat.chatComponent) chat.chatComponent.scrollToBottom(false, true);
          });
        };

        try {
          const finalText = await streamPromptApi(
            systemPrompt,
            userPrompt,
            DEFAULT_MODEL,
            state.activeSessionKey,
            state.auth.token,
            controller ? controller.signal : undefined,
            onChunk
          );
          aiMessage.content = String(finalText || "").trim();
          aiMessage.streaming = false;
          applyStreamingDomUpdate(msgIndex, aiMessage.content, { streaming: false, aborted: false, error: false });
          // mermaid 渲染已在 applyStreamingDomUpdate 中自动处理
        } catch (e) {
          aiMessage.streaming = false;
          if (isAbortError(e)) {
            aiMessage.aborted = true;
            if (!String(aiMessage.content || "").trim()) aiMessage.content = "已停止";
            applyStreamingDomUpdate(msgIndex, aiMessage.content, { streaming: false, aborted: true, error: false });
          } else {
            aiMessage.error = true;
            const msg = String(e?.message || "请求失败").trim();
            aiMessage.content = String(aiMessage.content || "").trim() || `请求失败：${msg}`;
            applyStreamingDomUpdate(msgIndex, aiMessage.content, { streaming: false, aborted: false, error: true });
          }
        } finally {
          setComposerSending(false, null);
          state.chatUi.streamingTarget = null;
          try {
            await chat.persistSessionMessages(s);
          } catch (e) {
            logger.warn("session/save failed", e);
          }
        }
      };

      const sendNews = async (newsKey) => {
        const key = String(newsKey || "").trim();
        if (!key) return;
        const n = findNewsByKey(key);
        if (!n) return;

        if (!Array.isArray(state.news.chatMessages[key])) state.news.chatMessages[key] = [];
        const msgs = state.news.chatMessages[key];
        const prevMessages = msgs.slice();

        const now = Date.now();
        const userMessage = { role: "user", content: text, ts: now };
        const aiMessage = { role: "assistant", content: "", ts: now + 1, streaming: true };
        msgs.push(userMessage, aiMessage);

        dom.chatInput.value = "";
        autosizeChatInput();
        updateComposerSendState();
        chat.initChatComponent();
        chat.appendMessage(userMessage, msgs.length - 2, msgs.length);
        chat.appendMessage(aiMessage, msgs.length - 1, msgs.length);
        chat.scrollChatToBottom(false, true);

        const systemPrompt = "你是一个专业、简洁且可靠的 AI 助手。";
        const historyText = buildChatHistoryText(prevMessages, prevMessages.length);
        const userPrompt = buildNewsChatUserPrompt({ text, news: n, historyText });

        const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
        setComposerSending(true, controller);
        state.chatUi.streamingTarget = { view: "newsChat", key, index: msgs.length - 1 };

        let raf = 0;
        let lastFull = "";
        const msgIndex = msgs.length - 1;
        const onChunk = (_chunk, full) => {
          lastFull = String(full || "");
          if (raf) return;
          raf = requestAnimationFrame(() => {
            raf = 0;
            aiMessage.content = lastFull;
            applyStreamingDomUpdate(msgIndex, aiMessage.content, { streaming: true, aborted: false, error: false });
            if (chat.chatComponent) chat.chatComponent.scrollToBottom(false, true);
          });
        };

        try {
          const finalText = await streamPromptApi(
            systemPrompt,
            userPrompt,
            DEFAULT_MODEL,
            `news:${key}`,
            state.auth.token,
            controller ? controller.signal : undefined,
            onChunk
          );
          aiMessage.content = String(finalText || "").trim();
          aiMessage.streaming = false;
          applyStreamingDomUpdate(msgIndex, aiMessage.content, { streaming: false, aborted: false, error: false });
          // mermaid 渲染已在 applyStreamingDomUpdate 中自动处理
        } catch (e) {
          aiMessage.streaming = false;
          if (isAbortError(e)) {
            aiMessage.aborted = true;
            if (!String(aiMessage.content || "").trim()) aiMessage.content = "已停止";
            applyStreamingDomUpdate(msgIndex, aiMessage.content, { streaming: false, aborted: true, error: false });
          } else {
            aiMessage.error = true;
            const msg = String(e?.message || "请求失败").trim();
            aiMessage.content = String(aiMessage.content || "").trim() || `请求失败：${msg}`;
            applyStreamingDomUpdate(msgIndex, aiMessage.content, { streaming: false, aborted: false, error: true });
          }
        } finally {
          setComposerSending(false, null);
          state.chatUi.streamingTarget = null;
        }
      };

      if (state.view === "newsChat" && state.activeNewsKey) {
        await sendNews(state.activeNewsKey);
        return;
      }

      const s = findSessionByKey(state.activeSessionKey);
      await sendSession(s);
    });

    let chatInputComposing = false;
    dom.chatInput?.addEventListener("compositionstart", () => {
      chatInputComposing = true;
    });
    dom.chatInput?.addEventListener("compositionend", () => {
      chatInputComposing = false;
    });
    dom.chatInput?.addEventListener("input", () => {
      autosizeChatInput();
      updateComposerSendState();
    });
    autosizeChatInput();
    updateComposerSendState();
    dom.chatInput?.addEventListener("keydown", (ev) => {
      if (ev.key !== "Enter") return;
      if (ev.shiftKey) return;
      if (chatInputComposing) return;
      ev.preventDefault();
      if (!dom.chatComposer) return;
      if (typeof dom.chatComposer.requestSubmit === "function") {
        dom.chatComposer.requestSubmit();
      } else {
        dom.chatComposer.dispatchEvent(new Event("submit", { cancelable: true }));
      }
    });

    // masks
    dom.faqSheetMask?.addEventListener("click", closeFaq);
    dom.changelogSheetMask?.addEventListener("click", closeChangelog);
    dom.contextSheetMask?.addEventListener("click", pageContext.closeContext);
    dom.pageDescSheetMask?.addEventListener("click", pageContext.closePageDescription);

    // mobile: prevent overscroll glow inside sheets
    ["faqSheet", "changelogSheet", "contextSheet", "pageDescSheet"].forEach((k) => {
      const el = dom[k];
      el?.addEventListener("touchmove", (e) => e.stopPropagation(), { passive: true });
    });

    // VirtualList already binds its own container.scroll and window.scroll/resize
    // listeners, so no redundant listeners are needed here.
  };

  chat = createChat({
    dom,
    Chat,
    findSessionByKey,
    findNewsByKey,
    normalizeRole,
    normalizeText,
    logger,
    showToast,
    callPromptApi,
    callPromptOnce,
    saveSessionApi,
    renderList,
    isNearBottom,
    preserveScrollPosition,
    DEFAULT_MODEL,
  });

  const pageContext = createPageContext({
    callPromptApi,
    fetchSessionPageContentApi,
    saveSessionApi,
    escapeHtml,
    renderMarkdown,
    renderMermaidIn,
    showToast,
    logger,
    findSessionByKey,
    onSaved: () => chat.renderChat(),
  });
  pageContext.init(dom);

  const init = async () => {
    loadAuthFromStorage();
    setupVisualViewportBottomInset();
    // 恢复折叠展开状态（跨会话/返回仍保留）
    try {
      state.chatUi.foldExpanded = loadChatFoldState();
    } catch {
      state.chatUi.foldExpanded = {};
    }
    // 默认显示全部会话（不设置日期过滤）
    setSelectedDate("", { syncPicker: true, render: false });
    // 默认显示会话视图（不读取 localStorage，始终默认会话）
    state.bottomTab = "sessions";
    // 确保初始状态是列表页（不显示回退按钮）
    setView("list");
    wire();
    const initialRoute = parseRoute();
    const shouldFetchSessions = !(initialRoute.name === "chat" && initialRoute.key);
    if (shouldFetchSessions) {
      await fetchSessions({ force: false });
    }
    // 初次渲染由路由决定
    await setBottomTab("sessions", { persist: false });
    
    // 检查并显示删除成功的消息（如果存在）
    // 延迟显示，确保页面已经渲染完成
    setTimeout(() => {
      try {
        const deleteSuccessData = localStorage.getItem(STORAGE_KEYS.DELETE_SUCCESS);
        if (deleteSuccessData) {
          const data = JSON.parse(deleteSuccessData);
          // 只显示最近5分钟内的删除成功消息
          if (Date.now() - data.timestamp < 5 * 60 * 1000) {
            showToast(data.message);
          }
          // 清除已显示的消息
          localStorage.removeItem(STORAGE_KEYS.DELETE_SUCCESS);
        }
      } catch (e) {
        // ignore localStorage errors
      }
    }, 500);
    
  };

  window.addEventListener("hashchange", applyRoute);
  init();
})();


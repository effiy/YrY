import { registerGlobalComponent } from '/cdn/utils/view/componentLoader.js';
import { SearchHandler } from '/cdn/utils/browser/events.js';
import { getIconClass } from '/cdn/components/common/icons/iconMap.js';

const compDef = {
  name: 'yrySearchHeader',
  html: '/cdn/components/business/SearchHeader/index.html',
  css: '/cdn/components/business/SearchHeader/index.css',
  props: {
    homeHref: {
      type: String,
      default: '/index.html'
    },
    homeIconClass: {
      type: String,
      default: 'globe'
    },
    homeButtonTitle: {
      type: String,
      default: '首页'
    },
    placeholder: {
      type: String,
      default: '搜索网站、标签或描述...'
    },
    showAuthButton: {
      type: Boolean,
      default: true
    },
    showSidebarToggle: {
      type: Boolean,
      default: false
    },
    sidebarCollapsed: {
      type: Boolean,
      default: false
    },
    modelValue: {
      type: String,
      default: ''
    },
    showAicrButton: {
      type: Boolean,
      default: false
    },
    aicrHref: {
      type: String,
      default: ''
    },
    aicrButtonTitle: {
      type: String,
      default: '代码审查'
    },
    showRssManagerButton: {
      type: Boolean,
      default: false
    },
    showSyncButton: {
      type: Boolean,
      default: false
    },
    showClearCacheButton: {
      type: Boolean,
      default: false
    },
    showSearch: {
      type: Boolean,
      default: true
    },
    sidebarToggleEnabled: {
      type: Boolean,
      default: false
    },
    originalData: {
      type: Array,
      default: () => []
    }
  },
  emits: [
    'update:modelValue',
    'search',
    'clear',
    'toggle-sidebar',
    'open-auth',
    'search-input',
    'search-keydown',
    'composition-start',
    'composition-end',
    'clear-search',
    'open-rss-manager',
    'clear-cache'
  ],
  data() {
    return {
      searchQuery: this.modelValue || '',
      isComposing: false,
      isPanelVisible: false,
      activeIndex: -1,
      searchHandler: null
    };
  },
  computed: {
    resolvedHomeIconClass() {
      const cls = this.homeIconClass;
      if (!cls) return '';
      if (cls.includes(' ')) return getIconClass(cls.split(' ').pop());
      return getIconClass(cls);
    },
    filteredHistory() {
      if (!this.searchHandler) return [];
      return this.searchHandler.filterHistory(this.searchQuery.trim());
    },
    displayItems() {
      return this.filteredHistory;
    }
  },
  watch: {
    modelValue(newVal) {
      if (this.searchQuery !== newVal) {
        this.searchQuery = newVal || '';
      }
    },
    searchQuery(newVal) {
      this.$emit('update:modelValue', newVal);
    }
  },
  methods: {
    goHome() {
      if (this.homeHref) {
        if (/^https?:\/\//.test(this.homeHref)) {
          window.open(this.homeHref, '_blank', 'noopener,noreferrer');
        } else {
          window.location.href = this.homeHref;
        }
      }
    },
    openAuth() {
      this.$emit('open-auth');
      if (typeof window.openAuth === 'function') {
        window.openAuth();
      }
    },
    toggleSidebar() {
      this.$emit('toggle-sidebar');
    },
    handleInput(event) {
      this.$emit('search-input', event);
      if (this.searchHandler && this.searchHandler.searchHistory.length) {
        this.isPanelVisible = true;
        this.activeIndex = -1;
      }
    },
    handleFocus() {
      if (this.searchHandler && this.searchHandler.searchHistory.length) {
        this.isPanelVisible = true;
        this.activeIndex = -1;
      }
    },
    handleBlur() {
      this.activeIndex = -1;
      setTimeout(() => {
        this.isPanelVisible = false;
      }, 200);
    },
    handleKeydown(event) {
      this.$emit('search-keydown', event);
      if (!this.searchHandler) return;

      if (this.isPanelVisible && this.displayItems.length) {
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
          event.preventDefault();
          const direction = event.key === 'ArrowUp' ? -1 : 1;
          const count = this.displayItems.length;
          this.activeIndex = ((this.activeIndex + direction) % count + count) % count;
          return;
        }
        if (event.key === 'Enter' && this.activeIndex >= 0 && !this.isComposing) {
          event.preventDefault();
          this.selectItem(this.displayItems[this.activeIndex]);
          return;
        }
      }

      if (event.key === 'Enter' && !this.isComposing) {
        const query = this.searchQuery.trim();
        if (query) {
          this.searchHandler.addToHistory(query);
          this.isPanelVisible = false;
          this.activeIndex = -1;
          this.$emit('search', query);
        }
      }
    },
    clearSearch() {
      this.searchQuery = '';
      this.isPanelVisible = false;
      this.activeIndex = -1;
      this.$emit('clear');
      this.$emit('clear-search');
      if (this.$refs.searchInput) {
        this.$refs.searchInput.focus();
      }
    },
    selectItem(item) {
      this.searchQuery = item;
      this.isPanelVisible = false;
      this.activeIndex = -1;
      this.$emit('search', item);
      if (this.$refs.searchInput) {
        this.$refs.searchInput.focus();
      }
    },
    deleteItem(item) {
      if (!this.searchHandler) return;
      this.searchHandler.removeHistoryItem(item);
      if (this.activeIndex >= this.displayItems.length) {
        this.activeIndex = this.displayItems.length - 1;
      }
      if (!this.displayItems.length) {
        this.isPanelVisible = false;
      }
    },
    clearAllHistory() {
      if (!this.searchHandler) return;
      this.searchHandler.clearHistory();
      this.isPanelVisible = false;
      this.activeIndex = -1;
    },
    escapeHtml(str) {
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    },
    highlightMatch(text) {
      const query = this.searchQuery.trim();
      const safeText = this.escapeHtml(text);
      if (!query) return safeText;
      const escapedQuery = this.escapeHtml(query).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return safeText.replace(new RegExp('(' + escapedQuery + ')', 'gi'), '<mark>$1</mark>');
    },
    handleCompositionStart(event) {
      this.isComposing = true;
      this.$emit('composition-start', event);
    },
    handleCompositionEnd(event) {
      this.isComposing = false;
      this.$emit('composition-end', event);
    }
  },
  mounted() {
    this.$nextTick(() => {
      if (!this.$refs.searchInput) return;
      const handler = new SearchHandler();
      handler.searchInput = this.$refs.searchInput;
      handler.searchCallback = (query) => this.$emit('search', query);
      handler.options = { debounceDelay: 300, minLength: 1 };
      handler.loadSearchHistory();
      this.searchHandler = handler;
    });
  },
  beforeUnmount() {
    if (this.searchHandler) {
      this.searchHandler.onShowPanel = null;
      this.searchHandler.onHidePanel = null;
      this.searchHandler.onActiveIndexChange = null;
      this.searchHandler = null;
    }
  }
};
registerGlobalComponent(compDef);
export default compDef;

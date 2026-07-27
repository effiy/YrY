/**
 * YiPet Chat — SearchBar Component
 */

export interface SearchBarProps {
  searchQuery: string;
  onSearchInput: (e: { target: { value: string } }) => void;
  onClearSearch: () => void;
  onCreateSession: () => void;
}

export function SearchBar(props: SearchBarProps) {
  return (
    <div className="yipet-sidebar-search">
      <div className="yipet-sidebar-search-input-wrap">
        <svg
          className="yipet-sidebar-search-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          className="yipet-sidebar-search-input"
          type="text"
          placeholder="搜索会话..."
          value={props.searchQuery}
          onInput={props.onSearchInput}
          onKeyDown={(e: KeyboardEvent) => { if (e.key === 'Escape') props.onClearSearch(); }}
          aria-label="搜索会话"
        />
        {props.searchQuery
          ? (
            <button
              className="yipet-sidebar-search-clear"
              onClick={props.onClearSearch}
              title="清除搜索"
              aria-label="清除搜索"
            >✕</button>
            )
          : null}
      </div>
      <button
        className="yipet-sidebar-new-btn"
        onClick={props.onCreateSession}
        title="新建会话"
        aria-label="新建会话"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
        </svg>
      </button>
    </div>
  );
}

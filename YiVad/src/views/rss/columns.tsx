import type { ColumnProps } from "@/components/ProTable/interface";
import type { RssItemDocument } from "@/api/modules/rssService";
import { StarFilled, Star } from "@element-plus/icons-vue";

export function createRssColumns(options: {
  t: (key: string, values?: Record<string, any>) => string;
  isRead: (row: RssItemDocument) => boolean;
  isStarred: (row: RssItemDocument) => boolean;
  toggleStar: (row: RssItemDocument) => void;
  openDetail: (row: RssItemDocument) => void;
  toggleRead: (row: RssItemDocument) => void;
  sourceOptions: { label: string; value: string }[];
  categoryOptions: { label: string; value: string }[];
}): ColumnProps<RssItemDocument>[] {
  const { t, isRead, isStarred, toggleStar, openDetail, toggleRead, sourceOptions, categoryOptions } = options;

  return [
    { type: "selection", fixed: "left", width: 48 },
    {
      prop: "starred",
      label: t("rss.items.star"),
      width: 56,
      render: scope => (
        <el-button
          type="warning"
          link
          icon={isStarred(scope.row) ? StarFilled : Star}
          class={{ "rss-star-active": isStarred(scope.row) }}
          onClick={() => toggleStar(scope.row)}
        />
      )
    },
    {
      prop: "title",
      label: t("rss.items.title"),
      search: { el: "input", tooltip: t("rss.items.searchTooltip") },
      minWidth: 280,
      render: scope => (
        <div class="rss-title-cell">
          {!isRead(scope.row) && <span class="rss-unread-dot" title={t("rss.items.unreadTooltip")} />}
          <el-button
            type="primary"
            link
            class={{ "rss-title-unread": !isRead(scope.row) }}
            onClick={() => openDetail(scope.row)}
          >
            {scope.row.title || "(untitled)"}
          </el-button>
        </div>
      )
    },
    {
      prop: "source_name",
      label: t("rss.items.source"),
      enum: sourceOptions,
      search: { el: "select" },
      width: 140
    },
    {
      prop: "category_path",
      label: t("rss.items.category"),
      width: 160,
      enum: categoryOptions,
      search: { el: "select" },
      render: scope => (
        <el-tag size="small" type="info">{scope.row.category_path || "—"}</el-tag>
      )
    },
    {
      prop: "published",
      label: t("rss.items.published"),
      width: 180,
      render: scope => <span class="rss-cell-muted">{scope.row.published || "—"}</span>
    },
    {
      prop: "author",
      label: t("rss.items.author"),
      width: 120,
      render: scope => <span class="rss-cell-muted">{scope.row.author || "—"}</span>
    },
    {
      prop: "updatedTime",
      label: t("rss.items.updated"),
      width: 140,
      render: scope => {
        const ts = scope.row.updatedTime;
        if (!ts) return <span class="rss-cell-muted">—</span>;
        try {
          return <span class="rss-cell-muted">{new Date(ts).toLocaleString()}</span>;
        } catch {
          return <span class="rss-cell-muted">—</span>;
        }
      }
    },
    { prop: "operation", label: t("rss.items.actions"), fixed: "right", width: 260 }
  ];
}
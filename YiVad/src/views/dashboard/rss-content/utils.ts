export function stripHtml(html: string): string {
  return (html || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function formatDate(val?: string): string {
  if (!val) return "";
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return val.slice(0, 10);
    return d.toLocaleDateString();
  } catch {
    return val.slice(0, 10);
  }
}

export function truncateSummary(text: string, max = 160): string {
  const plain = stripHtml(text);
  return plain.length > max ? plain.slice(0, max) + "..." : plain;
}

export function truncateSource(name: string, max = 10): string {
  if (!name) return "—";
  return name.length > max ? name.slice(0, max) + "…" : name;
}

export function categoryLeaf(path: string): string {
  return path.split("/").pop() || path;
}

import type { RssItemDocument } from "@/api/modules/rssService";

export function buildFallbackContent(row: RssItemDocument): string {
  const summary = stripHtml(row.summary || "");
  const parts: string[] = [];
  parts.push(`# ${row.title || "Untitled"}`);
  parts.push("");

  parts.push("| Field | |");
  parts.push("|-------|---|");
  if (row.source_name) parts.push(`| Source | ${row.source_name} |`);
  if (row.category_path) parts.push(`| Category | ${row.category_path} |`);
  if (row.author) parts.push(`| Author | ${row.author} |`);
  if (row.published) parts.push(`| Published | ${formatDate(row.published)} |`);
  if (row.link) parts.push(`| Original | [Open Link](${row.link}) |`);
  if (row.body_missing) parts.push("| Body | ⚠ *Body file missing on disk* |");
  parts.push("");

  if (row.tags?.length) {
    parts.push(`**Tags:** ${row.tags.map(t => `\`${t}\``).join(" ")}`);
    parts.push("");
  }

  if (summary) {
    parts.push("---");
    parts.push("");
    parts.push("## Summary");
    parts.push("");
    parts.push(summary);
    parts.push("");
  }

  if (row.body_missing) {
    parts.push("---");
    parts.push("");
    parts.push("> *This article's full content is not available. Only metadata is shown.*");
  }
  return parts.join("\n");
}

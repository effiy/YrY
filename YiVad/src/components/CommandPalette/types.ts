export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  entityType: "project" | "issue" | "bug" | "module" | "knowledge" | "file" | "user" | "session";
  url: string;
  matchedField?: string;
  metadata?: Record<string, string>;
}

export interface SearchResultGroup {
  type: string;
  label: string;
  icon: string;
  count: number;
  items: SearchResult[];
}
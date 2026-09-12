/** Tag types */

export interface Tag {
  key: string;
  name: string;
  parent_id?: string;
  color: string;
  icon: string;
  category: string;
  description: string;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface TagTreeNode extends Tag {
  children: TagTreeNode[];
}

export interface TagUsageStats {
  total: number;
  unused: number;
  top_tags: Tag[];
}
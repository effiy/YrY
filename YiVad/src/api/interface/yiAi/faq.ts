export interface FaqDocument {
  key: string;
  title: string;
  /** Primary prompt text */
  prompt: string;
  tags: string[];
  order?: number;
  updatedTime?: number;
  createdAt?: number;
  updatedAt?: number;
}
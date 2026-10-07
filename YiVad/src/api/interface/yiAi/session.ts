import type { ChatMessage } from "./chat";

export interface SessionDocument {
  key: string;
  url: string;
  title: string;
  pageTitle?: string;
  pageDescription: string;
  pageContent?: string;
  messages: ChatMessage[];
  tags: string[];
  isFavorite?: boolean;
  createdAt: number;
  updatedAt: number;
  lastAccessTime?: number;
  file_path?: string;
  filePath?: string;
}

/** Context editor draft — mirrors the working copy while the editor is open */
export interface SessionContextDraft {
  text: string;
  images: string[];
  enabled: boolean;
  /** index of the message being edited, or null for a new context */
  messageIndex: number | null;
}

/** Project zip upload (client-side parse + per-file write) */
export interface ProjectZipUploadEntry {
  path: string;
  /** JSZip file object — opaque to the data layer */
  file: unknown;
  isImage: boolean;
}

/** File tree node used by aiChat and knowledge tree sidebar views. */
export interface FileNode {
  key: string;
  name: string;
  type: "file" | "folder";
  children?: FileNode[];
  session?: SessionDocument;
  size?: number;
  updatedAt?: number;
}
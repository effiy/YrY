import type { SessionRecord, QueryResult, KnowledgeTreeNode, RagStatusResponse } from "../../src/api/types";

/** Mock session records for development and testing. */
export const mockSessions: SessionRecord[] = [
  {
    key: "session_001",
    title: "YiVad AI Chat Demo",
    url: "http://localhost:8848/#/aiChat/index",
    pageDescription: "Managing AI-powered conversations",
    messages: [],
    tags: ["source:YiVad", "project:yivad"],
    isFavorite: true,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  },
  {
    key: "session_002",
    title: "Knowledge Base Dashboard",
    url: "http://localhost:8848/#/dashboard/knowledgeBase",
    pageDescription: "Reviewing knowledge base statistics",
    messages: [],
    tags: ["source:YiVad", "project:yivad"],
    isFavorite: false,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  },
  {
    key: "session_003",
    title: "API Reference Discussion",
    url: "https://example.com/docs/api-reference",
    pageDescription: "Discussing API documentation",
    messages: [],
    tags: ["source:external"],
    isFavorite: false,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  },
];

/** Mock query result for sessions list. */
export const mockSessionListResponse: QueryResult<SessionRecord> = {
  list: mockSessions,
  total: mockSessions.length,
  pageNum: 1,
  pageSize: 10,
  totalPages: 1,
};

/** Mock knowledge tree nodes. */
export const mockKnowledgeTree: KnowledgeTreeNode[] = [
  {
    path: "engineer",
    name: "engineer",
    type: "folder",
    children: [
      {
        path: "engineer/projects",
        name: "projects",
        type: "folder",
        children: [
          { path: "engineer/projects/yivad", name: "yivad", type: "folder", children: [] },
          { path: "engineer/projects/yiai", name: "yiai", type: "folder", children: [] },
        ],
      },
    ],
  },
  {
    path: "curator",
    name: "curator",
    type: "folder",
    children: [],
  },
];

/** Mock RAG status response. */
export const mockRagStatus: RagStatusResponse = {
  built: true,
  num_docs: 156,
  last_built_at: new Date().toISOString(),
};
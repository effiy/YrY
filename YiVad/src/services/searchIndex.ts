import type { SearchResult } from "@/components/CommandPalette/types";
import { queryDocuments } from "@/api/modules/dataService";

export async function buildSearchIndex(): Promise<SearchResult[]> {
  const results: SearchResult[] = [];

  try {
    const [projectRes, issueRes, bugRes, moduleRes] = await Promise.allSettled([
      queryDocuments({ cname: "projects", filter: { status: "active" }, pageSize: 200 }),
      queryDocuments({ cname: "issues", filter: {}, pageSize: 200 }),
      queryDocuments({ cname: "bugs", filter: {}, pageSize: 200 }),
      queryDocuments({ cname: "modules", filter: {}, pageSize: 200 }),
    ]);

    if (projectRes.status === "fulfilled" && projectRes.value?.data?.list) {
      for (const p of projectRes.value.data.list as any[]) {
        results.push({
          id: p.key,
          title: p.name || p.key,
          description: p.description,
          entityType: "project",
          url: `/project/${p.key}`,
        });
      }
    }

    if (issueRes.status === "fulfilled" && issueRes.value?.data?.list) {
      for (const i of issueRes.value.data.list as any[]) {
        results.push({
          id: i.key,
          title: i.title,
          entityType: "issue",
          url: `/issue/${i.key}`,
          metadata: { status: i.status, priority: i.priority },
        });
      }
    }

    if (bugRes.status === "fulfilled" && bugRes.value?.data?.list) {
      for (const b of bugRes.value.data.list as any[]) {
        results.push({
          id: b.key,
          title: b.title,
          entityType: "bug",
          url: `/bug/${b.key}`,
          metadata: { status: b.status, severity: b.severity },
        });
      }
    }

    if (moduleRes.status === "fulfilled" && moduleRes.value?.data?.list) {
      for (const m of moduleRes.value.data.list as any[]) {
        results.push({
          id: m.key,
          title: m.name || m.key,
          entityType: "module",
          url: `/module/${m.key}`,
        });
      }
    }
  } catch {
    // best effort
  }

  return results;
}
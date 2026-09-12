import type { ProjectMember } from "@/api/modules/projectService";

export type RoleTagType = "warning" | "primary" | "info" | "success";

/** Map project member role to Element Plus Tag type. */
export function roleTagType(role: ProjectMember["role"]): RoleTagType {
  const map: Record<ProjectMember["role"], RoleTagType> = {
    owner: "warning",
    admin: "primary",
    member: "info",
    viewer: "success"
  };
  return map[role];
}

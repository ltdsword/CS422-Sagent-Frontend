import axiosInstance from "@/shared/utils/axios-instance";
import { parseWorkspacePaperJson } from "@/shared/utils/json-bigint";
import type { TagDto, WorkspaceDto, WorkspacePaperDto } from "../types";

/** Serializer may expose tags as strings or nested `{ id, name }` objects (not Django `__str__` like `Tag object (4)`). */
export function normalizeWorkspacePaperTags(tags: unknown): string[] {
  if (!Array.isArray(tags)) {
    return [];
  }
  const labels: string[] = [];
  for (const t of tags) {
    if (typeof t === "string") {
      const s = t.trim();
      if (s.length > 0) {
        labels.push(s);
      }
      continue;
    }
    if (t && typeof t === "object" && "name" in t) {
      const n = String((t as { name: unknown }).name ?? "").trim();
      if (n.length > 0) {
        labels.push(n);
      }
    }
  }
  return labels;
}

function mapWorkspacePaperRow(row: WorkspacePaperDto): WorkspacePaperDto {
  return {
    ...row,
    tags: normalizeWorkspacePaperTags((row as { tags?: unknown }).tags),
  };
}

/** Django REST often returns `{ count, next, previous, results }` instead of a bare array. */
function unwrapListPayload<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) {
    return payload as T[];
  }
  if (payload && typeof payload === "object" && "results" in payload) {
    const results = (payload as { results?: unknown }).results;
    return Array.isArray(results) ? (results as T[]) : [];
  }
  return [];
}

export async function listWorkspaces(): Promise<WorkspaceDto[]> {
  const { data } = await axiosInstance.get<unknown>("/workspaces/");
  return unwrapListPayload<WorkspaceDto>(data);
}

export async function createWorkspace(body: {
  name: string;
  description?: string;
}): Promise<WorkspaceDto> {
  const { data } = await axiosInstance.post<WorkspaceDto>("/workspaces/", body);
  return data;
}

export async function getWorkspace(id: string): Promise<WorkspaceDto> {
  const { data } = await axiosInstance.get<WorkspaceDto>(`/workspaces/${id}/`);
  return data;
}

export async function updateWorkspace(
  id: string,
  body: Partial<{ name: string; description: string }>,
): Promise<WorkspaceDto> {
  const { data } = await axiosInstance.patch<WorkspaceDto>(`/workspaces/${id}/`, body);
  return data;
}

export async function deleteWorkspace(id: string): Promise<void> {
  await axiosInstance.delete(`/workspaces/${id}/`);
}

export async function listWorkspacePapers(): Promise<WorkspacePaperDto[]> {
  const { data } = await axiosInstance.get<string>("/workspaces/workspace-paper/", {
    responseType: "text",
    transformResponse: [(r) => r],
  });
  const payload = parseWorkspacePaperJson(typeof data === "string" ? data : String(data));
  const rows = unwrapListPayload<WorkspacePaperDto>(payload);
  return rows.map(mapWorkspacePaperRow);
}

export async function createWorkspacePaper(body: {
  workspace: string;
  paper: string;
}): Promise<WorkspacePaperDto> {
  const { data } = await axiosInstance.post<string>(
    "/workspaces/workspace-paper/",
    body,
    {
      responseType: "text",
      transformResponse: [(r) => r],
    },
  );
  const row = parseWorkspacePaperJson(typeof data === "string" ? data : String(data)) as WorkspacePaperDto;
  return mapWorkspacePaperRow(row);
}

export async function deleteWorkspacePaper(linkId: number): Promise<void> {
  await axiosInstance.delete(`/workspaces/workspace-paper/${linkId}/`);
}

export async function listTags(): Promise<TagDto[]> {
  const { data } = await axiosInstance.get<unknown>("/workspaces/tag/");
  return unwrapListPayload<TagDto>(data);
}

export async function createTag(body: {
  workspace_paper: number;
  name: string;
}): Promise<TagDto> {
  const { data } = await axiosInstance.post<TagDto>("/workspaces/tag/", body);
  return data;
}

export async function deleteTag(tagId: number): Promise<void> {
  await axiosInstance.delete(`/workspaces/tag/${tagId}/`);
}

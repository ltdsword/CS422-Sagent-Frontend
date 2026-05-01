import axiosInstance from "@/shared/utils/axios-instance";
import type { TagDto, WorkspaceDto, WorkspacePaperDto } from "../types";

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
  const { data } = await axiosInstance.get<unknown>("/workspaces/workspace-paper/");
  return unwrapListPayload<WorkspacePaperDto>(data);
}

export async function createWorkspacePaper(body: {
  workspace: string;
  paper: string;
}): Promise<WorkspacePaperDto> {
  const { data } = await axiosInstance.post<WorkspacePaperDto>(
    "/workspaces/workspace-paper/",
    body,
  );
  return data;
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

import axiosInstance from "../../../shared/utils/axios-instance";

/** POST `/ai/generate/` — backend expects snake_case `workspace_id` when scoping to a workspace. */
export interface ResearchRequest {
  workspace_id?: string;
  prompt: string;
}

function buildGenerateBody(payload: ResearchRequest): { prompt: string; workspace_id?: string } {
  const prompt = typeof payload.prompt === "string" ? payload.prompt : "";
  const ws = payload.workspace_id?.trim();
  const body: { prompt: string; workspace_id?: string } = { prompt };
  if (ws) {
    body.workspace_id = ws;
  }
  return body;
}

export interface ResearchResponse {
  task_id?: string;
  status: string;
  reply?: string;
}

export interface TaskResponse {
  task_id: string;
  status: string;
}

export interface TaskStatusResponse {
  task_id: string;
  status: string;
  current_agent?: string;
  workspace_id?: string;
  /** Some stacks echo camelCase; prefer `workspace_id` when both exist. */
  workspaceId?: string;
  artifact_id?: string;
  papers_added?: number;
  summary_preview?: string;
  result?: any;
  error?: string;
}

export const triggerAgentWorkflow = async (data: ResearchRequest): Promise<ResearchResponse> => {
  const response = await axiosInstance.post("/ai/generate/", buildGenerateBody(data));
  return response.data;
};

export const checkTaskStatus = async (taskId: string): Promise<TaskStatusResponse> => {
  const response = await axiosInstance.get(`/ai/tasks/${taskId}/status/`);
  return response.data;
};

export const fetchActiveTask = async (): Promise<{ task_id: string | null }> => {
  const response = await axiosInstance.get("/ai/active-task/");
  return response.data;
};

export interface ChatMessageData {
  id?: number;
  message: string;
  sender: "user" | "agent";
  created_at?: string;
}

export const fetchChatHistory = async (): Promise<ChatMessageData[]> => {
  const response = await axiosInstance.get("/ai/chat/");
  return response.data;
};

export const saveChatMessage = async (message: string, sender: "user" | "agent"): Promise<ChatMessageData> => {
  const response = await axiosInstance.post("/ai/chat/", { message, sender });
  return response.data;
};

export const fetchAllArtifacts = async (): Promise<any[]> => {
  const response = await axiosInstance.get("/ai/artifacts/");
  return response.data;
};

export const fetchWorkspaceArtifacts = async (workspaceId: string): Promise<any[]> => {
  const qs = new URLSearchParams({ workspace_id: String(workspaceId) });
  const response = await axiosInstance.get(`/ai/artifacts/?${qs.toString()}`);
  return response.data;
};

export const fetchAgentActivities = async (): Promise<{ activities: any[], workspaces: any[], paperCounts: Record<string, number> }> => {
  const response = await axiosInstance.get("/ai/activity/");
  return response.data;
};

export const clearChatHistory = async (): Promise<void> => {
  await axiosInstance.delete("/ai/chat/");
};

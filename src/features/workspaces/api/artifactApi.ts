import axiosInstance from "../../../shared/utils/axios-instance";

export interface GeneratedArtifact {
  id: number;
  workspace: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export const fetchArtifactById = async (artifactId: number): Promise<GeneratedArtifact> => {
  const response = await axiosInstance.get(`/ai/artifacts/${artifactId}/`);
  return response.data;
};

export const fetchWorkspaceArtifacts = async (workspaceId: number): Promise<GeneratedArtifact[]> => {
  const response = await axiosInstance.get(`/workspaces/${workspaceId}/artifacts/`);
  return response.data;
};

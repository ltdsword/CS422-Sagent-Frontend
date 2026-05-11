import { useEffect, useRef, useState } from "react";
import { checkTaskStatus, type TaskStatusResponse } from "../api/agentApi";

interface PollingCallbacks {
  onSuccess?: (result: TaskStatusResponse) => void;
  onError?: (error: string) => void;
  onProgress?: (agentName: string) => void;
  onWorkspaceCreated?: (workspaceId: string) => void;
}

export const useTaskPolling = (taskId: string | null, callbacks?: PollingCallbacks) => {
  const [status, setStatus] = useState<string>("idle");
  // Track the last seen workspace_id so we only fire onWorkspaceCreated once
  const lastWorkspaceId = useRef<string>("");

  useEffect(() => {
    if (!taskId) return;

    setStatus("running");
    lastWorkspaceId.current = "";

    const interval = setInterval(async () => {
      try {
        const response = await checkTaskStatus(taskId);
        setStatus(response.status);

        if (response.status === "SUCCESS") {
          clearInterval(interval);
          // Pass the full response so callers can access artifact_id, workspace_id, etc.
          callbacks?.onSuccess?.(response);
        } else if (response.status === "FAILURE") {
          clearInterval(interval);
          const errMsg =
            response.result?.error ||
            response.result?.exc_message ||
            response.error ||
            "The agent pipeline encountered an unexpected error.";
          callbacks?.onError?.(errMsg);
        } else if (response.status === "PROCESSING") {
          // Fire progress update
          if (response.current_agent) {
            callbacks?.onProgress?.(response.current_agent);
          }
          // Detect first appearance of a workspace_id
          const wsId = (response.workspace_id ?? response.workspaceId ?? "").trim();
          if (wsId && wsId !== lastWorkspaceId.current) {
            lastWorkspaceId.current = wsId;
            callbacks?.onWorkspaceCreated?.(wsId);
          }
        }
      } catch (error) {
        console.error("Failed to poll task status", error);
        clearInterval(interval);
        callbacks?.onError?.("Lost connection to the backend. Please try again.");
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [taskId]);

  return { status };
};

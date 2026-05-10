import type { Task } from "../context/TaskContext";

// Maps backend agent names (from Celery task meta) to frontend task types and labels
const AGENT_TO_TASK: Record<string, { type: Task["type"]; message: string; progress: number }> = {
  supervisor:      { type: "query_refinement", message: "Supervisor routing the request...",            progress: 10 },
  refiner:         { type: "query_refinement", message: "Query Refinement Agent is expanding terms...",  progress: 20 },
  finder:          { type: "discovery",        message: "Discovery Agent is searching the library...",   progress: 35 },
  action:          { type: "action",           message: "Workspace Agent is managing papers...",         progress: 50 },
  reader:          { type: "reader",           message: "Reader Agent is extracting paper content...",   progress: 65 },
  synthesizer:     { type: "synthesizer",      message: "Synthesizer Agent is generating report...",     progress: 80 },
  critic:          { type: "critic",           message: "Critic Agent is verifying the output...",       progress: 92 },
  qa:              { type: "qa",               message: "Q&A Agent is searching vector database...",     progress: 60 },
};

/**
 * Creates the initial progress task entry in the UI and returns its ID.
 * Call this once when a task is dispatched to Celery.
 */
export function startProgressTracking(
  addTask: (task: Omit<Task, "id" | "startTime">) => string
): string {
  return addTask({
    type: "query_refinement",
    status: "running",
    progress: 5,
    message: "Sending request to the agent orchestrator...",
  });
}

/**
 * Updates the progress bar UI for a given agent name.
 * Pure function — no polling, no side effects.
 * Call this from useTaskPolling's onProgress callback.
 */
export function applyAgentProgress(
  agentName: string,
  uiTaskId: string,
  updateTask: (id: string, updates: Partial<Task>) => void
): void {
  const mapping = AGENT_TO_TASK[agentName];
  if (mapping) {
    updateTask(uiTaskId, {
      type: mapping.type,
      progress: mapping.progress,
      message: mapping.message,
      status: "running",
    });
  }
}

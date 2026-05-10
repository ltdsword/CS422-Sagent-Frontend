import { useState } from "react";
import {
  Loader2,
  Search,
  BookOpen,
  Sparkles,
  CheckCircle2,
  Filter,
  Database,
  MessageSquare,
  X,
  ChevronUp,
  ChevronDown,
  AlertCircle
} from "lucide-react";
import { useTasks } from "../context/TaskContext";
import type { Task } from "../context/TaskContext";

interface TaskProgressBarProps {
  isInChat?: boolean;
}

export function TaskProgressBar({ isInChat = false }: TaskProgressBarProps) {
  const { tasks, removeTask } = useTasks();
  const [isExpanded, setIsExpanded] = useState(true);

  const getTaskIcon = (type: Task["type"]) => {
    switch (type) {
      case "query_refinement":
        return Filter;
      case "discovery":
        return Search;
      case "reader":
        return BookOpen;
      case "synthesizer":
        return Sparkles;
      case "critic":
        return CheckCircle2;
      case "qa":
        return MessageSquare;
      case "action":
        return Database;
      default:
        return Loader2;
    }
  };

  const getTaskLabel = (type: Task["type"]) => {
    switch (type) {
      case "query_refinement":
        return "Query Refinement";
      case "discovery":
        return "Discovery Agent";
      case "reader":
        return "Reader/Extractor";
      case "synthesizer":
        return "Synthesizer";
      case "critic":
        return "Critic Agent";
      case "qa":
        return "Q&A Agent";
      case "action":
        return "Workspace Action";
      default:
        return "Processing";
    }
  };

  const getTaskColor = (type: Task["type"]) => {
    switch (type) {
      case "query_refinement":
        return "text-purple-600 bg-purple-50 border-purple-200";
      case "discovery":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "reader":
        return "text-green-600 bg-green-50 border-green-200";
      case "synthesizer":
        return "text-indigo-600 bg-indigo-50 border-indigo-200";
      case "critic":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "qa":
        return "text-cyan-600 bg-cyan-50 border-cyan-200";
      case "action":
        return "text-slate-600 bg-slate-50 border-slate-200";
      default:
        return "text-slate-600 bg-slate-50 border-slate-200";
    }
  };

  const activeTasks = tasks.filter(t => t.status === "running" || t.status === "queued");
  const hasActiveTasks = activeTasks.length > 0;

  // Hide when there are no tasks at all, or when every task is done/failed
  // (clearAllTasks() is called by ChatBubble on error/success, so this will naturally disappear)
  if (tasks.length === 0 || tasks.every(t => t.status === "completed" || t.status === "failed")) {
    return null;
  }

  const handleRemoveTask = (taskId: string) => {
    removeTask(taskId);
  };

  if (isInChat) {
    return (
      <div className="border-t border-slate-200 bg-slate-50">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
            <span className="text-sm font-medium text-slate-900">
              Active Tasks ({activeTasks.length})
            </span>
          </div>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          )}
        </button>

        {isExpanded && (
          <div className="px-4 pb-4 space-y-3 max-h-64 overflow-y-auto">
            {tasks.map((task) => {
              const Icon = getTaskIcon(task.type);
              const colorClass = getTaskColor(task.type);

              return (
                <div
                  key={task.id}
                  className="bg-white rounded-lg border border-slate-200 p-3 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <div className={`p-1.5 rounded border ${colorClass}`}>
                        {task.status === "running" ? (
                          <Icon className="w-3.5 h-3.5 animate-spin" />
                        ) : task.status === "completed" ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                        ) : task.status === "failed" ? (
                          <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                        ) : (
                          <Icon className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-900">
                          {getTaskLabel(task.type)}
                        </p>
                        <p className="text-xs text-slate-600 truncate">
                          {task.message}
                        </p>
                      </div>
                    </div>
                    {task.status === "completed" && (
                      <button
                        onClick={() => handleRemoveTask(task.id)}
                        className="p-1 hover:bg-slate-100 rounded transition-colors"
                      >
                        <X className="w-3 h-3 text-slate-400" />
                      </button>
                    )}
                  </div>

                  {task.status === "running" && (
                    <>
                      <div className="w-full bg-slate-200 rounded-full h-1.5">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{Math.round(task.progress)}%</span>
                        {task.estimatedCompletion && (
                          <span>
                            ~{Math.max(0, Math.round((task.estimatedCompletion.getTime() - Date.now()) / 1000))}s remaining
                          </span>
                        )}
                      </div>
                    </>
                  )}
                  {task.status === "failed" && (
                    <div className="flex items-center gap-1.5 text-xs text-red-500">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{task.message}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Bottom-left standalone progress bar
  return (
    <div className="fixed bottom-6 left-6 w-96 bg-white rounded-xl shadow-2xl border border-slate-200 z-40 animate-in slide-in-from-left">
      <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-slate-50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            <h3 className="font-semibold text-slate-900">Agent Tasks</h3>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-white rounded transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronUp className="w-4 h-4 text-slate-500" />
            )}
          </button>
        </div>
        <p className="text-xs text-slate-600">
          {activeTasks.length} active task{activeTasks.length !== 1 ? "s" : ""} running
        </p>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
          {tasks.map((task) => {
            const Icon = getTaskIcon(task.type);
            const colorClass = getTaskColor(task.type);

            return (
              <div
                key={task.id}
                className="border border-slate-200 rounded-lg p-3 space-y-2 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    <div className={`p-2 rounded-lg border ${colorClass}`}>
                      {task.status === "running" ? (
                        <Icon className="w-4 h-4 animate-spin" />
                      ) : task.status === "completed" ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : task.status === "failed" ? (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 mb-0.5">
                        {getTaskLabel(task.type)}
                      </p>
                      <p className="text-xs text-slate-600 line-clamp-2">
                        {task.message}
                      </p>
                    </div>
                  </div>
                  {task.status === "completed" && (
                    <button
                      onClick={() => handleRemoveTask(task.id)}
                      className="p-1 hover:bg-slate-100 rounded transition-colors"
                    >
                      <X className="w-4 h-4 text-slate-400" />
                    </button>
                  )}
                </div>

                {task.status === "running" && (
                  <>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-medium">{Math.round(task.progress)}%</span>
                      {task.estimatedCompletion && (
                        <span>
                          Est. {Math.max(0, Math.round((task.estimatedCompletion.getTime() - Date.now()) / 1000))}s
                        </span>
                      )}
                    </div>
                  </>
                )}

                {task.status === "completed" && (
                  <div className="flex items-center gap-1.5 text-xs text-green-600">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Completed</span>
                  </div>
                )}

                {task.status === "failed" && (
                  <div className="flex items-center gap-1.5 text-xs text-red-500">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span className="line-clamp-2">{task.message}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

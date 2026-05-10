import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

export interface Task {
  id: string;
  type: "query_refinement" | "discovery" | "reader" | "synthesizer" | "critic" | "qa" | "action";
  status: "queued" | "running" | "completed" | "failed";
  progress: number;
  message: string;
  startTime: Date;
  estimatedCompletion?: Date;
}

interface TaskContextType {
  tasks: Task[];
  addTask: (task: Omit<Task, "id" | "startTime">) => string;
  updateTask: (id: string, updates: Partial<Task>) => void;
  removeTask: (id: string) => void;
  clearCompletedTasks: () => void;
  clearAllTasks: () => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);

  const addTask = (task: Omit<Task, "id" | "startTime">): string => {
    const id = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newTask: Task = {
      ...task,
      id,
      startTime: new Date()
    };
    setTasks(prev => [...prev, newTask]);
    return id;
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev =>
      prev.map(task => (task.id === id ? { ...task, ...updates } : task))
    );
  };

  const removeTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const clearCompletedTasks = () => {
    setTasks(prev => prev.filter(task => task.status !== "completed"));
  };

  const clearAllTasks = () => {
    setTasks([]);
  };

  return (
    <TaskContext.Provider
      value={{ tasks, addTask, updateTask, removeTask, clearCompletedTasks, clearAllTasks }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTasks must be used within a TaskProvider");
  }
  return context;
}

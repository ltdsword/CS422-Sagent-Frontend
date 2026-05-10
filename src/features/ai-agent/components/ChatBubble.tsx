import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Sparkles, Minimize2, FolderOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { TaskProgressBar } from "./TaskProgressBar";
import { useTasks } from "../context/TaskContext";
import { startProgressTracking, applyAgentProgress } from "../utils/demoTasks";
import { triggerAgentWorkflow, fetchChatHistory, saveChatMessage } from "../api/agentApi";
import { useTaskPolling } from "../hooks/useTaskPolling";

interface Message {
  id: string;
  text: string;
  sender: "user" | "agent";
  timestamp: Date;
  workspaceId?: string;
}

export function ChatBubble() {
  const navigate = useNavigate();
  const { addTask, updateTask, clearAllTasks } = useTasks();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm your Sagent AI research assistant. How can I help you with your research today?",
      sender: "agent",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  // Track the UI progress bar task ID so we can update or clear it
  const uiTaskIdRef = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const pushMessage = useCallback((text: string, sender: "user" | "agent" = "agent", workspaceId?: string) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      text,
      sender,
      timestamp: new Date(),
      workspaceId
    }]);
    saveChatMessage(text, sender).catch(err => console.error("Failed to save message:", err));
  }, []);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await fetchChatHistory();
        if (history && history.length > 0) {
          const loadedMessages: Message[] = history.map((msg: any) => ({
            id: msg.id?.toString() || Date.now().toString() + Math.random(),
            text: msg.message,
            sender: msg.sender,
            timestamp: msg.created_at ? new Date(msg.created_at) : new Date()
          }));
          setMessages(loadedMessages);
        }
      } catch (err) {
        console.error("Failed to fetch chat history:", err);
      }
    };
    loadHistory();
  }, []);

  // Single poller — handles SUCCESS, FAILURE, and PROCESSING progress updates
  useTaskPolling(activeTaskId, {
    onProgress: (agentName) => {
      if (uiTaskIdRef.current) {
        applyAgentProgress(agentName, uiTaskIdRef.current, updateTask);
        // Dispatch event to refresh activity feed in other components
        window.dispatchEvent(new CustomEvent("sagent:activity-updated"));
      }
    },
    onWorkspaceCreated: (workspaceId) => {
      // Dispatch a browser custom event so any workspace list component can refetch
      window.dispatchEvent(new CustomEvent("sagent:workspace-created", {
        detail: { workspaceId }
      }));
    },
    onSuccess: (response) => {
      setActiveTaskId(null);
      if (uiTaskIdRef.current) {
        updateTask(uiTaskIdRef.current, {
          status: "completed",
          progress: 100,
          message: "All agents finished — artifact ready!",
        });
        uiTaskIdRef.current = null;
      }

      const result     = response.result || {};
      const artifactId = response.artifact_id ?? result.artifact_id;
      const wsId       = response.workspace_id ?? result.workspace_id;
      const papersAdded = response.papers_added ?? result.papers_added ?? 0;
      const draft      = result.synthesis_draft || "";
      let preview = "Generated synthesis draft.";
      if (draft) {
        // Try to extract the Quick Summary section if it exists
        const quickSummaryMatch = draft.match(/## Quick summary[^]*?(?=---|\n## )/i);
        if (quickSummaryMatch && quickSummaryMatch[0]) {
          preview = quickSummaryMatch[0].trim();
        } else {
        // Use a much larger preview limit to avoid truncation
        preview = draft.slice(0, 5000);
        if (draft.length > 5000) preview += "…";
      }
    }

      if (artifactId && wsId) {
        // Deep-link to the workspace that contains the artifact
        pushMessage(
          `✅ Agent Process is complete!\n\n` +
          `${preview}\n\n` +
          `The workspace, papers and the generated artifacts are located at:`,
          "agent",
          wsId
        );
      } else if (artifactId) {
        pushMessage(
          `✅ Agent Process is complete!\n\n` +
          `${preview}\n\n` +
          `The generated artifact was saved.`
        );
      } else if (draft) {
        pushMessage(
          `✅ Agent Process is complete!\n\n` +
          `${preview}`
        );
      } else {
        pushMessage("✅ Agent Process is complete!");
      }
    },
    onError: (error) => {
      setActiveTaskId(null);
      clearAllTasks();
      uiTaskIdRef.current = null;
      pushMessage(`❌ The agent pipeline encountered an error:\n\n${error}\n\nPlease try again or rephrase your request.`);
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const query = inputValue.trim();
    pushMessage(query, "user");
    setInputValue("");
    setIsTyping(true);

    try {
      const res = await triggerAgentWorkflow({ prompt: query });

      if (res.reply) {
        // Trivial conversational query — handled synchronously by backend LLM Fast-Path
        pushMessage(res.reply);
      } else if (res.task_id) {
        // Complex research query — start progress bar THEN begin polling
        pushMessage("I've started working on your request. The agents are now running — I'll update you here when they're done.");
        // Create the initial UI task entry (no polling inside)
        uiTaskIdRef.current = startProgressTracking(addTask);
        setActiveTaskId(res.task_id);
      }
    } catch (e: any) {
      console.error("Failed to trigger agent workflow", e);
      const detail = e?.response?.data?.detail || e?.message || "Unknown error.";
      pushMessage(`❌ Failed to connect to the orchestration engine: ${detail}`);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col z-50 animate-in slide-in-from-bottom-4">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-slate-700 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">Sagent AI</h3>
                <p className="text-xs text-blue-100">Research Assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.sender === "user"
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-white text-slate-900 border border-slate-200 rounded-bl-sm shadow-sm"
                  }`}
                >
                  {message.sender === "agent" && (
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-3 h-3 text-blue-600" />
                      <span className="text-xs font-medium text-blue-600">Sagent AI</span>
                    </div>
                  )}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                  
                  {message.workspaceId && (
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        navigate(`/workspace?id=${message.workspaceId}`);
                      }}
                      className="mt-3 w-full py-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold border border-blue-200 hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      View Research Workspace
                    </button>
                  )}

                  <p
                    className={`text-xs mt-1 ${
                      message.sender === "user" ? "text-blue-100" : "text-slate-400"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-3 h-3 text-blue-600" />
                    <span className="text-xs font-medium text-blue-600">Sagent AI</span>
                  </div>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Smart Integration: Embedded Progress Bar */}
          <TaskProgressBar isInChat={true} />

          {/* Input */}
          <div className="p-4 bg-white border-t border-slate-200 rounded-b-2xl">
            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about your research..."
                  rows={1}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none"
                  style={{ minHeight: "44px", maxHeight: "120px" }}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed flex-shrink-0"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2 text-center">
              AI responses are generated and may contain errors
            </p>
          </div>
        </div>
      )}

      {/* Chat Bubble Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-blue-600 to-slate-700 text-white rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all flex items-center justify-center z-50 group"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <>
            <MessageCircle className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></span>
          </>
        )}
      </button>

      {/* Tooltip */}
      {!isOpen && (
        <div className="fixed bottom-6 right-24 bg-slate-900 text-white px-3 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-40">
          Chat with Sagent AI
        </div>
      )}

      {/* Smart Integration: Standalone Progress Bar */}
      {!isOpen && <TaskProgressBar isInChat={false} />}
    </>
  );
}

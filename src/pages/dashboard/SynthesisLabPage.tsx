import { useCallback, useEffect, useState } from "react";
import { FlaskConical, Sparkles, FileText, Clock, X, Loader2, FolderOpen } from "lucide-react";
import { fetchAllArtifacts, fetchAgentActivities } from "../../features/ai-agent/api/agentApi";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { formatDistanceToNow, parseISO } from "date-fns";
import { useAuth } from "@/shared/hooks/useAuth";

interface ArtifactDto {
  id: number;
  workspace_id: string | null;
  workspace_name: string | null;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export function SynthesisLab() {
  const { isAuthenticated } = useAuth();
  const [artifacts, setArtifacts] = useState<ArtifactDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedArtifact, setSelectedArtifact] = useState<ArtifactDto | null>(null);

  const [activities, setActivities] = useState<any[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);

  const loadArtifacts = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchAllArtifacts();
      setArtifacts(data);
    } catch (err: any) {
      console.error("Failed to load artifacts", err);
      setError("Failed to load your generated artifacts.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadActivities = useCallback(async () => {
    if (!isAuthenticated) {
      setActivities([]);
      return;
    }
    setActivitiesLoading(true);
    try {
      const data = await fetchAgentActivities();
      setActivities(data);
    } catch (err) {
      console.error("Failed to load agent activities", err);
    } finally {
      setActivitiesLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void loadArtifacts();
    void loadActivities();

    const handleUpdate = () => void loadActivities();
    window.addEventListener("sagent:activity-updated", handleUpdate);

    let interval: any;
    if (isAuthenticated) {
      interval = setInterval(() => {
        void loadActivities();
      }, 10000);
    }
    
    return () => {
      window.removeEventListener("sagent:activity-updated", handleUpdate);
      if (interval) clearInterval(interval);
    };
  }, [loadArtifacts, loadActivities, isAuthenticated]);

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="max-w-7xl mx-auto w-full">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-slate-900 mb-2 flex items-center gap-3">
              <FlaskConical className="w-8 h-8 text-blue-600" />
              Synthesis Lab
            </h1>
            <p className="text-slate-600">
              View and manage all AI-generated literature reviews and research artifacts.
            </p>
          </div>
          <div className="bg-blue-50 border border-blue-200 px-4 py-2 rounded-lg flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">
              {artifacts.length} Artifacts Generated
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-slate-500 gap-3">
            <Loader2 className="w-6 h-6 animate-spin" />
            Loading artifacts...
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-6 rounded-xl border border-red-200">
            {error}
          </div>
        ) : artifacts.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-16 text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <FlaskConical className="w-16 h-16 text-slate-300" />
            </div>
            <h2 className="text-slate-900 mb-2">No Artifacts Found</h2>
            <p className="text-slate-500 max-w-md mx-auto">
              You haven't generated any research artifacts yet. Use the Sagent AI Chat Bubble to ask questions and trigger the research workflow.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {artifacts.map((artifact) => (
              <button
                key={artifact.id}
                onClick={() => setSelectedArtifact(artifact)}
                className="text-left bg-white rounded-xl border border-slate-200 p-6 hover:border-blue-400 hover:shadow-lg transition-all group flex flex-col h-full"
              >
                <div className="flex-1 w-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                      <FileText className="w-5 h-5" />
                    </div>
                    {artifact.workspace_name && (
                      <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-md flex items-center gap-1 border border-slate-200">
                        <FolderOpen className="w-3 h-3" />
                        {artifact.workspace_name}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-2">
                    {artifact.title || "Untitled Synthesis"}
                  </h3>
                  <p className="text-sm text-slate-600 line-clamp-3 mb-4">
                    {artifact.content.replace(/[#*`]/g, "").slice(0, 300)}
                  </p>
                </div>
                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center text-xs text-slate-400 gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(artifact.created_at).toLocaleString()}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Agent Activity Feed - Added below artifacts */}
        <div className="mt-12 mb-12">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-slate-900">Recent Agent Activity</h2>
              {activitiesLoading && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
            </div>
            <button 
              onClick={() => void loadActivities()}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Refresh Feed
            </button>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-200 overflow-hidden shadow-sm">
            {!isAuthenticated ? (
              <div className="p-10 text-center text-slate-500 text-sm">
                Log in to see agent activities.
              </div>
            ) : activities.length === 0 ? (
              <div className="p-10 text-center text-slate-500 text-sm">
                No recent agent activity.
              </div>
            ) : (
              activities.slice(0, 5).map((item) => (
                <div key={item.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      item.name === 'Critic'
                        ? 'bg-amber-100'
                        : 'bg-blue-100'
                    }`}>
                      <Sparkles className={`w-5 h-5 ${
                        item.name === 'Critic' ? 'text-amber-600' : 'text-blue-600'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                          item.name === 'Critic'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {item.name} Agent
                        </span>
                        <span className="text-sm text-slate-500">•</span>
                        <span className="text-sm font-medium text-slate-700 truncate">
                          {item.workspace_name || "General Task"}
                        </span>
                      </div>
                      <p className="text-sm text-slate-900 mb-1">
                        {item.name === 'Synthesizer' && "Compiling research findings into a synthesis report..."}
                        {item.name === 'Critic' && "Reviewing generated content for factual consistency..."}
                        {item.name === 'Finder' && "Searching the paper database for relevant academic sources..."}
                        {item.name === 'Refiner' && "Expanding research query for optimal search coverage..."}
                        {item.name === 'Reader' && "Extracting deep metrics and methodology from selected papers..."}
                        {item.name === 'Action' && "Managing workspace state and organizing paper links..."}
                        {item.name === 'Q&A' && "Retrieving contextual answers from the knowledge base..."}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatDistanceToNow(parseISO(item.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Artifact Detail Modal */}
      {selectedArtifact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 rounded-t-2xl">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  {selectedArtifact.title || "Synthesis Report"}
                </h2>
                <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Generated: {new Date(selectedArtifact.created_at).toLocaleString()}
                  </span>
                  {selectedArtifact.workspace_name && (
                    <span className="flex items-center gap-1">
                      <FolderOpen className="w-3 h-3" />
                      Project: {selectedArtifact.workspace_name}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedArtifact(null)}
                className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-500 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content - Markdown Rendered */}
            <div className="flex-1 overflow-y-auto p-8 prose prose-slate prose-blue max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {selectedArtifact.content}
              </ReactMarkdown>
            </div>
            
            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl flex justify-end">
              <button
                onClick={() => setSelectedArtifact(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FileText,
  Clock,
  Sparkles,
  TrendingUp,
  AlertCircle,
  FlaskConical,
  Search,
  Loader2,
  FolderOpen,
  LogIn,
} from "lucide-react";
import { useAuth } from "@/shared/hooks/useAuth";
import { listWorkspacePapers, listWorkspaces } from "@/features/workspaces/api/workspaces-api";
import type { WorkspaceDto, WorkspacePaperDto } from "@/features/workspaces/types";
import { getApiErrorMessage } from "@/features/workspaces/utils/api-error";
import { isAxiosError } from "axios";
import { fetchAgentActivities } from "@/features/ai-agent/api/agentApi";
import { formatDistanceToNow, parseISO } from "date-fns";

export function Dashboard() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [workspaces, setWorkspaces] = useState<WorkspaceDto[]>([]);
  const [paperCounts, setPaperCounts] = useState<Record<string, number>>({});
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsError, setProjectsError] = useState<string | null>(null);

  const [activities, setActivities] = useState<any[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);

  const loadProjects = useCallback(async () => {
    if (!isAuthenticated) {
      setWorkspaces([]);
      setPaperCounts({});
      setProjectsLoading(false);
      setProjectsError(null);
      return;
    }

    setProjectsLoading(true);
    setProjectsError(null);
    try {
      const [ws, links] = await Promise.all([listWorkspaces(), listWorkspacePapers().catch(() => [] as WorkspacePaperDto[])]);
      setWorkspaces(ws);

      const counts: Record<string, number> = {};
      for (const l of links) {
        const key = String(l.workspace);
        counts[key] = (counts[key] ?? 0) + 1;
      }
      setPaperCounts(counts);
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 401) {
        await logout();
        navigate("/login", { replace: true });
        return;
      }
      setProjectsError(getApiErrorMessage(err, "Could not load workspaces"));
    } finally {
      setProjectsLoading(false);
    }
  }, [isAuthenticated, logout, navigate]);

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
    void loadProjects();
    void loadActivities();

    const handleUpdate = () => void loadActivities();
    window.addEventListener("sagent:activity-updated", handleUpdate);
    
    // Poll for activities every 10 seconds if authenticated
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
  }, [loadProjects, loadActivities, isAuthenticated]);

  const activeWorkspaces = useMemo(() => workspaces.slice(0, 4), [workspaces]);

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-slate-900 mb-2">Research Dashboard</h1>
          <p className="text-slate-600">{isAuthenticated ? `Welcome back, ${user.name}. Here's an overview of your research projects.` : "Welcome to Sagent. Here's an overview of research insights."}</p>
        </div>

        {/* Projects Grid */}
        <div className="mb-8">
          <h2 className="text-slate-900 mb-4">Active Projects</h2>
          {projectsLoading ? (
            <div className="flex items-center justify-center py-10 text-slate-600 gap-2">
              <Loader2 className="w-5 h-5 animate-spin" aria-hidden />
              Loading workspaces…
            </div>
          ) : projectsError ? (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <p className="text-sm text-red-700">{projectsError}</p>
              <button
                type="button"
                onClick={() => void loadProjects()}
                className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : !isAuthenticated ? (
            <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
              <LogIn className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-slate-900 mb-2">Log in to view your workspaces</h3>
              <p className="text-slate-600 mb-6">Active projects are pulled from your workspaces.</p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Log in
              </Link>
            </div>
          ) : activeWorkspaces.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
              <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-slate-900 mb-2">No workspaces yet</h3>
              <p className="text-slate-600 mb-6">Create a workspace to start organizing papers.</p>
              <Link
                to="/workspace"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Workspaces
              </Link>
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {activeWorkspaces.map((ws) => (
              <Link
                key={ws.id}
                to="/workspace"
                className="block bg-white rounded-xl border border-slate-200 p-6 hover:border-blue-300 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-slate-900 mb-2">{ws.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        <span>{paperCounts[ws.id] ?? 0} papers</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>Created {new Date(ws.created_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* AI Agent Status */}
                <div className="p-3 rounded-lg flex items-start gap-2 bg-blue-50 border border-blue-200">
                  <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-600" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-900 line-clamp-2">
                      {ws.description?.trim() ? ws.description : "Open workspace to view linked papers and AI insights."}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link
            to="/discovery"
            className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 text-white hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <Search className="w-8 h-8" />
              <Sparkles className="w-6 h-6 opacity-75" />
            </div>
            <h3 className="mb-1">Paper Discovery</h3>
            <p className="text-sm text-indigo-100">Search and discover research papers</p>
          </Link>

          <Link
            to="/synthesis"
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <FlaskConical className="w-8 h-8" />
              <TrendingUp className="w-6 h-6 opacity-75" />
            </div>
            <h3 className="mb-1">Synthesis Lab</h3>
            <p className="text-sm text-blue-100">Compare and synthesize papers</p>
          </Link>

        </div>

        {/* Agent Activity Feed */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-slate-900">Agent Activity Feed</h2>
              {activitiesLoading && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
            </div>
            <button 
              onClick={() => void loadActivities()}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Refresh
            </button>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-200 overflow-hidden">
            {!isAuthenticated ? (
              <div className="p-10 text-center text-slate-500 text-sm">
                Log in to see agent activities.
              </div>
            ) : activities.length === 0 ? (
              <div className="p-10 text-center text-slate-500 text-sm">
                No recent agent activity. Start a research workflow to see agents in action.
              </div>
            ) : (
              activities.map((item) => (
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
    </div>
  );
}
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Sparkles,
  Filter,
  Upload,
  FolderOpen,
  FolderPlus,
  X,
  CheckCircle,
  Loader2,
} from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Switch from "@radix-ui/react-switch";
import * as Slider from "@radix-ui/react-slider";
 
import { toast, Toaster } from "sonner";
import { useDiscovery } from "@/features/discovery/hooks/useDiscovery";
import PaperList from "@/features/discovery/components/PaperList";
import type { DiscoveryPaper } from "@/features/discovery/types";
import { createWorkspacePaper, listWorkspaces } from "@/features/workspaces/api/workspaces-api";
import type { WorkspaceDto } from "@/features/workspaces/types";
import { getApiErrorMessage } from "@/features/workspaces/utils/api-error";
import { useAuth } from "@/shared/hooks/useAuth";

export function PaperDiscovery() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [diversityRanking, setDiversityRanking] = useState(false);
  const [query, setQuery] = useState("");
  const [author, setAuthor] = useState("");
  const [keywords, setKeywords] = useState("");
  const limit = 20;
  const [searchBody, setSearchBody] = useState<Record<string, unknown> | undefined>(undefined);
  const debounceRef = useRef<number | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [dateRange, setDateRange] = useState([2010, 2026]);
  const [dragActive, setDragActive] = useState(false);

  const [workspacePickerOpen, setWorkspacePickerOpen] = useState(false);
  const [paperToAdd, setPaperToAdd] = useState<DiscoveryPaper | null>(null);
  const [workspaces, setWorkspaces] = useState<WorkspaceDto[]>([]);
  const [workspacesLoading, setWorkspacesLoading] = useState(false);
  const [addingWorkspaceId, setAddingWorkspaceId] = useState<string | null>(null);

  const VENUE_OPTIONS = [
    { id: 'arxiv', label: 'arXiv' },
    { id: 'semanticScholar', label: 'Semantic Scholar' },
    { id: 'nips', label: 'NIPS/NeurIPS' },
    { id: 'icml', label: 'ICML' },
  ];

  const [selectedVenues, setSelectedVenues] = useState({
    arxiv: false,
    semanticScholar: false,
    nips: false,
    icml: false,
  });

  const { data: papers, loading } = useDiscovery(searchBody);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setUploadModalOpen(false);
          toast.success("Paper added successfully!", {
            description: `${file.name} has been added to your library.`,
            icon: <CheckCircle className="w-4 h-4" />,
          });
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const openWorkspacePicker = useCallback(
    (paper: DiscoveryPaper) => {
      if (!isAuthenticated) {
        toast.message("Please log in", {
          description: "You need to sign in to add papers to a workspace.",
          action: {
            label: "Log in",
            onClick: () => void navigate("/login"),
          },
        });
        return;
      }
      setPaperToAdd(paper);
      setWorkspacePickerOpen(true);
    },
    [isAuthenticated, navigate],
  );

  useEffect(() => {
    if (!workspacePickerOpen || !isAuthenticated) {
      return;
    }
    let cancelled = false;
    (async () => {
      setWorkspacesLoading(true);
      try {
        const list = await listWorkspaces();
        if (!cancelled) {
          setWorkspaces(list);
        }
      } catch (err) {
        if (!cancelled) {
          toast.error(getApiErrorMessage(err, "Could not load workspaces"));
        }
      } finally {
        if (!cancelled) {
          setWorkspacesLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [workspacePickerOpen, isAuthenticated]);

  const handleSelectWorkspace = async (workspaceId: string) => {
    if (!paperToAdd) {
      return;
    }
    setAddingWorkspaceId(workspaceId);
    try {
      await createWorkspacePaper({ workspace: workspaceId, paper: paperToAdd.id });
      const shortTitle =
        paperToAdd.title.length > 72 ? `${paperToAdd.title.slice(0, 72)}…` : paperToAdd.title;
      toast.success("Added to workspace", {
        description: shortTitle,
        icon: <FolderOpen className="w-4 h-4" />,
      });
      setWorkspacePickerOpen(false);
      setPaperToAdd(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not add paper to workspace"));
    } finally {
      setAddingWorkspaceId(null);
    }
  };

  const toggleVenue = (venue: keyof typeof selectedVenues) => {
    setSelectedVenues(prev => ({ ...prev, [venue]: !prev[venue] }));
  };

  // Build API body from UI state
  const buildSearchBody = () => {
    const venues = VENUE_OPTIONS.filter((v) => selectedVenues[v.id as keyof typeof selectedVenues]).map((v) => v.label);

    const body: Record<string, unknown> = {
      query: query.trim() || null,
      limit,
      start_year: dateRange[0],
      end_year: dateRange[1],
      venues: venues.length > 0 ? venues : undefined,
      author: author.trim() || null,
      keywords: keywords.trim() || null,
    };

    if (!body.query) {
      body.sort_by = 'year';
    }

    Object.keys(body).forEach((k) => (body[k] === undefined ? delete body[k] : null));
    return body;
  };

  // Debounce search body updates
  useEffect(() => {
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }
    debounceRef.current = window.setTimeout(() => {
      setSearchBody(buildSearchBody());
    }, 350);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, author, keywords, dateRange, JSON.stringify(selectedVenues), limit]);

  return (
    <>
      <Toaster position="top-right" richColors />
      
      <div className="min-h-screen bg-linear-to-br from-indigo-50 via-slate-50 to-emerald-50">
        <div className="flex h-screen">
          {/* Filter Sidebar */}
          <aside className="w-80 bg-white/70 backdrop-blur-xl border-r border-slate-200/50 p-6 overflow-y-auto">
            <div className="flex items-center gap-2 mb-6">
              <Filter className="w-5 h-5 text-indigo-700" />
              <h2 className="text-slate-900">Filters</h2>
            </div>

            {/* Date Range */}
            <div className="mb-8">
              <label className="text-sm text-slate-700 mb-3 block">
                Publication Date Range
              </label>
              <div className="px-2">
                <Slider.Root
                  className="relative flex items-center select-none touch-none w-full h-5"
                  value={dateRange}
                  onValueChange={setDateRange}
                  min={2000}
                  max={2026}
                  step={1}
                  minStepsBetweenThumbs={1}
                >
                  <Slider.Track className="bg-slate-200 relative grow rounded-full h-1">
                    <Slider.Range className="absolute bg-indigo-600 rounded-full h-full" />
                  </Slider.Track>
                  <Slider.Thumb
                    className="block w-4 h-4 bg-white border-2 border-indigo-600 rounded-full hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    aria-label="Start year"
                  />
                  <Slider.Thumb
                    className="block w-4 h-4 bg-white border-2 border-indigo-600 rounded-full hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    aria-label="End year"
                  />
                </Slider.Root>
              </div>
              <div className="flex justify-between mt-2 text-sm text-slate-600">
                <span>{dateRange[0]}</span>
                <span>{dateRange[1]}</span>
              </div>
            </div>

            {/* Venues */}
            <div className="mb-8">
              <label className="text-sm text-slate-700 mb-3 block">Venues</label>
              <div className="space-y-3">
                {VENUE_OPTIONS.map((venue) => (
                  <label key={venue.id} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedVenues[venue.id as keyof typeof selectedVenues]}
                      onChange={() => toggleVenue(venue.id as keyof typeof selectedVenues)}
                      className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm text-slate-700 group-hover:text-slate-900">
                      {venue.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Author */}
            <div className="mb-8">
              <label className="text-sm text-slate-700 mb-2 block">Author</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g., Hinton, G."
                className="w-full px-3 py-2 bg-white/50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Keywords */}
            <div className="mb-8">
              <label className="text-sm text-slate-700 mb-2 block">Keywords</label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="e.g., transformer, attention"
                className="w-full px-3 py-2 bg-white/50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Diversity Ranking */}
            <div className="p-4 bg-indigo-50/50 rounded-lg border border-indigo-200/50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm text-slate-900">Diversity Ranking</span>
                </div>
                <Switch.Root
                  checked={diversityRanking}
                  onCheckedChange={setDiversityRanking}
                  className={`w-11 h-6 rounded-full relative transition-colors ${
                    diversityRanking ? 'bg-indigo-600' : 'bg-slate-300'
                  }`}
                >
                  <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform translate-x-0.5 will-change-transform data-[state=checked]:translate-x-5.5" />
                </Switch.Root>
              </div>
              <p className="text-xs text-slate-600">
                AI ensures varied research approaches in results
              </p>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            {/* Header & Search */}
            <div className="bg-white/70 backdrop-blur-xl border-b border-slate-200/50 p-6 sticky top-0 z-10">
              <div className="max-w-5xl mx-auto">
                <h1 className="text-slate-900 mb-4">Paper Discovery</h1>
                
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search papers by title, author, or topic..."
                      className="w-full pl-12 pr-4 py-3 bg-white/80 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Results Feed */}
            <div className="max-w-5xl mx-auto p-6">
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-slate-600">
                  Found {(papers ?? []).length} papers matching your criteria
                </p>
              </div>

              <div className="max-w-5xl">
                {loading ? (
                  <div className="py-6 text-center text-slate-600">Loading papers...</div>
                ) : (
                  <PaperList papers={papers ?? []} onAddToWorkspace={openWorkspacePicker} />
                )}
              </div>
            </div>
          </main>
        </div>

        {/* PDF Upload Modal */}
        <Dialog.Root open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm animate-in fade-in" />
            <Dialog.Content className="fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between mb-6">
                <Dialog.Title className="text-slate-900">Upload Paper</Dialog.Title>
                <Dialog.Close className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-slate-500" />
                </Dialog.Close>
              </div>

              {!isUploading ? (
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                    dragActive
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-slate-300 bg-slate-50'
                  }`}
                >
                  <Upload className={`w-12 h-12 mx-auto mb-4 ${
                    dragActive ? 'text-indigo-600' : 'text-slate-400'
                  }`} />
                  <p className="text-slate-900 mb-1">
                    Drop your PDF here or
                  </p>
                  <label className="text-indigo-600 hover:text-indigo-700 cursor-pointer">
                    browse files
                    <input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleUpload(e.target.files[0]);
                        }
                      }}
                    />
                  </label>
                  <p className="text-xs text-slate-500 mt-2">PDF only, max 10MB</p>
                </div>
              ) : (
                <div className="py-8">
                  <div className="flex items-center justify-center mb-4">
                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                  </div>
                  <p className="text-center text-slate-900 mb-2">
                    AI Agent is extracting metadata...
                  </p>
                  <p className="text-center text-sm text-slate-600 mb-4">
                    Analyzing Authors, Title, DOI
                  </p>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 transition-all duration-300 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-center text-xs text-slate-500 mt-2">
                    {uploadProgress}% complete
                  </p>
                </div>
              )}
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        <Dialog.Root
          open={workspacePickerOpen}
          onOpenChange={(open) => {
            setWorkspacePickerOpen(open);
            if (!open) {
              setPaperToAdd(null);
            }
          }}
        >
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm animate-in fade-in" />
            <Dialog.Content className="fixed top-1/2 left-1/2 z-50 max-h-[85vh] flex flex-col -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between mb-4 shrink-0">
                <Dialog.Title className="text-slate-900 pr-2">Add to workspace</Dialog.Title>
                <Dialog.Close className="p-1 hover:bg-slate-100 rounded-lg transition-colors shrink-0">
                  <X className="w-5 h-5 text-slate-500" />
                </Dialog.Close>
              </div>
              {paperToAdd ? (
                <p className="text-sm text-slate-600 mb-4 line-clamp-2 shrink-0">{paperToAdd.title}</p>
              ) : null}
              <div className="overflow-y-auto flex-1 min-h-0 -mr-2 pr-2">
                {workspacesLoading ? (
                  <div className="flex items-center justify-center gap-2 py-10 text-slate-600">
                    <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                    Loading workspaces…
                  </div>
                ) : workspaces.length === 0 ? (
                  <div className="text-center py-8 px-2">
                    <FolderPlus className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-600 mb-4">You don&apos;t have any workspaces yet.</p>
                    <Link
                      to="/workspace"
                      className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
                      onClick={() => setWorkspacePickerOpen(false)}
                    >
                      Create a workspace
                    </Link>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {workspaces.map((ws) => (
                      <li key={ws.id}>
                        <button
                          type="button"
                          disabled={addingWorkspaceId !== null}
                          onClick={() => void handleSelectWorkspace(ws.id)}
                          className="w-full flex items-center gap-3 text-left px-4 py-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors disabled:opacity-60"
                        >
                          <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                            {addingWorkspaceId === ws.id ? (
                              <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                            ) : (
                              <FolderOpen className="w-4 h-4 text-indigo-600" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-slate-900 truncate">{ws.name}</p>
                            {ws.description ? (
                              <p className="text-xs text-slate-500 line-clamp-1">{ws.description}</p>
                            ) : null}
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </>
  );
}

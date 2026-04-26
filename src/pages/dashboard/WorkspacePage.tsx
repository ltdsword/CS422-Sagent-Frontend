import { useState } from "react";
import { 
  FolderOpen, 
  Plus, 
  FileText, 
  Trash2, 
  Calendar,
  ArrowLeft,
  Sparkles,
  BookmarkPlus,
  Tag,
  X,
  MoreVertical,
  Search,
  Check
} from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Checkbox from "@radix-ui/react-checkbox";
import { format } from "date-fns";
import { toast, Toaster } from "sonner";

interface Workspace {
  id: string;
  name: string;
  description: string;
  paperCount: number;
  createdAt: Date;
}

interface Paper {
  id: string;
  title: string;
  authors: string;
  year: number;
  tags: string[];
}

interface LibraryPaper {
  id: string;
  title: string;
  authors: string;
  year: number;
  venue: string;
}

interface AIArtifact {
  id: string;
  name: string;
  type: string;
  createdAt: Date;
}

export function Workspaces() {
  const [Workspaces, setWorkspaces] = useState<Workspace[]>([
    {
      id: "1",
      name: "AI in Healthcare Diagnostics",
      description: "Exploring deep learning approaches for medical image analysis and disease detection",
      paperCount: 4,
      createdAt: new Date(2026, 2, 15)
    },
    {
      id: "2",
      name: "Climate Change ML Models",
      description: "Machine learning models for climate prediction and environmental impact assessment",
      paperCount: 3,
      createdAt: new Date(2026, 2, 20)
    },
    {
      id: "3",
      name: "Quantum Computing Advances",
      description: "Recent breakthroughs in quantum algorithms and hardware implementations",
      paperCount: 2,
      createdAt: new Date(2026, 2, 25)
    }
  ]);

  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [addPapersModalOpen, setAddPapersModalOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [newWorkspaceDescription, setNewWorkspaceDescription] = useState("");
  const [tagInputValue, setTagInputValue] = useState("");
  const [editingTagForPaper, setEditingTagForPaper] = useState<string | null>(null);
  const [selectedLibraryPapers, setSelectedLibraryPapers] = useState<string[]>([]);
  const [librarySearchQuery, setLibrarySearchQuery] = useState("");

  // Mock data for Workspace detail view
  const [WorkspacePapers, setWorkspacePapers] = useState<Paper[]>([
    {
      id: "p1",
      title: "Attention Is All You Need",
      authors: "Vaswani, A., Shazeer, N., Parmar, N., et al.",
      year: 2017,
      tags: ["Methodology", "Baseline"]
    },
    {
      id: "p2",
      title: "Deep Residual Learning for Image Recognition",
      authors: "He, K., Zhang, X., Ren, S., Sun, J.",
      year: 2016,
      tags: ["Results", "To Read"]
    },
    {
      id: "p3",
      title: "BERT: Pre-training of Deep Bidirectional Transformers",
      authors: "Devlin, J., Chang, M., Lee, K., Toutanova, K.",
      year: 2019,
      tags: ["Methodology"]
    },
    {
      id: "p4",
      title: "Generative Adversarial Networks",
      authors: "Goodfellow, I., Pouget-Abadie, J., Mirza, M.",
      year: 2014,
      tags: ["Theory", "Baseline"]
    }
  ]);

  const libraryPapers: LibraryPaper[] = [
    {
      id: "l1",
      title: "Neural Architecture Search with Reinforcement Learning",
      authors: "Zoph, B., Le, Q. V.",
      year: 2017,
      venue: "ICLR"
    },
    {
      id: "l2",
      title: "You Only Look Once: Unified, Real-Time Object Detection",
      authors: "Redmon, J., Divvala, S., Girshick, R., Farhadi, A.",
      year: 2016,
      venue: "CVPR"
    },
    {
      id: "l3",
      title: "ImageNet Classification with Deep Convolutional Neural Networks",
      authors: "Krizhevsky, A., Sutskever, I., Hinton, G. E.",
      year: 2012,
      venue: "NeurIPS"
    },
    {
      id: "l4",
      title: "Batch Normalization: Accelerating Deep Network Training",
      authors: "Ioffe, S., Szegedy, C.",
      year: 2015,
      venue: "ICML"
    }
  ];

  const [aiArtifacts] = useState<AIArtifact[]>([
    {
      id: "a1",
      name: "Comparison Table v1",
      type: "table",
      createdAt: new Date(2026, 2, 28)
    },
    {
      id: "a2",
      name: "Literature Review Draft",
      type: "document",
      createdAt: new Date(2026, 2, 27)
    },
    {
      id: "a3",
      name: "Research Gap Analysis",
      type: "analysis",
      createdAt: new Date(2026, 2, 26)
    }
  ]);

  const handleCreateWorkspace = () => {
    if (!newWorkspaceName.trim()) {
      toast.error("Please enter a Workspace name");
      return;
    }

    const newWorkspace: Workspace = {
      id: Date.now().toString(),
      name: newWorkspaceName,
      description: newWorkspaceDescription,
      paperCount: 0,
      createdAt: new Date()
    };

    setWorkspaces([newWorkspace, ...Workspaces]);
    setNewWorkspaceName("");
    setNewWorkspaceDescription("");
    setCreateModalOpen(false);
    toast.success("Workspace created successfully!");
  };

  const handleDeleteWorkspace = (WorkspaceId: string, WorkspaceName: string) => {
    setWorkspaces(Workspaces.filter(p => p.id !== WorkspaceId));
    toast.success(`"${WorkspaceName}" deleted`);
  };

  const handleAddTag = (paperId: string) => {
    if (tagInputValue.trim()) {
      setWorkspacePapers(papers =>
        papers.map(p =>
          p.id === paperId
            ? { ...p, tags: [...p.tags, tagInputValue.trim()] }
            : p
        )
      );
      toast.success(`Tag "${tagInputValue}" added`);
      setTagInputValue("");
      setEditingTagForPaper(null);
    }
  };

  const handleRemoveTag = (paperId: string, tagToRemove: string) => {
    setWorkspacePapers(papers =>
      papers.map(p =>
        p.id === paperId
          ? { ...p, tags: p.tags.filter(tag => tag !== tagToRemove) }
          : p
      )
    );
    toast.success(`Tag removed`);
  };

  const handleToggleLibraryPaper = (paperId: string) => {
    setSelectedLibraryPapers(prev =>
      prev.includes(paperId)
        ? prev.filter(id => id !== paperId)
        : [...prev, paperId]
    );
  };

  const handleAddPapersToWorkspace = () => {
    const count = selectedLibraryPapers.length;
    if (count === 0) {
      toast.error("Please select at least one paper");
      return;
    }

    // In a real app, you would add the selected papers to the Workspace
    toast.success(`${count} paper${count > 1 ? 's' : ''} added to Workspace`);
    setSelectedLibraryPapers([]);
    setAddPapersModalOpen(false);
  };

  const filteredLibraryPapers = libraryPapers.filter(paper => {
    const query = librarySearchQuery.toLowerCase();
    return (
      paper.title.toLowerCase().includes(query) ||
      paper.authors.toLowerCase().includes(query)
    );
  });

  if (selectedWorkspace) {
    return (
      <>
        <Toaster position="top-right" richColors />
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            {/* Back Button */}
            <button
              onClick={() => setSelectedWorkspace(null)}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Workspace
            </button>

            {/* Workspace Header */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                      ID: {selectedWorkspace.id}
                    </span>
                  </div>
                  <h1 className="text-slate-900 mb-2">{selectedWorkspace.name}</h1>
                  <p className="text-slate-600">{selectedWorkspace.description}</p>
                </div>
                <button
                  onClick={() => setAddPapersModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <BookmarkPlus className="w-4 h-4" />
                  Add Papers
                </button>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4" />
                  <span>{selectedWorkspace.paperCount} papers</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>Created {format(selectedWorkspace.createdAt, "MMM d, yyyy")}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Papers Table */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="p-6 border-b border-slate-200">
                    <h2 className="text-slate-900">Linked Papers</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="text-left px-6 py-3 text-sm text-slate-700">Title</th>
                          <th className="text-left px-6 py-3 text-sm text-slate-700">Authors</th>
                          <th className="text-left px-6 py-3 text-sm text-slate-700">Year</th>
                          <th className="text-left px-6 py-3 text-sm text-slate-700">User-defined Tags</th>
                          <th className="text-left px-6 py-3 text-sm text-slate-700"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {WorkspacePapers.map((paper) => (
                          <tr key={paper.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                              <p className="text-sm text-slate-900">{paper.title}</p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm text-slate-600">{paper.authors}</p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm text-slate-600">{paper.year}</p>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 flex-wrap">
                                {paper.tags.map((tag, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-md border border-indigo-200 group"
                                  >
                                    <Tag className="w-3 h-3" />
                                    {tag}
                                    <button
                                      onClick={() => handleRemoveTag(paper.id, tag)}
                                      className="ml-1 opacity-0 group-hover:opacity-100 hover:text-indigo-900 transition-opacity"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </span>
                                ))}
                                {editingTagForPaper === paper.id ? (
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="text"
                                      value={tagInputValue}
                                      onChange={(e) => setTagInputValue(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                          handleAddTag(paper.id);
                                        } else if (e.key === "Escape") {
                                          setEditingTagForPaper(null);
                                          setTagInputValue("");
                                        }
                                      }}
                                      placeholder="Add tag..."
                                      className="w-32 px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      autoFocus
                                    />
                                    <button
                                      onClick={() => handleAddTag(paper.id)}
                                      className="text-blue-600 hover:text-blue-700"
                                    >
                                      <Check className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        setEditingTagForPaper(null);
                                        setTagInputValue("");
                                      }}
                                      className="text-slate-400 hover:text-slate-600"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setEditingTagForPaper(paper.id)}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md border border-slate-200 hover:bg-slate-200 transition-colors"
                                  >
                                    <Plus className="w-3 h-3" />
                                    Add Tag
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                className="p-1 hover:bg-slate-200 rounded transition-colors"
                                onClick={() => toast.success("Paper removed from Workspace")}
                              >
                                <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-600" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* AI Insights Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-slate-900">AI Insights</h3>
                  </div>
                  <p className="text-sm text-slate-600 mb-6">Generated artifacts for this Workspace</p>

                  <div className="space-y-3">
                    {aiArtifacts.map((artifact) => (
                      <div
                        key={artifact.id}
                        className="group border border-slate-200 rounded-lg p-4 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-sm text-slate-900 group-hover:text-indigo-700 transition-colors">
                            {artifact.name}
                          </h4>
                          <DropdownMenu.Root>
                            <DropdownMenu.Trigger asChild>
                              <button className="p-1 hover:bg-slate-100 rounded transition-colors">
                                <MoreVertical className="w-4 h-4 text-slate-400" />
                              </button>
                            </DropdownMenu.Trigger>
                            <DropdownMenu.Portal>
                              <DropdownMenu.Content
                                className="bg-white rounded-lg shadow-xl border border-slate-200 p-1 min-w-[160px] z-50"
                                sideOffset={5}
                              >
                                <DropdownMenu.Item className="px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded cursor-pointer outline-none">
                                  View
                                </DropdownMenu.Item>
                                <DropdownMenu.Item className="px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded cursor-pointer outline-none">
                                  Download
                                </DropdownMenu.Item>
                                <DropdownMenu.Separator className="h-px bg-slate-200 my-1" />
                                <DropdownMenu.Item className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded cursor-pointer outline-none">
                                  Delete
                                </DropdownMenu.Item>
                              </DropdownMenu.Content>
                            </DropdownMenu.Portal>
                          </DropdownMenu.Root>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span className="capitalize">{artifact.type}</span>
                          <span>•</span>
                          <span>{format(artifact.createdAt, "MMM d")}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button className="w-full mt-4 py-2 text-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors">
                    Generate New Artifact
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add Papers Modal */}
        <Dialog.Root open={addPapersModalOpen} onOpenChange={setAddPapersModalOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm animate-in fade-in z-40" />
            <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden animate-in fade-in zoom-in-95 z-50">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title className="text-slate-900">Add Papers from Library</Dialog.Title>
                  <Dialog.Close className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                    <X className="w-5 h-5 text-slate-500" />
                  </Dialog.Close>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search library papers..."
                    value={librarySearchQuery}
                    onChange={(e) => setLibrarySearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="overflow-y-auto max-h-[50vh] p-6">
                <div className="space-y-2">
                  {filteredLibraryPapers.map((paper) => (
                    <label
                      key={paper.id}
                      className="flex items-start gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <Checkbox.Root
                        checked={selectedLibraryPapers.includes(paper.id)}
                        onCheckedChange={() => handleToggleLibraryPaper(paper.id)}
                        className="w-5 h-5 border-2 border-slate-300 rounded flex items-center justify-center data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 mt-0.5"
                      >
                        <Checkbox.Indicator>
                          <Check className="w-4 h-4 text-white" />
                        </Checkbox.Indicator>
                      </Checkbox.Root>
                      <div className="flex-1">
                        <p className="text-sm text-slate-900 mb-1">{paper.title}</p>
                        <div className="flex items-center gap-3 text-xs text-slate-600">
                          <span>{paper.authors}</span>
                          <span>•</span>
                          <span>{paper.year}</span>
                          <span>•</span>
                          <span>{paper.venue}</span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="p-6 border-t border-slate-200 bg-slate-50">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-600">
                    {selectedLibraryPapers.length} paper{selectedLibraryPapers.length !== 1 ? 's' : ''} selected
                  </p>
                  <div className="flex items-center gap-3">
                    <Dialog.Close className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm">
                      Cancel
                    </Dialog.Close>
                    <button
                      onClick={handleAddPapersToWorkspace}
                      disabled={selectedLibraryPapers.length === 0}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed text-sm"
                    >
                      Add to Workspace
                    </button>
                  </div>
                </div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </>
    );
  }

  return (
    <>
      <Toaster position="top-right" richColors />
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-slate-900 mb-2">My Workspace</h1>
              <p className="text-slate-600">Manage your research Workspaces and collections</p>
            </div>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Workspace
            </button>
          </div>

          {Workspaces.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <FolderOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h2 className="text-slate-900 mb-2">No Workspaces Yet</h2>
              <p className="text-slate-600 mb-6">Create your first Workspace to get started</p>
              <button
                onClick={() => setCreateModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Workspace
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm text-slate-700">Workspace ID</th>
                    <th className="text-left px-6 py-4 text-sm text-slate-700">Name</th>
                    <th className="text-left px-6 py-4 text-sm text-slate-700">Description</th>
                    <th className="text-left px-6 py-4 text-sm text-slate-700">Paper Count</th>
                    <th className="text-left px-6 py-4 text-sm text-slate-700">Created Date</th>
                    <th className="text-left px-6 py-4 text-sm text-slate-700"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {Workspaces.map((Workspace) => (
                    <tr 
                      key={Workspace.id} 
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => setSelectedWorkspace(Workspace)}
                    >
                      <td className="px-6 py-4">
                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                          {Workspace.id}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FolderOpen className="w-5 h-5 text-blue-600" />
                          </div>
                          <p className="text-sm text-slate-900 hover:text-blue-600 transition-colors">
                            {Workspace.name}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-600 line-clamp-2 max-w-md">
                          {Workspace.description}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full border border-indigo-200">
                          <FileText className="w-3.5 h-3.5" />
                          {Workspace.paperCount}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                          <Calendar className="w-4 h-4" />
                          {format(Workspace.createdAt, "MMM d, yyyy")}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <DropdownMenu.Root>
                          <DropdownMenu.Trigger asChild onClick={(e) => e.stopPropagation()}>
                            <button className="p-1 hover:bg-slate-200 rounded transition-colors">
                              <MoreVertical className="w-4 h-4 text-slate-400" />
                            </button>
                          </DropdownMenu.Trigger>
                          <DropdownMenu.Portal>
                            <DropdownMenu.Content
                              className="bg-white rounded-lg shadow-xl border border-slate-200 p-1 min-w-[160px] z-50"
                              sideOffset={5}
                            >
                              <DropdownMenu.Item
                                className="px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded cursor-pointer outline-none"
                                onClick={() => setSelectedWorkspace(Workspace)}
                              >
                                Open Workspace
                              </DropdownMenu.Item>
                              <DropdownMenu.Item className="px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded cursor-pointer outline-none">
                                Edit
                              </DropdownMenu.Item>
                              <DropdownMenu.Separator className="h-px bg-slate-200 my-1" />
                              <DropdownMenu.Item
                                className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded cursor-pointer outline-none"
                                onClick={() => handleDeleteWorkspace(Workspace.id, Workspace.name)}
                              >
                                Delete
                              </DropdownMenu.Item>
                            </DropdownMenu.Content>
                          </DropdownMenu.Portal>
                        </DropdownMenu.Root>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create Workspace Modal */}
        <Dialog.Root open={createModalOpen} onOpenChange={setCreateModalOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm animate-in fade-in z-40" />
            <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 z-50">
              <div className="flex items-center justify-between mb-6">
                <Dialog.Title className="text-slate-900">Create New Workspace</Dialog.Title>
                <Dialog.Close className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-slate-500" />
                </Dialog.Close>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-700 mb-2">
                    Workspace Name *
                  </label>
                  <input
                    type="text"
                    value={newWorkspaceName}
                    onChange={(e) => setNewWorkspaceName(e.target.value)}
                    placeholder="e.g., AI in Healthcare"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newWorkspaceDescription}
                    onChange={(e) => setNewWorkspaceDescription(e.target.value)}
                    placeholder="Brief description of your research Workspace..."
                    rows={4}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={handleCreateWorkspace}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Workspace
                </button>
                <Dialog.Close className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
                  Cancel
                </Dialog.Close>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </>
  );
}

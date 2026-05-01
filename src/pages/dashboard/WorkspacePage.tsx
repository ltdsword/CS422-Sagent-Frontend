import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FolderOpen,
  LogIn,
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
  Check,
  Loader2,
  Pencil,
} from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { format, parseISO } from "date-fns";
import { toast, Toaster } from "sonner";

import {
  createTag,
  createWorkspace,
  deleteTag,
  deleteWorkspace,
  deleteWorkspacePaper,
  listTags,
  listWorkspacePapers,
  listWorkspaces,
  updateWorkspace,
} from "@/features/workspaces/api/workspaces-api";
import { listLibraryPapers as fetchLibraryPapers } from "@/features/workspaces/api/library-papers-api";
import type { LibraryPaperRecord, WorkspaceDto, WorkspacePaperDto } from "@/features/workspaces/types";
import { getApiErrorMessage } from "@/features/workspaces/utils/api-error";
import { useAuth } from "@/shared/hooks/useAuth";

type WorkspacePaperRow = {
  linkId: number;
  libraryPaperId: number;
  title: string;
  authors: string;
  year: number | null;
  venue: string;
  tags: string[];
};

function buildPaperRows(
  links: WorkspacePaperDto[],
  libraryById: Map<number, LibraryPaperRecord>,
): WorkspacePaperRow[] {
  return links.map((link) => {
    const meta = libraryById.get(link.paper);
    return {
      linkId: link.id,
      libraryPaperId: link.paper,
      title: meta?.title ?? `Paper #${link.paper}`,
      authors: meta?.authors ?? "—",
      year: meta?.year ?? null,
      venue: meta?.venue ?? "",
      tags: [...link.tags],
    };
  });
}

export function Workspaces() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [workspaces, setWorkspaces] = useState<WorkspaceDto[]>([]);
  const [workspacePaperCounts, setWorkspacePaperCounts] = useState<Record<string, number>>({});
  const [listLoading, setListLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);
  const [paperRows, setPaperRows] = useState<WorkspacePaperRow[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState<WorkspaceDto | null>(null);

  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [newWorkspaceDescription, setNewWorkspaceDescription] = useState("");
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const [tagInputValue, setTagInputValue] = useState("");
  const [editingTagForLinkId, setEditingTagForLinkId] = useState<number | null>(null);
  const selectedWorkspace = useMemo(
    () => workspaces.find((w) => w.id === selectedWorkspaceId) ?? null,
    [workspaces, selectedWorkspaceId],
  );

  const paperCountForSelected = useMemo(() => {
    if (!selectedWorkspaceId) {
      return 0;
    }
    return paperRows.length;
  }, [paperRows.length, selectedWorkspaceId]);

  /** Same idea as the API “credentials not provided” response—tell the user clearly, without raw Django text. */
  const notifyLoginRequiredForWorkspaces = useCallback(() => {
    toast.message("Please log in", {
      description: "You need to sign in to view and manage workspaces.",
      action: {
        label: "Log in",
        onClick: () => void navigate("/login"),
      },
    });
  }, [navigate]);

  const guestWorkspacesToastShownRef = useRef(false);

  const openCreateWorkspaceModal = useCallback(() => {
    if (!isAuthenticated) {
      notifyLoginRequiredForWorkspaces();
      return;
    }
    setCreateModalOpen(true);
  }, [isAuthenticated, notifyLoginRequiredForWorkspaces]);

  const refreshWorkspaceList = useCallback(async () => {
    if (!isAuthenticated) {
      setWorkspaces([]);
      setListLoading(false);
      return;
    }

    setListLoading(true);
    try {
      const data = await listWorkspaces();
      setWorkspaces(data);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not load workspaces"));
    } finally {
      setListLoading(false);
    }
  }, [isAuthenticated]);

  const refreshWorkspaceDetail = useCallback(async (workspaceId: string) => {
    if (!isAuthenticated) {
      setPaperRows([]);
      setDetailLoading(false);
      return;
    }

    setDetailLoading(true);
    try {
      const [links, lib] = await Promise.all([
        listWorkspacePapers(),
        fetchLibraryPapers().catch(() => [] as LibraryPaperRecord[]),
      ]);

      const libraryById = new Map(lib.map((p) => [p.id, p]));
      const forWorkspace = links.filter((l) => l.workspace === workspaceId);
      setPaperRows(buildPaperRows(forWorkspace, libraryById));
      setWorkspacePaperCounts((prev) => ({
        ...prev,
        [workspaceId]: forWorkspace.length,
      }));
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not load workspace papers"));
    } finally {
      setDetailLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setSelectedWorkspaceId(null);
      setCreateModalOpen(false);
      setEditModalOpen(false);
      setEditingWorkspace(null);
      setWorkspacePaperCounts({});
      setPaperRows([]);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      guestWorkspacesToastShownRef.current = false;
      return;
    }
    if (listLoading) {
      return;
    }
    if (guestWorkspacesToastShownRef.current) {
      return;
    }
    guestWorkspacesToastShownRef.current = true;
    notifyLoginRequiredForWorkspaces();
  }, [isAuthenticated, listLoading, notifyLoginRequiredForWorkspaces]);

  useEffect(() => {
    void refreshWorkspaceList();
  }, [refreshWorkspaceList]);

  useEffect(() => {
    if (selectedWorkspaceId) {
      void refreshWorkspaceDetail(selectedWorkspaceId);
    } else {
      setPaperRows([]);
    }
  }, [selectedWorkspaceId, refreshWorkspaceDetail]);

  const handleCreateWorkspace = async () => {
    if (!isAuthenticated) {
      notifyLoginRequiredForWorkspaces();
      return;
    }

    const name = newWorkspaceName.trim();
    if (!name) {
      toast.error("Please enter a workspace name");
      return;
    }
    if (name.length > 50) {
      toast.error("Name must be at most 50 characters");
      return;
    }
    const description = newWorkspaceDescription.trim();
    if (description.length > 500) {
      toast.error("Description must be at most 500 characters");
      return;
    }

    try {
      const created = await createWorkspace({ name, description });
      setWorkspaces((prev) => [created, ...prev.filter((w) => w.id !== created.id)]);
      setWorkspacePaperCounts((prev) => ({ ...prev, [created.id]: 0 }));
      toast.success("Workspace created");
      setNewWorkspaceName("");
      setNewWorkspaceDescription("");
      setCreateModalOpen(false);
      await refreshWorkspaceList();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not create workspace"));
    }
  };

  const handleOpenEdit = (ws: WorkspaceDto) => {
    setEditingWorkspace(ws);
    setEditName(ws.name);
    setEditDescription(ws.description ?? "");
    setEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingWorkspace) {
      return;
    }
    const name = editName.trim();
    if (!name) {
      toast.error("Please enter a workspace name");
      return;
    }
    if (name.length > 50) {
      toast.error("Name must be at most 50 characters");
      return;
    }
    const description = editDescription.trim();
    if (description.length > 500) {
      toast.error("Description must be at most 500 characters");
      return;
    }

    try {
      await updateWorkspace(editingWorkspace.id, { name, description });
      toast.success("Workspace updated");
      setEditModalOpen(false);
      setEditingWorkspace(null);
      await refreshWorkspaceList();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not update workspace"));
    }
  };

  const handleDeleteWorkspace = async (workspaceId: string, workspaceName: string) => {
    if (!window.confirm(`Delete workspace "${workspaceName}"? This cannot be undone.`)) {
      return;
    }
    try {
      await deleteWorkspace(workspaceId);
      toast.success(`"${workspaceName}" deleted`);
      if (selectedWorkspaceId === workspaceId) {
        setSelectedWorkspaceId(null);
      }
      setWorkspacePaperCounts((prev) => {
        const next = { ...prev };
        delete next[workspaceId];
        return next;
      });
      await refreshWorkspaceList();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not delete workspace"));
    }
  };

  const handleAddTag = async (linkId: number) => {
    const raw = tagInputValue.trim();
    if (!raw) {
      return;
    }
    if (raw.length > 20) {
      toast.error("Tag must be at most 20 characters");
      return;
    }

    try {
      await createTag({ workspace_paper: linkId, name: raw });
      toast.success(`Tag "${raw}" added`);
      setTagInputValue("");
      setEditingTagForLinkId(null);
      if (selectedWorkspaceId) {
        await refreshWorkspaceDetail(selectedWorkspaceId);
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not add tag"));
    }
  };

  const handleRemoveTag = async (linkId: number, tagName: string) => {
    try {
      const tags = await listTags();
      const match = tags.find((t) => t.workspace_paper === linkId && t.name === tagName);
      if (!match) {
        toast.error("Tag not found; refresh and try again");
        return;
      }
      await deleteTag(match.id);
      toast.success("Tag removed");
      if (selectedWorkspaceId) {
        await refreshWorkspaceDetail(selectedWorkspaceId);
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not remove tag"));
    }
  };

  const handleRemovePaperLink = async (linkId: number, title: string) => {
    if (!window.confirm(`Remove "${title}" from this workspace?`)) {
      return;
    }
    try {
      await deleteWorkspacePaper(linkId);
      toast.success("Paper removed from workspace");
      if (selectedWorkspaceId) {
        await refreshWorkspaceDetail(selectedWorkspaceId);
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not remove paper"));
    }
  };

  if (selectedWorkspace) {
    const createdAt = (() => {
      try {
        return parseISO(selectedWorkspace.created_date);
      } catch {
        return new Date(selectedWorkspace.created_date);
      }
    })();

    return (
      <>
        <Toaster position="top-right" richColors />
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            <button
              type="button"
              onClick={() => setSelectedWorkspaceId(null)}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to workspaces
            </button>

            <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
              <div className="flex items-start justify-between mb-4 gap-4">
                <div className="flex-1 min-w-0">
                  <h1 className="text-slate-900 mb-2">{selectedWorkspace.name}</h1>
                  <p className="text-slate-600 whitespace-pre-wrap">{selectedWorkspace.description}</p>
                </div>
                <div className="flex flex-shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(selectedWorkspace)}
                    className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void navigate("/discovery")}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <BookmarkPlus className="w-4 h-4" />
                    Add papers
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-600 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4" />
                  <span>{paperCountForSelected} papers</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>Created {format(createdAt, "MMM d, yyyy")}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="p-6 border-b border-slate-200 flex items-center justify-between gap-3">
                    <h2 className="text-slate-900">Linked papers</h2>
                    {detailLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin text-slate-400" aria-hidden />
                    ) : null}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="text-left px-6 py-3 text-sm text-slate-700">Title</th>
                          <th className="text-left px-6 py-3 text-sm text-slate-700">Authors</th>
                          <th className="text-left px-6 py-3 text-sm text-slate-700">Year</th>
                          <th className="text-left px-6 py-3 text-sm text-slate-700">Library ID</th>
                          <th className="text-left px-6 py-3 text-sm text-slate-700">Tags</th>
                          <th className="text-left px-6 py-3 text-sm text-slate-700"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {!detailLoading && paperRows.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-600">
                              No papers in this workspace yet. Go to Paper Discovery to add papers from your
                              library.
                            </td>
                          </tr>
                        ) : null}
                        {paperRows.map((paper) => (
                          <tr key={paper.linkId} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                              <p className="text-sm text-slate-900">{paper.title}</p>
                              {paper.venue ? (
                                <p className="text-xs text-slate-500 mt-1">{paper.venue}</p>
                              ) : null}
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm text-slate-600">{paper.authors}</p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm text-slate-600">
                                {paper.year !== null ? paper.year : "—"}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-xs text-slate-600">{paper.libraryPaperId}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 flex-wrap">
                                {paper.tags.map((tag) => (
                                  <span
                                    key={`${paper.linkId}-${tag}`}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-md border border-indigo-200 group"
                                  >
                                    <Tag className="w-3 h-3" />
                                    {tag}
                                    <button
                                      type="button"
                                      onClick={() => void handleRemoveTag(paper.linkId, tag)}
                                      className="ml-1 opacity-0 group-hover:opacity-100 hover:text-indigo-900 transition-opacity"
                                      aria-label={`Remove tag ${tag}`}
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </span>
                                ))}
                                {editingTagForLinkId === paper.linkId ? (
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="text"
                                      value={tagInputValue}
                                      onChange={(e) => setTagInputValue(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                          void handleAddTag(paper.linkId);
                                        } else if (e.key === "Escape") {
                                          setEditingTagForLinkId(null);
                                          setTagInputValue("");
                                        }
                                      }}
                                      placeholder="Add tag..."
                                      className="w-32 px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      autoFocus
                                      maxLength={20}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => void handleAddTag(paper.linkId)}
                                      className="text-blue-600 hover:text-blue-700"
                                      aria-label="Save tag"
                                    >
                                      <Check className="w-4 h-4" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingTagForLinkId(null);
                                        setTagInputValue("");
                                      }}
                                      className="text-slate-400 hover:text-slate-600"
                                      aria-label="Cancel tag edit"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setEditingTagForLinkId(paper.linkId)}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md border border-slate-200 hover:bg-slate-200 transition-colors"
                                  >
                                    <Plus className="w-3 h-3" />
                                    Add tag
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                type="button"
                                className="p-1 hover:bg-slate-200 rounded transition-colors"
                                onClick={() => void handleRemovePaperLink(paper.linkId, paper.title)}
                                aria-label="Remove paper from workspace"
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

              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-slate-900">AI insights</h3>
                  </div>
                  <p className="text-sm text-slate-600">
                    Generated artifacts for this workspace will appear here when connected from
                    Synthesis Lab.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Dialog.Root open={editModalOpen} onOpenChange={setEditModalOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm animate-in fade-in z-40" />
            <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 z-50">
              <div className="flex items-center justify-between mb-6">
                <Dialog.Title className="text-slate-900">Edit workspace</Dialog.Title>
                <Dialog.Close className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-slate-500" />
                </Dialog.Close>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-700 mb-2">Workspace name *</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    maxLength={50}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-700 mb-2">Description</label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    maxLength={500}
                    rows={4}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => void handleSaveEdit()}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center justify-center gap-2"
                >
                  <Pencil className="w-4 h-4" />
                  Save changes
                </button>
                <Dialog.Close className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
                  Cancel
                </Dialog.Close>
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
          <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
            <div>
              <h1 className="text-slate-900 mb-2">My workspaces</h1>
              <p className="text-slate-600">Manage your research workspaces and linked papers</p>
            </div>
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => openCreateWorkspaceModal()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                New workspace
              </button>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Log in to create
              </Link>
            )}
          </div>

          {listLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-slate-400" aria-hidden />
            </div>
          ) : workspaces.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <FolderOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              {isAuthenticated ? (
                <>
                  <h2 className="text-slate-900 mb-2">No workspaces yet</h2>
                  <p className="text-slate-600 mb-6">Create your first workspace to get started</p>
                  <button
                    type="button"
                    onClick={() => openCreateWorkspaceModal()}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Create workspace
                  </button>
                </>
              ) : (
                <>
                  <h2 className="text-slate-900 mb-2">Sign in to use workspaces</h2>
                  <p className="text-slate-600 mb-6">
                    Log in to create workspaces and organize papers. Guests cannot create workspaces.
                  </p>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    Log in
                  </Link>
                </>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm text-slate-700">Name</th>
                    <th className="text-left px-6 py-4 text-sm text-slate-700">Description</th>
                    <th className="text-left px-6 py-4 text-sm text-slate-700">Paper count</th>
                    <th className="text-left px-6 py-4 text-sm text-slate-700">Created</th>
                    <th className="text-left px-6 py-4 text-sm text-slate-700"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {workspaces.map((ws) => {
                    const created = (() => {
                      try {
                        return parseISO(ws.created_date);
                      } catch {
                        return new Date(ws.created_date);
                      }
                    })();

                    return (
                      <tr
                        key={ws.id}
                        className="hover:bg-slate-50 transition-colors cursor-pointer"
                        onClick={() => setSelectedWorkspaceId(ws.id)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <FolderOpen className="w-5 h-5 text-blue-600" />
                            </div>
                            <p className="text-sm text-slate-900 hover:text-blue-600 transition-colors">
                              {ws.name}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-slate-600 line-clamp-2 max-w-md">
                            {ws.description}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <PaperCountBadge count={workspacePaperCounts[ws.id]} />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-sm text-slate-600">
                            <Calendar className="w-4 h-4" />
                            {format(created, "MMM d, yyyy")}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <DropdownMenu.Root>
                            <DropdownMenu.Trigger asChild>
                              <button
                                type="button"
                                className="p-1 hover:bg-slate-200 rounded transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
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
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedWorkspaceId(ws.id);
                                  }}
                                >
                                  Open workspace
                                </DropdownMenu.Item>
                                <DropdownMenu.Item
                                  className="px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded cursor-pointer outline-none"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenEdit(ws);
                                  }}
                                >
                                  Edit
                                </DropdownMenu.Item>
                                <DropdownMenu.Separator className="h-px bg-slate-200 my-1" />
                                <DropdownMenu.Item
                                  className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded cursor-pointer outline-none"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    void handleDeleteWorkspace(ws.id, ws.name);
                                  }}
                                >
                                  Delete
                                </DropdownMenu.Item>
                              </DropdownMenu.Content>
                            </DropdownMenu.Portal>
                          </DropdownMenu.Root>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Dialog.Root
        open={createModalOpen}
        onOpenChange={(open) => {
          if (open && !isAuthenticated) {
            notifyLoginRequiredForWorkspaces();
            return;
          }
          setCreateModalOpen(open);
        }}
      >
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm animate-in fade-in z-40" />
            <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 z-50">
              <div className="flex items-center justify-between mb-6">
                <Dialog.Title className="text-slate-900">Create workspace</Dialog.Title>
                <Dialog.Close className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-slate-500" />
                </Dialog.Close>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-700 mb-2">Workspace name *</label>
                  <input
                    type="text"
                    value={newWorkspaceName}
                    onChange={(e) => setNewWorkspaceName(e.target.value)}
                    placeholder="e.g., Literature review"
                    maxLength={50}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-700 mb-2">Description</label>
                  <textarea
                    value={newWorkspaceDescription}
                    onChange={(e) => setNewWorkspaceDescription(e.target.value)}
                    placeholder="Brief description..."
                    maxLength={500}
                    rows={4}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => void handleCreateWorkspace()}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create
                </button>
                <Dialog.Close className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
                  Cancel
                </Dialog.Close>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}

function PaperCountBadge({ count }: { count: number | undefined }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full border border-indigo-200">
      <FileText className="w-3.5 h-3.5" />
      {count === undefined ? "—" : count}
    </span>
  );
}

export type WorkspaceDto = {
  id: string;
  created_date: string;
  description: string;
  name: string;
  owner: number;
};

export type WorkspacePaperDto = {
  id: number;
  workspace: string;
  paper: string;
  tags: string[];
};

export type TagDto = {
  id: number;
  workspace_paper: number;
  name: string;
};

export type LibraryPaperRecord = {
  id: string;
  title: string;
  authors: string;
  year: number | null;
  venue: string;
  abstract?: string | null;
  pdf_url?: string | null;
};

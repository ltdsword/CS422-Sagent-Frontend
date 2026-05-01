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
  paper: number;
  tags: string[];
};

export type TagDto = {
  id: number;
  workspace_paper: number;
  name: string;
};

export type LibraryPaperRecord = {
  id: number;
  title: string;
  authors: string;
  year: number | null;
  venue: string;
};

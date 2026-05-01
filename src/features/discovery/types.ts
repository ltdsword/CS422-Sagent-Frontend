type Author = {
  id: number | string;
  name: string;
};

export type DiscoveryPaper = {
  id: string;
  title: string;
  authors: Author[];
  year: number | null;
  venue?: string;
  abstract?: string;
  pdf_url?: string;
  distance?: number; // optional search distance (lower is closer)
};

export type RawPaperRecord = Record<string, unknown>;

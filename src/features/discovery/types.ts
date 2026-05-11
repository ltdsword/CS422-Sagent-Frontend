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

/** Paginated search response from `POST /library/papers/search/`. */
export type DiscoverySearchMeta = {
  count: number;
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
};

export type DiscoverySearchPage = {
  papers: DiscoveryPaper[];
  meta: DiscoverySearchMeta;
};

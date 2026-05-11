import axiosInstance from "@/shared/utils/axios-instance";
import { parseLibraryPaperJson } from "@/shared/utils/json-bigint";
import type { DiscoveryPaper, DiscoverySearchMeta, DiscoverySearchPage } from "../types";
import type { LibraryPaperListDto } from "@/features/library/types";

type Author = { id: number | string; name: string };

function coerceAuthorId(id: unknown, fallback: number): number | string {
  if (typeof id === "number" || typeof id === "string") return id;
  return fallback;
}

function normalizeAuthorsField(authors: unknown): Author[] {
  if (Array.isArray(authors)) {
    return authors.map((a, i) => {
      if (a && typeof a === "object" && "name" in (a as object)) {
        const o = a as { id?: unknown; name?: unknown };
        return { id: coerceAuthorId(o.id, i), name: String(o.name ?? "") };
      }
      return { id: i, name: String(a) };
    });
  }
  if (typeof authors === "string") {
    return authors
      .split(/,\s*/)
      .map((name, i) => ({ id: i, name: name.trim() }))
      .filter((a) => a.name.length > 0);
  }
  return [];
}

const LIBRARY_SEARCH_PATH =
  (import.meta.env.VITE_LIBRARY_PAPERS_PATH?.trim() || "/library/papers/") + "search/";

function unwrapListPayload(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === "object" && "results" in payload) {
    const results = (payload as { results?: unknown }).results;
    return Array.isArray(results) ? results : [];
  }
  return [];
}

function readInt(v: unknown, fallback: number): number {
  if (typeof v === "number" && Number.isFinite(v)) return Math.trunc(v);
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    if (Number.isFinite(n)) return Math.trunc(n);
  }
  return fallback;
}

function readBool(v: unknown, fallback: boolean): boolean {
  if (typeof v === "boolean") return v;
  return fallback;
}

function extractPaginationMeta(payload: unknown, papers: DiscoveryPaper[]): DiscoverySearchMeta {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    const n = papers.length;
    return {
      count: n,
      total_count: n,
      page: 1,
      page_size: Math.max(1, n),
      total_pages: n > 0 ? 1 : 0,
      has_next: false,
      has_previous: false,
    };
  }
  const o = payload as Record<string, unknown>;
  const page = readInt(o.page, 1);
  const pageSize = readInt(o.page_size ?? o.limit, Math.max(1, papers.length));
  const totalCount = readInt(o.total_count, readInt(o.count, papers.length));
  const count = readInt(o.count, papers.length);
  const computedTotalPages = pageSize > 0 ? Math.ceil(totalCount / pageSize) : 0;
  const totalPages = readInt(o.total_pages, computedTotalPages);
  return {
    count,
    total_count: totalCount,
    page,
    page_size: pageSize,
    total_pages: totalPages,
    has_next: readBool(o.has_next, page < totalPages),
    has_previous: readBool(o.has_previous, page > 1),
  };
}

function normalizeFromLibrary(row: unknown): DiscoveryPaper | null {
  if (!row || typeof row !== "object") return null;
  const lib = row as LibraryPaperListDto & Record<string, unknown>;
  const rawId = (lib as any).id ?? (lib as any).pk;
  if (rawId === undefined || rawId === null) return null;
  const id = String(rawId);
  const venue = lib.venue && typeof lib.venue === "object" ? (lib.venue as any).name ?? "" : String(lib.venue ?? "");

  return {
    id,
    title: String(lib.title ?? `Paper #${id}`),
    authors: normalizeAuthorsField(lib.authors),
    year: typeof lib.year === "number" ? lib.year : lib.year ? Number(lib.year) : null,
    venue: venue,
    abstract: (lib as any).abstract ?? undefined,
    pdf_url: lib.pdf_url ?? undefined,
    distance: typeof (lib as any).distance === 'number' ? (lib as any).distance : typeof (lib as any).distance === 'string' ? Number((lib as any).distance) : undefined,
  };
} 

/**
 * Perform a semantic search against the library search endpoint.
 * `params` should be the POST body accepted by the backend (query, filters, page, page_size, etc.)
 */
export async function searchDiscoveryPapers(
  params?: Record<string, unknown>,
): Promise<DiscoverySearchPage> {
  const { data } = await axiosInstance.post<string>(LIBRARY_SEARCH_PATH, params ?? {}, {
    responseType: "text",
    transformResponse: [(r) => r],
  });
  const rawText = typeof data === "string" ? data : String(data);
  const parsed = parseLibraryPaperJson(rawText);
  const rows = unwrapListPayload(parsed) as unknown[];
  const papers: DiscoveryPaper[] = [];

  for (const row of rows) {
    const normalized = normalizeFromLibrary(row);
    if (normalized) papers.push(normalized);
  }

  return { papers, meta: extractPaginationMeta(parsed, papers) };
}

/** @deprecated Use `searchDiscoveryPapers` for pagination metadata. */
export async function listDiscoveryPapers(params?: Record<string, unknown>): Promise<DiscoveryPaper[]> {
  const { papers } = await searchDiscoveryPapers(params);
  return papers;
}

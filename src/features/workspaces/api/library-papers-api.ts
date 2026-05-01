import axiosInstance from "@/shared/utils/axios-instance";
import type { LibraryPaperRecord } from "../types";

const LIBRARY_PAPERS_PATH =
  import.meta.env.VITE_LIBRARY_PAPERS_PATH?.trim() || "/library/papers/";

function coerceAuthors(authors: unknown): string {
  if (typeof authors === "string") {
    return authors;
  }
  if (Array.isArray(authors)) {
    return authors.map((a) => (typeof a === "string" ? a : JSON.stringify(a))).join(", ");
  }
  return "";
}

function normalizePaper(raw: Record<string, unknown>): LibraryPaperRecord | null {
  const id = raw.id ?? raw.pk;
  if (typeof id !== "number" && typeof id !== "string") {
    return null;
  }
  const numericId = typeof id === "number" ? id : Number(id);
  if (!Number.isFinite(numericId)) {
    return null;
  }

  const title = typeof raw.title === "string" ? raw.title : "Untitled paper";
  const authors = coerceAuthors(raw.authors ?? raw.author ?? raw.author_list);
  const yearRaw = raw.year ?? raw.publication_year;
  const year =
    typeof yearRaw === "number"
      ? yearRaw
      : typeof yearRaw === "string"
        ? Number(yearRaw)
        : null;
  const venueRaw = raw.venue ?? raw.journal ?? raw.booktitle ?? "";
  const venue = typeof venueRaw === "string" ? venueRaw : "";

  return {
    id: numericId,
    title,
    authors,
    year: year !== null && Number.isFinite(year) ? year : null,
    venue,
  };
}

function unwrapListPayload(payload: unknown): unknown[] {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (payload && typeof payload === "object" && "results" in payload) {
    const results = (payload as { results?: unknown }).results;
    return Array.isArray(results) ? results : [];
  }
  return [];
}

/** Fetches library papers for the “add to workspace” flow (numeric ids match workspace-paper create). */
export async function listLibraryPapers(): Promise<LibraryPaperRecord[]> {
  const { data } = await axiosInstance.get<unknown>(LIBRARY_PAPERS_PATH);
  const rows = unwrapListPayload(data);
  const papers: LibraryPaperRecord[] = [];

  for (const row of rows) {
    if (row && typeof row === "object") {
      const normalized = normalizePaper(row as Record<string, unknown>);
      if (normalized) {
        papers.push(normalized);
      }
    }
  }

  return papers;
}

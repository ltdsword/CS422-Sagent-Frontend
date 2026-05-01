import axiosInstance from "@/shared/utils/axios-instance";
import { parseLibraryPaperJson } from "@/shared/utils/json-bigint";
import type { LibraryPaperRecord } from "../types";

const LIBRARY_PAPERS_PATH =
  import.meta.env.VITE_LIBRARY_PAPERS_PATH?.trim() || "/library/papers/";

function coerceAuthors(authors: unknown): string {
  if (typeof authors === "string") {
    return authors;
  }
  if (Array.isArray(authors)) {
    return authors
      .map((a) => {
        if (typeof a === "string") return a;
        if (a && typeof a === "object" && "name" in a) {
          return String((a as { name?: unknown }).name ?? "");
        }
        return "";
      })
      .filter((s) => s.length > 0)
      .join(", ");
  }
  return "";
}

function venueToString(venueRaw: unknown): string {
  if (typeof venueRaw === "string") {
    return venueRaw;
  }
  if (venueRaw && typeof venueRaw === "object" && "name" in venueRaw) {
    return String((venueRaw as { name?: unknown }).name ?? "");
  }
  return "";
}

function normalizePaper(raw: Record<string, unknown>): LibraryPaperRecord | null {
  const id = raw.id ?? raw.pk;
  if (typeof id !== "number" && typeof id !== "string") {
    return null;
  }
  const idStr = String(id);

  const title = typeof raw.title === "string" ? raw.title : "Untitled paper";
  const authors = coerceAuthors(raw.authors ?? raw.author ?? raw.author_list);
  const yearRaw = raw.year ?? raw.publication_year;
  const year =
    typeof yearRaw === "number"
      ? yearRaw
      : typeof yearRaw === "string"
        ? Number(yearRaw)
        : null;
  const venue =
    venueToString(raw.venue) ||
    (typeof raw.journal === "string" ? raw.journal : "") ||
    (typeof raw.booktitle === "string" ? raw.booktitle : "");

  const abstract =
    typeof raw.abstract === "string"
      ? raw.abstract
      : typeof raw.summary === "string"
        ? raw.summary
        : null;
  const pdf_url =
    typeof raw.pdf_url === "string"
      ? raw.pdf_url
      : typeof raw.pdfUrl === "string"
        ? raw.pdfUrl
        : null;

  return {
    id: idStr,
    title,
    authors,
    year: year !== null && Number.isFinite(year) ? year : null,
    venue,
    abstract,
    pdf_url,
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

function detailUrlForPaperId(id: string): string {
  const base = LIBRARY_PAPERS_PATH.endsWith("/") ? LIBRARY_PAPERS_PATH : `${LIBRARY_PAPERS_PATH}/`;
  return `${base}${encodeURIComponent(id)}/`;
}

/** Single paper from the library detail endpoint (correct metadata even when the paper is not on list page 1). */
export async function getLibraryPaper(id: string): Promise<LibraryPaperRecord | null> {
  try {
    const { data } = await axiosInstance.get<string>(detailUrlForPaperId(id), {
      responseType: "text",
      transformResponse: [(r) => r],
    });
    const rawText = typeof data === "string" ? data : String(data);
    const parsed = parseLibraryPaperJson(rawText);
    if (!parsed || typeof parsed !== "object") {
      return null;
    }
    return normalizePaper(parsed as Record<string, unknown>);
  } catch {
    return null;
  }
}

/** Fetches library papers for the “add to workspace” flow (numeric ids match workspace-paper create). */
export async function listLibraryPapers(): Promise<LibraryPaperRecord[]> {
  const { data } = await axiosInstance.get<string>(LIBRARY_PAPERS_PATH, {
    responseType: "text",
    transformResponse: [(r) => r],
  });
  const payload = parseLibraryPaperJson(typeof data === "string" ? data : String(data));
  const rows = unwrapListPayload(payload);
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

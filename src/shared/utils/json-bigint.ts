/**
 * Django often serializes Paper PKs as JSON numbers; values beyond Number.MAX_SAFE_INTEGER
 * are rounded by JSON.parse. Quote affected fields before parsing so IDs stay exact strings.
 */

export function parseWorkspacePaperJson(raw: string): unknown {
  const sanitized = raw.replace(/"paper"\s*:\s*(\d+)/g, '"paper":"$1"');
  return JSON.parse(sanitized) as unknown;
}

/** Library list/detail/search payloads: paper rows use numeric `"id"` for Paper PK. */
export function parseLibraryPaperJson(raw: string): unknown {
  const sanitized = raw.replace(/"id"\s*:\s*(\d+)\b/g, '"id":"$1"');
  return JSON.parse(sanitized) as unknown;
}

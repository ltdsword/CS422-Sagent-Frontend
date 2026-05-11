/** Workspace detail URLs: `/workspace/:workspaceId` (not the bare `/workspace` list). */
export function parseWorkspaceIdFromPathname(pathname: string): string | undefined {
  const m = pathname.match(/^\/workspace\/([^/]+)\/?$/);
  if (!m?.[1]) {
    return undefined;
  }
  try {
    return decodeURIComponent(m[1]);
  } catch {
    return m[1];
  }
}

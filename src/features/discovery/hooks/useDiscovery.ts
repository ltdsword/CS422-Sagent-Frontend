import { useCallback, useEffect, useMemo, useState } from "react";
import type { DiscoveryPaper, DiscoverySearchMeta } from "../types";
import { searchDiscoveryPapers } from "../api/papers-api";

const emptyMeta = (): DiscoverySearchMeta => ({
  count: 0,
  total_count: 0,
  page: 1,
  page_size: 10,
  total_pages: 0,
  has_next: false,
  has_previous: false,
});

export function useDiscovery(params?: Record<string, unknown>) {
  const [data, setData] = useState<DiscoveryPaper[] | null>(null);
  const [meta, setMeta] = useState<DiscoverySearchMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const paramsKey = useMemo(() => JSON.stringify(params ?? {}), [params]);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let body: Record<string, unknown> | undefined = undefined;
      try {
        body = paramsKey ? JSON.parse(paramsKey) : undefined;
      } catch {
        body = undefined;
      }

      const { papers, meta: nextMeta } = await searchDiscoveryPapers(body);
      setData(papers);
      setMeta(nextMeta);
    } catch (err) {
      setError(err as Error);
      setData([]);
      setMeta(emptyMeta());
    } finally {
      setLoading(false);
    }
  }, [paramsKey]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!mounted) return;
      await fetch();
    })();
    return () => {
      mounted = false;
    };
  }, [fetch]);

  return { data, meta, loading, error, refetch: fetch } as const;
}

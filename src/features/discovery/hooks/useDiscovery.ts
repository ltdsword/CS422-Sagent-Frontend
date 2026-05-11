import { useCallback, useEffect, useMemo, useState } from "react";
import type { DiscoveryPaper } from "../types";
import { listDiscoveryPapers } from "../api/papers-api";

export function useDiscovery(params?: Record<string, unknown>) {
  const [data, setData] = useState<DiscoveryPaper[] | null>(null);
  const [totalCount, setTotalCount] = useState<number | null>(null);
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

      const { papers, totalCount: count } = await listDiscoveryPapers(body);
      setData(papers);
      setTotalCount(count);
    } catch (err) {
      setError(err as Error);
      setData([]);
      setTotalCount(null);
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

  return { data, totalCount, loading, error, refetch: fetch } as const;
}

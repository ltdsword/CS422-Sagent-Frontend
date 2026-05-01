import PaperCard from "./PaperCard";
import type { DiscoveryPaper } from "../types";

export default function PaperList({
  papers,
  onAddToWorkspace,
}: {
  papers: DiscoveryPaper[];
  onAddToWorkspace?: (p: DiscoveryPaper) => void;
}) {
  if (!papers || papers.length === 0) {
    return <div className="text-sm text-slate-600">No papers found.</div>;
  }

  return (
    <div className="space-y-4">
      {papers.map((p) => (
        <PaperCard key={p.id} paper={p} onAddToWorkspace={onAddToWorkspace} />
      ))}
    </div>
  );
}

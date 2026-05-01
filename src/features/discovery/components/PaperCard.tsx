import { Link } from "react-router-dom";
import { FolderPlus, ExternalLink } from "lucide-react";
import type { DiscoveryPaper } from "../types";

export default function PaperCard({
  paper,
  onAddToWorkspace,
}: {
  paper: DiscoveryPaper;
  onAddToWorkspace?: (p: DiscoveryPaper) => void;
}) {
  const authorsDisplay = paper.authors
    .slice(0, 3)
    .map((a) => a.name)
    .join(", ");

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-xl p-6 hover:shadow-lg hover:border-indigo-200 transition-all group">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <div className="flex justify-between items-center gap-4 mb-2">
            <h3>
              <Link to={`/discovery/${paper.id}`} className="text-slate-900 hover:text-indigo-700 transition-colors">
                {paper.title}
              </Link>
            </h3>
            <div className="flex items-center gap-3 shrink-0">
              {typeof paper.distance === 'number' && (
                <div className="text-xs text-slate-500 mr-2">dist: {paper.distance.toFixed(3)}</div>
              )}
              <button
                type="button"
                onClick={() => onAddToWorkspace?.(paper)}
                title="Add to workspace"
                className="p-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors"
              >
                <FolderPlus className="w-4 h-4" />
              </button>
              <a href={paper.pdf_url ?? "#"} target="_blank" rel="noreferrer" title="View Source" className="p-2 bg-slate-50 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors">
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-700">
              {authorsDisplay}
              {paper.authors.length > 3 ? " et al." : ""}
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-500">{paper.year ?? "—"} · {paper.venue ?? ""}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

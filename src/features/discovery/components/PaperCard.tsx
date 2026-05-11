import { Link } from "react-router-dom";
import { FolderPlus, ExternalLink } from "lucide-react";
import type { DiscoveryPaper } from "../types";

export default function PaperCard({
  paper,
  onAddToWorkspace,
  layout = "row",
}: {
  paper: DiscoveryPaper;
  onAddToWorkspace?: (p: DiscoveryPaper) => void;
  layout?: "row" | "block";
}) {
  const authorsDisplay = paper.authors
    .slice(0, 3)
    .map((a) => a.name)
    .join(", ");

  const metaLine = (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-600">
      <span className="text-slate-700">
        {authorsDisplay}
        {paper.authors.length > 3 ? " et al." : ""}
      </span>
      <span className="text-slate-400 hidden sm:inline">·</span>
      <span className="text-slate-500">
        {paper.year ?? "—"}
        {paper.venue ? ` · ${paper.venue}` : ""}
      </span>
    </div>
  );

  const actions = (
    <div className="flex items-center gap-2 shrink-0">
      {typeof paper.distance === "number" ? (
        <span className="text-xs text-slate-500 tabular-nums">dist {paper.distance.toFixed(3)}</span>
      ) : null}
      <button
        type="button"
        onClick={() => onAddToWorkspace?.(paper)}
        title="Add to workspace"
        className="p-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors"
      >
        <FolderPlus className="w-4 h-4" />
      </button>
      {paper.pdf_url ? (
        <a
          href={paper.pdf_url}
          target="_blank"
          rel="noreferrer"
          title="View source"
          className="p-2 bg-slate-50 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      ) : (
        <span
          className="p-2 bg-slate-50/80 text-slate-300 rounded-lg cursor-not-allowed"
          title="No PDF link"
        >
          <ExternalLink className="w-4 h-4" />
        </span>
      )}
    </div>
  );

  if (layout === "block") {
    return (
      <article className="bg-white/90 backdrop-blur-sm border border-slate-200/60 rounded-xl p-5 hover:shadow-md hover:border-indigo-200/80 transition-all h-full flex flex-col min-h-[11rem]">
        <h3 className="text-base font-medium text-slate-900 leading-snug mb-2 line-clamp-3">
          <Link to={`/discovery/${paper.id}`} className="hover:text-indigo-700 transition-colors">
            {paper.title}
          </Link>
        </h3>
        <div className="text-xs text-slate-500 mb-3 space-y-1.5">
          <div className="rounded-md bg-slate-50/80 border border-slate-100 px-2.5 py-2">{metaLine}</div>
          {paper.abstract ? (
            <p className="line-clamp-3 text-slate-600 leading-relaxed">{paper.abstract}</p>
          ) : null}
        </div>
        <div className="mt-auto pt-2 flex items-center justify-end border-t border-slate-100">{actions}</div>
      </article>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-xl p-6 hover:shadow-lg hover:border-indigo-200 transition-all group">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-4 mb-2">
            <h3 className="min-w-0">
              <Link
                to={`/discovery/${paper.id}`}
                className="text-slate-900 hover:text-indigo-700 transition-colors"
              >
                {paper.title}
              </Link>
            </h3>
            <div className="flex items-center gap-2 shrink-0">{actions}</div>
          </div>
          {metaLine}
        </div>
      </div>
    </div>
  );
}

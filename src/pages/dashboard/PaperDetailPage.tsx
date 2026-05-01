import { Link, useLocation, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

type Paper = {
  id: number;
  title: string;
  authors: string[];
  year: number;
  venue: string;
  abstract: string;
};

type LocationState = {
  paper?: Paper;
};

export function PaperDetailPage() {
  const { paperId } = useParams();
  const location = useLocation();
  const paper = (location.state as LocationState | null)?.paper;

  if (!paper) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Link
          to="/discovery"
          className="inline-flex items-center gap-2 text-indigo-700 hover:text-indigo-800 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Discovery
        </Link>
        <div className="bg-white/80 border border-slate-200 rounded-xl p-6">
          <h1 className="text-slate-900 mb-2">Paper details not available yet</h1>
          <p className="text-slate-600">
            Details for paper ID {paperId} could not be loaded from navigation state.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Link
        to="/discovery"
        className="inline-flex items-center gap-2 text-indigo-700 hover:text-indigo-800 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Discovery
      </Link>

      <article className="bg-white/90 border border-slate-200 rounded-2xl p-8">
        <h1 className="text-slate-900 mb-3">{paper.title}</h1>
        <p className="text-slate-600 mb-6">
          {paper.authors.join(", ")} · {paper.year} · {paper.venue}
        </p>

        <section>
          <h2 className="text-slate-900 mb-2">Abstract</h2>
          <p className="text-slate-700 leading-relaxed">{paper.abstract}</p>
        </section>
      </article>
    </div>
  );
}
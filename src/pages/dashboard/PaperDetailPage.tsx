import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import axiosInstance from "@/shared/utils/axios-instance";

type Author = {
  id: number | string;
  name: string;
};

type Paper = {
  id: string;
  title: string;
  authors: string[] | Author[] | string;
  year: number | null;
  venue?: { id: string; name: string; venue_type?: string | null } | null;
  abstract?: string;
  pdf_url?: string;
  distance?: number;
  fields?: { id: number; name: string }[];
  extracted_content?: {
    problem_statement?: string;
    methodology?: string;
    datasets?: string;
    results?: string;
    limitations?: string;
  } | null;
};

export function PaperDetailPage() {
  const { paperId } = useParams();
  const [paper, setPaper] = useState<Paper | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Always fetch full details from API using PaperDetailSerializer
  useEffect(() => {
    const fetchPaperDetails = async () => {
      if (!paperId) {
        setError("No paper ID provided");
        setLoading(false);
        return;
      }
      console.log(Number.MAX_SAFE_INTEGER)
      console.log("Extracted ID from URL:", paperId); // Is this undefined?
      console.log("Fetching exact URL:", `/library/papers/${paperId}/`);

      setLoading(true);
      setError(null);
      try {
        const { data } = await axiosInstance.get<Paper>(`/library/papers/${paperId}/`);
        setPaper(data);
      } catch (err) {
        console.error("Failed to fetch paper details:", err);
        setError("Failed to load paper details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    void fetchPaperDetails();
  }, [paperId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Link
          to="/discovery"
          className="inline-flex items-center gap-2 text-indigo-700 hover:text-indigo-800 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Discovery
        </Link>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
          <span className="ml-3 text-slate-600">Loading paper details...</span>
        </div>
      </div>
    );
  }

  if (error || !paper) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Link
          to="/discovery"
          className="inline-flex items-center gap-2 text-indigo-700 hover:text-indigo-800 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Discovery
        </Link>
        <div className="bg-white/80 border border-red-200 rounded-xl p-6">
          <h1 className="text-slate-900 mb-2">Error loading paper</h1>
          <p className="text-slate-600">{error || "Paper details could not be loaded."}</p>
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

      <article className="bg-white/90 border border-slate-200 rounded-2xl p-8 shadow-lg">
        <h1 className="text-3xl font-semibold text-slate-900 mb-4">{paper.title}</h1>
        
        <div className="flex flex-wrap items-center gap-4 mb-6 pb-6 border-b border-slate-200">
          <p className="text-slate-600">
            {typeof paper.authors === "string"
              ? paper.authors
              : Array.isArray(paper.authors)
              ? paper.authors
                  .map((a) => (typeof a === "string" ? a : "name" in a ? a.name : String(a)))
                  .join(", ")
              : String(paper.authors)}
          </p>
          {paper.year && <span className="text-slate-500">•</span>}
          {paper.year && <p className="text-slate-600">{paper.year}</p>}
          {paper.venue && <span className="text-slate-500">•</span>}
          {paper.venue && (
            <p className="text-slate-600">
              {typeof paper.venue === "string" ? paper.venue : paper.venue.name || "Unknown"}
            </p>
          )}
          {typeof paper.distance === "number" && (
            <>
              <span className="text-slate-500">•</span>
              <p className="text-sm text-slate-500">dist: {paper.distance.toFixed(3)}</p>
            </>
          )}
        </div>

        {paper.abstract && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-3">Abstract</h2>
            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{paper.abstract}</p>
          </section>
        )}

        {paper.pdf_url && (
          <div className="flex gap-3">
            <a
              href={paper.pdf_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              View PDF
            </a>
          </div>
        )}
      </article>
    </div>
  );
}
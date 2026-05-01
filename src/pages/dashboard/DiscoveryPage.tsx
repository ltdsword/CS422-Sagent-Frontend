import { useState } from "react";
import { 
  Search, 
  Sparkles, 
  Filter, 
  Upload, 
  BookmarkPlus, 
  ExternalLink,
  X,
  CheckCircle,
  Loader2
} from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Switch from "@radix-ui/react-switch";
import * as Slider from "@radix-ui/react-slider";
import { Link } from "react-router-dom";
import { toast, Toaster } from "sonner";

export function PaperDiscovery() {
  const [diversityRanking, setDiversityRanking] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [dateRange, setDateRange] = useState([2010, 2026]);
  const [dragActive, setDragActive] = useState(false);

  const [selectedVenues, setSelectedVenues] = useState({
    arxiv: true,
    semanticScholar: true,
    nips: false,
    icml: false,
  });

  const papers = [
    {
      id: 1,
      title: "Attention Is All You Need: Transformers for Sequence Modeling",
      authors: ["Vaswani, A.", "Shazeer, N.", "Parmar, N.", "Uszkoreit, J."],
      year: 2017,
      venue: "NIPS",
      abstract: "We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely. Experiments on two machine translation tasks show these models to be superior in quality..."
    },
    {
      id: 2,
      title: "Deep Residual Learning for Image Recognition",
      authors: ["He, K.", "Zhang, X.", "Ren, S.", "Sun, J."],
      year: 2016,
      venue: "CVPR",
      abstract: "Deeper neural networks are more difficult to train. We present a residual learning framework to ease the training of networks that are substantially deeper than those used previously. We explicitly reformulate the layers as learning residual functions..."
    },
    {
      id: 3,
      title: "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding",
      authors: ["Devlin, J.", "Chang, M.", "Lee, K.", "Toutanova, K."],
      year: 2019,
      venue: "NAACL",
      abstract: "We introduce a new language representation model called BERT, which stands for Bidirectional Encoder Representations from Transformers. Unlike recent language representation models, BERT is designed to pre-train deep bidirectional representations..."
    },
    {
      id: 4,
      title: "Generative Adversarial Networks",
      authors: ["Goodfellow, I.", "Pouget-Abadie, J.", "Mirza, M."],
      year: 2014,
      venue: "NIPS",
      abstract: "We propose a new framework for estimating generative models via an adversarial process, in which we simultaneously train two models: a generative model G that captures the data distribution, and a discriminative model D that estimates the probability..."
    },
    {
      id: 5,
      title: "Neural Architecture Search with Reinforcement Learning",
      authors: ["Zoph, B.", "Le, Q.V."],
      year: 2017,
      venue: "ICLR",
      abstract: "Neural networks are powerful and flexible models that work well for many difficult learning tasks in image, speech and natural language understanding. Despite their success, neural networks are still hard to design. In this paper, we use a recurrent..."
    },
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setUploadModalOpen(false);
          toast.success("Paper added successfully!", {
            description: `${file.name} has been added to your library.`,
            icon: <CheckCircle className="w-4 h-4" />,
          });
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const handleSavePaper = (paperId: number, title: string) => {
    toast.success("Paper saved to library!", {
      description: `"${title.substring(0, 40)}..." has been added to your library.`,
      icon: <BookmarkPlus className="w-4 h-4" />,
    });
  };

  const toggleVenue = (venue: keyof typeof selectedVenues) => {
    setSelectedVenues(prev => ({ ...prev, [venue]: !prev[venue] }));
  };

  return (
    <>
      <Toaster position="top-right" richColors />
      
      <div className="min-h-screen bg-linear-to-br from-indigo-50 via-slate-50 to-emerald-50">
        <div className="flex h-screen">
          {/* Filter Sidebar */}
          <aside className="w-80 bg-white/70 backdrop-blur-xl border-r border-slate-200/50 p-6 overflow-y-auto">
            <div className="flex items-center gap-2 mb-6">
              <Filter className="w-5 h-5 text-indigo-700" />
              <h2 className="text-slate-900">Filters</h2>
            </div>

            {/* Date Range */}
            <div className="mb-8">
              <label className="text-sm text-slate-700 mb-3 block">
                Publication Date Range
              </label>
              <div className="px-2">
                <Slider.Root
                  className="relative flex items-center select-none touch-none w-full h-5"
                  value={dateRange}
                  onValueChange={setDateRange}
                  min={2000}
                  max={2026}
                  step={1}
                  minStepsBetweenThumbs={1}
                >
                  <Slider.Track className="bg-slate-200 relative grow rounded-full h-1">
                    <Slider.Range className="absolute bg-indigo-600 rounded-full h-full" />
                  </Slider.Track>
                  <Slider.Thumb
                    className="block w-4 h-4 bg-white border-2 border-indigo-600 rounded-full hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    aria-label="Start year"
                  />
                  <Slider.Thumb
                    className="block w-4 h-4 bg-white border-2 border-indigo-600 rounded-full hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    aria-label="End year"
                  />
                </Slider.Root>
              </div>
              <div className="flex justify-between mt-2 text-sm text-slate-600">
                <span>{dateRange[0]}</span>
                <span>{dateRange[1]}</span>
              </div>
            </div>

            {/* Venues */}
            <div className="mb-8">
              <label className="text-sm text-slate-700 mb-3 block">Venues</label>
              <div className="space-y-3">
                {[
                  { id: 'arxiv', label: 'arXiv' },
                  { id: 'semanticScholar', label: 'Semantic Scholar' },
                  { id: 'nips', label: 'NIPS/NeurIPS' },
                  { id: 'icml', label: 'ICML' },
                ].map(venue => (
                  <label key={venue.id} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedVenues[venue.id as keyof typeof selectedVenues]}
                      onChange={() => toggleVenue(venue.id as keyof typeof selectedVenues)}
                      className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm text-slate-700 group-hover:text-slate-900">
                      {venue.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Author */}
            <div className="mb-8">
              <label className="text-sm text-slate-700 mb-2 block">Author</label>
              <input
                type="text"
                placeholder="e.g., Hinton, G."
                className="w-full px-3 py-2 bg-white/50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Keywords */}
            <div className="mb-8">
              <label className="text-sm text-slate-700 mb-2 block">Keywords</label>
              <input
                type="text"
                placeholder="e.g., transformer, attention"
                className="w-full px-3 py-2 bg-white/50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Diversity Ranking */}
            <div className="p-4 bg-indigo-50/50 rounded-lg border border-indigo-200/50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm text-slate-900">Diversity Ranking</span>
                </div>
                <Switch.Root
                  checked={diversityRanking}
                  onCheckedChange={setDiversityRanking}
                  className={`w-11 h-6 rounded-full relative transition-colors ${
                    diversityRanking ? 'bg-indigo-600' : 'bg-slate-300'
                  }`}
                >
                  <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform translate-x-0.5 will-change-transform data-[state=checked]:translate-x-5.5" />
                </Switch.Root>
              </div>
              <p className="text-xs text-slate-600">
                AI ensures varied research approaches in results
              </p>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            {/* Header & Search */}
            <div className="bg-white/70 backdrop-blur-xl border-b border-slate-200/50 p-6 sticky top-0 z-10">
              <div className="max-w-5xl mx-auto">
                <h1 className="text-slate-900 mb-4">Paper Discovery</h1>
                
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search papers by title, author, or topic..."
                      className="w-full pl-12 pr-4 py-3 bg-white/80 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Results Feed */}
            <div className="max-w-5xl mx-auto p-6">
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-slate-600">
                  Found {papers.length} papers matching your criteria
                </p>
              </div>

              <div className="space-y-4">
                {papers.map((paper) => (
                  <div
                    key={paper.id}
                    className="bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-xl p-6 hover:shadow-lg hover:border-indigo-200 transition-all group"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex justify-between items-center gap-4 mb-2">
                          <h3>
                            <Link
                              to={`/discovery/${paper.id}`}
                              state={{ paper }}
                              className="text-slate-900 hover:text-indigo-700 transition-colors"
                            >
                              {paper.title}
                            </Link>
                          </h3>
                          <div className="flex gap-3 shrink-0">
                            <button
                              onClick={() => handleSavePaper(paper.id, paper.title)}
                              title="Save to Workspace"
                              className="p-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors"
                            >
                              <BookmarkPlus className="w-4 h-4" />
                            </button>
                            <button title="View Source" className="p-2 bg-slate-50 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors">
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="text-slate-700">
                            {paper.authors.slice(0, 3).join(", ")}
                            {paper.authors.length > 3 && " et al."}
                          </span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-500">
                            {paper.year} · {paper.venue}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>

        {/* PDF Upload Modal */}
        <Dialog.Root open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm animate-in fade-in" />
            <Dialog.Content className="fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between mb-6">
                <Dialog.Title className="text-slate-900">Upload Paper</Dialog.Title>
                <Dialog.Close className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-slate-500" />
                </Dialog.Close>
              </div>

              {!isUploading ? (
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                    dragActive
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-slate-300 bg-slate-50'
                  }`}
                >
                  <Upload className={`w-12 h-12 mx-auto mb-4 ${
                    dragActive ? 'text-indigo-600' : 'text-slate-400'
                  }`} />
                  <p className="text-slate-900 mb-1">
                    Drop your PDF here or
                  </p>
                  <label className="text-indigo-600 hover:text-indigo-700 cursor-pointer">
                    browse files
                    <input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleUpload(e.target.files[0]);
                        }
                      }}
                    />
                  </label>
                  <p className="text-xs text-slate-500 mt-2">PDF only, max 10MB</p>
                </div>
              ) : (
                <div className="py-8">
                  <div className="flex items-center justify-center mb-4">
                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                  </div>
                  <p className="text-center text-slate-900 mb-2">
                    AI Agent is extracting metadata...
                  </p>
                  <p className="text-center text-sm text-slate-600 mb-4">
                    Analyzing Authors, Title, DOI
                  </p>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 transition-all duration-300 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-center text-xs text-slate-500 mt-2">
                    {uploadProgress}% complete
                  </p>
                </div>
              )}
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </>
  );
}

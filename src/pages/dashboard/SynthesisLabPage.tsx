import { FlaskConical, Sparkles } from "lucide-react";

export function SynthesisLab() {
  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-slate-900 mb-2">Synthesis Lab</h1>
          <p className="text-slate-600">
            Advanced tools for synthesizing and analyzing research literature
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <FlaskConical className="w-16 h-16 text-slate-300" />
            <Sparkles className="w-8 h-8 text-blue-500" />
          </div>
          <h2 className="text-slate-900 mb-2">Synthesis Lab</h2>
          <p className="text-slate-600">Advanced synthesis tools coming soon</p>
        </div>
      </div>
    </div>
  );
}

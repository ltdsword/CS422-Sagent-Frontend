import { Download, Info } from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";

export function Synthesis() {
  const papers = [
    {
      id: 1,
      title: "CNN for Medical Imaging",
      methodology: "Convolutional Neural Network",
      dataset: "ChestX-ray14 (112K images)",
      results: "94.7% accuracy",
      limitations: "Limited to chest X-rays"
    },
    {
      id: 2,
      title: "Transfer Learning in Healthcare",
      methodology: "Transfer Learning (ResNet-50)",
      dataset: "Private hospital data (45K images)",
      results: "89.3% accuracy, 67% faster training",
      limitations: "Dataset not publicly available"
    },
    {
      id: 3,
      title: "Vision Transformers for Diagnosis",
      methodology: "Vision Transformer (ViT)",
      dataset: "Multi-modal: X-ray + CT (78K)",
      results: "91.2% accuracy across modalities",
      limitations: "High computational cost"
    },
    {
      id: 4,
      title: "U-Net for Organ Segmentation",
      methodology: "U-Net Architecture",
      dataset: "Medical Segmentation Decathlon",
      results: "Dice: 0.87 for liver, 0.92 for kidney",
      limitations: "Requires pixel-level annotations"
    },
    {
      id: 5,
      title: "Ensemble Methods in Radiology",
      methodology: "Ensemble (CNN + ViT)",
      dataset: "Combined public datasets (200K)",
      results: "96.1% accuracy, best overall",
      limitations: "Complex model deployment"
    },
  ];

  return (
    <Tooltip.Provider>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-slate-900 mb-2">Synthesis & Comparison</h1>
            <p className="text-slate-600">
              Compare research papers across key dimensions to identify patterns and gaps
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-700">Comparing {papers.length} papers</span>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm">
              <Download className="w-4 h-4" />
              Export to LaTeX
            </button>
          </div>

          {/* Comparison Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-left text-sm text-slate-900 w-64">
                      Paper Title
                    </th>
                    <th className="px-6 py-4 text-left text-sm text-slate-900">
                      Methodology
                    </th>
                    <th className="px-6 py-4 text-left text-sm text-slate-900">
                      Dataset
                    </th>
                    <th className="px-6 py-4 text-left text-sm text-slate-900">
                      Key Results
                    </th>
                    <th className="px-6 py-4 text-left text-sm text-slate-900">
                      Limitations
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {papers.map((paper) => (
                    <tr key={paper.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-2">
                          <span className="text-sm text-slate-900">{paper.title}</span>
                          <Tooltip.Root>
                            <Tooltip.Trigger asChild>
                              <button className="text-slate-400 hover:text-slate-600 flex-shrink-0">
                                <Info className="w-4 h-4" />
                              </button>
                            </Tooltip.Trigger>
                            <Tooltip.Portal>
                              <Tooltip.Content
                                className="bg-slate-900 text-white px-3 py-2 rounded-lg text-xs max-w-xs shadow-xl"
                                sideOffset={5}
                              >
                                <p className="mb-1"><strong>Source:</strong></p>
                                <p className="text-slate-300">
                                  Paper #{paper.id} • Nature Medicine • 2024
                                </p>
                                <p className="text-slate-400 mt-1">
                                  Click to view full citation
                                </p>
                                <Tooltip.Arrow className="fill-slate-900" />
                              </Tooltip.Content>
                            </Tooltip.Portal>
                          </Tooltip.Root>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-700">{paper.methodology}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-700">{paper.dataset}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-700">{paper.results}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-700">{paper.limitations}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Synthesis Summary */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="text-slate-900 mb-2">Common Patterns</h3>
              <ul className="space-y-2 text-sm text-slate-700">
                <li>• CNNs dominate medical imaging (3/5 papers)</li>
                <li>• Transfer learning widely adopted</li>
                <li>• Chest X-ray most common modality</li>
              </ul>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <h3 className="text-slate-900 mb-2">Gaps Identified</h3>
              <ul className="space-y-2 text-sm text-slate-700">
                <li>• Limited work on 3D imaging</li>
                <li>• Few studies on rare diseases</li>
                <li>• Interpretability under-explored</li>
              </ul>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <h3 className="text-slate-900 mb-2">Future Directions</h3>
              <ul className="space-y-2 text-sm text-slate-700">
                <li>• Multi-modal fusion approaches</li>
                <li>• Federated learning for privacy</li>
                <li>• Explainable AI methods</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Tooltip.Provider>
  );
}

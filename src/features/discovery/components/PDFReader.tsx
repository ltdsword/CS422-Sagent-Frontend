import { useState } from "react";
import { FileText, Sparkles, Info, AlertCircle, ChevronRight, Bookmark, Highlighter } from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";

export function PDFReader() {
  const [activeTab, setActiveTab] = useState("summary");

  const tabs = [
    { id: "summary", label: "Quick Summary" },
    { id: "methodology", label: "Methodology Explorer" },
    { id: "ask", label: "Ask AI" },
  ];

  return (
    <Tooltip.Provider>
      <div className="h-[calc(100vh-8rem)] flex">
        {/* PDF Viewer */}
        <div className="flex-1 bg-slate-100 p-6 overflow-auto">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-12">
            {/* PDF Header */}
            <div className="mb-8">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-slate-900 mb-2">
                    Deep Learning for Medical Image Analysis: A Comprehensive Review
                  </h1>
                  <p className="text-sm text-slate-600">
                    Sarah Johnson, Michael Chen, Emily Rodriguez • Nature Medicine • 2025
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-slate-100 rounded-lg">
                    <Bookmark className="w-5 h-5 text-slate-600" />
                  </button>
                  <button className="p-2 hover:bg-slate-100 rounded-lg">
                    <Highlighter className="w-5 h-5 text-slate-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* PDF Content with Key Claims Highlighted */}
            <div className="space-y-6 text-slate-700 leading-relaxed">
              <div>
                <h2 className="text-slate-900 mb-3">Abstract</h2>
                <p className="mb-4">
                  Deep learning has revolutionized medical image analysis over the past decade. This comprehensive 
                  review examines the current state of deep learning applications in medical imaging, focusing on 
                  diagnostic accuracy, clinical implementation, and future directions.
                </p>
              </div>

              <div>
                <h2 className="text-slate-900 mb-3">1. Introduction</h2>
                <p className="mb-4">
                  Medical imaging plays a crucial role in modern healthcare, enabling early disease detection and 
                  treatment planning. Recent advances in deep learning have shown promise in automating image 
                  analysis tasks, potentially improving diagnostic accuracy and efficiency.
                </p>
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-4 relative group">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-slate-900">
                        <strong>Key Claim:</strong> Convolutional Neural Networks (CNNs) achieve 94.7% accuracy 
                        in detecting lung nodules in CT scans, surpassing traditional radiologist accuracy by 8.3%.
                      </p>
                      <Tooltip.Root>
                        <Tooltip.Trigger asChild>
                          <button className="mt-2 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                            <Info className="w-4 h-4" />
                            View Source
                          </button>
                        </Tooltip.Trigger>
                        <Tooltip.Portal>
                          <Tooltip.Content
                            className="bg-slate-900 text-white px-3 py-2 rounded-lg text-sm max-w-xs shadow-xl"
                            sideOffset={5}
                          >
                            <p className="mb-2"><strong>Source:</strong></p>
                            <p className="mb-1">Johnson et al. (2024)</p>
                            <p className="text-slate-300 text-xs">
                              "CNN-based Detection System for Pulmonary Nodules"
                            </p>
                            <p className="text-slate-400 text-xs mt-1">JAMA Network, Vol. 182, pp. 1247-1255</p>
                            <Tooltip.Arrow className="fill-slate-900" />
                          </Tooltip.Content>
                        </Tooltip.Portal>
                      </Tooltip.Root>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-slate-900 mb-3">2. Methodology</h2>
                <p className="mb-4">
                  We conducted a systematic review of 156 peer-reviewed studies published between 2020 and 2025. 
                  Our analysis focused on three main application areas: classification, segmentation, and detection 
                  in medical imaging.
                </p>
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg mb-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-slate-900">
                        <strong>Key Claim:</strong> Transfer learning from ImageNet pre-trained models reduces 
                        training time by 67% and improves accuracy by 5.2% on average across medical imaging tasks.
                      </p>
                      <Tooltip.Root>
                        <Tooltip.Trigger asChild>
                          <button className="mt-2 text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1">
                            <Info className="w-4 h-4" />
                            View Source
                          </button>
                        </Tooltip.Trigger>
                        <Tooltip.Portal>
                          <Tooltip.Content
                            className="bg-slate-900 text-white px-3 py-2 rounded-lg text-sm max-w-xs shadow-xl"
                            sideOffset={5}
                          >
                            <p className="mb-2"><strong>Source:</strong></p>
                            <p className="mb-1">Chen & Li (2023)</p>
                            <p className="text-slate-300 text-xs">
                              "Transfer Learning in Medical Image Classification"
                            </p>
                            <p className="text-slate-400 text-xs mt-1">Medical Image Analysis, Vol. 89, pp. 102-118</p>
                            <Tooltip.Arrow className="fill-slate-900" />
                          </Tooltip.Content>
                        </Tooltip.Portal>
                      </Tooltip.Root>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-slate-900 mb-3">3. Results</h2>
                <p className="mb-4">
                  Our findings demonstrate significant improvements in diagnostic accuracy across multiple imaging 
                  modalities. Deep learning models showed particularly strong performance in chest X-ray analysis 
                  and retinal imaging applications.
                </p>
              </div>

              <div>
                <h2 className="text-slate-900 mb-3">4. Discussion</h2>
                <p className="mb-4">
                  While deep learning shows great promise, challenges remain in clinical deployment, including 
                  interpretability, generalization to diverse patient populations, and regulatory approval processes.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Sidebar */}
        <div className="w-96 bg-white border-l border-slate-200 flex flex-col">
          {/* Tabs */}
          <div className="border-b border-slate-200">
            <div className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-4 py-3 text-sm transition-colors ${
                    activeTab === tab.id
                      ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-auto p-6">
            {activeTab === "summary" && (
              <div>
                <div className="flex items-start gap-3 mb-4 p-3 bg-blue-50 rounded-lg">
                  <Sparkles className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-slate-700">
                    AI-generated summary from the full paper
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-slate-900 mb-2">Overview</h3>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      This paper reviews deep learning applications in medical imaging, covering 156 studies 
                      from 2020-2025. It focuses on classification, segmentation, and detection tasks across 
                      various imaging modalities.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-slate-900 mb-2">Key Findings</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2 text-sm text-slate-700">
                        <ChevronRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>CNNs achieve 94.7% accuracy in lung nodule detection</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-slate-700">
                        <ChevronRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>Transfer learning reduces training time by 67%</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-slate-700">
                        <ChevronRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>Strong performance in chest X-ray and retinal imaging</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-slate-900 mb-2">Implications</h3>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      Deep learning can augment radiologist workflow and improve diagnostic accuracy, but 
                      challenges remain in interpretability and clinical deployment.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "methodology" && (
              <div>
                <div className="flex items-start gap-3 mb-4 p-3 bg-blue-50 rounded-lg">
                  <Sparkles className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-slate-700">
                    AI-extracted methodology details
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h4 className="text-sm text-slate-900 mb-2">Study Design</h4>
                    <p className="text-sm text-slate-700">Systematic Review</p>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4">
                    <h4 className="text-sm text-slate-900 mb-2">Sample Size</h4>
                    <p className="text-sm text-slate-700">156 peer-reviewed studies</p>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4">
                    <h4 className="text-sm text-slate-900 mb-2">Time Period</h4>
                    <p className="text-sm text-slate-700">2020-2025</p>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4">
                    <h4 className="text-sm text-slate-900 mb-2">Model Architectures</h4>
                    <ul className="space-y-1 text-sm text-slate-700">
                      <li>• Convolutional Neural Networks (CNNs)</li>
                      <li>• ResNet variants</li>
                      <li>• U-Net for segmentation</li>
                      <li>• Vision Transformers</li>
                    </ul>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4">
                    <h4 className="text-sm text-slate-900 mb-2">Evaluation Metrics</h4>
                    <ul className="space-y-1 text-sm text-slate-700">
                      <li>• Accuracy</li>
                      <li>• Sensitivity/Specificity</li>
                      <li>• Dice Coefficient</li>
                      <li>• AUC-ROC</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "ask" && (
              <div>
                <div className="flex items-start gap-3 mb-4 p-3 bg-blue-50 rounded-lg">
                  <Sparkles className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-slate-700">
                    Ask questions about this paper
                  </p>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm text-slate-700 mb-2">
                      <strong>Q:</strong> What datasets were used?
                    </p>
                    <p className="text-sm text-slate-600">
                      <strong>A:</strong> The review analyzed studies using various datasets including 
                      ChestX-ray14, LIDC-IDRI, and private hospital datasets. Most studies used 
                      publicly available benchmark datasets.
                    </p>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm text-slate-700 mb-2">
                      <strong>Q:</strong> What are the main limitations?
                    </p>
                    <p className="text-sm text-slate-600">
                      <strong>A:</strong> Key limitations include lack of interpretability, limited 
                      generalization to diverse populations, and regulatory challenges for clinical deployment.
                    </p>
                  </div>
                </div>

                <div>
                  <textarea
                    placeholder="Ask a question about this paper..."
                    className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={4}
                  />
                  <button className="mt-2 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                    Ask AI
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Tooltip.Provider>
  );
}

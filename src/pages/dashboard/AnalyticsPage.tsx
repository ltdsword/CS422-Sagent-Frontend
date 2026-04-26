import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { AlertTriangle, TrendingUp, FileText } from "lucide-react";

export function Analytics() {
  const publicationTrends = [
    { year: "2020", papers: 23 },
    { year: "2021", papers: 34 },
    { year: "2022", papers: 52 },
    { year: "2023", papers: 78 },
    { year: "2024", papers: 94 },
    { year: "2025", papers: 112 },
  ];

  const dominantMethods = [
    { method: "CNN", count: 87 },
    { method: "Transfer Learning", count: 65 },
    { method: "Vision Transformer", count: 42 },
    { method: "U-Net", count: 38 },
    { method: "Ensemble", count: 28 },
    { method: "GANs", count: 19 },
  ];

  const researchGaps = [
    {
      id: 1,
      area: "3D Medical Imaging",
      papers: 12,
      severity: "high",
      description: "Limited research on volumetric analysis despite clinical importance"
    },
    {
      id: 2,
      area: "Rare Disease Detection",
      papers: 8,
      severity: "high",
      description: "Insufficient datasets and models for uncommon pathologies"
    },
    {
      id: 3,
      area: "Model Interpretability",
      papers: 23,
      severity: "medium",
      description: "Growing but still limited focus on explainable AI in medical context"
    },
    {
      id: 4,
      area: "Multi-modal Fusion",
      papers: 31,
      severity: "medium",
      description: "Emerging area with significant potential for improvement"
    },
  ];

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-slate-900 mb-2">Research Analytics</h1>
          <p className="text-slate-600">
            Visualize trends, patterns, and gaps in your research domain
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Total Papers</span>
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl text-slate-900">347</p>
            <p className="text-xs text-green-600 mt-1">+18% from last year</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Active Projects</span>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl text-slate-900">12</p>
            <p className="text-xs text-green-600 mt-1">4 new this month</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Synthesized Reviews</span>
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl text-slate-900">28</p>
            <p className="text-xs text-slate-600 mt-1">Across all projects</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Research Gaps</span>
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-3xl text-slate-900">4</p>
            <p className="text-xs text-amber-600 mt-1">2 high priority</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Publication Trends */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-slate-900 mb-4">Publication Trends Over Years</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={publicationTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="year" 
                  stroke="#64748b"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#64748b"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="papers" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Papers Published"
                />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-sm text-slate-600 mt-4">
              Exponential growth in deep learning for medical imaging research, with 112 papers 
              published in 2025 alone.
            </p>
          </div>

          {/* Dominant Methods */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-slate-900 mb-4">Dominant Methods</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dominantMethods} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  type="number" 
                  stroke="#64748b"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  type="category" 
                  dataKey="method" 
                  stroke="#64748b"
                  style={{ fontSize: '12px' }}
                  width={120}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Bar 
                  dataKey="count" 
                  fill="#3b82f6" 
                  radius={[0, 8, 8, 0]}
                  name="Number of Papers"
                />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-sm text-slate-600 mt-4">
              Convolutional Neural Networks (CNNs) remain the most widely used approach across 
              medical imaging applications.
            </p>
          </div>
        </div>

        {/* Research Gaps */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-slate-900 mb-1">Research Gap Analysis</h2>
              <p className="text-sm text-slate-600">
                Under-explored areas with high potential impact
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span className="text-slate-700">High Priority</span>
              </div>
              <div className="flex items-center gap-2 text-sm ml-4">
                <div className="w-3 h-3 bg-amber-500 rounded"></div>
                <span className="text-slate-700">Medium Priority</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {researchGaps.map((gap) => (
              <div
                key={gap.id}
                className={`p-4 rounded-lg border-l-4 ${
                  gap.severity === "high"
                    ? "bg-red-50 border-red-500"
                    : "bg-amber-50 border-amber-500"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle
                      className={`w-5 h-5 ${
                        gap.severity === "high" ? "text-red-600" : "text-amber-600"
                      }`}
                    />
                    <h3 className="text-slate-900">{gap.area}</h3>
                  </div>
                  <span className="text-sm text-slate-700 bg-white px-3 py-1 rounded-full border border-slate-200">
                    {gap.papers} papers
                  </span>
                </div>
                <p className="text-sm text-slate-700 ml-7">{gap.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm text-slate-900 mb-1">AI Insight</h4>
                <p className="text-sm text-slate-700">
                  Based on citation patterns and recent conferences, 3D medical imaging and rare disease 
                  detection are emerging as high-impact research opportunities. Consider focusing your 
                  next project in these areas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

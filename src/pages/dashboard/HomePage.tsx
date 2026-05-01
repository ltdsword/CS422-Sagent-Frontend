import { Link } from "react-router";
import { FileText, Clock, Sparkles, TrendingUp, AlertCircle, FlaskConical, Search } from "lucide-react";

export function Dashboard() {
  const projects = [
    {
      id: 1,
      title: "AI in Healthcare",
      paperCount: 47,
      lastActivity: "2 hours ago",
      agentStatus: "Critic Agent: Reviewing Consistency",
      agentType: "critic",
      color: "blue"
    },
    {
      id: 2,
      title: "Climate Change ML Models",
      paperCount: 32,
      lastActivity: "5 hours ago",
      agentStatus: "Synthesizer Agent: Generating Summary",
      agentType: "synthesizer",
      color: "green"
    },
    {
      id: 3,
      title: "Quantum Computing Advances",
      paperCount: 28,
      lastActivity: "1 day ago",
      agentStatus: "Critic Agent: Cross-validating Claims",
      agentType: "critic",
      color: "purple"
    },
    {
      id: 4,
      title: "Neural Architecture Search",
      paperCount: 53,
      lastActivity: "3 hours ago",
      agentStatus: "Synthesizer Agent: Comparing Methods",
      agentType: "synthesizer",
      color: "orange"
    },
  ];

  const agentActivities = [
    {
      id: 1,
      agent: "Synthesizer Agent",
      project: "AI in Healthcare",
      activity: "Generated literature review section for \"Deep Learning in Diagnosis\"",
      time: "5 minutes ago",
      type: "synthesizer"
    },
    {
      id: 2,
      agent: "Critic Agent",
      project: "AI in Healthcare",
      activity: "Flagged potential inconsistency in dataset descriptions (Papers #12, #23)",
      time: "12 minutes ago",
      type: "critic"
    },
    {
      id: 3,
      agent: "Synthesizer Agent",
      project: "Climate Change ML Models",
      activity: "Created comparison table for 8 forecasting models",
      time: "1 hour ago",
      type: "synthesizer"
    },
    {
      id: 4,
      agent: "Critic Agent",
      project: "Neural Architecture Search",
      activity: "Validated reproducibility scores across 15 papers",
      time: "2 hours ago",
      type: "critic"
    },
  ];

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-slate-900 mb-2">Research Dashboard</h1>
          <p className="text-slate-600">Welcome back, Dr. Chen. Here's an overview of your research projects.</p>
        </div>

        {/* Projects Grid */}
        <div className="mb-8">
          <h2 className="text-slate-900 mb-4">Active Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {projects.map((project) => (
              <Link
                key={project.id}
                to="/pdf-reader"
                className="block bg-white rounded-xl border border-slate-200 p-6 hover:border-blue-300 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-slate-900 mb-2">{project.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        <span>{project.paperCount} papers</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{project.lastActivity}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-${project.color}-500 to-${project.color}-600 flex items-center justify-center`}>
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* AI Agent Status */}
                <div className={`p-3 rounded-lg flex items-start gap-2 ${
                  project.agentType === 'critic' 
                    ? 'bg-amber-50 border border-amber-200' 
                    : 'bg-blue-50 border border-blue-200'
                }`}>
                  <Sparkles className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                    project.agentType === 'critic' ? 'text-amber-600' : 'text-blue-600'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-900">{project.agentStatus}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            to="/discovery"
            className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 text-white hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <Search className="w-8 h-8" />
              <Sparkles className="w-6 h-6 opacity-75" />
            </div>
            <h3 className="mb-1">Paper Discovery</h3>
            <p className="text-sm text-indigo-100">Search and discover research papers</p>
          </Link>

          <Link
            to="/synthesis"
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <FlaskConical className="w-8 h-8" />
              <TrendingUp className="w-6 h-6 opacity-75" />
            </div>
            <h3 className="mb-1">Synthesis Lab</h3>
            <p className="text-sm text-blue-100">Compare and synthesize papers</p>
          </Link>

          <Link
            to="/analytics"
            className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 text-white hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <TrendingUp className="w-8 h-8" />
              <AlertCircle className="w-6 h-6 opacity-75" />
            </div>
            <h3 className="mb-1">Analytics</h3>
            <p className="text-sm text-slate-300">View research trends and gaps</p>
          </Link>
        </div>

        {/* Agent Activity Feed */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-slate-900">Agent Activity Feed</h2>
            <button className="text-sm text-blue-600 hover:text-blue-700">View All</button>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-200">
            {agentActivities.map((item) => (
              <div key={item.id} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    item.type === 'critic'
                      ? 'bg-amber-100'
                      : 'bg-blue-100'
                  }`}>
                    <Sparkles className={`w-5 h-5 ${
                      item.type === 'critic' ? 'text-amber-600' : 'text-blue-600'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-sm px-2 py-0.5 rounded ${
                        item.type === 'critic'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {item.agent}
                      </span>
                      <span className="text-sm text-slate-500">•</span>
                      <span className="text-sm text-slate-700">{item.project}</span>
                    </div>
                    <p className="text-sm text-slate-900 mb-1">{item.activity}</p>
                    <p className="text-xs text-slate-500">{item.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
import ProjectCard from '../../features/workspaces/components/ProjectCard';
import { Sparkles, Plus, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 600, color: '#111827', margin: '0 0 8px 0' }}>Welcome back, Dr. Chen</h1>
          <p style={{ color: '#6b7280', margin: 0 }}>Here's what your AI agents are working on today.</p>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#2563eb', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>
          <Plus size={18} />
          New Workspace
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '7fr 3fr', gap: '32px' }}>
        {/* Left Column: Active Workspaces */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#111827', margin: 0 }}>Active Workspaces</h2>
            <button style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
              View All <ArrowRight size={16} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <ProjectCard 
              title="Quantum Computing Survey"
              papers={42}
              timeAgo="Updated 2h ago"
              agentTask="Synthesizer Agent: Generating Literature Review..."
            />
            <ProjectCard 
              title="Neural Network Optimization"
              papers={18}
              timeAgo="Updated 5h ago"
              agentTask="Critic Agent: Reviewing Consistency..."
            />
          </div>
        </div>

        {/* Right Column: Agent Activity Feed */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#111827', margin: 0 }}>Agent Activity</h2>
          </div>
          <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px' }}>
            
            <ActivityItem 
              agent="Synthesizer"
              action="Completed Literature Review for 'Quantum Computing Survey'"
              time="10 mins ago"
              type="success"
            />
            <ActivityItem 
              agent="Search"
              action="Found 15 new papers for 'Neural Network Optimization'"
              time="1 hour ago"
              type="info"
            />
            <ActivityItem 
              agent="Critic"
              action="Identified 3 methodology gaps in workspace 4"
              time="3 hours ago"
              type="warning"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const ActivityItem = ({ agent, action, time, type }: { agent: string, action: string, time: string, type: string }) => {
  const colors: Record<string, string> = {
    success: '#10b981',
    info: '#2563eb',
    warning: '#f59e0b'
  };
  const bgs: Record<string, string> = {
    success: '#d1fae5',
    info: '#eff6ff',
    warning: '#fef3c7'
  };
  return (
    <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', position: 'relative' }}>
      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: bgs[type], display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors[type], flexShrink: 0 }}>
        <Sparkles size={16} />
      </div>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>{agent} Agent</span>
        </div>
        <p style={{ margin: 0, fontSize: '14px', color: '#111827', lineHeight: '1.5' }}>{action}</p>
        <span style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginTop: '4px' }}>{time}</span>
      </div>
    </div>
  );
}


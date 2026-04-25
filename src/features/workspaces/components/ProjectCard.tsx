import React from 'react';
import { FileText, Clock, Sparkles } from 'lucide-react';

interface ProjectCardProps {
  title: string;
  papers: number;
  timeAgo: string;
  agentTask: string;
  agentIconColor?: string;
  bgColor?: string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ title, papers, timeAgo, agentTask }) => {
  const isCritic = agentTask.includes('Critic');
  const badgeColor = isCritic ? '#fef3c7' : '#eff6ff';
  const badgeTextColor = isCritic ? '#d97706' : '#2563eb';

  return (
    <div style={{ 
      border: '1px solid #e5e7eb', 
      borderRadius: '12px', 
      padding: '20px', 
      background: 'white',
      display: 'flex',
      flexDirection: 'column',
      gap: '15px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h3 style={{ margin: 0, fontSize: '18px', color: '#111827' }}>{title}</h3>
        {isCritic && <div style={{ background: '#3b82f6', color: 'white', padding: '6px', borderRadius: '8px' }}><FileText size={18} /></div>}
      </div>

      <div style={{ display: 'flex', gap: '15px', color: '#6b7280', fontSize: '14px' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><FileText size={14} /> {papers} papers</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Clock size={14} /> {timeAgo}</span>
      </div>

      <div style={{ 
        background: badgeColor, 
        color: badgeTextColor, 
        padding: '8px 12px', 
        borderRadius: '6px', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        fontSize: '14px',
        fontWeight: 500,
        marginTop: '10px'
      }}>
        <Sparkles size={16} />
        {agentTask}
      </div>
    </div>
  );
};

export default ProjectCard;

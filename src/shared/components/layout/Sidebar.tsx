import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Search, 
  Folder, 
  FlaskConical, 
  BarChart2, 
  Settings 
} from 'lucide-react';

const Sidebar = () => {
  return (
    <aside style={{ width: '250px', borderRight: '1px solid #eee', height: '100vh', display: 'flex', flexDirection: 'column', padding: '20px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1e3a8a', margin: 0 }}>
          <div style={{ width: '24px', height: '24px', background: '#2563eb', borderRadius: '4px' }}></div>
          Sagent
        </h2>
        <span style={{ fontSize: '12px', color: '#6b7280' }}>Intelligence Platform</span>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
        <NavItem to="/" icon={<Home size={18} />} label="Home" />
        <NavItem to="/discovery" icon={<Search size={18} />} label="Paper Discovery" />
        <NavItem to="/workspace" icon={<Folder size={18} />} label="Workspaces" />
        <NavItem to="/synthesis" icon={<FlaskConical size={18} />} label="Synthesis Lab" />
        <NavItem to="/analytics" icon={<BarChart2 size={18} />} label="Analytics" />
        <NavItem to="/settings" icon={<Settings size={18} />} label="Settings" />
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #eee' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)' }}></div>
        <div>
          <div style={{ fontWeight: 600, fontSize: '14px' }}>Dr. Sarah Chen</div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>Researcher</div>
        </div>
      </div>
    </aside>
  );
};

const NavItem = ({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) => {
  return (
    <NavLink 
      to={to} 
      style={({ isActive }: { isActive: boolean }) => ({
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px', 
        padding: '10px', 
        borderRadius: '8px',
        textDecoration: 'none',
        color: isActive ? '#3b82f6' : '#4b5563',
        backgroundColor: isActive ? '#eff6ff' : 'transparent',
        fontWeight: isActive ? 600 : 400
      })}
    >
      {icon}
      {label}
    </NavLink>
  );
};

export default Sidebar;


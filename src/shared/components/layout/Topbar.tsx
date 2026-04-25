import { Search, Bell } from 'lucide-react';

const TopBar = () => {
  return (
    <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', backgroundColor: 'white', borderBottom: '1px solid #e5e7eb' }}>
      <div style={{ display: 'flex', alignItems: 'center', flex: 1, maxWidth: '600px' }}>
        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f3f4f6', padding: '8px 16px', borderRadius: '8px', width: '100%' }}>
          <Search size={18} color="#9ca3af" style={{ marginRight: '8px' }} />
          <input 
            type="text" 
            placeholder="Search workspaces, papers, or ask AI..." 
            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '14px' }} 
          />
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative' }}>
          <Bell size={20} color="#4b5563" />
          <span style={{ position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', backgroundColor: '#ef4444', borderRadius: '50%' }}></span>
        </button>
      </div>
    </header>
  );
};

export default TopBar;


import { Outlet, Link, useLocation } from "react-router";
import {
  Home,
  FolderOpen,
  FlaskConical,
  BarChart3,
  Settings as SettingsIcon,
  Bell,
  Compass,
  Bot
} from "lucide-react";
import { ChatBubble } from "../features/ai-agent/components/ChatBubble";

export default function DashboardLayout() {
  const location = useLocation();
  
  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/discovery", label: "Paper Discovery", icon: Compass },
    { path: "/workspace", label: "Workspace", icon: FolderOpen },
    { path: "/synthesis", label: "Synthesis Lab", icon: FlaskConical },
    { path: "/analytics", label: "Analytics", icon: BarChart3 },
    { path: "/settings", label: "Settings", icon: SettingsIcon },
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-slate-900 flex items-center gap-2">
            <Bot className="w-8 h-8 text-blue-600" />
            <span>Sagent</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">Research Intelligence Platform</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  active
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? "text-blue-600" : "text-slate-500"}`} />
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-purple-500"></div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-900 truncate">Dr. Sarah Chen</p>
              <p className="text-xs text-slate-500 truncate">Researcher</p>
            </div>
            <button className="relative p-2 hover:bg-slate-100 rounded-lg shrink-0" aria-label="Notifications">
              <Bell className="w-5 h-5 text-slate-700" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* Chat Bubble - Available throughout the app */}
      <ChatBubble />
    </div>
  );
}


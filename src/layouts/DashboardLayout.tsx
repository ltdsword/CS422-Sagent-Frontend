import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  FolderOpen,
  FlaskConical,
  Settings as SettingsIcon,
  Compass,
  LogOut,
  LogIn,
  User,
} from "lucide-react";
import { ChatBubble } from "../features/ai-agent/components/ChatBubble";
import { useAuth } from "@/shared/hooks/useAuth";

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/discovery", label: "Paper Discovery", icon: Compass },
    { path: "/workspace", label: "Workspace", icon: FolderOpen },
    { path: "/synthesis", label: "Synthesis Lab", icon: FlaskConical },
    { path: "/settings", label: "Settings", icon: SettingsIcon },
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-slate-900 flex items-center gap-2">
            <div className="w-8 h-8 bg-linear-to-br from-blue-600 to-slate-700 rounded-lg"></div>
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
                  active ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-100"
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
            {isAuthenticated ? (
              <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-purple-500"></div>
            ) : (
              <User className="w-8 h-8 text-slate-400" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-900 truncate">{isAuthenticated ? user.name : "Guest"}</p>
              <p className="text-xs text-slate-500 truncate">{user.role || "Researcher"}</p>
            </div>
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-slate-100 rounded-lg shrink-0 text-slate-700 hover:text-red-600 transition-colors"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            ) : (
              <Link
                to="/login"
                className="p-2 hover:bg-slate-100 rounded-lg shrink-0 text-slate-700 hover:text-blue-600 transition-colors"
                title="Sign in"
              >
                <LogIn className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>

      <ChatBubble />
    </div>
  );
}


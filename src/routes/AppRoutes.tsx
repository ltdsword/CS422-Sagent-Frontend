import { Navigate, Route, Routes } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import { useAuth } from "@/shared/hooks/useAuth";
import { PaperDiscovery as DiscoveryPage } from "../pages/dashboard/DiscoveryPage";
import { PaperDetailPage } from "../pages/dashboard/PaperDetailPage";
import { Analytics as AnalyticsPage } from "../pages/dashboard/AnalyticsPage";
import { Dashboard as HomePage } from "../pages/dashboard/HomePage";
import { Settings as SettingsPage } from "../pages/dashboard/SettingsPage";
import { ProfileSettings } from "../pages/dashboard/ProfileSettingsPage";
import { NotificationSettings } from "../pages/dashboard/NotificationSettingsPage";
import { Synthesis as SynthesisPage } from "../pages/dashboard/SynthesisPage";
import { Workspaces as WorkspacePage } from "../pages/dashboard/WorkspacePage";

export default function AppRoutes() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<HomePage />} />
        <Route path="discovery" element={<DiscoveryPage />} />
        <Route path="discovery/:paperId" element={<PaperDetailPage />} />
        <Route path="workspace" element={<WorkspacePage />} />
        <Route path="workspaces" element={<Navigate to="/workspace" replace />} />
        <Route path="synthesis" element={<SynthesisPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="settings/profile" element={<ProfileSettings />} />
        <Route path="settings/notifications" element={<NotificationSettings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

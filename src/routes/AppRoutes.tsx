import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { Dashboard as HomePage } from '../pages/dashboard/HomePage';
import { PaperDiscovery as DiscoveryPage } from '../pages/dashboard/DiscoveryPage';
import { Workspaces as WorkspacePage } from '../pages/dashboard/WorkspacePage';
import { Synthesis as SynthesisPage } from '../pages/dashboard/SynthesisPage';
import { Analytics as AnalyticsPage } from '../pages/dashboard/AnalyticsPage';
import { Settings as SettingsPage } from '../pages/dashboard/SettingsPage';
import { PaperDetailPage } from '../pages/dashboard/PaperDetailPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<HomePage />} />
        <Route path="discovery" element={<DiscoveryPage />} />
        <Route path="discovery/:paperId" element={<PaperDetailPage />} />
        <Route path="workspace" element={<WorkspacePage />} />
        <Route path="synthesis" element={<SynthesisPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

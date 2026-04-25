import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import HomePage from '../pages/dashboard/HomePage';
import DiscoveryPage from '../pages/dashboard/DiscoveryPage';
import WorkspacePage from '../pages/dashboard/WorkspacePage';
import WorkspaceDetail from '../pages/dashboard/WorkspaceDetail';
import SynthesisPage from '../pages/dashboard/SynthesisPage';
import AnalyticsPage from '../pages/dashboard/AnalyticsPage';
import SettingsPage from '../pages/dashboard/SettingsPage';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path='/' element={<HomePage />} />
          <Route path='/discovery' element={<DiscoveryPage />} />
          <Route path='/workspaces' element={<WorkspacePage />} />
          <Route path='/workspaces/:id' element={<WorkspaceDetail />} />
          <Route path='/synthesis' element={<SynthesisPage />} />
          <Route path='/analytics' element={<AnalyticsPage />} />
          <Route path='/settings' element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}


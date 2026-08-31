import { Route, Routes } from "react-router-dom";

import { RequireAuth } from "./RequireAuth";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { PublicLayout } from "../layouts/PublicLayout";

import { LandingPage } from "../pages/LandingPage";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { DashboardPage } from "../pages/DashboardPage";
import { ProfilePage } from "../pages/ProfilePage";
import { ProjectsPage } from "../pages/ProjectsPage";
import { ProjectEditorPage } from "../pages/ProjectEditorPage";
import { PortfolioSettingsPage } from "../pages/PortfolioSettingsPage";
import { SettingsPage } from "../pages/SettingsPage";
import { PublicPortfolioPage } from "../pages/PublicPortfolioPage";
import { PublicProjectPage } from "../pages/PublicProjectPage";
import { NotFoundPage } from "../pages/NotFoundPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<RequireAuth />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/new" element={<ProjectEditorPage />} />
          <Route path="projects/:projectId" element={<ProjectEditorPage />} />
          <Route path="portfolio" element={<PortfolioSettingsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route element={<PublicLayout />}>
        <Route path="/:username" element={<PublicPortfolioPage />} />
        <Route path="/:username/projects/:slug" element={<PublicProjectPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

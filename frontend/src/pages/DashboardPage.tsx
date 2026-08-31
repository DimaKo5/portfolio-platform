import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import { profileApi } from "../services/profile";
import { projectsApi } from "../services/projects";
import type { Profile, Project } from "../types";

interface DashboardData {
  profile: Profile;
  projects: Project[];
}

export function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([profileApi.get(), projectsApi.list()])
      .then(([profile, projects]) => setData({ profile, projects: projects.items }))
      .catch(() => setError("Failed to load dashboard."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner" />
      </div>
    );
  }

  if (error || !data) {
    return <div className="error-banner">{error ?? "Something went wrong."}</div>;
  }

  const published = data.projects.filter((p) => p.status === "PUBLISHED").length;
  const drafts = data.projects.length - published;
  const profileFields = [
    data.profile.display_name,
    data.profile.headline,
    data.profile.bio,
    data.profile.avatar_url,
    data.profile.github_url || data.profile.telegram_url || data.profile.linkedin_url,
  ];
  const filled = profileFields.filter(Boolean).length;
  const completion = Math.round((filled / profileFields.length) * 100);

  return (
    <div className="page dashboard-page">
      <h1 className="page-title">
        Hello{data.profile.display_name ? `, ${data.profile.display_name}` : ""} 👋
      </h1>
      <p className="page-subtitle">Here is the state of your portfolio.</p>

      <div className="stat-grid">
        <div className="card card-pad stat-card">
          <span className="stat-value">{data.projects.length}</span>
          <span className="stat-label">Projects</span>
          <Link to="/dashboard/projects" className="stat-link">
            Manage →
          </Link>
        </div>
        <div className="card card-pad stat-card">
          <span className="stat-value">{published}</span>
          <span className="stat-label">Published</span>
        </div>
        <div className="card card-pad stat-card">
          <span className="stat-value">{drafts}</span>
          <span className="stat-label">Drafts</span>
        </div>
        <div className="card card-pad stat-card">
          <span className="stat-value">{completion}%</span>
          <span className="stat-label">Profile complete</span>
          <Link to="/dashboard/profile" className="stat-link">
            Edit →
          </Link>
        </div>
      </div>

      <div className="dashboard-actions">
        <div className="card card-pad">
          <h3>Add your first project</h3>
          <p className="muted">
            Each project is a case: Problem, Solution, Result and Tech Stack.
          </p>
          <Link to="/dashboard/projects/new" className="btn btn-primary">
            Create project
          </Link>
        </div>
        <div className="card card-pad">
          <h3>Share your portfolio</h3>
          <p className="muted">
            Your public page: <strong>/{user?.username}</strong>
          </p>
          {user && (
            <Link to={`/${user.username}`} className="btn btn-secondary">
              Open public page ↗
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

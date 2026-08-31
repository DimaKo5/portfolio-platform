import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import { projectsApi } from "../services/projects";
import type { Project } from "../types";

export function PortfolioSettingsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    projectsApi
      .list()
      .then((data) => setProjects(data.items))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner" />
      </div>
    );
  }

  const published = projects.filter((p) => p.status === "PUBLISHED");

  return (
    <div className="page">
      <h1 className="page-title">Portfolio</h1>
      <p className="page-subtitle">
        Everything you publish here becomes visible on your public page.
      </p>

      <div className="card card-pad portfolio-summary">
        <div>
          <h3>Your public URL</h3>
          <p className="muted">
            <strong>{user ? `/${user.username}` : ""}</strong>
            {published.length === 0 && " — publish at least one project to make it interesting."}
          </p>
        </div>
        {user && (
          <Link to={`/${user.username}`} className="btn btn-primary">
            Open public page ↗
          </Link>
        )}
      </div>

      <h3 style={{ margin: "32px 0 12px" }}>Published on your page ({published.length})</h3>
      {published.length === 0 ? (
        <p className="muted">
          Nothing published yet.{" "}
          <Link to="/dashboard/projects">Go to projects →</Link>
        </p>
      ) : (
        <ul className="published-list">
          {published.map((p) => (
            <li key={p.id}>
              <span>{p.title}</span>
              <span className="muted">/{user?.username}/projects/{p.slug}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

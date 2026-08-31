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
      <h1 className="page-title">Портфолио</h1>
      <p className="page-subtitle">
        Всё, что вы публикуете здесь, становится видно на публичной странице.
      </p>

      <div className="card card-pad portfolio-summary">
        <div>
          <h3>Ваша публичная ссылка</h3>
          <p className="muted">
            <strong>{user ? `/${user.username}` : ""}</strong>
            {published.length === 0 &&
              " — опубликуйте хотя бы один проект, чтобы страница была интересной."}
          </p>
        </div>
        {user && (
          <Link to={`/${user.username}`} className="btn btn-primary">
            Открыть публичную страницу ↗
          </Link>
        )}
      </div>

      <h3 style={{ margin: "32px 0 12px" }}>Опубликовано на странице ({published.length})</h3>
      {published.length === 0 ? (
        <p className="muted">
          Пока ничего не опубликовано.{" "}
          <Link to="/dashboard/projects">Перейти к проектам →</Link>
        </p>
      ) : (
        <ul className="published-list">
          {published.map((p) => (
            <li key={p.id}>
              <span>{p.title}</span>
              <span className="muted">
                /{user?.username}/projects/{p.slug}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorBanner } from "../components/ui/ErrorBanner";
import { StatusBadge } from "../components/ui/StatusBadge";
import { Button } from "../components/ui/Button";
import { useToast } from "../hooks/useToast";
import { ApiError } from "../services/api";
import { projectsApi } from "../services/projects";
import type { Project } from "../types";

export function ProjectsPage() {
  const { showSuccess, showError, toastNode } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Project | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    projectsApi
      .list()
      .then((data) => setProjects(data.items))
      .catch(() => setError("Failed to load projects."))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const move = async (index: number, direction: -1 | 1) => {
    const next = [...projects];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setProjects(next);
    try {
      await projectsApi.reorder(next.map((p) => p.id));
    } catch {
      showError("Failed to save the new order");
      load();
    }
  };

  const togglePublish = async (project: Project) => {
    setBusyId(project.id);
    try {
      const updated =
        project.status === "PUBLISHED"
          ? await projectsApi.unpublish(project.id)
          : await projectsApi.publish(project.id);
      setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      showSuccess(
        updated.status === "PUBLISHED" ? "Project published" : "Project unpublished",
      );
    } catch (err) {
      showError(err instanceof ApiError ? err.message : "Action failed");
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setBusyId(deleting.id);
    try {
      await projectsApi.remove(deleting.id);
      setProjects((prev) => prev.filter((p) => p.id !== deleting.id));
      showSuccess("Project deleted");
    } catch {
      showError("Failed to delete project");
    } finally {
      setBusyId(null);
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            Order here = order on your public page.
          </p>
        </div>
        <Link to="/dashboard/projects/new" className="btn btn-primary">
          + New project
        </Link>
      </div>

      {error && <ErrorBanner message={error} onRetry={load} />}

      {projects.length === 0 && !error ? (
        <EmptyState
          title="No projects yet"
          description="Add your first project as a case study: Problem, Solution, Result and Tech Stack."
          action={
            <Link to="/dashboard/projects/new" className="btn btn-primary">
              Create your first project
            </Link>
          }
        />
      ) : (
        <div className="project-list">
          {projects.map((project, index) => (
            <div key={project.id} className="card project-row">
              <div className="project-row-cover">
                {project.cover_image_url ? (
                  <img src={project.cover_image_url} alt="" />
                ) : (
                  <span className="project-row-cover-empty">No image</span>
                )}
              </div>
              <div className="project-row-main">
                <div className="project-row-title">
                  <h3>{project.title}</h3>
                  <StatusBadge status={project.status} />
                </div>
                <p className="muted">{project.short_description || "No description yet."}</p>
                <div className="tech-row">
                  {project.technologies.slice(0, 5).map((t) => (
                    <span key={t.id} className="badge badge-tech">
                      {t.name}
                    </span>
                  ))}
                </div>
              </div>
              <div className="project-row-actions">
                <div className="reorder-controls">
                  <button
                    className="btn btn-ghost btn-sm btn-icon"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    aria-label="Move up"
                  >
                    ↑
                  </button>
                  <button
                    className="btn btn-ghost btn-sm btn-icon"
                    onClick={() => move(index, 1)}
                    disabled={index === projects.length - 1}
                    aria-label="Move down"
                  >
                    ↓
                  </button>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => togglePublish(project)}
                  disabled={busyId === project.id}
                >
                  {project.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                </Button>
                <Link to={`/dashboard/projects/${project.id}`} className="btn btn-secondary btn-sm">
                  Edit
                </Link>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setDeleting(project)}
                  disabled={busyId === project.id}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleting}
        title={`Delete “${deleting?.title ?? ""}”?`}
        description="This permanently removes the project, its images and technologies. This cannot be undone."
        onCancel={() => setDeleting(null)}
        onConfirm={confirmDelete}
      />
      {toastNode}
    </div>
  );
}

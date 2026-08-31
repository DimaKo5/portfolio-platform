import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { ProjectImages } from "../components/project/ProjectImages";
import { ProjectPreview } from "../components/project/ProjectPreview";
import { TechSelect } from "../components/project/TechSelect";
import { Button } from "../components/ui/Button";
import { Field, Input, Textarea } from "../components/ui/Field";
import { StatusBadge } from "../components/ui/StatusBadge";
import { useToast } from "../hooks/useToast";
import { ApiError } from "../services/api";
import { portfolioApi } from "../services/portfolio";
import { projectsApi } from "../services/projects";
import type { Project, ProjectPayload, Technology } from "../types";

export function ProjectEditorPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError, toastNode } = useToast();

  const isNew = !projectId;
  const [project, setProject] = useState<Project | null>(null);
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [selectedTechIds, setSelectedTechIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validation, setValidation] = useState<Record<string, string>>({});
  const [tab, setTab] = useState<"edit" | "preview">("edit");

  useEffect(() => {
    portfolioApi
      .technologies()
      .then(setTechnologies)
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (isNew) return;
    projectsApi
      .get(projectId!)
      .then((data) => {
        setProject(data);
        setSelectedTechIds(data.technologies.map((t) => t.id));
      })
      .catch(() => setError("Project not found."))
      .finally(() => setLoading(false));
  }, [projectId, isNew]);

  const payload: ProjectPayload = useMemo(
    () => ({
      title: project?.title.trim() || "",
      short_description: project?.short_description || null,
      problem: project?.problem || null,
      solution: project?.solution || null,
      features: project?.features || null,
      result: project?.result || null,
      role: project?.role || null,
      github_url: project?.github_url || null,
      live_url: project?.live_url || null,
      cover_image_url: project?.cover_image_url || null,
    }),
    [project],
  );

  const setField = useCallback(
    <K extends keyof Project>(name: K, value: Project[K]) => {
      setProject((prev) => (prev ? { ...prev, [name]: value } : prev));
    },
    [],
  );

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!payload.title) errors.title = "Title is required.";
    if (payload.github_url && !/^https?:\/\/.+/.test(payload.github_url)) {
      errors.github_url = "Must be a valid URL starting with http(s)://";
    }
    if (payload.live_url && !/^https?:\/\/.+/.test(payload.live_url)) {
      errors.live_url = "Must be a valid URL starting with http(s)://";
    }
    setValidation(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (): Promise<Project | null> => {
    if (!validate()) return null;
    setSaving(true);
    setError(null);
    try {
      if (isNew) {
        const created = await projectsApi.create(payload);
        setProject(created);
        setSelectedTechIds([]);
        showSuccess("Project created — now fill in the case study");
        // Keep the user on the editor with a real id in the URL.
        navigate(`/dashboard/projects/${created.id}`, { replace: true });
        return created;
      }
      const updated = await projectsApi.update(projectId!, payload);
      setProject(updated);
      showSuccess("Project saved");
      return updated;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to save project.";
      setError(message);
      showError("Failed to save");
      return null;
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndTech = async () => {
    const saved = await handleSave();
    if (!saved) return;
    try {
      const updated = await projectsApi.setTechnologies(saved.id, selectedTechIds);
      setProject(updated);
      showSuccess("Technologies updated");
    } catch (err) {
      showError(err instanceof ApiError ? err.message : "Failed to update technologies");
    }
  };

  const handlePublishToggle = async () => {
    if (!project) return;
    setPublishing(true);
    try {
      const updated =
        project.status === "PUBLISHED"
          ? await projectsApi.unpublish(project.id)
          : await projectsApi.publish(project.id);
      setProject(updated);
      showSuccess(
        updated.status === "PUBLISHED" ? "Project is live" : "Project moved to drafts",
      );
    } catch (err) {
      showError(err instanceof ApiError ? err.message : "Action failed");
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner" />
      </div>
    );
  }

  if (!isNew && !project) {
    return <div className="error-banner">{error ?? "Project not found."}</div>;
  }

  return (
    <div className="page project-editor">
      <div className="page-header-row">
        <div>
          <div className="editor-title-row">
            <h1 className="page-title">{isNew ? "New project" : "Edit project"}</h1>
            {project && <StatusBadge status={project.status} />}
          </div>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            A good case answers: what problem? what solution? what result?
          </p>
        </div>
        <div className="editor-header-actions">
          {project && (
            <Button
              variant={project.status === "PUBLISHED" ? "secondary" : "primary"}
              onClick={handlePublishToggle}
              disabled={publishing || saving}
            >
              {publishing
                ? "Working…"
                : project.status === "PUBLISHED"
                  ? "Unpublish"
                  : "Publish"}
            </Button>
          )}
          <Button onClick={handleSaveAndTech} disabled={saving || publishing}>
            {saving ? "Saving…" : "Save"}
          </Button>
          <Link to="/dashboard/projects" className="btn btn-ghost">
            Close
          </Link>
        </div>
      </div>

      <div className="editor-tabs">
        <button
          className={`editor-tab ${tab === "edit" ? "active" : ""}`}
          onClick={() => setTab("edit")}
        >
          Edit
        </button>
        <button
          className={`editor-tab ${tab === "preview" ? "active" : ""}`}
          onClick={() => setTab("preview")}
        >
          Preview
        </button>
      </div>

      {tab === "preview" && project ? (
        <ProjectPreview project={project} />
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleSave();
          }}
          noValidate
        >
          {error && <div className="error-banner">{error}</div>}

          <section className="card card-pad editor-section">
            <h3>Basics</h3>
            <Field label="Project title" error={validation.title}>
              <Input
                value={project?.title ?? ""}
                onChange={(e) => setField("title", e.target.value as Project["title"])}
                placeholder="Telegram CRM"
                maxLength={120}
                invalid={!!validation.title}
              />
            </Field>
            <Field label="Short description" hint="One sentence — shown on the portfolio card">
              <Input
                value={project?.short_description ?? ""}
                onChange={(e) => setField("short_description", e.target.value)}
                placeholder="CRM system for Telegram-based businesses."
                maxLength={300}
              />
            </Field>
          </section>

          <section className="card card-pad editor-section">
            <h3>Case study</h3>
            <Field label="Problem" hint="What problem did this project solve?">
              <Textarea
                value={project?.problem ?? ""}
                onChange={(e) => setField("problem", e.target.value)}
                placeholder="Businesses were managing leads manually in chats and losing requests."
                rows={4}
              />
            </Field>
            <Field label="Solution" hint="How was the problem solved?">
              <Textarea
                value={project?.solution ?? ""}
                onChange={(e) => setField("solution", e.target.value)}
                placeholder="Built a centralized CRM with Telegram bot integration for lead capture."
                rows={4}
              />
            </Field>
            <div className="form-grid">
              <Field label="My role">
                <Input
                  value={project?.role ?? ""}
                  onChange={(e) => setField("role", e.target.value)}
                  placeholder="Full-Stack Developer"
                  maxLength={120}
                />
              </Field>
              <Field label="Result" hint="What was achieved?">
                <Input
                  value={project?.result ?? ""}
                  onChange={(e) => setField("result", e.target.value)}
                  placeholder="Automated lead management, response time cut in half."
                />
              </Field>
            </div>
            <Field label="Features" hint="What was implemented? One per line.">
              <Textarea
                value={project?.features ?? ""}
                onChange={(e) => setField("features", e.target.value)}
                placeholder={"Lead capture bot\nDeals pipeline\nNotifications"}
                rows={3}
              />
            </Field>
          </section>

          <section className="card card-pad editor-section">
            <h3>Tech stack</h3>
            <TechSelect
              technologies={technologies}
              selectedIds={selectedTechIds}
              onChange={setSelectedTechIds}
            />
            <p className="field-hint">
              Press “Save” to apply the selected technologies to the project.
            </p>
          </section>

          <section className="card card-pad editor-section">
            <h3>Links</h3>
            <div className="form-grid">
              <Field label="Live demo URL" error={validation.live_url}>
                <Input
                  type="url"
                  value={project?.live_url ?? ""}
                  onChange={(e) => setField("live_url", e.target.value)}
                  placeholder="https://myproject.example.com"
                  invalid={!!validation.live_url}
                />
              </Field>
              <Field label="GitHub URL" error={validation.github_url}>
                <Input
                  type="url"
                  value={project?.github_url ?? ""}
                  onChange={(e) => setField("github_url", e.target.value)}
                  placeholder="https://github.com/username/project"
                  invalid={!!validation.github_url}
                />
              </Field>
            </div>
          </section>

          {project && (
            <ProjectImages
              project={project}
              onProjectChange={setProject}
              onError={(msg) => showError(msg)}
            />
          )}

          <div className="form-actions editor-footer">
            <Button type="submit" size="lg" disabled={saving}>
              {saving ? "Saving…" : isNew ? "Create project" : "Save changes"}
            </Button>
            {project && (
              <span className="field-hint">
                {project.status === "PUBLISHED"
                  ? "This project is visible on your public page."
                  : "Draft — visible only to you until you publish."}
              </span>
            )}
          </div>
        </form>
      )}
      {toastNode}
    </div>
  );
}

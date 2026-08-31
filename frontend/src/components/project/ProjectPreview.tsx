import type { Project } from "../../types";

interface ProjectPreviewProps {
  project: Project;
}

export function ProjectPreview({ project }: ProjectPreviewProps) {
  return (
    <div className="preview-wrap">
      <article className="card preview-card">
        {project.cover_image_url && (
          <img src={project.cover_image_url} alt="" className="preview-cover" />
        )}
        <div className="preview-body">
          <h1>{project.title || "Проект без названия"}</h1>
          <p className="preview-lead">{project.short_description}</p>

          <div className="tech-row" style={{ marginBottom: 24 }}>
            {project.technologies.map((t) => (
              <span key={t.id} className="badge badge-tech">
                {t.name}
              </span>
            ))}
          </div>

          {project.problem && (
            <section className="preview-section">
              <h4>Проблема</h4>
              <p>{project.problem}</p>
            </section>
          )}
          {project.solution && (
            <section className="preview-section">
              <h4>Решение</h4>
              <p>{project.solution}</p>
            </section>
          )}
          {project.role && (
            <section className="preview-section">
              <h4>Моя роль</h4>
              <p>{project.role}</p>
            </section>
          )}
          {project.features && (
            <section className="preview-section">
              <h4>Функции</h4>
              <ul>
                {project.features.split("\n").map((line, i) =>
                  line.trim() ? <li key={i}>{line.trim()}</li> : null,
                )}
              </ul>
            </section>
          )}
          {project.result && (
            <section className="preview-section">
              <h4>Результат</h4>
              <p>{project.result}</p>
            </section>
          )}

          <div className="preview-links">
            {project.live_url && (
              <a href={project.live_url} target="_blank" rel="noreferrer" className="btn btn-primary">
                Live demo ↗
              </a>
            )}
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary"
              >
                Исходный код ↗
              </a>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}

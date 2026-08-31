import { useState } from "react";

import { ApiError } from "../../services/api";
import { projectsApi } from "../../services/projects";
import type { Project, ProjectImage } from "../../types";

interface ProjectImagesProps {
  project: Project;
  onProjectChange: (project: Project) => void;
  onError: (message: string) => void;
}

export function ProjectImages({ project, onProjectChange, onError }: ProjectImagesProps) {
  const [uploading, setUploading] = useState(false);

  const upload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const image = await projectsApi.uploadImage(project.id, file);
      onProjectChange({ ...project, images: [...project.images, image] });
    } catch (err) {
      onError(err instanceof ApiError ? err.message : "Не удалось загрузить изображение.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const setCover = (url: string) => {
    projectsApi
      .update(project.id, { cover_image_url: url })
      .then(onProjectChange)
      .catch(() => onError("Не удалось установить обложку."));
  };

  const removeImage = async (image: ProjectImage) => {
    try {
      await projectsApi.deleteImage(project.id, image.id);
      const images = project.images.filter((img) => img.id !== image.id);
      onProjectChange({
        ...project,
        images,
        cover_image_url:
          project.cover_image_url === image.url ? null : project.cover_image_url,
      });
    } catch {
      onError("Не удалось удалить изображение.");
    }
  };

  return (
    <section className="card card-pad editor-section">
      <h3>Обложка и изображения</h3>
      <p className="muted" style={{ marginBottom: 16 }}>
        Обложка показывается на карточке проекта в портфолио. JPEG, PNG или WebP до 5 МБ.
      </p>
      <label className="upload-dropzone">
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={upload} hidden />
        {uploading ? "Загрузка…" : "+ Добавить изображение"}
      </label>

      {project.images.length > 0 && (
        <div className="image-grid">
          {project.images.map((image) => (
            <div key={image.id} className="image-tile">
              <img src={image.url} alt="" />
              <div className="image-tile-actions">
                {project.cover_image_url === image.url ? (
                  <span className="badge badge-published">Обложка</span>
                ) : (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setCover(image.url)}
                  >
                    Сделать обложкой
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => removeImage(image)}
                >
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

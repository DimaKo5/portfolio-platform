import { api } from "./api";
import type { Project, ProjectImage, ProjectListResponse, ProjectPayload } from "../types";

export const projectsApi = {
  list: () => api.get<ProjectListResponse>("/projects"),

  get: (id: string) => api.get<Project>(`/projects/${id}`),

  create: (data: ProjectPayload) => api.post<Project>("/projects", data),

  update: (id: string, data: Partial<ProjectPayload>) =>
    api.put<Project>(`/projects/${id}`, data),

  remove: (id: string) => api.delete<void>(`/projects/${id}`),

  publish: (id: string) => api.post<Project>(`/projects/${id}/publish`),

  unpublish: (id: string) => api.post<Project>(`/projects/${id}/unpublish`),

  reorder: (projectIds: string[]) =>
    api.put<void>("/projects/reorder", { project_ids: projectIds }),

  setTechnologies: (id: string, technologyIds: string[]) =>
    api.put<Project>(`/projects/${id}/technologies`, { technology_ids: technologyIds }),

  uploadImage: (projectId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.upload<ProjectImage>(`/projects/${projectId}/images`, formData);
  },

  deleteImage: (projectId: string, imageId: string) =>
    api.delete<void>(`/projects/${projectId}/images/${imageId}`),
};

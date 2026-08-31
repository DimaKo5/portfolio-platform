import { api } from "./api";
import type { PublicPortfolio, PublicProject, Technology } from "../types";

export const portfolioApi = {
  technologies: () => api.get<Technology[]>("/technologies"),

  getPublic: (username: string) => api.get<PublicPortfolio>(`/public/${username}`),

  getPublicProject: (username: string, slug: string) =>
    api.get<PublicProject>(`/public/${username}/projects/${slug}`),
};

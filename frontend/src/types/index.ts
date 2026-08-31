export type ProjectStatus = "DRAFT" | "PUBLISHED";

export interface User {
  id: string;
  email: string;
  username: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Profile {
  id: string;
  display_name: string | null;
  headline: string | null;
  bio: string | null;
  avatar_url: string | null;
  location: string | null;
  website_url: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  telegram_url: string | null;
}

export interface Technology {
  id: string;
  name: string;
  slug: string;
  category: string | null;
}

export interface ProjectImage {
  id: string;
  url: string;
  alt_text: string | null;
  sort_order: number;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  problem: string | null;
  solution: string | null;
  features: string | null;
  result: string | null;
  role: string | null;
  cover_image_url: string | null;
  github_url: string | null;
  live_url: string | null;
  status: ProjectStatus;
  sort_order: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  technologies: Technology[];
  images: ProjectImage[];
}

export interface ProjectListResponse {
  items: Project[];
  total: number;
}

export interface ProjectPayload {
  title: string;
  short_description?: string | null;
  problem?: string | null;
  solution?: string | null;
  features?: string | null;
  result?: string | null;
  role?: string | null;
  github_url?: string | null;
  live_url?: string | null;
  cover_image_url?: string | null;
}

export interface PublicPortfolio {
  username: string;
  profile: Profile;
  projects: Project[];
  skills: string[];
}

export interface PublicProject {
  username: string;
  project: Project;
}

export interface ApiErrorPayload {
  error: {
    code: string;
    message: string;
  };
}

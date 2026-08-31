import { api } from "./api";
import type { Profile } from "../types";

export const profileApi = {
  get: () => api.get<Profile>("/profile"),

  update: (data: Partial<Profile>) => api.put<Profile>("/profile", data),

  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.upload<{ avatar_url: string }>("/profile/avatar", formData);
  },
};

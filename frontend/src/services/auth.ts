import { api } from "./api";
import type { AuthResponse, User } from "../types";

export const authApi = {
  register: (email: string, username: string, password: string) =>
    api.post<AuthResponse>("/auth/register", { email, username, password }),

  login: (email: string, password: string) =>
    api.post<AuthResponse>("/auth/login", { email, password }),

  me: () => api.get<User>("/auth/me"),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.put<void>("/auth/password", {
      current_password: currentPassword,
      new_password: newPassword,
    }),
};

export function saveToken(token: string) {
  localStorage.setItem("token", token);
}

export function clearToken() {
  localStorage.removeItem("token");
}

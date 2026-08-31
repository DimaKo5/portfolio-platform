import { AppRoutes } from "./AppRoutes";
import { AuthProvider } from "../hooks/useAuth";

export function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

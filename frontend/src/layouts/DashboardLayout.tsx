import { NavLink, Outlet } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

const navItems = [
  { to: "/dashboard", label: "Overview", end: true },
  { to: "/dashboard/profile", label: "Profile" },
  { to: "/dashboard/projects", label: "Projects" },
  { to: "/dashboard/portfolio", label: "Portfolio" },
];

export function DashboardLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard">
      <aside className="dashboard-sidebar">
        <div className="dashboard-brand">
          <NavLink to="/" className="brand-mark">
            PP
          </NavLink>
          <span>Portfolio Platform</span>
        </div>
        <nav className="dashboard-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `dashboard-nav-link ${isActive ? "active" : ""}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="dashboard-sidebar-footer">
          {user && (
            <NavLink to={`/${user.username}`} className="public-link">
              View public page ↗
            </NavLink>
          )}
          <button className="btn btn-ghost btn-sm" onClick={logout}>
            Log out
          </button>
        </div>
      </aside>
      <main className="dashboard-main">
        <Outlet />
      </main>
    </div>
  );
}

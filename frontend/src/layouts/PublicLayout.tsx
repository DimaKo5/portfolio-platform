import { Link, Outlet } from "react-router-dom";

export function PublicLayout() {
  return (
    <div className="public-layout">
      <header className="public-header">
        <div className="container public-header-inner">
          <Link to="/" className="brand-mark" aria-label="Portfolio Platform home">
            PP
          </Link>
          <nav className="public-header-nav">
            <Link to="/login" className="btn btn-ghost btn-sm">
              Log in
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              Get started
            </Link>
          </nav>
        </div>
      </header>
      <Outlet />
      <footer className="public-footer">
        <div className="container">
          <span>Portfolio Platform — show your real work.</span>
        </div>
      </footer>
    </div>
  );
}

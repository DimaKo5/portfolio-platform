import { Link } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

export function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="landing">
      <header className="landing-header">
        <div className="container landing-header-inner">
          <Link to="/" className="brand-mark">
            PP
          </Link>
          <nav className="landing-nav">
            {user ? (
              <Link to="/dashboard" className="btn btn-primary btn-sm">
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm">
                  Log in
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  Create portfolio
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <section className="landing-hero">
        <div className="container">
          <h1>
            Show your <span className="accent">real work</span>,<br />
            not just words about yourself.
          </h1>
          <p className="landing-lead">
            Portfolio Platform turns your projects into professional case studies —
            Problem, Solution, Result, Tech Stack — and gives you one public link to share
            with employers and clients.
          </p>
          <div className="landing-cta">
            <Link to={user ? "/dashboard" : "/register"} className="btn btn-primary btn-lg">
              Create your portfolio — free
            </Link>
            <span className="landing-cta-note">No credit card. Ready in minutes.</span>
          </div>

          <div className="landing-demo card">
            <div className="landing-demo-header">
              <span className="landing-demo-dot" />
              <span className="landing-demo-dot" />
              <span className="landing-demo-dot" />
              <span className="landing-demo-url">/dmitriy</span>
            </div>
            <div className="landing-demo-body">
              <div className="landing-demo-profile">
                <div className="landing-demo-avatar" />
                <div>
                  <strong>Dmitriy K.</strong>
                  <span>Full-Stack Developer</span>
                </div>
              </div>
              <div className="landing-demo-projects">
                <div className="landing-demo-project">
                  <strong>Telegram CRM</strong>
                  <span className="landing-demo-line">Problem · Solution · Result</span>
                  <div className="tech-row">
                    <span className="badge badge-tech">Python</span>
                    <span className="badge badge-tech">FastAPI</span>
                    <span className="badge badge-tech">React</span>
                  </div>
                </div>
                <div className="landing-demo-project">
                  <strong>Analytics Dashboard</strong>
                  <span className="landing-demo-line">Problem · Solution · Result</span>
                  <div className="tech-row">
                    <span className="badge badge-tech">TypeScript</span>
                    <span className="badge badge-tech">PostgreSQL</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-features">
        <div className="container">
          <h2>Why case studies beat a list of links</h2>
          <div className="feature-grid">
            <div className="card card-pad feature-card">
              <h3>Structure that sells</h3>
              <p>
                Each project answers the questions a client actually has: what was the
                problem, what did you do, and what came out of it.
              </p>
            </div>
            <div className="card card-pad feature-card">
              <h3>One link for everything</h3>
              <p>
                Your public portfolio lives at /yourname — send it instead of scattering
                screenshots and repositories across chats.
              </p>
            </div>
            <div className="card card-pad feature-card">
              <h3>Projects first</h3>
              <p>
                Works are the hero. No ten-page “about me” — visitors see your projects,
                technologies and results immediately.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-cta-final">
        <div className="container">
          <h2>Ready to show what you can do?</h2>
          <Link to={user ? "/dashboard" : "/register"} className="btn btn-primary btn-lg">
            {user ? "Open dashboard" : "Create your portfolio"}
          </Link>
        </div>
      </section>

      <footer className="public-footer">
        <div className="container">
          <span>Portfolio Platform — show your real work.</span>
        </div>
      </footer>
    </div>
  );
}

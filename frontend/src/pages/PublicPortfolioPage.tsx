import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { ErrorBanner } from "../components/ui/ErrorBanner";
import { ApiError } from "../services/api";
import { portfolioApi } from "../services/portfolio";
import type { PublicPortfolio } from "../types";

export function PublicPortfolioPage() {
  const { username } = useParams<{ username: string }>();
  const [portfolio, setPortfolio] = useState<PublicPortfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    portfolioApi
      .getPublic(username)
      .then(setPortfolio)
      .catch((err) =>
        setError(err instanceof ApiError && err.status === 404 ? "not-found" : "Failed to load portfolio."),
      )
      .finally(() => setLoading(false));
  }, [username]);

  useEffect(() => {
    if (portfolio) {
      document.title = portfolio.profile.display_name
        ? `${portfolio.profile.display_name} — Portfolio`
        : `${portfolio.username} — Portfolio`;
    }
    return () => {
      document.title = "Portfolio Platform — Show your real work";
    };
  }, [portfolio]);

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner" />
      </div>
    );
  }

  if (error === "not-found") {
    return (
      <div className="public-404 container">
        <h1>Portfolio not found</h1>
        <p>There is no portfolio at /{username}.</p>
        <Link to="/" className="btn btn-primary">
          Portfolio Platform ↗
        </Link>
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="container" style={{ paddingTop: 40 }}>
        <ErrorBanner message={error ?? "Failed to load."} />
      </div>
    );
  }

  const { profile } = portfolio;

  return (
    <div className="pf">
      {/* Hero */}
      <section className="pf-hero">
        <div className="container pf-hero-inner">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="pf-avatar" />
          ) : (
            <div className="pf-avatar pf-avatar-empty">
              {(profile.display_name ?? username ?? "?").charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1>{profile.display_name ?? `@${portfolio.username}`}</h1>
            {profile.headline && <p className="pf-headline">{profile.headline}</p>}
            {profile.location && <p className="pf-location">{profile.location}</p>}
            <div className="pf-contact-row">
              {profile.website_url && (
                <a href={profile.website_url} target="_blank" rel="noreferrer" className="badge badge-tech">
                  Website ↗
                </a>
              )}
              {profile.github_url && (
                <a href={profile.github_url} target="_blank" rel="noreferrer" className="badge badge-tech">
                  GitHub ↗
                </a>
              )}
              {profile.linkedin_url && (
                <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="badge badge-tech">
                  LinkedIn ↗
                </a>
              )}
              {profile.telegram_url && (
                <a href={profile.telegram_url} target="_blank" rel="noreferrer" className="badge badge-tech">
                  Telegram ↗
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="container pf-content">
        {/* About */}
        {profile.bio && (
          <section className="pf-section">
            <h2>About</h2>
            <p className="pf-bio">{profile.bio}</p>
          </section>
        )}

        {/* Skills */}
        {portfolio.skills.length > 0 && (
          <section className="pf-section">
            <h2>Technologies</h2>
            <div className="tech-row">
              {portfolio.skills.map((skill) => (
                <span key={skill} className="badge badge-tech">
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        <section className="pf-section">
          <h2>Projects</h2>
          {portfolio.projects.length === 0 ? (
            <p className="muted">No published projects yet.</p>
          ) : (
            <div className="pf-projects-grid">
              {portfolio.projects.map((project) => (
                <Link
                  key={project.id}
                  to={`/${portfolio.username}/projects/${project.slug}`}
                  className="card pf-project-card"
                >
                  <div className="pf-project-cover">
                    {project.cover_image_url ? (
                      <img src={project.cover_image_url} alt="" loading="lazy" />
                    ) : (
                      <div className="pf-project-cover-fallback">
                        {project.title.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="pf-project-body">
                    <h3>{project.title}</h3>
                    <p>{project.short_description}</p>
                    <div className="tech-row">
                      {project.technologies.slice(0, 4).map((t) => (
                        <span key={t.id} className="badge badge-tech">
                          {t.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Contacts */}
        <section className="pf-section pf-contacts">
          <h2>Contact</h2>
          <p className="muted">Reach out via any of the links:</p>
          <div className="pf-contact-row">
            {profile.telegram_url && (
              <a href={profile.telegram_url} target="_blank" rel="noreferrer" className="btn btn-secondary">
                Telegram ↗
              </a>
            )}
            {profile.linkedin_url && (
              <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="btn btn-secondary">
                LinkedIn ↗
              </a>
            )}
            {profile.website_url && (
              <a href={profile.website_url} target="_blank" rel="noreferrer" className="btn btn-secondary">
                Website ↗
              </a>
            )}
            {profile.github_url && (
              <a href={profile.github_url} target="_blank" rel="noreferrer" className="btn btn-secondary">
                GitHub ↗
              </a>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

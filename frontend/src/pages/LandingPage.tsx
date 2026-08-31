import { Link } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import { useSeo } from "../hooks/useSeo";

export function LandingPage() {
  const { user } = useAuth();
  useSeo({
    title: "Portfolio Platform — покажите реальные работы",
    description:
      "Создайте профессиональное портфолио с реальными проектами: Проблема, Решение, Результат, Технологии. Одна ссылка для работодателей и клиентов.",
  });

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
                В личный кабинет
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm">
                  Войти
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  Создать портфолио
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <section className="landing-hero">
        <div className="container">
          <h1>
            Покажите <span className="accent">реальные работы</span>,<br />
            а не просто слова о себе.
          </h1>
          <p className="landing-lead">
            Portfolio Platform превращает ваши проекты в профессиональные кейсы —
            Проблема, Решение, Результат, Технологии — и даёт одну публичную ссылку
            для работодателей и клиентов.
          </p>
          <div className="landing-cta">
            <Link to={user ? "/dashboard" : "/register"} className="btn btn-primary btn-lg">
              Создать портфолио — бесплатно
            </Link>
            <span className="landing-cta-note">Без карты. Готово за несколько минут.</span>
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
                  <strong>Дмитрий К.</strong>
                  <span>Full-Stack разработчик</span>
                </div>
              </div>
              <div className="landing-demo-projects">
                <div className="landing-demo-project">
                  <strong>Telegram CRM</strong>
                  <span className="landing-demo-line">Проблема · Решение · Результат</span>
                  <div className="tech-row">
                    <span className="badge badge-tech">Python</span>
                    <span className="badge badge-tech">FastAPI</span>
                    <span className="badge badge-tech">React</span>
                  </div>
                </div>
                <div className="landing-demo-project">
                  <strong>Analytics Dashboard</strong>
                  <span className="landing-demo-line">Проблема · Решение · Результат</span>
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
          <h2>Почему кейсы работают лучше списка ссылок</h2>
          <div className="feature-grid">
            <div className="card card-pad feature-card">
              <h3>Структура, которая продаёт</h3>
              <p>
                Каждый проект отвечает на вопросы, которые реально задаёт клиент: какая
                была проблема, что вы сделали и к чему это привело.
              </p>
            </div>
            <div className="card card-pad feature-card">
              <h3>Одна ссылка на всё</h3>
              <p>
                Ваше портфолио живёт по адресу /yourname — отправляйте его вместо
                скриншотов и репозиториев, разбросанных по чатам.
              </p>
            </div>
            <div className="card card-pad feature-card">
              <h3>Проекты — на первом месте</h3>
              <p>
                Работы — главный герой. Без десяти страниц «обо мне»: посетитель сразу
                видит проекты, технологии и результаты.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-cta-final">
        <div className="container">
          <h2>Готовы показать, что умеете?</h2>
          <Link to={user ? "/dashboard" : "/register"} className="btn btn-primary btn-lg">
            {user ? "Открыть личный кабинет" : "Создать портфолио"}
          </Link>
        </div>
      </section>

      <footer className="public-footer">
        <div className="container">
          <span>Portfolio Platform — покажите свои реальные работы.</span>
        </div>
      </footer>
    </div>
  );
}

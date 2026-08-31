# Portfolio Platform — Technical Architecture

**Version:** 1.0
**Status:** Approved for development
**Document:** `02_ARCHITECTURE.md`

---

## 1. Architecture Goal

Архитектура Portfolio Platform должна быть:

* простой для быстрого MVP;
* понятной для дальнейшего развития;
* разделённой на frontend и backend;
* безопасной;
* удобной для тестирования;
* пригодной для запуска через Docker;
* без ненужной микросервисной сложности.

На этапе MVP используется **модульный монолит**.

```text
Frontend
   ↓
REST API
   ↓
Backend
   ↓
PostgreSQL
```

Дополнительные внешние сервисы подключаются через отдельные модули:

```text
Backend
 ├── GitHub API
 └── AI Provider
```

---

# 2. Technology Stack

## Frontend

Основной стек:

* React
* TypeScript
* Vite
* React Router
* CSS / CSS Modules

Frontend отвечает за:

* интерфейс;
* dashboard;
* редактор профиля;
* редактор проектов;
* preview портфолио;
* публичные страницы;
* обработку пользовательских действий;
* отображение ошибок и состояний загрузки.

Не использовать UI-библиотеки без необходимости.

---

## Backend

Основной стек:

* Python 3.12+
* FastAPI
* Pydantic
* SQLAlchemy
* Alembic

Backend отвечает за:

* authentication;
* пользователей;
* профили;
* проекты;
* технологии;
* изображения;
* публичные портфолио;
* GitHub integration;
* AI integration;
* валидацию;
* бизнес-логику;
* API.

---

## Database

Используется:

**PostgreSQL**

PostgreSQL является основной persistent database.

Все основные данные приложения должны храниться в БД.

---

## Infrastructure

Для локальной разработки и production-подобного запуска:

* Docker;
* Docker Compose;
* `.env`;
* `.env.example`.

На первом этапе не использовать Kubernetes, отдельные микросервисы или сложную cloud-инфраструктуру.

---

# 3. High-Level Architecture

```text
                         ┌─────────────────────┐
                         │      Browser        │
                         └──────────┬──────────┘
                                    │
                                    │ HTTPS
                                    ▼
                         ┌─────────────────────┐
                         │ React + TypeScript  │
                         │      Frontend       │
                         └──────────┬──────────┘
                                    │
                                    │ REST API
                                    ▼
                         ┌─────────────────────┐
                         │       FastAPI       │
                         │       Backend       │
                         └──────────┬──────────┘
                                    │
                ┌───────────────────┼───────────────────┐
                │                   │                   │
                ▼                   ▼                   ▼
       ┌────────────────┐  ┌────────────────┐  ┌────────────────┐
       │   PostgreSQL   │  │   GitHub API   │  │   AI Provider  │
       └────────────────┘  └────────────────┘  └────────────────┘
```

---

# 4. Backend Architecture

Backend строится по модульному принципу.

Рекомендуемая структура:

```text
backend/
├── app/
│   ├── main.py
│   │
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   └── database.py
│   │
│   ├── models/
│   │   ├── user.py
│   │   ├── profile.py
│   │   ├── project.py
│   │   ├── technology.py
│   │   └── portfolio.py
│   │
│   ├── schemas/
│   │   ├── auth.py
│   │   ├── user.py
│   │   ├── profile.py
│   │   ├── project.py
│   │   ├── portfolio.py
│   │   └── github.py
│   │
│   ├── api/
│   │   ├── auth.py
│   │   ├── profile.py
│   │   ├── projects.py
│   │   ├── portfolio.py
│   │   ├── github.py
│   │   └── ai.py
│   │
│   ├── services/
│   │   ├── auth_service.py
│   │   ├── project_service.py
│   │   ├── portfolio_service.py
│   │   ├── github_service.py
│   │   └── ai_service.py
│   │
│   └── utils/
│
├── alembic/
├── tests/
├── requirements.txt
└── Dockerfile
```

---

# 5. Backend Layer Responsibilities

## API Layer

`api/`

Отвечает только за HTTP:

* получение request;
* authentication dependency;
* validation;
* вызов service;
* формирование response.

API endpoints не должны содержать сложную бизнес-логику.

---

## Service Layer

`services/`

Здесь находится основная бизнес-логика.

Например:

```text
create_project()
update_project()
publish_project()
delete_project()
import_github_repository()
generate_project_description()
```

Это позволит не смешивать бизнес-правила с HTTP-кодом.

---

## Models

`models/`

SQLAlchemy-модели базы данных.

---

## Schemas

`schemas/`

Pydantic-модели:

* request;
* response;
* validation.

---

## Core

`core/`

Системные компоненты:

* configuration;
* database;
* security;
* authentication;
* environment variables.

---

# 6. Frontend Architecture

Рекомендуемая структура:

```text
frontend/
├── src/
│   ├── app/
│   │   ├── router.tsx
│   │   └── providers.tsx
│   │
│   ├── pages/
│   │   ├── LandingPage/
│   │   ├── LoginPage/
│   │   ├── RegisterPage/
│   │   ├── DashboardPage/
│   │   ├── ProfilePage/
│   │   ├── ProjectsPage/
│   │   ├── ProjectEditorPage/
│   │   ├── PortfolioPreviewPage/
│   │   ├── PublicPortfolioPage/
│   │   └── PublicProjectPage/
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── project/
│   │   ├── profile/
│   │   └── portfolio/
│   │
│   ├── services/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   ├── projects.ts
│   │   ├── profile.ts
│   │   ├── github.ts
│   │   └── ai.ts
│   │
│   ├── hooks/
│   ├── types/
│   ├── utils/
│   └── styles/
│
├── public/
├── package.json
└── Dockerfile
```

---

# 7. Frontend Principles

Frontend должен использовать компонентный подход.

Нельзя создавать один огромный компонент на несколько сотен строк, если функциональность можно логически разделить.

Например:

```text
ProjectCard
ProjectForm
ProjectPreview
TechnologyBadge
PortfolioHeader
PortfolioProjects
```

должны быть отдельными компонентами.

---

# 8. Routing

Frontend использует React Router.

Основные маршруты:

```text
/
├── /login
├── /register
│
├── /dashboard
├── /dashboard/profile
├── /dashboard/projects
├── /dashboard/projects/new
├── /dashboard/projects/:id
├── /dashboard/portfolio
│
├── /:username
└── /:username/projects/:slug
```

Приватные маршруты:

```text
/dashboard/*
```

требуют authentication.

Публичные маршруты:

```text
/:username
/:username/projects/:slug
```

не требуют авторизации.

---

# 9. Authentication

Для MVP используется token-based authentication.

Основной вариант:

**JWT access token + secure authentication flow.**

Пароли никогда не хранятся в открытом виде.

Используется password hashing.

Минимальный flow:

```text
Register
   ↓
Hash password
   ↓
Save User
   ↓
Login
   ↓
Verify password
   ↓
Issue token
   ↓
Authenticated requests
```

Backend должен проверять пользователя на каждом защищённом endpoint.

---

# 10. Authorization

Каждый пользователь имеет доступ только к собственным данным.

Например:

```text
User A
 ├── Project A1
 └── Project A2

User B
 ├── Project B1
 └── Project B2
```

User A не может:

* получить Project B1 через API;
* изменить Project B1;
* удалить Project B1;
* изменить профиль User B.

Проверка ownership обязательна на backend.

Нельзя полагаться только на frontend.

---

# 11. Public Portfolio Architecture

Публичное портфолио строится из данных пользователя.

```text
username
    ↓
Find User
    ↓
Find Profile
    ↓
Find Published Projects
    ↓
Sort Projects
    ↓
Return Public Portfolio
```

Непубличные проекты не должны отображаться на публичной странице.

---

# 12. Project Visibility

Каждый проект имеет статус публикации.

Минимально:

```text
DRAFT
PUBLISHED
```

### DRAFT

Проект виден владельцу в dashboard.

На публичной странице не отображается.

### PUBLISHED

Проект отображается в публичном портфолио.

---

# 13. GitHub Integration

GitHub используется как внешний источник информации.

Архитектура:

```text
Frontend
   ↓
POST /github/import
   ↓
Backend
   ↓
GitHub Service
   ↓
GitHub API
   ↓
Repository Data
   ↓
Backend normalization
   ↓
Frontend
```

GitHub Service является отдельным модулем.

Он не должен быть напрямую связан с database models.

---

## GitHub Import Principle

Импортированные данные являются **черновиком**.

Например:

```text
GitHub Repository
       ↓
Import
       ↓
Project Draft
       ↓
User edits
       ↓
Publish
```

Это позволяет пользователю исправить:

* название;
* описание;
* технологии;
* результат;
* screenshots;
* текст кейса.

---

# 14. AI Architecture

AI подключается через отдельный service layer.

```text
Frontend
   ↓
POST /ai/project-description
   ↓
AI Service
   ↓
AI Provider
   ↓
Structured Response
   ↓
Frontend
```

AI Provider не должен вызываться непосредственно из frontend.

API key никогда не передаётся браузеру.

---

## AI Input

AI может получать:

```text
Project name
Description
Features
Tech stack
Role
GitHub metadata
User-provided results
```

---

## AI Output

AI должен возвращать структурированные поля:

```text
short_description
problem
solution
features
result
```

Ответ желательно получать в JSON-формате, который затем валидируется backend.

---

# 15. AI Safety / Data Integrity

AI не имеет права самостоятельно создавать подтверждённые достижения.

Например, если пользователь написал:

> Сделал Telegram-бота.

AI не должен превращать это в:

> Бот обработал 10 000 пользователей и сократил расходы на 40%.

если таких данных нет.

Допускается:

> Бот автоматизирует проверку подписки пользователей.

Если это следует из предоставленной информации.

---

# 16. Image Upload Architecture

Изображения проектов не должны храниться непосредственно в PostgreSQL как большие binary objects на этапе MVP.

База хранит metadata:

```text
image_id
project_id
filename
url/path
created_at
```

Файл хранится в файловом storage.

Для локальной разработки:

```text
backend/uploads/
```

Для дальнейшего production deployment storage можно заменить на S3-compatible object storage без изменения основной бизнес-логики.

---

# 17. API Communication

Frontend взаимодействует с backend только через API.

Пример:

```text
React
  ↓
GET /api/v1/projects
  ↓
FastAPI
  ↓
PostgreSQL
  ↓
JSON
  ↓
React
```

API должен использовать версионирование:

```text
/api/v1/...
```

Это позволит в будущем добавить:

```text
/api/v2/...
```

без полного изменения клиента.

---

# 18. API Error Handling

Backend должен возвращать понятные HTTP errors.

Примеры:

```text
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Validation Error
500 Internal Server Error
```

Frontend должен показывать пользователю понятное сообщение, а не технический traceback.

Например вместо:

```text
IntegrityError: duplicate key...
```

показывать:

> Этот username уже занят.

---

# 19. Database Architecture

PostgreSQL используется как единый источник истины.

Основные сущности:

```text
User
Profile
Project
Technology
ProjectTechnology
Portfolio
ProjectImage
```

Связи подробно определяются в `03_DATA_API.md`.

---

# 20. Database Migrations

Для миграций используется Alembic.

Нельзя изменять production schema вручную.

Изменение модели:

```text
SQLAlchemy Model
       ↓
Alembic Migration
       ↓
Database
```

Каждое изменение структуры БД должно иметь миграцию.

---

# 21. Security Principles

Минимальные требования:

* пароли хэшируются;
* JWT secrets находятся в environment variables;
* AI API keys находятся только на backend;
* GitHub credentials не хранятся во frontend;
* CORS ограничивается разрешёнными origins;
* пользователь может изменять только собственные ресурсы;
* входные данные валидируются;
* URLs валидируются;
* загрузка файлов ограничивается по размеру и типу;
* SQL строится через ORM/parameterized queries;
* sensitive data не записывается в обычные логи.

---

# 22. Environment Configuration

Конфигурация не должна быть захардкожена в коде.

Пример:

```text
DATABASE_URL=
JWT_SECRET=
AI_API_KEY=
GITHUB_API_URL=
CORS_ORIGINS=
UPLOAD_DIR=
```

В репозитории хранится только:

```text
.env.example
```

Реальный `.env` добавляется в `.gitignore`.

---

# 23. Docker Architecture

Для MVP используется Docker Compose.

Минимально:

```text
docker-compose.yml

services:
  backend
  frontend
  postgres
```

Схема:

```text
┌─────────────┐
│   Frontend  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Backend   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ PostgreSQL  │
└─────────────┘
```

AI и GitHub остаются внешними API.

---

# 24. Testing Architecture

Минимально тестируются:

### Backend

* authentication;
* authorization;
* project CRUD;
* public portfolio;
* project publishing;
* GitHub service;
* AI response validation.

### Frontend

Минимальный набор:

* основные страницы;
* формы;
* authentication flow;
* project creation;
* public portfolio rendering.

В MVP не требуется покрывать тестами абсолютно каждый UI-компонент.

Приоритет — бизнес-критические функции.

---

# 25. Logging

Backend должен иметь структурированные и понятные логи.

Логировать:

* startup;
* errors;
* authentication failures;
* external API errors;
* important application events.

Не логировать:

* passwords;
* JWT tokens;
* AI API keys;
* приватные credentials.

---

# 26. External Services

MVP использует два основных внешних источника:

### GitHub API

Назначение:

* получение repository metadata;
* получение базовой информации о проектах.

### AI Provider

Назначение:

* улучшение описания;
* генерация case study;
* структурирование информации.

Внешние сервисы должны быть изолированы через service classes.

---

# 27. Dependency Direction

Архитектура должна следовать направлению:

```text
API
 ↓
Services
 ↓
Models / Repositories
 ↓
Database
```

Внешние интеграции:

```text
Services
 ↓
GitHub Service
AI Service
```

Не допускается:

```text
Frontend
 ↓
GitHub API directly
```

или:

```text
API endpoint
 ↓
50 lines of business logic
```

Бизнес-логика должна находиться в services.

---

# 28. Performance Principles

На MVP не требуется преждевременная оптимизация.

Но необходимо:

* использовать pagination для списков;
* не загружать все проекты пользователя без необходимости;
* оптимизировать изображения;
* избегать N+1 queries;
* использовать database indexes для username и других часто используемых полей;
* не выполнять тяжёлые внешние операции внутри frontend.

---

# 29. Scalability Strategy

Архитектура должна позволять постепенно расширяться.

Первый этап:

```text
Modular Monolith
```

При росте проекта можно отдельно вынести:

```text
AI Service
Image Processing
Analytics
Background Jobs
```

Но в MVP этого делать не нужно.

Главный принцип:

> **Сначала работающий монолит, затем масштабирование только там, где оно действительно необходимо.**

---

# 30. SEO and Public Pages

Публичные портфолио являются отдельной частью продукта.

Необходимо предусмотреть:

* уникальный username;
* понятные URLs;
* title;
* description;
* Open Graph metadata;
* preview image;
* корректные заголовки H1/H2;
* mobile responsiveness.

SEO является вторичным приоритетом MVP, но архитектура публичных страниц не должна препятствовать его дальнейшему внедрению.

---

# 31. API Versioning

Все backend endpoints начинаются с:

```text
/api/v1
```

Пример:

```text
/api/v1/auth/login
/api/v1/projects
/api/v1/profile
/api/v1/portfolio
/api/v1/github/import
/api/v1/ai/project-description
```

---

# 32. Architectural Non-Goals

В MVP запрещено усложнять архитектуру без необходимости.

Не использовать:

* микросервисы;
* Kubernetes;
* Kafka;
* Redis без конкретной необходимости;
* отдельный authentication server;
* GraphQL;
* event bus;
* сложную CQRS-архитектуру;
* несколько баз данных.

Если задача решается простым способом внутри текущего backend — используется простой способ.

---

# 33. Architecture Definition of Done

Архитектура считается реализованной корректно, если:

* [ ] frontend и backend разделены;
* [ ] backend использует FastAPI;
* [ ] frontend использует React + TypeScript;
* [ ] PostgreSQL является основной БД;
* [ ] API имеет `/api/v1`;
* [ ] бизнес-логика вынесена в services;
* [ ] authentication реализована безопасно;
* [ ] ownership проверяется на backend;
* [ ] GitHub изолирован в отдельном service;
* [ ] AI изолирован в отдельном service;
* [ ] секреты находятся в environment variables;
* [ ] migrations выполняются через Alembic;
* [ ] приложение запускается через Docker Compose;
* [ ] основные ошибки обрабатываются;
* [ ] критические функции имеют тесты;
* [ ] публичные страницы отделены от приватного dashboard.

---

# 34. Final Architecture

Финальная архитектура MVP:

```text
                         ┌──────────────────────┐
                         │        User          │
                         └──────────┬───────────┘
                                    │
                         ┌──────────▼───────────┐
                         │ React + TypeScript   │
                         │       Frontend       │
                         └──────────┬───────────┘
                                    │
                               REST / JSON
                                    │
                         ┌──────────▼───────────┐
                         │       FastAPI        │
                         │        Backend       │
                         └──────────┬───────────┘
                                    │
             ┌──────────────────────┼──────────────────────┐
             │                      │                      │
             ▼                      ▼                      ▼
      ┌─────────────┐       ┌──────────────┐       ┌─────────────┐
      │ PostgreSQL  │       │ GitHub API   │       │ AI Provider │
      └─────────────┘       └──────────────┘       └─────────────┘
```

Главная архитектурная стратегия:

> **Простой модульный монолит, чёткое разделение ответственности, минимум инфраструктуры и возможность расширения после MVP.**

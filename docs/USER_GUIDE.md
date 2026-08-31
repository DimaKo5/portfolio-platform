# Portfolio Platform — Руководство пользователя

Краткая инструкция: как запустить продукт и как им пользоваться.

---

## 1. Запуск

### Вариант 1 — локально (без Docker)

Требования: Python 3.12+, Node 18+.

**Терминал 1 — backend:**

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

**Терминал 2 — frontend:**

```bash
cd frontend
npm install
npm run dev
```

Открой: **http://localhost:5173**

### Вариант 2 — Docker

```bash
cp .env.example .env
docker compose up --build
```

Открой: **http://localhost:5173** (backend: http://localhost:8000/docs)

> База данных: по умолчанию SQLite (`backend/app.db`), в Docker — PostgreSQL.
> При первом запуске Docker сам применит миграции.

---

## 2. Демо-аккаунт

Для быстрого просмотра готов аккаунт с заполненным портфолио:

```text
URL:        http://localhost:5173/login
Email:      demo@example.com
Пароль:     demo12345
Публичная страница: http://localhost:5173/demo
```

---

## 3. Как создать своё портфолио (5 минут)

```text
Шаг 1. Register
        → http://localhost:5173/register
        → email, username (станет вашим URL: /username), пароль
        → вы сразу попадёте в Dashboard

Шаг 2. Profile
        → Dashboard → Profile
        → имя, профессия (headline), bio, фото, ссылки
        → Save profile

Шаг 3. Create Project
        → Dashboard → Projects → + New project
        → Basics: название + краткое описание (1 предложение)

Шаг 4. Case study — главное в продукте
        → Problem: какую проблему решал проект
        → Solution: как решил
        → My role + Result: что сделали и что вышло
        → Features: список реализованного (по строке на пункт)

Шаг 5. Tech stack
        → отметьте технологии (Python, React, ...) → Save

Шаг 6. Links & Images (по желанию)
        → Live Demo URL, GitHub URL
        → обложка проекта и скриншоты (Set as cover для обложки)

Шаг 7. Preview → Publish
        → вкладка Preview покажет кейс как его увидит посетитель
        → кнопка Publish — проект появится на публичной странице

Шаг 8. Поделитесь ссылкой
        → Portfolio → Open public page ↗
        → отправьте работодателю: вашсайт/username
```

Порядок проектов в списке `/dashboard/projects` (кнопки ↑/↓) = порядок на публичной странице.

---

## 4. Что видит посетитель

Публичная страница **не требует входа**:

- Hero: фото, имя, профессия, локация, контакты
- About: bio
- Technologies: собраны из технологий ваших опубликованных проектов
- Projects: карточки с обложкой, описанием и тегами
- Страница кейса: Problem → Solution → My role → Features → Result → Tech → ссылки

Черновики (DRAFT) видите только вы.

---

## 5. Полезное

| Что | Где |
|---|---|
| API-документация (Swagger) | http://localhost:8000/docs |
| Тесты backend | `cd backend && .venv\Scripts\activate && pytest` |
| E2E-проверка API | `backend\scripts\e2e_check.ps1` (backend должен быть запущен) |
| Сборка frontend | `cd frontend && npm run build` |
| Документация проекта | `docs/` (00–04 + AGENTS.md) |

---

## 6. Частые вопросы

**Забыл пароль / хочу сменить** — в MVP не реализовано (post-MVP).

**Картинка не загружается** — только JPEG/PNG/WebP, максимум 5 МБ.

**Username занят или «reserved»** — username уникальный; системные имена
(admin, api, login...) зарезервированы — выберите другое.

**Удалил проект** — восстановить нельзя: удаляются и его изображения.

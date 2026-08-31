# AGENTS.md

# Portfolio Platform — AI Agent Instructions

## 1. Project Identity

**Project name:** Portfolio Platform

**Project type:** Full-stack web application / SaaS

**Main idea:**

Portfolio Platform — это сервис, позволяющий фрилансерам, разработчикам, дизайнерам, копирайтерам и другим специалистам быстро создавать профессиональное портфолио.

Главная идея продукта:

> Показывать не просто информацию о человеке, а реальные результаты его работы.

Каждый проект должен демонстрировать:

```text
Problem
↓
Solution
↓
Result
↓
Tech Stack
```

Платформа должна выглядеть как настоящий коммерческий продукт, а не как учебный CRUD-проект.

---

# 2. Main Product Goal

Создать современную платформу, где пользователь может:

1. Зарегистрироваться.
2. Создать профессиональный профиль.
3. Добавлять свои проекты.
4. Описывать проблему и решение.
5. Указывать результат проекта.
6. Добавлять технологии.
7. Добавлять изображения.
8. Публиковать проекты.
9. Получать публичную страницу своего портфолио.
10. Делать портфолио доступным по публичному URL.

Пример:

```text
portfolio.app/dmitriy

    Dmitriy
    Full-Stack Developer

    About

    Projects

    ┌─────────────────────┐
    │ Telegram CRM        │
    │                     │
    │ Problem             │
    │ Solution            │
    │ Result              │
    │                     │
    │ Python FastAPI      │
    │ React TypeScript    │
    └─────────────────────┘
```

---

# 3. Core Product Philosophy

Главный принцип:

> **Portfolio ≠ resume.**

Пользователь не должен просто писать:

> "Я ответственный разработчик с опытом работы."

Вместо этого он показывает:

> "Я создал Telegram CRM, автоматизировал обработку заявок и сократил ручную работу."

Платформа должна помогать пользователю **доказывать свои навыки через проекты**.

---

# 4. Target Users

Основные пользователи:

* начинающие разработчики;
* junior developers;
* freelance developers;
* дизайнеры;
* UI/UX designers;
* копирайтеры;
* маркетологи;
* другие специалисты, которым необходимо показать результаты работы.

Основной первоначальный пользователь:

> Junior / начинающий разработчик, которому нужно быстро создать профессиональное портфолио.

---

# 5. MVP

В первой версии НЕ нужно создавать огромный продукт.

MVP:

```text
Registration
      ↓
Login
      ↓
Profile
      ↓
Create Project
      ↓
Edit Project
      ↓
Technologies
      ↓
Publish
      ↓
Public Portfolio
```

MVP должен быть полностью рабочим.

---

# 6. Main Project Entity

Главная сущность продукта — **Project**.

Проект должен позволять показать:

```text
Title
Slug
Short description

Problem
Solution
Result

Technologies

Images

Links:
- Live Demo
- GitHub

Status:
- Draft
- Published
```

---

# 7. Technical Stack

Основной стек:

### Backend

```text
Python
FastAPI
PostgreSQL
SQLAlchemy
Alembic
Pydantic
```

### Frontend

```text
React
TypeScript
Vite
```

### Infrastructure

```text
Docker
Docker Compose
Git
```

Дополнительные библиотеки можно добавлять только при реальной необходимости.

Не добавляй технологии ради количества.

---

# 8. Architecture

Основная архитектура:

```text
Frontend
    ↓
FastAPI
    ↓
Service Layer
    ↓
Repository Layer
    ↓
PostgreSQL
```

Для внешних сервисов:

```text
Backend
 ├── GitHub API
 └── AI Provider
```

AI и внешние API должны находиться за отдельным service layer.

---

# 9. Documentation

Перед внесением существенных изменений AI-агент обязан учитывать документацию проекта.

Основные документы:

```text
docs/
├── 00_RESEARCH_METHOD.md
├── 01_PRODUCT_SPEC.md
├── 02_ARCHITECTURE.md
├── 03_DATA_API.md
└── 04_DEVELOPMENT_RULES.md
```

При необходимости сначала прочитай соответствующий документ.

**Не игнорируй документацию ради более быстрого написания кода.**

---

# 10. Source of Truth

При принятии архитектурных и продуктовых решений используй:

```text
AGENTS.md
+
docs/*
+
existing code
```

Если документация и существующий код противоречат друг другу:

**не делай молчаливое изменение.**

Сначала определи причину конфликта и выбери правильный вариант.

Если изменение действительно необходимо — обнови документацию.

---

# 11. Development Strategy

Работай маленькими законченными этапами.

Правильный подход:

```text
Feature
↓
Implementation
↓
Test
↓
Validation
↓
Next Feature
```

Не пытайся написать половину приложения за один шаг.

---

# 12. Priority

Приоритеты проекта:

```text
1. Correctness
2. Security
3. Architecture
4. Maintainability
5. UX
6. Performance
7. Visual polish
```

Красивый интерфейс не должен компенсировать плохую архитектуру.

---

# 13. What AI Agent MUST Do

Перед началом работы:

1. Изучить `AGENTS.md`.
2. Изучить необходимые документы из `docs/`.
3. Изучить существующую структуру проекта.
4. Проверить уже реализованную функциональность.
5. Понять, куда вписывается новая задача.

После реализации:

1. Проверить код.
2. Запустить необходимые тесты.
3. Проверить существующую функциональность.
4. Исправить найденные ошибки.
5. Сообщить, что именно изменилось.

---

# 14. What AI Agent MUST NOT Do

Запрещено:

* полностью переписывать проект без необходимости;
* менять архитектуру ради удобства одной функции;
* удалять рабочую функциональность;
* удалять тесты ради прохождения;
* добавлять ненужные библиотеки;
* создавать дублирующую логику;
* хранить секреты в коде;
* использовать `any` без необходимости;
* отключать security checks;
* скрывать ошибки;
* менять API без проверки зависимого frontend;
* создавать функции, которых нет в утверждённой задаче.

---

# 15. No Feature Creep

Если агент видит идею для дополнительной функции:

> **не реализовывать её автоматически.**

Сначала завершить текущую задачу.

Например:

Если задача:

> "Создать Project CRUD"

не нужно самостоятельно добавлять:

* AI генерацию;
* GitHub import;
* analytics;
* social sharing;
* payments;
* custom domains.

Эти функции будут реализованы позже.

---

# 16. MVP Boundary

До завершения MVP НЕ реализовывать:

```text
Payments
Subscriptions
Custom Domains
Advanced Analytics
Teams
Marketplace
Social Network
Mobile App
Browser Extension
Complex AI Agents
```

Они могут появиться после MVP.

---

# 17. AI Features

AI является дополнительной возможностью продукта, а не основой MVP.

AI можно использовать для:

* улучшения описания проекта;
* генерации project summary;
* предложения формулировок;
* анализа структуры проекта;
* помощи пользователю в заполнении portfolio.

Но AI не должен быть необходим для базовой работы платформы.

---

# 18. AI Coding Rules

AI-generated code необходимо проверять.

Перед использованием проверить:

```text
Architecture
Security
Logic
Dependencies
Error handling
Performance
Tests
```

Не вставлять большие блоки кода, если неизвестно, что они делают.

---

# 19. Security

Обязательно:

```text
Passwords → hashed

Secrets → environment variables

Authentication → backend

Authorization → backend

Ownership checks → every protected resource

Input → validated

Errors → sanitized
```

Никогда не публиковать:

```text
API keys
Passwords
Tokens
Secrets
Private credentials
```

---

# 20. User Ownership

Пользователь должен иметь доступ только к собственным приватным данным.

Например:

```text
User A
    ↓
Project A
```

User B не должен иметь возможность:

```text
edit Project A
delete Project A
publish Project A
```

даже если вручную изменит ID в запросе.

---

# 21. API Rules

API должен быть предсказуемым.

Использовать:

```text
/api/v1
```

Разделять:

```text
Router
Service
Repository
Schema
Model
```

Business logic не должна находиться внутри router.

---

# 22. Frontend Rules

Frontend должен быть:

* responsive;
* clean;
* accessible;
* fast;
* maintainable.

Не создавать огромные компоненты.

Предпочитать:

```text
Page
 ↓
Sections
 ↓
Reusable Components
```

---

# 23. Design Direction

Визуальный стиль:

> Modern SaaS / premium developer tool.

Интерфейс должен выглядеть профессионально.

Не использовать чрезмерно:

* gradients;
* glassmorphism;
* animations;
* decorative effects;
* random colors.

Каждый визуальный элемент должен иметь смысл.

---

# 24. Public Portfolio

Публичное портфолио — одна из самых важных частей продукта.

Оно должно выглядеть как полноценный профессиональный сайт.

Публичная страница должна показывать:

```text
Profile
↓
About
↓
Projects
↓
Project Details
↓
Technologies
↓
Links
```

Главный акцент:

> **Работы пользователя, а не декоративные элементы.**

---

# 25. Project Presentation

Каждый проект должен отвечать на четыре вопроса:

```text
Что было проблемой?

Что было сделано?

Как это было реализовано?

Какой получился результат?
```

Именно это является основной идеей Portfolio Platform.

---

# 26. Git Rules

Использовать понятные commits:

```text
feat: add project creation
feat: add public portfolio
fix: validate project ownership
refactor: extract project service
docs: update API specification
```

Не использовать бессмысленные commits:

```text
update
fix
changes
new
test
```

---

# 27. Testing

Каждая важная функция должна быть проверена.

Минимально:

```text
Authentication
Projects CRUD
Authorization
Publishing
Public portfolio
```

Особенно важно проверять:

```text
Owner can edit
Other user cannot edit
Draft is private
Published project is public
```

---

# 28. Definition of Done

Функция считается готовой только если:

```text
[ ] Implemented
[ ] Integrated
[ ] Validated
[ ] Errors handled
[ ] Security checked
[ ] Tests added/updated
[ ] Existing tests pass
[ ] No secrets exposed
```

Если frontend и backend работают отдельно, функция не считается законченной.

---

# 29. Working With Existing Code

Перед изменением существующего файла:

1. Прочитать его.
2. Понять его назначение.
3. Проверить зависимости.
4. Изменить минимально необходимую часть.

Не переписывать рабочий код полностью без причины.

---

# 30. If Something Is Unclear

Если задача неоднозначна:

1. Сначала используй существующую документацию.
2. Затем используй архитектуру проекта.
3. Затем выбери наиболее простой вариант, соответствующий продукту.

Не усложняй решение без необходимости.

Если решение может существенно повлиять на архитектуру — остановись и запроси подтверждение.

---

# 31. Speed Rule

Проект должен создаваться быстро.

Поэтому:

> **Не стремись сделать всё сразу идеально.**

Сначала:

```text
Working MVP
```

затем:

```text
Improvement
```

затем:

```text
Polish
```

Но скорость никогда не должна достигаться за счёт:

* безопасности;
* целостности данных;
* архитектуры;
* удаления тестов;
* нарушения существующей функциональности.

---

# 32. Final Goal

Конечный результат должен быть одновременно:

```text
Real Product
+
Portfolio Project
+
Full-stack Demonstration
```

Пользователь должен получить возможность реально создать и опубликовать своё портфолио.

А потенциальный работодатель или клиент должен увидеть:

```text
Product thinking
Backend
Frontend
Database
API
Authentication
Security
Testing
UI/UX
Architecture
```

---

# 33. Final Rule

Всегда помни:

> **Мы не создаём демонстрационный CRUD ради GitHub.**

Мы создаём **реальный продукт для создания профессиональных портфолио**, который одновременно станет сильным проектом в собственном портфолио разработчика.

При каждом решении задавай вопрос:

> **"Делает ли это продукт лучше, полезнее или профессиональнее?"**

Если нет — не добавляй это без необходимости.

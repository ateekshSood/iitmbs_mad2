# Teaching MAD-2 Project

This is your course. Every lesson folder has a `TASK.md`. Read it, write the code yourself
in that folder, then tell me **"check lesson NN"**. I'll review your code, point out bugs,
and ask you viva-style questions. I will not write your solutions — the viva will ask you
to modify your own code live, so you need to have typed and understood every line.

## Practice app: "Library Hub"

All exercises build a small library app. It is deliberately *not* your project, but every
pattern you need maps onto it:

| Library Hub (practice)                   | Exam portal                          | Trekking                  |
|------------------------------------------|--------------------------------------|---------------------------|
| Admin                                    | Admin                                | Admin                     |
| Librarian (created by admin)             | Examiner                             | Trek Staff                |
| Member (self-registers)                  | Student                              | Trekker                   |
| Reading session (date, time, capacity)   | Exam slot                            | Trek (slots)              |
| Session booking                          | Booking                              | Booking                   |
| "Booking window open/closed" dates       | Slot-creation / booking periods      | Trek Open / Closed        |
| Book review scored on several criteria   | Evaluation using a rubric            | —                         |
| One booking per event, no overbooking    | One slot per exam, no overbooking    | Same                      |

When you build the real project, you design it from scratch for your own domain.

## Tech decisions (all allowed by the spec)

- **Vue 3 + Vite, `.vue` files, Options API** (`data()`/`methods`/`props`, not `<script setup>`).
  Course update, Oct 2026. The frontend is a Vite project; Flask is a JSON API it calls
  (lesson 05 covers how they connect).
- **Flask + Flask-SQLAlchemy + Flask-RESTful** for the API, **SQLite** DB created from code.
- **JWT** (flask-jwt-extended), one unified `User` model with a `role` column.
- **Bootstrap 5** for styling (no other CSS framework).
- **Redis** for caching, **Celery + Redis** for background/scheduled jobs, **MailHog** to catch emails.

## Final submission layout (from the course's zip diagram)

```
project_name_2XfXXXXXX.zip
└── project_name_2XfXXXXXX/      ← the ONLY thing at the zip root
    ├── backend/
    │   ├── app.py
    │   ├── models/              ← SQLAlchemy models
    │   └── routes/              ← API resources, split by role/feature
    └── frontend/
        ├── index.html, package.json, vite.config.js
        └── src/components/      ← Vue components (.vue files)
```
This matches the diagram's `.vue` files. **Never zip `node_modules/`** (it's huge and
`npm install` recreates it). Lessons 04–07 teach the backend/ split, and lesson 20 covers zipping
and checking the result.

## Roadmap

Phase 0 — Setup
- [ ] 00 Environment: venv, packages, Redis, MailHog, git habits

Phase 1 — Vue 3 (Vite, Options API)
- [ ] 01a Vue from scratch (written for Vue 2 CDN; same template syntax in Vue 3): `{{ }}`, methods, `@click`, Bootstrap, `v-bind`, `:class`, `v-if`, `v-for`, `v-model`
- [ ] 01b Vite project setup, `.vue` files, components, props, `emits`/`$emit`, `npm run build`
- [ ] 02 Forms: `v-model`, validation, `computed`, `watch`
- [ ] 03 Vue Router 4: routes, params, navigation guards

Phase 2 — Flask
- [ ] 04 Flask basics: routes, JSON, HTTP methods, status codes
- [ ] 05 Vue meets Flask: Vite dev server + Flask API, CORS/proxy, `fetch` with async/await
- [ ] 06 SQLAlchemy models + relationships (1-to-many, chains of FKs), `create_all`, seeding the admin
- [ ] 07 Flask-RESTful resources + backend validation

Phase 3 — Auth
- [ ] 08 Password hashing + unified User model with roles
- [ ] 09 JWT login, `@jwt_required`, a custom `@role_required` decorator
- [ ] 10 Frontend auth: storing the token, route guards per role, logout, blocked users

Phase 4 — Business logic
- [ ] 11 Dates & windows: Python `datetime`, "is booking open right now?", date inputs in Vue
- [ ] 12 Booking rules: one per event, no overbooking, auto-"Full", cancel before deadline
- [ ] 13 Scored evaluation: criteria with max marks/weightage, computing totals, publishing results
- [ ] 14 Search & filter queries (`ilike`, joins, multiple filters)
- [ ] 15 Dashboards: counts/aggregates + Chart.js

Phase 5 — Redis & Celery
- [ ] 16 Redis caching with expiry + cache invalidation
- [ ] 17 Celery basics: worker, tasks, `.delay()`
- [ ] 18 Celery beat: daily reminder + monthly HTML report (Jinja) by email
- [ ] 19 User-triggered async CSV export + "done" alert

Phase 6 — Ship it
- [ ] 20 Project structure, zip rules, report (ER diagram, API list), video, viva prep

Lessons 00, 01a and 01b are ready. 02, 03 and 05 were written for Vue 2 CDN and will be rewritten for Vue 3 + Vite before you start them; 04 (Flask) is unaffected. I'll write the rest as you reach them, so I can adjust to how you're doing.

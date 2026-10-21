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

## Schedule (deadline: Nov 17, 2026)

Four days to learn everything on Library Hub, then build the exam portal yourself (Oct 25 – Nov 17).

| Day | Modules |
|---|---|
| 1 | M1 Vite & Vue 3, M2 Components, Router & `fetch` |
| 2 | M3 Flask-RESTful + SQLAlchemy, Vue ↔ Flask, booking rules |
| 3 | M4 JWT + roles + route guards, M5 Redis caching |
| 4 | M6 Celery + scheduled jobs, M7 CSV + email |
| later | M8 polish, while building the project |

## Roadmap (follows the bootcamp's 8 modules)

You build **one app**, `library-hub/` (`frontend/` + `backend/`), a little more in each module.
Each module's lesson is `mN_.../TASK.md`. Extra lessons for project needs the bootcamp doesn't cover
are marked **+**.

- [x] 00 Environment setup (done)
- [ ] **M1** `m1_vite_vue3/`: Vite project, SFCs, `v-for`/`v-if`/`v-model`, `computed`, `created`/`mounted`, local components
- [ ] **M2** `m2_interactive_ui/`: Vue Router, props, `$emit`, `fetch` + async/await, route params, login form + `localStorage`
- [ ] **M3** `m3_api_bridge/`: Flask-RESTful resources, SQLAlchemy models + relationships, validation, CORS, the `api.js` fetch helper
- [ ] **M4** `m4_jwt_auth/`: password hashing, JWT login, `role_required`, **booking rules** (window, one per session, no overbooking, cancel), route guards
- [ ] **M5** `m5_redis_caching/`: `@cache.cached`, expiry, invalidation, manual cache-aside
- [ ] **M6** `m6_celery/`: Celery + Flask app context, worker, CSV export job, polling, download
- [ ] **M7** `m7_reports_mail/`: MailHog + smtplib, CSV by email, daily reminders, monthly Jinja HTML report, Celery Beat
- [ ] **M8** `m8_polish/`: no Pinia. A polish checklist for the real project
- [ ] **+** Ship it: zip rules, report (ER diagram, API list), video, viva prep (ask me when you get there)

All backend code in M3–M7 was tested end to end (Redis, worker, MailHog) before it went into the
lessons. Each lesson starts with a list of fixes to the bootcamp notes.

**No axios:** you can't use it, so all HTTP calls use the browser's built-in `fetch`.

The older lessons (01a Vue 2, 01b, 02–05) are replaced by the modules. 01a's template syntax still
applies, and 01b's props/`$emit` steps get reused in M2.

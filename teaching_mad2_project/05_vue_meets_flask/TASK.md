# Lesson 05 — Vue meets Flask

Now connect lesson 03's frontend to lesson 04's API, with **Flask serving the frontend too**.
That's the setup the spec allows ("Jinja2 only for the entry point"). And because everything
is served from the same origin, you don't need CORS at all.

## Folder layout

```
05_vue_meets_flask/
├── app.py
├── templates/
│   └── index.html        ← the ONLY Jinja template; contains <div id="app">
└── static/
    ├── app.js            ← router + root Vue instance
    ├── components/...
    └── pages/...
```

```python
from flask import render_template

@app.route("/")
def index():
    return render_template("index.html")
```
In `index.html`, load your JS files with `<script src="/static/app.js"></script>`.

⚠ **Gotcha:** Jinja and Vue both use `{{ }}`. Jinja runs first, on the server, and will eat
your Vue expressions. Two ways around it — find both and pick one:
- tell Vue to use different delimiters, or
- keep every Vue template in the `.js` files (Jinja never sees those).

## Concept: fetch with async/await

```js
async loadSessions() {
  try {
    const res = await fetch('/api/sessions');       // relative URL, same origin
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    this.sessions = data;
  } catch (err) {
    this.error = err.message;
  }
}
```
Call it from the `created()` hook so data loads as soon as the page appears.

## Task

1. Move your lesson 04 API into this `app.py` and add the `/` route above.
2. The sessions list page loads from `GET /api/sessions` in `created()`. Show a Bootstrap
   spinner while loading and an alert if it fails. (Stop Flask and reload — do you see the alert?)
3. The add-session form (from lesson 02) `POST`s to the API. On 201, refresh the list;
   on 400, show the server's `message`.
4. The Book button calls `/api/sessions/<id>/book`. On 409, show "Session is full".
5. The detail page `/sessions/:id` fetches `GET /api/sessions/<id>`, and shows the 404 message
   if the id doesn't exist.
6. Put the fetch code in one place — e.g. `static/api.js` with a helper like
   `apiRequest(url, method, body)` — so you never write the same boilerplate twice.
   (The reference project repeated `http://127.0.0.1:5000` in 22 files. Don't.)

## Viva questions (`ANSWERS.md`)
1. What is CORS, and why did the reference project need `flask-cors` while you don't?
2. What does `await` actually wait for? Why are there two awaits (`fetch` and `.json()`)?
3. Why use `created()` instead of `mounted()` for the fetch? When would `mounted()` be needed?
4. Does `fetch` throw on a 404 response? (Test it and see.)

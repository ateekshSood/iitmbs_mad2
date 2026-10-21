# Module 3 — The API Bridge (Flask-RESTful + SQLAlchemy)

Now you build `library-hub/backend/`: a Flask **JSON API** with a real SQLite database. At the end,
the Vue sessions page loads from Flask instead of `sessions.json`.

In MAD-1, Flask sent finished HTML pages. Now Flask is a **data server**: Vue asks for JSON and
builds the page itself. Answer the viva questions in `m3_api_bridge/ANSWERS.md`.

**Fixes to your teacher's Module 3 notes** (I tested both):
- Inside a Flask-RESTful `Resource`, **don't** write `return jsonify({...}), 400`. It crashes with
  a 500 error ("Object of type Response is not JSON serializable"). Return a plain dict:
  `return {"msg": "..."}, 400`. Flask-RESTful turns it into JSON for you.
- The notes use port 5000 in one place and 5001 in another. We use Flask's default, **5000**, everywhere.

---

## Step 0 — Setup

```bash
cd ~/mad2_iitmbs/mad2_mine
uv add flask-cors                      # the only package missing from lesson 00
source ~/mad2_iitmbs/mad2_mine/.venv/bin/activate   # do this in EVERY new backend terminal
mkdir -p ~/mad2_iitmbs/teaching_mad2_project/library-hub/backend
cd ~/mad2_iitmbs/teaching_mad2_project/library-hub/backend
```
Make `backend/.gitignore`:
```
__pycache__/
instance/
*.sqlite3
exports/
celerybeat-schedule*
```

---

## Step 1 — Your first Resource

**Learn:** with Flask-RESTful, instead of one function per URL (`@app.route`), you write a
**Resource class**. Its methods are named after the HTTP methods: `get`, `post`, `put`, `delete`.
The same URL does different things depending on the method:

| Action | HTTP method | Method in the Resource | Usual success code |
|---|---|---|---|
| Create | POST | `def post(self)` | 201 Created |
| Read | GET | `def get(self)` | 200 OK |
| Update | PUT | `def put(self, id)` | 200 |
| Delete | DELETE | `def delete(self, id)` | 200 |

You return **a dict (or list) and a status code**, and Flask-RESTful turns that into JSON.

**Type this:** `backend/app.py` (temporary, you replace it in step 2):
```python
from flask import Flask
from flask_restful import Api, Resource

app = Flask(__name__)
api = Api(app)


class HelloResource(Resource):
    def get(self):
        return {"msg": "Hello from Flask"}, 200

    def post(self):
        return {"msg": "You sent a POST"}, 201


api.add_resource(HelloResource, "/api/hello")

if __name__ == "__main__":
    app.run(debug=True)
```
Run `python app.py` and open http://localhost:5000/api/hello. You get JSON.
In a second terminal: `curl -X POST http://localhost:5000/api/hello`.
(`debug=True` restarts Flask by itself whenever you save.)

**Your turn:** add a `delete` method returning `{"msg": "deleted"}, 200` and call it with
`curl -X DELETE ...`. What does `curl -X PUT ...` return, and why? (Look at the status code with `curl -i`.)

---

## Step 2 — Models + the app factory (split into files)

**Learn:** like your teacher's modular example, each file has one job:
- `extensions.py`: creates shared objects (`db`) **without** an app, so any file can import them.
- `models.py`: the tables, as classes.
- `app.py`: `create_app()` builds the app, connects the extensions, creates the tables and seeds the admin.

**The database must be created by code** (the project statement says so). `db.create_all()` does
that. **But** `create_all` only creates tables that **don't exist yet**. It never changes an existing
table. So **whenever you change a model, delete the database file** (`instance/libraryhub.sqlite3`)
and restart. (Flask-SQLAlchemy puts the file in `backend/instance/`.)

You make all three Library Hub tables now, so you won't need to change them later.

**Type this:** `backend/extensions.py`:
```python
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
```
`backend/models.py`:
```python
from datetime import datetime

from extensions import db


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), nullable=False, default="member")  # "admin" or "member"

    bookings = db.relationship("Booking", backref="member", lazy=True)


class ReadingSession(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    host = db.Column(db.String(80), nullable=False)
    date = db.Column(db.Date, nullable=False)
    capacity = db.Column(db.Integer, nullable=False)
    booking_start = db.Column(db.Date, nullable=False)
    booking_end = db.Column(db.Date, nullable=False)

    bookings = db.relationship("Booking", backref="session", lazy=True)

    def seats_left(self):
        active = [b for b in self.bookings if b.status == "Booked"]
        return self.capacity - len(active)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "host": self.host,
            "date": self.date.isoformat(),
            "capacity": self.capacity,
            "seats_left": self.seats_left(),
            "booking_start": self.booking_start.isoformat(),
            "booking_end": self.booking_end.isoformat(),
        }


class Booking(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    session_id = db.Column(db.Integer, db.ForeignKey("reading_session.id"), nullable=False)
    status = db.Column(db.String(20), nullable=False, default="Booked")  # Booked / Cancelled
    booked_on = db.Column(db.DateTime, nullable=False, default=datetime.now)

    def to_dict(self):
        return {
            "id": self.id,
            "session": self.session.to_dict(),
            "status": self.status,
            "booked_on": self.booked_on.isoformat(timespec="minutes"),
        }
```
Read it carefully, because the viva **will** ask about relationships:
- `db.ForeignKey("user.id")`: this column holds a `User`'s id. The table name is the class name in
  snake_case: `User` → `user`, `ReadingSession` → `reading_session`.
- `db.relationship("Booking", backref="member")`: gives you **both** directions in Python.
  `user.bookings` is a list of that user's bookings, and `booking.member` is the User who booked.
  Same for `session.bookings` and `booking.session`.
- `seats_left()` is **calculated** from active bookings, so it can never get out of sync.
- `to_dict()` turns a row into a dict for JSON. Dates become `"2026-11-02"` strings
  (JSON has no date type).

Replace `backend/app.py` with the real one:
```python
from flask import Flask
from werkzeug.security import generate_password_hash

from extensions import db
from models import User
from routes import register_routes


def seed_admin():
    if User.query.filter_by(role="admin").first():
        return
    admin = User(
        username="admin",
        email="admin@libraryhub.local",
        password_hash=generate_password_hash("admin123"),
        role="admin",
    )
    db.session.add(admin)
    db.session.commit()


def create_app():
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///libraryhub.sqlite3"

    db.init_app(app)
    register_routes(app)

    with app.app_context():
        db.create_all()
        seed_admin()

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True)
```
- `seed_admin()`: the project needs **exactly one admin, created by code**. This creates one only
  if none exists, so restarting doesn't make duplicates. (`generate_password_hash` is explained in Module 4.)
- `with app.app_context():` means "act as this app". `db` needs it to know which database to use.

It won't run until `routes.py` exists (step 3).

---

## Step 3 — The sessions API

**Type this:** `backend/routes.py`:
```python
from datetime import date

from flask import request
from flask_restful import Api, Resource

from extensions import db
from models import ReadingSession


def parse_date(value):
    try:
        return date.fromisoformat(value or "")
    except ValueError:
        return None


class SessionListResource(Resource):
    def get(self):
        sessions = ReadingSession.query.order_by(ReadingSession.date).all()
        return [s.to_dict() for s in sessions]

    def post(self):
        data = request.get_json() or {}
        title = (data.get("title") or "").strip()
        host = (data.get("host") or "").strip()
        day = parse_date(data.get("date"))
        start = parse_date(data.get("booking_start"))
        end = parse_date(data.get("booking_end"))
        capacity = data.get("capacity")
        if not title or not host:
            return {"msg": "title and host are required"}, 400
        if not day or not start or not end:
            return {"msg": "dates must be YYYY-MM-DD"}, 400
        if not (start <= end <= day):
            return {"msg": "need booking_start <= booking_end <= date"}, 400
        if not isinstance(capacity, int) or capacity < 1:
            return {"msg": "capacity must be a whole number >= 1"}, 400
        s = ReadingSession(
            title=title, host=host, date=day, capacity=capacity, booking_start=start, booking_end=end
        )
        db.session.add(s)
        db.session.commit()
        return s.to_dict(), 201


class SessionResource(Resource):
    def get(self, session_id):
        s = db.get_or_404(ReadingSession, session_id)
        return s.to_dict()

    def delete(self, session_id):
        s = db.get_or_404(ReadingSession, session_id)
        if s.bookings:
            return {"msg": "cannot delete a session that has bookings"}, 400
        db.session.delete(s)
        db.session.commit()
        return {"msg": "deleted"}, 200


def register_routes(app):
    api = Api(app)
    api.add_resource(SessionListResource, "/api/sessions")
    api.add_resource(SessionResource, "/api/sessions/<int:session_id>")
```
- `request.get_json()`: the JSON body the client sent, as a dict. `or {}` covers "sent nothing".
- **Backend validation:** never trust the frontend. Someone can call your API with curl and skip
  your Vue form entirely. Each `return {...}, 400` rejects bad input with a clear message.
- `<int:session_id>` in the URL is passed to `get(self, session_id)` as an int.
- `db.get_or_404(...)`: the row, or an automatic 404 response.
- `db.session.add()` + `commit()`: nothing is saved until `commit`.

Run `python app.py`, then test in a second terminal:
```bash
curl http://localhost:5000/api/sessions
curl -X POST http://localhost:5000/api/sessions -H "Content-Type: application/json" \
  -d '{"title":"Hobbit circle","host":"Asha","date":"2026-11-02","booking_start":"2026-10-20","booking_end":"2026-11-01","capacity":5}'
curl http://localhost:5000/api/sessions/1
curl -X POST http://localhost:5000/api/sessions -H "Content-Type: application/json" -d '{"title":""}'
```
Add 2–3 more sessions with curl. Make the booking window include **today**, because Module 4's booking
rules need it.

**Your turn:**
1. Add `def put(self, session_id)` to `SessionResource` that updates `title`, `host` and `capacity`
   (only the fields that were sent), with validation. Return the updated dict.
2. Try to `curl` a session with capacity `"five"`. Which check catches it?

---

## Step 4 — CORS, and connecting Vue to Flask

**Learn:** your Vue page comes from `localhost:5173` and the API is on `localhost:5000`. A different
port means a different **origin**, and browsers **block** a page from reading another origin's
responses unless that server says it's allowed. That's the **Same-Origin Policy**. **CORS** is how the
server says "I allow it". `flask-cors` adds those headers.

**Type this:** in `app.py`, add `from flask_cors import CORS` and, after `db.init_app(app)`:
```python
CORS(app)
```
In the frontend, make `src/api.js`. It's one helper so you don't repeat `fetch` boilerplate everywhere
(this is roughly what axios does for you):
```js
const BASE_URL = 'http://localhost:5000/api'

export async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json' }

  const response = await fetch(BASE_URL + path, {
    method: options.method || 'GET',
    headers: headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.msg || data.message || 'Something went wrong')
  }
  return data
}
```
- `export`: lets other files `import { api } from '@/api.js'`.
- `JSON.stringify(...)`: JS object → JSON text, for the request body.
- `throw` on a bad status means your `try/catch` catches server errors (4xx/5xx) as well.

In `SessionsView.vue`, add `import { api } from '@/api.js'` and replace the body of `loadSessions`'s
`try` with one line:
```js
this.sessions = await api('/sessions')
```
Delete `public/sessions.json`. In `SessionDetailView`, load with `await api('/sessions/' + id)` instead.

**Try:** refresh `/sessions`. The cards now come from SQLite through Flask.

**Experiment (then undo):** comment out `CORS(app)`, refresh, and read the red **CORS** error in
the Console. Then look in the Network tab: the request **did** reach Flask and Flask answered.
The **browser** refused to hand the answer to your page. Put CORS back.

**Your turn:** make a `NewSessionView.vue` at `/sessions/new` with a form (title, host, date,
booking_start, booking_end, capacity) that POSTs with
`api('/sessions', { method: 'POST', body: {...} })`. Show the backend's error message if it
fails, and go to `/sessions` on success. Use `type="date"` inputs: they give `YYYY-MM-DD`, exactly
what the backend wants. Use `v-model.number` on capacity, otherwise it's sent as a string and the
backend rejects it (try that first and see!). In Module 4 this page becomes admin-only.

## Viva questions (`ANSWERS.md`)
1. MAD-1 vs MAD-2: what does Flask send in each?
2. Why is `{"msg": ...}, 400` better than returning 200 with an error message?
3. What does `db.relationship(..., backref="member")` give you? Write the two lines of Python that
   get a booking's user and a user's bookings.
4. You added a column to a model and the app crashes with "no such column". Why, and what's the fix?
5. What is CORS? Who blocks the request: Flask or the browser?
6. Why validate in the backend when the Vue form already has `required`?

When done, say **"check module 3"**.

## In your exam portal this becomes...
Models for User, Course, Examination, Rubric, Slot, Booking, Evaluation (you design the ER diagram),
a Resource per entity, and the same validate → 400 pattern everywhere.

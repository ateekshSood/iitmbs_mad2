# Module 4 — The Session Switch (JWT auth, roles, booking rules)

Now Library Hub gets real users: members register, everyone logs in, the API knows **who** is
calling and **which role** they have, and members can book sessions under real rules (booking window,
one booking per session, no overbooking). These are the exact rules your exam portal needs.

Answer the viva questions in `m4_jwt_auth/ANSWERS.md`.

**Fixes to your teacher's Module 4 notes** (I tested these):
- The notes never set up `JWTManager` or `JWT_SECRET_KEY`. Without them nothing works (step 1).
- With Flask-RESTful, a request **without** a token gives a **500** error instead of 401, unless
  you set `PROPAGATE_EXCEPTIONS = True` (step 1).
- `create_access_token(identity=...)` must get a **string**. Use `str(user.id)`. A plain int
  makes token checks fail.

---

## Step 1 — Setting up JWT

**Learn:** in MAD-1 a session cookie remembered you. An API is **stateless**: it remembers nothing
between requests. So at login the server gives you a **token** (a signed string that says
"user 3, role member"), and you send it **with every request** in a header:
`Authorization: Bearer <token>`. The server checks the signature with its **secret key**. If anyone
edits the token, the signature no longer matches and it's rejected.

A JWT is **signed, not encrypted**: anyone can read what's inside (paste one into jwt.io), but nobody
can change it. Never put a password in it.

**Type this:** in `extensions.py`:
```python
from flask_jwt_extended import JWTManager
```
```python
jwt = JWTManager()
```
In `app.py`, change the import to `from extensions import db, jwt`, and in `create_app()` add next to
the other config lines:
```python
app.config["PROPAGATE_EXCEPTIONS"] = True  # lets flask-jwt-extended send 401s through Flask-RESTful
app.config["JWT_SECRET_KEY"] = "change-me-to-a-long-random-string"
```
and after `db.init_app(app)`:
```python
jwt.init_app(app)
```

---

## Step 2 — Register and login

**Learn:** **never store passwords as plain text.** `generate_password_hash("pass")` turns a password
into a one-way scrambled string (a hash). At login, `check_password_hash(stored_hash, typed)` checks
whether the typed password produces the same hash. Even if your database leaks, the passwords don't.
Both functions come with Flask (in `werkzeug`), so there's nothing extra to install.

**Type this:** `backend/auth.py`:
```python
from functools import wraps

from flask import request
from flask_jwt_extended import create_access_token, get_jwt, jwt_required
from flask_restful import Resource
from werkzeug.security import check_password_hash, generate_password_hash

from extensions import db
from models import User


class RegisterResource(Resource):
    def post(self):
        data = request.get_json() or {}
        username = (data.get("username") or "").strip()
        email = (data.get("email") or "").strip()
        password = data.get("password") or ""
        if not username or not email or len(password) < 4:
            return {"msg": "username, email and a 4+ character password are required"}, 400
        if User.query.filter((User.username == username) | (User.email == email)).first():
            return {"msg": "username or email already taken"}, 409
        user = User(
            username=username,
            email=email,
            password_hash=generate_password_hash(password),
            role="member",
        )
        db.session.add(user)
        db.session.commit()
        return {"msg": "Registered. Please log in."}, 201


class LoginResource(Resource):
    def post(self):
        data = request.get_json() or {}
        user = User.query.filter_by(username=data.get("username")).first()
        if not user or not check_password_hash(user.password_hash, data.get("password") or ""):
            return {"msg": "Wrong username or password"}, 401
        token = create_access_token(identity=str(user.id), additional_claims={"role": user.role})
        return {"access_token": token, "role": user.role, "username": user.username}, 200
```
- `role="member"` is **hard-coded**. Never take the role from the request, or anyone could register
  as admin. (The project says admin is created only by code, and examiners only by the admin.)
- `|` in the filter means OR.
- `additional_claims={"role": ...}` puts the role **inside** the token, so later requests don't need
  a database lookup to know it.
- The login error doesn't say *which* part was wrong. That's on purpose, so nobody can probe for
  valid usernames.

Register them in `routes.py`: `from auth import LoginResource, RegisterResource` and
```python
api.add_resource(RegisterResource, "/api/register")
api.add_resource(LoginResource, "/api/login")
```
Test:
```bash
curl -X POST localhost:5000/api/register -H "Content-Type: application/json" -d '{"username":"ravi","email":"ravi@x.in","password":"pass1"}'
curl -X POST localhost:5000/api/login -H "Content-Type: application/json" -d '{"username":"ravi","password":"pass1"}'
```
Copy the `access_token` and paste it into https://jwt.io. Find `sub` (the user id) and `role`.

---

## Step 3 — Protecting endpoints, and `role_required`

**Learn:** `@jwt_required()` on a method means "reject it with 401 unless there's a valid token".
Inside, `get_jwt_identity()` gives the user id string and `get_jwt()["role"]` the role.

You need "logged in **and** admin" in many places, so you write your own **decorator**.
A decorator is a function that wraps another function and runs a check first.

**Type this:** at the top of `auth.py` (under the imports):
```python
def role_required(role):
    def decorator(fn):
        @wraps(fn)
        @jwt_required()
        def wrapper(*args, **kwargs):
            if get_jwt().get("role") != role:
                return {"msg": f"Only {role} can do this"}, 403
            return fn(*args, **kwargs)

        return wrapper

    return decorator
```
Read it inside out:
- `wrapper` is what runs **instead** of your method. It first checks the role, and only then calls the
  real method `fn`.
- `@jwt_required()` on the wrapper means the token is checked before the role.
- `role_required("admin")` returns `decorator`, so you can pass the role in.
- `@wraps(fn)` keeps the original function's name (Flask needs that).

In `routes.py`, import it (`from auth import LoginResource, RegisterResource, role_required`) and put
`@role_required("admin")` on the line above `def post` in `SessionListResource`, and above
`def delete` in `SessionResource`.

Test all three outcomes:
```bash
curl -i -X POST localhost:5000/api/sessions                     # no token → 401
TOKEN=<paste ravi's token>
curl -i -X POST localhost:5000/api/sessions -H "Authorization: Bearer $TOKEN"   # member → 403
```
Log in as `admin` / `admin123` and create a session with the admin's token → 201.

**401 vs 403:** 401 = "I don't know who you are". 403 = "I know who you are, and you're not allowed".

---

## Step 4 — Bookings with real rules

**Learn:** this is the business logic your exam portal is graded on. Each rule is a check that
returns an error **before** saving anything:

| Rule (Library Hub) | Same rule in your exam portal |
|---|---|
| Book only between `booking_start` and `booking_end` | "Students can book slots only during the booking period" |
| One active booking per member per session | "Only one slot per examination", "prevent duplicate bookings" |
| No booking when `seats_left` is 0 | "Prevent overbooking", "mark Full when capacity is reached" |
| Cancel only your own booking, before `booking_end` | "Cancel bookings before the booking deadline" |

**Type this:** in `routes.py`, add `from flask_jwt_extended import get_jwt_identity`, add `Booking`
to the models import, and add:
```python
class BookingListResource(Resource):
    @role_required("member")
    def get(self):
        user_id = int(get_jwt_identity())
        bookings = Booking.query.filter_by(user_id=user_id).order_by(Booking.booked_on.desc()).all()
        return [b.to_dict() for b in bookings]

    @role_required("member")
    def post(self):
        user_id = int(get_jwt_identity())
        data = request.get_json() or {}
        s = db.session.get(ReadingSession, data.get("session_id"))
        if not s:
            return {"msg": "no such session"}, 404
        today = date.today()
        if not (s.booking_start <= today <= s.booking_end):
            return {"msg": "booking is closed for this session"}, 400
        already = Booking.query.filter_by(user_id=user_id, session_id=s.id, status="Booked").first()
        if already:
            return {"msg": "you already booked this session"}, 409
        if s.seats_left() <= 0:
            return {"msg": "session is full"}, 409
        b = Booking(user_id=user_id, session_id=s.id)
        db.session.add(b)
        db.session.commit()
        return b.to_dict(), 201


class BookingResource(Resource):
    @role_required("member")
    def delete(self, booking_id):
        b = db.get_or_404(Booking, booking_id)
        if b.user_id != int(get_jwt_identity()):
            return {"msg": "not your booking"}, 403
        if date.today() > b.session.booking_end:
            return {"msg": "too late to cancel"}, 400
        b.status = "Cancelled"
        db.session.commit()
        return {"msg": "cancelled"}, 200
```
and register them:
```python
api.add_resource(BookingListResource, "/api/bookings")
api.add_resource(BookingResource, "/api/bookings/<int:booking_id>")
```
- The user id comes **from the token**, never from the request body. Otherwise anyone could book
  as anyone.
- Cancelling **sets the status** instead of deleting the row. The project wants "complete history".
- `409 Conflict` = "valid request, but it clashes with what already exists".

Test with curl as ravi: book a session, book it again (409), make a capacity-1 session and fill it
with a second member (409), cancel (200).

---

## Step 5 — Frontend: real login, token in every request

**Type this:**
1. In `src/api.js`, after the `headers` line, add:
```js
const token = localStorage.getItem('access_token')
if (token) {
  headers.Authorization = `Bearer ${token}`
}
```
   Now **every** API call carries the token automatically.
2. In `LoginView.vue`, add `import { api } from '@/api.js'`, add `error: ''` to data, and replace
   `login()` with:
```js
async login() {
  this.error = ''
  try {
    const data = await api('/login', { method: 'POST', body: this.form })
    localStorage.setItem('access_token', data.access_token)
    localStorage.setItem('role', data.role)
    localStorage.setItem('username', data.username)
    this.$router.push(data.role === 'admin' ? '/sessions/new' : '/sessions')
  } catch (err) {
    this.error = err.message
  }
},
```
   and show `<p v-if="error" class="text-danger mt-2">{{ error }}</p>` under the form.
3. In `App.vue`, track the role as well as the username: add `role: localStorage.getItem('role')` to
   data, re-read it in the `$route` watch, and remove all three keys in `logout()`. In the navbar,
   show the username with `({{ role }})`, and add links that depend on the role:
```html
<RouterLink v-if="role === 'member'" class="nav-link" to="/my-bookings">My bookings</RouterLink>
<RouterLink v-if="role === 'admin'" class="nav-link" to="/sessions/new">New session</RouterLink>
```
4. In `SessionsView.vue`, make `onBook` call the API instead of changing the number locally
   (add `message: ''` to data and show it in a Bootstrap `alert alert-info`):
```js
async onBook(sessionId) {
  try {
    await api('/bookings', { method: 'POST', body: { session_id: sessionId } })
    this.message = 'Booked!'
    this.loadSessions()
  } catch (err) {
    this.message = err.message
  }
},
```
   `this.loadSessions()` reloads the list so `seats_left` comes from the **server**, the real source of truth.

---

## Step 6 — Route guards (frontend protection)

**Learn:** hiding a link doesn't stop someone typing `/sessions/new` in the address bar. A **route
guard** runs before every page change and can redirect. Give each protected route a `meta.role`.

**Type this:** in `router/index.js`, add `meta` to the protected routes:
```js
{ path: '/sessions/new', name: 'new-session', component: NewSessionView, meta: { role: 'admin' } },
```
(`/sessions/new` and `/sessions/:id` don't clash. Vue Router prefers the exact path `new` over the
`:id` param, whatever order you list them in.)
Then, between `createRouter(...)` and `export default router`:
```js
router.beforeEach((to) => {
  const role = localStorage.getItem('role')
  if (to.meta.role && to.meta.role !== role) {
    return '/login'
  }
})
```
Returning a path redirects there. Returning nothing lets the navigation through.

**The guard is only for user experience.** Anyone can edit `localStorage` in F12 and set
`role = admin`. Try it: the page opens, but every API call still fails with 403, because the
**backend** checks the signed token. Real security is always on the backend.

---

## Checkpoint challenge — no example

1. `MyBookingsView.vue` at `/my-bookings` (`meta: { role: 'member' }`): list my bookings
   (`GET /bookings`) with session title, date and status, and a **Cancel** button (only on
   "Booked" ones) that asks `confirm('Cancel this booking?')` and calls `DELETE /bookings/<id>`.
2. Wire your Module 2 `SignUpView` to `POST /register`. Show the server's message (e.g. "username
   taken"), and go to `/login` on success.
3. Hide the Book button for the admin (admin doesn't book).

## Viva questions (`ANSWERS.md`)
1. Why does an API use tokens instead of sessions? What does "stateless" mean?
2. Can someone read a JWT? Can they change it? What stops them?
3. What's stored in your token, and why is the role in there?
4. 401 vs 403: when do you get each?
5. Walk through `role_required` line by line.
6. Why is the user id taken from the token and not from the request body?
7. The route guard can be bypassed through `localStorage`. Why is the app still safe?
8. Why hash passwords? What does `check_password_hash` do?

When done, say **"check module 4"**.

## In your exam portal this becomes...
Three roles (`admin`, `examiner`, `student`) in one User model, `role_required("examiner")` etc.,
admin creates examiners (no register for them), slot creation only inside the slot-creation window,
and booking with exactly the rules from step 4.

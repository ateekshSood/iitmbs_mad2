# Module 2 — The Interactive UI (Router, props, `$emit`, `fetch`, `localStorage`)

You keep building `library-hub/frontend/` from Module 1. This module adds pages (routes), a
**reading sessions** page made of components, data loaded with `fetch`, and a login form that uses
`localStorage`.

**No axios.** The project only allows the listed frameworks, so we use `fetch`, which is built into
the browser. When your teacher's notes show `axios.get(url)`, the `fetch` version is in step 4.

**No Flask yet.** Your teacher's Module 2 calls Flask APIs that you only build in Module 3. Here,
`fetch` reads a JSON file instead. In Module 3 you change one URL and it talks to Flask.

Answer the viva questions in `m2_interactive_ui/ANSWERS.md`. Keep `npm run dev` running.

---

## Step 1 — Pages with Vue Router

**Learn:** a Single Page App has **one** HTML page, but the router shows a different **view**
component for each URL. `src/router/index.js` holds the list: "for `/sessions`, show
`SessionsView`". `<RouterView />` in `App.vue` is where that view appears. `<RouterLink to="...">`
is a link that changes the view **without reloading the page**. A normal `<a href>` would reload
the whole app.

**Type this:** make `src/views/SessionsView.vue`:
```vue
<script>
export default {
  data() {
    return { heading: 'Reading sessions' }
  },
}
</script>

<template>
  <main class="container mt-4">
    <h2>{{ heading }}</h2>
  </main>
</template>
```
In `src/router/index.js`, import it under the HomeView import and add a route to the `routes` array:
```js
import SessionsView from '../views/SessionsView.vue'
```
```js
{ path: '/sessions', name: 'sessions', component: SessionsView },
```
Replace **all** of `src/App.vue` with a navbar plus the outlet:
```vue
<template>
  <nav class="navbar navbar-expand navbar-dark bg-dark px-3">
    <RouterLink class="navbar-brand" to="/">Library Hub</RouterLink>
    <div class="navbar-nav">
      <RouterLink class="nav-link" to="/sessions">Sessions</RouterLink>
      <RouterLink class="nav-link" to="/about">About</RouterLink>
    </div>
  </nav>
  <RouterView />
</template>
```
Your Module 1 `LibraryHeader` is still inside HomeView. Delete it from HomeView (the import, the
`components` entry and the tag), because the navbar replaces it.

**Try:** click the links and watch the URL change, with no reload (the Network tab stays quiet).

**Your turn:**
1. Change one `RouterLink` to a plain `<a href="/sessions">`. Click it: the whole page flashes and
   reloads. Change it back.
2. In a method you can navigate from code with `this.$router.push('/sessions')`. Add a button on
   HomeView, "See sessions", that does this.

---

## Step 2 — Props: parent → child

**Learn:** the **parent** owns the data and hands it to a child through a **prop**. You used
`props: ['x']` in 01b. The **object form** below also checks the type and warns if the prop is missing.

**Type this:** `src/components/SessionCard.vue`:
```vue
<script>
export default {
  name: 'SessionCard',
  props: {
    session: { type: Object, required: true },
  },
}
</script>

<template>
  <div class="card mb-3">
    <div class="card-body">
      <h5 class="card-title">{{ session.title }}</h5>
      <p class="card-text mb-1">Host: {{ session.host }} · {{ session.date }}</p>
      <p class="card-text">{{ session.seats_left }} of {{ session.capacity }} seats left</p>
    </div>
  </div>
</template>
```
In `SessionsView.vue`: import it (`import SessionCard from '@/components/SessionCard.vue'`),
register it (`components: { SessionCard },`), and add this to `data`:
```js
sessions: [
  { id: 1, title: 'Hobbit circle', host: 'Asha', date: '2026-11-02', capacity: 5, seats_left: 2 },
  { id: 2, title: 'Poetry night', host: 'Ravi', date: '2026-11-05', capacity: 3, seats_left: 0 },
  { id: 3, title: 'Sci-fi club', host: 'Mia', date: '2026-11-09', capacity: 8, seats_left: 8 },
],
```
and this under the heading:
```html
<SessionCard v-for="s in sessions" :key="s.id" :session="s" />
```
`:session="s"`: `s` is one session from the loop, passed into the child's prop called `session`.

**Your turn:**
1. Show a red `Full` badge in the card when `seats_left` is 0.
2. Remove `:session="s"` on purpose and read the Console warning ("Missing required prop"). Put it back.

---

## Step 3 — `$emit`: child → parent

**Learn:** **props go down, events go up.** A child must not change its props. It **announces**
what happened with `this.$emit('name', data)`, and the parent listens with `@name="method"` and
changes its own data. List the events in `emits: [ ]`.

**Type this:** in `SessionCard.vue`, add after `props`:
```js
emits: ['book'],
methods: {
  clickedBook() {
    this.$emit('book', this.session.id)
  },
},
```
and a button at the end of `card-body`:
```html
<button class="btn btn-success" :disabled="session.seats_left === 0" @click="clickedBook">
  Book
</button>
```
In `SessionsView.vue`, listen on the tag: `<SessionCard ... @book="onBook" />`, and add:
```js
methods: {
  onBook(sessionId) {
    const s = this.sessions.find((x) => x.id === sessionId)
    s.seats_left--
  },
},
```
**Try:** click Book until a session is full. The button disables itself and the badge appears.

**Experiment (then undo):** in `clickedBook`, add `this.session = null`. Click Book and read the
warning ("Props are readonly"). That's the mistake in your old Vue 2 `step2.html`
(`this.initial_count += 1`).

**Your turn:** make `onBook` refuse to go below 0 even if someone re-enables the button
(F12 → Elements → delete the `disabled` attribute and click). Never trust the button alone.

---

## Step 4 — Loading data with `fetch` (+ `async`/`await`)

**Learn:** `fetch(url)` asks a server for something. The answer takes time, so `fetch` returns a
**Promise** ("I'll give you the answer later"). Inside an **`async`** method you can write
**`await`** to wait for it, and the code reads top to bottom:
```js
const response = await fetch(url)      // 1. wait for the server's reply
const data = await response.json()     // 2. wait for the body, turned from JSON into JS
```
**Important:** `fetch` does **not** throw an error when the server answers 404 or 500. You have to
check `response.ok` (true for 200–299) yourself. (axios throws automatically. That's its main convenience.)

Files in `frontend/public/` are served as-is, so `public/sessions.json` is at `/sessions.json`.

**Type this:** make `frontend/public/sessions.json` and move the 3 sessions into it as JSON
(JSON needs **double quotes** on keys and strings):
```json
[
  { "id": 1, "title": "Hobbit circle", "host": "Asha", "date": "2026-11-02", "capacity": 5, "seats_left": 2 },
  { "id": 2, "title": "Poetry night", "host": "Ravi", "date": "2026-11-05", "capacity": 3, "seats_left": 0 },
  { "id": 3, "title": "Sci-fi club", "host": "Mia", "date": "2026-11-09", "capacity": 8, "seats_left": 8 }
]
```
In `SessionsView.vue`, set `sessions: []` and add `loading: true, error: ''` to data. Add this
method next to `onBook`:
```js
async loadSessions() {
  this.loading = true
  try {
    const response = await fetch('/sessions.json')
    if (!response.ok) {
      throw new Error('Could not load sessions (' + response.status + ')')
    }
    this.sessions = await response.json()
  } catch (err) {
    this.error = err.message
  } finally {
    this.loading = false
  }
},
```
and call it when the page appears:
```js
mounted() {
  this.loadSessions()
},
```
Template, under the heading:
```html
<p v-if="loading">Loading...</p>
<p v-else-if="error" class="text-danger">{{ error }}</p>
<div v-else>
  <SessionCard v-for="s in sessions" :key="s.id" :session="s" @book="onBook" />
</div>
```
- `try { } catch (err) { }`: if anything inside `try` throws, jump to `catch`.
- `finally { }`: runs either way, so loading always stops.

**Your turn:**
1. F12 → Network, refresh, and click `sessions.json`. Look at its Response.
2. Change the URL to `/nope.json`. What does the page show, and what does `response.status` say?
   (Vite answers a missing file with `index.html`, so you may get a JSON error instead. Explain
   whichever you see.) Put it back.

---

## Step 5 — Route params: one page per session

**Learn:** `/sessions/1`, `/sessions/2`... are all **one route** with a **param**:
`path: '/sessions/:id'`. Inside the view, `this.$route.params.id` gives the value. It's always a
**string**, so convert it with `Number(...)`.

**Type this:** add the route (and its import):
```js
{ path: '/sessions/:id', name: 'session-detail', component: SessionDetailView },
```
`src/views/SessionDetailView.vue`:
```vue
<script>
export default {
  data() {
    return { session: null }
  },
  async mounted() {
    const id = Number(this.$route.params.id)
    const response = await fetch('/sessions.json')
    const all = await response.json()
    this.session = all.find((s) => s.id === id)
  },
}
</script>

<template>
  <main class="container mt-4">
    <div v-if="session">
      <h2>{{ session.title }}</h2>
      <p>Hosted by {{ session.host }} on {{ session.date }}</p>
    </div>
    <RouterLink to="/sessions">← Back to sessions</RouterLink>
  </main>
</template>
```
In `SessionCard.vue`, make the title a link:
`<RouterLink :to="'/sessions/' + session.id">{{ session.title }}</RouterLink>`.

**Your turn:**
1. Open `/sessions/99`. Show "Session not found" instead of a blank page.
2. Remove the `Number(...)`. Why does `find` stop matching? (`'1' === 1`?) Put it back.

---

## Step 6 — A login form + `localStorage`

**Learn:**
- `@submit.prevent` on a `<form>` runs your method and **stops the page reload** a form normally does.
  It also means pressing Enter submits.
- **`localStorage`** is a small key/value store in the browser that **survives refresh**.
  `setItem(key, value)` saves, `getItem(key)` reads (`null` if missing), `removeItem(key)` deletes.
  Values are always strings. In Module 4 the login **token** goes here.

There's no server yet, so this login just remembers the username.

**Type this:** `src/views/LoginView.vue`, plus a `/login` route:
```vue
<script>
export default {
  data() {
    return {
      form: { username: '', password: '' },
    }
  },
  methods: {
    login() {
      localStorage.setItem('username', this.form.username)
      this.$router.push('/sessions')
    },
  },
}
</script>

<template>
  <main class="container mt-4" style="max-width: 400px">
    <h2>Login</h2>
    <form @submit.prevent="login">
      <input v-model="form.username" class="form-control mb-2" placeholder="username" required />
      <input
        v-model="form.password"
        type="password"
        class="form-control mb-2"
        placeholder="password"
        required
      />
      <button type="submit" class="btn btn-primary w-100">Login</button>
    </form>
  </main>
</template>
```
`required` is HTML5 validation: the browser won't submit an empty box.

Now show the username in the navbar. Add a `<script>` to `App.vue`:
```vue
<script>
export default {
  data() {
    return { username: localStorage.getItem('username') }
  },
  watch: {
    $route() {
      this.username = localStorage.getItem('username')
    },
  },
  methods: {
    logout() {
      localStorage.removeItem('username')
      this.$router.push('/login')
    },
  },
}
</script>
```
and at the end of the `<nav>`:
```html
<div class="ms-auto text-light">
  <template v-if="username">
    {{ username }}
    <button class="btn btn-sm btn-outline-light ms-2" @click="logout">Logout</button>
  </template>
  <RouterLink v-else class="btn btn-sm btn-outline-light" to="/login">Login</RouterLink>
</div>
```
**Why the `watch`?** Vue can't see changes to `localStorage`, because it isn't reactive data. Without
the watch, the navbar would show the old name until you refresh. A `watch` on `$route` re-reads it
every time the page changes, and login and logout both change the page. (This is the job a store
like Pinia does. We don't need one.)
`<template v-if>` groups elements without adding an extra tag.

**Your turn:**
1. Log in, then F12 → **Application** → Local Storage → `http://localhost:5173`. Find your key.
   Refresh the page: you're still "logged in".
2. Comment out the `watch`, log in, and see the bug. Put it back.

---

## Checkpoint challenge — no example

Make a **Sign up** page at `/signup` (`SignUpView.vue`, two-word name for ESLint) with username, email,
password and "confirm password", using `@submit.prevent`. Frontend validation (Module 8 asks for
this too):
- all fields `required`, email uses `type="email"`
- password at least 6 characters, and both password boxes must match. Otherwise show a red message
  under the form and **don't** continue.
- on success: `alert('Account created (not really yet)')` and go to `/login`.

Add a link to it on the login page.

## Viva questions (`ANSWERS.md`)
1. What's the difference between `<RouterLink to="/x">` and `<a href="/x">` in an SPA?
2. Props vs `$emit`: which direction does each go? Why can't the child just change the prop?
3. What do `async` and `await` do? What happens if you forget the `await` before `fetch`?
4. Why must you check `response.ok` with fetch?
5. What does `@submit.prevent` prevent?
6. `localStorage` vs a `data()` property: what survives a refresh? Why did the navbar need a `watch`?
7. `this.$route` vs `this.$router`: what's each one for?

When done, say **"check module 2"**.

## In your exam portal this becomes...
Views per role (exam list, slot list, booking page), a card component per exam/slot with props,
"Book" buttons that emit to the parent, `/exams/:id` detail pages, and login + register forms.

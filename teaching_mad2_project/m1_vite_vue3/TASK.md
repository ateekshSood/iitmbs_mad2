# Module 1 — The Modern Stack (Vite & Vue 3)

This follows your bootcamp's Module 1, step by step, and **you learn it by building**. From here
on you build **one app** across all the modules: the **Library Hub**. In this module you make its
frontend and a home page that lists books. Module 2 adds routes and components, Module 3 a Flask
API, and so on. By the end you'll have built a small version of everything your real project needs.

The app lives in `teaching_mad2_project/library-hub/`:
```
library-hub/
├── frontend/    ← this module (Vite + Vue 3)
└── backend/     ← Module 3 (Flask)
```
That's the same `frontend/` + `backend/` layout your final zip needs.

Each step has **Learn**, **Type this** (type it, don't paste) and **Your turn** (do these, they're
the part that sticks). Answer the viva questions at the end in `m1_vite_vue3/ANSWERS.md`.

---

## Step 0 — Update Node (2 minutes)

Your Node is **22.17.1**, and the current Vue project wizard wants **22.18 or newer**. You'd only get
warnings, but fix it now so they don't confuse you later. Your Node came from `nvm`, so:
```bash
nvm install 24
nvm alias default 24
node -v          # should print v24.something
```
Open a new terminal afterwards and check `node -v` again.

---

## Step 1 — Create the project (what Module 1 sections 1–4 say)

**Learn:** in MAD-1, Flask built every page in Python (Jinja) and sent finished HTML. In MAD-2 the
**browser** builds the pages with Vue, and Flask only sends data (JSON). **Vite** is the tool that
serves your `.vue` files to the browser while you work (the dev server) and packs them into plain
JS/CSS at the end (the build). A browser can't read a `.vue` file by itself.

**Type this:**
```bash
mkdir -p ~/mad2_iitmbs/teaching_mad2_project/library-hub
cd ~/mad2_iitmbs/teaching_mad2_project/library-hub
npm create vue@latest frontend
```
In the wizard, use **Space** to tick and **Enter** to continue:

| Question | Answer |
|---|---|
| Features | tick **Router**, **ESLint**, **Prettier**. Leave TypeScript, Pinia, Vitest etc. off |
| Experimental features | press Enter without ticking anything |
| Skip example code? | **No** (you'll look at it once, then replace it) |

At the end it suggests `git init`. **Don't.** You're already inside the `mad2_iitmbs` git repo, and a
repo inside a repo causes trouble.

Then:
```bash
cd frontend
npm install                  # downloads Vue, Vite, Router, ESLint... into node_modules/
npm install bootstrap        # styling
npm run dev
```
Open http://localhost:5173 in your Windows browser. Keep the terminal running (Ctrl+C stops it), and
keep **F12 → Console** open.

**Different from your teacher's notes:** Module 1 says `npm install axios vue-router@4`. Skip both:
- **No axios.** You can't use it, so you'll use **`fetch`**, which is built into every browser (no
  install needed). It does the same job: send HTTP requests to Flask. Modules 2–3 here teach `fetch`.
  When your teacher's notes show `axios.get(url)`, you'll write the `fetch` version.
- **No `vue-router@4`.** You ticked Router, so the wizard already installed vue-router **5**, the next
  version of 4 with the same code (`createRouter`, `createWebHistory`, `RouterView`). Installing `@4`
  would downgrade it.

**Your turn:** click Home and About in the demo. Watch the Network tab in F12. The page **doesn't
reload**. That's a Single Page App (SPA). Then run `git status` from `teaching_mad2_project/` and
check that nothing from `node_modules/` shows up (the project's own `.gitignore` hides it).

---

## Step 2 — Tour the generated files (Module 1 sections 6 and 9)

Open the `frontend/` folder in VS Code. The files that matter:
```
frontend/
├── index.html            ← the ONE html page. Has <div id="app"> and loads /src/main.js
├── package.json          ← your packages + scripts: dev, build, lint, format
├── vite.config.js        ← Vite settings. Makes "@" mean the src/ folder
├── eslint.config.js      ← ESLint rules
├── node_modules/         ← installed packages. NEVER commit or zip it
└── src/
    ├── main.js           ← starts the app
    ├── App.vue           ← the root component
    ├── router/index.js   ← which URL shows which view (Module 2)
    ├── views/            ← one component per PAGE (HomeView, AboutView)
    ├── components/       ← smaller reusable pieces
    └── assets/           ← CSS, images
```
Read `src/main.js` line by line:
```js
import './assets/main.css'          // load the demo's CSS
import { createApp } from 'vue'     // take createApp out of the vue package
import App from './App.vue'         // your root component
import router from './router'       // the router from src/router/index.js

const app = createApp(App)          // make the app (Vue 2 was: new Vue)
app.use(router)                     // plug the router in. Must be BEFORE mount
app.mount('#app')                   // put it inside <div id="app"> in index.html
```

**Important:** open `App.vue` or `HomeView.vue`. They start with **`<script setup>`**. That is the
**Composition API**, the *other* way to write Vue 3. Your bootcamp (and this course) uses the
**Options API**: `export default { data(), methods, computed, ... }`. You'll see `<script setup>`
in a lot of tutorials. **Don't mix the two styles.** In the next step you replace the demo code.

**Your turn:** in `ANSWERS.md`, write one line for each of these files saying what it does:
`index.html`, `main.js`, `App.vue`, `router/index.js`, `views/`, `components/`.

---

## Step 3 — Clean slate + your first SFC (Module 1 section 6)

**Learn:** a **Single File Component** (`.vue` file) has three blocks:
- `<script>`: `export default { ... }`, the options object (`data`, `methods`, ...)
- `<template>`: the HTML
- `<style scoped>`: CSS that only affects this component

In Vue 3, `data` is **always** a function that returns an object.

**Clean up the demo:**
1. Delete everything inside `src/components/` (HelloWorld, TheWelcome, WelcomeItem, the `icons/` folder).
2. In `src/main.js`, replace the line `import './assets/main.css'` with
   `import 'bootstrap/dist/css/bootstrap.min.css'`
3. Replace **all** of `src/App.vue` with (this is what Module 1 section 9 shows):
```vue
<template>
  <RouterView />
</template>
```
`<RouterView />` means "show the page for the current URL here". The router decides which page.
Leave `AboutView.vue` and `router/index.js` alone. They're for Module 2.

**Type this:** replace **all** of `src/views/HomeView.vue` with:
```vue
<script>
export default {
  data() {
    return {
      libraryName: 'Library Hub',
      message: 'Welcome! Find something to read.',
    }
  },
}
</script>

<template>
  <main class="container mt-4">
    <h1>{{ libraryName }}</h1>
    <p class="lead">{{ message }}</p>
  </main>
</template>

<style scoped>
h1 {
  color: #42b983;
}
</style>
```
Line by line:
- `export default { ... }`: "this file's component is this object". The router imports it as `HomeView`.
- `data() { return {...} }`: the component's state. Everything returned can be used in the template.
- `{{ libraryName }}`: text interpolation, the same as 01a.
- `class="container mt-4"`: Bootstrap, now loaded from `main.js`.

**Try:** change the message and press Ctrl+S. The page updates without a reload (hot reload).

**Your turn:**
1. Add `city: 'Chennai'` (any city) to data and show "Library Hub, Chennai" in the heading.
2. Experiment: change `data() { return {...} }` to `data: { ... }`. Read the Console warning,
   then change it back.

---

## Step 4 — The book list: `v-for`, `v-if`, `v-else` (Module 1 section 7)

**Learn:** same directives as 01a. `v-for` repeats an element for each item, and `:key` gives each
one a unique id so Vue can track it. `v-if` / `v-else` show one thing or the other.

**Type this:** in `HomeView.vue`, add `books` to the object that `data()` returns:
```js
books: [
  { id: 1, title: 'The Hobbit', author: 'J.R.R. Tolkien', available: true },
  { id: 2, title: 'Dune', author: 'Frank Herbert', available: false },
  { id: 3, title: 'Wings of Fire', author: 'A.P.J. Abdul Kalam', available: true },
],
```
and add this under the `<p class="lead">` in the template:
```html
<ul v-if="books.length > 0" class="list-group">
  <li
    v-for="book in books"
    :key="book.id"
    class="list-group-item d-flex justify-content-between align-items-center"
  >
    <span>
      {{ book.title }} <small class="text-muted">by {{ book.author }}</small>
    </span>
    <span v-if="book.available" class="badge bg-success">Available</span>
    <span v-else class="badge bg-secondary">Borrowed</span>
  </li>
</ul>
<p v-else class="text-muted">No books yet.</p>
```
Read `v-for="book in books" :key="book.id"`: `book` is **one** item, and `books` is the array.
(`books.id` would be the 01a bug again: an array has no `id`.)

**Your turn:**
1. Make the empty message appear by temporarily emptying the array (`books: []`). Put it back.
2. Make borrowed books' titles grey using `:class` (01a): `:class="{ 'text-muted': !book.available }"`.

---

## Step 5 — Adding books: `v-model` + `methods` (Module 1 section 7)

**Learn:** `v-model` ties an input to a data property in both directions: type in the box and the
data changes, change the data and the box changes. `methods` hold functions for clicks and submits.

**Type this:** add `newTitle: ''` and `nextId: 4` to data. Add a `methods` section after `data`
(don't forget the comma after `data() {...}`):
```js
methods: {
  addBook() {
    this.books.push({
      id: this.nextId,
      title: this.newTitle,
      author: 'Unknown',
      available: true,
    })
    this.nextId++
    this.newTitle = ''
  },
},
```
and in the template, above the list:
```html
<div class="input-group my-3">
  <input v-model="newTitle" class="form-control" placeholder="Book title" />
  <button class="btn btn-primary" @click="addBook">Add</button>
</div>
<p class="small text-muted">You typed: {{ newTitle }}</p>
```
- `this.books` / `this.newTitle`: inside methods, `this` means "this component".
- `this.newTitle = ''` empties the input **because** of v-model's two-way link.
- `nextId` gives each new book a unique `:key`.

**Your turn:**
1. Add a second input for the author (`newAuthor`) and use it instead of `'Unknown'`.
2. Refuse to add a book with an empty title. Use `this.newTitle.trim() === ''` and `return` early.
3. Make pressing Enter in the title box also add the book: `@keyup.enter="addBook"`.

---

## Step 6 — `computed`: values calculated from data (Module 1 section 7)

**Learn:** a **computed** property is a value Vue works out from other data, and it updates by
itself when that data changes. You use it like data (`{{ availableCount }}`, no brackets). Vue also
**caches** it, so it only recalculates when the data it uses changes. A method runs again on every
re-render.

**Type this:** add `search: ''` to data, and a `computed` section:
```js
computed: {
  availableCount() {
    return this.books.filter((b) => b.available).length
  },
  filteredBooks() {
    const q = this.search.toLowerCase()
    return this.books.filter((b) => b.title.toLowerCase().includes(q))
  },
},
```
In the template:
- above the list, add a search box: `<input v-model="search" class="form-control mb-2" placeholder="Search titles" />`
- and a count line: `<p>{{ availableCount }} of {{ books.length }} available</p>`
- change `v-for="book in books"` to `v-for="book in filteredBooks"`

`(b) => b.available` is an **arrow function**: a short function that takes `b` and returns `b.available`.
`filter` keeps only the items where it returns true.

**Your turn:**
1. When the search matches nothing (but there are books), show "No books match '...'" with the
   search text. (Hint: check `filteredBooks.length`.)
2. **Computed vs method experiment:** add `console.log('computed ran')` inside `availableCount`.
   Then add a **method** `availableCountMethod()` with the same code and
   `console.log('method ran')`, and show `{{ availableCountMethod() }}` too. Type in the
   **search** box and watch the Console. Which one runs on every key, and why? (Write it in ANSWERS.md.)
   Remove the method afterwards.

---

## Step 7 — Lifecycle hooks: `created` and `mounted` (Module 1 section 7)

**Learn:** Vue calls these functions for you at fixed moments:
- `created()`: data and methods are ready, but **nothing is on screen yet** (no DOM).
- `mounted()`: the component's HTML **is on the page**.

In real apps this is where you **load data from the server** (Module 2/3: `fetch` + Flask). Here you
fake a slow server with `setTimeout`.

**Type this:** move the three sample books **out** of `data` into a constant **above**
`export default`:
```js
const sampleBooks = [
  { id: 1, title: 'The Hobbit', author: 'J.R.R. Tolkien', available: true },
  { id: 2, title: 'Dune', author: 'Frank Herbert', available: false },
  { id: 3, title: 'Wings of Fire', author: 'A.P.J. Abdul Kalam', available: true },
]
```
In `data`, change `books` to `books: []` and add `loading: true`. Add the hooks (next to `data`,
`methods`, `computed`, in the same object):
```js
created() {
  console.log('HomeView created: books =', this.books.length)
},
mounted() {
  console.log('HomeView mounted: the page is on screen')
  setTimeout(() => {
    this.books = sampleBooks   // pretend this came from the server
    this.loading = false
  }, 1500)
},
```
In the template, wrap the list part like this (01a's `v-else-if`):
```html
<p v-if="loading">Loading books...</p>
<ul v-else-if="filteredBooks.length > 0" class="list-group"> ...the same li... </ul>
<p v-else class="text-muted">No books yet.</p>
```
(Adjust your step 6 "no match" message so it still works.)

- `setTimeout(fn, 1500)`: run `fn` after 1.5 seconds.
- `() => { ... }`: an arrow function **keeps `this`** as the component.

**Your turn:**
1. Refresh and watch the order of the two Console messages and the "Loading..." text.
2. Experiment: change `setTimeout(() => {` to `setTimeout(function () {`. What breaks, and what does the
   Console say? Explain in ANSWERS.md (hint: what `this` means inside a normal function). Change it back.
3. Add `console.log(this.$el)` in both `created` and `mounted`. What's the difference?

---

## Step 8 — Your first local component (Module 1 section 8)

**Learn:** a component is a reusable piece of UI in its own `.vue` file. To use it, the parent
**imports** it and **registers** it in `components: { }`. That's called *local registration*.
Without both, Vue doesn't know the tag. (Passing data into components with **props** is Module 2.)

ESLint (which you ticked) has a rule: **component names must be two or more words**
(`LibraryHeader`, not `Header`), so they never clash with real HTML tags like `<header>`.

**Type this:** make `src/components/LibraryHeader.vue`:
```vue
<script>
export default {
  name: 'LibraryHeader',
  data() {
    return { isOpen: true }
  },
  methods: {
    toggleOpen() {
      this.isOpen = !this.isOpen
    },
  },
  created() {
    console.log('LibraryHeader created')
  },
  mounted() {
    console.log('LibraryHeader mounted')
  },
}
</script>

<template>
  <nav class="navbar navbar-dark bg-dark px-3">
    <span class="navbar-brand">Library Hub</span>
    <div>
      <span v-if="isOpen" class="badge bg-success me-2">Open now</span>
      <span v-else class="badge bg-danger me-2">Closed</span>
      <button class="btn btn-sm btn-outline-light" @click="toggleOpen">Toggle</button>
    </div>
  </nav>
</template>
```
In `HomeView.vue`, at the top of `<script>` (before `const sampleBooks`):
```js
import LibraryHeader from '@/components/LibraryHeader.vue'
```
add `components: { LibraryHeader },` to the options object, and put `<LibraryHeader />` as the first
line of the template, **above** `<main>`.

- `@/` means `src/` (set up in `vite.config.js`), so the path works from any folder.
- `components: { LibraryHeader }` is short for `{ LibraryHeader: LibraryHeader }`.
- The template now has two top-level elements (`<LibraryHeader />` and `<main>`). Vue 3 allows that.
  Vue 2 didn't.

**Your turn:**
1. Refresh and read the Console. Write down the order of the 4 created/mounted messages. Why does
   the **child** finish mounting before the parent? (ANSWERS.md)
2. Delete `LibraryHeader` from `components: { }` (leave the import). Read the Console warning
   ("Failed to resolve component"). Put it back.
3. Make a component `src/components/Footer.vue` with a `<footer>` showing the year. Run
   `npm run lint` and read the error. Rename it properly, then use it at the bottom of `HomeView`.

---

## Step 9 — Lint, format, build

**Learn:** the three other scripts in `package.json`:
- `npm run lint`: ESLint (and oxlint) check for mistakes like unused variables or bad component names.
- `npm run format`: Prettier rewrites your files in one consistent style (no semicolons, single quotes).
- `npm run build`: Vite makes `dist/`, the plain HTML/JS/CSS that would actually be deployed.

**Type this** (stop the dev server first, or use a second terminal):
```bash
npm run lint
npm run format
npm run build
```
Look in `dist/assets/` at the `.js` file. Your `.vue` files are gone. They've been turned into one
plain JS file (search it for `Hobbit`).

**Your turn:** add `const unused = 5` inside `addBook`, run `npm run lint`, and read what it says.
Remove it.

---

## Checkpoint challenge — no example this time

Add these to the Library Hub home page yourself:
1. A **Borrow / Return** button on each book that flips its `available`. Write a method
   `toggleBorrow(id)` that finds the book with `this.books.find((b) => b.id === id)`.
   The "X of Y available" line must update by itself (why? because it's computed).
2. A checkbox "Show available only" (`v-model` on a checkbox gives `true`/`false`).
   Add it to `filteredBooks` so the search and the checkbox both work together.
3. A **Delete** button on each book that removes it (`filter`, like your 01a todo app).

## Viva questions (answer in `ANSWERS.md`, in your own words)
1. MAD-1 vs MAD-2: in MAD-1 what did Flask send to the browser, and what will it send in MAD-2?
2. `computed` vs `methods`: what's the difference? Use your step 6 experiment.
3. `created` vs `mounted`: what's ready in each? Where would you load data from the server?
4. What does each line of `main.js` do? What happens if `app.use(router)` comes after `app.mount`?
5. What's the difference between `<script setup>` and `export default { }`? Which one do we use?
6. Why does `v-for` need `:key`, and why must the key be unique?
7. What do `npm run dev` and `npm run build` do? Which folder must never go in your zip, and why?

When done, tell me **"check module 1"**. I'll review `library-hub/frontend/src/` and your
`ANSWERS.md`, then we move to Module 2 (Components, Router & Hooks).

## Quick-reference card

| You write | Where | Meaning |
|---|---|---|
| `npm create vue@latest name` | terminal | new project (tick Router, ESLint, Prettier) |
| `npm install` / `npm run dev` | terminal | install packages / start the dev server |
| `createApp(App).use(router).mount('#app')` | `main.js` | start the app |
| `export default { ... }` | `<script>` of a `.vue` | this file's component (Options API) |
| `data() { return {...} }` | any component | its state |
| `methods: { f() {} }` | any component | functions for clicks/submits |
| `computed: { x() { return ... } }` | any component | a cached value worked out from data |
| `created()` / `mounted()` | any component | runs before / after it's on the page |
| `import X from '@/components/X.vue'` + `components: { X }` | parent | make `<X />` usable |
| `<RouterView />` | `App.vue` | show the page for the current URL |

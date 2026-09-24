# Lesson 03 — Vue Router 3 (CDN)

Your project has three dashboards (admin / examiner / student) plus login and register pages.
That's routing. Vue 2 pairs with **Vue Router 3**:

```html
<script src="https://cdn.jsdelivr.net/npm/vue@2.7.16/dist/vue.js"></script>
<script src="https://cdn.jsdelivr.net/npm/vue-router@3.6.5/dist/vue-router.js"></script>
```

## Concepts

```js
const Home = { template: `<h2>Home</h2>` };
const SessionDetail = { template: `<h2>Session {{ $route.params.id }}</h2>` };

const router = new VueRouter({
  routes: [
    { path: '/', component: Home },
    { path: '/sessions/:id', component: SessionDetail },           // dynamic param
    { path: '/admin', component: AdminPage, meta: { role: 'admin' } },
    { path: '*', component: NotFound }                               // catch-all
  ]
});

new Vue({ el: '#app', router });
```
- `<router-view>` is where the current page gets rendered. `<router-link to="/">` is a link that doesn't reload the page.
- `this.$router.push('/somewhere')` navigates from code. `this.$route` is the *current* route (params, query, meta).
- A **navigation guard** runs before every route change:
```js
router.beforeEach((to, from, next) => {
  // next() = allow, next('/login') = redirect
});
```

## Task

Build a mini multi-page app. Keep each page component in its own file under `pages/`.

1. Routes: `/` Home, `/login`, `/sessions` (list), `/sessions/:id` (detail), `/admin`,
   `/member`, and a 404 page.
2. A Bootstrap navbar with `router-link`s. The active link is highlighted (look up `active-class`).
3. `/sessions/:id` finds the session by id and shows its details, or "Not found" if the id is wrong.
4. **Fake login** (no backend yet): the login page has a dropdown to pick the role (`admin` / `member`).
   Clicking Login saves `role` in `localStorage` and uses `$router.push` to go to that role's dashboard.
5. **Guard**: `/admin` has `meta: { role: 'admin' }` and `/member` has `meta: { role: 'member' }`.
   In `beforeEach`, a user who isn't logged in goes to `/login`, and a user with the wrong role
   goes to their own dashboard.
6. A Logout button in the navbar clears `localStorage` and goes to `/login`. It only shows when logged in.

## Stretch
- Show "Logged in as admin" in the navbar, updating as soon as you log in or out. (Why doesn't
  reading `localStorage` in the template update on its own? How do you fix that?)

## Viva questions (`ANSWERS.md`)
1. `$route` vs `$router`?
2. Why is the URL `index.html#/sessions/2` — what is hash mode, and why is it handy with Flask?
3. The guard hides the admin page. Is that *security*? What really protects admin data? (Lesson 09 answers this.)

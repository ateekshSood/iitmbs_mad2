# Lesson 01 — Components, props, $emit

## Part A — Warm-up: fix your own bugs

Two of your earlier files have bugs. Find them by **reading, not running** —
spotting bugs by eye is a viva skill.

- `vue2_learn_again/l7/CounterWidget.vue` — 1 syntax bug in how `data` is written.
- `l8/ticketWidget.vue` — 1 syntax bug that breaks the whole object, and 1 logic bug:
  the backend expects `{ issue: ... }`. Compare that with what you send.

Also answer: why can't you open `CounterWidget.vue` in a browser directly while
`index.html` works? (Hint: what program understands the `.vue` file format?)

## Concept: components in CDN mode

Without a build tool, a component is a plain JS object with a `template` string:

```js
Vue.component('greeting-card', {
  props: ['name'],                          // data passed IN from the parent
  data() { return { clicks: 0 } },          // must be a FUNCTION in components (see Q1)
  template: `
    <div class="card p-2">
      Hello {{ name }} ({{ clicks }})
      <button @click="clicks++; $emit('waved', name)">Wave</button>
    </div>`
});
```

Used by the parent like this: `<greeting-card :name="user" @waved="onWave"></greeting-card>`

Rule: **props flow down, events flow up.** A child never changes a prop. It emits an event,
and the parent (which owns the data) makes the change.

## Part B — Task: reading-session board

Create in this folder:
- `index.html` — loads Vue 2.7 and Bootstrap 5 from CDN, then `components/SessionCard.js`, then your root app.
- `components/SessionCard.js` — registers `<session-card>`.

Requirements:
1. The root Vue instance holds `sessions`: at least 4 objects with
   `id, title, host, date, capacity, booked` (write the data yourself).
2. Render one `<session-card>` per session using `v-for` with `:key`.
3. `session-card` gets the session through a prop and shows title, host, date and
   "seats left" (capacity − booked) in a Bootstrap card.
4. A **Book** button in the card emits `book` with the session id. The **parent** increases `booked`.
5. When the session is full: the button is disabled and a red "Full" badge appears.
6. Above the board, the parent shows "Total seats left: N".

## Stretch
- A **Cancel** button that emits `cancel` (booked can never go below 0).
- Use the object form of props: `props: { session: { type: Object, required: true } }`.

## Viva questions — answer them in `ANSWERS.md` in this folder
1. Why must `data` be a function in a component, when it can be an object in `new Vue({})`?
2. What goes wrong if the child does `this.session.booked++` itself?
3. What is `:key` for in `v-for`? Why is using the array index risky?
4. What's the difference between `v-if` and `v-show`?

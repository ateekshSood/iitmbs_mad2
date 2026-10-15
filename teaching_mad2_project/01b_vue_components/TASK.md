# Lesson 01b — Vue components from scratch

Same format as 01a. Each step has:
- **Learn:** the idea, in plain words
- **Type this:** a complete working example (type it, don't paste)
- **Your turn:** one small change you make on your own. **Do these.** They're the part that sticks.

Make one file per step: `step1.html`, `step2.html`, ... in this folder. Serve the folder the same way:
```bash
python3 -m http.server 8000
```
Open http://localhost:8000/step1.html, and keep **F12 → Console** open.

Every file uses this skeleton (only the `<div id="app">` and `<script>` parts change):
```html
<!DOCTYPE html>
<html>
<head>
  <title>Step N</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.jsdelivr.net/npm/vue@2.7.16/dist/vue.js"></script>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
</head>
<body>
  <!-- div#app here -->
  <script>
    // components first, then new Vue(...)
  </script>
</body>
</html>
```

---

## Step 1 — Your first component

**Learn:** a **component** is your own custom HTML tag. You describe it once (its HTML, its
data, its methods) and then use it as many times as you like, like `<button>`, but one you made.

You create one with `Vue.component('tag-name', { ... })`. Inside, it's almost the same as
`new Vue({...})`, with two differences:
1. There is no `el`. Instead, a `template` string holds the component's HTML.
2. `data` must be a **function that returns an object**, not a plain object.

The template must have **exactly one root element** (wrap everything in one `<div>`).

**Type this** in `step1.html`:
```html
<div id="app" class="container mt-5">
  <h2>Three counters</h2>
  <click-counter></click-counter>
  <click-counter></click-counter>
  <click-counter></click-counter>
</div>

<script>
  // 1. describe the component (BEFORE new Vue)
  Vue.component('click-counter', {
    data() {                      // a function...
      return { count: 0 };        // ...that returns a fresh object
    },
    template: `
      <div class="mb-2">
        <button class="btn btn-primary" @click="count++">Clicked {{ count }} times</button>
      </div>
    `
  });

  // 2. the root app, same as before
  new Vue({
    el: '#app'
  });
</script>
```
(The backticks `` ` `` make a JS string that can span many lines.)

**Try:** click each button. They count **separately**. Each `<click-counter>` gets its own
`count`, because `data()` runs once per counter and returns a new object each time.

**Your turn:**
1. Add a "Reset" button inside the component that sets its own count back to 0.
   (You'll need a `methods` section, the same as in 01a.)
2. Experiment: change `data()` to the 01a style `data: { count: 0 }`. What does the Console say?
   Change it back. You'll explain why in the viva questions.

---

## Step 2 — Props: passing data INTO a component

**Learn:** right now every counter is identical. **Props** let the parent hand data to the
component, the same way you pass `src` to an `<img>`.

1. The component lists the props it accepts: `props: ['label']`
2. The parent passes them as attributes: `<click-counter label="Apples">`
3. Inside the component, a prop works like data: `{{ label }}`, `this.label`

Without a `:`, the value is plain text. With a `:` (v-bind from 01a), it's JavaScript:
```html
<click-counter label="Apples"></click-counter>       <!-- the string "Apples" -->
<click-counter :start="5"></click-counter>           <!-- the number 5 -->
<click-counter :label="fruitName"></click-counter>   <!-- the value of the parent's variable fruitName -->
```

**Type this** in `step2.html`:
```html
<div id="app" class="container mt-5">
  <fruit-row name="Apple" :price="40"></fruit-row>
  <fruit-row name="Mango" :price="60"></fruit-row>
  <fruit-row :name="special" :price="100"></fruit-row>
</div>

<script>
  Vue.component('fruit-row', {
    props: ['name', 'price'],                 // what the parent can pass in
    data() {
      return { qty: 0 };                      // the component's OWN data
    },
    template: `
      <div class="mb-2">
        {{ name }}: Rs {{ price }} x {{ qty }} = Rs {{ price * qty }}
        <button class="btn btn-sm btn-success" @click="qty++">+</button>
      </div>
    `
  });

  const app = new Vue({
    el: '#app',
    data: { special: 'Dragon fruit' }
  });
</script>
```
**Try:** in the Console type `app.special = 'Kiwi'`. The third row changes, because props are reactive.

**Your turn:**
1. Remove the `:` from `:price="40"` (make it `price="40"`) and click `+` a few times.
   The maths still works... now try `{{ price + 1 }}` in the template. Explain what you see.
   (Hint: `"40" + 1` in JS.) Put the `:` back.
2. Add a third prop, `stock`, and disable the `+` button when `qty >= stock`.

**Remember:** `props` = handed in by the parent. `data()` = the component's own.

---

## Step 3 — `v-for` over a component, passing a whole object

**Learn:** you'll almost never write components out by hand like step 2. The data lives in an
array in the parent, and you `v-for` over the component. You can pass a whole object as
**one** prop instead of many small ones.

**Type this** in `step3.html`:
```html
<div id="app" class="container mt-5">
  <fruit-card v-for="f in fruits" :key="f.id" :fruit="f"></fruit-card>
</div>

<script>
  Vue.component('fruit-card', {
    props: ['fruit'],                       // one prop: the whole object
    template: `
      <div class="card mb-2">
        <div class="card-body">
          <h5 class="card-title">{{ fruit.name }}</h5>
          <p class="card-text">Rs {{ fruit.price }}, {{ fruit.stock }} left</p>
        </div>
      </div>
    `
  });

  const app = new Vue({
    el: '#app',
    data: {
      fruits: [
        { id: 1, name: 'Apple',  price: 40,  stock: 10 },
        { id: 2, name: 'Mango',  price: 60,  stock: 0  },
        { id: 3, name: 'Banana', price: 10,  stock: 25 }
      ]
    }
  });
</script>
```
Read `:key="f.id" :fruit="f"` slowly: **`f` is one fruit from the loop**, and you pass it into
the component's prop called `fruit`. (This is where 01a step 7's `books.id` bug would bite.)

**Your turn:**
1. Show a red `Sold out` badge (`<span class="badge bg-danger">`) inside the card, only when stock is 0.
2. In the Console: `app.fruits.push({ id: 4, name: 'Kiwi', price: 80, stock: 3 })`. A new card appears.

---

## Step 4 — `$emit`: the child tells the parent something happened

**Learn:** this is the most important rule in Vue components:

> **Props flow down, events flow up.**

The **parent owns the data**. A child must **never change a prop** (Vue warns you in the
Console if you try). So when a button inside the child is clicked, the child **announces it**
with `this.$emit('event-name')`, and the parent **listens** with `@event-name="someMethod"`
and makes the change itself.

It's the same `@` as `@click`. `click` is an event the browser fires; `$emit` lets you fire your own.

```
 parent (owns fruits)                     child (fruit-card)
   :fruit="f"   ───── data goes down ────>  shows fruit.name
   @buy="..."   <──── event goes up ──────  this.$emit('buy')
```

**Type this** in `step4.html` (from step 3, with a button and an event added):
```html
<div id="app" class="container mt-5">
  <p>Items bought: {{ bought }}</p>
  <fruit-card v-for="f in fruits" :key="f.id" :fruit="f" @buy="onBuy"></fruit-card>
</div>

<script>
  Vue.component('fruit-card', {
    props: ['fruit'],
    methods: {
      clickedBuy() {
        this.$emit('buy');              // "hey parent, buy was clicked!" That's ALL the child does.
      }
    },
    template: `
      <div class="card mb-2">
        <div class="card-body">
          <h5 class="card-title">{{ fruit.name }}</h5>
          <p class="card-text">{{ fruit.stock }} left</p>
          <button class="btn btn-success" @click="clickedBuy">Buy</button>
        </div>
      </div>
    `
  });

  const app = new Vue({
    el: '#app',
    data: {
      bought: 0,
      fruits: [
        { id: 1, name: 'Apple',  stock: 10 },
        { id: 2, name: 'Mango',  stock: 0  },
        { id: 3, name: 'Banana', stock: 25 }
      ]
    },
    methods: {
      onBuy() {                         // the PARENT makes the change
        this.bought++;
      }
    }
  });
</script>
```
**Try:** click Buy on any card and the parent's counter goes up.

**Experiment (then undo it):** inside `clickedBuy`, add `this.fruit = null`. Click Buy and read
the Console warning. That's Vue telling you a child must not overwrite a prop.

**Your turn:** the counter goes up, but the fruit's `stock` doesn't go down. The parent doesn't
yet know **which** fruit was bought. Think about how it could know. That's step 5.

---

## Step 5 — Emitting with data (the id)

**Learn:** `$emit` can send data along: `this.$emit('buy', this.fruit.id)`. The parent's
method receives it as an argument: `onBuy(id) { ... }`.

Then the parent finds that item in its own array and changes it. Use `find`, which returns the
first item that matches:
```js
const fruit = this.fruits.find(f => f.id === id);   // the actual object in the array
fruit.stock--;                                      // changing it updates the card (reactivity)
```

**Type this:** copy step 4 to `step5.html` and change these three lines:
```js
this.$emit('buy', this.fruit.id);       // in the child
```
```js
onBuy(id) {                             // in the parent
  const fruit = this.fruits.find(f => f.id === id);
  fruit.stock--;
  this.bought++;
}
```
The HTML `@buy="onBuy"` stays the same, and Vue passes the emitted value in automatically.

**Your turn:**
1. Disable the Buy button when `fruit.stock` is 0 (child template, `:disabled` from 01a).
2. Even with the button disabled, make `onBuy` refuse to go below 0 (the 01a step 4 lesson:
   never trust the button alone).
3. Add a `Return` button that emits `return-item` with the id, and have the parent add 1 back to stock.
   Note: write event names in **kebab-case** (`return-item`, not `returnItem`), because HTML
   attributes are lowercase.

---

## Step 6 — A component in its own file

**Learn:** a real project has many components, so each one goes in its own `.js` file.
In CDN mode (no build tools) you just load the files with `<script src>` tags.
**Order matters:** Vue first, then the components, then the root `new Vue`, because each script
can only use what was loaded before it.

Why not `.vue` files? A `.vue` file (`<template>` + `<script>` + `<style>` in one file) is not
something the browser understands. It needs a build tool (Vite/webpack) to convert it to JS
first. Your project uses CDN Vue, so components are plain `.js` files with a `template` string.

**Type this:** make a folder `components/` with `components/FruitCard.js`, and move your
`Vue.component('fruit-card', {...})` from step 5 into it (only that, no `<script>` tags in a
`.js` file). Then make `step6.html` with this in the body:
```html
<div id="app" class="container mt-5">
  ... same as step 5 ...
</div>

<script src="components/FruitCard.js"></script>   <!-- after Vue (in head), before the root app -->
<script>
  const app = new Vue({ ... same as step 5 ... });
</script>
```

**Your turn:** move the `<script src="components/FruitCard.js">` line to **below** the
`new Vue` script. Refresh and read the Console error. Explain it in one sentence, then put it back.

---

## Step 7 — Bug hunt (reading, not running)

Now that you know the rules, find the **4 bugs** by reading only. Spotting bugs by eye is a
viva skill. Write the answers in `ANSWERS.md`.

```js
Vue.component('ticket-list', {
  props: ['tickets'],
  data: {
    newIssue: ''
  },
  created() {
    this.loadTickets()
  }
  methods: {
    addTicket() {
      this.tickets.push({ issue: this.newIssue, status: 'open' })
      this.newIssue = ''
    }
  },
  template: `<div><input v-model="newIssue"><button @click="addTicket()">Add</button></div>`
})
```
(Hints: one is a syntax error, one is step 1's rule, one calls something that doesn't exist,
and one breaks step 4's rule.)

---

## Mini-project — reading-session board

No example this time. Use steps 1–6. In this folder create:
- `index.html`: loads Vue 2.7 and Bootstrap 5, then `components/SessionCard.js`, then your root app.
- `components/SessionCard.js`: registers `<session-card>`.

Requirements:
1. The root app holds `sessions`: at least 4 objects with
   `id, title, host, date, capacity, booked` (write the data yourself).
2. Render one `<session-card>` per session using `v-for` with a correct `:key`.
3. `session-card` gets the session through **one** prop and shows title, host, date and
   "seats left" (capacity − booked) in a Bootstrap card.
4. A **Book** button in the card emits `book` with the session id. The **parent** increases `booked`.
5. When a session is full, the button is disabled and a red "Full" badge appears.
6. Above the board, the parent shows "Total seats left: N" (a loop or `reduce` over sessions).

**Stretch:**
- A **Cancel** button that emits `cancel`. `booked` can never go below 0.
- Use the object form of props: `props: { session: { type: Object, required: true } }`.
  Then try leaving out `:session` on purpose and read the Console warning.

## Viva questions (answer them in `ANSWERS.md` in your own words)
1. Why must `data` be a function in a component, when it can be an object in `new Vue({})`?
   (Think about step 1's three counters.)
2. What goes wrong if the child does `this.session.booked++` itself instead of emitting?
3. What is `:key` for in `v-for`? Why is using the array index risky when items get deleted?
4. What's the difference between `v-if` and `v-show`? (Look it up and try both, then check the
   Elements tab in F12 for what changes.)

When done, tell me **"check lesson 01b"**.

## Quick-reference card

| You write | Where | Meaning |
|---|---|---|
| `Vue.component('my-tag', {...})` | before `new Vue` | define a component |
| `data() { return {...} }` | component | its own data, fresh copy per use |
| `template: \`<div>...</div>\`` | component | its HTML, exactly one root element |
| `props: ['x']` | component | accept data from the parent |
| `<my-tag :x="value">` | parent | pass data down |
| `this.$emit('evt', data)` | component | send an event up |
| `<my-tag @evt="method">` | parent | listen; `method(data)` gets the value |
| `list.find(i => i.id === id)` | parent | get the item to change |

# Lesson 01b — Vue 3 components with Vite (from scratch)

> **Replaced by `m1_vite_vue3/` and Module 2** (2026-10-21). You don't need to do this lesson.
> Its props/`$emit` steps get reused in Module 2.

The course now uses **Vue 3**, built with **Vite**, in **`.vue` files**, with the **Options API**.
The Options API is the `data()` / `methods` / `props` style you learned in 01a. Almost everything
from 01a still works. What changes is how the app starts and where the code lives.

Same format as 01a. Each step has:
- **Learn:** the idea, in plain words
- **Type this:** a complete working example (type it, don't paste)
- **Your turn:** one small change you make on your own. **Do these.** They're the part that sticks.

Your old `step1.html`, `step2.html` and `step4.html` (Vue 2) can stay in this folder or be deleted.
This lesson doesn't use them.

---

## Step 0 — Make a Vite project

**Learn:** a browser does **not** understand `.vue` files. **Vite** is a tool that:
1. runs a **dev server** that turns your `.vue` files into plain JS while you work, and reloads
   the page every time you save (no more F5), and
2. at the end, **builds** everything into plain HTML/JS/CSS files (step 7).

Vite comes from **npm**, the package manager for JavaScript (like `uv`/`pip` for Python).
You have Node 22 and npm 11 already.

**Type this** in the WSL terminal:
```bash
cd ~/mad2_iitmbs/teaching_mad2_project/01b_vue_components
npm create vite@latest fruit-shop -- --template vue
```
If it asks extra questions (an "experimental" option, or "install and start now?"), answer **No**.
Then:
```bash
cd fruit-shop
npm install              # downloads Vue + Vite into node_modules/
npm install bootstrap    # adds Bootstrap as a package (no more CDN <link>)
npm run dev              # starts the dev server
```
Open the address it prints (http://localhost:5173) in your Windows browser. Keep that terminal
running (Ctrl+C stops it), and keep **F12 → Console** open.

**What you got:**
```
fruit-shop/
├── index.html          ← the ONE html page: has <div id="app"> and loads /src/main.js
├── package.json        ← which npm packages you use + the scripts (dev, build)
├── package-lock.json   ← exact versions installed (appears after npm install; commit it)
├── vite.config.js      ← Vite's settings (it turns on the Vue plugin). Leave it for now.
├── .gitignore          ← Vite made it; it already ignores node_modules/ and dist/
├── node_modules/       ← the installed packages. Huge. NEVER commit it or zip it.
├── public/             ← (and .vscode/, README.md: ignore them)
└── src/
    ├── main.js         ← starts Vue
    ├── App.vue         ← the root component (like your old <div id="app">)
    ├── style.css
    ├── assets/
    └── components/
        └── HelloWorld.vue
```

**Clean up the demo.** Delete `src/style.css` and `src/components/HelloWorld.vue`. Then replace
**all** of `src/main.js` with:
```js
import { createApp } from 'vue'
import 'bootstrap/dist/css/bootstrap.min.css'
import App from './App.vue'

createApp(App).mount('#app')
```
Line by line:
- `import { createApp } from 'vue'`: take the `createApp` function out of the `vue` package in `node_modules`.
- `import 'bootstrap/...css'`: load Bootstrap's CSS on every page. Vite lets JS import CSS.
- `import App from './App.vue'`: load your root component. `./` means "this folder".
- `createApp(App).mount('#app')`: the Vue 3 version of `new Vue({ el: '#app' })`.
  Make an app whose root is `App`, then put it inside `<div id="app">` in `index.html`.

The page breaks for a moment because `App.vue` still uses the deleted `HelloWorld`.
You fix that in step 1.

**Your turn:** run `git status` from `01b_vue_components/`. You should see `fruit-shop/`, but
nothing from `node_modules/` (open the folder in git's list to check). If node_modules shows up,
stop and tell me.

---

## Step 1 — Anatomy of a `.vue` file

**Learn:** a `.vue` file (a "single-file component") has up to three blocks:
- `<template>`: the HTML. It replaces the `template: \`...\`` string.
- `<script>`: `export default { ... }`, the **same options object** you used in 01a
  (`data`, `methods`, ...), but with no `el`.
- `<style scoped>`: CSS. `scoped` means it only affects this component.

In Vue 3, `data` is **always** a function that returns an object, even in the root.

**Type this:** replace **all** of `src/App.vue` with:
```vue
<template>
  <div class="container mt-5">
    <h2>{{ title }}</h2>
    <p>Clicked {{ count }} times</p>
    <button class="btn btn-primary" @click="count++">Click</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      title: 'Hello from App.vue',
      count: 0
    }
  }
}
</script>

<style scoped>
h2 {
  color: teal;
}
</style>
```
Line by line:
- Everything inside `<template>` is the same template syntax as 01a: `{{ }}`, `@click`, Bootstrap classes.
- `export default { ... }`: "this file's component is this object". `main.js` imported it as `App`.
- `data() { return {...} }`: a function that returns the data.

**Try:** change the title text and press Ctrl+S. The page updates by itself (hot reload).

**Heads-up:** the demo `App.vue` you just replaced started with `<script setup>` and used `ref()`.
That's the other Vue 3 style, the **Composition API**. You'll see it in a lot of tutorials.
This course uses the Options API (`export default { data(), methods }`). Don't mix the two.

**Your turn:**
1. Add a `methods` section with a `reset()` method, and a Reset button that calls it.
2. Experiment: change `data() { return {...} }` to `data: { title: '...', count: 0 }`.
   Read the Console warning, then change it back.

---

## Step 2 — Your first child component (and how to import it)

**Learn:** a component is your own custom tag. In a Vite project:
1. Each component is its **own `.vue` file** in `src/components/`.
2. A parent that uses it must **import** it and list it in **`components: { }`**.
   No import means Vue doesn't know the tag.

From now on, each step gets its own page in `src/steps/`, and `App.vue` just shows the current
step. That keeps every step's code around for me to review.

**Type this:** make `src/components/ClickCounter.vue`:
```vue
<template>
  <div class="mb-2">
    <button class="btn btn-primary" @click="count++">Clicked {{ count }} times</button>
  </div>
</template>

<script>
export default {
  data() {
    return { count: 0 }
  }
}
</script>
```
Make `src/steps/Step2.vue`:
```vue
<template>
  <div class="container mt-5">
    <h2>Three counters</h2>
    <ClickCounter />
    <ClickCounter />
    <ClickCounter />
  </div>
</template>

<script>
import ClickCounter from '../components/ClickCounter.vue'

export default {
  components: { ClickCounter }
}
</script>
```
Copy your step 1 `App.vue` to `src/steps/Step1.vue` (so you keep it). Then replace **all** of
`App.vue` with:
```vue
<template>
  <Step2 />
</template>

<script>
import Step2 from './steps/Step2.vue'

export default {
  components: { Step2 }
}
</script>
```
Line by line:
- `import ClickCounter from '../components/ClickCounter.vue'`: `..` means "go up one folder"
  (from `steps/` to `src/`), then into `components/`.
- `components: { ClickCounter }`: register it in this parent. It's short for
  `{ ClickCounter: ClickCounter }`.
- `<ClickCounter />`: use it. In `.vue` files, PascalCase names and self-closing `/>` are fine.
  `<click-counter></click-counter>` would also work.

**Try:** click each button. They count **separately**, because `data()` runs once per counter
and returns a new object each time.

**Your turn:**
1. Add a Reset button inside `ClickCounter.vue` that sets **its own** count back to 0.
2. Experiment: delete `ClickCounter` from `components: { }` (leave the import). Read the Console
   warning ("Failed to resolve component..."). Put it back. That warning will show up in your
   project whenever you forget to register something.

From now on, each step means: make `src/steps/StepN.vue`, then change the two `Step2`s in `App.vue`
to `StepN` (in the import and in `components`, plus the tag).

---

## Step 3 — Props: passing data INTO a component

**Learn:** **props** let the parent hand data to the child, like passing `src` to an `<img>`.
1. The child lists the props it accepts: `props: ['name', 'price']`
2. The parent passes them as attributes: `<FruitRow name="Apple" :price="40" />`
3. Inside the child, a prop works like data: `{{ name }}`, `this.name`

Without `:` the value is plain text. With `:` (v-bind from 01a) it's JavaScript:
```html
<FruitRow name="Apple" />        <!-- the string "Apple" -->
<FruitRow :price="40" />         <!-- the number 40 -->
<FruitRow :name="special" />     <!-- the value of the parent's variable special -->
```

**Type this:** `src/components/FruitRow.vue`:
```vue
<template>
  <div class="mb-2">
    {{ name }}: Rs {{ price }} x {{ qty }} = Rs {{ price * qty }}
    <button class="btn btn-sm btn-success" @click="qty++">+</button>
  </div>
</template>

<script>
export default {
  props: ['name', 'price'],   // handed in by the parent
  data() {
    return { qty: 0 }         // the component's OWN data
  }
}
</script>
```
`src/steps/Step3.vue`:
```vue
<template>
  <div class="container mt-5">
    <FruitRow name="Apple" :price="40" />
    <FruitRow name="Mango" :price="60" />
    <FruitRow :name="special" :price="100" />
    <button class="btn btn-outline-secondary" @click="special = 'Kiwi'">Change special</button>
  </div>
</template>

<script>
import FruitRow from '../components/FruitRow.vue'

export default {
  components: { FruitRow },
  data() {
    return { special: 'Dragon fruit' }
  }
}
</script>
```
Point `App.vue` at `Step3`.

**Try:** click "Change special". The third row updates, because props are reactive. When the
parent's data changes, the child gets the new value.

**Your turn:**
1. Remove the `:` from `:price="40"` (make it `price="40"`) and click `+`. The multiplication still
   works. Now change the template to show `{{ price + 1 }}`. Explain what you see
   (hint: `"40" + 1` in JS). Put the `:` back.
2. Add a third prop, `stock`, and disable the `+` button when `qty >= stock`.

**Remember:** `props` = handed in by the parent. `data()` = the component's own.

---

## Step 4 — `v-for` over a component, passing a whole object

**Learn:** you'll almost never write components out one by one like step 3. The data lives in an
array in the parent, and you `v-for` over the component. You can pass a whole object as **one** prop.

**Type this:** `src/components/FruitCard.vue`:
```vue
<template>
  <div class="card mb-2">
    <div class="card-body">
      <h5 class="card-title">{{ fruit.name }}</h5>
      <p class="card-text">Rs {{ fruit.price }}, {{ fruit.stock }} left</p>
    </div>
  </div>
</template>

<script>
export default {
  props: ['fruit']            // one prop: the whole object
}
</script>
```
`src/steps/Step4.vue`:
```vue
<template>
  <div class="container mt-5">
    <FruitCard v-for="f in fruits" :key="f.id" :fruit="f" />
  </div>
</template>

<script>
import FruitCard from '../components/FruitCard.vue'

export default {
  components: { FruitCard },
  data() {
    return {
      fruits: [
        { id: 1, name: 'Apple',  price: 40, stock: 10 },
        { id: 2, name: 'Mango',  price: 60, stock: 0  },
        { id: 3, name: 'Banana', price: 10, stock: 25 }
      ]
    }
  }
}
</script>
```
Read `:key="f.id" :fruit="f"` slowly: **`f` is one fruit from the loop**, and you pass it into the
child's prop called `fruit`. (This is where the 01a step 7 `books.id` bug would bite.)

**Your turn:**
1. Show a red `Sold out` badge (`<span class="badge bg-danger">`) in the card, only when stock is 0.
2. Add an "Add Kiwi" button in `Step4.vue` that pushes `{ id: 4, name: 'Kiwi', price: 80, stock: 3 }`
   into `fruits`. A new card appears. (Bonus: what happens if you click it twice? Check the Console.)

---

## Step 5 — `$emit`: the child tells the parent something happened

**Learn:** the most important rule in Vue components:

> **Props flow down, events flow up.**

The **parent owns the data**. A child must **never change a prop**. In Vue 3, props are
**read-only**, so Vue blocks it and warns you. Instead, the child **announces** what happened with
`this.$emit('event-name')`, and the parent **listens** with `@event-name="someMethod"` and makes the
change itself. In Vue 3 the child also lists the events it can send in **`emits: [ ]`**.

```
 parent (owns fruits)                      child (BuyCard)
   :fruit="f"   ───── data goes down ────>  shows fruit.name
   @buy="..."   <──── event goes up ──────  this.$emit('buy')
```

**Type this:** `src/components/BuyCard.vue`:
```vue
<template>
  <div class="card mb-2">
    <div class="card-body">
      <h5 class="card-title">{{ fruit.name }}</h5>
      <p class="card-text">{{ fruit.stock }} left</p>
      <button class="btn btn-success" @click="clickedBuy">Buy</button>
    </div>
  </div>
</template>

<script>
export default {
  props: ['fruit'],
  emits: ['buy'],                 // the events this component can send up
  methods: {
    clickedBuy() {
      this.$emit('buy')           // "hey parent, Buy was clicked!" That's ALL the child does.
    }
  }
}
</script>
```
`src/steps/Step5.vue`:
```vue
<template>
  <div class="container mt-5">
    <p>Items bought: {{ bought }}</p>
    <BuyCard v-for="f in fruits" :key="f.id" :fruit="f" @buy="onBuy" />
  </div>
</template>

<script>
import BuyCard from '../components/BuyCard.vue'

export default {
  components: { BuyCard },
  data() {
    return {
      bought: 0,
      fruits: [
        { id: 1, name: 'Apple',  stock: 10 },
        { id: 2, name: 'Mango',  stock: 0  },
        { id: 3, name: 'Banana', stock: 25 }
      ]
    }
  },
  methods: {
    onBuy() {                     // the PARENT makes the change
      this.bought++
    }
  }
}
</script>
```
**Try:** click Buy on any card. The parent's counter goes up.

**Experiment (then undo it):** inside `clickedBuy`, add `this.fruit = null`. Click Buy and read
the Console warning ("Attempting to mutate prop... Props are readonly"). This is the same mistake
as your old Vue 2 `step2.html`, where `increment()` did `this.initial_count += 1`.

**Your turn:** the counter goes up, but the fruit's stock doesn't go down, because the parent
doesn't know **which** fruit was bought. Think about how it could know. That's step 6.

---

## Step 6 — Emitting with data (the id)

**Learn:** `$emit` can send data along: `this.$emit('buy', this.fruit.id)`. The parent's method
receives it as an argument: `onBuy(id) { ... }`. Then the parent finds that item in its own array
and changes it. `find` returns the first item that matches:
```js
const fruit = this.fruits.find(f => f.id === id)   // the actual object in the array
fruit.stock--                                      // changing it updates the card (reactivity)
```

**Type this:**
- In `BuyCard.vue`, change the emit to `this.$emit('buy', this.fruit.id)`.
  (Step 5 still works: its `onBuy()` just ignores the id.)
- Copy `Step5.vue` to `Step6.vue` and change its method to:
```js
onBuy(id) {
  const fruit = this.fruits.find(f => f.id === id)
  fruit.stock--
  this.bought++
}
```
The template `@buy="onBuy"` stays the same. Vue passes the emitted value in automatically.
Point `App.vue` at `Step6`.

**Your turn:**
1. Disable the Buy button when `fruit.stock` is 0 (in the child template, `:disabled` from 01a).
2. Even with the button disabled, make `onBuy` refuse to go below 0. Like 01a step 4:
   never trust the button alone.
3. Add a `Return` button that emits `return-item` with the id (add it to `emits` too), and have the
   parent add 1 back to the stock. Write event names in **kebab-case** in templates
   (`@return-item`). That's the Vue convention.

---

## Step 7 — What Vite actually gives the browser

**Learn:** `npm run dev` is only for while you work. To produce real files a server can hand out,
you **build**:
```bash
# stop the dev server first (Ctrl+C), then:
npm run build      # makes dist/: index.html + assets/*.js + assets/*.css
npm run preview    # serves dist/ so you can check it (http://localhost:4173)
```
Open `dist/assets/` and look at the `.js` file. Your `.vue` files are gone. They've been turned
into one plain (minified) JS file, which is the only thing a browser understands.
Search it for `Banana` to find your data.

In your project, Flask will be the backend (an API that sends JSON), and this Vite app will be the
frontend that calls it. Lesson 05 shows how the two talk to each other.

**Your turn:** in `ANSWERS.md`, explain in 2–3 sentences why you can't just double-click `App.vue`
or open it with `python3 -m http.server` the way you did in 01a.

---

## Step 8 — Bug hunt (reading, not running)

Find the **4 bugs** in this component by reading only. Spotting bugs by eye is a viva skill.
Write the answers in `ANSWERS.md`.

```vue
<template>
  <div>
    <input v-model="newIssue">
    <button @click="addTicket()">Add</button>
  </div>
</template>

<script>
export default {
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
  }
}
</script>
```
(Hints: one is a syntax error, one is step 1's rule, one calls something that doesn't exist,
and one breaks step 5's rule.)

---

## Mini-project — reading-session board

No example this time. Use steps 0–6. Make a **new** Vite project next to `fruit-shop`, called
`session-board` (repeat step 0 on your own, including the cleanup and Bootstrap).

Requirements:
1. `App.vue` holds `sessions`: at least 4 objects with
   `id, title, host, date, capacity, booked` (write the data yourself).
2. `src/components/SessionCard.vue` is imported and registered in `App.vue`.
3. Render one `<SessionCard>` per session using `v-for` with a correct `:key`.
4. `SessionCard` gets the session through **one** prop and shows title, host, date and
   "seats left" (capacity − booked) in a Bootstrap card.
5. A **Book** button in the card emits `book` with the session id (declared in `emits`).
   The **parent** increases `booked`.
6. When a session is full, the button is disabled and a red "Full" badge appears.
7. Above the board, the parent shows "Total seats left: N" (a loop or `reduce` over sessions).

**Stretch:**
- A **Cancel** button that emits `cancel`. `booked` can never go below 0.
- Use the object form of props: `props: { session: { type: Object, required: true } }`.
  Then leave out `:session` on purpose and read the Console warning.

## Viva questions (answer them in `ANSWERS.md` in your own words)
1. Why must `data` be a function in a component? (Think about step 2's three counters.)
2. What goes wrong if the child does `this.session.booked++` itself instead of emitting?
   (Careful: Vue does **not** warn about this one. Try it, then explain why that's still wrong.)
3. What is `:key` for in `v-for`? Why is using the array index risky when items get deleted?
4. What's the difference between `v-if` and `v-show`? (Look it up, try both, then check the
   Elements tab in F12 for what changes.)
5. What do `npm run dev` and `npm run build` each do? Which folder must never go in your zip, and why?
6. What does `components: { SessionCard }` do, and what happens if you forget it?

When done, tell me **"check lesson 01b"**.

## Quick-reference card

| You write | Where | Meaning |
|---|---|---|
| `createApp(App).mount('#app')` | `main.js` | start the app (Vue 2: `new Vue`) |
| `export default { ... }` | `<script>` of a `.vue` file | this file's component |
| `data() { return {...} }` | any component | its own data, a fresh copy per use |
| `import X from './X.vue'` + `components: { X }` | parent | make `<X />` usable |
| `props: ['x']` | child | accept data from the parent |
| `<X :x="value" />` | parent | pass data down |
| `emits: ['evt']` + `this.$emit('evt', data)` | child | send an event up |
| `<X @evt="method" />` | parent | listen; `method(data)` gets the value |
| `list.find(i => i.id === id)` | parent | get the item to change |
| `npm run dev` / `npm run build` | terminal | work with hot reload / make `dist/` |

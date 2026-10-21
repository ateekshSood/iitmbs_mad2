# Lesson 01a — Vue 2 from scratch

> **Vue 3 note (Oct 2026):** the course now uses Vue 3 + Vite. Everything in this lesson's
> templates (`{{ }}`, `@click`, `v-bind`, `:class`, `v-if`, `v-for`, `v-model`) and the
> `data`/`methods` options works the same in Vue 3. Only the start-up changes:
> `new Vue({ el, data: {...} })` becomes `createApp({ data() { return {...} } }).mount('#app')`,
> and `data` is always a function. Lesson 01b shows the Vue 3 + Vite way from scratch.

Eight small steps. Each step has:
- **Learn:** the idea, in plain words
- **Type this:** a complete working example. Type it yourself (don't copy-paste; typing is how it sticks)
- **Your turn:** one small change you make on your own

Make one file per step: `step1.html`, `step2.html`, ... in this folder.

### How to open your file
From this folder, in the WSL terminal:
```bash
python3 -m http.server 8000
```
Then open http://localhost:8000/step1.html in your Windows browser. Leave that terminal
running, and after each edit just refresh the page.

**Press F12 → Console tab.** Vue prints its errors there. If the page looks blank or broken,
the Console tells you why. Look there first, every time.

---

## Step 1 — Your first Vue page

**Learn:** Vue is a JavaScript library. You load it with a `<script>` tag, then tell it:
"control this `<div>`, and here is my data". Anything inside `{{ }}` in that div gets replaced
with the value of the data. When the data changes, the page updates by itself. That
automatic updating is called **reactivity**, and it's the whole point of Vue.

**Type this** in `step1.html`:
```html
<!DOCTYPE html>
<html>
<head>
  <title>Step 1</title>
  <!-- 1. load Vue 2 from the internet (a CDN) -->
  <script src="https://cdn.jsdelivr.net/npm/vue@2.7.16/dist/vue.js"></script>
</head>
<body>

  <!-- 2. the part of the page Vue will control -->
  <div id="app">
    <h1>{{ message }}</h1>
    <p>My city is {{ city }}</p>
  </div>

  <script>
    // 3. create a Vue app
    const app = new Vue({
      el: '#app',            // "control the element with id=app"
      data: {                // the variables the page can use
        message: 'Hello Vue!',
        city: 'Chennai'
      }
    });
  </script>

</body>
</html>
```

**Try:** open the page. Then in the F12 Console type `app.city = 'Delhi'` and press Enter.
The page changes without a reload. That's reactivity.

**Your turn:** add two variables, `name` and `age`, and show "I am NAME and I am AGE years old".
Then add one line that shows your age next year: `{{ age + 1 }}`. (Yes, `{{ }}` can hold small bits of JS.)

---

## Step 2 — Methods and clicks (`@click`)

**Learn:** `methods` are functions your page can call. `@click="doSomething"` runs a method
when the element is clicked. Inside a method, you reach your data through `this`
(`this.count`, not plain `count`).

**Type this** in `step2.html` (same skeleton as step 1, only the `<div>` and `<script>` change):
```html
<div id="app">
  <h1>{{ count }}</h1>
  <button @click="increase">+</button>
</div>

<script>
  new Vue({
    el: '#app',
    data: {
      count: 0
    },
    methods: {
      increase() {
        this.count = this.count + 1;
      }
    }
  });
</script>
```

**Your turn:**
1. Add a `-` button with a `decrease` method.
2. Make `decrease` do nothing when count is already 0 (use an `if`).
3. Add a `Reset` button that sets count back to 0.

---

## Step 3 — Bootstrap (making it look decent)

**Learn:** Bootstrap is a ready-made CSS library. You add one `<link>` tag, then give
elements class names like `btn btn-primary`, and they get styled. The project requires
Bootstrap for all styling. It isn't Vue, just CSS classes.

**Type this:** copy `step2.html` to `step3.html` and add this line inside `<head>`:
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
```
Then change the HTML to use Bootstrap classes:
```html
<div id="app" class="container mt-5 text-center">
  <h1 class="display-1">{{ count }}</h1>
  <button class="btn btn-success" @click="increase">+</button>
</div>
```
- `container` = centred page width, `mt-5` = margin-top size 5, `text-center` = centre the text
- `btn` = make it a button, `btn-success` = green (`btn-danger` red, `btn-secondary` grey, `btn-primary` blue)

**Your turn:** make `-` red, `Reset` grey, and add some space between the buttons
(look up `mx-2` on https://getbootstrap.com/docs/5.3/utilities/spacing/).

---

## Step 4 — `v-bind` (`:`): putting data INTO attributes

**Learn:** `{{ }}` only works *between* tags. To use a variable *inside* an attribute
(`src`, `href`, `disabled`, ...), put a `:` in front of the attribute name.

```html
<img src="photoUrl">     <!-- WRONG: looks for a file literally named "photoUrl" -->
<img :src="photoUrl">    <!-- RIGHT: uses the value of the variable photoUrl -->
```
The `:` means "what's inside the quotes is JavaScript, not text". (`:src` is short for `v-bind:src`.)

This is **one-way binding**: data → page. The page never changes the data.

**Type this:** copy step 3 to `step4.html`. Add `max: 5` to data, and change the `+` button:
```html
<button class="btn btn-success" @click="increase" :disabled="count >= max">+</button>
<p>Maximum is {{ max }}</p>
```
Click `+` five times: the button greys out, because `count >= max` became `true`.
Then type `app.max = 10` in the Console (add `const app =` in front of `new Vue`) and watch it re-enable.

**Your turn:** disable the `-` button when count is 0. Now you can remove the `if` from
step 2's `decrease`... or can you? (Think: what if someone calls `decrease()` from the Console?)

---

## Step 5 — `:class`: switching CSS classes on and off

**Learn:** `:class` is `v-bind` for the `class` attribute, with a special form:
```html
<h1 :class="{ 'text-danger': count >= max }">{{ count }}</h1>
```
Read it as: **add the class `text-danger` IF `count >= max` is true.**
- count is 2 → `<h1 class="">` (normal)
- count is 5 → `<h1 class="text-danger">` (red text)

You can list several classes, each with its own condition:
```html
<h1 :class="{ 'text-danger': count >= max, 'text-muted': count === 0 }">
```

**Type this:** copy step 4 to `step5.html` and add the first `:class` line to your `<h1>`.
Click up to the max and the number turns red.

**Your turn:** make the number grey (`text-muted`) when it's 0, normal in between, and red at max.

---

## Step 6 — `v-if` / `v-else`: showing and hiding elements

**Learn:** `v-if="condition"` puts the element on the page only when the condition is true.
`v-else` must come right after a `v-if` element and shows when the condition is false.

**Type this** (`step6.html`, continuing from step 5):
```html
<p v-if="count >= max" class="alert alert-warning">You reached the limit!</p>
<p v-else>You can still add {{ max - count }} more.</p>
```

**Your turn:** add a third message, "Start clicking!", shown only when count is 0.
(Look up `v-else-if`.)

---

## Step 7 — `v-for`: showing a list

**Learn:** `v-for` repeats an element once for each item in an array. Every repeated element
needs a unique `:key` so Vue can track which is which (use an id, never the position).

**Type this** in a fresh `step7.html` (with Vue + Bootstrap in the head):
```html
<div id="app" class="container mt-5">
  <h2>Books</h2>
  <ul class="list-group">
    <li v-for="book in books" :key="book.id" class="list-group-item">
      {{ book.title }} by {{ book.author }}
    </li>
  </ul>
  <p>Total: {{ books.length }} books</p>
</div>

<script>
  new Vue({
    el: '#app',
    data: {
      books: [
        { id: 1, title: 'Wings of Fire', author: 'A.P.J. Abdul Kalam' },
        { id: 2, title: 'The Guide', author: 'R.K. Narayan' },
        { id: 3, title: 'Malgudi Days', author: 'R.K. Narayan' }
      ]
    }
  });
</script>
```

**Your turn:**
1. Give each book a `copies` number (make one of them 0).
2. Show "Out of stock" as a red Bootstrap badge (`<span class="badge bg-danger">`) using `v-if`,
   but only for books with 0 copies.
3. Add a "Borrow" button on each row that runs `borrow(book)` and reduces that book's copies by 1.
   (Yes, you can pass arguments: `@click="borrow(book)"`.) Disable it when copies is 0.

---

## Step 8 — `v-model`: two-way binding with inputs

**Learn:** `v-model` connects an input to a variable **in both directions**:
- typing in the input changes the variable, and
- changing the variable changes what's in the input.

That's **two-way binding**. (Compare step 4's `:disabled`, which is one-way.) You use
`v-model` only on form elements: `input`, `textarea`, `select`, and checkboxes.

**Type this:** copy step 7 to `step8.html`, add `newTitle: ''` to data, and add above the list:
```html
<input v-model="newTitle" class="form-control mb-2" placeholder="Book title">
<p>You are typing: {{ newTitle }}</p>
<button class="btn btn-primary mb-3" @click="addBook">Add book</button>
```
And in methods:
```js
addBook() {
  this.books.push({ id: Date.now(), title: this.newTitle, author: 'Unknown', copies: 1 });
  this.newTitle = '';          // clears the input, because of two-way binding!
}
```
Type something and watch the "You are typing" line follow you (input → data). Click Add and
the input empties (data → input). That's both directions.

**Your turn:**
1. Add a second input for the author.
2. Don't add the book if the title is empty (show a red message with `v-if` instead).
3. Make pressing Enter in the input also add the book: `@keyup.enter="addBook"`.

---

## Final mini-project — `todo.html`

No example this time. Use steps 1–8. Build a to-do list:
1. An input and an Add button. Adding pushes `{ id, text, done: false }` into a `todos` array.
   Empty text is not allowed.
2. Show the todos in a Bootstrap `list-group` with `v-for`.
3. Each todo has a checkbox with `v-model="todo.done"`. When done, the text is crossed out
   (`:class` with Bootstrap's `text-decoration-line-through`).
4. Each todo has a red Delete button. (Hint: to remove an item from an array, look up `filter`.)
5. Show "No tasks yet" when the list is empty, and "2 of 5 done" at the top.

When it works, tell me **"check lesson 01a"** and I'll review your steps and the to-do app.
Then lesson 01b (components) builds on all of this.

## Quick-reference card

| You write | Meaning | Direction |
|---|---|---|
| `{{ x }}` | show x as text | data → page |
| `:attr="x"` (`v-bind`) | put x into an attribute | data → page (one-way) |
| `:class="{ c: cond }"` | add class c when cond is true | data → page |
| `@click="m"` (`v-on`) | run method m on click | page → your code |
| `v-model="x"` | link an input and x | both ways (two-way) |
| `v-if` / `v-else-if` / `v-else` | show only if true | — |
| `v-for="i in list" :key="i.id"` | repeat for each item | — |

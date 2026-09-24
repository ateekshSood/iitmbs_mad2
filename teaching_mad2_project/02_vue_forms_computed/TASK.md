# Lesson 02 — Forms, v-model, computed, watch

Copy your lesson 01 code into this folder and extend it.

## Concepts

**v-model** is two-way binding between an input and a data property:
```html
<input v-model.trim="form.title">          <!-- .trim removes spaces -->
<input type="number" v-model.number="form.capacity">   <!-- .number gives a Number, not a String -->
<select v-model="filterHost"> ... </select>
```

**computed** holds values *derived* from other data. They're cached and only recalculate when
something they depend on changes:
```js
computed: {
  fullSessions() { return this.sessions.filter(s => s.booked >= s.capacity) }
}
```
Use it in the template like data: `{{ fullSessions.length }}` (no brackets).

**watch** runs a side effect whenever a value changes (saving, logging, calling an API):
```js
watch: {
  search(newVal, oldVal) { console.log('search changed', oldVal, '→', newVal) }
}
```
Rule of thumb: need a *value* → computed. Need to *do something* → watch.

## Task

1. **Add-session form** (Bootstrap form) with title, host, date (`type="date"`) and capacity.
   - On submit (`@submit.prevent`), push a new session with a unique id and `booked: 0`.
   - Frontend validation: HTML5 `required`, `min="1"` on capacity, **plus** a JS check that
     the date is not in the past. Show errors in a Bootstrap `alert-danger`.
   - Clear the form after a successful add.
2. **Search + filter bar**
   - A text box that matches the title (case-insensitive) and a dropdown to filter by host.
   - The dropdown options come from a computed list of *unique* hosts (don't hard-code them).
   - The board renders a computed `filteredSessions`, not `sessions`.
3. **Stats line**: "Showing X of Y sessions · Z full", all from computed properties.
4. **watch**: whenever `sessions` changes, save it to `localStorage`. On page load, read it back
   if it's there. (Hint: you need `deep: true` — find out why.)

## Stretch
- A "Sort by date" toggle.
- Turn the form into its own component that emits `created` with the new session object.

## Viva questions (`ANSWERS.md`)
1. Computed vs method — both can return `filteredSessions`. What's the difference?
2. Why does `v-model` on a number input give you a string without `.number`?
3. Why did the watcher need `deep: true`?
4. Frontend validation exists, so why must the backend validate too?

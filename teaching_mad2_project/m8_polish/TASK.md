# Module 8 — Final Polish (do this while building your project)

**State management (Pinia): skipped.** You don't need it, and it isn't on the project's allowed
list. Ask your teacher if you want to be sure. You already share login state across pages with
`localStorage` plus the `$route` watch in `App.vue` (Modules 2 and 4), and every page loads its own
data from the API. That *is* your state management, and you can explain it in the viva in one sentence.

There's no lesson here. Use this as a checklist on your exam portal once the features work:

**Frontend validation** (the statement asks for it)
- [ ] `required`, `type="email"`, `type="date"`, `min`/`max` on every form input
- [ ] Extra checks in the submit method (password match, end date after start date), with a red
      message and `return` before calling the API
- [ ] The backend **still** validates everything (Module 3)

**Feedback**
- [ ] A loading state on every page that fetches (`loading` + `v-if`, or a Bootstrap spinner:
      `<div class="spinner-border"></div>`)
- [ ] Buttons disabled while saving: `:disabled="saving"` and `{{ saving ? 'Saving...' : 'Save' }}`
- [ ] Success/error messages after every action (Bootstrap `alert alert-success` / `alert-danger`)
- [ ] `confirm('Are you sure?')` before cancel and delete

**Looks** (Bootstrap only, no other CSS framework)
- [ ] A navbar that changes by role, and cards/tables with consistent spacing
- [ ] It works on a phone-width window (Bootstrap's `row`/`col-md-*` grid)

**Optional extras from the statement**
- [ ] Chart.js charts on the admin dashboard (allowed). Ask me for a short lesson when you get there.
- [ ] Email notification when results are published (reuse `send_mail` + `.delay()`)

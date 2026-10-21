# Module 6 — The Background Worker (Celery & Redis)

Slow jobs (building a CSV, sending emails) shouldn't make the user wait. Flask hands the job to
**Celery**, answers straight away, and Celery does the work in the background. Here you build the
project's **user-triggered async CSV export**, including the "alert once completed" part.

Answer the viva questions in `m6_celery/ANSWERS.md`.

**Fixes to your teacher's Module 6 notes:**
- `Celery(app.name, broker=...)` on its own gives you tasks that **can't use the database**
  ("Working outside of application context"). Step 1 uses the pattern from Flask's own docs,
  which runs every task inside the Flask app.
- The notes never show how to **run** the worker. You need a separate terminal for it (step 2).

---

## Step 1 — Who does what

**Learn:**
- **Flask** (the waiter) takes the request, puts a **job message** on a queue, and answers at once.
- **Redis** (the ticket rack) is the **broker**: the queue where job messages wait. Here it's also the
  **result backend**, where finished jobs leave their result and status.
- The **Celery worker** (the chef) is a **separate process** that takes jobs off the queue and runs them.
- `my_task.delay(args)` = "put this job on the queue". It returns immediately with a **task id**.

If the worker isn't running, jobs just wait in Redis. They aren't lost, and they run once a worker starts.

**Type this:** `backend/celery_app.py`:
```python
from celery import Celery, Task


def celery_init_app(app):
    class FlaskTask(Task):
        def __call__(self, *args, **kwargs):
            with app.app_context():
                return self.run(*args, **kwargs)

    celery_app = Celery(app.name, task_cls=FlaskTask)
    celery_app.config_from_object(app.config["CELERY"])
    celery_app.set_default()
    app.extensions["celery"] = celery_app
    return celery_app
```
- `FlaskTask` wraps every task in `with app.app_context():`, so tasks can use `db` and models like
  your routes do.
- `config_from_object(app.config["CELERY"])` reads Celery's settings from Flask's config.

In `app.py`: `from celery_app import celery_init_app`, add the config:
```python
app.config["CELERY"] = {
    "broker_url": "redis://localhost:6379/0",
    "result_backend": "redis://localhost:6379/0",
    "timezone": "Asia/Kolkata",
}
```
call `celery_init_app(app)` after `cache.init_app(app)`, and at the bottom of the file, under
`app = create_app()`:
```python
celery_app = app.extensions["celery"]
```
(The worker command in step 2 looks for `app.celery_app`, meaning this variable in `app.py`.)

`backend/tasks.py`:
```python
from celery import shared_task


@shared_task
def add(x, y):
    return x + y
```
`@shared_task` makes a task that belongs to whichever Celery app is set as default (ours, via
`set_default()`). That avoids circular imports between `app.py` and `tasks.py`.

In `routes.py`, add `import tasks` with the other imports. Importing the file is what registers its
tasks, for both Flask and the worker.

---

## Step 2 — Run a worker and send it a job

You now need **three terminals**, all in `backend/` with the venv activated:

| Terminal | Command |
|---|---|
| 1 | `python app.py` (Flask) |
| 2 | `celery -A app.celery_app worker --loglevel=info` (the worker) |
| 3 | for curl / tests |

(Redis must be running: `sudo service redis-server start`.)

In terminal 2, look at the start-up output: under `[tasks]` it should list `tasks.add`.

In terminal 3:
```bash
python -c "from app import app; from tasks import add; r = add.delay(2, 3); print(r.id); print(r.get(timeout=10))"
```
Terminal 2 logs `Task tasks.add[...] received` and `succeeded ... 5`.

**Important:** the worker does **not** auto-reload like Flask's debug mode. **After every change
to `tasks.py`, stop the worker (Ctrl+C) and start it again.** This catches everyone at least once.

**Your turn:** stop the worker, run the `python -c` line (it waits, then times out), and start the
worker again. Does the job run? What does that tell you about where the job was waiting?

---

## Step 3 — The CSV export job

**Learn:** the flow the project wants:
1. The member clicks "Export" → `POST /api/exports` → Flask calls `.delay()` and returns the
   **task id** at once (status 202, "Accepted, working on it").
2. Vue asks `GET /api/tasks/<id>` every second ("are you done?"). That's called **polling**.
3. When the state is `SUCCESS`, Vue shows "Export ready" and a Download button.

Python's built-in `csv` module writes CSV. `StringIO` is a "file" that lives in memory.

**Type this:** add to `tasks.py`:
```python
import csv
import os
from io import StringIO

from extensions import db
from models import User
```
```python
@shared_task
def export_bookings_csv(user_id):
    user = db.session.get(User, user_id)
    out = StringIO()
    writer = csv.writer(out)
    writer.writerow(["Booking ID", "Session", "Host", "Date", "Status"])
    for b in user.bookings:
        writer.writerow([b.id, b.session.title, b.session.host, b.session.date, b.status])
    filename = f"bookings_user{user_id}.csv"
    os.makedirs("exports", exist_ok=True)
    with open(os.path.join("exports", filename), "w", newline="") as f:
        f.write(out.getvalue())
    return filename
```
The task gets the **user id**, not the User object. Arguments travel through Redis as JSON, so
they must be plain values.

In `routes.py`: `from celery.result import AsyncResult` and `from flask import request, send_from_directory`, then:
```python
class ExportResource(Resource):
    @role_required("member")
    def post(self):
        job = tasks.export_bookings_csv.delay(int(get_jwt_identity()))
        return {"task_id": job.id}, 202


class TaskStatusResource(Resource):
    @jwt_required()
    def get(self, task_id):
        result = AsyncResult(task_id)
        return {"state": result.state, "result": result.result if result.successful() else None}
```
(`jwt_required` needs importing from `flask_jwt_extended` too.) Register them, and add a plain
download route inside `register_routes`:
```python
api.add_resource(ExportResource, "/api/exports")
api.add_resource(TaskStatusResource, "/api/tasks/<task_id>")

@app.route("/api/exports/<filename>")
@jwt_required()
def download_export(filename):
    return send_from_directory("exports", filename, as_attachment=True)
```
- `AsyncResult(task_id)` looks the job up in the result backend. `state` is `PENDING`, `STARTED`,
  `SUCCESS` or `FAILURE`.
- `send_from_directory` sends a file safely. It refuses paths like `../app.py`.

**Restart the worker** (tasks.py changed!).

---

## Step 4 — Frontend: Export button + polling + download

**Type this:** in your `MyBookingsView.vue`, add `exportMsg: '', exportFile: ''` to data and these methods:
```js
async startExport() {
  const data = await api('/exports', { method: 'POST' })
  this.exportMsg = 'Export started...'
  const timer = setInterval(async () => {
    const status = await api(`/tasks/${data.task_id}`)
    if (status.state === 'SUCCESS') {
      clearInterval(timer)
      this.exportFile = status.result
      this.exportMsg = 'Export ready!'
    } else if (status.state === 'FAILURE') {
      clearInterval(timer)
      this.exportMsg = 'Export failed'
    }
  }, 1000)
},
async download() {
  const token = localStorage.getItem('access_token')
  const response = await fetch(`http://localhost:5000/api/exports/${this.exportFile}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const blob = await response.blob()
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = this.exportFile
  link.click()
},
```
and in the template, above the list:
```html
<button class="btn btn-outline-primary mb-3" @click="startExport">Export as CSV</button>
<span class="ms-2">{{ exportMsg }}</span>
<button v-if="exportFile" class="btn btn-link" @click="download">Download</button>
```
- `setInterval(fn, 1000)` runs `fn` every second until `clearInterval(timer)` stops it.
- `download()` uses raw `fetch` because the answer is a **file**, not JSON: `response.blob()` gives
  its bytes. The made-up `<a download>` link with `click()` makes the browser save it. A plain link
  wouldn't work, because it can't send the `Authorization` header.

**Try:** click Export. Watch terminal 2 run the job, the message change, then Download.
Open the CSV in Excel.

**Your turn:** add `import time` and `time.sleep(5)` at the start of the task, restart the worker,
and export again. The page stays usable while you wait. **That** is the point of Celery. Remove the
sleep afterwards.

## Viva questions (`ANSWERS.md`)
1. Why not just build the CSV inside the Flask route?
2. What are the broker and the result backend? Which one does `AsyncResult` read from?
3. What does `.delay()` return, and when?
4. Why does the task take `user_id` and not the `User` object?
5. What is the app context, and why does `FlaskTask` need it?
6. What happens to jobs sent while the worker is stopped?
7. Why does the download use `fetch` + blob instead of a normal link?

When done, say **"check module 6"**.

## In your exam portal this becomes...
"Export examination history as CSV" from the student dashboard, with the statement's columns
(student id, exam, course, date, examiner, marks, status). Module 7 adds the email when it's done.

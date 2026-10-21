# Module 7 — The Visual Report (email + scheduled jobs)

The project needs **three** Celery jobs. Module 6 built the CSV export. Here you add email and the
two **scheduled** jobs:

| Project job | Library Hub version |
|---|---|
| a. Daily reminder (email / Google Chat / SMS) | Email members whose session is tomorrow |
| b. Monthly HTML report to the admin | Stats in a Jinja HTML email on the 1st of every month |
| c. CSV export + alert when done | Module 6, plus emailing the CSV (step 2) |

Answer the viva questions in `m7_reports_mail/ANSWERS.md`.

**Fix to your teacher's Module 7 notes:** the beat example uses `crontab` without importing it
(`from celery.schedules import crontab`), and never says that beat is **another process** you have
to run (step 5).

---

## Step 0 — Start MailHog

MailHog is a fake mail server: it accepts every email and shows it in a web page, so nothing is
really sent. In a new terminal:
```bash
~/mailhog
```
SMTP is on port **1025** (your code sends there), and the inbox is at http://localhost:8025.

---

## Step 1 — Sending email with `smtplib` (built into Python)

**Type this:** `backend/mailer.py`:
```python
import smtplib
from email.message import EmailMessage


def send_mail(to, subject, text, html=None, attachment=None):
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = "noreply@libraryhub.local"
    msg["To"] = to
    msg.set_content(text)
    if html:
        msg.add_alternative(html, subtype="html")
    if attachment:
        filename, data = attachment
        msg.add_attachment(data.encode(), maintype="text", subtype="csv", filename=filename)
    with smtplib.SMTP("localhost", 1025) as s:
        s.send_message(msg)
```
- `set_content(text)`: the plain-text body. `add_alternative(html, ...)` adds an HTML version that
  mail apps show instead.
- `attachment=("name.csv", "csv text")`: a tuple. `.encode()` turns text into bytes.
- `smtplib.SMTP("localhost", 1025)`: connect to MailHog. In real life this would be Gmail's SMTP with
  a password, which is why we test with MailHog.

Test it: `python -c "from mailer import send_mail; send_mail('me@x.in', 'Hi', 'It works')"` and
check http://localhost:8025.

---

## Step 2 — Email the CSV when the export finishes

**Type this:** in `tasks.py`, `from mailer import send_mail`, and in `export_bookings_csv`, just before
`return filename`:
```python
send_mail(user.email, "Your bookings export", "Your CSV is attached.",
          attachment=(filename, out.getvalue()))
```
Restart the worker, export from Vue, and the CSV arrives in MailHog as an attachment.

---

## Step 3 — Daily reminders task

**Type this:** in `tasks.py` (add `from datetime import date, timedelta` and `ReadingSession` to the
models import):
```python
@shared_task
def daily_reminders():
    tomorrow = date.today() + timedelta(days=1)
    sent = 0
    for s in ReadingSession.query.filter_by(date=tomorrow).all():
        for b in s.bookings:
            if b.status == "Booked":
                send_mail(b.member.email, f"Reminder: {s.title} is tomorrow",
                          f"Hi {b.member.username}, {s.title} with {s.host} is on {s.date}.")
                sent += 1
    return sent
```
`b.member` and `s.bookings` are the relationships from Module 3 doing the joins for you.

Test: make a session dated **tomorrow** (booking window including today), book it as a member,
restart the worker, then
`python -c "from app import app; from tasks import daily_reminders; print(daily_reminders.delay().get(timeout=10))"`.

---

## Step 4 — Monthly HTML report with a Jinja template

**Learn:** Jinja2 is allowed for this, because it's an email, not your UI. `render_template` looks in
`backend/templates/`. Celery tasks can use it thanks to `FlaskTask`'s app context.

**Type this:** `backend/templates/monthly_report.html`:
```html
<h2>Library Hub report for {{ month }}</h2>
<table border="1" cellpadding="6">
  <tr><th>Sessions</th><td>{{ stats.sessions }}</td></tr>
  <tr><th>Active bookings</th><td>{{ stats.bookings }}</td></tr>
  <tr><th>Members</th><td>{{ stats.members }}</td></tr>
</table>
```
In `tasks.py` (add `from flask import render_template`, and `Booking` to the models import):
```python
@shared_task
def monthly_report():
    admin = User.query.filter_by(role="admin").first()
    stats = {
        "sessions": ReadingSession.query.count(),
        "bookings": Booking.query.filter_by(status="Booked").count(),
        "members": User.query.filter_by(role="member").count(),
    }
    html = render_template("monthly_report.html", stats=stats, month=date.today().strftime("%B %Y"))
    send_mail(admin.email, "Library Hub monthly report", "Open this mail in HTML view.", html=html)
    return stats
```
Test it with `.delay().get(...)` the same way. In MailHog, open the mail and look at the HTML tab.

**Your turn:** add a "Most booked session" row to the report. Work out which session has the most
"Booked" bookings in Python (loop over sessions, count, keep the max).

---

## Step 5 — Celery Beat: running jobs on a schedule

**Learn:** **beat** is a separate process that acts as an alarm clock. At the scheduled times it puts
the job on the queue, and the **worker** still does the work. So scheduled jobs need **both**
running. `crontab(...)` describes when:

| `crontab(...)` | Runs |
|---|---|
| `crontab()` | every minute (good for testing) |
| `crontab(hour=18, minute=0)` | every day at 18:00 |
| `crontab(day_of_month=1, hour=8, minute=0)` | 08:00 on the 1st of each month |

**Type this:** in `app.py`, `from celery.schedules import crontab`, and add `beat_schedule` to the
`CELERY` config dict:
```python
"beat_schedule": {
    "daily-reminders": {"task": "tasks.daily_reminders", "schedule": crontab()},
    "monthly-report": {"task": "tasks.monthly_report", "schedule": crontab()},
},
```
(`crontab()` = every minute, **only for testing**.) The task name is `file.function`: `tasks.daily_reminders`.

Restart the worker, and in a **fourth** terminal (backend/, venv active):
```bash
celery -A app.celery_app beat --loglevel=info
```
Within a minute beat logs `Sending due task daily-reminders`, the worker runs it, and the mails show up
in MailHog. Then set the **real** schedules from the table above, and restart beat and the worker.
(Beat writes a `celerybeat-schedule` file. It's in your `.gitignore`.)

**Your turn:** what happens if beat runs but the worker is stopped? Try it for 2 minutes, then
start the worker again and watch.

## Your full run checklist (you'll need this in the viva demo)
1. `sudo service redis-server start`
2. `~/mailhog`
3. `python app.py` (backend/)
4. `celery -A app.celery_app worker --loglevel=info` (backend/)
5. `celery -A app.celery_app beat --loglevel=info` (backend/)
6. `npm run dev` (frontend/)

## Viva questions (`ANSWERS.md`)
1. Beat vs worker: what does each do? Can beat alone send a reminder?
2. What schedule does `crontab(day_of_month=1, hour=8, minute=0)` give?
3. Why MailHog instead of a real mail server while developing?
4. Why is Jinja OK in the report when the project says not to use Jinja for UI?
5. Walk through how the CSV export reaches the user's inbox, from button click to email.
6. Where do the reminder's member emails come from? Which relationships do you use?

When done, say **"check module 7"**.

## In your exam portal this becomes...
Daily reminder: exam name, date/time, examiner, instructions, sent to students with a booking tomorrow.
Monthly report to the admin: exams conducted, students evaluated, completed bookings, pending
evaluations, most active examiners.

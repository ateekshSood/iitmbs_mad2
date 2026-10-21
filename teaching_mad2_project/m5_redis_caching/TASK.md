# Module 5 — The Speed Boost (Redis caching)

The project needs caching "for frequently accessed data", **with expiry**. Here you cache the
sessions list, see the cache work, then hit the classic bug (stale data) and fix it.

Answer the viva questions in `m5_redis_caching/ANSWERS.md`.

---

## Step 0 — Start Redis

Redis doesn't start by itself in WSL. In any terminal:
```bash
sudo service redis-server start
redis-cli ping            # → PONG
```
`flask-caching` and `redis` are already installed (lesson 00).

---

## Step 1 — What a cache is (and isn't)

**Learn:** a cache is a **copy** of an answer, kept somewhere fast (Redis keeps everything in RAM) so
the next request can skip the slow work (the database query). Three facts the viva likes:
- It's a **copy**. The database stays the real source of truth. If you lost all of Redis, nothing
  is lost: the next request just goes to the database again.
- It lives **on the server** (in Redis), not in the user's browser.
- A **cache miss** (no copy yet) isn't an error and doesn't return an empty list. You just do the
  real work, then save a copy. That pattern is called **cache-aside**.

**Expiry (timeout)** means the copy deletes itself after N seconds, so it can't stay wrong forever.

---

## Step 2 — Set up Flask-Caching with Redis

**Type this:** in `extensions.py`:
```python
from flask_caching import Cache
```
```python
cache = Cache()
```
In `app.py`, import it (`from extensions import cache, db, jwt`), add the config:
```python
app.config["CACHE_TYPE"] = "RedisCache"
app.config["CACHE_REDIS_URL"] = "redis://localhost:6379/1"
app.config["CACHE_DEFAULT_TIMEOUT"] = 60
```
and after `jwt.init_app(app)`:
```python
cache.init_app(app)
```
The `/1` at the end of the URL is Redis database number 1. Celery will use 0 in Module 6, which keeps
the two apart.

---

## Step 3 — Cache the sessions list, and watch it work

**Type this:** in `routes.py`, import `cache` (`from extensions import cache, db`) and change
`SessionListResource.get` to:
```python
@cache.cached(timeout=60, key_prefix="sessions_list")
def get(self):
    print("sessions_list: reading from the DATABASE")
    sessions = ReadingSession.query.order_by(ReadingSession.date).all()
    return [s.to_dict() for s in sessions]
```
- `@cache.cached(...)`: before running `get`, check Redis for the key `sessions_list`. If it's there,
  return the copy **without running the function**. If not, run it and save the result for 60 seconds.
- `key_prefix` is the Redis key's name. You pick it so you can **delete** it later (step 4).

**Try:**
1. `curl localhost:5000/api/sessions` three times. The "reading from the DATABASE" line appears in
   the Flask terminal only **once**.
2. Look inside Redis:
```bash
redis-cli -n 1 keys '*'          # you'll see a key containing sessions_list
redis-cli -n 1 ttl <that key>    # seconds until it expires. Run it again and watch it count down
```
3. Wait 60 seconds, then curl again. The print is back (the copy expired).

---

## Step 4 — The stale-copy bug, and invalidation

**Try this first:** log in as a member in Vue, then book a session. The page reloads the list...
and `seats_left` **didn't change**. Refresh: still wrong. After up to 60 seconds it fixes itself.

**Why:** the booking changed the **database**, but the list came from the old **copy** in Redis.

**Fix (cache invalidation):** whenever data that's in the copy changes, delete the copy. The next
request rebuilds it from the database. Add this line just **after** `db.session.commit()` in every
place that changes sessions or seats:
```python
cache.delete("sessions_list")
```
That's 4 places: `SessionListResource.post`, `SessionResource.delete`, `BookingListResource.post`
(seats go down) and `BookingResource.delete` (seats go back up).

Book again: `seats_left` updates immediately, and the Flask terminal shows one database read.

**Your turn:** you also added `put` in Module 3. Does it need the line too? Add it if so.

---

## Step 5 — Manual caching: `cache.get` / `cache.set`

**Learn:** the decorator caches a whole response. Sometimes you want to cache one value. Then you
write cache-aside by hand:

**Type this:** a stats endpoint in `routes.py` (add `User` to the models import):
```python
class StatsResource(Resource):
    def get(self):
        stats = cache.get("stats")
        if stats is None:                       # cache miss
            print("stats: computing from the DATABASE")
            stats = {
                "sessions": ReadingSession.query.count(),
                "bookings": Booking.query.filter_by(status="Booked").count(),
                "members": User.query.filter_by(role="member").count(),
            }
            cache.set("stats", stats, timeout=30)
        return stats
```
Register it at `/api/stats` and curl it a few times.

This is the same thing `@cache.cached` does for you: look, miss, compute, store with expiry.

**Your turn:**
1. Should `/api/bookings` (my bookings) be cached with `key_prefix="my_bookings"`? Think about what
   ravi would see after mia's request. Write the answer in ANSWERS.md and **don't** cache it.
2. Stop Redis (`sudo service redis-server stop`) and curl `/api/sessions`. What happens? Start it again.
   (We'll discuss your answer in the review.)

## Viva questions (`ANSWERS.md`)
1. What is a cache? Where does this one live: in the browser or on the server?
2. Redis restarts and loses everything. What breaks? What's lost for good?
3. What happens on a cache miss?
4. Why do cached values need a timeout?
5. You booked a seat and the count didn't change. Explain why, and the fix.
6. Why must per-user data never be cached under one fixed key?
7. Why is Redis faster than SQLite for this?

When done, say **"check module 5"**.

## In your exam portal this becomes...
Cache the examinations list, slot schedules and rubrics (the statement names these three), with
timeouts, and `cache.delete(...)` wherever exams, slots or bookings change.

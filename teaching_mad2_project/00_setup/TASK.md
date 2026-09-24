# Lesson 00 — Environment setup

Right now none of the Flask/Celery packages are installed and Redis isn't on your machine.
Do this once; you'll reuse the same setup for the real project.

## 1. Python virtual environment

A venv is an isolated folder of Python packages, so your project's versions don't clash
with the system's.

```bash
cd ~/mad2_iitmbs/teaching_mad2_project
python3 -m venv .venv
source .venv/bin/activate          # run this in every new terminal
pip install flask flask-sqlalchemy flask-restful flask-jwt-extended flask-caching redis celery
pip freeze > requirements.txt
```

Add `.venv/` to the repo's `.gitignore` — never commit the venv.

### Using uv instead (recommended, since you already use it)

```bash
cd ~/mad2_iitmbs/teaching_mad2_project
uv init --bare                     # creates pyproject.toml only (no sample main.py)
uv add flask flask-sqlalchemy flask-restful flask-jwt-extended flask-caching redis celery
uv run python -c "import flask; print(flask.__version__)"
uv export --format requirements-txt --no-hashes > requirements.txt   # for people without uv
```
Run things with `uv run python app.py` and `uv run celery -A ... worker`, or run
`source .venv/bin/activate` once and use plain commands. Commit `pyproject.toml` and `uv.lock`.
For the real project, keep them inside `backend/`.

## 2. Redis (inside WSL)

```bash
sudo apt update && sudo apt install -y redis-server
sudo service redis-server start
redis-cli ping          # → PONG
```

Play with it:
```bash
redis-cli set hello world
redis-cli get hello
redis-cli setex temp 10 hi     # key that expires after 10 seconds
redis-cli ttl temp             # run a few times and watch it count down
```
That countdown is exactly how cache expiry works later.

## 3. MailHog (fake email inbox)

Celery jobs will send emails. MailHog accepts them on port 1025 and shows them in your
browser at http://localhost:8025. Nothing actually leaves your machine.

```bash
wget https://github.com/mailhog/MailHog/releases/download/v1.0.1/MailHog_linux_amd64 -O ~/mailhog
chmod +x ~/mailhog
~/mailhog
```

## 4. Git habits (they matter for grading)

The course checks your GitHub history as proof you wrote the code yourself.
- Commit small and often, with real messages ("add booking model", not "update").
- The real project repo must be **private**. Register it on Git Tracker (milestone 0).

## Done when

- [ ] `python -c "import flask, celery, flask_jwt_extended"` → no error (with the venv active)
- [ ] `redis-cli ping` → `PONG`
- [ ] MailHog UI opens at http://localhost:8025
- [ ] `requirements.txt` exists and `.venv/` is gitignored

## Self-check questions
1. What happens if you forget `source .venv/bin/activate` and then run `python app.py`?
2. Redis — database, cache, or message broker? (trick question: in this project it's used as two of them)

1. if i forget to do source then it would try to use the global env and may even crash since linux always instrucsts to make venv for specific project , the gloabl env may not have all the packages installed which i need 
for this particular project 
2. redis is basically a message broker or you can even take it as a cache , its can be considered a database but its main job is a cache and a message broker , it takes the async requests from teh backend , store em for sometime then give them to the celery workers to be executed as a message broker , as a cache  it can store small user realted data in the user's system itself so it dosent need to leave their system and provide very high speed since its in memory based . its too small to be used a proper database since its in memroy based which is limited.
# Lesson 04 — Flask basics (a JSON API)

No database yet — data lives in a Python list, so you can focus on HTTP.

## Concepts

```python
from flask import Flask, request, jsonify

app = Flask(__name__)
items = [{"id": 1, "name": "pen"}]

@app.route("/api/items", methods=["GET"])
def list_items():
    return jsonify(items), 200          # returning a dict or list also works in modern Flask

@app.route("/api/items/<int:item_id>", methods=["GET"])
def get_item(item_id):
    ...
    return {"message": "not found"}, 404

@app.route("/api/items", methods=["POST"])
def add_item():
    data = request.get_json()           # parsed JSON body, or None
    ...

if __name__ == "__main__":
    app.run(debug=True)
```

HTTP method meanings: **GET** read, **POST** create, **PUT/PATCH** update, **DELETE** remove.
Status codes to know: 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized (not logged in),
403 Forbidden (logged in but not allowed), 404 Not Found, 409 Conflict (e.g. duplicate booking).

## Task — `app.py` in this folder

Build a sessions API over an in-memory list:

| Method | URL                         | Does                                   |
|--------|-----------------------------|----------------------------------------|
| GET    | `/api/sessions`             | list all                               |
| GET    | `/api/sessions/<id>`        | one session, or 404                    |
| POST   | `/api/sessions`             | create → 201, return the new object    |
| PUT    | `/api/sessions/<id>`        | update title/host/capacity             |
| DELETE | `/api/sessions/<id>`        | delete → 200 with a message            |
| POST   | `/api/sessions/<id>/book`   | booked += 1, **409** if already full   |

Validation on POST/PUT: title and host are required, capacity must be a positive integer.
Otherwise return 400 with `{"message": "..."}` explaining what's wrong.

Also, `GET /api/sessions?host=Asha` should filter by host (`request.args.get("host")`).

## Test it with curl (no frontend yet)

```bash
curl http://127.0.0.1:5000/api/sessions
curl -X POST http://127.0.0.1:5000/api/sessions -H "Content-Type: application/json" \
     -d '{"title":"Poetry","host":"Asha","capacity":2}'
curl -X POST http://127.0.0.1:5000/api/sessions/1/book
```
Save the curl commands you used in `tests.sh`.

## Viva questions (`ANSWERS.md`)
1. What does `debug=True` do? Would you ship with it?
2. Why doesn't the list keep your data after a restart? (Lesson 06 fixes this.)
3. What happens if a client sends a POST without the `Content-Type: application/json` header?
4. 401 vs 403 — give an example of each from your future project.

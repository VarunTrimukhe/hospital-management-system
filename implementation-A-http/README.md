# Implementation A — Node.js `http` module (no Express, no Handlebars)

South Indian Hospital built with **only** the Node.js built-in `http` module.

## Run

```bash
npm start
# or
node server.js
# open http://localhost:3000  (override with PORT=4000 node server.js)
```

Zero dependencies (`package.json` has no `dependencies`).

## Routes (all `GET`)

| Route | Handler | Success | Errors |
|---|---|---|---|
| `/` | `homePage()` | `200` HTML | — |
| `/doctors` | `doctorsPage()` | `200` HTML | — |
| `/doctor/:id` | regex `/^\/doctor\/([^/]+)$/`, `getDoctorById()` | `200` doctor + their appointments | `404` unknown id |
| `/appointments[?status=]` | `appointmentsPage(status)`, `req.query`-equivalent via `URL.searchParams` | `200` (all or filtered) | `400` invalid `?status=` value |
| `/patient/:id` | regex `/^\/patient\/([^/]+)$/`, `getPatientById()` | `200` patient + history | `404` unknown id |
| anything else | fallthrough | — | `404` |
| non-GET method | `req.method` check | — | `405` + `Allow: GET` |
| exception | `try/catch` | — | `500` |

Trailing slashes are normalised (`/doctors/` → `/doctors`).

## Files

- `server.js` — server, manual routing, HTML builders, status codes.
- `data.js` — doctors, patients, appointments + lookup helpers.
- `package.json` — `npm start` only; intentionally dependency-free.

---

*This README documents the technical implementation only. The application itself is a real hospital management tool, not a student demo.*

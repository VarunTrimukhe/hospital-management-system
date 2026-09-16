# Implementation B — Express.js + Handlebars

South Indian Hospital built with **Express.js** routing and **Handlebars** templates.

## Run

```bash
npm install
npm start
# or: node app.js
# open http://localhost:3001  (override with PORT=4000 node app.js)
```

## Routes

| Method | Route | Type | Template | Data passed |
|---|---|---|---|---|
| GET | `/` | static | `home.hbs` | counts + `doctorsPreview` |
| GET | `/doctors` | static | `doctors.hbs` | `doctors` |
| GET | `/doctor/:id` | dynamic (`req.params.id`) | `doctor-detail.hbs` | `doctor` + `doctorAppointments` (enriched with patient) |
| GET | `/appointments[?status=]` | static + query (`req.query.status`) | `appointments.hbs` | `appointments` (enriched with doctor+patient), `activeStatus`, `statuses` |
| GET | `/patient/:id` | dynamic | `patient-detail.hbs` | `patient` + `patientAppointments` (enriched with doctor) |
| * | unknown | — | `404.hbs` | `message`, `backLink` (`404` status) |

Invalid `?status=` → `400` + `404.hbs`. Exceptions → `500` handler.

## Handlebars coverage (required features)

- Layout: `views/layouts/main.hbs` (`{{{body}}}`, nav, footer).
- Dynamic rendering: every `res.render(view, data)` passes server data into templates.
- `{{#each}}`: `home.hbs` (`doctorsPreview`), `doctors.hbs` (`doctors`), `appointments.hbs`, `doctor-detail.hbs`, `patient-detail.hbs` — including `{{else}}` empty states.
- Conditionals: `{{#if doctor.available}}`, `{{#if appointments.length}}`, `{{#if (eq …)}}`, plus `{{else}}` branches.
- Only 3 small custom helpers (`app.js`): `eq`, `formatDate`, `statusClass`. Examples:
  - `{{#if (eq this.status "Pending")}}…{{/if}}`
  - `{{formatDate this.date}}`
  - `<span class="badge {{statusClass this.status}}">{{this.status}}</span>`
- Display-ready fields (`days`, `initials`) are prepared in plain JS in `app.js`, so templates use simple `{{days}}` / `{{initials}}` variables with no extra helpers.

## Files

- `app.js` — Express setup, 3 helpers, 5 routes, 404/500 handlers (~150 lines, commented).
- `data.js` — doctors, patients, appointments + `enrichAppointment()`.
- `views/` — `layouts/main.hbs`, `home.hbs`, `doctors.hbs`, `doctor-detail.hbs`, `appointments.hbs`, `patient-detail.hbs`, `404.hbs`.
- `public/css/style.css` — served via `express.static`.

---

*This README documents the technical implementation only. The application itself is a real hospital management tool, not a student demo.*

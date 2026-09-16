// South Indian Hospital — Appointment Management System
// Built with Node.js built-in http module. No Express, no Handlebars.
// Routes: /  /doctors  /doctor/:id  /appointments  /patient/:id

const http = require("http");
const fs = require("fs");
const path = require("path");
const { doctors, patients, appointments, getDoctorById, getPatientById, getAppointmentsByDoctor, getAppointmentsByPatient } = require("./data");

const PORT = process.env.PORT || 3000;
const PUBLIC = path.join(__dirname, "public");

// Turn a name like "Dr. Varun Trimukhe" into "VT" for avatar circles.
function initials(name) {
  return String(name)
    .replace(/^Dr\.\s*/i, "")
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// Escape HTML so user data never breaks the page.
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Format a YYYY-MM-DD string like "18 Sept 2026".
function formatDate(iso) {
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d)) return iso;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

// Read the layout shell from public/index.html and swap in the title and body.
function layout(title, bodyHtml) {
  const html = fs.readFileSync(path.join(PUBLIC, "index.html"), "utf8");
  return html
    .replace("<!-- TITLE -->", escapeHtml(title) + " · South Indian Hospital")
    .replace("<!-- BODY -->", bodyHtml);
}

function statusBadge(status) {
  return `<span class="badge ${escapeHtml(status)}">${escapeHtml(status)}</span>`;
}

// Doctor card used on the home page and the doctors list.
function doctorCard(d) {
  const availability = d.available
    ? `<span class="pill-ok">● Available</span>`
    : `<span class="pill-bad">● On leave</span>`;
  return `<div class="card doctor-card">
    <div class="doctor-top">
      <div class="avatar" aria-hidden="true">${escapeHtml(initials(d.name))}</div>
      <div><h4>${escapeHtml(d.name)}</h4><p class="spec">${escapeHtml(d.specialization)} · ${escapeHtml(d.qualification)}</p></div>
    </div>
    <p class="meta"><small>Experience</small> <strong>${d.experience} yrs</strong> &nbsp;·&nbsp; <small>Fee</small> <strong>₹${d.fee}</strong> &nbsp;·&nbsp; <small>${escapeHtml(d.room)}</small></p>
    <p class="meta"><small>OPD</small> ${escapeHtml(d.time)} · ${d.availableDays.map(escapeHtml).join(", ")}</p>
    <p class="meta">${availability}</p>
    <p style="margin:6px 0 0"><a class="btn btn-sm" href="/doctor/${d.id}">View profile &amp; appointments</a></p>
  </div>`;
}

function appointmentRow(a) {
  const doc = getDoctorById(a.doctorId);
  const pat = getPatientById(a.patientId);
  return `<tr>
    <td><strong>#${a.id}</strong></td>
    <td style="white-space:nowrap">${escapeHtml(formatDate(a.date))}<br/><small style="color:var(--muted)">${escapeHtml(a.time)}</small></td>
    <td>${doc ? `<a href="/doctor/${doc.id}"><strong>${escapeHtml(doc.name)}</strong></a><br/><small style="color:var(--muted)">${escapeHtml(doc.specialization)}</small>` : "—"}</td>
    <td>${pat ? `<a href="/patient/${pat.id}">${escapeHtml(pat.name)}</a>` : "—"}</td>
    <td>${escapeHtml(a.reason)}</td>
    <td>${statusBadge(a.status)}</td>
  </tr>`;
}

function appointmentsTable(list) {
  if (!list.length) return `<div class="table-wrap"><div class="empty">No appointments found for the selected criteria.</div></div>`;
  return `<div class="table-wrap"><table>
    <thead><tr><th>ID</th><th>Date</th><th>Doctor</th><th>Patient</th><th>Reason</th><th>Status</th></tr></thead>
    <tbody>${list.map(appointmentRow).join("")}</tbody></table></div>`;
}

// ---- Pages ----

function homePage() {
  const confirmed = appointments.filter((a) => a.status === "Confirmed").length;
  const pending = appointments.filter((a) => a.status === "Pending").length;
  const completed = appointments.filter((a) => a.status === "Completed").length;
  const cancelled = appointments.filter((a) => a.status === "Cancelled").length;
  const preview = doctors.slice(0, 3).map(doctorCard).join("");
  return layout("Hospital Home", `
    <section class="hero">
      <h2>Quality care, well-organised visits.</h2>
      <p>Book and track consultations across ${doctors.length} specialists.</p>
      <div class="hero-actions">
        <a class="btn" href="/doctors">Find a doctor</a>
        <a class="btn btn-ghost" href="/appointments">View appointments</a>
      </div>
    </section>
    <div class="stats" role="list">
      <div class="stat" role="listitem"><div class="n">${doctors.length}</div><div class="l">Specialists</div></div>
      <div class="stat" role="listitem"><div class="n">${patients.length}</div><div class="l">Patients</div></div>
      <div class="stat" role="listitem"><div class="n">${appointments.length}</div><div class="l">Appointments</div></div>
      <div class="stat" role="listitem"><div class="n">${confirmed}</div><div class="l">Confirmed</div></div>
    </div>
    <div class="section-head"><h3>Featured specialists</h3><span><a href="/doctors">View all ${doctors.length} →</a></span></div>
    <div class="grid">${preview}</div>
    <div class="card" style="margin-top:14px">
      <h3>Today at a glance</h3>
      <p style="margin:4px 0 0;color:var(--muted);font-size:14px">Confirmed <strong>${confirmed}</strong> · Pending <strong>${pending}</strong> · Completed <strong>${completed}</strong> · Cancelled <strong>${cancelled}</strong> — <a href="/appointments">open the register</a>.</p>
    </div>`,
    { active: "home", breadcrumb: "Home" }
  );
}

function doctorsPage() {
  return layout("Our Doctors", `
    <div class="card">
      <h2>Our doctors</h2>
    </div>
    <div class="grid">${doctors.map(doctorCard).join("")}</div>`,
    { active: "doctors", breadcrumb: `<a href="/">Home</a> / Doctors` }
  );
}

function doctorDetailPage(id) {
  const doctor = getDoctorById(id);
  if (!doctor) return null;
  const appts = getAppointmentsByDoctor(doctor.id);
  return layout(doctor.name, `
    <div class="card">
      <div class="profile-head">
        <div class="avatar" aria-hidden="true">${escapeHtml(initials(doctor.name))}</div>
        <div>
          <h2 style="margin:0">${escapeHtml(doctor.name)}</h2>
          <p style="margin:2px 0 0;color:var(--muted)">${escapeHtml(doctor.qualification)} · ${escapeHtml(doctor.specialization)}</p>
        </div>
        <span style="margin-left:auto">${doctor.available ? `<span class="pill-ok">● Available</span>` : `<span class="pill-bad">● On leave</span>`}</span>
      </div>
      <div class="info-grid">
        <div class="info"><div class="k">Experience</div><strong>${doctor.experience} years</strong></div>
        <div class="info"><div class="k">Fee</div><strong>₹${doctor.fee}</strong></div>
        <div class="info"><div class="k">Room</div>${escapeHtml(doctor.room)}</div>
        <div class="info"><div class="k">OPD hours</div>${escapeHtml(doctor.time)}</div>
        <div class="info"><div class="k">OPD days</div>${doctor.availableDays.map(escapeHtml).join(", ")}</div>
        <div class="info"><div class="k">Phone</div>${escapeHtml(doctor.phone)}</div>
      </div>
      ${doctor.available ? "" : `<p class="alert alert-warn" style="margin-top:12px">Note: ${escapeHtml(doctor.name)} is currently on leave — new bookings are paused and one appointment was cancelled.</p>`}
      <p style="margin:14px 0 0"><a class="btn btn-ghost btn-sm" href="/doctors">← Back to doctors</a></p>
    </div>
    <div class="section-head"><h3>Appointments · ${appts.length}</h3><span>${escapeHtml(doctor.name)}</span></div>
    ${appointmentsTable(appts)}`,
    { active: "doctors", breadcrumb: `<a href="/">Home</a> / <a href="/doctors">Doctors</a> / ${escapeHtml(doctor.name)}` }
  );
}

function appointmentsPage(filterStatus) {
  const valid = ["Confirmed", "Pending", "Cancelled", "Completed"];
  if (filterStatus && !valid.includes(filterStatus)) {
    return { error: `Invalid ?status value "${filterStatus}". Use one of: ${valid.join(", ")}.` };
  }
  const list = (filterStatus ? appointments.filter((a) => a.status === filterStatus) : appointments);
  const pills = ["All", ...valid].map((s) => {
    const href = s === "All" ? "/appointments" : `/appointments?status=${s}`;
    const on = (filterStatus || "All") === s ? "on" : "";
    return `<a class="${on}" href="${href}">${s}</a>`;
  }).join("");
  const html = layout("Appointments", `
    <div class="card">
      <h2>Appointment register</h2>
      <p style="margin:4px 0 0;color:var(--muted)">${filterStatus ? `Showing <strong>${escapeHtml(filterStatus)}</strong> appointments (${list.length}). <a href="/appointments">Clear filter</a>` : `All appointments (${list.length}). Filter by status:`}</p>
      <div class="filters" role="group" aria-label="Filter by status">${pills}</div>
    </div>
    ${appointmentsTable(list)}`,
    { active: "appointments", breadcrumb: `<a href="/">Home</a> / Appointments${filterStatus ? ` / ${escapeHtml(filterStatus)}` : ""}` }
  );
  return { html };
}

function patientDetailPage(id) {
  const patient = getPatientById(id);
  if (!patient) return null;
  const appts = getAppointmentsByPatient(patient.id);
  return layout(`Patient · ${patient.name}`, `
    <div class="card">
      <div class="profile-head">
        <div class="avatar" aria-hidden="true">${escapeHtml(initials(patient.name))}</div>
        <div>
          <h2 style="margin:0">${escapeHtml(patient.name)}</h2>
          <p style="margin:2px 0 0;color:var(--muted)">Patient ID #${patient.id} · ${escapeHtml(patient.gender)}, ${patient.age} yrs · Blood ${escapeHtml(patient.bloodGroup)}</p>
        </div>
      </div>
      <div class="info-grid">
        <div class="info"><div class="k">Phone</div>${escapeHtml(patient.phone)}</div>
        <div class="info"><div class="k">Address</div>${escapeHtml(patient.address)}</div>
        <div class="info"><div class="k">Visits on file</div><strong>${appts.length}</strong></div>
      </div>
      <p style="margin:14px 0 0"><a class="btn btn-ghost btn-sm" href="/appointments">View full register</a></p>
    </div>
    <div class="section-head"><h3>Appointment history · ${appts.length}</h3><span>${escapeHtml(patient.name)}</span></div>
    ${appointmentsTable(appts)}`,
    { active: "appointments", breadcrumb: `<a href="/">Home</a> / <a href="/appointments">Appointments</a> / ${escapeHtml(patient.name)}` }
  );
}

function errorPage(code, heading, message, backHref, backText) {
  return layout(`${code} · ${heading}`, `
    <div class="card" style="text-align:center;padding:44px 24px">
      <div style="font-size:13px;font-weight:800;letter-spacing:.12em;color:var(--brand)">ERROR ${code}</div>
      <h2 style="margin:6px 0">${escapeHtml(heading)}</h2>
      <p style="color:var(--muted)">${message}</p>
      <p style="margin-top:16px"><a class="btn" href="${backHref}">${escapeHtml(backText)}</a></p>
    </div>`);
}

// ---- Send response ----

function sendHtml(res, statusCode, html) {
  res.writeHead(statusCode, {
    "Content-Type": "text/html; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "no-store",
  });
  res.end(html);
}

function log(method, url, status) {
  console.log(`${new Date().toISOString()} ${method} ${url} -> ${status}`);
}

// ---- Serve static files from public/ ----

function serveStatic(res, filePath, contentType) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not found");
      return;
    }
    res.writeHead(200, { "Content-Type": contentType, "Cache-Control": "public, max-age=3600" });
    res.end(data);
  });
}

function servePublic(req, res, pathname) {
  // Only serve static assets (css, images, icons) — not index.html.
  // The homepage is generated dynamically via layout().
  const ext = path.extname(pathname);
  const types = { ".css": "text/css", ".js": "application/javascript", ".png": "image/png", ".svg": "image/svg+xml", ".ico": "image/x-icon" };
  if (types[ext]) {
    const filePath = path.join(PUBLIC, pathname === "/" ? "index.html" : pathname);
    serveStatic(res, filePath, types[ext]);
    return true;
  }
  return false;
}

// ---- Start server ----

const server = http.createServer((req, res) => {
  try {
    const parsed = new URL(req.url, `http://${req.headers.host}`);
    let pathname = parsed.pathname;
    if (pathname.length > 1 && pathname.endsWith("/")) pathname = pathname.slice(0, -1);

    // Hand over CSS/images/favicon before routing.
    if (servePublic(req, res, pathname)) return;

    const method = req.method;

    // Only GET pages are served. Anything else is 405.
    if (method !== "GET") {
      res.writeHead(405, { "Content-Type": "text/html; charset=utf-8", Allow: "GET" });
      res.end(errorPage("405", "Method not allowed",
        `<code>${escapeHtml(method)} ${escapeHtml(pathname)}</code> is not supported.`,
        "/", "Go home"));
      log(method, req.url, 405);
      return;
    }

    // GET / — Home
    if (pathname === "/") {
      sendHtml(res, 200, homePage());
      log("GET", req.url, 200);
      return;
    }

    // GET /doctors — Doctor list
    if (pathname === "/doctors") {
      sendHtml(res, 200, doctorsPage());
      log("GET", req.url, 200);
      return;
    }

    // GET /doctor/:id — One doctor's profile and their appointments
    let m = pathname.match(/^\/doctor\/([^/]+)$/);
    if (m) {
      const html = doctorDetailPage(decodeURIComponent(m[1]));
      if (!html) {
        sendHtml(res, 404, errorPage("404", "Doctor not found",
          `No doctor exists with id <code>${escapeHtml(m[1])}</code>.`,
          "/doctors", "Back to doctors"));
        log("GET", req.url, "404 (doctor)");
      } else {
        sendHtml(res, 200, html);
        log("GET", req.url, 200);
      }
      return;
    }

    // GET /appointments — Appointment register, ?status= filters
    if (pathname === "/appointments") {
      const status = parsed.searchParams.get("status");
      const result = appointmentsPage(status);
      if (result.error) {
        sendHtml(res, 400, errorPage("400", "Bad request", escapeHtml(result.error), "/appointments", "View all"));
        log("GET", req.url, 400);
      } else {
        sendHtml(res, 200, result.html);
        log("GET", req.url, 200);
      }
      return;
    }

    // GET /patient/:id — One patient's record and history
    m = pathname.match(/^\/patient\/([^/]+)$/);
    if (m) {
      const html = patientDetailPage(decodeURIComponent(m[1]));
      if (!html) {
        sendHtml(res, 404, errorPage("404", "Patient not found",
          `No patient exists with id <code>${escapeHtml(m[1])}</code>.`,
          "/appointments", "View appointments"));
        log("GET", req.url, "404 (patient)");
      } else {
        sendHtml(res, 200, html);
        log("GET", req.url, 200);
      }
      return;
    }

    // Browsers request /favicon.ico automatically.
    if (pathname === "/favicon.ico") {
      res.writeHead(204);
      res.end();
      return;
    }

    // Nothing matched — 404.
    sendHtml(res, 404, errorPage("404", "Page not found",
      `No route matches <code>${escapeHtml(req.url)}</code>.`,
      "/", "Go home"));
    log("GET", req.url, 404);
  } catch (err) {
    console.error("Internal error:", err);
    try {
      sendHtml(res, 500, errorPage("500", "Something went wrong", "An unexpected error occurred. Please try again.", "/", "Go home"));
    } catch (_) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal Server Error");
    }
  }
});

server.listen(PORT, () => {
  console.log(`South Indian Hospital running at http://localhost:${PORT}`);
});

// South Indian Hospital — Appointment Management System
// Express.js routes + Handlebars templates.

const path = require("path");
const express = require("express");
const { engine } = require("express-handlebars");

const { doctors, patients, appointments, getDoctorById, getPatientById, enrichAppointment } = require("./data");

const app = express();
const PORT = process.env.PORT || 3001;

// Plain JS helpers to keep templates clean ({{days}}, {{initials}}).
function days(doctor) {
  return doctor.availableDays.join(", ");
}
function initials(name) {
  return name.replace(/^Dr\.\s*/i, "").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}
function viewDoctor(d) {
  return { ...d, days: days(d), initials: initials(d.name) };
}

// Only 3 Handlebars helpers: eq (conditionals), formatDate, statusClass (badges).
app.engine("hbs", engine({
  extname: ".hbs",
  defaultLayout: "main",
  layoutsDir: path.join(__dirname, "views", "layouts"),
  helpers: {
    eq: (a, b) => a === b,
    formatDate: (iso) => {
      const d = new Date(iso + "T00:00:00");
      return isNaN(d) ? iso : d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    },
    statusClass: (status) => ({
      Confirmed: "badge-confirmed", Pending: "badge-pending",
      Cancelled: "badge-cancelled", Completed: "badge-completed",
    }[status] || "badge-default"),
  },
}));
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

// Log every request.
app.use((req, res, next) => {
  console.log(req.method, req.originalUrl);
  next();
});

// GET / — Home
app.get("/", (req, res) => {
  res.status(200).render("home", {
    title: "Hospital Home",
    activeNav: "home",
    breadcrumb: "Home",
    doctorCount: doctors.length,
    patientCount: patients.length,
    appointmentCount: appointments.length,
    confirmedCount: appointments.filter((a) => a.status === "Confirmed").length,
    pendingCount: appointments.filter((a) => a.status === "Pending").length,
    completedCount: appointments.filter((a) => a.status === "Completed").length,
    cancelledCount: appointments.filter((a) => a.status === "Cancelled").length,
    doctorsPreview: doctors.slice(0, 3).map(viewDoctor),
  });
});

// GET /doctors — Doctor list
app.get("/doctors", (req, res) => {
  res.status(200).render("doctors", {
    title: "Our Doctors",
    activeNav: "doctors",
    breadcrumb: `<a href="/">Home</a> / Doctors`,
    doctors: doctors.map(viewDoctor),
  });
});

// GET /doctor/:id — One doctor (id from URL)
app.get("/doctor/:id", (req, res) => {
  const doctor = getDoctorById(req.params.id);
  if (!doctor) {
    return res.status(404).render("404", {
      errorCode: "404", title: "Doctor not found",
      message: `No doctor exists with id "${req.params.id}".`,
      backLink: "/doctors", backText: "Back to doctors", activeNav: "doctors",
    });
  }
  const list = appointments.filter((a) => a.doctorId === doctor.id).map(enrichAppointment);
  res.status(200).render("doctor-detail", {
    title: doctor.name,
    activeNav: "doctors",
    breadcrumb: `<a href="/">Home</a> / <a href="/doctors">Doctors</a> / ${doctor.name}`,
    doctor: viewDoctor(doctor),
    doctorAppointments: list,
  });
});

// GET /appointments — Register, ?status= filters
app.get("/appointments", (req, res) => {
  const valid = ["Confirmed", "Pending", "Cancelled", "Completed"];
  const status = req.query.status;
  if (status && !valid.includes(status)) {
    return res.status(400).render("404", {
      errorCode: "400", title: "Bad request",
      message: `Invalid ?status value "${status}". Use one of: ${valid.join(", ")}.`,
      backLink: "/appointments", backText: "View all appointments", activeNav: "appointments",
    });
  }
  const list = (status ? appointments.filter((a) => a.status === status) : appointments).map(enrichAppointment);
  res.status(200).render("appointments", {
    title: "Appointments",
    activeNav: "appointments",
    breadcrumb: `<a href="/">Home</a> / Appointments${status ? " / " + status : ""}`,
    appointments: list,
    activeStatus: status || "All",
    statuses: ["All", ...valid],
  });
});

// GET /patient/:id — One patient
app.get("/patient/:id", (req, res) => {
  const patient = getPatientById(req.params.id);
  if (!patient) {
    return res.status(404).render("404", {
      errorCode: "404", title: "Patient not found",
      message: `No patient exists with id "${req.params.id}".`,
      backLink: "/appointments", backText: "View appointments", activeNav: "appointments",
    });
  }
  const list = appointments.filter((a) => a.patientId === patient.id).map(enrichAppointment);
  res.status(200).render("patient-detail", {
    title: "Patient · " + patient.name,
    activeNav: "appointments",
    breadcrumb: `<a href="/">Home</a> / <a href="/appointments">Appointments</a> / ${patient.name}`,
    patient: { ...patient, initials: initials(patient.name) },
    patientAppointments: list,
  });
});

// Everything else — 404.
app.use((req, res) => {
  res.status(404).render("404", {
    errorCode: "404", title: "Page not found",
    message: `No route matches "${req.originalUrl}".`,
    backLink: "/", backText: "Go home", activeNav: "",
  });
});

// Server error — 500.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render("404", {
    errorCode: "500", title: "Something went wrong",
    message: "An unexpected error occurred. Please try again.",
    backLink: "/", backText: "Go home", activeNav: "",
  });
});

// Vercel uses the exported app object directly.
// Local dev: run "node app.js" to start the server.
if (process.env.VERCEL !== "1") {
  app.listen(PORT, () => {
    console.log(`South Indian Hospital running at http://localhost:${PORT}`);
  });
}

module.exports = app;

// South Indian Hospital — in-memory data: doctors, patients and appointments.

const doctors = [
  {
    id: 1,
    name: "Dr. Varun Trimukhe",
    specialization: "Cardiology",
    qualification: "MBBS, MD (Cardiology)",
    experience: 12,
    fee: 800,
    room: "Room 101",
    phone: "+91-9702509701",
    time: "10:00 AM – 2:00 PM",
    availableDays: ["Mon", "Wed", "Fri"],
    available: true,
  },
  {
    id: 2,
    name: "Dr. Om Ruikar",
    specialization: "Orthopedics",
    qualification: "MBBS, MS (Ortho)",
    experience: 9,
    fee: 600,
    room: "Room 204",
    phone: "+91-8850097391",
    time: "11:00 AM – 3:00 PM",
    availableDays: ["Tue", "Thu", "Sat"],
    available: true,
  },
  {
    id: 3,
    name: "Dr. Dhanashri Vanduskar",
    specialization: "Pediatrics",
    qualification: "MBBS, DCH",
    experience: 7,
    fee: 500,
    room: "Room 305",
    phone: "+91-9123456789",
    time: "9:00 AM – 1:00 PM",
    availableDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    available: true,
  },
  {
    id: 4,
    name: "Dr. Unnati Kottian",
    specialization: "Dermatology",
    qualification: "MBBS, MD (Derma)",
    experience: 10,
    fee: 700,
    room: "Room 108",
    phone: "+91-9012345678",
    time: "2:00 PM – 6:00 PM",
    availableDays: ["Mon", "Thu", "Sat"],
    available: false,
  },
];

const patients = [
  {
    id: 1,
    name: "Sneha Jadhav",
    age: 34,
    gender: "Female",
    phone: "+91-99000-20001",
    bloodGroup: "B+",
    address: "12, MG Road, Nerul",
  },
  {
    id: 2,
    name: "Anjali CM",
    age: 27,
    gender: "Female",
    phone: "+91-99000-20002",
    bloodGroup: "O-",
    address: "45, FC Road, Nerul",
  },
  {
    id: 3,
    name: "Dhriti Dindigal",
    age: 52,
    gender: "Male",
    phone: "+91-99000-20003",
    bloodGroup: "A+",
    address: "7, Palm Beach Road, Vashi",
  },
];

const appointments = [
  {
    id: 1,
    doctorId: 1,
    patientId: 1,
    date: "2026-09-18",
    time: "10:30 AM",
    reason: "Chest pain & ECG review",
    status: "Confirmed",
  },
  {
    id: 2,
    doctorId: 3,
    patientId: 2,
    date: "2026-09-18",
    time: "11:00 AM",
    reason: "Child vaccination",
    status: "Confirmed",
  },
  {
    id: 3,
    doctorId: 2,
    patientId: 3,
    date: "2026-09-19",
    time: "12:00 PM",
    reason: "Knee pain follow-up",
    status: "Pending",
  },
  {
    id: 4,
    doctorId: 1,
    patientId: 2,
    date: "2026-09-20",
    time: "11:30 AM",
    reason: "BP & cholesterol check",
    status: "Pending",
  },
  {
    id: 5,
    doctorId: 2,
    patientId: 1,
    date: "2026-09-15",
    time: "11:30 AM",
    reason: "Fracture review (old)",
    status: "Completed",
  },
  {
    id: 6,
    doctorId: 4,
    patientId: 3,
    date: "2026-09-16",
    time: "3:00 PM",
    reason: "Skin allergy (cancelled – doctor on leave)",
    status: "Cancelled",
  },
];

function getDoctorById(id) {
  return doctors.find((d) => d.id === Number(id));
}

function getPatientById(id) {
  return patients.find((p) => p.id === Number(id));
}

// Merge each appointment with its doctor and patient objects for the templates.
function enrichAppointment(a) {
  return {
    ...a,
    doctor: getDoctorById(a.doctorId),
    patient: getPatientById(a.patientId),
  };
}

module.exports = {
  doctors,
  patients,
  appointments,
  getDoctorById,
  getPatientById,
  enrichAppointment,
};

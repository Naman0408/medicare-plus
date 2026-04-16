# MediCare+ — Doctor Appointment System

## Project Structure
```
/
├── index.html                  # Landing page (light theme)
├── css/
│   └── global.css              # Design system, light theme variables
├── js/
│   └── main.js                 # Global JS (scroll animations, nav)
├── pages/
│   ├── register.html           # Patient & Doctor registration (3-step)
│   ├── login.html              # Patient & Doctor login
│   ├── dashboard-patient.html  # Patient dashboard + book appointments
│   └── dashboard-doctor.html   # Doctor dashboard + schedule management
└── backend/                    # Node.js / Express / MongoDB API
    ├── config/db.js
    ├── controllers/
    │   ├── authController.js   (register + login with role support)
    │   └── appointmentController.js
    ├── middleware/authMiddleware.js
    └── models/
        ├── User.js             (patient + doctor fields)
        └── Appointment.js
```

## Running the Backend
```bash
cd backend
npm install
# Create .env file:
#   MONGO_URI=mongodb://localhost:27017/medicare
#   JWT_SECRET=your_secret_key
#   PORT=5000
node server.js   # or: npx nodemon server.js
```

## Opening the Frontend
Open `index.html` in your browser (no build step needed).

## Pages Overview
| Page | URL | Description |
|------|-----|-------------|
| Home | index.html | Landing page with hero, features, doctors |
| Register | pages/register.html | 3-step registration for patient/doctor |
| Login | pages/login.html | Role-based login (patient/doctor) |
| Patient Dashboard | pages/dashboard-patient.html | Book & manage appointments |
| Doctor Dashboard | pages/dashboard-doctor.html | View schedule, manage patients |

## Color Theme (Light)
- Primary: `#0094ff` (blue)
- Secondary: `#00c4a0` (teal)
- Background: `#f7fafd` (soft white)
- Text: `#0f1c2e` (dark navy)

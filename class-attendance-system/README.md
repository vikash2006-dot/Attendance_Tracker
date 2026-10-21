# Class Attendance Management System (PS1)

A complete, beginner-friendly, and responsive web application designed for colleges and universities to record, track, and manage student attendance with automated 75% shortage calculation and analytics.

---

## 📌 Problem Statement

In academic institutions, monitoring student class attendance and identifying attendance shortages (below 75%) is crucial for exam eligibility. Manual paper attendance registers or fragmented spreadsheets often lead to data discrepancies, duplicated date sheets, calculation errors, and delay in alerting students. 

This project solves this problem by providing a centralized system with:
1. **Admin Portal:** Manage course subjects, mark/update lecture attendance on dates without duplicate sheets, inspect today's and cumulative attendance statistics, and generate a 75% shortage recovery report.
2. **Student Portal:** Securely check real-time attendance percentage across all enrolled subjects, view date-wise lecture presence/absence history, and monitor eligibility.

---

## ✨ Features

### 🔐 Authentication & Roles
- **Dual Role System:** Separate interfaces for **Admin** and **Student**.
- **Secure Password Hashing:** Passwords hashed with `bcryptjs`.
- **JWT Authentication:** Stateless JSON Web Token authentication on all protected routes.
- **Role-based Route Guards:** Frontend `ProtectedRoute` and backend authorization middleware.
- **Registration Safeguard:** Public registration is restricted to students only; admin account is created securely via seed or database initialization.

### 📚 Subject Management (Admin)
- Full CRUD operations: Add new subjects, view subject list, view subject details, edit, and delete subjects.
- Subject fields: Name, Unique Code (e.g. `CS401`), Semester (1 to 8), and Teacher Name.
- Reusable `SubjectForm` component for adding and editing.
- Semester filtering via URL search query parameters.

### 📝 Attendance Management (Admin)
- Dynamic attendance marking interface based on selected Subject and Lecture Date.
- Filters students matching the subject's semester and optional section.
- **Duplicate Prevention:**
  - Database-level compound unique index on `{ subject: 1, date: 1 }`.
  - Normalized ISO date format (`YYYY-MM-DD`) preventing timezone drift.
  - Automatic sheet loading: If attendance was previously taken for that date, existing records load for seamless editing rather than creating duplicates.
- Bulk quick actions: **Mark All Present** and **Mark All Absent**.

### ⚠️ 75% Attendance Shortage Report & Recovery Formula
- Automatically detects students whose cumulative attendance in any subject is below 75%.
- Displays: Student Name, Roll Number, Semester/Section, Subject, Conducted Classes, Attended Classes, Current %, and **Additional Consecutive Classes Needed to Reach 75%**.
- **Formula:**
  For $A$ total classes and $P$ attended classes:
  $$\text{requiredClasses} = \max(0, \lceil 3A - 4P \rceil)$$
- Calculated reliably by the backend API.

### 📊 Admin Analytics Dashboard
- **Today's Overall Attendance %** and real-time class activity summary.
- **Subject-Wise Cumulative Attendance %** with visual progress bars.
- Total students, total subjects, and count of students with shortages.
- Computed dynamically from actual MongoDB documents.

### 🎓 Student Attendance Portal
- Overview of total classes, attended classes, and overall percentage.
- Subject-by-subject percentage breakdown.
- Handles division by zero gracefully when no classes have occurred yet.
- Dynamic detail page (`/my-attendance/:subjectId`) with date-wise present/absent history.
- Students cannot access or modify records of other students.

---

## 🛠️ Technologies Used

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, React Router DOM (v6), Native Fetch API |
| **Styling** | Vanilla CSS (Responsive, Clean, Modern Design System) |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB with Mongoose ODM |
| **Security** | JSON Web Tokens (`jsonwebtoken`), Password Hashing (`bcryptjs`), CORS |

---

## 📁 Project Folder Structure

```
class-attendance-system/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection using Mongoose
│   ├── controllers/
│   │   ├── attendanceController.js # Attendance marking, loading, summaries & shortage
│   │   ├── authController.js       # Register, login, and profile fetching
│   │   ├── dashboardController.js  # Live stats and today's attendance summary
│   │   └── subjectController.js    # Subject CRUD controllers
│   ├── middleware/
│   │   ├── authHandler.js        # JWT verification & role authorization (Admin/Student)
│   │   └── errorHandler.js       # Centralized error handling
│   ├── models/
│   │   ├── Attendance.js         # Attendance schema with unique compound index
│   │   ├── Subject.js            # Subject schema with validation
│   │   └── User.js               # User schema with bcrypt pre-save hook
│   ├── routes/
│   │   ├── attendanceRoutes.js   # /api/attendance routes
│   │   ├── authRoutes.js         # /api/auth routes
│   │   ├── dashboardRoutes.js    # /api/dashboard routes
│   │   └── subjectRoutes.js      # /api/subjects routes
│   ├── scripts/
│   │   └── seed.js               # Database seeding script
│   ├── .env.example
│   ├── package.json
│   └── server.js                 # Express application entry point
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   ├── attendanceApi.js  # Attendance API fetch functions
│   │   │   ├── authApi.js        # Auth API fetch functions
│   │   │   ├── client.js         # Base fetch client with JWT token header
│   │   │   ├── dashboardApi.js   # Dashboard API fetch functions
│   │   │   └── subjectApi.js     # Subject API fetch functions
│   │   ├── components/
│   │   │   ├── AlertMessage.jsx  # Notification banner
│   │   │   ├── LoadingSpinner.jsx# Loading state spinner
│   │   │   ├── Navbar.jsx        # Navigation bar with role-based links
│   │   │   ├── ProtectedRoute.jsx# Auth and role route guards
│   │   │   └── SubjectForm.jsx   # Reusable subject add/edit form
│   │   ├── pages/
│   │   │   ├── AdminDashboardPage.jsx # Analytics and today's summary
│   │   │   ├── LoginPage.jsx          # Sign-in page with demo accounts
│   │   │   ├── MarkAttendancePage.jsx # Subject & date marking sheet
│   │   │   ├── MyAttendancePage.jsx   # Student subject summary breakdown
│   │   │   ├── MySubjectDetailPage.jsx# Student date-wise log
│   │   │   ├── NotFoundPage.jsx       # 404 page
│   │   │   ├── RegisterPage.jsx       # Student registration
│   │   │   ├── ShortageReportPage.jsx # 75% shortage list & recovery classes
│   │   │   ├── SubjectDetailPage.jsx  # Individual subject info
│   │   │   ├── SubjectFormPage.jsx    # Add / Edit subject page
│   │   │   └── SubjectListPage.jsx    # Subject management list
│   │   ├── App.jsx               # Route definitions and user state
│   │   ├── index.css             # Vanilla CSS design tokens and styles
│   │   └── main.jsx              # React DOM entry with BrowserRouter
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── README.md
```

---

## 📋 Prerequisites

Ensure you have the following installed on your machine:
- **Node.js** (v18.0.0 or higher recommended; verified on Node v26)
- **npm** (v9.0.0 or higher)
- **MongoDB** (Local instance or MongoDB Atlas cluster connection string)

---

## ⚙️ Installation & Environment Setup

### 1. Clone or Open the Workspace
Navigate into the project directory:
```bash
cd class-attendance-system
```

### 2. Configure Backend Environment
Create `backend/.env` (a template is provided in `backend/.env.example`):
```bash
cp backend/.env.example backend/.env
```
Edit `backend/.env` with your values:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key_here
PORT=5001
FRONTEND_URL=http://localhost:5173
ADMIN_EMAIL=admin@attendance.com
ADMIN_PASSWORD=admin123
```
> *Note: Port `5001` is recommended on macOS to avoid port conflicts with macOS ControlCenter AirPlay on port 5000.*

### 3. Configure Frontend Environment
Create `frontend/.env` (a template is provided in `frontend/.env.example`):
```bash
cp frontend/.env.example frontend/.env
```
Edit `frontend/.env`:
```env
VITE_API_URL=http://localhost:5001/api
```

### 4. Install Dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

## 🌱 Seeding the Database

Run the idempotent seed script to populate sample admin, students, subjects across semesters, and attendance records:
```bash
cd backend
npm run seed
```

This creates:
- 1 System Administrator account
- 11 Sample Students across Semester 4 & Semester 6 (Sections A and B)
- 5 Subjects across Semesters 4 and 6
- 5 Days of attendance records showcasing healthy attendance (>85%) and shortage cases (<75%)

---

## 🔑 Test Login Credentials (After Seeding)

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@attendance.com` | `admin123` | Full access to Dashboard, Subjects, Marking, & Shortage |
| **Student (High Att.)** | `aarav@college.edu` | `student123` | Roll: `CS202401`, Semester 4, High attendance |
| **Student (Shortage)** | `rohan@college.edu` | `student123` | Roll: `CS202403`, Semester 4, ~40% attendance |
| **Student (Shortage)** | `ananya@college.edu` | `student123` | Roll: `CS202404`, Semester 4, ~40% attendance |

*(The Login page also contains one-click demo autofill buttons for convenience)*

---

## 🚀 Running Locally

### Start Backend Server:
```bash
cd backend
npm run dev
# or npm start
```
The backend server runs on `http://localhost:5001`.

### Start Frontend Server:
```bash
cd frontend
npm run dev
```
The frontend Vite server runs on `http://localhost:5173`. Open this URL in your web browser.

---

## 🌐 API Endpoints Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register a new student |
| `POST` | `/api/auth/login` | Public | Authenticate user and receive JWT token |
| `GET` | `/api/auth/me` | Authenticated | Fetch current user profile |

### Subjects (`/api/subjects`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/subjects` | Authenticated | List all subjects (supports `?semester=N`) |
| `GET` | `/api/subjects/:id` | Authenticated | Get single subject details |
| `POST` | `/api/subjects` | Admin | Create a new subject |
| `PUT` | `/api/subjects/:id` | Admin | Update existing subject |
| `DELETE`| `/api/subjects/:id` | Admin | Delete subject and associated records |

### Attendance (`/api/attendance`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/attendance/sheet?subjectId=...&date=...&section=...` | Admin | Load existing or initialize new sheet |
| `POST` | `/api/attendance` | Admin | Mark or update attendance sheet |
| `PUT` | `/api/attendance/:id` | Admin | Update sheet by ID |
| `GET` | `/api/attendance` | Admin | List all attendance sheets |
| `GET` | `/api/attendance/shortage` | Admin | Get list of students below 75% |
| `GET` | `/api/attendance/my` | Student | Get logged-in student's subject summaries |
| `GET` | `/api/attendance/my/:subjectId` | Student | Get student's date-wise attendance records |

### Dashboard (`/api/dashboard`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard` | Admin | Get live metrics, today's summary, and averages |

---

## 🧪 Testing Instructions

1. **Verify Backend Health:**
   ```bash
   curl http://localhost:5001/api/health
   ```
   Should return `{ "status": "ok", "message": "Class Attendance Management System API is running smoothly" }`.

2. **Test Admin Flow:**
   - Sign in as `admin@attendance.com` / `admin123`.
   - Inspect the Dashboard metrics (Today's % vs Cumulative %).
   - Go to **Subjects** -> Click **+ Add New Subject** -> Fill form -> Submit.
   - Go to **Mark Attendance** -> Choose a Subject and Date -> Toggle students -> Click **Submit Attendance Sheet**.
   - Change date or reload to see the sheet load in edit mode without duplicating documents.
   - Go to **Shortage Report** -> Verify students below 75% and inspect the calculated "+N classes needed" column.

3. **Test Student Flow:**
   - Log out from Admin.
   - Log in as `rohan@college.edu` / `student123`.
   - View **My Attendance** page -> observe overall % and subject badges.
   - Click **View Dates &rarr;** on a subject -> observe the date-wise log with green "Present" and red "Absent" badges.
   - Verify student cannot access `/admin/*` routes (automatically redirected).

---

## 🖼️ Application Screenshots

*(Screenshots will be added upon final presentation)*

- **Admin Dashboard:** `[Screenshot placeholder: Admin Dashboard showing metrics and today's summary]`
- **Marking Attendance:** `[Screenshot placeholder: Attendance marking table with Present/Absent toggle]`
- **Shortage Report:** `[Screenshot placeholder: Shortage list displaying 75% formula results]`
- **Student Attendance View:** `[Screenshot placeholder: Student breakdown with progress bars and date logs]`

---

## 🚀 Future Deployment Guide

### Backend Deployment (e.g. Render, Railway):
1. Connect your Git repository.
2. Set root directory to `class-attendance-system/backend`.
3. Set build command: `npm install`.
4. Set start command: `node server.js`.
5. Set environment variables: `MONGO_URI`, `JWT_SECRET`, `PORT=5001`, `FRONTEND_URL=<production_frontend_url>`.

### Frontend Deployment (e.g. Vercel, Netlify):
1. Set root directory to `class-attendance-system/frontend`.
2. Set build command: `npm run build`.
3. Set output directory: `dist`.
4. Set environment variable: `VITE_API_URL=<production_backend_url>/api`.

*Live URL: [Placeholder until deployed]*

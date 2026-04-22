<div align="center">

# 📝 Prashiksha — Online Examination System

**A full-stack web application for conducting secure, admin-managed online examinations.**

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20%2F%20Local-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

</div>

---

## ✨ Features

### 👨‍💼 Admin Portal
- Secure admin sign-up & login with JWT authentication
- Create and manage exams (title, subject, duration, passing marks, unique code)
- Question bank management — add MCQs with difficulty levels and point values
- Assign questions to specific exams
- Live results dashboard with ranked leaderboard per exam
- **Bulk "Publish All Results"** — release all pending results to students at once
- Export results as CSV
- Student roster management

### 🎓 Student Portal
- Register and log in with a student account
- Join exams via unique exam code
- Timed exam interface with auto-submit on timeout
- Review all past exam scores from the dashboard
- **Admin-gated results** — results only visible after admin publishes them
- Review Answers — see which answers were correct/incorrect post-publish
- **Download Certificate** — generates a PNG certificate of achievement via Canvas API

### 🔐 Security
- Password hashing with bcryptjs
- Stateless JWT authentication (stored in `localStorage`)
- Role-based access control (student vs. admin middleware)
- Students can only see their own published results

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Vanilla HTML5, CSS3, JavaScript (ES2020+) |
| **Styling** | Custom CSS Design System (CSS variables, Google Fonts — Manrope, Inter) |
| **Icons** | Google Material Symbols Rounded |
| **Backend** | Node.js + Express 5.x |
| **Database** | MongoDB (Mongoose ODM) |
| **Auth** | JSON Web Tokens (JWT) + bcryptjs |
| **Dev Tools** | nodemon, dotenv |
| **Deployment** | Any Node.js host (Render, Railway, Heroku, VPS) + MongoDB Atlas |

---

## 📁 Project Structure

```
Online_Exam_System/
├── backend/
│   ├── middleware/
│   │   └── auth.js            # requireAuth / requireAdmin / requireStudent
│   ├── models/
│   │   ├── Exam.js            # Exam schema (title, subject, code, questions…)
│   │   ├── Question.js        # Question schema (text, options, isCorrect…)
│   │   ├── Result.js          # Result schema (answers, score, isPublished…)
│   │   └── User.js            # User schema (name, email, password, role)
│   ├── routes/
│   │   ├── auth.js            # POST /register, POST /login
│   │   ├── dashboard.js       # GET  /api/dashboard
│   │   ├── exams.js           # CRUD /api/exams, POST /join
│   │   ├── questions.js       # CRUD /api/questions
│   │   ├── results.js         # GET/POST /api/results, PATCH publish
│   │   └── students.js        # GET /api/students
│   ├── server.js              # Express app entry point
│   ├── package.json
│   ├── .env                   # ← your secrets (not committed)
│   └── .env.example           # ← template (committed)
│
├── frontend/
│   ├── css/                   # (additional stylesheets if any)
│   ├── js/
│   │   └── auth.js            # Client-side auth helpers (apiFetch, requireStudent…)
│   ├── styles.css             # Global design system
│   ├── index.html             # Landing page
│   ├── student_login.html
│   ├── student_signup.html
│   ├── student_dashboard.html # Exam code entry + past results
│   ├── exam_interface.html    # Timed exam UI
│   ├── exam_result.html       # Score, breakdown, certificate
│   ├── admin_login.html
│   ├── admin_signup.html
│   ├── admin_dashboard.html
│   ├── admin_exam_creation.html
│   ├── question_management.html
│   ├── admin_results_overview.html
│   └── student_list.html
│
├── Docs/                      # Additional documentation
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [npm](https://www.npmjs.com/) v9+
- A MongoDB instance — [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free tier) or a local install

---

### 1. Clone the Repository

```bash
git clone https://github.com/RajHarsh03/Online_Exam_System.git
cd Online_Exam_System
```

---

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

---

### 3. Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env
```

Then edit `.env` with your values:

```env
# Generate a strong secret:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your_super_secret_jwt_key_here

# MongoDB Atlas connection string or local URI
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/prashiksha?retryWrites=true&w=majority

PORT=3000
NODE_ENV=development
```

> ⚠️ **Never** commit your real `.env` file. It is already listed in `.gitignore`.

---

### 4. Start the Development Server

```bash
# From inside the /backend directory
npm run dev
```

The server starts at **http://localhost:3000**

The Express server also statically serves the `frontend/` folder, so opening `http://localhost:3000` loads the app.

---

### 5. Open the Application

| URL | Page |
|-----|------|
| `http://localhost:3000` | Landing page |
| `http://localhost:3000/admin_signup.html` | Admin registration |
| `http://localhost:3000/admin_login.html` | Admin login |
| `http://localhost:3000/student_signup.html` | Student registration |
| `http://localhost:3000/student_login.html` | Student login |

---

## 🔌 API Reference

All API routes are prefixed with `/api`. Protected routes require an `Authorization: Bearer <token>` header.

### Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/register` | None | Register a new user (role: student \| admin) |
| `POST` | `/login` | None | Login and receive a JWT |

### Exams — `/api/exams`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/` | Admin | List all exams |
| `POST` | `/` | Admin | Create a new exam |
| `PUT` | `/:id` | Admin | Update an exam |
| `DELETE` | `/:id` | Admin | Delete an exam |
| `POST` | `/join` | Student | Join an exam by code |

### Questions — `/api/questions`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/` | Admin | List all questions |
| `POST` | `/` | Admin | Add a new question |
| `DELETE` | `/:id` | Admin | Delete a question |

### Results — `/api/results`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/` | Any | Students: own published results. Admins: all results |
| `GET` | `/:id` | Any | Get full result detail (answers populated) |
| `POST` | `/` | Student | Submit exam result |
| `PATCH` | `/:id/publish` | Admin | Publish a single result |
| `PATCH` | `/publish-all` | Admin | Publish all unpublished results (`?exam=id` to filter) |

### Students — `/api/students`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/` | Admin | List all registered students |

### Dashboard — `/api/dashboard`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/` | Admin | Aggregated stats (total exams, students, results, pass rate) |

---

## 🧩 Key Workflows

### Admin Flow
```
Sign Up → Log In → Create Exam → Add Questions → Share Exam Code
→ Monitor Results → Publish All Results
```

### Student Flow
```
Sign Up → Log In → Enter Exam Code → Read Instructions → Take Exam
→ Wait for Admin to Publish → View Result + Download Certificate
```

---

## 🖼️ Certificate Generation

When a result is published, students can click **Download Certificate** on the result page. A certificate is drawn using the **HTML5 Canvas API** client-side and downloaded as a `PNG` file. No server-side PDF library needed.

---

## 🔒 Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `JWT_SECRET` | ✅ | — | Secret for signing JWTs. Must be long and random. |
| `MONGODB_URI` | ✅ | — | MongoDB connection string |
| `PORT` | ❌ | `3000` | Port the server listens on |
| `NODE_ENV` | ❌ | `development` | `development` or `production` |

---

## 📦 Scripts

Run from the `backend/` directory:

```bash
npm run dev    # Start with nodemon (auto-restarts on file change)
npm start      # Start with plain node (production)
```

---

## 🙋 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **ISC License**.  
See [LICENSE](https://opensource.org/licenses/ISC) for details.

---

## 👤 Author

**Raj Harsh**  
GitHub: [@RajHarsh03](https://github.com/RajHarsh03)

---

<div align="center">
Made with ❤️ using Node.js, Express & MongoDB
</div>

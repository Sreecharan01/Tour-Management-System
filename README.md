# 🌍 TourPro — Tour Package Management System (MERN Stack)

A full-featured, production-ready Tour Package Management System built with the MERN stack (MongoDB, Express, React, Node.js) with JWT authentication and role-based access control.

---

## 📋 Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [REST API Endpoints](#rest-api-endpoints)
- [JWT Authentication Flow](#jwt-authentication-flow)
- [Setup & Installation](#setup--installation)
- [Demo Accounts](#demo-accounts)
- [Project Structure](#project-structure)

---

## ✨ Features

### Core Modules
| Module | Description |
|---|---|
| 👤 **Users** | Admin & User roles, JWT auth, CRUD management |
| 🌍 **Tour Packages** | Full CRUD, categories, pricing, media, search & filter |
| 📋 **Bookings** | Create, track, update bookings with status workflow |
| 📊 **Reports** | Revenue analytics, booking stats, charts, top tours |
| ⚙️ **Settings** | System-wide configuration, notifications, policies |

### Key Capabilities
- 🔐 **JWT Authentication** — Secure token-based auth with role middleware
- 🛡️ **Role-Based Access Control** — Admin-only routes with `authorize()` middleware
- 🔍 **Advanced Search & Filtering** — Tours by category, difficulty, price, status
- 📈 **Analytics Dashboard** — Revenue trends, booking stats, pie charts
- 📱 **Responsive Design** — Mobile-friendly sidebar & layout
- 🚀 **RESTful API** — Clean, versioned API with error handling

---

## 🛠️ Tech Stack

**Backend**
- Node.js + Express.js
- MongoDB + Mongoose ODM
- JWT (jsonwebtoken) for auth
- bcryptjs for password hashing
- cors, express-validator

**Frontend**
- React 18 + Vite
- React Router v6 (client-side routing)
- Axios (HTTP client with interceptors)
- Recharts (charts & analytics)
- react-hot-toast (notifications)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│           React Frontend             │
│  ┌──────────┐    ┌────────────────┐  │
│  │  Context  │    │  Axios + JWT   │  │
│  │  (Auth)   │    │  Interceptors  │  │
│  └──────────┘    └────────────────┘  │
└──────────────┬──────────────────────┘
               │  HTTP + JWT Token
               ▼
┌─────────────────────────────────────┐
│         Express.js API Server        │
│  ┌──────────┐    ┌────────────────┐  │
│  │   JWT    │    │  Role-Based    │  │
│  │ Middleware│   │  Middleware    │  │
│  └──────────┘    └────────────────┘  │
│  ┌──────────────────────────────────┐│
│  │  Controllers (Tour/Auth/Booking) ││
│  └──────────────────────────────────┘│
└──────────────┬──────────────────────┘
               │  Mongoose ODM
               ▼
┌─────────────────────────────────────┐
│            MongoDB Database          │
│  Users | Tours | Bookings | Settings│
└─────────────────────────────────────┘
```

---

## 📡 REST API Endpoints

### Authentication
```
POST   /api/auth/register          # Register new user
POST   /api/auth/login             # Login and get JWT token
GET    /api/auth/me                # Get current user (Protected)
PUT    /api/auth/update-profile    # Update profile (Protected)
PUT    /api/auth/change-password   # Change password (Protected)
```

### Tour Packages (CRUD)
```
GET    /api/tour                   # Get all tours (Public, with filters)
GET    /api/tour/:id               # Get single tour (Public)
POST   /api/tour                   # Create tour (Admin only)
PUT    /api/tour/:id               # Update tour (Admin only)
DELETE /api/tour/:id               # Delete tour (Admin only)
GET    /api/tour/stats             # Tour statistics (Admin only)
```

### Bookings
```
GET    /api/bookings               # Get bookings (Admin: all, User: own)
POST   /api/bookings               # Create booking (Protected)
PUT    /api/bookings/:id           # Update booking status (Admin only)
```

### Reports & Analytics
```
GET    /api/reports                # Full analytics report (Admin only)
```

### User Management
```
GET    /api/users                  # List all users (Admin only)
GET    /api/users/:id              # Get user by ID (Admin only)
POST   /api/users                  # Create user (Admin only)
PUT    /api/users/:id              # Update user (Admin only)
DELETE /api/users/:id              # Delete user (Admin only)
PATCH  /api/users/:id/toggle-status # Toggle active status (Admin only)
```

### Settings
```
GET    /api/settings               # Get settings (Admin only)
PUT    /api/settings               # Update settings (Admin only)
```

---

## 🔐 JWT Authentication Flow

```
1. User registers
   ├── Password hashed with bcryptjs (salt rounds: 12)
   ├── User saved to MongoDB
   └── JWT token generated and returned

2. User logs in
   ├── Email/password validated against DB
   ├── JWT token signed with JWT_SECRET
   └── Token returned to frontend

3. Token Storage (Frontend)
   ├── Token stored in localStorage ('tourpro_token')
   └── Axios interceptor auto-attaches to every request:
       Authorization: Bearer <token>

4. Backend Middleware (every protected route)
   ├── protect() — Extracts & verifies JWT token
   ├── Fetches user from DB to validate they exist & are active
   └── Attaches user to req.user

5. Role Middleware
   ├── authorize('admin') — Checks req.user.role
   ├── If not authorized: 403 Forbidden
   └── If authorized: continue to controller

6. Token Expiry
   ├── Default: 7 days
   └── On expiry: 401 → Frontend redirects to /login
```

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js 18+
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Step 1: Clone & Install Backend

```bash
cd backend
npm install
```

Create `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tour_management
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d
NODE_ENV=development
```

### Step 2: Seed Database

```bash
cd backend
npm run seed
```

This creates:
- 1 Admin account: `admin@tourpro.com` / `admin123`
- 2 User accounts: `john@example.com` / `user123`
- 6 Sample tours with bookings

### Step 3: Start Backend

```bash
cd backend
npm run dev
# API running on http://localhost:5000
```

### Step 4: Install & Start Frontend

```bash
cd frontend
npm install
npm run dev
# App running on http://localhost:3000
```

---

## 👤 Demo Accounts

| Role | Email | Password | Access |
|------|-------|----------|--------|
| **Admin** | admin@tourpro.com | admin123 | Full access (Dashboard, Tours, Bookings, Users, Reports, Settings) |
| **User** | john@example.com | user123 | Tours (view), Bookings (own), Profile |
| **User** | jane@example.com | user123 | Tours (view), Bookings (own), Profile |

---

## 📁 Project Structure

```
tour-management/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # MongoDB connection
│   │   ├── controllers/
│   │   │   ├── authController.js     # Register, login, profile
│   │   │   ├── tourController.js     # Tour CRUD
│   │   │   ├── bookingController.js  # Booking CRUD + reports
│   │   │   └── adminController.js    # Users + settings
│   │   ├── middleware/
│   │   │   ├── auth.js               # JWT protect + authorize
│   │   │   └── error.js              # Global error handler
│   │   ├── models/
│   │   │   ├── User.js               # User schema + bcrypt
│   │   │   ├── Tour.js               # Tour package schema
│   │   │   ├── Booking.js            # Booking schema
│   │   │   └── Settings.js           # System settings
│   │   ├── routes/
│   │   │   └── index.js              # All API routes
│   │   ├── seed.js                   # DB seed script
│   │   └── server.js                 # Express app entry point
│   ├── .env
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── Layout.jsx            # Sidebar + navigation
    │   ├── context/
    │   │   └── AuthContext.jsx       # Auth state + JWT management
    │   ├── pages/
    │   │   ├── LoginPage.jsx         # Login with demo fill
    │   │   ├── RegisterPage.jsx      # Registration
    │   │   ├── DashboardPage.jsx     # Stats + charts
    │   │   ├── ToursPage.jsx         # Tour CRUD + grid view
    │   │   ├── BookingsPage.jsx      # Booking management
    │   │   ├── UsersPage.jsx         # User management (Admin)
    │   │   ├── ReportsPage.jsx       # Analytics (Admin)
    │   │   ├── SettingsPage.jsx      # System config (Admin)
    │   │   └── ProfilePage.jsx       # My account
    │   ├── utils/
    │   │   ├── api.js                # Axios instance + interceptors
    │   │   └── helpers.js            # Formatters + constants
    │   ├── App.jsx                   # Routes + guards
    │   ├── index.css                 # Global styles
    │   └── main.jsx                  # Entry point
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## 🔧 Environment Variables

```env
# Backend
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tour_management
JWT_SECRET=change_this_in_production
JWT_EXPIRE=7d
NODE_ENV=development
```

---

## 📄 License

MIT License — Built with ❤️ using the MERN stack

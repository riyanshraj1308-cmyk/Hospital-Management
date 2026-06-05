# 🏥 MediCore — Hospital Management Platform

Full-stack Hospital Management System built with **Node.js + Express** (backend) and **React + Vite** (frontend), backed by **MongoDB**.

---

## 🚀 Quick Start (3 steps)

### Prerequisites
- [Node.js 18+](https://nodejs.org)
- [MongoDB](https://www.mongodb.com/try/download/community) running locally on port `27017`
  - Or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster

### Step 1 — Install dependencies
```bash
# From project root
cd backend && npm install
cd ../frontend && npm install
```

### Step 2 — Start the backend
```bash
cd backend
npm run dev
# Should print: 🏥 MediCore API running → http://localhost:5000
```

Verify it works: open http://localhost:5000/api/health in your browser.  
You should see `{"status":"OK"}`. If not, check MongoDB is running.

### Step 3 — Start the frontend
```bash
# In a NEW terminal
cd frontend
npm run dev
# Opens at http://localhost:5173
```

### Step 4 — Register & Login
Open **http://localhost:5173**, click **"Create Account"**, fill in your details and you're in.

---

## ⚙️ Configuration

`backend/.env` (already created, edit if needed):
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/medicore
JWT_SECRET=medicore_jwt_secret_change_in_production_2024
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

To use **MongoDB Atlas** instead of local MongoDB:
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/medicore
```

---

## 📁 Project Structure

```
hospital-management/
├── backend/
│   ├── src/
│   │   ├── config/       # DB connection
│   │   ├── controllers/  # Route handlers
│   │   ├── middleware/   # Auth, errors
│   │   ├── models/       # Mongoose schemas
│   │   └── routes/       # API routes
│   ├── .env              # ← already configured
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable UI
│   │   ├── hooks/        # Auth context
│   │   ├── pages/        # Page views
│   │   ├── utils/        # Axios client
│   │   └── styles/       # Tailwind CSS
│   └── vite.config.js    # Proxy: /api → localhost:5000
│
└── README.md
```

---

## 🔌 How the proxy works

Vite proxies all `/api` requests from the frontend to `http://localhost:5000`.  
**Both servers must be running** — backend on port 5000, frontend on port 5173.

---

## 📡 API

See [`docs/API.md`](./docs/API.md) for the full reference.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | ❌ Open | Create account |
| POST | `/api/auth/login` | ❌ Open | Login |
| GET | `/api/patients` | ✅ | List patients |
| POST | `/api/appointments` | ✅ | Book appointment |
| GET | `/api/dashboard/stats` | ✅ | Dashboard metrics |

---

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (jsonwebtoken) |

---

## 📄 License
MIT

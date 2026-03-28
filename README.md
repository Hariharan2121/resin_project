# RKL Trove — Premium Resin E-Commerce

A full-stack e-commerce web application for **RKL Trove**, a handcrafted resin products brand.

Built with **React (Vite) + Tailwind CSS** on the frontend and **Node.js + Express + MySQL** on the backend.

---

## ✨ Features

- 🔐 User authentication (Signup / Login) with **bcrypt** + **JWT**
- 🛍️ Beautiful product catalog with search
- 🛒 Cart system with quantity management, persisted in **localStorage**
- 📧 Order confirmation emails sent to admin via **Nodemailer**
- 📱 Fully responsive, premium UI with soft pastel resin aesthetic

---

## 📁 Project Structure

```
rkl-trove/
├── database.sql            ← SQL schema + seed data
├── backend/
│   ├── .env.example        ← Copy to .env and fill credentials
│   ├── server.js           ← Express app entry point
│   ├── db.js               ← MySQL connection pool
│   ├── middleware/
│   │   └── authMiddleware.js
│   └── routes/
│       ├── auth.js         ← /api/signup, /api/login
│       ├── products.js     ← /api/products
│       └── order.js        ← /api/order (protected)
└── frontend/
    ├── .env.example        ← Copy to .env
    ├── src/
    │   ├── App.jsx
    │   ├── main.jsx
    │   ├── index.css
    │   ├── context/
    │   │   ├── AuthContext.jsx
    │   │   └── CartContext.jsx
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── ProductCard.jsx
    │   │   └── ProtectedRoute.jsx
    │   └── pages/
    │       ├── Home.jsx
    │       ├── Login.jsx
    │       ├── Signup.jsx
    │       └── Cart.jsx
    └── ...
```

---

## 🛠️ Setup Instructions

### Prerequisites

- Node.js v16+
- MySQL 8.0+

---

### 1. Database Setup

1. Open your MySQL client (MySQL Workbench, DBeaver, or CLI).
2. Run the SQL script to create the database, tables, and sample products:

```bash
mysql -u root -p < database.sql
```

Or paste the contents of `database.sql` directly into your MySQL client and execute it.

---

### 2. Backend Setup

```bash
cd backend
```

**Copy and configure `.env`:**

```bash
cp .env.example .env
```

Edit `.env` and fill in:

| Variable | Description |
|---|---|
| `DB_HOST` | MySQL host (usually `localhost`) |
| `DB_PORT` | MySQL port (usually `3306`) |
| `DB_USER` | MySQL username |
| `DB_PASSWORD` | MySQL password |
| `DB_NAME` | `rkl_trove` |
| `JWT_SECRET` | Any long random string |
| `PORT` | `5000` (default) |
| `MAIL_HOST` | e.g. `smtp.gmail.com` |
| `MAIL_PORT` | `587` for TLS |
| `MAIL_USER` | Your Gmail address |
| `MAIL_PASS` | Gmail App Password ([how to get one](https://support.google.com/accounts/answer/185833)) |
| `ADMIN_EMAIL` | Email address that receives order notifications |

**Install dependencies and run:**

```bash
npm install
node server.js
```

You should see:
```
✅  MySQL connected successfully.
🚀  RKL Trove API running on http://localhost:5000
```

---

### 3. Frontend Setup

```bash
cd frontend
cp .env.example .env
```

The default `VITE_API_URL=http://localhost:5000` points to the backend. Change only if needed.

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔑 API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/signup` | ❌ | Register a new user |
| POST | `/api/login` | ❌ | Login, returns JWT |
| GET | `/api/products` | ❌ | List all products |
| POST | `/api/order` | ✅ JWT | Place order, sends admin email |
| GET | `/api/health` | ❌ | Server health check |

---

## 📧 Nodemailer (Gmail) Setup

1. Enable **2-Step Verification** on your Google account.
2. Go to **Google Account → Security → App Passwords**.
3. Generate an App Password for "Mail → Windows Computer" (or any label).
4. Use that App Password as `MAIL_PASS` in `backend/.env`.

> ⚠️ Never use your actual Google account password — always use an App Password.

---

## 🎨 Tech Stack

| Layer | Technology |
|---|---|
| Frontend UI | React 18 + Vite 4 |
| Styling | Tailwind CSS 3 |
| Routing | React Router v6 |
| HTTP Client | Axios |
| Notifications | react-hot-toast |
| Icons | Lucide React |
| Backend | Node.js + Express |
| Database | MySQL (via mysql2) |
| Auth | bcrypt + JWT |
| Email | Nodemailer |

---

© 2024 RKL Trove. Crafted with ♥

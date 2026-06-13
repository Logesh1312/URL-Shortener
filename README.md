# 🔗 URL Shortener — Full Stack App

A complete URL shortener built with **React + Vite** (frontend), **Node.js/Express** (backend), and **MongoDB Atlas**.

---

## ✅ Features

### Mandatory
- User signup & login with JWT authentication
- Protected dashboard routes
- URL shortening with unique 6-char codes
- Redirect to original URL on short code visit
- URL validation (must be valid http/https)
- Dashboard showing: original URL, short URL, created date, total clicks
- Delete shortened URLs
- Copy short URL from UI
- Analytics: click count, last visited time, visit history

### Bonus
- ✅ Custom alias for short URL
- ✅ QR code generation (downloadable PNG)
- ✅ Expiry date for links (with expired badge)
- ✅ Daily click trend charts (per-link & overview)
- ✅ Public stats page (`/stats/:code`)
- ✅ Edit destination URL & expiry
- ✅ Bulk URL shortening via CSV upload
- ✅ Overview dashboard with top links

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router v6 |
| Charts | Recharts |
| QR Code | qrcode |
| HTTP Client | Axios |
| Backend | Node.js, Express |
| Database | MongoDB Atlas (Mongoose) |
| Auth | JWT + bcrypt |
| File Upload | Multer |
| CSV Parsing | csv-parse |

---

## ⚙️ Setup

### 1. Server
```bash
cd server
npm install
npm start
# or: npm run dev  (uses nodemon)
```
Runs on **http://localhost:5000**

### 2. Client
```bash
cd client
npm install
npm run dev
```
Runs on **http://localhost:3000**  
API calls to `/api/...` are proxied to the backend automatically via Vite.

---

## 📁 Project Structure

```
url shortner/
├── server/
│   ├── models/
│   │   ├── Url.js
│   │   └── User.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── url.js
│   │   └── stats.js
│   ├── middleware/
│   │   └── auth.js
│   ├── .env
│   ├── server.js
│   └── package.json
└── client/
    ├── src/
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Signup.jsx
    │   │   ├── Dashboard.jsx
    │   │   └── PublicStats.jsx
    │   ├── api.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    ├── .env
    └── package.json
```

---

## 📦 CSV Bulk Upload Format

CSV must have a `url` column:
```csv
url
https://google.com
https://github.com
https://youtube.com
```

---

## 🔑 Environment Variables

### server/.env
```
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secret
PORT=5000
BASE_URL=http://localhost:5000
```

### client/.env
```
VITE_BASE_URL=http://localhost:5000
```

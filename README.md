# 🌉 TrustBridge – Universal Credential Verification Platform

> **Verify Once. Trust Everywhere.**
>
> A production-grade full-stack hackathon project — a cross-domain credential verification ecosystem where credentials are verified once and securely reused across institutions.

---

## 📸 Platform Overview

| Role | What they do |
|------|-------------|
| 👤 **User** | Upload credentials, manage wallet, sync to DigiLocker, chat with AI |
| 🏛️ **Issuer** | Review pending requests, approve/reject/revoke credentials |
| 🔍 **Verifier** | Verify credentials via ID or QR code, view logs |
| 📡 **Public** | Live Radar dashboard, public credential verification tool |

---

## 🗂️ Project Structure

```
trustbridge/
├── backend/
│   ├── config/          # DB connection
│   ├── controllers/     # Auth, Credential, Issuer, Verifier, DigiLocker, AI, Radar
│   ├── middleware/       # JWT auth, role RBAC, Cloudinary upload
│   ├── models/          # User, Credential, VerificationLog, ActivityLog, DigiLockerVault
│   ├── routes/          # Express route files
│   ├── services/        # Email (Nodemailer), Groq AI, Socket.io, Activity Logger
│   ├── utils/           # Trust score calculator, seeder
│   ├── server.js        # Entry point
│   └── .env.example
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/  # DashboardLayout, reusable UI
│       ├── context/     # AuthContext
│       ├── pages/
│       │   ├── auth/    # Login, Register, OTP
│       │   ├── public/  # Landing, About, PublicVerify
│       │   ├── user/    # Dashboard, Wallet, Upload, DigiLocker, AI Assistant
│       │   ├── issuer/  # Dashboard, Queue, History
│       │   ├── verifier/# Dashboard, Logs
│       │   └── radar/   # Live Radar Dashboard
│       ├── services/    # Axios API layer
│       └── styles/      # Global CSS (claymorphism)
└── package.json         # Root concurrent runner
```

---

## ⚡ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TailwindCSS, React Router v6, Chart.js, Socket.io-client |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas (Mongoose) |
| Auth | JWT, bcryptjs, Nodemailer OTP (2FA) |
| File Storage | Cloudinary |
| AI | Groq API (Llama 3 70B) |
| Real-time | Socket.io |
| Hosting | Vercel (Frontend) + Render (Backend) |

---

## 🚀 Local Setup Instructions

### Prerequisites
- Node.js ≥ 18
- MongoDB Atlas account (free tier works)
- Cloudinary account (free tier)
- Groq API key (free at console.groq.com)
- Gmail account with App Password enabled

---

### 1. Clone & Install

```bash
git clone https://github.com/your-username/trustbridge.git
cd trustbridge

# Install all dependencies
npm run install:all
```

---

### 2. Configure Backend Environment

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# MongoDB Atlas
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/trustbridge

# JWT
JWT_SECRET=your_super_long_secret_key_min_32_chars
JWT_EXPIRE=7d

# Gmail (enable 2-step verification → App Passwords → create one)
EMAIL_USER=youremail@gmail.com
EMAIL_PASS=your_16_char_app_password
EMAIL_FROM=TrustBridge <noreply@trustbridge.io>

# Cloudinary (get from cloudinary.com dashboard)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Groq AI (get from console.groq.com)
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxx

# OTP Expiry
OTP_EXPIRE_MINUTES=10
```

---

### 3. Configure Frontend Environment

```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

---

### 4. Run Locally

From the project root:

```bash
npm run dev
```

This starts both frontend (`localhost:3000`) and backend (`localhost:5000`) concurrently.

Or run them separately:
```bash
npm run dev:backend    # Terminal 1
npm run dev:frontend   # Terminal 2
```

---

## 🔐 Authentication Flow

### Standard Login
1. User enters email + password
2. If 2FA disabled → JWT returned immediately
3. If 2FA enabled → OTP sent via email → Enter OTP → JWT returned

### Toggle 2FA
- Go to Dashboard → Security section → Toggle 2FA on/off

---

## 🗝️ Core Features Walkthrough

### As a User
1. Register with role **Individual**
2. Upload a credential (JPG/PNG/PDF)
3. Wait for an issuer to verify it
4. Once verified: copy Credential ID, view QR code, sync to DigiLocker
5. Chat with the AI assistant for help

### As an Issuer
1. Register with role **Issuer** + organization name
2. Go to Verification Queue
3. Review document, approve with optional notes/expiry OR reject with reason
4. View issued history and revoke if needed

### As a Verifier
1. Register with role **Verifier** + organization name
2. Enter a Credential ID → instant verification result
3. View AI explanation of result
4. View all past verification logs

### Public
- Visit `/verify` → enter any Credential ID → see verification result
- Visit `/radar` → Live Credential Radar with charts and activity feed

---

## 🤖 Groq AI Capabilities

| Feature | Description |
|---------|-------------|
| **AI Chat Assistant** | Answers platform questions, guides users through features |
| **Document Analysis** | Detects missing signatures, suspicious formatting, incomplete info |
| **Verification Explanation** | Explains verification result in plain English |

---

## 🔍 Fraud Detection System

When a credential is verified:
1. A cryptographic SHA-256 hash of the document was generated at upload time
2. During re-verification, if a `documentHash` is passed, it's compared to the stored hash
3. If mismatch → result set to `tampered` + fraud alert logged + radar notified in real-time

---

## 📡 Live Radar Dashboard

The radar shows:
- **Live Activity Feed** – real-time credential events via Socket.io
- **7-Day Timeline** – Line chart of issuances and verifications
- **Category Breakdown** – Doughnut chart of credential categories
- **Top Issuers** – Ranked by reputation score
- **Fraud Alerts** – Recent tampering detections
- **Platform Stats** – Total credentials, verifications, users, issuers, fraud count

---

## 🔒 Security Features

- **bcryptjs** password hashing (salt rounds: 12)
- **JWT** authentication with expiry
- **Role-Based Access Control** (user / issuer / verifier)
- **Rate limiting** on all API routes (stricter on auth)
- **Helmet.js** security headers
- **OTP-based 2FA** via email
- **Cryptographic fraud detection** via SHA-256 document hashing

---

## 🌐 Deployment

### Backend → Render
1. Push backend folder to GitHub
2. New Web Service on render.com
3. Build command: `npm install`
4. Start command: `node server.js`
5. Add all environment variables from `.env`

### Frontend → Vercel
1. Push frontend folder to GitHub
2. New Project on vercel.com
3. Framework: Create React App
4. Add environment variables:
   - `REACT_APP_API_URL` = your Render backend URL + `/api`
   - `REACT_APP_SOCKET_URL` = your Render backend URL

---

## 📊 MongoDB Collections

| Collection | Purpose |
|-----------|---------|
| `users` | All users (user/issuer/verifier roles) with issuer reputation data |
| `credentials` | Credential requests and verified credentials |
| `verificationlogs` | Every verification attempt with fraud detection results |
| `activitylogs` | Ecosystem-wide activity for the Radar dashboard |
| `digilockervaults` | DigiLocker vault per user with synced documents |

---

## 🎨 UI Design System

**Style:** Claymorphism with Green/Mint theme

- Soft shadows with clay depth effect
- Frosted glass cards (`backdrop-filter: blur`)
- Rounded corners (border-radius: 20px)
- Plus Jakarta Sans font
- Smooth CSS animations (float, slide-up, fade-in)
- Fully responsive (mobile sidebar)

---

## 🏗️ API Reference

### Auth
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login (returns OTP required flag) |
| POST | `/api/auth/verify-otp` | No | Verify OTP for 2FA |
| POST | `/api/auth/resend-otp` | No | Resend OTP |
| POST | `/api/auth/toggle-2fa` | JWT | Toggle 2FA on/off |
| GET  | `/api/auth/me` | JWT | Get current user |

### Credentials
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/credentials/upload` | User | Upload credential document |
| GET  | `/api/credentials/wallet` | User | Get all user credentials |
| GET  | `/api/credentials/verify/:id` | Public | Public credential verification |

### Issuer
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET  | `/api/issuer/queue` | Issuer | Pending requests |
| PUT  | `/api/issuer/approve/:id` | Issuer | Approve & issue |
| PUT  | `/api/issuer/reject/:id` | Issuer | Reject with reason |
| PUT  | `/api/issuer/revoke/:id` | Issuer | Revoke verified credential |
| GET  | `/api/issuer/history` | Issuer | All issued credentials |
| GET  | `/api/issuer/stats` | Issuer | Dashboard stats |

### Verifier
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/verifier/verify` | Verifier | Verify by credential ID |
| GET  | `/api/verifier/logs` | Verifier | Verification logs |

### DigiLocker
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/digilocker/initiate` | User | Send phone OTP |
| POST | `/api/digilocker/verify` | User | Verify OTP & link |
| POST | `/api/digilocker/sync/:id` | User | Sync credential to vault |
| GET  | `/api/digilocker/vault` | User | Get vault contents |

### AI
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/ai/chat` | Any | Chat with AI assistant |
| POST | `/api/ai/analyze` | User | Analyze credential document |

### Radar
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/radar/activity` | Public | Live activity feed |
| GET | `/api/radar/stats` | Public | Dashboard statistics |
| GET | `/api/radar/trends` | Public | Category trends |
| GET | `/api/radar/issuers` | Public | Top issuers |
| GET | `/api/radar/timeline` | Public | 7-day activity timeline |
| GET | `/api/radar/fraud-alerts` | Public | Recent fraud detections |

---

## 🧑‍💻 Built With ❤️ for Hackathon

**TrustBridge** – *Securing credentials, building trust across every ecosystem.*

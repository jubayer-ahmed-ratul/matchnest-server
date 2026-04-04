# MatchNest — Backend

REST API for the MatchNest matrimony platform built with Node.js, Express, and MongoDB.

## Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Firebase Admin SDK (Google OAuth)
- Stripe (Payments)
- bcryptjs

## Getting Started

### 1. Clone & Install

```bash
cd backend
npm install
```

### 2. Environment Variables

Create a `.env` file in the `backend` folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173

STRIPE_SECRET_KEY=your_stripe_secret_key

FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### 3. Run

```bash
npm run dev
```

Server runs on `http://localhost:5000`

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/auth/register | Register |
| POST | /api/auth/login | Login |
| POST | /api/auth/google | Google OAuth |
| GET | /api/auth/me | Get current user |
| GET/PUT | /api/profile | Get/update profile |
| GET | /api/search | Search profiles |
| GET | /api/search/suggestions | Smart suggestions |
| GET | /api/search/:id | Get profile by ID |
| POST | /api/interest | Send interest |
| GET | /api/interest/received | Received interests |
| GET | /api/interest/sent | Sent interests |
| POST | /api/chat/request | Send chat request |
| GET | /api/chat | Get accepted chats |
| GET | /api/chat/pending | Pending chat requests |
| POST | /api/payment/checkout | Create Stripe session |
| POST | /api/payment/confirm | Confirm payment |
| GET | /api/stories | Public approved stories |
| POST | /api/stories | Submit story |
| GET | /api/admin/stats | Admin overview stats |
| GET | /api/admin/users | All users |

## Features

- JWT + Google OAuth authentication
- Role-based access (user / admin)
- Profile verification system
- Smart match suggestions (religion, education, lifestyle, age, location)
- Plan-based access control (Free / Premium / Elite)
- Stripe payment integration
- Polling-based chat system
- Success story moderation with drag-drop ordering
- Contact message management

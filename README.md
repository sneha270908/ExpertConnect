# ExpertConnect — Real-Time Expert Session Booking System

A full-stack web application for booking 1-on-1 sessions with verified experts. Built with React, Node.js, Express, MongoDB, and Socket.io for real-time slot updates.

---

## 🏗 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6 |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Real-Time | Socket.io |
| HTTP Client | Axios |

---

## 📁 Project Structure

```
expert-booking/
├── backend/
│   ├── config/
│   │   └── seed.js           # Auto-seeds 12 experts on first run
│   ├── controllers/
│   │   ├── expertController.js
│   │   └── bookingController.js
│   ├── models/
│   │   ├── Expert.js
│   │   └── Booking.js
│   ├── routes/
│   │   ├── expertRoutes.js
│   │   └── bookingRoutes.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── context/
    │   │   └── SocketContext.js
    │   ├── pages/
    │   │   ├── ExpertList.js     # Screen 1
    │   │   ├── ExpertDetail.js   # Screen 2
    │   │   ├── BookingForm.js    # Screen 3
    │   │   └── MyBookings.js     # Screen 4
    │   ├── utils/
    │   │   └── api.js
    │   ├── App.js
    │   ├── App.css
    │   ├── index.js
    │   └── index.css
    ├── .env.example
    └── package.json
```

---

## 🚀 Setup & Run

### Prerequisites
- Node.js v18+
- MongoDB running locally OR a MongoDB Atlas URI

### 1. Clone the repo
```bash
git clone <your-repo-url>
cd expert-booking
```

### 2. Backend Setup
```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI
npm install
npm run dev
```

Backend runs at: `http://localhost:5000`

### 3. Frontend Setup
```bash
cd frontend
cp .env.example .env
npm install
npm start
```

Frontend runs at: `http://localhost:3000`

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/experts` | List experts (pagination + filter + search) |
| GET | `/api/experts/:id` | Expert detail with time slots |
| POST | `/api/bookings` | Create a booking |
| GET | `/api/bookings?email=` | Get bookings by email |
| PATCH | `/api/bookings/:id/status` | Update booking status |
| GET | `/health` | Health check |

### Query Parameters for GET /api/experts
- `page` — page number (default: 1)
- `limit` — items per page (default: 6)
- `category` — filter by category
- `search` — search by name

---

## ⚡ Key Features

### ✅ Real-Time Slot Updates (Socket.io)
- Users join a room for each expert page they view
- When a slot is booked, all connected users instantly see it disabled
- If a user has selected a slot that gets booked mid-session, they're notified immediately

### ✅ Double Booking Prevention (Race Condition Handling)
Two-layer protection:
1. **MongoDB Transaction + findOneAndUpdate** — atomically marks slot as booked only if it's still available
2. **Compound Unique Index** on `{expertId, date, timeSlot}` — database-level constraint as fallback

### ✅ Validation
- Frontend: real-time field validation before submit
- Backend: Mongoose schema validators + custom checks
- Phone: Indian mobile number format (10 digits, starting 6-9)

### ✅ Error Handling
- Meaningful HTTP status codes (400, 404, 409, 500)
- Descriptive error messages
- Loading and error states on every screen

---

## 📱 Screens

1. **Expert Listing** — search, category filter, pagination, rating display
2. **Expert Detail** — bio, slots grouped by date, live slot status
3. **Booking Form** — validated form, date/time selection, success screen
4. **My Bookings** — search by email, status badges (Pending/Confirmed/Completed)

---

## 🌐 Environment Variables

**Backend `.env`:**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/expert-booking
CLIENT_URL=http://localhost:3000
```

**Frontend `.env`:**
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

---

## 📦 Submission

- GitHub: [Add your repo link]
- Demo Video: [Add Loom/YouTube link]
- Deployed URL: [Optional]

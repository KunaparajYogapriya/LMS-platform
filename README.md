# Modern Learning Management System (LMS)

A full-stack Learning Management System built with a React/Next.js frontend and a Node.js/Express backend. The application implements sequential course progression, playing YouTube videos natively within the app with progress tracking, complete authentication with JWT, and state management using Zustand.

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- Tailwind CSS Layer for styling
- Zustand (State Management)
- Axios (HTTP Client with Interceptors)
- React-YouTube for playing video content
- Lucide React (Icons)

### Backend
- Node.js & Express.js
- MySQL Database
- JSON Web Tokens (JWT Access/Refresh Tokens)
- bcrypt (Password Hashing)

---

## Folder Structure

```
/
├── backend/            # Express.js Application Server
│   ├── src/            # Core modules, logic, middlewares
│   ├── database/       # Schema files
│   ├── package.json    # Backend dependencies
│   └── seed.js         # Dummy data generator
│
└── frontend/           # Next.js Application Client
    ├── src/app/        # App Router Pages & Layouts
    ├── src/components/ # UI Components (Sidebar, VideoPlayer, Sidebar)
    ├── src/store/      # Zustand global state (auth, videos, subject tree)
    ├── src/lib/        # Utilities including API wrapper
    └── package.json    # Frontend dependencies
```

---

## Setup Instructions

### 1. Database Setup
1. Make sure you have **MySQL** running.
2. Create a new database in your MySQL instance:
   ```sql
   CREATE DATABASE lms_db;
   ```

### 2. Backend Setup
1. Navigate to the backend directory:
   ```sh
   cd backend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Update the `.env` file credentials to match your MySQL setup:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=lms_db
   DB_PORT=3306
   JWT_ACCESS_SECRET=supersecretaccess
   JWT_REFRESH_SECRET=supersecretrefresh
   FRONTEND_URL=http://localhost:3000
   ```
4. Run the seeder to construct the schema and generate sample data:
   ```sh
   npm run seed
   ```
5. Start the backend server:
   ```sh
   npm run dev
   ```

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```sh
   cd frontend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the Next.js development server:
   ```sh
   npm run dev
   ```

4. Submitting queries to the Backend requires `.env.local` to exist optionally, otherwise it defaults to port 5000. 
   Create `.env.local` inside `frontend/` if needed:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

---

## Features

- **Strict Progressive Unlocking**: Videos are blocked out until the immediate previous video holds an `is_completed: true` state on the database. 
- **Auto Tracking**: The React video player synchronizes progress with the backend every 5 seconds.
- **Smart Navigation**: A comprehensive sidebar tracks current completion percentages visually and links directly to available lessons.
- **Auto Video Transition**: Finishing a video programmatically redirects you to the next adjacent unlocked course material.
- **Persistent Sessions**: Access tokens last 15 minutes, falling back to HTTP-only cookie-based refresh tokens (lasting 30 days).

## Using the System 
Use the credentials populated heavily by the seed script:
**Username**: `user@example.com`
**Password**: `password123`

Navigate directly to `http://localhost:3000` to experiment with your new LMS Platform. 

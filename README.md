# 🚀 Request Management System

A full-stack web application built with **Next.js, React, and TypeScript** that implements a structured workflow for managing requests. The system features **Role-Based Access Control (RBAC)** and a **Finite State Machine (FSM)** to enforce strict status transitions — ensuring data integrity and clear audit trails.

---

## ✨ Features

- **🔀 Role Switching** — Toggle between **Creator** (submit/cancel) and **Reviewer** (approve/reject) roles to test different permissions.
- **⚙️ State Machine Logic** — Requests follow a strict, validated path: `Draft → Submitted → Approved / Rejected / Cancelled`.
- **🛡️ Backend Validation** — All inputs and state transitions are validated using **Zod** and **TypeScript** for end-to-end type safety.
- **📱 Responsive UI** — Built with **Tailwind CSS 4** for a clean, modern, and mobile-friendly interface.
- **🧠 In-Memory Storage** — Requests are stored server-side using a module-scoped variable (no database setup required).

---

## 📋 Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** (comes with Node.js)

---

## 🚦 Getting Started

Follow these steps to run the project locally:

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Other Commands

| Command           | Description                        |
| ----------------- | ---------------------------------- |
| `npm run dev`     | Start the development server       |
| `npm run build`   | Build the project for production   |
| `npm start`       | Start the production server        |
| `npm run lint`    | Run ESLint across the codebase     |

---

## 🧰 Tech Stack

| Technology        | Purpose                    |
| ----------------- | -------------------------- |
| **Next.js**       | Full-stack React framework |
| **React**         | UI component library       |
| **TypeScript**    | Type-safe development      |
| **Zod**           | Input & state validation   |
| **Tailwind CSS**  | Utility-first styling      |
| **In-Memory**     | Server-side data storage   |

---

## 🔄 Workflow (State Machine)

The system enforces the following state transitions:

| Current Status | Allowed Next Status               | Required Role                                   |
| -------------- | --------------------------------- | ----------------------------------------------- |
| **Draft**      | `Submitted`, `Cancelled`          | Creator                                         |
| **Submitted**  | `Approved`, `Rejected`, `Cancelled` | Reviewer (Approve/Reject), Creator (Cancel)   |
| **Approved**   | *(End State)*                     | N/A                                             |
| **Rejected**   | *(End State)*                     | N/A                                             |
| **Cancelled**  | *(End State)*                     | N/A                                             |

**Logic:** Only valid transitions are permitted. Any invalid attempt returns an error from the API.

---

## 🌐 API Endpoints

### `GET /api/requests`

Returns all requests stored in memory.

**Response:** `200 OK`
```json
[
  {
    "id": "abc123...",
    "title": "Annual Leave",
    "description": "Requesting 3 days off",
    "status": "DRAFT",
    "createdBy": "user1"
  }
]
```

### `POST /api/requests`

Creates a new request in `DRAFT` status.

**Request Body:**
```json
{
  "title": "Annual Leave",
  "description": "Requesting 3 days off",
  "userId": "user1"
}
```

**Response:** `201 Created`

### `PUT /api/requests`

Updates the status of an existing request (validated by the state machine).

**Request Body:**
```json
{
  "id": "abc123...",
  "status": "SUBMITTED",
  "role": "CREATOR"
}
```

**Response:** `200 OK` on success, `400 Bad Request` with error message on invalid transition.

---

## 📄 License

This project is for demonstration and learning purposes.


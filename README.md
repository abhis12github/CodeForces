# 🚀 Codeforces User Management Dashboard

A full-stack dashboard for managing and tracking Codeforces users. Features include profile syncing, recent submissions, contest history, user inactivity detection, and automatic email reminders.

## 📽 Demo Video

https://github.com/user-attachments/assets/a1fc7d4e-458e-4c48-b515-90d7c488fc53
---

## 🛠️ Features

- 🔍 Search and view Codeforces user profiles
- 📊 View rating, rank, and contest history
- 🧠 Detect inactive users and send reminder emails
- 🔄 Daily automatic sync using cron jobs
- 📈 Display recent submissions and stats

---

## ⚙️ Tech Stack

- **Frontend**: React, Tailwind CSS, Axios
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Utilities**: Nodemailer, node-cron

---

## 📦 Getting Started

### Prerequisites

- Node.js `>= 16`
- MongoDB running locally or hosted (e.g., MongoDB Atlas)

### Clone the Repo

```bash 
git clone https://github.com/abhis12github/CodeForces.git
```

### 📥 Install Dependencies

Backend
- cd backend
- npm install

Frontend
- cd ../frontend
- npm install

### 🔐 Environment Variables
Backend
- PORT=4000
- FRONTEND_URL=http://localhost:5173
- MONGOOSE_URI=your_mongo_db_connection_string
- EMAIL_USER=your_email@example.com
- EMAIL_PASS=your_email_app_password 

### 🧪 Running Locally
Backend
- cd backend
- nodemon index.js

Frontend
- cd frontend
- npm run dev 


## API Reference

#### Get all users

```http
  GET /api/v1/users
```

#### Create new user

```http
  POST /api/v1/users
```
| Parameter (body) | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `handle`      | `string` | *Required**. codeforces handle of user to be created |

#### Get user by codeforces handle

```http
  GET /api/v1/users/${handle}
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `handle`      | `string` | *Required**. codeforces handle of user to fetched |

#### Get contest history by codeforces handle

```http
  GET /api/v1/contests/${handle}
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `handle`      | `string` | *Required**. codeforces handle of user to fetched |

#### Get submissions by codeforces handle

```http
  GET /api/v1/submissions/${handle}
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `handle`      | `string` | *Required**. codeforces handle of user to fetched |


## Authors

- [Abhishek Anand](https://github.com/abhis12github)





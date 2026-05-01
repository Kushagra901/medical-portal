# 🐳 Medical Portal — Docker Setup Guide

This guide explains how to run the **Medical Portal** project on **any laptop** using Docker. No need to install Node.js, MongoDB, or anything else — just Docker!

---

## 📋 Prerequisites

The other person needs **only ONE thing** installed:

| Software | Download Link |
|----------|--------------|
| **Docker Desktop** | [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop) |

> **IMPORTANT:** After installing Docker Desktop, make sure it is **running** (you'll see the whale icon in your system tray).

---

## 🗂️ Files Created for Docker

| File | Purpose |
|------|---------|
| `Dockerfile` | Builds the React frontend (multi-stage: Node → Nginx) |
| `backend/Dockerfile` | Builds the Express.js backend API |
| `report-ai/Dockerfile` | Builds the Report-AI Vite app (multi-stage: Node → Nginx) |
| `docker-compose.yml` | Orchestrates all 4 services together |
| `nginx.conf` | Nginx config — serves frontend & proxies `/api` to backend |
| `.dockerignore` | Excludes `node_modules`, `.git`, etc. from Docker builds |
| `backend/.dockerignore` | Backend-specific exclusions |
| `report-ai/.dockerignore` | Report-AI specific exclusions |

---

## 🏗️ Architecture

```
  Browser
    │
    ├──► Frontend (React)       → http://localhost:3000
    │       │
    │       └── /api/* ──► Backend (Express.js) → http://localhost:5000
    │                           │
    │                           └──► MongoDB → localhost:27017
    │
    └──► Report AI (Vite)       → http://localhost:8080
```

| Service | Port | URL |
|---------|------|-----|
| **Frontend** (React) | `3000` | http://localhost:3000 |
| **Backend** (Express API) | `5000` | http://localhost:5000 |
| **Report AI** (Vite) | `8080` | http://localhost:8080 |
| **MongoDB** | `27017` | `mongodb://localhost:27017/medical_portal` |

---

## 🚀 Step-by-Step: How to Run

### Step 1 — Open CMD (Command Prompt)

Press `Win + R`, type `cmd`, hit Enter.

### Step 2 — Navigate to the project folder

```cmd
cd C:\path\to\medical-portal-main
```

> **NOTE:** Replace `C:\path\to\medical-portal-main` with the actual folder path where the project is located.

### Step 3 — Build and start all containers

```cmd
docker-compose up --build
```

> **TIP:** The first run will take **5–10 minutes** to download images and build everything. Subsequent runs will be much faster due to Docker caching.

### Step 4 — Open in browser

Once you see output like:
```
medical-portal-backend   | 🚀 Server running on port 5000
medical-portal-backend   | ✅ MongoDB Connected: mongodb
```

Open your browser and go to:
- **Main App:** http://localhost:3000
- **Report AI:** http://localhost:8080

---

## 🛑 How to Stop

Press `Ctrl + C` in the CMD window, then run:

```cmd
docker-compose down
```

---

## 🔄 Run in Background (Detached Mode)

If you don't want to keep the CMD window open:

```cmd
docker-compose up --build -d
```

To check the status:
```cmd
docker-compose ps
```

To view logs:
```cmd
docker-compose logs -f
```

To stop:
```cmd
docker-compose down
```

---

## 🧹 Full Cleanup (Remove Everything)

If you want to remove all containers, images, and the database data:

```cmd
docker-compose down -v --rmi all
```

---

## ⚠️ Troubleshooting

| Issue | Solution |
|-------|----------|
| **Docker not found** | Make sure Docker Desktop is installed and running |
| **Port already in use** | Another app is using port 3000/5000/8080. Close it or change ports in `docker-compose.yml` |
| **Build fails** | Run `docker-compose down` then `docker-compose up --build` again |
| **MongoDB connection error** | Wait 10-15 seconds — MongoDB may take time to start. Backend auto-retries. |

---

## 🔧 For Local Development (Without Docker)

If you want to run without Docker (for development), create a `.env` file in the root:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

Then run each service separately:
```cmd
:: Terminal 1 — Start MongoDB (must be installed locally)
mongod

:: Terminal 2 — Start Backend
cd backend
npm install
npm run dev

:: Terminal 3 — Start Frontend
npm install
npm start

:: Terminal 4 — Start Report AI (optional)
cd report-ai
npm install
npm run dev
```

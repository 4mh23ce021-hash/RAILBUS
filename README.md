# RAILBUS — Intelligent Railway-to-City Bus Synchronization Platform
### Mysuru Junction (MYS) ↔ KSRTC City Transit Network

> **"Your Train Arrives. Your City Connects."**

---

## 🌟 Overview
RAILBUS is a full-stack, enterprise-grade mobility synchronization and passenger pooling platform designed for Mysuru Junction, Karnataka. It features **three strictly separated application experiences**:

1. **Passenger Application** (`/passenger/*`): Mobile-first, intuitive train selection, interactive destination map, pooling capacity monitor, Razorpay Test Mode checkout, digital QR tickets, and booking history.
2. **Admin Command Center** (`/admin/*`): Midnight-themed desktop operations center with electric cyan highlights, signature 5-node Live Mobility Network visualizer, real-time database KPIs, train delay management, 20–56 pooling approvals, fleet inventory, dispatch control, and demand analytics.
3. **Conductor Portal** (`/conductor/*`): High-speed mobile interface for bus conductors with camera QR scanner, 6-digit manual validation, real-time passenger manifest, and duplicate boarding rejection.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v24)
- **NPM**: v9+

### 2. Environment Configuration
Both `server/.env` and `server/.env.example` are pre-configured.

```bash
# Server Environment
PORT=5000
NODE_ENV=development
DATABASE_URL="file:./dev.db"
JWT_SECRET="railbus_jwt_super_secret_production_key_2026"
JWT_EXPIRES_IN="7d"

DEMO_ADMIN_EMAIL=admin@railbus.demo
DEMO_ADMIN_PASSWORD=RailBus@Admin2026
```

### 3. Database Initialization & Seeding
```bash
# In server directory
cd server
npm run prisma:push
npm run seed
```

### 4. Running the Complete Application
Open two terminal windows:

**Terminal 1 (Backend API & WebSocket Server):**
```bash
cd server
npm run dev
# Running on http://localhost:5000
```

**Terminal 2 (Frontend Client):**
```bash
cd client
npm run dev
# Running on http://localhost:5173
```

---

## 🔐 Demonstration Credentials

| Role | Access URL | Email | Password |
|---|---|---|---|
| **Admin** | `http://localhost:5173/admin/login` | `admin@railbus.demo` | `RailBus@Admin2026` |
| **Conductor** | `http://localhost:5173/conductor/login` | `conductor@railbus.demo` | `Conductor@2026` |
| **Passenger** | `http://localhost:5173/passenger/login` | `passenger@railbus.demo` | `Passenger@2026` |

*Note: In development mode, each login page features a 1-click **Auto Fill Demo Credentials** button for rapid evaluation.*

---

## 🧪 Automated Test Suite
To execute the comprehensive 24-point automated test suite covering security boundaries, role enforcement, dynamic pooling (20–56 capacity rules), and atomic boarding validation:

```bash
cd server
npm test
```

**Test Output:**
```text
===============================================================
🧪 STARTING RAILBUS COMPREHENSIVE AUTOMATED TEST SUITE
===============================================================
--- Phase 1: API Gateway Health Check ---
  ✅ PASS: System Health Check Online
--- Phase 2: Role-Separated Authentication ---
  ✅ PASS: Seeded Admin Login (admin@railbus.demo)
  ✅ PASS: Admin User Role is strictly ADMIN
  ✅ PASS: Seeded Conductor Login (conductor@railbus.demo)
  ✅ PASS: Conductor User Role is strictly CONDUCTOR
  ✅ PASS: Seeded Passenger Login (passenger@railbus.demo)
  ✅ PASS: Passenger User Role is strictly PASSENGER
--- Phase 3: Security & Role Boundary Enforcement ---
  ✅ PASS: Passenger Forbidden from Admin Dashboard (HTTP 403)
  ✅ PASS: Passenger Forbidden from Admin User Directory (HTTP 403)
  ✅ PASS: Conductor Forbidden from Admin Dashboard (HTTP 403)
  ✅ PASS: Unauthenticated Request Denied (HTTP 401)
  ✅ PASS: Malicious Role Injection Ignored (Enforced PASSENGER)
--- Phase 4: Public Catalog & Real-Time Interchange ---
  ✅ PASS: Fetched Supported Mysuru Inbound Trains
  ✅ PASS: Fetched Active Mysuru Destinations with GPS
  ✅ PASS: Fetched Verified Transit Corridors & Stops
--- Phase 5: Booking, Payments & Pooling Engine ---
  ✅ PASS: Created Inbound Booking
  ✅ PASS: Payment Verified & Ticket Generated
  ✅ PASS: Generated 6-Digit Manual Validation Code
  ✅ PASS: Generated Secure QR Token
--- Phase 6: Conductor Atomic Boarding Validation ---
  ✅ PASS: Conductor Validated 6-Digit Code (Boarding Confirmed)
  ✅ PASS: Duplicate Scan Rejected (HTTP 400 DUPLICATE)
--- Phase 7: Admin Command Center Operations ---
  ✅ PASS: Admin Dashboard Real Database Metrics Verified
  ✅ PASS: Admin Updated Train Delay Telemetry
  ✅ PASS: Generated Operational Report Data
===============================================================
📊 TEST SUITE SUMMARY: 24 PASSED, 0 FAILED
===============================================================
```

---

## 📚 Technical Documentation
Explore the full documentation in the [`docs/`](./docs/) directory:
- [System Architecture & Topology](./docs/SYSTEM_ARCHITECTURE.md)
- [Database Schema & Prisma ERD](./docs/DATABASE_SCHEMA.md)
- [API Documentation](./docs/API_DOCUMENTATION.md)
- [Technical Interview & Defense Guide](./docs/INTERVIEW_EXPLANATION.md)
- [File-by-File Architecture Breakdown](./docs/FILE_BY_FILE_GUIDE.md)
- [Admin Command Center Guide](./docs/ADMIN_GUIDE.md)
- [Passenger Application Guide](./docs/PASSENGER_GUIDE.md)
- [Conductor Application Guide](./docs/CONDUCTOR_GUIDE.md)

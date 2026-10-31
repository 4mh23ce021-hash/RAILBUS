# RAILBUS — Technical Interview & Architectural Defense Guide

## Executive Summary
**RAILBUS** is an Intelligent Railway-to-City Bus Synchronization and Dynamic Passenger Pooling platform engineered specifically for **Mysuru Junction Railway Station (MYS)** and **KSRTC City Transit Networks**.

Instead of passengers exiting train coaches into chaotic taxi lines, uncoordinated auto-rickshaw negotiation, or crowded public bus terminals, RAILBUS connects arriving rail passenger manifests directly with pre-scheduled, capacity-optimized KSRTC city connector shuttles stationed at Platforms Portico Bays 3 & 4.

---

## 1. Core Architectural Questions & Answers

### Q1: "Why is strict architectural separation between Passenger, Admin, and Conductor necessary?"
**Answer:**
In transit mobility systems, passenger applications must prioritize frictionless, low-latency, mobile-first workflows without administrative bloat. Concurrently, operational safety requires that administrative capabilities (fleet management, delay recalculation, pool authorization, fare auditing) and conductor boarding controls reside on separate, role-protected API endpoints and frontend views.
- **Security Boundary**: A passenger cannot manipulate bus assignments or inspect manifest records.
- **Data Privacy**: Passwords, tokens, and unmasked passenger mobile numbers are never leaked across roles.
- **Role Isolation**: Enforced via JWT roles (`PASSENGER`, `ADMIN`, `CONDUCTOR`) and verified in database transactions.

---

### Q2: "How does the Dynamic Pooling Algorithm work? Why the 20–56 limits?"
**Answer:**
Standard KSRTC city transit buses have an authorized passenger capacity of **56 seats**. Operating a dedicated shuttle with fewer than 20 passengers causes fuel inefficiency and economic loss for the transit authority.
1. **1–19 Passengers (`FORMING`)**: The system groups arriving train passengers by destination, journey date, and train arrival window.
2. **20–55 Passengers (`ELIGIBLE_FOR_REVIEW`)**: Threshold reached. The system alerts the Admin Command Center (`pool:review_required` via Socket.IO) to allocate an available KSRTC fleet bus.
3. **56 Passengers (`FULL`)**: The pool reaches full capacity. The pooling engine locks the pool and instantiates a new overflow pool for additional demand.
4. **Safety Verification**: Reaching 20 passengers **does not** automatically dispatch a bus; authorized operational approval is required from the Admin Command Center to guarantee vehicle and driver staging.

---

### Q3: "How is race condition prevented when multiple passengers book simultaneously?"
**Answer:**
We execute the pool assignment inside an atomic Prisma database transaction (`prisma.$transaction`).
When a payment is captured, the backend locks the compatible pool record, calculates `currentPassengerCount + passengerCount <= 56`, increments the count, creates the pool member record, and generates the ticket. If capacity would exceed 56, it immediately branches to create an overflow pool.

---

### Q4: "How does ticket validation prevent fraud or duplicate boarding?"
**Answer:**
Every ticket has:
1. A cryptographically unique **QR Token** (`QR_...`).
2. An alphanumeric **Ticket Code** (`TKT-MYS-...`).
3. An emergency **6-Digit Manual Validation Code** (`100000 - 999999`).

When the conductor scans the QR or enters the 6-digit code:
- The transaction checks if `ticket.status === 'BOARDED'`. If already boarded, it logs a `DUPLICATE` scan event with timestamp and rejects the boarding attempt (HTTP 400).
- If valid, it atomically marks `ticket.status = 'BOARDED'`, records the conductor ID, logs `boardedAt = now()`, and broadcasts real-time telemetry to the Command Center.

---

### Q5: "How are external dependencies (RailRadar, Razorpay) handled when offline?"
**Answer:**
- **RailRadar Integration**: If `RAILRADAR_API_KEY` is present and active, the backend fetches real-time delay telemetry from the documented RailRadar endpoint. In local demonstration mode, the backend automatically transitions to high-fidelity simulated telemetry for real Mysuru trains (Shatabdi, Vande Bharat, Chamundi Express) and explicitly labels the source as `SIMULATED DEMO`.
- **Razorpay Integration**: If test keys are provided, official Razorpay order generation and HMAC SHA256 signature verification are executed. In offline/mock mode, high-fidelity test signatures verify instantly.

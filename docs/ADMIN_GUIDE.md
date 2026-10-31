# RAILBUS — Admin Control Centre Operations Guide

## Dedicated Access URL
`http://localhost:5173/admin/login`

## Development Demo Admin Credentials
- **Email**: `admin@railbus.demo`
- **Password**: `RailBus@Admin2026`

---

## 1. Overview & Signature Mobility Topology
When accessing the Admin Command Center:
- **Topology Visualizer**: The central animation displays real-time flow:
  `MYSURU JUNCTION` → `TRAIN ARRIVAL` → `PASSENGER DEMAND` → `POOL FORMATION` → `CITY DESTINATION` → `BUS DISPATCH`.
- **Database Metric Cards**: All numbers (Active passengers, pools awaiting approval, delayed trains, payment volume, fleet availability) are computed directly from the relational database.

---

## 2. Managing Passenger Pools (20–56 Rule)
1. Navigate to **Passenger Pools** (`/admin/pools`).
2. When a pool hits **20 passengers**, its badge changes to `ELIGIBLE_FOR_REVIEW` (amber highlight).
3. Click **Approve Pool**:
   - Select an available KSRTC bus from the fleet dropdown.
   - The system verifies vehicle capacity (e.g. 56).
   - Once approved, vehicle status transitions to `ASSIGNED` and a `DispatchRecord` is automatically scheduled for Bay 3.
4. If capacity is constrained, click **Reject** and record the reason for operational auditing.

---

## 3. Live Train Monitoring & Delay Updates
1. Navigate to **Live Train Monitoring** (`/admin/train-monitoring`).
2. View inbound Mysuru trains (12008 Shatabdi Express, 20608 Vande Bharat, etc.).
3. Click **Update Telemetry / Delay**:
   - Change delay minutes (e.g. 15 -> 25 min) or platform.
   - Clicking **Broadcast Update** recalculates estimated arrival and emits `train:status_updated` across the entire network in real time.

---

## 4. Dispatch Control
1. Navigate to **Dispatch Control** (`/admin/dispatch`).
2. Monitor vehicles staged at Bay 3 & Bay 4.
3. Transition states:
   - `SCHEDULED`: Vehicle staged at station bay.
   - `BOARDING`: Conductor actively scanning incoming passengers.
   - `DEPARTED`: Vehicle leaves Mysuru Junction portico for city route.

---

## 5. Exporting Operational Reports
1. Navigate to **Operational Reports** (`/admin/reports`).
2. Select report type (`Passenger Bookings` or `Passenger Pools`).
3. Click **Download CSV Report** to generate and download sanitized operational data.

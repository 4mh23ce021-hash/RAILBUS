# RAILBUS — Conductor Application Guide

## Dedicated Access URL
`http://localhost:5173/conductor/login`

## Development Demo Conductor Credentials
- **Email**: `conductor@railbus.demo`
- **Password**: `Conductor@2026`

---

## 1. Conductor Shift Dashboard
Upon logging in, the conductor sees:
- **Assigned Bus & Plate**: `KA-09-F-4412` (KSRTC Sarige / City Express).
- **Assigned Route & Destination**: Kuvempunagar Corridor.
- **Boarding Counters**:
  - `ASSIGNED`: Total passengers booked for this vehicle (e.g. 24).
  - `BOARDED`: Total successfully validated passengers (e.g. 1).
  - `REMAINING`: Pending passengers to board.
  - Completion percentage progress bar.

---

## 2. Validating Digital QR Tickets
1. Tap **Scan QR Ticket** (`/conductor/scanner`).
2. Point the device camera at the passenger's screen, or use the **Quick Test Seeded Token** button.
3. The server executes atomic validation:
   - **Green Alert**: Valid ticket. Passenger approved to board.
   - **Red Alert (`DUPLICATE`)**: Ticket has already been validated. Prevents multi-boarding fraud.
   - **Red Alert (`EXPIRED`)**: Ticket has expired.

---

## 3. 6-Digit Manual Code Validation
1. If the passenger's screen is dim or damaged, tap **Enter 6-Digit Code** (`/conductor/manual`).
2. Enter the 6-digit confirmation number (e.g. `749215`).
3. Tap **Validate Code & Mark Boarded**.
4. The passenger is immediately confirmed on the manifest and marked as boarded in real time.

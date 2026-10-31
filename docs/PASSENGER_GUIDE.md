# RAILBUS — Passenger Application Guide

## Dedicated Access URL
`http://localhost:5173/passenger/login`

## Development Demo Passenger Credentials
- **Email**: `passenger@railbus.demo`
- **Password**: `Passenger@2026`

---

## 1. Booking a Synchronized Train-to-Bus Shuttle
1. **Sign In or Register**:
   - Access `/passenger/login` or `/passenger/register`.
   - In development mode, use the **Fill Demo Passenger** button.
2. **Select Inbound Train**:
   - Tap **Explore** or **Select Train** from the home screen.
   - Choose your train arriving into Mysuru Junction (e.g. 12008 Shatabdi Express).
3. **Select City Destination**:
   - Explore the interactive Leaflet map centered on Mysuru.
   - Choose Kuvempunagar, Hebbal Industrial Area, Manasagangothri, Vijayanagar, or Suburban Bus Stand.
4. **Reserve Seats & Pay**:
   - Review fare (e.g. ₹35.00).
   - Authorize payment via Razorpay Test Mode.
   - The dynamic pooling engine automatically groups your reservation and generates your digital ticket!

---

## 2. Digital Ticket & Boarding Pass
1. Open **My Trips** (`/passenger/trips`) or view your confirmed ticket directly.
2. The ticket provides:
   - **High-Density QR Code** for quick optical scanning.
   - **6-Digit Manual Verification Code** (e.g. `749215`).
   - Boarding point directions: **Bay 3 (KSRTC Portico, Mysuru Junction)**.
3. Show the ticket to the bus conductor to board. Once validated, your pass updates live to `✓ BOARDED`.

# RAILBUS — API Endpoint Documentation

## Base URL
`http://localhost:5000/api`

---

## 1. Authentication Endpoints (`/api/auth`)

### `POST /api/auth/passenger/register`
- **Access**: Public
- **Body**: `{ name, email, phone, password }`
- **Response**: `{ success: true, token, user }`
- **Behavior**: Enforces `role: "PASSENGER"`. Prevents role escalation.

### `POST /api/auth/passenger/login`
- **Access**: Public
- **Body**: `{ email, password }`
- **Response**: `{ success: true, token, user }`

### `POST /api/auth/admin/login`
- **Access**: Public (Dedicated Admin Portal)
- **Body**: `{ email, password }`
- **Demo Credentials**: `admin@railbus.demo` / `RailBus@Admin2026`
- **Response**: `{ success: true, token, user }` (Logs audit entry)

### `POST /api/auth/conductor/login`
- **Access**: Public
- **Body**: `{ email, password }`
- **Demo Credentials**: `conductor@railbus.demo` / `Conductor@2026`
- **Response**: `{ success: true, token, user }`

### `GET /api/auth/me`
- **Access**: Authenticated (Bearer Token)
- **Response**: Profile details corresponding to user role.

---

## 2. Passenger Endpoints (`/api/passenger`)
*Requires `Authorization: Bearer <passenger_token>` (Role: `PASSENGER`)*

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/passenger/trains` | List supported Mysuru Junction trains and live arrival status |
| `GET` | `/passenger/destinations` | List active city hubs, base fares, and coordinates |
| `GET` | `/passenger/routes` | Detailed transit corridors and sequence of stops |
| `GET` | `/passenger/bookings` | List authenticated passenger's bookings |
| `GET` | `/passenger/bookings/:id` | Get specific booking details, assigned pool, and ticket |
| `POST` | `/passenger/bookings` | Initiate new booking and generate Razorpay payment order |
| `POST` | `/passenger/bookings/confirm-payment` | Verify payment, assign passenger to pool, issue QR ticket |
| `GET` | `/passenger/tickets` | View digital boarding passes with 6-digit code and QR tokens |
| `GET` | `/passenger/profile` | View commuter preferences |
| `PUT` | `/passenger/profile` | Update contact and emergency information |

---

## 3. Admin Control Centre Endpoints (`/api/admin`)
*Requires `Authorization: Bearer <admin_token>` (Role: `ADMIN`). Unauthorized requests strictly return HTTP 403.*

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/admin/dashboard` | Real-time database KPI metrics, recent bookings, live audit stream |
| `GET` | `/admin/users` | List registered user directory with search and role filters |
| `PATCH` | `/admin/users/:id/status` | Activate or suspend user account |
| `GET` | `/admin/passengers` | Complete in-transit passenger roster |
| `GET` | `/admin/trains` | Train fleet timetable |
| `PATCH` | `/admin/trains/:id` | Update train delay minutes, platform, and operational status |
| `GET` | `/admin/pools` | Passenger pools list and capacity tracking |
| `POST` | `/admin/pools/:id/approve` | Approve pool, assign KSRTC vehicle, authorize dispatch |
| `POST` | `/admin/pools/:id/reject` | Reject pool with logged operational explanation |
| `GET` | `/admin/destinations` | Destination hubs management |
| `POST` | `/admin/destinations` | Add new city destination with coordinates |
| `GET` | `/admin/vehicles` | KSRTC bus fleet inventory |
| `POST` | `/admin/vehicles` | Register new fleet vehicle |
| `GET` | `/admin/drivers` | Authorized driver records |
| `GET` | `/admin/dispatches` | Active staging dispatches and departure authorization |
| `PATCH` | `/admin/dispatches/:id/status`| Transition dispatch (`SCHEDULED` -> `BOARDING` -> `DEPARTED`) |
| `GET` | `/admin/payments` | Financial ledger and gateway references |
| `GET` | `/admin/tickets` | Audit digital ticket validation scans |
| `GET` | `/admin/analytics` | Destination corridor density & train-wise demand aggregations |
| `GET` | `/admin/reports` | Export sanitized CSV datasets |

---

## 4. Conductor Endpoints (`/api/conductor`)
*Requires `Authorization: Bearer <conductor_token>` (Role: `CONDUCTOR`)*

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/conductor/dashboard` | Assigned bus, route, target boarding window, manifest counters |
| `POST` | `/conductor/validate-qr` | Atomic QR token validation (checks expiry, previous boarding) |
| `POST` | `/conductor/validate-manual`| Atomic 6-digit confirmation code validation |

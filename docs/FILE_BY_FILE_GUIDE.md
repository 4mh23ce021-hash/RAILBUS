# RAILBUS — File-by-File Technical Guide

## 1. Backend Architecture (`server/src/`)

### `config/prisma.js`
- **Purpose**: Singleton instantiation of the Prisma ORM client with environment-aware query logging.
- **Database**: Connects to the SQLite relational database `dev.db` (or PostgreSQL if configured).
- **Interview Note**: Prevents connection exhaustion in Node.js event loops by caching the client instance.

### `middleware/authenticate.js`
- **Purpose**: Extracts Bearer JWT from `Authorization` header, verifies validity against `JWT_SECRET`, checks if user account is `ACTIVE` (not `SUSPENDED`), and attaches `req.user` to the request object.
- **Tables**: `User`
- **Error Handling**: Returns HTTP 401 on expired tokens (`TOKEN_EXPIRED`) and HTTP 403 on suspended accounts.

### `middleware/requireAdmin.js`, `requirePassenger.js`, `requireConductor.js`
- **Purpose**: Strict role verification guards. Rejects any user attempting to cross domain boundaries.
- **Interview Note**: Ensures that hiding buttons on the frontend does not represent the security perimeter; the backend enforces authorization on every single protected endpoint.

### `algorithms/poolingAlgorithm.js`
- **Purpose**: Implements the fixed 20–56 passenger dynamic pooling rules.
- **Business Logic**:
  * Evaluates compatible active pools (`destinationId`, `trainId`, `journeyDate`, status in `FORMING` or `ELIGIBLE_FOR_REVIEW`).
  * Enforces maximum 56 passengers per vehicle/pool.
  * Triggers `ELIGIBLE_FOR_REVIEW` when count hits 20.
  * Automatically creates an overflow pool if capacity would exceed 56.
- **Tables**: `PassengerPool`, `PoolMember`, `Booking`

### `algorithms/demandAnalysis.js`
- **Purpose**: Computes corridor density distribution, train-wise demand aggregations, pooling success rates, and fleet utilization metrics for the Admin Demand Analytics dashboard.
- **Tables**: `Destination`, `Train`, `PassengerPool`, `Booking`, `Vehicle`, `Ticket`

### `integrations/railradar/railradarService.js`
- **Purpose**: Integrates with official RailRadar API schema when API credentials exist, or provides high-fidelity simulated telemetry for Mysuru Junction trains with clear labeling (`SIMULATED DEMO`).
- **Caching**: 60-second in-memory cache to respect rate limits.

### `integrations/razorpay/razorpayService.js`
- **Purpose**: Creates Razorpay orders and validates payment signatures using HMAC SHA256. Secret keys never leave the server.

### `controllers/authController.js`
- **Purpose**: Authenticates passengers, admins, and conductors.
- **Security**: Hashes passwords using `bcryptjs` with salt rounds = 12. Generates role-encoded JWT tokens.

### `controllers/bookingController.js`
- **Purpose**: Orchestrates the multi-step booking, Razorpay checkout, pooling assignment, and ticket generation pipeline within an atomic database transaction.

### `controllers/conductorController.js`
- **Purpose**: Powers the conductor mobile application. Validates tickets via QR token or 6-digit code, marks boarding status, logs scan history, and rejects duplicate scans.

---

## 2. Frontend Architecture (`client/src/`)

### `context/PassengerAuthContext.jsx`, `AdminAuthContext.jsx`, `ConductorAuthContext.jsx`
- **Purpose**: Three separate authentication context providers storing independent tokens (`railbus_passenger_token`, `railbus_admin_token`, `railbus_conductor_token`) in `localStorage`.
- **Security**: Complete session decoupling between roles.

### `context/SocketContext.jsx`
- **Purpose**: Establishes WebSocket communication via Socket.IO. Automatically joins role-specific rooms (`admin_room`, `conductor_room`, `passenger:<userId>`) to deliver real-time telemetry.

### `layouts/AdminLayout.jsx` ("RAILBUS COMMAND CENTER")
- **Purpose**: Desktop-first operations terminal with midnight theme, electric cyan highlights, and collapsible 17-item sidebar navigation.

### `layouts/PassengerLayout.jsx`
- **Purpose**: Mobile-first passenger shell with station status header and fixed bottom navigation (`Home`, `Explore`, `My Trips`, `Alerts`, `Profile`). Strictly zero admin navigation.

### `layouts/ConductorLayout.jsx`
- **Purpose**: Fast mobile interface for conductors with quick tabs for QR Scanner, 6-Digit Manual Validation, and Passenger Manifest.

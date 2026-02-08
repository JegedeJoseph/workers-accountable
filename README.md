# AU Chapel Workers API

A secure Node.js/Express/TypeScript backend for the AU Chapel Workers management system with role-based authentication for Workers and Executives.

## ✨ Key Features

- **Worker-Only Registration**: Only workers can self-register. Executives are pre-seeded.
- **Gender-Specific Hostels**: Different hostel options for male and female workers.
- **Pre-seeded Executives**: All executive accounts are created via seed script with default credentials.
- **JWT Authentication**: Access tokens (15min) + Refresh tokens (7 days) for desktop persistence.
- **Role-Based Access Control**: Separate permissions for Workers and Executives.

## 📁 Project Structure

```
src/
├── config/
│   ├── index.ts              # Environment configuration
│   ├── database.ts           # MongoDB connection
│   ├── executives.seed.ts    # Hardcoded executive data
│   └── seed.ts               # Database seeder script
├── controllers/
│   ├── index.ts
│   └── auth.controller.ts
├── middlewares/
│   ├── index.ts
│   ├── auth.middleware.ts    # JWT authentication
│   ├── role.middleware.ts    # RBAC middleware
│   └── error.middleware.ts   # Global error handler
├── models/
│   ├── index.ts
│   └── user.model.ts         # User schema with conditional fields
├── routes/
│   ├── index.ts
│   ├── auth.routes.ts
│   ├── user.routes.ts
│   └── enum.routes.ts        # Dropdown values for Flutter
├── services/
│   ├── index.ts
│   └── auth.service.ts       # Business logic
├── types/
│   ├── index.ts              # TypeScript interfaces
│   └── enums.ts              # Enum definitions (gender-specific hostels)
├── utils/
│   ├── index.ts
│   ├── errors.ts             # Custom error classes
│   └── response.ts           # API response helper
├── validations/
│   ├── index.ts
│   └── auth.validation.ts    # Zod schemas (worker registration only)
├── app.ts                    # Express app factory
└── server.ts                 # Entry point
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Clone the repository and navigate to the project:
   ```bash
   cd workers-accountable
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your configuration:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/au_chapel_workers
   JWT_SECRET=your-super-secret-jwt-key
   JWT_REFRESH_SECRET=your-super-secret-refresh-key
   ```

5. **Seed the database with executives** (required before first run):
   ```bash
   npm run seed
   ```
   This creates all executive accounts with default password: `AUChapel@2026`

6. Start the development server:
   ```bash
   npm run dev
   ```

### Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Run compiled production server |
| `npm run seed` | Seed database with executive accounts |
| `npm run lint` | Run ESLint |

## 🔐 Authentication Flow

### Worker Registration (Only Workers Can Self-Register)

Workers select their gender first, which determines the available hostel options.
Workers can also select their assigned executive from a predefined list.

```json
POST /api/auth/register
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phoneNumber": "+234 801 234 5678",
  "gender": "male",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123",
  "hostel": "peter_hall",          // Must match gender (male hostels only)
  "workforceDepartment": "choir",
  "assignedExecutive": "65abc123..."  // Executive ObjectId from /api/enums/executives
}
```

### Executive Login (Pre-seeded Accounts)

Executives cannot self-register. They use the seeded accounts with default credentials.

**Default Executive Credentials:**
- Email: `generalcoord@auchapel.org`, `sisterwelfarecoord@auchapel.org`, etc.
- Password: `AUChapel@2026`

After first login, executives will see `mustChangePassword: true` in the response
and should be prompted to change their password.

```json
POST /api/auth/login
{
  "email": "president@auchapel.org",
  "password": "AUChapel@2026"
}
```

**Response (First Login):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "65abc...",
      "fullName": "Chapel President",
      "email": "president@auchapel.org",
      "role": "executive",
      "excoPosition": "president",
      "mustChangePassword": true
    },
    "tokens": { ... }
  }
}
```
### Token Refresh (For Desktop App Persistence)

```json
POST /api/auth/refresh
{
  "refreshToken": "eyJhbG..."
}
```

### Change Password (Required for Executives on First Login)

```json
PATCH /api/auth/change-password
{
  "currentPassword": "AUChapel@2026",
  "newPassword": "MyNewSecurePass123",
  "confirmPassword": "MyNewSecurePass123"
}
```

## 📚 API Endpoints

### Authentication Routes

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register new worker (only workers) |
| POST | `/api/auth/login` | Public | Login user |
| POST | `/api/auth/refresh` | Public | Refresh access token |
| POST | `/api/auth/logout` | Private | Logout user |
| GET | `/api/auth/me` | Private | Get current user profile |
| PATCH | `/api/auth/change-password` | Private | Change password |
| POST | `/api/auth/deactivate` | Private | Deactivate own account |

### User Routes

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/users` | Executive | Get all users (paginated) |
| GET | `/api/users/executives` | Private | Get all executives |
| GET | `/api/users/departments` | Executive | Get workers by department |
| GET | `/api/users/:userId` | Self/Executive | Get user by ID |
| PATCH | `/api/users/:userId/reactivate` | Executive | Reactivate user |
| POST | `/api/users/assign-executive` | Executive | Assign executive to worker |

### Enum Routes (For Flutter Dropdowns)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/enums` | Public | Get all enum values |
| GET | `/api/enums/hostels?gender=male` | Public | Get gender-specific hostel options |
| GET | `/api/enums/departments` | Public | Get department options |
| GET | `/api/enums/positions` | Public | Get executive positions |
| GET | `/api/enums/executives` | Public | Get list of executives for selection |

## 📋 Enum Values

### User Roles
- `worker` - Chapel worker (can self-register)
- `executive` - Executive member (pre-seeded only)

### Gender
- `male`
- `female`

### Male Hostels
- `peter_hall`, `paul_hall`, `joseph_hall`, `john_hall`
- `daniel_hall`, `moses_hall`, `elijah_hall`, `david_hall`
- `off_campus_male`

### Female Hostels
- `mary_hall`, `esther_hall`, `ruth_hall`, `deborah_hall`
- `lydia_hall`, `priscilla_hall`, `hannah_hall`, `abigail_hall`
- `off_campus_female`

### Workforce Departments
- `choir`, `ushering`, `technical`, `media`, `prayer`
- `evangelism`, `welfare`, `sanctuary`, `protocol`
- `children`, `drama`, `instrumentals`

### Executive Positions
- `president`, `vice_president`, `general_secretary`
- `assistant_general_secretary`, `financial_secretary`, `treasurer`
- `welfare_director`, `prayer_director`, `evangelism_director`
- `choir_director`, `technical_director`, `media_director`
- `protocol_director`, `ushering_coordinator`, `sanctuary_coordinator`
- `children_coordinator`, `drama_coordinator`, `instrumentals_coordinator`

## 👥 Pre-seeded Executives

The following executives are created when you run `npm run seed`:

| Position | Email | Default Password |
|----------|-------|------------------|
| President | president@auchapel.org | AUChapel@2026 |
| Vice President | vice.president@auchapel.org | AUChapel@2026 |
| General Secretary | general.secretary@auchapel.org | AUChapel@2026 |
| Assistant General Secretary | assistant.secretary@auchapel.org | AUChapel@2026 |
| Financial Secretary | financial.secretary@auchapel.org | AUChapel@2026 |
| Treasurer | treasurer@auchapel.org | AUChapel@2026 |
| Welfare Director | welfare.director@auchapel.org | AUChapel@2026 |
| Prayer Director | prayer.director@auchapel.org | AUChapel@2026 |
| Evangelism Director | evangelism.director@auchapel.org | AUChapel@2026 |
| Choir Director | choir.director@auchapel.org | AUChapel@2026 |
| Technical Director | technical.director@auchapel.org | AUChapel@2026 |
| Media Director | media.director@auchapel.org | AUChapel@2026 |
| Protocol Director | protocol.director@auchapel.org | AUChapel@2026 |
| Ushering Coordinator | ushering.coordinator@auchapel.org | AUChapel@2026 |
| Sanctuary Coordinator | sanctuary.coordinator@auchapel.org | AUChapel@2026 |
| Children Coordinator | children.coordinator@auchapel.org | AUChapel@2026 |
| Drama Coordinator | drama.coordinator@auchapel.org | AUChapel@2026 |
| Instrumentals Coordinator | instrumentals.coordinator@auchapel.org | AUChapel@2026 |

## 🔒 Security Features

- **Password Hashing**: bcryptjs with configurable salt rounds (default: 12)
- **JWT Authentication**: Access tokens (15min) + Refresh tokens (7 days)
- **Refresh Token Rotation**: New refresh token issued on each refresh
- **Role-Based Access Control**: Worker and Executive permissions
- **Input Validation**: Zod schemas with detailed error messages
- **Security Headers**: Helmet.js middleware
- **CORS Configuration**: Configurable for Flutter Desktop

## 🎯 Flutter Integration

### Standard Response Format

All API responses follow this structure for easy Dart serialization:

```json
{
  "success": true|false,
  "message": "Human readable message",
  "data": { ... },
  "error": {
    "code": "ERROR_CODE",
    "details": { ... }
  },
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

### Sample Dart Model

```dart
class ApiResponse<T> {
  final bool success;
  final String message;
  final T? data;
  final ApiError? error;
  final Meta? meta;

  ApiResponse({
    required this.success,
    required this.message,
    this.data,
    this.error,
    this.meta,
  });

  factory ApiResponse.fromJson(
    Map<String, dynamic> json,
    T Function(Map<String, dynamic>) fromJsonT,
  ) {
    return ApiResponse(
      success: json['success'],
      message: json['message'],
      data: json['data'] != null ? fromJsonT(json['data']) : null,
      error: json['error'] != null ? ApiError.fromJson(json['error']) : null,
      meta: json['meta'] != null ? Meta.fromJson(json['meta']) : null,
    );
  }
}
```

## 🛠 Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 422 | Input validation failed |
| `UNAUTHORIZED` | 401 | Not authenticated |
| `FORBIDDEN` | 403 | Not authorized |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `TOKEN_ERROR` | 401 | Invalid/expired token |
| `TOKEN_EXPIRED` | 401 | Token has expired |
| `INTERNAL_ERROR` | 500 | Server error |

## 📄 License

ISC License

## 👥 Author

AU Chapel Tech Team

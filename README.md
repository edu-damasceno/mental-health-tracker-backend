# Mental Health Tracker API

A RESTful API for tracking daily mental health metrics with real-time updates via WebSocket.

## Features

- 🔐 Secure authentication with JWT
  - Token validation and expiry handling
  - Proper error messages for auth failures
  - Type-safe JWT payload handling
- 📊 Daily mental health logging
  - Mood levels
  - Anxiety levels
  - Sleep quality
  - Physical activity
  - Social interactions
  - Stress levels
  - Depression and Anxiety Symptoms
- 📅 Flexible date filtering
  - This week/Last week
  - This month/Last month
  - Custom date ranges with validation
- 🔄 Real-time updates via WebSocket
- 🛡️ Security features
  - Rate limiting
  - Password strength validation
  - HTTP security headers
  - Type-safe request handling
- ✅ Comprehensive test suite
  - 28 passing tests
  - 85%+ code coverage
  - Authentication tests
  - CRUD operation tests
  - Date filtering tests
  - Input validation tests
  - Error handling tests

## Tech Stack

- Node.js & TypeScript
- Express.js
- Prisma (ORM)
- SQLite (Database)
- Jest & Supertest (Testing)
- WebSocket (Real-time updates)

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/mental-health-tracker-backend.git
cd mental-health-tracker-backend
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
# Edit .env with your values
```

4. Set up the database:

```bash
npx prisma migrate dev
```

5. Run the development server:

```bash
npm run dev
```

## Testing

Run the test suite:

```bash
npm test
```

Current coverage:

- Overall: 85.07%
- Server: 96.96%
- Auth: 87.23%
- Logs: 77.69%
- Middleware: 96.42%

Tests include:

- Authentication flows
- CRUD operations
- Date filtering
- Input validation
- Error handling
- Real-time updates

## API Documentation

See [docs/api-examples.md](docs/api-examples.md) for detailed API documentation.

### Key Endpoints

- Authentication

  - POST `/auth/register` - Register new user
  - POST `/auth/login` - Login user

- Logs
  - POST `/logs` - Create new log
  - GET `/logs` - Get all logs
  - GET `/logs/filter` - Get filtered logs
  - PUT `/logs/:id` - Update log
  - DELETE `/logs/:id` - Delete log

### WebSocket

Connect to `ws://localhost:8080` for real-time updates:

- NEW_LOG events
- UPDATE_LOG events
- DELETE_LOG events

## Environment Variables

The following environment variables can be configured:

| Variable                | Description                   | Default               |
| ----------------------- | ----------------------------- | --------------------- |
| PORT                    | Express server port           | 8080                  |
| NODE_ENV                | Environment mode              | development           |
| DATABASE_URL            | SQLite database URL           | file:./dev.db         |
| JWT_SECRET              | JWT signing secret (required) | -                     |
| JWT_EXPIRES_IN          | JWT expiration time           | 24h                   |
| RATE_LIMIT_WINDOW_MS    | Rate limit window             | 900000                |
| RATE_LIMIT_MAX_REQUESTS | Max requests per window       | 100                   |
| ALLOWED_ORIGINS         | CORS allowed origins          | http://localhost:3000 |
| WS_PORT                 | WebSocket server port         | 8080                  |

Copy `.env.example` to `.env` and adjust the values as needed.

## License

MIT

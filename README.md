# Mental Health Tracker Backend

A Node.js/Express backend for tracking daily mental health metrics with real-time updates.

## Features

- User authentication with JWT
- Daily mental health logging
- Period-based log filtering (week, month, custom)
- Real-time updates via WebSocket
- Input validation and sanitization
- Rate limiting for security
- Comprehensive test coverage

## Tech Stack

- Node.js & Express
- TypeScript
- Prisma (SQLite)
- WebSocket (ws)
- Jest & Supertest
- Express Validator
- JWT Authentication

## Getting Started

1. Clone the repository:

```bash
git clone <repository-url>
cd mental-health-tracker-backend
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

4. Set up the database:

```bash
npx prisma migrate dev
```

5. Start the development server:

```bash
npm run dev
```

## API Routes

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Logs

- `POST /api/logs` - Create a new log
- `GET /api/logs/filter` - Get logs with period filtering
- `PUT /api/logs/:id` - Update a log
- `DELETE /api/logs/:id` - Delete a log

For detailed API examples, see [api-examples.md](docs/api-examples.md)

## WebSocket

The application provides real-time updates through WebSocket connection on:

```
ws://localhost:8080
```

## Testing

Run the test suite:

```bash
npm test
```

Current test coverage: ~75%

## Development

1. Run in development mode:

```bash
npm run dev
```

2. Build for production:

```bash
npm run build
```

3. Start production server:

```bash
npm start
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

[MIT](LICENSE)

## Daily Log Fields

### Rating Scales (1-5)

- **moodLevel**: 1: Very Sad → 5: Very Happy
- **anxietyLevel**: 1: Very Anxious → 5: Very Calm
- **sleepQuality**: 1: Very Poor → 5: Very Good
- **stressLevel**: 1: Very High → 5: Very Low

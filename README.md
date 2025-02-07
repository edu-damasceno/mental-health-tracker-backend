# Mental Health Tracker API

A RESTful API for tracking mental health metrics with real-time updates.

## Features

- User authentication with JWT
- Daily mental health logging
- Weekly and monthly data filtering
- Real-time updates via WebSocket
- Security features (rate limiting, password validation)

## API Endpoints

### Authentication

- POST `/auth/register` - Register new user
- POST `/auth/login` - Login user

### Logs

- POST `/logs` - Create new daily log
- GET `/logs` - Get all logs for user
- GET `/logs/filter?period=week` - Get weekly logs
- GET `/logs/filter?period=month` - Get monthly logs

## WebSocket

Real-time updates are available through WebSocket connection at `ws://localhost:8080`

## Setup

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:

```bash
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
```

3. Run migrations:

```bash
npx prisma migrate dev
```

4. Start the server:

```bash
npm run dev
```

## Testing

Example curl commands for testing endpoints are available in the `docs` folder.

## License

[MIT](https://choosealicense.com/licenses/mit/)

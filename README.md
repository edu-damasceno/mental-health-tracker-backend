# Mental Health Tracker API

A REST API for tracking mental health metrics, built with Express.js, TypeScript, and SQLite.

## Features

- User authentication with JWT
- Daily mood, anxiety and stress level tracking
- Sleep quality monitoring
- Physical activity logging
- Symptom tracking
- Real-time updates via WebSocket
- Data analytics and trends
- Rate limiting and security measures

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
PORT=8080
```

4. Run migrations:

```bash
npx prisma migrate dev
```

5. Start the server:

```bash
npm run dev
```

## API Documentation

### Authentication

- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user

### Logs

- POST `/api/logs` - Create new log entry
- GET `/api/logs` - Get all logs
- GET `/api/logs/filter` - Get logs by date range
- PUT `/api/logs/:id` - Update log entry
- DELETE `/api/logs/:id` - Delete log entry

## License

MIT

## Daily Log Fields

### Rating Scales (1-5)

- **moodLevel**: 1: Very Sad → 5: Very Happy
- **anxietyLevel**: 1: Very Anxious → 5: Very Calm
- **sleepQuality**: 1: Very Poor → 5: Very Good
- **stressLevel**: 1: Very High → 5: Very Low

### Optional Fields

- **physicalActivity**: String (optional)
- **socialInteractions**: String (optional)
- **symptoms**: String (optional)
- **primarySymptom**: String (optional)
- **symptomSeverity**: Number 1-5 (optional)

### Sleep Hours

- **sleepHours**: Number between 0-24, in 0.5 increments

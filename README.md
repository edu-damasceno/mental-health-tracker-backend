# Mental Health Tracker API

A robust REST API built with Express and TypeScript for tracking daily mental health metrics and generating insights.

## Features

- 📊 Daily mood and wellness logging
- 🔍 Time-based filtering and analytics
- 🔒 User authentication and data privacy
- ✅ Data validation and sanitization
- 🎯 Duplicate entry prevention

## API Endpoints

### Logs

- `GET /api/logs` - Get all logs
- `GET /api/logs/today` - Check today's log
- `GET /api/logs/:id` - Get specific log
- `POST /api/logs` - Create new log
- `PUT /api/logs/:id` - Update existing log
- `DELETE /api/logs/:id` - Delete log

### Analytics

- `GET /api/logs/filter?startDate&endDate` - Get filtered logs
- `GET /api/logs/trends/mood` - Get mood trends
- `GET /api/logs/stats/sleep` - Get sleep statistics
- `GET /api/logs/stats/weekly` - Get weekly averages
- `GET /api/logs/stats/symptoms` - Get symptom analysis

## Tech Stack

- Node.js & Express
- TypeScript
- Prisma ORM
- SQLite
- JWT Authentication
- Express Validator

## Setup

1. Clone repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables (see below)
4. Run migrations:
   ```bash
   npx prisma migrate dev
   ```
5. Start development server:
   ```bash
   npm run dev
   ```

## Environment Variables

Create a `.env` file with:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-jwt-secret"
PORT=8080
```

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

## License

MIT

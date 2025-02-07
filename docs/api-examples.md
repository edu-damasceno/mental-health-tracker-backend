# API Testing Examples

## Authentication

### Register a new user

```bash
curl -X POST http://localhost:8080/auth/register \
-H "Content-Type: application/json" \
-d '{
  "email": "test@example.com",
  "password": "Password123",
  "name": "Test User"
}'
```

### Login

```bash
curl -X POST http://localhost:8080/auth/login \
-H "Content-Type: application/json" \
-d '{
  "email": "test@example.com",
  "password": "Password123"
}'
```

## Daily Logs

### Create a new log

```bash
curl -X POST http://localhost:8080/logs \
-H "Content-Type: application/json" \
-H "Authorization: Bearer YOUR_TOKEN" \
-d '{
  "moodLevel": 4,
  "anxietyLevel": 2,
  "sleepHours": 7,
  "sleepQuality": "Good",
  "physicalActivity": "30 minutes walking",
  "socialInteractions": "Met with 2 friends for coffee",
  "stressLevel": 3,
  "symptoms": "Mild anxiety in the morning, improved throughout the day"
}'
```

### Get all logs

```bash
curl http://localhost:8080/logs \
-H "Authorization: Bearer YOUR_TOKEN"
```

### Get weekly logs

```bash
curl "http://localhost:8080/logs/filter?period=week" \
-H "Authorization: Bearer YOUR_TOKEN"
```

### Get monthly logs

```bash
curl "http://localhost:8080/logs/filter?period=month" \
-H "Authorization: Bearer YOUR_TOKEN"
```

## WebSocket Testing

You can test WebSocket connections using the provided test script:

```bash
npx ts-node src/scripts/testWebSocket.ts
```

Then create a new log in another terminal to see real-time updates.

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

### Get logs by period

```bash
# Get this week's logs
curl "http://localhost:8080/logs/filter?period=this-week" \
-H "Authorization: Bearer YOUR_TOKEN"

# Get last week's logs
curl "http://localhost:8080/logs/filter?period=last-week" \
-H "Authorization: Bearer YOUR_TOKEN"

# Get this month's logs
curl "http://localhost:8080/logs/filter?period=this-month" \
-H "Authorization: Bearer YOUR_TOKEN"

# Get last month's logs
curl "http://localhost:8080/logs/filter?period=last-month" \
-H "Authorization: Bearer YOUR_TOKEN"

# Get custom period logs
curl "http://localhost:8080/logs/filter?period=custom&startDate=2024-01-01&endDate=2024-01-31" \
-H "Authorization: Bearer YOUR_TOKEN"
```

### Get logs for specific month

```bash
curl "http://localhost:8080/logs/filter?month=1&year=2024" \
-H "Authorization: Bearer YOUR_TOKEN"
```

### Update a log

```bash
curl -X PUT http://localhost:8080/logs/LOG_ID \
-H "Content-Type: application/json" \
-H "Authorization: Bearer YOUR_TOKEN" \
-d '{
  "moodLevel": 3,
  "anxietyLevel": 2,
  "sleepHours": 8,
  "sleepQuality": "Excellent",
  "physicalActivity": "1 hour gym session",
  "socialInteractions": "Family dinner",
  "stressLevel": 2,
  "symptoms": "Feeling much better after exercise"
}'
```

### Delete a log

```bash
curl -X DELETE http://localhost:8080/logs/LOG_ID \
-H "Authorization: Bearer YOUR_TOKEN"
```

## WebSocket Testing

You can test WebSocket connections using the provided test script:

```bash
npx ts-node src/scripts/testWebSocket.ts
```

Then create a new log in another terminal to see real-time updates.

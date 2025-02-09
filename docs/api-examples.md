# API Testing Examples

## Authentication

### Register a new user

```bash
curl -X POST http://localhost:8080/api/auth/register \
-H "Content-Type: application/json" \
-d '{
  "email": "test@example.com",
  "password": "Password123",
  "name": "Test User"
}'
```

### Login

```bash
curl -X POST http://localhost:8080/api/auth/login \
-H "Content-Type: application/json" \
-d '{
  "email": "test@example.com",
  "password": "Password123"
}'
```

## Daily Logs

### Create a new log

```bash
curl -X POST http://localhost:8080/api/logs \
-H "Content-Type: application/json" \
-H "Authorization: Bearer YOUR_TOKEN" \
-d '{
  "moodLevel": 4,
  "anxietyLevel": 2,
  "sleepHours": 7,
  "sleepQuality": "Good",
  "physicalActivity": "30 minutes walking",
  "socialInteractions": "Met with friends",
  "stressLevel": 3,
  "symptoms": "Mild headache",
  "primarySymptom": "headache",
  "symptomSeverity": 2
}'
```

### Get logs for this week

```bash
curl -X GET http://localhost:8080/api/logs/filter?period=this-week \
-H "Authorization: Bearer YOUR_TOKEN"
```

### Update a log

```bash
curl -X PUT http://localhost:8080/api/logs/LOG_ID \
-H "Content-Type: application/json" \
-H "Authorization: Bearer YOUR_TOKEN" \
-d '{
  "moodLevel": 5,
  "anxietyLevel": 1,
  "sleepHours": 8,
  "sleepQuality": "Excellent",
  "physicalActivity": "1 hour gym",
  "socialInteractions": "Family dinner",
  "stressLevel": 2,
  "symptoms": "Feeling better"
}'
```

### Delete a log

```bash
curl -X DELETE http://localhost:8080/api/logs/LOG_ID \
-H "Authorization: Bearer YOUR_TOKEN"
```

## Real-time Updates

The application supports real-time updates via WebSocket connection. Connect to:

```
ws://localhost:8080
```

You'll receive messages for:

- New logs being created
- Logs being updated
- Logs being deleted

Message format:

```json
{
  "type": "NEW_LOG" | "UPDATE_LOG" | "DELETE_LOG",
  "data": { /* log data */ }
}
```

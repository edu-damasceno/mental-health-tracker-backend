# API Examples

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
    "sleepHours": 7.5,
    "sleepQuality": 4,
    "physicalActivity": "30 minutes walking",
    "socialInteractions": "Met with friends",
    "stressLevel": 3,
    "symptoms": "Mild anxiety in the morning",
    "primarySymptom": "anxiety",
    "symptomSeverity": 2
  }'
```

### Update an existing log

```bash
curl -X PUT http://localhost:8080/api/logs/LOG_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "moodLevel": 4,
    "anxietyLevel": 2,
    "sleepHours": 7.5,
    "sleepQuality": 4,
    "physicalActivity": "Morning yoga",
    "stressLevel": 3
  }'
```

### Get logs with period filtering

```bash
# Get this week's logs
curl "http://localhost:8080/api/logs/filter?period=this-week" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get last week's logs
curl "http://localhost:8080/api/logs/filter?period=last-week" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get custom period logs
curl "http://localhost:8080/api/logs/filter?period=custom&startDate=2024-02-01&endDate=2024-02-28" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Delete a log

```bash
curl -X DELETE http://localhost:8080/api/logs/LOG_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Field Validations

- `moodLevel`: Number 1-5 (required)
- `anxietyLevel`: Number 1-5 (required)
- `sleepHours`: Number 0-24 in 0.5 increments (required)
- `sleepQuality`: Number 1-5 (required)
- `physicalActivity`: String (optional)
- `socialInteractions`: String (optional)
- `stressLevel`: Number 1-5 (required)
- `symptoms`: String (optional)
- `primarySymptom`: String (optional)
- `symptomSeverity`: Number 1-5 (optional, required if symptoms present)

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
  "moodLevel": 4,          # 1: Very Sad, 5: Very Happy
  "anxietyLevel": 2,       # 1: Very Anxious, 5: Very Calm
  "sleepHours": 7,
  "sleepQuality": 4,       # 1: Very Poor, 5: Very Good
  "physicalActivity": "30 minutes walking",
  "socialInteractions": "Met with friends",
  "stressLevel": 3,        # 1: Very High, 5: Very Low
  "symptoms": "",          # Optional
  "primarySymptom": "",    # Optional
  "symptomSeverity": null  # Optional, 1-5 if provided
}'
```

### Get logs for this week

```

```

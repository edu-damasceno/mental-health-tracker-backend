# Mental Health Tracker Backend

A secure backend service for the Mental Health Tracker application, built with Node.js, Express, and Prisma.

## Features

- User Authentication
  - Register with email and password
  - Login with JWT token generation
  - Secure password hashing with bcrypt

## Tech Stack

- Node.js & Express
- TypeScript
- Prisma (ORM)
- SQLite
- JWT for authentication
- bcrypt for password hashing

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/YOUR_USERNAME/mental-health-tracker-backend.git
   cd mental-health-tracker-backend
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Create a .env file in the root directory

   ```env
   PORT=8080
   JWT_SECRET=your_jwt_secret_here
   DATABASE_URL="file:./dev.db"
   ```

4. Set up the database

   ```bash
   npx prisma migrate dev
   ```

5. Start the development server
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication

#### Register a new user

http
POST /auth/register
Content-Type: application/json
{
"email": "user@example.com",
"password": "securepassword",
"name": "John Doe"
}

#### Login

http
POST /auth/login
Content-Type: application/json
{
"email": "user@example.com",
"password": "securepassword"
}

## License

[MIT](https://choosealicense.com/licenses/mit/)

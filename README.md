# College Appointment System - Backend

This is the backend server for the College Appointment System, built with Node.js, Express, and MongoDB.

## Features

- User Authentication (JWT)
- Role-based Access Control (Student/Professor)
- Appointment Management
- Availability Management
- RESTful API Design
- Error Handling
- Security Best Practices
---
## Tech Stack

- Node.js
- Express.js
- MongoDB
- JWT Authentication
- bcrypt for Password Hashing
- CORS enabled
- Environment Variables
---
## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn
- Git
---
## Project Structure

```
backend/
├── src/
│   ├── models/         # MongoDB models
│   │   ├── User.js
│   │   ├── Appointment.js
│   │   └── Availability.js
│   ├── routes/         # API routes
│   │   ├── auth.js
│   │   ├── appointments.js
│   │   └── availability.js
│   ├── middleware/     # Custom middleware
│   │   └── auth.js
│   ├── tests/          # Test files
│   └── index.js        # Main server file
├── .env               # Environment variables
├── package.json
└── README.md
```
---
## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd backend
```
---
2. Install dependencies:
```bash
npm install
```
---
3. Create a `.env` file in the root directory with the following variables:
```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/college-appointments

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-123456789

# Server Configuration
PORT=3000

# CORS Configuration
CORS_ORIGIN=http://localhost:3001

# Node Environment
NODE_ENV=development
```
---
4. Start the development server:
```bash
npm run dev
```
---
## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify JWT token
---
### Availability
- `POST /api/availability` - Add availability slot (professor only)
- `GET /api/availability` - Get all available slots
- `GET /api/availability/professor` - Get professor's availabilities
- `GET /api/availability/professor/:professorId` - Get specific professor's availabilities
- `DELETE /api/availability/:id` - Delete availability slot
---
### Appointments
- `POST /api/appointments` - Book an appointment
- `GET /api/appointments/student` - Get student's appointments
- `GET /api/appointments/professor` - Get professor's appointments
- `PUT /api/appointments/:id/cancel` - Cancel an appointment
---
## Error Handling

The API uses standard HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error

## Security Features

- Password hashing using bcrypt
- JWT authentication
- CORS protection
- Environment variables for sensitive data
- Input validation
- Role-based access control

## Testing

Run tests using Jest:
```bash
npm test
```

## Deployment

### Local Deployment
```bash
npm start
```

### Production Deployment (Vercel)

1. Create a new project on Vercel
2. Connect your GitHub repository
3. Configure environment variables in Vercel:
   - MONGODB_URI
   - JWT_SECRET
   - PORT
   - CORS_ORIGIN
   - NODE_ENV

4. Deploy settings:
   - Build Command: `npm install`
   - Output Directory: `dist`
   - Install Command: `npm install`
   - Development Command: `npm run dev`

## Environment Variables

### Required Variables
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT token generation
- `PORT`: Server port (default: 3000)
- `CORS_ORIGIN`: Frontend URL for CORS
- `NODE_ENV`: Environment mode (development/production)

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License. #   B a c k e n d _ A p p o i n t m e n t S t u d e n t _ P r o f e s s o r - 
 
 

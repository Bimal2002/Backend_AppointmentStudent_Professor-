const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const User = require('../models/User');
const Availability = require('../models/Availability');
const Appointment = require('../models/Appointment');

let studentA1Token;
let studentA2Token;
let professorP1Token;
let professorP1Id;
let availabilityId;
let appointmentId;

beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/college-appointments-test');
    
    // Clear all collections
    await User.deleteMany({});
    await Availability.deleteMany({});
    await Appointment.deleteMany({});
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe('Appointment System E2E Test', () => {
    // Test 1: Register and login Student A1
    test('Student A1 registration and login', async () => {
        const studentA1 = {
            name: 'Student A1',
            email: 'studenta1@test.com',
            password: 'password123',
            role: 'student',
            department: 'Computer Science'
        };

        // Register
        await request(app)
            .post('/api/auth/register')
            .send(studentA1)
            .expect(201);

        // Login
        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({
                email: studentA1.email,
                password: studentA1.password
            })
            .expect(200);

        studentA1Token = loginResponse.body.token;
    });

    // Test 2: Register and login Professor P1
    test('Professor P1 registration and login', async () => {
        const professorP1 = {
            name: 'Professor P1',
            email: 'professorp1@test.com',
            password: 'password123',
            role: 'professor',
            department: 'Computer Science'
        };

        // Register
        const registerResponse = await request(app)
            .post('/api/auth/register')
            .send(professorP1)
            .expect(201);

        professorP1Id = registerResponse.body.user.id;

        // Login
        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({
                email: professorP1.email,
                password: professorP1.password
            })
            .expect(200);

        professorP1Token = loginResponse.body.token;
    });

    // Test 3: Professor P1 adds availability
    test('Professor P1 adds availability', async () => {
        const availability = {
            startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
            endTime: new Date(Date.now() + 25 * 60 * 60 * 1000) // Tomorrow + 1 hour
        };

        const response = await request(app)
            .post('/api/availability')
            .set('Authorization', `Bearer ${professorP1Token}`)
            .send(availability)
            .expect(201);

        availabilityId = response.body._id;
    });

    // Test 4: Student A1 views available slots
    test('Student A1 views available slots', async () => {
        const response = await request(app)
            .get(`/api/availability/professor/${professorP1Id}`)
            .set('Authorization', `Bearer ${studentA1Token}`)
            .expect(200);

        expect(response.body.length).toBeGreaterThan(0);
    });

    // Test 5: Student A1 books appointment
    test('Student A1 books appointment', async () => {
        const response = await request(app)
            .post('/api/appointments')
            .set('Authorization', `Bearer ${studentA1Token}`)
            .send({
                availabilityId,
                notes: 'Need help with assignment'
            })
            .expect(201);

        appointmentId = response.body._id;
    });

    // Test 6: Register and login Student A2
    test('Student A2 registration and login', async () => {
        const studentA2 = {
            name: 'Student A2',
            email: 'studenta2@test.com',
            password: 'password123',
            role: 'student',
            department: 'Computer Science'
        };

        // Register
        await request(app)
            .post('/api/auth/register')
            .send(studentA2)
            .expect(201);

        // Login
        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({
                email: studentA2.email,
                password: studentA2.password
            })
            .expect(200);

        studentA2Token = loginResponse.body.token;
    });

    // Test 7: Student A2 books another appointment
    test('Student A2 books appointment', async () => {
        const availability = {
            startTime: new Date(Date.now() + 48 * 60 * 60 * 1000), // Day after tomorrow
            endTime: new Date(Date.now() + 49 * 60 * 60 * 1000) // Day after tomorrow + 1 hour
        };

        // Add new availability
        const availabilityResponse = await request(app)
            .post('/api/availability')
            .set('Authorization', `Bearer ${professorP1Token}`)
            .send(availability)
            .expect(201);

        // Book appointment
        await request(app)
            .post('/api/appointments')
            .set('Authorization', `Bearer ${studentA2Token}`)
            .send({
                availabilityId: availabilityResponse.body._id,
                notes: 'Need help with project'
            })
            .expect(201);
    });

    // Test 8: Professor P1 cancels appointment with Student A1
    test('Professor P1 cancels appointment with Student A1', async () => {
        await request(app)
            .put(`/api/appointments/${appointmentId}/cancel`)
            .set('Authorization', `Bearer ${professorP1Token}`)
            .expect(200);
    });

    // Test 9: Student A1 checks appointments
    test('Student A1 checks appointments', async () => {
        const response = await request(app)
            .get('/api/appointments/student')
            .set('Authorization', `Bearer ${studentA1Token}`)
            .expect(200);

        const appointments = response.body;
        expect(appointments.length).toBe(0); // Should have no pending appointments
    });
}); 
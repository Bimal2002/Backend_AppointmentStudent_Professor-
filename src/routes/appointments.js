const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Availability = require('../models/Availability');
const auth = require('../middleware/auth');

// Book an appointment
router.post('/', auth, async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ message: 'Only students can book appointments' });
        }

        const { availabilityId, notes } = req.body;

        // Check if availability exists and is not booked
        const availability = await Availability.findById(availabilityId);
        if (!availability) {
            return res.status(404).json({ message: 'Availability slot not found' });
        }
        if (availability.isBooked) {
            return res.status(400).json({ message: 'This slot is already booked' });
        }

        // Create appointment
        const appointment = new Appointment({
            student: req.user.id,
            professor: availability.professor,
            availability: availabilityId,
            notes
        });

        // Update availability status
        availability.isBooked = true;
        await availability.save();
        await appointment.save();

        // Populate the appointment with professor and availability details
        const populatedAppointment = await Appointment.findById(appointment._id)
            .populate('professor', 'name email department')
            .populate('availability');

        res.status(201).json(populatedAppointment);
    } catch (error) {
        console.error('Error booking appointment:', error);
        res.status(500).json({ message: 'Error booking appointment', error: error.message });
    }
});

// Get student's appointments
router.get('/student', auth, async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ message: 'Only students can view their appointments' });
        }

        const appointments = await Appointment.find({ student: req.user.id })
            .populate('professor', 'name email department')
            .populate('availability')
            .sort({ 'availability.startTime': 1 });

        res.json(appointments);
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({ message: 'Error fetching appointments', error: error.message });
    }
});

// Get professor's appointments
router.get('/professor', auth, async (req, res) => {
    try {
        if (req.user.role !== 'professor') {
            return res.status(403).json({ message: 'Only professors can view their appointments' });
        }

        const appointments = await Appointment.find({ professor: req.user.id })
            .populate('student', 'name email department')
            .populate('availability')
            .sort({ 'availability.startTime': 1 });

        res.json(appointments);
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({ message: 'Error fetching appointments', error: error.message });
    }
});

// Cancel appointment
router.put('/:id/cancel', auth, async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Check if user is either the student or professor
        if (appointment.student.toString() !== req.user.id && 
            appointment.professor.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to cancel this appointment' });
        }

        // Update appointment status
        appointment.status = 'cancelled';
        await appointment.save();

        // Update availability status
        const availability = await Availability.findById(appointment.availability);
        availability.isBooked = false;
        await availability.save();

        res.json({ message: 'Appointment cancelled successfully' });
    } catch (error) {
        console.error('Error cancelling appointment:', error);
        res.status(500).json({ message: 'Error cancelling appointment', error: error.message });
    }
});

module.exports = router; 
const express = require('express');
const router = express.Router();
const Availability = require('../models/Availability');
const auth = require('../middleware/auth');

// Get all available slots (for students)
router.get('/', auth, async (req, res) => {
    try {
        const availabilities = await Availability.find({ isBooked: false })
            .populate('professor', 'name email department')
            .sort({ startTime: 1 });

        res.json(availabilities);
    } catch (error) {
        console.error('Error fetching availabilities:', error);
        res.status(500).json({ message: 'Error fetching availabilities', error: error.message });
    }
});

// Add availability slot (professor only)
router.post('/', auth, async (req, res) => {
    try {
        if (req.user.role !== 'professor') {
            return res.status(403).json({ message: 'Only professors can add availability' });
        }

        const { startTime, endTime } = req.body;
        const availability = new Availability({
            professor: req.user.id,
            startTime,
            endTime
        });

        await availability.save();
        res.status(201).json(availability);
    } catch (error) {
        console.error('Error adding availability:', error);
        res.status(500).json({ message: 'Error adding availability', error: error.message });
    }
});

// Get all available slots for the logged-in professor
router.get('/professor', auth, async (req, res) => {
    try {
        if (req.user.role !== 'professor') {
            return res.status(403).json({ message: 'Only professors can view their availabilities' });
        }

        const availabilities = await Availability.find({
            professor: req.user.id,
            isBooked: false
        }).sort({ startTime: 1 });

        res.json(availabilities);
    } catch (error) {
        console.error('Error fetching availabilities:', error);
        res.status(500).json({ message: 'Error fetching availabilities', error: error.message });
    }
});

// Get all available slots for a specific professor (for students)
router.get('/professor/:professorId', auth, async (req, res) => {
    try {
        const availabilities = await Availability.find({
            professor: req.params.professorId,
            isBooked: false
        }).populate('professor', 'name email department')
        .sort({ startTime: 1 });

        res.json(availabilities);
    } catch (error) {
        console.error('Error fetching availabilities:', error);
        res.status(500).json({ message: 'Error fetching availabilities', error: error.message });
    }
});

// Delete availability slot (professor only)
router.delete('/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'professor') {
            return res.status(403).json({ message: 'Only professors can delete availability' });
        }

        const availability = await Availability.findOne({
            _id: req.params.id,
            professor: req.user.id
        });

        if (!availability) {
            return res.status(404).json({ message: 'Availability not found' });
        }

        // Check if the availability is already booked
        if (availability.isBooked) {
            return res.status(400).json({ message: 'Cannot delete a booked availability slot' });
        }

        // Use deleteOne instead of remove
        await Availability.deleteOne({ _id: req.params.id });
        res.json({ message: 'Availability deleted successfully' });
    } catch (error) {
        console.error('Error deleting availability:', error);
        res.status(500).json({ message: 'Error deleting availability', error: error.message });
    }
});

module.exports = router; 
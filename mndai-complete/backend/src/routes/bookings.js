const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const emailService = require('../services/email');
const analyticsService = require('../services/analytics');

const router = express.Router();

// Create Booking
router.post('/', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { customer_id, customer_name, customer_email, service_name, start_time, duration_minutes, amount, notes } = req.body;

    // Validate required fields
    if (!service_name || !start_time || !duration_minutes) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check availability
    const conflicting = await db.query(
      `SELECT * FROM bookings WHERE user_id = $1 AND start_time < $2 AND end_time > $3 AND status != 'canceled'`,
      [userId, new Date(start_time).getTime() + duration_minutes * 60000, start_time]
    );

    if (conflicting.rows.length > 0) {
      return res.status(400).json({ error: 'Time slot not available' });
    }

    const booking_id = uuidv4();
    const end_time = new Date(new Date(start_time).getTime() + duration_minutes * 60000);

    const result = await db.query(
      `INSERT INTO bookings (id, user_id, customer_id, service_name, start_time, end_time, amount, notes, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'confirmed')
       RETURNING *`,
      [booking_id, userId, customer_id || null, service_name, start_time, end_time, amount || 0, notes]
    );

    const booking = result.rows[0];

    // Send confirmation email
    if (customer_email) {
      await emailService.sendBookingConfirmation({
        email: customer_email,
        name: customer_name,
        service: service_name,
        time: start_time,
        bookingId: booking_id
      });
    }

    // Track analytics
    await analyticsService.trackEvent('booking_created', { user_id: userId, amount, service_name });

    res.status(201).json({
      success: true,
      booking
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: error.message });
  }
});

// List Bookings
router.get('/', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { status, limit = 50, offset = 0 } = req.query;

    let query = 'SELECT * FROM bookings WHERE user_id = $1';
    let params = [userId];

    if (status) {
      query += ` AND status = $${params.length + 1}`;
      params.push(status);
    }

    query += ` ORDER BY start_time DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    res.json({
      bookings: result.rows,
      limit,
      offset
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Available Slots
router.post('/availability', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { date, duration_minutes = 30 } = req.body;

    const startHour = 9;
    const endHour = 18;

    const booked = await db.query(
      `SELECT start_time, end_time FROM bookings
       WHERE user_id = $1 AND DATE(start_time) = $2 AND status != 'canceled'`,
      [userId, date]
    );

    const slots = [];
    const dayStart = new Date(date);
    dayStart.setHours(startHour, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(endHour, 0, 0, 0);

    for (let time = dayStart.getTime(); time < dayEnd.getTime(); time += duration_minutes * 60000) {
      const slotEnd = new Date(time + duration_minutes * 60000);
      const isAvailable = !booked.rows.some(b => {
        return time < new Date(b.end_time).getTime() && slotEnd.getTime() > new Date(b.start_time).getTime();
      });

      if (isAvailable) {
        slots.push(new Date(time).toISOString());
      }
    }

    res.json({ available_slots: slots });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel Booking
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const result = await db.query(
      `UPDATE bookings SET status = 'canceled' WHERE id = $1 AND user_id = $2 RETURNING *`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({ success: true, booking: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

const express = require('express');
const db = require('../config/database');

const router = express.Router();

// Get Dashboard Analytics
router.get('/dashboard', async (req, res) => {
  try {
    const userId = req.user.userId;

    // Total bookings
    const bookingsResult = await db.query(
      `SELECT COUNT(*) as total, 
              SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
              SUM(CASE WHEN status = 'no_show' THEN 1 ELSE 0 END) as no_shows
       FROM bookings WHERE user_id = $1`,
      [userId]
    );

    // Total customers
    const customersResult = await db.query(
      `SELECT COUNT(*) as total_customers FROM customers WHERE user_id = $1`,
      [userId]
    );

    // Revenue
    const revenueResult = await db.query(
      `SELECT SUM(amount) as total_revenue FROM bookings WHERE user_id = $1 AND status = 'completed'`,
      [userId]
    );

    // Recent bookings
    const recentResult = await db.query(
      `SELECT * FROM bookings WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10`,
      [userId]
    );

    res.json({
      bookings: {
        total: parseInt(bookingsResult.rows[0].total),
        completed: parseInt(bookingsResult.rows[0].completed) || 0,
        no_shows: parseInt(bookingsResult.rows[0].no_shows) || 0
      },
      customers: {
        total: parseInt(customersResult.rows[0].total_customers)
      },
      revenue: {
        total: parseFloat(revenueResult.rows[0].total_revenue) || 0
      },
      recent_bookings: recentResult.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

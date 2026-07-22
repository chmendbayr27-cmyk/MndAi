const express = require('express');
const db = require('../config/database');

const router = express.Router();

// Get Settings
router.get('/', async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await db.query(
      `SELECT id, email, business_name, industry, subscription_tier, 
              ai_chatbot_enabled, booking_module_enabled, marketing_module_enabled
       FROM users WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ settings: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Settings
router.put('/', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { business_name, industry, ai_chatbot_enabled, booking_module_enabled, marketing_module_enabled } = req.body;

    const result = await db.query(
      `UPDATE users SET business_name = $1, industry = $2, 
              ai_chatbot_enabled = $3, booking_module_enabled = $4, 
              marketing_module_enabled = $5, updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [business_name, industry, ai_chatbot_enabled, booking_module_enabled, marketing_module_enabled, userId]
    );

    res.json({ success: true, settings: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');

const router = express.Router();

// List Customers
router.get('/', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { limit = 50, offset = 0 } = req.query;

    const result = await db.query(
      `SELECT * FROM customers WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    res.json({
      customers: result.rows,
      limit,
      offset
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create Customer
router.post('/', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { email, phone, first_name, last_name, notes } = req.body;

    const customerId = uuidv4();

    const result = await db.query(
      `INSERT INTO customers (id, user_id, email, phone, first_name, last_name, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [customerId, userId, email, phone, first_name, last_name, notes]
    );

    res.status(201).json({
      success: true,
      customer: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Customer
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const result = await db.query(
      `SELECT * FROM customers WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({ customer: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Customer
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { first_name, last_name, email, phone, notes } = req.body;

    const result = await db.query(
      `UPDATE customers SET first_name = $1, last_name = $2, email = $3, phone = $4, notes = $5, updated_at = NOW()
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
      [first_name, last_name, email, phone, notes, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({ success: true, customer: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

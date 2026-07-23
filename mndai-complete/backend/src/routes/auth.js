const express = require('express');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');

const router = express.Router();


// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, business_name, industry } = req.body;

    if (!email || !password || !business_name) {
      return res.status(400).json({
        error: 'Missing required fields'
      });
    }

    const hashedPassword = await bcryptjs.hash(password, 12);
    const userId = uuidv4();

    const result = await db.query(
      `INSERT INTO users (id, email, password_hash, business_name, industry, subscription_tier)
       VALUES ($1, $2, $3, $4, $5, 'starter')
       RETURNING id, email, business_name`,
      [userId, email, hashedPassword, business_name, industry || null]
    );

    const user = result.rows[0];

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      user,
      token
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);

    if (error.code === '23505') {
      return res.status(400).json({
        error: 'Email already registered'
      });
    }

    res.status(500).json({
      error: error.message
    });
  }
});


// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password required'
      });
    }

    const result = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    const user = result.rows[0];

    const isValid = await bcryptjs.compare(
      password,
      user.password_hash
    );

    if (!isValid) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      user,
      token
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error.message
    });
  }
});


module.exports = router;

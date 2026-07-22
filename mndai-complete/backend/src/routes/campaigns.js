const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const emailService = require('../services/email');

const router = express.Router();

// Create Campaign
router.post('/', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, campaign_type, target_segment, template_type, subject_line, content } = req.body;

    const campaignId = uuidv4();

    const result = await db.query(
      `INSERT INTO campaigns (id, user_id, name, campaign_type, target_segment, template_type, subject_line, content, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'draft')
       RETURNING *`,
      [campaignId, userId, name, campaign_type, target_segment, template_type, subject_line, content]
    );

    res.status(201).json({
      success: true,
      campaign: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// List Campaigns
router.get('/', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { limit = 50, offset = 0 } = req.query;

    const result = await db.query(
      `SELECT * FROM campaigns WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    res.json({
      campaigns: result.rows,
      limit,
      offset
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send Campaign
router.post('/:id/send', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const result = await db.query(
      `SELECT * FROM campaigns WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const campaign = result.rows[0];

    // Get customers
    const customersResult = await db.query(
      `SELECT * FROM customers WHERE user_id = $1`,
      [userId]
    );

    // Send emails
    for (const customer of customersResult.rows) {
      if (customer.email) {
        await emailService.sendCampaign({
          email: customer.email,
          name: customer.first_name || 'Customer',
          subject: campaign.subject_line,
          content: campaign.content
        });
      }
    }

    // Update campaign status
    await db.query(
      `UPDATE campaigns SET status = 'sent', sent_count = $1 WHERE id = $2`,
      [customersResult.rows.length, id]
    );

    res.json({
      success: true,
      message: `Campaign sent to ${customersResult.rows.length} customers`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

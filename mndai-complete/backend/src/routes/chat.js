const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const redis = require('../config/redis');
const chatbotService = require('../services/chatbot');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Send Chat Message
router.post('/message', optionalAuth, async (req, res) => {
  try {
    const { message, conversation_id, customer_name, channel = 'web' } = req.body;
    const userId = req.user?.userId || 'anonymous';

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get or create conversation
    let convId = conversation_id;
    if (!convId) {
      const result = await db.query(
        `INSERT INTO conversations (id, user_id, customer_name, channel, status)
         VALUES ($1, $2, $3, $4, 'open')
         RETURNING id`,
        [uuidv4(), userId !== 'anonymous' ? userId : null, customer_name || 'Guest', channel]
      );
      convId = result.rows[0].id;
    }

    // Get conversation history from cache
    const cacheKey = `conversation:${convId}`;
    let history = await redis.get(cacheKey);
    history = history ? JSON.parse(history) : [];

    // Process message with AI
    const chatbot = new chatbotService(userId);
    const response = await chatbot.processMessage(message, history);

    // Save user message
    await db.query(
      `INSERT INTO messages (id, conversation_id, sender, content, message_type)
       VALUES ($1, $2, 'customer', $3, 'text')`,
      [uuidv4(), convId, message]
    );

    // Save bot response
    await db.query(
      `INSERT INTO messages (id, conversation_id, sender, content, message_type)
       VALUES ($1, $2, 'bot', $3, 'text')`,
      [uuidv4(), convId, response.response]
    );

    // Update conversation history in cache
    history.push({ role: 'user', content: message });
    history.push({ role: 'assistant', content: response.response });
    history = history.slice(-10); // Keep last 10 messages
    await redis.set(cacheKey, JSON.stringify(history), { EX: 86400 }); // Expire after 24 hours

    res.json({
      success: true,
      conversation_id: convId,
      message: {
        id: uuidv4(),
        conversation_id: convId,
        sender: 'bot',
        content: response.response,
        tokens_used: response.tokensUsed,
        cost: response.cost,
        created_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get Conversation History
router.get('/conversations/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC`,
      [id]
    );

    res.json({
      conversation_id: id,
      messages: result.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

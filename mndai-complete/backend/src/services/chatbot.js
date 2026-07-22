const Anthropic = require('@anthropic-ai/sdk');
const db = require('../config/database');

const client = new Anthropic();

class ChatbotService {
  constructor(businessId) {
    this.businessId = businessId;
  }

  async trainOnBusinessData() {
    if (this.businessId === 'anonymous') {
      return `You are a helpful AI assistant. Be friendly, concise, and professional.`;
    }

    try {
      const services = await db.query(
        `SELECT DISTINCT service_name FROM bookings WHERE user_id = $1 LIMIT 20`,
        [this.businessId]
      );

      const serviceList = services.rows.length > 0
        ? services.rows.map(s => s.service_name).join(', ')
        : 'various services';

      return `You are a helpful customer service chatbot for a business that offers ${serviceList}.
Your role is to:
1. Answer frequently asked questions
2. Help customers book appointments
3. Provide business information
4. Handle cancellations and rescheduling

Be friendly, concise, and professional. If you cannot help, offer to transfer to a human agent.`;
    } catch (error) {
      return `You are a helpful AI assistant. Be friendly, concise, and professional.`;
    }
  }

  async processMessage(message, conversationHistory = []) {
    try {
      const systemPrompt = await this.trainOnBusinessData();

      const messages = [
        ...conversationHistory,
        { role: 'user', content: message }
      ];

      const response = await client.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 512,
        system: systemPrompt,
        messages
      });

      return {
        response: response.content[0].text,
        tokensUsed: response.usage.output_tokens,
        cost: (response.usage.output_tokens / 1000) * 0.003
      };
    } catch (error) {
      console.error('Chatbot error:', error);
      return {
        response: 'I apologize, but I encountered an issue processing your request. Please try again.',
        tokensUsed: 0,
        cost: 0
      };
    }
  }

  async detectIntent(message) {
    try {
      const response = await client.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 100,
        messages: [{
          role: 'user',
          content: `Detect the intent of this message. Return JSON with intent field. Message: "${message}"`
        }]
      });

      try {
        return JSON.parse(response.content[0].text);
      } catch {
        return { intent: 'general_inquiry' };
      }
    } catch (error) {
      return { intent: 'general_inquiry' };
    }
  }
}

module.exports = ChatbotService;

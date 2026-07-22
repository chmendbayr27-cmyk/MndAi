import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import client from '../api/client';
import '../styles/chat.css';

function Chat() {
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [loading, setLoading] = useState(false);
  const { messages, addMessage, clearMessages } = useStore();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    addMessage({ role: 'user', content: input });
    setInput('');
    setLoading(true);

    try {
      const response = await client.post('/chat/message', {
        message: input,
        conversation_id: conversationId
      });

      if (!conversationId) {
        setConversationId(response.conversation_id);
      }

      addMessage({
        role: 'bot',
        content: response.message.content
      });
    } catch (error) {
      addMessage({
        role: 'system',
        content: `Error: ${error.error || 'Failed to send message'}`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1>AI Chat Assistant</h1>
        <button onClick={clearMessages} className="btn-secondary">
          New Conversation
        </button>
      </div>

      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message message-${msg.role}`}>
            <div className="message-content">
              {msg.content}
            </div>
            {msg.timestamp && (
              <div className="message-time">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            )}
          </div>
        ))}
        {loading && <div className="message message-system">AI is thinking...</div>}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="chat-form">
        <div className="input-group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={loading}
          />
          <button type="submit" disabled={loading} className="btn-primary">
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

export default Chat;

# MndAI - Complete AI Chatbot & Booking Platform

A production-ready, full-stack AI chatbot and booking management system with multi-provider LLM routing, built with Node.js, React, and PostgreSQL.

## 🚀 Features

- **AI Chatbot** - Powered by Claude AI with intelligent conversation history
- **Booking Management** - Create, manage, and cancel appointments
- **Customer Management** - Track customers, history, and preferences
- **Multi-provider LLM** - Route requests to Claude, Groq, or Together
- **JWT Authentication** - Secure token-based auth with refresh tokens
- **Real-time Updates** - Redis caching and WebSocket support
- **Email Integration** - SendGrid for confirmations and reminders
- **Analytics** - Dashboard with key metrics and insights
- **Responsive UI** - Mobile-friendly React frontend
- **Production-ready** - Docker, error handling, monitoring

## 📋 Prerequisites

- Node.js 18+
- Docker & Docker Compose (for containerized deployment)
- PostgreSQL 15+ (or use Docker)
- Redis (or use Docker)
- Railway account (for deployment)

## 🛠️ Installation

### 1. Clone Repository

```bash
git clone <repository-url>
cd mndai
```

### 2. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
cd ..
```

### 3. Environment Configuration

```bash
# Copy environment template
cp .env.example .env.production

# Edit with your values
nano .env.production
```

### 4. Start Development

```bash
# Using Docker Compose (recommended)
docker-compose up

# Or manually start services
# Terminal 1: PostgreSQL
docker run -e POSTGRES_PASSWORD=password postgres:15-alpine

# Terminal 2: Redis
docker run -p 6379:6379 redis:7-alpine

# Terminal 3: Backend
cd backend
npm run dev

# Terminal 4: Frontend
cd frontend
npm start
```

## 🚢 Deployment on Railway

### 1. Install Railway CLI

```bash
npm install -g @railway/cli
```

### 2. Login & Initialize

```bash
railway login
cd mndai
railway init
```

### 3. Add Services

```bash
railway service add postgresql
railway service add redis
```

### 4. Set Environment Variables

```bash
railway variables set NODE_ENV=production
railway variables set JWT_SECRET="$(openssl rand -base64 32)"
railway variables set ANTHROPIC_API_KEY="sk-ant-..."
railway variables set SENDGRID_API_KEY="SG...."
```

### 5. Deploy

```bash
railway up
```

### 6. Get Your URL

```bash
railway status
# Your app will be available at: https://mndai-XXXXX.railway.app
```

## 📚 API Documentation

### Authentication

```bash
# Register
POST /api/v1/auth/register
{
  "email": "user@example.com",
  "password": "password",
  "business_name": "My Business"
}

# Login
POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "password"
}
```

### Bookings

```bash
# Create Booking
POST /api/v1/bookings
{
  "service_name": "Haircut",
  "start_time": "2024-02-20T10:00:00Z",
  "duration_minutes": 30,
  "customer_name": "John Doe",
  "customer_email": "john@example.com"
}

# List Bookings
GET /api/v1/bookings

# Get Available Slots
POST /api/v1/bookings/availability
{
  "date": "2024-02-20",
  "duration_minutes": 30
}

# Cancel Booking
DELETE /api/v1/bookings/:id
```

### Chat

```bash
# Send Message
POST /api/v1/chat/message
{
  "message": "Hello, I'd like to book an appointment",
  "conversation_id": "optional-id",
  "customer_name": "Jane"
}

# Get Conversation History
GET /api/v1/chat/conversations/:id
```

### Customers

```bash
# Create Customer
POST /api/v1/customers
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone": "+1-555-1234"
}

# List Customers
GET /api/v1/customers

# Update Customer
PUT /api/v1/customers/:id
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# API tests (with app running)
curl http://localhost:3000/health
```

## 📊 Database Schema

The application uses PostgreSQL with the following main tables:

- `users` - Business accounts
- `customers` - Customer records
- `bookings` - Appointments
- `conversations` - Chat conversations
- `messages` - Chat messages
- `campaigns` - Marketing campaigns

See `database/schema.sql` for full schema.

## 🔐 Security

- Passwords hashed with bcryptjs (12 rounds)
- JWT tokens with 7-day expiration
- Rate limiting on API endpoints
- CORS protection
- SQL parameterized queries
- HTTPS/TLS recommended for production

## 📈 Monitoring

### Health Check

```bash
curl https://your-app.railway.app/health
```

### View Logs

```bash
railway logs --follow
```

### Key Metrics

- Request latency
- Error rate (4xx, 5xx)
- Active users
- Chat conversations
- Booking conversions

## 🐛 Troubleshooting

### 502 Bad Gateway
- Check backend logs: `railway logs --service backend`
- Verify database connection
- Check API keys are set correctly

### Database Connection Error
- Ensure DATABASE_URL is configured
- Verify PostgreSQL is running
- Check credentials in .env

### Chat Not Responding
- Verify ANTHROPIC_API_KEY is set
- Check API rate limits
- Review error logs

## 📞 Support

- Documentation: [See deployment guide](./docs/DEPLOYMENT.md)
- Issues: Open GitHub issue
- Email: support@mndai.com

## 📄 License

MIT

## 🎯 Roadmap

- [ ] WhatsApp integration
- [ ] Video consultations
- [ ] Multi-language support
- [ ] Advanced analytics
- [ ] API marketplace
- [ ] White-label version

---

**Built with ❤️ using Node.js, React, and AI**

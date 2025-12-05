# 📋 AI-Powered RFP Management System

An end-to-end web application that streamlines the Request for Proposal (RFP) procurement workflow using AI to automate parsing, comparison, and recommendation of vendor proposals.

## Features

✅ **Create RFPs** - Transform natural language descriptions into structured RFPs  
✅ **Manage Vendors** - Maintain vendor master data and send RFPs via email  
✅ **Receive Proposals** - Parse vendor responses and extract key information with AI  
✅ **Compare & Recommend** - Automated scoring and recommendation system  
✅ **Beautiful UI** - Modern, responsive web interface

---

## Tech Stack

### Frontend

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: CSS3 (responsive, modern design)
- **HTTP Client**: Axios

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Email**: Nodemailer (SMTP)
- **AI/LLM**: OpenAI GPT-4o

### Key Libraries

- `@prisma/client` - Database ORM
- `openai` - LLM integration
- `nodemailer` - Email sending
- `imap-simple`, `mailparser` - Email receiving (optional for production)

---

## Prerequisites

- **Node.js** >= 16.x (tested on v18, v20)
- **PostgreSQL** >= 12.x (or any Prisma-supported database)
- **OpenAI API Key** (for GPT-4 access)
- **Gmail Account** (or any SMTP provider) for email sending/receiving

---

## Project Setup

### 1. Clone & Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Database Setup

#### Option A: Local PostgreSQL

```bash
# Create database
createdb rfp_db

# Configure .env (see below)

# Run migrations
cd backend
npx prisma migrate dev --name init

# Seed sample vendors (optional)
npm run db:seed
```

#### Option B: Docker PostgreSQL (Optional)

```bash
docker run --name rfp_postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=rfp_db \
  -p 5432:5432 \
  postgres:15
```

### 3. Environment Configuration

#### Backend `.env`

Create `/backend/.env`:

```bash
# Server
PORT=4000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/rfp_db"

# OpenAI
OPENAI_API_KEY=sk-...your-key-here...

# Gmail SMTP (enable "Less secure app access" or use App Password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Gmail IMAP (for receiving proposals)
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_USER=your-email@gmail.com
IMAP_PASS=your-app-password

# Sender email
SENDER_EMAIL=noreply@yourdomain.com

# Redis (optional for background jobs)
REDIS_URL=redis://localhost:6379
```

#### Email Configuration Guide

**Gmail Setup:**

1. Enable 2-factor authentication on your Google account
2. Generate an "App Password": https://myaccount.google.com/apppasswords
3. Use the 16-character password in `SMTP_PASS` and `IMAP_PASS`

**Alternative Providers:**

- SendGrid, Mailgun, AWS SES all supported via their APIs
- Update SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS accordingly

---

## Running the Application

### Backend

```bash
cd backend

# Development (with auto-reload via ts-node)
npm run dev

# Production build
npm run build
npm start

# Database migrations (if needed)
npm run db:migrate
```

**Server runs on**: `http://localhost:4000`

### Frontend

```bash
cd frontend

# Development
npm run dev

# Production build
npm run build

# Preview build
npm run preview
```

**Frontend runs on**: `http://localhost:3000`  
_(Backend API proxied at `/api`)_

---

## API Documentation

### Base URL

```
http://localhost:4000/api
```

### Endpoints

#### **RFPs**

##### Create RFP from Natural Language

```http
POST /api/rfps
Content-Type: application/json

{
  "description": "I need 20 laptops with 16GB RAM, 15 monitors 27-inch. Budget $50k. Delivery within 30 days. Net 30 payment terms."
}
```

**Response (201):**

```json
{
  "id": "clh123...",
  "title": "Laptops and Monitors",
  "descriptionRaw": "I need 20 laptops...",
  "structuredJson": {
    "title": "Laptops and Monitors",
    "items": [
      {"name": "Laptop", "quantity": 20, "specs": "16GB RAM", ...},
      {"name": "Monitor", "quantity": 15, "specs": "27-inch", ...}
    ],
    "budget": 50000,
    "currency": "USD",
    "deliveryDays": 30,
    "paymentTerms": "net 30",
    "warrantyMonths": 12
  },
  "budget": 50000,
  "createdAt": "2024-01-01T12:00:00Z",
  ...
}
```

##### Get All RFPs

```http
GET /api/rfps
```

**Response (200):**

```json
[
  { "id": "clh123...", "title": "Laptops and Monitors", ... },
  { "id": "clh456...", "title": "Office Furniture", ... }
]
```

##### Get Single RFP with Proposals

```http
GET /api/rfps/{rfpId}
```

**Response (200):**

```json
{
  "id": "clh123...",
  "title": "Laptops and Monitors",
  "proposals": [
    {
      "id": "prop123...",
      "vendorId": "vendor1",
      "vendor": { "id": "vendor1", "name": "TechCorp", "email": "..." },
      "totalPrice": 48000,
      "completenessScore": 95,
      ...
    }
  ],
  ...
}
```

##### Send RFP to Vendors

```http
POST /api/rfps/{rfpId}/send
Content-Type: application/json

{
  "vendorIds": ["vendor1", "vendor2", "vendor3"]
}
```

**Response (200):**

```json
{
  "rfpId": "clh123...",
  "totalVendors": 3,
  "results": [
    { "vendorId": "vendor1", "vendorName": "TechCorp", "status": "sent" },
    { "vendorId": "vendor2", "vendorName": "Global Hardware", "status": "sent" }
  ]
}
```

---

#### **Vendors**

##### List All Vendors

```http
GET /api/vendors
```

**Response (200):**

```json
[
  {
    "id": "vendor1",
    "name": "TechCorp Solutions",
    "email": "sales@techcorp.com",
    "contactName": "John Smith",
    "phone": "+1-555-0101",
    "notes": "Reliable, fast delivery"
  }
]
```

##### Create Vendor

```http
POST /api/vendors
Content-Type: application/json

{
  "name": "TechCorp Solutions",
  "email": "sales@techcorp.com",
  "contactName": "John Smith",
  "phone": "+1-555-0101",
  "notes": "Reliable vendor"
}
```

**Response (201):**

```json
{
  "id": "vendor1",
  "name": "TechCorp Solutions",
  ...
}
```

##### Update Vendor

```http
PUT /api/vendors/{vendorId}
Content-Type: application/json

{
  "name": "TechCorp Solutions Updated",
  "notes": "New notes"
}
```

##### Delete Vendor

```http
DELETE /api/vendors/{vendorId}
```

**Response (200):**

```json
{ "message": "Vendor deleted" }
```

---

#### **Proposals**

##### Add/Parse Proposal

```http
POST /api/proposals
Content-Type: application/json

{
  "rfpId": "clh123...",
  "vendorId": "vendor1",
  "emailBody": "Thank you for the RFP. We can provide 20 laptops at $2400 each... [full proposal text]",
  "attachmentText": "[optional OCR text from PDF attachments]"
}
```

**Response (201):**

```json
{
  "id": "prop123...",
  "rfpId": "clh123...",
  "vendorId": "vendor1",
  "totalPrice": 48000,
  "currency": "USD",
  "deliveryDays": 28,
  "paymentTerms": "net 30",
  "warrantyMonths": 12,
  "completenessScore": 95,
  "parsedJson": {
    "items": [
      { "name": "Laptop", "quantity": 20, "unitPrice": 2400, "lineTotal": 48000 },
      { "name": "Monitor", "quantity": 15, "unitPrice": 400, "lineTotal": 6000 }
    ],
    "totalPrice": 54000,
    ...
  },
  ...
}
```

##### Compare Proposals & Get Recommendation

```http
GET /api/proposals/compare/{rfpId}
```

**Response (200):**

```json
{
  "ranking": [
    {
      "vendorName": "TechCorp Solutions",
      "vendorEmail": "sales@techcorp.com",
      "totalPrice": 48000,
      "priceScore": 95.5,
      "completenessScore": 95,
      "deliveryScore": 100,
      "termsScore": 90,
      "finalScore": 94.2
    },
    {
      "vendorName": "Global Hardware",
      "totalPrice": 50000,
      "finalScore": 88.7
      ...
    }
  ],
  "recommendation": "TechCorp Solutions (sales@techcorp.com)",
  "explanation": "TechCorp offers the best overall value with competitive pricing ($48,000), excellent delivery timeline (28 days), and strong warranty terms. They scored 94.2/100 versus Global Hardware's 88.7/100."
}
```

---

#### **Health Check**

```http
GET /api/health
```

**Response (200):**

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

---

## AI Integration & Prompts

### 1. RFP Structuring (Natural Language → JSON)

**Endpoint**: `POST /api/rfps`

**AI Model**: GPT-4o (temperature: 0.3 for deterministic output)

**System Prompt** (in `src/ai.ts`):

```
You are an expert procurement specialist. Convert natural language procurement
requirements into a structured JSON format.

Return ONLY a valid JSON object (no markdown, no extra text) matching this schema:
{
  "title": "string",
  "items": [{"name", "quantity", "specifications", "priority"}],
  "budget": number,
  "currency": "string",
  "deliveryDays": number,
  "paymentTerms": "string",
  "warrantyMonths": number
}

Be precise with numbers and units. Extract all requirements mentioned.
```

**Example Input**:

```
"I need to procure 20 laptops with 16GB RAM and 15 monitors 27-inch for our new office.
Budget is $50,000 total. Need delivery within 30 days. Payment terms should be net 30,
and we need at least 1 year warranty."
```

**Example Output**:

```json
{
  "title": "Office Equipment - Laptops and Monitors",
  "items": [
    {
      "name": "Laptop",
      "quantity": 20,
      "specs": "16GB RAM",
      "priority": "high"
    },
    {
      "name": "Monitor 27-inch",
      "quantity": 15,
      "specs": "27-inch display",
      "priority": "high"
    }
  ],
  "budget": 50000,
  "currency": "USD",
  "deliveryDays": 30,
  "paymentTerms": "net 30",
  "warrantyMonths": 12
}
```

---

### 2. Proposal Parsing (Email → Structured Data)

**Endpoint**: `POST /api/proposals`

**AI Model**: GPT-4o (temperature: 0.2 for accuracy)

**System Prompt**:

```
You are an expert at parsing vendor proposals and quotations.
Extract pricing, delivery, payment terms, warranty, and line items.

Return ONLY a valid JSON object matching this schema:
{
  "items": [{"name", "quantity", "unitPrice", "lineTotal"}],
  "totalPrice": number,
  "currency": "string",
  "deliveryDays": number,
  "paymentTerms": "string",
  "warrantyMonths": number,
  "notes": "string - caveats/exclusions",
  "completenessPercentage": number (0-100)
}

For missing values, use sensible defaults or null. Be conservative with estimates.
```

**Example Input**:

```
Subject: Proposal for RFP - Office Equipment

Dear Procurement Team,

Thank you for considering us. We can provide the following:

20x Laptop (Dell XPS 13, 16GB RAM, SSD)  @ $2,400 each = $48,000
15x Monitor (Dell S2722DC, 27-inch)      @ $400 each  = $6,000

Total: $54,000 USD

Delivery: 28 days (expedited 21 days for +10%)
Payment Terms: Net 30 (2/10 Net 30 available)
Warranty: 3-year on all items

Exclusions: Shipping & installation not included. OS licenses sold separately.
```

**Expected Output**:

```json
{
  "items": [
    {
      "name": "Laptop Dell XPS 13",
      "quantity": 20,
      "unitPrice": 2400,
      "lineTotal": 48000
    },
    {
      "name": "Monitor Dell S2722DC 27-inch",
      "quantity": 15,
      "unitPrice": 400,
      "lineTotal": 6000
    }
  ],
  "totalPrice": 54000,
  "currency": "USD",
  "deliveryDays": 28,
  "paymentTerms": "net 30",
  "warrantyMonths": 36,
  "notes": "Shipping & installation not included. OS licenses sold separately.",
  "completenessPercentage": 90
}
```

---

### 3. Proposal Comparison & Recommendation

**Endpoint**: `GET /api/proposals/compare/{rfpId}`

**AI Model**: GPT-4o (temperature: 0.5 for explanations)

**Scoring Algorithm**:

- **Price Score** (40%): Inverse normalized (lower price = higher score)
- **Completeness** (30%): % of required items matched
- **Delivery** (15%): Bonus if meets or beats deadline
- **Terms** (15%): Warranty + payment terms

**Example Calculation**:

```
RFP Budget: $50,000 | Delivery: 30 days | Warranty: 12 months

Vendor 1: $54,000, 28 days, 3-year warranty, 90% completeness
  Price Score: ((54000 - 48000) / 6000) * 100 = 100
  Completeness: 90
  Delivery: 100 (28 < 30)
  Terms: 100 (36 > 12)
  Final: 100*0.4 + 90*0.3 + 100*0.15 + 100*0.15 = 96

Vendor 2: $52,000, 30 days, 2-year warranty, 85% completeness
  Price Score: ((54000 - 52000) / 6000) * 100 = 33.3
  Completeness: 85
  Delivery: 100 (30 = 30)
  Terms: 100 (24 > 12)
  Final: 33.3*0.4 + 85*0.3 + 100*0.15 + 100*0.15 = 80.3
```

**Recommendation Prompt**:

```
Given RFP and array of proposals with scores, generate a 2-3 sentence
executive summary explaining why the top-ranked vendor is recommended.
Focus on value, key differentiators, and trade-offs.
```

---

## Email Receive & Parsing (Advanced)

### Option 1: IMAP Polling (Recommended for MVP)

The system can be extended with a background worker to periodically poll IMAP and process inbound emails:

```typescript
// Example: src/workers/emailWorker.ts (not included in MVP)
import { simpleImap } from 'imap-simple';
import { simpleParser } from 'mailparser';

async function pollEmails() {
  const imap = await simpleImap.connect({
    imap: {
      user: config.imapUser,
      password: config.imapPass,
      host: config.imapHost,
      port: config.imapPort,
      tls: true
    }
  });

  // Search for unread emails
  await imap.openBox('INBOX', false);
  const emails = await imap.search(['UNSEEN']);

  for (const email of emails) {
    const message = await imap.getMailBody(email);
    const parsed = await simpleParser(message);

    // Extract proposal details
    const data = await parseVendorProposal(parsed.text, parsed.attachments);

    // Save to database
    await prisma.proposal.create({...});
  }
}
```

### Option 2: Webhook (SendGrid / Mailgun)

Configure your email provider's inbound webhook:

```http
POST https://your-domain.com/api/email/inbound
```

**Webhook Payload** (SendGrid format):

```json
{
  "from": "vendor@company.com",
  "subject": "RFP Response",
  "text": "Proposal content...",
  "attachments": [{ "filename": "quote.pdf", "content": "..." }]
}
```

---

## Data Models

### RFP

```typescript
{
  id: string (CUID)
  title: string
  descriptionRaw: string (original user input)
  structuredJson: JSON (parsed by AI)
  budget: float
  currency: string (default: "USD")
  deliveryDays: int
  paymentTerms: string
  warrantyMonths: int
  createdAt: DateTime
  updatedAt: DateTime
  proposals: Proposal[] (relations)
}
```

### Vendor

```typescript
{
  id: string (CUID)
  name: string
  email: string (unique)
  contactName: string?
  phone: string?
  notes: string?
  createdAt: DateTime
  updatedAt: DateTime
  proposals: Proposal[] (relations)
}
```

### Proposal

```typescript
{
  id: string (CUID)
  rfpId: string (FK → RFP)
  vendorId: string (FK → Vendor)
  rawEmailBody: string
  parsedJson: JSON
  totalPrice: float
  currency: string
  deliveryDays: int
  paymentTerms: string
  warrantyMonths: int
  completenessScore: float (0-100)
  receivedAt: DateTime
  createdAt: DateTime
  updatedAt: DateTime
}
```

---

## Design Decisions & Assumptions

### 1. **RFP Structuring**

- Use strict JSON schema with AI validation to minimize hallucinations
- Store both raw (descriptionRaw) and structured (structuredJson) data for auditability
- Default to conservative values (e.g., 0 if no budget stated)

### 2. **Proposal Parsing**

- Require manual submission for MVP (email polling is future work)
- Support optional OCR text for PDF attachments
- Completeness score is AI-estimated (0-100) based on presence of required fields
- Single currency assumption (can extend with exchange rates)

### 3. **Scoring & Recommendation**

- Weighted scoring (not ML-based) ensures interpretability
- Weights are configurable (currently: price 40%, completeness 30%, delivery 15%, terms 15%)
- Always recommend top scorer; explain trade-offs
- Scale all metrics to 0-100 for consistency

### 4. **Email Integration**

- Nodemailer for outbound (simple, no API key needed)
- Manual proposal input for MVP (IMAP polling optional)
- No automated email parsing from received messages (future enhancement)
- Reply-to email includes RFP ID for tracking (optional)

### 5. **Security & Limitations**

- **No authentication** (single-user MVP)
- **No encryption** (for local dev; use HTTPS + TLS in production)
- **No rate limiting** (add if scaling)
- **No audit logging** (recommend for compliance)
- **API keys stored in .env** (use AWS Secrets Manager in production)

### 6. **Database**

- PostgreSQL + Prisma for type safety and migrations
- CUID for distributed ID generation
- Soft deletes not implemented (scope creep)
- Unique constraint on (rfpId, vendorId) to prevent duplicate proposals

### 7. **Frontend**

- Single-page app (SPA) with React Router for navigation
- Simple state management with React hooks (Redux not needed for MVP)
- CSS-in-file (no CSS-in-JS framework) for simplicity
- Responsive design (mobile-friendly)

---

## Known Limitations & Future Work

### Limitations

- ❌ No email polling (IMAP) for automatic proposal receipt
- ❌ No PDF/document OCR (requires additional service)
- ❌ No real-time collaboration or multi-user support
- ❌ No proposal versioning or approval workflow
- ❌ No export to PDF/Excel
- ❌ No email tracking (opens, clicks)

### Future Enhancements

1. **Email Polling Worker** - Background job to poll IMAP and auto-parse proposals
2. **OCR Support** - Integrate Tesseract.js or AWS Textract for PDFs
3. **Authentication** - Add user registration, login, role-based access
4. **Notifications** - Real-time alerts when proposals arrive
5. **Reporting** - Dashboards, historical analysis, trends
6. **Mobile App** - React Native or PWA
7. **Integrations** - Slack, Teams, Salesforce CRM
8. **Advanced Scoring** - ML-based preference learning

---

## Testing

### Manual Testing Checklist

```bash
# 1. Create RFP
curl -X POST http://localhost:4000/api/rfps \
  -H "Content-Type: application/json" \
  -d '{
    "description": "I need 20 laptops 16GB RAM, 15 monitors 27-inch. Budget $50k, 30 days, net 30 payment, 1 year warranty."
  }'

# 2. Get RFP
curl http://localhost:4000/api/rfps/{rfp-id}

# 3. Create vendors
curl -X POST http://localhost:4000/api/vendors \
  -H "Content-Type: application/json" \
  -d '{"name": "TechCorp", "email": "sales@techcorp.com"}'

# 4. Send RFP to vendors
curl -X POST http://localhost:4000/api/rfps/{rfp-id}/send \
  -H "Content-Type: application/json" \
  -d '{"vendorIds": ["{vendor-id}"]}'

# 5. Add proposal
curl -X POST http://localhost:4000/api/proposals \
  -H "Content-Type: application/json" \
  -d '{
    "rfpId": "{rfp-id}",
    "vendorId": "{vendor-id}",
    "emailBody": "We can provide 20 laptops @ $2400 each and 15 monitors @ $400 each. Total: $54,000..."
  }'

# 6. Compare proposals
curl http://localhost:4000/api/proposals/compare/{rfp-id}
```

### Unit Tests (Future)

```bash
# npm test (to be implemented)
```

---

## Environment & Configuration

### AI Tools Used

**GitHub Copilot:**

- ✅ Generated initial Express boilerplate
- ✅ TypeScript interface definitions
- ✅ React component scaffolding
- ✅ CSS styling (responsive design)
- ✅ API route implementations
- ✅ Prisma schema and migrations
- ✅ Error handling patterns

**What Copilot Helped With:**

1. **Boilerplate** - 70% of Express server setup
2. **Database** - Prisma schema and queries
3. **React Components** - Functional components with hooks
4. **Styling** - Modern CSS grid/flexbox layouts
5. **Debugging** - Error message improvements

**What I Customized:**

1. AI integration logic (prompt engineering, validation)
2. Email sending implementation
3. Proposal comparison scoring algorithm
4. Frontend routing and state management
5. README documentation

**Key Learnings:**

- Copilot is excellent for boilerplate but requires careful review of LLM prompts
- Manual refinement of AI integration is critical for domain-specific logic
- Type safety (TypeScript) caught several issues early
- Testing and validation of LLM outputs is essential

---

## Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT 1"

# Verify DATABASE_URL in .env
echo $DATABASE_URL

# Reset database (warning: deletes all data)
cd backend && npm run db:reset
```

### Email Configuration Issues

```bash
# Test SMTP configuration
npm install -g smtp-verify
smtp-verify --host smtp.gmail.com --port 587 \
  --user your-email@gmail.com --password app-password

# Check .env variables are loaded
node -e "require('dotenv').config(); console.log(process.env.SMTP_USER)"
```

### API Errors

```bash
# Check backend is running
curl http://localhost:4000/api/health

# View backend logs
cd backend && npm run dev 2>&1 | head -50

# Check frontend proxy
curl -i http://localhost:3000/api/health
```

### OpenAI API Errors

```bash
# Verify API key
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# Check rate limits
# (OpenAI errors will appear in backend logs)
```

---

## Deployment

### Heroku (Example)

```bash
# Create Heroku app
heroku create rfp-management-system

# Set environment variables
heroku config:set OPENAI_API_KEY=sk-...
heroku config:set DATABASE_URL=postgresql://...
heroku config:set SMTP_USER=...
heroku config:set SMTP_PASS=...

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

### Docker (Optional)

```dockerfile
# Dockerfile (backend)
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 4000
CMD ["npm", "start"]
```

```bash
docker build -t rfp-api .
docker run -p 4000:4000 --env-file .env rfp-api
```

---

## Support & Questions

- **Issue**: Encounter an error? Check logs:
  - Backend: `backend/dist/*.log` or console output
  - Frontend: Browser DevTools Console
- **Documentation**: See API documentation above
- **Examples**: Check `prisma/seed.ts` for sample data structure

---

## License

MIT

---

## Summary

This RFP management system demonstrates:

✅ **End-to-end workflow** - From RFP creation to vendor selection  
✅ **AI integration** - Natural language parsing, proposal analysis, scoring  
✅ **Type safety** - TypeScript throughout frontend & backend  
✅ **Modern stack** - React, Express, Prisma, PostgreSQL  
✅ **Production-ready patterns** - Error handling, validation, database migrations  
✅ **Beautiful UX** - Responsive design, intuitive workflows

**Total LOC**: ~3,000 (backend: ~1,500, frontend: ~1,500)  
**Setup time**: 15-30 minutes  
**Time to first RFP**: <5 minutes

Start by creating your first RFP in the web UI—the system will guide you through the full procurement workflow!

---

**Built with ❤️ using AI + TypeScript + React + Node.js**

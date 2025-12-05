# Architecture Overview

## System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  React 18 + TypeScript (Vite)                                   │
│  ├─ Dashboard (RFP list, cards)                                │
│  ├─ Create RFP (natural language input)                        │
│  ├─ RFP Detail (view, send to vendors, see proposals)          │
│  ├─ Vendor Management (CRUD vendors)                           │
│  └─ Proposal Comparison (scoring, recommendation)              │
└─────────────────────────────────────────────────────────────────┘
                            ↑
                         HTTP/REST
                         (Axios)
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                      API LAYER (Express)                        │
├─────────────────────────────────────────────────────────────────┤
│  Node.js + Express + TypeScript                                 │
│  ├─ GET /api/rfps                   List RFPs                 │
│  ├─ POST /api/rfps                  Create RFP (→ AI)          │
│  ├─ GET /api/rfps/:id               Get RFP with proposals     │
│  ├─ POST /api/rfps/:id/send         Send RFP to vendors (→ Email)
│  ├─ GET/POST/PUT/DELETE /api/vendors Vendor CRUD              │
│  ├─ POST /api/proposals             Add proposal (→ AI parse)  │
│  ├─ GET /api/proposals/compare/:rfpId Compare proposals (→ AI) │
│  └─ GET /api/health                 Health check              │
└─────────────────────────────────────────────────────────────────┘
        ↑                        ↑                        ↑
        │                        │                        │
   Database          Email            OpenAI/LLM
   (SQL)         (SMTP/IMAP)           (API)
        │                        │                        │
        ↓                        ↓                        ↓
┌──────────────┐  ┌──────────────────┐  ┌───────────────────────┐
│ PostgreSQL   │  │ Nodemailer +     │  │ GPT-4o / GPT-4        │
│ + Prisma ORM │  │ Gmail SMTP/IMAP  │  │ ├─ Parse RFP         │
│              │  │ ├─ Send emails   │  │ ├─ Parse proposals   │
│ Tables:      │  │ ├─ Receive emails│  │ └─ Compare & score   │
│ ├─ RFP       │  │ └─ Extract text  │  │                       │
│ ├─ Vendor    │  │   from PDF       │  │ Temperature:          │
│ ├─ Proposal  │  │                  │  │ ├─ 0.3 (RFP parse)   │
│ └─ EmailLog  │  │ (Optional:       │  │ ├─ 0.2 (proposal)    │
│              │  │  IMAP polling    │  │ └─ 0.5 (explanation) │
└──────────────┘  │  background job) │  └───────────────────────┘
                  └──────────────────┘
```

---

## Data Flow Diagrams

### 1. Create RFP Flow

```
User Input (natural language)
         ↓
    Frontend Form
         ↓
  POST /api/rfps
         ↓
  Backend Validation
         ↓
   OpenAI GPT-4o
   (parse & structure)
         ↓
   JSON Response
         ↓
  Prisma.rfp.create()
         ↓
   Database (PostgreSQL)
         ↓
  HTTP 201 + RFP object
         ↓
  Frontend: show RFP details
```

**Example Transformation:**

```
INPUT:
"I need 20 laptops 16GB RAM, 15 monitors 27-inch. Budget $50k, 30 days delivery, net 30 payment, 1 year warranty."

↓ [AI Processing] ↓

OUTPUT:
{
  "title": "Office Equipment - Laptops and Monitors",
  "items": [
    {
      "name": "Laptop",
      "quantity": 20,
      "specifications": "16GB RAM",
      "priority": "high"
    },
    {
      "name": "Monitor 27-inch",
      "quantity": 15,
      "specifications": "27-inch display",
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

### 2. Send RFP Flow

```
User selects vendors
         ↓
   POST /api/rfps/:id/send
    + vendorIds array
         ↓
   Query vendors from DB
         ↓
   For each vendor:
   ├─ Format RFP content (HTML + Text)
   ├─ Send email via Nodemailer/SMTP
   └─ Log in EmailLog table
         ↓
  Database updated
         ↓
  HTTP 200 + results
   (sent/failed for each)
         ↓
Frontend: show confirmation
```

---

### 3. Receive & Parse Proposal Flow

```
Vendor replies (manual or auto)
         ↓
   POST /api/proposals
  (rfpId, vendorId, email body)
         ↓
  Validate proposal doesn't exist
         ↓
   OpenAI GPT-4o
 (extract items, prices, terms)
         ↓
   JSON Response
         ↓
  Prisma.proposal.create()
   (save raw + parsed)
         ↓
   Database updated
         ↓
  HTTP 201 + proposal object
         ↓
 Frontend: show in proposal list
```

**Example Transformation:**

```
INPUT EMAIL:
"Thank you for the RFP.

We can provide:
- 20x Dell XPS 13 Laptop (16GB RAM) @ $2,400 each = $48,000
- 15x Dell S2722DC Monitor (27-inch) @ $400 each = $6,000

Total: $54,000 USD

Delivery: 28 days (standard)
Payment: Net 30 (2/10 Net 30 available)
Warranty: 3-year on all items

Exclusions: Shipping not included, OS licenses sold separately."

↓ [AI Processing] ↓

OUTPUT:
{
  "items": [
    {
      "name": "Dell XPS 13 Laptop (16GB RAM)",
      "quantity": 20,
      "unitPrice": 2400,
      "lineTotal": 48000
    },
    {
      "name": "Dell S2722DC Monitor (27-inch)",
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
  "completenessPercentage": 95,
  "notes": "Shipping not included. OS licenses sold separately."
}
```

---

### 4. Compare & Recommend Flow

```
User clicks "Compare Proposals"
         ↓
GET /api/proposals/compare/:rfpId
         ↓
Query RFP + all proposals
         ↓
Calculate scores for each proposal:
├─ Price Score = inverse normalized (40%)
├─ Completeness = AI-estimated % (30%)
├─ Delivery Score = meets deadline? (15%)
└─ Terms Score = warranty + payment (15%)
         ↓
Sort by final score
         ↓
Call OpenAI GPT-4o for explanation
         ↓
Return ranking + recommendation
         ↓
  HTTP 200 + comparison object
         ↓
Frontend: show table + top recommendation
```

**Example Calculation:**

```
RFP: Budget $50k | Delivery 30 days | Warranty 12 months

VENDOR 1: TechCorp
  Price: $54,000
  Delivery: 28 days
  Warranty: 36 months
  Completeness: 95%

  Scores:
  - Price Score: 95.5/100 (competitive)
  - Completeness: 95/100 (has all items)
  - Delivery: 100/100 (beats deadline)
  - Terms: 100/100 (exceeds warranty)
  Final = 95.5*0.4 + 95*0.3 + 100*0.15 + 100*0.15 = 96.2/100

VENDOR 2: Global Hardware
  Price: $52,000
  Delivery: 35 days
  Warranty: 24 months
  Completeness: 80%

  Scores:
  - Price Score: 98.5/100 (lowest price)
  - Completeness: 80/100 (missing some details)
  - Delivery: 50/100 (misses deadline by 5 days)
  - Terms: 90/100 (good warranty)
  Final = 98.5*0.4 + 80*0.3 + 50*0.15 + 90*0.15 = 83.1/100

RECOMMENDATION: TechCorp (96.2 vs 83.1)
```

---

## Database Schema (Prisma)

```prisma
model RFP {
  id              String      @id @default(cuid())
  title           String
  descriptionRaw  String      @db.Text
  structuredJson  Json
  budget          Float?
  currency        String      @default("USD")
  deliveryDays    Int?
  paymentTerms    String?
  warrantyMonths  Int?
  dueDate         DateTime?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  proposals       Proposal[]
}

model Vendor {
  id          String      @id @default(cuid())
  name        String
  email       String      @unique
  contactName String?
  phone       String?
  notes       String?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  proposals   Proposal[]
}

model Proposal {
  id                  String      @id @default(cuid())
  rfpId               String
  rfp                 RFP         @relation(fields: [rfpId], references: [id], onDelete: Cascade)
  vendorId            String
  vendor              Vendor      @relation(fields: [vendorId], references: [id], onDelete: Cascade)
  rawEmailBody        String      @db.Text
  parsedJson          Json
  totalPrice          Float?
  currency            String      @default("USD")
  deliveryDays        Int?
  paymentTerms        String?
  warrantyMonths      Int?
  completenessScore   Float       @default(0)
  receivedAt          DateTime    @default(now())
  createdAt           DateTime    @default(now())
  updatedAt           DateTime    @updatedAt

  @@unique([rfpId, vendorId])
}

model EmailLog {
  id          String      @id @default(cuid())
  rfpId       String?
  vendorEmail String
  subject     String
  status      String      @default("pending")
  rawEmail    String?     @db.Text
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}
```

---

## Component Architecture (Frontend)

```
App.tsx (Router/State Manager)
├─ Header (Navigation)
└─ Main Content Router
   ├─ Dashboard
   │  └─ RFPCard[] (clickable)
   ├─ CreateRFP
   │  ├─ TextArea (description input)
   │  └─ ExampleSection
   ├─ Vendors
   │  ├─ VendorForm (add new)
   │  └─ VendorTable (list, delete)
   └─ RFPDetail
      ├─ RFPHeader
      ├─ RFPDetailsGrid
      ├─ ItemsTable
      ├─ VendorSelection
      │  └─ SendRFPButton
      ├─ ProposalsList
      │  └─ CompareButton
      └─ ComparisonResult
         ├─ Recommendation
         └─ ComparisonTable
```

---

## API Request/Response Examples

### 1. Create RFP

```http
POST /api/rfps HTTP/1.1
Host: localhost:4000
Content-Type: application/json

{
  "description": "I need 20 laptops with 16GB RAM..."
}
```

```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "id": "clh123abc...",
  "title": "Laptops and Monitors",
  "descriptionRaw": "I need 20 laptops...",
  "structuredJson": {
    "title": "...",
    "items": [...],
    "budget": 50000,
    ...
  },
  "budget": 50000,
  "createdAt": "2024-01-01T12:00:00Z",
  "updatedAt": "2024-01-01T12:00:00Z"
}
```

---

### 2. Send RFP

```http
POST /api/rfps/clh123abc/send HTTP/1.1
Host: localhost:4000
Content-Type: application/json

{
  "vendorIds": ["vendor1", "vendor2"]
}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "rfpId": "clh123abc",
  "totalVendors": 2,
  "results": [
    {
      "vendorId": "vendor1",
      "vendorName": "TechCorp",
      "status": "sent"
    },
    {
      "vendorId": "vendor2",
      "vendorName": "Global Hardware",
      "status": "sent"
    }
  ]
}
```

---

### 3. Compare Proposals

```http
GET /api/proposals/compare/clh123abc HTTP/1.1
Host: localhost:4000
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "ranking": [
    {
      "vendorName": "TechCorp",
      "vendorEmail": "sales@tech.com",
      "totalPrice": 54000,
      "priceScore": 95.5,
      "completenessScore": 95,
      "deliveryScore": 100,
      "termsScore": 100,
      "finalScore": 96.2
    },
    {
      "vendorName": "Global Hardware",
      "totalPrice": 52000,
      "priceScore": 98.5,
      "completenessScore": 80,
      "deliveryScore": 50,
      "termsScore": 90,
      "finalScore": 83.1
    }
  ],
  "recommendation": "TechCorp (sales@tech.com)",
  "explanation": "TechCorp offers the best overall value with competitive pricing, excellent delivery timeline, and strong warranty terms. Score: 96.2/100."
}
```

---

## Error Handling

```
Backend errors → Express middleware
  ├─ 400 Bad Request (invalid input)
  ├─ 404 Not Found (resource missing)
  ├─ 422 Unprocessable Entity (validation)
  ├─ 500 Internal Server Error (with dev mode details)
  └─ Error JSON response

Frontend catches errors
  ├─ Display error message to user
  ├─ Log to console (dev mode)
  ├─ Optional: Send to error tracking (Sentry)
  └─ Allow user to retry
```

---

## Scalability Considerations

1. **Database**

   - Add indexes on `(rfpId, vendorId)` for fast lookups
   - Consider read replicas for reports

2. **API**

   - Add rate limiting (express-rate-limit)
   - Cache RFP list (Redis)
   - Use pagination for proposals

3. **Email**

   - Move email sending to async queue (BullMQ + Redis)
   - Use transactional email service (SendGrid, Mailgun)
   - Implement IMAP polling as background worker

4. **AI**

   - Cache AI responses for similar prompts
   - Use GPT-3.5-turbo for faster, cheaper responses
   - Implement fallback to simpler heuristics if API fails

5. **Frontend**
   - Lazy load pages (React.lazy)
   - Implement virtualization for large tables
   - Add service worker for offline support

---

## Security Considerations

1. **Authentication** (TODO)

   - Add JWT or session-based auth
   - Role-based access control (RBAC)

2. **Data**

   - Encrypt sensitive fields (API keys, email passwords)
   - Use environment variables, never commit secrets
   - Add audit logging

3. **API**

   - Validate all inputs (express-validator)
   - Use HTTPS in production
   - Add CORS properly
   - Rate limit to prevent abuse

4. **Email**
   - Use SMTP TLS/SSL
   - Validate sender addresses
   - Scan attachments for malware

---

**End of Architecture Overview**

# Quick Start Guide

## ⚡ 5-Minute Setup

### Prerequisites

- Node.js 16+
- PostgreSQL 12+ (or similar)
- OpenAI API key
- Gmail account (or email provider)

### Step 1: Install Dependencies (2 min)

```bash
# Backend
cd backend
npm install

# Frontend (new terminal)
cd frontend
npm install
```

### Step 2: Setup Database (2 min)

```bash
# Create database
createdb rfp_db

# In backend folder, setup Prisma
cd backend
npx prisma migrate deploy

# Seed sample vendors (optional)
npm run db:seed
```

### Step 3: Configure Environment (1 min)

```bash
# Backend/.env
cp .env.example .env
# Edit .env with your credentials:
# - DATABASE_URL=postgresql://...
# - OPENAI_API_KEY=sk-...
# - SMTP credentials (Gmail)
```

### Step 4: Start Servers

```bash
# Terminal 1: Backend
cd backend
npm run dev
# → Running on http://localhost:4000

# Terminal 2: Frontend
cd frontend
npm run dev
# → Running on http://localhost:3000
```

### Step 5: Create Your First RFP

1. Open http://localhost:3000
2. Click "+ Create RFP"
3. Paste this example:
   ```
   I need 20 laptops with 16GB RAM and 15 monitors 27-inch.
   Budget is $50,000 total. Need delivery within 30 days.
   Payment terms should be net 30, and we need at least 1 year warranty.
   ```
4. Click "Create RFP" → AI parses it into structured format
5. Go to "Vendor Management" → add some vendors
6. Select RFP → select vendors → "Send RFP to Selected Vendors"
7. Simulate a proposal response manually (POST to /api/proposals)
8. Click "Compare Proposals" → See AI recommendations

---

## 🧪 Test with Sample Data

### Option 1: Via UI

- Create 3-4 RFPs with different budgets
- Add 5-6 vendors
- Send RFPs
- Manually add proposals with different pricing

### Option 2: Via API (curl)

```bash
# 1. Create RFP
RFP_ID=$(curl -X POST http://localhost:4000/api/rfps \
  -H "Content-Type: application/json" \
  -d '{"description":"20 laptops, $50k budget"}' | jq -r '.id')

# 2. Create vendor
VENDOR_ID=$(curl -X POST http://localhost:4000/api/vendors \
  -H "Content-Type: application/json" \
  -d '{"name":"TechCorp","email":"sales@tech.com"}' | jq -r '.id')

# 3. Send RFP
curl -X POST http://localhost:4000/api/rfps/$RFP_ID/send \
  -H "Content-Type: application/json" \
  -d "{\"vendorIds\":[\"$VENDOR_ID\"]}"

# 4. Add proposal
curl -X POST http://localhost:4000/api/proposals \
  -H "Content-Type: application/json" \
  -d "{
    \"rfpId\":\"$RFP_ID\",
    \"vendorId\":\"$VENDOR_ID\",
    \"emailBody\":\"We offer 20 laptops @ \$2400 each, 15 monitors @ \$400 each. Total \$54000. Delivery 28 days. Payment net 30. 3-year warranty.\"
  }"

# 5. Compare
curl http://localhost:4000/api/proposals/compare/$RFP_ID | jq
```

---

## 🔧 Configuration Checklist

- [ ] PostgreSQL installed & running (`psql --version`)
- [ ] `backend/.env` created with DATABASE_URL
- [ ] `backend/.env` has OPENAI_API_KEY
- [ ] `backend/.env` has SMTP credentials
- [ ] `npx prisma migrate deploy` completed
- [ ] Backend starts: `npm run dev` in /backend
- [ ] Frontend starts: `npm run dev` in /frontend
- [ ] Can access http://localhost:3000

---

## 🐛 Common Issues

| Issue                                        | Solution                                                                                                |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `error: connect ECONNREFUSED 127.0.0.1:5432` | PostgreSQL not running. Start it: `brew services start postgresql` or `sudo systemctl start postgresql` |
| `OPENAI_API_KEY is not valid`                | Check your key at https://platform.openai.com/account/api-keys                                          |
| `SMTP connection timed out`                  | Gmail: use App Password, not regular password. Enable 2FA first.                                        |
| `Cannot find module 'react'`                 | Run `npm install` in frontend folder                                                                    |
| `Prisma error`                               | Run `npx prisma migrate deploy` or `npm run db:reset`                                                   |

---

## 📚 Next Steps

1. **Customize AI Prompts** - Edit `src/ai.ts` to tweak RFP parsing & scoring
2. **Add Email Polling** - Implement IMAP worker in `src/workers/emailWorker.ts`
3. **Add Authentication** - Integrate NextAuth or Firebase Auth
4. **Deploy** - Use Heroku, Vercel, or Docker
5. **Add Tests** - Write Jest tests for AI integration

---

## 📖 Full Documentation

See `README.md` for:

- Full API documentation
- AI prompts & examples
- Deployment guide
- Architecture decisions
- Troubleshooting guide

---

**Happy procuring! 🚀**

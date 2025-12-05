# ⚡ Frontend Quick Reference

Quick commands and tips for frontend development.

## 🚀 Start Working

```bash
# Terminal 1: Start backend first (must be running!)
cd backend
npm run dev
# → Backend on http://localhost:4000

# Terminal 2: Start frontend
cd frontend
npm run dev
# → Frontend on http://localhost:3000
```

Then open **http://localhost:3000** in your browser.

---

## 📂 File Structure at a Glance

```
frontend/src/
├── main.tsx              # Entry point (don't change)
├── App.tsx               # Main router (change here to add pages)
├── api.ts                # API calls (change here to add endpoints)
├── index.css             # Global styling (change here for design)
└── pages/
    ├── Dashboard.tsx     # Shows list of RFPs
    ├── CreateRFP.tsx     # Form to create RFP
    ├── Vendors.tsx       # Manage vendors
    └── RFPDetail.tsx     # View RFP & compare proposals
```

---

## 🎯 Most Common Tasks

### Task 1: Change Colors/Fonts

**File:** `frontend/src/index.css`

Find these sections and edit:

```css
/* Colors */
--primary: #007bff;
--secondary: #6c757d;
--danger: #dc3545;
--success: #28a745;

/* Fonts */
font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
font-size: 16px;
```

### Task 2: Add a New Button

**File:** `frontend/src/pages/Dashboard.tsx` (example)

```tsx
<button onClick={() => handleAction()} className="btn btn-primary">
  Click Me
</button>
```

### Task 3: Add a New Form Field

**File:** `frontend/src/pages/CreateRFP.tsx` (example)

```tsx
// 1. Add state
const [newField, setNewField] = useState("");

// 2. Add input
<input
  value={newField}
  onChange={(e) => setNewField(e.target.value)}
  placeholder="Enter value"
/>;

// 3. Use in submission
const handleSubmit = async () => {
  await apiFunction({
    ...otherData,
    newField,
  });
};
```

### Task 4: Call Backend API

**File:** `frontend/src/api.ts` (to add function) and any page (to use it)

**Add to api.ts:**

```tsx
export const myAPI = {
  getData: async () => {
    const response = await api.get("/api/my-endpoint");
    return response.data;
  },
};
```

**Use in component:**

```tsx
useEffect(() => {
  const data = await myAPI.getData();
  setData(data);
}, []);
```

### Task 5: Show Error Message

**File:** Any component

```tsx
const [error, setError] = useState<string | null>(null);

const handleAction = async () => {
  try {
    setError(null);
    // do something
  } catch (err) {
    setError("Something went wrong!");
  }
};

return (
  <>
    {error && <div className="error-message">{error}</div>}
    {/* rest of UI */}
  </>
);
```

### Task 6: Show Loading Spinner

**File:** Any component

```tsx
const [loading, setLoading] = useState(false);

const handleAction = async () => {
  setLoading(true);
  try {
    // do something
  } finally {
    setLoading(false);
  }
};

return (
  <button disabled={loading}>
    {loading ? <span className="loading">...</span> : "Submit"}
  </button>
);
```

---

## 🔍 Debugging Checklist

When something doesn't work:

- [ ] Is backend running? Check Terminal 1: `npm run dev` in backend folder
- [ ] Is frontend running? Check Terminal 2: `npm run dev` in frontend folder
- [ ] Check browser console (F12 → Console tab)
- [ ] Check Network tab (F12 → Network tab) to see API calls
- [ ] Check server terminal output for errors
- [ ] Look for red error messages in browser

---

## 📋 API Cheat Sheet

### RFPs

```tsx
rfpsAPI.getAll(); // Get all RFPs
rfpsAPI.get(id); // Get single RFP
rfpsAPI.create(description); // Create RFP (AI parsing)
rfpsAPI.send(id, vendorIds); // Send RFP to vendors
```

### Vendors

```tsx
vendorsAPI.getAll(); // Get all vendors
vendorsAPI.create(vendor); // Create vendor
vendorsAPI.update(id, vendor); // Update vendor
vendorsAPI.delete(id); // Delete vendor
```

### Proposals

```tsx
proposalsAPI.getAll(); // Get all proposals
proposalsAPI.add(rfpId, vendorId, data); // Add proposal
proposalsAPI.compare(rfpId); // Compare proposals
```

---

## 🎨 CSS Class Reference

### Buttons

```css
.btn                    /* Base button styling */
/* Base button styling */
.btn-primary            /* Blue submit button */
.btn-secondary          /* Gray back/cancel button */
.btn-danger             /* Red delete button */
.btn-large; /* Bigger button */
```

### Forms

```css
.form-group             /* Wrapper for label + input */
/* Wrapper for label + input */
.textarea-large         /* Large textarea */
.error-message          /* Red error box */
.success-message; /* Green success box */
```

### Cards & Layout

```css
.rfp-card/* RFP card in grid */
.rfp-card: hover /* Card hover effect */ .rfp-grid /* Grid of RFP cards */
  .examples-section;
.rfp-card/* Examples area */;
```

### Tables

```css
table                   /* Standard table */
thead                   /* Table header */
tbody                   /* Table body */
```

---

## 🧠 Component Template

Copy & paste this when creating a new page:

```tsx
import React, { useState, useEffect } from "react";
import { rfpsAPI } from "../api"; // Change to your API

interface MyPageProps {
  onBack: () => void;
}

const MyPage: React.FC<MyPageProps> = ({ onBack }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await rfpsAPI.getAll(); // Change to your API
      setData(result);
    } catch (err) {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="my-page">
      <button onClick={onBack} className="btn btn-secondary">
        ← Back
      </button>

      <h2>My Page</h2>

      {/* Your content here */}
    </div>
  );
};

export default MyPage;
```

---

## 🔌 TypeScript Tips

### Define Data Types

```tsx
interface RFP {
  id: string;
  title: string;
  budget: number;
  deliveryDays: number;
}

const rfp: RFP = {
  id: "1",
  title: "Laptops",
  budget: 50000,
  deliveryDays: 30,
};
```

### Component Props Type

```tsx
interface MyComponentProps {
  name: string;
  count: number;
  onClick: () => void;
}

const MyComponent: React.FC<MyComponentProps> = ({ name, count, onClick }) => {
  return (
    <button onClick={onClick}>
      {name} ({count})
    </button>
  );
};
```

---

## 🎓 Learning Path

1. **Start here**: Read this file (you're doing it!)
2. **Understand structure**: Read FRONTEND_GUIDE.md (detailed)
3. **Try examples**: Look at existing pages (Dashboard, Vendors)
4. **Make small changes**: Modify button colors in index.css
5. **Add a new button**: Copy button code from Dashboard
6. **Add a form field**: Copy form field from CreateRFP
7. **Call an API**: Use rfpsAPI examples from RFPDetail
8. **Create a new page**: Copy component template above

---

## ✅ Checklist Before You Start

- [ ] Node.js installed (run `node --version`)
- [ ] PostgreSQL running (run `psql` to check)
- [ ] Backend running (Terminal 1: `cd backend && npm run dev`)
- [ ] Frontend running (Terminal 2: `cd frontend && npm run dev`)
- [ ] Browser open to http://localhost:3000
- [ ] DevTools open (F12) to see console

---

## 🆘 Common Issues

**Issue:** "Cannot find module 'react'"

```bash
npm install
```

**Issue:** "Backend not responding"

- Check Terminal 1: Is backend running?
- Check http://localhost:4000/health
- Make sure DATABASE_URL in backend/.env is correct

**Issue:** "Port 3000 already in use"

```bash
# Find process using port 3000
lsof -i :3000
# Kill it
kill -9 <PID>
```

**Issue:** "Vite is not defined"

```bash
npm install
npm run dev
```

---

## 📖 See Also

- **FRONTEND_GUIDE.md** - Detailed frontend documentation
- **README.md** - Full project documentation
- **api_test.sh** - Test API endpoints
- **DEMO_GUIDE.md** - Demo walkthrough

---

**Now you're ready! Pick a task above and start coding! 🚀**

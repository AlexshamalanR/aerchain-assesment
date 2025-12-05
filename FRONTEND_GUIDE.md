# 🎨 Frontend Development Guide

Complete guide to working with the React frontend of the RFP Management System.

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── main.tsx              # React DOM entry point
│   ├── App.tsx               # Main component with routing
│   ├── api.ts                # Axios API client
│   ├── index.css             # Global styles
│   └── pages/
│       ├── Dashboard.tsx      # RFP list page
│       ├── CreateRFP.tsx      # Create RFP form
│       ├── Vendors.tsx        # Vendor management
│       └── RFPDetail.tsx      # RFP details & comparison
├── index.html                # HTML entry point
├── vite.config.ts            # Vite configuration
├── tsconfig.json             # TypeScript config
├── package.json              # Dependencies
└── .gitignore                # Git ignore rules
```

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

**Output:**
```
  VITE v5.0.8  ready in 245 ms

  ➜  Local:   http://localhost:3000
  ➜  Press h to show help
```

### 3. Open in Browser

```bash
open http://localhost:3000
```

---

## 📝 File Structure & What Each File Does

### `src/main.tsx`
**Purpose:** React entry point  
**What it does:** Renders the App component into the DOM

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

---

### `src/App.tsx`
**Purpose:** Main application component with page routing  
**What it does:**
- Manages current page state
- Simple button-based navigation (not React Router)
- Handles page switching

**Key Components:**
```tsx
// useState tracks which page user is viewing
const [currentPage, setCurrentPage] = useState<'dashboard' | 'create' | 'vendors' | 'detail'>('dashboard');
const [selectedRFPId, setSelectedRFPId] = useState<string | null>(null);

// renderPage() function switches between pages
const renderPage = () => {
  switch (currentPage) {
    case 'dashboard': return <Dashboard ... />;
    case 'create': return <CreateRFP ... />;
    case 'vendors': return <Vendors ... />;
    case 'detail': return <RFPDetail ... />;
  }
};
```

**How to add a new page:**
1. Create file in `src/pages/NewPage.tsx`
2. Add new case to renderPage() switch
3. Add button in navigation header

---

### `src/api.ts`
**Purpose:** Axios HTTP client with all API endpoints  
**What it does:** Provides functions to call backend APIs

**Key API Objects:**

```tsx
// RFP endpoints
rfpsAPI.getAll()                      // GET /api/rfps
rfpsAPI.get(id)                       // GET /api/rfps/:id
rfpsAPI.create(description)           // POST /api/rfps (AI parsing)
rfpsAPI.send(id, vendorIds)           // POST /api/rfps/:id/send

// Vendor endpoints
vendorsAPI.getAll()                   // GET /api/vendors
vendorsAPI.get(id)                    // GET /api/vendors/:id
vendorsAPI.create(vendor)             // POST /api/vendors
vendorsAPI.update(id, vendor)         // PUT /api/vendors/:id
vendorsAPI.delete(id)                 // DELETE /api/vendors/:id

// Proposal endpoints
proposalsAPI.getAll()                 // GET /api/proposals
proposalsAPI.get(id)                  // GET /api/proposals/:id
proposalsAPI.add(rfpId, vendorId, ...) // POST /api/proposals
proposalsAPI.compare(rfpId)           // GET /api/proposals/compare/:rfpId
```

**Example Usage:**
```tsx
const rfps = await rfpsAPI.getAll();
const newRfp = await rfpsAPI.create("I need 20 laptops...");
```

---

### `src/pages/Dashboard.tsx`
**Purpose:** Display all RFPs in a grid  
**What it does:**
- Fetches all RFPs on page load
- Shows RFP cards with title, budget, delivery time
- Click card to view details
- Shows proposal count per RFP

**Key Features:**
```tsx
// On mount, fetch RFPs
useEffect(() => {
  const data = await rfpsAPI.getAll();
  setRfps(data);
}, []);

// Display as grid of cards
{rfps.map(rfp => (
  <div key={rfp.id} onClick={() => onSelectRFP(rfp.id)} className="rfp-card">
    <h3>{rfp.title}</h3>
    <p>Budget: ${rfp.budget}</p>
    <p>Delivery: {rfp.deliveryDays} days</p>
    <p>Proposals: {rfp.proposals?.length || 0}</p>
  </div>
))}
```

**How to modify:**
- Change card styling in `index.css` (.rfp-card)
- Add new fields to display (warranty, terms, etc.)
- Add filters (by budget, date range, etc.)

---

### `src/pages/CreateRFP.tsx`
**Purpose:** Create new RFPs from natural language  
**What it does:**
- Large textarea for user input
- Shows examples to guide users
- On submit, sends to backend for AI parsing
- Backend converts natural language → structured RFP JSON

**Key Features:**
```tsx
// State for form
const [description, setDescription] = useState('');
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

// On submit
const handleSubmit = async () => {
  const rfp = await rfpsAPI.create(description);
  // Backend AI parses and creates RFP
  onSuccess(); // Refresh dashboard
};
```

**Example Inputs Shown:**
```
"I need 20 laptops with 16GB RAM and 15 monitors 27-inch.
Budget is $50,000 total. Need delivery within 30 days.
Payment terms should be net 30, and we need at least 1 year warranty."
```

**How to modify:**
- Add more example prompts
- Change textarea rows
- Add fields (department, project name, etc.)

---

### `src/pages/Vendors.tsx`
**Purpose:** Manage vendor master data (CRUD)  
**What it does:**
- List all vendors in a table
- Add new vendor form
- Delete vendors
- Input validation

**Key Features:**
```tsx
// Fetch vendors on mount
useEffect(() => {
  const data = await vendorsAPI.getAll();
  setVendors(data);
}, []);

// Add vendor
const handleAddVendor = async () => {
  await vendorsAPI.create({
    name, email, contactName, phone, notes
  });
  setVendors(await vendorsAPI.getAll()); // Refresh
};

// Delete vendor
const handleDelete = async (id) => {
  await vendorsAPI.delete(id);
  setVendors(vendors.filter(v => v.id !== id));
};
```

**Form Fields:**
- Name (required)
- Email (required, unique)
- Contact Name
- Phone
- Notes

**How to modify:**
- Add new fields (address, category, rating)
- Add edit functionality
- Add bulk import/export

---

### `src/pages/RFPDetail.tsx`
**Purpose:** View RFP details and manage proposals  
**What it does:**
- Display full RFP information
- Show items list
- Select vendors and send RFP
- List all proposals
- Compare proposals and show AI recommendation

**Key Sections:**

**1. RFP Information Display**
```tsx
<div className="rfp-header">
  <h2>{rfp.title}</h2>
  <p>{rfp.descriptionRaw}</p>
  <div className="rfp-details">
    <div>Budget: ${rfp.budget}</div>
    <div>Delivery: {rfp.deliveryDays} days</div>
    <div>Payment Terms: {rfp.paymentTerms}</div>
    <div>Warranty: {rfp.warrantyMonths} months</div>
  </div>
</div>
```

**2. Items List**
```tsx
{rfp.structuredJson?.items?.map((item) => (
  <tr key={item.id}>
    <td>{item.name}</td>
    <td>{item.quantity}</td>
    <td>{item.specifications}</td>
    <td>{item.priority}</td>
  </tr>
))}
```

**3. Send to Vendors**
```tsx
// Checkboxes to select vendors
{vendors.map(vendor => (
  <label key={vendor.id}>
    <input
      type="checkbox"
      onChange={() => toggleVendor(vendor.id)}
    />
    {vendor.name}
  </label>
))}

// Send button
<button onClick={handleSendRFP}>Send RFP to Selected Vendors</button>
```

**4. Proposals List**
```tsx
{proposals.map(proposal => (
  <div className="proposal">
    <p>Vendor: {proposal.vendor.name}</p>
    <p>Price: ${proposal.totalPrice}</p>
    <p>Delivery: {proposal.deliveryDays} days</p>
    <p>Completeness: {proposal.completenessScore}%</p>
  </div>
))}
```

**5. Compare & Recommend**
```tsx
<button onClick={handleCompare}>Compare Proposals</button>

{comparison && (
  <div className="comparison-result">
    <div className="recommendation">
      <h3>Recommended: {comparison.recommendedVendorName}</h3>
      <p>Explanation: {comparison.explanation}</p>
    </div>
    
    <table className="scoring-table">
      <thead>
        <tr>
          <th>Vendor</th>
          <th>Price Score</th>
          <th>Completeness Score</th>
          <th>Delivery Score</th>
          <th>Terms Score</th>
          <th>Total Score</th>
        </tr>
      </thead>
      <tbody>
        {comparison.scores.map(score => (
          <tr key={score.vendorId}>
            <td>{score.vendorName}</td>
            <td>{score.priceScore}</td>
            <td>{score.completenessScore}</td>
            <td>{score.deliveryScore}</td>
            <td>{score.termsScore}</td>
            <td><strong>{score.totalScore}</strong></td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}
```

**How to modify:**
- Add more RFP fields
- Change comparison algorithm weights
- Add export/print functionality
- Add communication history

---

### `src/index.css`
**Purpose:** Global styles for entire application  
**What it does:** Professional, responsive design

**Key Style Classes:**

```css
/* Layout */
.app-container { width: 100%; max-width: 1200px; margin: 0 auto; }
.header { background: gradient; padding: 20px; }
.content { padding: 20px; }

/* Cards */
.rfp-card { border: 1px solid #ccc; padding: 15px; cursor: pointer; }
.rfp-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }

/* Forms */
.form-group { margin-bottom: 15px; }
.form-group label { display: block; margin-bottom: 5px; font-weight: bold; }
textarea { width: 100%; padding: 10px; border: 1px solid #ccc; }

/* Buttons */
.btn { padding: 10px 20px; border: none; cursor: pointer; border-radius: 4px; }
.btn-primary { background: #007bff; color: white; }
.btn-secondary { background: #6c757d; color: white; }
.btn-danger { background: #dc3545; color: white; }

/* Messages */
.error-message { background: #f8d7da; color: #721c24; padding: 12px; }
.success-message { background: #d4edda; color: #155724; padding: 12px; }
.loading { display: inline-block; animation: spin 1s linear infinite; }

/* Responsive */
@media (max-width: 768px) {
  .rfp-grid { grid-template-columns: 1fr; }
  .header { padding: 10px; }
}
```

**How to modify:**
- Change colors in color variables
- Adjust spacing (padding/margin)
- Add dark mode styles
- Improve mobile responsiveness

---

## 🔧 Common Development Tasks

### Add a New Page

**1. Create component file:**
```tsx
// src/pages/NewFeature.tsx
import React from 'react';

interface NewFeatureProps {
  onBack: () => void;
}

const NewFeature: React.FC<NewFeatureProps> = ({ onBack }) => {
  return (
    <div className="new-feature">
      <button onClick={onBack} className="btn btn-secondary">← Back</button>
      {/* Your content here */}
    </div>
  );
};

export default NewFeature;
```

**2. Update App.tsx:**
```tsx
// Add to useState
const [currentPage, setCurrentPage] = useState<'dashboard' | 'create' | 'vendors' | 'detail' | 'newfeature'>('dashboard');

// Add to renderPage()
case 'newfeature':
  return <NewFeature onBack={() => setCurrentPage('dashboard')} />;

// Add button to navigation
<button onClick={() => setCurrentPage('newfeature')}>New Feature</button>
```

---

### Add a New API Function

**1. Update src/api.ts:**
```tsx
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
});

export const newFeatureAPI = {
  getAll: async () => {
    const response = await api.get('/api/newfeature');
    return response.data;
  },
  
  create: async (data: any) => {
    const response = await api.post('/api/newfeature', data);
    return response.data;
  },
};
```

**2. Use in component:**
```tsx
const handleSubmit = async () => {
  const result = await newFeatureAPI.create({ /* data */ });
};
```

---

### Modify Styling

**Option 1: Global styles (index.css)**
```css
/* Add new class */
.my-component {
  background: #f0f0f0;
  padding: 20px;
  border-radius: 8px;
}

/* Responsive */
@media (max-width: 768px) {
  .my-component {
    padding: 10px;
  }
}
```

**Option 2: Inline styles**
```tsx
<div style={{ backgroundColor: '#f0f0f0', padding: '20px' }}>
  Content
</div>
```

---

### Add Error Handling

```tsx
const [error, setError] = useState<string | null>(null);

const handleAction = async () => {
  try {
    setError(null);
    const result = await apiFunction();
  } catch (err) {
    setError('Something went wrong: ' + err.message);
    console.error(err);
  }
};

return (
  <>
    {error && <div className="error-message">{error}</div>}
    {/* rest of JSX */}
  </>
);
```

---

### Add Loading States

```tsx
const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  try {
    setLoading(true);
    await apiFunction();
  } finally {
    setLoading(false);
  }
};

return (
  <button disabled={loading}>
    {loading ? 'Processing...' : 'Submit'}
  </button>
);
```

---

## 🐛 Debugging

### View Console Logs

```tsx
// Log data
console.log('RFPs:', rfps);

// Log errors
console.error('Error:', error);

// Open browser DevTools: F12 or Cmd+Option+I
```

### View Network Requests

1. Open DevTools (F12)
2. Go to "Network" tab
3. Make API call
4. See request/response

**Example:**
```
GET http://localhost:4000/api/rfps
Status: 200 OK
Response: { id: "...", title: "...", ... }
```

### Check Backend Connection

```tsx
// In api.ts, add logging
api.interceptors.response.use(
  response => {
    console.log('API Response:', response);
    return response;
  },
  error => {
    console.error('API Error:', error.response);
    throw error;
  }
);
```

---

## 📊 Development Workflow

### Daily Development Cycle

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Make changes** to React files
   - Vite hot reloads automatically
   - See changes in browser instantly

3. **Check for errors:**
   - Browser console (F12)
   - Terminal output
   - Network tab

4. **Test with backend:**
   - Make sure backend is running (Terminal 2: `npm run dev` in backend folder)
   - Make API calls from frontend
   - Verify responses in Network tab

5. **Commit changes:**
   ```bash
   git add .
   git commit -m "Feature: Add new feature"
   ```

---

## 🚢 Building for Production

### Build Process

```bash
npm run build
```

This creates a `dist/` folder with optimized files.

### Preview Build

```bash
npm run preview
```

Opens production build locally to test.

---

## 📚 Key Concepts

### React Hooks

**useState** - Manage component state
```tsx
const [value, setValue] = useState(initialValue);
```

**useEffect** - Run code on mount/update
```tsx
useEffect(() => {
  // Run on mount
  loadData();
}, []); // Empty dependency array = mount only
```

### TypeScript Interfaces

```tsx
interface RFP {
  id: string;
  title: string;
  budget: number;
  deliveryDays: number;
}

const rfp: RFP = { id: '1', title: 'Laptops', budget: 50000, deliveryDays: 30 };
```

### Props

```tsx
interface MyComponentProps {
  title: string;
  onClose: () => void;
}

const MyComponent: React.FC<MyComponentProps> = ({ title, onClose }) => {
  return <div>{title}</div>;
};
```

---

## 🔗 Related Documentation

- **README.md** - Full project documentation
- **ARCHITECTURE.md** - System design and data flows
- **IMPLEMENTATION_GUIDE.md** - Backend integration details
- **api_test.sh** - Testing API endpoints

---

## ⚡ Pro Tips

1. **Hot Reloading**: Vite automatically reloads when you save files - no manual refresh needed
2. **Type Safety**: Use TypeScript interfaces for all props and API responses
3. **Error Handling**: Always wrap API calls in try/catch
4. **Loading States**: Show user feedback while API calls are pending
5. **Responsive Design**: Test on mobile (use DevTools mobile view)
6. **Performance**: Minimize re-renders with proper useEffect dependencies

---

**Happy coding! 🚀**

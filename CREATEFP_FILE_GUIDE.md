# 📝 Working with CreateRFP.tsx

This file is the "Create RFP" page where users input natural language to create RFPs.

## 📍 File Location

```
frontend/src/pages/CreateRFP.tsx
```

## 🎯 What This File Does

1. **Displays a form** where users describe what they want to procure in natural language
2. **Sends description to backend** via the API
3. **Backend AI processes it** (GPT-4o) and converts to structured RFP
4. **Shows examples** to guide users on what to input

---

## 📊 File Structure

```tsx
// 1. Imports
import React, { useState } from 'react';
import { rfpsAPI } from '../api';

// 2. Props interface
interface CreateRFPProps {
  onBack: () => void;      // Function to go back to Dashboard
  onSuccess: () => void;   // Function to refresh after creation
}

// 3. Component
const CreateRFP: React.FC<CreateRFPProps> = ({ onBack, onSuccess }) => {
  // 4. State
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 5. Handle form submission
  const handleSubmit = async () => { ... }

  // 6. Return JSX
  return ( ... )
};

// 7. Export
export default CreateRFP;
```

---

## 🧩 Breaking Down Each Section

### 1. Imports

```tsx
import React, { useState } from 'react';
import { rfpsAPI } from '../api';
```

- `React, useState` - React hook for state management
- `rfpsAPI` - API functions to call backend

### 2. Props Interface

```tsx
interface CreateRFPProps {
  onBack: () => void;      // Called when user clicks "Back"
  onSuccess: () => void;   // Called after RFP created (to refresh dashboard)
}
```

Props are data passed from parent component (App.tsx).

### 3. Component Definition

```tsx
const CreateRFP: React.FC<CreateRFPProps> = ({ onBack, onSuccess }) => {
```

- `React.FC` - TypeScript type for React Functional Component
- `{ onBack, onSuccess }` - Destructure props

### 4. State Management

```tsx
const [description, setDescription] = useState('');
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

| State | Purpose |
|-------|---------|
| `description` | User's natural language input |
| `loading` | Show "Creating..." while submitting |
| `error` | Display error message if something fails |

### 5. Handle Submission

```tsx
const handleSubmit = async () => {
  // Validation
  if (!description.trim()) {
    setError('Please enter a procurement description');
    return;
  }

  try {
    // Start loading
    setLoading(true);
    setError(null);
    
    // Call backend API
    await rfpsAPI.create(description);
    
    // Success!
    alert('RFP created successfully!');
    setDescription('');  // Clear form
    onSuccess();         // Refresh parent (Dashboard)
    
  } catch (err) {
    // Show error
    setError('Failed to create RFP');
    console.error(err);
    
  } finally {
    // Stop loading
    setLoading(false);
  }
};
```

**Flow:**
1. Validate input not empty
2. Show loading state
3. Call backend `rfpsAPI.create(description)`
4. Backend AI parses it
5. Show success message
6. Clear form
7. Refresh parent component

### 6. JSX (UI)

**Back Button:**
```tsx
<button onClick={onBack} className="btn btn-secondary">
  ← Back
</button>
```

**Title & Help Text:**
```tsx
<h2>Create New RFP</h2>
<p className="help-text">
  Describe what you want to procure in natural language...
</p>
```

**Error Display:**
```tsx
{error && <div className="error-message">{error}</div>}
```

Shows red error box only if error exists.

**Form Input:**
```tsx
<div className="form-group">
  <label>Procurement Requirement:</label>
  <textarea
    value={description}
    onChange={(e) => setDescription(e.target.value)}
    placeholder="Example: I need to procure laptops..."
    rows={10}
    className="textarea-large"
  />
</div>
```

- `value={description}` - React binding to state
- `onChange={(e) => setDescription(e.target.value)}` - Update state on type
- `rows={10}` - Make textarea tall
- `placeholder` - Example text when empty

**Submit Button:**
```tsx
<button
  onClick={handleSubmit}
  className="btn btn-primary btn-large"
  disabled={loading}
>
  {loading ? 'Creating RFP...' : 'Create RFP'}
</button>
```

- `disabled={loading}` - Disable while submitting
- Shows "Creating RFP..." while loading
- Shows "Create RFP" when ready

**Examples Section:**
```tsx
<div className="examples-section">
  <h3>Example Inputs:</h3>
  <div className="example">
    <strong>Office Equipment:</strong>
    <p>"I need office furniture for 50 people..."</p>
  </div>
  <div className="example">
    <strong>Software Services:</strong>
    <p>"Looking for a cloud collaboration platform..."</p>
  </div>
</div>
```

Shows 2 example prompts to guide users.

---

## 🛠️ How to Modify This File

### Add a New Example

```tsx
<div className="examples-section">
  <h3>Example Inputs:</h3>
  
  {/* Existing examples */}
  <div className="example">
    <strong>Office Equipment:</strong>
    <p>...</p>
  </div>
  
  {/* NEW EXAMPLE - Add this */}
  <div className="example">
    <strong>Telecom Equipment:</strong>
    <p>
      "We need to upgrade our phone systems. 100 desk phones, 50 headsets.
      Budget $15k. Delivery in 2 weeks. Need 3-year warranty and 24/7 support."
    </p>
  </div>
</div>
```

### Add a Form Field

Example: Add project name field

```tsx
// 1. Add state
const [projectName, setProjectName] = useState('');

// 2. Add to form
<div className="form-group">
  <label>Project Name:</label>
  <input
    type="text"
    value={projectName}
    onChange={(e) => setProjectName(e.target.value)}
    placeholder="e.g., Office Upgrade 2024"
  />
</div>

// 3. Include in submission
const handleSubmit = async () => {
  if (!description.trim() || !projectName.trim()) {
    setError('Please fill in all fields');
    return;
  }
  
  await rfpsAPI.create(description, projectName);
};
```

### Add Validation

```tsx
const handleSubmit = async () => {
  // Check if description is at least 20 characters
  if (description.trim().length < 20) {
    setError('Please provide more details (at least 20 characters)');
    return;
  }
  
  try {
    // ... rest of submission
  }
};
```

### Show Loading Spinner

Instead of just text, show a spinner:

```tsx
{loading ? (
  <div className="loading-spinner">
    <span className="spinner"></span>
    Creating RFP (analyzing with AI...)
  </div>
) : (
  'Create RFP'
)}
```

Then add CSS in `index.css`:
```css
.loading-spinner {
  display: flex;
  align-items: center;
  gap: 10px;
}

.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

### Add Success Message

```tsx
const [success, setSuccess] = useState(false);

const handleSubmit = async () => {
  try {
    // ...
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000); // Hide after 3s
  }
};

return (
  <>
    {success && <div className="success-message">✓ RFP created successfully!</div>}
    {error && <div className="error-message">{error}</div>}
    {/* rest of JSX */}
  </>
);
```

---

## 📖 How It Works (End-to-End)

```
User Flow:
┌─────────────────────────────────────────────────────────┐
│ 1. User types in textarea                              │
│    Example: "I need 20 laptops, $50k budget, 30 days"  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 2. User clicks "Create RFP" button                      │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 3. handleSubmit() is called                             │
│    - Validates input not empty                          │
│    - Sets loading = true                               │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 4. rfpsAPI.create(description) calls backend            │
│    HTTP POST /api/rfps with description                │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 5. Backend processes (backend/src/routes/rfps.ts)      │
│    - Calls AI: parseRFPFromNaturalLanguage()           │
│    - GPT-4o converts to JSON                           │
│    - Saves to database                                 │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 6. Backend returns RFP data (JSON)                      │
│    { id, title, budget, deliveryDays, items, ... }    │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 7. Frontend receives success                            │
│    - Shows alert: "RFP created successfully!"           │
│    - Clears form                                        │
│    - Calls onSuccess()                                 │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 8. onSuccess() refreshes Dashboard                      │
│    - New RFP appears in list                           │
│    - User returns to Dashboard                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🔗 Related Files

| File | Purpose |
|------|---------|
| `src/App.tsx` | Calls CreateRFP with onSuccess/onBack |
| `src/api.ts` | `rfpsAPI.create()` function |
| `src/index.css` | Styles for `.create-rfp`, `.form-group`, etc. |
| `/backend/src/routes/rfps.ts` | Handles POST /api/rfps |
| `/backend/src/ai.ts` | `parseRFPFromNaturalLanguage()` |

---

## ✅ Checklist: Things You Can Try

- [ ] Change placeholder text
- [ ] Add a new example input
- [ ] Add a new form field (e.g., department)
- [ ] Add character count validator
- [ ] Show a spinner while loading
- [ ] Add a success message
- [ ] Change button colors in index.css
- [ ] Modify help text
- [ ] Add keyboard shortcut (Ctrl+Enter to submit)

---

## 🎓 Learning Moment

This file teaches you:
- ✅ React hooks (useState)
- ✅ Form handling in React
- ✅ Async/await with try/catch
- ✅ Conditional rendering
- ✅ TypeScript interfaces for props
- ✅ API integration

All these are used throughout the entire frontend!

---

**Ready to modify? Pick one thing above and try it! 🚀**

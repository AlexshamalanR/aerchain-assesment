#!/bin/bash

# 🎯 Frontend Development - Complete Getting Started

echo "
╔════════════════════════════════════════════════════════════════╗
║           🎨 FRONTEND DEVELOPMENT - GETTING STARTED           ║
║             How to Work on the React Code                     ║
╚════════════════════════════════════════════════════════════════╝
"

echo ""
echo "📖 YOU'VE ASKED: 'How to work on frontend?'"
echo ""
echo "Here's your answer in 3 levels:"
echo ""

echo "═════════════════════════════════════════════════════════════"
echo "🟢 LEVEL 1: QUICK START (5 MINUTES)"
echo "═════════════════════════════════════════════════════════════"
echo ""

cat << 'EOF'
  Terminal 1 - Start Backend:
  ──────────────────────────
  $ cd /home/alexshamalan/assesment-aerchain/backend
  $ npm run dev
  
  You should see: "Server running on http://localhost:4000"
  
  Terminal 2 - Start Frontend:
  ────────────────────────────
  $ cd /home/alexshamalan/assesment-aerchain/frontend
  $ npm run dev
  
  You should see: "VITE ready at http://localhost:3000"
  
  Browser:
  ────────
  Open: http://localhost:3000
  
  Now you're ready to develop! ✨

EOF

echo ""
echo "═════════════════════════════════════════════════════════════"
echo "🟡 LEVEL 2: UNDERSTAND THE STRUCTURE (15 MINUTES)"
echo "═════════════════════════════════════════════════════════════"
echo ""

cat << 'EOF'
  Project Layout:
  ────────────────
  
  frontend/
  ├── src/
  │   ├── main.tsx              ← Entry point (don't change)
  │   ├── App.tsx               ← Main page router
  │   ├── api.ts                ← API functions (like "create RFP")
  │   ├── index.css             ← All colors, fonts, buttons
  │   └── pages/
  │       ├── Dashboard.tsx      ← Shows list of RFPs
  │       ├── CreateRFP.tsx      ← Form to create RFP
  │       ├── Vendors.tsx        ← Manage vendors
  │       └── RFPDetail.tsx      ← View RFP & compare proposals
  └── index.html                ← HTML template

  The 4 Pages:
  ────────────
  
  1. Dashboard
     ├─ Shows all RFPs
     ├─ Each RFP as a card
     └─ Click to view details
     
  2. CreateRFP (file you're looking at!)
     ├─ Large text area for user input
     ├─ Shows example prompts
     ├─ Sends to backend for AI parsing
     └─ Creates structured RFP
     
  3. Vendors
     ├─ List of all vendors
     ├─ Form to add vendors
     └─ Delete button per vendor
     
  4. RFPDetail
     ├─ Full RFP information
     ├─ Send to vendors button
     ├─ List of proposals
     └─ Compare & recommend button

  Key Concepts:
  ─────────────
  
  • React Component = A reusable piece of UI
  • useState = Store data in a component
  • useEffect = Run code when component loads
  • Props = Data passed from parent to child
  • API = Function that calls backend server
  • TypeScript = Adds type safety to JavaScript

EOF

echo ""
echo "═════════════════════════════════════════════════════════════"
echo "🔴 LEVEL 3: SPECIFIC FILE YOU'RE LOOKING AT (30 MINUTES)"
echo "═════════════════════════════════════════════════════════════"
echo ""

cat << 'EOF'
  File: frontend/src/pages/CreateRFP.tsx
  ──────────────────────────────────────
  
  What it does:
  • Shows a form where users describe procurement needs
  • Example: "I need 20 laptops, $50k budget, 30 days"
  • Sends this to backend
  • Backend AI (GPT-4o) parses it
  • Creates a structured RFP with items, budget, etc.
  
  Key Parts:
  
  1. State (data the component remembers)
     const [description, setDescription] = useState('');
     └─ Stores what user types in textarea
     
     const [loading, setLoading] = useState(false);
     └─ True while API call is happening
     
     const [error, setError] = useState(null);
     └─ Error message if something goes wrong
  
  2. Form Submission Handler
     const handleSubmit = async () => {
       // Check if user entered something
       if (!description.trim()) {
         setError('Please enter text');
         return;
       }
       
       try {
         // Show loading state
         setLoading(true);
         
         // Call backend
         await rfpsAPI.create(description);
         
         // Show success
         alert('RFP created!');
         setDescription('');  // Clear form
         onSuccess();         // Refresh parent
         
       } catch (err) {
         // Show error
         setError('Failed to create RFP');
       } finally {
         setLoading(false);
       }
     }
  
  3. User Interface
     <textarea>
       └─ Where user types their requirement
       
     <button onClick={handleSubmit}>
       └─ Button to submit the form
       
     <div className="examples-section">
       └─ Example prompts to guide users
  
  Data Flow:
  
  User types → State updates → Backend API call → 
  Backend AI processes → Creates RFP → Shows success →
  Clears form → Refreshes dashboard

EOF

echo ""
echo "═════════════════════════════════════════════════════════════"
echo "🎯 MOST COMMON CHANGES YOU'LL MAKE"
echo "═════════════════════════════════════════════════════════════"
echo ""

cat << 'EOF'
  Change 1: Modify Button Colors
  ───────────────────────────────
  File: frontend/src/index.css
  
  Find: .btn-primary { background: #007bff; }
  Change to: .btn-primary { background: #28a745; }
  
  Result: All primary buttons turn green!

  Change 2: Add a New Example
  ──────────────────────────
  File: frontend/src/pages/CreateRFP.tsx (line ~70)
  
  Add this:
  <div className="example">
    <strong>Network Equipment:</strong>
    <p>"We need routers and switches for 100 devices..."</p>
  </div>

  Change 3: Add a Form Field
  ─────────────────────────
  File: frontend/src/pages/CreateRFP.tsx
  
  Step 1: Add state
  const [department, setDepartment] = useState('');
  
  Step 2: Add input
  <input 
    value={department}
    onChange={(e) => setDepartment(e.target.value)}
    placeholder="Department"
  />

  Change 4: Call Backend API
  ──────────────────────────
  File 1: frontend/src/api.ts
  Add: export const myAPI = {
    getStatus: async () => {
      const res = await api.get('/api/status');
      return res.data;
    }
  };
  
  File 2: Any component
  Use: const status = await myAPI.getStatus();

  Change 5: Show an Error Message
  ───────────────────────────────
  Already in CreateRFP.tsx!
  Look for: {error && <div className="error-message">{error}</div>}

EOF

echo ""
echo "═════════════════════════════════════════════════════════════"
echo "⚡ WORKFLOW TIPS"
echo "═════════════════════════════════════════════════════════════"
echo ""

cat << 'EOF'
  1. Hot Reloading
     Save a file → Browser automatically reloads
     No need to refresh manually!
  
  2. Debugging
     F12 → DevTools → Console tab
     Look for red error messages
  
  3. Network Requests
     F12 → Network tab → Make an API call
     See request/response in detail
  
  4. TypeScript Errors
     Terminal might show errors
     Read the error message
     Fix and save
     Auto-reloads!
  
  5. Console Logging
     console.log('value:', value);
     Shows up in F12 → Console
  
  6. Testing Locally
     Make changes
     Check browser
     If broken, open DevTools
     Read console errors
     Fix and retry

EOF

echo ""
echo "═════════════════════════════════════════════════════════════"
echo "📚 DOCUMENTATION GUIDE"
echo "═════════════════════════════════════════════════════════════"
echo ""

cat << 'EOF'
  Quick Reference:           FRONTEND_QUICK_REF.md
  Full Guide:                FRONTEND_GUIDE.md
  Current File Guide:        CREATEFP_FILE_GUIDE.md
  Development Workflow:      FRONTEND_WORKFLOW.sh
  System Architecture:       ARCHITECTURE.md
  Design Decisions:          IMPLEMENTATION_GUIDE.md
  Complete Demo:             DEMO_GUIDE.md
  Project Overview:          README.md

EOF

echo ""
echo "═════════════════════════════════════════════════════════════"
echo "✅ VERIFICATION CHECKLIST"
echo "═════════════════════════════════════════════════════════════"
echo ""

cat << 'EOF'
  Before you start developing:
  
  ✓ Node.js installed?
    $ node --version
    (should be 16+)
  
  ✓ Dependencies installed?
    $ npm install (in both backend/ and frontend/)
  
  ✓ Backend running?
    Terminal 1: cd backend && npm run dev
    Look for: "Server running on http://localhost:4000"
  
  ✓ Frontend running?
    Terminal 2: cd frontend && npm run dev
    Look for: "VITE ready in..."
  
  ✓ Browser open?
    http://localhost:3000
  
  ✓ See the UI?
    RFP dashboard with cards

EOF

echo ""
echo "═════════════════════════════════════════════════════════════"
echo "🚀 YOUR FIRST TASK"
echo "═════════════════════════════════════════════════════════════"
echo ""

cat << 'EOF'
  Pick ONE of these tasks and do it now:
  
  Task A: Change a Button Color
  ─────────────────────────────
  1. Open: frontend/src/index.css
  2. Find: .btn-primary { background: #007bff; }
  3. Change #007bff to #28a745 (green)
  4. Save (Ctrl+S)
  5. Browser auto-reloads and button turns green! ✨
  
  Task B: Add an Example Prompt
  ────────────────────────────
  1. Open: frontend/src/pages/CreateRFP.tsx
  2. Find: <div className="examples-section">
  3. Add a new <div className="example"> block
  4. Save (Ctrl+S)
  5. Reload browser to see your new example!
  
  Task C: Change Placeholder Text
  ──────────────────────────────
  1. Open: frontend/src/pages/CreateRFP.tsx (around line 40)
  2. Find: placeholder="Example: I need to procure..."
  3. Change the placeholder text
  4. Save (Ctrl+S)
  5. Reload and see new placeholder!

EOF

echo ""
echo "═════════════════════════════════════════════════════════════"
echo ""
echo "🎓 Next Steps:"
echo ""
echo "1. Read: FRONTEND_QUICK_REF.md"
echo "2. Read: FRONTEND_GUIDE.md"
echo "3. Pick a task above and DO IT"
echo "4. Celebrate when it works! 🎉"
echo ""
echo "═════════════════════════════════════════════════════════════"
echo ""

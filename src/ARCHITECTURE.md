# GRC Suite - System Architecture

## 🏗️ Architecture Overview

The GRC Suite is a **Single Page Application (SPA)** built with a modern, offline-first architecture that requires zero server infrastructure for basic operation.

```
┌─────────────────────────────────────────────────────────┐
│                      Browser Layer                       │
├─────────────────────────────────────────────────────────┤
│  React Components  │  State Management  │  UI/UX Layer  │
├─────────────────────────────────────────────────────────┤
│           Business Logic & Service Layer                │
│  ├─ Authentication Service                              │
│  ├─ Database Service (IndexedDB)                        │
│  ├─ Export Service (PDF/CSV)                            │
│  ├─ AI Service (OpenAI/Anthropic/Local)                 │
│  └─ Template Service (Frameworks)                       │
├─────────────────────────────────────────────────────────┤
│                 Data Storage Layer                       │
│              IndexedDB (Browser Storage)                 │
│  ├─ Users Store                                         │
│  ├─ Vendors Store                                       │
│  ├─ Compliance Store                                    │
│  ├─ VAPT Store                                          │
│  ├─ Privacy Store                                       │
│  ├─ Companies Store                                     │
│  └─ Settings Store                                      │
└─────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
/
├── lib/                      # Core libraries and services
│   ├── db.ts                # IndexedDB wrapper & schema
│   ├── auth.ts              # Authentication service
│   ├── ai.ts                # AI integration service
│   ├── export.ts            # PDF/CSV export utilities
│   └── templates.ts         # Compliance templates
│
├── components/              # React components
│   ├── Login.tsx           # Authentication UI
│   ├── Layout.tsx          # Main application layout
│   ├── Dashboard.tsx       # Dashboard with metrics
│   ├── UserManagement.tsx  # User & RBAC management
│   ├── VendorRisk.tsx      # Vendor risk assessment
│   ├── ComplianceManager.tsx # Compliance framework manager
│   ├── VAPTReporting.tsx   # VAPT report creator
│   ├── PrivacyManager.tsx  # Privacy modules (ROPA/DPIA/DSAR)
│   └── Settings.tsx        # Application settings
│
├── styles/                  # Styling
│   └── globals.css         # Global styles & Tailwind
│
├── App.tsx                 # Main application component
├── main.tsx                # Application entry point
└── index.html              # HTML shell

Documentation:
├── README.md               # User guide
├── INSTALLATION.md         # Deployment guide
└── ARCHITECTURE.md         # This file
```

## 🗄️ Data Architecture

### Database Schema

#### Users Store
```typescript
interface User {
  id: string;                    // Unique identifier
  username: string;              // Login username
  email: string;                 // User email
  password: string;              // Password (plain text for demo)
  role: 'admin' | 'auditor' | 'analyst' | 'viewer';
  permissions: {                 // Module-level permissions
    users: { read: boolean; write: boolean; execute: boolean };
    vendors: { read: boolean; write: boolean; execute: boolean };
    compliance: { read: boolean; write: boolean; execute: boolean };
    vapt: { read: boolean; write: boolean; execute: boolean };
    privacy: { read: boolean; write: boolean; execute: boolean };
  };
  createdAt: string;            // ISO timestamp
}
```

#### Vendors Store
```typescript
interface Vendor {
  id: string;                   // Unique identifier
  name: string;                 // Vendor company name
  status: 'pending' | 'in-review' | 'approved' | 'rejected';
  riskScore: number;            // 0-100 calculated score
  submittedAt?: string;         // Submission timestamp
  responses: Record<string, any>; // Questionnaire responses
  questionnaire: string;        // Template ID
  companyId: string;            // Multi-company support
  createdAt: string;            // Creation timestamp
}
```

#### Compliance Store
```typescript
interface ComplianceControl {
  id: string;                   // Unique identifier
  framework: string;            // e.g., "ISO 27001:2022"
  controlId: string;            // e.g., "A.5.1"
  title: string;                // Control title
  description: string;          // Control description
  status: 'compliant' | 'partial' | 'non-compliant' | 'not-applicable';
  evidence: string;             // Evidence of compliance
  notes: string;                // Additional notes
  companyId: string;            // Multi-company support
  updatedAt: string;            // Last update timestamp
}
```

#### VAPT Store
```typescript
interface VAPTReport {
  id: string;                   // Unique identifier
  title: string;                // Report title
  clientName: string;           // Client company name
  summary: string;              // Executive summary
  findings: Array<{             // Vulnerability findings
    id: string;
    title: string;
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    description: string;
    evidence: string;
    remediation: string;
    cvss: number;               // CVSS score 0-10
  }>;
  status: 'draft' | 'in-progress' | 'completed';
  companyId: string;            // Multi-company support
  createdAt: string;            // Creation timestamp
}
```

#### Privacy Store
```typescript
interface PrivacyRecord {
  id: string;                   // Unique identifier
  type: 'ropa' | 'pii' | 'dpia' | 'consent' | 'dsar';
  data: Record<string, any>;    // Type-specific data
  companyId: string;            // Multi-company support
  createdAt: string;            // Creation timestamp
}
```

#### Companies Store
```typescript
interface Company {
  id: string;                   // Unique identifier
  name: string;                 // Company name
  createdAt: string;            // Creation timestamp
}
```

#### Settings Store
```typescript
interface Settings {
  id: string;                   // Always 'settings-001'
  clientLogo?: string;          // Base64 image data
  auditorLogo?: string;         // Base64 image data
  primaryColor?: string;        // Hex color
  secondaryColor?: string;      // Hex color
  companyName?: string;         // Display name
  aiProvider?: 'openai' | 'anthropic' | 'local';
  aiApiKey?: string;            // API key for AI services
}
```

## 🔐 Authentication & Authorization

### Authentication Flow
```
1. User enters credentials
2. System queries IndexedDB Users store
3. Plain text password comparison (demo only!)
4. Create session in localStorage
5. Set current user in AuthService
6. Redirect to dashboard
```

### Authorization (RBAC)
```
┌─────────────────────────────────────────────┐
│              User Login                      │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│         Check User Role                      │
├─────────────────────────────────────────────┤
│  Admin: All permissions                      │
│  Auditor: Read/Write, no Execute             │
│  Analyst: Read + limited Write               │
│  Viewer: Read only                           │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│    Check Module Permissions                  │
├─────────────────────────────────────────────┤
│  For each module (users, vendors, etc.):     │
│  - Read: View data                           │
│  - Write: Modify data                        │
│  - Execute: Delete/bulk operations           │
└─────────────────────────────────────────────┘
```

### Session Management
- Sessions stored in localStorage
- No expiration (browser session only)
- Logout clears localStorage
- No server-side session validation

## 🔄 Data Flow

### Typical User Action Flow
```
User Action (Click/Type)
    ↓
React Component Event Handler
    ↓
Service Layer Function
    ↓
IndexedDB Transaction
    ↓
Data Store Updated
    ↓
React State Updated
    ↓
UI Re-renders
```

### Example: Creating a VAPT Finding
```javascript
// 1. User clicks "Add Finding"
handleAddFinding()

// 2. Service creates finding object
const newFinding = {
  id: `finding-${Date.now()}`,
  title: 'New Finding',
  severity: 'medium',
  // ... other fields
}

// 3. Update report with new finding
handleUpdateReport({
  findings: [...selectedReport.findings, newFinding]
})

// 4. Save to IndexedDB
await db.put('vapt', updatedReport)

// 5. Update local state
setSelectedReport(updatedReport)

// 6. UI updates automatically
```

## 🎨 UI Component Architecture

### Component Hierarchy
```
App
├── Login (if not authenticated)
└── Layout (if authenticated)
    ├── Header
    │   ├── Logo
    │   ├── Navigation Menu
    │   └── User Profile + Logout
    ├── Sidebar
    │   └── Navigation Links
    └── Main Content
        ├── Dashboard
        ├── UserManagement
        ├── VendorRisk
        ├── ComplianceManager
        ├── VAPTReporting
        ├── PrivacyManager
        └── Settings
```

### State Management
- **Local Component State**: useState for UI state
- **Effect Hooks**: useEffect for data loading
- **No Global State**: Each page manages its own data
- **Database as Source of Truth**: IndexedDB is single source

## 📤 Export Architecture

### PDF Export Flow
```
1. User clicks "Export PDF"
2. Generate HTML with embedded styles
3. Open new window with HTML content
4. Trigger browser print dialog
5. User saves as PDF
6. Window closes
```

### CSV Export Flow
```
1. User clicks "Export CSV"
2. Convert data array to CSV format
3. Create Blob with CSV content
4. Generate download link
5. Trigger download
6. Clean up resources
```

## 🤖 AI Integration Architecture

### AI Service Flow
```
User Request
    ↓
AI Service Method Called
    ↓
Get Settings from IndexedDB
    ↓
Check AI Provider & API Key
    ↓
Construct Prompt with Context
    ↓
Call External API (or Local)
    ↓
Parse Response
    ↓
Return Generated Text
    ↓
Update UI with Result
```

### Supported AI Providers
```
┌─────────────────────────────────────────────┐
│              AI Providers                    │
├─────────────────────────────────────────────┤
│  OpenAI                                      │
│  ├─ Model: GPT-4                            │
│  ├─ Endpoint: api.openai.com                │
│  └─ Auth: Bearer token                      │
│                                              │
│  Anthropic                                   │
│  ├─ Model: Claude 3                         │
│  ├─ Endpoint: api.anthropic.com             │
│  └─ Auth: x-api-key header                  │
│                                              │
│  Local AI                                    │
│  ├─ Models: Any (Ollama/LM Studio)          │
│  ├─ Endpoint: localhost                     │
│  └─ Auth: None                               │
└─────────────────────────────────────────────┘
```

## 🔌 Extensibility Points

### Adding New Compliance Framework
```typescript
// Edit /lib/templates.ts
export const complianceTemplates: ControlTemplate[] = [
  // ... existing frameworks
  {
    framework: 'Your Framework Name',
    version: '2024',
    controls: [
      {
        controlId: 'CF.1',
        title: 'Control Title',
        description: 'Control Description',
        category: 'Category Name',
      },
      // ... more controls
    ],
  },
];
```

### Adding New Module
```typescript
// 1. Create component: /components/NewModule.tsx
export function NewModule() {
  // Component logic
}

// 2. Add to App.tsx navigation
{currentPage === 'newmodule' && <NewModule />}

// 3. Add to Layout.tsx menu
{ id: 'newmodule', label: 'New Module', icon: Icon }

// 4. Add permissions if needed
permissions: {
  // ... existing
  newmodule: { read: boolean; write: boolean; execute: boolean }
}
```

### Adding New Export Format
```typescript
// Edit /lib/export.ts
export class ExportService {
  static exportToJSON(data: any[], filename: string): void {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    // ... download logic
  }
}
```

## 🔄 Offline Capability

### Current Implementation
- All data in IndexedDB
- No network calls except AI
- Application code cached by browser
- Works without internet after first load

### Future PWA Enhancement
```javascript
// service-worker.js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('grc-suite-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/assets/index.js',
        '/assets/index.css',
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

## 🛡️ Security Considerations

### Current Security Model
- ⚠️ **Demo Mode**: Plain text passwords
- ✅ **Client-side only**: No data sent to servers
- ✅ **Isolated storage**: Browser sandboxing
- ⚠️ **No encryption**: IndexedDB data not encrypted

### Production Recommendations
```typescript
// 1. Hash passwords
import bcrypt from 'bcryptjs';
const hashedPassword = await bcrypt.hash(password, 10);

// 2. Implement token-based auth
const token = jwt.sign({ userId: user.id }, SECRET_KEY);
localStorage.setItem('authToken', token);

// 3. Add session timeout
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
setTimeout(() => logout(), SESSION_TIMEOUT);

// 4. Encrypt sensitive data
import CryptoJS from 'crypto-js';
const encrypted = CryptoJS.AES.encrypt(data, key).toString();
```

## 📊 Performance Considerations

### Bundle Size Optimization
- Code splitting by route
- Lazy loading components
- Tree shaking unused code
- Minification in production

### IndexedDB Performance
- Indexed keys for fast lookups
- Batch operations where possible
- Async/await for non-blocking
- Cursors for large datasets

### Rendering Optimization
- React.memo for expensive components
- Virtual scrolling for long lists
- Debouncing input handlers
- Optimistic UI updates

## 🔮 Future Architecture Enhancements

### Backend Integration (Optional)
```
┌─────────────────────────────────────────────┐
│            Frontend (Browser)                │
│  ├─ React UI                                 │
│  └─ IndexedDB (Cache)                        │
└────────────────┬────────────────────────────┘
                 │ REST API / GraphQL
                 ▼
┌─────────────────────────────────────────────┐
│            Backend (Optional)                │
│  ├─ Node.js / Go / Python                   │
│  ├─ Authentication (JWT)                     │
│  ├─ Business Logic                           │
│  └─ Database (PostgreSQL/MongoDB)            │
└─────────────────────────────────────────────┘
```

### Multi-User Collaboration
- WebSocket for real-time updates
- Conflict resolution strategies
- User presence indicators
- Change notifications

### Advanced Features
- Document management system
- Workflow engine
- Email notifications
- Calendar integration
- Risk register
- Incident management

---

**This architecture provides a solid foundation for a production GRC platform while maintaining simplicity and offline capability.**

*Built with modern web standards • No lock-in • Fully extensible*

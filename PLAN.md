# Auth Kit Generator - Project Plan

## What We're Building

A web app that generates ready-to-use authentication code for React projects. Instead of manually setting up auth every time you start a new project, you visit this site, pick your backend, and download a zip file with everything you need.

---

## The Problem

Every new React project requires:
1. Creating an `auth/` folder with multiple files
2. Setting up the auth provider client (Supabase/Firebase)
3. Writing auth context and hooks
4. Creating login/logout UI components
5. Configuring environment variables
6. Setting up session tracking tables
7. Handling token refresh

This is repetitive and requires concentration even though the steps are the same every time.

---

## The Solution

A simple website where you:
1. Select your backend (Supabase or Firebase)
2. Toggle options you want
3. Click "Download ZIP"
4. Drop the files into your project

**No CLI. No terminal commands. Just a web UI.**

---

## Supported Configurations

### Backend Options
- **Supabase** + Google OAuth
- **Firebase** + Google OAuth

### Why Google OAuth Only?
- No password storage liability
- No password reset flows to build
- No email verification needed
- Google handles security
- Most users have a Google account

---

## What the Generated ZIP Contains

### For Supabase:
```
auth/
├── AuthProvider.tsx       # React context provider
├── useAuth.ts             # Hook: { user, signInWithGoogle, signOut, loading }
├── GoogleLoginButton.tsx  # Styled button component
├── client.ts              # Supabase client setup
├── sessionTracker.ts      # Logs first/last login, login count
├── types.ts               # TypeScript interfaces
├── .env.example           # Required environment variables
└── schema.sql             # SQL for user_sessions table
```

### For Firebase:
```
auth/
├── AuthProvider.tsx       # React context provider
├── useAuth.ts             # Hook: { user, signInWithGoogle, signOut, loading }
├── GoogleLoginButton.tsx  # Styled button component
├── client.ts              # Firebase app setup
├── sessionTracker.ts      # Logs sessions to Firestore
├── types.ts               # TypeScript interfaces
├── .env.example           # Required environment variables
└── firestore-rules.txt    # Security rules for user_sessions collection
```

---

## User Interface Design

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│   Auth Kit Generator                                     │
│   Generate authentication code for your React app        │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│   STEP 1: Choose Your Backend                            │
│                                                          │
│   ┌─────────────────┐    ┌─────────────────┐             │
│   │                 │    │                 │             │
│   │    Supabase     │    │    Firebase     │             │
│   │                 │    │                 │             │
│   └─────────────────┘    └─────────────────┘             │
│                                                          │
│   STEP 2: Select Options                                 │
│                                                          │
│   [x] Session tracking (first login, last login, count)  │
│   [x] Include .env.example file                          │
│   [x] Include database schema                            │
│   [x] Include styled Google login button                 │
│                                                          │
│   STEP 3: Download                                       │
│                                                          │
│   ┌──────────────────────────────────────────┐           │
│   │                                          │           │
│   │           Download ZIP                   │           │
│   │                                          │           │
│   └──────────────────────────────────────────┘           │
│                                                          │
│   ─────────────────────────────────────────────────      │
│                                                          │
│   Preview: Files included in your download               │
│                                                          │
│   📁 auth/                                               │
│      ├── AuthProvider.tsx                                │
│      ├── useAuth.ts                                      │
│      ├── GoogleLoginButton.tsx                           │
│      ├── client.ts                                       │
│      ├── sessionTracker.ts                               │
│      ├── types.ts                                        │
│      ├── .env.example                                    │
│      └── schema.sql                                      │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## Generated Code Specifications

### 1. AuthProvider.tsx

Wraps the entire app and provides auth state to all components.

**Responsibilities:**
- Initialize auth client on mount
- Listen for auth state changes
- Track user sessions (first login, subsequent logins)
- Provide auth context to children
- Handle token refresh automatically

**Context value:**
```typescript
{
  user: User | null;
  loading: boolean;
  error: Error | null;
  session: SessionInfo | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}
```

### 2. useAuth.ts

Simple hook to access auth context.

```typescript
const { user, signInWithGoogle, signOut, loading, session } = useAuth();
```

### 3. GoogleLoginButton.tsx

A styled, ready-to-use button component.

**Features:**
- Google "G" icon
- Loading state ("Signing in...")
- Disabled while loading
- Clean, minimal styling (easy to customize)
- Accessible (proper button semantics)

### 4. client.ts

Initializes the Supabase or Firebase client.

**Supabase version:**
```typescript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

**Firebase version:**
```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
});

export const auth = getAuth(app);
export const db = getFirestore(app);
```

### 5. sessionTracker.ts

Tracks user login history.

**Data stored:**
- `user_id` - unique identifier
- `email` - user's email
- `first_login_at` - timestamp of first ever login
- `last_login_at` - timestamp of most recent login
- `login_count` - total number of logins

**Logic:**
- On sign in, check if user record exists
- If not, create new record (first login)
- If yes, update last_login_at and increment login_count

### 6. types.ts

TypeScript interfaces for type safety.

```typescript
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

export interface SessionInfo {
  firstLoginAt: Date;
  lastLoginAt: Date;
  loginCount: number;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  session: SessionInfo | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}
```

### 7. .env.example

**Supabase:**
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Firebase:**
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
```

### 8. schema.sql / firestore-rules.txt

**Supabase (schema.sql):**
```sql
-- User sessions table
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  first_login_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ DEFAULT NOW(),
  login_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own session data
CREATE POLICY "Users can view own session"
  ON user_sessions FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can update their own session data
CREATE POLICY "Users can update own session"
  ON user_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Authenticated users can insert their session
CREATE POLICY "Users can insert own session"
  ON user_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
```

**Firebase (firestore-rules.txt):**
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /user_sessions/{sessionId} {
      allow read, write: if request.auth != null
        && request.auth.uid == resource.data.user_id;
      allow create: if request.auth != null
        && request.auth.uid == request.resource.data.user_id;
    }
  }
}
```

---

## Tech Stack for the Web App

| Component | Technology |
|-----------|------------|
| Framework | React + TypeScript |
| Styling | Tailwind CSS |
| ZIP Generation | JSZip (client-side) |
| File Download | file-saver |
| Hosting | Replit |
| Build Tool | Vite |

**Why these choices:**
- **React + TypeScript**: You're familiar with React, and TS is the modern standard
- **Tailwind CSS**: Fast to style, no custom CSS files needed
- **JSZip**: Creates ZIP files entirely in the browser (no server needed)
- **Replit**: Your preferred hosting platform
- **Vite**: Fast dev server, works great on Replit

---

## Project Structure

```
auth-kit-generator/
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── src/
│   ├── main.tsx                      # Entry point
│   ├── App.tsx                       # Main app component
│   ├── index.css                     # Tailwind imports
│   │
│   ├── components/
│   │   ├── Header.tsx                # App header/title
│   │   ├── BackendSelector.tsx       # Supabase/Firebase cards
│   │   ├── OptionsPanel.tsx          # Checkboxes for features
│   │   ├── FilePreview.tsx           # Shows files in ZIP
│   │   ├── DownloadButton.tsx        # Triggers ZIP download
│   │   └── Instructions.tsx          # Post-download steps
│   │
│   ├── templates/
│   │   ├── supabase/
│   │   │   ├── AuthProvider.ts       # Template as string
│   │   │   ├── useAuth.ts
│   │   │   ├── GoogleLoginButton.ts
│   │   │   ├── client.ts
│   │   │   ├── sessionTracker.ts
│   │   │   ├── types.ts
│   │   │   ├── env.ts
│   │   │   └── schema.ts
│   │   │
│   │   └── firebase/
│   │       ├── AuthProvider.ts
│   │       ├── useAuth.ts
│   │       ├── GoogleLoginButton.ts
│   │       ├── client.ts
│   │       ├── sessionTracker.ts
│   │       ├── types.ts
│   │       ├── env.ts
│   │       └── firestoreRules.ts
│   │
│   ├── utils/
│   │   └── zipGenerator.ts           # JSZip logic
│   │
│   └── types/
│       └── index.ts                  # App types
│
└── public/
    └── favicon.ico
```

---

## Implementation Phases

### Phase 1: Project Setup
- [x] Initialize Vite + React + TypeScript project
- [x] Install dependencies (Tailwind, JSZip, file-saver)
- [x] Configure Tailwind CSS
- [x] Create basic folder structure
- [x] Set up basic App.tsx layout

### Phase 2: Create Template Files
- [x] Write Supabase AuthProvider.tsx template
- [x] Write Supabase useAuth.ts template
- [x] Write Supabase GoogleLoginButton.tsx template
- [x] Write Supabase client.ts template
- [x] Write Supabase sessionTracker.ts template
- [x] Write Supabase types.ts template
- [x] Write Supabase .env.example template
- [x] Write Supabase schema.sql template
- [x] Write Firebase AuthProvider.tsx template
- [x] Write Firebase useAuth.ts template
- [x] Write Firebase GoogleLoginButton.tsx template
- [x] Write Firebase client.ts template
- [x] Write Firebase sessionTracker.ts template
- [x] Write Firebase types.ts template
- [x] Write Firebase .env.example template
- [x] Write Firebase firestore-rules.txt template

### Phase 3: Build UI Components
- [x] Create Header component
- [x] Create BackendSelector component (Supabase/Firebase cards)
- [x] Create OptionsPanel component (checkboxes)
- [x] Create FilePreview component (shows file tree)
- [x] Create DownloadButton component
- [x] Create Instructions component (usage steps)

### Phase 4: ZIP Generation
- [x] Create zipGenerator utility
- [x] Wire up DownloadButton to generate ZIP
- [x] Test ZIP contents are correct
- [x] Test file names and extensions are correct

### Phase 5: Polish & Testing
- [x] Add responsive design for mobile
- [~] Test with real Supabase project (IN PROGRESS - see notes below)
- [ ] Test with real Firebase project
- [x] Add loading states
- [x] Add success feedback after download

---

## Phase 5 Testing Progress (Supabase)

### What's Been Done:
1. **Supabase Project Created**: `auth-kit-test` at https://udbcgdlgeeuzocclqzpy.supabase.co
2. **Database Schema Applied**: `user_sessions` table with RLS policies created via SQL Editor
3. **Google OAuth Configured**:
   - Google Cloud Console project: `auth-kit-test`
   - OAuth consent screen configured
   - OAuth credentials created (Client ID & Secret)
   - Redirect URI set: `https://udbcgdlgeeuzocclqzpy.supabase.co/auth/v1/callback`
   - Google provider enabled in Supabase Authentication settings

### Test App Created:
A test application was created at `test-app/` folder with:
- `package.json` - Dependencies including @supabase/supabase-js
- `vite.config.ts` - Vite config (runs on port 3000)
- `src/App.tsx` - Test UI showing user info and session data
- `src/main.tsx` - Entry point wrapping app with AuthProvider
- `.env` - Supabase credentials pre-configured

### Test Flow:
1. Download ZIP from Auth Kit Generator (http://localhost:5173)
2. Extract `auth/` folder to `test-app/src/auth/`
3. Run `npm run dev` in test-app folder
4. Test Google Sign-in flow

### Current Status:
- OAuth login redirects successfully (access_token appears in URL)
- Page appears blank after redirect - needs debugging
- Possible issue: session tracking or state update after OAuth callback

### Supabase Credentials (for reference):
- Project URL: https://udbcgdlgeeuzocclqzpy.supabase.co
- Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkYmNnZGxnZWV1em9jY2xxenB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3OTU1NjIsImV4cCI6MjA4MTM3MTU2Mn0.V8eTkOkMbt2zrdO2PGIV0IGB2waGc__m9vT4rAQ6od4

### Next Steps:
1. Debug blank page issue after OAuth redirect
2. Verify session tracking writes to user_sessions table
3. Test sign out functionality
4. Test Firebase integration

---

## Phase 5 Testing Progress (Firebase)

### Status: NOT STARTED

### Steps Required:
1. Create Firebase project
2. Enable Google Sign-in in Firebase Authentication
3. Create Firestore database
4. Apply firestore-rules.txt
5. Get Firebase credentials (API key, auth domain, project ID)
6. Download Firebase ZIP from Auth Kit Generator
7. Extract to test-app and test

---

## How Users Will Use the Generated Code

### Step 1: Download and Extract
```
Download auth-supabase.zip
Extract to your-project/src/auth/
```

### Step 2: Install Dependency
```bash
# For Supabase
npm install @supabase/supabase-js

# For Firebase
npm install firebase
```

### Step 3: Set Up Environment Variables
```bash
# Copy the example and fill in your values
cp src/auth/.env.example .env
```

### Step 4: Run Database Schema (Supabase only)
```
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Paste contents of schema.sql
4. Click Run
```

### Step 5: Wrap App with AuthProvider
```tsx
// src/App.tsx
import { AuthProvider } from './auth/AuthProvider';
import { YourRoutes } from './routes';

function App() {
  return (
    <AuthProvider>
      <YourRoutes />
    </AuthProvider>
  );
}
```

### Step 6: Use Auth in Components
```tsx
// src/pages/Login.tsx
import { useAuth } from '../auth/useAuth';
import { GoogleLoginButton } from '../auth/GoogleLoginButton';

export function LoginPage() {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (user) return <Navigate to="/dashboard" />;

  return (
    <div>
      <h1>Welcome</h1>
      <GoogleLoginButton />
    </div>
  );
}
```

### Step 7: Access Session Data
```tsx
// src/pages/Profile.tsx
import { useAuth } from '../auth/useAuth';

export function ProfilePage() {
  const { user, session, signOut } = useAuth();

  return (
    <div>
      <h1>Welcome, {user.email}</h1>
      <p>Member since: {session.firstLoginAt.toLocaleDateString()}</p>
      <p>Total logins: {session.loginCount}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

---

## Future Enhancements (Not in v1)

These can be added later based on usage:

1. **More OAuth providers**: GitHub, Microsoft, Apple
2. **More backends**: Auth0, Clerk, AWS Cognito
3. **Pre-built pages**: Full login/signup page templates
4. **Protected route component**: HOC for route protection
5. **Role-based access**: Admin vs user roles
6. **Email notifications**: Welcome email on first login

---

## Success Criteria

The project is complete when:

1. User can visit the web app
2. User can select Supabase or Firebase
3. User can toggle options on/off
4. User can download a ZIP file
5. ZIP contains all necessary files with correct code
6. Generated code works when dropped into a React + Vite project
7. Session tracking correctly logs first/last login and count
8. The app is deployed and accessible on Replit

---

## Ready to Build

This plan covers everything needed to build Auth Kit Generator. The implementation will follow the phases outlined above, starting with project setup and ending with a polished, deployed web app.

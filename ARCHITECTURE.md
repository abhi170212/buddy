# System Architecture Document — StudyTracker

## 1. High-Level Architecture

StudyTracker is structured as a decoupled full-stack TypeScript application composed of a **Vite + React Single-Page Application (SPA)** client, a stateless **Node.js + Express REST API** backend, a **MongoDB** document database, and an external integration with the **Google Gemini AI API** strictly mediated by the backend.

```
┌─────────────────────────────────────────────────────────────┐
│                       Browser / Client                      │
│   React 18+ (Vite) + TypeScript + Tailwind CSS              │
│   Role-Based Routing (Student / Mentor / Public)            │
│   Interactive Charts, Heatmap, Markdown Editor              │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / REST (JSON)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Node.js + Express API                     │
│   ├── Security Middleware (Helmet, CORS, Rate Limit)        │
│   ├── Auth & RBAC Middleware (JWT Verification & Roles)      │
│   ├── Request Validation (Zod / Joi Schema Validation)       │
│   ├── Controllers & Business Logic Services                 │
│   │   ├── Analytics & Heatmap Aggregator                    │
│   │   ├── Spaced Repetition (SM-2) Engine                   │
│   │   └── Gemini Evaluation Service (Secure API Client)     │
│   └── Data Access Layer (Mongoose ODM Models)               │
└───────────────┬─────────────────────────────┬───────────────┘
                │                             │
                ▼                             ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│      MongoDB Database        │ │      Google Gemini AI      │
│  - Users, Profiles, Roles    │ │  (Accessed ONLY by backend │
│  - Syllabus (Modules, Topics)│ │   using GEMINI_API_KEY)    │
│  - Daily Logs & Heatmap      │ └────────────────────────────┘
│  - Journals, Exercises       │
│  - Projects & Reviews        │
└──────────────────────────────┘
```

---

## 2. Technology Stack & Version Matrix

| Layer | Technology | Version | Purpose & Rationale |
| :--- | :--- | :--- | :--- |
| **Runtime** | Node.js | `>= 20.0.0` (Target: v24.x) | Modern LTS runtime with native ES modules and high performance. |
| **Language** | TypeScript | `^5.4.0` | End-to-end type safety, shared domain interfaces, fewer runtime bugs. |
| **Backend Framework** | Express.js | `^4.19.2` | Robust, minimalist web framework with mature middleware ecosystem. |
| **Database & ODM** | MongoDB / Mongoose | `^8.4.0` | Flexible document modeling, schema validation, and aggregation pipelines. |
| **Frontend Framework** | React | `^18.3.1` | Declarative UI, hooks-based state management, concurrent rendering. |
| **Bundler / Tooling** | Vite | `^5.3.0` | Lightning-fast HMR and optimized production bundling. |
| **CSS & Styling** | Tailwind CSS | `^3.4.0` | Utility-first styling with custom design tokens for our editorial theme. |
| **Icons** | Lucide React | `^0.395.0` | Crisp, clean, minimalist SVG iconography. |
| **Data Visualization** | Recharts | `^2.12.7` | Composable, responsive SVG charting library tailored for React. |
| **Markdown & Code** | `react-markdown` + `prismjs` | `^9.0.0` | Safe Markdown rendering with syntax highlighting for journal entries. |
| **Date Utilities** | `date-fns` | `^3.6.0` | Lightweight, immutable date manipulation for heatmaps and streaks. |
| **AI Integration** | `@google/genai` / REST | Latest | Direct integration with Gemini API strictly from server services. |
| **Testing** | Vitest / Jest / Supertest | Modern | Fast component, integration, and API testing suites. |

---

## 3. Directory & Monorepo Organization

To maintain strict separation of concerns, the workspace is organized into a clean client-server architecture:

```
study-tracker/
├── package.json               # Root scripts (dev, build, test, seed)
├── tsconfig.json              # Shared base TypeScript configuration
├── PRD.md                     # Product Requirements Document
├── ARCHITECTURE.md            # Architecture Document (this file)
├── DESIGN_SYSTEM.md           # Visual design tokens & components
├── DATABASE_SCHEMA.md         # Database schema specifications
├── API_SPEC.md                # Comprehensive REST API contracts
├── DEVELOPMENT_RULES.md       # Engineering standards & security rules
├── PHASES.md                  # Implementation phases & acceptance criteria
├── PROGRESS.md                # Real-time implementation tracking
├── server/                    # Node.js + Express Backend
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── config/            # DB connection, environment variables, Gemini client
│   │   ├── constants/         # Roles, status enums, mistake categories
│   │   ├── controllers/       # HTTP request handlers
│   │   ├── middleware/        # Auth, role check, error handler, validation
│   │   ├── models/            # Mongoose schemas and interfaces
│   │   ├── routes/            # Express route declarations
│   │   ├── services/          # Business logic: Analytics, SM-2, Gemini AI
│   │   ├── utils/             # Date normalization, response formatters
│   │   └── index.ts           # Server entry point
│   └── tests/                 # Supertest API endpoint tests
└── client/                    # Vite + React Frontend
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── tailwind.config.js     # Custom editorial palette tokens
    ├── index.html
    └── src/
        ├── assets/            # Static media, icons, brand marks
        ├── components/        # Reusable UI primitives (Buttons, Cards, Inputs, Heatmap)
        ├── context/           # AuthContext, NotificationContext
        ├── hooks/             # Custom hooks (useStudyLogs, useMastery, useHeatmap)
        ├── layouts/           # AppLayout, DashboardLayout, AuthLayout
        ├── pages/             # Landing, StudentDashboard, MentorDashboard, etc.
        ├── services/          # Typed API client services
        ├── types/             # Shared frontend TypeScript definitions
        ├── utils/             # Formatting, date helpers, calculations
        └── App.tsx            # Main router and providers
```

---

## 4. Key Architectural Subsystems

### 4.1 Authentication & Authorization Pipeline
1. **Client**: Transmits credentials to `POST /api/auth/login`.
2. **Server**:
   * Validates input payload using validation schemas.
   * Finds user by email; compares password using `bcrypt.compare`.
   * Signs a JWT containing `{ userId, role, email }` with a 24-hour expiration.
   * Returns token and sanitized user profile (excluding password hash).
3. **Protected Requests**:
   * Client transmits `Authorization: Bearer <token>` on all API requests.
   * `requireAuth` middleware verifies token signature and attaches `req.user`.
   * `requireRole(['mentor'])` blocks access with a `403 Forbidden` if role mismatches.

### 4.2 Spaced Repetition (SM-2) Engine
* Runs on topic revision submissions.
* Inputs: `qualityRating` (0–5: blackout to perfect recall), `previousRepetitionCount`, `previousInterval`, `previousEaseFactor`.
* Outputs: `nextReviewDate`, `newInterval`, `newEaseFactor`.
* Persisted in the `TopicProgress` collection to generate the daily "Due for Revision" queue.

### 4.3 Daily Study Log & Heatmap Engine
* Enforces strict uniqueness constraint: `studentId + date (YYYY-MM-DD)`.
* Aggregation pipeline computes:
  * 365-day sparse array mapping to contribution coordinates.
  * Active streak (consecutive days with at least 1 minute of logged study).
  * Longest historical streak.
  * Time distribution across modules.

### 4.4 Gemini Socratic Concept Evaluation
* **Flow**:
  1. Student requests evaluation of a concept explanation.
  2. Server verifies authentication and fetches topic context (title, objectives, keywords).
  3. Server formats a structured prompt enforcing JSON output:
     ```json
     {
       "score": 8,
       "summary": "Clear grasp of closure scope...",
       "keyStrengths": ["Correctly identified lexical scoping"],
       "gaps": ["Did not mention memory implications or garbage collection"],
       "socraticQuestion": "What happens to the outer variable if the inner function is never called?"
     }
     ```
  4. Backend calls Gemini API using server-side key, parses and validates JSON, and stores the evaluation history linked to the topic.

---

## 5. Security & Data Protection Architecture

1. **Secret Isolation**: `GEMINI_API_KEY`, `JWT_SECRET`, and `MONGO_URI` are never bundled into client assets. Vite `.env` exclusively prefixes public variables with `VITE_`.
2. **Input Sanitization**: All incoming request bodies are sanitized against NoSQL injection (e.g., stripping `$` operators) and validated against strict schemas.
3. **CORS Hardening**: Access restricted to authorized client origin.
4. **Audit Logging**: Major mentor reviews, target assignments, and student submissions record timestamps (`createdAt`, `updatedAt`) and reviewer IDs.

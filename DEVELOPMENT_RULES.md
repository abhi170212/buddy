# Development & Engineering Rules — StudyTracker

## 1. Architectural & Code Integrity Rules

### Rule 1.1: Strict Layer Separation
* **Controllers** handle HTTP-specific parsing, parameter extraction, and status codes. They must never contain raw database aggregation pipelines or business calculations.
* **Services** contain core business logic (e.g., SM-2 interval calculations, Gemini prompt engineering, streak mathematics).
* **Models** define Mongoose schemas, indexes, and document methods.
* **UI Components** must be purely presentational or state-driven. Complex data fetching and mutations must live in custom hooks or typed API client services.

### Rule 1.2: Zero Mocked / Hardcoded Analytics
* **Never** hardcode fake streak numbers, static heatmaps, or fabricated mastery percentages in production components.
* All dashboard counters, graphs, charts, and contribution cells must be computed from persisted database records.
* For zero-data states, display clean, encouraging empty states—never placeholder charts with dummy numbers masquerading as real user activity.

### Rule 1.3: Single Daily Summary Enforcement
* The product requires a single daily study summary per student per calendar date (`YYYY-MM-DD`).
* The database layer enforces this via `DailyStudyLogSchema.index({ studentId: 1, date: 1 }, { unique: true })`.
* If a student logs study time multiple times in one day, the API must perform an atomic `upsert` or accumulation update, incrementing duration and appending topics, rather than generating duplicate entries.

---

## 2. Security & Secret Management

### Rule 2.1: Server-Side AI Secret Isolation
* The `GEMINI_API_KEY` must **never** be transmitted to the browser or prefixed with `VITE_`.
* All AI evaluations must be triggered via `POST /api/ai/evaluate-concept` on the Node.js backend.
* Responses from Gemini must be sanitized and parsed as structured JSON before returning to the frontend.

### Rule 2.2: Dual-Layer Authorization (RBAC)
* **Never** rely exclusively on hiding UI buttons (e.g., conditionally rendering the "Add Module" button).
* Every mutating endpoint (`POST`, `PUT`, `DELETE`) on the backend must be guarded with `requireAuth` and explicit `requireRole(['mentor'])` or `requireRole(['student'])` middleware.
* Mentors cannot inspect another student's logs without an explicit pairing or authorized mentor relationship.

### Rule 2.3: Password Hashing & Token Handling
* Passwords must be hashed using `bcrypt` (or `bcryptjs`) with a work factor of at least 12. Plaintext passwords must never be stored, logged, or serialized.
* Authentication tokens (JWT) must have an explicit expiration (maximum 24 hours for access tokens) and be signed with a high-entropy secret stored in `.env`.

---

## 3. Date, Timezone & Data Handling

### Rule 3.1: Consistent Date Normalization
* Dates associated with daily logs and weekly reports must use ISO calendar date strings (`YYYY-MM-DD`) normalized to the student's designated timezone.
* Heatmap calculations must align with UTC start-of-day or student timezone start-of-day to avoid calendar day drift across UTC boundaries.

### Rule 3.2: Pagination & Scalability
* Any collection that can grow over time (study logs, journal notes, exercise attempts, feedback records) must implement cursor-based or limit-offset pagination (`page`, `limit`).
* Unbounded `.find({})` queries are strictly prohibited on non-static collections.

---

## 4. Frontend State & UX Standards

### Rule 4.1: Four States of Every Async Component
Every interactive UI component that fetches or mutates data must explicitly handle all four states:
1. **Loading State**: Subtle skeleton loaders or tasteful spinners (never jarring layout shifts).
2. **Empty State**: Clear editorial illustration or icon, explanatory text, and a prominent call-to-action to create the first record.
3. **Error State**: Informative, non-cryptic error message with a retry trigger.
4. **Success / Populated State**: Crisp, high-contrast display matching the design tokens.

### Rule 4.2: Input Validation & Sanitization
* Validate user input at the form level in React (immediate user feedback) AND on the server via validation schemas before touching the database.
* Markdown editors must sanitize HTML outputs against XSS attacks using `DOMPurify` or safe Markdown AST renderers.

---

## 5. Testing & Verification Standards

### Rule 5.1: Verifiable Test Claims
* **Never** state or claim that a test passed unless it was actually executed via the test runner and returned exit code 0.
* When reporting test results, quote the test suite name, number of passed tests, and execution time.

### Rule 5.2: Seed Data Requirement
* Provide a comprehensive database seed script (`npm run seed`) that populates:
  * 1 Mentor account (`mentor@studytracker.dev` / `Password123!`).
  * 1 Student account (`student@studytracker.dev` / `Password123!`).
  * A full realistic curriculum (Full-Stack Engineering syllabus with modules, chapters, topics, exercises).
  * 90+ days of historical study logs to immediately populate the GitHub heatmap.
  * Journal entries, exercise attempts, mistakes, spaced repetition records, and project submissions.

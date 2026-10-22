# Implementation Phases & Deliverables — StudyTracker

## Workflow Protocol
* Work is executed strictly phase by phase.
* At the conclusion of each phase:
  1. Run automated build and test checks.
  2. Document verified working features.
  3. List known issues or limitations.
  4. Update `PROGRESS.md`.
  5. Await user review before commencing the next phase.

---

## Phase Breakdown

### Phase 1: Workspace Scaffolding & Tooling Foundation
* **Objective**: Establish the monorepo structure, build systems, database connection, and design tokens.
* **Deliverables**:
  * `server/` directory: Node.js, Express, TypeScript, Mongoose configuration, health-check endpoint.
  * `client/` directory: Vite, React 18, TypeScript, Tailwind CSS with custom editorial design tokens (`bg-warm-canvas`, `accent-orange`, `text-primary`).
  * Root orchestration: unified `npm run dev`, `npm run build`, and seed framework.
* **Exit Criteria**:
  * Both frontend and backend start up simultaneously with no TypeScript or build errors.
  * Backend successfully establishes connection to MongoDB.

---

### Phase 2: Authentication & Role-Based Access Control (RBAC)
* **Objective**: Implement secure authentication with strict student/mentor role isolation.
* **Deliverables**:
  * Server: `User` model, bcrypt password hashing, JWT issue/verify, `requireAuth`, `requireRole('student')`, `requireRole('mentor')`.
  * Client: `AuthContext`, token persistence, Sign Up and Sign In pages, role-based route guards (`<ProtectedRoute role="...">`).
  * Seed data: Default mentor and student accounts with verified credentials.
* **Exit Criteria**:
  * Unauthenticated users cannot access dashboard routes.
  * Students cannot call mentor-restricted API endpoints.
  * Passwords securely hashed; tokens expire in 24 hours.

---

### Phase 3: Public Landing Page & Reusable Design System Primitives
* **Objective**: Create the high-impact editorial landing page and reusable UI component primitives.
* **Deliverables**:
  * Public Landing Page: Editorial headline, philosophy section ("Learning, not surveillance"), interactive feature preview (Heatmap, Feynman AI, Mistake Notebook), demo login launcher.
  * Design System Primitives: `Button`, `Card`, `Badge`, `Modal`, `Input`, `StatCard` adhering to warm white and vivid orange guidelines.
* **Exit Criteria**:
  * Landing page achieves award-winning visual quality with zero generic SaaS bloat.
  * 100% responsive across mobile, tablet, and desktop viewports.

---

### Phase 4: Syllabus & Curriculum Architecture
* **Objective**: Build the full hierarchical syllabus engine (Modules → Chapters → Topics → Exercises).
* **Deliverables**:
  * Server: CRUD endpoints for Modules, Chapters, Topics, Exercises with mentor mutation rights.
  * Client: Interactive curriculum roadmap for students; management console for mentors to add/edit topics and exercises.
* **Exit Criteria**:
  * Mentors can build structured curriculums with estimated hours and difficulty tags.
  * Students can browse the syllabus and view exercise prompts.

---

### Phase 5: Daily Study Logs, GitHub-Style Heatmap & Streaks
* **Objective**: Implement study logging with compound date constraints and contribution visualization.
* **Deliverables**:
  * Server: `DailyStudyLog` model with unique `(studentId, date)` index; streak calculation algorithm (current & longest streak); 365-day aggregation pipeline.
  * Client: 365-day Contribution Heatmap component with warm orange intensity levels; daily logging modal; active streak indicator.
* **Exit Criteria**:
  * Duplicate daily entries are strictly prevented (updates existing daily log).
  * Heatmap accurately reflects real database logs with tooltip metadata.

---

### Phase 6: Learning Journal with Markdown & Code Reflection
* **Objective**: Enable students to record deep conceptual notes with syntax highlighting and mentor feedback.
* **Deliverables**:
  * Server: `JournalEntry` model, tag filtering, full-text search, mentor review endpoint.
  * Client: Markdown editor supporting headers, lists, and syntax-highlighted code blocks (`react-markdown` + `prismjs`); mentor feedback display.
* **Exit Criteria**:
  * Markdown rendering is sanitized against XSS attacks.
  * Mentors can review entries and attach qualitative feedback.

---

### Phase 7: Exercise Tracker, Mistake Notebook & Error Analytics
* **Objective**: Track deliberate practice outcomes and classify errors into constructive categories.
* **Deliverables**:
  * Server: `ExerciseAttempt` model; mistake categorizer (`conceptual`, `calculation`, `syntax`, `careless`); mistake analytics pipeline.
  * Client: Exercise attempt submission drawer; filterable "Mistake Notebook" with reflection notes and error breakdown chart.
* **Exit Criteria**:
  * Attempts update student accuracy rates.
  * Students can filter past mistakes to prepare for revisions.

---

### Phase 8: Gemini-Powered Concept Evaluation (Feynman Evaluator)
* **Objective**: Provide AI-driven Socratic evaluation of student concept explanations via secure backend integration.
* **Deliverables**:
  * Server: Gemini AI evaluation service with structured JSON output schema; rate limit handling; concept evaluation storage.
  * Client: "Explain Concept (Feynman Technique)" interface; evaluation card displaying score (1–10), strengths, conceptual gaps, and a Socratic follow-up question.
* **Exit Criteria**:
  * `GEMINI_API_KEY` is completely hidden from browser network calls and bundles.
  * AI evaluations return structured, actionable feedback without hallucinations.

---

### Phase 9: Spaced Repetition (SM-2) & Topic Mastery Engine
* **Objective**: Combat forgetting curves with algorithmic revision scheduling.
* **Deliverables**:
  * Server: `TopicProgress` model; SM-2 calculation service (intervals, ease factors, next review dates); due topics query.
  * Client: "Due for Revision" queue on student dashboard; quality recall rating (0–5); overall topic mastery percentage index.
* **Exit Criteria**:
  * Submitting recall ratings correctly calculates new intervals and schedules future review dates.

---

### Phase 10: Weekly Reports, Goals, Project Submissions, Export & QA
* **Objective**: Implement weekly alignment, capstone portfolio evidence, global search, data export, and complete platform QA.
* **Deliverables**:
  * Weekly report generation with mentor goal setting and sign-off.
  * Practical project submission portal with GitHub/Demo URLs and mentor grading.
  * Global search across notes, syllabus, and mistakes.
  * Complete student JSON and CSV data export.
  * Comprehensive end-to-end integration tests and full database seed.
* **Exit Criteria**:
  * All 14 core features operational and verified.
  * Zero security or type errors.
  * Ready for production deployment.

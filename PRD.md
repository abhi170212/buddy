# Product Requirements Document (PRD) — StudyTracker

## 1. Executive Summary & Vision

**StudyTracker** is a premium, editorial-grade learning and mentorship platform engineered for two core personas: the **Student** and the **Mentor**. 

Unlike conventional learning management systems (LMS) or employee monitoring tools, StudyTracker is built on the philosophy of **deliberate practice and constructive mentorship, not surveillance**. It empowers the student to reflect, document understanding, analyze error patterns, and demonstrate mastery through evidence-based learning (notes, code, exercise logs, and projects). Concurrently, it grants the mentor deep analytical insight into syllabus velocity, topic friction, and student momentum without micromanagement.

---

## 2. Target Personas & Core Journeys

### 2.1 The Student (Learner)
* **Needs**:
  * Track daily focused study hours without tedious overhead.
  * Visualize consistency via a GitHub-style contribution heatmap and streaks.
  * Maintain an active Learning Journal supporting rich Markdown and syntax-highlighted code snippets.
  * Log exercise attempts, distinguish between success and mistake types (conceptual, calculation, syntax, carelessness), and revisit them.
  * Evaluate concept understanding using an integrated Gemini AI "Feynman evaluator".
  * Receive automated spaced repetition reminders for topics before memory decay sets in.
  * Submit practical project repositories/links as verifiable learning artifacts.
* **Success Metric**: High retention rate, reduced recurring mistake rate, consistent weekly study rhythm.

### 2.2 The Mentor (Guide & Curriculum Lead)
* **Needs**:
  * Structure and maintain the dynamic curriculum hierarchy: **Modules → Chapters → Topics → Exercises**.
  * Assign weekly targets and review completed milestones.
  * Inspect genuine progress through meaningful velocity metrics, exercise failure rates, and study distribution.
  * Provide qualitative, contextual feedback and constructive course-correction.
  * Audit evidence (journal entries, project repos, exercise logs) rather than relying on self-reported vanity numbers.
* **Success Metric**: Clear visibility into learner blockers, proactive intervention capability, high syllabus completion quality.

---

## 3. Product Principles
1. **Mentorship over Surveillance**: Focus on outcomes, reflection, and cognitive depth rather than keystroke or screen time tracking.
2. **Editorial Simplicity**: Clean visual hierarchies, warm whites, vivid orange accent, and exceptional typography.
3. **Persisted Truth**: All dashboard analytics, heatmaps, and velocity metrics are strictly derived from immutable or audited database records—never mocked or hardcoded.
4. **Backend-Enforced Security**: Roles and permission boundaries are enforced at the API layer, not merely hidden in the UI.
5. **AI as a Socratic Mirror**: AI (Gemini) evaluates depth of concept comprehension and identifies knowledge gaps rather than solving exercises for the student.

---

## 4. Feature Specifications

### 4.1 Public Landing Page
* **Hero Section**: Editorial headline, value proposition for both student and mentor, visual preview of the platform interface.
* **Interactive Feature Showcase**: Previews of the Contribution Heatmap, Learning Journal, Exercise Mistake Notebook, and Gemini Evaluator.
* **Pedagogical Philosophy**: "Deliberate Practice + Mentorship = True Mastery".
* **Call to Action**: Direct access to sign in or explore demo credentials (Student / Mentor).

### 4.2 Authentication & Role-Based Access Control (RBAC)
* Secure email/password authentication using bcrypt password hashing.
* Server-side JWT issuing with HTTP-only cookies or Bearer authorization headers.
* Strict role assignment: `student` or `mentor`.
* Dual-role support in data models, ensuring mentors cannot access unauthorized student journals without explicit mentorship pairing.

### 4.3 Curriculum & Syllabus Management
* **Hierarchical Structure**:
  * **Module**: High-level domain (e.g., *Full-Stack Development*, *Data Structures & Algorithms*).
  * **Chapter**: Thematic grouping under a module (e.g., *Asynchronous JavaScript & Event Loop*).
  * **Topic**: Core concept units with estimated study duration, learning objectives, and difficulty tags (Beginner, Intermediate, Advanced).
  * **Exercise**: Specific problem sets tied to topics (problem description, reference link, difficulty, expected output).
* **Mentor Permissions**: Full CRUD on Modules, Chapters, Topics, Exercises.
* **Student Permissions**: Read access to published syllabus, progress tracking per topic.

### 4.4 Daily Study Logs & GitHub-Style Heatmap
* **Daily Log Entry**: Single consolidated or appendable record per calendar date (UTC/local date normalization).
  * Focused study duration (minutes).
  * Associated topics studied.
  * Focus score / energy level (1–5).
  * Summary reflection of what was accomplished and blockers encountered.
* **Contribution Heatmap**:
  * 365-day rolling matrix showing study intensity.
  * Intensity thresholds: 0 min (blank), 1–60 min (level 1), 61–120 min (level 2), 121–180 min (level 3), 180+ min (level 4).
  * Hover tooltip detailing exact date, minutes logged, and topics covered.
* **Streaks & Aggregates**: Current active streak, longest streak, total hours, and weekly average.

### 4.5 Learning Journal (Markdown & Code)
* Rich Markdown editor supporting:
  * Headers, lists, blockquotes, tables.
  * Multi-language fenced code blocks with syntax highlighting.
  * LaTeX math equation rendering (via KaTeX if needed).
* Direct linkage between a Journal Entry and a specific Topic or Chapter.
* Mentors can review entries and add inline or overarching feedback notes.

### 4.6 Exercise Tracker & Mistake Notebook
* Exercise submission logs containing:
  * Status: `Solved independently`, `Solved with hints`, `Failed/Stuck`.
  * Mistake classification: `Conceptual Gap`, `Calculation / Logic Error`, `Syntax / API Miss`, `Careless Oversight`.
  * Time spent on attempt.
  * Reflection on why the mistake occurred and how to prevent it.
* Filterable "Mistake Notebook" allowing students to quickly drill into past errors by category before exams or revision sessions.

### 4.7 Gemini-Powered Concept Evaluation (Backend-Only)
* Student submits an explanation of a concept in their own words (Feynman Technique).
* Node.js backend passes the explanation and expected topic criteria to the Gemini API (`gemini-1.5-flash` or `gemini-1.5-pro`).
* **Strict Privacy & Security**: Gemini API key is stored strictly on the server; client never touches the secret.
* **Structured Response Rubric**:
  * Comprehension Score (1–10).
  * Strong Points (What was explained accurately).
  * Misconceptions or Omissions (Where the mental model falters).
  * Socratic Follow-up Question to deepen mastery.

### 4.8 Topic Mastery & Spaced Repetition (Revision Engine)
* **Mastery Score (0–100%)**: Calculated algorithmically combining:
  * Self-reported confidence (1–5).
  * Exercise pass rate on that topic.
  * Gemini evaluation score.
  * Number of successful revisions.
* **Spaced Repetition Scheduler**:
  * Implementation of SM-2 algorithm principles (Intervals: 1 day, 3 days, 7 days, 14 days, 30 days).
  * Daily "Due for Revision" queue for the student dashboard.

### 4.9 Student & Mentor Dashboards
* **Student Dashboard**:
  * Today's revision queue.
  * Active weekly goals assigned by mentor.
  * Quick daily log widget.
  * Recent activity feed and current streak counter.
* **Mentor Dashboard**:
  * Student roster with real-time velocity metrics.
  * Alerts for inactive students (> 3 days without logs) or high mistake frequencies.
  * Goal setting tool (set deadlines and target topics for the week).
  * Pending reviews queue (unreviewed journal entries, project submissions, weekly reports).

### 4.10 Weekly Reports & Qualitative Feedback
* **Weekly Cadence**:
  * Automatic generation of weekly digest (total hours, topics completed, exercise accuracy).
  * Student self-reflection prompt (wins, blockers, next week's focus).
  * Mentor qualitative feedback section with milestone sign-off.

### 4.11 Practical Project Submissions & Evidence
* Students submit milestone deliverables:
  * Title, problem statement, GitHub repository URL, deployed live demo URL.
  * Architecture description or video walkthrough link.
* Mentors evaluate against criteria: Code Quality, Documentation, Completion, Architecture.

### 4.12 Search, Filters & Data Export
* Global search across topics, journal entries, and mistake logs.
* Filter by tag, module, difficulty, date range, or mistake type.
* Comprehensive data export:
  * JSON export (complete student archive).
  * CSV export (study logs, exercise history for external analysis).

---

## 5. Non-Functional & Security Requirements

1. **Authentication & Authorization**:
   * Passwords hashed with bcrypt (minimum cost factor 12).
   * JWT signed with standard HMAC SHA-256 and expiration (access: 15m or 1d with secure refresh strategy).
   * Role validation middleware (`requireAuth`, `requireRole('mentor')`, `requireRole('student')`).
2. **Data Integrity & Consistency**:
   * MongoDB compound unique indexes preventing duplicate daily logs per student per calendar date.
   * Foreign key integrity simulated through Mongoose references with cascade checks on deletions.
3. **Resilience & Error Handling**:
   * Standardized JSON API responses: `{ success: boolean, data?: any, error?: { code: string, message: string } }`.
   * Graceful handling of Gemini API rate limits or failures with fallback messaging.
4. **Performance & Responsiveness**:
   * Server response times under 150ms for indexed read queries.
   * Full responsiveness from 360px mobile viewports up to 4K displays.

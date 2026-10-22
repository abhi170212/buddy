# API Specification Document — StudyTracker

## 1. Global API Conventions

* **Base URL**: `/api`
* **Transport**: HTTPS (HTTP for local development)
* **Data Format**: `application/json`
* **Authentication**: Bearer Token in `Authorization` header (`Authorization: Bearer <jwt>`)

### 1.1 Standard Response Envelope

#### Success Response
```json
{
  "success": true,
  "data": {},
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 45
  }
}
```

#### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Study duration must be at least 1 minute.",
    "details": []
  }
}
```

### 1.2 Error Codes
* `UNAUTHORIZED` (401): Missing or expired JWT.
* `FORBIDDEN` (403): User role lacks permission for the endpoint.
* `NOT_FOUND` (404): Resource does not exist.
* `CONFLICT` (409): Resource already exists (e.g., daily log for this date).
* `VALIDATION_ERROR` (400): Schema or input format invalid.
* `INTERNAL_ERROR` (500): Server error.

---

## 2. Authentication & User Management

### 2.1 `POST /api/auth/register`
Creates a new student or mentor account.
* **Access**: Public
* **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@studytracker.dev",
    "password": "SecurePassword123!",
    "role": "student", // "student" | "mentor"
    "timezone": "America/New_York"
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "token": "eyJhbGciOi...",
      "user": {
        "id": "664fa1...",
        "name": "Jane Doe",
        "email": "jane@studytracker.dev",
        "role": "student",
        "timezone": "America/New_York"
      }
    }
  }
  ```

### 2.2 `POST /api/auth/login`
Authenticates a user and returns a signed JWT.
* **Access**: Public
* **Request Body**:
  ```json
  {
    "email": "jane@studytracker.dev",
    "password": "SecurePassword123!"
  }
  ```
* **Response (200 OK)**: Token and user profile.

### 2.3 `GET /api/auth/me`
Retrieves current authenticated user's profile.
* **Access**: Authenticated (`student`, `mentor`)

### 2.4 `GET /api/users/students`
Lists students associated with the mentor.
* **Access**: Role `mentor` only
* **Response (200 OK)**: Array of student summaries (id, name, email, streak, lastLogDate).

---

## 3. Syllabus & Curriculum Management

### 3.1 `GET /api/syllabus`
Returns full published curriculum hierarchy (Modules → Chapters → Topics → Exercises).
* **Access**: Authenticated (`student`, `mentor`)
* **Response (200 OK)**: Nested hierarchical tree.

### 3.2 `POST /api/syllabus/modules`
Creates a new curriculum module.
* **Access**: Role `mentor` only
* **Request Body**: `{ "title": "Full-Stack React", "description": "...", "order": 1, "estimatedHours": 40 }`

### 3.3 `POST /api/syllabus/chapters`
Creates a chapter inside a module.
* **Access**: Role `mentor` only
* **Request Body**: `{ "moduleId": "664fa...", "title": "Hooks & State", "order": 1 }`

### 3.4 `POST /api/syllabus/topics`
Creates a topic inside a chapter.
* **Access**: Role `mentor` only
* **Request Body**:
  ```json
  {
    "chapterId": "664fa...",
    "title": "useReducer vs useState",
    "description": "State management tradeoffs",
    "learningObjectives": ["Explain action dispatching", "Handle complex state machines"],
    "difficulty": "intermediate",
    "order": 1
  }
  ```

### 3.5 `POST /api/syllabus/exercises`
Adds an exercise to a topic.
* **Access**: Role `mentor` only
* **Request Body**:
  ```json
  {
    "topicId": "664fb...",
    "title": "Refactor Cart State to useReducer",
    "promptMarkdown": "Given the cart component...",
    "expectedOutput": "State transitions correctly",
    "starterCode": "function cartReducer(state, action) {}",
    "difficulty": "medium",
    "order": 1
  }
  ```

---

## 4. Daily Study Logs & Contribution Heatmap

### 4.1 `POST /api/study-logs`
Creates or updates a single consolidated daily study record for a calendar date.
* **Access**: Role `student` only
* **Request Body**:
  ```json
  {
    "date": "2026-10-22",
    "durationMinutes": 120,
    "topicsCovered": ["664fa..."],
    "focusRating": 4,
    "summary": "Deep dive into React 19 server actions and caching mechanics.",
    "blockers": "Initial confusion about form state reset."
  }
  ```
* **Constraint**: If an entry exists for that date, it updates the existing record rather than creating a duplicate.

### 4.2 `GET /api/study-logs`
Retrieves paginated study logs.
* **Access**: Role `student` (own logs) or `mentor` (querying `?studentId=...`)
* **Query Params**: `page=1`, `limit=20`, `startDate=2026-01-01`, `endDate=2026-12-31`.

### 4.3 `GET /api/study-logs/heatmap`
Returns 365-day intensity array for the contribution matrix.
* **Access**: Role `student` or `mentor` (`?studentId=...`)
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "totalDaysActive": 142,
      "totalMinutesLogged": 17040,
      "matrix": [
        { "date": "2026-10-21", "minutes": 90, "level": 2 },
        { "date": "2026-10-22", "minutes": 120, "level": 2 }
      ]
    }
  }
  ```

### 4.4 `GET /api/study-logs/stats`
Calculates active streak, longest streak, and rolling weekly averages.
* **Access**: Role `student` or `mentor` (`?studentId=...`)

---

## 5. Learning Journal (Markdown & Code)

### 5.1 `POST /api/journal`
Creates a Markdown learning note with optional code snippets and topic linkage.
* **Access**: Role `student` only
* **Request Body**:
  ```json
  {
    "title": "Understanding Event Loop and Microtask Queue",
    "topicId": "664fa...",
    "contentMarkdown": "Microtasks always execute before the next render frame...",
    "tags": ["javascript", "concurrency"],
    "codeSnippets": [
      {
        "language": "typescript",
        "code": "queueMicrotask(() => console.log('microtask'));",
        "caption": "Microtask queue demonstration"
      }
    ]
  }
  ```

### 5.2 `GET /api/journal`
Retrieves paginated journal entries with full-text search and tag filters.
* **Access**: Role `student` or `mentor` (`?studentId=...`)
* **Query Params**: `tag=javascript`, `q=event loop`, `page=1`, `limit=10`.

### 5.3 `POST /api/journal/:id/feedback`
Allows a mentor to post qualitative feedback on a student's journal entry.
* **Access**: Role `mentor` only
* **Request Body**: `{ "feedbackMarkdown": "Great explanation! Try considering what happens when a microtask recursively enqueues another." }`

---

## 6. Exercise Attempts & Mistake Notebook

### 6.1 `POST /api/exercises/:id/attempt`
Logs an exercise attempt and categorizes mistakes.
* **Access**: Role `student` only
* **Request Body**:
  ```json
  {
    "status": "failed", // "solved_independently" | "solved_with_hints" | "failed"
    "mistakeCategory": "conceptual", // "none" | "conceptual" | "calculation" | "syntax" | "careless"
    "codeSubmitted": "function solution() { ... }",
    "timeSpentMinutes": 35,
    "studentReflection": "I assumed the array was pre-sorted and didn't handle the edge case of negative numbers."
  }
  ```

### 6.2 `GET /api/exercises/mistakes`
Returns the curated "Mistake Notebook" for targeted revision.
* **Access**: Role `student` or `mentor` (`?studentId=...`)
* **Query Params**: `category=conceptual`, `page=1`, `limit=20`.

---

## 7. Spaced Repetition (SM-2) & Topic Mastery

### 7.1 `GET /api/revision/due`
Fetches topics due for review today based on calculated next review dates.
* **Access**: Role `student` only

### 7.2 `POST /api/revision/:topicId/review`
Submits a recall quality rating (0–5) and calculates the next interval via SM-2.
* **Access**: Role `student` only
* **Request Body**: `{ "quality": 4 }` (0: blackout, 5: perfect recall)
* **Response (200 OK)**: `{ "newInterval": 6, "easeFactor": 2.6, "nextReviewDate": "2026-10-28" }`

### 7.3 `GET /api/mastery`
Aggregates topic confidence, exercise pass rate, and revision history into a 0–100 mastery index.
* **Access**: Role `student` or `mentor` (`?studentId=...`)

---

## 8. Gemini-Powered Concept Evaluation (Feynman Evaluator)

### 8.1 `POST /api/ai/evaluate-concept`
Submits student's verbal/written conceptual explanation for Socratic evaluation.
* **Access**: Role `student` only
* **Request Body**:
  ```json
  {
    "topicId": "664fb...",
    "conceptExplanation": "A closure in JavaScript is when an inner function remembers variables from its outer enclosing scope even after the outer function has returned."
  }
  ```
* **Backend Action**: Sends prompt to Gemini API with strict pedagogical system prompt.
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "score": 9,
      "summary": "Precise and concise definition of lexical scoping and scope preservation.",
      "keyStrengths": [
        "Accurately captures outer function termination lifecycle",
        "Properly references enclosing lexical scope"
      ],
      "gaps": [
        "Does not address heap memory retention and garbage collector implications"
      ],
      "socraticQuestion": "What happens if a closure references a 10MB array, but only uses one integer from it?"
    }
  }
  ```

---

## 9. Practical Project Submissions & Portfolio Evidence

### 9.1 `POST /api/projects`
Submits a practical capstone or milestone project for mentor evaluation.
* **Access**: Role `student` only
* **Request Body**:
  ```json
  {
    "title": "Real-Time Collaborative Code Editor",
    "description": "WebSocket-based operational transform editor with syntax highlighting.",
    "githubRepoUrl": "https://github.com/student/collab-editor",
    "liveDemoUrl": "https://editor.student.dev",
    "architectureNotesMarkdown": "Used CRDTs for decentralized conflict resolution..."
  }
  ```

### 9.2 `POST /api/projects/:id/review`
Mentor posts evaluation, score, and architectural feedback.
* **Access**: Role `mentor` only
* **Request Body**:
  ```json
  {
    "score": 92,
    "status": "approved", // "approved" | "revision_requested"
    "feedbackMarkdown": "Exceptional architecture. Connection reconnection logic handles edge cases gracefully."
  }
  ```

---

## 10. Weekly Reports, Goals & Mentor Review

### 10.1 `POST /api/reports/weekly/goals`
Mentor sets targets for the upcoming week.
* **Access**: Role `mentor` only
* **Request Body**:
  ```json
  {
    "studentId": "664fa...",
    "weekStartDate": "2026-10-26",
    "weekEndDate": "2026-11-01",
    "assignedGoals": [
      { "topicId": "664fa...", "targetDescription": "Complete React Compiler exercises" }
    ]
  }
  ```

### 10.2 `POST /api/reports/weekly/reflection`
Student submits weekly reflection.
* **Access**: Role `student` only
* **Request Body**: `{ "studentReflection": "Struggled on Wednesday with graph algorithms, but solved 4 dynamic programming exercises." }`

### 10.3 `POST /api/reports/weekly/sign-off`
Mentor approves and signs off on the week.
* **Access**: Role `mentor` only
* **Request Body**: `{ "mentorFeedbackMarkdown": "Strong output. Focus on tree traversals next week." }`

---

## 11. Search & Data Export

### 11.1 `GET /api/search`
Unified search across topics, journal entries, and mistake logs.
* **Access**: Authenticated

### 11.2 `GET /api/export/json`
Full student data archive (Study logs, journal notes, exercise attempts, projects).
* **Access**: Role `student` (own data) or `mentor` (`?studentId=...`)

### 11.3 `GET /api/export/csv`
Formatted CSV export of daily study logs.
* **Access**: Role `student` or `mentor`

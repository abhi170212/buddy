# Database Schema Specification — StudyTracker

## 1. Overview & Data Modeling Strategy

StudyTracker uses **MongoDB** via **Mongoose ODM**. The schema design balances relational integrity with document encapsulation:
* Immutable or audit-critical interactions (study logs, exercise attempts, AI evaluations) are recorded as distinct documents with strict timestamps.
* Compound unique indexes prevent business logic corruption (e.g., duplicate daily logs or duplicate topic progress records for the same student).
* Foreign references (`ObjectId`) link entities cleanly across the curriculum hierarchy.

---

## 2. Entity Relationship Diagram (ERD)

```
┌─────────────────┐       1:N       ┌────────────────────────┐
│      User       ├─────────────────►     DailyStudyLog      │
│ (Student/Mentor)│                 │ (compound unique date) │
└───────┬─────────┘                 └────────────────────────┘
        │
        │ 1:N                       ┌────────────────────────┐
        ├───────────────────────────►      JournalEntry      │
        │                           └────────────────────────┘
        │ 1:N                       ┌────────────────────────┐
        ├───────────────────────────►    ExerciseAttempt     │
        │                           └────────────────────────┘
        │ 1:N                       ┌────────────────────────┐
        ├───────────────────────────►     TopicProgress      │
        │                           │  (Spaced Repetition)   │
        │                           └────────────────────────┘
        │ 1:N                       ┌────────────────────────┐
        ├───────────────────────────►   GeminiEvaluation     │
        │                           └────────────────────────┘
        │ 1:N                       ┌────────────────────────┐
        ├───────────────────────────►   ProjectSubmission    │
        │                           └────────────────────────┘
        │ 1:N                       ┌────────────────────────┐
        └───────────────────────────►      WeeklyReport      │
                                    └────────────────────────┘

Syllabus Hierarchy:
┌─────────────────┐
│     Module      │
└───────┬─────────┘
        │ 1:N
        ▼
┌─────────────────┐
│     Chapter     │
└───────┬─────────┘
        │ 1:N
        ▼
┌─────────────────┐       1:N       ┌────────────────────────┐
│      Topic      ├─────────────────►        Exercise        │
└─────────────────┘                 └────────────────────────┘
```

---

## 3. Schema Definitions & Mongoose Models

### 3.1 `User` Schema
Represents both students and mentors with role-based constraints.

```typescript
const UserSchema = new Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['student', 'mentor'], default: 'student', index: true },
  avatarUrl: { type: String, default: '' },
  bio: { type: String, default: '', maxlength: 500 },
  mentorId: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true }, // For students paired with a mentor
  timezone: { type: String, default: 'UTC' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });
```

---

### 3.2 Syllabus Models: `Module`, `Chapter`, `Topic`, `Exercise`

#### `Module`
```typescript
const ModuleSchema = new Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, default: '', trim: true },
  order: { type: Number, required: true, default: 1 },
  estimatedHours: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: true, index: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

ModuleSchema.index({ order: 1 });
```

#### `Chapter`
```typescript
const ChapterSchema = new Schema({
  moduleId: { type: Schema.Types.ObjectId, ref: 'Module', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, default: '', trim: true },
  order: { type: Number, required: true, default: 1 }
}, { timestamps: true });

ChapterSchema.index({ moduleId: 1, order: 1 });
```

#### `Topic`
```typescript
const TopicSchema = new Schema({
  chapterId: { type: Schema.Types.ObjectId, ref: 'Chapter', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 150 },
  description: { type: String, default: '', trim: true },
  learningObjectives: [{ type: String, trim: true }],
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  order: { type: Number, required: true, default: 1 }
}, { timestamps: true });

TopicSchema.index({ chapterId: 1, order: 1 });
```

#### `Exercise`
```typescript
const ExerciseSchema = new Schema({
  topicId: { type: Schema.Types.ObjectId, ref: 'Topic', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 150 },
  promptMarkdown: { type: String, required: true },
  expectedOutput: { type: String, default: '' },
  starterCode: { type: String, default: '' },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  solutionNotes: { type: String, default: '' }, // Mentor reference
  order: { type: Number, required: true, default: 1 }
}, { timestamps: true });

ExerciseSchema.index({ topicId: 1, order: 1 });
```

---

### 3.3 `DailyStudyLog` Schema
Enforces the core rule: **prevent duplicate daily entries where the product requires a single daily summary**.

```typescript
const DailyStudyLogSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: String, required: true }, // Format: "YYYY-MM-DD"
  durationMinutes: { type: Number, required: true, min: [1, 'Study time must be at least 1 minute'] },
  topicsCovered: [{ type: Schema.Types.ObjectId, ref: 'Topic' }],
  focusRating: { type: Number, min: 1, max: 5, default: 3 },
  summary: { type: String, required: true, maxlength: 1000 },
  blockers: { type: String, default: '', maxlength: 500 }
}, { timestamps: true });

// Strict unique constraint: One log per student per calendar date
DailyStudyLogSchema.index({ studentId: 1, date: 1 }, { unique: true });
DailyStudyLogSchema.index({ studentId: 1, createdAt: -1 });
```

---

### 3.4 `JournalEntry` Schema
Rich Markdown reflections with code snippets and mentor qualitative review.

```typescript
const JournalEntrySchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  topicId: { type: Schema.Types.ObjectId, ref: 'Topic', default: null, index: true },
  title: { type: String, required: true, trim: true, maxlength: 200 },
  contentMarkdown: { type: String, required: true },
  tags: [{ type: String, trim: true, lowercase: true }],
  codeSnippets: [{
    language: { type: String, default: 'typescript' },
    code: { type: String, required: true },
    caption: { type: String, default: '' }
  }],
  mentorFeedback: {
    mentorId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    feedbackMarkdown: { type: String, default: '' },
    reviewedAt: { type: Date, default: null }
  }
}, { timestamps: true });

JournalEntrySchema.index({ studentId: 1, createdAt: -1 });
JournalEntrySchema.index({ tags: 1 });
```

---

### 3.5 `ExerciseAttempt` Schema
Captures deliberate practice and classifies errors into constructive learning signals.

```typescript
const ExerciseAttemptSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  exerciseId: { type: Schema.Types.ObjectId, ref: 'Exercise', required: true, index: true },
  status: { 
    type: String, 
    enum: ['solved_independently', 'solved_with_hints', 'failed'], 
    required: true 
  },
  mistakeCategory: { 
    type: String, 
    enum: ['none', 'conceptual', 'calculation', 'syntax', 'careless'], 
    default: 'none' 
  },
  codeSubmitted: { type: String, default: '' },
  timeSpentMinutes: { type: Number, default: 0 },
  studentReflection: { type: String, default: '' }
}, { timestamps: true });

ExerciseAttemptSchema.index({ studentId: 1, exerciseId: 1, createdAt: -1 });
ExerciseAttemptSchema.index({ studentId: 1, mistakeCategory: 1 });
```

---

### 3.6 `TopicProgress` (Mastery & Spaced Repetition)
Stores SM-2 state and calculated mastery scores.

```typescript
const TopicProgressSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  topicId: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
  confidenceRating: { type: Number, min: 1, max: 5, default: 1 },
  masteryScore: { type: Number, min: 0, max: 100, default: 0 },
  repetitionCount: { type: Number, default: 0 },
  intervalDays: { type: Number, default: 1 },
  easeFactor: { type: Number, default: 2.5 },
  lastReviewedAt: { type: Date, default: null },
  nextReviewDate: { type: Date, default: Date.now, index: true }
}, { timestamps: true });

// Compound unique index ensuring 1 record per topic per student
TopicProgressSchema.index({ studentId: 1, topicId: 1 }, { unique: true });
TopicProgressSchema.index({ studentId: 1, nextReviewDate: 1 });
```

---

### 3.7 `GeminiEvaluation` Schema
Historical record of Socratic concept evaluations conducted by the backend.

```typescript
const GeminiEvaluationSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  topicId: { type: Schema.Types.ObjectId, ref: 'Topic', required: true, index: true },
  conceptExplanation: { type: String, required: true },
  score: { type: Number, min: 1, max: 10, required: true },
  summary: { type: String, required: true },
  keyStrengths: [{ type: String }],
  gaps: [{ type: String }],
  socraticQuestion: { type: String, required: true },
  modelName: { type: String, default: 'gemini-1.5-flash' }
}, { timestamps: true });

GeminiEvaluationSchema.index({ studentId: 1, topicId: 1, createdAt: -1 });
```

---

### 3.8 `ProjectSubmission` Schema
Practical portfolio evidence and mentor review.

```typescript
const ProjectSubmissionSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, required: true },
  githubRepoUrl: { type: String, required: true },
  liveDemoUrl: { type: String, default: '' },
  videoDemoUrl: { type: String, default: '' },
  architectureNotesMarkdown: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['submitted', 'under_review', 'approved', 'revision_requested'], 
    default: 'submitted',
    index: true 
  },
  mentorReview: {
    mentorId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    score: { type: Number, min: 0, max: 100, default: null },
    feedbackMarkdown: { type: String, default: '' },
    reviewedAt: { type: Date, default: null }
  }
}, { timestamps: true });

ProjectSubmissionSchema.index({ studentId: 1, createdAt: -1 });
```

---

### 3.9 `WeeklyReport` Schema
Synchronizes weekly goals, self-reflections, and mentor approvals.

```typescript
const WeeklyReportSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  weekStartDate: { type: String, required: true }, // Format "YYYY-MM-DD"
  weekEndDate: { type: String, required: true },   // Format "YYYY-MM-DD"
  assignedGoals: [{
    topicId: { type: Schema.Types.ObjectId, ref: 'Topic' },
    targetDescription: { type: String, required: true },
    isCompleted: { type: Boolean, default: false }
  }],
  totalHoursLogged: { type: Number, default: 0 },
  exercisePassRate: { type: Number, default: 0 },
  studentReflection: { type: String, default: '' },
  mentorFeedbackMarkdown: { type: String, default: '' },
  isSignedOff: { type: Boolean, default: false }
}, { timestamps: true });

WeeklyReportSchema.index({ studentId: 1, weekStartDate: 1 }, { unique: true });
WeeklyReportSchema.index({ studentId: 1, createdAt: -1 });
```

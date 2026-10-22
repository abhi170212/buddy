# Design System Specification — StudyTracker

## 1. Aesthetic Philosophy: Editorial Precision

StudyTracker's visual identity is rooted in **modern editorial print design, technical clarity, and restrained warmth**. It intentionally rejects the tired tropes of generic AI-generated SaaS—meaning:
* **No** oversaturated neon purple gradients.
* **No** bubbly, cartoonish rounded corners (`rounded-3xl` everywhere).
* **No** low-contrast gray text on gray backgrounds.
* **Yes** to warm, organic paper-like whites.
* **Yes** to high-contrast, razor-sharp typography.
* **Yes** to a purposeful, singular **vivid orange** accent that commands focus.
* **Yes** to crisp, muted hairline borders and deliberate whitespace.

The **public landing page** evokes an elite architectural or literary magazine; the **authenticated dashboards** prioritize rapid information scan, density balance, and high-frequency utility.

---

## 2. Color Palette & Semantic Tokens

### 2.1 Core Palette

| Role | Token Name | Hex Code | HSL / Tailwind Equivalent | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Canvas / Background** | `bg-warm-canvas` | `#FBFBF9` | `hsl(50, 20%, 98%)` | Main app background; soft, eye-resting warm ivory. |
| **Surface / Card** | `bg-surface` | `#FFFFFF` | `#ffffff` | Elevated cards, tables, modals, input containers. |
| **Surface Subdued** | `bg-surface-subtle`| `#F5F4F0` | `hsl(45, 15%, 95%)` | Table headers, secondary toolbars, code block chrome. |
| **Primary Text** | `text-primary` | `#141413` | `hsl(60, 2%, 8%)` | Headers, primary titles, metrics, high-contrast text. |
| **Secondary Text** | `text-secondary`| `#666562` | `hsl(45, 2%, 40%)` | Subtitles, labels, timestamps, metadata. |
| **Muted Text** | `text-muted` | `#96948F` | `hsl(45, 3%, 58%)` | Placeholders, inactive hints, disabled state. |
| **Hairline Border** | `border-hairline`| `#E7E5E0` | `hsl(45, 12%, 89%)` | Crisp card dividers, table borders, input outlines. |
| **Accent Orange** | `accent-orange` | `#F25C05` | `hsl(22, 96%, 48%)` | Primary CTAs, active streak badges, focus states. |
| **Accent Orange Hover**| `accent-hover` | `#D94E00` | `hsl(22, 100%, 42%)`| Interactive button hover, active link state. |
| **Accent Light** | `accent-light` | `#FFF3EB` | `hsl(24, 100%, 96%)`| Orange badge backgrounds, highlighted log rows. |

### 2.2 Semantic & Feedback Palette

* **Success**: `#0D7A53` (Text/Icon) / `#ECFDF5` (Background) — Completed topics, passed exercises.
* **Warning**: `#B45309` (Text/Icon) / `#FFFBEB` (Background) — Due for spaced revision, pending review.
* **Danger**: `#C5221F` (Text/Icon) / `#FEF2F2` (Background) — Failed attempts, mistake tags, drop-off alert.
* **Info**: `#1D4ED8` (Text/Icon) / `#EFF6FF` (Background) — Mentor feedback notice, syllabus release.

### 2.3 Contribution Heatmap Palette
Inspired by classic contribution matrixes, but infused with the warm orange brand language:
* **Level 0 (0 minutes)**: `#EFECE6` (Subtle warm stone)
* **Level 1 (1–60 mins)**: `#FCD7C0` (Gentle peach blush)
* **Level 2 (61–120 mins)**: `#FAAB78` (Warm apricot)
* **Level 3 (121–180 mins)**: `#F47632` (Vibrant terracotta)
* **Level 4 (180+ mins)**: `#D94E00` (Deep electric burnt orange)

---

## 3. Typography Scale & Fonts

### 3.1 Font Families
* **Display & Editorial Headers**: `"Plus Jakarta Sans"`, `"Outfit"`, or system sans with geometric clarity and tight letter-spacing.
* **Body & UI**: `"Inter"`, `-apple-system`, `BlinkMacSystemFont`, `sans-serif`.
* **Monospace / Code**: `"JetBrains Mono"`, `"Fira Code"`, `monospace` for exercises, code snippets, and timestamps.

### 3.2 Hierarchy & Typographic Ratios

```css
/* Editorial Display (Hero Headlines) */
.type-display-hero {
  font-family: var(--font-display);
  font-size: 3.5rem; /* 56px */
  line-height: 1.1;
  letter-spacing: -0.035em;
  font-weight: 700;
  color: var(--color-primary);
}

/* Page Title (Dashboard) */
.type-h1 {
  font-size: 2rem; /* 32px */
  line-height: 1.2;
  letter-spacing: -0.025em;
  font-weight: 700;
}

/* Section Header */
.type-h2 {
  font-size: 1.35rem; /* 22px */
  line-height: 1.3;
  letter-spacing: -0.015em;
  font-weight: 600;
}

/* Metric / Counter */
.type-stat-number {
  font-family: var(--font-display);
  font-size: 2.25rem; /* 36px */
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--color-primary);
}

/* Body Normal */
.type-body {
  font-size: 0.9375rem; /* 15px */
  line-height: 1.6;
  color: var(--color-primary);
}

/* Metadata & Captions */
.type-caption {
  font-size: 0.8125rem; /* 13px */
  line-height: 1.4;
  color: var(--color-secondary);
}
```

---

## 4. Component Primitives & Specifications

### 4.1 Buttons
* **Primary Button**:
  * Background: `#F25C05` (`accent-orange`), Text: `#FFFFFF`, Font weight: 600.
  * Border radius: `6px` (`rounded-md`).
  * Padding: `10px 18px` (`px-4 py-2`).
  * Hover: `#D94E00` with subtle `-translate-y-[1px]` micro-elevation.
  * Active: `#B83E00` with `translate-y-0`.
* **Secondary / Outline Button**:
  * Background: `#FFFFFF`, Border: `1px solid #E7E5E0`, Text: `#141413`.
  * Hover: Background `#F5F4F0`, Border `#D5D2CB`.
* **Ghost Button**:
  * Background: Transparent, Text: `#666562`.
  * Hover: Background `#F5F4F0`, Text: `#141413`.

### 4.2 Cards & Containers
* Background: `#FFFFFF`.
* Border: `1px solid #E7E5E0` (hairline border).
* Corner radius: `8px` (`rounded-lg`) — crisp, modern, never blobby.
* Shadow: `0 1px 3px rgba(0, 0, 0, 0.03)` (virtually flat, tactile paper feel).
* Header separator: Subtle `1px solid #F5F4F0`.

### 4.3 Form Inputs & Selects
* Background: `#FFFFFF`, Border: `1px solid #E7E5E0`.
* Focus: Border `#F25C05`, Ring: `3px solid rgba(242, 92, 5, 0.12)`.
* Corner radius: `6px`.
* Font size: `14px` (`text-sm`).
* Error state: Border `#C5221F`, Ring: `3px solid rgba(197, 34, 31, 0.12)`.

### 4.4 Status Badges
* Border radius: `4px` (`rounded`).
* Padding: `3px 8px`.
* Text: `11px`, uppercase, tracking: `0.05em`, font weight: 600.
* Colors:
  * Orange badge: `bg-[#FFF3EB] text-[#F25C05]`
  * Green badge: `bg-[#ECFDF5] text-[#0D7A53]`
  * Red badge: `bg-[#FEF2F2] text-[#C5221F]`
  * Stone badge: `bg-[#F5F4F0] text-[#666562]`

### 4.5 Data Visualization & Charts
* Uses Recharts with custom SVG definitions.
* Area/Line Charts: Stroke `#F25C05` (thickness `2px`), gradient fill transitioning to `rgba(242, 92, 5, 0.03)`.
* Tooltip: Dark graphite background (`#1C1B1A`), crisp white text, hairline amber border.
* Grid lines: Subtle `#F0EDE7` dashed pattern (`strokeDasharray="3 3"`).

---

## 5. Layout Grid & Spacing Standards

* **Base Unit**: `4px` / `8px` system.
* **Page Max Width**:
  * Public Landing: `1200px` (`max-w-6xl`).
  * Dashboard Layout: Fluid with `max-w-7xl` ceiling.
* **Side Navigation**: Fixed `240px` on desktop, collapsible slide-over sheet on mobile.
* **Content Padding**: `px-4 sm:px-6 lg:px-8` and `py-6 sm:py-8`.
* **Spacing Between Cards / Grid**: `gap-6` (24px).

---

## 6. Micro-Interactions & Animation Guidelines

1. **Duration**: Fast transitions: `150ms–200ms` for toggles, hovers, and button presses; `300ms` for modal entry and sidebar expansion.
2. **Easing**: `cubic-bezier(0.16, 1, 0.3, 1)` (out-expo) for natural snap.
3. **No Decorative Jitter**: Avoid bouncing cards, infinite pulsating glows, or floating decorative geometric shapes.
4. **Accessible Motion**: Strictly respects `@media (prefers-reduced-motion: reduce)`.

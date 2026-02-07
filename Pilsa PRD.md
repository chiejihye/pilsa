## 📱 [PRD] pilsa - mindful Korean learning through writing

### 1. Project Overview

**Service Name:** pilsa (필사)

**Tagline:** mindful Korean learning through writing

**Goal:** A minimal web app for learning Korean by typing iconic K-Drama quotes and archiving your completed writings

**Core Values:**

- Mindfulness: Writing slowly, one sentence at a time with full focus
- Learning: Natural Korean language acquisition through drama dialogue
- Archiving: The satisfaction of collecting your written sentences

---

### 2. MVP Scope (Web App - Phase 1)

**Included Features:**

- ✅ Typing-based transcription (Typing Mode Only)
- ✅ K-Drama sentence database integration
- ✅ Vocabulary system
- ✅ Responsive grid archive view

**Excluded Features (Future Development):**

- ❌ Handwriting/Pencil mode
- ❌ Speech-to-Text
- ❌ Social sharing features

---

### 3. User Flow

**Step 1: Sentence Selection**

- Fetch today's sentence from the pre-built K-Drama sentence database
- Display original text (Korean), translation (English) at the top of screen

**Step 2: Typing Practice**

- Type the sentence in a minimal input area
- Typewriter sound effect on typing (optional toggle)
- Blinking cursor provides focused writing experience

**Step 3: Vocabulary Learning**

- Key vocabulary cards displayed below the sentence
- Users can manually add words to their vocabulary list
- Vocabulary list accessible on separate page for review

**Step 4: Complete & Archive**

- Completed writings automatically saved to archive
- Archive page displays all completed sentences in responsive grid format
- Each card shows date, drama source, and sentence preview

---

### 4. Screen Layout

#### A. Main Writing View

**Layout:**

```
┌─────────────────────────────┐
│   [Drama Title]             │
│                             │
│   "Original Korean sentence"│
│   English translation       │
│   (Romanization)            │
│                             │
│   ┌─────────────────────┐  │
│   │ [Typing Area]       │  │
│   │ Blinking cursor     │  │
│   └─────────────────────┘  │
│                             │
│   [Key Vocabulary]          │
│   • Word 1 - meaning        │
│   • Word 2 - meaning        │
│   [+ Add to Vocabulary]     │
│                             │
│   [Complete]                │
└─────────────────────────────┘
```

**Design Principles:**

- Background: `#FAF9F6` (Bone White) + subtle paper texture
- Fonts: Nanum Myeongjo (Korean), Crimson Text (English)
- Generous whitespace for maximum focus
- Minimize unnecessary UI elements

#### B. Archive Grid View

**Layout:**

- Responsive Grid (CSS Grid or Masonry)
- Desktop: 3-4 columns
- Tablet: 2 columns
- Mobile: 1 column

**Card Design:**

```
┌──────────────┐
│ "Sentence    │
│  preview"    │
│              │
│ [Drama Title]│
│ 2026.02.07   │
└──────────────┘
```

- Zoom effect on hover
- Click to open full sentence detail modal

---

### 5. Tech Stack (Recommended)

**Frontend:**

- React.js (or Next.js)
- CSS: Tailwind CSS (optimal for minimal design)
- Typography: Google Fonts (Nanum Myeongjo, Crimson Text)

**Backend/Database:**

- Firebase (easy DB + Auth)
- Or Supabase (open-source alternative)

**K-Drama Sentence DB:**

- Connect existing Notion DB via API
- Or export as JSON file and include in project

**Vocabulary List:**

- LocalStorage (MVP)
- Upgrade to DB integration later

---

### 6. Data Structure

**Sentence Object (K-Drama DB):**

```json
{
  "id": "001",
  "drama": "My Mister",
  "korean": "아무것도 아니다. 내 이름을 부르면 내가 간다.",
  "english": "It is nothing. When my name is called, I will be there.",
  "romanization": "A-mu-geot-do a-ni-da. Nae i-reum-eul bu-reu-myeon nae-ga gan-da.",
  "vocabulary": [
    {"word": "아무것도", "meaning": "nothing"},
    {"word": "부르다", "meaning": "to call"}
  ]
}
```

**Completed Writing Object:**

```json
{
  "id": "user_001",
  "sentenceId": "001",
  "completedAt": "2026-02-07T16:48:00Z",
  "userTyped": "아무것도 아니다. 내 이름을 부르면 내가 간다."
}
```

---

### 7. Development Roadmap

**Week 1-2: Core Writing Feature**

- [ ]  Sentence display UI
- [ ]  Typing input area
- [ ]  Typewriter sound effect
- [ ]  Complete button and save function

**Week 3: Vocabulary System**

- [ ]  Vocabulary card UI
- [ ]  Add to vocabulary feature
- [ ]  Vocabulary page (list view)

**Week 4: Archive View**

- [ ]  Responsive grid layout
- [ ]  Card design and hover effects
- [ ]  Detail view modal

**Week 5: Final Polish**

- [ ]  Complete K-Drama DB integration
- [ ]  Optimize responsive design
- [ ]  Deploy (Vercel or Netlify)

---

### 8. Future Roadmap

**Phase 2:**

- Handwriting mode (iPad + Apple Pencil)
- Social sharing features
- Writing streak system

**Phase 3:**

- Community features (view others' writings)
- Level/badge system
- Premium sentence packs
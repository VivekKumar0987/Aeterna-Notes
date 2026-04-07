# Aeterna — Offline-First AI Notes PWA

> A premium, 100% offline-first Progressive Web App for note-taking with local AI, real-time sentiment-driven UI, Google Drive backup, and a glassmorphic dark interface.

**Live App**: [aeternanotes.lovable.app](https://aeternanotes.lovable.app)

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────┐
│                    Aeterna PWA                       │
│         React 18 + Vite 5 + Tailwind CSS 3           │
├────────────┬─────────────┬───────────────────────────┤
│  IndexedDB │  WebLLM     │  Service Worker (PWA)     │
│  (idb v8)  │  Local AI   │  vite-plugin-pwa          │
├────────────┴─────────────┴───────────────────────────┤
│           Sentiment Engine (keyword-based)            │
│     Real-time background gradient from content mood   │
├──────────────────────────────────────────────────────┤
│       Google Drive Sync (OAuth 2.0 + REST API)       │
│  drive.file scope · Aeterna App Backups folder        │
├──────────────────────────────────────────────────────┤
│         Lovable Cloud — Edge Functions                │
│  Personality Echo powered by Gemini 2.5 Flash Lite    │
└──────────────────────────────────────────────────────┘
```

All core features work **100% offline**. No server, no account, no API keys required for the main experience.

---

## ✨ Complete Feature List

### 1. Note Editor (`NoteEditor.tsx`)
| Feature | How It Works |
|---------|-------------|
| **Rich Text Editor** | Auto-saving textarea with real-time word count |
| **Note Title Editing** | Inline editable title in the top bar |
| **Note Types** | Standard, Future Letter (time-locked), Journal |
| **Folder Organization** | Work, Personal, Ideas, Journal, Legacy, Uncategorized |
| **Tags** | Array-based tagging system stored per note |
| **Auto-Classify** | On first edit, notes in "Uncategorized" are automatically sorted into Work/Personal/Ideas using keyword matching |
| **Predictive Text** | Frequency-based next-word prediction from your note corpus — press `Tab` to accept |
| **[[Wiki Links]]** | `[[note title]]` syntax for cross-referencing notes |

### 2. Dynamic Sentiment Background (`sentiment.ts`)
The entire app background **shifts in real-time** as you type, based on content mood:

| Sentiment | Trigger Keywords (examples) | Gradient |
|-----------|---------------------------|----------|
| ✨ **Positive** | happy, joy, love, amazing, grateful | Green → Teal → Gold |
| 🌊 **Calm** | work, focus, think, meditate, plan | Deep Blue → Indigo → Violet |
| 🎨 **Creative** | create, imagine, design, art, invent | Orange → Rose → Purple |
| 🌧 **Melancholy** | sad, anxious, struggle, tired, lost | Steel Blue → Slate → Navy |
| ⚡ **Neutral** | (default, fewer than 10 chars) | Dark Navy → Charcoal |

The sentiment label (e.g., "🎨 Creative") is displayed in the editor top bar as a live pill badge.

### 3. Local AI Tools (`ai-local.ts`)
All AI runs **in-browser** with zero API calls — keyword and rule-based engines:

| Tool | What It Does |
|------|-------------|
| **AI Summarize** | Extractive summarization — scores sentences by position & length, returns top 3 |
| **Smart Expand** | Converts bullet points and short lines into full paragraphs |
| **AI Cleanup** | Fixes spacing, collapses extra newlines, capitalizes sentences, corrects punctuation |
| **Philosopher Lens** | Appends a philosophical reflection through 3 lenses: Stoicism, Existentialism, Buddhism |
| **Undo AI** | One-click revert after any AI action — stores pre-action content in state |
| **Auto-Classify** | Keyword scoring across Work/Personal/Ideas categories |
| **Predictive Text** | Scans all notes for bigram matches, suggests next 3 words |
| **Daily Prompt** | Rotates through 10 journaling prompts based on day of year |

### 4. Speech-to-Text (`NoteEditor.tsx`)
- Uses browser-native `SpeechRecognition` / `webkitSpeechRecognition` API
- Continuous mode with `interimResults: false` to prevent duplication
- Captures `baseContentRef` when recording starts, appends only final transcripts
- Toggle button with visual pulse animation during recording

### 5. Personality Echo (`PersonalityEcho.tsx` + Edge Function)
An AI chatbot that reflects your writing personality back to you:

| Component | Technology |
|-----------|-----------|
| **Profile Builder** | Client-side analysis of all notes — word frequency, folder distribution, sentiment breakdown, average note length |
| **AI Engine** | Lovable Cloud Edge Function → Gemini 2.5 Flash Lite |
| **Chat Interface** | Real-time message thread with user/echo bubbles |
| **Questions** | "Who am I as a writer?", "What themes dominate my notes?", etc. |

### 6. Time Capsule / Future Letters (`TimeCapsule.tsx`)
- Create a **Future Letter** note type from the sidebar (scroll icon)
- Set a custom **unlock date** via date picker
- Click **🔒 Seal Letter** to lock the note
- Sealed notes show a countdown (days + hours remaining)
- Once the date arrives, an "Open Time Capsule" button appears
- Parchment-themed styling with serif font for letters

### 7. Pomodoro Timer (`PomodoroTimer.tsx`)
- Floating button (bottom-right) expands into a timer widget
- Configurable session length (stored in IndexedDB settings)
- Play / Pause / Reset controls
- **Writing Streak** counter — increments daily, resets if a day is missed
- Streak is persisted across sessions via `AppSettings` in IndexedDB

### 8. Analytics Dashboard (`AnalyticsDashboard.tsx`)
- **Emotion Stats** view with Chart.js bar charts
- Three time windows: Last 7 Days, Last 30 Days, Last 60 Days
- Sentiment distribution visualization (Positive / Calm / Creative / Melancholy / Neutral)
- Summary cards: Total Notes, Total Words, Time Capsules count
- Color-coded bars matching sentiment theme colors

### 9. Weekly Digest (`WeeklyDigest.tsx`)
- Automatically summarizes the past 7 days of writing
- Shows: notes written, words written, dominant mood
- **AI Summary** — extractive summarization of all weekly content
- **Action Items** — extracts lines starting with `- [ ]`, `TODO`, or containing `action:`

### 10. Life Chronicle (Timeline View)
- Vertical timeline of all notes sorted chronologically
- Each entry shows date, title, and content preview
- Click to navigate directly to the note in the editor
- Visual timeline indicator dots connected by a vertical line

### 11. Sidebar (`Sidebar.tsx`)
| Section | Contents |
|---------|----------|
| **Header** | "Aeterna — Your Legacy Vault" branding |
| **New Note** | Standard note + Future Letter creation buttons |
| **Folder Filters** | All / Work / Personal / Ideas / Journal / Legacy / Uncategorized — color-coded pills |
| **Notes List** | Scrollable list with title, preview, folder badge, word count, type icon |
| **Delete** | Hover-reveal trash button per note |
| **Navigation** | Editor, Life Chronicle, Emotion Stats, Weekly Digest, Personality Echo |
| **Backup** | Download Vault (JSON export) + Import Vault (JSON restore) |
| **Google Drive** | Sign in / Sync / Restore controls |
| **Collapse** | Toggle sidebar open/closed with chevron button |

### 12. Google Drive Sync (`google-drive.ts` + `GoogleDriveSync.tsx`)
| Step | Implementation |
|------|---------------|
| **Authentication** | Google Identity Services (GIS) OAuth 2.0 popup |
| **Scope** | `drive.file` — app can only see files it created |
| **Folder** | Creates/finds `Aeterna App Backups` in user's Drive |
| **Upload** | Converts IndexedDB → JSON via `exportAll()`, uploads as `Aeterna_Backup.json` |
| **Download** | Fetches `Aeterna_Backup.json`, runs `importAll()` to restore all notes |
| **Recovery Mode** | On startup, if IndexedDB is empty → auto-checks Drive for backup → shows restore modal |

### 13. Manual Backup (`backup.ts`)
- **Download Legacy Vault**: Exports all notes + settings as a timestamped JSON file (`aeterna-vault-YYYY-MM-DD.json`)
- **Import Vault**: File picker for `.json` files → runs `importAll()` → restores all notes + settings

### 14. Daily Journal System
- On app startup, checks if a journal entry exists for today
- If not, auto-creates one with a rotating AI-generated reflection prompt
- Journal entries are auto-filed to the "Journal" folder
- 10 rotating prompts covering gratitude, challenges, goals, memories

### 15. PWA (Progressive Web App)
- `vite-plugin-pwa` generates service worker for full offline support
- Installable on desktop (Chrome/Edge) and mobile (iOS/Android)
- All assets cached for offline use
- Works without any internet connection after first load

---

## 🗄️ Data Model

### `Note` (IndexedDB)
```typescript
{
  id: string;           // UUID
  title: string;
  content: string;
  type: "standard" | "future-letter" | "journal";
  folder: "Work" | "Personal" | "Ideas" | "Journal" | "Legacy" | "Uncategorized";
  sentiment: string;    // Auto-computed on every edit
  createdAt: number;    // Unix timestamp
  updatedAt: number;
  unlockDate?: number;  // Future letters only
  sealed?: boolean;     // Future letters only
  wordCount: number;    // Auto-computed
  tags: string[];
}
```

### `AppSettings` (IndexedDB)
```typescript
{
  id: "main";
  writingStreak: number;
  lastWriteDate: string;   // "YYYY-MM-DD"
  pomodoroMinutes: number; // Default: 25
}
```

### IndexedDB Indexes
- `by-folder` — filter notes by folder
- `by-type` — filter by note type
- `by-updated` — sort by last modified
- `by-created` — sort by creation date

---

## 🛠️ Technology Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.3 | UI framework (SPA) |
| TypeScript | 5.8 | Type safety |
| Vite | 5.4 | Build tool, dev server, HMR |
| Tailwind CSS | 3.4 | Utility-first styling with glassmorphic design |
| Framer Motion | 12.x | Animations and transitions |
| React Router | 6.30 | Client-side routing |
| TanStack React Query | 5.x | Async state management |

### UI Components
| Library | Purpose |
|---------|---------|
| shadcn/ui | Accessible component library (dialog, tabs, scroll-area, etc.) |
| Radix UI | Headless primitives (15+ packages for menus, dialogs, tooltips, etc.) |
| Lucide React | Icon library (PenLine, Bot, Timer, Download, Upload, etc.) |
| Sonner | Toast notifications |
| cmdk | Command palette |
| Recharts | Charts in Analytics Dashboard |
| Chart.js + react-chartjs-2 | Bar charts in Emotion Stats |

### AI & Intelligence
| Technology | Purpose |
|-----------|---------|
| @mlc-ai/web-llm | Local LLM inference in-browser (WebGPU) |
| Custom Sentiment Engine | Keyword-based mood analysis (4 categories + neutral) |
| Custom Classifier | Keyword scoring for auto-folder assignment |
| Predictive Text Engine | Bigram frequency matching across note corpus |
| Gemini 2.5 Flash Lite | Personality Echo AI (via Lovable Cloud Edge Function) |

### Storage & Persistence
| Technology | Purpose |
|-----------|---------|
| IndexedDB (`idb` v8) | Primary local database for all notes and settings |
| Google Identity Services | OAuth 2.0 authentication for Drive sync |
| Google Drive API v3 | Cloud backup/restore (`drive.file` scope) |
| vite-plugin-pwa | Service worker generation for offline support |
| JSON Export/Import | Manual backup/restore |

### Backend (Lovable Cloud)
| Technology | Purpose |
|-----------|---------|
| Edge Functions (Deno) | Serverless endpoints |
| AI Gateway | Proxied access to Gemini models (no API key needed) |
| `personality-echo` function | Analyzes writing profile + generates reflections |

### Development & Testing
| Tool | Purpose |
|------|---------|
| Vitest | Unit testing framework |
| Playwright | End-to-end browser testing |
| ESLint | Code quality linting |
| PostCSS + Autoprefixer | CSS processing |
| @tailwindcss/typography | Prose styling plugin |

---

## 📁 Project Structure

```
src/
├── components/
│   ├── NoteEditor.tsx          # Main writing editor + AI toolbar + speech-to-text
│   ├── Sidebar.tsx             # Navigation, folder filters, note list, backup controls
│   ├── PomodoroTimer.tsx       # Floating focus timer + writing streak
│   ├── AnalyticsDashboard.tsx  # Emotion stats with Chart.js bar charts
│   ├── PersonalityEcho.tsx     # AI chat interface for writing personality analysis
│   ├── TimeCapsule.tsx         # Sealed future letter view with countdown
│   ├── WeeklyDigest.tsx        # 7-day activity summary + action items
│   ├── GoogleDriveSync.tsx     # Drive sign-in, sync, restore buttons
│   ├── DriveRecoveryModal.tsx  # Startup modal for restoring from Drive
│   ├── NavLink.tsx             # Navigation link component
│   └── ui/                    # 40+ shadcn/ui components (button, dialog, tabs, etc.)
├── lib/
│   ├── db.ts                  # IndexedDB schema, CRUD, export/import
│   ├── ai-local.ts            # All local AI: summarize, expand, cleanup, classify, predict, lens, prompts
│   ├── sentiment.ts           # Keyword-based sentiment analysis + gradient mapping
│   ├── google-drive.ts        # Google OAuth + Drive API (sign in, upload, download, recovery)
│   ├── backup.ts              # JSON file download/restore
│   └── utils.ts               # Tailwind merge utility
├── pages/
│   ├── Index.tsx              # Main app: state management, routing between views, auto-journal
│   └── NotFound.tsx           # 404 page
├── hooks/
│   ├── use-mobile.tsx         # Responsive breakpoint hook
│   └── use-toast.ts           # Toast notification hook
├── integrations/
│   └── supabase/
│       ├── client.ts          # Auto-generated Supabase client (DO NOT EDIT)
│       └── types.ts           # Auto-generated database types (DO NOT EDIT)
├── App.tsx                    # Router setup
├── App.css                    # Global animations (ai-pulse, glass effects)
├── index.css                  # Tailwind + CSS custom properties + glassmorphic theme
└── main.tsx                   # App entry point

supabase/
├── config.toml                # Project configuration
└── functions/
    └── personality-echo/
        └── index.ts           # Edge function: Gemini-powered personality analysis

public/
├── placeholder.svg
└── robots.txt
```

---

## 🎨 Design System

### Theme
- **Glassmorphic Dark UI** — frosted glass panels with `backdrop-blur`
- **Dynamic backgrounds** — CSS gradients that shift based on content sentiment
- **Serif headings** — editorial/literary aesthetic
- **Parchment mode** — warm amber styling for Future Letters

### CSS Classes (index.css)
| Class | Effect |
|-------|--------|
| `.glass` | Frosted glass panel with blur + border + shadow |
| `.glass-subtle` | Lighter glass effect for toolbars |
| `.parchment` | Warm amber-tinted background for Future Letters |
| `.dynamic-bg` | Smooth gradient transitions (0.8s ease) |
| `.ai-pulse` | Pulsing animation for active recording/AI states |

### Color Tokens (HSL-based)
All colors use CSS custom properties via `--background`, `--foreground`, `--primary`, `--secondary`, `--muted`, `--accent`, `--destructive` with proper light/dark mode support.

---

## 🔒 Privacy & Security

| Principle | Implementation |
|-----------|---------------|
| **Offline-first** | All core features work without internet |
| **Local storage** | Notes stored in IndexedDB on user's device |
| **No telemetry** | Zero tracking, analytics, or data collection |
| **Minimal permissions** | Google Drive uses `drive.file` scope (only app-created files visible) |
| **No account required** | Full functionality without sign-up |
| **User owns data** | Export everything as JSON at any time |

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

### Environment Variables
| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_GOOGLE_CLIENT_ID` | Optional | Google OAuth Client ID for Drive sync |
| `VITE_SUPABASE_URL` | Auto-set | Lovable Cloud backend URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Auto-set | Lovable Cloud public key |

### PWA Installation
1. Open the app in Chrome / Edge / Safari
2. Click "Install" in the browser address bar (or "Add to Home Screen" on mobile)
3. The app works 100% offline after installation

---

## 📄 License

Built with [Lovable](https://lovable.dev)

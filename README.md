# Aeterna — Offline-First AI Notes PWA

> A premium, 100% offline-first Progressive Web App for note-taking with local AI, real-time sentiment UI, and Google Drive backup.

---

## 🏗️ Architecture Overview

Aeterna is designed with a **privacy-first, offline-first** philosophy. All data lives on your device via IndexedDB. AI features run locally in your browser using WebLLM — no API keys, no limits, no cloud dependency.

```
┌─────────────────────────────────────────────────┐
│                   Aeterna PWA                   │
├──────────┬──────────┬──────────┬────────────────┤
│  React   │ Tailwind │  Vite    │ Service Worker │
│  18 SPA  │ CSS v3   │  5 PWA   │ (Offline)      │
├──────────┴──────────┴──────────┴────────────────┤
│              IndexedDB (idb)                    │
│         Local persistence for all data          │
├─────────────────────────────────────────────────┤
│            WebLLM (Local AI Engine)             │
│   Summarize · Classify · Expand · Cleanup       │
├─────────────────────────────────────────────────┤
│          Google Drive Sync (Optional)           │
│   OAuth 2.0 · drive.file scope · Auto-backup    │
├─────────────────────────────────────────────────┤
│        Lovable Cloud (Personality Echo)         │
│   Edge Functions · Gemini AI · Writing Profile   │
└─────────────────────────────────────────────────┘
```

---

## ✨ Features

### 📝 Core Writing
- **Rich Note Editor** with real-time word count and auto-save
- **Folder Organization**: Work, Personal, Ideas, Journal, Legacy, Uncategorized
- **Note Types**: Standard notes, Future Letters (time-locked), Journal entries
- **Tags & Search**: Tag notes and search across your entire vault
- **Auto-Linking**: Use `[[note title]]` syntax to link related notes

### 🎨 Dynamic Sentiment UI
- **Real-time background gradient** shifts as you type based on content mood
- Calm Blue → deep thoughts | Sunset Orange → creativity | Green → positivity
- Powered by a local keyword-based sentiment engine (`src/lib/sentiment.ts`)

### 🤖 Local AI (WebLLM — No API Keys)
- **AI Summarize**: Compress notes into key points
- **Auto-Classify**: Sort notes into folders automatically
- **Smart Expand**: Elaborate on short notes with AI
- **AI Cleanup**: Fix grammar, punctuation, and formatting
- **Undo**: Revert any AI action instantly
- All AI runs **in-browser** on your hardware via `@mlc-ai/web-llm`

### 🔮 Philosopher Lens
- Reframe your notes through **Stoicism**, **Existentialism**, or **Buddhism**
- Local AI generates philosophical reflections on your writing

### 🧠 Personality Echo
- AI-powered writing profile that reflects your style back to you
- Analyzes word frequency, sentiment patterns, and folder distribution
- Powered by Lovable Cloud Edge Functions + Gemini AI

### ⏱️ Focus & Productivity
- **Pomodoro Timer**: Configurable focus sessions with break reminders
- **Writing Streak Tracker**: Daily streak counter to build habits
- **Analytics Dashboard**: Word count trends, sentiment charts, folder distribution

### 🗣️ Speech-to-Text
- Browser-native speech recognition for hands-free note-taking
- Real-time transcription appended to your current note

### ⏳ Time Capsule (Future Letters)
- Write letters to your future self with a custom unlock date
- Notes remain **sealed** until the date arrives
- Visual countdown timer on locked notes

### 📊 Weekly Digest
- Automated summary of your writing activity
- Sentiment trends, top folders, and productivity insights

---

## 💾 Data & Persistence

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Local DB** | IndexedDB via `idb` | All notes, settings, streaks |
| **Manual Backup** | JSON export/import | Download/restore your vault |
| **Google Drive Sync** | OAuth 2.0 + Drive API v3 | Cloud backup to your account |
| **Recovery Mode** | Auto-detect on startup | Restore from Drive if local DB is empty |

### Backup Strategy
- **Manual**: Click "Download Legacy Vault" → encrypted JSON file
- **Google Drive**: Sign in → auto-sync to `Aeterna App Backups` folder
- **Recovery**: Fresh install detects empty DB → offers Drive restore

---

## 🛠️ Technology Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 18.3 | UI framework |
| **TypeScript** | 5.8 | Type safety |
| **Vite** | 5.4 | Build tool & dev server |
| **Tailwind CSS** | 3.4 | Utility-first styling |
| **Framer Motion** | 12.x | Animations & transitions |
| **React Router** | 6.30 | Client-side routing |
| **TanStack Query** | 5.x | Async state management |
| **Recharts** | 2.15 | Charts & data visualization |

### UI Components
| Library | Purpose |
|---------|---------|
| **shadcn/ui** | Pre-built accessible components |
| **Radix UI** | Headless primitives (dialogs, menus, tabs, etc.) |
| **Lucide React** | Icon library |
| **Sonner** | Toast notifications |
| **cmdk** | Command palette |

### AI & Intelligence
| Technology | Purpose |
|-----------|---------|
| **@mlc-ai/web-llm** | Local LLM inference in-browser |
| **Sentiment Engine** | Custom keyword-based mood analysis |
| **Gemini 2.5 Flash Lite** | Personality Echo (via Edge Function) |

### Storage & Sync
| Technology | Purpose |
|-----------|---------|
| **IndexedDB** (`idb` v8) | Primary local database |
| **Google Identity Services** | OAuth 2.0 authentication |
| **Google Drive API v3** | Cloud backup sync |
| **vite-plugin-pwa** | Service worker & installability |

### Backend (Lovable Cloud)
| Technology | Purpose |
|-----------|---------|
| **Edge Functions** | Serverless AI endpoints |
| **AI Gateway** | Proxied access to Gemini models |

### Dev & Testing
| Tool | Purpose |
|------|---------|
| **Vitest** | Unit testing |
| **Playwright** | E2E testing |
| **ESLint** | Code linting |
| **PostCSS + Autoprefixer** | CSS processing |

---

## 📁 Project Structure

```
src/
├── components/
│   ├── NoteEditor.tsx          # Main editor with AI actions
│   ├── Sidebar.tsx             # Navigation & folder list
│   ├── PomodoroTimer.tsx       # Focus timer
│   ├── AnalyticsDashboard.tsx  # Stats & charts
│   ├── PersonalityEcho.tsx     # AI writing profile
│   ├── TimeCapsule.tsx         # Future letters
│   ├── WeeklyDigest.tsx        # Activity summary
│   ├── GoogleDriveSync.tsx     # Drive sync UI
│   ├── DriveRecoveryModal.tsx  # Startup recovery
│   └── ui/                    # shadcn/ui components
├── lib/
│   ├── db.ts                  # IndexedDB CRUD operations
│   ├── ai-local.ts            # WebLLM + text processing
│   ├── sentiment.ts           # Mood analysis engine
│   ├── google-drive.ts        # Drive API integration
│   └── backup.ts              # JSON export/import
├── pages/
│   └── Index.tsx              # Main app page
└── integrations/
    └── supabase/              # Lovable Cloud client

supabase/
└── functions/
    └── personality-echo/      # Edge function for AI profile
```

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

### Environment Variables
| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_GOOGLE_CLIENT_ID` | Optional | Google OAuth Client ID for Drive sync |

---

## 📱 PWA Installation

Aeterna is a fully installable PWA:
1. Open the app in Chrome/Edge/Safari
2. Click "Install" in the browser address bar
3. The app works 100% offline after installation

---

## 🔒 Privacy & Security

- **Zero cloud dependency** for core features — everything runs locally
- **Google Drive sync** uses `drive.file` scope — can only access files it created
- **No telemetry**, no tracking, no third-party analytics
- **Your data stays on your device** unless you explicitly sync to Drive

---

## 📄 License

Built with [Lovable](https://lovable.dev)

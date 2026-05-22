<p align="center">
  <img src="https://img.shields.io/badge/-Cortex-8C9A84?style=for-the-badge&logo=leaf&logoColor=white" alt="Cortex" />
</p>

<h1 align="center">Cortex</h1>

<p align="center">
  AI-powered personal finance & productivity app with a botanical design system.
</p>

<p align="center">
  <a href="https://cortexgo.vercel.app">Live Demo</a> ·
  <a href="#features">Features</a> ·
  <a href="#tech-stack">Tech Stack</a> ·
  <a href="#getting-started">Getting Started</a> ·
  <a href="#deployment">Deployment</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Supabase-2.47-3ecf8e?logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/Gemini-API-4285f4?logo=google" alt="Gemini" />
  <img src="https://img.shields.io/badge/Groq-API-f55036?logo=groq" alt="Groq" />
</p>

---

## Features

### Core Pages
- **Landing Page** — Cinematic dark hero with gradient text, animated orbs, bento-style features grid, AI showcase demo, and full footer with 8+ pages
- **Dashboard** — Monthly overview with balance card, quick stats, category pie chart, budget tracking, and recent transactions
- **Expenses** — Full CRUD with search, category filters, date filtering, CSV export, and 10 expense categories
- **Notes** — Tabbed view with Notes, Tasks, and Reminders — all with full CRUD operations
- **Analytics** — Spending trends, category breakdowns, daily bar charts, budget vs actual, month-over-month comparison
- **Calendar** — Monthly grid showing expenses, tasks, and reminders with color-coded dots and day detail panel
- **Focus Timer** — Customizable Pomodoro timer with presets (15-90min), manual input, session tracking, and task linking

### AI Agent
- **Natural Language** — Ask in plain English: "Add 500 for groceries", "Show my spending this week"
- **Dual Provider** — Supports both Google Gemini and Groq with provider toggle in Settings
- **10 Models** — Gemini 2.0/2.5 Flash/Pro, Llama 3.3, Mixtral 8x7B, Gemma 2
- **8 Tool Functions** — addExpense, getExpenses, addTask, getTasks, addNote, getNotes, addReminder, getExpenseSummary
- **Markdown Rendering** — AI responses with tables, code blocks, lists, bold/italic
- **Quick Actions** — One-tap buttons for common commands
- **Context Store** — Conversations persisted to database for continuity

### Authentication & Security
- **Email/Password** — Supabase Auth with signup and signin flows
- **Google OAuth** — One-click sign in with Google
- **Row Level Security** — Each user can only access their own data
- **Protected Routes** — Middleware redirects unauthenticated users; authenticated users skip landing page

### Design System — "Botanical Organic Serif"
- **Colors** — Alabaster, Forest, Sage, Clay, Stone, Terracotta, Cream, Mushroom
- **Typography** — Playfair Display (serif headings), Source Sans 3 (body)
- **Dark Mode** — Class-based dark mode with botanical-themed palette
- **Animations** — fade-up, fade-in, float, smooth transitions
- **Paper grain** — SVG fractalNoise texture overlay

### Additional Pages
- `/features` — All 9 features detailed
- `/pricing` — Free forever, bring your own API key
- `/faq` — 8 questions with expand/collapse
- `/about` — Story, design philosophy, tech stack
- `/blog` — 4 articles with tags and read time
- `/careers` — Open roles and contributor benefits
- `/privacy` — Data, API keys, auth, cookies policy
- `/terms` — Service terms and AI disclaimer

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5.7 |
| Styling | Tailwind CSS 3.4 |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (email + Google OAuth) |
| AI — Primary | Google Gemini API (tool calling) |
| AI — Secondary | Groq API (Llama, Mixtral, Gemma) |
| Charts | Recharts |
| Markdown | react-markdown + remark-gfm |
| Icons | Lucide React |
| Themes | next-themes |
| Deployment | Vercel |

---

## Pages & Routes

| Route | Type | Description |
|-------|------|-------------|
| `/` | Public | Cinematic landing page |
| `/signup` | Public | Email/Google signup |
| `/signin` | Public | Email/Google signin |
| `/dashboard` | Protected | Monthly dashboard with charts |
| `/expenses` | Protected | Expense CRUD with CSV export |
| `/notes` | Protected | Notes, tasks, reminders tabs |
| `/agent` | Protected | AI chat with tool calling |
| `/analytics` | Protected | Spending insights and charts |
| `/calendar` | Protected | Monthly calendar with events |
| `/focus` | Protected | Customizable Pomodoro timer |
| `/settings` | Protected | Theme, currency, budget, AI config |
| `/features` | Public | Feature showcase |
| `/pricing` | Public | Pricing page |
| `/faq` | Public | FAQ with accordion |
| `/about` | Public | About page |
| `/blog` | Public | Blog posts |
| `/careers` | Public | Open roles |
| `/privacy` | Public | Privacy policy |
| `/terms` | Public | Terms of service |
| `/api/agent` | API | AI proxy with Gemini + Groq |
| `/auth/callback` | API | OAuth callback |
| `/auth/signout` | API | Sign out handler |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Google AI Studio](https://aistudio.google.com) API key (for Gemini)
- Or a [Groq Console](https://console.groq.com) API key (for Groq)

### Installation

```bash
git clone https://github.com/soumyachk101/Cortex.git
cd Cortex
npm install
```

### Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Setup

Run the migration SQL in your Supabase SQL Editor:

```bash
# Copy and paste the contents of:
cat supabase/migrations/001_initial.sql
```

This creates tables for `expenses`, `tasks`, `notes`, `reminders`, and `user_settings` with Row Level Security policies.

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
cortex/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Landing page
│   ├── dashboard/page.tsx        # Main dashboard
│   ├── expenses/page.tsx         # Expense tracker
│   ├── notes/page.tsx            # Notes/Tasks/Reminders
│   ├── agent/page.tsx            # AI chat interface
│   ├── analytics/page.tsx        # Spending analytics
│   ├── calendar/page.tsx         # Calendar view
│   ├── focus/page.tsx            # Pomodoro timer
│   ├── settings/page.tsx         # User settings
│   ├── signup/page.tsx           # Sign up
│   ├── signin/page.tsx           # Sign in
│   ├── login/page.tsx            # Legacy login (dual mode)
│   ├── onboarding/page.tsx       # Onboarding carousel
│   ├── features/page.tsx         # Features page
│   ├── pricing/page.tsx          # Pricing page
│   ├── faq/page.tsx              # FAQ page
│   ├── about/page.tsx            # About page
│   ├── blog/page.tsx             # Blog page
│   ├── careers/page.tsx          # Careers page
│   ├── privacy/page.tsx          # Privacy policy
│   ├── terms/page.tsx            # Terms of service
│   ├── api/agent/route.ts        # AI proxy (Gemini + Groq)
│   ├── auth/callback/route.ts    # OAuth callback
│   └── auth/signout/route.ts     # Sign out
├── components/
│   ├── landing/                  # Landing page sections
│   │   ├── navbar.tsx            # Sticky navbar with scroll effect
│   │   ├── hero.tsx              # Cinematic dark hero
│   │   ├── features.tsx          # Bento-style feature grid
│   │   ├── how-it-works.tsx      # 3-step flow
│   │   ├── ai-showcase.tsx       # Chat demo
│   │   ├── stats.tsx             # Open source section
│   │   ├── cta.tsx               # Call to action
│   │   └── footer.tsx            # Full footer
│   ├── layout/
│   │   ├── app-shell.tsx         # App layout wrapper
│   │   ├── sidebar.tsx           # Desktop sidebar (8 nav items)
│   │   └── mobile-nav.tsx        # Mobile bottom nav (5 items)
│   └── ui/                       # Reusable primitives
│       ├── button.tsx            # 5 variants, 3 sizes
│       ├── card.tsx              # Card, CardFlat, CardHeader
│       ├── input.tsx             # Input with label/error
│       └── modal.tsx             # Responsive modal
├── hooks/                        # Supabase CRUD hooks
│   ├── useExpenses.ts
│   ├── useTasks.ts
│   ├── useNotes.ts
│   └── useReminders.ts
├── lib/
│   ├── supabase/                 # Client, server, middleware
│   └── utils.ts                  # cn() helper
├── types/                        # TypeScript interfaces
├── constants/                    # Categories, models, colors
├── providers/                    # ThemeProvider
└── supabase/migrations/          # Database schema
```

---

## AI Agent — Tool Calling

The AI agent uses function calling to interact with your data:

| Tool | Description |
|------|-------------|
| `addExpense` | Add expense with title, amount, category |
| `getExpenses` | Query expenses with optional category filter |
| `addTask` | Create task with priority and due date |
| `getTasks` | Get tasks (optionally include completed) |
| `addNote` | Create note with title and content |
| `getNotes` | Get recent notes |
| `addReminder` | Set reminder with repeat mode |
| `getExpenseSummary` | Aggregate spending by period with category breakdown |

### Supported Providers

**Gemini** (Google):
- gemini-2.0-flash (default)
- gemini-2.5-flash
- gemini-2.5-pro
- gemini-2.0-flash-lite
- gemini-1.5-flash
- gemini-1.5-pro

**Groq** (fast inference):
- llama-3.3-70b-versatile
- llama-3.1-8b-instant
- mixtral-8x7b-32768
- gemma2-9b-it

---

## Database Schema

5 core tables with RLS:

| Table | Key Columns |
|-------|------------|
| `expenses` | user_id, title, amount, category, date, note |
| `tasks` | user_id, title, due_date, priority, is_completed |
| `notes` | user_id, title, content |
| `reminders` | user_id, title, scheduled_time, repeat_mode |
| `user_settings` | user_id, currency_symbol, budget_limit, gemini_api_key, selected_model, theme |

---

## Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/soumyachk101/Cortex)

1. Push to GitHub
2. Import in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy

### Google OAuth Setup

1. Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com)
2. Add redirect URI: `https://your-domain.vercel.app/auth/callback`
3. Enable Google provider in Supabase → Authentication → Providers
4. Set Site URL in Supabase → Authentication → URL Configuration

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

---

## License

MIT

---

<p align="center">
  Built with <a href="https://nextjs.org">Next.js</a>, <a href="https://supabase.com">Supabase</a>, <a href="https://ai.google.dev">Gemini</a>, and <a href="https://groq.com">Groq</a>
  <br />
  <a href="https://github.com/soumyachk101">github.com/soumyachk101</a>
</p>

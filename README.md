<p align="center">
  <img src="https://img.shields.io/badge/-Cortex-8C9A84?style=for-the-badge&logo=leaf&logoColor=white" alt="Cortex" />
</p>

<h1 align="center">Cortex</h1>

<p align="center">
  A botanical-inspired personal finance & productivity app with AI assistance.
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
</p>

---

## Features

- **Expense Tracking** — Log, categorize, and visualize spending with interactive charts
- **Task Management** — Priority-based tasks with due dates and completion tracking
- **Notes** — Quick note-taking with search and organization
- **Reminders** — Schedule recurring or one-time reminders
- **AI Agent** — Natural language interface powered by Gemini with tool calling (add expenses, create tasks, get summaries)
- **6 AI Models** — Switch between Gemini 2.0 Flash, 2.5 Flash, 2.5 Pro, and more
- **Dashboard** — Monthly overview with pie charts, budget tracking, and AI insights
- **CSV Export** — Export expense data for offline analysis
- **Authentication** — Email/password + Google OAuth via Supabase
- **Row Level Security** — Each user sees only their own data
- **Dark Mode** — Botanical-themed light and dark modes
- **Responsive** — Mobile-first design with bottom navigation

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| AI | Google Gemini API |
| Charts | Recharts |
| Icons | Lucide React |
| Deployment | Vercel |

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Google AI Studio](https://aistudio.google.com) API key (for AI agent)

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

## Project Structure

```
cortex/
├── app/                          # Next.js App Router
│   ├── (pages)/                  # Route pages
│   ├── api/agent/                # Gemini API proxy
│   └── auth/                     # OAuth callbacks
├── components/
│   ├── ui/                       # Reusable primitives (Button, Card, Input, Modal)
│   └── layout/                   # Sidebar, MobileNav, AppShell
├── hooks/                        # Supabase CRUD hooks
│   ├── useExpenses.ts
│   ├── useTasks.ts
│   ├── useNotes.ts
│   └── useReminders.ts
├── lib/
│   ├── supabase/                 # Client, server, middleware
│   └── utils.ts                  # Helpers (cn, formatCurrency, etc.)
├── types/                        # TypeScript interfaces
├── constants/                    # App constants (categories, models, colors)
├── providers/                    # React context (ThemeProvider)
└── supabase/migrations/          # Database schema
```

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

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/agent` | POST | Gemini AI chat with tool calling |
| `/auth/callback` | GET | OAuth callback handler |
| `/auth/signout` | POST | Sign out handler |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

## License

MIT

---

<p align="center">
  Built with <a href="https://nextjs.org">Next.js</a>, <a href="https://supabase.com">Supabase</a>, and <a href="https://ai.google.dev">Gemini</a>
</p>

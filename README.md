# Jigaway Gulf Client Acquisition Hub

An internal client-acquisition operating system engineered for **Jigaway** to identify Gulf businesses with digital opportunities, qualify them with high-intent scoring, prepare personalized free-value website concepts, conduct targeted manual outreach, and track conversions.

The platform answers one core daily question:
> **“Who should I contact today, what should I show them, and what should I say?”**

---

## Architecture & Tech Stack

- **Frontend**: React 18 with TypeScript and Vite
- **Styling & Design System**: Tailwind CSS with a quiet, high-contrast, professional palette (white/subtle gray surfaces, red accents, clear typography)
- **Database & Auth**: Supabase (PostgreSQL with Row Level Security, 17 normalized tables, multi-tenant organization scoping)
- **Icons**: Lucide React
- **Lead Discovery Interface**: `SerperProvider` (prepared for Serper API search & maps queries)
- **Service Layer**: Clean modular provider contracts in `src/lib/services/` for Search, Website Analysis, AI Generation, and Asset Storage

---

## Design Principles

- **Quiet & Minimalist**: Built for focused daily operational use. No decorative gradients, noisy metrics, or marketing fluff.
- **Data-Driven Empty States**: All metrics, funnel counts, and tables dynamically reflect the underlying data store. Zero hardcoded demo leads or fake task counters.
- **Manual, High-Touch Outreach**: Designed for 1-to-1 personal outreach via WhatsApp (click-to-chat / copy) and email. No automated bulk mailing or third-party messaging API dependencies.
- **Organization Scoping**: All leads, opportunities, concepts, and proposals are strictly scoped to organization tenants via PostgreSQL Row Level Security (RLS).

---

## Core Acquisition Workflow

1. **Find & Import Leads**: Discovered via Serper search/maps queries across Gulf cities (Dubai, Abu Dhabi, Riyadh, Doha, etc.) and categories.
2. **Score & Prioritize**: Filter by review count, ratings, and digital presence gaps (missing or non-responsive websites).
3. **Analyze**: Identify specific conversion improvements and mobile opportunities.
4. **Create Free Value**: Generate tailored mobile-first website concepts with public token sharing before initiating contact.
5. **Manual Outreach**: Reach out with personalized WhatsApp links or direct emails referencing the concept.
6. **Follow-Up Cadence**: Structured follow-up schedule (+3d, +7d, +14d) to nurture responses.
7. **Convert & Track**: Manage commercial quotes, delivery milestones, and acquisition metrics.

---

## Environment Setup

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Configure your credentials:

```env
# Gemini AI
GEMINI_API_KEY=""

# Supabase (Database & Auth)
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY=""

# Future Providers (Phase 2+)
SERPER_API_KEY=""
```

---

## Database Migrations

Database definitions and schema migrations are located in:
- `supabase/migrations/20260921000001_initial_schema.sql` (17 normalized tables with RLS policies)
- `supabase/seed.sql` (Target Gulf markets, business categories, and service packages)

---

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── dashboard/       # KPI cards, acquisition funnel, today's queue
│   │   ├── layout/          # App header, sidebar navigation, shell
│   │   ├── leads/           # Lead workspace, action bar, header
│   │   └── ui/              # Button, Card, Modal, Badge, EmptyState
│   ├── context/             # AuthContext with demo and live Supabase support
│   ├── lib/
│   │   ├── constants/       # Config, styling maps, seed markets/categories
│   │   ├── services/        # Provider interfaces and SerperProvider stub
│   │   └── supabase/        # Supabase client and schema helpers
│   ├── pages/               # Dashboard, Leads, Opportunities, Concepts,
│   │                        # Outreach, Clients, Analytics, Settings, Roadmap
│   ├── types/               # TypeScript models matching Supabase schema
│   ├── App.tsx              # Main routing and authenticated layout
│   └── main.tsx             # Entry point
├── supabase/
│   ├── migrations/          # SQL migrations
│   └── seed.sql             # Foundation seed data
├── .env.example             # Documented environment variables
└── metadata.json            # Applet configuration and permissions
```

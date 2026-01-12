# Budget Planner - Development Guidelines

## Tech Stack
- **Framework**: Next.js 16 (App Router) with React 19
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui (New York style)
- **Database**: Supabase (PostgreSQL with RLS)
- **AI**: Vercel AI SDK with Anthropic Claude
- **Auth**: Supabase Auth (magic link OTP)

## Adding UI Components
Use shadcn/ui CLI to add components:
```bash
bunx shadcn@latest add <component-name>
```

Available components to add as needed:
- select, label, dialog, tabs, table, badge, separator, textarea, checkbox, radio-group, alert, toast, dropdown-menu, popover, calendar, date-picker

## Project Structure
```
src/
├── app/
│   ├── (app)/           # Protected routes (dashboard, transactions, etc.)
│   ├── api/             # API routes
│   ├── actions/         # Server actions
│   └── auth/            # Auth callback
├── components/
│   ├── ui/              # shadcn/ui components
│   └── transactions/    # Feature components
└── lib/
    ├── ai/              # AI schemas
    ├── supabase/        # Supabase clients
    └── tax/             # Tax calculation logic
```

## Key Features
1. **Transaction Recording via NLP** - Natural language parsing with Claude
2. **Tax Planning** - Thailand tax bracket calculations with deduction tracking

## Database
- Types are generated in `database.types.ts`
- Schema is in `supabase/schema.sql`
- All tables use RLS with user_id policies

## Commands
```bash
bun dev          # Start dev server
bun build        # Build for production
bun lint         # Run ESLint
```

# Budget Planner

## About This File
This CLAUDE.md shapes how Claude approaches this project. Keep it short (aim for <150 instructions - Claude Code already uses ~50). Focus on project-specific quirks, not general knowledge. When you find yourself correcting Claude twice on the same thing, add it here.

**Remember**: Good CLAUDE.md = notes for yourself with amnesia. Bad CLAUDE.md = new hire documentation.

## Tech Stack & Why
- **Next.js 16 (App Router) + React 19**: Use Server Components by default, Client Components only when needed for interactivity
- **TypeScript (strict mode)**: We've had production bugs from implicit any types, so strict mode is non-negotiable
- **Tailwind CSS 4**: Use utility classes directly, avoid custom CSS files
- **shadcn/ui (New York style)**: Always use `bunx shadcn@latest add <component-name>` to add new components - don't copy-paste from docs
- **Supabase**: Database types are in `database.types.ts` - regenerate if schema changes. All tables use RLS with user_id policies for security
- **Bun**: Package manager and runtime - faster than npm/yarn for this project's needs

## Project-Specific Rules

### Database Operations
- Never bypass RLS policies - they prevent users from seeing each other's data
- Schema is in `supabase/schema.sql` - modify there, then regenerate types
- Always filter by `user_id` in queries, even though RLS enforces it (makes intent clear)

### UI Components
Available shadcn components to add as needed: select, label, dialog, tabs, table, badge, separator, textarea, checkbox, radio-group, alert, toast, dropdown-menu, popover, calendar, date-picker

### Commands
```bash
bun dev          # Start dev server (port 3000)
bun build        # Build - must pass before deploying
bun lint         # ESLint - fix issues before committing
```

## Core Features
1. **NLP Transaction Recording**: Uses Claude API via Vercel AI SDK to parse natural language into structured transaction data (see `lib/ai/`)
2. **Thailand Tax Planning**: Tax brackets and deductions are Thailand-specific - don't use US/EU tax logic (see `lib/tax/`)

## What Makes This Codebase Different
- Protected routes are in `app/(app)/` - the group keeps URLs clean while sharing layout
- Server actions are in `app/actions/` - keep them separate from API routes because they have different error handling
- Auth uses magic link OTP (no passwords) - don't add password fields

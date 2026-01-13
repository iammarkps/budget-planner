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
- Schema is in `supabase/schema.sql` - modify there, then regenerate types with `bunx supabase gen types typescript --local > src/database.types.ts`
- Always filter by `user_id` in queries, even though RLS enforces it (makes intent clear)

### UI Components
When adding new UI components, use `bunx shadcn@latest add <component-name>` - don't manually copy from docs. Already installed: button, input, card. Available to add: select, label, dialog, tabs, table, badge, separator, textarea, checkbox, radio-group, alert, toast, dropdown-menu, popover, calendar, date-picker

### Development Commands
```bash
# Daily workflow
bun install      # Install/update dependencies after pulling changes
bun dev          # Start dev server (port 3000)
bun lint         # ESLint - fix issues before committing
bun build        # Build - must pass before deploying

# Type checking
bunx tsc --noEmit  # Check TypeScript errors without building

# Database
bunx supabase gen types typescript --local > src/database.types.ts  # Regenerate types after schema changes
bunx supabase db push  # Push local schema to remote (careful!)
bunx supabase db reset  # Reset local DB and apply migrations
```

## Core Features
1. **NLP Transaction Recording**: Uses Claude API via Vercel AI SDK to parse natural language into structured transaction data (see `lib/ai/`)
2. **Thailand Tax Planning**: Tax brackets and deductions are Thailand-specific - don't use US/EU tax logic (see `lib/tax/`)

## What Makes This Codebase Different
- **Route Groups**: Protected routes are in `app/(app)/` - the parentheses group routes without affecting URLs, so `/dashboard` not `/(app)/dashboard`. All routes inside share the authenticated layout with sidebar. Auth check happens in `src/proxy.ts` (Next.js 16 renamed middleware to proxy)
- **Server Actions Location**: Server actions are in `app/actions/` - keep them separate from API routes because server actions throw errors while API routes return Response objects. Different error handling patterns
- **Magic Link Auth**: Auth uses Supabase magic link OTP (no passwords) - don't add password fields or password reset flows

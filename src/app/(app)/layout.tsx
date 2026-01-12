import Link from "next/link";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/app/actions/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ThemeToggle } from "@/components/theme-toggle";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/transactions", label: "Transactions" },
  { href: "/recurring", label: "Recurring" },
  { href: "/budgets", label: "Budgets" },
  { href: "/tax-planner", label: "Tax Planner" },
  { href: "/settings", label: "Settings" },
];

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="border-b bg-card px-6 py-6 lg:min-h-screen lg:w-64 lg:border-b-0 lg:border-r">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Budget Planner
            </p>
            <h1 className="text-lg font-semibold">THB Cashflow</h1>
          </div>
          <nav className="mt-8 space-y-2 text-sm">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-md px-3 py-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>

        <div className="flex flex-1 flex-col">
          <header className="flex items-center justify-between border-b px-6 py-4">
            <div>
              <p className="text-sm text-muted-foreground">
                {user?.email ? `Signed in as ${user.email}` : "Signed in"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <form action={signOut}>
                <Button type="submit" variant="secondary">
                  Sign out
                </Button>
              </form>
            </div>
          </header>
          <main className="flex-1 px-6 py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}

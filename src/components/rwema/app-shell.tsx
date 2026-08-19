import { Link, useRouterState } from "@tanstack/react-router";
import { BarChart3, LayoutDashboard, Moon, MoreHorizontal, ReceiptText, Sun } from "lucide-react";
import type { ReactNode } from "react";

import { BrandMark } from "@/components/rwema/ui";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/sales", label: "Sales", icon: ReceiptText },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/more", label: "More", icon: MoreHorizontal },
] as const;

export function AppShell({ title, children }: { title: string; children: ReactNode }) {
  const { theme, toggle } = useTheme();
  const { role, fullName } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col">
      <header className="sticky top-0 z-20 glass mx-3 mt-3 flex items-center gap-3 rounded-2xl px-4 py-3">
        <BrandMark size={36} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-bold leading-tight">{title}</p>
          <p className="truncate text-xs text-muted-foreground">
            {fullName || "Rwema"} · {role === "boss" ? "Boss" : "Employee"}
          </p>
        </div>
        <Button variant="ghost" size="icon" aria-label="Toggle theme" onClick={toggle}>
          {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
        </Button>
      </header>

      <main className="flex-1 space-y-4 px-3 pt-4 pb-28">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-3xl px-3 pb-3">
        <div className="glass grid grid-cols-4 gap-1 rounded-2xl p-1.5">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl py-2 text-[11px] font-medium transition-colors",
                  active
                    ? "brand-gradient text-white shadow-md"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="size-5" />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

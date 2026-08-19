import { createFileRoute } from "@tanstack/react-router";
import {
  Banknote,
  Briefcase,
  Loader2,
  Music4,
  Repeat,
  Signal,
  Smartphone,
  TrendingUp,
  User,
} from "lucide-react";

import { AppShell } from "@/components/rwema/app-shell";
import { EmptyState, GlassCard, SectionTitle, StatCard } from "@/components/rwema/ui";
import { useTransactions } from "@/hooks/use-transactions";
import { useAuth } from "@/lib/auth";
import {
  CATEGORIES,
  formatMoney,
  localDateKey,
  sumTotals,
  type Category,
} from "@/lib/rwema";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard · Rwema" },
      { name: "description", content: "Today's Rwema sales, earnings and category totals." },
      { property: "og:title", content: "Dashboard · Rwema" },
      { property: "og:description", content: "Live sales and earnings overview." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const CATEGORY_ICONS: Record<Category, typeof Smartphone> = {
  new_sim: Smartphone,
  sim_swap: Repeat,
  movies_songs: Music4,
};

function Dashboard() {
  const { role } = useAuth();
  const { data, isLoading, error } = useTransactions();
  const rows = data ?? [];
  const today = localDateKey();
  const todayRows = rows.filter((r) => r.occurred_on === today);
  const todayTotals = sumTotals(todayRows);
  const allTotals = sumTotals(rows);
  const boss = role === "boss";

  return (
    <AppShell title="Dashboard">
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      ) : error ? (
        <GlassCard>
          <p className="text-sm text-destructive">Could not load sales. Please try again.</p>
        </GlassCard>
      ) : (
        <>
          <SectionTitle>Today · {today}</SectionTitle>
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              icon={TrendingUp}
              label="Gross"
              value={formatMoney(todayTotals.gross)}
              hint={`${todayTotals.count} sale${todayTotals.count === 1 ? "" : "s"}`}
              accent
            />
            <StatCard icon={Banknote} label="Net" value={formatMoney(todayTotals.net)} />
            <StatCard
              icon={User}
              label="Employee 40%"
              value={formatMoney(todayTotals.employee)}
            />
            <StatCard icon={Briefcase} label="Boss 60%" value={formatMoney(todayTotals.boss)} />
          </div>

          {boss ? (
            <>
              <SectionTitle>All time</SectionTitle>
              <div className="grid grid-cols-2 gap-3">
                <StatCard icon={TrendingUp} label="Total revenue" value={formatMoney(allTotals.gross)} />
                <StatCard icon={Signal} label="Airtime" value={formatMoney(allTotals.airtime)} />
                <StatCard icon={User} label="Employee 40%" value={formatMoney(allTotals.employee)} />
                <StatCard icon={Briefcase} label="Boss 60%" value={formatMoney(allTotals.boss)} />
              </div>
            </>
          ) : (
            <>
              <SectionTitle>My earnings today</SectionTitle>
              <GlassCard className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Your 40% share
                  </p>
                  <p className="text-3xl font-extrabold tabular-nums text-primary">
                    {formatMoney(todayTotals.employee)}
                  </p>
                </div>
                <User className="size-10 text-primary/40" />
              </GlassCard>
            </>
          )}

          <SectionTitle>Category totals {boss ? "(all time)" : "(today)"}</SectionTitle>
          <div className="space-y-2">
            {CATEGORIES.map((c) => {
              const source = boss ? rows : todayRows;
              const totals = sumTotals(source.filter((r) => r.category === c.value));
              const Icon = CATEGORY_ICONS[c.value];
              return (
                <GlassCard key={c.value} className="flex items-center gap-3">
                  <span className="brand-gradient flex size-9 shrink-0 items-center justify-center rounded-xl text-white">
                    <Icon className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{c.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {totals.count} sale{totals.count === 1 ? "" : "s"} · net{" "}
                      {formatMoney(totals.net)}
                    </p>
                  </div>
                  <p className="font-bold tabular-nums">{formatMoney(totals.gross)}</p>
                </GlassCard>
              );
            })}
          </div>

          {rows.length === 0 ? (
            <EmptyState
              icon={TrendingUp}
              title="No sales yet"
              description={
                boss
                  ? "Numbers will appear here as soon as the employee records a sale."
                  : "Go to Sales and record today's first sale."
              }
            />
          ) : null}
        </>
      )}
    </AppShell>
  );
}

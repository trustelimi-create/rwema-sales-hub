import { createFileRoute, Link } from "@tanstack/react-router";
import { BarChart3, Repeat, ShieldCheck, Smartphone, Music4, Wallet } from "lucide-react";

import { InstallButton } from "@/components/rwema/install-button";
import { BrandMark, GlassCard } from "@/components/rwema/ui";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Rwema · Daily Sales & Earnings Tracker" },
      {
        name: "description",
        content:
          "Rwema records New SIM Card, SIM Swap and Movies & Songs sales, then splits earnings 40/60 between employee and boss automatically.",
      },
      { property: "og:title", content: "Rwema · Daily Sales & Earnings Tracker" },
      {
        property: "og:description",
        content: "Record today's sales and see daily, weekly, monthly and yearly reports instantly.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const FEATURES = [
  { icon: Smartphone, title: "New SIM Card", text: "Quantity × price, minus airtime." },
  { icon: Repeat, title: "SIM Swap", text: "Quantity × price, split instantly." },
  { icon: Music4, title: "Movies & Songs", text: "Quantity × price, no airtime." },
  { icon: Wallet, title: "40 / 60 split", text: "Employee 40%, Boss 60%, always." },
  { icon: BarChart3, title: "Live reports", text: "Daily, weekly, monthly, yearly." },
  { icon: ShieldCheck, title: "Secure by design", text: "Role-based access, private data." },
];

function Home() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col items-center px-4 py-10">
      <div className="flex flex-col items-center gap-4 text-center">
        <BrandMark size={72} />
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Rwema</h1>
        <p className="max-w-md text-muted-foreground">
          Record today&apos;s sales in seconds. Earnings, reports and category totals update
          automatically — one source of truth for the employee and the boss.
        </p>
        <div className="flex w-full max-w-xs flex-col gap-2">
          <Button asChild size="lg">
            <Link to="/auth">Sign in to Rwema</Link>
          </Button>
          <InstallButton className="w-full" />
        </div>
      </div>

      <div className="mt-10 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
        {FEATURES.map(({ icon: Icon, title, text }) => (
          <GlassCard key={title} className="flex items-start gap-3">
            <span className="brand-gradient flex size-9 shrink-0 items-center justify-center rounded-xl text-white">
              <Icon className="size-5" />
            </span>
            <div>
              <p className="font-semibold">{title}</p>
              <p className="text-sm text-muted-foreground">{text}</p>
            </div>
          </GlassCard>
        ))}
      </div>

      <p className="mt-10 text-xs text-muted-foreground">Developed by Chanel</p>
    </div>
  );
}

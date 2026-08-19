import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function GlassCard({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn("glass rounded-2xl p-4", className)}>{children}</div>;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <GlassCard className={cn("flex flex-col gap-2", accent && "ring-1 ring-primary/40")}>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className={cn("size-4", accent && "text-primary")} />
        <span className="text-xs font-medium tracking-wide uppercase">{label}</span>
      </div>
      <p className="text-xl font-bold tabular-nums sm:text-2xl">{value}</p>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </GlassCard>
  );
}

export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
        {children}
      </h2>
      {right}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description: string }) {
  return (
    <GlassCard className="flex flex-col items-center gap-2 py-10 text-center">
      <Icon className="size-8 text-muted-foreground" />
      <p className="font-semibold">{title}</p>
      <p className="max-w-xs text-sm text-muted-foreground">{description}</p>
    </GlassCard>
  );
}

export function BrandMark({ size = 40 }: { size?: number }) {
  return (
    <span
      className="brand-gradient inline-flex items-center justify-center rounded-xl font-extrabold text-white shadow-lg"
      style={{ width: size, height: size, fontSize: size * 0.5 }}
      aria-hidden="true"
    >
      R
    </span>
  );
}

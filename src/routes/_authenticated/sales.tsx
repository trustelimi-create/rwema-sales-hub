import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, ReceiptText, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/rwema/app-shell";
import { EmptyState, GlassCard, SectionTitle } from "@/components/rwema/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTransactions } from "@/hooks/use-transactions";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import {
  CATEGORIES,
  categoryLabel,
  formatMoney,
  localDateKey,
  preview,
  sumTotals,
  type Category,
  type Transaction,
} from "@/lib/rwema";

export const Route = createFileRoute("/_authenticated/sales")({
  head: () => ({
    meta: [
      { title: "Sales · Rwema" },
      { name: "description", content: "Record and review Rwema sales transactions." },
      { property: "og:title", content: "Sales · Rwema" },
      { property: "og:description", content: "Add today's sales and review recorded transactions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SalesPage,
});

function SaleForm() {
  const queryClient = useQueryClient();
  const [category, setCategory] = useState<Category>("new_sim");
  const [quantity, setQuantity] = useState("1");
  const [price, setPrice] = useState("");
  const [airtime, setAirtime] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const meta = CATEGORIES.find((c) => c.value === category)!;
  const calc = preview(category, Number(quantity), Number(price), Number(airtime));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (calc.gross <= 0) {
      toast.error("Enter a quantity and price first");
      return;
    }
    if (meta.hasAirtime && calc.airtime > calc.gross) {
      toast.error("Airtime cannot exceed the gross amount");
      return;
    }
    setBusy(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not signed in");
      const { error } = await supabase.from("transactions").insert({
        user_id: userData.user.id,
        category,
        quantity: Number(quantity),
        price: Number(price),
        airtime: meta.hasAirtime ? Number(airtime || 0) : 0,
        note: note.trim() || null,
        occurred_on: localDateKey(),
      });
      if (error) throw error;
      toast.success("Sale recorded", { description: `${meta.label} · ${formatMoney(calc.gross)}` });
      setQuantity("1");
      setPrice("");
      setAirtime("");
      setNote("");
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save the sale");
    } finally {
      setBusy(false);
    }
  };

  return (
    <GlassCard className="space-y-4">
      <SectionTitle>Add today&apos;s sale</SectionTitle>
      <form className="space-y-3" onSubmit={submit}>
        <div className="space-y-1.5">
          <Label>Category</Label>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setCategory(c.value)}
                className={`rounded-xl border px-2 py-2 text-xs font-semibold transition ${
                  category === c.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min={1}
              step={1}
              inputMode="numeric"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="price">{meta.priceLabel}</Label>
            <Input
              id="price"
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>
        </div>

        {meta.hasAirtime ? (
          <div className="space-y-1.5">
            <Label htmlFor="airtime">Airtime</Label>
            <Input
              id="airtime"
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              value={airtime}
              onChange={(e) => setAirtime(e.target.value)}
              placeholder="0"
            />
          </div>
        ) : null}

        <div className="space-y-1.5">
          <Label htmlFor="note">Note (optional)</Label>
          <Input id="note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={120} />
        </div>

        <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted/60 p-3 text-sm">
          <span className="text-muted-foreground">Gross</span>
          <span className="text-right font-semibold tabular-nums">{formatMoney(calc.gross)}</span>
          {meta.hasAirtime ? (
            <>
              <span className="text-muted-foreground">Airtime</span>
              <span className="text-right font-semibold tabular-nums">
                −{formatMoney(calc.airtime)}
              </span>
            </>
          ) : null}
          <span className="text-muted-foreground">Net</span>
          <span className="text-right font-semibold tabular-nums">{formatMoney(calc.net)}</span>
          <span className="text-muted-foreground">Employee 40%</span>
          <span className="text-right font-semibold tabular-nums text-primary">
            {formatMoney(calc.employee)}
          </span>
          <span className="text-muted-foreground">Boss 60%</span>
          <span className="text-right font-semibold tabular-nums">{formatMoney(calc.boss)}</span>
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy ? <Loader2 className="size-5 animate-spin" /> : <Plus className="size-5" />}
          Save sale
        </Button>
      </form>
    </GlassCard>
  );
}

function SaleRow({ row, canDelete }: { row: Transaction; canDelete: boolean }) {
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);

  const remove = async () => {
    setBusy(true);
    const { error } = await supabase.from("transactions").delete().eq("id", row.id);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Sale deleted");
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
  };

  return (
    <GlassCard className="flex items-center gap-3">
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{categoryLabel(row.category)}</p>
        <p className="text-xs text-muted-foreground">
          {row.occurred_on} · {row.quantity} × {formatMoney(Number(row.price))}
          {Number(row.airtime) > 0 ? ` · airtime ${formatMoney(Number(row.airtime))}` : ""}
        </p>
        {row.note ? <p className="truncate text-xs text-muted-foreground">{row.note}</p> : null}
      </div>
      <div className="text-right">
        <p className="font-bold tabular-nums">{formatMoney(Number(row.net))}</p>
        <p className="text-[11px] text-muted-foreground tabular-nums">
          40% {formatMoney(Number(row.employee_share))}
        </p>
      </div>
      {canDelete ? (
        <Button variant="ghost" size="icon" aria-label="Delete sale" onClick={remove} disabled={busy}>
          <Trash2 className="size-4 text-destructive" />
        </Button>
      ) : null}
    </GlassCard>
  );
}

function SalesPage() {
  const { role } = useAuth();
  const { data, isLoading } = useTransactions();
  const rows = data ?? [];
  const today = localDateKey();
  const boss = role === "boss";
  const visible = boss ? rows : rows.filter((r) => r.occurred_on === today);
  const totals = sumTotals(visible);

  return (
    <AppShell title="Sales">
      {!boss && role ? <SaleForm /> : null}

      <SectionTitle
        right={
          <span className="text-xs text-muted-foreground tabular-nums">
            {totals.count} · {formatMoney(totals.gross)}
          </span>
        }
      >
        {boss ? "All sales" : "Today's sales"}
      </SectionTitle>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={ReceiptText}
          title="No sales recorded"
          description={boss ? "Sales appear here in real time." : "Add your first sale above."}
        />
      ) : (
        <div className="space-y-2">
          {visible.map((row) => (
            <SaleRow key={row.id} row={row} canDelete={!boss && row.occurred_on === today} />
          ))}
        </div>
      )}
    </AppShell>
  );
}

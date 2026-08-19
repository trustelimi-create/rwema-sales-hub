export const EMPLOYEE_RATE = 0.4;
export const BOSS_RATE = 0.6;

export type Category = "new_sim" | "sim_swap" | "movies_songs";

export const CATEGORIES: { value: Category; label: string; priceLabel: string; hasAirtime: boolean }[] =
  [
    { value: "new_sim", label: "New SIM Card", priceLabel: "Price per item", hasAirtime: true },
    { value: "sim_swap", label: "SIM Swap", priceLabel: "Price per item", hasAirtime: false },
    { value: "movies_songs", label: "Movies & Songs", priceLabel: "Price", hasAirtime: false },
  ];

export function categoryLabel(value: Category) {
  return CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

export type Transaction = {
  id: string;
  user_id: string;
  category: Category;
  quantity: number;
  price: number;
  airtime: number;
  note: string | null;
  occurred_on: string;
  created_at: string;
  gross: number;
  net: number;
  employee_share: number;
  boss_share: number;
};

export type Totals = {
  count: number;
  gross: number;
  airtime: number;
  net: number;
  employee: number;
  boss: number;
};

export const emptyTotals: Totals = {
  count: 0,
  gross: 0,
  airtime: 0,
  net: 0,
  employee: 0,
  boss: 0,
};

export function sumTotals(rows: Transaction[]): Totals {
  return rows.reduce<Totals>(
    (acc, r) => ({
      count: acc.count + 1,
      gross: acc.gross + Number(r.gross),
      airtime: acc.airtime + Number(r.airtime),
      net: acc.net + Number(r.net),
      employee: acc.employee + Number(r.employee_share),
      boss: acc.boss + Number(r.boss_share),
    }),
    { ...emptyTotals },
  );
}

export function preview(category: Category, quantity: number, price: number, airtime: number) {
  const gross = (Number.isFinite(quantity) ? quantity : 0) * (Number.isFinite(price) ? price : 0);
  const usedAirtime = category === "new_sim" ? (Number.isFinite(airtime) ? airtime : 0) : 0;
  const net = gross - usedAirtime;
  return {
    gross,
    airtime: usedAirtime,
    net,
    employee: net * EMPLOYEE_RATE,
    boss: net * BOSS_RATE,
  };
}

export function formatMoney(value: number) {
  return new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency: "RWF",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

/** Local (not UTC) YYYY-MM-DD */
export function localDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

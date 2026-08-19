import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { supabase } from "@/integrations/supabase/client";
import type { Transaction } from "@/lib/rwema";

/**
 * Single source of truth: every screen (dashboard, sales, all reports)
 * derives its numbers from this one dataset, kept live with Realtime.
 */
export function useTransactions() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("transactions-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "transactions" }, () => {
        queryClient.invalidateQueries({ queryKey: ["transactions"] });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ["transactions"],
    queryFn: async (): Promise<Transaction[]> => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("occurred_on", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Transaction[];
    },
  });
}

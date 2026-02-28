"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";
import type { Donation, Envelope, Income, EventSummary, ActivityItem } from "@/lib/types";

function buildActivityList(
  donations: Donation[],
  envelopes: Envelope[],
  incomeItems: Income[],
): ActivityItem[] {
  const items: ActivityItem[] = [];

  for (const d of donations) {
    items.push({
      id: d.id,
      type: "donation",
      name: d.is_anonymous ? "ผู้ไม่ประสงค์ออกนาม" : d.donor_name,
      amount: d.amount,
      detail: d.donation_type === "cash" ? "เงินสด" : d.donation_type === "transfer" ? "โอนเงิน" : "อื่นๆ",
      timestamp: d.created_at,
    });
  }

  for (const env of envelopes) {
    if (env.status === "received" && env.amount > 0) {
      items.push({
        id: env.id,
        type: "envelope",
        name: env.donor_name || `ซอง ${env.envelope_no}`,
        amount: env.amount,
        detail: `สาย ${env.route_name}`,
        timestamp: env.updated_at || env.created_at,
      });
    }
  }

  for (const inc of incomeItems) {
    items.push({
      id: inc.id,
      type: "income",
      name: inc.category,
      amount: Number(inc.amount),
      detail: inc.description || "",
      timestamp: inc.created_at,
    });
  }

  items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return items.slice(0, 30);
}

export function useRealtimeDonations(eventId: string) {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [summary, setSummary] = useState<EventSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [newActivityId, setNewActivityId] = useState<string | null>(null);
  const [summaryFlash, setSummaryFlash] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [donationsData, envelopesData, incomeData, summaryData] = await Promise.all([
        api.getRecentDonations(eventId, 20),
        api.getEnvelopes(eventId),
        api.getIncome(eventId),
        api.getEventSummary(eventId),
      ]);
      setDonations(donationsData);
      setSummary(summaryData);
      setActivities(buildActivityList(donationsData, envelopesData, incomeData));
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  // Debounced refetch for non-donation table changes
  const debouncedRefetch = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchData();
      setSummaryFlash(true);
      setTimeout(() => setSummaryFlash(false), 1500);
    }, 500);
  }, [fetchData]);

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel(`realtime-${eventId}`)
      // Donations — optimistic insert
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "donations",
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const donation = payload.new as Donation;
            setNewActivityId(donation.id);
            setDonations((prev) => [donation, ...prev].slice(0, 20));
            setActivities((prev) => [
              {
                id: donation.id,
                type: "donation" as const,
                name: donation.is_anonymous ? "ผู้ไม่ประสงค์ออกนาม" : donation.donor_name,
                amount: donation.amount,
                detail: donation.donation_type === "cash" ? "เงินสด" : donation.donation_type === "transfer" ? "โอนเงิน" : "อื่นๆ",
                timestamp: donation.created_at,
              },
              ...prev,
            ].slice(0, 30));
            setSummary((prev) =>
              prev
                ? {
                    ...prev,
                    total_donated: prev.total_donated + donation.amount,
                    total_donors: prev.total_donors + 1,
                    percent_reached:
                      prev.target_amount > 0
                        ? Math.round(
                            ((prev.total_donated + donation.amount) /
                              prev.target_amount) *
                              10000
                          ) / 100
                        : 0,
                  }
                : prev
            );
            setSummaryFlash(true);
            setTimeout(() => setSummaryFlash(false), 1500);
            setTimeout(() => setNewActivityId(null), 3000);
          } else {
            debouncedRefetch();
          }
        }
      )
      // Envelopes — refetch summary on any change
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "envelopes",
          filter: `event_id=eq.${eventId}`,
        },
        () => debouncedRefetch()
      )
      // Income — refetch summary on any change
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "income",
          filter: `event_id=eq.${eventId}`,
        },
        () => debouncedRefetch()
      )
      // Expenses — refetch summary on any change
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "expenses",
          filter: `event_id=eq.${eventId}`,
        },
        () => debouncedRefetch()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [eventId, fetchData, debouncedRefetch]);

  return { activities, summary, loading, newActivityId, summaryFlash, refetch: fetchData };
}

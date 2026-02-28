"use client";

import { useState, useCallback } from "react";
import { ClientSpinner } from "./ClientSpinner";
import { useRealtimeDonations } from "@/hooks/useRealtimeDonations";
import { AdminLayout } from "./AdminLayout";
import { DashboardTab } from "./admin/DashboardTab";
import { DonationsTab } from "./admin/DonationsTab";
import { EnvelopesTab } from "./admin/EnvelopesTab";
import { IncomeTab } from "./admin/IncomeTab";
import { ExpensesTab } from "./admin/ExpensesTab";
import { TeamTab } from "./admin/TeamTab";
import { SettingsTab } from "./admin/SettingsTab";
import type { Event } from "@/lib/types";

type AdminTab =
  | "dashboard"
  | "donations"
  | "envelopes"
  | "income"
  | "expenses"
  | "team"
  | "settings";

interface AdminDashboardProps {
  event: Event;
}

export function AdminDashboard({ event: initialEvent }: AdminDashboardProps) {
  const [event, setEvent] = useState(initialEvent);
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const { summary, loading, refetch } = useRealtimeDonations(event.id);

  const handleDataChange = useCallback(() => {
    refetch();
  }, [refetch]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <ClientSpinner size="lg" />
      </div>
    );
  }

  return (
    <AdminLayout event={event} activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === "dashboard" && <DashboardTab summary={summary} />}
      {activeTab === "donations" && (
        <DonationsTab eventId={event.id} onDataChange={handleDataChange} />
      )}
      {activeTab === "envelopes" && (
        <EnvelopesTab eventId={event.id} onDataChange={handleDataChange} />
      )}
      {activeTab === "income" && (
        <IncomeTab eventId={event.id} onDataChange={handleDataChange} />
      )}
      {activeTab === "expenses" && (
        <ExpensesTab eventId={event.id} onDataChange={handleDataChange} />
      )}
      {activeTab === "team" && (
        <TeamTab eventId={event.id} />
      )}
      {activeTab === "settings" && (
        <SettingsTab event={event} onEventUpdate={setEvent} />
      )}
    </AdminLayout>
  );
}

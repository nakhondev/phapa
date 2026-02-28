"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ClientSpinner } from "./ClientSpinner";
import { CircleInfo } from "@gravity-ui/icons";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { AdminDashboard } from "./AdminDashboard";
import { LoginPage } from "./LoginPage";
import type { Event } from "@/lib/types";

interface AdminRouterProps {
  eventId: string | null;
}

export function AdminRouter({ eventId }: AdminRouterProps) {
  const { user, loading: authLoading } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!eventId) {
      setError("กรุณาระบุ event ID");
      setLoading(false);
      return;
    }
    api
      .getEvent(eventId)
      .then(setEvent)
      .catch(() => setError("ไม่พบงานผ้าป่านี้"))
      .finally(() => setLoading(false));
  }, [eventId]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <ClientSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  if (error || !event) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-red-100">
          <CircleInfo className="size-8 text-red-500" />
        </div>
        <h1 className="text-xl font-bold text-gray-700">
          {error || "ไม่พบงานผ้าป่า"}
        </h1>
        <Link href="/" className="text-sm font-medium text-gold-600 hover:underline">
          กลับหน้าหลัก
        </Link>
      </div>
    );
  }

  return <AdminDashboard event={event} />;
}

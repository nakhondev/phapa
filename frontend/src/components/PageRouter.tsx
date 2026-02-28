"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ClientSpinner } from "./ClientSpinner";
import { CircleInfo } from "@gravity-ui/icons";
import { api } from "@/lib/api";
import { LandingPage } from "./LandingPage";
import { HomePage } from "./HomePage";
import type { Event } from "@/lib/types";

interface PageRouterProps {
  eventId: string | null;
}

export function PageRouter({ eventId }: PageRouterProps) {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(!!eventId);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!eventId) return;
    api
      .getEvent(eventId)
      .then(setEvent)
      .catch(() => setError("ไม่พบงานผ้าป่านี้"))
      .finally(() => setLoading(false));
  }, [eventId]);

  if (!eventId) return <HomePage />;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gold-50 via-white to-saffron-50">
        <ClientSpinner size="lg" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gradient-to-br from-gold-50 via-white to-saffron-50">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-red-100">
          <CircleInfo className="size-8 text-red-500" />
        </div>
        <h1 className="text-xl font-bold text-gray-700">{error || "ไม่พบงานผ้าป่า"}</h1>
        <Link href="/" className="text-sm font-medium text-gold-600 hover:underline">
          กลับหน้าหลัก
        </Link>
      </div>
    );
  }

  return <LandingPage event={event} />;
}

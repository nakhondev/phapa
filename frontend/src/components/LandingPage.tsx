"use client";

import { useRealtimeDonations } from "@/hooks/useRealtimeDonations";
import { AnimatedCounter } from "./AnimatedCounter";
import { DonationTicker } from "./DonationTicker";
import { Card } from "@heroui/react";
import { ClientSpinner } from "./ClientSpinner";
import {
  CircleDollar,
  Persons,
  ChartColumnStacked,
  CircleCheck,
  Calendar,
  LocationArrow,
  Envelope,
  ChartColumn,
  Receipt,
} from "@gravity-ui/icons";
import type { Event } from "@/lib/types";

interface LandingPageProps {
  event: Event;
}

export function LandingPage({ event }: LandingPageProps) {
  const { activities, summary, loading, newActivityId, summaryFlash } = useRealtimeDonations(
    event.id
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gold-50 via-white to-saffron-50">
        <div className="flex flex-col items-center gap-4">
          <ClientSpinner size="lg" />
          <p className="text-sm font-light text-gray-400">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  const targetAmount = summary?.target_amount || event.target_amount || 0;
  const totalDonated = summary?.total_donated || 0;
  const totalDonors = summary?.total_donors || 0;
  const totalEnvelopeAmount = summary?.total_envelope_amount || 0;
  const totalIncome = summary?.total_income || 0;
  const totalExpenses = summary?.total_expenses || 0;
  const envelopesReceived = summary?.envelopes_received || 0;
  const totalEnvelopes = summary?.total_envelopes || 0;
  const netAmount = totalDonated + totalEnvelopeAmount + totalIncome - totalExpenses;
  const netPercent = targetAmount > 0 ? Math.round((netAmount / targetAmount) * 10000) / 100 : 0;

  const fmtCurrency = (n: number) =>
    new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 2,
    }).format(n);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gold-50 via-white to-saffron-50">
      {/* Decorative blurs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 size-[500px] rounded-full bg-gold-300 opacity-20 blur-[150px]" />
        <div className="absolute -right-32 top-1/3 size-96 rounded-full bg-saffron-500 opacity-10 blur-[120px]" />
        <div className="absolute -bottom-20 left-1/4 size-80 rounded-full bg-gold-400 opacity-10 blur-[120px]" />
      </div>

      {/* Top bar */}
      <nav className="relative border-b border-gold-100/50 bg-white/60 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 shadow-md shadow-gold-500/20">
              <CircleDollar className="size-5 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-700">
              ระบบบริจาคผ้าป่า
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            {event.event_date && (
              <span className="hidden items-center gap-1.5 sm:flex">
                <Calendar className="size-3.5" />
                {new Date(event.event_date).toLocaleDateString("th-TH", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            )}
            {event.location && (
              <span className="hidden items-center gap-1.5 md:flex">
                <LocationArrow className="size-3.5" />
                {event.location}
              </span>
            )}
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                event.is_active
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {event.is_active ? "เปิดรับบริจาค" : "ปิดรับแล้ว"}
            </span>
          </div>
        </div>
      </nav>

      {/* Main Content: Two-column */}
      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:py-12">
        <div className="grid gap-6 sm:gap-8 lg:grid-cols-[1fr_380px] lg:gap-10">
          {/* LEFT: Donation Amount + Stats */}
          <div className="flex flex-col gap-5 sm:gap-8">
            {/* Event Title */}
            <div className="animate-fade-in-up">
              <h1 className="text-2xl font-extrabold leading-snug tracking-tight text-gray-900 sm:text-3xl md:text-4xl lg:text-5xl">
                {event.name}
              </h1>
              {event.description && (
                <p className="mt-3 max-w-xl text-base font-light leading-relaxed text-gray-500">
                  {event.description}
                </p>
              )}
            </div>

            {/* Big Donation Card */}
            <div
              className="animate-fade-in-up"
              style={{ animationDelay: "0.15s" }}
            >
              <div className="animate-pulse-glow rounded-3xl bg-gradient-to-br from-gold-400 via-gold-500 to-saffron-500 p-[2px]">
                <div className="rounded-[22px] bg-white/95 p-5 backdrop-blur-xl sm:p-8 md:p-12">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-gold-600">
                    ยอดสุทธิ
                  </p>
                  <div className="relative inline-block">
                    <AnimatedCounter
                      value={netAmount}
                      prefix="฿"
                      className="text-3xl font-black tracking-tight text-gray-900 sm:text-5xl md:text-6xl lg:text-7xl"
                    />
                    {summaryFlash && (
                      <div className="animate-count-up absolute -right-4 -top-4 rounded-full bg-green-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
                        อัพเดท!
                      </div>
                    )}
                  </div>

                  {targetAmount > 0 && (
                    <div className="mt-8">
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-light text-gray-400">
                          เป้าหมาย
                        </span>
                        <span className="font-semibold text-gold-700">
                          {fmtCurrency(targetAmount)}
                        </span>
                      </div>
                      <div className="relative overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-4 rounded-full bg-gradient-to-r from-gold-400 via-gold-500 to-saffron-500 shadow-sm shadow-gold-400/40 transition-all duration-[1500ms] ease-out"
                          style={{
                            width: `${Math.min(netPercent, 100)}%`,
                          }}
                        />
                        {/* Animated shimmer overlay */}
                        <div
                          className="absolute inset-0 rounded-full"
                          style={{
                            background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)",
                            backgroundSize: "200% 100%",
                            animation: "shimmer 2.5s infinite",
                          }}
                        />
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          {fmtCurrency(netAmount)}
                        </span>
                        <span className="text-sm font-bold text-gold-600">
                          {netPercent.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats Row */}
            <div
              className="animate-fade-in-up grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4"
              style={{ animationDelay: "0.3s" }}
            >
              <Card className="overflow-hidden">
                <Card.Content className="flex items-center gap-3 p-3 sm:p-4">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gold-100 sm:size-10">
                    <Persons className="size-4 text-gold-700 sm:size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-bold text-gray-900 sm:text-xl">
                      <AnimatedCounter value={totalDonors} duration={800} decimals={0} />
                    </p>
                    <p className="text-[10px] font-medium text-gray-400 sm:text-xs">ผู้บริจาค</p>
                  </div>
                </Card.Content>
              </Card>
              <Card className="overflow-hidden">
                <Card.Content className="flex items-center gap-3 p-3 sm:p-4">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-purple-100 sm:size-10">
                    <Envelope className="size-4 text-purple-600 sm:size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-bold text-gray-900 sm:text-xl">
                      {envelopesReceived}<span className="text-sm font-normal text-gray-400">/{totalEnvelopes}</span>
                    </p>
                    <p className="text-[10px] font-medium text-gray-400 sm:text-xs">ซองผ้าป่า</p>
                  </div>
                </Card.Content>
              </Card>
              <Card className="overflow-hidden">
                <Card.Content className="flex items-center gap-3 p-3 sm:p-4">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-saffron-100 sm:size-10">
                    <ChartColumnStacked className="size-4 text-saffron-600 sm:size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-bold text-gray-900 sm:text-xl">
                      {totalDonors > 0 ? new Intl.NumberFormat("th-TH", { maximumFractionDigits: 0 }).format(totalDonated / totalDonors) : "0"}
                    </p>
                    <p className="text-[10px] font-medium text-gray-400 sm:text-xs">เฉลี่ย/คน</p>
                  </div>
                </Card.Content>
              </Card>
              <Card className="overflow-hidden">
                <Card.Content className="flex items-center gap-3 p-3 sm:p-4">
                  <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg sm:size-10 ${event.is_active ? "bg-green-100" : "bg-gray-100"}`}>
                    <CircleCheck className={`size-4 sm:size-5 ${event.is_active ? "text-green-600" : "text-gray-400"}`} />
                  </div>
                  <div>
                    <p className={`text-lg font-bold ${event.is_active ? "text-green-600" : "text-gray-400"}`}>
                      {event.is_active ? "เปิดรับ" : "ปิดแล้ว"}
                    </p>
                    <p className="text-[10px] font-medium text-gray-400 sm:text-xs">สถานะ</p>
                  </div>
                </Card.Content>
              </Card>
            </div>

            {/* Financial Transparency Section */}
            <div
              className="animate-fade-in-up"
              style={{ animationDelay: "0.45s" }}
            >
              <Card className={`overflow-hidden border-0 shadow-lg shadow-gray-200/50 transition-all duration-500 ${summaryFlash ? "ring-2 ring-gold-400 shadow-gold-200/30" : ""}`}>
                <Card.Header className="border-b border-gray-100 bg-gray-50/50 px-5 py-3">
                  <div className="flex items-center gap-2">
                    <Card.Title className="text-sm font-bold text-gray-700">
                      สรุปการเงิน
                    </Card.Title>
                    {summaryFlash && (
                      <span className="animate-pulse rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-600">
                        อัพเดท!
                      </span>
                    )}
                    <span className="ml-auto text-[10px] text-gray-300">LIVE</span>
                  </div>
                </Card.Header>
                <Card.Content className="p-0">
                  <div className="divide-y divide-gray-50">
                    {/* รายรับ */}
                    <div className="flex items-center justify-between px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-gold-100">
                          <CircleDollar className="size-4 text-gold-700" />
                        </div>
                        <span className="text-sm text-gray-600">ยอดบริจาค</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        {fmtCurrency(totalDonated)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-purple-100">
                          <Envelope className="size-4 text-purple-600" />
                        </div>
                        <span className="text-sm text-gray-600">
                          เงินจากซองผ้าป่า
                          <span className="ml-1 text-xs text-gray-400">({envelopesReceived} ซอง)</span>
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        {fmtCurrency(totalEnvelopeAmount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-green-100">
                          <ChartColumn className="size-4 text-green-600" />
                        </div>
                        <span className="text-sm text-gray-600">รายรับอื่นๆ (เงินทำบุญ, ค่าโต๊ะจีน ฯลฯ)</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        {fmtCurrency(totalIncome)}
                      </span>
                    </div>
                    {/* รายจ่าย */}
                    <div className="flex items-center justify-between px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-red-100">
                          <Receipt className="size-4 text-red-500" />
                        </div>
                        <span className="text-sm text-gray-600">รายจ่าย</span>
                      </div>
                      <span className="text-sm font-semibold text-red-500">
                        -{fmtCurrency(totalExpenses)}
                      </span>
                    </div>
                    {/* ยอดสุทธิ */}
                    <div className="flex items-center justify-between bg-gradient-to-r from-gold-50 to-saffron-50 px-5 py-4">
                      <span className="text-sm font-bold text-gray-800">
                        ยอดสุทธิ
                      </span>
                      <span className="text-lg font-black text-gray-900">
                        {fmtCurrency(netAmount)}
                      </span>
                    </div>
                  </div>
                </Card.Content>
              </Card>
            </div>

            {/* Mobile: show activities below on small screens */}
            <div className="lg:hidden">
              <div className="mb-4 flex items-center gap-2">
                <span className="relative flex size-2.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-green-500" />
                </span>
                <h2 className="text-base font-bold text-gray-700">รายการล่าสุด</h2>
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-600">LIVE</span>
              </div>
              <DonationTicker activities={activities} newActivityId={newActivityId} />
            </div>
          </div>

          {/* RIGHT: Recent Donations Panel (desktop) */}
          <aside className="hidden lg:block">
            <div className="sticky top-8">
              <Card className="overflow-hidden border-0 shadow-xl shadow-gold-500/5">
                <Card.Header className="border-b border-gray-100 bg-gradient-to-r from-gold-50 to-saffron-50 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Card.Title className="text-base font-bold text-gray-800">
                        รายการล่าสุด
                      </Card.Title>
                      <Card.Description className="text-xs text-gray-400">
                        อัพเดทแบบ Realtime
                      </Card.Description>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-1">
                      <span className="relative flex size-2">
                        <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex size-2 rounded-full bg-green-500" />
                      </span>
                      <span className="text-[11px] font-semibold text-green-600">LIVE</span>
                    </div>
                  </div>
                </Card.Header>
                <Card.Content className="max-h-[calc(100vh-200px)] overflow-y-auto px-4 py-3">
                  <DonationTicker
                    activities={activities}
                    newActivityId={newActivityId}
                  />
                </Card.Content>
              </Card>
            </div>
          </aside>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative border-t border-gold-100/50 py-6 text-center text-xs font-light text-gray-400">
        ระบบบริหารจัดการงานผ้าป่า
      </footer>
    </div>
  );
}

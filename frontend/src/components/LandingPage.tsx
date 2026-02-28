"use client";

import { useRealtimeDonations } from "@/hooks/useRealtimeDonations";
import { AnimatedCounter } from "./AnimatedCounter";
import { DonationTicker } from "./DonationTicker";
import { Card, Chip, Separator } from "@heroui/react";
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
  GraduationCap,
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
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-white font-[var(--font-sarabun)]">

      {/* ─── Ambient glow ─── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 size-[600px] -translate-x-1/2 rounded-full bg-gold-300 opacity-[0.12] blur-[180px]" />
        <div className="absolute bottom-0 right-0 size-80 rounded-full bg-saffron-400 opacity-[0.07] blur-[120px]" />
      </div>

      {/* ─── School Banner Header ─── */}
      <header className="relative border-b border-amber-200/60 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Logo + Title */}
            <div className="flex items-center gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-gold-500 to-amber-600 shadow-lg shadow-gold-500/30">
                <GraduationCap className="size-7 text-white" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-gold-600">
                  บุญผ้าป่าสามัคคี
                </p>
                <h1 className="text-lg font-extrabold leading-tight text-gray-900 sm:text-xl">
                  {event.name}
                </h1>
              </div>
            </div>

            {/* Meta + Status */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
              {event.event_date && (
                <span className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5">
                  <Calendar className="size-3.5 text-gray-400" />
                  {new Date(event.event_date).toLocaleDateString("th-TH", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              )}
              {event.location && (
                <span className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5">
                  <LocationArrow className="size-3.5 text-gray-400" />
                  {event.location}
                </span>
              )}
              <Chip
                size="sm"
                variant="soft"
                color={event.is_active ? "success" : "default"}
              >
                <span className="flex items-center gap-1.5">
                  {event.is_active && (
                    <span className="relative flex size-1.5">
                      <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex size-1.5 rounded-full bg-green-500" />
                    </span>
                  )}
                  {event.is_active ? "เปิดรับบริจาค" : "ปิดรับแล้ว"}
                </span>
              </Chip>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Main Content ─── */}
      <main className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:py-14">
        <div className="grid gap-6 lg:grid-cols-[1fr_380px] lg:gap-10">

          {/* ══ LEFT COLUMN ══ */}
          <div className="flex flex-col gap-6">

            {/* ── Hero Amount Card ── */}
            <div className="animate-fade-in-up">
              <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-gold-500 via-amber-500 to-saffron-500 p-6 shadow-2xl shadow-gold-500/20 transition-all duration-700 sm:p-10 ${summaryFlash ? "ring-4 ring-white/60" : ""}`}>
                {/* decorative circles */}
                <div className="absolute -right-10 -top-10 size-40 rounded-full bg-white opacity-5" />
                <div className="absolute -bottom-6 -left-6 size-32 rounded-full bg-white opacity-5" />

                <p className="mb-2 text-sm font-bold uppercase tracking-[0.3em] text-amber-100">
                  ยอดรวมสุทธิ
                </p>

                <div className="relative flex items-end gap-3">
                  <AnimatedCounter
                    value={netAmount}
                    prefix="฿"
                    className="text-4xl font-black tracking-tight text-white drop-shadow-sm sm:text-6xl md:text-7xl lg:text-8xl"
                  />
                  {summaryFlash && (
                    <span className="animate-count-up mb-2 rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
                      อัพเดท!
                    </span>
                  )}
                </div>

                {targetAmount > 0 && (
                  <div className="mt-6">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-medium text-amber-100">
                        เป้าหมาย {fmtCurrency(targetAmount)}
                      </span>
                      <span className="rounded-full bg-white/20 px-3 py-0.5 text-sm font-bold text-white">
                        {netPercent.toFixed(1)}%
                      </span>
                    </div>
                    <div className="relative h-3 overflow-hidden rounded-full bg-white/20">
                      <div
                        className="h-full rounded-full bg-white shadow-sm transition-all duration-[2000ms] ease-out"
                        style={{ width: `${Math.min(netPercent, 100)}%` }}
                      />
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{
                          background:
                            "linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.25) 50%,transparent 100%)",
                          backgroundSize: "200% 100%",
                          animation: "shimmer 2.5s infinite",
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Stats Row ── */}
            <div
              className="animate-fade-in-up grid grid-cols-2 gap-3 sm:grid-cols-4"
              style={{ animationDelay: "0.15s" }}
            >
              {/* ผู้บริจาค */}
              <Card className="border border-amber-100 shadow-sm">
                <Card.Content className="flex flex-col items-center gap-1 py-5 text-center">
                  <div className="mb-1 flex size-10 items-center justify-center rounded-xl bg-gold-100">
                    <Persons className="size-5 text-gold-700" />
                  </div>
                  <p className="text-2xl font-black text-gray-900 sm:text-3xl">
                    <AnimatedCounter value={totalDonors} duration={800} decimals={0} />
                  </p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">ผู้บริจาค</p>
                </Card.Content>
              </Card>

              {/* ซองผ้าป่า */}
              <Card className="border border-purple-100 shadow-sm">
                <Card.Content className="flex flex-col items-center gap-1 py-5 text-center">
                  <div className="mb-1 flex size-10 items-center justify-center rounded-xl bg-purple-100">
                    <Envelope className="size-5 text-purple-600" />
                  </div>
                  <p className="text-2xl font-black text-gray-900 sm:text-3xl">
                    {envelopesReceived}
                    <span className="text-base font-normal text-gray-400">/{totalEnvelopes}</span>
                  </p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">ซองผ้าป่า</p>
                </Card.Content>
              </Card>

              {/* เฉลี่ย/คน */}
              <Card className="border border-saffron-100 shadow-sm">
                <Card.Content className="flex flex-col items-center gap-1 py-5 text-center">
                  <div className="mb-1 flex size-10 items-center justify-center rounded-xl bg-saffron-100">
                    <ChartColumnStacked className="size-5 text-saffron-600" />
                  </div>
                  <p className="text-2xl font-black text-gray-900 sm:text-3xl">
                    {totalDonors > 0
                      ? new Intl.NumberFormat("th-TH", { maximumFractionDigits: 0 }).format(totalDonated / totalDonors)
                      : "—"}
                  </p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">เฉลี่ย/คน</p>
                </Card.Content>
              </Card>

              {/* สถานะ */}
              <Card className={`border shadow-sm ${event.is_active ? "border-green-100" : "border-gray-100"}`}>
                <Card.Content className="flex flex-col items-center gap-1 py-5 text-center">
                  <div className={`mb-1 flex size-10 items-center justify-center rounded-xl ${event.is_active ? "bg-green-100" : "bg-gray-100"}`}>
                    <CircleCheck className={`size-5 ${event.is_active ? "text-green-600" : "text-gray-400"}`} />
                  </div>
                  <p className={`text-xl font-black sm:text-2xl ${event.is_active ? "text-green-600" : "text-gray-400"}`}>
                    {event.is_active ? "เปิดรับ" : "ปิดแล้ว"}
                  </p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">สถานะ</p>
                </Card.Content>
              </Card>
            </div>

            {/* ── Financial Breakdown ── */}
            <div
              className="animate-fade-in-up"
              style={{ animationDelay: "0.3s" }}
            >
              <Card className={`overflow-hidden shadow-md transition-all duration-500 ${summaryFlash ? "ring-2 ring-gold-400" : ""}`}>
                <Card.Header className="px-5 pb-0 pt-5">
                  <div className="flex items-center justify-between">
                    <Card.Title className="text-base font-bold text-gray-800">
                      สรุปการเงิน
                    </Card.Title>
                    <div className="flex items-center gap-2">
                      {summaryFlash && (
                        <Chip size="sm" variant="soft" color="success">
                          อัพเดท!
                        </Chip>
                      )}
                      <Chip size="sm" variant="soft" color="success">
                        <span className="flex items-center gap-1">
                          <span className="relative flex size-1.5">
                            <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-400 opacity-75" />
                            <span className="relative inline-flex size-1.5 rounded-full bg-green-500" />
                          </span>
                          LIVE
                        </span>
                      </Chip>
                    </div>
                  </div>
                </Card.Header>
                <Card.Content className="px-5 pb-5 pt-4">
                  <div className="space-y-0">
                    {[
                      { icon: <CircleDollar className="size-4 text-gold-700" />, bg: "bg-gold-100", label: "ยอดบริจาค", amount: fmtCurrency(totalDonated), color: "text-gray-900" },
                      { icon: <Envelope className="size-4 text-purple-600" />, bg: "bg-purple-100", label: `เงินจากซองผ้าป่า (${envelopesReceived} ซอง)`, amount: fmtCurrency(totalEnvelopeAmount), color: "text-gray-900" },
                      { icon: <ChartColumn className="size-4 text-green-600" />, bg: "bg-green-100", label: "รายรับอื่นๆ", amount: fmtCurrency(totalIncome), color: "text-gray-900" },
                    ].map((row, i) => (
                      <div key={i}>
                        <div className="flex items-center justify-between py-3">
                          <div className="flex items-center gap-3">
                            <div className={`flex size-8 items-center justify-center rounded-lg ${row.bg}`}>{row.icon}</div>
                            <span className="text-sm text-gray-600">{row.label}</span>
                          </div>
                          <span className={`text-sm font-semibold ${row.color}`}>{row.amount}</span>
                        </div>
                        <Separator />
                      </div>
                    ))}

                    {/* รายจ่าย */}
                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-red-100">
                          <Receipt className="size-4 text-red-500" />
                        </div>
                        <span className="text-sm text-gray-600">รายจ่าย</span>
                      </div>
                      <span className="text-sm font-semibold text-red-500">−{fmtCurrency(totalExpenses)}</span>
                    </div>

                    {/* ยอดสุทธิ */}
                    <div className="mt-1 flex items-center justify-between rounded-2xl bg-gradient-to-r from-gold-50 to-amber-50 px-4 py-4">
                      <span className="text-base font-bold text-gray-800">ยอดสุทธิ</span>
                      <span className="text-xl font-black text-gray-900">{fmtCurrency(netAmount)}</span>
                    </div>
                  </div>
                </Card.Content>
              </Card>
            </div>

            {/* ── Mobile: Activities ── */}
            <div className="lg:hidden">
              <div className="mb-3 flex items-center gap-2">
                <span className="relative flex size-2.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-green-500" />
                </span>
                <h2 className="text-base font-bold text-gray-800">รายการล่าสุด</h2>
                <Chip size="sm" variant="soft" color="success">LIVE</Chip>
              </div>
              <DonationTicker activities={activities} newActivityId={newActivityId} />
            </div>
          </div>

          {/* ══ RIGHT COLUMN — Activity Feed (desktop) ══ */}
          <aside className="hidden lg:block">
            <div className="sticky top-6">
              <Card className="overflow-hidden shadow-xl shadow-gray-200/60">
                <Card.Header className="border-b border-gray-100 bg-gradient-to-r from-gold-50 to-amber-50 px-5 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Card.Title className="text-base font-bold text-gray-800">
                        รายการล่าสุด
                      </Card.Title>
                      <Card.Description className="text-xs text-gray-400">
                        อัพเดทแบบ Realtime
                      </Card.Description>
                    </div>
                    <Chip size="sm" variant="soft" color="success">
                      <span className="flex items-center gap-1.5">
                        <span className="relative flex size-1.5">
                          <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-400 opacity-75" />
                          <span className="relative inline-flex size-1.5 rounded-full bg-green-500" />
                        </span>
                        LIVE
                      </span>
                    </Chip>
                  </div>
                </Card.Header>
                <Card.Content className="max-h-[calc(100vh-220px)] overflow-y-auto px-4 py-3">
                  <DonationTicker activities={activities} newActivityId={newActivityId} />
                </Card.Content>
              </Card>
            </div>
          </aside>

        </div>
      </main>

      {/* ─── Footer ─── */}
      <footer className="relative mt-8 border-t border-gray-100 py-5 text-center">
        <p className="text-xs font-medium text-gray-400">
          ระบบบริหารจัดการงานผ้าป่า · Realtime Donation System
        </p>
      </footer>
    </div>
  );
}

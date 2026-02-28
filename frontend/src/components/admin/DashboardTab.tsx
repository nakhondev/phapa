"use client";

import { Card } from "@heroui/react";
import {
  CircleDollar,
  Persons,
  Envelope,
  ChartColumn,
  Receipt,
  CircleCheck,
} from "@gravity-ui/icons";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import type { EventSummary } from "@/lib/types";

interface DashboardTabProps {
  summary: EventSummary | null;
}

export function DashboardTab({ summary }: DashboardTabProps) {
  const s = summary;
  const totalDonated = s?.total_donated || 0;
  const totalEnvelopeAmount = s?.total_envelope_amount || 0;
  const totalIncome = s?.total_income || 0;
  const totalExpenses = s?.total_expenses || 0;
  const netAmount = totalDonated + totalEnvelopeAmount + totalIncome - totalExpenses;
  const targetAmount = s?.target_amount || 0;
  const netPercent = targetAmount > 0 ? Math.round((netAmount / targetAmount) * 10000) / 100 : 0;

  const stats = [
    {
      label: "ยอดบริจาครวม",
      value: totalDonated,
      isCurrency: true,
      decimals: 2,
      icon: CircleDollar,
      iconBg: "bg-gold-100",
      iconColor: "text-gold-700",
    },
    {
      label: "จำนวนผู้บริจาค",
      value: s?.total_donors || 0,
      isCurrency: false,
      decimals: 0,
      suffix: " คน",
      icon: Persons,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      label: "เงินจากซองผ้าป่า",
      value: totalEnvelopeAmount,
      isCurrency: true,
      decimals: 2,
      suffix: ` (${s?.envelopes_received || 0}/${s?.total_envelopes || 0} ซอง)`,
      icon: Envelope,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      label: "รายรับอื่นๆ",
      value: totalIncome,
      isCurrency: true,
      decimals: 2,
      icon: ChartColumn,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      label: "รายจ่าย",
      value: totalExpenses,
      isCurrency: true,
      decimals: 2,
      icon: Receipt,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
    },
    {
      label: "ถึงเป้าหมาย",
      value: netPercent,
      isCurrency: false,
      decimals: 1,
      suffix: "%",
      icon: CircleCheck,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
  ];

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-gray-900 sm:mb-6 sm:text-2xl">ภาพรวม</h1>

      {/* Stats Grid */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:mb-8 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-4 sm:p-5">
              <Card.Content className="flex items-start gap-3 sm:gap-4">
                <div
                  className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${stat.iconBg}`}
                >
                  <Icon className={`size-5 ${stat.iconColor}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="mt-1 text-xl font-bold text-gray-900 sm:text-2xl">
                    {stat.isCurrency ? (
                      <>
                        <span className="text-base font-semibold text-gray-400">
                          ฿
                        </span>
                        <AnimatedCounter value={stat.value} duration={800} decimals={stat.decimals} />
                        {stat.suffix && (
                          <span className="ml-1 text-xs font-normal text-gray-400">
                            {stat.suffix}
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        <AnimatedCounter value={stat.value} duration={800} decimals={stat.decimals} />
                        {stat.suffix && (
                          <span className="text-sm font-normal text-gray-400">
                            {stat.suffix}
                          </span>
                        )}
                      </>
                    )}
                  </p>
                </div>
              </Card.Content>
            </Card>
          );
        })}
      </div>

      {/* Net Summary */}
      <Card className="bg-gradient-to-r from-gold-50 to-saffron-50 p-4 sm:p-6">
        <Card.Content className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 sm:text-sm">ยอดสุทธิ (บริจาค + ซองผ้าป่า + รายรับอื่นๆ - รายจ่าย)</p>
            <p className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
              <span className="text-lg font-semibold text-gray-400">฿</span>
              <AnimatedCounter value={netAmount} duration={1000} />
            </p>
          </div>
          {targetAmount > 0 && (
            <div className="sm:text-right">
              <p className="text-sm text-gray-500">เป้าหมาย</p>
              <p className="text-lg font-bold text-gold-700">
                ฿
                {new Intl.NumberFormat("th-TH", {
                  minimumFractionDigits: 2,
                }).format(targetAmount)}
              </p>
            </div>
          )}
        </Card.Content>
        {targetAmount > 0 && (
          <div className="px-4 pb-4 sm:px-6 sm:pb-6">
            <div className="mb-1.5 flex items-center justify-between text-xs text-gray-500">
              <span>ความคืบหน้า</span>
              <span className="font-bold text-gold-700">{netPercent.toFixed(1)}%</span>
            </div>
            <div className="relative overflow-hidden rounded-full bg-white/60">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-gold-400 via-gold-500 to-saffron-500 shadow-sm shadow-gold-400/40 transition-all duration-[1500ms] ease-out"
                style={{ width: `${Math.min(netPercent, 100)}%` }}
              />
              <div
                className="pointer-events-none absolute inset-0 rounded-full"
                style={{
                  background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 2.5s infinite",
                }}
              />
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

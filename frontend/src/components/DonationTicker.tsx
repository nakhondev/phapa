"use client";

import { Person, Envelope, ChartColumn } from "@gravity-ui/icons";
import type { ActivityItem } from "@/lib/types";

interface ActivityTickerProps {
  activities: ActivityItem[];
  newActivityId: string | null;
}

const TYPE_CONFIG = {
  donation: {
    label: "บริจาค",
    bg: "bg-gold-100",
    bgNew: "bg-gold-500",
    text: "text-gold-700",
    amountColor: "text-gray-800",
    amountColorNew: "text-gold-600",
    ringColor: "ring-gold-400",
    highlightBg: "bg-gold-100",
  },
  envelope: {
    label: "ซองผ้าป่า",
    bg: "bg-purple-100",
    bgNew: "bg-purple-500",
    text: "text-purple-600",
    amountColor: "text-gray-800",
    amountColorNew: "text-purple-600",
    ringColor: "ring-purple-400",
    highlightBg: "bg-purple-50",
  },
  income: {
    label: "รายรับ",
    bg: "bg-green-100",
    bgNew: "bg-green-500",
    text: "text-green-600",
    amountColor: "text-gray-800",
    amountColorNew: "text-green-600",
    ringColor: "ring-green-400",
    highlightBg: "bg-green-50",
  },
  expense: {
    label: "รายจ่าย",
    bg: "bg-red-100",
    bgNew: "bg-red-500",
    text: "text-red-500",
    amountColor: "text-red-500",
    amountColorNew: "text-red-600",
    ringColor: "ring-red-400",
    highlightBg: "bg-red-50",
  },
};

function ActivityIcon({ type, className }: { type: ActivityItem["type"]; className?: string }) {
  switch (type) {
    case "donation":
      return <Person className={className} />;
    case "envelope":
      return <Envelope className={className} />;
    case "income":
      return <ChartColumn className={className} />;
    default:
      return <Person className={className} />;
  }
}

export function DonationTicker({ activities, newActivityId }: ActivityTickerProps) {
  const formatAmount = (amount: number) =>
    new Intl.NumberFormat("th-TH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-2.5">
      {activities.map((item) => {
        const isNew = newActivityId === item.id;
        const cfg = TYPE_CONFIG[item.type];
        return (
          <div
            key={`${item.type}-${item.id}`}
            className={`flex items-center justify-between rounded-xl px-3 py-2.5 transition-all duration-500 sm:px-4 sm:py-3 ${
              isNew
                ? `animate-fade-in-up ${cfg.highlightBg} ring-2 ${cfg.ringColor}`
                : "bg-white/60 backdrop-blur-sm"
            }`}
          >
            <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3">
              <div
                className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold sm:size-10 sm:text-sm ${
                  isNew
                    ? `${cfg.bgNew} text-white`
                    : `${cfg.bg} ${cfg.text}`
                }`}
              >
                {item.type === "donation" && item.name !== "ผู้ไม่ประสงค์ออกนาม" ? (
                  item.name.charAt(0).toUpperCase()
                ) : (
                  <ActivityIcon type={item.type} className="size-4 sm:size-5" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900 sm:text-base">
                  {item.name}
                </p>
                <p className="flex items-center gap-1.5 text-[11px] text-gray-500 sm:text-xs">
                  <span className={`rounded px-1 py-0.5 text-[9px] font-semibold ${cfg.bg} ${cfg.text}`}>
                    {cfg.label}
                  </span>
                  {item.detail && <span>{item.detail}</span>}
                  <span>· {formatTime(item.timestamp)}</span>
                </p>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <p
                className={`text-sm font-bold sm:text-base ${
                  isNew ? `${cfg.amountColorNew} sm:text-lg` : cfg.amountColor
                }`}
              >
                ฿{formatAmount(item.amount)}
              </p>
            </div>
          </div>
        );
      })}
      {activities.length === 0 && (
        <div className="py-8 text-center text-sm text-gray-400">
          ยังไม่มีรายการ
        </div>
      )}
    </div>
  );
}

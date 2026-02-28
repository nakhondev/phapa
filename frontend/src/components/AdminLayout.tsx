"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import {
  House,
  CircleDollar,
  Envelope,
  ChartColumn,
  Receipt,
  Gear,
  ArrowRightFromSquare,
  Person,
  Bars,
  Xmark,
} from "@gravity-ui/icons";
import { useAuth } from "@/lib/auth";
import type { Event } from "@/lib/types";

type AdminTab =
  | "dashboard"
  | "donations"
  | "envelopes"
  | "income"
  | "expenses"
  | "team"
  | "settings";

interface AdminLayoutProps {
  event: Event;
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  children: ReactNode;
}

const NAV_ITEMS: { id: AdminTab; label: string; icon: typeof House }[] = [
  { id: "dashboard", label: "ภาพรวม", icon: House },
  { id: "donations", label: "การบริจาค", icon: CircleDollar },
  { id: "envelopes", label: "ซองผ้าป่า", icon: Envelope },
  { id: "income", label: "รายรับ", icon: ChartColumn },
  { id: "expenses", label: "รายจ่าย", icon: Receipt },
  { id: "team", label: "ทีมงาน", icon: Person },
  { id: "settings", label: "ตั้งค่างาน", icon: Gear },
];

export function AdminLayout({
  event,
  activeTab,
  onTabChange,
  children,
}: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleTabChange = (tab: AdminTab) => {
    onTabChange(tab);
    setSidebarOpen(false);
  };

  const sidebarContent = (
    <>
      {/* Logo area */}
      <div className="border-b border-gray-100 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-gold-400 to-gold-600">
            <CircleDollar className="size-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-gray-900">
              {event.name}
            </p>
            <p className="text-xs text-gray-400">ระบบจัดการงานผ้าป่า</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                isActive
                  ? "bg-gold-50 text-gold-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon
                className={`size-[18px] shrink-0 ${
                  isActive ? "text-gold-600" : "text-gray-400"
                }`}
              />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Bottom: User + Landing link */}
      <div className="border-t border-gray-100 px-3 py-4 space-y-2">
        <Link
          href={`/?event=${event.id}`}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700"
        >
          <House className="size-[18px] text-gray-400" />
          ดูหน้าบริจาค
        </Link>
        <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-gold-100 text-[10px] font-bold text-gold-700">
            {user?.display_name?.charAt(0) || "A"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-gray-700">
              {user?.display_name || "Admin"}
            </p>
            <p className="truncate text-[10px] text-gray-400">
              {user?.role || "เจ้าหน้าที่"}
            </p>
          </div>
          <button
            onClick={logout}
            className="rounded p-1 text-gray-400 hover:text-red-500"
            title="ออกจากระบบ"
          >
            <ArrowRightFromSquare className="size-4" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center gap-3 border-b border-gray-200 bg-white px-4 lg:hidden">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex size-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100"
        >
          {sidebarOpen ? (
            <Xmark className="size-5" />
          ) : (
            <Bars className="size-5" />
          )}
        </button>
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-md bg-gradient-to-br from-gold-400 to-gold-600">
            <CircleDollar className="size-4 text-white" />
          </div>
          <span className="truncate text-sm font-semibold text-gray-800">
            {NAV_ITEMS.find((i) => i.id === activeTab)?.label || "ภาพรวม"}
          </span>
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - desktop: always visible, mobile: slide-in */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-200 bg-white transition-transform duration-300 ease-in-out lg:z-30 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Main content */}
      <main className="w-full pt-14 lg:ml-64 lg:pt-0">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}

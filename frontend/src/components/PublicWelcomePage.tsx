"use client";

import Link from "next/link";
import { Button, Card } from "@heroui/react";
import { CircleDollar, ChartLine, PersonWorker, Bell } from "@gravity-ui/icons";

export function PublicWelcomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gold-50 via-white to-saffron-50">
      <header className="border-b border-gold-100 bg-white/80 px-6 py-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-gold-400 to-gold-600">
              <CircleDollar className="size-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">ผ้าป่า</h1>
              <p className="text-xs text-gray-500">ระบบบริหารจัดการงานผ้าป่า</p>
            </div>
          </div>
          <Link href="/admin">
            <Button className="bg-gold-500 text-white hover:bg-gold-600">
              เข้าสู่ระบบ
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-16">
        <div className="mb-16 text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex size-24 items-center justify-center rounded-3xl bg-gradient-to-br from-gold-400 to-gold-600 shadow-lg shadow-gold-200">
              <CircleDollar className="size-12 text-white" />
            </div>
          </div>
          <h2 className="mb-4 text-4xl font-bold text-gray-900">
            ระบบบริหารจัดการ<br />
            <span className="text-gold-600">งานผ้าป่า</span>
          </h2>
          <p className="mx-auto max-w-xl text-lg text-gray-500">
            ติดตามยอดบริจาค จัดการซอง และดูสถิติงานผ้าป่าของคุณแบบ Realtime
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link href="/admin">
              <Button className="bg-gold-500 px-8 text-white hover:bg-gold-600">
                จัดการงาน
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <Card className="p-6 text-center">
            <Card.Content className="flex flex-col items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-green-100">
                <ChartLine className="size-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">ติดตาม Realtime</h3>
              <p className="text-sm text-gray-500">ดูยอดบริจาคและสถิติแบบสดๆ ไม่ต้องรีเฟรช</p>
            </Card.Content>
          </Card>

          <Card className="p-6 text-center">
            <Card.Content className="flex flex-col items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-gold-100">
                <CircleDollar className="size-6 text-gold-600" />
              </div>
              <h3 className="font-semibold text-gray-900">จัดการซองผ้าป่า</h3>
              <p className="text-sm text-gray-500">ติดตามสถานะซองแต่ละใบ พร้อมยอดเงินที่รับ</p>
            </Card.Content>
          </Card>

          <Card className="p-6 text-center">
            <Card.Content className="flex flex-col items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-blue-100">
                <PersonWorker className="size-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">จัดการทีม</h3>
              <p className="text-sm text-gray-500">เพิ่มสมาชิกทีม กำหนดสิทธิ์การเข้าถึง</p>
            </Card.Content>
          </Card>
        </div>
      </main>

      <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
        ระบบบริหารจัดการงานผ้าป่า — สำหรับผู้ดูแลระบบเท่านั้น
      </footer>
    </div>
  );
}

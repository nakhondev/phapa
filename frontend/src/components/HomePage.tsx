"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, Card, AlertDialog, toast } from "@heroui/react";
import { ClientSpinner } from "./ClientSpinner";
import {
  Plus,
  CircleDollar,
  Calendar,
  LocationArrow,
  CircleCheck,
  TrashBin,
} from "@gravity-ui/icons";
import { api } from "@/lib/api";
import type { Event } from "@/lib/types";

export function HomePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    target_amount: "",
    event_date: "",
    location: "",
  });

  useEffect(() => {
    api
      .getEvents()
      .then(setEvents)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string, close: () => void) => {
    setDeleting(id);
    try {
      await api.deleteEvent(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
      close();
      toast.success("ลบงานสำเร็จ");
    } catch {
      toast.danger("ลบงานไม่สำเร็จ");
    } finally {
      setDeleting(null);
    }
  };

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    setCreating(true);
    try {
      const newEvent = await api.createEvent({
        name: form.name,
        description: form.description || null,
        target_amount: parseFloat(form.target_amount) || 0,
        event_date: form.event_date || null,
        location: form.location || null,
      });
      setEvents((prev) => [newEvent, ...prev]);
      setForm({
        name: "",
        description: "",
        target_amount: "",
        event_date: "",
        location: "",
      });
      setShowCreate(false);
    } catch {
      toast.danger("สร้างงานไม่สำเร็จ");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gold-50 via-white to-saffron-50">
        <ClientSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gold-50 via-white to-saffron-50">
      <header className="border-b border-gold-100 bg-white/80 px-6 py-6 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-gold-400 to-gold-600">
              <CircleDollar className="size-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                ระบบบริหารจัดการงานผ้าป่า
              </h1>
              <p className="text-xs text-gray-500">
                เลือกงานผ้าป่าเพื่อดูหรือจัดการ
              </p>
            </div>
          </div>
          <Button
            className="bg-gold-500 text-white hover:bg-gold-600"
            onPress={() => setShowCreate(!showCreate)}
          >
            <Plus className="size-4" />
            สร้างงานใหม่
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        {showCreate && (
          <Card className="mb-8 animate-fade-in-up p-6">
            <Card.Header>
              <Card.Title>สร้างงานผ้าป่าใหม่</Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    ชื่องาน *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    className="w-full rounded-lg border px-4 py-2 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-200"
                    placeholder="เช่น งานผ้าป่าสามัคคี วัดพระธาตุ"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    รายละเอียด
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                    className="w-full rounded-lg border px-4 py-2 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-200"
                    rows={2}
                    placeholder="รายละเอียดงานผ้าป่า..."
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    เป้าหมาย (บาท)
                  </label>
                  <input
                    type="number"
                    value={form.target_amount}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, target_amount: e.target.value }))
                    }
                    className="w-full rounded-lg border px-4 py-2 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-200"
                    placeholder="100000"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    วันที่จัดงาน
                  </label>
                  <input
                    type="date"
                    value={form.event_date}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, event_date: e.target.value }))
                    }
                    className="w-full rounded-lg border px-4 py-2 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-200"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    สถานที่
                  </label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, location: e.target.value }))
                    }
                    className="w-full rounded-lg border px-4 py-2 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-200"
                    placeholder="เช่น วัดพระธาตุ จ.เชียงใหม่"
                  />
                </div>
              </div>
            </Card.Content>
            <Card.Footer className="mt-4 flex justify-end gap-2">
              <Button variant="ghost" onPress={() => setShowCreate(false)}>
                ยกเลิก
              </Button>
              <Button
                className="bg-gold-500 text-white hover:bg-gold-600"
                isPending={creating}
                onPress={handleCreate}
              >
                {creating ? "กำลังสร้าง..." : "สร้างงาน"}
              </Button>
            </Card.Footer>
          </Card>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((ev) => (
            <Card
              key={ev.id}
              className="group transition-all hover:shadow-lg"
            >
              <Card.Header className="p-5">
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className={`inline-block size-2.5 rounded-full ${
                      ev.is_active ? "bg-green-500" : "bg-gray-400"
                    }`}
                  />
                  <span className="text-xs text-gray-500">
                    {ev.is_active ? "กำลังดำเนินการ" : "ปิดแล้ว"}
                  </span>
                </div>
                <Card.Title>{ev.name}</Card.Title>
                {ev.description && (
                  <Card.Description>{ev.description}</Card.Description>
                )}
              </Card.Header>
              <Card.Content className="px-5">
                <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                  {ev.event_date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3.5 text-gray-400" />
                      {new Date(ev.event_date).toLocaleDateString("th-TH", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  )}
                  {ev.location && (
                    <span className="flex items-center gap-1">
                      <LocationArrow className="size-3.5 text-gray-400" />
                      {ev.location}
                    </span>
                  )}
                </div>
                {ev.target_amount > 0 && (
                  <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-gold-700">
                    <CircleCheck className="size-4 text-gold-500" />
                    เป้าหมาย ฿
                    {new Intl.NumberFormat("th-TH").format(ev.target_amount)}
                  </p>
                )}
              </Card.Content>
              <Card.Footer className="flex gap-2 p-5">
                <Link
                  href={`/?event=${ev.id}`}
                  className="flex-1 rounded-lg bg-gold-500 px-4 py-2 text-center text-sm font-medium text-white hover:bg-gold-600"
                >
                  ดูหน้าบริจาค
                </Link>
                <Link
                  href={`/admin?event=${ev.id}`}
                  className="flex-1 rounded-lg border px-4 py-2 text-center text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  จัดการ
                </Link>
                <AlertDialog>
                  <AlertDialog.Trigger>
                    <Button variant="danger" isIconOnly size="sm" className="shrink-0">
                      <TrashBin className="size-4" />
                    </Button>
                  </AlertDialog.Trigger>
                  <AlertDialog.Backdrop>
                    <AlertDialog.Container size="sm" placement="center">
                      <AlertDialog.Dialog>
                        {({ close }) => (
                          <>
                            <AlertDialog.Header>
                              <AlertDialog.Icon status="danger" />
                              <AlertDialog.Heading>ลบงานผ้าป่า?</AlertDialog.Heading>
                            </AlertDialog.Header>
                            <AlertDialog.Body>
                              <p className="text-sm text-gray-500">
                                ต้องการลบ &ldquo;{ev.name}&rdquo; ใช่ไหม?
                                ข้อมูลทั้งหมดจะถูกลบอย่างถาวร ไม่สามารถกู้คืนได้
                              </p>
                            </AlertDialog.Body>
                            <AlertDialog.Footer>
                              <Button slot="close" variant="ghost">ยกเลิก</Button>
                              <Button
                                variant="danger"
                                isPending={deleting === ev.id}
                                onPress={() => handleDelete(ev.id, close)}
                              >
                                {deleting === ev.id ? "กำลังลบ..." : "ลบงาน"}
                              </Button>
                            </AlertDialog.Footer>
                          </>
                        )}
                      </AlertDialog.Dialog>
                    </AlertDialog.Container>
                  </AlertDialog.Backdrop>
                </AlertDialog>
              </Card.Footer>
            </Card>
          ))}
        </div>

        {events.length === 0 && !showCreate && (
          <div className="py-20 text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex size-20 items-center justify-center rounded-3xl bg-gold-100">
                <CircleDollar className="size-10 text-gold-500" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-gray-700">
              ยังไม่มีงานผ้าป่า
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              กดปุ่ม &quot;สร้างงานใหม่&quot; เพื่อเริ่มต้น
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

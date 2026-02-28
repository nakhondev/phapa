"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Button,
  Card,
  Modal,
  TextField,
  Label,
  Input,
} from "@heroui/react";
import { ClientSpinner } from "../ClientSpinner";
import {
  Plus,
  TrashBin,
  Envelope as EnvelopeIcon,
  ChevronDown,
  ChevronUp,
  CircleCheck,
  Clock,
  ArrowUturnCcwRight,
} from "@gravity-ui/icons";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Envelope } from "@/lib/types";

interface EnvelopesTabProps {
  eventId: string;
  onDataChange: () => void;
}

interface RouteSummary {
  name: string;
  total: number;
  received: number;
  pending: number;
  returned: number;
  totalAmount: number;
  envelopes: Envelope[];
}

const STATUS_CONFIG: Record<
  Envelope["status"],
  { label: string; bg: string; text: string; icon: typeof CircleCheck }
> = {
  pending: { label: "ส่งออก", bg: "bg-amber-100", text: "text-amber-700", icon: Clock },
  received: { label: "นำกลับ", bg: "bg-green-100", text: "text-green-700", icon: CircleCheck },
  returned: { label: "คืนเปล่า", bg: "bg-gray-100", text: "text-gray-600", icon: ArrowUturnCcwRight },
};

const STATUSES: Envelope["status"][] = ["pending", "received", "returned"];

export function EnvelopesTab({ eventId, onDataChange }: EnvelopesTabProps) {
  const { user } = useAuth();
  const [envelopes, setEnvelopes] = useState<Envelope[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [expandedRoutes, setExpandedRoutes] = useState<Set<string>>(new Set());

  // Bulk create form state
  const [routeName, setRouteName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [startNo, setStartNo] = useState("1");
  const [prefix, setPrefix] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Return prompt state (shown when changing status to "received")
  const [amountPrompt, setAmountPrompt] = useState<{ id: string; name: string } | null>(null);
  const [promptAmount, setPromptAmount] = useState("");
  const [promptPaymentType, setPromptPaymentType] = useState<"cash" | "transfer">("cash");
  const [promptSaving, setPromptSaving] = useState(false);

  const fetchEnvelopes = useCallback(async () => {
    try {
      const data = await api.getEnvelopes(eventId);
      setEnvelopes(data);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchEnvelopes();
  }, [fetchEnvelopes]);

  // Group envelopes by route
  const routeSummaries = useMemo<RouteSummary[]>(() => {
    const groups = new Map<string, Envelope[]>();
    for (const env of envelopes) {
      const key = env.route_name || "ทั่วไป";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(env);
    }
    return Array.from(groups.entries()).map(([name, envs]) => ({
      name,
      total: envs.length,
      received: envs.filter((e) => e.status === "received").length,
      pending: envs.filter((e) => e.status === "pending").length,
      returned: envs.filter((e) => e.status === "returned").length,
      totalAmount: envs
        .filter((e) => e.status === "received")
        .reduce((sum, e) => sum + Number(e.amount), 0),
      envelopes: envs,
    }));
  }, [envelopes]);

  // Existing route names for quick-select
  const existingRoutes = useMemo(
    () => [...new Set(envelopes.map((e) => e.route_name).filter(Boolean))],
    [envelopes]
  );

  // Overall stats
  const overallStats = useMemo(() => {
    const total = envelopes.length;
    const received = envelopes.filter((e) => e.status === "received").length;
    const pending = envelopes.filter((e) => e.status === "pending").length;
    const totalAmount = envelopes
      .filter((e) => e.status === "received")
      .reduce((sum, e) => sum + Number(e.amount), 0);
    return { total, received, pending, totalAmount, routes: routeSummaries.length };
  }, [envelopes, routeSummaries]);

  const toggleRoute = (name: string) => {
    setExpandedRoutes((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const resetForm = () => {
    setRouteName("");
    setQuantity("");
    setStartNo("1");
    setPrefix("");
    setError("");
  };

  const handleSubmit = async (close: () => void) => {
    const qty = parseInt(quantity);
    if (!qty || qty < 1) {
      setError("กรุณาระบุจำนวนซอง");
      return;
    }
    if (qty > 500) {
      setError("สร้างได้สูงสุด 500 ซองต่อครั้ง");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await api.createEnvelopesBulk({
        event_id: eventId,
        route_name: routeName.trim() || "ทั่วไป",
        quantity: qty,
        start_no: parseInt(startNo) || 1,
        prefix: prefix.trim(),
      });
      resetForm();
      fetchEnvelopes();
      onDataChange();
      close();
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (
    id: string,
    newStatus: Envelope["status"],
    envelope?: Envelope
  ) => {
    // If changing to "received", prompt for amount + payment type
    if (newStatus === "received" && envelope) {
      setAmountPrompt({ id, name: envelope.donor_name || envelope.envelope_no });
      setPromptAmount(envelope.amount > 0 ? String(envelope.amount) : "");
      setPromptPaymentType("cash");
      return;
    }
    try {
      const updateData: Record<string, unknown> = { status: newStatus };
      if (newStatus !== "received") {
        updateData.amount = 0;
        updateData.payment_type = null;
      }
      if (user) updateData.processed_by = user.display_name;
      await api.updateEnvelope(id, updateData as Partial<Envelope>);
      fetchEnvelopes();
      onDataChange();
    } catch {
      /* ignore */
    }
  };

  const handleAmountSubmit = async () => {
    if (!amountPrompt) return;
    const amt = parseFloat(promptAmount);
    if (isNaN(amt) || amt <= 0) return;
    setPromptSaving(true);
    try {
      const updateData: Record<string, unknown> = {
        status: "received",
        amount: amt,
        payment_type: promptPaymentType,
      };
      if (user) updateData.processed_by = user.display_name;
      await api.updateEnvelope(amountPrompt.id, updateData as Partial<Envelope>);
      fetchEnvelopes();
      onDataChange();
      setAmountPrompt(null);
      setPromptAmount("");
    } catch {
      /* ignore */
    } finally {
      setPromptSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("ต้องการลบซองนี้?")) return;
    setDeleting(id);
    try {
      await api.deleteEnvelope(id);
      fetchEnvelopes();
      onDataChange();
    } catch {
      /* ignore */
    } finally {
      setDeleting(null);
    }
  };

  const fmt = (n: number) =>
    new Intl.NumberFormat("th-TH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <ClientSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 sm:mb-6">
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
          ซองผ้าป่า
        </h1>
        <Modal>
          <Button className="bg-gold-500 text-white hover:bg-gold-600">
            <Plus className="size-4" />
            เพิ่มซอง
          </Button>
          <Modal.Backdrop>
            <Modal.Container placement="center">
              <Modal.Dialog className="max-h-[90vh] overflow-y-auto sm:max-w-[480px]">
                {({ close }) => (
                <>
                <Modal.CloseTrigger />
                <Modal.Header>
                  <Modal.Heading>เพิ่มซองผ้าป่า</Modal.Heading>
                </Modal.Header>
                <Modal.Body>
                  <div className="space-y-4">
                    {error && (
                      <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                        {error}
                      </div>
                    )}
                    {/* Route name */}
                    <div>
                      <p className="mb-2 text-sm font-medium text-gray-700">
                        สาย
                      </p>
                      {existingRoutes.length > 0 && (
                        <div className="mb-2 flex flex-wrap gap-1.5">
                          {existingRoutes.map((r) => (
                            <button
                              key={r}
                              type="button"
                              onClick={() => setRouteName(r)}
                              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                                routeName === r
                                  ? "bg-gold-500 text-white"
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                              }`}
                            >
                              {r}
                            </button>
                          ))}
                        </div>
                      )}
                      <TextField value={routeName} onChange={setRouteName}>
                        <Input placeholder="ชื่อสาย เช่น สาย 1, สายบ้านนา" />
                      </TextField>
                    </div>
                    <TextField
                      isRequired
                      value={quantity}
                      onChange={setQuantity}
                    >
                      <Label>จำนวนซองที่ส่งออก</Label>
                      <Input
                        placeholder="เช่น 20, 50"
                        type="number"
                        inputMode="numeric"
                      />
                    </TextField>
                    <div className="grid grid-cols-2 gap-3">
                      <TextField value={startNo} onChange={setStartNo}>
                        <Label>เลขเริ่มต้น</Label>
                        <Input
                          placeholder="1"
                          type="number"
                          inputMode="numeric"
                        />
                      </TextField>
                      <TextField value={prefix} onChange={setPrefix}>
                        <Label>คำนำหน้า (ถ้ามี)</Label>
                        <Input placeholder="เช่น A-" />
                      </TextField>
                    </div>
                    {quantity && parseInt(quantity) > 0 && (
                      <div className="rounded-lg bg-gold-50 px-4 py-3 text-sm text-gold-800">
                        <p className="font-medium">ตัวอย่างเลขซอง:</p>
                        <p className="mt-1 font-mono text-xs text-gold-600">
                          {(() => {
                            const start = parseInt(startNo) || 1;
                            const pfx = prefix.trim();
                            const qty = Math.min(parseInt(quantity), 3);
                            const samples = [];
                            for (let i = 0; i < qty; i++) {
                              samples.push(
                                pfx + String(start + i).padStart(3, "0")
                              );
                            }
                            const total = parseInt(quantity);
                            if (total > 3) {
                              samples.push("...");
                              samples.push(
                                pfx +
                                  String(start + total - 1).padStart(3, "0")
                              );
                            }
                            return samples.join(", ");
                          })()}
                        </p>
                      </div>
                    )}
                  </div>
                </Modal.Body>
                <Modal.Footer>
                  <Button slot="close" variant="ghost">ยกเลิก</Button>
                  <Button
                    className="bg-gold-500 text-white hover:bg-gold-600"
                    isPending={submitting}
                    onPress={() => handleSubmit(close)}
                  >
                    {submitting ? "กำลังบันทึก..." : "บันทึก"}
                  </Button>
                </Modal.Footer>
                </>
                )}
              </Modal.Dialog>
            </Modal.Container>
          </Modal.Backdrop>
        </Modal>
      </div>

      {/* Overall Summary Cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <Card className="p-4">
          <Card.Content className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-purple-100">
              <EnvelopeIcon className="size-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">
                {overallStats.routes}
              </p>
              <p className="text-xs text-gray-400">สาย</p>
            </div>
          </Card.Content>
        </Card>
        <Card className="p-4">
          <Card.Content className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-100">
              <Clock className="size-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">
                {overallStats.total}
              </p>
              <p className="text-xs text-gray-400">ซองทั้งหมด</p>
            </div>
          </Card.Content>
        </Card>
        <Card className="p-4">
          <Card.Content className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-green-100">
              <CircleCheck className="size-5 text-green-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">
                {overallStats.received}
              </p>
              <p className="text-xs text-gray-400">นำกลับแล้ว</p>
            </div>
          </Card.Content>
        </Card>
        <Card className="p-4">
          <Card.Content className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gold-100">
              <EnvelopeIcon className="size-5 text-gold-700" />
            </div>
            <div>
              <p className="text-xl font-bold text-gold-700">
                ฿{fmt(overallStats.totalAmount)}
              </p>
              <p className="text-xs text-gray-400">ยอดเงินรวม</p>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Routes */}
      {routeSummaries.length === 0 ? (
        <Card className="py-16 text-center">
          <Card.Content className="flex flex-col items-center gap-3">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-gray-100">
              <EnvelopeIcon className="size-7 text-gray-400" />
            </div>
            <p className="text-gray-500">ยังไม่มีซอง กดปุ่ม "เพิ่มซอง" เพื่อเริ่มต้น</p>
          </Card.Content>
        </Card>
      ) : (
        <div className="space-y-4">
          {routeSummaries.map((route) => {
            const isExpanded = expandedRoutes.has(route.name);
            const returnedPercent =
              route.total > 0
                ? Math.round((route.received / route.total) * 100)
                : 0;

            return (
              <Card key={route.name} className="overflow-hidden">
                {/* Route Header — clickable */}
                <button
                  className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-gray-50 sm:p-5"
                  onClick={() => toggleRoute(route.name)}
                >
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 text-sm font-bold text-white shadow-sm">
                    {route.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-base font-bold text-gray-900">
                        {route.name}
                      </h3>
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                        {route.total} ซอง
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-2 flex items-center gap-3">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-500"
                          style={{ width: `${returnedPercent}%` }}
                        />
                      </div>
                      <span className="shrink-0 text-xs font-semibold text-green-600">
                        {returnedPercent}%
                      </span>
                    </div>
                  </div>
                  {/* Route stats */}
                  <div className="hidden gap-4 text-center sm:flex">
                    <div>
                      <p className="text-lg font-bold text-amber-600">
                        {route.pending}
                      </p>
                      <p className="text-[10px] text-gray-400">ส่งออก</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-green-600">
                        {route.received}
                      </p>
                      <p className="text-[10px] text-gray-400">นำกลับ</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gold-600">
                        ฿{fmt(route.totalAmount)}
                      </p>
                      <p className="text-[10px] text-gray-400">ยอดเงิน</p>
                    </div>
                  </div>
                  <div className="shrink-0 text-gray-400">
                    {isExpanded ? (
                      <ChevronUp className="size-5" />
                    ) : (
                      <ChevronDown className="size-5" />
                    )}
                  </div>
                </button>

                {/* Mobile stats — shown below header on small screens */}
                <div className="flex border-t border-gray-100 sm:hidden">
                  <div className="flex flex-1 flex-col items-center border-r border-gray-100 py-2">
                    <p className="text-sm font-bold text-amber-600">
                      {route.pending}
                    </p>
                    <p className="text-[10px] text-gray-400">ส่งออก</p>
                  </div>
                  <div className="flex flex-1 flex-col items-center border-r border-gray-100 py-2">
                    <p className="text-sm font-bold text-green-600">
                      {route.received}
                    </p>
                    <p className="text-[10px] text-gray-400">นำกลับ</p>
                  </div>
                  <div className="flex flex-1 flex-col items-center py-2">
                    <p className="text-sm font-bold text-gold-600">
                      ฿{fmt(route.totalAmount)}
                    </p>
                    <p className="text-[10px] text-gray-400">ยอดเงิน</p>
                  </div>
                </div>

                {/* Expanded envelope list */}
                {isExpanded && (
                  <div className="border-t border-gray-100">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="bg-gray-50 text-xs uppercase text-gray-500">
                            <th className="px-4 py-2.5 sm:px-5">ซองที่</th>
                            <th className="px-4 py-2.5 sm:px-5">ผู้รับซอง</th>
                            <th className="px-4 py-2.5 sm:px-5">ยอดเงิน</th>
                            <th className="px-4 py-2.5 sm:px-5">สถานะ</th>
                            <th className="hidden px-4 py-2.5 sm:table-cell sm:px-5">
                              หมายเหตุ
                            </th>
                            <th className="hidden px-4 py-2.5 md:table-cell sm:px-5">
                              ผู้ทำรายการ
                            </th>
                            <th className="px-4 py-2.5 text-right sm:px-5">
                              จัดการ
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {route.envelopes.map((env) => {
                            const sCfg = STATUS_CONFIG[env.status];
                            return (
                              <tr
                                key={env.id}
                                className="transition-colors hover:bg-gray-50"
                              >
                                <td className="px-4 py-2.5 font-mono text-sm font-semibold text-gray-900 sm:px-5">
                                  {env.envelope_no}
                                </td>
                                <td className="px-4 py-2.5 sm:px-5">
                                  <p className="text-gray-900">
                                    {env.donor_name || "—"}
                                  </p>
                                  {env.donor_phone && (
                                    <p className="text-xs text-gray-400">
                                      {env.donor_phone}
                                    </p>
                                  )}
                                </td>
                                <td className="px-4 py-2.5 font-semibold text-gold-600 sm:px-5">
                                  {env.status === "received"
                                    ? `฿${fmt(env.amount)}`
                                    : "—"}
                                </td>
                                <td className="px-4 py-2.5 sm:px-5">
                                  <select
                                    value={env.status}
                                    onChange={(e) =>
                                      handleStatusChange(
                                        env.id,
                                        e.target.value as Envelope["status"],
                                        env
                                      )
                                    }
                                    className={`rounded-lg border-0 px-2 py-1 text-xs font-medium ${sCfg.bg} ${sCfg.text}`}
                                  >
                                    {STATUSES.map((s) => (
                                      <option key={s} value={s}>
                                        {STATUS_CONFIG[s].label}
                                      </option>
                                    ))}
                                  </select>
                                </td>
                                <td className="hidden max-w-[150px] truncate px-4 py-2.5 text-gray-500 sm:table-cell sm:px-5">
                                  {env.note || "—"}
                                </td>
                                <td className="hidden px-4 py-2.5 text-xs text-gray-500 md:table-cell sm:px-5">
                                  {env.processed_by || "—"}
                                </td>
                                <td className="px-4 py-2.5 text-right sm:px-5">
                                  <Button
                                    isIconOnly
                                    variant="ghost"
                                    size="sm"
                                    isPending={deleting === env.id}
                                    onPress={() => handleDelete(env.id)}
                                  >
                                    <TrashBin className="size-4 text-red-500" />
                                  </Button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Return Prompt Modal — shown when changing status to "received" */}
      {amountPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900">ซองนำกลับ</h3>
            <p className="mt-1 text-sm text-gray-500">
              ซอง <span className="font-semibold text-gray-700">{amountPrompt.name}</span> นำกลับมาได้เงินเท่าไหร่?
            </p>
            <div className="mt-4 space-y-4">
              <TextField
                value={promptAmount}
                onChange={setPromptAmount}
                autoFocus
              >
                <Label>จำนวนเงิน (บาท)</Label>
                <Input
                  placeholder="0.00"
                  type="number"
                  inputMode="decimal"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAmountSubmit();
                  }}
                />
              </TextField>
              <div>
                <p className="mb-2 text-sm font-medium text-gray-700">ประเภทเงิน</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPromptPaymentType("cash")}
                    className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                      promptPaymentType === "cash"
                        ? "bg-green-100 text-green-700 ring-2 ring-green-500 ring-offset-1"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    💵 เงินสด
                  </button>
                  <button
                    type="button"
                    onClick={() => setPromptPaymentType("transfer")}
                    className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                      promptPaymentType === "transfer"
                        ? "bg-blue-100 text-blue-700 ring-2 ring-blue-500 ring-offset-1"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    📱 โอน
                  </button>
                </div>
              </div>
              {user && (
                <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
                  <div className="flex size-6 items-center justify-center rounded-full bg-gold-100 text-[10px] font-bold text-gold-700">
                    {user.display_name.charAt(0)}
                  </div>
                  <span className="text-xs text-gray-500">
                    ผู้ทำรายการ: <span className="font-semibold text-gray-700">{user.display_name}</span>
                  </span>
                </div>
              )}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button
                variant="ghost"
                onPress={() => {
                  setAmountPrompt(null);
                  setPromptAmount("");
                }}
              >
                ยกเลิก
              </Button>
              <Button
                className="bg-green-600 text-white hover:bg-green-700"
                isPending={promptSaving}
                onPress={handleAmountSubmit}
              >
                {promptSaving ? "กำลังบันทึก..." : "บันทึก"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

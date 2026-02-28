"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Button,
  Card,
  Modal,
  TextField,
  NumberField,
  Switch,
  Label,
  Input,
  AlertDialog,
  toast,
} from "@heroui/react";
import { ClientSpinner } from "../ClientSpinner";
import { Plus, TrashBin, Person } from "@gravity-ui/icons";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Donation } from "@/lib/types";

interface DonationsTabProps {
  eventId: string;
  onDataChange: () => void;
}

export function DonationsTab({ eventId, onDataChange }: DonationsTabProps) {
  const { user } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // Form state
  const [donorName, setDonorName] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [note, setNote] = useState("");
  const [donationType, setDonationType] = useState("cash");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchDonations = useCallback(async () => {
    try {
      const data = await api.getDonations(eventId);
      setDonations(data);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchDonations();
  }, [fetchDonations]);

  const resetForm = () => {
    setDonorName("");
    setDonorPhone("");
    setAmount(0);
    setNote("");
    setDonationType("cash");
    setIsAnonymous(false);
  };

  const handleSubmit = async (close: () => void) => {
    if (!donorName.trim() || amount <= 0) {
      toast.warning("กรุณากรอกชื่อผู้บริจาคและจำนวนเงิน");
      return;
    }
    setSubmitting(true);
    try {
      await api.createDonation({
        event_id: eventId,
        donor_name: donorName.trim(),
        donor_phone: donorPhone.trim() || null,
        amount,
        note: note.trim() || null,
        donation_type: donationType as Donation["donation_type"],
        is_anonymous: isAnonymous,
        processed_by: user?.display_name || null,
      });
      resetForm();
      fetchDonations();
      onDataChange();
      close();
      toast.success("บันทึกรายการบริจาคสำเร็จ");
    } catch (err) {
      toast.danger(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async (close: () => void) => {
    if (!deleteTarget) return;
    setDeleting(deleteTarget);
    try {
      await api.deleteDonation(deleteTarget);
      fetchDonations();
      onDataChange();
      toast.success("ลบรายการสำเร็จ");
      close();
    } catch {
      toast.danger("ลบรายการไม่สำเร็จ");
    } finally {
      setDeleting(null);
      setDeleteTarget(null);
    }
  };

  const fmt = (n: number) =>
    new Intl.NumberFormat("th-TH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);

  const fmtDate = (s: string) =>
    new Date(s).toLocaleString("th-TH", {
      dateStyle: "short",
      timeStyle: "short",
    });

  const typeLabel = (t: string) =>
    t === "cash" ? "เงินสด" : t === "transfer" ? "โอนเงิน" : "อื่นๆ";

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 sm:mb-6">
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">การบริจาค</h1>
        <Modal>
          <Button className="bg-gold-500 text-white hover:bg-gold-600">
            <Plus className="size-4" />
            เพิ่มรายการ
          </Button>
          <Modal.Backdrop>
            <Modal.Container placement="center">
              <Modal.Dialog className="max-h-[90vh] overflow-y-auto sm:max-w-[480px]">
                {({ close }) => (
                  <>
                    <Modal.CloseTrigger />
                    <Modal.Header>
                      <Modal.Heading>เพิ่มรายการบริจาค</Modal.Heading>
                    </Modal.Header>
                    <Modal.Body>
                      <div className="space-y-4">
                        <TextField isRequired value={donorName} onChange={setDonorName}>
                          <Label>ชื่อผู้บริจาค</Label>
                          <Input placeholder="กรอกชื่อผู้บริจาค" />
                        </TextField>
                        <TextField value={donorPhone} onChange={setDonorPhone}>
                          <Label>เบอร์โทรศัพท์</Label>
                          <Input placeholder="0xx-xxx-xxxx" />
                        </TextField>
                        <NumberField
                          isRequired
                          value={amount}
                          onChange={(v) => setAmount(v ?? 0)}
                          minValue={1}
                          formatOptions={{ style: "currency", currency: "THB" }}
                        >
                          <Label>จำนวนเงิน (บาท)</Label>
                          <NumberField.Group>
                            <NumberField.DecrementButton />
                            <NumberField.Input />
                            <NumberField.IncrementButton />
                          </NumberField.Group>
                        </NumberField>
                        <div>
                          <p className="mb-2 text-sm font-medium text-gray-700">ประเภท</p>
                          <div className="flex gap-2">
                            {(
                              [
                                { value: "cash", label: "เงินสด" },
                                { value: "transfer", label: "โอนเงิน" },
                                { value: "other", label: "อื่นๆ" },
                              ] as const
                            ).map((opt) => (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => setDonationType(opt.value)}
                                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                                  donationType === opt.value
                                    ? "bg-gold-500 text-white"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        <TextField value={note} onChange={setNote}>
                          <Label>หมายเหตุ</Label>
                          <Input placeholder="หมายเหตุเพิ่มเติม" />
                        </TextField>
                        <Switch isSelected={isAnonymous} onChange={setIsAnonymous}>
                          <Switch.Control>
                            <Switch.Thumb />
                          </Switch.Control>
                          <Switch.Content>
                            <Label className="text-sm">ไม่ประสงค์ออกนาม</Label>
                          </Switch.Content>
                        </Switch>
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

      {loading ? (
        <div className="flex justify-center py-12">
          <ClientSpinner size="lg" />
        </div>
      ) : (
        <Card>
          <Card.Content className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-xs uppercase text-gray-500">
                    <th className="px-5 py-3">ผู้บริจาค</th>
                    <th className="px-5 py-3">จำนวนเงิน</th>
                    <th className="hidden px-5 py-3 md:table-cell">ประเภท</th>
                    <th className="hidden px-5 py-3 sm:table-cell">หมายเหตุ</th>
                    <th className="hidden px-5 py-3 lg:table-cell">วันที่</th>
                    <th className="hidden px-5 py-3 md:table-cell">ผู้ทำรายการ</th>
                    <th className="px-5 py-3 text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {donations.map((d) => (
                    <tr key={d.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gold-100 text-xs font-bold text-gold-700">
                            {d.is_anonymous ? (
                              <Person className="size-4" />
                            ) : (
                              d.donor_name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {d.is_anonymous
                                ? "ผู้ไม่ประสงค์ออกนาม"
                                : d.donor_name}
                            </p>
                            {d.donor_phone && (
                              <p className="text-xs text-gray-400">
                                {d.donor_phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 font-semibold text-gold-600">
                        ฿{fmt(d.amount)}
                      </td>
                      <td className="hidden px-5 py-3 md:table-cell">
                        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                          {typeLabel(d.donation_type)}
                        </span>
                      </td>
                      <td className="hidden max-w-[200px] truncate px-5 py-3 text-gray-500 sm:table-cell">
                        {d.note || "—"}
                      </td>
                      <td className="hidden px-5 py-3 text-gray-400 lg:table-cell">
                        {fmtDate(d.created_at)}
                      </td>
                      <td className="hidden px-5 py-3 text-xs text-gray-500 md:table-cell">
                        {d.processed_by || "—"}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Button
                          isIconOnly
                          variant="ghost"
                          size="sm"
                          isPending={deleting === d.id}
                          onPress={() => setDeleteTarget(d.id)}
                        >
                          <TrashBin className="size-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {donations.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-5 py-12 text-center text-gray-400"
                      >
                        ยังไม่มีรายการบริจาค
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card.Content>
        </Card>
      )}
      <AlertDialog isOpen={deleteTarget !== null} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialog.Backdrop>
          <AlertDialog.Container size="sm" placement="center">
            <AlertDialog.Dialog>
              {({ close }) => (
                <>
                  <AlertDialog.Header>
                    <AlertDialog.Icon status="danger" />
                    <AlertDialog.Heading>ลบรายการบริจาค?</AlertDialog.Heading>
                  </AlertDialog.Header>
                  <AlertDialog.Body>
                    <p className="text-sm text-gray-500">ต้องการลบรายการนี้ใช่ไหม? ไม่สามารถกู้คืนได้</p>
                  </AlertDialog.Body>
                  <AlertDialog.Footer>
                    <Button slot="close" variant="ghost">ยกเลิก</Button>
                    <Button variant="danger" isPending={deleting !== null} onPress={() => confirmDelete(close)}>ลบ</Button>
                  </AlertDialog.Footer>
                </>
              )}
            </AlertDialog.Dialog>
          </AlertDialog.Container>
        </AlertDialog.Backdrop>
      </AlertDialog>
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Button,
  Card,
  Modal,
  TextField,
  NumberField,
  Label,
  Input,
} from "@heroui/react";
import { ClientSpinner } from "../ClientSpinner";
import { Plus, TrashBin } from "@gravity-ui/icons";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Expense } from "@/lib/types";

interface ExpensesTabProps {
  eventId: string;
  onDataChange: () => void;
}

const EXPENSE_CATEGORIES = [
  "ค่าอาหาร",
  "ค่าเครื่องดื่ม",
  "ค่าเช่าสถานที่",
  "ค่าเวที/เครื่องเสียง",
  "ค่าดอกไม้/ธูปเทียน",
  "ค่าพิมพ์เอกสาร",
  "ค่าขนส่ง",
  "ค่าใช้จ่ายอื่นๆ",
];

export function ExpensesTab({ eventId, onDataChange }: ExpensesTabProps) {
  const { user } = useAuth();
  const [items, setItems] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [expenseDate, setExpenseDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [receiptNo, setReceiptNo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchItems = useCallback(async () => {
    try {
      const data = await api.getExpenses(eventId);
      setItems(data);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const resetForm = () => {
    setCategory(EXPENSE_CATEGORIES[0]);
    setDescription("");
    setAmount(0);
    setExpenseDate(new Date().toISOString().split("T")[0]);
    setReceiptNo("");
    setError("");
  };

  const handleSubmit = async (close: () => void) => {
    if (!category || amount <= 0) {
      setError("กรุณากรอกหมวดหมู่และจำนวนเงิน");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await api.createExpense({
        event_id: eventId,
        category,
        description: description.trim() || null,
        amount,
        expense_date: expenseDate,
        receipt_no: receiptNo.trim() || null,
        processed_by: user?.display_name || null,
      });
      resetForm();
      fetchItems();
      onDataChange();
      close();
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("ต้องการลบรายการนี้?")) return;
    setDeleting(id);
    try {
      await api.deleteExpense(id);
      fetchItems();
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

  const fmtDate = (s: string) =>
    new Date(s).toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const totalExpenses = items.reduce((sum, i) => sum + Number(i.amount), 0);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 sm:mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">รายจ่าย</h1>
          <p className="text-sm text-gray-500">
            รวม{" "}
            <span className="font-semibold text-red-600">฿{fmt(totalExpenses)}</span>
          </p>
        </div>
        <Modal>
          <Button variant="danger">
            <Plus className="size-4" />
            เพิ่มรายจ่าย
          </Button>
          <Modal.Backdrop>
            <Modal.Container placement="center">
              <Modal.Dialog className="max-h-[90vh] overflow-y-auto sm:max-w-[480px]">
                {({ close }) => (
                  <>
                    <Modal.CloseTrigger />
                    <Modal.Header>
                      <Modal.Heading>เพิ่มรายจ่าย</Modal.Heading>
                    </Modal.Header>
                    <Modal.Body>
                      <div className="space-y-4">
                        {error && (
                          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                            {error}
                          </div>
                        )}
                        <div>
                          <p className="mb-2 text-sm font-medium text-gray-700">หมวดหมู่</p>
                          <div className="flex flex-wrap gap-2">
                            {EXPENSE_CATEGORIES.map((cat) => (
                              <button
                                key={cat}
                                type="button"
                                onClick={() => setCategory(cat)}
                                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                                  category === cat
                                    ? "bg-red-500 text-white"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                              >
                                {cat}
                              </button>
                            ))}
                          </div>
                        </div>
                        <TextField value={description} onChange={setDescription}>
                          <Label>รายละเอียด</Label>
                          <Input placeholder="รายละเอียดเพิ่มเติม" />
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
                        <TextField value={expenseDate} onChange={setExpenseDate}>
                          <Label>วันที่จ่าย</Label>
                          <Input type="date" />
                        </TextField>
                        <TextField value={receiptNo} onChange={setReceiptNo}>
                          <Label>เลขที่ใบเสร็จ</Label>
                          <Input placeholder="เลขที่ใบเสร็จ (ถ้ามี)" />
                        </TextField>
                      </div>
                    </Modal.Body>
                    <Modal.Footer>
                      <Button slot="close" variant="ghost">ยกเลิก</Button>
                      <Button
                        variant="danger"
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
        <div className="flex justify-center py-12"><ClientSpinner size="lg" /></div>
      ) : (
        <Card>
          <Card.Content className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-xs uppercase text-gray-500">
                    <th className="px-5 py-3">หมวดหมู่</th>
                    <th className="px-5 py-3">รายละเอียด</th>
                    <th className="px-5 py-3">จำนวนเงิน</th>
                    <th className="hidden px-5 py-3 sm:table-cell">วันที่</th>
                    <th className="hidden px-5 py-3 md:table-cell">ใบเสร็จ</th>
                    <th className="hidden px-5 py-3 md:table-cell">ผู้ทำรายการ</th>
                    <th className="px-5 py-3 text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3">
                        <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">
                          {item.category}
                        </span>
                      </td>
                      <td className="max-w-[200px] truncate px-5 py-3 text-gray-700">
                        {item.description || "—"}
                      </td>
                      <td className="px-5 py-3 font-semibold text-red-600">
                        ฿{fmt(Number(item.amount))}
                      </td>
                      <td className="hidden px-5 py-3 text-gray-400 sm:table-cell">
                        {fmtDate(item.expense_date)}
                      </td>
                      <td className="hidden px-5 py-3 text-gray-400 md:table-cell">
                        {item.receipt_no || "—"}
                      </td>
                      <td className="hidden px-5 py-3 text-xs text-gray-500 md:table-cell">
                        {item.processed_by || "—"}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Button
                          isIconOnly variant="ghost" size="sm"
                          isPending={deleting === item.id}
                          onPress={() => handleDelete(item.id)}
                        >
                          <TrashBin className="size-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-5 py-12 text-center text-gray-400">
                        ยังไม่มีรายจ่าย
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card.Content>
        </Card>
      )}
    </div>
  );
}

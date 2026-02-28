"use client";

import { useState } from "react";
import {
  Button,
  Modal,
  TextField,
  NumberField,
  Switch,
  Label,
  Input,
} from "@heroui/react";
import { Plus } from "@gravity-ui/icons";
import { api } from "@/lib/api";

interface AddDonationModalProps {
  eventId: string;
  onSuccess?: () => void;
}

export function AddDonationModal({ eventId, onSuccess }: AddDonationModalProps) {
  const [donorName, setDonorName] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [note, setNote] = useState("");
  const [donationType, setDonationType] = useState("cash");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const resetForm = () => {
    setDonorName("");
    setDonorPhone("");
    setAmount(0);
    setNote("");
    setDonationType("cash");
    setIsAnonymous(false);
    setError("");
  };

  const handleSubmit = async (close: () => void) => {
    if (!donorName.trim() || amount <= 0) {
      setError("กรุณากรอกชื่อผู้บริจาคและจำนวนเงิน");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.createDonation({
        event_id: eventId,
        donor_name: donorName.trim(),
        donor_phone: donorPhone.trim() || null,
        amount,
        note: note.trim() || null,
        donation_type: donationType as "cash" | "transfer" | "other",
        is_anonymous: isAnonymous,
      });
      resetForm();
      onSuccess?.();
      close();
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal>
      <Button className="bg-gold-500 text-white hover:bg-gold-600">
        <Plus className="size-4" />
        เพิ่มรายการบริจาค
      </Button>
      <Modal.Backdrop>
        <Modal.Container placement="center">
          <Modal.Dialog className="sm:max-w-[480px]">
            {({ close }) => (
              <>
                <Modal.CloseTrigger />
                <Modal.Header>
                  <Modal.Heading>เพิ่มรายการบริจาค</Modal.Heading>
                </Modal.Header>
                <Modal.Body>
                  <div className="space-y-4">
                    {error && (
                      <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                        {error}
                      </div>
                    )}
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
                      onChange={(val) => setAmount(val ?? 0)}
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
                      <p className="mb-2 text-sm font-medium text-gray-700">ประเภทการบริจาค</p>
                      <div className="flex gap-2">
                        {[
                          { value: "cash", label: "เงินสด" },
                          { value: "transfer", label: "โอนเงิน" },
                          { value: "other", label: "อื่นๆ" },
                        ].map((opt) => (
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
                      <Input placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)" />
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
                    isPending={loading}
                    onPress={() => handleSubmit(close)}
                  >
                    {loading ? "กำลังบันทึก..." : "บันทึก"}
                  </Button>
                </Modal.Footer>
              </>
            )}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}

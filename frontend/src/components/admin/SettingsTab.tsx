"use client";

import { useState } from "react";
import { Button, Card, TextField, NumberField, Label, Input, Switch } from "@heroui/react";
import { Gear } from "@gravity-ui/icons";
import { api } from "@/lib/api";
import type { Event } from "@/lib/types";

interface SettingsTabProps {
  event: Event;
  onEventUpdate: (event: Event) => void;
}

export function SettingsTab({ event, onEventUpdate }: SettingsTabProps) {
  const [name, setName] = useState(event.name);
  const [description, setDescription] = useState(event.description || "");
  const [targetAmount, setTargetAmount] = useState<number>(event.target_amount);
  const [eventDate, setEventDate] = useState(event.event_date || "");
  const [location, setLocation] = useState(event.location || "");
  const [isActive, setIsActive] = useState(event.is_active);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!name.trim()) {
      setError("กรุณากรอกชื่องาน");
      return;
    }
    setSaving(true);
    setError("");
    setSuccess(false);
    try {
      const updated = await api.updateEvent(event.id, {
        name: name.trim(),
        description: description.trim() || null,
        target_amount: targetAmount,
        event_date: eventDate || null,
        location: location.trim() || null,
        is_active: isActive,
      });
      onEventUpdate(updated);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-gray-900 sm:mb-6 sm:text-2xl">ตั้งค่างาน</h1>

      <Card className="w-full max-w-2xl p-4 sm:p-6">
        <Card.Header className="flex-row items-center gap-3 pb-4">
          <div className="flex size-10 items-center justify-center rounded-xl bg-gold-100">
            <Gear className="size-5 text-gold-700" />
          </div>
          <div>
            <Card.Title>ข้อมูลงานผ้าป่า</Card.Title>
            <Card.Description>แก้ไขข้อมูลพื้นฐานของงาน</Card.Description>
          </div>
        </Card.Header>
        <Card.Content className="space-y-5">
          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-600">
              บันทึกสำเร็จ
            </div>
          )}

          <TextField isRequired value={name} onChange={setName}>
            <Label>ชื่องาน</Label>
            <Input placeholder="ชื่องานผ้าป่า" />
          </TextField>

          <TextField value={description} onChange={setDescription}>
            <Label>รายละเอียด</Label>
            <Input placeholder="รายละเอียดงาน" />
          </TextField>

          <NumberField
            value={targetAmount}
            onChange={(v) => setTargetAmount(v ?? 0)}
            minValue={0}
            formatOptions={{ style: "currency", currency: "THB" }}
          >
            <Label>เป้าหมาย (บาท)</Label>
            <NumberField.Group>
              <NumberField.DecrementButton />
              <NumberField.Input />
              <NumberField.IncrementButton />
            </NumberField.Group>
          </NumberField>

          <TextField value={eventDate} onChange={setEventDate}>
            <Label>วันที่จัดงาน</Label>
            <Input type="date" />
          </TextField>

          <TextField value={location} onChange={setLocation}>
            <Label>สถานที่</Label>
            <Input placeholder="สถานที่จัดงาน" />
          </TextField>

          <Switch isSelected={isActive} onChange={setIsActive}>
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
            <Switch.Content>
              <Label className="text-sm">เปิดรับบริจาค</Label>
            </Switch.Content>
          </Switch>
        </Card.Content>
        <Card.Footer className="flex justify-end gap-3 pt-6">
          <Button
            className="bg-gold-500 text-white hover:bg-gold-600"
            isPending={saving}
            onPress={handleSave}
          >
            {saving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
          </Button>
        </Card.Footer>
      </Card>
    </div>
  );
}

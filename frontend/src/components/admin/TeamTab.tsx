"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Button,
  Card,
  Modal,
  TextField,
  Label,
  Input,
  toast,
} from "@heroui/react";
import { ClientSpinner } from "../ClientSpinner";
import { Plus, TrashBin, Person } from "@gravity-ui/icons";
import { api } from "@/lib/api";
import { useAuth, type AuthUser } from "@/lib/auth";

interface TeamTabProps {
  eventId: string;
}

interface TeamMember extends AuthUser {
  email: string;
}

const ROLES = ["เจ้าหน้าที่", "ประธาน", "เหรัญญิก", "กรรมการ", "อาสาสมัคร"];

export function TeamTab({ eventId }: TeamTabProps) {
  const { user } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("เจ้าหน้าที่");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchMembers = useCallback(async () => {
    try {
      const data = await api.getTeamMembers(eventId);
      setMembers(data as TeamMember[]);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setDisplayName("");
    setPhone("");
    setRole("เจ้าหน้าที่");
    setError("");
  };

  const handleSubmit = async (close: () => void) => {
    if (!email.trim() || !password || !displayName.trim()) {
      setError("กรุณากรอก อีเมล, รหัสผ่าน, และชื่อ");
      return;
    }
    if (password.length < 6) {
      setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await api.register({
        email: email.trim(),
        password,
        display_name: displayName.trim(),
        phone: phone.trim() || undefined,
        role,
        event_id: eventId,
      });
      resetForm();
      fetchMembers();
      close();
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (id === user?.id) {
      toast.warning("ไม่สามารถลบตัวเองได้");
      return;
    }
    setDeleting(id);
    try {
      await api.deleteTeamMember(id);
      fetchMembers();
    } catch {
      /* ignore */
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 sm:mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
            ทีมงาน
          </h1>
          <p className="text-sm text-gray-500">
            จัดการบัญชีผู้ใช้ — แต่ละคน login ด้วยอีเมล/รหัสผ่านของตัวเอง
          </p>
        </div>
        <Modal>
          <Button className="bg-gold-500 text-white hover:bg-gold-600">
            <Plus className="size-4" />
            เพิ่มสมาชิก
          </Button>
          <Modal.Backdrop>
            <Modal.Container placement="center">
              <Modal.Dialog className="max-h-[90vh] overflow-y-auto sm:max-w-[420px]">
                {({ close }) => (
                  <>
                    <Modal.CloseTrigger />
                    <Modal.Header>
                      <Modal.Heading>เพิ่มสมาชิกทีม</Modal.Heading>
                    </Modal.Header>
                    <Modal.Body>
                      <div className="space-y-4">
                        {error && (
                          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                            {error}
                          </div>
                        )}
                        <TextField isRequired value={displayName} onChange={setDisplayName}>
                          <Label>ชื่อ-นามสกุล</Label>
                          <Input placeholder="ชื่อที่จะแสดงในระบบ" />
                        </TextField>
                        <TextField isRequired value={email} onChange={setEmail}>
                          <Label>อีเมล (สำหรับ login)</Label>
                          <Input placeholder="example@email.com" type="email" />
                        </TextField>
                        <TextField isRequired value={password} onChange={setPassword}>
                          <Label>รหัสผ่าน</Label>
                          <Input placeholder="อย่างน้อย 6 ตัวอักษร" type="password" />
                        </TextField>
                        <TextField value={phone} onChange={setPhone}>
                          <Label>เบอร์โทรศัพท์</Label>
                          <Input placeholder="0xx-xxx-xxxx" />
                        </TextField>
                        <div>
                          <p className="mb-2 text-sm font-medium text-gray-700">ตำแหน่ง</p>
                          <div className="flex flex-wrap gap-1.5">
                            {ROLES.map((r) => (
                              <button
                                key={r}
                                type="button"
                                onClick={() => setRole(r)}
                                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                                  role === r
                                    ? "bg-gold-500 text-white"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                              >
                                {r}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Modal.Body>
                    <Modal.Footer>
                      <Button slot="close" variant="ghost">ยกเลิก</Button>
                      <Button
                        className="bg-gold-500 text-white hover:bg-gold-600"
                        isPending={submitting}
                        onPress={() => handleSubmit(close)}
                      >
                        {submitting ? "กำลังสร้าง..." : "สร้างบัญชี"}
                      </Button>
                    </Modal.Footer>
                  </>
                )}
              </Modal.Dialog>
            </Modal.Container>
          </Modal.Backdrop>
        </Modal>
      </div>

      {/* Current user info */}
      {user && (
        <div className="mb-6 flex items-center gap-3 rounded-xl bg-green-50 px-4 py-3 ring-1 ring-green-200">
          <div className="flex size-9 items-center justify-center rounded-xl bg-green-500 text-sm font-bold text-white">
            {user.display_name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-green-800">
              คุณกำลังใช้งานเป็น:{" "}
              <span className="text-green-900">{user.display_name}</span>
            </p>
            <p className="text-xs text-green-600">
              {user.role} • {user.email}
            </p>
          </div>
        </div>
      )}

      {/* Members list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <ClientSpinner size="lg" />
        </div>
      ) : members.length === 0 ? (
        <Card className="py-16 text-center">
          <Card.Content className="flex flex-col items-center gap-3">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-gray-100">
              <Person className="size-7 text-gray-400" />
            </div>
            <p className="text-gray-500">
              ยังไม่มีสมาชิกทีม กดปุ่ม &quot;เพิ่มสมาชิก&quot;
            </p>
          </Card.Content>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((m) => {
            const isMe = m.id === user?.id;
            return (
              <Card
                key={m.id}
                className={`transition-all ${
                  isMe ? "ring-2 ring-green-500 bg-green-50/50" : ""
                }`}
              >
                <Card.Content className="p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex size-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                        isMe
                          ? "bg-green-500 text-white"
                          : "bg-gold-100 text-gold-700"
                      }`}
                    >
                      {m.display_name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-semibold text-gray-900">
                          {m.display_name}
                        </p>
                        {isMe && (
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                            คุณ
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{m.role}</p>
                      <p className="truncate text-xs text-gray-400">
                        {m.email}
                      </p>
                      {m.phone && (
                        <p className="text-xs text-gray-400">{m.phone}</p>
                      )}
                    </div>
                    {!isMe && (
                      <Button
                        isIconOnly
                        variant="ghost"
                        size="sm"
                        isPending={deleting === m.id}
                        onPress={() => handleDelete(m.id)}
                      >
                        <TrashBin className="size-4 text-red-400" />
                      </Button>
                    )}
                  </div>
                </Card.Content>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

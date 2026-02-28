"use client";

import { useState } from "react";
import { Button, Card, TextField, Label, Input } from "@heroui/react";
import { ClientSpinner } from "./ClientSpinner";
import { Lock, Envelope } from "@gravity-ui/icons";
import { useAuth } from "@/lib/auth";

interface LoginPageProps {
  onSuccess?: () => void;
}

export function LoginPage({ onSuccess }: LoginPageProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setError("กรุณากรอกอีเมลและรหัสผ่าน");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "เข้าสู่ระบบไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gold-50 via-white to-saffron-50 px-4">
      <Card className="w-full max-w-md p-5 sm:p-8">
        <Card.Header className="flex-col items-center gap-3 pb-6">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-gold-100">
            <Lock className="size-7 text-gold-700" />
          </div>
          <Card.Title className="text-xl">เข้าสู่ระบบจัดการ</Card.Title>
          <Card.Description className="text-center">
            กรอกอีเมลและรหัสผ่านเพื่อเข้าจัดการงานผ้าป่า
          </Card.Description>
        </Card.Header>
        <Card.Content className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}
          <TextField isRequired value={email} onChange={setEmail}>
            <Label>อีเมล</Label>
            <Input placeholder="admin@example.com" type="email" />
          </TextField>
          <TextField isRequired value={password} onChange={setPassword}>
            <Label>รหัสผ่าน</Label>
            <Input
              placeholder="กรอกรหัสผ่าน"
              type="password"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleLogin();
              }}
            />
          </TextField>
        </Card.Content>
        <Card.Footer className="pt-4">
          <Button
            fullWidth
            className="bg-gold-500 text-white hover:bg-gold-600"
            isPending={loading}
            onPress={handleLogin}
          >
            {({ isPending }) => (
              <>
                {isPending ? <ClientSpinner size="sm" /> : null}
                {isPending ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
              </>
            )}
          </Button>
        </Card.Footer>
      </Card>
    </div>
  );
}

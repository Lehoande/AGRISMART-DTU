"use client";
import { useEffect, useState } from "react";
import { CheckCircle2, KeyRound, Lock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { changePassword, disableTwoFactor, enableTwoFactor, getTwoFactorStatus, setupTwoFactor } from "@/lib/api-client";

export function SecuritySettings() {
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [setup, setSetup] = useState<{ secret: string; qr_code: string; expires_in_minutes: number } | null>(null);
  const [code, setCode] = useState("");
  const [disablePassword, setDisablePassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { getTwoFactorStatus().then((result) => setTwoFactorEnabled(result.enabled)).catch(() => {}); }, []);

  const submitPassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) { toast({ title: "Mật khẩu xác nhận không khớp", variant: "destructive" }); return; }
    setLoading(true);
    try {
      const result = await changePassword({ current_password: currentPassword, new_password: newPassword });
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      toast({ title: result.message });
    } catch (error) { toast({ title: "Không đổi được mật khẩu", description: error instanceof Error ? error.message : "Vui lòng thử lại.", variant: "destructive" }); }
    finally { setLoading(false); }
  };

  const startSetup = async () => {
    setLoading(true);
    try { setSetup(await setupTwoFactor()); setCode(""); }
    catch (error) { toast({ title: "Không tạo được mã thiết lập", description: error instanceof Error ? error.message : "Vui lòng thử lại.", variant: "destructive" }); }
    finally { setLoading(false); }
  };

  const confirmSetup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setLoading(true);
    try {
      const result = await enableTwoFactor(code);
      setTwoFactorEnabled(result.enabled); setSetup(null); setCode(""); toast({ title: result.message });
    } catch (error) { toast({ title: "Chưa bật được xác thực hai bước", description: error instanceof Error ? error.message : "Kiểm tra mã rồi thử lại.", variant: "destructive" }); }
    finally { setLoading(false); }
  };

  const turnOff = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setLoading(true);
    try {
      const result = await disableTwoFactor(disablePassword, code);
      setTwoFactorEnabled(result.enabled); setDisablePassword(""); setCode(""); toast({ title: result.message });
    } catch (error) { toast({ title: "Không tắt được xác thực hai bước", description: error instanceof Error ? error.message : "Kiểm tra mật khẩu và mã rồi thử lại.", variant: "destructive" }); }
    finally { setLoading(false); }
  };

  return <>
    <Card className="mb-4 p-6">
      <h3 className="mb-4 flex items-center gap-2 font-bold"><Lock className="size-4 text-green-600"/>Đổi mật khẩu</h3>
      <form onSubmit={submitPassword} className="space-y-3">
        <div><Label htmlFor="security-current-password">Mật khẩu hiện tại</Label><Input id="security-current-password" type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="mt-1" required/></div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div><Label htmlFor="security-new-password">Mật khẩu mới</Label><Input id="security-new-password" type="password" autoComplete="new-password" minLength={8} maxLength={128} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="mt-1" required/></div>
          <div><Label htmlFor="security-confirm-password">Nhập lại mật khẩu mới</Label><Input id="security-confirm-password" type="password" autoComplete="new-password" minLength={8} maxLength={128} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="mt-1" required/></div>
        </div>
        <Button type="submit" disabled={loading}>Cập nhật mật khẩu</Button>
      </form>
    </Card>

    <Card className="p-6">
      <h3 className="mb-2 flex items-center gap-2 font-bold"><Shield className="size-4 text-green-600"/>Xác thực 2 bước</h3>
      <p className="mb-4 text-sm text-stone-600">Dùng ứng dụng xác thực như Google Authenticator, Microsoft Authenticator hoặc 1Password. Mỗi lần đăng nhập cần thêm mã 6 chữ số.</p>
      {twoFactorEnabled ? <>
        <p className="mb-4 flex items-center gap-2 text-sm font-medium text-green-700"><CheckCircle2 className="size-4"/>Đang bật xác thực hai bước</p>
        <form onSubmit={turnOff} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div><Label htmlFor="security-disable-password">Mật khẩu hiện tại</Label><Input id="security-disable-password" type="password" autoComplete="current-password" value={disablePassword} onChange={(event) => setDisablePassword(event.target.value)} className="mt-1" required/></div>
            <div><Label htmlFor="security-disable-code">Mã xác thực</Label><Input id="security-disable-code" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} className="mt-1" required/></div>
          </div>
          <Button type="submit" variant="outline" disabled={loading}>Tắt xác thực hai bước</Button>
        </form>
      </> : setup ? <form onSubmit={confirmSetup} className="space-y-3">
        <div className="flex flex-col items-start gap-3 rounded-xl bg-stone-50 p-4 sm:flex-row sm:items-center">
          <img src={setup.qr_code} alt="Mã QR để thêm AgriSmart vào ứng dụng xác thực" className="size-40 rounded-lg border bg-white p-2"/>
          <div className="text-sm"><p className="mb-2 font-semibold">Quét mã bằng ứng dụng xác thực</p><p>Nếu không quét được, nhập khóa này:</p><code className="mt-1 block break-all rounded bg-white p-2 text-xs">{setup.secret}</code><p className="mt-2 text-xs text-stone-500">Mã thiết lập hết hạn sau {setup.expires_in_minutes} phút.</p></div>
        </div>
        <div className="max-w-xs"><Label htmlFor="security-enable-code">Nhập mã 6 chữ số để xác nhận</Label><Input id="security-enable-code" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} className="mt-1" required/></div>
        <div className="flex gap-2"><Button type="submit" disabled={loading}><KeyRound className="mr-2 size-4"/>Xác nhận và bật</Button><Button type="button" variant="ghost" onClick={() => setSetup(null)}>Hủy</Button></div>
      </form> : <Button type="button" variant="outline" disabled={loading} onClick={() => void startSetup()}>Thiết lập xác thực hai bước</Button>}
    </Card>
  </>;
}

"use client";

import { useEffect, useState } from "react";
import { LockKeyhole, Mail, ShieldCheck, Sprout } from "lucide-react";
import { useNav } from "@/lib/nav-store";
import { clearAuthToken, getAuthToken, getMyProfile, loginApi, verifyLoginTwoFactor } from "@/lib/api-client";
import { AdminDashboardPage, AdminFulfillmentPage, AdminSellerApplicationsPage } from "@/screens/admin/admin";

type AccessState = "checking" | "allowed" | "unauthenticated" | "forbidden";

export default function AdminPage() {
  const currentPage = useNav((state) => state.currentPage);
  const navigate = useNav((state) => state.navigate);
  const [access, setAccess] = useState<AccessState>("checking");
  const [adminRole, setAdminRole] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [challengeToken, setChallengeToken] = useState("");
  const [loginError, setLoginError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const acceptAdmin = (role: string | undefined) => {
    if (["admin", "manager", "staff"].includes(role || "")) {
      setAdminRole(role || null);
      navigate(role === "staff" ? "admin-fulfillment" : "admin-dashboard");
      setAccess("allowed");
      setLoginError("");
      return;
    }
    clearAuthToken();
    setAccess("forbidden");
    setLoginError("Tài khoản này không có quyền quản trị.");
  };

  const submitLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setLoginError("");
    try {
      const result = challengeToken
        ? await verifyLoginTwoFactor(challengeToken, twoFactorCode)
        : await loginApi(email.trim(), password);
      if ("requires_two_factor" in result && result.requires_two_factor) {
        setChallengeToken(result.challenge_token || "");
        return;
      }
      acceptAdmin(result.user?.role);
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Đăng nhập không thành công. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!getAuthToken()) {
      setAccess("unauthenticated");
      return;
    }
    let active = true;
    getMyProfile().then((profile) => {
      if (!active) return;
      if (["admin", "manager", "staff"].includes(profile.role || "")) {
        setAdminRole(profile.role || null);
        const savedAdminPage = ["admin-dashboard", "admin-fulfillment", "admin-sellers"].includes(currentPage);
        navigate(profile.role === "staff" ? "admin-fulfillment" : savedAdminPage ? currentPage : "admin-dashboard");
        setAccess("allowed");
      } else {
        clearAuthToken();
        setAccess("forbidden");
      }
    }).catch(() => {
      if (!active) return;
      clearAuthToken();
      setAccess("unauthenticated");
    });
    return () => { active = false; };
  }, [currentPage, navigate]);

  if (access === "checking") return <main className="grid min-h-screen place-items-center bg-stone-100 text-sm text-stone-600">Đang kiểm tra quyền truy cập…</main>;
  if (access === "unauthenticated" || access === "forbidden") return <main className="grid min-h-screen place-items-center bg-gradient-to-br from-stone-100 via-green-50 to-emerald-100 p-4"><section className="w-full max-w-md rounded-3xl border border-white bg-white/95 p-8 shadow-xl shadow-green-950/10"><div className="mb-7 flex items-center gap-3"><div className="grid size-12 place-items-center rounded-2xl bg-green-700 text-white"><Sprout className="size-7"/></div><div><p className="font-extrabold text-green-900">AgriSmart</p><p className="text-xs text-stone-500">Cổng quản trị riêng</p></div></div><div className="mb-6 flex items-center gap-2 text-sm font-semibold text-green-800"><ShieldCheck className="size-4"/>Đăng nhập dành cho quản trị viên</div><h1 className="text-2xl font-bold">Chào mừng trở lại</h1><p className="mt-2 text-sm text-stone-500">Đăng nhập ngay tại đây để vào hệ thống quản trị.</p><form onSubmit={submitLogin} className="mt-6 space-y-4">{loginError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{loginError}</p>}{!challengeToken ? <><label className="block text-sm font-medium">Email<div className="relative mt-1"><Mail className="absolute left-3 top-3 size-4 text-stone-400"/><input type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} className="h-11 w-full rounded-lg border bg-white pl-10 pr-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100" placeholder="admin@example.com"/></div></label><label className="block text-sm font-medium">Mật khẩu<div className="relative mt-1"><LockKeyhole className="absolute left-3 top-3 size-4 text-stone-400"/><input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className="h-11 w-full rounded-lg border bg-white pl-10 pr-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100" placeholder="Nhập mật khẩu"/></div></label></> : <label className="block text-sm font-medium">Mã xác thực 2 bước<input inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={twoFactorCode} onChange={(event) => setTwoFactorCode(event.target.value.replace(/\D/g, "").slice(0, 6))} className="mt-1 h-11 w-full rounded-lg border px-3 tracking-[0.3em] outline-none focus:border-green-600" placeholder="6 chữ số"/></label>}<button disabled={submitting || (Boolean(challengeToken) && twoFactorCode.length !== 6)} className="h-11 w-full rounded-lg bg-green-700 font-semibold text-white transition hover:bg-green-800 disabled:opacity-60">{submitting ? "Đang xác thực…" : challengeToken ? "Xác nhận và vào quản trị" : "Đăng nhập quản trị"}</button></form><div className="mt-6 flex justify-between border-t pt-4 text-sm"><span className="text-stone-500">Không phải trang bán hàng</span><a className="font-medium text-green-700 hover:underline" href="/">Mở cửa hàng</a></div></section></main>;

  if (adminRole === "staff") return <AdminFulfillmentPage canViewSummary={false} />;
  if (currentPage === "admin-sellers") return <AdminSellerApplicationsPage />;
  return currentPage === "admin-fulfillment" ? <AdminFulfillmentPage /> : <AdminDashboardPage />;
}

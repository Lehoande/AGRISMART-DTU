"use client";
import { useEffect, useState } from "react";
import { Check, ClipboardList, DollarSign, Package, RefreshCw, Sprout, Truck, Users, Warehouse, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNav } from "@/lib/nav-store";
import { confirmBankTransfer, decideSellerApplication, getAdminSellerApplications, getAdminSummary, getMyOrders, updateOrderStatus, type AdminSellerApplication } from "@/lib/api-client";
import { formatPrice } from "@/lib/agri-data";
import { ORDER_STATUS_LABELS, statusLabel } from "@/lib/status-labels";
import { formatShippingAddress } from "@/lib/shipping-address";

type AdminOrder = { id: number; customer_name: string; status: string; total: number; created_at: string; shipping_address: string; payment_method: string; payment_status: string; bank_transfer_claimed_at?: string | null; items: Array<{ product_name: string; quantity: number }> };
type AdminStats = { revenue: number; orders: number; products: number; inventory_units: number; customers: number; topProducts: Array<{ product_name: string; sold: number }> };
const labels = ORDER_STATUS_LABELS;
const nextStatus: Record<string, string> = { pending: "confirmed", confirmed: "shipping", shipping: "completed" };

function AdminShell({ children, canViewSummary = true, canManageSellers = true }: { children: React.ReactNode; canViewSummary?: boolean; canManageSellers?: boolean }) {
  const navigate = useNav((state) => state.navigate);
  const currentPage = useNav((state) => state.currentPage);
  const navClass = (active: boolean) => `w-full rounded-lg px-3 py-2 text-left transition-colors ${active ? "bg-amber-700 text-white" : "text-stone-200 hover:bg-stone-800"}`;
  return <div className="min-h-screen bg-stone-100"><aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-stone-900 text-white lg:flex"><div className="flex items-center gap-2 border-b border-stone-700 p-5"><Sprout className="size-7 text-amber-400"/><b>AgriSmart Admin</b></div><nav className="flex-1 space-y-1 p-3">{canViewSummary && <button aria-current={currentPage === "admin-dashboard" ? "page" : undefined} className={navClass(currentPage === "admin-dashboard")} onClick={() => navigate("admin-dashboard")}>Tổng quan</button>}<button aria-current={currentPage === "admin-fulfillment" ? "page" : undefined} className={navClass(currentPage === "admin-fulfillment")} onClick={() => navigate("admin-fulfillment")}>Đơn hàng & giao vận</button>{canManageSellers && <button aria-current={currentPage === "admin-sellers" ? "page" : undefined} className={navClass(currentPage === "admin-sellers")} onClick={() => navigate("admin-sellers")}>Duyệt gian hàng</button>}</nav></aside><div className="lg:ml-64">{children}</div></div>;
}

export function AdminSellerApplicationsPage({ canManageSellers = true }: { canManageSellers?: boolean } = {}) {
  const { toast } = useToast();
  const [applications, setApplications] = useState<AdminSellerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [workingId, setWorkingId] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try { setApplications(await getAdminSellerApplications("pending")); setError(""); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Không tải được hồ sơ gian hàng"); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  const decide = async (application: AdminSellerApplication, status: "approved" | "rejected") => {
    let note: string | undefined;
    if (status === "rejected") {
      const answer = window.prompt("Lý do từ chối (không bắt buộc):");
      if (answer === null) return;
      note = answer.trim() || undefined;
    }
    setWorkingId(application.user_id);
    try {
      await decideSellerApplication(application.user_id, status, note);
      setApplications((rows) => rows.filter((row) => row.user_id !== application.user_id));
      toast({ title: status === "approved" ? "Đã duyệt gian hàng" : "Đã từ chối hồ sơ", description: application.farm_name });
    } catch (reason) {
      toast({ title: "Không cập nhật được hồ sơ", description: reason instanceof Error ? reason.message : "Vui lòng tải lại và thử lại.", variant: "destructive" });
    } finally { setWorkingId(null); }
  };

  return <AdminShell canManageSellers={canManageSellers}><main className="space-y-5 p-4 lg:p-8"><header className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-2xl font-bold">Duyệt gian hàng</h1><p className="mt-1 text-sm text-stone-500">Xem thông tin đăng ký và quyết định cho phép gian hàng đăng sản phẩm.</p></div><Button variant="outline" onClick={() => void load()} disabled={loading}><RefreshCw className={`mr-2 size-4 ${loading ? "animate-spin" : ""}`}/>Tải lại</Button></header>
    {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {loading && <p className="text-sm text-stone-500">Đang tải hồ sơ…</p>}
    {!loading && !error && applications.length === 0 && <p className="rounded-xl border bg-white p-6 text-sm text-stone-500">Hiện không có hồ sơ nào đang chờ duyệt.</p>}
    <div className="space-y-3">{applications.map((application) => <article key={application.user_id} className="rounded-xl border bg-white p-5"><div className="flex flex-wrap justify-between gap-4"><div><h2 className="text-lg font-bold">{application.farm_name}</h2><p className="mt-1 text-sm text-stone-600">Người đại diện: {application.representative_name}</p><p className="text-sm text-stone-600">{application.email}{application.phone ? ` · ${application.phone}` : ""}</p><p className="mt-1 text-sm text-stone-600">Địa chỉ: {application.farm_address}</p><p className="mt-2 text-xs text-stone-400">Đăng ký lúc {new Date(application.created_at).toLocaleString("vi-VN")}</p></div><Badge className="h-fit bg-amber-100 text-amber-800">Chờ duyệt</Badge></div><div className="mt-4 flex flex-wrap gap-2"><Button disabled={!canManageSellers || workingId === application.user_id} onClick={() => void decide(application, "approved")}><Check className="mr-2 size-4"/>{workingId === application.user_id ? "Đang lưu…" : "Duyệt gian hàng"}</Button><Button variant="outline" className="text-red-700" disabled={!canManageSellers || workingId === application.user_id} onClick={() => void decide(application, "rejected")}><X className="mr-2 size-4"/>Từ chối</Button></div></article>)}</div>
  </main></AdminShell>;
}

export function AdminDashboardPage() {
  const { toast } = useToast();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [confirmingOrderId, setConfirmingOrderId] = useState<number | null>(null);
  useEffect(() => {
    let active = true;
    Promise.all([getAdminSummary(), getMyOrders()]).then(([summary, rows]) => {
      if (active) { setStats(summary); setOrders((rows as AdminOrder[]).slice(0, 8)); }
    }).catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : "Không tải được số liệu quản trị"); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  const confirmTransfer = async (orderId: number) => {
    setConfirmingOrderId(orderId);
    try {
      await confirmBankTransfer(orderId);
      setOrders((current) => current.map((order) => order.id === orderId ? { ...order, payment_status: "paid" } : order));
      toast({ title: `Đã xác nhận thanh toán đơn #${orderId}` });
    } catch (reason) {
      toast({ title: "Không thể xác nhận chuyển khoản", description: reason instanceof Error ? reason.message : "Vui lòng kiểm tra giao dịch rồi thử lại.", variant: "destructive" });
    } finally {
      setConfirmingOrderId(null);
    }
  };
  const cards = [
    { label: "Doanh thu đơn xử lý", value: formatPrice(Number(stats?.revenue || 0)), icon: DollarSign },
    { label: "Tổng đơn", value: String(stats?.orders || 0), icon: ClipboardList },
    { label: "Sản phẩm đang bán", value: String(stats?.products || 0), icon: Package },
    { label: "Tồn kho", value: String(stats?.inventory_units || 0), icon: Warehouse },
    { label: "Khách hàng", value: String(stats?.customers || 0), icon: Users },
  ];
  return <AdminShell><main className="space-y-6 p-4 lg:p-8"><header><h1 className="text-2xl font-bold">Tổng quan hệ thống</h1><p className="text-sm text-stone-500">Số liệu trực tiếp từ cơ sở dữ liệu.</p></header>
    {loading && <p className="text-sm text-stone-500">Đang tải…</p>}{error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{cards.map((card) => <section key={card.label} className="rounded-xl border bg-white p-4"><card.icon className="mb-3 size-5 text-green-700"/><div className="text-xl font-bold">{card.value}</div><div className="text-xs text-stone-500">{card.label}</div></section>)}</div>
    <div className="grid gap-6 xl:grid-cols-2"><section className="rounded-2xl border bg-white p-5"><h2 className="mb-4 text-lg font-bold">Đơn hàng gần đây</h2>{orders.length === 0 && !loading && <p className="text-sm text-stone-500">Chưa có dữ liệu đơn hàng.</p>}<div className="divide-y">{orders.map((order) => <div key={order.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><div><b>#{order.id} · {order.customer_name}</b><div className="text-xs text-stone-500">{new Date(order.created_at).toLocaleString("vi-VN")}</div></div><div className="flex flex-wrap items-center justify-end gap-2"><Badge>{statusLabel(labels, order.status)}</Badge><b>{formatPrice(Number(order.total))}</b>{order.payment_method === "banking" && order.payment_status === "unpaid" && order.status !== "cancelled" && <Button size="sm" variant="outline" disabled={confirmingOrderId === order.id} onClick={() => void confirmTransfer(order.id)}>{confirmingOrderId === order.id ? "Đang xác nhận…" : "Xác nhận thanh toán"}</Button>}</div></div>)}</div><Button className="mt-4" variant="outline" onClick={() => useNav.getState().navigate("admin-fulfillment")}><Truck className="mr-2 size-4"/>Quản lý đơn</Button></section>
      <section className="rounded-2xl border bg-white p-5"><h2 className="mb-4 text-lg font-bold">Sản phẩm bán chạy</h2>{stats?.topProducts?.length ? stats.topProducts.map((product) => <div key={product.product_name} className="flex justify-between border-b py-3 last:border-0"><span>{product.product_name}</span><b>{product.sold} đã bán</b></div>) : <p className="text-sm text-stone-500">Chưa có dữ liệu bán hàng.</p>}</section></div>
  </main></AdminShell>;
}

export function AdminFulfillmentPage({ canViewSummary = true }: { canViewSummary?: boolean } = {}) {
  const { toast } = useToast();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const loadOrders = async () => {
    try { setOrders(await getMyOrders() as AdminOrder[]); setError(""); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Không tải được đơn hàng"); }
    finally { setLoading(false); }
  };
  useEffect(() => { const timer = window.setTimeout(() => { void loadOrders(); }, 0); return () => window.clearTimeout(timer); }, []);
  const moveOrder = async (orderId: number, status: string) => {
    try { await updateOrderStatus(orderId, status); toast({ title: "Đã cập nhật trạng thái đơn" }); await loadOrders(); }
    catch (reason) { toast({ title: "Không thể cập nhật trạng thái", description: reason instanceof Error ? reason.message : "Vui lòng thử lại.", variant: "destructive" }); }
  };
  const confirmTransfer = async (orderId: number) => {
    try { await confirmBankTransfer(orderId); toast({ title: "Đã xác nhận đã nhận tiền" }); await loadOrders(); }
    catch (reason) { toast({ title: "Không thể xác nhận chuyển khoản", description: reason instanceof Error ? reason.message : "Vui lòng kiểm tra giao dịch rồi thử lại.", variant: "destructive" }); }
  };
  return <AdminShell canViewSummary={canViewSummary}><main className="space-y-5 p-4 lg:p-8"><header><h1 className="text-2xl font-bold">Đơn hàng & giao vận</h1><p className="text-sm text-stone-500">Cập nhật trạng thái đơn trên dữ liệu thực.</p></header>{loading && <p>Đang tải…</p>}{error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {!loading && orders.length === 0 && <p className="rounded-xl bg-white p-6 text-stone-500">Chưa có đơn hàng.</p>}
    <div className="space-y-3">{orders.map((order) => <article key={order.id} className="rounded-xl border bg-white p-5"><div className="flex flex-wrap justify-between gap-3"><div><h2 className="font-bold">Đơn #{order.id} <Badge className="ml-2">{statusLabel(labels, order.status)}</Badge></h2><p className="mt-1 text-sm text-stone-500">{order.customer_name} · {formatShippingAddress(order.shipping_address)}</p><p className="mt-1 text-xs text-stone-500">{order.payment_method === "banking" ? "Chuyển khoản ngân hàng" : "COD"} · {order.payment_status === "paid" ? "Đã thanh toán" : order.bank_transfer_claimed_at ? "Khách báo đã chuyển · chờ đối soát" : "Chưa thanh toán"}</p></div><div className="text-right"><b>{formatPrice(Number(order.total))}</b><p className="text-xs text-stone-500">{new Date(order.created_at).toLocaleString("vi-VN")}</p></div></div><div className="my-3 space-y-1 text-sm">{order.items?.map((item, index) => <p key={`${item.product_name}-${index}`}>{item.product_name} × {item.quantity}</p>)}</div><div className="flex flex-wrap gap-2">{order.payment_method === "banking" && order.payment_status === "unpaid" && order.status !== "cancelled" && <Button variant="outline" onClick={() => void confirmTransfer(order.id)}>Xác nhận đã nhận tiền</Button>}{nextStatus[order.status] && <Button onClick={() => moveOrder(order.id, nextStatus[order.status])}>Chuyển trạng thái: {statusLabel(labels, nextStatus[order.status])}</Button>}</div></article>)}</div>
  </main></AdminShell>;
}

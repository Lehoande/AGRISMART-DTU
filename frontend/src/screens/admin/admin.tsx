"use client";
import { useEffect, useState } from "react";
import { Check, ClipboardList, DollarSign, Package, RefreshCw, Sprout, Truck, Users, Warehouse, X, CreditCard, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNav } from "@/lib/nav-store";
import { confirmBankTransfer, createCategory, decideSellerApplication, deleteCategory, getAdminSellerApplications, getAdminSummary, getApiCategories, getMyOrders, getNotifications, markAllNotificationsRead, markNotificationRead, updateCategory, updateOrderStatus, type AdminSellerApplication, type ApiCategory, type UserNotification } from "@/lib/api-client";
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
  return <div className="min-h-screen bg-stone-100"><aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-stone-900 text-white lg:flex"><div className="flex items-center gap-2 border-b border-stone-700 p-5"><Sprout className="size-7 text-amber-400"/><b>AgriSmart Admin</b></div><nav className="flex-1 space-y-1 p-3">{canViewSummary && <button aria-current={currentPage === "admin-dashboard" ? "page" : undefined} className={navClass(currentPage === "admin-dashboard")} onClick={() => navigate("admin-dashboard")}>Tổng quan</button>}<button aria-current={currentPage === "admin-fulfillment" ? "page" : undefined} className={navClass(currentPage === "admin-fulfillment")} onClick={() => navigate("admin-fulfillment")}>Đơn hàng & giao vận</button>{canManageSellers && <><button aria-current={currentPage === "admin-sellers" ? "page" : undefined} className={navClass(currentPage === "admin-sellers")} onClick={() => navigate("admin-sellers")}>Duyệt gian hàng</button><button aria-current={currentPage === "admin-categories" ? "page" : undefined} className={navClass(currentPage === "admin-categories")} onClick={() => navigate("admin-categories")}>Danh mục</button><button aria-current={currentPage === "admin-operations" ? "page" : undefined} className={navClass(currentPage === "admin-operations")} onClick={() => navigate("admin-operations")}>Quản lý hệ thống</button></>}</nav></aside><div className="lg:ml-64">{children}</div></div>;
}

export function AdminCategoriesPage({ isAdmin = false }: { isAdmin?: boolean }) {
  const { toast } = useToast();
  const [rows, setRows] = useState<ApiCategory[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const load = async () => { setLoading(true); try { setRows(await getApiCategories()); } catch (e) { toast({ title: "Không tải được danh mục", description: e instanceof Error ? e.message : "Thử lại sau.", variant: "destructive" }); } finally { setLoading(false); } };
  useEffect(() => { void load(); }, []);
  const submit = async (event: React.FormEvent) => { event.preventDefault(); setSaving(true); try { const row = await createCategory({ name: name.trim(), slug: slug.trim() }); setRows((all) => [...all, row].sort((a,b) => a.name.localeCompare(b.name, "vi"))); setName(""); setSlug(""); toast({ title: "Đã thêm danh mục" }); } catch (e) { toast({ title: "Không thêm được danh mục", description: e instanceof Error ? e.message : "Thử lại sau.", variant: "destructive" }); } finally { setSaving(false); } };
  const edit = async (row: ApiCategory) => { const nextName = window.prompt("Tên danh mục", row.name); if (nextName === null) return; const nextSlug = window.prompt("Mã slug (chữ thường, không dấu)", row.slug); if (nextSlug === null) return; try { const changed = await updateCategory(row.id, { name: nextName.trim(), slug: nextSlug.trim() }); setRows((all) => all.map((item) => item.id === row.id ? changed : item)); toast({ title: "Đã cập nhật danh mục" }); } catch (e) { toast({ title: "Không cập nhật được", description: e instanceof Error ? e.message : "Thử lại sau.", variant: "destructive" }); } };
  const remove = async (row: ApiCategory) => { if (!window.confirm(`Xóa danh mục “${row.name}”?`)) return; try { await deleteCategory(row.id); setRows((all) => all.filter((item) => item.id !== row.id)); toast({ title: "Đã xóa danh mục" }); } catch (e) { toast({ title: "Không xóa được danh mục", description: e instanceof Error ? e.message : "Thử lại sau.", variant: "destructive" }); } };
  return <AdminShell><main className="space-y-5 p-4 lg:p-8"><header><h1 className="text-2xl font-bold">Quản lý danh mục</h1><p className="text-sm text-stone-500">Danh mục sản phẩm dùng chung với cửa hàng. Không thể xóa mục đang có sản phẩm.</p></header><form onSubmit={submit} className="grid gap-3 rounded-xl border bg-white p-5 sm:grid-cols-[1fr_1fr_auto]"><input required minLength={2} maxLength={100} value={name} onChange={(e)=>setName(e.target.value)} placeholder="Tên danh mục" className="h-10 rounded-lg border px-3"/><input required pattern="[-a-z0-9]{2,120}" value={slug} onChange={(e)=>setSlug(e.target.value)} placeholder="ma-danh-muc" className="h-10 rounded-lg border px-3"/><Button disabled={saving}>{saving ? "Đang lưu…" : "Thêm danh mục"}</Button></form><section className="divide-y rounded-xl border bg-white px-5">{loading ? <p className="py-5 text-sm text-stone-500">Đang tải…</p> : rows.map((row)=><div key={row.id} className="flex flex-wrap items-center justify-between gap-3 py-4"><div><b>{row.name}</b><p className="text-xs text-stone-500">/{row.slug}</p></div><div className="flex gap-2"><Button variant="outline" size="sm" onClick={()=>void edit(row)}>Sửa</Button><Button variant="outline" size="sm" disabled={!isAdmin} className="text-red-700" onClick={()=>void remove(row)}>Xóa</Button></div></div>)}</section></main></AdminShell>;
}

const REJECTION_TEMPLATES = [
  "Ảnh chụp CCCD bị mờ, lóa sáng hoặc mất góc, không đọc được số.",
  "Số CCCD đã nhập trên web không khớp với số in trên ảnh thẻ CCCD.",
  "Họ tên người đại diện không trùng khớp với họ tên trên thẻ CCCD.",
  "Ảnh CCCD bị thiếu mặt sau hoặc không chụp rõ ngày cấp.",
  "Chất lượng ảnh quá thấp hoặc không phải thẻ Căn cước công dân hợp lệ.",
];

export function AdminSellerApplicationsPage({ canManageSellers = true }: { canManageSellers?: boolean } = {}) {
  const { toast } = useToast();
  const [applications, setApplications] = useState<AdminSellerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [workingId, setWorkingId] = useState<number | null>(null);
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);
  const [rejectingApp, setRejectingApp] = useState<AdminSellerApplication | null>(null);
  const [rejectionNote, setRejectionNote] = useState("");

  const load = async () => {
    setLoading(true);
    try { setApplications(await getAdminSellerApplications("pending")); setError(""); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Không tải được hồ sơ gian hàng"); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  const decideApprove = async (application: AdminSellerApplication) => {
    if (!window.confirm(`Xác nhận duyệt gian hàng "${application.farm_name}" và kích hoạt quyền đăng bán?`)) return;
    setWorkingId(application.user_id);
    try {
      await decideSellerApplication(application.user_id, "approved");
      setApplications((rows) => rows.filter((row) => row.user_id !== application.user_id));
      toast({ title: "Đã duyệt gian hàng thành công", description: `${application.farm_name} đã có thể mở bán sản phẩm.` });
    } catch (reason) {
      toast({ title: "Không cập nhật được hồ sơ", description: reason instanceof Error ? reason.message : "Vui lòng tải lại và thử lại.", variant: "destructive" });
    } finally { setWorkingId(null); }
  };

  const openRejectDialog = (application: AdminSellerApplication) => {
    setRejectingApp(application);
    setRejectionNote(REJECTION_TEMPLATES[0]);
  };

  const confirmRejection = async () => {
    if (!rejectingApp) return;
    setWorkingId(rejectingApp.user_id);
    try {
      await decideSellerApplication(rejectingApp.user_id, "rejected", rejectionNote.trim() || undefined);
      setApplications((rows) => rows.filter((row) => row.user_id !== rejectingApp.user_id));
      toast({ title: "Đã từ chối hồ sơ", description: `${rejectingApp.farm_name} - Đã gửi lý do phản hồi cho người bán.` });
      setRejectingApp(null);
    } catch (reason) {
      toast({ title: "Không thể từ chối hồ sơ", description: reason instanceof Error ? reason.message : "Vui lòng thử lại.", variant: "destructive" });
    } finally { setWorkingId(null); }
  };

  return <AdminShell canManageSellers={canManageSellers}><main className="space-y-5 p-4 lg:p-8"><header className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-2xl font-bold">Duyệt gian hàng</h1><p className="mt-1 text-sm text-stone-500">Xem thông tin đăng ký và quyết định cho phép gian hàng đăng sản phẩm.</p></div><Button variant="outline" onClick={() => void load()} disabled={loading}><RefreshCw className={`mr-2 size-4 ${loading ? "animate-spin" : ""}`}/>Tải lại</Button></header>
    {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {loading && <p className="text-sm text-stone-500">Đang tải hồ sơ…</p>}
    {!loading && !error && applications.length === 0 && <p className="rounded-xl border bg-white p-6 text-sm text-stone-500">Hiện không có hồ sơ nào đang chờ duyệt.</p>}
    <div className="space-y-3">{applications.map((application) => <article key={application.user_id} className="rounded-xl border bg-white p-5"><div className="flex flex-wrap justify-between gap-4"><div><h2 className="text-lg font-bold">{application.farm_name}</h2><p className="mt-1 text-sm text-stone-600">Người đại diện: {application.representative_name}</p><p className="text-sm text-stone-600">{application.email}{application.phone ? ` · ${application.phone}` : ""}</p><p className="mt-1 text-sm text-stone-600">Địa chỉ: {application.farm_address}</p><p className="mt-2 text-xs text-stone-400">Đăng ký lúc {new Date(application.created_at).toLocaleString("vi-VN")}</p></div><Badge className="h-fit bg-amber-100 text-amber-800">Chờ duyệt</Badge></div>

      {/* Thông tin Căn cước công dân (CCCD) */}
      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/50 p-4">
        <div className="flex items-center gap-2 mb-2">
          <CreditCard className="size-4 text-amber-700" />
          <span className="text-xs font-bold uppercase tracking-wider text-amber-900">Thông tin Căn cước công dân (CCCD)</span>
        </div>
        <div className="grid sm:grid-cols-2 gap-2 text-sm">
          <p className="text-stone-700">
            Số CCCD: <b className="font-mono text-base text-stone-900">{application.citizen_id || "Chưa cung cấp"}</b>
          </p>
          <p className="text-stone-700">
            Ngày cấp: <b>{application.citizen_card_date ? new Date(application.citizen_card_date).toLocaleDateString("vi-VN") : "Chưa cập nhật"}</b>
          </p>
        </div>

        {(application.id_card_front_url || application.id_card_back_url) ? (
          <div className="mt-3 grid grid-cols-2 gap-4 max-w-md">
            {application.id_card_front_url && (
              <div>
                <span className="text-xs text-stone-600 block mb-1 font-medium">Mặt trước CCCD:</span>
                <button
                  type="button"
                  onClick={() => setPreviewImage({ url: application.id_card_front_url!, title: `Mặt trước CCCD - ${application.farm_name}` })}
                  className="group relative block w-full overflow-hidden rounded-lg border border-stone-300 bg-white shadow-sm hover:border-amber-500"
                >
                  <img src={application.id_card_front_url} alt="Mặt trước CCCD" className="h-28 w-full object-cover transition-transform group-hover:scale-105" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-medium gap-1">
                    <Eye className="size-3.5" /> Xem lớn
                  </div>
                </button>
              </div>
            )}
            {application.id_card_back_url && (
              <div>
                <span className="text-xs text-stone-600 block mb-1 font-medium">Mặt sau CCCD:</span>
                <button
                  type="button"
                  onClick={() => setPreviewImage({ url: application.id_card_back_url!, title: `Mặt sau CCCD - ${application.farm_name}` })}
                  className="group relative block w-full overflow-hidden rounded-lg border border-stone-300 bg-white shadow-sm hover:border-amber-500"
                >
                  <img src={application.id_card_back_url} alt="Mặt sau CCCD" className="h-28 w-full object-cover transition-transform group-hover:scale-105" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-medium gap-1">
                    <Eye className="size-3.5" /> Xem lớn
                  </div>
                </button>
              </div>
            )}
          </div>
        ) : (
          <p className="mt-2 text-xs italic text-stone-500">Người bán chưa tải lên ảnh CCCD.</p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button disabled={!canManageSellers || workingId === application.user_id} onClick={() => void decideApprove(application)}>
          <Check className="mr-2 size-4"/>{workingId === application.user_id ? "Đang lưu…" : "Duyệt gian hàng"}
        </Button>
        <Button variant="outline" className="text-red-700 hover:bg-red-50 hover:border-red-300" disabled={!canManageSellers || workingId === application.user_id} onClick={() => openRejectDialog(application)}>
          <X className="mr-2 size-4"/>Từ chối
        </Button>
      </div></article>)}</div>

    {/* Modal từ chối hồ sơ kèm lý do */}
    {rejectingApp && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setRejectingApp(null)}>
        <div className="relative max-h-[90vh] max-w-xl w-full rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between pb-3 border-b">
            <div>
              <h3 className="font-bold text-stone-900 text-base">Từ chối hồ sơ gian hàng</h3>
              <p className="text-xs text-stone-500 mt-0.5">{rejectingApp.farm_name} ({rejectingApp.representative_name})</p>
            </div>
            <button type="button" onClick={() => setRejectingApp(null)} className="rounded-lg p-1.5 hover:bg-stone-100 text-stone-500">
              <X className="size-5" />
            </button>
          </div>

          <div className="mt-4 space-y-4">
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1.5">Chọn nhanh lý do từ chối mẫu:</label>
              <div className="flex flex-wrap gap-1.5">
                {REJECTION_TEMPLATES.map((tmpl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setRejectionNote(tmpl)}
                    className={`rounded-lg px-2.5 py-1 text-xs border text-left transition-colors ${
                      rejectionNote === tmpl
                        ? "bg-amber-100 border-amber-400 text-amber-900 font-medium"
                        : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                    }`}
                  >
                    {tmpl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="rejection-text" className="text-xs font-semibold text-stone-700 block mb-1.5">
                Chi tiết lý do từ chối gửi người bán:
              </label>
              <textarea
                id="rejection-text"
                rows={3}
                value={rejectionNote}
                onChange={(e) => setRejectionNote(e.target.value)}
                placeholder="Nhập lý do cụ thể để người bán biết cần sửa hoặc chụp lại những gì..."
                className="w-full rounded-xl border border-stone-300 p-3 text-sm focus:border-amber-500 focus:outline-none"
              />
              <p className="text-[11px] text-stone-500 mt-1">Lý do này sẽ hiển thị trực tiếp trên trang quản lý của người bán và thông báo tài khoản.</p>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2 border-t pt-4">
            <Button variant="outline" size="sm" onClick={() => setRejectingApp(null)}>Hủy bỏ</Button>
            <Button
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={workingId === rejectingApp.user_id}
              onClick={() => void confirmRejection()}
            >
              {workingId === rejectingApp.user_id ? "Đang xử lý…" : "Xác nhận từ chối"}
            </Button>
          </div>
        </div>
      </div>
    )}

    {/* Modal xem lớn ảnh CCCD */}
    {previewImage && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setPreviewImage(null)}>
        <div className="relative max-h-[90vh] max-w-2xl w-full rounded-2xl bg-white p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between pb-3 border-b">
            <h3 className="font-bold text-stone-800 text-sm sm:text-base">{previewImage.title}</h3>
            <button type="button" onClick={() => setPreviewImage(null)} className="rounded-lg p-1.5 hover:bg-stone-100 text-stone-500 transition-colors">
              <X className="size-5" />
            </button>
          </div>
          <div className="mt-4 overflow-hidden rounded-xl bg-stone-100 text-center flex items-center justify-center min-h-[250px]">
            <img src={previewImage.url} alt={previewImage.title} className="max-h-[65vh] w-auto max-w-full object-contain mx-auto" />
          </div>
          <div className="mt-4 text-right">
            <Button variant="outline" size="sm" onClick={() => setPreviewImage(null)}>Đóng</Button>
          </div>
        </div>
      </div>
    )}
  </main></AdminShell>;
}

export function AdminDashboardPage() {
  const { toast } = useToast();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [confirmingOrderId, setConfirmingOrderId] = useState<number | null>(null);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  useEffect(() => {
    let active = true;
    Promise.all([getAdminSummary(), getMyOrders()]).then(([summary, rows]) => {
      if (active) { setStats(summary); setOrders((rows as AdminOrder[]).slice(0, 8)); }
    }).catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : "Không tải được số liệu quản trị"); })
      .finally(() => { if (active) setLoading(false); });
    getNotifications().then((result) => { if (active) setNotifications(result.items); }).catch(() => undefined);
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
  const readNotification = async (item: UserNotification) => { try { await markNotificationRead(item.id); setNotifications((all)=>all.map((n)=>n.id===item.id?{...n,is_read:true}:n)); } catch {} };
  const readAllNotifications = async () => { try { await markAllNotificationsRead(); setNotifications((all)=>all.map((n)=>({...n,is_read:true}))); } catch {} };
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
    <section className="rounded-2xl border bg-white p-5"><div className="mb-3 flex items-center justify-between gap-3"><h2 className="text-lg font-bold">Thông báo quản trị</h2>{notifications.some((item)=>!item.is_read)&&<Button variant="outline" size="sm" onClick={()=>void readAllNotifications()}>Đánh dấu tất cả đã đọc</Button>}</div>{notifications.length? <div className="divide-y">{notifications.slice(0,12).map(item=><button key={item.id} onClick={()=>void readNotification(item)} className={`block w-full rounded-lg p-3 text-left ${item.is_read?"":"bg-amber-50"}`}><b className="text-sm">{item.title}</b><p className="text-xs text-stone-600">{item.message}</p><span className="text-[10px] text-stone-400">{new Date(item.created_at).toLocaleString("vi-VN")}</span></button>)}</div>:<p className="text-sm text-stone-500">Chưa có thông báo.</p>}</section>
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

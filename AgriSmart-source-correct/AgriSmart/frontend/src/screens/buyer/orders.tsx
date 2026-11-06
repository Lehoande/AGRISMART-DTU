"use client";
import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, ChevronRight, Clock, CreditCard, Home as HomeIcon, Package, Star, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BuyerHeader } from "@/components/agri/buyer-header";
import { useToast } from "@/hooks/use-toast";
import { useNav } from "@/lib/nav-store";
import { formatPrice } from "@/lib/agri-data";
import { getMyOrders, getOrderDetail, startPayment, submitReview } from "@/lib/api-client";
import { ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS, statusLabel } from "@/lib/status-labels";

type OrderItem = { product_id: number; product_name: string; unit_price: number; quantity: number; image_url?: string | null };
type Order = { id: number; status: string; total: number; payment_method: string; payment_status: string; bank_transfer_claimed_at?: string | null; created_at: string; items: OrderItem[]; history?: Array<{ from_status: string | null; to_status: string; created_at: string }> };
const STATUS_LABELS = ORDER_STATUS_LABELS;
const money = (value: number | string) => formatPrice(Number(value || 0));
const date = (value: string) => new Date(value).toLocaleString("vi-VN");

function useSelectedOrder() {
  const orderId = useNav((state) => state.selectedOrderId);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(Boolean(orderId));
  const [error, setError] = useState("");
  useEffect(() => {
    if (!orderId) return;
    let active = true;
    getOrderDetail(orderId).then((value) => { if (active) setOrder(value as Order); })
      .catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : "Không tải được đơn hàng"); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [orderId]);
  return { order, loading, error };
}

export function BuyerOrdersPage() {
  const navigate = useNav((state) => state.navigate);
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    getMyOrders("buyer").then((rows) => { if (active) setOrders(rows as Order[]); })
      .catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : "Không tải được đơn hàng"); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  const retryPayment = async (order: Order) => {
    try {
      const result = await startPayment(order.id, order.payment_method as "vnpay" | "momo");
      window.location.assign(result.payment_url);
    } catch (reason) {
      toast({ title: "Chưa thể khởi tạo thanh toán", description: reason instanceof Error ? reason.message : "Kiểm tra cấu hình cổng thanh toán rồi thử lại.", variant: "destructive" });
    }
  };
  return <div className="min-h-screen bg-stone-50 pb-20"><BuyerHeader /><main className="mx-auto max-w-5xl px-4 py-8">
    <div className="mb-6 flex items-center gap-2 text-xs text-stone-500"><button onClick={() => navigate("buyer-home")}><HomeIcon className="mr-1 inline size-3.5" />Trang chủ</button><ChevronRight className="size-3" /><span className="font-semibold text-stone-900">Đơn hàng</span></div>
    <h1 className="mb-1 text-3xl font-bold">Đơn hàng của tôi</h1><p className="mb-6 text-sm text-stone-500">Dữ liệu và trạng thái lấy từ hệ thống đơn hàng.</p>
    {loading && <p className="text-sm text-stone-500">Đang tải đơn hàng…</p>}{error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {!loading && !error && orders.length === 0 && <p className="rounded-xl bg-white p-6 text-stone-500">Bạn chưa có đơn hàng.</p>}
    <div className="space-y-4">{orders.map((order) => <article key={order.id} className="rounded-2xl border border-stone-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><div className="font-bold">Đơn #{order.id} <Badge className="ml-2">{statusLabel(STATUS_LABELS, order.status)}</Badge></div><div className="mt-1 text-xs text-stone-500">{date(order.created_at)} · {statusLabel(PAYMENT_METHOD_LABELS, order.payment_method)} · {statusLabel(PAYMENT_STATUS_LABELS, order.payment_status)}</div>{order.payment_method === "banking" && order.payment_status !== "paid" && order.bank_transfer_claimed_at && <p className="mt-1 text-xs font-medium text-amber-700">Bạn đã báo chuyển khoản · Đang chờ đối soát</p>}</div><div className="text-right font-bold text-green-700">{money(order.total)}</div></div>
      <div className="my-4 space-y-2">{(order.items || []).map((item) => <div key={item.product_id} className="flex items-center gap-3 rounded-lg bg-stone-50 p-2"><img className="size-12 rounded object-cover" src={item.image_url || "/logo.svg"} alt=""/><div className="min-w-0 flex-1"><div className="truncate text-sm font-medium">{item.product_name}</div><div className="text-xs text-stone-500">{item.quantity} × {money(item.unit_price)}</div></div></div>)}</div>
      <div className="flex flex-wrap gap-2"><Button variant="outline" size="sm" onClick={() => navigate("buyer-order-tracking", { orderId: String(order.id) })}><Truck className="mr-1 size-4"/>Theo dõi</Button>{order.payment_status !== "paid" && order.status === "pending" && ["vnpay", "momo"].includes(order.payment_method) && <Button size="sm" onClick={() => void retryPayment(order)}><CreditCard className="mr-1 size-4"/>Thanh toán lại</Button>}{order.status === "completed" && <Button variant="outline" size="sm" onClick={() => navigate("buyer-review", { orderId: String(order.id) })}><Star className="mr-1 size-4"/>Đánh giá</Button>}<Button variant="outline" size="sm" onClick={() => navigate("buyer-complaint", { orderId: String(order.id) })}>Gửi khiếu nại</Button></div>
    </article>)}</div>
  </main></div>;
}

export function BuyerOrderTrackingPage() {
  const navigate = useNav((state) => state.navigate);
  const { order, loading, error } = useSelectedOrder();
  return <div className="min-h-screen bg-stone-50 pb-20"><BuyerHeader/><main className="mx-auto max-w-4xl space-y-5 px-4 py-8">
    <Button variant="ghost" onClick={() => navigate("buyer-orders")}><ArrowLeft className="mr-2 size-4"/>Quay lại đơn hàng</Button>
    {loading && <p className="text-sm text-stone-500">Đang tải…</p>}{error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {order && <><section className="rounded-2xl border bg-white p-6"><div className="flex flex-wrap justify-between gap-3"><div><h1 className="text-2xl font-bold">Theo dõi đơn #{order.id}</h1><p className="mt-1 text-sm text-stone-500">Đặt lúc {date(order.created_at)}</p></div><Badge>{statusLabel(STATUS_LABELS, order.status)}</Badge></div><p className="mt-4 font-bold text-green-700">Tổng tiền: {money(order.total)}</p></section>
      <section className="rounded-2xl border bg-white p-6"><h2 className="mb-4 text-lg font-bold">Lịch sử trạng thái</h2>{order.history?.length ? <ol className="space-y-4">{order.history.map((entry, i) => <li key={`${entry.to_status}-${i}`} className="flex items-start gap-3"><div className="mt-1 rounded-full bg-green-100 p-2"><CheckCircle2 className="size-4 text-green-700"/></div><div><div className="font-semibold">{STATUS_LABELS[entry.to_status] || entry.to_status}</div><div className="text-xs text-stone-500">{date(entry.created_at)}</div></div></li>)}</ol> : <p className="text-sm text-stone-500"><Clock className="mr-2 inline size-4"/>Chưa có lịch sử cập nhật.</p>}</section>
      <section className="rounded-2xl border bg-white p-6"><h2 className="mb-4 text-lg font-bold">Sản phẩm</h2>{order.items?.map((item) => <div key={item.product_id} className="flex items-center gap-3 border-b py-3 last:border-0"><Package className="size-5 text-stone-400"/><span className="flex-1">{item.product_name} × {item.quantity}</span><b>{money(item.unit_price * item.quantity)}</b></div>)}</section></>}
  </main></div>;
}

export function BuyerReviewPage() {
  const navigate = useNav((state) => state.navigate);
  const { toast } = useToast();
  const { order, loading, error } = useSelectedOrder();
  const [productId, setProductId] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const selectedProductId = productId || (order?.items?.[0] ? String(order.items[0].product_id) : "");
  const send = async () => {
    if (!selectedProductId) return;
    setSaving(true);
    try { await submitReview(selectedProductId, { rating, comment }); setSubmitted(true); }
    catch (reason) { toast({ title: "Không gửi được đánh giá", description: reason instanceof Error ? reason.message : "Chỉ đánh giá được sản phẩm trong đơn đã hoàn tất.", variant: "destructive" }); }
    finally { setSaving(false); }
  };
  return <div className="min-h-screen bg-stone-50 pb-20"><BuyerHeader/><main className="mx-auto max-w-2xl px-4 py-8">
    <Button variant="ghost" onClick={() => navigate("buyer-orders")}><ArrowLeft className="mr-2 size-4"/>Đơn hàng</Button>
    <section className="mt-4 rounded-2xl border bg-white p-6"><h1 className="text-2xl font-bold">Đánh giá sản phẩm</h1>{loading && <p className="py-4">Đang tải…</p>}{error && <p role="alert" className="py-4 text-red-700">{error}</p>}
      {order && !submitted && <div className="mt-5 space-y-5"><p className="text-sm text-stone-500">Đơn #{order.id} · {statusLabel(STATUS_LABELS, order.status)}</p><label className="block text-sm font-semibold">Sản phẩm<select className="mt-1 w-full rounded-lg border p-2" value={selectedProductId} onChange={(e) => setProductId(e.target.value)}>{order.items?.map((item) => <option key={item.product_id} value={item.product_id}>{item.product_name}</option>)}</select></label><div><div className="mb-2 text-sm font-semibold">Đánh giá sao</div><div className="flex gap-2">{[1,2,3,4,5].map((star) => <button key={star} type="button" aria-label={`${star} sao`} onClick={() => setRating(star)}><Star className={`size-8 ${star <= rating ? "fill-amber-400 text-amber-400" : "text-stone-300"}`}/></button>)}</div></div><Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Nhận xét (không bắt buộc)"/><Button disabled={saving || order.status !== "completed"} onClick={send}>{saving ? "Đang gửi…" : "Gửi đánh giá"}</Button>{order.status !== "completed" && <p className="text-xs text-amber-700">Chỉ đánh giá được đơn đã hoàn tất.</p>}</div>}
      {submitted && <p className="mt-5 rounded-lg bg-green-50 p-4 text-green-800"><CheckCircle2 className="mr-2 inline size-5"/>Đánh giá đã được lưu.</p>}
    </section>
  </main></div>;
}

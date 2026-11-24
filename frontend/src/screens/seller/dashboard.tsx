"use client";
import { useEffect, useState } from "react";
import { DollarSign, Package, ShoppingCart, Warehouse, AlertCircle, Clock } from "lucide-react";
import { SellerLayout } from "@/components/agri/seller-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNav } from "@/lib/nav-store";
import { getMyOrders, getMyProfile, getSellerSummary } from "@/lib/api-client";
import { formatPrice } from "@/lib/agri-data";
import { ORDER_STATUS_LABELS, statusLabel } from "@/lib/status-labels";
import { ResubmitCccdModal } from "@/components/agri/resubmit-cccd-modal";

type Summary = {
  products: number;
  inventory_units: number;
  orders: number;
  revenue: number;
  seller: {
    farm_name: string;
    status: string;
    review_note: string | null;
    citizen_id?: string | null;
    citizen_card_date?: string | null;
    id_card_front_url?: string | null;
    id_card_back_url?: string | null;
  } | null;
};
type SellerOrder = { id: number; customer_name: string; status: string; total: number; created_at: string };

export function SellerDashboardPage() {
  const navigate = useNav((state) => state.navigate);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [error, setError] = useState("");
  const [needsStore, setNeedsStore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showResubmit, setShowResubmit] = useState(false);

  const loadData = async () => {
    try {
      const profile = await getMyProfile();
      if (profile.role !== "seller") { setNeedsStore(true); return; }
      const [stats, recent] = await Promise.all([getSellerSummary(), getMyOrders()]);
      setSummary(stats);
      setOrders((recent as SellerOrder[]).slice(0, 8));
      setError("");
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "Không tải được dữ liệu người bán");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  if (needsStore) return <SellerLayout><main className="mx-auto max-w-2xl rounded-2xl border bg-white p-6"><h1 className="text-2xl font-bold">Bạn chưa có gian hàng</h1><p className="mt-2 text-sm text-stone-600">Tài khoản hiện tại là tài khoản người mua. Hãy tạo gian hàng để kích hoạt quyền người bán và xem bảng điều khiển.</p><Button className="mt-5" onClick={() => navigate("seller-signup")}>Tạo gian hàng</Button></main></SellerLayout>;
  const metrics = [
    { label: "Doanh thu trên đơn hoàn tất", value: formatPrice(Number(summary?.revenue || 0)), icon: DollarSign },
    { label: "Đơn có sản phẩm của bạn", value: String(summary?.orders || 0), icon: ShoppingCart },
    { label: "Sản phẩm đang bán", value: String(summary?.products || 0), icon: Package },
    { label: "Tổng tồn kho", value: String(summary?.inventory_units || 0), icon: Warehouse },
  ];
  return <SellerLayout><main className="space-y-6">
    <div><h1 className="text-2xl font-bold">Tổng quan cửa hàng</h1><p className="mt-1 text-sm text-stone-500">{summary?.seller?.farm_name || "Thông tin cửa hàng"} · Dữ liệu thực từ hệ thống</p></div>
    {loading && <p className="text-sm text-stone-500">Đang tải…</p>}{error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {summary?.seller?.status === "pending" && (
      <div className="rounded-xl border border-amber-300 bg-amber-50 p-4">
        <div className="flex items-center gap-2">
          <Clock className="size-5 text-amber-600" />
          <b className="text-sm text-amber-900">Hồ sơ Căn cước công dân đang chờ Ban quản trị duyệt</b>
        </div>
        <p className="mt-1 text-xs text-amber-800">
          Bạn có thể quản lý sản phẩm hoặc xem trước giao diện. Gian hàng sẽ được mở bán công khai ngay sau khi Admin phê duyệt.
        </p>
      </div>
    )}
    {summary?.seller?.status === "rejected" && (
      <div className="rounded-xl border border-red-300 bg-red-50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <AlertCircle className="size-5 text-red-600" />
              <b className="text-sm text-red-900">Hồ sơ Căn cước công dân chưa được duyệt</b>
            </div>
            <p className="mt-1 text-xs text-red-800">
              {summary.seller.review_note ? `Lý do: ${summary.seller.review_note}` : "Vui lòng kiểm tra lại thông tin và ảnh CCCD."}
            </p>
          </div>
          <Button size="sm" onClick={() => setShowResubmit(true)} className="bg-red-600 hover:bg-red-700 text-white">
            Cập nhật lại CCCD
          </Button>
        </div>
      </div>
    )}
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{metrics.map((metric) => <section key={metric.label} className="rounded-xl border bg-white p-4"><metric.icon className="mb-3 size-5 text-green-700"/><div className="text-xl font-bold">{metric.value}</div><div className="text-xs text-stone-500">{metric.label}</div></section>)}</div>
    <section className="rounded-2xl border bg-white p-5"><h2 className="mb-4 text-lg font-bold">Đơn gần đây</h2>{!loading && orders.length === 0 && <p className="text-sm text-stone-500">Chưa có đơn chứa sản phẩm của cửa hàng.</p>}<div className="divide-y">{orders.map((order) => <div key={order.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><div><b>Đơn #{order.id}</b><div className="text-xs text-stone-500">{order.customer_name} · {new Date(order.created_at).toLocaleString("vi-VN")}</div></div><div className="flex items-center gap-3"><Badge>{statusLabel(ORDER_STATUS_LABELS, order.status)}</Badge><b>{formatPrice(Number(order.total))}</b></div></div>)}</div></section>

    <ResubmitCccdModal
      isOpen={showResubmit}
      onClose={() => setShowResubmit(false)}
      onSuccess={() => void loadData()}
      initialCitizenId={summary?.seller?.citizen_id}
      initialCitizenCardDate={summary?.seller?.citizen_card_date}
      initialFrontUrl={summary?.seller?.id_card_front_url}
      initialBackUrl={summary?.seller?.id_card_back_url}
      currentReviewNote={summary?.seller?.review_note}
    />
  </main></SellerLayout>;
}

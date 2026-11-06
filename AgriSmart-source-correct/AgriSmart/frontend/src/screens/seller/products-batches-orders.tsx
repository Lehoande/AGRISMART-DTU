"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SellerLayout } from "@/components/agri/seller-layout";
import { useNav } from "@/lib/nav-store";
import { archiveProduct, getMyOrders, getMyProducts, updateOrderStatus, type ApiProduct } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS, statusLabel } from "@/lib/status-labels";
import {
  formatPrice,
} from "@/lib/agri-data";
import { formatShippingAddress } from "@/lib/shipping-address";

// ============================================
// SELLER PRODUCTS
// ============================================
export function SellerProductsPage() {
  const navigate = useNav((s) => s.navigate);
  const { toast } = useToast();
  const [sellerProducts, setSellerProducts] = useState<ApiProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProducts = async () => {
    try { setSellerProducts(await getMyProducts()); setError(""); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Không tải được sản phẩm"); }
    finally { setIsLoading(false); }
  };
  useEffect(() => { const timer = window.setTimeout(() => { void loadProducts(); }, 0); return () => window.clearTimeout(timer); }, []);

  const hideProduct = async (id: number) => {
    try { await archiveProduct(id); toast({ title: "Đã ẩn sản phẩm" }); await loadProducts(); }
    catch (reason) { toast({ title: "Không thể ẩn sản phẩm", description: reason instanceof Error ? reason.message : "Vui lòng thử lại.", variant: "destructive" }); }
  };

  return (
    <SellerLayout>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold mb-1">Sản phẩm của tôi</h1>
          <p className="text-sm text-stone-500">{sellerProducts.length} sản phẩm trong cơ sở dữ liệu</p>
        </div>
        <Button onClick={() => navigate("seller-add-product")} className="bg-green-600 hover:bg-green-700">
          <Plus className="size-4 mr-2" /> Đăng bán mới
        </Button>
      </div>

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone-400" />
        <Input placeholder="Tìm sản phẩm..." className="pl-10 h-10" />
      </div>

      {isLoading && <p className="text-sm text-stone-500">Đang tải sản phẩm…</p>}
      {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {!isLoading && !error && sellerProducts.length === 0 && <p className="rounded-xl bg-white p-6 text-sm text-stone-500">Bạn chưa có sản phẩm nào. Bấm “Đăng bán mới” để bắt đầu.</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sellerProducts.filter((p) => p.is_active !== false).map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl border border-stone-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="relative h-40 overflow-hidden">
              <img src={p.image_url || "/logo.svg"} alt={p.name} className="w-full h-full object-cover" />
              <Badge
                className={`absolute top-2 left-2 ${
                  "badge-ocop"
                } text-[10px] text-white`}
              >
                {p.certification || "Chưa khai báo chứng nhận"}
              </Badge>
              <Badge className="absolute top-2 right-2 bg-emerald-500 hover:bg-emerald-500 text-[10px]">
                Đang bán
              </Badge>
            </div>
            <div className="p-3">
              <h3 className="font-bold text-sm line-clamp-2 min-h-[2.5rem]">{p.name}</h3>
              <div className="flex items-center gap-2 mt-1 text-xs text-stone-500">
                <span>{p.origin || "Chưa khai báo nguồn gốc"}</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="font-bold text-green-700 text-sm">{formatPrice(p.price)}</div>
                <div className="text-xs text-stone-500">/ {p.unit}</div>
              </div>
              <div className="text-xs text-stone-500 mt-1">Còn {p.stock} {p.unit}</div>
              <div className="grid grid-cols-2 gap-1.5 mt-3">
                <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => hideProduct(p.id)}>
                  <Eye className="size-3.5 mr-1" /> Ẩn
                </Button>
                <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => navigate("seller-add-product")}>
                  Thêm mới
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </SellerLayout>
  );
}

// ============================================
// SELLER BATCHES
// ============================================
export function SellerBatchesPage() {
  const navigate = useNav((state) => state.navigate);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => { let active = true; getMyProducts().then((rows) => { if (active) setProducts(rows); }).catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : "Không tải được lô hàng"); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, []);
  return <SellerLayout><div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-bold">Lô sản phẩm</h1><p className="text-sm text-stone-500">Mỗi mã truy xuất gắn với một sản phẩm đang quản lý. Chưa có quy trình kiểm định lô độc lập.</p></div><Button onClick={() => navigate("seller-add-product")}><Plus className="mr-2 size-4"/>Thêm sản phẩm</Button></div>{error && <p role="alert" className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}{loading && <p className="text-sm text-stone-500">Đang tải…</p>}{!loading && !error && products.length === 0 && <p className="rounded-xl border bg-white p-5 text-sm text-stone-500">Chưa có sản phẩm.</p>}<div className="space-y-3">{products.map((product) => <Card key={product.id} className="flex flex-wrap items-center gap-4 p-4"><img src={product.image_url || "/logo.svg"} alt="" className="size-16 rounded-lg object-cover"/><div className="min-w-48 flex-1"><b>{product.name}</b><p className="text-xs text-stone-500">Mã truy xuất: {product.traceability_code || "Chưa tạo"}</p><p className="text-xs text-stone-500">Thu hoạch: {product.harvest_date || "Chưa cập nhật"} · Tồn: {product.stock} {product.unit}</p></div><Badge variant="outline">{product.certification || "Chưa xác minh chứng nhận"}</Badge><Button variant="outline" size="sm" onClick={() => navigate("seller-add-product")}>Cập nhật</Button></Card>)}</div></SellerLayout>;
}

// ============================================
// SELLER ORDERS
// ============================================
export function SellerOrdersPage() {
  const [orders, setOrders] = useState<Array<Record<string, any>>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { toast } = useToast();
  const loadOrders = async () => {
    try { setOrders(await getMyOrders()); setError(""); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Không tải được đơn hàng"); }
    finally { setLoading(false); }
  };
  useEffect(() => { const timer = window.setTimeout(() => { void loadOrders(); }, 0); return () => window.clearTimeout(timer); }, []);
  const updateStatus = async (orderId: number, status: string) => {
    try { await updateOrderStatus(orderId, status); toast({ title: "Đã cập nhật đơn hàng" }); await loadOrders(); }
    catch (reason) { toast({ title: "Không thể cập nhật đơn", description: reason instanceof Error ? reason.message : "Vui lòng thử lại.", variant: "destructive" }); }
  };
  return (
    <SellerLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Đơn hàng</h1>
        <p className="text-sm text-stone-500">Quản lý đơn hàng từ người mua</p>
      </div>

      {loading && <p className="text-sm text-stone-500">Đang tải đơn hàng…</p>}{error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {!loading && !error && orders.length === 0 && <p className="rounded-lg bg-white p-5 text-sm text-stone-500">Chưa có đơn chứa sản phẩm của cửa hàng.</p>}
      <div className="space-y-3">
        {orders.map((o, i) => {
          return (
            <motion.div
              key={o.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-stone-200 p-4"
            >
              <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                <div>
                  <div className="font-bold flex items-center gap-2 flex-wrap">
                    <span className="font-mono">#{o.id}</span>
                    <Badge>{statusLabel(ORDER_STATUS_LABELS, String(o.status))}</Badge>
                  </div>
                  <div className="text-xs text-stone-500 mt-1">{o.created_at ? new Date(o.created_at).toLocaleString("vi-VN") : ""} · {statusLabel(PAYMENT_METHOD_LABELS, String(o.payment_method))}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-700">{formatPrice(Number(o.total))}</div>
                  <div className="text-xs text-stone-500">{statusLabel(PAYMENT_STATUS_LABELS, String(o.payment_status))}</div>
                </div>
              </div>

              <div className="text-sm font-semibold">{o.customer_name} · {formatShippingAddress(o.shipping_address)}</div>

              <div className="space-y-2 mt-3">
                {(o.items || []).map((item: Record<string, any>) => (
                  <div key={item.product_id} className="flex items-center gap-3 p-2 bg-stone-50 rounded-lg">
                    <img src={item.image_url || "/logo.svg"} alt={item.product_name} className="size-12 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm line-clamp-1">{item.product_name}</div>
                      <div className="text-xs text-stone-500">
                        SL: {item.quantity}
                      </div>
                    </div>
                    <div className="font-bold text-sm">{formatPrice(Number(item.unit_price) * Number(item.quantity))}</div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 mt-3">
                {o.status === "pending" && <Button size="sm" onClick={() => updateStatus(Number(o.id), "confirmed")}>Xác nhận đơn</Button>}
                {o.status === "confirmed" && <Button size="sm" onClick={() => updateStatus(Number(o.id), "shipping")}>Chuyển sang giao</Button>}
              </div>
            </motion.div>
          );
        })}
      </div>
    </SellerLayout>
  );
}

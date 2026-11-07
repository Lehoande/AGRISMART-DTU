"use client";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Package,
  Eye,
  Layers,
  Home as HomeIcon,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  History,
  MapPin,
  Calendar,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SellerLayout } from "@/components/agri/seller-layout";
import { useNav } from "@/lib/nav-store";
import {
  products,
  batches,
  batchStatusConfig,
  sellerOrders,
  orderStatusConfig,
  formatPrice,
} from "@/lib/agri-data";

// ============================================
// SELLER PRODUCTS
// ============================================
export function SellerProductsPage() {
  const navigate = useNav((s) => s.navigate);

  return (
    <SellerLayout>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold mb-1">Sản phẩm của tôi</h1>
          <p className="text-sm text-stone-500">{products.length} sản phẩm - chỉ nông sản & trái cây</p>
        </div>
        <Button onClick={() => navigate("seller-add-product")} className="bg-green-600 hover:bg-green-700">
          <Plus className="size-4 mr-2" /> Đăng bán mới
        </Button>
      </div>

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone-400" />
        <Input placeholder="Tìm sản phẩm..." className="pl-10 h-10" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.slice(0, 12).map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl border border-stone-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="relative h-40 overflow-hidden">
              <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
              <Badge
                className={`absolute top-2 left-2 ${
                  p.cert === "organic" ? "badge-organic" : p.cert === "ocop" ? "badge-ocop" : p.cert === "globalgap" ? "badge-globalgap" : "badge-vietgap"
                } text-[10px] text-white`}
              >
                {p.certLabel}
              </Badge>
              <Badge className="absolute top-2 right-2 bg-emerald-500 hover:bg-emerald-500 text-[10px]">
                Đang bán
              </Badge>
            </div>
            <div className="p-3">
              <h3 className="font-bold text-sm line-clamp-2 min-h-[2.5rem]">{p.name}</h3>
              <div className="flex items-center gap-2 mt-1 text-xs text-stone-500">
                <span className="text-amber-500">★ {p.rating}</span>
                <span>({p.reviews})</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="font-bold text-green-700 text-sm">{formatPrice(p.price)}</div>
                <div className="text-xs text-stone-500">/ {p.unit}</div>
              </div>
              <div className="text-xs text-stone-500 mt-1">Còn {p.stock} {p.unit}</div>
              <div className="grid grid-cols-2 gap-1.5 mt-3">
                <Button size="sm" variant="outline" className="h-8 text-xs">
                  <Eye className="size-3.5 mr-1" /> Xem
                </Button>
                <Button size="sm" variant="outline" className="h-8 text-xs">
                  Sửa
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
  const navigate = useNav((s) => s.navigate);

  return (
    <SellerLayout>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold mb-1">Quản lý lô hàng</h1>
          <p className="text-sm text-stone-500">{batches.length} lô hàng - theo dõi trạng thái kiểm tra</p>
        </div>
        <Button onClick={() => navigate("seller-add-product")} className="bg-green-600 hover:bg-green-700">
          <Plus className="size-4 mr-2" /> Tạo lô mới
        </Button>
      </div>

      {/* Status legend */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 mb-6">
        {(Object.keys(batchStatusConfig) as Array<keyof typeof batchStatusConfig>).map((status) => {
          const config = batchStatusConfig[status];
          const count = batches.filter((b) => b.status === status).length;
          return (
            <div key={status} className={`p-3 rounded-xl border ${config.color}`}>
              <div className="text-xs font-semibold">{config.label}</div>
              <div className="text-lg font-extrabold mt-1">{count}</div>
            </div>
          );
        })}
      </div>

      {/* Batches list */}
      <div className="space-y-4">
        {batches.map((b, i) => {
          const config = batchStatusConfig[b.status];
          return (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-stone-200 p-4 lg:p-5"
            >
              <div className="flex items-start gap-4 flex-wrap">
                <img src={b.image} alt={b.productName} className="size-20 rounded-xl object-cover shrink-0" />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-mono text-xs font-bold text-green-700">{b.id}</span>
                    <Badge className={`${config.color} border`}>{config.label}</Badge>
                    {!config.canSell && (
                      <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
                        <XCircle className="size-3 mr-1" /> Không được bán
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-bold text-base">{b.productName}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-xs text-stone-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="size-3.5 text-stone-400" />
                      Thu hoạch: {b.harvestDate}
                    </div>
                    <div className="flex items-center gap-1">
                      <Package className="size-3.5 text-stone-400" />
                      {b.quantity} {b.unit}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="size-3.5 text-stone-400" />
                      {b.origin}
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="size-3.5 text-stone-400" />
                      {b.inspector === "—" ? "Chưa phân công" : b.inspector}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-stone-500 mb-1">Ngày kiểm tra</div>
                  <div className="font-bold text-sm">{b.inspectionDate}</div>
                </div>
              </div>

              {/* History timeline */}
              <div className="mt-4 pt-4 border-t border-stone-100">
                <div className="text-xs font-semibold text-stone-700 mb-2 flex items-center gap-1.5">
                  <History className="size-3.5" /> Lịch sử thay đổi
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {b.history.map((h, j) => (
                    <div key={j} className="flex items-center gap-2 shrink-0">
                      {j > 0 && <div className="w-4 h-px bg-stone-300" />}
                      <div className="bg-stone-50 rounded-lg px-3 py-1.5">
                        <div className="text-xs font-semibold">{h.action}</div>
                        <div className="text-[10px] text-stone-500">{h.date} · {h.user}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {b.status === "pending" && (
                <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-stone-700 flex items-start gap-2">
                  <AlertTriangle className="size-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>Lô hàng đang chờ kiểm tra. Sẽ không được mở bán cho đến khi đạt yêu cầu.</span>
                </div>
              )}
              {b.status === "inspecting" && (
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-stone-700 flex items-start gap-2">
                  <Clock className="size-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>Lô đang được kiểm tra chi tiết. AI phát hiện dấu hiệu bất thường cần kiểm tra thêm.</span>
                </div>
              )}
              {b.status === "quarantined" && (
                <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-3 text-xs text-stone-700 flex items-start gap-2">
                  <AlertTriangle className="size-4 text-orange-600 shrink-0 mt-0.5" />
                  <span>Lô đang bị cách ly để kiểm tra thêm. Liên hệ AgriSmart để biết chi tiết.</span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </SellerLayout>
  );
}

// ============================================
// SELLER ORDERS
// ============================================
export function SellerOrdersPage() {
  return (
    <SellerLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Đơn hàng</h1>
        <p className="text-sm text-stone-500">Quản lý đơn hàng từ người mua</p>
      </div>

      <div className="space-y-3">
        {sellerOrders.map((o, i) => {
          const config = orderStatusConfig[o.status];
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
                    <span className="font-mono">{o.id}</span>
                    <Badge className={config.color}>{config.label}</Badge>
                  </div>
                  <div className="text-xs text-stone-500 mt-1">{o.placedAt} · {o.paymentMethod}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-700">{formatPrice(o.total)}</div>
                  <div className="text-xs text-stone-500">Phí: {formatPrice(o.fee)} · Thực nhận: {formatPrice(o.net)}</div>
                </div>
              </div>

              <div className="text-sm font-semibold">{o.customer} · {o.address}</div>

              <div className="space-y-2 mt-3">
                {o.items.map((item, j) => (
                  <div key={j} className="flex items-center gap-3 p-2 bg-stone-50 rounded-lg">
                    <img src={item.image} alt={item.productName} className="size-12 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm line-clamp-1">{item.productName}</div>
                      <div className="text-xs text-stone-500">
                        SL: {item.qty} · Lô: {item.batchId}
                      </div>
                    </div>
                    <div className="font-bold text-sm">{formatPrice(item.price * item.qty)}</div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline">Chi tiết</Button>
                <Button size="sm" variant="outline" className="border-green-600 text-green-700 hover:bg-green-50">
                  In đơn
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </SellerLayout>
  );
}

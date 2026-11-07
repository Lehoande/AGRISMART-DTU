"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Home as HomeIcon,
  ChevronRight,
  Package,
  Star,
  CheckCircle2,
  Clock,
  Truck,
  Brain,
  ShieldCheck,
  Boxes,
  Snowflake,
  MapPin,
  ArrowRight,
  Camera,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNav } from "@/lib/nav-store";
import {
  sellerOrders,
  orderStatusConfig,
  orderTimeline,
  formatPrice,
  type OrderStatus,
} from "@/lib/agri-data";
import { BuyerHeader } from "@/components/agri/buyer-header";

// ============================================
// ORDERS LIST
// ============================================
const buyerOrdersMock = sellerOrders.map((o) => ({
  ...o,
  items: o.items.map((it) => ({ ...it, image: it.image })),
}));

export function BuyerOrdersPage() {
  const navigate = useNav((s) => s.navigate);

  return (
    <div className="min-h-screen bg-stone-50 pb-20 lg:pb-12">
      <BuyerHeader />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 text-xs text-stone-500 mb-6">
          <button onClick={() => navigate("buyer-home")} className="flex items-center gap-1 hover:text-green-600">
            <HomeIcon className="size-3.5" /> Trang chủ
          </button>
          <ChevronRight className="size-3" />
          <span className="text-stone-900 font-semibold">Đơn hàng</span>
        </div>

        <h1 className="text-3xl font-bold mb-1">Đơn hàng của tôi</h1>
        <p className="text-sm text-stone-500 mb-6">Theo dõi trạng thái và lịch sử đơn hàng</p>

        <div className="space-y-4">
          {buyerOrdersMock.map((order) => {
            const status = orderStatusConfig[order.status];
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-stone-200 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                  <div>
                    <div className="font-bold text-base flex items-center gap-2">
                      {order.id}
                      <Badge className={status.color}>{status.label}</Badge>
                    </div>
                    <div className="text-xs text-stone-500 mt-1">Đặt lúc: {order.placedAt}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-700 text-lg">{formatPrice(order.total)}</div>
                    <div className="text-xs text-stone-500">{order.paymentMethod}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="size-9">
                    <AvatarImage src={order.customerAvatar} />
                    <AvatarFallback>{order.customer.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="text-sm">
                    <div className="font-semibold">{order.customer}</div>
                    <div className="text-xs text-stone-500 flex items-center gap-1">
                      <MapPin className="size-3" /> {order.address}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 bg-stone-50 rounded-lg">
                      <img src={item.image} alt={item.productName} className="size-12 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm line-clamp-1">{item.productName}</div>
                        <div className="text-xs text-stone-500">
                          {item.qty} × {formatPrice(item.price)} · Lô: {item.batchId}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate("buyer-product-detail", { productId: item.productId })}
                        className="text-xs"
                      >
                        Xem lại
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    onClick={() => navigate("buyer-order-tracking", { orderId: order.id })}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Truck className="size-4 mr-1" /> Theo dõi đơn
                  </Button>
                  {order.status === "delivered" && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate("buyer-review", { orderId: order.id })}
                        className="border-amber-500 text-amber-700 hover:bg-amber-50"
                      >
                        <Star className="size-4 mr-1" /> Đánh giá
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate("buyer-complaint", { orderId: order.id })}
                        className="border-red-500 text-red-700 hover:bg-red-50"
                      >
                        <MessageSquare className="size-4 mr-1" /> Khiếu nại
                      </Button>
                    </>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================
// ORDER TRACKING - timeline
// ============================================
export function BuyerOrderTrackingPage() {
  const navigate = useNav((s) => s.navigate);
  const orderId = useNav((s) => s.selectedOrderId);
  const order = buyerOrdersMock.find((o) => o.id === orderId) || buyerOrdersMock[0];
  // giả sử đơn hiện đang ở bước "shipping" (index 5)
  const currentStepIdx: number = orderTimeline.indexOf(order.status as OrderStatus) >= 0 ? orderTimeline.indexOf(order.status as OrderStatus) : 5;

  const stepIcons = [Clock, Brain, ShieldCheck, Package, Snowflake, Truck, CheckCircle2];
  const stepLabels = orderTimeline.map((s) => orderStatusConfig[s].label);

  return (
    <div className="min-h-screen bg-stone-50 pb-20 lg:pb-12">
      <BuyerHeader />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 text-xs text-stone-500 mb-6">
          <button onClick={() => navigate("buyer-home")} className="flex items-center gap-1 hover:text-green-600">
            <HomeIcon className="size-3.5" /> Trang chủ
          </button>
          <ChevronRight className="size-3" />
          <button onClick={() => navigate("buyer-orders")} className="hover:text-green-600">Đơn hàng</button>
          <ChevronRight className="size-3" />
          <span className="text-stone-900 font-semibold">Theo dõi</span>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-6">
          <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
            <div>
              <div className="font-bold text-xl flex items-center gap-2">
                {order.id}
                <Badge className={orderStatusConfig[order.status].color}>
                  {orderStatusConfig[order.status].label}
                </Badge>
              </div>
              <div className="text-xs text-stone-500 mt-1">Đặt lúc: {order.placedAt}</div>
            </div>
            <div className="text-right">
              <div className="font-bold text-green-700 text-lg">{formatPrice(order.total)}</div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mt-3">
            <div className="flex items-start gap-2">
              <ShieldCheck className="size-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-sm text-stone-700">
                <strong>AgriSmart đang chịu trách nhiệm bảo quản đơn hàng</strong> trong suốt quá trình xử lý. Đơn hàng được giữ ở nhiệt độ phù hợp với từng loại nông sản.
              </p>
            </div>
          </div>
        </div>

        {/* TIMELINE */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-6">
          <h2 className="font-bold text-lg mb-6">Hành trình đơn hàng</h2>
          <div className="space-y-4">
            {stepLabels.map((label, i) => {
              const Icon = stepIcons[i];
              const isDone = i < currentStepIdx;
              const isCurrent = i === currentStepIdx;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="relative flex flex-col items-center">
                    <div
                      className={`size-10 rounded-full flex items-center justify-center shrink-0 ${
                        isDone
                          ? "bg-green-600 text-white"
                          : isCurrent
                          ? "bg-amber-500 text-white animate-pulse"
                          : "bg-stone-100 text-stone-400"
                      }`}
                    >
                      <Icon className="size-5" />
                    </div>
                    {i < stepLabels.length - 1 && (
                      <div className={`w-0.5 h-12 mt-1 ${isDone ? "bg-green-600" : "bg-stone-200"}`} />
                    )}
                  </div>
                  <div className="pt-2">
                    <div className={`font-bold text-sm ${isDone || isCurrent ? "text-stone-900" : "text-stone-400"}`}>
                      {label}
                    </div>
                    {isDone && (
                      <div className="text-xs text-green-600 mt-0.5">✓ Đã hoàn thành</div>
                    )}
                    {isCurrent && (
                      <div className="text-xs text-amber-600 mt-0.5">⏳ Đang xử lý...</div>
                    )}
                    {!isDone && !isCurrent && (
                      <div className="text-xs text-stone-400 mt-0.5">Chờ xử lý</div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Items */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h2 className="font-bold text-lg mb-4">Sản phẩm trong đơn</h2>
          <div className="space-y-3">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-2 bg-stone-50 rounded-lg">
                <img src={item.image} alt={item.productName} className="size-14 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{item.productName}</div>
                  <div className="text-xs text-stone-500">SL: {item.qty} · Lô: {item.batchId}</div>
                </div>
                <div className="font-bold text-sm text-green-700">{formatPrice(item.price * item.qty)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// REVIEW PAGE
// ============================================
export function BuyerReviewPage() {
  const navigate = useNav((s) => s.navigate);
  const orderId = useNav((s) => s.selectedOrderId);
  const order = buyerOrdersMock.find((o) => o.id === orderId) || buyerOrdersMock[0];
  const [ratings, setRatings] = useState({
    overall: 5,
    quality: 5,
    freshness: 5,
    packaging: 5,
    delivery: 5,
  });
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const reviewCategories = [
    { key: "quality", label: "Chất lượng sản phẩm" },
    { key: "freshness", label: "Độ tươi" },
    { key: "packaging", label: "Đóng gói" },
    { key: "delivery", label: "Giao hàng" },
  ] as const;

  if (submitted) {
    return (
      <div className="min-h-screen bg-stone-50 pb-20 lg:pb-12">
        <BuyerHeader />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring" }}
            className="size-24 rounded-full bg-green-100 flex items-center justify-center mb-6 mx-auto"
          >
            <CheckCircle2 className="size-12 text-green-600" />
          </motion.div>
          <h1 className="text-2xl font-bold mb-2">Cảm ơn đánh giá của bạn!</h1>
          <p className="text-stone-500 mb-6">Đánh giá của bạn giúp cộng đồng mua sắm an tâm hơn.</p>
          <Button onClick={() => navigate("buyer-orders")} className="bg-green-600 hover:bg-green-700 h-12 px-8">
            Về danh sách đơn hàng
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-20 lg:pb-12">
      <BuyerHeader />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 text-xs text-stone-500 mb-6">
          <button onClick={() => navigate("buyer-home")} className="flex items-center gap-1 hover:text-green-600">
            <HomeIcon className="size-3.5" /> Trang chủ
          </button>
          <ChevronRight className="size-3" />
          <button onClick={() => navigate("buyer-orders")} className="hover:text-green-600">Đơn hàng</button>
          <ChevronRight className="size-3" />
          <span className="text-stone-900 font-semibold">Đánh giá</span>
        </div>

        <h1 className="text-3xl font-bold mb-1">Đánh giá sản phẩm</h1>
        <p className="text-sm text-stone-500 mb-6">
          Đơn hàng <strong className="text-green-700">{order.id}</strong> đã hoàn thành. Hãy chia sẻ trải nghiệm của bạn.
        </p>

        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-6">
          {/* Products */}
          <div className="space-y-2">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-2 bg-stone-50 rounded-lg">
                <img src={item.image} alt={item.productName} className="size-12 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm line-clamp-1">{item.productName}</div>
                  <div className="text-xs text-stone-500">SL: {item.qty} · Lô: {item.batchId}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Overall rating */}
          <div className="text-center py-4 border-y border-stone-100">
            <Label className="text-base font-bold mb-2 block">Đánh giá tổng thể</Label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRatings({ ...ratings, overall: star })}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`size-10 ${
                      star <= ratings.overall
                        ? "fill-amber-400 text-amber-400"
                        : "text-stone-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            <div className="text-sm font-semibold mt-2 text-amber-600">
              {["", "Rất tệ", "Tệ", "Bình thường", "Tốt", "Tuyệt vời"][ratings.overall]}
            </div>
          </div>

          {/* Detail ratings */}
          <div className="space-y-4">
            {reviewCategories.map((cat) => (
              <div key={cat.key} className="flex items-center justify-between">
                <span className="text-sm font-medium">{cat.label}</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRatings({ ...ratings, [cat.key]: star })}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`size-6 ${
                          star <= ratings[cat.key]
                            ? "fill-amber-400 text-amber-400"
                            : "text-stone-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Comment */}
          <div>
            <Label className="text-sm font-semibold mb-2 block">Nhận xét chi tiết</Label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
              className="min-h-[120px]"
            />
          </div>

          {/* Upload images */}
          <div>
            <Label className="text-sm font-semibold mb-2 block">Hình ảnh (tùy chọn)</Label>
            <div className="border-2 border-dashed border-stone-300 rounded-xl p-6 text-center hover:border-green-500 transition cursor-pointer">
              <Camera className="size-8 text-stone-400 mx-auto mb-2" />
              <p className="text-sm text-stone-500">Kéo thả hoặc bấm để tải ảnh lên</p>
              <p className="text-xs text-stone-400 mt-1">PNG, JPG tối đa 5MB</p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-stone-700">
            <strong>Lưu ý:</strong> Bạn chỉ có thể đánh giá sau khi đơn hàng đã hoàn thành. Đánh giá sẽ được hiển thị công khai trên trang sản phẩm.
          </div>

          <Button
            onClick={() => setSubmitted(true)}
            size="lg"
            className="w-full h-12 bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/30"
          >
            <Star className="size-5 mr-2" /> Gửi đánh giá
          </Button>
        </div>
      </div>
    </div>
  );
}

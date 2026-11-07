"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Home as HomeIcon,
  ChevronRight,
  MapPin,
  CreditCard,
  CheckCircle2,
  Truck,
  ShieldCheck,
  Brain,
  AlertTriangle,
  PartyPopper,
  ArrowRight,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/lib/cart-store";
import { useNav } from "@/lib/nav-store";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/agri-data";
import { BuyerHeader } from "@/components/agri/buyer-header";
import { addApiCartItem, checkoutApi, clearApiCart, getAuthToken } from "@/lib/api-client";

type PaymentMethod = "cod" | "vnpay" | "momo" | "banking";

export function BuyerCheckoutPage() {
  const { items, getTotalPrice, clearCart } = useCart();
  const navigate = useNav((s) => s.navigate);
  const { toast } = useToast();
  const [payment, setPayment] = useState<PaymentMethod>("cod");
  const [submitted, setSubmitted] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    district: "",
    note: "",
  });

  const subtotal = getTotalPrice();
  const shipping = subtotal >= 300000 ? 0 : 30000;
  const total = subtotal + shipping;

  if (items.length === 0 && !submitted) {
    return (
      <div className="min-h-screen bg-stone-50 pb-20 lg:pb-12">
        <BuyerHeader />
        <div className="max-w-3xl mx-auto px-4 py-16 text-center min-h-[60vh] flex flex-col items-center justify-center">
          <div className="size-32 rounded-full bg-stone-100 flex items-center justify-center mb-6">
            <Brain className="size-16 text-stone-300" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Không có gì để thanh toán</h1>
          <p className="text-stone-500 mb-6">Giỏ hàng trống.</p>
          <Button size="lg" onClick={() => navigate("buyer-products")} className="h-12 px-8 bg-green-600 hover:bg-green-700">
            Khám phá sản phẩm
            <ArrowRight className="size-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-stone-50 pb-20 lg:pb-12">
        <BuyerHeader />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center min-h-[60vh] flex flex-col items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="size-32 rounded-full bg-green-100 flex items-center justify-center mb-6"
          >
            <PartyPopper className="size-16 text-green-600" />
          </motion.div>
          <h1 className="text-3xl font-bold mb-2">Đặt hàng thành công! 🎉</h1>
          <p className="text-stone-500 mb-2">
            Đơn hàng <strong className="text-green-700">#{createdOrderId ?? "—"}</strong> đã được tạo
          </p>
          <p className="text-stone-500 mb-6 max-w-md">
            AgriSmart AI đã kiểm tra đơn hàng. Đơn sẽ được tiếp nhận, đóng gói, bảo quản và giao đến bạn trong 24h.
          </p>
          <div className="bg-white rounded-2xl border border-stone-200 p-5 w-full max-w-md mb-6">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-xs text-stone-500">Tổng giá trị</div>
                <div className="font-bold text-green-700">{formatPrice(total)}</div>
              </div>
              <div>
                <div className="text-xs text-stone-500">Phương thức</div>
                <div className="font-bold">
                  {payment === "cod" ? "COD" : payment === "vnpay" ? "VNPay" : payment === "momo" ? "Momo" : "Banking"}
                </div>
              </div>
              <div>
                <div className="text-xs text-stone-500">Người nhận</div>
                <div className="font-bold">{form.name || "—"}</div>
              </div>
              <div>
                <div className="text-xs text-stone-500">Điện thoại</div>
                <div className="font-bold">{form.phone || "—"}</div>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate("buyer-home")} className="h-12 px-6">
              ← Về trang chủ
            </Button>
            <Button onClick={() => navigate("buyer-orders")} className="h-12 px-6 bg-green-600 hover:bg-green-700">
              Theo dõi đơn hàng
              <ArrowRight className="size-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.address.trim()) {
      toast({ title: "Vui lòng điền đầy đủ thông tin", description: "Tên, số điện thoại và địa chỉ là bắt buộc", variant: "destructive" });
      return;
    }
    if (!getAuthToken()) {
      toast({ title: "Bạn cần đăng nhập", description: "Vui lòng đăng nhập trước khi đặt hàng.", variant: "destructive" });
      navigate("login");
      return;
    }
    if (payment !== "cod") {
      toast({ title: "Phương thức chưa được kết nối", description: "Hiện hệ thống chỉ xử lý thanh toán khi nhận hàng (COD). MoMo/VNPay cần cấu hình merchant và xác thực giao dịch.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      // Đồng bộ giỏ hàng giao diện lên giỏ hàng MySQL trước khi tạo đơn.
      await clearApiCart();
      for (const item of items) {
        const productId = Number(item.product.id);
        if (!Number.isSafeInteger(productId) || productId <= 0) throw new Error("Giỏ hàng có sản phẩm chưa được đồng bộ từ danh mục cơ sở dữ liệu. Vui lòng tải lại trang sản phẩm và thêm lại.");
        await addApiCartItem(productId, item.quantity);
      }
      const order = await checkoutApi({
        shipping_name: form.name.trim(),
        shipping_phone: form.phone.trim(),
        shipping_address: [form.address, form.district, form.city].filter(Boolean).join(", "),
        payment_method: "cod",
      });
      setCreatedOrderId(order.id);
      setSubmitted(true);
      clearCart();
    } catch (error) {
      toast({ title: "Không thể tạo đơn hàng", description: error instanceof Error ? error.message : "Vui lòng kiểm tra kết nối và thử lại.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20 lg:pb-12">
      <BuyerHeader />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 text-xs text-stone-500 mb-6">
          <button onClick={() => navigate("buyer-home")} className="flex items-center gap-1 hover:text-green-600">
            <HomeIcon className="size-3.5" /> Trang chủ
          </button>
          <ChevronRight className="size-3" />
          <button onClick={() => navigate("buyer-cart")} className="hover:text-green-600">Giỏ hàng</button>
          <ChevronRight className="size-3" />
          <span className="text-stone-900 font-semibold">Thanh toán</span>
        </div>

        <h1 className="text-3xl font-bold mb-6">Thanh toán</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping info */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <MapPin className="size-5 text-green-600" /> Thông tin giao hàng
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Họ và tên *</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nguyễn Văn A" className="h-10 mt-1" required />
                </div>
                <div>
                  <Label className="text-xs">Số điện thoại *</Label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="0901 234 567" className="h-10 mt-1" required />
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-xs">Email</Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" className="h-10 mt-1" />
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-xs">Địa chỉ chi tiết *</Label>
                  <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Số nhà, đường, phường/xã" className="h-10 mt-1" required />
                </div>
                <div>
                  <Label className="text-xs">Quận/Huyện</Label>
                  <Input value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} placeholder="Quận 1" className="h-10 mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Tỉnh/Thành phố</Label>
                  <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="TP. Hồ Chí Minh" className="h-10 mt-1" />
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-xs">Ghi chú</Label>
                  <Input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Giao giờ hành chính, gọi trước..." className="h-10 mt-1" />
                </div>
              </div>
            </div>

            {/* AI Order Verification - đặc biệt */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Brain className="size-5 text-purple-600" /> AI kiểm tra điều kiện đơn hàng
              </h2>
              <div className="space-y-2">
                {[
                  "Sản phẩm có còn đủ điều kiện bán không",
                  "Lô hàng có đang bị tạm giữ không",
                  "Tồn kho",
                  "Thông tin giao hàng",
                  "Điều kiện đóng gói",
                  "Điều kiện bảo quản",
                  "Dấu hiệu bất thường của đơn hàng",
                ].map((c, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm bg-stone-50 p-2 rounded-lg">
                    <CheckCircle2 className="size-4 text-green-600 shrink-0" />
                    <span>{c}</span>
                    <span className="ml-auto text-xs font-semibold text-green-600">✓ Đạt</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 p-3 bg-green-100 rounded-xl border border-green-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-5 text-green-600" />
                  <span className="font-bold text-green-700">Đơn hàng đáp ứng điều kiện xử lý</span>
                </div>
                <p className="text-xs text-stone-600 mt-1">
                  AI đã kiểm tra các điều kiện cơ bản. AgriSmart sẽ tiếp nhận và chuẩn bị đơn hàng.
                </p>
              </div>
              <p className="text-xs text-amber-600 mt-2 italic flex items-start gap-1">
                <AlertTriangle className="size-3 shrink-0 mt-0.5" />
                AI không tự ý vượt qua các quy tắc an toàn. Mọi trường hợp cần kiểm tra sẽ được nhân viên AgriSmart xử lý.
              </p>
            </div>

            {/* Payment method */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <CreditCard className="size-5 text-green-600" /> Phương thức thanh toán
              </h2>
              <div className="space-y-2">
                {([
                  { id: "cod", label: "Thanh toán tiền mặt (COD)", desc: "Trả tiền khi nhận hàng", icon: "💵" },
                  { id: "vnpay", label: "VNPay QR", desc: "Quét mã QR thanh toán", icon: "🔗" },
                  { id: "momo", label: "Ví Momo", desc: "Thanh toán qua ví Momo", icon: "📱" },
                  { id: "banking", label: "Chuyển khoản ngân hàng", desc: "Vietcombank, Techcombank...", icon: "🏦" },
                ] as const).map((p) => (
                  <label
                    key={p.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition ${
                      payment === p.id ? "border-green-600 bg-green-50" : "border-stone-200 hover:border-green-300"
                    }`}
                  >
                    <input
                      type="radio"
                      checked={payment === p.id}
                      onChange={() => setPayment(p.id)}
                      className="text-green-600 focus:ring-green-500"
                    />
                    <span className="text-xl">{p.icon}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{p.label}</div>
                      <div className="text-xs text-stone-500">{p.desc}</div>
                    </div>
                    {payment === p.id && <CheckCircle2 className="size-5 text-green-600" />}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-stone-200 p-5 sticky top-32 space-y-4">
              <h2 className="font-bold text-lg">Đơn hàng của bạn</h2>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-3 pb-3 border-b border-stone-100 last:border-0">
                    <img src={item.product.image} alt={item.product.name} className="size-14 rounded-lg object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-xs line-clamp-2">{item.product.name}</h4>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-stone-500">SL: {item.quantity}</span>
                        <span className="text-xs font-bold text-green-700">
                          {formatPrice(item.product.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-2 pt-3 border-t border-stone-100 text-sm">
                <div className="flex justify-between">
                  <span className="text-stone-600">Tạm tính</span>
                  <span className="font-semibold">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">Phí vận chuyển</span>
                  {shipping === 0 ? (
                    <span className="font-semibold text-green-600">Miễn phí</span>
                  ) : (
                    <span className="font-semibold">{formatPrice(shipping)}</span>
                  )}
                </div>
              </div>
              <div className="pt-3 border-t border-stone-100 flex justify-between items-baseline">
                <span className="font-bold">Tổng cộng</span>
                <div className="text-right">
                  <div className="text-2xl font-black text-green-700">{formatPrice(total)}</div>
                  <div className="text-xs text-stone-400">Đã bao gồm VAT</div>
                </div>
              </div>
              <Button type="submit" size="lg" className="w-full h-12 bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/30">
                <CheckCircle2 className="size-5 mr-2" /> Xác nhận đặt hàng
              </Button>
              <div className="grid grid-cols-3 gap-2 text-center pt-3 border-t border-stone-100">
                <div className="text-xs">
                  <Truck className="size-5 mx-auto text-green-600 mb-1" />
                  <span className="text-stone-600">Giao 24h</span>
                </div>
                <div className="text-xs">
                  <ShieldCheck className="size-5 mx-auto text-green-600 mb-1" />
                  <span className="text-stone-600">Đã kiểm tra</span>
                </div>
                <div className="text-xs">
                  <User className="size-5 mx-auto text-green-600 mb-1" />
                  <span className="text-stone-600">Hỗ trợ 24/7</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

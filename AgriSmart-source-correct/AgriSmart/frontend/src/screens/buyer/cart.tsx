"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  Trash2,
  Minus,
  Plus,
  ShoppingBag,
  ArrowRight,
  Home as HomeIcon,
  ChevronRight,
  Truck,
  Tag,
  ShieldCheck,
  Brain,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/lib/cart-store";
import { useNav } from "@/lib/nav-store";
import { formatPrice, STANDARD_SHIPPING_FEE, FREE_SHIPPING_THRESHOLD } from "@/lib/agri-data";
import { BuyerHeader } from "@/components/agri/buyer-header";
import { validatePromotion } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";

export function BuyerCartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice, getTotalItems, promoCode, promoPercent, setPromotion } = useCart();
  const navigate = useNav((s) => s.navigate);
  const { toast } = useToast();
  const [promo, setPromo] = useState(promoCode || "");

  const subtotal = getTotalPrice();
  const discount = Math.round(subtotal * promoPercent / 100);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
  const total = subtotal - discount + shipping;

  const applyPromo = async () => {
    try {
      const result = await validatePromotion(promo);
      setPromotion(result.code, Number(result.discount_percent));
      setPromo(result.code);
      toast({ title: "Đã áp dụng mã", description: `Giảm ${result.discount_percent}%` });
    } catch (error) {
      setPromotion(null);
      toast({ title: "Mã không hợp lệ", description: error instanceof Error ? error.message : "Vui lòng thử mã khác.", variant: "destructive" });
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50 pb-20 lg:pb-12">
        <BuyerHeader />
        <div className="max-w-3xl mx-auto px-4 py-16 text-center min-h-[60vh] flex flex-col items-center justify-center">
          <div className="size-32 rounded-full bg-stone-100 flex items-center justify-center mb-6">
            <ShoppingBag className="size-16 text-stone-300" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Giỏ hàng trống</h1>
          <p className="text-stone-500 mb-6">Hãy khám phá nông sản tươi sạch!</p>
          <Button size="lg" onClick={() => navigate("buyer-products")} className="h-12 px-8 bg-green-600 hover:bg-green-700">
            Khám phá sản phẩm
            <ArrowRight className="size-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-20 lg:pb-12">
      <BuyerHeader />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 text-xs text-stone-500 mb-6">
          <button onClick={() => navigate("buyer-home")} className="flex items-center gap-1 hover:text-green-600">
            <HomeIcon className="size-3.5" /> Trang chủ
          </button>
          <ChevronRight className="size-3" />
          <span className="text-stone-900 font-semibold">Giỏ hàng</span>
        </div>

        <h1 className="text-3xl font-bold mb-1">Giỏ hàng của bạn</h1>
        <p className="text-sm text-stone-500 mb-6">Bạn có {getTotalItems()} sản phẩm trong giỏ</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-2xl border border-stone-200 p-4 flex gap-4"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="size-24 sm:size-28 rounded-xl object-cover shrink-0 cursor-pointer"
                    onError={(event) => {
                      if (!event.currentTarget.src.endsWith("/product-placeholder.svg")) event.currentTarget.src = "/product-placeholder.svg";
                    }}
                    onClick={() => navigate("buyer-product-detail", { productId: item.product.id })}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm sm:text-base line-clamp-2">{item.product.name}</h3>
                        <p className="text-xs text-stone-500 mt-0.5">{item.product.seller}</p>
                        <p className="text-xs text-stone-400 mt-0.5 flex items-center gap-1">
                          <Tag className="size-3" /> {item.product.certLabel} · {item.product.unit}
                        </p>
                        <Badge variant="outline" className="mt-1 text-[10px] bg-green-50 text-green-700 border-green-200">
                          <ShieldCheck className="size-2.5 mr-1" /> Thông tin người bán khai báo
                        </Badge>
                      </div>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="text-stone-400 hover:text-red-500 p-1"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>

                    <div className="flex items-end justify-between mt-3">
                      <div className="flex items-center gap-1 bg-white border border-stone-200 rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="size-8 flex items-center justify-center hover:bg-stone-50 rounded-l-lg text-stone-600"
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="w-10 text-center font-bold text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="size-8 flex items-center justify-center hover:bg-stone-50 rounded-r-lg text-stone-600"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-700">
                          {formatPrice(item.product.price * item.quantity)}
                        </div>
                        <div className="text-xs text-stone-400">
                          {formatPrice(item.product.price)} / {item.product.unit}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <Button
              variant="outline"
              onClick={() => navigate("buyer-products")}
              className="w-full h-12 border-green-600 text-green-700 hover:bg-green-50"
            >
              ← Tiếp tục mua sắm
            </Button>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-stone-200 p-5 sticky top-32 space-y-4">
              <h2 className="font-bold text-lg">Tóm tắt đơn hàng</h2>

              {/* AI kiểm tra đơn */}
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="size-4 text-purple-600" />
                  <span className="text-sm font-bold text-purple-700">Kiểm tra trước khi đặt hàng</span>
                </div>
                <div className="space-y-1 text-xs text-stone-700">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-3 text-green-600" /> Sản phẩm và tồn kho sẽ được kiểm tra lại khi đặt hàng
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-3 text-green-600" /> Giá và số lượng được xác nhận từ hệ thống
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-3 text-green-600" /> Tồn kho đầy đủ
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-3 text-green-600" /> Thông tin giao hàng được kiểm tra ở bước tiếp theo
                  </div>
                </div>
                <div className="mt-2 p-2 bg-green-100 rounded text-xs font-semibold text-green-700 flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5" />
                  Đơn hàng đáp ứng điều kiện xử lý
                </div>
                <p className="text-[10px] text-stone-500 mt-1.5 italic">
                  Đơn chỉ được tạo nếu sản phẩm còn bán và đủ tồn kho tại thời điểm đặt.
                </p>
              </div>

              {/* Promo */}
              <div>
                <Label className="text-xs font-semibold text-stone-600 mb-1.5 block">Mã giảm giá</Label>
                <div className="flex gap-2">
                  <Input
                    value={promo}
                    onChange={(e) => setPromo(e.target.value)}
                    placeholder="Nhập mã khuyến mãi"
                    className="h-10"
                  />
                  <Button
                    variant="outline"
                    onClick={applyPromo}
                    className="h-10 shrink-0"
                    disabled={!promo.trim()}
                  >
                    Áp dụng
                  </Button>
                </div>
                {promoCode && (
                  <Badge className="mt-2 bg-green-100 text-green-700 hover:bg-green-100">
                    ✓ Đã áp dụng {promoCode} · giảm {promoPercent}%
                  </Badge>
                )}
              </div>

              <div className="space-y-2 pt-3 border-t border-stone-100 text-sm">
                <div className="flex justify-between">
                  <span className="text-stone-600">Tạm tính</span>
                  <span className="font-semibold">{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá</span>
                    <span className="font-semibold">-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-stone-600">Phí vận chuyển</span>
                  {shipping === 0 ? (
                    <span className="font-semibold text-green-600">Miễn phí</span>
                  ) : (
                    <span className="font-semibold">{formatPrice(shipping)}</span>
                  )}
                </div>
                {subtotal < 300000 && (
                  <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">
                    💡 Mua thêm {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} để được miễn phí vận chuyển
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-stone-100 flex justify-between items-baseline">
                <span className="font-bold">Tổng cộng</span>
                <div className="text-right">
                  <div className="text-2xl font-black text-green-700">{formatPrice(total)}</div>
                  <div className="text-xs text-stone-400">Tạm tính sản phẩm và phí vận chuyển</div>
                </div>
              </div>

              <Button
                size="lg"
                onClick={() => navigate("buyer-checkout")}
                className="w-full h-12 bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/30"
              >
                Tiến hành thanh toán
                <ArrowRight className="size-4 ml-2" />
              </Button>

              <div className="grid grid-cols-3 gap-2 text-center pt-3 border-t border-stone-100">
                <div className="text-xs">
                  <Truck className="size-5 mx-auto text-green-600 mb-1" />
                  <span className="text-stone-600">Phí giao hiển thị trước</span>
                </div>
                <div className="text-xs">
                  <ShieldCheck className="size-5 mx-auto text-green-600 mb-1" />
                  <span className="text-stone-600">Nguồn gốc do người bán khai báo</span>
                </div>
                <div className="text-xs">
                  <Tag className="size-5 mx-auto text-green-600 mb-1" />
                  <span className="text-stone-600">Theo dõi đơn trong tài khoản</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

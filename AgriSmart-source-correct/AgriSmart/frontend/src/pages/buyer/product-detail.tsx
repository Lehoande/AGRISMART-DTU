"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Star,
  ShoppingCart,
  MapPin,
  ShieldCheck,
  Truck,
  Award,
  Sprout,
  Calendar,
  Home as HomeIcon,
  ChevronRight,
  Minus,
  Plus,
  Heart,
  Share2,
  Leaf,
  QrCode,
  CheckCircle2,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/lib/cart-store";
import { useNav } from "@/lib/nav-store";
import { products, formatPrice } from "@/lib/agri-data";
import { ProductCard } from "@/components/agri/product-card";
import { BuyerHeader } from "@/components/agri/buyer-header";

export function BuyerProductDetailPage() {
  const productId = useNav((s) => s.selectedProductId);
  const navigate = useNav((s) => s.navigate);
  const { toast } = useToast();
  const addItem = useCart((s) => s.addItem);
  const [qty, setQty] = useState(1);
  const [liked, setLiked] = useState(false);

  const product = products.find((p) => p.id === productId) || products[0];

  const badgeClass =
    product.cert === "organic"
      ? "badge-organic"
      : product.cert === "ocop"
      ? "badge-ocop"
      : product.cert === "globalgap"
      ? "badge-globalgap"
      : "badge-vietgap";

  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleAdd = () => {
    addItem(product, qty);
    toast({ title: "Đã thêm vào giỏ hàng", description: `${product.name} × ${qty}` });
  };

  const handleBuyNow = () => {
    addItem(product, qty);
    navigate("buyer-checkout");
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20 lg:pb-12">
      <BuyerHeader />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-stone-500 mb-6 flex-wrap">
          <button onClick={() => navigate("buyer-home")} className="flex items-center gap-1 hover:text-green-600">
            <HomeIcon className="size-3.5" /> Trang chủ
          </button>
          <ChevronRight className="size-3" />
          <button onClick={() => navigate("buyer-products")} className="hover:text-green-600">
            Sản phẩm
          </button>
          <ChevronRight className="size-3" />
          <span className="text-stone-900 font-semibold line-clamp-1">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 shadow-md">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              <span className={`absolute top-4 left-4 ${badgeClass} text-white text-xs font-bold px-3 py-1 rounded-full shadow`}>
                {product.certLabel}
              </span>
              {product.oldPrice && (
                <div className="absolute top-4 right-4 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-md shadow">
                  -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
                </div>
              )}
            </div>
            <div className="grid grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition ${
                    i === 1 ? "border-green-600" : "border-stone-200 hover:border-green-300"
                  }`}
                >
                  <img
                    src={product.image}
                    alt=""
                    className="w-full h-full object-cover"
                    style={{ filter: i === 2 ? "brightness(0.9)" : i === 3 ? "saturate(1.2)" : "none" }}
                  />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="bg-green-50 text-green-700 gap-1">
                  <Sprout className="size-3" /> {product.categoryLabel}
                </Badge>
                {product.isBestSeller && (
                  <Badge variant="secondary" className="bg-red-50 text-red-600">🔥 Bán chạy</Badge>
                )}
                {product.isNew && (
                  <Badge variant="secondary" className="bg-blue-50 text-blue-600">✨ Mới</Badge>
                )}
              </div>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-stone-900 leading-tight">
                {product.name}
              </h1>
              <div className="flex items-center gap-3 mt-3 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="size-4 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-stone-800">{product.rating}</span>
                  <span className="text-stone-500">({product.reviews} đánh giá)</span>
                </div>
                <span className="text-stone-300">|</span>
                <div className="flex items-center gap-1 text-stone-500">
                  <MapPin className="size-3.5 text-green-600" /> {product.regionLabel}
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-green-50 to-amber-50 border border-green-100">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-green-700">{formatPrice(product.price)}</span>
                <span className="text-sm text-stone-500">/ {product.unit}</span>
                {product.oldPrice && (
                  <span className="text-base text-stone-400 line-through ml-auto">
                    {formatPrice(product.oldPrice)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs text-emerald-700">
                <ShieldCheck className="size-4" />
                <span className="font-semibold">Còn {product.stock} {product.unit} - Sẵn sàng giao 24h</span>
              </div>
            </div>

            {/* AGRISMART VERIFIED SECTION - ĐẶC BIỆT */}
            <div className="verified-gradient rounded-2xl p-5 text-white shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="size-6 text-amber-300" />
                <h3 className="font-bold text-lg">AgriSmart Verified</h3>
                <Badge className="bg-amber-400 text-[#14532d] hover:bg-amber-400 ml-auto">Đã xác thực</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {[
                  "Thông tin lô hàng đầy đủ",
                  "Đã qua quy trình kiểm tra",
                  "Được AgriSmart tiếp nhận",
                  "Được bảo quản theo quy trình",
                ].map((c, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white/10 p-2 rounded-lg">
                    <CheckCircle2 className="size-4 text-amber-300 shrink-0" />
                    <span className="text-xs">{c}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-green-100 mt-3 italic">
                * AgriSmart Verified không phải là chứng nhận 100% an toàn tuyệt đối. Đây là xác nhận sản phẩm đã qua quy trình kiểm tra.
              </p>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-bold mb-2">Mô tả sản phẩm</h3>
              <p className="text-sm text-stone-600 leading-relaxed">{product.desc}</p>
            </div>

            {/* Lot info */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-white p-3 rounded-xl border border-stone-200">
                <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
                  <QrCode className="size-3.5" /> Mã lô
                </div>
                <div className="font-bold text-stone-900 text-sm">{product.batchId}</div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-stone-200">
                <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
                  <Calendar className="size-3.5" /> Ngày thu hoạch
                </div>
                <div className="font-semibold text-stone-900">{product.harvestDate}</div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-stone-200">
                <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
                  <ShieldCheck className="size-3.5" /> Ngày kiểm tra
                </div>
                <div className="font-semibold text-stone-900">{product.inspectionDate}</div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-stone-200">
                <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
                  <Award className="size-3.5" /> Người kiểm tra
                </div>
                <div className="font-semibold text-stone-900 text-xs">{product.inspector}</div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-stone-200">
                <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
                  <Truck className="size-3.5" /> Điều kiện bảo quản
                </div>
                <div className="font-semibold text-stone-900 text-xs">{product.storageCondition}</div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-stone-200">
                <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
                  <Sprout className="size-3.5" /> Người bán
                </div>
                <div className="font-semibold text-stone-900 text-xs">{product.seller}</div>
                <div className="flex items-center gap-1 text-xs text-amber-600 mt-1">
                  ★ {product.sellerRating} uy tín
                </div>
              </div>
            </div>

            {/* Quantity + actions */}
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-stone-700">Số lượng:</span>
                <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-xl">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="size-10 flex items-center justify-center hover:bg-stone-50 rounded-l-xl text-stone-600"
                  >
                    <Minus className="size-4" />
                  </button>
                  <span className="w-12 text-center font-bold">{qty}</span>
                  <button
                    onClick={() => setQty(qty + 1)}
                    className="size-10 flex items-center justify-center hover:bg-stone-50 rounded-r-xl text-stone-600"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
                <span className="text-sm text-stone-500 ml-auto">
                  Tổng:{" "}
                  <span className="font-bold text-green-700 text-base">
                    {formatPrice(product.price * qty)}
                  </span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleAdd}
                  className="h-12 border-green-600 text-green-700 hover:bg-green-50"
                >
                  <ShoppingCart className="size-5 mr-2" /> Thêm vào giỏ
                </Button>
                <Button
                  size="lg"
                  onClick={handleBuyNow}
                  className="h-12 bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/30"
                >
                  Mua ngay
                </Button>
              </div>

              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setLiked(!liked)} className="flex-1">
                  <Heart className={`size-4 mr-1 ${liked ? "fill-red-500 text-red-500" : ""}`} />
                  {liked ? "Đã yêu thích" : "Yêu thích"}
                </Button>
                <Button variant="ghost" size="sm" className="flex-1">
                  <Share2 className="size-4 mr-1" /> Chia sẻ
                </Button>
              </div>
            </div>

            <Separator />

            {/* Trust */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-green-50">
                <ShieldCheck className="size-6 mx-auto text-green-600" />
                <div className="text-xs font-semibold mt-1">Đã kiểm tra</div>
              </div>
              <div className="p-3 rounded-xl bg-amber-50">
                <Truck className="size-6 mx-auto text-amber-600" />
                <div className="text-xs font-semibold mt-1">Giao 24h</div>
              </div>
              <div className="p-3 rounded-xl bg-blue-50">
                <QrCode className="size-6 mx-auto text-blue-600" />
                <div className="text-xs font-semibold mt-1">QR truy xuất</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Sản phẩm tương tự</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

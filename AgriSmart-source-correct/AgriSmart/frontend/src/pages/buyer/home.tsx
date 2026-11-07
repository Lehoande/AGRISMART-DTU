"use client";
import { motion } from "framer-motion";
import {
  Leaf,
  Truck,
  QrCode,
  Handshake,
  ArrowRight,
  ShoppingCart,
  Sparkles,
  Brain,
  Quote,
  Users,
  Star,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/lib/cart-store";
import { useNav } from "@/lib/nav-store";
import {
  products,
  categories,
  testimonials,
  formatPrice,
} from "@/lib/agri-data";
import { ProductCard } from "@/components/agri/product-card";
import { BuyerHeader } from "@/components/agri/buyer-header";

export function BuyerHomePage() {
  const { toast } = useToast();
  const addItem = useCart((s) => s.addItem);
  const navigate = useNav((s) => s.navigate);

  const quickAdd = (productId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const product = products.find((p) => p.id === productId);
    if (product) {
      addItem(product);
      toast({ title: "Đã thêm vào giỏ hàng", description: product.name });
    }
  };

  const featured = products.filter((p) => p.isBestSeller).slice(0, 8);
  const fresh = products.filter((p) => p.isNew).slice(0, 4);

  return (
    <div className="min-h-screen bg-stone-50 pb-20 lg:pb-0">
      <BuyerHeader />
      <div className="pb-12">
        {/* HERO */}
        <section className="max-w-7xl mx-auto px-4 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2 relative rounded-3xl overflow-hidden shadow-xl bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] text-white flex items-center p-8 md:p-12 min-h-[380px]"
            >
              <div
                className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-overlay"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80')",
                }}
              />
              <div className="relative z-10 max-w-lg">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-500 text-[#14532d] mb-4 shadow">
                  <Leaf className="size-3.5 mr-1.5" /> 100% Nông sản đã qua kiểm tra
                </span>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-4">
                  Nông sản tươi ngon <br />
                  <span className="text-amber-400">AgriSmart Verified</span>
                </h1>
                <p className="text-green-100 text-sm md:text-base mb-6 leading-relaxed">
                  Mỗi sản phẩm đều có thông tin lô hàng minh bạch, đã qua kiểm tra chất lượng và được AgriSmart bảo quản đúng quy trình.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button
                    size="lg"
                    onClick={() => navigate("buyer-products")}
                    className="bg-amber-500 hover:bg-amber-600 text-[#14532d] font-bold shadow-lg shadow-amber-500/30 h-13 px-6"
                  >
                    Mua nông sản
                    <ArrowRight className="size-4 ml-2" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => navigate("ai-center")}
                    className="bg-white/10 hover:bg-white/20 backdrop-blur text-white font-semibold border-white/20 h-13 px-6"
                  >
                    <Brain className="size-4 mr-2" />
                    Khám phá AI
                  </Button>
                </div>
              </div>
            </motion.div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-4">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex-1 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 p-6 text-white relative overflow-hidden shadow-lg flex flex-col justify-between min-h-[180px]"
              >
                <div className="relative z-10">
                  <span className="text-xs uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-md font-bold">
                    OCOP 5 SAO
                  </span>
                  <h3 className="text-xl font-bold mt-2">Sầu Riêng Ri6 Đắk Lắk</h3>
                  <p className="text-xs text-amber-100 mt-1">
                    Cơm vàng hạt lép - Đã qua kiểm tra
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between relative z-10">
                  <span className="text-2xl font-black">
                    145.000đ{" "}
                    <span className="text-xs font-normal text-amber-100 line-through">
                      180.000đ
                    </span>
                  </span>
                  <button
                    onClick={(e) => quickAdd("p1", e)}
                    className="bg-white text-amber-700 hover:bg-amber-50 font-bold text-xs px-3.5 py-2 rounded-lg shadow flex items-center gap-1"
                  >
                    <ShoppingCart className="size-3.5" /> Mua
                  </button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex-1 rounded-2xl bg-gradient-to-br from-[#15803d] to-[#166534] p-6 text-white relative overflow-hidden shadow-lg flex flex-col justify-between min-h-[180px]"
              >
                <div className="relative z-10">
                  <span className="text-xs uppercase tracking-wider bg-green-500/40 px-2.5 py-1 rounded-md font-bold">
                    Hữu cơ 100%
                  </span>
                  <h3 className="text-xl font-bold mt-2">Rau Đà Lạt Thủy Canh</h3>
                  <p className="text-xs text-green-200 mt-1">
                    Sạch 100% - Đạt chuẩn GlobalGAP
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between relative z-10">
                  <span className="text-2xl font-black">
                    35.000đ{" "}
                    <span className="text-xs font-normal text-green-200">/ 500g</span>
                  </span>
                  <button
                    onClick={(e) => quickAdd("p10", e)}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold text-xs px-3.5 py-2 rounded-lg shadow flex items-center gap-1"
                  >
                    <ShoppingCart className="size-3.5" /> Mua
                  </button>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 bg-white p-6 rounded-2xl shadow-sm border border-stone-200"
          >
            {[
              { icon: ShieldCheck, color: "bg-green-50 text-green-600", title: "AgriSmart Verified", desc: "Đã qua quy trình kiểm tra" },
              { icon: Truck, color: "bg-amber-50 text-amber-600", title: "Giao tươi 24h", desc: "AgriSmart bảo quản & giao" },
              { icon: QrCode, color: "bg-blue-50 text-blue-600", title: "QR truy xuất", desc: "Minh bạch nguồn gốc" },
              { icon: Handshake, color: "bg-rose-50 text-rose-600", title: "Khiếu nại công bằng", desc: "Không tự động quy lỗi" },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-3 p-2">
                <div className={`size-12 rounded-2xl flex items-center justify-center shrink-0 ${s.color}`}>
                  <s.icon className="size-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">{s.title}</h4>
                  <p className="text-xs text-stone-500">{s.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </section>

        {/* CATEGORIES */}
        <section className="max-w-7xl mx-auto px-4 mt-12">
          <div className="flex justify-between items-end mb-6">
            <div>
              <span className="text-green-600 font-bold text-xs uppercase tracking-wider">
                Danh mục
              </span>
              <h2 className="text-2xl font-bold">Khám phá nông sản</h2>
            </div>
            <button
              onClick={() => navigate("buyer-products")}
              className="text-green-600 hover:text-green-700 font-semibold text-sm flex items-center"
            >
              Xem tất cả <ArrowRight className="size-4 ml-1" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => navigate("buyer-products", { category: cat.id })}
                className="group bg-white p-4 rounded-2xl border border-stone-200 hover:border-green-500 hover:shadow-lg transition text-center flex flex-col items-center"
              >
                <div className={`size-16 rounded-full flex items-center justify-center text-2xl mb-3 transition ${cat.bgColor} ${cat.color} ${cat.hoverColor}`}>
                  <cat.icon className="size-7" />
                </div>
                <h3 className="font-bold text-sm group-hover:text-green-700">{cat.name}</h3>
                <span className="text-xs text-stone-400 mt-1">{cat.count}</span>
              </button>
            ))}
          </div>
        </section>

        {/* FEATURED PRODUCTS */}
        <section className="max-w-7xl mx-auto px-4 mt-12">
          <div className="flex justify-between items-end mb-6">
            <div>
              <span className="text-green-600 font-bold text-xs uppercase tracking-wider">
                AgriSmart Verified
              </span>
              <h2 className="text-2xl font-bold">Sản phẩm bán chạy</h2>
            </div>
            <button
              onClick={() => navigate("buyer-products")}
              className="text-green-600 hover:text-green-700 font-semibold text-sm flex items-center"
            >
              Xem tất cả <ArrowRight className="size-4 ml-1" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>

        {/* AI BANNER */}
        <section className="max-w-7xl mx-auto px-4 mt-16">
          <div className="bg-gradient-to-r from-[#14532d] to-[#166534] rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 leaf-texture opacity-20" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">
              <div>
                <Badge className="bg-amber-500 text-[#14532d] hover:bg-amber-500 mb-3 gap-1">
                  <Brain className="size-3.5" /> AI AgriSmart
                </Badge>
                <h2 className="text-3xl font-extrabold mb-4">
                  AI kiểm tra mỗi đơn hàng
                </h2>
                <p className="text-green-100 mb-6">
                  Trước khi đơn hàng được xác nhận, AI tự động kiểm tra: sản phẩm còn bán không, lô hàng có bị tạm giữ không, tồn kho, điều kiện đóng gói và bảo quản.
                </p>
                <Button
                  size="lg"
                  onClick={() => navigate("ai-center")}
                  className="bg-amber-500 hover:bg-amber-600 text-[#14532d] font-bold shadow-lg shadow-amber-500/30 h-13 px-6"
                >
                  <Brain className="size-5 mr-2" />
                  Tìm hiểu AI Center
                </Button>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-2xl p-5 border border-white/20">
                <div className="text-xs text-amber-300 mb-2 font-semibold">AI Order Verification</div>
                <div className="space-y-2 text-sm">
                  {[
                    "✓ Sản phẩm còn đủ điều kiện bán",
                    "✓ Lô hàng không bị tạm giữ",
                    "✓ Tồn kho đầy đủ",
                    "✓ Thông tin giao hàng hợp lệ",
                    "✓ Điều kiện đóng gói phù hợp",
                  ].map((c, i) => (
                    <div key={i} className="bg-white/5 p-2 rounded-lg">{c}</div>
                  ))}
                  <div className="bg-green-500/20 p-3 rounded-lg text-center font-bold mt-2">
                    ✓ Đơn hàng đáp ứng điều kiện xử lý
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="max-w-7xl mx-auto px-4 mt-16">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <Badge variant="secondary" className="mb-3 gap-1">
              <Users className="size-3.5" /> Khách hàng nói gì
            </Badge>
            <h2 className="text-3xl font-bold">Niềm tin từ cộng đồng</h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-4">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 lg:p-6 relative overflow-hidden"
              >
                <Quote className="absolute -top-2 -right-2 size-20 text-green-500/5" />
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, s) => (
                    <Star key={s} className="size-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-stone-700 leading-relaxed mb-4 relative">
                  &ldquo;{t.content}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-3 border-t border-stone-100">
                  <Avatar className="size-11 border-2 border-green-200">
                    <AvatarImage src={t.avatar} alt={t.name} />
                    <AvatarFallback>{t.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-xs text-stone-500">{t.role} · {t.location}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

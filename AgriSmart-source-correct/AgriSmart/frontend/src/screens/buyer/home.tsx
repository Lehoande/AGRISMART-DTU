"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Leaf,
  ArrowRight,
  ShoppingCart,
  Sparkles,
  Brain,
  Users,
  Star,
  ShieldCheck,
  Quote,
  Wheat,
  Apple,
  Carrot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/lib/cart-store";
import { useNav } from "@/lib/nav-store";
import {
  type Product,
  formatPrice,
} from "@/lib/agri-data";
import { ProductCard } from "@/components/agri/product-card";
import { BuyerHeader } from "@/components/agri/buyer-header";
import { getApiCategories, getApiProducts, getPublicReviews, getPublicStats, type ApiCategory, type PublicReview } from "@/lib/api-client";
import { mapApiProduct } from "@/lib/product-mapper";

export function BuyerHomePage() {
  const { toast } = useToast();
  const addItem = useCart((s) => s.addItem);
  const navigate = useNav((s) => s.navigate);
  const [homeProducts, setHomeProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [publicStats, setPublicStats] = useState({ buyers: 0, sellers: 0, products: 0, reviews: 0 });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.allSettled([getApiProducts(), getApiCategories(), getPublicStats(), getPublicReviews()]).then((results) => {
      if (!active) return;
      const [productResult, categoryResult, statsResult, reviewResult] = results;
      if (productResult.status === "fulfilled") setHomeProducts(productResult.value.map(mapApiProduct));
      else setLoadError(productResult.reason instanceof Error ? productResult.reason.message : "Không tải được sản phẩm.");
      if (categoryResult.status === "fulfilled") setCategories(categoryResult.value);
      if (statsResult.status === "fulfilled") setPublicStats(statsResult.value);
      if (reviewResult.status === "fulfilled") setReviews(reviewResult.value);
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const quickAdd = (productId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const product = homeProducts.find((p) => p.id === productId);
    if (product) {
      addItem(product);
      toast({ title: "Đã thêm vào giỏ hàng", description: product.name });
    }
  };

  const featured = homeProducts.slice(0, 8);
  const firstPromo = homeProducts[0];
  const secondPromo = homeProducts[1];

  return (
    <div className="min-h-screen bg-stone-50 pb-20 lg:pb-0">
      <BuyerHeader />
      {loading && <div className="bg-stone-50 px-4 py-2 text-center text-xs text-stone-600">Đang tải sản phẩm…</div>}
      {loadError && <div role="alert" className="bg-red-50 px-4 py-2 text-center text-xs text-red-800">Không tải được sản phẩm: {loadError}</div>}
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
                  <Leaf className="size-3.5 mr-1.5" /> Thông tin nguồn gốc do gian hàng cung cấp
                </span>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-4">
                  Nông sản tươi ngon <br />
                  <span className="text-amber-400">Nông sản Việt</span>
                </h1>
                <p className="text-green-100 text-sm md:text-base mb-6 leading-relaxed">
                  Xem giá, nơi thu hoạch và thông tin truy xuất do từng gian hàng cập nhật trước khi đặt hàng.
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
                    onClick={() => navigate("buyer-ai-center")}
                    className="bg-white/10 hover:bg-white/20 backdrop-blur text-white font-semibold border-white/20 h-13 px-6"
                  >
                    <Brain className="size-4 mr-2" />
                    Khám phá AI
                  </Button>
                </div>
              </div>
            </motion.div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-4">
              {firstPromo && <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex-1 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 p-6 text-white relative overflow-hidden shadow-lg flex flex-col justify-between min-h-[180px]"
              >
                <div className="relative z-10">
                  <span className="text-xs uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-md font-bold">
                    {firstPromo.certLabel}
                  </span>
                  <h3 className="text-xl font-bold mt-2">{firstPromo.name}</h3>
                  <p className="text-xs text-amber-100 mt-1">{firstPromo.desc}</p>
                </div>
                <div className="mt-4 flex items-center justify-between relative z-10">
                  <span className="text-2xl font-black">
                    {formatPrice(firstPromo.price)} / {firstPromo.unit}
                  </span>
                  <button
                    onClick={(e) => quickAdd(firstPromo.id, e)}
                    className="bg-white text-amber-700 hover:bg-amber-50 font-bold text-xs px-3.5 py-2 rounded-lg shadow flex items-center gap-1"
                  >
                    <ShoppingCart className="size-3.5" /> Mua
                  </button>
                </div>
              </motion.div>}

              {secondPromo && <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex-1 rounded-2xl bg-gradient-to-br from-[#15803d] to-[#166534] p-6 text-white relative overflow-hidden shadow-lg flex flex-col justify-between min-h-[180px]"
              >
                <div className="relative z-10">
                  <span className="text-xs uppercase tracking-wider bg-green-500/40 px-2.5 py-1 rounded-md font-bold">
                    {secondPromo.certLabel}
                  </span>
                  <h3 className="text-xl font-bold mt-2">{secondPromo.name}</h3>
                  <p className="text-xs text-green-200 mt-1">{secondPromo.desc}</p>
                </div>
                <div className="mt-4 flex items-center justify-between relative z-10">
                  <span className="text-2xl font-black">
                    {formatPrice(secondPromo.price)} / {secondPromo.unit}
                  </span>
                  <button
                    onClick={(e) => quickAdd(secondPromo.id, e)}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold text-xs px-3.5 py-2 rounded-lg shadow flex items-center gap-1"
                  >
                    <ShoppingCart className="size-3.5" /> Mua
                  </button>
                </div>
              </motion.div>}
              {!firstPromo && <div className="flex min-h-[180px] items-center justify-center rounded-2xl border border-dashed bg-white p-6 text-center text-sm text-stone-500">Chưa có sản phẩm đang bán. Sản phẩm của người bán sẽ xuất hiện tại đây.</div>}
            </div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 bg-white p-6 rounded-2xl shadow-sm border border-stone-200"
          >
            {[
              { icon: ShoppingCart, color: "bg-green-50 text-green-600", title: `${publicStats.products} sản phẩm`, desc: "Đang mở bán trên hệ thống" },
              { icon: Users, color: "bg-amber-50 text-amber-600", title: `${publicStats.sellers} gian hàng`, desc: "Tài khoản người bán" },
              { icon: ShieldCheck, color: "bg-blue-50 text-blue-600", title: `${publicStats.buyers} người mua`, desc: "Tài khoản đã đăng ký" },
              { icon: Star, color: "bg-rose-50 text-rose-600", title: `${publicStats.reviews} đánh giá`, desc: "Đánh giá từ khách hàng" },
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
            {categories.map((cat) => {
              const categoryKey = cat.slug.includes("rau") ? "raucu" : cat.slug.includes("trai") ? "traicay" : "nongsan";
              const CategoryIcon = cat.slug.includes("rau") ? Carrot : cat.slug.includes("trai") ? Apple : Wheat;
              const categoryCount = homeProducts.filter((product) => product.category === categoryKey).length;
              return (
              <button
                key={cat.slug}
                onClick={() => navigate("buyer-products", { category: categoryKey })}
                className="group bg-white p-4 rounded-2xl border border-stone-200 hover:border-green-500 hover:shadow-lg transition text-center flex flex-col items-center"
              >
                <div className="mb-3 flex size-16 items-center justify-center rounded-full bg-green-50 text-green-700 transition group-hover:bg-green-100">
                  <CategoryIcon className="size-7" />
                </div>
                <h3 className="font-bold text-sm group-hover:text-green-700">{cat.name}</h3>
                <span className="text-xs text-stone-400 mt-1">{categoryCount} sản phẩm</span>
              </button>
              );
            })}
          </div>
        </section>

        {/* FEATURED PRODUCTS */}
        <section className="max-w-7xl mx-auto px-4 mt-12">
          <div className="flex justify-between items-end mb-6">
            <div>
              <span className="text-green-600 font-bold text-xs uppercase tracking-wider">Từ gian hàng trên hệ thống</span>
              <h2 className="text-2xl font-bold">Sản phẩm đang bán</h2>
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
            {!loading && featured.length === 0 && <p className="col-span-full rounded-xl border bg-white p-6 text-sm text-stone-500">Chưa có sản phẩm đang bán.</p>}
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
                <h2 className="text-3xl font-extrabold mb-4">Gợi ý nông sản theo nhu cầu</h2>
                <p className="text-green-100 mb-6">
                  AI xếp hạng sản phẩm theo nhóm bạn chọn, lịch sử tương tác và lượng hàng còn lại. Kết quả là gợi ý tham khảo.
                </p>
                <Button
                  size="lg"
                  onClick={() => navigate("buyer-ai-center")}
                  className="bg-amber-500 hover:bg-amber-600 text-[#14532d] font-bold shadow-lg shadow-amber-500/30 h-13 px-6"
                >
                  <Brain className="size-5 mr-2" />
                  Xem gợi ý sản phẩm
                </Button>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-2xl p-5 border border-white/20">
                <div className="text-xs text-amber-300 mb-2 font-semibold">Dữ liệu đang hoạt động</div>
                <div className="space-y-2 text-sm">
                  <div className="bg-white/5 p-3 rounded-lg">{homeProducts.length} sản phẩm đang mở bán</div>
                  <div className="bg-white/5 p-3 rounded-lg">{categories.length} danh mục trong hệ thống</div>
                  <div className="bg-white/5 p-3 rounded-lg">Gợi ý được xếp hạng từ tồn kho và tương tác có sẵn</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* REAL REVIEWS */}
        <section className="max-w-7xl mx-auto px-4 mt-16">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <Badge variant="secondary" className="mb-3 gap-1">
              <Users className="size-3.5" /> Khách hàng nói gì
            </Badge>
            <h2 className="text-3xl font-bold">Đánh giá từ đơn hàng thật</h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-4">
            {reviews.map((review, i) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 lg:p-6 relative overflow-hidden"
              >
                <Quote className="absolute -top-2 -right-2 size-20 text-green-500/5" />
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: review.rating }).map((_, s) => (
                    <Star key={s} className="size-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-stone-700 leading-relaxed mb-4 relative">
                  &ldquo;{review.comment}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-3 border-t border-stone-100">
                  <div>
                    <div className="font-semibold text-sm">{review.customer_name}</div>
                    <div className="text-xs text-stone-500">{review.product_name} · {new Date(review.created_at).toLocaleDateString("vi-VN")}</div>
                  </div>
                </div>
              </motion.div>
            ))}
            {!loading && reviews.length === 0 && <p className="col-span-full rounded-xl border bg-white p-6 text-center text-sm text-stone-500">Chưa có đánh giá nào được đăng.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}


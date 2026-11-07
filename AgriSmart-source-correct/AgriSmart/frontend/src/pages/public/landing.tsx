"use client";
import { motion } from "framer-motion";
import {
  Sprout,
  ArrowRight,
  ShieldCheck,
  QrCode,
  Truck,
  Headphones,
  Sparkles,
  Brain,
  CheckCircle2,
  Apple,
  Carrot,
  Wheat,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNav } from "@/lib/nav-store";

const benefits = [
  {
    icon: Brain,
    title: "AI hỗ trợ kiểm tra & phân loại",
    desc: "AI phân tích hình ảnh, nhận diện nhóm nông sản, phát hiện dấu hiệu bất thường để hỗ trợ nhân viên kiểm tra.",
    color: "bg-purple-100 text-purple-700",
  },
  {
    icon: QrCode,
    title: "Nguồn gốc rõ ràng",
    desc: "Mỗi lô hàng có mã QR riêng, minh bạch từ người bán, ngày thu hoạch đến kết quả kiểm định.",
    color: "bg-blue-100 text-blue-700",
  },
  {
    icon: Truck,
    title: "AgriSmart bảo quản & giao hàng",
    desc: "AgriSmart tiếp nhận, đóng gói, bảo quản theo đúng điều kiện và điều phối giao hàng tận nơi.",
    color: "bg-amber-100 text-amber-700",
  },
  {
    icon: Headphones,
    title: "Chính sách khiếu nại minh bạch",
    desc: "Khi có vấn đề, hệ thống tiếp nhận bằng chứng và xử lý công bằng, không tự động quy lỗi.",
    color: "bg-rose-100 text-rose-700",
  },
];

const stats = [
  { value: "864+", label: "Người bán / Nông dân" },
  { value: "12,450+", label: "Người mua tin tưởng" },
  { value: "42", label: "Tỉnh thành phủ sóng" },
  { value: "100%", label: "Nông sản đã kiểm tra" },
];

export function LandingPage() {
  const navigate = useNav((s) => s.navigate);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-10 rounded-xl bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center text-white shadow-lg shadow-green-600/30">
              <Sprout className="size-6" />
            </div>
            <div>
              <span className="text-xl font-extrabold text-[#14532d] tracking-tight block leading-none">
                Agri<span className="text-amber-500">Smart</span>
                <span className="text-green-600 text-sm ml-1">AI</span>
              </span>
              <span className="text-[10px] text-stone-500 font-medium tracking-wider uppercase">
                Nông Sản Minh Bạch
              </span>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-1">
            <button onClick={() => navigate("landing")} className="px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-50 rounded-lg">
              Trang chủ
            </button>
            <button onClick={() => navigate("buyer-products")} className="px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 rounded-lg">
              Sản phẩm
            </button>
            <button onClick={() => navigate("seller-dashboard")} className="px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 rounded-lg">
              Người bán
            </button>
            <button onClick={() => navigate("buyer-home")} className="px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 rounded-lg">
              Người mua
            </button>
            <button onClick={() => navigate("ai-center")} className="px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 rounded-lg">
              AI AgriSmart
            </button>
            <button className="px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 rounded-lg">
              Chính sách
            </button>
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("login")}>
              Đăng nhập
            </Button>
            <Button size="sm" onClick={() => navigate("signup-role")} className="bg-green-600 hover:bg-green-700">
              Đăng ký
            </Button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden hero-pattern">
        <div className="absolute inset-0 leaf-texture opacity-50" />
        <div className="absolute top-0 left-1/4 size-96 rounded-full bg-green-300/20 blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-0 right-1/4 size-96 rounded-full bg-amber-300/15 blur-3xl animate-pulse-soft" />

        <div className="max-w-7xl mx-auto px-4 py-16 lg:py-24 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6 text-center lg:text-left"
            >
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100 gap-1.5">
                <Sparkles className="size-3.5" />
                Nền tảng nông sản + trái cây tích hợp AI
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight leading-[1.05]">
                Nông sản minh bạch
                <br />
                <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-amber-500 bg-clip-text text-transparent">
                  Mua bán an tâm cùng AI
                </span>
              </h1>
              <p className="text-base lg:text-lg text-stone-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Kết nối trực tiếp người trồng và người mua, được AgriSmart hỗ trợ
                kiểm tra, bảo quản và giao hàng.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Button
                  size="lg"
                  onClick={() => navigate("buyer-home")}
                  className="h-13 px-7 text-base font-semibold bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/30 group"
                >
                  Mua nông sản
                  <ArrowRight className="size-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("signup-role")}
                  className="h-13 px-7 text-base font-semibold border-2 border-green-600 text-green-700 hover:bg-green-50"
                >
                  Trở thành người bán
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-3 pt-6">
                {stats.map((s, i) => (
                  <div key={i} className="text-center lg:text-left">
                    <div className="text-xl lg:text-2xl font-extrabold text-green-700">
                      {s.value}
                    </div>
                    <div className="text-xs text-stone-500 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Hero image collage */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative"
            >
              <div className="relative aspect-square max-w-md mx-auto">
                {/* Center plate */}
                <div className="absolute inset-8 rounded-full overflow-hidden shadow-2xl ring-8 ring-white">
                  <img
                    src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=85"
                    alt="Nông sản tươi"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Floating cards */}
                <motion.div
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -top-2 -left-4 bg-white rounded-2xl shadow-xl border border-stone-100 p-3 flex items-center gap-2"
                >
                  <div className="size-9 rounded-xl bg-purple-100 flex items-center justify-center">
                    <Brain className="size-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">AI kiểm tra</div>
                    <div className="text-[10px] text-stone-500">94.2% chính xác</div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 12, 0] }}
                  transition={{ duration: 4.5, repeat: Infinity, delay: 0.5 }}
                  className="absolute -top-4 right-0 bg-white rounded-2xl shadow-xl border border-stone-100 p-3 flex items-center gap-2"
                >
                  <div className="size-9 rounded-xl bg-green-100 flex items-center justify-center">
                    <ShieldCheck className="size-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">AgriSmart Verified</div>
                    <div className="text-[10px] text-stone-500">Đã qua kiểm tra</div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                  className="absolute -bottom-2 -left-2 bg-white rounded-2xl shadow-xl border border-stone-100 p-3 flex items-center gap-2"
                >
                  <div className="size-9 rounded-xl bg-amber-100 flex items-center justify-center">
                    <Truck className="size-5 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">Bảo quản & giao</div>
                    <div className="text-[10px] text-stone-500">24h freshness</div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 5.5, repeat: Infinity, delay: 0.3 }}
                  className="absolute -bottom-2 right-2 bg-white rounded-2xl shadow-xl border border-stone-100 p-3 flex items-center gap-2"
                >
                  <div className="size-9 rounded-xl bg-blue-100 flex items-center justify-center">
                    <QrCode className="size-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">QR truy xuất</div>
                    <div className="text-[10px] text-stone-500">Minh bạch nguồn</div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-16 lg:mt-24">
            {benefits.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="bg-white rounded-2xl border border-stone-200 p-5 hover:shadow-lg transition-shadow"
              >
                <div className={`size-12 rounded-xl flex items-center justify-center mb-3 ${b.color}`}>
                  <b.icon className="size-6" />
                </div>
                <h3 className="font-bold text-base mb-2">{b.title}</h3>
                <p className="text-sm text-stone-600 leading-relaxed">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works - 2 flows */}
      <section className="py-16 lg:py-24 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge variant="secondary" className="mb-3">Quy trình minh bạch</Badge>
            <h2 className="text-3xl lg:text-4xl font-extrabold">
              Cách AgriSmart AI hoạt động
            </h2>
            <p className="text-stone-600 mt-3">
              AgriSmart là trung tâm kiểm tra, đóng gói, bảo quản và điều phối - không phải sàn giao dịch đơn thuần.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Seller Flow */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl p-6 lg:p-8 border border-stone-200"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="size-12 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Wheat className="size-6 text-amber-700" />
                </div>
                <div>
                  <div className="text-xs font-bold text-amber-600 uppercase tracking-wider">Flow Người bán</div>
                  <h3 className="font-bold text-xl">Từ nông trại đến tay người mua</h3>
                </div>
              </div>
              <ol className="space-y-3">
                {[
                  "Đăng ký & đọc thỏa thuận",
                  "Đăng sản phẩm & tạo lô hàng",
                  "AI hỗ trợ phân loại",
                  "AgriSmart kiểm tra",
                  "Lô đạt → Mở bán",
                  "Khách đặt → AgriSmart tiếp nhận",
                  "Đóng gói & bảo quản",
                  "Giao hàng → Hoàn thành",
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="size-6 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-sm">{step}</span>
                  </li>
                ))}
              </ol>
            </motion.div>

            {/* Buyer Flow */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl p-6 lg:p-8 border border-stone-200"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="size-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <Apple className="size-6 text-green-700" />
                </div>
                <div>
                  <div className="text-xs font-bold text-green-600 uppercase tracking-wider">Flow Người mua</div>
                  <h3 className="font-bold text-xl">Mua nông sản an tâm</h3>
                </div>
              </div>
              <ol className="space-y-3">
                {[
                  "Đăng ký & đọc thỏa thuận",
                  "Tìm & xem sản phẩm",
                  "Xem thông tin lô hàng",
                  "Thêm giỏ hàng & checkout",
                  "AI kiểm tra điều kiện đơn",
                  "AgriSmart xác nhận",
                  "Đóng gói & bảo quản",
                  "Giao hàng → Nhận → Đánh giá",
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="size-6 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-sm">{step}</span>
                  </li>
                ))}
              </ol>
            </motion.div>
          </div>
        </div>
      </section>

      {/* AI Center CTA */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-[#14532d] via-[#166534] to-[#15803d] text-white relative overflow-hidden">
        <div className="absolute inset-0 leaf-texture opacity-20" />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-amber-500 text-[#14532d] hover:bg-amber-500 mb-4 gap-1">
                <Brain className="size-3.5" />
                AgriSmart AI Center
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-extrabold mb-4">
                AI là điểm khác biệt lớn nhất
              </h2>
              <p className="text-green-100 mb-6 leading-relaxed">
                6 module AI hỗ trợ toàn bộ quy trình: phân loại sản phẩm, phát hiện bất thường, kiểm tra đơn hàng, đề xuất cá nhân hóa, phân tích nguồn cung và cảnh báo rủi ro.
              </p>
              <p className="text-amber-300 text-sm italic mb-6 bg-black/20 p-3 rounded-lg border border-amber-400/30">
                ⚠ AI hỗ trợ ra quyết định - không thay thế hoàn toàn quy trình kiểm định của AgriSmart.
              </p>
              <Button
                size="lg"
                onClick={() => navigate("ai-center")}
                className="bg-amber-500 hover:bg-amber-600 text-[#14532d] font-bold h-13 px-6"
              >
                Khám phá AI Center
                <ArrowRight className="size-4 ml-2" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: "🏷️", title: "Phân loại" },
                { icon: "🔍", title: "Phát hiện bất thường" },
                { icon: "✅", title: "Kiểm tra đơn" },
                { icon: "💡", title: "Đề xuất" },
                { icon: "📊", title: "Phân tích nguồn cung" },
                { icon: "⚠️", title: "Cảnh báo rủi ro" },
              ].map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/20"
                >
                  <div className="text-3xl mb-2">{m.icon}</div>
                  <div className="text-sm font-semibold">{m.title}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#14532d] text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="size-10 rounded-xl bg-green-600 flex items-center justify-center">
                  <Sprout className="size-6" />
                </div>
                <span className="text-xl font-extrabold">
                  Agri<span className="text-amber-500">Smart</span>
                  <span className="text-green-400 text-sm ml-1">AI</span>
                </span>
              </div>
              <p className="text-green-200 text-sm leading-relaxed max-w-sm">
                Nền tảng kết nối người bán/nông dân với người mua nông sản và trái cây. AgriSmart là trung tâm kiểm tra, đóng gói, bảo quản và điều phối.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-3 uppercase tracking-wider">Khám phá</h4>
              <ul className="space-y-2 text-xs text-green-200">
                <li><button onClick={() => navigate("buyer-products")} className="hover:text-amber-400">Mua nông sản</button></li>
                <li><button onClick={() => navigate("signup-role")} className="hover:text-amber-400">Trở thành người bán</button></li>
                <li><button onClick={() => navigate("ai-center")} className="hover:text-amber-400">AI Center</button></li>
                <li><button onClick={() => navigate("landing")} className="hover:text-amber-400">Về AgriSmart</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-3 uppercase tracking-wider">Hỗ trợ</h4>
              <ul className="space-y-2 text-xs text-green-200">
                <li>Hotline: 1900 8686</li>
                <li>Email: support@agrismart.vn</li>
                <li>Đà Nẵng, Việt Nam</li>
              </ul>
            </div>
          </div>
          <div className="pt-6 border-t border-green-800 text-center text-xs text-green-400">
            <p>© 2026 AgriSmart AI · Nông sản minh bạch - Mua bán an tâm cùng AI</p>
            <div className="mt-2 flex items-center justify-center gap-3">
              <button
                onClick={() => navigate("admin-dashboard")}
                className="hover:text-amber-400 text-stone-600"
                title="Truy cập Admin Dashboard (demo)"
              >
                Admin
              </button>
              <span>·</span>
              <button
                onClick={() => navigate("ai-center")}
                className="hover:text-amber-400"
              >
                AI Center
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

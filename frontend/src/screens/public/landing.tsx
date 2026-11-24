"use client";
import { useEffect, useState } from "react";
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
import { getPublicStats } from "@/lib/api-client";

const benefits = [
  {
    icon: Brain,
    title: "Trợ lý gợi ý sản phẩm",
    desc: "Gợi ý sản phẩm theo nhóm quan tâm, lịch sử mua và lượng hàng còn lại; người bán có thể rà soát mô tả trước khi đăng.",
    color: "bg-purple-100 text-purple-700",
  },
  {
    icon: QrCode,
    title: "Nguồn gốc rõ ràng",
    desc: "Thông tin vùng trồng và ngày thu hoạch do gian hàng cập nhật để người mua tham khảo.",
    color: "bg-blue-100 text-blue-700",
  },
  {
    icon: Truck,
    title: "Thông tin giao hàng rõ ràng",
    desc: "Phí vận chuyển và địa chỉ giao được hiển thị để người mua kiểm tra trước khi đặt hàng.",
    color: "bg-amber-100 text-amber-700",
  },
  {
    icon: Headphones,
    title: "Chính sách khiếu nại minh bạch",
    desc: "Khi có vấn đề, hệ thống tiếp nhận bằng chứng và xử lý công bằng, không tự động quy lỗi.",
    color: "bg-rose-100 text-rose-700",
  },
];

export function LandingPage() {
  const navigate = useNav((s) => s.navigate);
  const [stats, setStats] = useState<{ buyers: number; sellers: number; products: number } | null>(null);
  useEffect(() => { let active = true; getPublicStats().then((data) => { if (active) setStats(data); }).catch(() => { if (active) setStats(null); }); return () => { active = false; }; }, []);

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
            <button onClick={() => navigate("about-features")} className="px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 rounded-lg">
              Tính năng
            </button>
            <button onClick={() => navigate("about-sellers")} className="px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 rounded-lg">
              Người bán
            </button>
            <button onClick={() => navigate("about-buyers")} className="px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 rounded-lg">
              Người mua
            </button>
            <button onClick={() => navigate("about-ai")} className="px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 rounded-lg">
              AI AgriSmart
            </button>
            <button onClick={() => navigate("about-policies")} className="px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 rounded-lg">
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
      <section id="landing-home" className="relative scroll-mt-20 overflow-hidden hero-pattern">
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
                Kết nối gian hàng nông sản và người mua. Xem giá, nguồn gốc khai báo và tình trạng hàng trước khi đặt.
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
                  onClick={() => navigate("seller-signup")}
                  className="h-13 px-7 text-base font-semibold border-2 border-green-600 text-green-700 hover:bg-green-50"
                >
                  Trở thành người bán
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 pt-6">
                {[
                  { value: stats ? String(stats.sellers) : "—", label: "Người bán" },
                  { value: stats ? String(stats.buyers) : "—", label: "Người mua" },
                  { value: stats ? String(stats.products) : "—", label: "Sản phẩm đang bán" },
                ].map((s) => (
                  <div key={s.label} className="text-center lg:text-left">
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
                    <div className="text-xs font-bold">Trợ lý gợi ý</div>
                    <div className="text-[10px] text-stone-500">Theo quy tắc rõ ràng</div>
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
                    <div className="text-xs font-bold">Thông tin truy xuất</div>
                    <div className="text-[10px] text-stone-500">Người bán khai báo</div>
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
                    <div className="text-xs font-bold">Giao hàng</div>
                    <div className="text-[10px] text-stone-500">Hiển thị phí trước khi đặt</div>
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
          <div id="landing-features" className="grid scroll-mt-24 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-16 lg:mt-24">
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
              Các bước dưới đây mô tả chức năng hệ thống hiện có; xác minh sản phẩm và giao hàng vật lý phụ thuộc quy trình vận hành thực tế.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Seller Flow */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              id="landing-seller-flow"
              className="scroll-mt-24 bg-white rounded-3xl p-6 lg:p-8 border border-stone-200"
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
                  "Rà soát thông tin và chứng nhận đã khai báo",
                  "Theo dõi trạng thái xét duyệt",
                  "Nhận và quản lý đơn đặt hàng",
                  "Cập nhật trạng thái xử lý đơn",
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
              id="landing-buyer-flow"
              className="scroll-mt-24 bg-white rounded-3xl p-6 lg:p-8 border border-stone-200"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="size-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <Apple className="size-6 text-green-700" />
                </div>
                <div>
                  <div className="text-xs font-bold text-green-600 uppercase tracking-wider">Flow Người mua</div>
                  <h3 className="font-bold text-xl">Mua nông sản có thông tin rõ</h3>
                </div>
              </div>
              <ol className="space-y-3">
                {[
                  "Đăng ký & đọc thỏa thuận",
                  "Tìm & xem sản phẩm",
                  "Xem thông tin lô hàng",
                  "Thêm giỏ hàng & checkout",
                  "Kiểm tra phí giao và thông tin đơn",
                  "Theo dõi trạng thái đơn hàng",
                  "Xác nhận nhận hàng và đánh giá",
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
      <section id="landing-ai" className="scroll-mt-20 py-16 lg:py-24 bg-gradient-to-br from-[#14532d] via-[#166534] to-[#15803d] text-white relative overflow-hidden">
        <div className="absolute inset-0 leaf-texture opacity-20" />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-amber-500 text-[#14532d] hover:bg-amber-500 mb-4 gap-1">
                <Brain className="size-3.5" />
                Trợ lý dữ liệu AgriSmart
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-extrabold mb-4">
                Gợi ý nông sản dựa trên dữ liệu
              </h2>
              <p className="text-green-100 mb-6 leading-relaxed">
                Dịch vụ hiện xếp hạng sản phẩm theo nhóm bạn quan tâm, lịch sử tương tác và lượng hàng còn lại. Người bán cũng có thể rà soát thông tin và nhận gợi ý danh mục trước khi đăng.
              </p>
              <p className="text-amber-300 text-sm italic mb-6 bg-black/20 p-3 rounded-lg border border-amber-400/30">
                Đây là trợ lý theo quy tắc; chưa phân tích ảnh, xác minh chứng nhận hoặc thay thế kiểm định của nhân viên.
              </p>
              <Button
                size="lg"
                onClick={() => navigate("about-ai")}
                className="bg-amber-500 hover:bg-amber-600 text-[#14532d] font-bold h-13 px-6"
              >
                Tìm hiểu trợ lý AI
                <ArrowRight className="size-4 ml-2" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: "💡", title: "Gợi ý theo danh mục" },
                { icon: "🛒", title: "Gợi ý theo lịch sử mua" },
                { icon: "📦", title: "Ưu tiên hàng còn tồn" },
                { icon: "🏷️", title: "Rà soát mô tả sản phẩm" },
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
      <footer id="landing-policies" className="scroll-mt-20 bg-[#14532d] text-white py-12">
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
                Nền tảng kết nối gian hàng nông sản với người mua, hỗ trợ quản lý sản phẩm, đơn hàng và thông tin truy xuất.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-3 uppercase tracking-wider">Khám phá</h4>
              <ul className="space-y-2 text-xs text-green-200">
                <li><button onClick={() => navigate("about-features")} className="hover:text-amber-400">Tính năng nền tảng</button></li>
                <li><button onClick={() => navigate("about-sellers")} className="hover:text-amber-400">Dành cho người bán</button></li>
                <li><button onClick={() => navigate("about-ai")} className="hover:text-amber-400">Giới thiệu AI</button></li>
                <li><button onClick={() => navigate("about-policies")} className="hover:text-amber-400">Chính sách</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-3 uppercase tracking-wider">Hỗ trợ</h4>
              <ul className="space-y-2 text-xs text-green-200">
                <li>Tra cứu đơn hàng trong tài khoản</li>
                <li>Gửi khiếu nại tại trang đơn hàng</li>
                <li>Thông tin liên hệ được cập nhật khi hệ thống cấu hình</li>
              </ul>
            </div>
          </div>
          <div className="pt-6 border-t border-green-800 text-center text-xs text-green-400">
            <p>© 2026 AgriSmart AI · Nông sản minh bạch - Mua bán an tâm cùng AI</p>
            <div className="mt-2 flex items-center justify-center gap-3">
              <button
                onClick={() => window.location.assign("/admin")}
                className="hover:text-amber-400 text-stone-600"
                title="Mở trang quản trị"
              >
                Admin
              </button>
              <span>·</span>
              <button
                onClick={() => navigate("about-ai")}
                className="hover:text-amber-400"
              >
                Giới thiệu AI
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}


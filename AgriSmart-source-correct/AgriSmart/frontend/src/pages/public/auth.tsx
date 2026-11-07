"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Sprout,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  Wheat,
  ShoppingCart,
  CheckCircle2,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { useNav } from "@/lib/nav-store";
import { loginApi } from "@/lib/api-client";

export function LoginPage() {
  const navigate = useNav((s) => s.navigate);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);
    try {
      const result = await loginApi(email.trim(), password);
      navigate(result.user.role === "customer" ? "buyer-home" : "seller-dashboard");
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Đăng nhập thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-100 p-4">
      <Card className="w-full max-w-md p-8 shadow-xl">
        <button
          onClick={() => navigate("landing")}
          className="flex items-center gap-2 text-sm text-stone-500 hover:text-green-600 mb-6"
        >
          <ArrowLeft className="size-4" /> Về trang chủ
        </button>

        <div className="flex items-center gap-2.5 mb-6">
          <div className="size-12 rounded-xl bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center text-white shadow-lg">
            <Sprout className="size-7" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-[#14532d]">
              Agri<span className="text-amber-500">Smart</span> AI
            </div>
            <div className="text-xs text-stone-500">Đăng nhập tài khoản</div>
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-2">Chào mừng trở lại!</h1>
        <p className="text-sm text-stone-500 mb-6">
          Đăng nhập để tiếp tục mua sắm nông sản và trái cây.
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          {loginError && <p role="alert" className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{loginError}</p>}
          <div>
            <Label htmlFor="email">Email hoặc số điện thoại</Label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone-400" />
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-11"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="password">Mật khẩu</Label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone-400" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 h-11"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Checkbox id="remember" />
              <Label htmlFor="remember" className="text-stone-600 cursor-pointer">
                Ghi nhớ đăng nhập
              </Label>
            </div>
            <button type="button" className="text-green-600 hover:underline font-medium">
              Quên mật khẩu?
            </button>
          </div>

          <Button type="submit" size="lg" className="w-full h-12 bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/30">
            Đăng nhập
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-stone-500">
          Chưa có tài khoản?{" "}
          <button
            onClick={() => navigate("signup-role")}
            className="text-green-600 hover:underline font-semibold"
          >
            Đăng ký ngay
          </button>
        </div>
      </Card>
    </div>
  );
}

// ============================================
// SIGNUP ROLE SELECTION
// ============================================
export function SignupRolePage() {
  const navigate = useNav((s) => s.navigate);

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 to-green-50 p-4 flex items-center justify-center">
      <div className="w-full max-w-4xl">
        <button
          onClick={() => navigate("landing")}
          className="flex items-center gap-2 text-sm text-stone-500 hover:text-green-600 mb-6 mx-auto"
        >
          <ArrowLeft className="size-4" /> Về trang chủ
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-4">
            <div className="size-12 rounded-xl bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center text-white shadow-lg">
              <Sprout className="size-7" />
            </div>
            <div className="text-2xl font-extrabold text-[#14532d]">
              Agri<span className="text-amber-500">Smart</span> AI
            </div>
          </div>
          <h1 className="text-3xl font-extrabold mb-2">Bạn muốn tham gia với vai trò nào?</h1>
          <p className="text-stone-600 max-w-xl mx-auto">
            Chọn vai trò phù hợp với bạn. Sau khi đăng ký, bạn vẫn có thể chuyển đổi giữa hai vai trò bất cứ lúc nào.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* SELLER CARD */}
          <motion.button
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate("seller-signup")}
            className="group bg-white rounded-3xl p-8 border-2 border-stone-200 hover:border-amber-500 hover:shadow-xl transition-all text-left"
          >
            <div className="size-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform">
              <Wheat className="size-9" />
            </div>
            <h2 className="text-xl font-bold mb-1">Tôi muốn bán nông sản</h2>
            <p className="text-sm text-stone-600 mb-4 leading-relaxed">
              Đăng bán nông sản, quản lý lô hàng, theo dõi doanh thu và tiếp cận khách hàng thông qua hệ thống AgriSmart.
            </p>
            <ul className="space-y-2 mb-6">
              {["Tiếp cận 12,450+ khách hàng", "AgriSmart kiểm tra & quản lý lô", "Hỗ trợ đóng gói, bảo quản, giao hàng", "Dashboard doanh thu tập trung"].map((b, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-stone-700">
                  <CheckCircle2 className="size-4 text-amber-600 shrink-0 mt-0.5" />
                  {b}
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between">
              <span className="text-amber-700 font-bold">Tôi là người bán</span>
              <ArrowRight className="size-5 text-amber-600 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.button>

          {/* BUYER CARD */}
          <motion.button
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate("buyer-signup")}
            className="group bg-white rounded-3xl p-8 border-2 border-stone-200 hover:border-green-500 hover:shadow-xl transition-all text-left"
          >
            <div className="size-16 rounded-2xl bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform">
              <ShoppingCart className="size-9" />
            </div>
            <h2 className="text-xl font-bold mb-1">Tôi muốn mua nông sản</h2>
            <p className="text-sm text-stone-600 mb-4 leading-relaxed">
              Tìm kiếm nông sản chất lượng, đặt hàng, theo dõi giao hàng và đánh giá sản phẩm.
            </p>
            <ul className="space-y-2 mb-6">
              {["Nông sản đã qua kiểm tra", "Nguồn gốc & lô hàng minh bạch", "AgriSmart đóng gói & bảo quản", "Khiếu nại minh bạch"].map((b, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-stone-700">
                  <CheckCircle2 className="size-4 text-green-600 shrink-0 mt-0.5" />
                  {b}
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between">
              <span className="text-green-700 font-bold">Tôi là người mua</span>
              <ArrowRight className="size-5 text-green-600 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.button>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-stone-500 mb-2">Hoặc đăng ký tài khoản chung và chọn vai trò sau:</p>
          <Button variant="outline" onClick={() => navigate("login")}>
            Đăng ký tài khoản chung
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// SELLER SIGNUP - với thông tin cơ bản
// ============================================
export function SellerSignupPage() {
  const navigate = useNav((s) => s.navigate);

  return (
    <div className="min-h-screen bg-stone-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate("signup-role")}
          className="flex items-center gap-2 text-sm text-stone-500 hover:text-green-600 mb-4"
        >
          <ArrowLeft className="size-4" /> Quay lại chọn vai trò
        </button>

        <Card className="p-8 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="size-12 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-lg">
              <Wheat className="size-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Bán nông sản cùng AgriSmart AI</h1>
              <p className="text-sm text-stone-500">Đăng ký tài khoản người bán</p>
            </div>
          </div>

          {/* 4 lợi ích */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { icon: "👥", title: "Tiếp cận khách hàng", desc: "12,450+ người mua" },
              { icon: "🔍", title: "Kiểm tra lô hàng", desc: "AgriSmart hỗ trợ" },
              { icon: "📦", title: "Đóng gói & giao", desc: "AgriSmart điều phối" },
              { icon: "📊", title: "Doanh thu tập trung", desc: "Dashboard theo dõi" },
            ].map((b, i) => (
              <div key={i} className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                <div className="text-2xl mb-1">{b.icon}</div>
                <div className="font-bold text-sm">{b.title}</div>
                <div className="text-xs text-stone-500">{b.desc}</div>
              </div>
            ))}
          </div>

          {/* Form đăng ký */}
          <form onSubmit={(e) => { e.preventDefault(); navigate("seller-agreement"); }} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Họ và tên *</Label>
                <Input placeholder="Nguyễn Văn A" className="h-11 mt-1" required />
              </div>
              <div>
                <Label>Số điện thoại *</Label>
                <Input placeholder="0901 234 567" className="h-11 mt-1" required />
              </div>
              <div>
                <Label>Email *</Label>
                <Input type="email" placeholder="email@example.com" className="h-11 mt-1" required />
              </div>
              <div>
                <Label>Tên nông trại / HTX *</Label>
                <Input placeholder="HTX Nông Nghiệp Xanh" className="h-11 mt-1" required />
              </div>
              <div className="sm:col-span-2">
                <Label>Địa chỉ nông trại *</Label>
                <Input placeholder="Xã, Huyện, Tỉnh" className="h-11 mt-1" required />
              </div>
              <div>
                <Label>Mật khẩu *</Label>
                <Input type="password" placeholder="••••••••" className="h-11 mt-1" required />
              </div>
              <div>
                <Label>Xác nhận mật khẩu *</Label>
                <Input type="password" placeholder="••••••••" className="h-11 mt-1" required />
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full h-12 bg-amber-500 hover:bg-amber-600 shadow-lg">
              Tiếp tục đọc Thỏa thuận
              <ArrowRight className="size-4 ml-2" />
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

// ============================================
// SELLER AGREEMENT
// ============================================
export function SellerAgreementPage() {
  const navigate = useNav((s) => s.navigate);
  const [agreed, setAgreed] = useState(false);

  const sections = [
    {
      title: "1. Quyền và nghĩa vụ của người bán",
      content: "Người bán có quyền đăng sản phẩm, quản lý lô hàng, theo dõi doanh thu. Nghĩa vụ cung cấp thông tin chính xác, trung thực về nguồn gốc, chất lượng, ngày thu hoạch sản phẩm."
    },
    {
      title: "2. Trách nhiệm cung cấp thông tin",
      content: "Người bán cam kết thông tin sản phẩm, hình ảnh, mô tả, nguồn gốc là chính xác. Mọi thông tin sai lệch có thể dẫn đến tạm khóa tài khoản hoặc hủy thỏa thuận."
    },
    {
      title: "3. Quy định về chất lượng và nguồn gốc",
      content: "Sản phẩm phải đạt chuẩn VietGAP, GlobalGAP, Organic hoặc OCOP. Mỗi lô hàng phải có mã lô riêng, ngày thu hoạch rõ ràng, thông tin kiểm định đầy đủ."
    },
    {
      title: "4. Xử lý khi sản phẩm không đạt yêu cầu",
      content: "Nếu lô hàng không đạt kiểm định, AgriSmart thông báo cho người bán. Người bán có thể thu hồi lô hoặc yêu cầu kiểm tra lại. Lô không đạt không được mở bán."
    },
    {
      title: "5. Xử lý khi xảy ra khiếu nại",
      content: "Khi có khiếu nại, AgriSmart tiếp nhận bằng chứng, xác minh công bằng. Không tự động quy lỗi cho người bán hoặc người mua cho đến khi có kết quả điều tra."
    },
    {
      title: "6. Chính sách đổi/trả/hoàn tiền",
      content: "Khách hàng được đổi/trả trong 2h sau khi nhận hàng nếu sản phẩm hỏng, không đúng mô tả. Hoàn tiền trong 3-5 ngày làm việc sau khi xác minh."
    },
    {
      title: "7. Xử lý khi không xác định nguyên nhân hư hỏng",
      content: "Nếu không đủ bằng chứng xác định lỗi thuộc về ai, AgriSmart chịu trách nhiệm đền bù theo cơ chế quỹ bảo vệ người mua, không quy lỗi cho người bán hay người mua."
    },
    {
      title: "8. Chính sách bảo mật dữ liệu",
      content: "Thông tin cá nhân người bán được bảo mật theo Luật Bảo mật dữ liệu cá nhân Việt Nam. AgriSmart không chia sẻ với bên thứ ba khi chưa có đồng ý."
    },
    {
      title: "9. Quyền lợi và doanh thu của người bán",
      content: "Người bán nhận doanh thu sau khi trừ phí dịch vụ AgriSmart (5-8% tùy loại sản phẩm). Thanh toán định kỳ hàng tuần qua banking."
    },
  ];

  return (
    <div className="min-h-screen bg-stone-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate("seller-signup")}
          className="flex items-center gap-2 text-sm text-stone-500 hover:text-green-600 mb-4"
        >
          <ArrowLeft className="size-4" /> Quay lại
        </button>

        <Card className="p-8 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="size-12 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-lg">
              <FileText className="size-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Thỏa thuận mua bán và hợp tác</h1>
              <p className="text-sm text-stone-500">Dành cho Người bán - AgriSmart AI</p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-2">
              <ShieldCheck className="size-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-sm text-stone-700">
                Vui lòng đọc kỹ thỏa thuận trước khi đồng ý. AgriSmart cam kết bảo vệ quyền lợi chính đáng của cả người bán và người mua.
              </p>
            </div>
          </div>

          <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
            {sections.map((s, i) => (
              <div key={i} className="border-l-4 border-amber-400 pl-4">
                <h3 className="font-bold text-base mb-2">{s.title}</h3>
                <p className="text-sm text-stone-600 leading-relaxed">{s.content}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-stone-200">
            <label className="flex items-start gap-3 cursor-pointer mb-4">
              <Checkbox
                checked={agreed}
                onCheckedChange={(v) => setAgreed(v === true)}
                className="mt-1"
              />
              <span className="text-sm text-stone-700">
                Tôi đã đọc và đồng ý với <strong>Thỏa thuận hợp tác</strong> của AgriSmart AI. 
                Tôi cam kết tuân thủ các điều khoản và cung cấp thông tin chính xác.
              </span>
            </label>

            <Button
              size="lg"
              disabled={!agreed}
              onClick={() => navigate("seller-dashboard")}
              className="w-full h-12 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
            >
              {agreed ? "Tiếp tục đăng ký người bán" : "Vui lòng đồng ý để tiếp tục"}
              <ArrowRight className="size-4 ml-2" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ============================================
// BUYER SIGNUP
// ============================================
export function BuyerSignupPage() {
  const navigate = useNav((s) => s.navigate);

  return (
    <div className="min-h-screen bg-stone-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate("signup-role")}
          className="flex items-center gap-2 text-sm text-stone-500 hover:text-green-600 mb-4"
        >
          <ArrowLeft className="size-4" /> Quay lại chọn vai trò
        </button>

        <Card className="p-8 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="size-12 rounded-xl bg-green-600 flex items-center justify-center text-white shadow-lg">
              <ShoppingCart className="size-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Mua nông sản an tâm cùng AgriSmart AI</h1>
              <p className="text-sm text-stone-500">Đăng ký tài khoản người mua</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { icon: "🔍", title: "Nguồn gốc rõ ràng", desc: "QR truy xuất lô hàng" },
              { icon: "✅", title: "Đã qua kiểm tra", desc: "AgriSmart Verified" },
              { icon: "📦", title: "Đóng gói & bảo quản", desc: "AgriSmart điều phối" },
              { icon: "🛡️", title: "Bảo vệ người mua", desc: "Khiếu nại minh bạch" },
            ].map((b, i) => (
              <div key={i} className="bg-green-50 rounded-xl p-3 border border-green-100">
                <div className="text-2xl mb-1">{b.icon}</div>
                <div className="font-bold text-sm">{b.title}</div>
                <div className="text-xs text-stone-500">{b.desc}</div>
              </div>
            ))}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); navigate("buyer-agreement"); }} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Họ và tên *</Label>
                <Input placeholder="Nguyễn Văn A" className="h-11 mt-1" required />
              </div>
              <div>
                <Label>Số điện thoại *</Label>
                <Input placeholder="0901 234 567" className="h-11 mt-1" required />
              </div>
              <div className="sm:col-span-2">
                <Label>Email *</Label>
                <Input type="email" placeholder="email@example.com" className="h-11 mt-1" required />
              </div>
              <div>
                <Label>Mật khẩu *</Label>
                <Input type="password" placeholder="••••••••" className="h-11 mt-1" required />
              </div>
              <div>
                <Label>Xác nhận mật khẩu *</Label>
                <Input type="password" placeholder="••••••••" className="h-11 mt-1" required />
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full h-12 bg-green-600 hover:bg-green-700 shadow-lg">
              Tiếp tục đọc Thỏa thuận
              <ArrowRight className="size-4 ml-2" />
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

// ============================================
// BUYER AGREEMENT - kèm hệ thống uy tín
// ============================================
export function BuyerAgreementPage() {
  const navigate = useNav((s) => s.navigate);
  const [agreed, setAgreed] = useState(false);

  const sections = [
    { title: "1. Quyền của người mua", content: "Người mua có quyền nhận sản phẩm đúng mô tả, đúng chất lượng, có thông tin lô hàng đầy đủ. Được đổi/trả/hoàn tiền theo chính sách." },
    { title: "2. Nghĩa vụ của người mua", content: "Thanh toán đúng hạn, cung cấp địa chỉ giao hàng chính xác, nhận hàng và xác nhận. Không lạm dụng chính sách đổi/trả." },
    { title: "3. Chính sách bảo mật", content: "Thông tin cá nhân người mua được bảo mật. Địa chỉ, SĐT chỉ dùng cho giao hàng, không chia sẻ với bên thứ ba." },
    { title: "4. Chính sách thanh toán", content: "Hỗ trợ COD, VNPay, Momo, Banking. Thanh toán an toàn qua cổng bảo mật. AgriSmart không lưu thông tin thẻ." },
    { title: "5. Chính sách đổi/trả", content: "Đổi/trả trong 2h sau khi nhận hàng. Sản phẩm hỏng, không đúng mô tả, thiếu được hoàn tiền 100%." },
    { title: "6. Chính sách khiếu nại", content: "Gửi khiếu nại trong 24h sau nhận hàng. AgriSmart xác minh công bằng, không tự động quy lỗi người bán hay người mua." },
    { title: "7. Quy trình xử lý khi sản phẩm có vấn đề", content: "Tiếp nhận → AgriSmart kiểm tra → Xác minh → Đưa ra kết luận → Hoàn tiền/đổi hàng/từ chối hoặc 'chưa xác định nguyên nhân'." },
    { title: "8. Cơ chế đánh giá", content: "Sau khi nhận hàng, người mua đánh giá sao và viết nhận xét. Đánh giá minh bạch, không bị xóa nếu trung thực." },
  ];

  return (
    <div className="min-h-screen bg-stone-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate("buyer-signup")}
          className="flex items-center gap-2 text-sm text-stone-500 hover:text-green-600 mb-4"
        >
          <ArrowLeft className="size-4" /> Quay lại
        </button>

        <Card className="p-8 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="size-12 rounded-xl bg-green-600 flex items-center justify-center text-white shadow-lg">
              <ShieldCheck className="size-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Thỏa thuận mua hàng & chính sách bảo vệ người mua</h1>
              <p className="text-sm text-stone-500">AgriSmart AI</p>
            </div>
          </div>

          <div className="space-y-6 max-h-[450px] overflow-y-auto pr-2 mb-6">
            {sections.map((s, i) => (
              <div key={i} className="border-l-4 border-green-500 pl-4">
                <h3 className="font-bold text-base mb-2">{s.title}</h3>
                <p className="text-sm text-stone-600 leading-relaxed">{s.content}</p>
              </div>
            ))}
          </div>

          {/* Mức độ uy tín người mua */}
          <div className="bg-gradient-to-br from-green-50 to-amber-50 rounded-2xl p-5 border border-green-200 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="font-bold text-base">Mức độ uy tín người mua</h3>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="text-3xl font-bold text-amber-500">★★★★★</div>
              <div>
                <div className="font-bold text-lg text-green-700">Uy tín tốt</div>
                <div className="text-xs text-stone-500">Đạt 95% các tiêu chí</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                "Tỷ lệ nhận hàng: 98%",
                "Tỷ lệ hủy đơn: 2%",
                "Lịch sử giao dịch: 234 đơn",
                "Đánh giá từ người bán: 4.8/5",
              ].map((t, i) => (
                <div key={i} className="bg-white rounded-lg p-2 border border-stone-200">
                  {t}
                </div>
              ))}
            </div>
            <p className="text-xs text-stone-500 mt-3 italic">
              * Hệ thống uy tín chỉ hỗ trợ quản lý giao dịch và giảm rủi ro, không dùng để phân biệt đối xử.
            </p>
          </div>

          <div className="pt-6 border-t border-stone-200">
            <label className="flex items-start gap-3 cursor-pointer mb-4">
              <Checkbox
                checked={agreed}
                onCheckedChange={(v) => setAgreed(v === true)}
                className="mt-1"
              />
              <span className="text-sm text-stone-700">
                Tôi đã đọc và đồng ý với <strong>Thỏa thuận mua hàng</strong> và 
                <strong> Chính sách bảo vệ người mua</strong> của AgriSmart AI.
              </span>
            </label>

            <Button
              size="lg"
              disabled={!agreed}
              onClick={() => navigate("buyer-home")}
              className="w-full h-12 bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
            >
              {agreed ? "Bắt đầu mua sắm" : "Vui lòng đồng ý để tiếp tục"}
              <ArrowRight className="size-4 ml-2" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

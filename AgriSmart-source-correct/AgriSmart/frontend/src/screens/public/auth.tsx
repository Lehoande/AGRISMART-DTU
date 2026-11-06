"use client";
import { useEffect, useState } from "react";
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
import { sellerAgreementSections } from "@/lib/seller-agreement";
import { getAuthToken, loginApi, logoutApi, onboardSellerApi, registerApi, registerSellerApi, verifyLoginTwoFactor } from "@/lib/api-client";
import { CommuneAutocomplete, DistrictAutocomplete, hasDistrictOptions, ProvinceAutocomplete } from "@/components/agri/province-autocomplete";

export function LoginPage() {
  const navigate = useNav((s) => s.navigate);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [challengeToken, setChallengeToken] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);
    try {
      const result = challengeToken
        ? await verifyLoginTwoFactor(challengeToken, twoFactorCode)
        : await loginApi(email.trim(), password);
      if ("requires_two_factor" in result && result.requires_two_factor) {
        setChallengeToken(result.challenge_token || "");
        return;
      }
      if (!result.user) throw new Error("Không nhận được thông tin tài khoản.");
      if (["admin", "manager", "staff"].includes(result.user.role)) {
        logoutApi();
        setLoginError("Đây là tài khoản quản trị. Hãy đăng nhập tại cổng riêng: /admin");
        return;
      }
      if (result.user.role !== "customer" && result.user.role !== "seller") {
        logoutApi();
        setLoginError("Vai trò tài khoản chưa được hỗ trợ.");
        return;
      }
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
          {!challengeToken && <>
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
          </div></>}

          {challengeToken && <div>
            <p className="mb-3 rounded-lg bg-green-50 p-3 text-sm text-green-800">Nhập mã 6 chữ số từ ứng dụng xác thực để hoàn tất đăng nhập.</p>
            <Label htmlFor="two-factor-code">Mã xác thực</Label>
            <Input id="two-factor-code" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoComplete="one-time-code" value={twoFactorCode} onChange={(event) => setTwoFactorCode(event.target.value.replace(/\D/g, "").slice(0, 6))} className="mt-1 h-11 tracking-[0.3em]" required />
            <button type="button" className="mt-3 text-sm text-green-600 hover:underline" onClick={() => { setChallengeToken(""); setTwoFactorCode(""); setLoginError(""); }}>Quay lại đăng nhập</button>
          </div>}

          <Button type="submit" disabled={isLoggingIn || (Boolean(challengeToken) && twoFactorCode.length !== 6)} size="lg" className="w-full h-12 bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/30">
            {isLoggingIn ? "Đang xác thực…" : challengeToken ? "Xác nhận mã" : "Đăng nhập"}
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
              {["Quản lý sản phẩm, tồn kho và đơn hàng", "Khai báo thông tin truy xuất", "Theo dõi doanh thu từ đơn hàng", "Dùng trợ lý để rà soát thông tin"].map((b, i) => (
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
              {["Xem thông tin do người bán khai báo", "Kiểm tra giá và tình trạng hàng", "Đặt và theo dõi đơn hàng", "Đánh giá hoặc gửi khiếu nại theo đơn"].map((b, i) => (
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
  const [signupError, setSignupError] = useState("");
  const [isExistingCustomer, setIsExistingCustomer] = useState(false);
  const [farmLocation, setFarmLocation] = useState({ province: "", district: "", ward: "" });
  const [farmName, setFarmName] = useState("");
  const [showFarmSuggestions, setShowFarmSuggestions] = useState(false);
  const farmNameSuggestions = [
    { name: "HTX Nông nghiệp Ngọc Hoàng", area: "Sơn La", source: "https://vca.org.vn/gio-g-truy-xuat-nguon-goc-hop-tac-xa-chay-dua-so-hoa-du-lieu-vung-trong-video34093.html" },
    { name: "HTX Dịch vụ nông lâm nghiệp Bình Sơn", area: "Thanh Hóa", source: "https://vca.org.vn/gio-g-truy-xuat-nguon-goc-hop-tac-xa-chay-dua-so-hoa-du-lieu-vung-trong-video34093.html" },
    { name: "HTX Thắng Thủy", area: "Hà Nội", source: "https://vca.org.vn/gio-g-truy-xuat-nguon-goc-hop-tac-xa-chay-dua-so-hoa-du-lieu-vung-trong-video34093.html" },
    { name: "HTX Xây dựng và Nông nghiệp Bảo Khánh", area: "Sơn La", source: "https://vca.org.vn/htxxay-dung-va-nong-nghiep-bao-khanhson-la-trong-na-thai-thanh-cong-a19903.html" },
    { name: "HTX Phúc Sơn", area: "Sơn La", source: "https://vca.org.vn/vca-ho-tro-vat-tu-thiet-bi-xay-dung-02-mo-hinh-hop-tac-xa-san-xuat-kinh-doanh-gan-voi-chuoi-gia-tri-tai-tinh-son-la-a20481.html" },
    { name: "HTX Dịch vụ Sản xuất Thương mại Nông nghiệp 4.0", area: "Long An", source: "https://vca.org.vn/hop-tac-xa-nong-nghiep-chu-trong-lien-ket-san-xuat-a30017.html" },
    { name: "HTX Dịch vụ nông nghiệp Hoàng Hà", area: "Hà Tĩnh", source: "https://vca.org.vn/doanh-nghiep-hop-tac-xa-lam-ba-do-video21982.html" },
    { name: "HTX Nậm Nghẹp", area: "Sơn La", source: "https://vca.org.vn/tu-ho-don-le-den-chuoi-gia-tri-san-vat-vung-cao-a34372.html" },
    { name: "HTX Nông nghiệp An Nhơn Nam", area: "Gia Lai", source: "https://vca.org.vn/thanh-lap-moi-hop-tac-xa-nong-nghiep-phuong-an-nhon-nam-video34240.html" },
  ];
  const filteredFarmSuggestions = farmName.trim()
    ? farmNameSuggestions.filter(({ name }) => name.toLocaleLowerCase("vi").includes(farmName.trim().toLocaleLowerCase("vi")))
    : farmNameSuggestions;
  useEffect(() => { const timer = window.setTimeout(() => setIsExistingCustomer(Boolean(getAuthToken())), 0); return () => window.clearTimeout(timer); }, []);

  const saveSellerDraft = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSignupError("");
    const data = new FormData(event.currentTarget);
    const password = String(data.get("password") || "");
    const confirmPassword = String(data.get("confirmPassword") || "");
    if (!isExistingCustomer && password.length < 8) { setSignupError("Mật khẩu cần có ít nhất 8 ký tự."); return; }
    if (!isExistingCustomer && password !== confirmPassword) { setSignupError("Mật khẩu xác nhận không khớp."); return; }
    const draft = {
      name: String(data.get("name") || "").trim(), phone: String(data.get("phone") || "").trim(),
      email: String(data.get("email") || "").trim(), farm_name: String(data.get("farm_name") || "").trim(),
      farm_address: [farmLocation.ward, farmLocation.district, farmLocation.province].filter(Boolean).join(", "),
      password, mode: isExistingCustomer ? "existing-customer" : "new-account",
    };
    window.sessionStorage.setItem("agrismart_seller_signup_draft", JSON.stringify(draft));
    navigate("seller-agreement");
  };

  return (
    <div className="min-h-screen bg-stone-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => {
            window.sessionStorage.removeItem("agrismart_seller_signup_draft");
            navigate(isExistingCustomer ? "buyer-home" : "signup-role");
          }}
          className="flex items-center gap-2 text-sm text-stone-500 hover:text-green-600 mb-4"
        >
          <ArrowLeft className="size-4" /> {isExistingCustomer ? "Hủy tạo gian hàng · Về mua hàng" : "Quay lại chọn vai trò"}
        </button>

        <Card className="p-8 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="size-12 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-lg">
              <Wheat className="size-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Bán nông sản cùng AgriSmart AI</h1>
              <p className="text-sm text-stone-500">{isExistingCustomer ? "Tạo gian hàng trên tài khoản hiện tại" : "Đăng ký tài khoản người bán"}</p>
            </div>
          </div>

          {/* 4 lợi ích */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { icon: "👥", title: "Tiếp cận người mua", desc: "Qua danh mục sản phẩm" },
              { icon: "🔍", title: "Quản lý truy xuất", desc: "Bổ sung thông tin lô" },
              { icon: "📦", title: "Quản lý tồn kho", desc: "Theo số lượng đã nhập" },
              { icon: "📊", title: "Theo dõi đơn hàng", desc: "Dữ liệu từ hệ thống" },
            ].map((b, i) => (
              <div key={i} className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                <div className="text-2xl mb-1">{b.icon}</div>
                <div className="font-bold text-sm">{b.title}</div>
                <div className="text-xs text-stone-500">{b.desc}</div>
              </div>
            ))}
          </div>

          {/* Form đăng ký */}
          <form onSubmit={saveSellerDraft} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              {!isExistingCustomer && <>
              <div>
                <Label>Họ và tên *</Label>
                <Input name="name" placeholder="Nguyễn Văn A" className="h-11 mt-1" required minLength={2} maxLength={120} />
              </div>
              <div>
                <Label>Số điện thoại *</Label>
                <Input name="phone" type="tel" placeholder="0901 234 567" className="h-11 mt-1" required />
              </div>
              <div>
                <Label>Email *</Label>
                <Input name="email" type="email" placeholder="email@example.com" className="h-11 mt-1" required />
              </div>
              </>}
              <div>
                <Label>Tên nông trại / HTX *</Label>
                <div className="relative">
                  <Input
                    name="farm_name"
                    value={farmName}
                    onChange={(event) => setFarmName(event.target.value)}
                    onFocus={() => setShowFarmSuggestions(true)}
                    onBlur={() => window.setTimeout(() => setShowFarmSuggestions(false), 150)}
                    placeholder="Nhập tên nông trại / HTX"
                    autoComplete="off"
                    className="h-11 mt-1"
                    required
                    minLength={2}
                    maxLength={180}
                  />
                  {showFarmSuggestions && filteredFarmSuggestions.length > 0 && <div className="absolute z-30 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border bg-white p-1 shadow-xl" role="listbox" aria-label="Gợi ý tên hợp tác xã thực tế">
                    {filteredFarmSuggestions.map((suggestion) => <button
                      key={suggestion.name}
                      type="button"
                      role="option"
                      aria-selected={farmName === suggestion.name}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => { setFarmName(suggestion.name); setShowFarmSuggestions(false); }}
                      className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left hover:bg-amber-50 focus:bg-amber-50 focus:outline-none"
                    >
                      <span className="font-medium text-stone-800">{suggestion.name}</span>
                      <span className="shrink-0 text-xs text-stone-500">{suggestion.area}</span>
                    </button>)}
                  </div>}
                </div>
                <p className="mt-1 text-xs text-stone-500">Gợi ý từ HTX được Liên minh HTX Việt Nam giới thiệu; đây không phải danh bạ đầy đủ. Hãy nhập đúng tên trên giấy tờ nếu HTX của bạn không có trong danh sách.</p>
              </div>
              <div>
                <Label htmlFor="farm-province">Tỉnh / Thành phố *</Label>
                <ProvinceAutocomplete id="farm-province" value={farmLocation.province} onChange={(province) => setFarmLocation({ province, district: "", ward: "" })} placeholder="Gõ để tìm tỉnh/thành phố" className="h-11 mt-1" required maxLength={120} />
              </div>
              {hasDistrictOptions(farmLocation.province) > 0 && <div>
                <Label htmlFor="farm-district">Quận / Huyện *</Label>
                <DistrictAutocomplete id="farm-district" province={farmLocation.province} value={farmLocation.district} onChange={(district) => setFarmLocation((current) => ({ ...current, district, ward: "" }))} placeholder="Gõ để tìm quận/huyện" className="h-11 mt-1" required maxLength={120} />
              </div>}
              <div className="sm:col-span-2">
                <Label htmlFor="farm-ward">Xã / Phường *</Label>
                <CommuneAutocomplete id="farm-ward" province={farmLocation.province} district={hasDistrictOptions(farmLocation.province) ? farmLocation.district : undefined} value={farmLocation.ward} onChange={(ward) => setFarmLocation((current) => ({ ...current, ward }))} placeholder={farmLocation.province ? "Gõ để tìm xã/phường" : "Chọn tỉnh/thành phố trước"} className="h-11 mt-1" required maxLength={120} />
                {farmLocation.province && hasDistrictOptions(farmLocation.province) === 0 && <p className="mt-1 text-xs text-stone-500">Theo danh mục địa giới hiện tại, hãy chọn xã/phường trực tiếp; không cần quận/huyện.</p>}
              </div>
              {!isExistingCustomer && <div>
                <Label>Mật khẩu *</Label>
                <Input name="password" type="password" placeholder="Ít nhất 8 ký tự" className="h-11 mt-1" required minLength={8} />
              </div>}
              {!isExistingCustomer && <div>
                <Label>Xác nhận mật khẩu *</Label>
                <Input name="confirmPassword" type="password" placeholder="Nhập lại mật khẩu" className="h-11 mt-1" required minLength={8} />
              </div>}
            </div>

            {signupError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{signupError}</p>}
            <Button type="submit" size="lg" className="w-full h-12 bg-amber-500 hover:bg-amber-600 shadow-lg">
              {isExistingCustomer ? "Tiếp tục tạo gian hàng" : "Tiếp tục đọc Thỏa thuận"}
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
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationError, setRegistrationError] = useState("");
  const [hasBuyerSession, setHasBuyerSession] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setHasBuyerSession(Boolean(getAuthToken())), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const cancelSellerSignup = () => {
    window.sessionStorage.removeItem("agrismart_seller_signup_draft");
    navigate(hasBuyerSession ? "buyer-home" : "signup-role");
  };

  const completeRegistration = async () => {
    setRegistrationError("");
    const draft = window.sessionStorage.getItem("agrismart_seller_signup_draft");
    if (!draft) { setRegistrationError("Không tìm thấy thông tin đăng ký. Vui lòng nhập lại thông tin."); return; }
    setIsRegistering(true);
    try {
      const details = JSON.parse(draft) as { name: string; phone: string; email: string; password: string; farm_name: string; farm_address: string; mode?: string };
      if (details.mode === "existing-customer") {
        await onboardSellerApi({ farm_name: details.farm_name, farm_address: details.farm_address });
      } else {
        await registerSellerApi(details);
        await loginApi(details.email, details.password);
      }
      window.sessionStorage.removeItem("agrismart_seller_signup_draft");
      navigate("seller-dashboard");
    } catch (error) {
      setRegistrationError(error instanceof Error ? error.message : "Không thể tạo tài khoản người bán.");
    } finally { setIsRegistering(false); }
  };

  return (
    <div className="min-h-screen bg-stone-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => navigate("seller-signup")}
            className="flex items-center gap-2 text-sm text-stone-500 hover:text-green-600"
          >
            <ArrowLeft className="size-4" /> Quay lại chỉnh thông tin
          </button>
          <button
            type="button"
            onClick={cancelSellerSignup}
            disabled={isRegistering}
            className="rounded-lg px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-200 disabled:opacity-50"
          >
            Hủy tạo gian hàng{hasBuyerSession ? " · Về trang người mua" : ""}
          </button>
        </div>

        <Card className="p-8 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="size-12 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-lg">
              <FileText className="size-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Thỏa thuận mua bán và hợp tác</h1>
              <p className="text-sm text-stone-500">Dành cho Người bán · Phiên bản 2.0</p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-2">
              <ShieldCheck className="size-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-sm text-stone-700">
                Sau khi đăng ký, gian hàng sẽ chờ admin duyệt và chỉ được đăng bán khi được chấp thuận. Hệ thống hiện chưa cấu hình thu phí nền tảng hoặc đối soát lợi nhuận.
              </p>
            </div>
          </div>

          <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
            {sellerAgreementSections.map((s, i) => (
              <div key={i} className="border-l-4 border-amber-400 pl-4">
                <h3 className="font-bold text-base mb-2">{i + 1}. {s.title}</h3>
                <p className="text-sm text-stone-600 leading-relaxed">{s.content}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-stone-200">
            {registrationError && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{registrationError}</p>}
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
              disabled={!agreed || isRegistering}
              onClick={completeRegistration}
              className="w-full h-12 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
            >
              {isRegistering ? "Đang tạo gian hàng…" : agreed ? "Hoàn tất tạo gian hàng" : "Vui lòng đồng ý để tiếp tục"}
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
  const [signup, setSignup] = useState({ name: "", phone: "", email: "", password: "", confirmPassword: "" });
  const [signupError, setSignupError] = useState("");

  const continueSignup = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSignupError("");
    if (signup.password.length < 8) {
      setSignupError("Mật khẩu cần có ít nhất 8 ký tự.");
      return;
    }
    if (signup.password !== signup.confirmPassword) {
      setSignupError("Mật khẩu xác nhận không khớp.");
      return;
    }
    window.sessionStorage.setItem("agrismart_signup_draft", JSON.stringify({ name: signup.name.trim(), phone: signup.phone.trim(), email: signup.email.trim(), password: signup.password }));
    navigate("buyer-agreement");
  };

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
              { icon: "🔍", title: "Thông tin nguồn gốc", desc: "Do người bán khai báo" },
              { icon: "🛒", title: "Đặt hàng", desc: "Xem phí giao trước khi đặt" },
              { icon: "📦", title: "Theo dõi đơn", desc: "Trạng thái lưu trong tài khoản" },
              { icon: "🛡️", title: "Hỗ trợ theo đơn", desc: "Gửi khiếu nại kèm bằng chứng" },
            ].map((b, i) => (
              <div key={i} className="bg-green-50 rounded-xl p-3 border border-green-100">
                <div className="text-2xl mb-1">{b.icon}</div>
                <div className="font-bold text-sm">{b.title}</div>
                <div className="text-xs text-stone-500">{b.desc}</div>
              </div>
            ))}
          </div>

          <form onSubmit={continueSignup} className="space-y-4">
            {signupError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{signupError}</p>}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Họ và tên *</Label>
                <Input value={signup.name} onChange={(event) => setSignup({ ...signup, name: event.target.value })} placeholder="Nguyễn Văn A" className="h-11 mt-1" required minLength={2} maxLength={120} />
              </div>
              <div>
                <Label>Số điện thoại *</Label>
                <Input type="tel" value={signup.phone} onChange={(event) => setSignup({ ...signup, phone: event.target.value })} placeholder="0901 234 567" className="h-11 mt-1" required />
              </div>
              <div className="sm:col-span-2">
                <Label>Email *</Label>
                <Input type="email" value={signup.email} onChange={(event) => setSignup({ ...signup, email: event.target.value })} placeholder="email@example.com" className="h-11 mt-1" required />
              </div>
              <div>
                <Label>Mật khẩu *</Label>
                <Input type="password" value={signup.password} onChange={(event) => setSignup({ ...signup, password: event.target.value })} placeholder="Ít nhất 8 ký tự" className="h-11 mt-1" required minLength={8} />
              </div>
              <div>
                <Label>Xác nhận mật khẩu *</Label>
                <Input type="password" value={signup.confirmPassword} onChange={(event) => setSignup({ ...signup, confirmPassword: event.target.value })} placeholder="Nhập lại mật khẩu" className="h-11 mt-1" required minLength={8} />
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
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationError, setRegistrationError] = useState("");

  const completeRegistration = async () => {
    setRegistrationError("");
    const draft = window.sessionStorage.getItem("agrismart_signup_draft");
    if (!draft) {
      setRegistrationError("Không tìm thấy thông tin đăng ký. Vui lòng quay lại và nhập lại thông tin.");
      return;
    }
    setIsRegistering(true);
    try {
      const details = JSON.parse(draft) as { name: string; phone: string; email: string; password: string };
      await registerApi(details);
      await loginApi(details.email, details.password);
      window.sessionStorage.removeItem("agrismart_signup_draft");
      navigate("buyer-home");
    } catch (error) {
      setRegistrationError(error instanceof Error ? error.message : "Không thể tạo tài khoản. Vui lòng thử lại.");
    } finally {
      setIsRegistering(false);
    }
  };

  const sections = [
    { title: "1. Quyền của người mua", content: "Người mua có thể xem thông tin do gian hàng cung cấp, đặt hàng, theo dõi trạng thái và gửi khiếu nại trong hệ thống." },
    { title: "2. Nghĩa vụ của người mua", content: "Cung cấp thông tin liên hệ và địa chỉ giao chính xác; thanh toán theo phương thức đã chọn; phối hợp khi người bán liên hệ xử lý đơn." },
    { title: "3. Sử dụng thông tin", content: "Thông tin tài khoản và giao nhận được dùng để vận hành tài khoản, xử lý đơn và hỗ trợ giao hàng. Dữ liệu chỉ được chia sẻ khi cần cho các mục đích này hoặc theo quy định pháp luật." },
    { title: "4. Phương thức thanh toán", content: "Hiện hỗ trợ thanh toán khi nhận hàng (COD) và chuyển khoản thủ công theo thông tin ngân hàng hiển thị ở bước thanh toán. Chuyển khoản cần được quản trị viên đối soát; hệ thống chưa kết nối API ngân hàng để tự xác nhận." },
    { title: "5. Khiếu nại và đổi trả", content: "Khi có vấn đề, người mua có thể gửi khiếu nại kèm mô tả và đường dẫn bằng chứng. Hệ thống hiện chưa cấu hình thời hạn đổi trả, mức hoàn tiền hoặc quy trình hoàn tiền tự động; kết quả cần được các bên xử lý và xác nhận." },
    { title: "6. Quy trình xử lý khi sản phẩm có vấn đề", content: "Khiếu nại được lưu để các bên có thể xem xét. Việc xác minh, đổi hàng hoặc hoàn tiền hiện cần xử lý thủ công; gửi khiếu nại không đồng nghĩa với việc yêu cầu đã được chấp thuận." },
    { title: "7. Đánh giá", content: "Người mua có thể gửi đánh giá cho sản phẩm trong đơn đã hoàn tất. Đánh giá được lưu cùng tài khoản và đơn hàng liên quan." },
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

          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-5">
            <h3 className="font-bold text-base">Lịch sử giao dịch</h3>
            <p className="mt-2 text-sm text-stone-600">Đơn mua, trạng thái hoàn tất và đánh giá sẽ được ghi nhận từ hoạt động thực tế sau khi bạn sử dụng tài khoản.</p>
          </div>

          <div className="pt-6 border-t border-stone-200">
            {registrationError && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{registrationError}</p>}
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
              disabled={!agreed || isRegistering}
              onClick={completeRegistration}
              className="w-full h-12 bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
            >
              {isRegistering ? "Đang tạo tài khoản…" : agreed ? "Hoàn tất đăng ký và bắt đầu mua sắm" : "Vui lòng đồng ý để tiếp tục"}
              <ArrowRight className="size-4 ml-2" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

"use client";
import { useEffect, useRef, useState } from "react";
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
import { formatPrice, STANDARD_SHIPPING_FEE, FREE_SHIPPING_THRESHOLD } from "@/lib/agri-data";
import { BuyerHeader } from "@/components/agri/buyer-header";
import { CommuneAutocomplete, DistrictAutocomplete, hasDistrictOptions, ProvinceAutocomplete } from "@/components/agri/province-autocomplete";
import { addApiCartItem, checkoutApi, clearApiCart, getAuthToken, getMyProfile, getBankTransferConfig, claimBankTransfer, type BankTransferConfig } from "@/lib/api-client";
import { formatShippingAddress, streetAddressFromProfile } from "@/lib/shipping-address";

type PaymentMethod = "cod" | "banking";

export function BuyerCheckoutPage() {
  const { items, getTotalPrice, clearCart, promoCode, promoPercent } = useCart();
  const navigate = useNav((s) => s.navigate);
  const { toast } = useToast();
  const [payment, setPayment] = useState<PaymentMethod>("cod");
  const [submitted, setSubmitted] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<number | null>(null);
  const [createdOrderTotal, setCreatedOrderTotal] = useState<number | null>(null);
  const [bankConfig, setBankConfig] = useState<BankTransferConfig | null>(null);
  const [isClaimingTransfer, setIsClaimingTransfer] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitLock = useRef(false);
  const checkoutIdempotencyKey = useRef<string | null>(null);
  const [useDefaultInfo, setUseDefaultInfo] = useState(false);
  const [defaultProfile, setDefaultProfile] = useState<{ name: string; email: string; phone: string | null; address: string | null; ward: string | null; district: string | null; province: string | null } | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    ward: "",
    district: "",
    province: "",
    note: "",
  });

  useEffect(() => {
    if (!getAuthToken()) return;
    let active = true;
    const loadingTimer = window.setTimeout(() => {
      if (active) setIsLoadingProfile(true);
    }, 0);
    getMyProfile()
      .then((profile) => { if (active) setDefaultProfile(profile); })
      .catch(() => { if (active) setDefaultProfile(null); })
      .finally(() => {
        window.clearTimeout(loadingTimer);
        if (active) setIsLoadingProfile(false);
      });
    return () => {
      active = false;
      window.clearTimeout(loadingTimer);
    };
  }, []);

  useEffect(() => {
    let active = true;
    getBankTransferConfig().then((config) => { if (active) setBankConfig(config); }).catch(() => { if (active) setBankConfig(null); });
    return () => { active = false; };
  }, []);

  const applyDefaultInfo = (enabled: boolean) => {
    setUseDefaultInfo(enabled);
    if (!enabled || !defaultProfile) return;
    setForm((current) => ({
      ...current,
      name: defaultProfile.name || current.name,
      phone: defaultProfile.phone || current.phone,
      email: defaultProfile.email || current.email,
      address: streetAddressFromProfile(defaultProfile.address, defaultProfile.ward, defaultProfile.district, defaultProfile.province) || current.address,
      ward: defaultProfile.ward || current.ward,
      district: defaultProfile.district || current.district,
      province: defaultProfile.province || current.province,
    }));
  };

  const subtotal = getTotalPrice();
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
  const discount = Math.round(subtotal * promoPercent / 100);
  const total = subtotal - discount + shipping;
  const transferNote = createdOrderId ? `AGRISMART ${createdOrderId}` : "";
  const bankQrUrl = bankConfig?.configured && createdOrderTotal !== null && createdOrderId
    ? `https://img.vietqr.io/image/${encodeURIComponent(bankConfig.bank_bin)}-${encodeURIComponent(bankConfig.account_no)}-compact2.svg?amount=${Math.round(createdOrderTotal)}&addInfo=${encodeURIComponent(transferNote)}&accountName=${encodeURIComponent(bankConfig.account_name)}`
    : null;

  const reportBankTransfer = async () => {
    if (!createdOrderId) return;
    setIsClaimingTransfer(true);
    try {
      const result = await claimBankTransfer(createdOrderId);
      toast({ title: result.claimed ? "Đã ghi nhận bạn báo chuyển khoản" : "Đơn hàng đã thanh toán", description: result.claimed ? "Đơn đang chờ quản trị viên đối soát sao kê." : "Bạn sẽ được chuyển đến danh sách đơn hàng." });
      navigate("buyer-orders");
    } catch (error) {
      toast({ title: "Chưa gửi được thông báo chuyển khoản", description: error instanceof Error ? error.message : "Vui lòng thử lại.", variant: "destructive" });
    } finally {
      setIsClaimingTransfer(false);
    }
  };

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
            {payment === "banking" ? "Bạn có 5 phút để chuyển khoản. Nếu quá thời hạn mà hệ thống chưa xác nhận thanh toán, đơn hàng sẽ tự động bị hủy. Vui lòng chuyển đúng số tiền và nội dung bên dưới." : "Đơn hàng đã được ghi nhận và sẽ được tiếp nhận để xử lý."}
          </p>
          <div className="bg-white rounded-2xl border border-stone-200 p-5 w-full max-w-md mb-6">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-xs text-stone-500">Tổng giá trị</div>
                <div className="font-bold text-green-700">{formatPrice(createdOrderTotal ?? total)}</div>
              </div>
              <div>
                <div className="text-xs text-stone-500">Phương thức</div>
                <div className="font-bold">
                  {payment === "cod" ? "Tiền mặt khi nhận hàng" : "Chuyển khoản ngân hàng"}
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
          {payment === "banking" && (
            <div className="mb-6 w-full max-w-md rounded-2xl border border-green-200 bg-white p-5 text-left">
              <h2 className="mb-2 text-lg font-bold">Chuyển khoản vào tài khoản ngân hàng</h2>
              {bankQrUrl && <img src={bankQrUrl} alt="Mã VietQR chuyển khoản đơn hàng" className="mx-auto mb-4 w-64 rounded-xl border bg-white" />}
              {bankConfig?.configured ? <dl className="space-y-2 text-sm">
                <div className="flex justify-between gap-3"><dt className="text-stone-500">Ngân hàng</dt><dd className="text-right font-semibold">{bankConfig.bank_name}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-stone-500">Chủ tài khoản</dt><dd className="text-right font-semibold">{bankConfig.account_name}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-stone-500">Số tài khoản</dt><dd className="text-right font-semibold">{bankConfig.account_no}</dd></div>
                {bankConfig.branch && <div className="flex justify-between gap-3"><dt className="text-stone-500">Chi nhánh</dt><dd className="text-right font-semibold">{bankConfig.branch}</dd></div>}
                <div className="flex justify-between gap-3"><dt className="text-stone-500">Số tiền</dt><dd className="text-right font-bold text-green-700">{formatPrice(createdOrderTotal ?? total)}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-stone-500">Nội dung chuyển khoản</dt><dd className="text-right font-bold">{transferNote}</dd></div>
                <p className="pt-2 text-xs text-amber-800">Đơn đang chờ xác nhận đã nhận tiền. Hãy kiểm tra đúng tên và số tài khoản trong ứng dụng ngân hàng trước khi chuyển.</p>
              </dl> : <p className="text-sm text-amber-800">Tài khoản ngân hàng chưa được cấu hình. Vui lòng chọn COD hoặc liên hệ cửa hàng.</p>}
            </div>
          )}
          {payment === "banking" && bankConfig?.configured && <Button onClick={() => void reportBankTransfer()} disabled={isClaimingTransfer} className="mb-6 w-full max-w-md bg-green-700 hover:bg-green-800">{isClaimingTransfer ? "Đang ghi nhận…" : "Tôi đã chuyển khoản"}</Button>}
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
    if (submitLock.current || isSubmitting) return;
    if (payment === "banking" && !bankConfig?.configured) {
      toast({ title: "Chưa cấu hình tài khoản nhận tiền", description: "Vui lòng chọn COD hoặc liên hệ cửa hàng.", variant: "destructive" });
      return;
    }
    if (!form.name.trim() || !form.phone.trim() || !form.address.trim() || !form.ward.trim() || !form.province.trim()) {
      toast({ title: "Vui lòng điền đầy đủ thông tin", description: "Tên, số điện thoại, địa chỉ, phường/xã và tỉnh/thành phố là bắt buộc.", variant: "destructive" });
      return;
    }
    if (!getAuthToken()) {
      toast({ title: "Bạn cần đăng nhập", description: "Vui lòng đăng nhập trước khi đặt hàng.", variant: "destructive" });
      navigate("login");
      return;
    }
    submitLock.current = true;
    setIsSubmitting(true);
    try {
      checkoutIdempotencyKey.current ||= window.crypto.randomUUID();
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
        shipping_address: formatShippingAddress(form.address, form.ward, form.district, form.province),
        shipping_street_address: form.address.trim(),
        shipping_ward: form.ward.trim(),
        shipping_district: form.district.trim(),
        shipping_province: form.province.trim(),
        payment_method: payment,
        promo_code: promoCode,
      }, checkoutIdempotencyKey.current);
      if (order.idempotent_replay) {
        clearCart();
        toast({ title: "Đơn hàng đã được tạo trước đó", description: `Đơn #${order.id} đã được ghi nhận; không tạo thêm đơn mới.` });
        navigate("buyer-orders");
        return;
      }
      setCreatedOrderId(order.id);
      setCreatedOrderTotal(Number(order.total));
      setSubmitted(true);
      clearCart();
    } catch (error) {
      toast({ title: "Không thể tạo đơn hàng", description: error instanceof Error ? error.message : "Vui lòng kiểm tra kết nối và thử lại.", variant: "destructive" });
    } finally {
      submitLock.current = false;
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
              <label className={`mb-4 flex items-start gap-3 rounded-xl border p-3 ${defaultProfile ? "cursor-pointer border-green-200 bg-green-50" : "border-stone-200 bg-stone-50"}`}>
                <input
                  type="checkbox"
                  checked={useDefaultInfo}
                  disabled={!defaultProfile}
                  onChange={(e) => applyDefaultInfo(e.target.checked)}
                  className="mt-0.5 size-4 accent-green-600"
                />
                <span>
                  <span className="block text-sm font-semibold">Sử dụng thông tin mặc định</span>
                  <span className="mt-0.5 block text-xs text-stone-500">
                    {isLoadingProfile ? "Đang tải thông tin hồ sơ…" : defaultProfile ? "Tự điền tên, email, số điện thoại và địa chỉ đã lưu trong hồ sơ." : "Chưa có thông tin hồ sơ. Vui lòng đăng nhập và cập nhật thông tin tài khoản."}
                  </span>
                </span>
              </label>
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
                <div className="sm:col-span-2 rounded-lg bg-stone-50 p-3 text-xs text-stone-600">
                  Chọn tỉnh/thành phố trước, sau đó chọn phường/xã. Chỉ cần nhập tay số nhà và tên đường.
                </div>
                <div>
                  <Label className="text-xs">Tỉnh/Thành phố *</Label>
                  <ProvinceAutocomplete value={form.province} onChange={(province) => setForm({ ...form, province, district: "", ward: "" })} placeholder="Gõ để tìm tỉnh/thành phố" className="h-10 mt-1" required />
                </div>
                {hasDistrictOptions(form.province) > 0 && <div>
                  <Label className="text-xs">Quận/Huyện</Label>
                  <DistrictAutocomplete province={form.province} value={form.district} onChange={(district) => setForm({ ...form, district, ward: "" })} placeholder="Chọn quận/huyện" className="h-10 mt-1" />
                </div>}
                <div>
                  <Label className="text-xs">Phường/Xã *</Label>
                  <CommuneAutocomplete province={form.province} district={form.district} value={form.ward} onChange={(ward) => setForm({ ...form, ward })} placeholder={form.province ? "Gõ để tìm phường/xã" : "Chọn tỉnh/thành phố trước"} className="h-10 mt-1" required />
                </div>
                <div>
                  <Label className="text-xs">Số nhà, tên đường *</Label>
                  <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Nhập số nhà, tên đường" className="h-10 mt-1" required />
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-xs">Ghi chú</Label>
                  <Input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Giao giờ hành chính, gọi trước..." className="h-10 mt-1" />
                </div>
              </div>
            </div>

              {/* Kiểm tra đơn hàng */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <CheckCircle2 className="size-5 text-green-600" /> Kiểm tra điều kiện đơn hàng
              </h2>
                <p className="text-sm text-stone-600">Khi bạn đặt hàng, hệ thống sẽ kiểm tra lại sản phẩm còn kinh doanh, số lượng tồn kho, giá và thông tin giao hàng. Kết quả xác nhận chỉ có sau khi gửi đơn.</p>
            </div>

            {/* Payment method */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <CreditCard className="size-5 text-green-600" /> Phương thức thanh toán
              </h2>
              <div className="space-y-2" role="radiogroup" aria-label="Phương thức thanh toán">
                {([
                  { id: "cod", label: "Thanh toán tiền mặt (COD)", desc: "Trả tiền khi nhận hàng", icon: "💵" },
                  { id: "banking", label: "Chuyển khoản ngân hàng", desc: bankConfig?.configured ? `Chuyển thẳng đến ${bankConfig.bank_name}` : "Chưa cấu hình tài khoản nhận tiền", icon: "🏦" },
                ] as const).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    role="radio"
                    aria-checked={payment === p.id}
                    onClick={() => setPayment(p.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition ${
                      payment === p.id ? "border-green-600 bg-green-50" : "border-stone-200 hover:border-green-300"
                    }`}
                  >
                    <span aria-hidden="true" className={`flex size-4 shrink-0 items-center justify-center rounded-full border ${payment === p.id ? "border-green-600" : "border-stone-300"}`}>
                      {payment === p.id && <span className="size-2 rounded-full bg-green-600" />}
                    </span>
                    <span className="text-xl">{p.icon}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{p.label}</div>
                      <div className="text-xs text-stone-500">{p.desc}</div>
                    </div>
                    {payment === p.id && <CheckCircle2 className="size-5 text-green-600" />}
                  </button>
                ))}
              </div>
              {payment === "banking" && bankConfig?.configured && <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4 text-sm"><b>Tài khoản nhận tiền:</b> {bankConfig.bank_name} · {bankConfig.account_name} · {bankConfig.account_no}<p className="mt-1 text-xs text-stone-600">Sau khi đặt hàng, hệ thống sẽ cung cấp mã QR và nội dung chuyển khoản riêng cho đơn.</p></div>}
              {payment === "banking" && !bankConfig?.configured && <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><b>Chưa thể đặt đơn chuyển khoản.</b><p className="mt-1 text-xs">Tài khoản ngân hàng nhận tiền chưa được cấu hình. Vui lòng chọn COD hoặc gửi thông tin tài khoản ngân hàng để bật chuyển khoản.</p></div>}
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
                {discount > 0 && <div className="flex justify-between text-green-700"><span>Giảm giá ({promoCode})</span><span>-{formatPrice(discount)}</span></div>}
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
                  <div className="text-xs text-stone-400">Tạm tính sản phẩm và phí vận chuyển</div>
                </div>
              </div>
              <Button type="submit" size="lg" disabled={isSubmitting || (payment === "banking" && !bankConfig?.configured)} className="w-full h-12 bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/30">
                <CheckCircle2 className="size-5 mr-2" /> Xác nhận đặt hàng
              </Button>
              <div className="grid grid-cols-3 gap-2 text-center pt-3 border-t border-stone-100">
                <div className="text-xs">
                  <Truck className="size-5 mx-auto text-green-600 mb-1" />
                  <span className="text-stone-600">Phí giao hiển thị trước</span>
                </div>
                <div className="text-xs">
                  <ShieldCheck className="size-5 mx-auto text-green-600 mb-1" />
                  <span className="text-stone-600">Thông tin do người bán khai báo</span>
                </div>
                <div className="text-xs">
                  <User className="size-5 mx-auto text-green-600 mb-1" />
                  <span className="text-stone-600">Theo dõi đơn trong tài khoản</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

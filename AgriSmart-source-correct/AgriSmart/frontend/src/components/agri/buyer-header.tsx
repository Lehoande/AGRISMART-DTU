"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Search,
  Menu,
  X,
  Sprout,
  Bell,
  User,
  ChevronDown,
  Truck,
  ShieldCheck,
  Phone,
  Home,
  ClipboardList,
  Headphones,
  Cpu,
  Settings,
  ArrowLeftRight,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCart } from "@/lib/cart-store";
import { useNav, type PageId } from "@/lib/nav-store";
import { formatPrice } from "@/lib/agri-data";
import { getAuthAvatar, getAuthToken, getMyProfile } from "@/lib/api-client";

const navItems: { label: string; page: PageId; icon?: typeof Sprout }[] = [
  { label: "Trang chủ", page: "buyer-home", icon: Home },
  { label: "Sản phẩm", page: "buyer-products", icon: Search },
  { label: "Đơn hàng", page: "buyer-orders", icon: ClipboardList },
  { label: "AI AgriSmart", page: "buyer-ai-center", icon: Cpu },
];

export function BuyerHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [accountRole, setAccountRole] = useState<string | null>(null);
  const { items, isOpen, setOpen, removeItem, updateQuantity, getTotalPrice, getTotalItems } =
    useCart();
  const navigate = useNav((s) => s.navigate);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let active = true;
    if (!getAuthToken()) return;
    getMyProfile().then((profile) => { if (active) setAccountRole(profile.role); }).catch(() => { if (active) setAccountRole(null); });
    return () => { active = false; };
  }, []);

  const openSellerArea = () => navigate(accountRole === "seller" ? "seller-dashboard" : "seller-signup");
  const sellerAreaLabel = accountRole === "seller" ? "Trung tâm người bán" : "Tạo gian hàng";

  useEffect(() => {
    const syncAvatar = () => setAvatarUrl(getAuthAvatar() || "");
    syncAvatar();
    window.addEventListener("agrismart-avatar-updated", syncAvatar);
    return () => window.removeEventListener("agrismart-avatar-updated", syncAvatar);
  }, []);

  return (
    <>
      {/* TOP ANNOUNCEMENT BAR */}
      <div className="bg-[#14532d] text-white text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Truck className="size-3.5 text-amber-400" />
              Phí vận chuyển được hiển thị trước khi đặt hàng
            </span>
            <span className="hidden md:inline-flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-green-400" />
              Thông tin truy xuất do từng gian hàng cung cấp
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Phone className="size-3" /> AgriSmart · Nông sản minh bạch
            </span>
          </div>
        </div>
      </div>

      {/* HEADER MAIN */}
      <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-stone-200 transition-all">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between gap-4">
          {/* Logo */}
          <button
            onClick={() => navigate(getAuthToken() ? "buyer-home" : "landing")}
            className="flex items-center gap-2.5 shrink-0"
          >
            <div className="size-10 rounded-xl bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center text-white shadow-lg shadow-green-600/30">
              <Sprout className="size-6" />
            </div>
            <div className="text-left">
              <span className="text-xl font-extrabold text-[#14532d] tracking-tight block leading-none">
                Agri<span className="text-amber-500">Smart</span>
                <span className="text-green-600 text-sm ml-1">AI</span>
              </span>
              <span className="text-[10px] text-stone-500 font-medium tracking-wider uppercase">
                Nông Sản Minh Bạch
              </span>
            </div>
          </button>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl relative hidden md:block">
            <div className="relative w-full">
              <Input
                placeholder="Tìm sầu riêng, rau hữu cơ, gạo ST25..."
                className="w-full pl-11 pr-28 py-2.5 rounded-full border-2 border-green-500/30 focus:border-green-600 focus:outline-none text-sm shadow-inner h-11 bg-white"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-stone-400 pointer-events-none" />
              <Button
                size="sm"
                onClick={() => navigate("buyer-products")}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-9 px-5 rounded-full bg-green-600 hover:bg-green-700"
              >
                Tìm
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("buyer-ai-center")}
              className="hidden md:flex items-center gap-2 p-2 text-stone-700 hover:text-green-600 hover:bg-green-50 rounded-xl transition"
            >
              <div className="size-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700">
                <Cpu className="size-4" />
              </div>
              <span className="hidden lg:inline text-xs font-medium text-left">
                <span className="block font-semibold">AI Center</span>
                <span className="text-stone-400">Hỗ trợ AI</span>
              </span>
            </button>

            <button className="hidden md:flex items-center gap-2 p-2 text-stone-700 hover:text-green-600 hover:bg-green-50 rounded-xl transition">
              <div className="size-8 rounded-full bg-green-100 flex items-center justify-center text-green-700">
                <Bell className="size-4" />
              </div>
            </button>

            <div className="relative">
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={accountMenuOpen}
                onClick={() => setAccountMenuOpen((open) => !open)}
                className="flex items-center gap-2 p-2 text-stone-700 hover:text-green-600 hover:bg-green-50 rounded-xl transition"
              >
                <div className="size-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
                  {avatarUrl ? <img src={avatarUrl} alt="Ảnh đại diện" className="size-8 rounded-full object-cover" /> : <User className="size-4" />}
                </div>
                <span className="hidden lg:inline text-xs font-medium text-left">
                  <span className="block font-semibold">Tài khoản</span>
                  <span className="text-stone-400">Người mua</span>
                </span>
              </button>
              {accountMenuOpen && (
                <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-stone-200 bg-white p-1.5 shadow-xl">
                  <button role="menuitem" type="button" onClick={() => { navigate("user-profile"); setAccountMenuOpen(false); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-stone-700 hover:bg-stone-50">
                    <User className="size-4"/>Tài khoản của tôi
                  </button>
                  <button role="menuitem" type="button" onClick={() => { openSellerArea(); setAccountMenuOpen(false); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-green-800 hover:bg-green-50">
                    <Store className="size-4"/>{sellerAreaLabel}
                  </button>
                </div>
              )}
            </div>

            {/* Cart */}
            <Sheet open={isOpen} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <button className="relative flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl transition shadow-md shadow-green-600/20 active:scale-95">
                  <ShoppingCart className="size-5" />
                  <span className="hidden sm:inline font-semibold text-sm">Giỏ hàng</span>
                  {getTotalItems() > 0 && (
                    <span className="bg-amber-500 text-white text-xs font-bold size-5 rounded-full flex items-center justify-center border-2 border-white">
                      {getTotalItems()}
                    </span>
                  )}
                </button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md p-0 flex flex-col">
                <SheetHeader className="p-5 bg-[#14532d] text-white flex-row items-center justify-between space-y-0">
                  <SheetTitle className="font-bold text-lg flex items-center gap-2">
                    <ShoppingCart className="size-5 text-amber-400" />
                    Giỏ hàng ({getTotalItems()})
                  </SheetTitle>
                  <button onClick={() => setOpen(false)} className="text-green-200 hover:text-white">
                    <X className="size-5" />
                  </button>
                </SheetHeader>

                {items.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 text-center py-12">
                    <div className="size-24 rounded-full bg-stone-100 flex items-center justify-center">
                      <ShoppingCart className="size-10 text-stone-300" />
                    </div>
                    <h3 className="font-semibold text-lg">Giỏ hàng trống</h3>
                    <p className="text-sm text-muted-foreground">
                      Hãy thêm nông sản tươi để bắt đầu mua sắm
                    </p>
                    <Button
                      onClick={() => {
                        navigate("buyer-products");
                        setOpen(false);
                      }}
                      className="mt-2"
                    >
                      Khám phá sản phẩm
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 overflow-y-auto p-5 space-y-3 max-h-[55vh]">
                      <AnimatePresence>
                        {items.map((item) => (
                          <motion.div
                            key={item.product.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex items-center gap-3 pb-3 border-b border-stone-100 last:border-0"
                          >
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              className="size-14 rounded-xl object-cover shrink-0"
                              onError={(event) => {
                                if (!event.currentTarget.src.endsWith("/product-placeholder.svg")) event.currentTarget.src = "/product-placeholder.svg";
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-xs text-stone-800 truncate">
                                {item.product.name}
                              </h4>
                              <span className="text-xs text-green-700 font-bold">
                                {formatPrice(item.product.price)}
                              </span>
                              <div className="flex items-center gap-2 mt-1">
                                <button
                                  onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                  className="size-5 rounded bg-stone-100 hover:bg-stone-200 text-xs text-stone-600 flex items-center justify-center font-bold"
                                >
                                  −
                                </button>
                                <span className="text-xs font-semibold">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                  className="size-5 rounded bg-stone-100 hover:bg-stone-200 text-xs text-stone-600 flex items-center justify-center font-bold"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="font-bold text-xs text-stone-900 block">
                                {formatPrice(item.product.price * item.quantity)}
                              </span>
                              <button
                                onClick={() => removeItem(item.product.id)}
                                className="text-xs text-red-500 hover:underline mt-1"
                              >
                                Xóa
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                    <div className="p-5 border-t border-stone-200 bg-stone-50 space-y-3">
                      <div className="flex justify-between text-sm text-stone-600">
                        <span>Tạm tính:</span>
                        <span className="font-bold text-stone-900">
                          {formatPrice(getTotalPrice())}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-stone-600">
                        <span>Phí giao hàng:</span>
                        <span className="text-green-600 font-semibold">AgriSmart tính sau</span>
                      </div>
                      <div className="flex justify-between text-base font-bold text-stone-900 pt-2 border-t border-stone-200">
                        <span>Tổng cộng:</span>
                        <span className="text-xl text-green-700">
                          {formatPrice(getTotalPrice())}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            navigate("buyer-cart");
                            setOpen(false);
                          }}
                          className="h-11"
                        >
                          Xem giỏ hàng
                        </Button>
                        <Button
                          onClick={() => {
                            navigate("buyer-checkout");
                            setOpen(false);
                          }}
                          className="h-11 bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/30"
                        >
                          Thanh toán
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </SheetContent>
            </Sheet>

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden size-11 rounded-full"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </div>
        </div>

        {/* Desktop NAV */}
        <nav className="hidden lg:flex bg-white border-t border-stone-100">
          <div className="max-w-7xl mx-auto px-4 w-full flex items-center justify-between py-2">
            <div className="flex items-center gap-1">
              {navItems.map((item, i) => (
                <button
                  key={i}
                  onClick={() => navigate(item.page)}
                  className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition flex items-center gap-1.5"
                >
                  {item.icon && <item.icon className="size-4" />}
                  {item.label}
                </button>
              ))}
              <button
                onClick={() => navigate("buyer-complaint")}
                className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition flex items-center gap-1.5"
              >
                <Headphones className="size-4" />
                Khiếu nại
              </button>
            </div>
            <button
              onClick={openSellerArea}
              className="px-4 py-2 text-xs font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-lg transition flex items-center gap-1.5"
            >
              <ArrowLeftRight className="size-3.5" />
              {sellerAreaLabel}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-stone-200 bg-white overflow-hidden sticky top-0 z-30"
          >
            <div className="px-4 py-4 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone-400" />
                <Input
                  placeholder="Tìm nông sản..."
                  className="pl-10 h-11 rounded-full bg-stone-50 border-0"
                />
              </div>
              <nav className="flex flex-col">
                {navItems.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      navigate(item.page);
                      setMobileOpen(false);
                    }}
                    className="flex items-center justify-between px-3 py-3 text-sm font-medium border-b border-stone-100 last:border-0"
                  >
                    <span className="flex items-center gap-2">
                      {item.icon && <item.icon className="size-4" />}
                      {item.label}
                    </span>
                    <ChevronDown className="size-4 -rotate-90 text-stone-400" />
                  </button>
                ))}
                <button
                  onClick={() => {
                    navigate("buyer-complaint");
                    setMobileOpen(false);
                  }}
                  className="flex items-center justify-between px-3 py-3 text-sm font-medium border-b border-stone-100 last:border-0"
                >
                  <span className="flex items-center gap-2">
                    <Headphones className="size-4" />
                    Khiếu nại
                  </span>
                </button>
                <button
                  onClick={() => {
                    openSellerArea();
                    setMobileOpen(false);
                  }}
                  className="flex items-center gap-2 px-3 py-3 text-sm font-bold text-amber-700 bg-amber-50 mt-2 rounded-lg"
                >
                  <ArrowLeftRight className="size-4" />
                  {sellerAreaLabel}
                </button>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Mobile bottom navigation (cho buyer)
export function MobileBottomNav() {
  const navigate = useNav((s) => s.navigate);
  const getTotalItems = useCart((s) => s.getTotalItems);
  const currentPage = useNav((s) => s.currentPage);

  const items = [
    { icon: Home, label: "Trang chủ", page: "buyer-home" as PageId },
    { icon: Search, label: "Danh mục", page: "buyer-products" as PageId },
    { icon: ClipboardList, label: "Đơn hàng", page: "buyer-orders" as PageId },
    { icon: ShoppingCart, label: "Giỏ hàng", page: "buyer-cart" as PageId, badge: getTotalItems() },
    { icon: User, label: "Tài khoản", page: "user-profile" as PageId },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-stone-200 safe-bottom shadow-lg">
      <div className="grid grid-cols-5 gap-1 px-2 py-2">
        {items.map((item, i) => (
          <button
            key={i}
            onClick={() => navigate(item.page)}
            className={`flex flex-col items-center gap-1 py-1.5 rounded-lg transition relative ${
              currentPage === item.page
                ? "text-green-600 bg-green-50"
                : "text-stone-500"
            }`}
          >
            <div className="relative">
              <item.icon className="size-5" />
              {item.badge && item.badge > 0 ? (
                <span className="absolute -top-1 -right-2 bg-amber-500 text-white text-[9px] font-bold size-4 rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              ) : null}
            </div>
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

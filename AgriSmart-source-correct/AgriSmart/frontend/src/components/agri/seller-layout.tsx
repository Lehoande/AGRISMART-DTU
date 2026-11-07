"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  Layers,
  ClipboardList,
  DollarSign,
  Headphones,
  Star,
  Cpu,
  User,
  FileText,
  Settings,
  Sprout,
  Menu,
  X,
  ArrowLeftRight,
  Bell,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useNav, type PageId } from "@/lib/nav-store";

const sidebarItems: { label: string; page: PageId; icon: typeof LayoutDashboard; badge?: string }[] = [
  { label: "Tổng quan", page: "seller-dashboard", icon: LayoutDashboard },
  { label: "Sản phẩm", page: "seller-products", icon: Package },
  { label: "Lô hàng", page: "seller-batches", icon: Layers, badge: "2" },
  { label: "Đơn hàng", page: "seller-orders", icon: ClipboardList, badge: "5" },
  { label: "Doanh thu", page: "seller-revenue", icon: DollarSign },
  { label: "Khiếu nại", page: "seller-complaints", icon: Headphones, badge: "1" },
  { label: "Đánh giá", page: "seller-reviews", icon: Star },
  { label: "AI hỗ trợ", page: "ai-center", icon: Cpu },
  { label: "Hồ sơ người bán", page: "seller-profile", icon: User },
  { label: "Thỏa thuận", page: "seller-agreement-view", icon: FileText },
  { label: "Cài đặt", page: "seller-settings", icon: Settings },
];

export function SellerLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNav((s) => s.navigate);
  const currentPage = useNav((s) => s.currentPage);

  return (
    <div className="min-h-screen flex bg-stone-100">
      {/* Sidebar - desktop */}
      <aside className="hidden lg:flex w-64 bg-[#14532d] text-white flex-col fixed inset-y-0 left-0 z-30">
        <div className="p-5 border-b border-green-800 flex items-center gap-2.5">
          <div className="size-9 rounded-xl bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center shadow-lg">
            <Sprout className="size-5 text-white" />
          </div>
          <div>
            <div className="font-extrabold text-base leading-none">
              Agri<span className="text-amber-400">Smart</span> AI
            </div>
            <div className="text-[10px] text-green-300 mt-0.5">Seller Center</div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-3">
          {sidebarItems.map((item, i) => {
            const isActive = currentPage === item.page;
            return (
              <button
                key={i}
                onClick={() => navigate(item.page)}
                className={`w-full flex items-center gap-3 px-5 py-2.5 text-sm transition relative ${
                  isActive
                    ? "bg-green-700 text-white font-semibold"
                    : "text-green-100 hover:bg-green-800"
                }`}
              >
                {isActive && <span className="absolute left-0 inset-y-0 w-1 bg-amber-400" />}
                <item.icon className="size-4.5 shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-green-800 space-y-2">
          <button
            onClick={() => navigate("buyer-home")}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg transition"
          >
            <ArrowLeftRight className="size-4" />
            Chuyển sang Người mua
          </button>
          <button
            onClick={() => navigate("landing")}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-green-200 hover:bg-green-800 rounded-lg transition"
          >
            <LogOut className="size-4" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25 }}
              className="lg:hidden fixed inset-y-0 left-0 w-64 bg-[#14532d] text-white z-50 flex flex-col"
            >
              <div className="p-5 border-b border-green-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="size-9 rounded-xl bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center">
                    <Sprout className="size-5 text-white" />
                  </div>
                  <div>
                    <div className="font-extrabold text-base leading-none">
                      Agri<span className="text-amber-400">Smart</span> AI
                    </div>
                    <div className="text-[10px] text-green-300 mt-0.5">Seller Center</div>
                  </div>
                </div>
                <button onClick={() => setMobileOpen(false)} className="text-green-200">
                  <X className="size-5" />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto py-3">
                {sidebarItems.map((item, i) => {
                  const isActive = currentPage === item.page;
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        navigate(item.page);
                        setMobileOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-5 py-3 text-sm transition ${
                        isActive
                          ? "bg-green-700 text-white font-semibold"
                          : "text-green-100 hover:bg-green-800"
                      }`}
                    >
                      <item.icon className="size-4.5 shrink-0" />
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge && (
                        <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
              <div className="p-3 border-t border-green-800 space-y-2">
                <button
                  onClick={() => {
                    navigate("buyer-home");
                    setMobileOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg transition"
                >
                  <ArrowLeftRight className="size-4" />
                  Chuyển sang Người mua
                </button>
                <button
                  onClick={() => {
                    navigate("landing");
                    setMobileOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-green-200 hover:bg-green-800 rounded-lg transition"
                >
                  <LogOut className="size-4" />
                  Đăng xuất
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 lg:ml-64 min-w-0">
        {/* Top bar - mobile */}
        <header className="lg:hidden sticky top-0 z-20 bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between">
          <button onClick={() => setMobileOpen(true)} className="p-2">
            <Menu className="size-5" />
          </button>
          <div className="font-bold text-sm">AgriSmart AI</div>
          <button className="p-2">
            <Bell className="size-5" />
          </button>
        </header>

        {/* Top bar - desktop */}
        <header className="hidden lg:flex sticky top-0 z-20 bg-white border-b border-stone-200 px-6 py-3 items-center justify-between">
          <div>
            <h1 className="font-bold text-lg text-stone-900">
              {sidebarItems.find((i) => i.page === currentPage)?.label || "Dashboard"}
            </h1>
            <p className="text-xs text-stone-500">Quản lý hoạt động bán hàng của bạn</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 text-stone-600 hover:bg-stone-100 rounded-lg">
              <Bell className="size-5" />
            </button>
            <button
              onClick={() => navigate("seller-profile")}
              className="flex items-center gap-2 p-1 pr-3 hover:bg-stone-100 rounded-full"
            >
              <Avatar className="size-9 border-2 border-green-200">
                <AvatarImage src="https://i.pravatar.cc/100?img=33" />
                <AvatarFallback>HTX</AvatarFallback>
              </Avatar>
              <div className="text-left">
                <div className="text-sm font-semibold">HTX Krông Pắc</div>
                <div className="text-xs text-green-600">★ 4.8 · Người bán</div>
              </div>
            </button>
          </div>
        </header>

        <main className="p-4 lg:p-6 pb-20 lg:pb-6">{children}</main>
      </div>
    </div>
  );
}

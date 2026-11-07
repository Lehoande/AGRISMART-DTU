"use client";
import { motion } from "framer-motion";
import {
  Brain,
  Sparkles,
  AlertTriangle,
  TrendingUp,
  Activity,
  ArrowRight,
  ShieldCheck,
  Cpu,
  CheckCircle2,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { BuyerHeader } from "@/components/agri/buyer-header";
import { useNav } from "@/lib/nav-store";
import { aiModules } from "@/lib/agri-data";

export function AICenterPage() {
  const navigate = useNav((s) => s.navigate);

  return (
    <div className="min-h-screen bg-stone-50 pb-20 lg:pb-12">
      <BuyerHeader />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#14532d] via-[#166534] to-[#15803d] rounded-3xl p-8 lg:p-12 text-white relative overflow-hidden mb-8"
        >
          <div className="absolute inset-0 leaf-texture opacity-20" />
          <div className="relative z-10">
            <Badge className="bg-amber-500 text-[#14532d] hover:bg-amber-500 mb-4 gap-1">
              <Brain className="size-3.5" /> AgriSmart AI Center
            </Badge>
            <h1 className="text-3xl lg:text-5xl font-extrabold mb-4 leading-tight">
              Công nghệ AI trung tâm <br />
              <span className="text-amber-400">của hệ thống AgriSmart</span>
            </h1>
            <p className="text-green-100 text-base lg:text-lg max-w-2xl mb-6">
              AI là điểm khác biệt lớn nhất của AgriSmart. 6 module AI hỗ trợ toàn bộ quy trình - từ phân loại, phát hiện bất thường đến kiểm tra đơn hàng và đề xuất cá nhân hóa.
            </p>

            {/* Important disclaimer */}
            <div className="bg-amber-500/20 border border-amber-400/40 rounded-xl p-4 max-w-2xl">
              <div className="flex items-start gap-2">
                <AlertTriangle className="size-5 text-amber-300 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-100">
                  <strong>Quan trọng:</strong> AI hỗ trợ ra quyết định - <strong>không thay thế hoàn toàn quy trình kiểm định của AgriSmart</strong>. 
                  Các trường hợp cần kiểm tra phải được chuyển cho nhân viên AgriSmart xử lý.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Activity, label: "Lệnh AI/ngày", value: "12,847", color: "bg-purple-100 text-purple-600" },
            { icon: CheckCircle2, label: "Tỷ lệ chính xác", value: "94.2%", color: "bg-green-100 text-green-600" },
            { icon: AlertTriangle, label: "Cảnh báo hôm nay", value: "12", color: "bg-amber-100 text-amber-600" },
            { icon: TrendingUp, label: "Đơn đã kiểm tra", value: "847", color: "bg-blue-100 text-blue-600" },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl p-4 border border-stone-200"
            >
              <div className={`size-10 rounded-xl flex items-center justify-center mb-2 ${s.color}`}>
                <s.icon className="size-5" />
              </div>
              <div className="text-2xl font-extrabold">{s.value}</div>
              <div className="text-xs text-stone-500">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* AI Modules */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">6 Module AI</h2>
          <p className="text-sm text-stone-500 mb-6">Mỗi module đảm nhận một vai trò cụ thể trong hệ thống AgriSmart</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {aiModules.map((m, i) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl border border-stone-200 overflow-hidden hover:shadow-lg transition-all"
              >
                <div className={`bg-gradient-to-br ${m.color} p-6 text-white relative overflow-hidden`}>
                  <div className="text-4xl mb-2">{m.icon}</div>
                  <div className="text-[10px] uppercase tracking-wider opacity-80 mb-1">{m.title}</div>
                  <h3 className="text-lg font-bold">{m.viTitle}</h3>
                  <div className="absolute -right-2 -bottom-2 size-20 rounded-full bg-white/10" />
                </div>
                <div className="p-5">
                  <p className="text-sm text-stone-600 leading-relaxed mb-3">{m.desc}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="bg-stone-100 text-stone-700">
                      {m.metric}
                    </Badge>
                    <Button size="sm" variant="ghost" className="text-xs">
                      <Eye className="size-3.5 mr-1" /> Chi tiết
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Live AI Activity */}
        <Card className="p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Activity className="size-5 text-purple-600" /> Hoạt động AI gần đây
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 gap-1 ml-auto">
              <span className="size-2 rounded-full bg-green-500 animate-pulse" /> Live
            </Badge>
          </h3>

          <div className="space-y-2">
            {[
              { time: "2 phút trước", action: "AI phân loại lô AGR-2026-DL-032: Sầu Riêng Ri6 (94.2%)", icon: "🏷️", color: "text-green-600" },
              { time: "5 phút trước", action: "AI phát hiện bất thường trên lô AGR-2026-BT-022: dấu hiệu dập nhẹ", icon: "🔍", color: "text-amber-600" },
              { time: "8 phút trước", action: "AI kiểm tra đơn AGR-ORD-2851: đáp ứng điều kiện xử lý", icon: "✅", color: "text-green-600" },
              { time: "12 phút trước", action: "AI đề xuất sản phẩm cho người mua #4287: 5 sản phẩm phù hợp", icon: "💡", color: "text-purple-600" },
              { time: "15 phút trước", action: "AI cảnh báo rủi ro: 3 lô hàng sắp hết hạn bảo quản", icon: "⚠️", color: "text-red-600" },
              { time: "18 phút trước", action: "AI phân tích nguồn cung: ST25 sắp hết mùa, đề xuất nhập thêm", icon: "📊", color: "text-blue-600" },
            ].map((a, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 p-3 hover:bg-stone-50 rounded-lg"
              >
                <div className="text-2xl">{a.icon}</div>
                <div className="flex-1">
                  <div className={`text-sm ${a.color}`}>{a.action}</div>
                  <div className="text-xs text-stone-400">{a.time}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* CTA */}
        <div className="mt-8 bg-gradient-to-br from-purple-600 to-fuchsia-600 rounded-3xl p-8 text-white text-center">
          <Cpu className="size-12 mx-auto mb-3 text-amber-300" />
          <h2 className="text-2xl font-bold mb-2">AI luôn đồng hành cùng mỗi giao dịch</h2>
          <p className="text-purple-100 max-w-xl mx-auto mb-4">
            Từ lúc người bán đăng sản phẩm đến khi người mua nhận hàng, AI hỗ trợ ở mọi bước - nhưng luôn đặt an toàn thực phẩm lên hàng đầu.
          </p>
          <Button
            onClick={() => navigate("buyer-products")}
            className="bg-white text-purple-700 hover:bg-purple-50 h-12 px-8"
          >
            Khám phá sản phẩm
            <ArrowRight className="size-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}

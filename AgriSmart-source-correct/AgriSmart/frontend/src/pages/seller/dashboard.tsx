"use client";
import { motion } from "framer-motion";
import {
  DollarSign,
  ShoppingCart,
  Package,
  Layers,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Brain,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SellerLayout } from "@/components/agri/seller-layout";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { sellerRevenue, sellerOrders, batches, batchStatusConfig, formatPrice } from "@/lib/agri-data";

const kpis = [
  { label: "Doanh thu hôm nay", value: "5.100.000đ", delta: "+20%", up: true, icon: DollarSign, color: "text-emerald-600 bg-emerald-100" },
  { label: "Doanh thu tháng này", value: "127.500.000đ", delta: "+18%", up: true, icon: TrendingUp, color: "text-blue-600 bg-blue-100" },
  { label: "Đơn hàng hôm nay", value: "34", delta: "+21%", up: true, icon: ShoppingCart, color: "text-amber-600 bg-amber-100" },
  { label: "Sản phẩm đang bán", value: "12", delta: "0%", up: null, icon: Package, color: "text-purple-600 bg-purple-100" },
  { label: "Lô đang kiểm tra", value: "2", delta: "+1", up: false, icon: Layers, color: "text-orange-600 bg-orange-100" },
  { label: "Tỷ lệ hoàn thành", value: "94%", delta: "+2%", up: true, icon: CheckCircle2, color: "text-green-600 bg-green-100" },
];

export function SellerDashboardPage() {
  return (
    <SellerLayout>
      {/* AI Alert banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-purple-50 border border-purple-200 rounded-2xl p-4 mb-6 flex items-center gap-3"
      >
        <div className="size-10 rounded-xl bg-purple-600 flex items-center justify-center shrink-0">
          <Brain className="size-5 text-white" />
        </div>
        <div className="flex-1">
          <div className="font-bold text-sm text-purple-700">AI AgriSmart đã phân tích hoạt động của bạn</div>
          <div className="text-xs text-stone-600">
            Sản phẩm Sầu Riêng đang tăng trưởng mạnh. Cân nhắc tạo thêm lô hàng để đáp ứng nhu cầu.
          </div>
        </div>
        <Badge className="bg-purple-600 hover:bg-purple-600">Phân tích AI</Badge>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {kpis.map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-xl p-3 border border-stone-200"
          >
            <div className="flex items-start justify-between mb-2">
              <div className={`size-8 rounded-lg flex items-center justify-center ${kpi.color}`}>
                <kpi.icon className="size-4" />
              </div>
              {kpi.up !== null && (
                <span className={`text-xs font-semibold flex items-center ${kpi.up ? "text-green-600" : "text-red-500"}`}>
                  {kpi.up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                  {kpi.delta}
                </span>
              )}
            </div>
            <div className="text-base lg:text-lg font-extrabold tracking-tight">{kpi.value}</div>
            <div className="text-xs text-stone-500">{kpi.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Card className="p-4 lg:p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-bold flex items-center gap-2">
                <TrendingUp className="size-4 text-green-600" /> Doanh thu 7 ngày gần nhất
              </h4>
              <p className="text-xs text-stone-500 mt-0.5">Đơn vị: VND</p>
            </div>
            <Badge variant="secondary" className="gap-1">
              <span className="size-2 rounded-full bg-green-500" />
              +85% YoY
            </Badge>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={sellerRevenue}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#16a34a" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#16a34a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
              <XAxis dataKey="day" stroke="#78716c" fontSize={12} />
              <YAxis stroke="#78716c" fontSize={11} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}tr`} />
              <Tooltip
                contentStyle={{ background: "white", border: "1px solid #e7e5e4", borderRadius: "12px", fontSize: "12px" }}
                formatter={(v: number) => formatPrice(v)}
              />
              <Area type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={2.5} fill="url(#revGrad)" name="Doanh thu" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4 lg:p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold flex items-center gap-2">
              <ShoppingCart className="size-4 text-amber-600" /> Số lượng đơn hàng theo ngày
            </h4>
            <Badge variant="secondary" className="gap-1">
              <span className="size-2 rounded-full bg-amber-500" />
              +30% tuần này
            </Badge>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={sellerRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
              <XAxis dataKey="day" stroke="#78716c" fontSize={12} />
              <YAxis stroke="#78716c" fontSize={11} />
              <Tooltip
                contentStyle={{ background: "white", border: "1px solid #e7e5e4", borderRadius: "12px", fontSize: "12px" }}
              />
              <Bar dataKey="orders" fill="#f59e0b" radius={[8, 8, 0, 0]} name="Đơn hàng" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Batch status section */}
      <Card className="p-5">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Layers className="size-5 text-green-600" /> Trạng thái sản phẩm/lô hàng
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left text-xs text-stone-500 uppercase">
                <th className="py-2 pr-4">Mã lô</th>
                <th className="py-2 pr-4">Sản phẩm</th>
                <th className="py-2 pr-4">Số lượng</th>
                <th className="py-2 pr-4">Ngày kiểm tra</th>
                <th className="py-2">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((b) => {
                const config = batchStatusConfig[b.status];
                return (
                  <tr key={b.id} className="border-b border-stone-100 last:border-0">
                    <td className="py-3 pr-4 font-mono text-xs">{b.id}</td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <img src={b.image} alt="" className="size-8 rounded object-cover" />
                        <span className="font-medium text-xs line-clamp-1">{b.productName}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-xs">{b.quantity} {b.unit}</td>
                    <td className="py-3 pr-4 text-xs">{b.inspectionDate}</td>
                    <td className="py-3">
                      <Badge className={`${config.color} border`}>{config.label}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Recent orders */}
      <Card className="p-5 mt-6">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <ShoppingCart className="size-5 text-green-600" /> Đơn hàng gần đây
        </h3>
        <div className="space-y-2">
          {sellerOrders.slice(0, 5).map((o) => (
            <div key={o.id} className="flex items-center gap-3 p-2 hover:bg-stone-50 rounded-lg">
              <div className="text-xs font-mono font-bold text-green-700 w-28 shrink-0">{o.id}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium line-clamp-1">{o.customer}</div>
                <div className="text-xs text-stone-500">{o.placedAt}</div>
              </div>
              <div className="text-sm font-bold">{formatPrice(o.total)}</div>
            </div>
          ))}
        </div>
      </Card>
    </SellerLayout>
  );
}

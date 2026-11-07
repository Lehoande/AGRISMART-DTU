"use client";
import { motion } from "framer-motion";
import {
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Calendar,
  ArrowUpRight,
  Download,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { SellerLayout } from "@/components/agri/seller-layout";
import { sellerRevenue, sellerOrders, formatPrice } from "@/lib/agri-data";

const revenueKpis = [
  { label: "Doanh thu hôm nay", value: 5100000, delta: "+20%", up: true, icon: DollarSign, color: "text-emerald-600 bg-emerald-100" },
  { label: "Doanh thu tuần", value: 21510000, delta: "+18%", up: true, icon: Calendar, color: "text-blue-600 bg-blue-100" },
  { label: "Doanh thu tháng", value: 127500000, delta: "+22%", up: true, icon: TrendingUp, color: "text-purple-600 bg-purple-100" },
  { label: "Tổng doanh thu", value: 845000000, delta: "+50%", up: true, icon: Wallet, color: "text-amber-600 bg-amber-100" },
];

const categoryData = [
  { name: "Trái cây", value: 65, color: "#16a34a" },
  { name: "Rau củ", value: 20, color: "#f59e0b" },
  { name: "Nông sản", value: 15, color: "#0284c7" },
];

export function SellerRevenuePage() {
  return (
    <SellerLayout>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold mb-1">Doanh thu & phân tích</h1>
          <p className="text-sm text-stone-500">Theo dõi doanh thu và hiệu quả bán hàng</p>
        </div>
        <Button variant="outline">
          <Download className="size-4 mr-2" /> Xuất báo cáo
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {revenueKpis.map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-xl p-4 border border-stone-200"
          >
            <div className="flex items-start justify-between mb-2">
              <div className={`size-9 rounded-lg flex items-center justify-center ${kpi.color}`}>
                <kpi.icon className="size-4" />
              </div>
              <span className="text-xs font-semibold flex items-center text-green-600">
                <ArrowUpRight className="size-3" />
                {kpi.delta}
              </span>
            </div>
            <div className="text-xl font-extrabold tracking-tight">{formatPrice(kpi.value)}</div>
            <div className="text-xs text-stone-500">{kpi.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Additional stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        <Card className="p-4">
          <div className="text-xs text-stone-500">Số đơn hoàn thành</div>
          <div className="text-2xl font-extrabold text-green-700">847</div>
          <div className="text-xs text-green-600">+12% so với tháng trước</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-stone-500">Giá trị đơn trung bình</div>
          <div className="text-2xl font-extrabold text-amber-700">{formatPrice(285000)}</div>
          <div className="text-xs text-green-600">+8% so với tháng trước</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-stone-500">Tỷ lệ hoàn thành</div>
          <div className="text-2xl font-extrabold text-purple-700">94%</div>
          <div className="text-xs text-green-600">+2% so với tháng trước</div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="p-4 lg:col-span-2">
          <h4 className="font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="size-4 text-green-600" /> Doanh thu theo ngày
          </h4>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={sellerRevenue}>
              <defs>
                <linearGradient id="revGrad2" x1="0" y1="0" x2="0" y2="1">
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
              <Area type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={2.5} fill="url(#revGrad2)" name="Doanh thu" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4">
          <h4 className="font-bold mb-4">Cơ cấu danh mục</h4>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={categoryData} dataKey="value" innerRadius={45} outerRadius={75} paddingAngle={2}>
                {categoryData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "white", border: "1px solid #e7e5e4", borderRadius: "12px", fontSize: "12px" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {categoryData.map((c, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full" style={{ background: c.color }} />
                  <span>{c.name}</span>
                </div>
                <span className="font-semibold">{c.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bảng doanh thu chi tiết */}
      <Card className="p-5">
        <h3 className="font-bold text-lg mb-4">Chi tiết doanh thu theo ngày</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left text-xs text-stone-500 uppercase">
                <th className="py-2 pr-4">Ngày</th>
                <th className="py-2 pr-4">Đơn hàng</th>
                <th className="py-2 pr-4">Doanh thu</th>
                <th className="py-2 pr-4">Phí AgriSmart</th>
                <th className="py-2">Thực nhận</th>
              </tr>
            </thead>
            <tbody>
              {sellerRevenue.map((d, i) => {
                const fee = Math.round(d.revenue * 0.06);
                const net = d.revenue - fee;
                return (
                  <tr key={i} className="border-b border-stone-100 last:border-0">
                    <td className="py-3 pr-4 font-medium">{d.day}</td>
                    <td className="py-3 pr-4">{d.orders}</td>
                    <td className="py-3 pr-4 font-semibold text-green-700">{formatPrice(d.revenue)}</td>
                    <td className="py-3 pr-4 text-red-600">-{formatPrice(fee)}</td>
                    <td className="py-3 font-bold">{formatPrice(net)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-stone-300 font-bold">
                <td className="py-3 pr-4">Tổng</td>
                <td className="py-3 pr-4">{sellerRevenue.reduce((s, d) => s + d.orders, 0)}</td>
                <td className="py-3 pr-4 text-green-700">{formatPrice(sellerRevenue.reduce((s, d) => s + d.revenue, 0))}</td>
                <td className="py-3 pr-4 text-red-600">-{formatPrice(Math.round(sellerRevenue.reduce((s, d) => s + d.revenue, 0) * 0.06))}</td>
                <td className="py-3">{formatPrice(sellerRevenue.reduce((s, d) => s + d.revenue, 0) * 0.94)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </SellerLayout>
  );
}

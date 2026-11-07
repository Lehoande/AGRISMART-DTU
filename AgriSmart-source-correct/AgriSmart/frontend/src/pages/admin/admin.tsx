"use client";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Store,
  Package,
  Layers,
  ShieldCheck,
  ClipboardList,
  Warehouse,
  Truck,
  Headphones,
  Brain,
  FileText,
  Users,
  Settings,
  Sprout,
  ArrowLeftRight,
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  Snowflake,
  Box,
  Eye,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { useNav } from "@/lib/nav-store";
import {
  adminStats,
  fulfillmentOrders,
  fulfillmentStageConfig,
  formatPrice,
} from "@/lib/agri-data";

const adminSidebar = [
  { label: "Tổng quan", icon: LayoutDashboard, active: true },
  { label: "Nhà cung cấp", icon: Store },
  { label: "Sản phẩm", icon: Package },
  { label: "Lô hàng", icon: Layers },
  { label: "Kiểm định", icon: ShieldCheck },
  { label: "Đơn hàng", icon: ClipboardList },
  { label: "Kho & bảo quản", icon: Warehouse },
  { label: "Giao hàng", icon: Truck },
  { label: "Khiếu nại", icon: Headphones },
  { label: "AI Monitoring", icon: Brain },
  { label: "Báo cáo", icon: FileText },
  { label: "Người dùng", icon: Users },
  { label: "Chính sách", icon: Settings },
];

const weeklyData = [
  { day: "T2", orders: 142, revenue: 18200000 },
  { day: "T3", orders: 178, revenue: 22400000 },
  { day: "T4", orders: 156, revenue: 19800000 },
  { day: "T5", orders: 198, revenue: 24700000 },
  { day: "T6", orders: 215, revenue: 26800000 },
  { day: "T7", orders: 287, revenue: 31200000 },
  { day: "CN", orders: 245, revenue: 28900000 },
];

const batchPieData = [
  { name: "Đạt", value: 142, color: "#16a34a" },
  { name: "Chờ kiểm tra", value: 18, color: "#f59e0b" },
  { name: "Đang kiểm tra", value: 7, color: "#0284c7" },
  { name: "Cách ly", value: 4, color: "#f97316" },
  { name: "Từ chối", value: 7, color: "#dc2626" },
];

// ============================================
// ADMIN DASHBOARD
// ============================================
export function AdminDashboardPage() {
  const navigate = useNav((s) => s.navigate);

  const kpis = [
    { label: "Tổng số đơn", value: adminStats.totalOrders.toLocaleString(), icon: ClipboardList, color: "text-blue-600 bg-blue-100" },
    { label: "Đơn đang xử lý", value: adminStats.processingOrders.toString(), icon: Clock, color: "text-amber-600 bg-amber-100" },
    { label: "Lô chờ kiểm định", value: adminStats.pendingInspection.toString(), icon: ShieldCheck, color: "text-orange-600 bg-orange-100" },
    { label: "Lô đạt", value: adminStats.passedBatches.toString(), icon: CheckCircle2, color: "text-green-600 bg-green-100" },
    { label: "Lô bị từ chối", value: adminStats.rejectedBatches.toString(), icon: XCircle, color: "text-red-600 bg-red-100" },
    { label: "Khiếu nại đang xử lý", value: adminStats.activeComplaints.toString(), icon: Headphones, color: "text-purple-600 bg-purple-100" },
    { label: "Cảnh báo AI", value: adminStats.aiAlerts.toString(), icon: AlertTriangle, color: "text-rose-600 bg-rose-100" },
    { label: "Doanh thu hôm nay", value: formatPrice(adminStats.todayRevenue), icon: TrendingUp, color: "text-emerald-600 bg-emerald-100" },
  ];

  return (
    <div className="min-h-screen flex bg-stone-100">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 bg-[#1c1917] text-white flex-col fixed inset-y-0 left-0 z-30">
        <div className="p-5 border-b border-stone-800 flex items-center gap-2.5">
          <div className="size-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
            <Sprout className="size-5 text-white" />
          </div>
          <div>
            <div className="font-extrabold text-base leading-none">
              Agri<span className="text-amber-400">Smart</span> AI
            </div>
            <div className="text-[10px] text-stone-400 mt-0.5">Admin Center</div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-3">
          {adminSidebar.map((item, i) => (
            <button
              key={i}
              className={`w-full flex items-center gap-3 px-5 py-2.5 text-sm transition ${
                item.active
                  ? "bg-amber-600 text-white font-semibold"
                  : "text-stone-300 hover:bg-stone-800"
              }`}
            >
              <item.icon className="size-4.5 shrink-0" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-stone-800">
          <button
            onClick={() => navigate("buyer-home")}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg transition"
          >
            <ArrowLeftRight className="size-4" />
            Chế độ Người mua
          </button>
        </div>
      </aside>

      <div className="flex-1 lg:ml-64 min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white border-b border-stone-200 px-6 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-lg">Trung tâm AgriSmart - Admin Dashboard</h1>
            <p className="text-xs text-stone-500">Quản lý toàn bộ hệ thống kiểm tra, đóng gói, bảo quản và điều phối</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 text-stone-600 hover:bg-stone-100 rounded-lg">
              <Brain className="size-5 text-purple-600" />
            </button>
            <Avatar className="size-9">
              <AvatarImage src="https://i.pravatar.cc/100?img=11" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="p-4 lg:p-6">
          {/* AI Alert */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-rose-50 border border-rose-200 rounded-2xl p-4 mb-6 flex items-center gap-3"
          >
            <div className="size-10 rounded-xl bg-rose-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="size-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-sm text-rose-700">{adminStats.aiAlerts} cảnh báo AI cần xử lý</div>
              <div className="text-xs text-stone-600">3 lô hàng có dấu hiệu bất thường, 1 giao dịch rủi ro cao</div>
            </div>
            <Button size="sm" className="bg-rose-600 hover:bg-rose-700">Xem chi tiết</Button>
          </motion.div>

          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
            {kpis.map((kpi, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-xl p-3 border border-stone-200"
              >
                <div className={`size-8 rounded-lg flex items-center justify-center mb-2 ${kpi.color}`}>
                  <kpi.icon className="size-4" />
                </div>
                <div className="text-base font-extrabold">{kpi.value}</div>
                <div className="text-xs text-stone-500">{kpi.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <Card className="p-4 lg:col-span-2">
              <h4 className="font-bold mb-4">Đơn hàng & Doanh thu theo ngày</h4>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={weeklyData}>
                  <defs>
                    <linearGradient id="adminRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#16a34a" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#16a34a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                  <XAxis dataKey="day" stroke="#78716c" fontSize={12} />
                  <YAxis stroke="#78716c" fontSize={11} />
                  <Tooltip contentStyle={{ background: "white", border: "1px solid #e7e5e4", borderRadius: "12px", fontSize: "12px" }} />
                  <Area type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={2.5} fill="url(#adminRev)" name="Doanh thu" />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-4">
              <h4 className="font-bold mb-4">Trạng thái lô hàng</h4>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={batchPieData} dataKey="value" innerRadius={40} outerRadius={65} paddingAngle={2}>
                    {batchPieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "white", border: "1px solid #e7e5e4", borderRadius: "12px", fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 mt-2">
                {batchPieData.map((b, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="size-2.5 rounded-full" style={{ background: b.color }} />
                      <span>{b.name}</span>
                    </div>
                    <span className="font-semibold">{b.value}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Fulfillment preview */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Warehouse className="size-5 text-green-600" /> Trung tâm đóng gói & bảo quản
              </h3>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate("admin-fulfillment")}
                className="border-green-600 text-green-700"
              >
                <Eye className="size-4 mr-1" /> Xem tất cả
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-200 text-left text-xs text-stone-500 uppercase">
                    <th className="py-2 pr-4">Mã đơn</th>
                    <th className="py-2 pr-4">Mã lô</th>
                    <th className="py-2 pr-4">Nhân viên</th>
                    <th className="py-2 pr-4">Nhiệt độ bảo quản</th>
                    <th className="py-2 pr-4">Thời gian tiếp nhận</th>
                    <th className="py-2">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {fulfillmentOrders.map((f, i) => {
                    const config = fulfillmentStageConfig[f.status];
                    return (
                      <tr key={i} className="border-b border-stone-100 last:border-0">
                        <td className="py-3 pr-4 font-mono text-xs">{f.orderId}</td>
                        <td className="py-3 pr-4 text-xs">{f.batchId}</td>
                        <td className="py-3 pr-4 text-xs">{f.handler}</td>
                        <td className="py-3 pr-4 text-xs flex items-center gap-1">
                          <Snowflake className="size-3 text-blue-500" /> {f.storageTemp}
                        </td>
                        <td className="py-3 pr-4 text-xs">{f.receivedAt}</td>
                        <td className="py-3">
                          <Badge className={config.color}>{config.label}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}

// ============================================
// FULFILLMENT CENTER
// ============================================
export function AdminFulfillmentPage() {
  const navigate = useNav((s) => s.navigate);

  const stages: { key: keyof typeof fulfillmentStageConfig; label: string; icon: typeof Box }[] = [
    { key: "received", label: "Đã tiếp nhận", icon: Box },
    { key: "qc", label: "Kiểm tra chất lượng", icon: ShieldCheck },
    { key: "packing", label: "Đang đóng gói", icon: Package },
    { key: "storage", label: "Đang bảo quản", icon: Snowflake },
    { key: "dispatch", label: "Xuất kho", icon: Truck },
    { key: "delivered", label: "Đã giao", icon: CheckCircle2 },
  ];

  return (
    <div className="min-h-screen flex bg-stone-100">
      {/* Same sidebar */}
      <aside className="hidden lg:flex w-64 bg-[#1c1917] text-white flex-col fixed inset-y-0 left-0 z-30">
        <div className="p-5 border-b border-stone-800 flex items-center gap-2.5">
          <div className="size-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
            <Sprout className="size-5 text-white" />
          </div>
          <div>
            <div className="font-extrabold text-base leading-none">
              Agri<span className="text-amber-400">Smart</span> AI
            </div>
            <div className="text-[10px] text-stone-400 mt-0.5">Admin Center</div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-3">
          <button
            onClick={() => navigate("admin-dashboard")}
            className="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-stone-300 hover:bg-stone-800"
          >
            <LayoutDashboard className="size-4.5" /> Tổng quan
          </button>
          {adminSidebar.slice(6).map((item, i) => (
            <button
              key={i}
              className={`w-full flex items-center gap-3 px-5 py-2.5 text-sm transition ${
                item.label === "Kho & bảo quản"
                  ? "bg-amber-600 text-white font-semibold"
                  : "text-stone-300 hover:bg-stone-800"
              }`}
            >
              <item.icon className="size-4.5 shrink-0" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <div className="flex-1 lg:ml-64 min-w-0">
        <header className="sticky top-0 z-20 bg-white border-b border-stone-200 px-6 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-lg">Trung tâm đóng gói & bảo quản</h1>
            <p className="text-xs text-stone-500">
              Received → Quality Check → Packing → Storage → Dispatch → Delivered
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate("admin-dashboard")}
            className="border-green-600 text-green-700"
          >
            ← Về dashboard
          </Button>
        </header>

        <main className="p-4 lg:p-6">
          {/* Stage summary */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            {stages.map((s, i) => {
              const count = fulfillmentOrders.filter((o) => o.status === s.key).length;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`p-4 rounded-xl border ${fulfillmentStageConfig[s.key].color}`}
                >
                  <s.icon className="size-6 mb-2" />
                  <div className="text-xs font-semibold">{s.label}</div>
                  <div className="text-2xl font-extrabold mt-1">{count}</div>
                </motion.div>
              );
            })}
          </div>

          {/* Banner */}
          <Card className="p-6 mb-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <div className="flex items-center gap-3">
              <Warehouse className="size-8 text-blue-600" />
              <div>
                <h3 className="font-bold text-blue-800">Trung tâm logistics nông sản chuyên nghiệp</h3>
                <p className="text-sm text-stone-600">
                  AgriSmart chịu trách nhiệm tiếp nhận, đóng gói, bảo quản và điều phối giao hàng. 
                  Mỗi đơn hàng được xử lý theo quy trình 6 bước, đảm bảo độ tươi từ nông trại đến tay người mua.
                </p>
              </div>
            </div>
          </Card>

          {/* Detailed list */}
          <Card className="p-5">
            <h3 className="font-bold text-lg mb-4">Đơn hàng đang xử lý</h3>
            <div className="space-y-4">
              {fulfillmentOrders.map((f, i) => {
                const config = fulfillmentStageConfig[f.status];
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border border-stone-200 rounded-xl p-4"
                  >
                    <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                      <div>
                        <div className="font-bold flex items-center gap-2">
                          <span className="font-mono text-sm">{f.orderId}</span>
                          <Badge className={config.color}>{config.label}</Badge>
                        </div>
                        <div className="text-xs text-stone-500 mt-1">Lô: {f.batchId}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-stone-500">Nhân viên xử lý</div>
                        <div className="font-semibold text-sm">{f.handler}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <div className="text-xs text-stone-500">Thời gian tiếp nhận</div>
                        <div className="font-semibold text-sm">{f.receivedAt}</div>
                      </div>
                      <div>
                        <div className="text-xs text-stone-500">Điều kiện bảo quản</div>
                        <div className="font-semibold text-sm flex items-center gap-1">
                          <Snowflake className="size-3 text-blue-500" /> {f.storageTemp}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-stone-500">Thời gian đóng gói</div>
                        <div className="font-semibold text-sm">{f.packingTime}</div>
                      </div>
                      <div>
                        <div className="text-xs text-stone-500">Thời gian xuất kho</div>
                        <div className="font-semibold text-sm">{f.dispatchTime}</div>
                      </div>
                    </div>

                    {/* Stage progress bar */}
                    <div className="mt-4 flex items-center gap-1">
                      {stages.map((s, j) => {
                        const stageKeys = Object.keys(fulfillmentStageConfig) as Array<keyof typeof fulfillmentStageConfig>;
                        const currentIdx = stageKeys.indexOf(f.status);
                        const isDone = j <= currentIdx;
                        return (
                          <div key={j} className="flex-1 flex items-center">
                            <div
                              className={`size-6 rounded-full flex items-center justify-center text-[10px] ${
                                isDone ? "bg-green-600 text-white" : "bg-stone-200 text-stone-400"
                              }`}
                            >
                              {j + 1}
                            </div>
                            {j < stages.length - 1 && (
                              <div className={`flex-1 h-0.5 ${j < currentIdx ? "bg-green-600" : "bg-stone-200"}`} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import { Download, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SellerLayout } from "@/components/agri/seller-layout";
import { formatPrice } from "@/lib/agri-data";
import { getMyOrders, getSellerSummary } from "@/lib/api-client";
import { ORDER_STATUS_LABELS, statusLabel } from "@/lib/status-labels";

type Summary = { revenue: number; orders: number };
type Order = { id: number; total: number; status: string; created_at: string };
export function SellerRevenuePage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    Promise.all([getSellerSummary(), getMyOrders()]).then(([data, rows]) => {
      if (active) { setSummary(data); setOrders(rows as Order[]); }
    }).catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : "Không tải được doanh thu"); });
    return () => { active = false; };
  }, []);
  const exportCsv = () => {
    const lines = [["Mã đơn", "Ngày tạo", "Trạng thái", "Tổng đơn"], ...orders.map((order) => [order.id, new Date(order.created_at).toLocaleDateString("vi-VN"), order.status, order.total])];
    const csv = "\uFEFF" + lines.map((line) => line.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = "doanh-thu-agrismart.csv"; link.click(); URL.revokeObjectURL(url);
  };
  return <SellerLayout><div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-bold">Doanh thu & đơn hàng</h1><p className="text-sm text-stone-500">Số liệu từ đơn hàng có sản phẩm của cửa hàng.</p></div><Button variant="outline" onClick={exportCsv}><Download className="mr-2 size-4"/>Xuất CSV</Button></div>
    {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <div className="mb-5 grid gap-3 sm:grid-cols-2"><Card className="p-5"><div className="mb-2 flex items-center gap-2 text-sm text-stone-500"><Wallet className="size-4"/>Doanh thu gộp</div><b className="text-2xl">{summary ? formatPrice(Number(summary.revenue)) : "Đang tải…"}</b><p className="mt-1 text-xs text-stone-500">Đơn đã xác nhận, đang giao hoặc hoàn thành; chưa trừ phí nền tảng.</p></Card><Card className="p-5"><div className="mb-2 text-sm text-stone-500">Đơn hàng đã tiếp nhận</div><b className="text-2xl">{summary?.orders ?? "Đang tải…"}</b><p className="mt-1 text-xs text-stone-500">Đơn chứa ít nhất một sản phẩm của cửa hàng.</p></Card></div>
    <Card className="p-5"><h2 className="mb-3 font-bold">Đơn gần đây</h2>{orders.length === 0 ? <p className="text-sm text-stone-500">Chưa có đơn hàng.</p> : <div className="divide-y">{orders.map((order) => <div key={order.id} className="flex justify-between gap-3 py-3 text-sm"><span>#{order.id} · {new Date(order.created_at).toLocaleDateString("vi-VN")} · {statusLabel(ORDER_STATUS_LABELS, order.status)}</span><b>{formatPrice(Number(order.total))}</b></div>)}</div>}</Card>
  </SellerLayout>;
}

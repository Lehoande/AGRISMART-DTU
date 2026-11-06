"use client";
import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, FileText, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BuyerHeader } from "@/components/agri/buyer-header";
import { useToast } from "@/hooks/use-toast";
import { useNav } from "@/lib/nav-store";
import { createComplaint, getComplaints, getMyOrders } from "@/lib/api-client";
import { COMPLAINT_STATUS_LABELS, statusLabel } from "@/lib/status-labels";

type OrderChoice = { id: number; status: string; items: Array<{ product_id: number; product_name: string }> };
type Complaint = { id: number; order_id: number; product_name: string | null; issue_type: string; description: string; status: string; created_at: string };
const statusLabels = COMPLAINT_STATUS_LABELS;
const issueTypes = ["Sản phẩm bị hỏng", "Sản phẩm không đúng mô tả", "Thiếu sản phẩm", "Bao bì bị hư hỏng", "Vấn đề giao hàng", "Khác"];

export function BuyerComplaintPage() {
  const navigate = useNav((state) => state.navigate);
  const selectedOrderId = useNav((state) => state.selectedOrderId);
  const { toast } = useToast();
  const [orders, setOrders] = useState<OrderChoice[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [orderId, setOrderId] = useState(selectedOrderId || "");
  const [changingOrder, setChangingOrder] = useState(!selectedOrderId);
  const [productId, setProductId] = useState("");
  const [issueType, setIssueType] = useState("");
  const [description, setDescription] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [validationError, setValidationError] = useState("");

  const loadData = async () => {
    try {
      const [orderRows, complaintRows] = await Promise.all([getMyOrders("buyer"), getComplaints("buyer")]);
      setOrders(orderRows as OrderChoice[]);
      setComplaints(complaintRows as Complaint[]);
      setError("");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Không tải được thông tin khiếu nại"); }
    finally { setLoading(false); }
  };
  useEffect(() => { const timer = window.setTimeout(() => { void loadData(); }, 0); return () => window.clearTimeout(timer); }, []);

  const selectedOrder = orders.find((order) => String(order.id) === orderId);
  const submit = async () => {
    if (!orderId) { setValidationError("Vui lòng chọn đơn hàng cần hỗ trợ."); return; }
    if (!issueType) { setValidationError("Vui lòng chọn loại vấn đề."); return; }
    if (description.trim().length < 10) { setValidationError("Mô tả cần có ít nhất 10 ký tự để nhân viên hiểu vấn đề."); return; }
    if (evidenceUrl && !/^https?:\/\//i.test(evidenceUrl.trim())) { setValidationError("Đường dẫn bằng chứng cần bắt đầu bằng http:// hoặc https://."); return; }
    setValidationError("");
    setSaving(true);
    try {
      await createComplaint({ order_id: Number(orderId), product_id: productId ? Number(productId) : null, issue_type: issueType, description, evidence_url: evidenceUrl || undefined });
      setSubmitted(true);
      await loadData();
    } catch (reason) { toast({ title: "Không gửi được khiếu nại", description: reason instanceof Error ? reason.message : "Vui lòng kiểm tra lại thông tin.", variant: "destructive" }); }
    finally { setSaving(false); }
  };

  return <div className="min-h-screen bg-stone-50 pb-20"><BuyerHeader/><main className="mx-auto max-w-5xl px-4 py-8">
    <Button variant="ghost" onClick={() => navigate("buyer-orders")}><ArrowLeft className="mr-2 size-4"/>Đơn hàng</Button>
    <h1 className="mt-3 text-3xl font-bold">Hỗ trợ & khiếu nại</h1><p className="mb-6 text-sm text-stone-500">Gửi khiếu nại trực tiếp cho nhân viên hỗ trợ. Bạn không cần xác nhận đơn hàng trước.</p>
    {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {submitted && <p className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-800"><CheckCircle2 className="mr-2 inline size-4"/>Khiếu nại đã được ghi nhận.</p>}
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="space-y-4 rounded-2xl border bg-white p-6">
        <h2 className="text-lg font-bold">Gửi khiếu nại</h2>
        {loading ? <p className="text-sm text-stone-500">Đang tải đơn hàng…</p> : <>
          {changingOrder ? <div><Label>Đơn hàng cần hỗ trợ *</Label><select className="mt-1 w-full rounded-lg border p-2" value={orderId} onChange={(event) => { setOrderId(event.target.value); setProductId(""); }}><option value="">Chọn đơn hàng</option>{orders.filter((order) => order.status !== "cancelled").map((order) => <option key={order.id} value={order.id}>Đơn hàng #{order.id}</option>)}</select>{orderId && <Button className="mt-2" size="sm" variant="outline" onClick={() => setChangingOrder(false)}>Dùng đơn hàng này</Button>}</div> : <div className="rounded-xl border border-green-200 bg-green-50 p-3"><p className="font-semibold">Khiếu nại cho đơn hàng #{orderId}</p><p className="mt-1 text-xs text-stone-600">Không cần xác nhận đơn trước khi gửi khiếu nại.</p><Button className="mt-2" size="sm" variant="outline" onClick={() => setChangingOrder(true)}>Đổi đơn hàng</Button></div>}
          <div><Label>Sản phẩm liên quan</Label><select className="mt-1 w-full rounded-lg border p-2" value={productId} onChange={(event) => setProductId(event.target.value)}><option value="">Không chọn sản phẩm cụ thể</option>{selectedOrder?.items.map((item) => <option key={item.product_id} value={item.product_id}>{item.product_name}</option>)}</select></div>
          <div><Label>Loại vấn đề *</Label><select className="mt-1 w-full rounded-lg border p-2" value={issueType} onChange={(event) => { setIssueType(event.target.value); setValidationError(""); }}><option value="">Chọn vấn đề</option>{issueTypes.map((issue) => <option key={issue}>{issue}</option>)}</select></div>
          <div><Label>Mô tả chi tiết *</Label><Textarea value={description} onChange={(event) => { setDescription(event.target.value); setValidationError(""); }} minLength={10} placeholder="Mô tả tình trạng và thời điểm phát hiện…"/><p className="mt-1 text-xs text-stone-500">Tối thiểu 10 ký tự.</p></div>
          <div><Label>Link ảnh/video bằng chứng (nếu có)</Label><Input type="url" value={evidenceUrl} onChange={(event) => setEvidenceUrl(event.target.value)} placeholder="https://…"/><p className="mt-1 text-xs text-stone-500">Hệ thống chưa lưu file tải lên trực tiếp; chỉ nhận đường dẫn công khai.</p></div>
          {validationError && <p role="alert" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">{validationError}</p>}
          <Button disabled={saving || loading} onClick={() => void submit()}><Send className="mr-2 size-4"/>{saving ? "Đang gửi…" : "Gửi khiếu nại"}</Button>
        </>}
      </section>
      <section className="rounded-2xl border bg-white p-6"><h2 className="mb-4 flex items-center gap-2 text-lg font-bold"><FileText className="size-5 text-green-600"/>Lịch sử</h2>{loading && <p className="text-sm text-stone-500">Đang tải…</p>}{!loading && complaints.length === 0 && <p className="text-sm text-stone-500">Chưa có khiếu nại.</p>}<div className="space-y-3">{complaints.map((complaint) => <article key={complaint.id} className="rounded-xl border p-3"><div className="flex justify-between gap-2"><b>#{complaint.id} · Đơn #{complaint.order_id}</b><Badge>{statusLabel(statusLabels, complaint.status)}</Badge></div><p className="mt-2 text-sm">{complaint.issue_type}{complaint.product_name ? ` · ${complaint.product_name}` : ""}</p><p className="mt-1 text-xs text-stone-600">{complaint.description}</p><p className="mt-2 text-[11px] text-stone-400">{new Date(complaint.created_at).toLocaleString("vi-VN")}</p></article>)}</div></section>
    </div>
  </main></div>;
}

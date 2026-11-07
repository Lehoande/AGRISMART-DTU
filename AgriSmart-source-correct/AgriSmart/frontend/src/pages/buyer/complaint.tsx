"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Home as HomeIcon,
  ChevronRight,
  Headphones,
  Camera,
  Send,
  CheckCircle2,
  AlertCircle,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNav } from "@/lib/nav-store";
import { complaints, complaintStatusConfig } from "@/lib/agri-data";
import { BuyerHeader } from "@/components/agri/buyer-header";

const issueTypes = [
  "Sản phẩm bị hỏng",
  "Sản phẩm không đúng mô tả",
  "Thiếu sản phẩm",
  "Bao bì bị hư hỏng",
  "Vấn đề giao hàng",
  "Khác",
];

export function BuyerComplaintPage() {
  const navigate = useNav((s) => s.navigate);
  const orderId = useNav((s) => s.selectedOrderId);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    orderId: orderId || "",
    issueType: "",
    description: "",
  });

  if (submitted) {
    return (
      <div className="min-h-screen bg-stone-50 pb-20 lg:pb-12">
        <BuyerHeader />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring" }}
            className="size-24 rounded-full bg-green-100 flex items-center justify-center mb-6 mx-auto"
          >
            <CheckCircle2 className="size-12 text-green-600" />
          </motion.div>
          <h1 className="text-2xl font-bold mb-2">Khiếu nại đã được gửi</h1>
          <p className="text-stone-500 mb-6 max-w-md mx-auto">
            AgriSmart đã tiếp nhận khiếu nại của bạn. Chúng tôi sẽ kiểm tra công bằng,
            không tự động quy lỗi. Bạn sẽ nhận được phản hồi trong 24-48h.
          </p>
          <Button onClick={() => navigate("buyer-home")} className="bg-green-600 hover:bg-green-700 h-12 px-8">
            Về trang chủ
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-20 lg:pb-12">
      <BuyerHeader />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 text-xs text-stone-500 mb-6">
          <button onClick={() => navigate("buyer-home")} className="flex items-center gap-1 hover:text-green-600">
            <HomeIcon className="size-3.5" /> Trang chủ
          </button>
          <ChevronRight className="size-3" />
          <span className="text-stone-900 font-semibold">Trung tâm khiếu nại</span>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-1">Trung tâm hỗ trợ & khiếu nại</h1>
          <p className="text-sm text-stone-500">
            AgriSmart tiếp nhận bằng chứng và xử lý công bằng, không tự động quy lỗi cho người bán hoặc người mua.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <Headphones className="size-5 text-rose-600" /> Gửi khiếu nại mới
            </h2>

            <div>
              <Label className="text-sm font-semibold mb-1.5 block">Mã đơn hàng</Label>
              <Input value={form.orderId} onChange={(e) => setForm({ ...form, orderId: e.target.value })} placeholder="AGR-ORD-XXXX" className="h-10" />
            </div>

            <div>
              <Label className="text-sm font-semibold mb-1.5 block">Chọn sản phẩm có vấn đề</Label>
              <Select>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Chọn sản phẩm" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="p1">Sầu Riêng Ri6 Đắk Lắk</SelectItem>
                  <SelectItem value="p2">Xoài Cát Hòa Lộc</SelectItem>
                  <SelectItem value="p3">Cam Sành Hà Giang</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-semibold mb-1.5 block">Loại vấn đề</Label>
              <Select onValueChange={(v) => setForm({ ...form, issueType: v })}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Chọn loại vấn đề" />
                </SelectTrigger>
                <SelectContent>
                  {issueTypes.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-semibold mb-1.5 block">Mô tả chi tiết vấn đề</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Mô tả rõ vấn đề bạn gặp phải: tình trạng sản phẩm, thời gian phát hiện, v.v."
                className="min-h-[120px]"
              />
            </div>

            <div>
              <Label className="text-sm font-semibold mb-1.5 block">Tải lên bằng chứng (hình ảnh/video)</Label>
              <div className="border-2 border-dashed border-stone-300 rounded-xl p-6 text-center hover:border-rose-500 transition cursor-pointer">
                <Camera className="size-8 text-stone-400 mx-auto mb-2" />
                <p className="text-sm text-stone-500">Kéo thả hoặc bấm để tải ảnh/video lên</p>
                <p className="text-xs text-stone-400 mt-1">Bằng chứng sẽ được bảo mật</p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-stone-700">
              <AlertCircle className="size-4 text-amber-600 inline mr-1" />
              Nếu không đủ bằng chứng, hệ thống có thể đưa ra trạng thái <strong>"Chưa xác định được nguyên nhân"</strong> - không quy lỗi cho ai.
            </div>

            <Button
              onClick={() => setSubmitted(true)}
              size="lg"
              className="w-full h-12 bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-600/30"
            >
              <Send className="size-4 mr-2" /> Gửi khiếu nại
            </Button>
          </div>

          {/* History + timeline */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-stone-200 p-6">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <FileText className="size-5 text-green-600" /> Quy trình xử lý khiếu nại
              </h2>
              <div className="space-y-3">
                {[
                  { label: "Đã gửi khiếu nại", color: "bg-blue-100 text-blue-700" },
                  { label: "AgriSmart đang kiểm tra", color: "bg-amber-100 text-amber-700" },
                  { label: "Đang xác minh", color: "bg-purple-100 text-purple-700" },
                  { label: "Đã có kết quả", color: "bg-emerald-100 text-emerald-700" },
                  { label: "Hoàn tiền / đổi hàng / từ chối / chưa xác định nguyên nhân", color: "bg-stone-100 text-stone-700" },
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="size-7 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </div>
                    <Badge className={step.color}>{step.label}</Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 p-6">
              <h2 className="font-bold text-lg mb-4">Lịch sử khiếu nại</h2>
              <div className="space-y-3">
                {complaints.map((c) => {
                  const config = complaintStatusConfig[c.status];
                  return (
                    <div key={c.id} className="border border-stone-200 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-bold text-sm">{c.id}</div>
                        <Badge className={config.color}>{config.label}</Badge>
                      </div>
                      <div className="text-xs text-stone-500">
                        Đơn: {c.orderId} · {c.product}
                      </div>
                      <div className="text-xs text-stone-600 mt-1 line-clamp-1">{c.description}</div>
                      <div className="text-xs text-stone-400 mt-1">
                        Gửi lúc: {c.submittedAt} · {c.hasEvidence ? "✓ Có bằng chứng" : "Chưa có bằng chứng"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

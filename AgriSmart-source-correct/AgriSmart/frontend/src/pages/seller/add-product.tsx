"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Upload,
  Brain,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Image as ImageIcon,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SellerLayout } from "@/components/agri/seller-layout";
import { useToast } from "@/hooks/use-toast";
import { useNav } from "@/lib/nav-store";

export function SellerAddProductPage() {
  const { toast } = useToast();
  const navigate = useNav((s) => s.navigate);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<null | {
    category: string;
    confidence: number;
    anomalies: string[];
    warnings: string[];
  }>(null);
  const [form, setForm] = useState({
    name: "",
    category: "",
    image: "",
    desc: "",
    origin: "",
    region: "",
    harvestDate: "",
    quantity: "",
    unit: "",
    price: "",
    batchId: "",
    quality: "",
    storage: "",
  });

  const handleSimulateUpload = () => {
    setAiAnalyzing(true);
    setAiResult(null);
    setTimeout(() => {
      setAiAnalyzing(false);
      setAiResult({
        category: "Trái cây - Sầu Riêng",
        confidence: 94.2,
        anomalies: ["1/15 trái có dấu hiệu dập nhẹ ở vỏ"],
        warnings: ["Đề xuất tải thêm ảnh chụp góc bên cạnh để phân tích chính xác hơn"],
      });
    }, 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Sản phẩm đã được gửi",
      description: "AgriSmart sẽ tiếp nhận và kiểm tra lô hàng trong 24h.",
    });
    navigate("seller-products");
  };

  return (
    <SellerLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Đăng bán nông sản</h1>
          <p className="text-sm text-stone-500">
            Điền thông tin sản phẩm. AI AgriSmart sẽ hỗ trợ phân loại và phát hiện dấu hiệu bất thường.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Thông tin cơ bản */}
            <Card className="p-5">
              <h2 className="font-bold text-lg mb-4">Thông tin sản phẩm</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label className="text-xs">Tên sản phẩm *</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Sầu Riêng Ri6 Đắk Lắk" className="h-10 mt-1" required />
                </div>
                <div>
                  <Label className="text-xs">Loại nông sản *</Label>
                  <Select onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger className="h-10 mt-1"><SelectValue placeholder="Chọn loại" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="traicay">Trái cây</SelectItem>
                      <SelectItem value="raucu">Rau củ</SelectItem>
                      <SelectItem value="nongsan">Nông sản khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Nguồn gốc</Label>
                  <Input value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} placeholder="Krông Pắc, Đắk Lắk" className="h-10 mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Khu vực trồng</Label>
                  <Input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} placeholder="Tây Nguyên" className="h-10 mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Ngày thu hoạch *</Label>
                  <Input type="date" value={form.harvestDate} onChange={(e) => setForm({ ...form, harvestDate: e.target.value })} className="h-10 mt-1" required />
                </div>
                <div>
                  <Label className="text-xs">Số lượng *</Label>
                  <Input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="320" className="h-10 mt-1" required />
                </div>
                <div>
                  <Label className="text-xs">Đơn vị *</Label>
                  <Select onValueChange={(v) => setForm({ ...form, unit: v })}>
                    <SelectTrigger className="h-10 mt-1"><SelectValue placeholder="kg" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="túi 500g">Túi 500g</SelectItem>
                      <SelectItem value="túi 5kg">Túi 5kg</SelectItem>
                      <SelectItem value="lít">lít</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Giá bán (VND) *</Label>
                  <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="145000" className="h-10 mt-1" required />
                </div>
                <div>
                  <Label className="text-xs">Mã lô *</Label>
                  <Input value={form.batchId} onChange={(e) => setForm({ ...form, batchId: e.target.value })} placeholder="AGR-2026-DL-001" className="h-10 mt-1" required />
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-xs">Mô tả sản phẩm</Label>
                  <Textarea value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} placeholder="Mô tả chi tiết về sản phẩm..." className="min-h-[80px] mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Thông tin chất lượng</Label>
                  <Input value={form.quality} onChange={(e) => setForm({ ...form, quality: e.target.value })} placeholder="OCOP 5 SAO, độ đường 32°Bx" className="h-10 mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Phương thức bảo quản</Label>
                  <Input value={form.storage} onChange={(e) => setForm({ ...form, storage: e.target.value })} placeholder="Nhiệt độ phòng, tránh ánh nắng" className="h-10 mt-1" />
                </div>
              </div>
            </Card>

            {/* Hình ảnh + AI */}
            <Card className="p-5">
              <h2 className="font-bold text-lg mb-2">Hình ảnh sản phẩm</h2>
              <p className="text-xs text-stone-500 mb-4">Tải lên nhiều ảnh để AI phân tích chính xác hơn</p>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <button
                  type="button"
                  onClick={handleSimulateUpload}
                  className="aspect-square border-2 border-dashed border-stone-300 rounded-xl flex flex-col items-center justify-center hover:border-green-500 hover:bg-green-50 transition"
                >
                  <Upload className="size-6 text-stone-400 mb-1" />
                  <span className="text-xs text-stone-500">Tải ảnh lên</span>
                </button>
                {[1, 2].map((i) => (
                  <div key={i} className="aspect-square bg-stone-100 rounded-xl overflow-hidden flex items-center justify-center">
                    <ImageIcon className="size-8 text-stone-300" />
                  </div>
                ))}
              </div>

              {/* AI Analysis Box - đặc biệt */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="size-10 rounded-xl bg-purple-600 flex items-center justify-center">
                    <Brain className="size-5 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-purple-700">AI AgriSmart</div>
                    <div className="text-xs text-stone-600">
                      {aiAnalyzing
                        ? "Đang phân tích sản phẩm..."
                        : aiResult
                        ? "Phân tích hoàn tất"
                        : "Sẵn sàng phân tích khi có hình ảnh"}
                    </div>
                  </div>
                </div>

                {aiAnalyzing && (
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Loader2 className="size-4 animate-spin text-purple-600" />
                      <span>AI đang phân loại nông sản từ hình ảnh...</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Loader2 className="size-4 animate-spin text-purple-600" />
                      <span>AI nhận diện nhóm nông sản...</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Loader2 className="size-4 animate-spin text-purple-600" />
                      <span>AI phát hiện dấu hiệu bất thường...</span>
                    </div>
                  </div>
                )}

                {aiResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3 text-sm"
                  >
                    <div className="bg-white rounded-lg p-3">
                      <div className="text-xs text-stone-500">Loại nông sản phát hiện:</div>
                      <div className="font-bold flex items-center justify-between">
                        <span className="flex items-center gap-1"><Tag className="size-3.5" /> {aiResult.category}</span>
                        <Badge className="bg-green-100 text-green-700">{aiResult.confidence}% chính xác</Badge>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-semibold text-amber-700 mb-1 flex items-center gap-1">
                        <AlertTriangle className="size-3.5" /> Phát hiện bất thường:
                      </div>
                      <ul className="text-xs space-y-1">
                        {aiResult.anomalies.map((a, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-amber-500">⚠</span> {a}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <div className="text-xs font-semibold text-stone-700 mb-1">Cảnh báo:</div>
                      <ul className="text-xs space-y-1">
                        {aiResult.warnings.map((w, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-blue-500">ℹ</span> {w}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 text-xs">
                      <strong>⚠ Lưu ý:</strong> AI chỉ hỗ trợ phân tích. Kết quả kiểm định cuối cùng thuộc quy trình kiểm tra của AgriSmart.
                    </div>
                  </motion.div>
                )}

                {!aiAnalyzing && !aiResult && (
                  <div className="text-xs text-stone-500 italic">
                    Hệ thống AI sẽ tự động phân tích khi bạn tải ảnh lên.
                  </div>
                )}
              </div>
            </Card>

            <div className="flex gap-2">
              <Button type="submit" size="lg" className="flex-1 h-12 bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/30">
                <Plus className="size-5 mr-2" /> Gửi sản phẩm để kiểm tra
              </Button>
              <Button type="button" variant="outline" size="lg" className="h-12 px-6" onClick={() => navigate("seller-products")}>
                Hủy
              </Button>
            </div>
          </div>

          {/* Sidebar info */}
          <div className="lg:col-span-1">
            <Card className="p-5 sticky top-32">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <Sparkles className="size-4 text-purple-600" /> Quy trình sau khi gửi
              </h3>
              <ol className="space-y-3 text-sm">
                {[
                  { t: "1. Tiếp nhận sản phẩm", d: "AgriSmart tiếp nhận thông tin và hình ảnh" },
                  { t: "2. AI phân tích", d: "AI phân loại và phát hiện bất thường" },
                  { t: "3. Kiểm định", d: "Nhân viên AgriSmart kiểm định lô hàng" },
                  { t: "4. Mở bán", d: "Lô đạt yêu cầu sẽ được mở bán tự động" },
                ].map((s, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="size-4 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-xs">{s.t}</div>
                      <div className="text-xs text-stone-500">{s.d}</div>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="mt-4 pt-4 border-t border-stone-100 bg-amber-50 rounded-xl p-3 text-xs text-stone-700">
                <AlertTriangle className="size-4 text-amber-600 inline mr-1" />
                Khi lô chưa đạt hoặc đang kiểm tra, <strong>không</strong> được phép mở bán.
              </div>
            </Card>
          </div>
        </form>
      </div>
    </SellerLayout>
  );
}

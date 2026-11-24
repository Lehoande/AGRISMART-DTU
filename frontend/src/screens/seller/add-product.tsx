"use client";
import { useEffect, useState } from "react";
import {
  Plus,
  Brain,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Image as ImageIcon,
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
import { analyzeProductWithAi, createProduct, getApiCategories, type ApiCategory } from "@/lib/api-client";

type ProductAnalysis = { engine: string; suggested_category: string; warnings: string[]; disclaimer: string };

export function SellerAddProductPage() {
  const { toast } = useToast();
  const navigate = useNav((s) => s.navigate);
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
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ProductAnalysis | null>(null);

  useEffect(() => { getApiCategories().then(setCategories).catch(() => setCategories([])); }, []);

  const analyzeProduct = async () => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeProductWithAi({
        name: form.name, category: "", description: form.desc, origin: form.origin,
        certification: form.quality, harvest_date: form.harvestDate,
        stock: form.quantity ? Number(form.quantity) : 0, storage_condition: form.storage, image_url: form.image,
      });
      setAnalysis(result);
    } catch (error) {
      toast({ title: "Trợ lý sản phẩm chưa phản hồi", description: error instanceof Error ? error.message : "Vui lòng thử lại.", variant: "destructive" });
    } finally { setIsAnalyzing(false); }
  };

  const applySuggestedCategory = () => {
    if (!analysis) return;
    const category = analysis.suggested_category === "Trái cây" ? "traicay"
      : analysis.suggested_category === "Rau củ" ? "raucu" : "nongsan";
    setForm((previous) => ({ ...previous, category }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const categorySlug = form.category === "traicay" ? "trai-cay" : form.category === "raucu" ? "rau-cu" : "nong-san-khac";
    const categoryId = categories.find((category) => category.slug === categorySlug)?.id;
    if (!categoryId) { toast({ title: "Không tải được danh mục", description: "Kiểm tra API danh mục rồi thử lại.", variant: "destructive" }); return; }
    setIsSaving(true);
    try {
      await createProduct({
        category_id: categoryId, name: form.name.trim(), description: form.desc.trim(),
        price: Number(form.price), unit: form.unit, stock: Number(form.quantity), origin: form.origin.trim(),
        image_url: form.image.trim(), traceability_code: form.batchId.trim(), certification: form.quality.trim() || null,
        region: form.region.trim(), harvest_date: form.harvestDate, storage_condition: form.storage.trim(),
      });
      toast({ title: "Đã lưu sản phẩm", description: "Sản phẩm đã được thêm vào danh sách của bạn." });
      navigate("seller-products");
    } catch (error) {
      toast({ title: "Không thể lưu sản phẩm", description: error instanceof Error ? error.message : "Vui lòng thử lại.", variant: "destructive" });
    } finally { setIsSaving(false); }
  };

  return (
    <SellerLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Đăng bán nông sản</h1>
          <p className="text-sm text-stone-500">
            Nhờ trợ lý rà soát thông tin và gợi ý danh mục trước khi gửi sản phẩm.
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
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
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
              <p className="text-xs text-stone-500 mb-4">Nhập đường dẫn ảnh công khai. Trợ lý hiện rà soát nội dung nhập, chưa nhận diện hình ảnh.</p>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="col-span-3">
                  <Label className="text-xs">URL ảnh</Label>
                  <Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://example.com/product.jpg" className="mt-1" type="url" />
                </div>
                <div className="col-span-3 aspect-video max-h-56 bg-stone-100 rounded-xl overflow-hidden flex items-center justify-center">
                  {form.image ? <img src={form.image} alt="Xem trước sản phẩm" className="h-full w-full object-contain" onError={(event) => { event.currentTarget.style.display = "none"; }} /> : <ImageIcon className="size-8 text-stone-300" />}
                </div>
              </div>

              {/* AI Analysis Box - đặc biệt */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="size-10 rounded-xl bg-purple-600 flex items-center justify-center">
                    <Brain className="size-5 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-purple-700">Trợ lý thông tin sản phẩm</div>
                    <div className="text-xs text-stone-600">Gợi ý danh mục và rà soát thông tin còn thiếu</div>
                  </div>
                </div>
                <Button type="button" size="sm" variant="outline" disabled={isAnalyzing} onClick={() => void analyzeProduct()}>
                  <Sparkles className="mr-2 size-4"/>{isAnalyzing ? "Đang rà soát…" : "Rà soát & gợi ý danh mục"}
                </Button>
                {analysis && <div className="mt-3 space-y-2 rounded-xl bg-white/80 p-3 text-xs text-stone-700">
                  <div className="flex flex-wrap items-center gap-2"><span>Danh mục gợi ý: <b>{analysis.suggested_category}</b></span><Button type="button" size="sm" variant="ghost" className="h-7" onClick={applySuggestedCategory}>Dùng danh mục</Button></div>
                  {analysis.warnings.length ? <ul className="list-disc space-y-1 pl-4">{analysis.warnings.map((warning, index) => <li key={index}>{warning}</li>)}</ul> : <p>Thông tin cơ bản đã đầy đủ để chuyển sang bước kiểm duyệt.</p>}
                  <p className="text-[11px] text-stone-500">{analysis.engine.startsWith("gemini:") ? "Được Gemini rà soát" : "Kiểm tra dự phòng theo quy tắc"}. {analysis.disclaimer}</p>
                </div>}
              </div>
            </Card>

            <div className="flex gap-2">
              <Button type="submit" disabled={isSaving} size="lg" className="flex-1 h-12 bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/30">
                <Plus className="size-5 mr-2" /> {isSaving ? "Đang lưu…" : "Lưu sản phẩm"}
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
                  { t: "1. Lưu sản phẩm", d: "Thông tin được lưu vào gian hàng của bạn" },
                  { t: "2. Kiểm tra nội dung", d: "Bạn tự rà soát thông tin và chứng nhận trước khi đăng" },
                  { t: "3. Hiển thị", d: "Sản phẩm được mở bán ngay sau khi lưu" },
                  { t: "4. Cập nhật", d: "Bạn có thể chỉnh sửa hoặc ẩn sản phẩm trong danh sách sản phẩm" },
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
                Nền tảng chưa kiểm định độc lập nguồn gốc hoặc chứng nhận; người bán chịu trách nhiệm với thông tin đã khai báo.
              </div>
            </Card>
          </div>
        </form>
      </div>
    </SellerLayout>
  );
}

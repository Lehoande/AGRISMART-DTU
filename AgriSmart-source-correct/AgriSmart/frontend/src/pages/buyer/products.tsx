"use client";
import { useState, useMemo, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Sliders,
  Truck,
  LayoutGrid,
  Home as HomeIcon,
  ChevronRight,
  Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { categories, products } from "@/lib/agri-data";
import { ProductCard } from "@/components/agri/product-card";
import { useNav } from "@/lib/nav-store";
import { BuyerHeader } from "@/components/agri/buyer-header";
import { getApiProducts } from "@/lib/api-client";

type Tab = "all" | "organic" | "ocop" | "vietgap" | "globalgap";

const regions = [
  { id: "mientay", label: "Miền Tây Nam Bộ" },
  { id: "taynguyen", label: "Tây Nguyên" },
  { id: "mienbac", label: "Miền Bắc" },
  { id: "mientrung", label: "Miền Trung & Đông" },
];

const certs = [
  { id: "organic", label: "ORGANIC", desc: "Hữu cơ chứng nhận", className: "badge-organic" },
  { id: "vietgap", label: "VietGAP", desc: "Chuẩn VietGAP", className: "badge-vietgap" },
  { id: "ocop", label: "OCOP", desc: "Đặc sản 4-5 sao", className: "badge-ocop" },
  { id: "globalgap", label: "GlobalGAP", desc: "Chuẩn quốc tế", className: "badge-globalgap" },
];

export function BuyerProductsPage() {
  const initialCategory = useNav((s) => s.selectedCategory);
  const navigate = useNav((s) => s.navigate);
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedCerts, setSelectedCerts] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(500000);
  const [sortBy, setSortBy] = useState<"popular" | "price-asc" | "price-desc" | "new">("popular");
  const [searchQuery, setSearchQuery] = useState("");
  const [catalogProducts, setCatalogProducts] = useState(products);

  useEffect(() => {
    let active = true;
    getApiProducts().then((rows) => {
      if (!active || !rows.length) return;
      const mapped = rows.map((p) => {
        const origin = p.origin || "Việt Nam";
        const category = ((p.category_slug || "").includes("rau") ? "raucu" : (p.category_slug || "").includes("trai") ? "traicay" : "nongsan") as "raucu" | "traicay" | "nongsan";
        const region = (/đà lạt|lâm đồng|đắk|gia lai|kon tum/i.test(origin) ? "taynguyen" : /vĩnh long|tiền giang|cần thơ|đồng tháp|sóc trăng/i.test(origin) ? "mientay" : /quảng|hà nội|bắc/i.test(origin) ? "mienbac" : "mientrung") as "taynguyen" | "mientay" | "mienbac" | "mientrung";
        return {
          id: String(p.id), name: p.name, category, categoryLabel: p.category_name || "Nông sản",
          price: Number(p.price), unit: p.unit, cert: "ocop" as const, certLabel: "Đang cập nhật chứng nhận",
          region, regionLabel: origin, rating: 0, reviews: 0, seller: p.farmer_name || "Nhà cung cấp",
          sellerRating: 0, image: p.image_url || "/logo.svg", desc: p.description || "Thông tin sản phẩm đang được cập nhật.",
          batchId: p.traceability_code || "Chưa có mã truy xuất", harvestDate: "Đang cập nhật",
          inspectionDate: "Đang cập nhật", inspector: "AgriSmart", storageCondition: "Xem hướng dẫn bảo quản",
          stock: Number(p.stock),
        };
      });
      setCatalogProducts(mapped);
    }).catch(() => {
      // Giữ dữ liệu hiện có và hiển thị trạng thái dự phòng nếu API chưa chạy.
    });
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => {
    let result = [...catalogProducts];
    if (selectedCategory) result = result.filter((p) => p.category === selectedCategory);
    if (activeTab !== "all") result = result.filter((p) => p.cert === activeTab);
    if (selectedRegions.length > 0) result = result.filter((p) => selectedRegions.includes(p.region));
    if (selectedCerts.length > 0) result = result.filter((p) => selectedCerts.includes(p.cert));
    result = result.filter((p) => p.price <= maxPrice);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.desc.toLowerCase().includes(q) ||
          p.seller.toLowerCase().includes(q)
      );
    }

    if (sortBy === "price-asc") result.sort((a, b) => a.price - b.price);
    else if (sortBy === "price-desc") result.sort((a, b) => b.price - a.price);
    else if (sortBy === "new") result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    else result.sort((a, b) => b.reviews - a.reviews);

    return result;
  }, [catalogProducts, activeTab, selectedCategory, selectedRegions, selectedCerts, maxPrice, sortBy, searchQuery]);

  const toggleRegion = (id: string) =>
    setSelectedRegions((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]));
  const toggleCert = (id: string) =>
    setSelectedCerts((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  const resetFilters = () => {
    setActiveTab("all");
    setSelectedCategory(null);
    setSelectedRegions([]);
    setSelectedCerts([]);
    setMaxPrice(500000);
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20 lg:pb-12">
      <BuyerHeader />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-stone-500 mb-6">
          <button onClick={() => navigate("buyer-home")} className="flex items-center gap-1 hover:text-green-600">
            <HomeIcon className="size-3.5" /> Trang chủ
          </button>
          <ChevronRight className="size-3" />
          <span className="text-stone-900 font-semibold">Sản phẩm</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <span className="text-green-600 font-bold text-xs uppercase tracking-wider">
              Nông sản & Trái cây
            </span>
            <h1 className="text-3xl font-bold">Tất cả sản phẩm</h1>
            <p className="text-sm text-stone-500 mt-1">
              Chỉ nông sản và trái cây - tất cả đã qua kiểm tra AgriSmart
            </p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            {([
              { id: "all", label: "Tất cả" },
              { id: "organic", label: "🌱 Hữu cơ" },
              { id: "ocop", label: "🏆 OCOP" },
              { id: "vietgap", label: "✅ VietGAP" },
              { id: "globalgap", label: "🌍 GlobalGAP" },
            ] as const).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-green-600 text-white shadow"
                    : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm h-fit space-y-6 hidden lg:block sticky top-32">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-bold text-base flex items-center">
                <Sliders className="size-4 mr-2 text-green-600" /> Bộ lọc
              </h3>
              <button onClick={resetFilters} className="text-xs text-green-600 hover:underline">
                Xóa lọc
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm sản phẩm..."
                className="pl-10 h-10"
              />
            </div>

            {/* Categories */}
            <div>
              <h4 className="font-semibold text-xs uppercase text-stone-500 mb-3 tracking-wider">Danh mục</h4>
              <div className="space-y-1.5 text-sm">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`block w-full text-left px-2 py-1.5 rounded-lg transition ${
                    !selectedCategory ? "bg-green-50 text-green-700 font-semibold" : "hover:bg-stone-50"
                  }`}
                >
                  Tất cả danh mục
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.id)}
                    className={`block w-full text-left px-2 py-1.5 rounded-lg transition ${
                      selectedCategory === c.id ? "bg-green-50 text-green-700 font-semibold" : "hover:bg-stone-50"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-xs uppercase text-stone-500 mb-3 tracking-wider">Vùng miền</h4>
              <div className="space-y-2 text-sm">
                {regions.map((r) => (
                  <label key={r.id} className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedRegions.includes(r.id)}
                      onChange={() => toggleRegion(r.id)}
                      className="rounded text-green-600 focus:ring-green-500 size-4"
                    />
                    <span>{r.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-xs uppercase text-stone-500 mb-3 tracking-wider">Tiêu chuẩn</h4>
              <div className="space-y-2 text-sm">
                {certs.map((c) => (
                  <label key={c.id} className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCerts.includes(c.id)}
                      onChange={() => toggleCert(c.id)}
                      className="rounded text-green-600 focus:ring-green-500 size-4"
                    />
                    <span className={`${c.className} text-[10px] text-white px-1.5 py-0.5 rounded font-bold`}>
                      {c.label}
                    </span>
                    <span>{c.desc}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-xs uppercase text-stone-500 mb-3 tracking-wider">Khoảng giá</h4>
              <input
                type="range"
                min={20000}
                max={500000}
                step={10000}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-green-600"
              />
              <div className="flex justify-between text-xs text-stone-500 mt-2 font-medium">
                <span>20.000đ</span>
                <span className="text-green-700 font-bold">
                  Tối đa: {new Intl.NumberFormat("vi-VN").format(maxPrice)}đ
                </span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200 text-center">
              <Truck className="size-8 text-green-600 mx-auto mb-2" />
              <h5 className="font-bold text-sm text-[#14532d]">AgriSmart Logistics</h5>
              <p className="text-xs text-stone-600 mt-1">Tiếp nhận, đóng gói, bảo quản và giao hàng.</p>
            </div>
          </aside>

          {/* Product grid */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4 bg-white p-3 rounded-xl border border-stone-200">
              <p className="text-sm text-stone-500">
                Hiển thị <span className="font-bold text-stone-900">{filtered.length}</span> / {products.length} sản phẩm
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-500">Sắp xếp:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="text-xs font-semibold border border-stone-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="popular">Phổ biến nhất</option>
                  <option value="new">Mới nhất</option>
                  <option value="price-asc">Giá: Thấp → Cao</option>
                  <option value="price-desc">Giá: Cao → Thấp</option>
                </select>
              </div>
            </div>

            {selectedCategory && (
              <div className="mb-4">
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-700 cursor-pointer"
                  onClick={() => setSelectedCategory(null)}
                >
                  {categories.find((c) => c.id === selectedCategory)?.name} ✕
                </Badge>
              </div>
            )}

            {filtered.length === 0 ? (
              <div className="py-16 text-center text-stone-500 bg-white rounded-2xl border border-stone-200">
                <LayoutGrid className="size-12 mx-auto text-stone-300 mb-3" />
                <p className="font-semibold">Không tìm thấy sản phẩm phù hợp</p>
                <button onClick={resetFilters} className="mt-3 text-xs text-green-600 font-bold underline">
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                <AnimatePresence mode="popLayout">
                  {filtered.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

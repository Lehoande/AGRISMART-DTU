import type { ApiProduct } from "@/lib/api-client";
import type { Cert, Product } from "@/lib/agri-data";

export function mapApiProduct(row: ApiProduct): Product {
  const slug = row.category_slug || "";
  const category: Product["category"] = slug.includes("rau") ? "raucu" : slug.includes("trai") ? "traicay" : "nongsan";
  const certRaw = String(row.certification || "").trim();
  const certValue = certRaw.toLowerCase();
  const cert: Cert = ["organic", "vietgap", "globalgap", "ocop"].includes(certValue) ? certValue as Cert : "unverified";
  const origin = row.origin || "Việt Nam";
  const region = row.region || origin;
  const harvestDate = row.harvest_date
    ? new Date(`${String(row.harvest_date).slice(0, 10)}T00:00:00`).toLocaleDateString("vi-VN")
    : "Đang cập nhật";
  return {
    id: String(row.id), name: row.name, category, categoryLabel: row.category_name || "Nông sản",
    price: Number(row.price), unit: row.unit, cert, certLabel: certRaw || "Chưa khai báo",
    region, regionLabel: region, harvestPlace: origin, rating: Number(row.rating || 0), reviews: Number(row.reviews || 0),
    seller: row.farmer_name || "Nhà cung cấp", sellerRating: 0, image: row.image_url || "/logo.svg",
    desc: row.description || "Thông tin sản phẩm đang được cập nhật.", batchId: row.traceability_code || "Chưa có mã truy xuất",
    harvestDate, inspectionDate: "Chưa có dữ liệu", inspector: "Chưa có dữ liệu",
    storageCondition: row.storage_condition || "Xem hướng dẫn bảo quản", stock: Number(row.stock),
  };
}

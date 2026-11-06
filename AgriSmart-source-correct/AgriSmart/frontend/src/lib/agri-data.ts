/** Shared domain types and display helpers. Product, order and review records
 * are loaded from the API; this module intentionally contains no demo records.
 */
export type Cert = "organic" | "vietgap" | "ocop" | "globalgap" | "unverified";
export type Region = string;

// Shipping policy configured for this storefront.
export const STANDARD_SHIPPING_FEE = 30000;
export const FREE_SHIPPING_THRESHOLD = 300000;

export type Product = {
  id: string;
  name: string;
  category: "traicay" | "raucu" | "nongsan" | "theomua" | "noibat" | "uudai";
  categoryLabel: string;
  price: number;
  oldPrice?: number;
  unit: string;
  cert: Cert;
  certLabel: string;
  region: Region;
  regionLabel: string;
  harvestPlace?: string;
  rating: number;
  reviews: number;
  seller: string;
  sellerRating: number;
  image: string;
  desc: string;
  isBestSeller?: boolean;
  isNew?: boolean;
  batchId: string;
  harvestDate: string;
  inspectionDate: string;
  inspector: string;
  storageCondition: string;
  stock: number;
};

export const formatPrice = (price: number): string =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(price);

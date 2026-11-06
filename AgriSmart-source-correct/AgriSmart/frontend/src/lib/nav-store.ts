"use client";
import { create } from "zustand";

export type PageId =
  // Public
  | "landing"
  | "login"
  | "signup-role"
  | "seller-signup"
  | "seller-agreement"
  | "buyer-signup"
  | "buyer-agreement"
  | "about-features"
  | "about-sellers"
  | "about-buyers"
  | "about-ai"
  | "about-policies"
  // Buyer
  | "buyer-home"
  | "buyer-products"
  | "buyer-product-detail"
  | "buyer-cart"
  | "buyer-checkout"
  | "buyer-orders"
  | "buyer-order-tracking"
  | "buyer-review"
  | "buyer-complaint"
  // Seller
  | "seller-dashboard"
  | "seller-add-product"
  | "seller-products"
  | "seller-batches"
  | "seller-orders"
  | "seller-revenue"
  | "seller-complaints"
  | "seller-reviews"
  | "seller-profile"
  | "seller-agreement-view"
  | "seller-settings"
  // Shared
  | "ai-center"
  | "buyer-ai-center"
  | "seller-ai-center"
  | "user-profile"
  | "user-settings"
  // Admin
  | "admin-dashboard"
  | "admin-sellers"
  | "admin-batches"
  | "admin-fulfillment";

export type SavedNavigation = {
  page: PageId;
  productId?: string;
  category?: string;
  orderId?: string;
  batchId?: string;
};

const NAVIGATION_STORAGE_KEY = "agrismart_current_navigation";
const ALL_PAGE_IDS = new Set<PageId>([
  "landing", "login", "signup-role", "seller-signup", "seller-agreement", "buyer-signup", "buyer-agreement",
  "about-features", "about-sellers", "about-buyers", "about-ai", "about-policies",
  "buyer-home", "buyer-products", "buyer-product-detail", "buyer-cart", "buyer-checkout", "buyer-orders",
  "buyer-order-tracking", "buyer-review", "buyer-complaint", "seller-dashboard", "seller-add-product",
  "seller-products", "seller-batches", "seller-orders", "seller-revenue", "seller-complaints", "seller-reviews",
  "seller-profile", "seller-agreement-view", "seller-settings", "ai-center", "buyer-ai-center", "seller-ai-center", "user-profile", "user-settings",
  "admin-dashboard", "admin-sellers", "admin-batches", "admin-fulfillment",
]);

export function readSavedNavigation(): SavedNavigation | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(NAVIGATION_STORAGE_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<SavedNavigation>;
    if (typeof value.page !== "string" || !ALL_PAGE_IDS.has(value.page as PageId)) return null;
    return {
      page: value.page as PageId,
      productId: typeof value.productId === "string" ? value.productId : undefined,
      category: typeof value.category === "string" ? value.category : undefined,
      orderId: typeof value.orderId === "string" ? value.orderId : undefined,
      batchId: typeof value.batchId === "string" ? value.batchId : undefined,
    };
  } catch {
    return null;
  }
}

type NavStore = {
  currentPage: PageId;
  selectedProductId: string | null;
  selectedCategory: string | null;
  selectedOrderId: string | null;
  selectedBatchId: string | null;
  userMode: "buyer" | "seller" | "admin";
  navigate: (
    page: PageId,
    opts?: { productId?: string; category?: string; orderId?: string; batchId?: string }
  ) => void;
  setMode: (mode: "buyer" | "seller" | "admin") => void;
};

export const useNav = create<NavStore>((set) => ({
  currentPage: "landing",
  selectedProductId: null,
  selectedCategory: null,
  selectedOrderId: null,
  selectedBatchId: null,
  userMode: "buyer",
  navigate: (page, opts) => {
    const navigation = {
      page,
      productId: opts?.productId ?? undefined,
      category: opts?.category ?? undefined,
      orderId: opts?.orderId ?? undefined,
      batchId: opts?.batchId ?? undefined,
    };
    set({
      currentPage: page,
      selectedProductId: opts?.productId ?? null,
      selectedCategory: opts?.category ?? null,
      selectedOrderId: opts?.orderId ?? null,
      selectedBatchId: opts?.batchId ?? null,
    });
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(NAVIGATION_STORAGE_KEY, JSON.stringify(navigation));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  },
  setMode: (mode) => set({ userMode: mode }),
}));

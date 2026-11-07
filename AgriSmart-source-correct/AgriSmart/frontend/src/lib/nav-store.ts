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
  | "user-profile"
  | "user-settings"
  // Admin
  | "admin-dashboard"
  | "admin-batches"
  | "admin-fulfillment";

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
    set({
      currentPage: page,
      selectedProductId: opts?.productId ?? null,
      selectedCategory: opts?.category ?? null,
      selectedOrderId: opts?.orderId ?? null,
      selectedBatchId: opts?.batchId ?? null,
    });
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  },
  setMode: (mode) => set({ userMode: mode }),
}));

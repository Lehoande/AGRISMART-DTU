"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useNav } from "@/lib/nav-store";

// Public
import { LandingPage } from "@/pages/public/landing";
import {
  LoginPage,
  SignupRolePage,
  SellerSignupPage,
  SellerAgreementPage,
  BuyerSignupPage,
  BuyerAgreementPage,
} from "@/pages/public/auth";

// Buyer
import { BuyerHomePage } from "@/pages/buyer/home";
import { BuyerProductsPage } from "@/pages/buyer/products";
import { BuyerProductDetailPage } from "@/pages/buyer/product-detail";
import { BuyerCartPage } from "@/pages/buyer/cart";
import { BuyerCheckoutPage } from "@/pages/buyer/checkout";
import {
  BuyerOrdersPage,
  BuyerOrderTrackingPage,
  BuyerReviewPage,
} from "@/pages/buyer/orders";
import { BuyerComplaintPage } from "@/pages/buyer/complaint";

// Seller
import { SellerDashboardPage } from "@/pages/seller/dashboard";
import { SellerAddProductPage } from "@/pages/seller/add-product";
import {
  SellerProductsPage,
  SellerBatchesPage,
  SellerOrdersPage,
} from "@/pages/seller/products-batches-orders";
import { SellerRevenuePage } from "@/pages/seller/revenue";
import {
  SellerComplaintsPage,
  SellerReviewsPage,
  SellerProfilePage,
  SellerAgreementViewPage,
  SellerSettingsPage,
} from "@/pages/seller/misc";

// Admin
import { AdminDashboardPage, AdminFulfillmentPage } from "@/pages/admin/admin";

// Shared
import { AICenterPage } from "@/pages/shared/ai-center";
import { UserProfilePage, UserSettingsPage } from "@/pages/shared/profile-settings";

export default function Home() {
  const currentPage = useNav((s) => s.currentPage);

  const renderPage = () => {
    switch (currentPage) {
      // Public
      case "landing": return <LandingPage />;
      case "login": return <LoginPage />;
      case "signup-role": return <SignupRolePage />;
      case "seller-signup": return <SellerSignupPage />;
      case "seller-agreement": return <SellerAgreementPage />;
      case "buyer-signup": return <BuyerSignupPage />;
      case "buyer-agreement": return <BuyerAgreementPage />;

      // Buyer
      case "buyer-home": return <BuyerHomePage />;
      case "buyer-products": return <BuyerProductsPage />;
      case "buyer-product-detail": return <BuyerProductDetailPage />;
      case "buyer-cart": return <BuyerCartPage />;
      case "buyer-checkout": return <BuyerCheckoutPage />;
      case "buyer-orders": return <BuyerOrdersPage />;
      case "buyer-order-tracking": return <BuyerOrderTrackingPage />;
      case "buyer-review": return <BuyerReviewPage />;
      case "buyer-complaint": return <BuyerComplaintPage />;

      // Seller
      case "seller-dashboard": return <SellerDashboardPage />;
      case "seller-add-product": return <SellerAddProductPage />;
      case "seller-products": return <SellerProductsPage />;
      case "seller-batches": return <SellerBatchesPage />;
      case "seller-orders": return <SellerOrdersPage />;
      case "seller-revenue": return <SellerRevenuePage />;
      case "seller-complaints": return <SellerComplaintsPage />;
      case "seller-reviews": return <SellerReviewsPage />;
      case "seller-profile": return <SellerProfilePage />;
      case "seller-agreement-view": return <SellerAgreementViewPage />;
      case "seller-settings": return <SellerSettingsPage />;

      // Admin
      case "admin-dashboard": return <AdminDashboardPage />;
      case "admin-fulfillment": return <AdminFulfillmentPage />;

      // Shared
      case "ai-center": return <AICenterPage />;
      case "user-profile": return <UserProfilePage />;
      case "user-settings": return <UserSettingsPage />;

      default: return <LandingPage />;
    }
  };

  return (
    <main className="min-h-screen flex flex-col">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className="flex-1"
        >
          {renderPage()}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}

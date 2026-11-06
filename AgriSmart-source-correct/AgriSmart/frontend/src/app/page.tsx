"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { readSavedNavigation, useNav, type PageId } from "@/lib/nav-store";
import { getAuthToken, getMyProfile, logoutApi } from "@/lib/api-client";

// Public
import { LandingPage } from "@/screens/public/landing";
import { PublicFeaturePage } from "@/screens/public/feature-pages";
import {
  LoginPage,
  SignupRolePage,
  SellerSignupPage,
  SellerAgreementPage,
  BuyerSignupPage,
  BuyerAgreementPage,
} from "@/screens/public/auth";

// Buyer
import { BuyerHomePage } from "@/screens/buyer/home";
import { BuyerProductsPage } from "@/screens/buyer/products";
import { BuyerProductDetailPage } from "@/screens/buyer/product-detail";
import { BuyerCartPage } from "@/screens/buyer/cart";
import { BuyerCheckoutPage } from "@/screens/buyer/checkout";
import {
  BuyerOrdersPage,
  BuyerOrderTrackingPage,
  BuyerReviewPage,
} from "@/screens/buyer/orders";
import { BuyerComplaintPage } from "@/screens/buyer/complaint";

// Seller
import { SellerDashboardPage } from "@/screens/seller/dashboard";
import { SellerAddProductPage } from "@/screens/seller/add-product";
import {
  SellerProductsPage,
  SellerBatchesPage,
  SellerOrdersPage,
} from "@/screens/seller/products-batches-orders";
import { SellerRevenuePage } from "@/screens/seller/revenue";
import {
  SellerComplaintsPage,
  SellerReviewsPage,
  SellerProfilePage,
  SellerAgreementViewPage,
  SellerSettingsPage,
} from "@/screens/seller/misc";

// Shared
import { AICenterPage, BuyerAICenterPage, SellerAIAssistantPage } from "@/screens/shared/ai-center";
import { UserProfilePage, UserSettingsPage } from "@/screens/shared/profile-settings";

const buyerPages: PageId[] = ["buyer-home", "buyer-products", "buyer-product-detail", "buyer-cart", "buyer-checkout", "buyer-orders", "buyer-order-tracking", "buyer-review", "buyer-complaint"];
const rolePages: Record<string, PageId[]> = {
  customer: [...buyerPages, "seller-signup", "seller-agreement", "seller-dashboard", "user-profile", "user-settings", "ai-center", "buyer-ai-center"],
  seller: [...buyerPages, "seller-dashboard", "seller-add-product", "seller-products", "seller-batches", "seller-orders", "seller-revenue", "seller-complaints", "seller-reviews", "seller-profile", "seller-agreement-view", "seller-settings", "user-profile", "user-settings", "ai-center", "buyer-ai-center", "seller-ai-center"],
};
const roleHome = (role: string): PageId => role === "seller" ? "seller-dashboard" : "buyer-home";
const infoPages: PageId[] = ["about-features", "about-sellers", "about-buyers", "about-ai", "about-policies"];
const isPublicPage = (page: PageId) => ["landing", "login", "signup-role", "seller-signup", "seller-agreement", "buyer-signup", "buyer-agreement", ...infoPages].includes(page);

export default function Home() {
  const currentPage = useNav((s) => s.currentPage);
  const navigate = useNav((s) => s.navigate);
  const [sessionRestored, setSessionRestored] = useState(false);
  const [authenticatedRole, setAuthenticatedRole] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const refreshRole = () => {
      const token = getAuthToken();
      if (!token) { setAuthenticatedRole(null); return; }
      getMyProfile().then((profile) => {
        if (active && getAuthToken() === token) setAuthenticatedRole(profile.role || "customer");
      }).catch(() => {
        if (active && getAuthToken() === token) setAuthenticatedRole(null);
      });
    };
    window.addEventListener("agrismart-auth-updated", refreshRole);
    window.addEventListener("storage", refreshRole);
    return () => {
      active = false;
      window.removeEventListener("agrismart-auth-updated", refreshRole);
      window.removeEventListener("storage", refreshRole);
    };
  }, []);

  useEffect(() => {
    const pageAtStart = useNav.getState().currentPage;
    const paymentResult = new URLSearchParams(window.location.search).get("payment_result");
    if (paymentResult) {
      navigate("buyer-orders");
      window.history.replaceState({}, "", window.location.pathname);
      queueMicrotask(() => setSessionRestored(true));
      return;
    }
    const savedNavigation = readSavedNavigation();
    if (!getAuthToken()) {
      setAuthenticatedRole(null);
      const publicPages: PageId[] = ["landing", "login", "signup-role", "seller-signup", "seller-agreement", "buyer-signup", "buyer-agreement", ...infoPages];
      if (savedNavigation && publicPages.includes(savedNavigation.page)) {
        navigate(savedNavigation.page, savedNavigation);
      } else if (savedNavigation) {
        navigate("landing");
      }
      queueMicrotask(() => setSessionRestored(true));
      return;
    }
    getMyProfile()
      .then((profile) => {
        if (useNav.getState().currentPage !== pageAtStart) return;
        const role = profile.role || "customer";
        if (["staff", "manager", "admin"].includes(role)) {
          // The storefront root must stay separate from the admin portal. Drop
          // any legacy shared-session token here; /admin uses its own token key.
          logoutApi();
          setAuthenticatedRole(null);
          navigate("landing");
          return;
        }
        setAuthenticatedRole(role);
        const homePage = roleHome(role);
        const permittedPages = rolePages[role] ?? rolePages.customer;
        const restoredPage = savedNavigation && (permittedPages.includes(savedNavigation.page) || isPublicPage(savedNavigation.page)) ? savedNavigation : { page: homePage };
        navigate(restoredPage.page, restoredPage);
      })
      .catch((error: unknown) => {
        if (useNav.getState().currentPage !== pageAtStart) return;
        const message = error instanceof Error ? error.message : "";
        if (/invalid or expired token|unauthorized/i.test(message)) {
          logoutApi();
          setAuthenticatedRole(null);
          navigate("login");
        } else {
          navigate(savedNavigation?.page && isPublicPage(savedNavigation.page) ? savedNavigation.page : "buyer-home", savedNavigation ?? undefined);
        }
      })
      .finally(() => setSessionRestored(true));
  }, [navigate]);

  useEffect(() => {
    if (!sessionRestored || !authenticatedRole) return;
    if (["staff", "manager", "admin"].includes(authenticatedRole)) {
      logoutApi();
      setAuthenticatedRole(null);
      navigate("landing");
      return;
    }
    const permittedPages = rolePages[authenticatedRole] || rolePages.customer;
    if (!permittedPages.includes(currentPage) && !isPublicPage(currentPage)) navigate(roleHome(authenticatedRole));
  }, [authenticatedRole, currentPage, navigate, sessionRestored]);

  const renderPage = () => {
    switch (currentPage) {
      // Public
      case "landing": return <LandingPage />;
      case "about-features": return <PublicFeaturePage page="about-features" />;
      case "about-sellers": return <PublicFeaturePage page="about-sellers" />;
      case "about-buyers": return <PublicFeaturePage page="about-buyers" />;
      case "about-ai": return <PublicFeaturePage page="about-ai" />;
      case "about-policies": return <PublicFeaturePage page="about-policies" />;
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

      // Shared
      case "ai-center": return <AICenterPage />;
      case "buyer-ai-center": return <BuyerAICenterPage />;
      case "seller-ai-center": return <SellerAIAssistantPage />;
      case "user-profile": return <UserProfilePage />;
      case "user-settings": return <UserSettingsPage />;

      default: return <LandingPage />;
    }
  };

  if (!sessionRestored) {
    return <main className="min-h-screen bg-stone-50 flex items-center justify-center text-sm text-stone-500">Đang khôi phục phiên đăng nhập…</main>;
  }

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


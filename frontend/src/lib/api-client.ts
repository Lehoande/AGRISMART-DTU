const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"
).replace(/\/$/, "");

export type ApiCategory = {
  id: number;
  name: string;
  slug: string;
};

export type PublicReview = { id: number; rating: number; comment: string; created_at: string; customer_name: string; product_name: string };

const DEMO_CATEGORIES: ApiCategory[] = [
  { id: 1, name: "Trái cây", slug: "trai-cay" },
  { id: 2, name: "Rau củ", slug: "rau-cu" },
  { id: 3, name: "Nông sản khác", slug: "nong-san-khac" },
];

const DEMO_PRODUCTS: ApiProduct[] = [
  { id: 1, category_id: 1, name: "Dâu tây Đà Lạt", slug: "dau-tay-da-lat", description: "Dâu tây sạch, thu hoạch tại Đà Lạt.", price: 120000, unit: "kg", stock: 20, origin: "Đà Lạt, Lâm Đồng", farmer_name: "Nông trại Langbiang", image_url: "/logo.svg", traceability_code: "AGR-FRU-0101", category_name: "Trái cây", category_slug: "trai-cay", certification: "VietGAP", region: "Lâm Đồng", rating: 4.8, reviews: 24, is_active: true },
  { id: 2, category_id: 2, name: "Rau cải xanh hữu cơ", slug: "rau-cai-xanh-huu-co", description: "Rau hữu cơ không thuốc bảo vệ thực vật.", price: 28000, unit: "bó", stock: 35, origin: "Lâm Đồng", farmer_name: "HTX Rau Xanh", image_url: "/logo.svg", traceability_code: "AGR-VEG-0102", category_name: "Rau củ", category_slug: "rau-cu", certification: "Organic", region: "Lâm Đồng", rating: 4.7, reviews: 18, is_active: true },
  { id: 3, category_id: 3, name: "Nấm hương tươi", slug: "nam-huong-tuoi", description: "Nấm hương tươi, đóng gói vệ sinh.", price: 150000, unit: "kg", stock: 8, origin: "Lâm Đồng", farmer_name: "HTX Nấm Xanh", image_url: "/logo.svg", traceability_code: "AGR-OTH-0103", category_name: "Nông sản khác", category_slug: "nong-san-khac", certification: "VietGAP", region: "Lâm Đồng", rating: 4.6, reviews: 12, is_active: true },
  { id: 4, category_id: 1, name: "Cam sành Đồng Nai", slug: "cam-sanh-dong-nai", description: "Cam sành ngọt, nhiều nước.", price: 45000, unit: "kg", stock: 28, origin: "Đồng Nai", farmer_name: "Vườn Cam Đồng Nai", image_url: "/logo.svg", traceability_code: "AGR-FRU-0104", category_name: "Trái cây", category_slug: "trai-cay", certification: "GlobalGAP", region: "Đồng Nam Bộ", rating: 4.5, reviews: 9, is_active: true },
];

const DEMO_REVIEWS: PublicReview[] = [
  { id: 1, rating: 5, comment: "Sản phẩm tươi, đóng gói cẩn thận.", created_at: "2026-11-24T08:00:00.000Z", customer_name: "Nguyễn Minh", product_name: "Dâu tây Đà Lạt" },
  { id: 2, rating: 5, comment: "Rau sạch và giao hàng nhanh.", created_at: "2026-11-24T09:00:00.000Z", customer_name: "Trần Lan", product_name: "Rau cải xanh hữu cơ" },
];

function useDemoFallback(): boolean {
  return typeof window !== "undefined" &&
    !["localhost", "127.0.0.1"].includes(window.location.hostname) &&
    /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//.test(API_BASE_URL);
}

export function getPublicStats() {
  if (useDemoFallback()) return Promise.resolve({ buyers: 128, sellers: 42, products: DEMO_PRODUCTS.length, reviews: DEMO_REVIEWS.length });
  return request<{ buyers: number; sellers: number; products: number; reviews: number }>("/public/stats");
}

export function getPublicReviews() {
  if (useDemoFallback()) return Promise.resolve(DEMO_REVIEWS);
  return request<PublicReview[]>("/public/reviews");
}

export function getMyReviewCount() {
  return apiRequest<{ total: number }>("/reviews/mine");
}
export type UserNotification = { id: number; type: string; title: string; message: string; order_id: number | null; is_read: boolean; created_at: string };
export function getNotifications() { return apiRequest<{ unread_count: number; items: UserNotification[] }>("/notifications"); }
export function markNotificationRead(id: number) { return apiRequest<{ message: string }>(`/notifications/${id}/read`, { method: "PATCH" }); }
export function markAllNotificationsRead() { return apiRequest<{ message: string }>("/notifications/read-all", { method: "PATCH" }); }

export type ApiProduct = {
  id: number;
  category_id: number | null;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  unit: string;
  stock: number;
  origin: string | null;
  farmer_name: string | null;
  image_url: string | null;
  traceability_code: string | null;
  category_name: string | null;
  category_slug: string | null;
  certification?: string | null;
  region?: string | null;
  harvest_date?: string | null;
  storage_condition?: string | null;
  rating?: number;
  reviews?: number;
  is_active?: boolean;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    let readableMessage = message;
    try {
      const parsed = JSON.parse(message) as { message?: string };
      if (parsed.message) readableMessage = parsed.message;
    } catch { }
    throw new Error(readableMessage || `API request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
}

export function getApiHealth() {
  return request<{ status: string }>("/health");
}

export function getApiCategories() {
  if (useDemoFallback()) return Promise.resolve(DEMO_CATEGORIES);
  return request<ApiCategory[]>("/categories");
}

export function createCategory(payload: Pick<ApiCategory, "name" | "slug">) {
  return apiRequest<ApiCategory>("/categories", { method: "POST", body: JSON.stringify(payload) });
}
export function updateCategory(id: number, payload: Pick<ApiCategory, "name" | "slug">) {
  return apiRequest<ApiCategory>(`/categories/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
}
export function deleteCategory(id: number) {
  return apiRequest<{ message: string }>(`/categories/${id}`, { method: "DELETE" });
}

export function getApiProducts(params: {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "price_asc" | "price_desc" | "name";
} = {}) {
  if (useDemoFallback()) {
    let rows = [...DEMO_PRODUCTS];
    if (params.category) rows = rows.filter((row) => row.category_slug === params.category);
    if (params.search) {
      const search = params.search.toLowerCase();
      rows = rows.filter((row) => row.name.toLowerCase().includes(search));
    }
    if (params.minPrice !== undefined) rows = rows.filter((row) => row.price >= params.minPrice!);
    if (params.maxPrice !== undefined) rows = rows.filter((row) => row.price <= params.maxPrice!);
    if (params.sort === "price_asc") rows.sort((a, b) => a.price - b.price);
    if (params.sort === "price_desc") rows.sort((a, b) => b.price - a.price);
    if (params.sort === "name") rows.sort((a, b) => a.name.localeCompare(b.name, "vi"));
    return Promise.resolve(rows);
  }
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") query.set(key, String(value));
  }
  const suffix = query.size ? `?${query.toString()}` : "";
  return request<ApiProduct[]>(`/products${suffix}`);
}


function isAdminPortal() {
  return typeof window !== "undefined" && (window.location.pathname === "/admin" || window.location.pathname.startsWith("/admin/"));
}

function authStorageKey() {
  return isAdminPortal() ? "agrismart_admin_token" : "agrismart_token";
}

function avatarStorageKey() {
  return isAdminPortal() ? "agrismart_admin_avatar_url" : "agrismart_avatar_url";
}

function dispatchAuthUpdate() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event("agrismart-auth-updated"));
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(authStorageKey());
}

export function clearAuthToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(authStorageKey());
  window.localStorage.removeItem(avatarStorageKey());
  window.dispatchEvent(new Event("agrismart-avatar-updated"));
  dispatchAuthUpdate();
}

export function getAuthAvatar() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(avatarStorageKey());
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  return request<T>(path, {
    ...init,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
}

export async function loginApi(email: string, password: string) {
  if (useDemoFallback()) {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) throw new Error("Vui lòng nhập email và mật khẩu.");
    const demoSellerEmails = typeof window !== "undefined"
      ? JSON.parse(window.localStorage.getItem("agrismart_demo_seller_emails") || "[]") as string[]
      : [];
    const role = demoSellerEmails.includes(normalizedEmail) || normalizedEmail.includes("seller") || normalizedEmail.includes("ban")
      ? "seller"
      : "customer";
    const result = {
      token: `demo-token-${Date.now()}`,
      user: {
        id: 1,
        name: normalizedEmail.split("@")[0] || "Người dùng demo",
        email: normalizedEmail,
        role,
      },
    };
    saveLoginToken(result.token);
    return result;
  }
  const result = await request<{ token?: string; user?: { id: number; name: string; email: string; role: string }; requires_two_factor?: boolean; challenge_token?: string }>("/auth/login", {
    method: "POST", body: JSON.stringify({ email, password }),
  });
  if (result.token) saveLoginToken(result.token);
  return result;
}

function saveLoginToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(authStorageKey(), token);
  window.localStorage.removeItem(avatarStorageKey());
  window.dispatchEvent(new Event("agrismart-avatar-updated"));
  dispatchAuthUpdate();
}

export async function verifyLoginTwoFactor(challengeToken: string, code: string) {
  const result = await request<{ token: string; user: { id: number; name: string; email: string; role: string } }>("/security/2fa/verify", {
    method: "POST", body: JSON.stringify({ challenge_token: challengeToken, code }),
  });
  saveLoginToken(result.token);
  return result;
}

export function changePassword(payload: { current_password: string; new_password: string }) {
  return apiRequest<{ message: string }>("/security/password", { method: "PATCH", body: JSON.stringify(payload) });
}

export function getTwoFactorStatus() {
  return apiRequest<{ enabled: boolean }>("/security/2fa");
}

export function setupTwoFactor() {
  return apiRequest<{ secret: string; qr_code: string; expires_in_minutes: number }>("/security/2fa/setup", { method: "POST", body: JSON.stringify({}) });
}

export function enableTwoFactor(code: string) {
  return apiRequest<{ enabled: boolean; message: string }>("/security/2fa/enable", { method: "POST", body: JSON.stringify({ code }) });
}

export function disableTwoFactor(password: string, code: string) {
  return apiRequest<{ enabled: boolean; message: string }>("/security/2fa/disable", { method: "POST", body: JSON.stringify({ password, code }) });
}

export function registerApi(payload: { name: string; email: string; password: string; phone: string }) {
  if (useDemoFallback()) {
    if (!payload.name.trim() || !payload.email.trim() || payload.password.length < 8) {
      return Promise.reject(new Error("Vui lòng nhập đầy đủ thông tin và mật khẩu ít nhất 8 ký tự."));
    }
    return Promise.resolve({ id: Date.now(), message: "Tạo tài khoản demo thành công." });
  }
  return request<{ id: number; message: string }>("/auth/register", {
    method: "POST", body: JSON.stringify(payload),
  });
}

export function registerSellerApi(payload: { name: string; email: string; password: string; phone: string; farm_name: string; farm_address: string; citizen_id?: string | null; citizen_card_date?: string | null; id_card_front_url?: string | null; id_card_back_url?: string | null }) {
  if (useDemoFallback()) {
    if (!payload.name.trim() || !payload.email.trim() || payload.password.length < 8 || !payload.farm_name.trim()) {
      return Promise.reject(new Error("Vui lòng nhập đầy đủ thông tin người bán và mật khẩu ít nhất 8 ký tự."));
    }
    const normalizedEmail = payload.email.trim().toLowerCase();
    const stored = typeof window !== "undefined"
      ? JSON.parse(window.localStorage.getItem("agrismart_demo_seller_emails") || "[]") as string[]
      : [];
    if (typeof window !== "undefined" && !stored.includes(normalizedEmail)) {
      window.localStorage.setItem("agrismart_demo_seller_emails", JSON.stringify([...stored, normalizedEmail]));
    }
    return Promise.resolve({ id: Date.now(), message: "Tạo gian hàng demo thành công." });
  }
  return request<{ id: number; message: string }>('/auth/register-seller', { method: 'POST', body: JSON.stringify(payload) });
}

export async function onboardSellerApi(payload: { farm_name: string; farm_address: string; citizen_id?: string | null; citizen_card_date?: string | null; id_card_front_url?: string | null; id_card_back_url?: string | null }) {
  const result = await apiRequest<{ token: string; user: { id: number; name: string; email: string; role: string } }>('/seller/onboard', {
    method: 'POST', body: JSON.stringify(payload),
  });
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(authStorageKey(), result.token);
    dispatchAuthUpdate();
  }
  return result;
}

export function logoutApi() {
  clearAuthToken();
}

export type UserProfile = { id: number; name: string; email: string; phone: string | null; address: string | null; ward: string | null; district: string | null; province: string | null; role: string; avatar_url: string | null; created_at?: string };

function cacheAvatar(avatarUrl: string | null) {
  if (typeof window === "undefined") return;
  if (avatarUrl) window.localStorage.setItem(avatarStorageKey(), avatarUrl);
  else window.localStorage.removeItem(avatarStorageKey());
  window.dispatchEvent(new Event("agrismart-avatar-updated"));
}

export async function getMyProfile() {
  const profile = await apiRequest<UserProfile>("/auth/me");
  cacheAvatar(profile.avatar_url || null);
  return profile;
}

export async function updateMyAvatar(avatarUrl: string | null) {
  const result = await apiRequest<{ avatar_url: string | null }>("/auth/avatar", { method: "PATCH", body: JSON.stringify({ avatar_url: avatarUrl }) });
  cacheAvatar(result.avatar_url);
  return result;
}

export function updateMyProfile(payload: { name: string; phone: string; address: string; ward: string; district: string; province: string }) {
  return apiRequest<UserProfile>("/auth/me", { method: "PATCH", body: JSON.stringify(payload) });
}

export function checkoutApi(payload: { shipping_name: string; shipping_phone: string; shipping_address: string; shipping_street_address?: string; shipping_ward: string; shipping_district: string; shipping_province: string; payment_method: "cod" | "banking" | "vnpay" | "momo"; promo_code?: string | null }, idempotencyKey?: string) {
  return apiRequest<{ id: number; subtotal: number; shipping_fee: number; discount_amount: number; total: number; status: string; payment_status: string; idempotent_replay?: boolean }>("/orders/checkout", {
    method: "POST", body: JSON.stringify(payload),
    ...(idempotencyKey ? { headers: { "Idempotency-Key": idempotencyKey } } : {}),
  });
}

export type BankTransferConfig = {
  configured: boolean;
  bank_name: string;
  bank_bin: string;
  account_no: string;
  account_name: string;
  branch: string;
};

export function getBankTransferConfig() {
  return apiRequest<BankTransferConfig>("/payments/bank-config");
}

export function confirmBankTransfer(orderId: number) {
  return apiRequest<{ id: number; payment_status: string; message: string }>(`/payments/bank/${orderId}/confirm`, { method: "PATCH" });
}

export function claimBankTransfer(orderId: number) {
  return apiRequest<{ id: number; payment_status: string; claimed: boolean; message: string }>(`/payments/bank/${orderId}/claim`, { method: "POST" });
}

export function clearApiCart() {
  return apiRequest<{ message: string }>("/cart", { method: "DELETE" });
}

export function addApiCartItem(productId: number, quantity: number) {
  return apiRequest<{ message: string; quantity: number }>("/cart", {
    method: "POST", body: JSON.stringify({ productId, quantity }),
  });
}

export function getApiProduct(productId: string | number) {
  if (useDemoFallback()) {
    const row = DEMO_PRODUCTS.find((item) => String(item.id) === String(productId));
    if (row) return Promise.resolve(row);
    return Promise.reject(new Error("Không tìm thấy sản phẩm."));
  }
  return request<ApiProduct & { rating: number; reviews: number; certification: string | null; region: string | null; harvest_date: string | null; storage_condition: string | null }>(`/products/${encodeURIComponent(String(productId))}`);
}
export function getQrTrace(code: string) { return request<Record<string, unknown>>(`/qr/trace/${encodeURIComponent(code)}`); }

export function getRecommendations(categoryId?: number) {
  const query = categoryId ? `?categoryId=${encodeURIComponent(String(categoryId))}` : '';
  return apiRequest<{ strategy?: string; explanation?: string; items?: Array<{ id: number; name: string; price: number; unit: string; stock: number; origin: string | null; image_url: string | null; reason?: string }> }>(`/recommendations${query}`);
}

export function askBuyerAi(question: string, productIds: number[]) {
  return request<{ text: string; model: string; disclaimer: string }>('/ai/buyer-answer', {
    method: 'POST', body: JSON.stringify({ question, productIds }),
  });
}

export function getAiServiceHealth() {
  return request<{ available: boolean; engine: string | null; geminiConfigured?: boolean; geminiModel?: string | null }>('/ai/health');
}

export function generateSellerDraft(task: "product-description" | "buyer-reply", product: Record<string, unknown>, question?: string) {
  return apiRequest<{ text: string; model: string; provider: "gemini" }>("/ai/generate-draft", {
    method: "POST", body: JSON.stringify({ task, product, question }),
  });
}

export function analyzeProductWithAi(payload: {
  name: string; category: string; description: string; origin: string; certification: string;
  harvest_date: string; stock: number; storage_condition: string; image_url: string;
}) {
  return apiRequest<{ engine: string; suggested_category: string; category_matches_input: boolean; warnings: string[]; ready_for_review: boolean; disclaimer: string }>('/ai/analyze-product', {
    method: 'POST', body: JSON.stringify(payload),
  });
}

export function getMyOrders(view?: "buyer") {
  return apiRequest<Array<Record<string, any>>>(`/orders${view ? `?view=${view}` : ""}`);
}

export function getOrderDetail(orderId: string | number) {
  return apiRequest<Record<string, any>>(`/orders/${encodeURIComponent(String(orderId))}`);
}

export function updateOrderStatus(orderId: string | number, status: string) {
  return apiRequest<{ id: number; from: string; to: string }>(`/orders/${encodeURIComponent(String(orderId))}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
}

export function cancelOrder(orderId: string | number) {
  return apiRequest<{ id: number; to: string }>(`/orders/${encodeURIComponent(String(orderId))}/cancel`, { method: 'PATCH', body: JSON.stringify({}) });
}

export function startPayment(orderId: number, provider: 'vnpay' | 'momo') {
  return apiRequest<{ payment_url: string }>(`/payments/create/${orderId}`, { method: 'POST', body: JSON.stringify({ provider }) });
}

export function submitReview(productId: string | number, payload: { rating: number; comment: string }) {
  return apiRequest<{ message: string }>(`/products/${encodeURIComponent(String(productId))}/reviews`, { method: 'POST', body: JSON.stringify(payload) });
}
export function getMyProductReview(productId: string | number) { return apiRequest<{ id: number; product_id: number; rating: number; comment: string | null; created_at: string } | null>(`/reviews/mine/${encodeURIComponent(String(productId))}`); }
export function deleteMyReview(reviewId: number) { return apiRequest<{ message: string }>(`/reviews/${reviewId}`, { method: "DELETE" }); }

export function validatePromotion(code: string) {
  return request<{ code: string; discount_percent: number }>(`/promotions/${encodeURIComponent(code.trim().toUpperCase())}`);
}

export function getMyProducts() {
  return apiRequest<ApiProduct[]>('/seller/products');
}

export function createProduct(payload: Record<string, unknown>) {
  return apiRequest<{ id: number }>('/products', { method: 'POST', body: JSON.stringify(payload) });
}

export function archiveProduct(productId: number) {
  return apiRequest<{ message: string }>(`/products/${productId}`, { method: 'DELETE' });
}

export function getSellerSummary() {
  return apiRequest<{ products: number; inventory_units: number; orders: number; revenue: number; seller: { farm_name: string; farm_address: string; status: string; review_note: string | null; citizen_id?: string | null; citizen_card_date?: string | null; id_card_front_url?: string | null; id_card_back_url?: string | null } | null }>('/seller/summary');
}

export function updateSellerProfileApi(payload: {
  citizen_id?: string;
  citizen_card_date?: string;
  id_card_front_url?: string;
  id_card_back_url?: string;
  farm_name?: string;
  farm_address?: string;
}) {
  return apiRequest<{ message: string; profile: Record<string, any> }>('/seller/profile', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export type SellerProductInsight = Pick<ApiProduct, "id" | "name" | "description" | "price" | "unit" | "stock" | "origin" | "region" | "harvest_date" | "traceability_code" | "certification" | "storage_condition" | "category_name"> & {
  low_stock_threshold: number;
  benchmark_count: number;
  benchmark_average: number | null;
  benchmark_min: number | null;
  benchmark_max: number | null;
};

export function getSellerInsights() {
  return apiRequest<{ updated_at: string; products: SellerProductInsight[] }>("/seller/insights");
}

export function getSellerReviews() {
  return apiRequest<Array<{ id: number; rating: number; comment: string | null; created_at: string; customer_name: string; product_name: string }>>('/seller/reviews');
}

export function getAdminSummary() {
  return apiRequest<{ revenue: number; orders: number; products: number; inventory_units: number; customers: number; topProducts: Array<{ product_name: string; sold: number }> }>('/admin/stats');
}
export type AdminUser = { id: number; name: string; email: string; phone: string | null; role: string; created_at: string };
export type AdminProduct = { id: number; name: string; price: number; stock: number; unit: string; is_active: boolean; category_name: string | null; seller_name: string | null; created_at: string };
export type AdminReview = { id: number; rating: number; comment: string | null; created_at: string; customer_name: string; product_name: string };
export function getAdminUsers() { return apiRequest<AdminUser[]>("/admin/users"); }
export function setAdminUserRole(id: number, role: string) { return apiRequest<{ id: number; role: string }>(`/admin/users/${id}/role`, { method: "PATCH", body: JSON.stringify({ role }) }); }
export function getAdminProducts() { return apiRequest<AdminProduct[]>("/admin/products"); }
export function setAdminProductVisibility(id: number, is_active: boolean) { return apiRequest<{ id: number; is_active: boolean }>(`/admin/products/${id}/visibility`, { method: "PATCH", body: JSON.stringify({ is_active }) }); }
export function getAdminReviews() { return apiRequest<AdminReview[]>("/admin/reviews"); }
export function deleteAdminReview(id: number) { return apiRequest<{ message: string }>(`/admin/reviews/${id}`, { method: "DELETE" }); }
export function getInventory(params: { search?: string; lowStockOnly?: boolean } = {}) { const q = new URLSearchParams(); if (params.search) q.set("search", params.search); if (params.lowStockOnly) q.set("lowStockOnly", "true"); return apiRequest<{ items: Array<{ id: number; name: string; unit: string; price: number; stock: number; low_stock_threshold: number; origin: string | null; category_name: string | null; is_low_stock: boolean }> }>(`/inventory${q.size ? `?${q}` : ""}`); }
export function adjustInventory(productId: number, payload: { delta: number; reason: string }) { return apiRequest<{ product_id: number; stock: number }>(`/inventory/${productId}/stock`, { method: "PATCH", body: JSON.stringify(payload) }); }

export type AdminSellerApplication = {
  user_id: number;
  farm_name: string;
  farm_address: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  reviewed_at: string | null;
  review_note: string | null;
  representative_name: string;
  email: string;
  phone: string | null;
  citizen_id?: string | null;
  citizen_card_date?: string | null;
  id_card_front_url?: string | null;
  id_card_back_url?: string | null;
};

export function getAdminSellerApplications(status: "pending" | "approved" | "rejected" | "all" = "pending") {
  return apiRequest<AdminSellerApplication[]>(`/admin/sellers?status=${status}`);
}

export function decideSellerApplication(userId: number, status: "approved" | "rejected", note?: string) {
  return apiRequest<{ user_id: number; status: "approved" | "rejected"; reviewed_at: string; review_note: string | null }>(
    `/admin/sellers/${userId}/status`, { method: "PATCH", body: JSON.stringify({ status, note }) },
  );
}

export function getComplaints(view?: "buyer") {
  return apiRequest<Array<Record<string, any>>>(`/complaints${view ? `?view=${view}` : ""}`);
}

export function createComplaint(payload: { order_id: number; product_id?: number | null; issue_type: string; description: string; evidence_url?: string }) {
  return apiRequest<{ id: number; status: string }>('/complaints', { method: 'POST', body: JSON.stringify(payload) });
}

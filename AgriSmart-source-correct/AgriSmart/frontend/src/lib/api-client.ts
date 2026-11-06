const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"
).replace(/\/$/, "");

export type ApiCategory = {
  id: number;
  name: string;
  slug: string;
};

export type PublicReview = { id: number; rating: number; comment: string; created_at: string; customer_name: string; product_name: string };

export function getPublicStats() {
  return request<{ buyers: number; sellers: number; products: number; reviews: number }>("/public/stats");
}

export function getPublicReviews() {
  return request<PublicReview[]>("/public/reviews");
}

export function getMyReviewCount() {
  return apiRequest<{ total: number }>("/reviews/mine");
}

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
    } catch {}
    throw new Error(readableMessage || `API request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
}

export function getApiHealth() {
  return request<{ status: string }>("/health");
}

export function getApiCategories() {
  return request<ApiCategory[]>("/categories");
}

export function getApiProducts(params: {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "price_asc" | "price_desc" | "name";
} = {}) {
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
  return request<{ id: number; message: string }>("/auth/register", {
    method: "POST", body: JSON.stringify(payload),
  });
}

export function registerSellerApi(payload: { name: string; email: string; password: string; phone: string; farm_name: string; farm_address: string }) {
  return request<{ id: number; message: string }>('/auth/register-seller', { method: 'POST', body: JSON.stringify(payload) });
}

export async function onboardSellerApi(payload: { farm_name: string; farm_address: string }) {
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
  return apiRequest<{ id: number; total: number; discount_amount: number; status: string; payment_status: string; idempotent_replay?: boolean }>("/orders/checkout", {
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
  return request<ApiProduct & { rating: number; reviews: number; certification: string | null; region: string | null; harvest_date: string | null; storage_condition: string | null }>(`/products/${encodeURIComponent(String(productId))}`);
}

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
  return apiRequest<{ products: number; inventory_units: number; orders: number; revenue: number; seller: { farm_name: string; farm_address: string; status: string; review_note: string | null } | null }>('/seller/summary');
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

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"
).replace(/\/$/, "");

export type ApiCategory = {
  id: number;
  name: string;
  slug: string;
};

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
    throw new Error(message || `API request failed (${response.status})`);
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


export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("agrismart_token");
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
  const result = await request<{ token: string; user: { id: number; name: string; email: string; role: string } }>("/auth/login", {
    method: "POST", body: JSON.stringify({ email, password }),
  });
  if (typeof window !== "undefined") window.localStorage.setItem("agrismart_token", result.token);
  return result;
}

export function logoutApi() {
  if (typeof window !== "undefined") window.localStorage.removeItem("agrismart_token");
}

export function checkoutApi(payload: { shipping_name: string; shipping_phone: string; shipping_address: string; payment_method: "cod" }) {
  return apiRequest<{ id: number; total: number; status: string; payment_status: string }>("/orders/checkout", {
    method: "POST", body: JSON.stringify(payload),
  });
}

export function clearApiCart() {
  return apiRequest<{ message: string }>("/cart", { method: "DELETE" });
}

export function addApiCartItem(productId: number, quantity: number) {
  return apiRequest<{ message: string; quantity: number }>("/cart", {
    method: "POST", body: JSON.stringify({ productId, quantity }),
  });
}

import { formatApiErrorBody, ApiError } from "@/shared/lib/api-error";
import { useAuthStore } from "@/store/authStore";

function getApiBase(): string {
  const raw = import.meta.env.VITE_API_URL as string | undefined;
  if (raw && raw.trim().length > 0) return raw.replace(/\/$/, "");
  return "";
}

const base = getApiBase();

async function request<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {}
): Promise<T> {
  const { token, ...init } = options;
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const t = token ?? useAuthStore.getState().token;
  if (t) headers.set("Authorization", `Bearer ${t}`);

  const res = await fetch(`${base}${path}`, { ...init, headers });
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    if (!res.ok) {
      throw new Error(
        `Không đọc được phản hồi từ máy chủ (${res.status}). Hãy kiểm tra backend đang chạy.`
      );
    }
    throw new Error("Phản hồi từ máy chủ không đúng định dạng.");
  }
  if (!res.ok) {
    throw new ApiError(formatApiErrorBody(data), res.status);
  }
  return data as T;
}

export const api = {
  health: () => request<{ ok: boolean }>("/health"),

  categories: () => request<import("./types").Category[]>("/api/categories"),

  category: (slug: string, params?: { page?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.page != null) q.set("page", String(params.page));
    if (params?.limit != null) q.set("limit", String(params.limit));
    const qs = q.toString();
    return request<import("./types").CategoryDetail>(
      `/api/categories/${encodeURIComponent(slug)}${qs ? `?${qs}` : ""}`
    );
  },

  products: (params: Record<string, string | number | undefined>) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== "") q.set(k, String(v));
    });
    return request<{ items: import("./types").Product[]; pagination: unknown }>(
      `/api/products?${q}`
    );
  },

  search: (params: Record<string, string | number | undefined>) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== "") q.set(k, String(v));
    });
    return request<import("./types").SearchResponse>(`/api/search?${q}`);
  },

  searchSuggestions: (q: string) =>
    request<{ suggestions: string[] }>(`/api/search/suggestions?q=${encodeURIComponent(q)}`),

  productBySlug: (slug: string) =>
    request<import("./types").Product>(`/api/products/slug/${encodeURIComponent(slug)}`),

  register: (body: { email: string; password: string; name: string; phone?: string }) =>
    request<{ user: import("./types").User; token: string }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
      token: null,
    }),

  login: (body: { email: string; password: string }) =>
    request<{ user: import("./types").User; token: string }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
      token: null,
    }),

  me: () => request<import("./types").User>("/api/auth/me"),

  cart: () => request<{ items: import("./types").CartItem[]; subtotal: number }>("/api/cart"),

  addCart: (productId: string, quantity = 1) =>
    request<import("./types").CartItem>("/api/cart", {
      method: "POST",
      body: JSON.stringify({ productId, quantity }),
    }),

  patchCart: (id: string, quantity: number) =>
    request<import("./types").CartItem>(`/api/cart/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ quantity }),
    }),

  removeCart: (id: string) => request<void>(`/api/cart/${id}`, { method: "DELETE" }),

  clearCart: () => request<{ ok: boolean }>("/api/cart/clear/all", { method: "POST" }),

  orders: () => request<import("./types").Order[]>("/api/orders"),

  order: (id: string) => request<import("./types").Order>(`/api/orders/${encodeURIComponent(id)}`),

  cancelOrder: (id: string) =>
    request<import("./types").Order>(`/api/orders/${encodeURIComponent(id)}/cancel`, { method: "POST" }),

  checkout: (body: { address: string; phone: string; cartItemIds?: string[] }) =>
    request<import("./types").Order>("/api/orders/checkout", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  updateProfile: (body: { name?: string; phone?: string | null }) =>
    request<import("./types").User>("/api/user/profile", {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  adminStats: () => request<import("./types").AdminStats>("/api/admin/stats"),

  adminOrder: (id: string) => request<import("./types").AdminOrderDetail>(`/api/admin/orders/${encodeURIComponent(id)}`),

  adminOrders: (params?: { page?: number; limit?: number; status?: string; q?: string }) => {
    const q = new URLSearchParams();
    if (params?.page != null) q.set("page", String(params.page));
    if (params?.limit != null) q.set("limit", String(params.limit));
    if (params?.status) q.set("status", params.status);
    if (params?.q) q.set("q", params.q);
    const qs = q.toString();
    return request<{
      items: import("./types").AdminOrderRow[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/api/admin/orders${qs ? `?${qs}` : ""}`);
  },

  adminPatchOrderStatus: (id: string, status: string) =>
    request<import("./types").AdminOrderRow>(`/api/admin/orders/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  adminDeleteOrder: (id: string) =>
    request<void>(`/api/admin/orders/${encodeURIComponent(id)}`, { method: "DELETE" }),

  adminUsers: (params?: { page?: number; limit?: number; q?: string }) => {
    const q = new URLSearchParams();
    if (params?.page != null) q.set("page", String(params.page));
    if (params?.limit != null) q.set("limit", String(params.limit));
    if (params?.q) q.set("q", params.q);
    const qs = q.toString();
    return request<{
      items: import("./types").AdminUserRow[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/api/admin/users${qs ? `?${qs}` : ""}`);
  },

  adminPatchUserRole: (id: string, role: import("./types").UserRole) =>
    request<import("./types").AdminUserRow>(`/api/admin/users/${encodeURIComponent(id)}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    }),

  adminCreateUser: (body: {
    email: string;
    password: string;
    name: string;
    phone?: string | null;
    role?: import("./types").UserRole;
  }) =>
    request<import("./types").AdminUserRow>("/api/admin/users", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  adminPatchUser: (id: string, body: { name?: string; email?: string; phone?: string | null }) =>
    request<import("./types").AdminUserRow>(`/api/admin/users/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  adminPatchUserPassword: (id: string, password: string) =>
    request<import("./types").AdminUserRow>(`/api/admin/users/${encodeURIComponent(id)}/password`, {
      method: "PATCH",
      body: JSON.stringify({ password }),
    }),

  adminDeleteUser: (id: string) => request<void>(`/api/admin/users/${encodeURIComponent(id)}`, { method: "DELETE" }),

  adminProducts: (params?: { page?: number; limit?: number; q?: string; categoryId?: string }) => {
    const q = new URLSearchParams();
    if (params?.page != null) q.set("page", String(params.page));
    if (params?.limit != null) q.set("limit", String(params.limit));
    if (params?.q) q.set("q", params.q);
    if (params?.categoryId) q.set("categoryId", params.categoryId);
    const qs = q.toString();
    return request<{
      items: import("./types").Product[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/api/admin/products${qs ? `?${qs}` : ""}`);
  },

  adminPatchProduct: (id: string, body: Record<string, unknown>) =>
    request<import("./types").Product>(`/api/admin/products/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  adminCreateProduct: (body: Record<string, unknown>) =>
    request<import("./types").Product>("/api/admin/products", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  adminDeleteProduct: (id: string) =>
    request<void>(`/api/admin/products/${encodeURIComponent(id)}`, { method: "DELETE" }),

  adminCategories: () =>
    request<{ items: import("./types").AdminCategoryRow[] }>("/api/admin/categories"),

  adminCreateCategory: (body: { name: string; slug: string; icon?: string | null }) =>
    request<import("./types").AdminCategoryRow>("/api/admin/categories", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  adminPatchCategory: (id: string, body: { name?: string; slug?: string; icon?: string | null }) =>
    request<import("./types").AdminCategoryRow>(`/api/admin/categories/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  adminDeleteCategory: (id: string) =>
    request<void>(`/api/admin/categories/${encodeURIComponent(id)}`, { method: "DELETE" }),

  // ERP - Procurement & Inventory
  suppliers: () => request<any[]>("/api/procurement/suppliers"),
  createSupplier: (body: any) => request<any>("/api/procurement/suppliers", { method: "POST", body: JSON.stringify(body) }),
  updateSupplier: (id: string, body: any) => request<any>(`/api/procurement/suppliers/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteSupplier: (id: string) => request<void>(`/api/procurement/suppliers/${encodeURIComponent(id)}`, { method: "DELETE" }),
  purchaseOrders: () => request<any[]>("/api/procurement/purchase-orders"),
  purchaseOrder: (id: string) => request<any>(`/api/procurement/purchase-orders/${encodeURIComponent(id)}`),
  createPurchaseOrder: (body: any) => request<any>("/api/procurement/purchase-orders", { method: "POST", body: JSON.stringify(body) }),
  updatePurchaseOrder: (id: string, body: any) => request<any>(`/api/procurement/purchase-orders/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(body) }),
  updatePOStatus: (id: string, status: string) => request<any>(`/api/procurement/purchase-orders/${encodeURIComponent(id)}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  deletePO: (id: string) => request<void>(`/api/procurement/purchase-orders/${encodeURIComponent(id)}`, { method: "DELETE" }),
  goodsReceipts: () => request<any[]>("/api/procurement/goods-receipts"),
  createGoodsReceipt: (body: any) => request<any>("/api/procurement/goods-receipts", { method: "POST", body: JSON.stringify(body) }),
  updateGoodsReceipt: (id: string, body: any) => request<any>(`/api/procurement/goods-receipts/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteGoodsReceipt: (id: string) => request<void>(`/api/procurement/goods-receipts/${encodeURIComponent(id)}`, { method: "DELETE" }),
  branches: () => request<any[]>("/api/inventory/branches"),
  branchStock: (params?: { branchId?: string; q?: string }) => {
    const q = new URLSearchParams();
    if (params?.branchId) q.set("branchId", params.branchId);
    if (params?.q) q.set("q", params.q);
    const qs = q.toString();
    return request<any[]>(`/api/inventory/branch-stock${qs ? `?${qs}` : ""}`);
  },
  batches: (params?: { branchId?: string; productId?: string }) => {
    const q = new URLSearchParams();
    if (params?.branchId) q.set("branchId", params.branchId);
    if (params?.productId) q.set("productId", params.productId);
    const qs = q.toString();
    return request<any[]>(`/api/inventory/batches${qs ? `?${qs}` : ""}`);
  },
  ledgers: (params?: { branchId?: string; productId?: string }) => {
    const q = new URLSearchParams();
    if (params?.branchId) q.set("branchId", params.branchId);
    if (params?.productId) q.set("productId", params.productId);
    const qs = q.toString();
    return request<any[]>(`/api/inventory/ledgers${qs ? `?${qs}` : ""}`);
  },
  transfers: () => request<any[]>("/api/inventory/transfers"),
  createTransfer: (body: any) => request<any>("/api/inventory/transfers", { method: "POST", body: JSON.stringify(body) }),
  reconciliation: () => request<{ timestamp: string; integrityScore: number; discrepancies: any[] }>("/api/inventory/reconciliation"),
};


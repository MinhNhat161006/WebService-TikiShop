export type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  productCount?: number;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  listPrice: number | null;
  image: string;
  rating: number;
  reviewCount: number;
  sold: number;
  badge: string | null;
  brand: string | null;
  tags: string | null;
  categoryId: string;
  category?: Category;
};

export type UserRole = "USER" | "ADMIN";

export type User = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: UserRole;
  createdAt: string;
};

export type CartItem = {
  id: string;
  quantity: number;
  product: Product;
};

export type Order = {
  id: string;
  userId: string;
  status: string;
  total: number;
  address: string;
  phone: string;
  createdAt: string;
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    product: Product;
  }>;
};

export type CategoryDetail = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  products: Product[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

export type SearchResponse = {
  products: Product[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  query: {
    q: string;
    filters: {
      minPrice?: number;
      maxPrice?: number;
      category?: string;
      brand?: string;
      minRating?: number;
    };
    sort: string;
  };
};

export type AdminOrderStatusCount = { status: string; count: number };

export type AdminTopProduct = {
  productId: string;
  name: string;
  slug: string;
  quantitySold: number;
};

export type AdminRecentOrder = {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  userEmail: string;
  userName: string;
};

export type AdminStats = {
  users: number;
  orders: number;
  products: number;
  categories: number;
  /** Tổng `total` các đơn trạng thái delivered (đã giao). */
  revenueTotal: number;
  /** delivered trong 30 ngày gần nhất (theo createdAt). */
  revenueLast30Days: number;
  newUsersLast7Days: number;
  ordersByStatus: AdminOrderStatusCount[];
  topProducts: AdminTopProduct[];
  recentOrders: AdminRecentOrder[];
};

export type AdminOrderRow = {
  id: string;
  userId: string;
  status: string;
  total: number;
  address: string;
  phone: string;
  createdAt: string;
  user: { id: string; email: string; name: string };
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    product: { id: string; name: string; slug: string; image: string };
  }>;
};

export type AdminUserRow = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: UserRole;
  createdAt: string;
};

export type AdminCategoryRow = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  productCount: number;
};

export type AdminOrderDetail = Order & {
  user: { id: string; email: string; name: string; phone: string | null };
};

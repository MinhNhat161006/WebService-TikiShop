import type { User, UserRole } from "@/shared/api/types";

export function isAdmin(user: User | null | undefined): boolean {
  return user?.role === "ADMIN";
}

export function roleLabel(role: UserRole | undefined): string {
  if (role === "ADMIN") return "Quản trị viên";
  return "Khách hàng";
}

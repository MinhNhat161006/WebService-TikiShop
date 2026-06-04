import { prisma } from "./lib/prisma.js";

/** Ẩn mật khẩu trong URL khi in log. */
export function maskDatabaseUrl(raw: string | undefined): string {
  if (!raw?.trim()) return "(chưa có DATABASE_URL)";
  if (raw.startsWith("file:")) return raw;
  try {
    const u = new URL(raw);
    if (u.password) u.password = "***";
    return u.toString();
  } catch {
    return "(DATABASE_URL không đúng định dạng URL)";
  }
}

export async function connectDatabaseOrExit(): Promise<void> {
  try {
    await prisma.$connect();
    console.log("[db] Đã kết nối:", maskDatabaseUrl(process.env.DATABASE_URL));
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("\n========== LỖI CƠ SỞ DỮ LIỆU ==========");
    console.error(msg);
    console.error("\nDATABASE_URL:", maskDatabaseUrl(process.env.DATABASE_URL));
    console.error("\nGợi ý:");
    console.error("  • Dev đơn giản: trong backend/.env dùng  DATABASE_URL=\"file:./dev.db\"");
    console.error("    rồi:  cd backend && npx prisma db push && npm run db:seed");
    console.error("  • MySQL: xem backend/DATABASE.txt và prisma/mysql/mysql_workbench_schema_and_seed.sql");
    console.error("  • Docker MySQL: từ thư mục gốc  docker compose up -d");
    console.error("========================================\n");
    await prisma.$disconnect().catch(() => {});
    process.exit(1);
  }
}

import path from "node:path";
import { fileURLToPath } from "node:url";
import swaggerJsdoc from "swagger-jsdoc";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "TIKI Clone API",
      version: "1.0.0",
      description:
        "REST API đầy đủ cho demo e-commerce phong cách Tiki: sản phẩm, danh mục, giỏ hàng, đơn hàng, người dùng.",
    },
    servers: [{ url: "http://localhost:4000", description: "Local" }],
    tags: [
      { name: "Auth", description: "Đăng ký / đăng nhập" },
      { name: "Categories", description: "Danh mục" },
      { name: "Products", description: "Sản phẩm & tìm kiếm" },
      { name: "Cart", description: "Giỏ hàng (Bearer)" },
      { name: "Orders", description: "Đơn hàng (Bearer)" },
      { name: "User", description: "Hồ sơ (Bearer)" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: [path.join(__dirname, "index.ts"), path.join(__dirname, "routes", "*.ts")],
};

export const swaggerSpec = swaggerJsdoc(options);

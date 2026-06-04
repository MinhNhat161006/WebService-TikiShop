# Tiki Clone - Setup Guide

Hướng dẫn để clone và chạy dự án Tiki Clone.

## Yêu cầu hệ thống

- **Node.js**: v18 trở lên
- **npm**: v9 trở lên (hoặc yarn, pnpm)
- **Git**: để clone repository

## Cài đặt

### 1. Clone repository

```bash
git clone <repository-url>
cd TIKI_App
```

### 2. Cài đặt dependencies

Cài đặt dependencies cho cả backend và frontend:

```bash
npm install
```

Hoặc cài riêng từng phần:

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### 3. Cấu hình Database

#### Tạo file `.env` trong thư mục `backend`:

```bash
# backend/.env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secure-jwt-secret-key-here"
PORT=3000
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
```

#### Khởi tạo Database:

```bash
npm run db:push
```

#### (Tùy chọn) Seed dữ liệu mẫu:

```bash
npm run db:seed
```

## Chạy dự án

### Chạy cả Backend và Frontend cùng lúc

Từ thư mục root:

```bash
# Terminal 1 - Backend
npm run dev:api

# Terminal 2 - Frontend
npm run dev:web
```

### Hoặc chạy riêng

**Backend:**

```bash
cd backend
npm run dev
```

Backend sẽ chạy trên `http://localhost:3000`

**Frontend:**

```bash
cd frontend
npm run dev
```

Frontend sẽ chạy trên `http://localhost:5173`

## Cấu trúc dự án

```
TIKI_App/
├── backend/           # Express API + Prisma
│   ├── src/
│   │   ├── index.ts          # Entry point
│   │   ├── routes/           # API routes
│   │   ├── middleware/       # Auth middleware
│   │   └── lib/
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   └── seed.ts           # Seed script
│   └── package.json
│
├── frontend/          # React + Vite
│   ├── src/
│   │   ├── pages/            # Page components
│   │   ├── components/       # UI components
│   │   ├── store/            # Zustand stores
│   │   ├── api/              # API client
│   │   └── styles/
│   └── package.json
│
└── package.json       # Root package.json
```

## API Documentation

Swagger Documentation có sẵn tại:

```
http://localhost:3000/api/docs
```

## Git Workflow

### Trước khi commit:

```bash
# Tạo branch mới
git checkout -b feature/your-feature-name

# Commit changes
git add .
git commit -m "describe your changes"

# Push lên remote
git push origin feature/your-feature-name
```

## Troubleshooting

### Lỗi "Cannot find module"

```bash
# Xóa node_modules và cài lại
rm -rf node_modules
npm install
```

### Database errors

```bash
# Reset database
npm run db:push

# Hoặc xóa file dev.db và tạo lại
rm backend/dev.db
npm run db:push
npm run db:seed
```

### Port đã dùng

Nếu port 3000 hoặc 5173 đã dùng, đổi port trong:

- Backend: `backend/.env` → `PORT=3001`
- Frontend: `frontend/vite.config.ts`

## Các lệnh hữu ích

```bash
# Root level
npm run dev:api       # Chạy backend
npm run dev:web       # Chạy frontend
npm run db:push       # Sync database schema
npm run db:seed       # Seed dữ liệu mẫu

# Backend
npm run build         # Build TypeScript
npm run start         # Chạy production build

# Frontend
npm run build         # Build Vite
npm run preview       # Preview production build
```

## Liên hệ & Support

Nếu gặp vấn đề, vui lòng tạo issue hoặc liên hệ.

---

Happy coding! 🚀

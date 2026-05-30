# Next Tasks — กระบวนการต่อไป
# Updated: 2026-05-29 23:37

---

## สถานะปัจจุบัน

### ✅ ทำเสร็จแล้ว
- [x] Project structure (client/server/shared folders)
- [x] Vite + React + TypeScript setup (client/)
- [x] Basic config files (vite.config.ts, tsconfig, tailwind)
- [x] Documentation complete (architecture, scope, workflows, setup guide)
- [x] AI-OS system ready (global + project-specific)

### ⏳ ถัดไป (เปิดหน้าต่างใหม่)

## 1. Install Dependencies (ทันที)

```bash
# ใน client/
cd f:\Programming\tire-shop-pos\client
npm install

# ควรใช้เวลา 2-3 นาที
```

**ผลลัพธ์:** แก้ไข TypeScript errors ทั้งหมด

---

## 2. Initialize Hono Backend

```bash
# ใน server/
cd f:\Programming\tire-shop-pos\server
npm init -y
npm install hono @hono/zod-validator cors
npm install -D @types/node typescript tsx nodemon
```

สร้างไฟล์พื้นฐาน:
- `package.json` (dependencies)
- `tsconfig.json`
- `src/index.ts` (Hono app entry)
- `src/routes/health.ts` (test endpoint)

---

## 3. Setup Drizzle ORM

```bash
# ใน server/
npm install drizzle-orm mysql2
npm install -D drizzle-kit
```

สร้าง:
- `drizzle.config.ts`
- `src/db/schema.ts` (จาก docs/db-schema.sql)
- `src/db/connection.ts`
- `.env` (MySQL connection)

---

## 4. Test Both Servers

```bash
# Terminal 1 - Frontend
cd client && npm run dev
# → http://localhost:5173

# Terminal 2 - Backend  
cd server && npm run dev
# → http://localhost:3000/api/health
```

---

## 5. Basic Layout (เมื่อทั้ง 2 ทำงาน)

สร้างใน `client/src/`:
- `components/layout/` (shell, sidebar, header, status-bar)
- `components/ui/` (shadcn/ui components)
- `stores/` (Zustand stores)
- `lib/` (api client, offline db)

---

## 6. First Module: Settings

สร้าง `docs/modules/settings.md` ก่อน code:
- Configurable values (VAT, payment methods, units)
- API endpoints
- Components structure

---

## คำสั่งที่ใช้บ่อย

```bash
# Frontend
npm run dev          # dev server
npm run build        # production build

# Backend
npm run dev          # dev server
npm run db:migrate   # run migrations
npm run db:studio    # Drizzle Studio

# Project ระดับบนสุด
npm run dev          # start both (ใน root package.json)
```

---

## ไฟล์ที่จะสร้างต่อไป

### Server Structure
```
server/
├── src/
│   ├── index.ts              ← Hono app
│   ├── routes/               ← API routes
│   ├── middleware/           ← auth, cors
│   ├── db/
│   │   ├── schema.ts         ← Drizzle schema
│   │   └── connection.ts     ← MySQL connection
│   └── services/             ← business logic
├── drizzle.config.ts
├── package.json
└── .env
```

### Client Structure
```
client/src/
├── components/
│   ├── layout/               ← shell, sidebar, header
│   └── ui/                   ← shadcn/ui
├── modules/
│   └── settings/             ← first module
├── lib/
│   ├── api-client.ts         ← fetch wrapper
│   └── offline-db.ts         ← Dexie.js
└── stores/
    └── app-store.ts          ← global state
```

---

## ปัญหาที่อาจเจอ

1. **TypeScript errors** → แก้ด้วย `npm install`
2. **MySQL connection** → ตรวจสอบ .env และว่า MySQL รัน
3. **Port conflict** → เปลี่ยน port ใน vite.config.ts
4. **Module not found** → ตรวจสอด path aliases ใน tsconfig

---

## ตอนเปิดหน้าต่างใหม่:

1. เปิด terminal → cd ไป client/ → `npm install`
2. รอจนเสร็จ → ลอง `npm run dev`
3. เปิด http://localhost:5173 → ควรเห็น Tire Shop POS
4. กลับมาสั่งงานต่อได้เลย

---

**เมื่อทำเสร็จ:** อัปเดต `docs/status.md` → Phase: Development Started

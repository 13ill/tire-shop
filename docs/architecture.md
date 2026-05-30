# Architecture: POS+Stock ร้านยาง
# Created: 2026-05-29
# Updated: 2026-05-29
# Status: Gate 3 ✅ → Gate 4 Architecture

---

## Tech Stack

| Layer | Technology | เหตุผล |
|---|---|---|
| Frontend | React 18 + TypeScript + Vite | คุ้นเคย, lightweight |
| UI | TailwindCSS + shadcn/ui | modern, customizable |
| Tables | TanStack Table | sort/filter/pagination สำหรับ POS |
| Forms | React Hook Form + Zod | validation ง่าย type-safe |
| Charts | Recharts | dashboard/reports |
| State | TanStack Query + Zustand | server state + global state |
| Router | React Router v6 | navigation |
| Offline | Dexie.js (IndexedDB) | offline storage + sync queue |
| PWA | vite-plugin-pwa | installable + service worker |
| Backend | Hono (Node.js) | lightweight API, TypeScript first-class |
| Database | MySQL / MariaDB | shared hosting ready, concurrent OK |
| ORM | Drizzle ORM (MySQL mode) | type-safe, lightweight, migration built-in |
| Auth | JWT + refresh token | stateless, offline-friendly |
| Hosting | Shared hosting (cPanel + Node.js) | Phase 1: ถูก+ไม่ต้องดูแล |

---

## Architecture Overview

```
┌─ Client (Browser PWA) ──────────────────────────────────────┐
│                                                              │
│  React + Vite + TypeScript                                   │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  Pages: POS | Stock | Products | Jobs | Customers | ... │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │  Service Layer (business logic + validation)            │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │  API Client (TanStack Query) ←→ Offline Queue (Dexie)  │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │  IndexedDB (Dexie.js)          │  Service Worker (PWA)  │ │
│  │  - offline data cache          │  - offline page cache  │ │
│  │  - sync queue (pending ops)    │  - background sync     │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
│  Status Bar: 🟢 Online (synced) / 🔴 Offline (5 pending)   │
└──────────────────────────┬───────────────────────────────────┘
                           │ REST API (HTTPS)
                           │ (polling ทุก 5-10 วินาที)
┌──────────────────────────┴───────────────────────────────────┐
│  Server (Shared Hosting / VPS)                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  Hono (Node.js API)                                     │ │
│  │  - REST endpoints                                       │ │
│  │  - Auth (JWT)                                           │ │
│  │  - File upload (photos)                                 │ │
│  │  - Sync resolver (conflict handling)                    │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │  Drizzle ORM                                            │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │  MySQL / MariaDB          │  File Storage (photos)      │ │
│  └─────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

---

## Folder Structure

```
tire-shop-pos/
├── docs/                          ← project documentation
│   ├── architecture.md
│   ├── project-brief.md
│   ├── decisions/
│   ├── modules/
│   └── lessons/
│
├── client/                        ← React Frontend (PWA)
│   ├── src/
│   │   ├── main.tsx               ← app entry
│   │   ├── App.tsx                ← router setup
│   │   ├── components/            ← shared UI components
│   │   │   ├── ui/                ← shadcn/ui components
│   │   │   ├── layout/            ← shell, sidebar, header, status-bar
│   │   │   └── common/            ← shared business components
│   │   ├── modules/               ← feature modules
│   │   │   ├── products/
│   │   │   │   ├── pages/         ← ProductList, ProductForm
│   │   │   │   ├── components/    ← ProductCard, VariantSelector
│   │   │   │   ├── hooks/         ← useProducts, useProductForm
│   │   │   │   ├── api.ts         ← API calls
│   │   │   │   └── types.ts       ← interfaces
│   │   │   ├── stock/
│   │   │   ├── pos/
│   │   │   ├── jobs/
│   │   │   ├── customers/
│   │   │   ├── vehicles/
│   │   │   ├── photos/
│   │   │   ├── suppliers/
│   │   │   ├── warranty/
│   │   │   ├── expenses/
│   │   │   ├── attendance/
│   │   │   ├── loyalty/
│   │   │   ├── reports/
│   │   │   ├── auth/
│   │   │   └── settings/
│   │   ├── lib/                   ← utilities
│   │   │   ├── api-client.ts      ← Hono RPC client / fetch wrapper
│   │   │   ├── offline-db.ts      ← Dexie.js schema + sync queue
│   │   │   ├── sync-engine.ts     ← background sync logic
│   │   │   └── utils.ts           ← shared utilities
│   │   └── stores/                ← global state (Zustand)
│   │       ├── auth-store.ts
│   │       └── app-store.ts       ← connection status, sync state
│   ├── public/
│   │   └── manifest.json          ← PWA manifest
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── server/                        ← Hono Backend API
│   ├── src/
│   │   ├── index.ts               ← Hono app entry
│   │   ├── routes/                ← API routes
│   │   │   ├── auth.ts
│   │   │   ├── products.ts
│   │   │   ├── stock.ts
│   │   │   ├── pos.ts
│   │   │   ├── jobs.ts
│   │   │   ├── customers.ts
│   │   │   ├── photos.ts
│   │   │   ├── sync.ts            ← sync endpoint (receive offline queue)
│   │   │   └── ...
│   │   ├── middleware/            ← auth, error handling
│   │   ├── services/              ← business logic
│   │   └── db/                    ← database layer
│   │       ├── schema.ts          ← Drizzle schema (MySQL)
│   │       ├── connection.ts      ← DB connection
│   │       └── migrations/        ← Drizzle migrations
│   ├── drizzle.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── shared/                        ← shared types between client & server
│   ├── types/
│   │   ├── product.ts
│   │   ├── stock.ts
│   │   ├── job.ts
│   │   └── ...
│   └── constants.ts
│
└── .windsurfrules
```

---

## Database Schema (MySQL/MariaDB)

### Core Tables

```sql
-- Products & Services
CREATE TABLE categories (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type ENUM('product', 'service') NOT NULL,
  parent_id VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES categories(id)
);

-- ดู schema เต็มที่ docs/db-schema.sql
```

(schema ย้ายไปไฟล์แยก เพราะยาวมาก — ดูที่ `docs/db-schema.sql`)

---

## Key Data Flows

### Flow 1: ขายสินค้า (POS)
```
Staff เลือกสินค้า → เลือก variant → ใส่จำนวน → เลือก pricing tier
→ ปรับราคา (ถ้าต่อรอง) → เพิ่ม item ในบิล → Hold ได้
→ คิดเงิน → split payment ได้ → ออกบิล/ใบเสร็จ/ใบกำกับภาษี
→ ตัด stock อัตโนมัติ → ปิดกะ: สรุปยอด
```

### Flow 2: เปิด Job ซ่อม (BOM movement-based)
```
ลูกค้ามา → ค้นหา/สร้าง customer+vehicle → เปิด job (+ ประมาณการ)
→ บันทึกอาการ → ถ่ายรูป (before) → เข้าคิว
→ ใครก็ได้ เบิกอะไหล่ (pick → ตัด stock ทันที)
→ ระหว่างทำ: เบิกเพิ่ม/คืนได้ + ใส่เหตุผล → ถ่ายรูป (during)
→ ซ่อมเสร็จ (testing) → ทดสอบ → ถ่ายรูป (after)
→ ส่งมอบ (delivered) → พนักงานเคาท์เตอร์คำนวณราคา (BOM → billing)
→ คิดเงิน (POS) → ออกบิล → done
→ เทียบ ประมาณการ vs ค่าจริง
```

### Flow 3: ค้นหาประวัติ
```
ค้นหาทะเบียน "1กก 1234"
→ เจอ vehicle → เห็นประวัติ jobs ทั้งหมด
→ เลือก job → เห็น BOM (เบิก/คืน+เหตุผล) + รูป + warranty

ค้นหาเบอร์ "0891234567"
→ เจอ customer → เห็นรถทุกคัน + jobs + ประวัติซื้อ
→ เลือก job → เห็น BOM + รูป + warranty
```

### Flow 4: Offline Sync
```
Device (IndexedDB)              Server (MySQL)
     │                               │
     │  action → save to IndexedDB   │
     │  + add to sync queue          │
     │                               │
     │  online? ──→ POST /api/sync   │
     │         ←── response (ok/conflict)
     │                               │
     │  poll /api/changes?since=X    │
     │         ←── new data from other devices
     │                               │
Status bar: 🟢 synced / 🟡 3 pending / 🔴 offline
```

### Flow 5: Stock Loss / Count
```
Owner เลือก "ตรวจนับ stock"
→ เลือก category/สินค้า → ใส่จำนวนนับจริง
→ ระบบเทียบกับ balance → แสดงส่วนต่าง
→ Owner approve → สร้าง movement type='correction'/'loss'
→ ใส่เหตุผล → log ไว้ตรวจสอบ
```

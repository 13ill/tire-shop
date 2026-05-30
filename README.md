# POS+Stock ร้านยาง/อะไหล่/ซ่อมบำรุง

ระบบจัดการร้านยางครบวงจร — ขายยาง, อะไหล่, บริการซ่อม, คลังสินค้า, ลูกค้า, รายงาน

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MySQL/MariaDB
- Git

### Setup (5 นาที)
```bash
# 1. Set environment variable
# Windows: set AI_OS_PATH=f:\Programming\setup
# macOS: export AI_OS_PATH="/Users/[name]/Programming/setup"

# 2. Clone
git clone [PROJECT_REPO_URL]
cd tire-shop-pos

# 3. Install
npm run install:all

# 4. Database
# สร้าง database: tire_shop_pos
# แก้ server/.env ตามตัวอย่าง

# 5. Migrate
npm run db:migrate

# 6. Start
npm run dev
```

ดูรายละเอียดเต็ม: [Setup Guide](docs/setup-guide.md)

---

## 📋 Features

### ✅ Phase 1 (45 วัน)
- **Products & Services** — variants, pricing tiers, custom pricing
- **Stock Management** — movements, low alerts, count/audit, loss tracking
- **Procurement** — suppliers, PO, GRN, cost prices
- **POS** — sales, shifts, hold bills, split payments, thermal printer
- **Service Jobs** — BOM movement-based, multi-job/visit, photos
- **Customers & Vehicles** — search by plate/name/phone, history
- **Photos** — before/during/after, local→sync
- **Warranty** — configurable, job-linked
- **Expenses** — categories, receipt photos
- **Loyalty** — points system
- **Attendance** — clock in/out
- **Reports** — sales, stock, profit, dashboard
- **Multi-device** — 3-5 browsers sync
- **Offline** — IndexedDB + sync queue

### 💡 Phase 2
- Quotations, Invoices, Credit/AR
- Storage locations UI
- LINE/SMS notifications
- Commission tracking

---

## 🏗️ Architecture

```
┌─ Client (PWA) ──────────────┐
│  React + Vite + TypeScript │
│  IndexedDB (offline)       │
│  Dexie.js + Sync Queue     │
└───────┬─────────────────────┘
        │ REST API
┌───────┴─────────────────────┐
│  Server (Hono + Node.js)   │
│  MySQL + Drizzle ORM       │
└─────────────────────────────┘
```

**Tech Stack:**
- Frontend: React 18 + Vite + TypeScript
- UI: TailwindCSS + shadcn/ui + TanStack Table
- Backend: Hono (Node.js)
- DB: MySQL/MariaDB + Drizzle ORM
- Offline: Dexie.js (IndexedDB)
- PWA: vite-plugin-pwa
- Hosting: Shared hosting (cPanel) → VPS+Docker

---

## 📁 Project Structure

```
tire-shop-pos/
├── .windsurfrules              ← AI rules + gate system
├── docs/                      ← All documentation
│   ├── architecture.md        ← System design
│   ├── scope.md                ← Feature scope
│   ├── workflows.md            ← Use case flows
│   ├── status.md               ← Progress tracking
│   ├── db-schema.sql           ← Database schema
│   └── setup-guide.md          ← Setup instructions
├── client/                    ← React frontend
├── server/                    ← Hono backend
├── shared/                    ← Shared types
└── [code folders]
```

---

## 🤖 AI-OS System

Project นี้ใช้ **AI-Native Operational System** — ระบบที่บังคับให้ AI:
- ผ่าน gate 4 ขั้นก่อน code
- ถามก่อนทำ (Active Reminder)
- เสนอ tradeoff + รอ confirm
- บันทึกทุก decision
- Proactive requirement discovery

ดูรายละเอียด: [AI-OS Reference](docs/ai-os-reference.md)

---

## 📊 Current Status

- **Phase:** Pre-Development (Gate 4 ✅)
- **Progress:** Architecture complete, ready for setup
- **Next:** Initialize project structure + start coding

ดู status ล่าสุด: [Status](docs/status.md)

---

## 🛠️ Development

### Commands
```bash
npm run dev          # Start both frontend + backend
npm run dev:client   # Frontend only (http://localhost:5173)
npm run dev:server   # Backend only (http://localhost:3000)

npm run db:migrate   # Run migrations
npm run db:seed      # Seed data
npm run db:studio    # Drizzle Studio

npm run build        # Build for production
npm run test         # Run tests
```

### Module Development
ทุก module ให้อ่าน `docs/modules/[module].md` ก่อน code

---

## 📚 Documentation

| Doc | Description |
|-----|-------------|
| [Architecture](docs/architecture.md) | System design + tech stack |
| [Scope](docs/scope.md) | Feature scope + priority |
| [Workflows](docs/workflows.md) | All use case flows |
| [DB Schema](docs/db-schema.sql) | Database schema |
| [Setup Guide](docs/setup-guide.md) | Installation instructions |
| [Decisions](docs/decisions/) | All decisions made |
| [AI-OS Reference](docs/ai-os-reference.md) | AI system guide |

---

## 🤝 Contributing

ใช้ AI-OS workflow:
1. อ่าน docs/ ให้ครบ
2. ผ่าน gate system
3. สร้าง module doc ก่อน code
4. เขียน test
5. บันทึก decision/lesson

---

## 📄 License

Private project — ไม่ให้ใช้งานภายนอก

---

## 📞 Support

ดู [Setup Guide](docs/setup-guide.md) → Troubleshooting

หรือตรวจสอบ:
1. Environment variable: `echo $AI_OS_PATH` (macOS) / `echo $env:AI_OS_PATH` (Windows)
2. Node.js: `node --version` (ต้อง >= 18)
3. MySQL: ตรวจสอบ connection
4. Logs: ดู terminal output
